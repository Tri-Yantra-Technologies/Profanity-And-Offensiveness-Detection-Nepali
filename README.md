# NepSense - Profanity & Offensiveness Detection for Nepali Language 🇳🇵🛡️

[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-ICON%202024%20Published-brightgreen.svg)](https://aclanthology.org/2024.icon-1.60)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)](https://github.com/Tri-Yantra-Technologies/Profanity-And-Offensiveness-Detection-Nepali)

<p align="center">
  <img src="image.png" alt="NepSense Demo Interface" width="100%">
</p>

---

## 📄 Abstract

**NepSense** is a pioneering NLP tool designed to detect **profanity**, **offensiveness**, and **speaker gender** in Nepali text. By synthesizing advanced Deep Learning with Nepali linguistic context, NepSense bridges the critical gap between users seeking safe online spaces and platforms needing content moderation.

Offensive and profane content has been on the rise in Nepali Social Media, which is very disturbing to users. This is partly due to the absence of proper tools and mechanisms for the Nepali language to deal with profanity and offensive texts. In this work, we develop a **Bi-LSTM (Bidirectional Long Short Term Memory)** based model for the classification of Profane and Offensive comments.

Leveraging **Multilingual BERT embeddings** and custom vocabulary embeddings, NepSense captures contextual meaning beyond simple keyword matching. While previous related studies in the Nepali language are more focused on sentiment and offensiveness detection only, our study explores **profanity and offensiveness detection as two distinct tasks**.

> 📖 Based on peer-reviewed research published at **ICON 2024** (21st International Conference on Natural Language Processing)
> 
> 📄 **[Read the Full Paper on ACL Anthology →](https://aclanthology.org/2024.icon-1.60)**

---

## 🚀 Key Features

### 1. 🛡️ Triple Detection System
- **Profanity Detection**: Identifies vulgar, obscene, and swear words in Nepali text.
- **Offensiveness Detection**: Detects disrespectful, insulting, or harmful content.
- **Gender Identification**: Predicts the gender of the speaker based on text patterns.

### 2. 🔤 Hybrid Input Support
- **Devanagari Script**: Native Nepali text (नेपाली)
- **Romanized Nepali**: Latin script transliteration (Nepali → automatically converted)
- **Automatic Transliteration**: AI4Bharat XlitEngine converts Romanized input to Devanagari

### 3. 🧬 State-of-the-Art Architecture
- **Bi-LSTM Models**: Capture bidirectional context for accurate classification
- **BERT Embeddings**: Multilingual BERT (`bert-base-multilingual-cased`) for semantic understanding
- **Multi-Output Model**: Single model predicting both profanity levels and speaker gender

### 4. ⚡ Production-Ready API
- **FastAPI Backend**: High-performance async API with automatic docs
- **Rate Limiting**: Prevent abuse with configurable request limits
- **Feedback Loop**: Users can submit corrections to improve models

### 5. 🎨 Premium Web Interface
- **Three.js Animations**: Immersive 3D background effects
- **Glassmorphism Design**: Modern, elegant UI with blur effects
- **Framer Motion**: Smooth micro-animations and transitions

---

## 🛠 Technology Stack

### Frontend (Client-Side)
| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (Strict type safety) |
| **UI Library** | React 19 |
| **Styling** | TailwindCSS v4 |
| **Animations** | Framer Motion, Three.js |
| **Icons** | Lucide React |
| **HTTP Client** | Axios |

### Backend (Server-Side)
| Category | Technology |
|----------|------------|
| **Framework** | FastAPI (Python 3.9+) |
| **Server** | Uvicorn (ASGI) |
| **Validation** | Pydantic v2 |
| **Serialization** | Joblib |

### Artificial Intelligence & ML
| Category | Technology |
|----------|------------|
| **Deep Learning** | TensorFlow/Keras |
| **Transformers** | PyTorch + HuggingFace Transformers |
| **BERT Model** | `bert-base-multilingual-cased` |
| **Transliteration** | AI4Bharat XlitEngine |
| **Language Detection** | langdetect |
| **Data Processing** | NumPy, scikit-learn |

---

## 📂 Project Structure

```
Profanity-And-Offensiveness-Detection-Nepali/
├── backend/                    # Python FastAPI Application
│   ├── app/                    # Core Application
│   │   ├── core/               # Configuration & Settings
│   │   ├── main.py             # FastAPI App & Routes
│   │   ├── models.py           # Model Manager & Inference
│   │   ├── schemas.py          # Pydantic Models
│   │   └── rate_limit.py       # Rate Limiting Logic
│   ├── pkl/                    # Trained Models & Tokenizers
│   │   ├── Binomial_LSTM_Profane.h5
│   │   ├── Binomial_LSTM_Offensive.keras
│   │   ├── Mutlilabel_LSTM_Offensive_Profane.h5
│   │   └── Multi_Model_Multi_Output.h5
│   ├── run_backend.py          # Server Entry Point
│   ├── requirements.txt        # Python Dependencies
│   └── Dockerfile              # Container Configuration
├── frontend/                   # Next.js TypeScript Application
│   ├── src/
│   │   ├── app/                # App Router Pages
│   │   │   ├── page.tsx        # Landing Page
│   │   │   ├── demo/           # Demo Interface
│   │   │   ├── examples/       # Example Texts
│   │   │   └── authors/        # Research Team
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── navbar.tsx
│   │   │   ├── three-background.tsx
│   │   │   └── ui/             # Design System
│   │   └── lib/                # Utilities
│   ├── package.json            # Node Dependencies
│   └── next.config.ts          # Next.js Configuration
├── image.png                   # Demo Screenshot
└── README.md                   # You are here
```

---

## 🧠 Model Information

### Available Models

| Model | File | Size | Accuracy | Description |
|-------|------|------|----------|-------------|
| **Profane Binary** | `Binomial_LSTM_Profane.h5` | 22 MB | 87.8% | Binary: Profane vs Non-Profane |
| **Offensive Binary** | `Binomial_LSTM_Offensive.keras` | 8 MB | 85%+ | Binary: Offensive vs Non-Offensive |
| **Multilabel** | `Mutlilabel_LSTM_Offensive_Profane.h5` | 42 MB | 83%+ | 3-Class: Clean/Offensive/Profane |
| **Multi-Output** | `Multi_Model_Multi_Output.h5` | 96 MB | - | Gender + Profanity combined |

### Technical Specifications

- **Max Sequence Length**: 500 tokens
- **Padding Strategy**: Post-padding
- **Tokenizers**: Keras Tokenizer (saved as `.pkl`)
- **BERT Model**: `bert-base-multilingual-cased` (768-dim embeddings)
- **N-gram Size**: 2 (bigrams for BERT embeddings)

---

## ⚡ Quick Start Guide

### Prerequisites

| Requirement | Version |
|-------------|---------|
| **Node.js** | v18+ (LTS recommended) |
| **Python** | v3.9+ |
| **Git** | Latest |

### 1. Clone Repository

```bash
git clone https://github.com/Tri-Yantra-Technologies/Profanity-And-Offensiveness-Detection-Nepali.git
cd Profanity-And-Offensiveness-Detection-Nepali
```

### 2. Backend Setup

```bash
cd backend

# Create Virtual Environment
python -m venv venv

# Activate Virtual Environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Run Server
python run_backend.py
```

✅ **Backend running at:** `http://localhost:8000`

📚 **API Docs:** `http://localhost:8000/api/docs`

### 3. Frontend Setup

```bash
# Open new terminal
cd frontend

# Install Dependencies
npm install

# Run Development Server
npm run dev
```

✅ **Frontend running at:** `http://localhost:3000`

### 4. Environment Variables

Create `.env` files:

**Backend (`backend/.env`):**
```env
FRONTEND_ORIGIN=http://localhost:3000
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
```

**Frontend (`frontend/.env`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📚 API Reference

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict` | Analyze text for profanity/offensiveness |
| `POST` | `/predict/gender` | Predict speaker gender |
| `POST` | `/analyze` | Run all models simultaneously |
| `GET` | `/health` | Health check |
| `GET` | `/models` | List available models |
| `GET` | `/meta` | API metadata |
| `POST` | `/feedback` | Submit correction feedback |

### Example Request

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{"text": "तिमीलाई यो कुरा थाहा छ?", "model_type": "profane_binary"}'
```

### Example Response

```json
{
  "profanity": {
    "label": "Non-Profane",
    "confidence": 0.9823
  },
  "offensiveness": {
    "label": "Non-Offensive",
    "confidence": 0.9456
  },
  "latency_ms": 42.5,
  "model_used": "profane_binary"
}
```

---

## 📄 Research Paper

> **Profanity and Offensiveness Detection in Nepali Language Using Bi-directional LSTM Models**
>
> *Abiral Adhikari, Prashant Manandhar, Reewaj Khanal, Samir Wagle, Praveen Acharya, Bal Krishna Bal*
>
> Proceedings of the 21st International Conference on Natural Language Processing (ICON)
> December 2024 • Chennai, India • NLP Association of India (NLPAI)

📖 **[Read Full Paper →](https://aclanthology.org/2024.icon-1.60)**

### Citation (BibTeX)

```bibtex
@inproceedings{adhikari-etal-2024-profanity,
    title = "Profanity and Offensiveness Detection in {N}epali Language Using Bi-directional {LSTM} Models",
    author = "Adhikari, Abiral and Manandhar, Prashant and Khanal, Reewaj and Wagle, Samir and Acharya, Praveen and Bal, Bal Krishna",
    editor = "Lalitha Devi, Sobha and Arora, Karunesh",
    booktitle = "Proceedings of the 21st International Conference on Natural Language Processing (ICON)",
    month = dec,
    year = "2024",
    address = "AU-KBC Research Centre, Chennai, India",
    publisher = "NLP Association of India (NLPAI)",
    url = "https://aclanthology.org/2024.icon-1.60/",
    pages = "515--521"
}
```

---

## 👥 Research Team

| Name | Profile |
|------|---------|
| **Abiral Adhikari** | [ResearchGate](https://www.researchgate.net/profile/Abiral-Adhikari-4) |
| **Prashant Manandhar** | [Website](https://manandharprashant.com.np) |
| **Reewaj Khanal** | [Website](https://reewajkhanal.com.np) |
| **Samir Wagle** | [Website](https://samirwagle.com.np) |
| **Praveen Acharya** | [ACL Anthology](https://aclanthology.org/people/praveen-acharya/) |
| **Bal Krishna Bal** | [ACL Anthology](https://aclanthology.org/people/bal-krishna-bal/) |

---

## 🤝 Contributing

Contributions are welcome! Please follow the standard "Fork-and-Pull" workflow:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Ensure you lint your code and test thoroughly before submitting a PR.

---

## 📝 License

This project is licensed under the **MIT License** — free for personal, academic, and commercial use.

---

## 🙏 Acknowledgments

- **[AI4Bharat](https://ai4bharat.org/)** — Transliteration engine
- **[Hugging Face](https://huggingface.co/)** — BERT model hosting
- **[NLP Association of India](https://nlp-ai.org/)** — ICON 2024 organizers

---

<p align="center">
  <strong>Empowering Safer Nepali Digital Spaces 🇳🇵</strong>
</p>

<p align="center">
  <a href="https://aclanthology.org/2024.icon-1.60">📄 Paper</a> •
  <a href="https://github.com/Tri-Yantra-Technologies/Profanity-And-Offensiveness-Detection-Nepali/issues">🐛 Report Bug</a> •
  <a href="https://github.com/Tri-Yantra-Technologies/Profanity-And-Offensiveness-Detection-Nepali/issues">💡 Request Feature</a>
</p>
