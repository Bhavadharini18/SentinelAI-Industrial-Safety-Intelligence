const Sensor = require('../models/Sensor');
const Worker = require('../models/Worker');
const Machine = require('../models/Machine');
const Alert = require('../models/Alert');
const Incident = require('../models/Incident');
const Maintenance = require('../models/Maintenance');
const { evaluateRisk } = require('../services/riskService');

// State to keep track of simulated emergency
let activeEmergencyZone = null;

// Start simulator
const startTelemetrySimulation = (io) => {
  console.log('[Telemetry Simulator] Starting background telemetry worker...');

  setInterval(async () => {
    try {
      // 1. Fetch all active sensors
      const sensors = await Sensor.find({ status: 'Active' });
      if (sensors.length === 0) return;

      // Map sensors by zone for compound evaluation
      const zoneTelemetry = {};

      for (let sensor of sensors) {
        let delta = 0;
        
        // Dynamic fluctuation based on sensor type
        if (sensor.type === 'Gas') {
          // Normal gas around 10-35 ppm
          delta = (Math.random() - 0.48) * 4;
          if (activeEmergencyZone === sensor.currentZone) {
            // Leak simulation! Spike gas rapidly
            sensor.currentValue = Math.min(250, sensor.currentValue + (Math.random() * 20) + 10);
          } else {
            sensor.currentValue = Math.max(5.0, Math.min(45.0, sensor.currentValue + delta));
          }
        } else if (sensor.type === 'Temperature') {
          // Normal temp around 30-55°C
          delta = (Math.random() - 0.5) * 1.5;
          if (activeEmergencyZone === sensor.currentZone) {
            sensor.currentValue = Math.min(110, sensor.currentValue + (Math.random() * 8) + 4);
          } else {
            sensor.currentValue = Math.max(20.0, Math.min(60.0, sensor.currentValue + delta));
          }
        } else if (sensor.type === 'Pressure') {
          // Normal pressure around 70-98 PSI
          delta = (Math.random() - 0.5) * 2.5;
          if (activeEmergencyZone === sensor.currentZone) {
            sensor.currentValue = Math.min(185, sensor.currentValue + (Math.random() * 12) + 6);
          } else {
            sensor.currentValue = Math.max(50.0, Math.min(105.0, sensor.currentValue + delta));
          }
        } else if (sensor.type === 'Humidity') {
          // Humidity around 40-60%
          delta = (Math.random() - 0.5) * 1.0;
          sensor.currentValue = Math.max(30.0, Math.min(70.0, sensor.currentValue + delta));
        } else if (sensor.type === 'Smoke') {
          // Smoke around 0-2%
          delta = (Math.random() - 0.5) * 0.2;
          if (activeEmergencyZone === sensor.currentZone) {
            sensor.currentValue = Math.min(35.0, sensor.currentValue + (Math.random() * 4) + 2);
          } else {
            sensor.currentValue = Math.max(0.0, Math.min(3.0, sensor.currentValue + delta));
          }
        }

        // Round value
        sensor.currentValue = Math.round(sensor.currentValue * 100) / 100;
        
        // Push to history
        sensor.history.push({ value: sensor.currentValue, timestamp: new Date() });
        if (sensor.history.length > 50) {
          sensor.history = sensor.history.slice(-50);
        }

        await sensor.save();

        // Organize by zone
        if (!zoneTelemetry[sensor.currentZone]) {
          zoneTelemetry[sensor.currentZone] = {};
        }
        zoneTelemetry[sensor.currentZone][sensor.type.toLowerCase()] = sensor.currentValue;
        zoneTelemetry[sensor.currentZone][`${sensor.type.toLowerCase()}_sensor_id`] = sensor._id;
      }

      // Broadcast new sensor values to clients
      io.emit('sensor_updates', sensors);

      // 2. Evaluate risks per zone
      const zones = ['Zone A', 'Zone B', 'Zone C'];
      const zoneRisks = {};

      for (let zone of zones) {
        const telemetry = zoneTelemetry[zone] || {
          gas: 20.0,
          temperature: 35.0,
          pressure: 85.0,
          humidity: 45.0,
          smoke: 0.5
        };

        // Gather contexts for this zone
        const workerNearby = await Worker.exists({ currentZone: zone, online: true });
        const maintenanceActive = await Maintenance.exists({ status: 'In Progress', machine: { $in: await Machine.find({ currentZone: zone }).distinct('_id') } });
        
        // Check if hot work permit is active
        const permitActive = await Maintenance.exists({ permitActive: true, status: 'In Progress', machine: { $in: await Machine.find({ currentZone: zone }).distinct('_id') } });
        
        // Incident counts
        const incidentHistoryCount = await Incident.countDocuments({ zone });

        const context = {
          worker_nearby: !!workerNearby,
          maintenance_active: !!maintenanceActive,
          permit_active: !!permitActive,
          incident_history_count: incidentHistoryCount
        };

        // Evaluate compound risk (handles Python service request with fallback)
        const evaluation = await evaluateRisk(zone, telemetry, context);
        zoneRisks[zone] = evaluation;

        // 3. Automated Alert Generation
        if (evaluation.risk_score >= 50.0) {
          // Check if an active/acknowledged alert already exists for this zone
          const existingAlert = await Alert.findOne({
            zone,
            status: { $in: ['Active', 'Acknowledged'] },
            title: { $regex: 'Elevated Risk|Critical Danger', $options: 'i' }
          });

          if (!existingAlert) {
            // Generate alert
            const severity = evaluation.risk_score >= 80.0 ? 'Critical' : 'High';
            const alertTitle = severity === 'Critical' ? `Critical Danger: ${zone} Safety Breach` : `Elevated Risk Detected in ${zone}`;
            
            // Link to sensor triggering it if gas/pressure/temp is high
            let sensorId = null;
            if (telemetry.gas >= 60.0) sensorId = telemetry.gas_sensor_id;
            else if (telemetry.temperature >= 75.0) sensorId = telemetry.temperature_sensor_id;
            else if (telemetry.pressure >= 120.0) sensorId = telemetry.pressure_sensor_id;

            const newAlert = await Alert.create({
              title: alertTitle,
              description: evaluation.reason,
              severity,
              zone,
              riskScore: evaluation.risk_score,
              recommendations: evaluation.recommendation,
              sensor: sensorId
            });

            const populated = await Alert.findById(newAlert._id)
              .populate('sensor')
              .populate('machine');

            io.emit('new_alert', populated);
          } else {
            // Update risk score of existing active alert
            existingAlert.riskScore = evaluation.risk_score;
            existingAlert.description = evaluation.reason;
            existingAlert.recommendations = evaluation.recommendation;
            await existingAlert.save();
            
            io.emit('alert_updated', existingAlert);
          }
        }
      }

      // Broadcast zone risk matrix
      io.emit('zone_risks', zoneRisks);

      // 4. Calculate and broadcast global Safety Score
      // Overall safety index = 100 - average of zone risks
      const avgRisk = Object.values(zoneRisks).reduce((sum, item) => sum + item.risk_score, 0) / zones.length;
      const globalSafetyScore = Math.max(0, Math.round(100 - avgRisk));
      io.emit('global_safety_score', {
        safetyScore: globalSafetyScore,
        timestamp: new Date()
      });

    } catch (error) {
      console.error(`[Telemetry Simulator] Simulation loop error: ${error.message}`);
    }
  }, 4000);
};

// Control functions to trigger emergency scenarios from API / Socket
const triggerEmergency = (zone) => {
  activeEmergencyZone = zone;
  console.log(`[Telemetry Simulator] Emergency triggered in ${zone}!`);
  return { success: true, zone };
};

const clearEmergency = () => {
  activeEmergencyZone = null;
  console.log('[Telemetry Simulator] Emergency cleared.');
  return { success: true };
};

module.exports = {
  startTelemetrySimulation,
  triggerEmergency,
  clearEmergency,
  getEmergencyZone: () => activeEmergencyZone
};
