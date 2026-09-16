from fastapi import APIRouter
from app.schemas.prediction import PredictionRequest, PredictionResponse
router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.post("/", response_model=PredictionResponse)
def predict_risk(prediction: PredictionRequest):
    probability = 0.75  # Example probability
    if probability < 0.3:
        risk_level = "Low"
    elif 0.3 <= probability < 0.6:
        risk_level = "Medium"
    elif 0.6 <= probability <0.8:
        risk_level = "High"
    else:
        risk_level = " Very High"

    return PredictionResponse(
        latitude=prediction.latitude,
        longitude=prediction.longitude,
        risk_level=risk_level,
        probability=probability
    )