const { evaluateRisk } = require('../services/riskService');

// @desc    Evaluate risk score on custom/live data
// @route   POST /api/risk/evaluate
// @access  Private
exports.evaluateCustomRisk = async (req, res) => {
  try {
    const { zone, sensor_data, context_data } = req.body;

    if (!sensor_data || !context_data) {
      return res.status(400).json({ success: false, error: 'Please provide sensor_data and context_data' });
    }

    const prediction = await evaluateRisk(zone || 'Zone A', sensor_data, context_data);
    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
