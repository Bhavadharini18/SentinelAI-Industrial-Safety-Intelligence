const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add report title']
  },
  type: {
    type: String,
    enum: ['Daily Shift', 'Weekly Audit', 'Incident Summary', 'Custom'],
    required: [true, 'Please specify report type']
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateRange: {
    start: Date,
    end: Date
  },
  summary: String,
  data: mongoose.Schema.Types.Mixed, // Raw metrics stored at generation time
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);
