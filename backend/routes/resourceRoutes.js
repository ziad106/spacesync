const express = require('express');
const router = express.Router();
const { Resource } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const all = await Resource.findAll();
    if (req.user.role === 'admin') return res.json(all);
    const filtered = all.filter(r => {
      const roles = (r.allowed_roles || 'admin,teacher,student').split(',').map(s => s.trim());
      return roles.includes(req.user.role);
    });
    res.json(filtered);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, type, capacity, allowed_roles } = req.body;
    if (!name || !type || !capacity) return res.status(400).json({ error: 'All fields required' });
    res.status(201).json(await Resource.create({ name, type, capacity, allowed_roles: allowed_roles || 'admin,teacher,student' }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const r = await Resource.findByPk(req.params.id);
    if (!r) return res.status(404).json({ error: 'Not found' });
    await r.update(req.body);
    res.json(r);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const r = await Resource.findByPk(req.params.id);
    if (!r) return res.status(404).json({ error: 'Not found' });
    await r.destroy();
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
