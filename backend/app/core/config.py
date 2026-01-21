from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path

class Settings(BaseSettings):
    PROJECT_NAME: str = "NepSense"
    VERSION: str = "1.0.0"
    
    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    
    # Model Configuration - Local paths (LSTM models from research paper)
    # Model Configuration - Local paths (LSTM models from research paper)
    # dynamically find the backend directory (parent of app)
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    MODEL_PROFANITY_PATH: str = str(BASE_DIR / "pkl" / "Binomial_LSTM_Profane.pkl")
    MODEL_OFFENSIVENESS_PATH: str = str(BASE_DIR / "pkl" / "Binomial_LSTM_Offensive.pkl")
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60

    class Config:
        env_file = ".env"

settings = Settings()
