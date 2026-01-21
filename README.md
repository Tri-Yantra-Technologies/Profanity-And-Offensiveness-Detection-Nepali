# Nepali Profanity & Offensiveness Detection

A full-stack web application for detecting profanity and offensiveness in Nepali text (Romanized & Devanagari) using Bi-directional LSTM models. Based on research published at **ICON 2024**.

![UI Preview](https://github.com/user-attachments/assets/placeholder.png)

## 🚀 Features
- **Dual Classification**: Simultaneously detects Profanity (Profane/Not Profane) and Offensiveness (Offensive/Not Offensive).
- **Hybrid Input Support**: Works with both Devanagari (e.g., "मुला") and Romanized Nepali (e.g., "Mula").
- **State-of-the-Art Models**: Powered by Bi-LSTM deep learning architectures.
- **Premium UI**: Glassmorphism design, Three.js animations, and interactive visualizations.
- **Fast API**: High-performance FastAPI backend with caching and rate limiting.

## 🛠 Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion, Three.js
- **Backend**: FastAPI, TensorFlow/Keras, Joblib
- **Models**: Bi-directional LSTMs with Keras Tokenizers

## 🏁 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/nepali-profanity-detection.git
cd nepali-profanity-detection
```

### 2. Backend Setup
The backend runs the AI models and exposes the REST API.

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies (including TensorFlow)
pip install -r requirements.txt

# Run the backend server
python run_backend.py
```
*The backend will start at `http://localhost:8000`*

### 3. Frontend Setup
The frontend is the user interface.

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
*The frontend will start at `http://localhost:3000` (or 3001/3002 if 3000 is busy)*

## 🧠 Model Information
This project uses custom-trained Bi-LSTM models. The artifacts are located in `backend/pkl/`:
- `Binomial_LSTM_Profane.pkl`: Profanity classifier
- `Binomial_LSTM_Offensive.pkl`: Offensiveness classifier
- `Mutlilabel_LSTM_Offensive_Profane.pkl`: Combined model/tokenizer

## 📚 API Documentation
Once the backend is running, full API docs (Swagger UI) are available at:
`http://localhost:8000/docs`

### Key Endpoints
- `POST /predict`: Analyze text
- `GET /health`: System status
- `GET /meta`: Model metadata

## 📄 Research
This work is based on the paper **"Detecting Profanity and Offensiveness in Nepali Text"** published at ICON 2024.
[Read the Paper (ACL Anthology)](https://aclanthology.org/2024.icon-1.60)

## ⚖️ License
MIT License - Free for research and educational use.
