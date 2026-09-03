from fastapi import FastAPI

app = FastAPI(title="Landslide Risk Monitoring System", description="A system to monitor and assess landslide risks using real-time data and predictive analytics.", version="1.0.0")

@app.get("/")
def home():
    return {"message": "Welcome to the Landslide Risk Monitoring System API!"}

@app.get("/health")
def status():
    return {"status": "Ok"}