const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add alert title']
  },
  description: String,
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  zone: {
    type: String,
    default: 'Zone A'
  },
  sensor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor'
  },
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine'
  },
  status: {
    type: String,
    enum: ['Active', 'Acknowledged', 'Resolved'],
    default: 'Active'
  },
  riskScore: {
    type: Number,
    default: 0
  },
  recommendations: String,
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
});

module.exports = mongoose.model('Alert', AlertSchema);
