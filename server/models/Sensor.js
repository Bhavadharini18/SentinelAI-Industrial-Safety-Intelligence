const mongoose = require('mongoose');

const ReadingSchema = new mongoose.Schema({
  value: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const SensorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add sensor name']
  },
  code: {
    type: String,
    required: [true, 'Please add sensor code'],
    unique: true
  },
  type: {
    type: String,
    enum: ['Gas', 'Temperature', 'Pressure', 'Humidity', 'Smoke'],
    required: [true, 'Please specify sensor type']
  },
  currentZone: {
    type: String,
    default: 'Zone A'
  },
  currentValue: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Please add unit (e.g. ppm, °C, PSI, %)']
  },
  status: {
    type: String,
    enum: ['Active', 'Faulty', 'Offline'],
    default: 'Active'
  },
  location: {
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 }
  },
  // Store a short history of recent readings for quick chart loads
  history: [ReadingSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Post-save hook to cap history at 50 readings
SensorSchema.pre('save', function (next) {
  if (this.history.length > 50) {
    this.history = this.history.slice(-50);
  }
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Sensor', SensorSchema);
