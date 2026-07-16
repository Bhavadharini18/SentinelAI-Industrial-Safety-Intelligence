const Report = require('../models/Report');
const Sensor = require('../models/Sensor');
const Machine = require('../models/Machine');
const Worker = require('../models/Worker');
const Alert = require('../models/Alert');
const Incident = require('../models/Incident');

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('generatedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Generate a safety report
// @route   POST /api/reports
// @access  Private (Safety Officer, Supervisor, Admin)
exports.createReport = async (req, res) => {
  try {
    const { title, type, dateStart, dateEnd, summary } = req.body;

    // Gather system telemetry snapshot
    const totalWorkers = await Worker.countDocuments();
    const onlineWorkers = await Worker.countDocuments({ online: true });
    
    const machinesCount = await Machine.countDocuments();
    const faultyMachines = await Machine.countDocuments({ status: { $in: ['Offline', 'Failing'] } });
    
    const sensorsCount = await Sensor.countDocuments();
    const inactiveSensors = await Sensor.countDocuments({ status: { $ne: 'Active' } });

    // Fetch alerts count
    const activeAlerts = await Alert.countDocuments({ status: 'Active' });
    const criticalAlertsCount = await Alert.countDocuments({ severity: 'Critical', status: 'Active' });

    // Fetch incidents list in date range if specified
    const incidentFilter = {};
    if (dateStart && dateEnd) {
      incidentFilter.date = { $gte: new Date(dateStart), $lte: new Date(dateEnd) };
    }
    const incidents = await Incident.find(incidentFilter);

    // Build JSON snapshot
    const safetySnapshot = {
      workers: {
        total: totalWorkers,
        online: onlineWorkers
      },
      machines: {
        total: machinesCount,
        faulty: faultyMachines
      },
      sensors: {
        total: sensorsCount,
        inactive: inactiveSensors
      },
      alerts: {
        active: activeAlerts,
        critical: criticalAlertsCount
      },
      incidents: incidents.map(inc => ({
        title: inc.title,
        severity: inc.severity,
        zone: inc.zone,
        date: inc.date
      }))
    };

    // Calculate a rough Safety Index based on active issues
    let safetyScore = 100;
    safetyScore -= (criticalAlertsCount * 15);
    safetyScore -= (activeAlerts * 5);
    safetyScore -= (faultyMachines * 8);
    safetyScore = Math.max(0, safetyScore);

    const newReport = await Report.create({
      title,
      type,
      generatedBy: req.user.id,
      dateRange: {
        start: dateStart ? new Date(dateStart) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: dateEnd ? new Date(dateEnd) : new Date()
      },
      summary: summary || `Safety snapshot report. Calculated Safety Index: ${safetyScore}%. Active Alerts: ${activeAlerts}. Active Evacuations: ${criticalAlertsCount > 0 ? 'Yes' : 'No'}.`,
      data: {
        safetyScore,
        snapshot: safetySnapshot
      }
    });

    const populatedReport = await Report.findById(newReport._id)
      .populate('generatedBy', 'name email role');

    res.status(201).json({ success: true, data: populatedReport });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Export a report as JSON
// @route   GET /api/reports/:id/export
// @access  Private
exports.exportReportJSON = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'name email');
      
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=sentinel_report_${report._id}.json`);
    res.status(200).send(JSON.stringify(report, null, 2));
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
