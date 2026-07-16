const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const workerRoutes = require('./routes/workerRoutes');
const machineRoutes = require('./routes/machineRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const alertRoutes = require('./routes/alertRoutes');
const reportRoutes = require('./routes/reportRoutes');
const riskRoutes = require('./routes/riskRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');

// Import simulator controls
const { triggerEmergency, clearEmergency, getEmergencyZone } = require('./sockets/simulator');
const { protect, authorize } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API route bindings
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Simulation Demo API Endpoints
app.post('/api/simulate/emergency', protect, authorize('Admin', 'Safety Officer'), (req, res) => {
  const { zone } = req.body;
  if (!zone) return res.status(400).json({ success: false, error: 'Please specify a zone to leak' });
  
  triggerEmergency(zone);
  
  // Also push alert via Socket if io is bound
  const io = app.get('io');
  if (io) {
    io.emit('emergency_triggered', { zone, message: `⚠️ EVACUATE ZONE: Critical telemetry breach simulated in ${zone}` });
  }

  res.status(200).json({ success: true, message: `Emergency leak simulation started in ${zone}` });
});

app.post('/api/simulate/clear', protect, authorize('Admin', 'Safety Officer'), (req, res) => {
  clearEmergency();
  const io = app.get('io');
  if (io) {
    io.emit('emergency_cleared', { message: 'Emergency simulation cleared. Returning to normal operations.' });
  }
  res.status(200).json({ success: true, message: 'Emergency simulated cleared' });
});

app.get('/api/simulate/status', (req, res) => {
  res.status(200).json({ success: true, activeEmergencyZone: getEmergencyZone() });
});

// Root handler
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'SentinelAI Industrial Safety Intelligence API Server',
    status: 'online',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
