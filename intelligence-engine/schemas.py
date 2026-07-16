from pydantic import BaseModel, Field
from typing import Dict, Any

class SensorData(BaseModel):
    gas: float = Field(..., description="Gas concentration in ppm")
    temperature: float = Field(..., description="Temperature in Celsius")
    pressure: float = Field(..., description="Pressure in PSI")
    humidity: float = Field(..., description="Humidity percentage")
    smoke: float = Field(0.0, description="Smoke levels in ppm or obscuration percentage")

class ContextData(BaseModel):
    worker_nearby: bool = Field(False, description="Whether worker(s) are near the machine or zone")
    maintenance_active: bool = Field(False, description="Whether maintenance is actively performed")
    permit_active: bool = Field(False, description="Whether a hot work or hazardous permit is active")
    incident_history_count: int = Field(0, description="Count of past incidents in this specific zone")

class RiskRequest(BaseModel):
    zone: str = Field("Zone A", description="The factory zone or area being evaluated")
    sensor_data: SensorData
    context_data: ContextData

class RiskResponse(BaseModel):
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Calculated compound risk score (0-100%)")
    severity: str = Field(..., description="Severity classification: LOW, MEDIUM, HIGH, CRITICAL")
    recommendation: str = Field(..., description="Automated safety recommendation")
    reason: str = Field(..., description="Reasoning statement explaining the threat vectors")
    breakdown: Dict[str, float] = Field(..., description="Individual risk factor contributions")
