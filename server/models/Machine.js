const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add machine name']
  },
  code: {
    type: String,
    required: [true, 'Please add machine code'],
    unique: true
  },
  type: {
    type: String,
    required: [true, 'Please add machine type']
  },
  status: {
    type: String,
    enum: ['Operational', 'Maintenance', 'Offline', 'Failing'],
    default: 'Operational'
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  currentZone: {
    type: String,
    default: 'Zone A'
  },
  location: {
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 }
  },
  lastMaintenance: Date,
  nextMaintenance: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Machine', MachineSchema);
