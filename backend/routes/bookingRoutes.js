const express = require('express');
const router = express.Router();
const { Booking, Resource, User } = require('../models');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    res.json(await Booking.findAll({
      include: [{ model: Resource }, { model: User, attributes: ['id', 'name', 'role', 'department'] }],
      order: [['booking_date', 'ASC']],
    }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { resource_id, booking_date } = req.body;
    if (!resource_id || !booking_date) return res.status(400).json({ error: 'All fields required' });
    const resource = await Resource.findByPk(resource_id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    const allowedRoles = (resource.allowed_roles || 'admin,teacher,student').split(',').map(s => s.trim());
    if (req.user.role !== 'admin' && !allowedRoles.includes(req.user.role))
      return res.status(403).json({ error: 'Your role cannot book this resource' });
    if (await Booking.findOne({ where: { resource_id, booking_date } }))
      return res.status(400).json({ error: 'Already booked for that date.' });
    const b = await Booking.create({ resource_id, booking_date, requested_by: req.user.name, user_id: req.user.id });
    res.status(201).json(await Booking.findByPk(b.id, {
      include: [{ model: Resource }, { model: User, attributes: ['id', 'name', 'role'] }],
    }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const b = await Booking.findByPk(req.params.id);
    if (!b) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && b.user_id !== req.user.id)
      return res.status(403).json({ error: "Cannot cancel others' allocations" });
    await b.destroy();
    res.json({ message: 'Cancelled' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
