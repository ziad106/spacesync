const { Resource } = require('../models');

const VALID_TYPES = ['Room', 'Equipment'];

function parseCapacity(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

exports.list = async (req, res, next) => {
  try {
    const resources = await Resource.findAll({ order: [['id', 'ASC']] });
    res.json(resources);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const type = typeof req.body.type === 'string' ? req.body.type.trim() : '';
    const capacity = parseCapacity(req.body.capacity);
    const facilities =
      typeof req.body.facilities === 'string' ? req.body.facilities.trim() : '';

    if (!name) return res.status(400).json({ error: 'name is required' });
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });
    }
    if (capacity === null) {
      return res.status(400).json({ error: 'capacity must be a positive integer' });
    }

    const resource = await Resource.create({ name, type, capacity, facilities });
    res.status(201).json(resource);
  } catch (err) {
    next(err);
  }
};
