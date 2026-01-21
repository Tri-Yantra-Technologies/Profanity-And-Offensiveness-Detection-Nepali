import logging
import time
import uuid
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.schemas import (
    PredictionInput, PredictionOutput, HealthCheck, ModelsListResponse, ModelInfo,
    GenderInput, GenderOutput, AnalyzeInput, AnalyzeOutput, LabelConfidence, GenderPrediction,
    FeedbackInput
)
import csv
import os
from datetime import datetime
from app.models import model_manager, ModelType
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
    logger.info("Startup complete.")
    logger.info(f"Available models: {[m['type'] for m in model_manager.get_available_models()]}")
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
            "message": str(exc),  # Expose actual error for debugging
            "request_id": request_id
        }
    )


@app.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint for load balancers and monitoring."""
    return {"status": "ok"}


@app.get("/models", response_model=ModelsListResponse)
async def list_models():
    """
    List all available models for prediction.
    
    Returns the available model types that can be used in the /predict endpoint.
    """
    available = model_manager.get_available_models()
    # Note: profane_binary works correctly, multilabel has training issues
    default_model = "profane_binary" if any(m["type"] == "profane_binary" for m in available) else (
        available[0]["type"] if available else "mock"
    )
    
    return {
        "available_models": [
            ModelInfo(type=m["type"], name=m["name"], description=m["description"])
            for m in available
        ],
        "default_model": default_model
    }


@app.get("/meta")
async def metadata():
    """Get API metadata and paper information."""
    available_models = model_manager.get_available_models()
    
    return {
        "model_version": settings.VERSION,
        "paper": "Profanity and Offensiveness Detection in Nepali Language Using Bi-directional LSTM Models (ICON 2024)",
        "paper_link": "https://aclanthology.org/2024.icon-1.60",
        "mock_mode": getattr(model_manager, 'is_mock', False),
        "available_models": [m["type"] for m in available_models],
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
    
    - **text**: The Nepali text to analyze (Devanagari or Romanized)
    - **model_type**: Optional. Choose the model:
      - `profane_binary`: Detects profanity only (default, most reliable)
      - `offensive_binary`: Detects offensiveness only
      - `multilabel`: Classifies as Non-Offensive, Offensive, or Profane
      - `multi_output`: BERT-based model with gender + profanity prediction
    
    Rate limited to prevent abuse.
    """
    if not input_data.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")
    
    try:
        start = time.time()
        result = model_manager.predict(input_data.text, input_data.model_type)
        duration_ms = (time.time() - start) * 1000
        
        # Determine which model was actually used
        model_used = input_data.model_type if input_data.model_type else "profane_binary"
        
        # Add rate limit headers to response
        is_allowed, remaining = rate_limiter.check_rate_limit(request)
        
        # Build response
        response = {
            "profanity": result["profanity"],
            "offensiveness": result["offensiveness"],
            "latency_ms": round(duration_ms, 2),
            "model_used": model_used,
            "_debug_raw": result.get("_raw")
        }
        
        # Add gender if present (from multi_output model)
        if "gender" in result:
            response["gender"] = result["gender"]
        
        return response
        
    except ValueError as e:
         # Known errors (e.g. Model not loaded) -> 400 Bad Request
         raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        request_id = getattr(request.state, "request_id", "unknown")
        logger.error(f"req_id={request_id} | Prediction failed: {e}")
        # Expose actual error to user
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/gender", response_model=GenderOutput)
async def predict_gender(
    input_data: GenderInput,
    request: Request,
    _: None = Depends(check_rate_limit)
):
    """
    Predict the gender of the speaker from Nepali text.
    
    Uses the Multi-Output BERT model which was trained to predict gender
    based on text patterns and language usage.
    
    - **text**: The Nepali text to analyze (Devanagari or Romanized)
    
    Rate limited to prevent abuse.
    """
    if not input_data.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")
    
    # Check if gender model is available
    if ModelType.GENDER not in model_manager.models:
        raise HTTPException(
            status_code=503, 
            detail="Gender prediction is still loading. Please try again in a moment."
        )
    
    try:
        start = time.time()
        result = model_manager.predict(input_data.text, "gender")
        duration_ms = (time.time() - start) * 1000
        
        if "gender" not in result:
            raise HTTPException(status_code=500, detail="Gender prediction failed")
        
        return {
            "gender": result["gender"],
            "latency_ms": round(duration_ms, 2),
            "model_used": "gender"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        request_id = getattr(request.state, "request_id", "unknown")
        logger.error(f"req_id={request_id} | Gender prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/feedback")
async def save_feedback(input_data: FeedbackInput):
    """
    Save user feedback on model predictions to a CSV file.
    """
    feedback_file = os.path.join(settings.BASE_DIR, "feedback.csv")
    file_exists = os.path.isfile(feedback_file)
    
    try:
        with open(feedback_file, mode="a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, field_names=[
                "timestamp", "text", "model_used", "prediction_label", 
                "prediction_confidence", "is_correct", "corrected_label"
            ])
            
            if not file_exists:
                writer.writeheader()
            
            # Extract basic prediction info for simpler CSV storage
            # This handles both standard prediction and gender output
            pred_label = "unknown"
            pred_conf = 0.0
            
            if "profanity" in input_data.prediction:
                pred_label = input_data.prediction["profanity"].get("label", "unknown")
                pred_conf = input_data.prediction["profanity"].get("confidence", 0.0)
            elif "gender" in input_data.prediction:
                pred_label = input_data.prediction["gender"].get("label", "unknown")
                pred_conf = input_data.prediction["gender"].get("confidence", 0.0)
                
            writer.writerow({
                "timestamp": datetime.now().isoformat(),
                "text": input_data.text,
                "model_used": input_data.model_used,
                "prediction_label": pred_label,
                "prediction_confidence": pred_conf,
                "is_correct": input_data.is_correct,
                "corrected_label": input_data.corrected_label or ""
            })
            
        return {"status": "success", "message": "Feedback saved successfully"}
    except Exception as e:
        logger.error(f"Failed to save feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to save feedback")


