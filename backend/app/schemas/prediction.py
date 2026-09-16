from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    latitude: float = Field(..., description="Latitude of the location", ge=-90, le=90)
    longitude: float = Field(..., description="Longitude of the location", ge=-180, le=180)

class PredictionResponse(BaseModel):
    latitude: float = Field(..., description="Latitude of the location")
    longitude: float = Field(..., description="Longitude of the location")
    risk_level: str = Field(..., description="Predicted landslide risk level (e.g., Low, Medium, High)")
    probability: float = Field(..., description="Probability of landslide occurrence (0 to 1)")