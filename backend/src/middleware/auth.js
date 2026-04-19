const jwt = require('jsonwebtoken');
const { User } = require('../models');

const SECRET = process.env.JWT_SECRET || 'spacesync-dev-secret-change-me';

function extractToken(req) {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

/** Require a valid JWT. Attaches req.user. */
async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    const payload = jwt.verify(token, SECRET);
    const user = await User.findByPk(payload.sub);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Attaches req.user if a valid token is present, but never rejects. */
async function optionalAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const payload = jwt.verify(token, SECRET);
    const user = await User.findByPk(payload.sub);
    if (user) req.user = user;
  } catch {
    /* ignore */
  }
  return next();
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, name: user.name },
    SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/** Require a valid JWT AND that the user has the Admin role. Must be used
 *  after requireAuth (or composed inline as below). */
async function requireAdmin(req, res, next) {
  return requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }
    return next();
  });
}

module.exports = { requireAuth, optionalAuth, requireAdmin, signToken };
