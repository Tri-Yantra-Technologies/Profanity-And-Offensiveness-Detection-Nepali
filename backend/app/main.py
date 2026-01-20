import logging
import time
import uuid
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.schemas import PredictionInput, PredictionOutput, HealthCheck
from app.models import model_manager
from app.rate_limit import check_rate_limit, rate_limiter

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown."""
    logger.info("Starting up... Loading models.")
    # Accessing model_manager triggers load in __init__
    _ = model_manager
    logger.info(f"Startup complete. Mock mode: {model_manager.is_mock}")
    yield
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
    "http://localhost:3000",
]
# Filter out empty strings and duplicates
origins = list(set(filter(None, origins)))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_middleware(request: Request, call_next):
    """Add request ID and timing to all requests."""
    request_id = str(uuid.uuid4())[:8]
    start_time = time.time()
    
    # Add request ID to request state for logging
    request.state.request_id = request_id
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = f"{process_time:.4f}"
    
    logger.info(
        f"req_id={request_id} | method={request.method} | "
        f"path={request.url.path} | status={response.status_code} | "
        f"duration={process_time:.3f}s"
    )
    
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for consistent error responses."""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error(f"req_id={request_id} | Unhandled error: {exc}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "An unexpected error occurred",
            "request_id": request_id
        }
    )


@app.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint for load balancers and monitoring."""
    return {"status": "ok"}


@app.get("/meta")
async def metadata():
    """Get API metadata and paper information."""
    return {
        "model_version": settings.VERSION,
        "paper": "Profanity and Offensiveness Detection in Nepali Language Using Bi-directional LSTM Models (ICON 2024)",
        "paper_link": "https://aclanthology.org/2024.icon-1.60",
        "mock_mode": model_manager.is_mock,
        "rate_limit": {
            "requests": settings.RATE_LIMIT_REQUESTS,
            "window_seconds": settings.RATE_LIMIT_WINDOW
        }
    }


@app.post("/predict", response_model=PredictionOutput)
async def predict(
    input_data: PredictionInput,
    request: Request,
    _: None = Depends(check_rate_limit)
):
    """
    Predict profanity and offensiveness of Nepali text.
    
    Rate limited to prevent abuse.
    """
    if not input_data.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")
    
    try:
        start = time.time()
        result = model_manager.predict(input_data.text)
        duration_ms = (time.time() - start) * 1000
        
        # Add rate limit headers to response
        is_allowed, remaining = rate_limiter.check_rate_limit(request)
        
        return {
            "profanity": result["profanity"],
            "offensiveness": result["offensiveness"],
            "latency_ms": round(duration_ms, 2)
        }
        
    except Exception as e:
        request_id = getattr(request.state, "request_id", "unknown")
        logger.error(f"req_id={request_id} | Prediction failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during prediction")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
