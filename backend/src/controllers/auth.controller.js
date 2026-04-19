const bcrypt = require('bcryptjs');
const { User, EarlyRelease } = require('../models');
const { signToken } = require('../middleware/auth');

const ROLES = ['Student', 'Teacher', 'Staff', 'ClassRep'];

function sanitize(user) {
  const u = user.toJSON();
  delete u.password_hash;
  return u;
}

exports.register = async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    const role = (req.body.role || 'Student').trim();
    const department = (req.body.department || 'CSE').trim();
    const identifier = (req.body.identifier || '').trim() || null;

    if (!name) return res.status(400).json({ error: 'name is required' });
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'password must be at least 6 characters' });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${ROLES.join(', ')}` });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password_hash,
      role,
      department,
      identifier,
    });

    const token = signToken(user);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    // req.user comes from requireAuth
    const reports = await EarlyRelease.count({ where: { reporter_id: req.user.id } });
    const rank = await User.count({
      where: { reward_points: { [require('sequelize').Op.gt]: req.user.reward_points } },
    });
    res.json({
      user: sanitize(req.user),
      stats: {
        reports,
        rank: rank + 1, // 1-based
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.leaderboard = async (_req, res, next) => {
  try {
    const top = await User.findAll({
      order: [['reward_points', 'DESC'], ['id', 'ASC']],
      limit: 10,
      attributes: ['id', 'name', 'role', 'department', 'reward_points'],
    });
    res.json(top);
  } catch (err) {
    next(err);
  }
};
