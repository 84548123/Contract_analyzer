"""
FastAPI + Gradio application for the Contract Analyzer.
Provides REST API endpoints and mounts the Gradio UI.
"""

import os
import logging
import uuid

import fitz  # PyMuPDF
import uvicorn
import gradio as gr
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from preprocess import chunk_text
from extractor import extract_clauses_from_text
from qa_engine import get_qa_engine
from risk_engine import risk_analysis, calculate_risk_score
from summarizer import summarize_contract

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

# --- FastAPI App ---
api = FastAPI(
    title="Contract Analyzer API",
    description="AI-powered legal contract analysis engine",
    version="2.0.0",
)

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory contract store (keyed by contract_id)
contract_store: dict = {}


class QuestionRequest(BaseModel):
    contract_id: str
    question: str


# --- Health Check ---
@api.get("/health")
@api.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "contract-analyzer", "version": "2.0.0"}


# --- Analyze Endpoint ---
@api.post("/api/analyze")
async def analyze_contract(file: UploadFile = File(...)):
    """Upload and fully analyze a contract PDF."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        content = await file.read()
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text() + "\n"
        doc.close()

        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        # Process
        chunks = chunk_text(text)
        clauses = extract_clauses_from_text(text, threshold=0.5)
        detected_labels = list(clauses.keys())
        risks = risk_analysis(detected_labels, text)
        risk_score_data = calculate_risk_score(risks)
        summary = summarize_contract(chunks)

        # Store for Q&A
        contract_id = str(uuid.uuid4())[:8]
        contract_store[contract_id] = {
            "text": text,
            "chunks": chunks,
            "clauses": clauses,
        }

        return {
            "contract_id": contract_id,
            "clauses": clauses,
            "risks": risks,
            "risk_score": risk_score_data,
            "summary": summary,
            "chunk_count": len(chunks),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# --- Q&A Endpoint ---
@api.post("/api/ask")
async def ask_question_api(req: QuestionRequest):
    """Ask a question about a previously analyzed contract."""
    if req.contract_id not in contract_store:
        raise HTTPException(status_code=404, detail="Contract not found. Upload and analyze first.")

    data = contract_store[req.contract_id]
    engine = get_qa_engine()
    return engine.answer(req.question, data["chunks"], data["clauses"])


# --- Mount Gradio UI ---
from gradio_app import create_gradio_app

gradio_ui = create_gradio_app()
app = gr.mount_gradio_app(api, gradio_ui, path="/")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    logger.info(f"Starting Contract Analyzer on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
