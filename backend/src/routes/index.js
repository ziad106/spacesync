const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'spacesync-backend', time: new Date().toISOString() });
});

router.use('/resources', require('./resources.routes'));
router.use('/bookings', require('./bookings.routes'));

module.exports = router;
