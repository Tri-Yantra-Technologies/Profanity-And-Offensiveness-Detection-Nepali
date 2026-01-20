from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nepali Profanity & Offensiveness Detection API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    
    # Model Configuration - Local paths
    ARTIFACTS_DIR: str = "artifacts"
    MODEL_PROFANITY_PATH: str = "artifacts/profanity_model.pkl"
    MODEL_OFFENSIVENESS_PATH: str = "artifacts/offensiveness_model.pkl"
    
    # Model Configuration - Remote URLs (optional)
    # If set, models will be downloaded at startup and cached to ARTIFACTS_DIR
    MODEL_PROFANITY_URL: Optional[str] = None
    MODEL_OFFENSIVENESS_URL: Optional[str] = None
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 20  # Max requests per window
    RATE_LIMIT_WINDOW: int = 60    # Window size in seconds

    class Config:
        env_file = ".env"

settings = Settings()
