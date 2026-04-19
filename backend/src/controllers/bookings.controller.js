const { Op } = require('sequelize');
const { Booking, Resource, EarlyRelease, User, sequelize } = require('../models');

const EARLY_RELEASE_POINTS = 10;

function isValidDate(str) {
  if (typeof str !== 'string') return false;
  // Strict YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
}

// HH:MM 24h -> total minutes (or null if invalid)
function toMinutes(str) {
  if (typeof str !== 'string') return null;
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(str.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function normalizeTime(str) {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(str.trim());
  if (!m) return null;
  return `${String(m[1]).padStart(2, '0')}:${m[2]}:00`;
}

function parseId(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

function fmtHM(t) {
  // DB returns HH:MM:SS; trim seconds for messages
  return typeof t === 'string' ? t.slice(0, 5) : t;
}

exports.list = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Resource, as: 'resource' },
        { model: User, as: 'owner', attributes: ['id', 'name', 'role'] },
        {
          model: EarlyRelease,
          as: 'early_release',
          include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'role'] }],
        },
      ],
      order: [['booking_date', 'ASC'], ['start_time', 'ASC'], ['id', 'ASC']],
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    // Authentication is guaranteed by the route-level requireAuth middleware,
    // but we double-check here so the controller is safe in isolation.
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    // Authorization: Students cannot book. Only Teacher/ClassRep/Staff/Admin.
    if (!User.BOOKING_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        error: `Your role (${req.user.role}) is not allowed to book resources. Only Teachers, Class Representatives, Staff and Admins can book.`,
      });
    }

    const resource_id = parseId(req.body.resource_id);
    // Always use the logged-in user's own name — no impersonation.
    const requested_by = req.user.name;
    const booking_date =
      typeof req.body.booking_date === 'string' ? req.body.booking_date.trim() : '';
    const startRaw =
      typeof req.body.start_time === 'string' ? req.body.start_time.trim() : '';
    const endRaw =
      typeof req.body.end_time === 'string' ? req.body.end_time.trim() : '';
    const purposeRaw =
      typeof req.body.purpose === 'string' ? req.body.purpose.trim() : 'Class';

    if (!resource_id) {
      return res.status(400).json({ error: 'resource_id must be a positive integer' });
    }
    if (!requested_by) {
      return res.status(400).json({ error: 'requested_by is required' });
    }
    if (!isValidDate(booking_date)) {
      return res.status(400).json({ error: 'booking_date must be a valid date (YYYY-MM-DD)' });
    }

    const startMin = toMinutes(startRaw);
    const endMin = toMinutes(endRaw);
    if (startMin === null) return res.status(400).json({ error: 'start_time must be HH:MM (24h)' });
    if (endMin === null) return res.status(400).json({ error: 'end_time must be HH:MM (24h)' });
    if (endMin <= startMin) {
      return res.status(400).json({ error: 'end_time must be after start_time' });
    }

    const ALLOWED_PURPOSES = ['Class', 'Lab', 'Seminar', 'Meeting', 'Exam', 'Other'];
    if (!ALLOWED_PURPOSES.includes(purposeRaw)) {
      return res.status(400).json({
        error: `purpose must be one of: ${ALLOWED_PURPOSES.join(', ')}`,
      });
    }

    const start_time = normalizeTime(startRaw);
    const end_time = normalizeTime(endRaw);

    // Ensure resource exists
    const resource = await Resource.findByPk(resource_id);
    if (!resource) {
      return res.status(404).json({ error: `Resource ${resource_id} not found` });
    }

    // Time-overlap guard: two ranges [a,b) and [c,d) overlap iff a < d AND c < b
    const clash = await Booking.findOne({
      where: {
        resource_id,
        booking_date,
        start_time: { [Op.lt]: end_time },
        end_time: { [Op.gt]: start_time },
      },
    });
    if (clash) {
      return res.status(400).json({
        error: `"${resource.name}" is already booked on ${booking_date} from ${fmtHM(clash.start_time)}–${fmtHM(clash.end_time)}. Please pick a different time or resource.`,
      });
    }

    const booking = await Booking.create({
      resource_id,
      user_id: req.user.id,
      requested_by,
      booking_date,
      start_time,
      end_time,
      purpose: purposeRaw,
      status: 'Confirmed',
    });

    // Return with nested resource + owner for convenience
    const withResource = await Booking.findByPk(booking.id, {
      include: [
        { model: Resource, as: 'resource' },
        { model: User, as: 'owner', attributes: ['id', 'name', 'role'] },
      ],
    });
    res.status(201).json(withResource);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'id must be a positive integer' });

    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ error: `Booking ${id} not found` });

    // Authorization:
    //   • Students can NEVER cancel a booking — not even their own (they can't
    //     create one anyway, but we reject explicitly for defence-in-depth).
    //   • Admins can cancel ANY booking.
    //   • Teacher / ClassRep / Staff can only cancel bookings they own.
    if (req.user.role === 'Student') {
      return res.status(403).json({
        error: 'Students are not allowed to cancel bookings. Ask a Teacher, Class Representative or the office staff.',
      });
    }
    const isAdmin = req.user.role === 'Admin';
    const isOwner = booking.user_id != null && booking.user_id === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        error: 'You can only cancel bookings you created. Ask an admin to cancel others.',
      });
    }

    await booking.destroy();
    res.json({ deleted: true, id });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/bookings/:id/release
 * Logged-in user reports that this room was freed early (teacher ended class,
 * meeting adjourned, lab finished). Awards reward points to the reporter.
 * Body: { note?: string }
 */
exports.releaseEarly = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'id must be a positive integer' });

    const booking = await Booking.findByPk(id, {
      include: [
        { model: Resource, as: 'resource' },
        { model: EarlyRelease, as: 'early_release' },
      ],
    });
    if (!booking) return res.status(404).json({ error: `Booking ${id} not found` });
    if (booking.early_release) {
      return res.status(409).json({ error: 'This booking has already been reported as released' });
    }

    // Validate timing: must be an ongoing booking on today's date
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (booking.booking_date !== todayStr) {
      return res.status(400).json({ error: 'Can only release bookings scheduled for today' });
    }
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const startMin = toMinutes(fmtHM(booking.start_time));
    const endMin = toMinutes(fmtHM(booking.end_time));
    if (nowMin < startMin) {
      return res.status(400).json({ error: 'This booking has not started yet' });
    }
    if (nowMin >= endMin) {
      return res.status(400).json({ error: 'This booking has already ended — no reward to give' });
    }

    const nowHHMMSS = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
    const note = typeof req.body.note === 'string' ? req.body.note.trim().slice(0, 200) : null;

    const result = await sequelize.transaction(async (t) => {
      const er = await EarlyRelease.create(
        {
          booking_id: booking.id,
          reporter_id: req.user.id,
          released_at: nowHHMMSS,
          note: note || null,
          points_awarded: EARLY_RELEASE_POINTS,
        },
        { transaction: t }
      );
      await req.user.increment('reward_points', { by: EARLY_RELEASE_POINTS, transaction: t });
      return er;
    });

    await req.user.reload();
    const freshBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: Resource, as: 'resource' },
        {
          model: EarlyRelease,
          as: 'early_release',
          include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'role'] }],
        },
      ],
    });

    res.status(201).json({
      booking: freshBooking,
      release: result,
      reward: {
        points_awarded: EARLY_RELEASE_POINTS,
        total_points: req.user.reward_points,
      },
    });
  } catch (err) {
    next(err);
  }
};
