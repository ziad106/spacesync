const { User } = require('../models');

/** Parse a positive integer id from req.params. */
function parseId(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * GET /api/admin/users
 * Optional ?status=Pending|Approved|Rejected filter.
 * Returns the full user list (without password hashes) for the admin console.
 */
exports.listUsers = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.status && User.STATUSES.includes(req.query.status)) {
      where.status = req.query.status;
    }
    const users = await User.findAll({
      where,
      order: [
        // Pending first so they're top of the admin inbox
        ['status', 'ASC'],
        ['created_at', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

/** Shared helper — set the status of a user by id (with guard rails). */
async function changeStatus(req, res, next, nextStatus) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'id must be a positive integer' });

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: `User ${id} not found` });

    // Never allow changing the status of another Admin account via this route.
    // (Admins are seed-only; this avoids an admin accidentally locking another
    // admin out of the system.)
    if (user.role === 'Admin') {
      return res.status(400).json({ error: 'Cannot change the status of an Admin account' });
    }

    if (user.status === nextStatus) {
      return res.json({ user, unchanged: true });
    }

    user.status = nextStatus;
    await user.save();
    res.json({ user, unchanged: false });
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/users/:id/approve */
exports.approveUser = (req, res, next) => changeStatus(req, res, next, 'Approved');

/** POST /api/admin/users/:id/reject */
exports.rejectUser = (req, res, next) => changeStatus(req, res, next, 'Rejected');
