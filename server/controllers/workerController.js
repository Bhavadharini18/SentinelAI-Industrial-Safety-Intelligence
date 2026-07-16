const Worker = require('../models/Worker');

// @desc    Get all workers
// @route   GET /api/workers
// @access  Private
exports.getWorkers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.online) filter.online = req.query.online === 'true';
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;

    const workers = await Worker.find(filter);
    res.status(200).json({ success: true, count: workers.length, data: workers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single worker
// @route   GET /api/workers/:id
// @access  Private
exports.getWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    res.status(200).json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create worker
// @route   POST /api/workers
// @access  Private (Admin, Supervisor, Safety Officer)
exports.createWorker = async (req, res) => {
  try {
    const worker = await Worker.create(req.body);
    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update worker
// @route   PUT /api/workers/:id
// @access  Private
exports.updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    res.status(200).json({ success: true, data: worker });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete worker
// @route   DELETE /api/workers/:id
// @access  Private (Admin)
exports.deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
