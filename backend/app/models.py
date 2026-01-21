import logging
import os
from typing import Dict, Optional, Tuple, Any
from pathlib import Path
from enum import Enum

import joblib
import numpy as np

logger = logging.getLogger(__name__)

# Try to import for Transliteration
try:
    from ai4bharat.transliteration import XlitEngine
    from langdetect import detect, LangDetectException
    XLIT_AVAILABLE = True
except ImportError:
    XLIT_AVAILABLE = False
    logger.warning("XlitEngine/LangDetect not available. Transliteration will be disabled.")

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Try to import Keras/TensorFlow
try:
    import tensorflow as tf
    from keras.models import load_model
    from keras.preprocessing.sequence import pad_sequences
    KERAS_AVAILABLE = True
except ImportError:
    KERAS_AVAILABLE = False
    logger.warning("Keras not available. Will use mock predictions.")

# Try to import BERT for Multi-Output model
# Try to import BERT for Multi-Output model
try:
    import torch
    from transformers import BertTokenizer, BertModel
    from nltk.util import ngrams
    BERT_AVAILABLE = True
except ImportError:
    BERT_AVAILABLE = False
    logger.warning("BERT/Transformers not available. Multi-Output model will be disabled.")


class ModelType(str, Enum):
    """Available model types for prediction."""
    PROFANE_BINARY = "profane_binary"  # Binomial LSTM for profanity only
    OFFENSIVE_BINARY = "offensive_binary"  # Binomial LSTM for offensiveness only
    MULTILABEL = "multilabel"  # Multilabel for both profanity and offensiveness
    MULTI_OUTPUT = "multi_output"  # Multi-Output BERT model (gender + profanity)


import threading

