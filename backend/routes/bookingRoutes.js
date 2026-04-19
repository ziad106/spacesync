const express = require('express');
const router = express.Router();
const { Booking, Resource } = require('../models');
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [{ model: Resource }],
      order: [['booking_date', 'ASC']],
    });
    res.json(bookings);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { resource_id, requested_by, booking_date } = req.body;
    if (!resource_id || !requested_by || !booking_date)
      return res.status(400).json({ error: 'All fields required' });
    const existing = await Booking.findOne({ where: { resource_id, booking_date } });
    if (existing) return res.status(400).json({ error: 'Already booked for that date.' });
    const b = await Booking.create({ resource_id, requested_by, booking_date });
    res.status(201).json(await Booking.findByPk(b.id, { include: Resource }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const b = await Booking.findByPk(req.params.id);
    if (!b) return res.status(404).json({ error: 'Not found' });
    await b.destroy();
    res.json({ message: 'Cancelled' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
