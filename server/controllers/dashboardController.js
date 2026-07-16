const Worker = require('../models/Worker');
const Machine = require('../models/Machine');
const Sensor = require('../models/Sensor');
const Alert = require('../models/Alert');
const Incident = require('../models/Incident');

// @desc    Get dashboard metrics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Gather counts
    const workersOnline = await Worker.countDocuments({ online: true });
    const workersTotal = await Worker.countDocuments();
    
    const machinesActive = await Machine.countDocuments({ status: 'Operational' });
    const machinesTotal = await Machine.countDocuments();
    
    const sensorsCount = await Sensor.countDocuments();
    const activeAlertsCount = await Alert.countDocuments({ status: 'Active' });
    const criticalAlertsCount = await Alert.countDocuments({ severity: 'Critical', status: 'Active' });

    // 2. Fetch recent alerts
    const recentAlerts = await Alert.find()
      .populate('sensor')
      .populate('machine')
      .sort({ timestamp: -1 })
      .limit(6);

    // 3. Fetch recent incidents
    const recentIncidents = await Incident.find()
      .sort({ date: -1 })
      .limit(5);

    // 4. Calculate current safety score
    // Safe base is 100.
    // Critical alert deducts 20, High alert deducts 10, Medium alert deducts 5, Low alert deducts 2.
    // Cap safety score at 0-100.
    const activeAlerts = await Alert.find({ status: 'Active' });
    let safetyScore = 100;
    
    activeAlerts.forEach(alert => {
      if (alert.severity === 'Critical') safetyScore -= 25;
      else if (alert.severity === 'High') safetyScore -= 12;
      else if (alert.severity === 'Medium') safetyScore -= 5;
      else if (alert.severity === 'Low') safetyScore -= 2;
    });

    safetyScore = Math.max(0, safetyScore);

    // 5. Generate mock risk trends for a chart (last 7 days/hours)
    // In production this would aggregate historical logs
    const riskTrend = [
      { name: '08:00', risk: 12 },
      { name: '10:00', risk: 18 },
      { name: '12:00', risk: 15 },
      { name: '14:00', risk: 35 }, // slight bump
      { name: '16:00', risk: 22 },
      { name: '18:00', risk: 100 - safetyScore }, // current risk level
    ];

    res.status(200).json({
      success: true,
      data: {
        safetyScore,
        workers: {
          online: workersOnline,
          total: workersTotal
        },
        machines: {
          active: machinesActive,
          total: machinesTotal
        },
        sensorsCount,
        alerts: {
          active: activeAlertsCount,
          critical: criticalAlertsCount
        },
        recentAlerts,
        recentIncidents,
        riskTrend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
