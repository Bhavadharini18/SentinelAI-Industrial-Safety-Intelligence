const express = require('express');
const {
  getMachines,
  getMachine,
  createMachine,
  updateMachine,
  deleteMachine
} = require('../controllers/machineController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getMachines)
  .post(authorize('Admin', 'Supervisor'), createMachine);

router
  .route('/:id')
  .get(getMachine)
  .put(authorize('Admin', 'Supervisor', 'Safety Officer'), updateMachine)
  .delete(authorize('Admin'), deleteMachine);

module.exports = router;
