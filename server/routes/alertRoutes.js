const express = require('express');
const {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
  createAlert
} = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAlerts)
  .post(authorize('Admin', 'Safety Officer', 'Supervisor'), createAlert);

router.put('/:id/acknowledge', authorize('Admin', 'Safety Officer', 'Supervisor'), acknowledgeAlert);
router.put('/:id/resolve', authorize('Admin', 'Safety Officer', 'Supervisor'), resolveAlert);

module.exports = router;
