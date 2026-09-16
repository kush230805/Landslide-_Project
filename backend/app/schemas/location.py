from pydantic import BaseModel, Field

class LocationRequest(BaseModel):
    latitude: float = Field(..., description="Latitude of the location", ge=-90, le=90)
    longitude: float = Field(..., description="Longitude of the location", ge=-180, le=180)