@app.post("/analyze", response_model=AnalyzeOutput)
async def analyze_all(
    input_data: AnalyzeInput,
    request: Request,
    _: None = Depends(check_rate_limit)
):
    """
    Run comprehensive analysis using all available models.
    
    Returns predictions from:
    - Profane Binary Model (profanity detection)
    - Offensive Binary Model (offensiveness detection)
    - Multilabel Model (combined classification)
    - Multi-Output BERT Model (gender + profanity)
    
    Rate limited to prevent abuse.
    """
    if not input_data.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")
    
    try:
        start = time.time()
        processed_text = model_manager.preprocess_text(input_data.text)
        
        results = {
            "text": input_data.text,
            "processed_text": processed_text,
            "profanity_binary": None,
            "offensive_binary": None,
            "multilabel": None,
            "gender": None,
            "models_used": []
        }
        
        # Try each model
        if ModelType.PROFANE_BINARY in model_manager.models:
            try:
                pred = model_manager.predict(input_data.text, "profane_binary")
                results["profanity_binary"] = pred["profanity"]
                results["models_used"].append("profane_binary")
            except Exception as e:
                logger.warning(f"Profane binary prediction failed: {e}")
        
        if ModelType.OFFENSIVE_BINARY in model_manager.models:
            try:
                pred = model_manager.predict(input_data.text, "offensive_binary")
                results["offensive_binary"] = pred["offensiveness"]
                results["models_used"].append("offensive_binary")
            except Exception as e:
                logger.warning(f"Offensive binary prediction failed: {e}")
        
        if ModelType.MULTILABEL in model_manager.models:
            try:
                pred = model_manager.predict(input_data.text, "multilabel")
                # Get the _raw prediction which has the class label
                raw = pred.get("_raw", {})
                results["multilabel"] = LabelConfidence(
                    label=raw.get("label", "Unknown"),
                    confidence=raw.get("confidence", 0.0)
                )
                results["models_used"].append("multilabel")
            except Exception as e:
                logger.warning(f"Multilabel prediction failed: {e}")
        
        if ModelType.MULTI_OUTPUT in model_manager.models:
            try:
                pred = model_manager.predict(input_data.text, "multi_output")
                if "gender" in pred:
                    results["gender"] = GenderPrediction(
                        label=pred["gender"]["label"],
                        confidence=pred["gender"]["confidence"]
                    )
                results["models_used"].append("multi_output")
            except Exception as e:
                logger.warning(f"Multi-output prediction failed: {e}")
        
        duration_ms = (time.time() - start) * 1000
        results["latency_ms"] = round(duration_ms, 2)
        
        return results
        
    except Exception as e:
        request_id = getattr(request.state, "request_id", "unknown")
        logger.error(f"req_id={request_id} | Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
