const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add incident title']
  },
  description: {
    type: String,
    required: [true, 'Please add description']
  },
  date: {
    type: Date,
    default: Date.now
  },
  severity: {
    type: String,
    enum: ['Minor', 'Major', 'Severe', 'Catastrophic'],
    required: [true, 'Please add severity level']
  },
  zone: {
    type: String,
    required: [true, 'Please specify zone']
  },
  rootCause: String,
  actionsTaken: String,
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Under Investigation', 'Closed'],
    default: 'Under Investigation'
  }
});

module.exports = mongoose.model('Incident', IncidentSchema);
