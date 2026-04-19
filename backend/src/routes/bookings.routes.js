const express = require('express');
const ctrl = require('../controllers/bookings.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', ctrl.list);
router.post('/', requireAuth, ctrl.create);
router.post('/:id/release', requireAuth, ctrl.releaseEarly);
router.delete('/:id', requireAuth, ctrl.remove);

module.exports = router;
