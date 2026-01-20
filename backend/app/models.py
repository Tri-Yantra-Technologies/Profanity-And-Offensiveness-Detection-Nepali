import logging
import time
import os
import joblib
from functools import lru_cache
from typing import Tuple, Dict

# Setup logging
logger = logging.getLogger(__name__)

class ModelManager:
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

    def load_models(self):
        """
        Attempts to load models from disk. If not found, falls back to mock mode.
        """
        # Paths would come from config, but hardcoding for simplicity here based on standard layout
        profanity_path = "artifacts/profanity_model.pkl"
        offensiveness_path = "artifacts/offensiveness_model.pkl"
        
        try:
            if os.path.exists(profanity_path) and os.path.exists(offensiveness_path):
                logger.info("Loading models from disk...")
                self.profanity_model = joblib.load(profanity_path)
                self.offensiveness_model = joblib.load(offensiveness_path)
                self.is_mock = False
                logger.info("Models loaded successfully.")
            else:
                logger.warning(f"Model artifacts not found at {profanity_path} or {offensiveness_path}. Using MOCK models.")
                self.is_mock = True
        except Exception as e:
            logger.error(f"Error loading models: {e}. Fallback to MOCK mode.")
            self.is_mock = True

    def predict(self, text: str) -> Dict[str, Dict]:
        """
        Returns dictionary with 'profanity' and 'offensiveness' predictions.
        Each contains {'label': str, 'confidence': float}.
        """
        start_time = time.time()
        
        if self.is_mock:
            # Simple mock logic based on keywords for demonstration
            # In production, this would be model.predict(text)
            import random
            
            # Deterministic mock based on hash for consistent demo feeling
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
            
            result = {
                "profanity": {"label": p_label, "confidence": round(p_score, 4)},
                "offensiveness": {"label": o_label, "confidence": round(o_score, 4)}
            }
        else:
            # REAL MODEL INFERENCE IMPLEMENTATION
            # This depends entirely on the model artifact's signature.
            # Assuming scikit-learn style .predict_proba()
            
            try:
                # Profanity
                # Adjust this if your model output format differs (e.g., [0,1] vs classes)
                p_proba = self.profanity_model.predict_proba([text])[0]
                p_idx = p_proba.argmax()
                p_label = self.profanity_model.classes_[p_idx]
                p_conf = p_proba[p_idx]
                
                # Offensiveness
                o_proba = self.offensiveness_model.predict_proba([text])[0]
                o_idx = o_proba.argmax()
                o_label = self.offensiveness_model.classes_[o_idx]
                o_conf = o_proba[o_idx]
                
                result = {
                    "profanity": {"label": str(p_label), "confidence": float(p_conf)},
                    "offensiveness": {"label": str(o_label), "confidence": float(o_conf)}
                }
            except Exception as e:
                logger.error(f"Inference error: {e}")
                # Fallback to error/safe defaults
                result = {
                    "profanity": {"label": "Error", "confidence": 0.0},
                    "offensiveness": {"label": "Error", "confidence": 0.0}
                }

        return result

# Global singleton
model_manager = ModelManager()
