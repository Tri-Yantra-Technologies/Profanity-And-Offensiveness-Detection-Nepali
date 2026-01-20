from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nepali Profanity & Offensiveness Detection API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    
    # Model Configuration
    # If MODEL_URLS are set, config should support downloading them.
    # For now, we will assume local artifacts or mocks.
    MODEL_PROFANITY_PATH: str = "artifacts/profanity_model.pkl"
    MODEL_OFFENSIVENESS_PATH: str = "artifacts/offensiveness_model.pkl"

    class Config:
        env_file = ".env"

settings = Settings()
