const { Op } = require('sequelize');
const { Booking, Resource } = require('../models');

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
      include: [{ model: Resource, as: 'resource' }],
      order: [['booking_date', 'ASC'], ['start_time', 'ASC'], ['id', 'ASC']],
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const resource_id = parseId(req.body.resource_id);
    const requested_by =
      typeof req.body.requested_by === 'string' ? req.body.requested_by.trim() : '';
    const booking_date =
      typeof req.body.booking_date === 'string' ? req.body.booking_date.trim() : '';
    const startRaw =
      typeof req.body.start_time === 'string' ? req.body.start_time.trim() : '';
    const endRaw =
      typeof req.body.end_time === 'string' ? req.body.end_time.trim() : '';

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
      requested_by,
      booking_date,
      start_time,
      end_time,
      status: 'Confirmed',
    });

    // Return with nested resource for convenience
    const withResource = await Booking.findByPk(booking.id, {
      include: [{ model: Resource, as: 'resource' }],
    });
    res.status(201).json(withResource);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'id must be a positive integer' });

    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ error: `Booking ${id} not found` });

    await booking.destroy();
    res.json({ deleted: true, id });
  } catch (err) {
    next(err);
  }
};
