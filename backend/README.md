# Nepali Profanity & Offensiveness Detection - Backend

A FastAPI backend for detecting profanity and offensiveness in Nepali text using LSTM models.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the backend
python run_backend.py
```

The server will start at `http://localhost:8000`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/models` | GET | List available models |
| `/predict` | POST | Predict profanity/offensiveness |
| `/predict/gender` | POST | Gender prediction (BERT model) |
| `/analyze` | POST | Full analysis with all models |
| `/api/docs` | GET | Swagger documentation |

## Example Request

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "तपाईंको काम राम्रो छ", "model_type": "profane_binary"}'
```

## Available Models

- **profane_binary** - Binary profanity detection (recommended)
- **offensive_binary** - Binary offensiveness detection
- **multilabel** - 3-class classification (Non-Offensive, Offensive, Profane)
- **multi_output** - BERT-based model with gender prediction

## Model Files

Place model files in the `pkl/` directory:
- `Binomial_LSTM_Profane.h5` + `.pkl`
- `Binomial_LSTM_Offensive.keras` + `.pkl`
- `Mutlilabel_LSTM_Offensive_Profane.h5` + `.pkl`
- `Multi_Model_Multi_Output.h5` + `.pkl`
