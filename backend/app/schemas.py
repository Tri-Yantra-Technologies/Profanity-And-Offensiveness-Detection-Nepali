from pydantic import BaseModel, Field

class PredictionInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, example="यो एउटा उदाहरण हो")

class LabelConfidence(BaseModel):
    label: str
    confidence: float

class PredictionOutput(BaseModel):
    profanity: LabelConfidence
    offensiveness: LabelConfidence
    latency_ms: float

class HealthCheck(BaseModel):
    status: str
