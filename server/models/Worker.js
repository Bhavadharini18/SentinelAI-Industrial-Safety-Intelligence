const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add worker name']
  },
  employeeId: {
    type: String,
    required: [true, 'Please add employee ID'],
    unique: true
  },
  department: {
    type: String,
    required: [true, 'Please add department']
  },
  role: {
    type: String,
    required: [true, 'Please add role']
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Suspended'],
    default: 'Active'
  },
  online: {
    type: Boolean,
    default: false
  },
  currentZone: {
    type: String,
    default: 'Zone A'
  },
  location: {
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 }
  },
  phone: String,
  lastSeen: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Worker', WorkerSchema);
