const Machine = require('../models/Machine');

// @desc    Get all machines
// @route   GET /api/machines
// @access  Private
exports.getMachines = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.zone) filter.currentZone = req.query.zone;

    const machines = await Machine.find(filter);
    res.status(200).json({ success: true, count: machines.length, data: machines });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single machine
// @route   GET /api/machines/:id
// @access  Private
exports.getMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' });
    }
    res.status(200).json({ success: true, data: machine });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create machine
// @route   POST /api/machines
// @access  Private (Admin, Supervisor)
exports.createMachine = async (req, res) => {
  try {
    const machine = await Machine.create(req.body);
    res.status(201).json({ success: true, data: machine });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update machine
// @route   PUT /api/machines/:id
// @access  Private
exports.updateMachine = async (req, res) => {
  try {
    const machine = await Machine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' });
    }
    res.status(200).json({ success: true, data: machine });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete machine
// @route   DELETE /api/machines/:id
// @access  Private (Admin)
exports.deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);
    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
