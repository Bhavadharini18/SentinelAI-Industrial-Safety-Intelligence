const express = require('express');
const {
  getReports,
  createReport,
  exportReportJSON
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getReports)
  .post(authorize('Admin', 'Safety Officer', 'Supervisor'), createReport);

router.get('/:id/export', exportReportJSON);

module.exports = router;
