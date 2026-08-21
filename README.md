# 📄 ContractIQ — AI Legal Intelligence Engine

> AI-powered legal contract analysis with zero-shot clause extraction, RoBERTa extractive Q&A, risk scoring, executive summarization, and a modern React + Tailwind UI — ready for GCP Cloud Run deployment.

---

## 🚀 Key Features

| Feature | Description |
|:---|:---|
| **🎨 Modern React UI** | Split-screen legal dashboard with document explorer, search, and responsive layout |
| **🔍 Clause Extraction** | Zero-shot classification across 30 legal categories using `BART-MNLI` |
| **💬 Extractive Q&A** | Natural language queries with exact source evidence citations using `RoBERTa-SQuAD2` |
| **⚠️ Risk Matrix** | 12+ risk rules with severity levels (Critical/High/Medium/Low), risk score (0–100), and letter grade (A–F) |
| **📝 Summarization** | Hierarchical document summarization using `BART-CNN` |
| **📥 Audit Export** | One-click export to formatted Markdown audit report |
| **⚡ REST API** | FastAPI backend with OpenAPI Swagger documentation at `/docs` |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GCP Cloud Run                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │               FastAPI (main.py)                   │  │
│  │  ┌──────────┐  ┌───────────────────────────────┐  │  │
│  │  │  /health │  │  / → React + Tailwind SPA     │  │  │
│  │  ├──────────┤  │      (Split-Screen Dashboard) │  │  │
│  │  │  /api/*  │  └───────────────────────────────┘  │  │
│  │  └────┬─────┘                                     │  │
│  │       │                                           │  │
│  │  ┌────▼──────────────────────────────────────┐    │  │
│  │  │            NLP Pipelines                  │    │  │
│  │  │  preprocess ──► classifier ──► extractor  │    │  │
│  │  │  qa_engine     risk_engine    summarizer  │    │  │
│  │  └───────────────────────────────────────────┘    │  │
│  │       │                                           │  │
│  │  ┌────▼──────────────────────────────────────┐    │  │
│  │  │        Hugging Face Transformer Models    │    │  │
│  │  │  - facebook/bart-large-mnli (Zero-Shot)   │    │  │
│  │  │  - deepset/roberta-base-squad2 (QA)       │    │  │
│  │  │  - facebook/bart-large-cnn (Summary)      │    │  │
│  │  └───────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Clean Project Structure

```
contract_analyzer/
├── main.py                    # FastAPI application & static React server
├── preprocess.py              # PDF parsing, cleaning & sliding-window chunking
├── classifier.py              # Zero-shot clause classification pipeline
├── extractor.py               # Clause extraction & confidence aggregation
├── qa_engine.py               # RoBERTa extractive QA + TF-IDF retrieval
├── risk_engine.py             # 12+ risk rules, severity scoring & letter grading
├── summarizer.py              # BART-CNN contract summarization
├── quick_test.py              # Fast end-to-end test script (<10s)
├── category_descriptions.csv  # 41 CUAD legal clause definitions
├── requirements.txt           # Python backend dependencies
├── Dockerfile                 # Multi-stage Docker build (Node.js + Python)
├── deploy.sh                  # One-command GCP Cloud Run deployment
├── cloudbuild.yaml            # GCP Cloud Build configuration
├── .dockerignore
├── .gcloudignore
├── .gitignore
├── frontend/                  # React 18 + Tailwind CSS + Lucide Icons SPA
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── App.jsx            # Main dashboard coordinator
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── FileUpload.jsx
│   │       ├── DocumentViewer.jsx
│   │       ├── OverviewTab.jsx
│   │       ├── RiskDashboard.jsx
│   │       ├── ClauseExplorer.jsx
│   │       ├── ChatAssistant.jsx
│   │       ├── RiskGauge.jsx
│   │       └── ExportModal.jsx
│   └── dist/                  # Pre-built production bundle
└── tests/
    ├── test_preprocess.py
    ├── test_classifier.py
    └── test_risk_engine.py
```

---

## ⚙️ Quick Start

### 1. Local Run
```bash
# Install backend dependencies
pip install -r requirements.txt

# Start the application
python main.py
```
Open **`http://localhost:8080`** in your browser.

---

### 2. Fast Pipeline Test
```bash
python quick_test.py
```

---

### 3. Deploy to GCP Cloud Run
```bash
chmod +x deploy.sh
./deploy.sh YOUR_PROJECT_ID us-central1
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/health` | Health check endpoint |
| `POST` | `/api/analyze` | Upload contract PDF for full analysis |
| `POST` | `/api/ask` | Natural language question against analyzed contract |
| `GET` | `/docs` | Interactive Swagger API documentation |

---

## 📜 License

MIT
