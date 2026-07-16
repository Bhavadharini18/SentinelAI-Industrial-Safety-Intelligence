const Incident = require('../models/Incident');

// @desc    Get all incidents
// @route   GET /api/incidents
// @access  Private
exports.getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate('reportedBy', 'name email role')
      .sort({ date: -1 });
    res.status(200).json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create incident
// @route   POST /api/incidents
// @access  Private (Safety Officer, Supervisor, Admin)
exports.createIncident = async (req, res) => {
  try {
    req.body.reportedBy = req.user.id;
    const incident = await Incident.create(req.body);
    
    // Broadcast via socket
    if (req.app.get('io')) {
      req.app.get('io').emit('new_incident', incident);
    }

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
