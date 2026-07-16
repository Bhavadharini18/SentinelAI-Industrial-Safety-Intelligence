const express = require('express');
const {
  getSensors,
  getSensor,
  createSensor,
  updateSensor,
  deleteSensor
} = require('../controllers/sensorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getSensors)
  .post(authorize('Admin', 'Safety Officer'), createSensor);

router
  .route('/:id')
  .get(getSensor)
  .put(authorize('Admin', 'Safety Officer', 'Supervisor'), updateSensor)
  .delete(authorize('Admin'), deleteSensor);

module.exports = router;
