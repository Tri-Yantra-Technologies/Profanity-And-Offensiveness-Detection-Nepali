import logging
import time
import os
import joblib
import httpx
from pathlib import Path
from typing import Dict, Optional

from app.core.config import settings

# Setup logging
logger = logging.getLogger(__name__)


def download_file(url: str, dest_path: str) -> bool:
    """
    Download a file from URL to destination path.
    Returns True if successful, False otherwise.
    """
    try:
        logger.info(f"Downloading model from {url}...")
        
        # Create directory if it doesn't exist
        Path(dest_path).parent.mkdir(parents=True, exist_ok=True)
        
        with httpx.Client(timeout=300.0, follow_redirects=True) as client:
            with client.stream("GET", url) as response:
                response.raise_for_status()
                total_size = int(response.headers.get("content-length", 0))
                
                with open(dest_path, "wb") as f:
                    downloaded = 0
                    for chunk in response.iter_bytes(chunk_size=8192):
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total_size > 0:
                            percent = (downloaded / total_size) * 100
                            if downloaded % (1024 * 1024) < 8192:  # Log every ~1MB
                                logger.info(f"Download progress: {percent:.1f}%")
        
        logger.info(f"Successfully downloaded to {dest_path}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to download {url}: {e}")
        return False


class ModelManager:
    """
    Singleton manager for ML models.
    Loads models once at startup and provides prediction interface.
    
    Supports two modes:
    A) Local artifacts: Load from ./artifacts/*.pkl
    B) Remote download: If MODEL_*_URL env vars set, download on startup and cache
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        self.profanity_model = None
        self.offensiveness_model = None
        self.is_mock = True  # Default to mock if files missing
        self.load_models()
        self._initialized = True

    def _ensure_model_available(self, local_path: str, remote_url: Optional[str]) -> bool:
        """
        Ensure model is available at local_path.
        Downloads from remote_url if not present and URL is configured.
        Returns True if model is available.
        """
        if os.path.exists(local_path):
            logger.info(f"Model found at {local_path}")
            return True
        
        if remote_url:
            logger.info(f"Model not found locally, attempting remote download...")
            return download_file(remote_url, local_path)
        
        return False

    def load_models(self):
        """
        Attempts to load models from disk. 
        If not found and URLs configured, downloads first.
        Falls back to mock mode if loading fails.
        """
        profanity_path = settings.MODEL_PROFANITY_PATH
        offensiveness_path = settings.MODEL_OFFENSIVENESS_PATH
        
        try:
            # Ensure models are available (download if needed)
            profanity_available = self._ensure_model_available(
                profanity_path, 
                settings.MODEL_PROFANITY_URL
            )
            offensiveness_available = self._ensure_model_available(
                offensiveness_path, 
                settings.MODEL_OFFENSIVENESS_URL
            )
            
            if profanity_available and offensiveness_available:
                logger.info("Loading models from disk...")
                self.profanity_model = joblib.load(profanity_path)
                self.offensiveness_model = joblib.load(offensiveness_path)
                self.is_mock = False
                logger.info("Models loaded successfully.")
            else:
                logger.warning(
                    f"Model artifacts not found. "
                    f"Profanity: {profanity_path} ({profanity_available}), "
                    f"Offensiveness: {offensiveness_path} ({offensiveness_available}). "
                    f"Using MOCK models."
                )
                self.is_mock = True
                
        except Exception as e:
            logger.error(f"Error loading models: {e}. Fallback to MOCK mode.")
            self.is_mock = True

    def predict(self, text: str) -> Dict[str, Dict]:
        """
        Returns dictionary with 'profanity' and 'offensiveness' predictions.
        Each contains {'label': str, 'confidence': float}.
        """
        if self.is_mock:
            return self._predict_mock(text)
        else:
            return self._predict_real(text)
    
    def _predict_mock(self, text: str) -> Dict[str, Dict]:
        """
        Mock prediction based on basic keyword heuristics.
        Used when real model artifacts are not available.
        """
        import random
        
        # Deterministic mock based on hash for consistent demo
        seed = sum(ord(c) for c in text)
        random.seed(seed)
        
        # Mock profanity
        p_conf = 0.5 + (random.random() * 0.5)
        is_profane = "मुला" in text or "कुकुर" in text or random.random() > 0.8
        p_label = "Profane" if is_profane else "Not Profane"
        p_score = p_conf if is_profane else 1.0 - p_conf
        
        # Mock offensiveness
        o_conf = 0.5 + (random.random() * 0.5)
        is_offensive = is_profane or random.random() > 0.7
        o_label = "Offensive" if is_offensive else "Not Offensive"
        o_score = o_conf if is_offensive else 1.0 - o_conf
        
        return {
            "profanity": {"label": p_label, "confidence": round(p_score, 4)},
            "offensiveness": {"label": o_label, "confidence": round(o_score, 4)}
        }
    
    def _predict_real(self, text: str) -> Dict[str, Dict]:
        """
        Real model inference.
        
        IMPORTANT: Adjust this method to match your model's interface.
        Currently assumes sklearn-style predict_proba() and classes_ attributes.
        """
        try:
            # Profanity prediction
            # Adjust this if your model output format differs
            p_proba = self.profanity_model.predict_proba([text])[0]
            p_idx = p_proba.argmax()
            p_label = self.profanity_model.classes_[p_idx]
            p_conf = p_proba[p_idx]
            
            # Offensiveness prediction
            o_proba = self.offensiveness_model.predict_proba([text])[0]
            o_idx = o_proba.argmax()
            o_label = self.offensiveness_model.classes_[o_idx]
            o_conf = o_proba[o_idx]
            
            return {
                "profanity": {"label": str(p_label), "confidence": float(p_conf)},
                "offensiveness": {"label": str(o_label), "confidence": float(o_conf)}
            }
            
        except Exception as e:
            logger.error(f"Inference error: {e}")
            # Fallback to error/safe defaults
            return {
                "profanity": {"label": "Error", "confidence": 0.0},
                "offensiveness": {"label": "Error", "confidence": 0.0}
            }


# Global singleton
model_manager = ModelManager()
