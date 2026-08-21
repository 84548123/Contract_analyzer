# 📄 Contract Clause Extraction & Analysis Engine

> AI-powered legal contract analysis with clause extraction, NLP-based Q&A, risk scoring, and executive summarization — deployed on GCP Cloud Run.

---

## 🚀 Overview

Contract review is one of the most time-consuming and expensive tasks in legal and business workflows. This system automates the extraction, analysis, and querying of legal clauses from commercial contracts using state-of-the-art NLP models.

### Key Capabilities

| Feature | Description |
|:--------|:------------|
| **Clause Extraction** | Zero-shot classification across 30 legal clause categories using BART-MNLI |
| **Question Answering** | Extractive QA with RoBERTa — ask natural language questions about any contract |
| **Risk Analysis** | 12+ risk rules with severity levels (Critical/High/Medium/Low), scoring (0-100), and letter grades (A-F) |
| **Summarization** | Hierarchical contract summarization using BART-CNN |
| **Interactive UI** | Tabbed Gradio interface with clause browser, risk dashboard, Q&A chat, and summary view |
| **REST API** | FastAPI endpoints for programmatic access |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   GCP Cloud Run                     │
│  ┌───────────────────────────────────────────────┐  │
│  │              FastAPI (main.py)                 │  │
│  │  ┌─────────┐  ┌──────────────────────────┐   │  │
│  │  │ /health │  │  / → Gradio App            │   │  │
│  │  └─────────┘  │  (Tabs: Extract, QA,      │   │  │
│  │  ┌─────────┐  │   Risk, Summary)          │   │  │
│  │  │/api/*   │  └──────────────────────────┘   │  │
│  │  └────┬────┘                                  │  │
│  │       │                                       │  │
│  │  ┌────▼──────────────────────────────────┐   │  │
│  │  │           NLP Pipeline                 │   │  │
│  │  │  preprocess → classifier → extractor   │   │  │
│  │  │  qa_engine    risk_engine  summarizer   │   │  │
│  │  └────────────────────────────────────────┘   │  │
│  │       │                                       │  │
│  │  ┌────▼──────────────────────────────────┐   │  │
│  │  │        HuggingFace Models              │   │  │
│  │  │  bart-large-mnli (classification)      │   │  │
│  │  │  roberta-base-squad2 (QA)              │   │  │
│  │  │  bart-large-cnn (summarization)        │   │  │
│  │  └────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 🧰 Tech Stack

| Component | Technology |
|:----------|:-----------|
| Language | Python 3.11 |
| NLP Models | HuggingFace Transformers (BART-MNLI, RoBERTa-SQuAD2, BART-CNN) |
| Backend | FastAPI + Uvicorn |
| Frontend | Gradio 4.x |
| PDF Processing | PyMuPDF (fitz) |
| Search | scikit-learn TF-IDF |
| Container | Docker |
| Deployment | GCP Cloud Run |
| Dataset | CUAD (Contract Understanding Atticus Dataset) |

---

## 📁 Project Structure

```
contract_analyzer/
├── main.py                    # FastAPI app + Gradio mount (entrypoint)
├── gradio_app.py              # Gradio UI (tabbed interface)
├── preprocess.py              # PDF extraction, cleaning, chunking
├── classifier.py              # Zero-shot clause classification
├── extractor.py               # Clause extraction orchestration
├── qa_engine.py               # Extractive QA with RoBERTa
├── risk_engine.py             # Risk analysis with scoring
├── summarizer.py              # Contract summarization
├── cuad_test.py               # CUAD benchmark evaluation
├── category_descriptions.csv  # 41 CUAD clause category definitions
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Container build with model pre-download
├── deploy.sh                  # One-command GCP deployment script
├── cloudbuild.yaml            # GCP Cloud Build config
├── .dockerignore
├── .gcloudignore
└── tests/
    ├── test_preprocess.py
    ├── test_classifier.py
    └── test_risk_engine.py
```

---

## ⚙️ Local Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/contract-clause-analyzer.git
cd contract-clause-analyzer

# Install dependencies
pip install -r requirements.txt

# Run the application
python main.py
```

The app will be available at `http://localhost:8080`

---

## 🐳 Docker

```bash
# Build
docker build -t contract-analyzer .

# Run
docker run -p 8080:8080 contract-analyzer
```

---

## ☁️ Deploy to GCP Cloud Run

### Prerequisites
- GCP account with billing enabled
- `gcloud` CLI installed and authenticated
- Docker installed (optional, for local testing)

### Deploy

```bash
# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# One-command deploy
chmod +x deploy.sh
./deploy.sh YOUR_PROJECT_ID us-central1
```

The script will:
1. Enable required GCP APIs
2. Create an Artifact Registry repository
3. Build the container via Cloud Build
4. Deploy to Cloud Run with optimized settings (4Gi RAM, 2 CPUs)

### Cloud Run Configuration

| Setting | Value |
|:--------|:------|
| Memory | 4Gi |
| CPU | 2 |
| Min Instances | 0 (scale to zero) |
| Max Instances | 3 |
| Concurrency | 1 |
| Timeout | 300s |
| Port | 8080 |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/analyze` | Upload PDF → full analysis (clauses, risks, summary) |
| `POST` | `/api/ask` | Ask a question about a previously analyzed contract |
| `GET` | `/docs` | Interactive API documentation (Swagger) |

### Example: Analyze a Contract

```bash
curl -X POST http://localhost:8080/api/analyze \
  -F "file=@contract.pdf"
```

### Example: Ask a Question

```bash
curl -X POST http://localhost:8080/api/ask \
  -H "Content-Type: application/json" \
  -d '{"contract_id": "abc12345", "question": "What is the governing law?"}'
```

---

## 🧪 Testing

```bash
# Run unit tests
python -m pytest tests/ -v

# Run CUAD benchmark (requires CUADv1.json)
python cuad_test.py
```

---

## 📊 Dataset

**CUAD (Contract Understanding Atticus Dataset)**
- 510 real-world contracts
- 13,000+ annotations
- 41 clause categories

Source: https://huggingface.co/datasets/theatticusproject/cuad-qa

---

## 📜 License

MIT
