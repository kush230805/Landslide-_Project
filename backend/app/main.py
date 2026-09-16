from fastapi import FastAPI
from app.api.v1.predictions import router as predictions_router
from app.api.v1.locations import router as locations_router
from app.api.v1.health import router as health_router

app = FastAPI(title="Landslide Risk Monitoring System", description="A system to monitor and assess landslide risks using real-time data and predictive analytics.", version="1.0.0")

app.include_router(predictions_router)
app.include_router(locations_router)
app.include_router(health_router)

@app.get("/")
def home():
    return {"message": "Welcome to the Landslide Risk Monitoring System API!"}

@app.get("/health")
def status():
    return {"status": "Ok"}