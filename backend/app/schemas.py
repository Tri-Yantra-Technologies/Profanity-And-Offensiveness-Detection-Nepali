from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class PredictionInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, example="यो एउटा उदाहरण हो")
    model_type: Optional[str] = Field(
        None, 
        description="Model type to use: 'profane_binary', 'offensive_binary', 'multilabel', or 'multi_output'",
        example="profane_binary"
    )

class LabelConfidence(BaseModel):
    label: str
    confidence: float

class GenderPrediction(BaseModel):
    label: str
    confidence: float

class PredictionOutput(BaseModel):
    profanity: LabelConfidence
    offensiveness: LabelConfidence
    latency_ms: float
    model_used: Optional[str] = None
    gender: Optional[GenderPrediction] = None  # Only for multi_output model

class GenderInput(BaseModel):
    """Input for gender prediction endpoint."""
    text: str = Field(..., min_length=1, max_length=2000, example="यो एउटा उदाहरण हो")

class GenderOutput(BaseModel):
    """Output for gender prediction endpoint."""
    gender: GenderPrediction
    latency_ms: float
    model_used: str = "multi_output"

class AnalyzeInput(BaseModel):
    """Input for full analysis endpoint (all models combined)."""
    text: str = Field(..., min_length=1, max_length=2000, example="यो एउटा उदाहरण हो")

class AnalyzeOutput(BaseModel):
    """Combined output from all models."""
    text: str
    processed_text: str
    profanity_binary: Optional[LabelConfidence] = None
    offensive_binary: Optional[LabelConfidence] = None
    multilabel: Optional[LabelConfidence] = None
    gender: Optional[GenderPrediction] = None
    latency_ms: float
    models_used: List[str]

class HealthCheck(BaseModel):
    status: str

class FeedbackInput(BaseModel):
    """Input for user feedback on predictions."""
    text: str
    model_used: str
    prediction: Dict[str, Any]
    is_correct: bool
    corrected_label: Optional[str] = None
    timestamp: Optional[float] = None

class ModelInfo(BaseModel):
    type: str
    name: str
    description: str

class ModelsListResponse(BaseModel):
    available_models: List[ModelInfo]
    default_model: str

class CensorInput(BaseModel):
    """Input for text censoring endpoint."""
    text: str = Field(..., min_length=1, max_length=2000, example="यो बकवास काम हो")
    censor_char: Optional[str] = Field("*", max_length=3, description="Character to use for censoring", example="*")
    model_type: Optional[str] = Field("profane_binary", description="Model to use for detection")

class CensorOutput(BaseModel):
    """Output for text censoring endpoint."""
    original: str
    censored: str
    profanity_detected: bool
    offensive_detected: bool
    censored_count: int
    latency_ms: float
    model_used: str

