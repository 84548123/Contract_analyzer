"""
Contract question-answering engine.
Uses extractive QA with RoBERTa for accurate, evidence-based answers.
"""

import logging
from typing import Dict, List, Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline

logger = logging.getLogger(__name__)


class QAEngine:
    """Extractive question-answering engine for contracts."""

    def __init__(self, model_name: str = "deepset/roberta-base-squad2"):
        logger.info(f"Loading QA model: {model_name}")
        self._qa_pipeline = pipeline(
            "question-answering",
            model=model_name,
            device=-1
        )
        self._vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        logger.info("QA engine ready")

    def _find_relevant_chunks(self, question: str, chunks: List[str], top_k: int = 3) -> List[str]:
        """Find the most relevant text chunks for a question using TF-IDF similarity."""
        if not chunks:
            return []
        if len(chunks) <= top_k:
            return chunks

        try:
            all_texts = chunks + [question]
            tfidf_matrix = self._vectorizer.fit_transform(all_texts)
            question_vec = tfidf_matrix[-1]
            chunk_vecs = tfidf_matrix[:-1]

            similarities = cosine_similarity(question_vec, chunk_vecs).flatten()
            top_indices = np.argsort(similarities)[-top_k:][::-1]

            return [chunks[i] for i in top_indices]
        except Exception as e:
            logger.warning(f"TF-IDF search failed: {e}. Returning first {top_k} chunks.")
            return chunks[:top_k]

    def answer(self, question: str, context_chunks: List[str], clauses: Optional[Dict] = None) -> dict:
        """
        Answer a question about the contract.

        Args:
            question: Natural language question
            context_chunks: List of text chunks from the contract
            clauses: Optional extracted clauses dict for enhanced context

        Returns:
            Dict with 'answer', 'confidence', 'context', 'found' keys
        """
        if not question or not question.strip():
            return {
                "answer": "Please provide a question.",
                "confidence": 0.0,
                "context": "",
                "found": False
            }

        if not context_chunks:
            return {
                "answer": "No contract text available. Please upload a contract first.",
                "confidence": 0.0,
                "context": "",
                "found": False
            }

        # Find the most relevant chunks
        relevant_chunks = self._find_relevant_chunks(question, context_chunks, top_k=3)

        best_answer = None
        best_score = 0.0
        best_context = ""

        for chunk in relevant_chunks:
            try:
                # Truncate context to model max length
                truncated = ' '.join(chunk.split()[:450])
                result = self._qa_pipeline(question=question, context=truncated)

                if result["score"] > best_score:
                    best_score = result["score"]
                    best_answer = result["answer"]
                    best_context = chunk
            except Exception as e:
                logger.warning(f"QA error on chunk: {e}")
                continue

        if best_answer and best_score > 0.01:
            return {
                "answer": best_answer,
                "confidence": round(best_score, 4),
                "context": best_context[:500],
                "found": True
            }
        else:
            return {
                "answer": "Could not find a confident answer in the contract.",
                "confidence": round(best_score, 4) if best_score else 0.0,
                "context": "",
                "found": False
            }


# Module-level singleton
_qa_instance: Optional[QAEngine] = None


def get_qa_engine() -> QAEngine:
    """Get or create the singleton QA engine instance."""
    global _qa_instance
    if _qa_instance is None:
        _qa_instance = QAEngine()
    return _qa_instance


def answer_question(question: str, clauses: dict = None, chunks: List[str] = None) -> str:
    """
    Answer a question about a contract.

    Can work with either extracted clauses or raw text chunks.
    Uses real NLP-based extractive QA (not keyword matching).
    """
    engine = get_qa_engine()

    # If we have chunks, use the full QA pipeline
    if chunks:
        result = engine.answer(question, chunks, clauses)
        if result["found"]:
            return f"""✅ Answer: {result['answer']}
📊 Confidence: {result['confidence']:.1%}

📄 Source text:
{result['context'][:300]}"""
        else:
            return f"❌ {result['answer']}"

    # Fallback: if only clauses dict is provided, extract text from clauses
    if clauses:
        clause_texts = []
        for label, items in clauses.items():
            for item in items:
                clause_texts.append(item.get("text", ""))

        if clause_texts:
            result = engine.answer(question, clause_texts, clauses)
            if result["found"]:
                return f"""✅ Answer: {result['answer']}
📊 Confidence: {result['confidence']:.1%}

📄 Source text:
{result['context'][:300]}"""
            else:
                return f"❌ {result['answer']}"

    return "❌ No contract data available. Please upload and process a contract first."