const Sensor = require('../models/Sensor');

// @desc    Get all sensors
// @route   GET /api/sensors
// @access  Private
exports.getSensors = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.zone) filter.currentZone = req.query.zone;
    if (req.query.type) filter.type = req.query.type;

    const sensors = await Sensor.find(filter);
    res.status(200).json({ success: true, count: sensors.length, data: sensors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single sensor
// @route   GET /api/sensors/:id
// @access  Private
exports.getSensor = async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    if (!sensor) {
      return res.status(404).json({ success: false, error: 'Sensor not found' });
    }
    res.status(200).json({ success: true, data: sensor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create sensor
// @route   POST /api/sensors
// @access  Private (Admin, Safety Officer)
exports.createSensor = async (req, res) => {
  try {
    const sensor = await Sensor.create(req.body);
    res.status(201).json({ success: true, data: sensor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update sensor (also pushes to telemetry history)
// @route   PUT /api/sensors/:id
// @access  Private
exports.updateSensor = async (req, res) => {
  try {
    const { currentValue, status, name, currentZone, location } = req.body;
    
    const sensor = await Sensor.findById(req.params.id);
    if (!sensor) {
      return res.status(404).json({ success: false, error: 'Sensor not found' });
    }

    if (name !== undefined) sensor.name = name;
    if (status !== undefined) sensor.status = status;
    if (currentZone !== undefined) sensor.currentZone = currentZone;
    if (location !== undefined) sensor.location = location;

    if (currentValue !== undefined) {
      sensor.currentValue = currentValue;
      // Push reading into history array
      sensor.history.push({ value: currentValue, timestamp: new Date() });
    }

    await sensor.save();

    res.status(200).json({ success: true, data: sensor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete sensor
// @route   DELETE /api/sensors/:id
// @access  Private (Admin)
exports.deleteSensor = async (req, res) => {
  try {
    const sensor = await Sensor.findByIdAndDelete(req.params.id);
    if (!sensor) {
      return res.status(404).json({ success: false, error: 'Sensor not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
