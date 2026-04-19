const express = require('express');
const ctrl = require('../controllers/admin.controller');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require an Admin-level JWT.
router.use(requireAdmin);

router.get('/users', ctrl.listUsers);
router.post('/users/:id/approve', ctrl.approveUser);
router.post('/users/:id/reject', ctrl.rejectUser);

module.exports = router;
