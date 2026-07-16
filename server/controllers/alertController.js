const Alert = require('../models/Alert');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.zone) filter.zone = req.query.zone;

    // Fetch alerts, populate sensor and machine refs
    const alerts = await Alert.find(filter)
      .populate('sensor')
      .populate('machine')
      .populate('acknowledgedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ timestamp: -1 });

    res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Acknowledge alert
// @route   PUT /api/alerts/:id/acknowledge
// @access  Private (Safety Officer, Supervisor, Admin)
exports.acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    if (alert.status !== 'Active') {
      return res.status(400).json({ success: false, error: `Alert is already ${alert.status.toLowerCase()}` });
    }

    alert.status = 'Acknowledged';
    alert.acknowledgedBy = req.user.id;
    await alert.save();

    // Re-query to populate credentials for frontend
    const updatedAlert = await Alert.findById(alert._id)
      .populate('sensor')
      .populate('machine')
      .populate('acknowledgedBy', 'name email');

    // Emit socket broadcast if io instance is present
    if (req.app.get('io')) {
      req.app.get('io').emit('alert_updated', updatedAlert);
    }

    res.status(200).json({ success: true, data: updatedAlert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Resolve alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private (Safety Officer, Supervisor, Admin)
exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    if (alert.status === 'Resolved') {
      return res.status(400).json({ success: false, error: 'Alert is already resolved' });
    }

    alert.status = 'Resolved';
    alert.resolvedBy = req.user.id;
    alert.resolvedAt = new Date();
    await alert.save();

    // Re-query to populate credentials
    const updatedAlert = await Alert.findById(alert._id)
      .populate('sensor')
      .populate('machine')
      .populate('acknowledgedBy', 'name email')
      .populate('resolvedBy', 'name email');

    // Emit socket broadcast if io instance is present
    if (req.app.get('io')) {
      req.app.get('io').emit('alert_updated', updatedAlert);
    }

    res.status(200).json({ success: true, data: updatedAlert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create manual alert
// @route   POST /api/alerts
// @access  Private (Safety Officer, Supervisor, Admin)
exports.createAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    const populated = await Alert.findById(alert._id)
      .populate('sensor')
      .populate('machine');

    if (req.app.get('io')) {
      req.app.get('io').emit('new_alert', populated);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
