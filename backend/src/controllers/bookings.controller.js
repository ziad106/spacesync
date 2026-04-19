const { Booking, Resource } = require('../models');

function isValidDate(str) {
  if (typeof str !== 'string') return false;
  // Strict YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
}

function parseId(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

exports.list = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      include: [{ model: Resource, as: 'resource' }],
      order: [['booking_date', 'ASC'], ['id', 'ASC']],
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

    if (!resource_id) {
      return res.status(400).json({ error: 'resource_id must be a positive integer' });
    }
    if (!requested_by) {
      return res.status(400).json({ error: 'requested_by is required' });
    }
    if (!isValidDate(booking_date)) {
      return res.status(400).json({ error: 'booking_date must be a valid date (YYYY-MM-DD)' });
    }

    // Ensure resource exists
    const resource = await Resource.findByPk(resource_id);
    if (!resource) {
      return res.status(404).json({ error: `Resource ${resource_id} not found` });
    }

    // Double-booking guard
    const clash = await Booking.findOne({ where: { resource_id, booking_date } });
    if (clash) {
      return res.status(400).json({
        error: `"${resource.name}" is already booked on ${booking_date}. Please choose another date or resource.`,
      });
    }

    const booking = await Booking.create({
      resource_id,
      requested_by,
      booking_date,
      status: 'Confirmed',
    });

    // Return with nested resource for convenience
    const withResource = await Booking.findByPk(booking.id, {
      include: [{ model: Resource, as: 'resource' }],
    });
    res.status(201).json(withResource);
  } catch (err) {
    // Handle unique-index race condition gracefully
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'This resource is already booked on that date.' });
    }
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
