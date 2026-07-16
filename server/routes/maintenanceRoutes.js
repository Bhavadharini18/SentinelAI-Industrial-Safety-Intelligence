const express = require('express');
const {
  getMaintenance,
  createMaintenance,
  updateMaintenance
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getMaintenance)
  .post(authorize('Admin', 'Supervisor', 'Safety Officer'), createMaintenance);

router.put('/:id', authorize('Admin', 'Supervisor', 'Safety Officer'), updateMaintenance);

module.exports = router;
