const Maintenance = require('../models/Maintenance');

// @desc    Get all maintenance logs / permits
// @route   GET /api/maintenance
// @access  Private
exports.getMaintenance = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.permitActive) filter.permitActive = req.query.permitActive === 'true';

    const list = await Maintenance.find(filter)
      .populate('machine')
      .populate('worker')
      .sort({ scheduledDate: 1 });

    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create maintenance task / work permit
// @route   POST /api/maintenance
// @access  Private (Supervisor, Admin, Safety Officer)
exports.createMaintenance = async (req, res) => {
  try {
    const log = await Maintenance.create(req.body);
    const populated = await Maintenance.findById(log._id)
      .populate('machine')
      .populate('worker');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update maintenance task / work permit status
// @route   PUT /api/maintenance/:id
// @access  Private
exports.updateMaintenance = async (req, res) => {
  try {
    const log = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('machine').populate('worker');

    if (!log) {
      return res.status(404).json({ success: false, error: 'Maintenance record not found' });
    }

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
