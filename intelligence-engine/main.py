import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import RiskRequest, RiskResponse
from risk_calculator import calculate_compound_risk

app = FastAPI(
    title="SentinelAI Intelligence Engine",
    description="Python microservice calculating compound safety risks in real-time.",
    version="1.0.0"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/risk/predict", response_model=RiskResponse)
def predict_risk(payload: RiskRequest):
    try:
        response = calculate_compound_risk(payload)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "SentinelAI Intelligence Engine"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
