from fastapi import APIRouter
router = APIRouter(tags=["Health Check"], prefix="/health")

@router.get("/")
def health_check():
    return {"status": "healthy",
            "service": "Landslide Risk Monitoring System"}