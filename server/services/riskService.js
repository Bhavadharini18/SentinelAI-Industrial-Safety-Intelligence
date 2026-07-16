const axios = require('axios');

// Local fallback rule-based risk reasoning if Python microservice is unavailable
const calculateFallbackRisk = (sensorData, contextData) => {
  const { gas, temperature, pressure, smoke, humidity } = sensorData;
  const { worker_nearby, maintenance_active, permit_active, incident_history_count } = contextData;

  const gasScore = Math.min(100.0, (gas / 200.0) * 100.0);
  const tempScore = Math.min(100.0, Math.max(0.0, (temperature - 20.0) / 90.0) * 100.0);
  const pressureScore = Math.min(100.0, (pressure / 180.0) * 100.0);
  const smokeScore = Math.min(100.0, (smoke / 30.0) * 100.0);
  const humidityScore = Math.min(100.0, (Math.abs(humidity - 50.0) / 50.0) * 100.0);

  const baseSensorRisk = (gasScore * 0.35) + (tempScore * 0.25) + (pressureScore * 0.25) + (smokeScore * 0.10) + (humidityScore * 0.05);

  let compoundBoost = 0.0;
  const threatVectors = [];
  const recommendations = [];

  if (gas >= 60.0 && pressure >= 120.0) {
    let boost = 35.0;
    if (temperature >= 70.0) boost += 15.0;
    compoundBoost += boost;
    threatVectors.push("Combustible Gas Accumulation + High Pressure Vessel stress");
    recommendations.push("Release vessel pressure immediately and initiate gas venting/exhaust systems.");
  }

  if (temperature >= 80.0 && (smoke >= 10.0 || gas >= 50.0)) {
    compoundBoost += 30.0;
    threatVectors.push("Thermal Runaway or Active Smoldering Fire");
    recommendations.push("Activate zone fire suppression systems and cut electrical feed to machinery.");
  }

  if (maintenance_active && (pressure >= 130.0 || temperature >= 75.0)) {
    compoundBoost += 20.0;
    threatVectors.push("Maintenance active on high-energy system (Pressure/Temp exceed limits)");
    recommendations.push("Suspend maintenance activities immediately and depressurize system.");
  }

  if (worker_nearby) {
    if (baseSensorRisk + compoundBoost >= 50.0) {
      compoundBoost += 15.0;
      threatVectors.push("Personnel detected inside active high-risk zone");
      recommendations.push("Order immediate evacuation of all personnel from the area.");
    } else {
      compoundBoost += 5.0;
    }
  }

  if (permit_active && gas >= 80.0) {
    compoundBoost += 20.0;
    threatVectors.push("Hot work permit active in explosive/gaseous atmosphere");
    recommendations.push("Revoke all hot work permits for this zone and clear the area.");
  }

  if (incident_history_count > 0) {
    compoundBoost += Math.min(15.0, incident_history_count * 5.0);
    threatVectors.push(`Area with recurrent safety incidents (${incident_history_count} past events)`);
  }

  const finalScore = Math.min(100.0, baseSensorRisk + compoundBoost);
  let severity = "LOW";
  let mainRec = "Systems operating within safe nominal parameters. No action required.";

  if (finalScore >= 80.0) {
    severity = "CRITICAL";
    mainRec = "CRITICAL ALARM: " + (recommendations.length > 0 ? recommendations.join(" | ") : "Initiate emergency site-wide evacuation.");
  } else if (finalScore >= 50.0) {
    severity = "HIGH";
    mainRec = "WARNING: " + (recommendations.length > 0 ? recommendations.join(" | ") : "Dispatch safety officer to inspect sensors.");
  } else if (finalScore >= 25.0) {
    severity = "MEDIUM";
    mainRec = "ADVISORY: Monitor zone telemetry. Precautionary venting recommended.";
  }

  return {
    risk_score: Math.round(finalScore * 100) / 100,
    severity,
    recommendation: mainRec,
    reason: threatVectors.length > 0 ? `Elevated safety risk due to compound factors: ${threatVectors.join(', ')}.` : "Normal operations. Telemetry values stable.",
    breakdown: {
      gas_contribution: Math.round(gasScore * 100) / 100,
      temperature_contribution: Math.round(tempScore * 100) / 100,
      pressure_contribution: Math.round(pressureScore * 100) / 100,
      smoke_contribution: Math.round(smokeScore * 100) / 100,
      humidity_contribution: Math.round(humidityScore * 100) / 100,
      context_boost: Math.round(compoundBoost * 100) / 100,
      base_telemetry_risk: Math.round(baseSensorRisk * 100) / 100
    }
  };
};

// Evaluate risk using Python service (FastAPI) or local fallback
exports.evaluateRisk = async (zone, sensorData, contextData) => {
  const url = `${process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'}/api/v1/risk/predict`;
  try {
    const res = await axios.post(url, {
      zone,
      sensor_data: sensorData,
      context_data: contextData
    }, { timeout: 2000 }); // Short timeout to fail fast and fall back
    
    return res.data;
  } catch (error) {
    console.warn(`[RiskService] Python Engine unavailable at ${url} (${error.message}). Running local fallback reasoning logic...`);
    return calculateFallbackRisk(sensorData, contextData);
  }
};
