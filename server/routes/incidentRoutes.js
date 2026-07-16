const express = require('express');
const { getIncidents, createIncident } = require('../controllers/incidentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getIncidents)
  .post(authorize('Admin', 'Safety Officer', 'Supervisor'), createIncident);

module.exports = router;
