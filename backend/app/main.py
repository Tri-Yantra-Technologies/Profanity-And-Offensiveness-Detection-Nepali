import logging
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.schemas import PredictionInput, PredictionOutput, HealthCheck
from app.models import model_manager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("app.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load models
    logger.info("Starting up... Loading models.")
    # accessing model_manager triggers load in __init__
    _ = model_manager
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS Configuration
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:3000",  # Explicitly allow local dev
    "https://your-frontend-domain.vercel.app", # Add your production domain here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

@app.get("/health", response_model=HealthCheck)
async def health_check():
    return {"status": "ok"}

@app.get("/meta")
async def metadata():
    return {
        "model_version": settings.VERSION,
        "paper": "Profanity and Offensiveness Detection in Nepali Language Using Bi-directional LSTM Models (ICON 2024)",
        "paper_link": "https://aclanthology.org/2024.icon-1.60",
        "mock_mode": model_manager.is_mock
    }

@app.post("/predict", response_model=PredictionOutput)
async def predict(input_data: PredictionInput):
    if not input_data.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")
    
    try:
        start = time.time()
        result = model_manager.predict(input_data.text)
        duration_ms = (time.time() - start) * 1000
        
        return {
            "profanity": result["profanity"],
            "offensiveness": result["offensiveness"],
            "latency_ms": round(duration_ms, 2)
        }
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during prediction")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
