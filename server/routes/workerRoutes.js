const express = require('express');
const {
  getWorkers,
  getWorker,
  createWorker,
  updateWorker,
  deleteWorker
} = require('../controllers/workerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes protected

router
  .route('/')
  .get(getWorkers)
  .post(authorize('Admin', 'Supervisor', 'Safety Officer'), createWorker);

router
  .route('/:id')
  .get(getWorker)
  .put(authorize('Admin', 'Supervisor', 'Safety Officer'), updateWorker)
  .delete(authorize('Admin'), deleteWorker);

module.exports = router;
