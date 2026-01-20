# Profanity & Offensiveness Detection in Nepali (Web Demo)

A production-ready web demo for the research paper **"Profanity and Offensiveness Detection in Nepali Language Using Bi-directional LSTM Models"** (ICON 2024).

**Paper:** [ACL Anthology](https://aclanthology.org/2024.icon-1.60)

## Features

- **Dual Classification:** Detects both profanity and offensiveness in Nepali text
- **Confidence Scores:** Returns prediction confidence for each classification
- **Romanized & Devanagari:** Supports both Nepali script styles
- **Rate Limited API:** Built-in protection against abuse
- **Mock Mode:** Runs with demo predictions when model artifacts aren't available

## Project Structure

```
├── backend/           # FastAPI application (Python 3.11)
│   ├── app/
│   │   ├── main.py           # API endpoints
│   │   ├── models.py         # ML model manager
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── rate_limit.py     # Rate limiting
│   │   └── core/config.py    # Configuration
│   ├── artifacts/            # Place model .pkl files here
│   ├── Dockerfile
│   └── requirements.txt
│
└── frontend/          # Next.js 14 application
    ├── src/app/              # Pages (landing, demo, examples, api)
    ├── src/components/       # UI components
    └── src/lib/api.ts        # API client
```

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 20+
- npm

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python run_backend.py
```

Backend will run at `http://localhost:8000`
- API Docs: http://localhost:8000/api/docs

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend will run at `http://localhost:3000`

## Using Real Models

By default, the system uses **mock predictions**. To use your trained models:

1. Place your model files in `backend/artifacts/`:
   - `profanity_model.pkl`
   - `offensiveness_model.pkl`

2. Ensure your models have sklearn-compatible interface:
   ```python
   model.predict_proba([text])  # Returns probabilities
   model.classes_               # Returns class labels
   ```

3. If your models have different interface, modify `backend/app/models.py` `_predict_real()` method.

### Remote Model Loading

For production, you can host models on S3/HuggingFace and set:

```bash
MODEL_PROFANITY_URL=https://huggingface.co/your-repo/resolve/main/profanity_model.pkl
MODEL_OFFENSIVENESS_URL=https://huggingface.co/your-repo/resolve/main/offensiveness_model.pkl
```

Models will be downloaded at startup and cached locally.

## Deployment

### Backend (Render/Railway)

1. Create a new Web Service and connect your repo
2. Set root directory to `backend`
3. Use Docker deployment with the provided `Dockerfile`
4. Set environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_ORIGIN` | Your frontend URL (for CORS) | `https://myapp.vercel.app` |
| `MODEL_PROFANITY_URL` | (Optional) Remote model URL | Hugging Face URL |
| `MODEL_OFFENSIVENESS_URL` | (Optional) Remote model URL | Hugging Face URL |
| `RATE_LIMIT_REQUESTS` | Max requests per window | `20` |
| `RATE_LIMIT_WINDOW` | Window in seconds | `60` |

### Frontend (Vercel)

1. Import your repo to Vercel
2. Set root directory to `frontend`
3. Set environment variable:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Your backend URL | `https://mybackend.onrender.com` |

4. Deploy!

### CORS Configuration

The backend CORS is configured via `FRONTEND_ORIGIN` env var. Make sure it matches your deployed frontend URL exactly (including `https://`).

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/meta` | GET | Model version & paper info |
| `/predict` | POST | Analyze text (rate limited) |

### Example Request

```bash
curl -X POST "https://your-api.com/predict" \
  -H "Content-Type: application/json" \
  -d '{"text": "तपाईंको काम राम्रो छ"}'
```

### Example Response

```json
{
  "profanity": {"label": "Not Profane", "confidence": 0.98},
  "offensiveness": {"label": "Not Offensive", "confidence": 0.95},
  "latency_ms": 45.2
}
```

## Tech Stack

- **Backend:** FastAPI, Python 3.11, joblib, scikit-learn
- **Frontend:** Next.js 14, React, Tailwind CSS, shadcn/ui
- **Fonts:** Inter, Noto Sans Devanagari

## License

Open Source - MIT License
