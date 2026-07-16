from schemas import RiskRequest, RiskResponse

def calculate_compound_risk(request: RiskRequest) -> RiskResponse:
    sensor = request.sensor_data
    context = request.context_data

    # 1. Normalize individual sensor values to a 0-100 scale based on industrial thresholds
    # Gas: Safe < 50 ppm, Warning 50-150, Critical > 150
    gas_score = min(100.0, (sensor.gas / 200.0) * 100.0) if sensor.gas > 0 else 0.0
    
    # Temperature: Safe < 60°C, Warning 60-90, Critical > 90
    temp_score = min(100.0, max(0.0, (sensor.temperature - 20.0) / 90.0) * 100.0)
    
    # Pressure: Safe < 100 PSI, Warning 100-150, Critical > 150
    pressure_score = min(100.0, (sensor.pressure / 180.0) * 100.0) if sensor.pressure > 0 else 0.0
    
    # Smoke: Safe < 5%, Warning 5-20%, Critical > 20%
    smoke_score = min(100.0, (sensor.smoke / 30.0) * 100.0) if sensor.smoke > 0 else 0.0

    # Humidity contribution (indirect risk: dry air = static electricity, wet air = corrosion)
    # Let's say extreme humidity (<20% or >80%) contributes a minor safety score impact.
    humidity_deviation = abs(sensor.humidity - 50.0)
    humidity_score = min(100.0, (humidity_deviation / 50.0) * 100.0)

    # 2. Weighted sensor average (Base Sensor Risk)
    base_sensor_risk = (
        (gas_score * 0.35) + 
        (temp_score * 0.25) + 
        (pressure_score * 0.25) + 
        (smoke_score * 0.10) +
        (humidity_score * 0.05)
    )

    # 3. Compound Threat Multipliers & Boosts
    compound_boost = 0.0
    threat_vectors = []
    recommendations = []

    # Scenario A: Gas + Pressure + Temp (High risk of pressure vessel explosion / rupture in gas environment)
    if sensor.gas >= 60.0 and sensor.pressure >= 120.0:
        boost = 35.0
        if sensor.temperature >= 70.0:
            boost += 15.0
        compound_boost += boost
        threat_vectors.append("Combustible Gas Accumulation + High Pressure Vessel stress")
        recommendations.append("Release vessel pressure immediately and initiate gas venting/exhaust systems.")

    # Scenario B: Fire/Thermal runaway (High Temp + Smoke + Gas)
    if sensor.temperature >= 80.0 and (sensor.smoke >= 10.0 or sensor.gas >= 50.0):
        compound_boost += 30.0
        threat_vectors.append("Thermal Runaway or Active Smoldering Fire")
        recommendations.append("Activate zone fire suppression systems and cut electrical feed to machinery.")

    # Scenario C: Active Maintenance + High Pressure/Temp (Human error/safety breach during live maintenance)
    if context.maintenance_active and (sensor.pressure >= 130.0 or sensor.temperature >= 75.0):
        compound_boost += 20.0
        threat_vectors.append("Maintenance active on high-energy system (Pressure/Temp exceed limits)")
        recommendations.append("Suspend maintenance activities immediately and depressurize system.")

    # Scenario D: Worker Nearby + Active Hazard
    if context.worker_nearby:
        if base_sensor_risk + compound_boost >= 50.0:
            # Active danger zone with worker presence increases safety hazard score significantly
            compound_boost += 15.0
            threat_vectors.append("Personnel detected inside active high-risk zone")
            recommendations.append("Order immediate evacuation of all personnel from the area.")
        else:
            # Minor boost just for worker presence under general elevated telemetry
            compound_boost += 5.0

    # Scenario E: Work Permit Violations
    if context.permit_active and sensor.gas >= 80.0:
        compound_boost += 20.0
        threat_vectors.append("Hot work permit active in explosive/gaseous atmosphere")
        recommendations.append("Revoke all hot work permits for this zone and clear the area.")

    # Apply historical incident penalty (past incidents suggest poor insulation or structural vulnerability)
    if context.incident_history_count > 0:
        history_penalty = min(15.0, context.incident_history_count * 5.0)
        compound_boost += history_penalty
        threat_vectors.append(f"Area with recurrent safety incidents ({context.incident_history_count} past events)")

    # Final score is base + boost, capped at 100%
    final_score = min(100.0, base_sensor_risk + compound_boost)

    # 4. Determine severity and main recommendation
    if final_score >= 80.0:
        severity = "CRITICAL"
        main_rec = "CRITICAL ALARM: " + (" | ".join(recommendations) if recommendations else "Initiate emergency site-wide evacuation and automated system shutdown.")
    elif final_score >= 50.0:
        severity = "HIGH"
        main_rec = "WARNING: " + (" | ".join(recommendations) if recommendations else "Dispatch safety officer to inspect sensors and secure machinery.")
    elif final_score >= 25.0:
        severity = "MEDIUM"
        main_rec = "ADVISORY: Monitor zone telemetry. Perform precautionary check on cooling and venting systems."
    else:
        severity = "LOW"
        main_rec = "Systems operating within safe nominal parameters. No action required."

    # 5. Formulate reasoning text
    if threat_vectors:
        reason = f"Elevated safety risk due to compound factors: {', '.join(threat_vectors)}."
    elif final_score > 15.0:
        reason = "Slight elevation in safety score due to isolated telemetry fluctuations."
    else:
        reason = "Normal operations. Telemetry values and contextual work indicators are stable."

    breakdown = {
        "gas_contribution": round(gas_score, 2),
        "temperature_contribution": round(temp_score, 2),
        "pressure_contribution": round(pressure_score, 2),
        "smoke_contribution": round(smoke_score, 2),
        "humidity_contribution": round(humidity_score, 2),
        "context_boost": round(compound_boost, 2),
        "base_telemetry_risk": round(base_sensor_risk, 2)
    }

    return RiskResponse(
        risk_score=round(final_score, 2),
        severity=severity,
        recommendation=main_rec,
        reason=reason,
        breakdown=breakdown
    )
