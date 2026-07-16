const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: [true, 'Please add machine']
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: [true, 'Please add assigned worker']
  },
  description: {
    type: String,
    required: [true, 'Please add description']
  },
  type: {
    type: String,
    enum: ['Routine', 'Emergency', 'Calibration', 'Overhaul'],
    default: 'Routine'
  },
  permitRequired: {
    type: Boolean,
    default: false
  },
  permitActive: {
    type: Boolean,
    default: false
  },
  permitNumber: String,
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  startDate: Date,
  endDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
