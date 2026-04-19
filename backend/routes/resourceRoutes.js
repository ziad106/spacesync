const express = require('express');
const router = express.Router();
const { Resource } = require('../models');
router.get('/', async (req, res) => {
  try { res.json(await Resource.findAll()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { name, type, capacity } = req.body;
    if (!name || !type || !capacity) return res.status(400).json({ error: 'All fields required' });
    res.status(201).json(await Resource.create({ name, type, capacity }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