class ModelManager:
    """
    Singleton manager for LSTM models.
    Loads models once at startup and provides prediction interface.
    Supports multiple model types that users can choose from.
    """
    _instance = None
    MAX_SEQUENCE_LENGTH = 500
    
    # Label mappings from original notebook
    PROFANITY_CLASSES = {0: 'Non-Offensive', 1: 'Offensive', 2: 'Profane'}
    BINOMIAL_PROFANE_CLASSES = {0: 'Non-Profane', 1: 'Profane'}
    BINOMIAL_OFFENSIVE_CLASSES = {0: 'Non-Offensive', 1: 'Offensive'}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        # Model storage
        self.models: Dict[ModelType, Any] = {}
        self.tokenizers: Dict[ModelType, Any] = {}
        self.available_models: list = []
        
        # BERT components for Multi-Output model
        self.bert_tokenizer = None
        self.bert_model = None
        self.device = None
        self.bert_loading = False
        
        # Transliteration engine
        self.xlit_engine = None
        if XLIT_AVAILABLE:
            try:
                # Initialize XlitEngine in background if safe, but for now kept sync as it's not too huge
                logger.info("Initializing XlitEngine...")
                self.xlit_engine = XlitEngine(["ne"], beam_width=10, src_script_type="en")
                logger.info("✓ Transliteration engine loaded")
            except Exception as e:
                logger.warning(f"Failed to load transliteration engine: {e}")
        
        # Base path for models
        self.base_path = Path(__file__).resolve().parent.parent / "pkl"
        
        # Model configurations
        self.model_configs = {
            ModelType.PROFANE_BINARY: {
                "model_file": "Binomial_LSTM_Profane.h5",
                "tokenizer_file": "Binomial_LSTM_Profane.pkl",
                "name": "Profanity Detector (Binary)",
                "description": "Detects profane vs non-profane text"
            },
            ModelType.OFFENSIVE_BINARY: {
                "model_file": "Binomial_LSTM_Offensive.keras",
                "tokenizer_file": "Binomial_LSTM_Offensive.pkl",
                "name": "Offensiveness Detector (Binary)",
                "description": "Detects offensive vs non-offensive text"
            },
            ModelType.MULTILABEL: {
                "model_file": "Mutlilabel_LSTM_Offensive_Profane.h5",
                "tokenizer_file": "Mutlilabel_LSTM_Offensive_Profane.pkl",
                "name": "Multilabel Detector",
                "description": "Classifies text as Non-Offensive, Offensive, or Profane"
            },
            ModelType.MULTI_OUTPUT: {
                "model_file": "Multi_Model_Multi_Output.h5",
                "tokenizer_file": "Multi_Model_Multi_Output.pkl",
                "name": "Multi-Output BERT Model",
                "description": "Predicts gender and profanity/offensiveness using BERT embeddings"
            },
        }
        
        self.load_models()
        self._initialized = True

    def load_bert_background(self):
        """Load BERT model and tokenizer in background."""
        if not BERT_AVAILABLE:
            return
        
        self.bert_loading = True
        try:
            logger.info("Loading BERT model (bert-base-multilingual-cased)... This may take a while.")
            self.bert_tokenizer = BertTokenizer.from_pretrained("bert-base-multilingual-cased")
            self.bert_model = BertModel.from_pretrained("bert-base-multilingual-cased")
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.bert_model.to(self.device)
            self.bert_model.eval()
            
            # Now load the Keras Multi-Output model since we have BERT
            self._load_single_model(ModelType.MULTI_OUTPUT)
            
            logger.info(f"✓ BERT model loaded on {self.device}")
        except Exception as e:
            logger.error(f"Failed to load BERT: {e}")
        finally:
            self.bert_loading = False

    def _load_single_model(self, model_type: ModelType):
        """Helper to load a single Keras model."""
        try:
            config = self.model_configs[model_type]
            model_path = self.base_path / config["model_file"]
            tokenizer_path = self.base_path / config["tokenizer_file"]
            
            if not model_path.exists() or not tokenizer_path.exists():
                return

            logger.info(f"Loading {model_type.value} model...")
            self.models[model_type] = load_model(str(model_path))
            self.tokenizers[model_type] = joblib.load(str(tokenizer_path))
            
            # Add to available models if not already there
            if not any(m["type"] == model_type.value for m in self.available_models):
                self.available_models.append({
                    "type": model_type.value,
                    "name": config["name"],
                    "description": config["description"]
                })
            
            logger.info(f"✓ {model_type.value} loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading {model_type.value}: {e}")

    def load_models(self):
        """Load all available LSTM models from disk."""
        if not KERAS_AVAILABLE:
            logger.warning("Keras not available. Using mock predictions.")
            self.is_mock = True
            return
        
        # Load standard LSTM models first (fast)
        for model_type in [ModelType.PROFANE_BINARY, ModelType.OFFENSIVE_BINARY, ModelType.MULTILABEL]:
            self._load_single_model(model_type)
        
        # Start BERT loading in background
        if BERT_AVAILABLE:
            threading.Thread(target=self.load_bert_background, daemon=True).start()
        
        if not self.models and not BERT_AVAILABLE:
            logger.error("No models loaded! Please check model files.")

    def get_available_models(self) -> list:
        """Return list of available model types."""
        return self.available_models

    def preprocess_text(self, text: str) -> str:
        """
        Preprocess text:
        1. Transliterate Romanized text to Nepali if needed
        2. Strip whitespace
        """
        processed_text = text.strip()
        
        # Try to transliterate if not already Nepali
        if self.xlit_engine and processed_text:
            try:
                # Check if text is not Nepali
                detected_lang = detect(processed_text)
                if detected_lang != "ne":
                    transliterated = self.xlit_engine.translit_sentence(processed_text)
                    if "ne" in transliterated:
                        processed_text = transliterated["ne"]
                        logger.debug(f"Transliterated '{text}' -> '{processed_text}'")
            except LangDetectException:
                pass
            except Exception as e:
                logger.warning(f"Transliteration error: {e}")
        
        return processed_text

    def get_ngram_embeddings(self, text: str, n: int = 2) -> np.ndarray:
        """Generate embeddings for n-grams of the given text using BERT."""
        if not self.bert_tokenizer or not self.bert_model:
            raise ValueError("BERT model not loaded")
        
        tokenized_text = self.bert_tokenizer.encode(text, add_special_tokens=True)
        text_ngrams = list(ngrams(tokenized_text, n))
        embeddings = []

        for gram in text_ngrams:
            input_ids = torch.tensor(gram).unsqueeze(0).to(self.device)
            with torch.no_grad():
                outputs = self.bert_model(input_ids)
            last_hidden_states = outputs.last_hidden_state
            sentence_embedding = torch.mean(last_hidden_states, dim=1).squeeze().cpu().numpy()
            embeddings.append(sentence_embedding)

        return np.array(embeddings) if embeddings else np.zeros((1, 768))

    def predict(self, text: str, model_type: Optional[str] = None) -> Dict[str, Dict]:
        """
        Returns dictionary with 'profanity' and 'offensiveness' predictions.
        Each contains {'label': str, 'confidence': float}.
        """
        # Preprocess text
        processed_text = self.preprocess_text(text)
        
        # Determine which model to use
        if model_type:
            try:
                selected_type = ModelType(model_type)
            except ValueError:
                logger.warning(f"Invalid model type: {model_type}. Using default.")
                selected_type = self._get_default_model_type()
        else:
            selected_type = self._get_default_model_type()
        
        if not selected_type:
             raise ValueError("No prediction models are loaded. Please check backend logs.")
             
        if selected_type not in self.models:
             raise ValueError(f"Model '{selected_type}' is not loaded/available.")
        
        return self._predict_real(processed_text, selected_type)
    
    def _get_default_model_type(self) -> ModelType:
        """Get the default model type (prefer profane_binary since it works correctly)."""
        # Priority: profane_binary > offensive_binary > multilabel > multi_output
        for mt in [ModelType.PROFANE_BINARY, ModelType.OFFENSIVE_BINARY, ModelType.MULTILABEL, ModelType.MULTI_OUTPUT]:
            if mt in self.models:
                return mt
        return None
    
    def _predict_real(self, text: str, model_type: ModelType) -> Dict[str, Dict]:
        """
        Real model inference using the appropriate model.
        All models use padding='post' and maxlen=500 as per original code.
        """
        # Let exceptions bubble up to be displayed to user
        model = self.models[model_type]
        tokenizer = self.tokenizers[model_type]
        
        if model_type == ModelType.PROFANE_BINARY:
            return self._predict_binomial_profane(text, model, tokenizer)
        
        elif model_type == ModelType.OFFENSIVE_BINARY:
            return self._predict_binomial_offensive(text, model, tokenizer)
        
        elif model_type == ModelType.MULTILABEL:
            return self._predict_multilabel(text, model, tokenizer)
        
        elif model_type == ModelType.MULTI_OUTPUT:
            return self._predict_multi_output(text, model, tokenizer)
        
        else:
            raise ValueError(f"Unknown model type: {model_type}")
    
    def _predict_binomial_profane(self, text: str, model, tokenizer) -> Dict[str, Dict]:
        """Predict using Binomial LSTM Profanity model."""
        sequences = tokenizer.texts_to_sequences([text])
        padded = pad_sequences(sequences, maxlen=self.MAX_SEQUENCE_LENGTH, padding='post')
        prediction = model.predict(padded, verbose=0)[0]
        
        predicted_class = int(np.argmax(prediction))
        confidence = float(prediction[predicted_class])
        is_profane = predicted_class == 1
        
        return {
            "profanity": {
                "label": "Profane" if is_profane else "Non-Profane",
                "confidence": round(confidence, 4)
            },
            "offensiveness": {
                "label": "N/A (Use Offensive Binary or Multilabel Model)",
                "confidence": 0.0
            }
        }
    
    def _predict_binomial_offensive(self, text: str, model, tokenizer) -> Dict[str, Dict]:
        """Predict using Binomial LSTM Offensiveness model."""
        sequences = tokenizer.texts_to_sequences([text])
        padded = pad_sequences(sequences, maxlen=self.MAX_SEQUENCE_LENGTH, padding='post')
        prediction = model.predict(padded, verbose=0)[0]
        
        predicted_class = int(np.argmax(prediction))
        confidence = float(prediction[predicted_class])
        is_offensive = predicted_class == 1
        
        return {
            "profanity": {
                "label": "N/A (Use Profane Binary or Multilabel Model)",
                "confidence": 0.0
            },
            "offensiveness": {
                "label": "Offensive" if is_offensive else "Non-Offensive",
                "confidence": round(confidence, 4)
            }
        }
    
    def _predict_multilabel(self, text: str, model, tokenizer) -> Dict[str, Dict]:
        """Predict using Multilabel LSTM model."""
        sequences = tokenizer.texts_to_sequences([text])
        padded = pad_sequences(sequences, maxlen=self.MAX_SEQUENCE_LENGTH, padding='post')
        prediction = model.predict(padded, verbose=0)[0]
        
        # 3 classes: {0: 'Non-Offensive', 1: 'Offensive', 2: 'Profane'}
        predicted_class = int(np.argmax(prediction))
        confidence = float(prediction[predicted_class])
        class_label = self.PROFANITY_CLASSES[predicted_class]
        
        is_profane = predicted_class == 2
        is_offensive = predicted_class == 1
        is_clean = predicted_class == 0
        
        return {
            "profanity": {
                "label": "Profane" if is_profane else "Non-Profane",
                "confidence": round(float(prediction[2]) if is_profane else 1 - float(prediction[2]), 4)
            },
            "offensiveness": {
                "label": "Offensive" if is_offensive else ("Non-Offensive" if is_clean else "Profane (includes offensive)"),
                "confidence": round(float(prediction[1]) if is_offensive else 1 - float(prediction[1]), 4)
            },
            "_raw": {
                "predicted_class": predicted_class,
                "label": class_label,
                "confidence": round(confidence, 4),
                "probabilities": {
                    "non_offensive": round(float(prediction[0]), 4),
                    "offensive": round(float(prediction[1]), 4),
                    "profane": round(float(prediction[2]), 4)
                }
            }
        }
    
    def _predict_multi_output(self, text: str, model, tokenizer) -> Dict[str, Dict]:
        """Predict using Multi-Output BERT model (gender + profanity)."""
        # Generate BERT n-gram embeddings
        embeddings = self.get_ngram_embeddings(text, n=2)
        
        # Pad embeddings to model's expected input length
        max_len = model.input_shape[1]
        padded_embeddings = pad_sequences([embeddings], maxlen=max_len, padding='post', dtype='float32')
        
        # Predict
        predictions = model.predict(padded_embeddings, verbose=0)
        
        # predictions[0] = gender, predictions[1] = profanity (3 classes)
        gender_pred = predictions[0]
        profanity_pred = predictions[1]
        
        # Robust scalar access for (1, 1) or (1,) shape
        try:
            gender_prob = float(gender_pred[0])
        except (ValueError, TypeError):
             gender_prob = float(gender_pred[0][0])
             
        gender_idx = 1 if gender_prob > 0.5 else 0
        gender = 'Male' if gender_idx == 1 else 'Female'
        
        profanity_class = int(np.argmax(profanity_pred, axis=1)[0])
        profanity_confidence = float(profanity_pred[0][profanity_class])
        profanity_label = self.PROFANITY_CLASSES[profanity_class]
        
        is_profane = profanity_class == 2
        is_offensive = profanity_class == 1
        
        return {
            "profanity": {
                "label": "Profane" if is_profane else "Non-Profane",
                "confidence": round(float(profanity_pred[0][2]) if is_profane else 1 - float(profanity_pred[0][2]), 4)
            },
            "offensiveness": {
                "label": "Offensive" if is_offensive else "Non-Offensive",
                "confidence": round(float(profanity_pred[0][1]) if is_offensive else 1 - float(profanity_pred[0][1]), 4)
            },
            "gender": {
                "label": gender,
                "confidence": round(float(gender_prob) if gender_idx == 1 else 1 - float(gender_prob), 4)
            },
            "_raw": {
                "predicted_class": profanity_class,
                "label": profanity_label,
                "confidence": round(profanity_confidence, 4)
            }
        }


# Global singleton
model_manager = ModelManager()
