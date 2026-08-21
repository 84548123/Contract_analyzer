"""
Contract summarization module.
Generates executive summaries of legal contracts using BART-CNN.
"""

import logging
from typing import List, Optional

from transformers import pipeline

logger = logging.getLogger(__name__)


class ContractSummarizer:
    """Generates summaries of contract documents using hierarchical summarization."""

    def __init__(self, model_name: str = "facebook/bart-large-cnn"):
        logger.info(f"Loading summarization model: {model_name}")
        self._summarizer = pipeline(
            "summarization",
            model=model_name,
            device=-1
        )
        logger.info("Summarizer ready")

    def summarize_chunk(self, text: str, max_length: int = 150, min_length: int = 40) -> str:
        """Summarize a single text chunk."""
        if not text or len(text.split()) < 30:
            return text

        try:
            words = text.split()
            input_len = len(words)
            truncated = ' '.join(words[:900])
            
            # Dynamically clamp max_length if input is short
            effective_max = min(max_length, max(20, input_len - 5))
            effective_min = min(min_length, max(5, effective_max // 2))

            result = self._summarizer(
                truncated,
                max_length=effective_max,
                min_length=effective_min,
                do_sample=False
            )
            return result[0]["summary_text"]
        except Exception as e:
            logger.warning(f"Summarization error: {e}")
            return text[:500] + "..."

    def summarize(self, chunks: List[str], max_length: int = 300) -> str:
        """
        Summarize an entire contract from its chunks.

        Uses hierarchical summarization: summarize each chunk individually,
        then summarize the combined summaries.
        """
        if not chunks:
            return "No contract text available for summarization."

        # First pass: summarize each chunk
        chunk_summaries = []
        for i, chunk in enumerate(chunks):
            if len(chunk.split()) < 20:
                continue
            logger.debug(f"Summarizing chunk {i+1}/{len(chunks)}")
            summary = self.summarize_chunk(chunk, max_length=120, min_length=30)
            chunk_summaries.append(summary)

        if not chunk_summaries:
            return "Contract text too short to summarize."

        # If few chunks, combine summaries directly
        if len(chunk_summaries) <= 3:
            combined = " ".join(chunk_summaries)
            return self.summarize_chunk(combined, max_length=max_length, min_length=50)

        # Hierarchical: summarize the summaries
        combined = " ".join(chunk_summaries)
        return self.summarize_chunk(combined, max_length=max_length, min_length=80)


# Module-level singleton
_summarizer_instance: Optional[ContractSummarizer] = None


def get_summarizer() -> ContractSummarizer:
    """Get or create the singleton summarizer instance."""
    global _summarizer_instance
    if _summarizer_instance is None:
        _summarizer_instance = ContractSummarizer()
    return _summarizer_instance


def summarize_contract(chunks: List[str]) -> str:
    """Convenience function to summarize a contract."""
    summarizer = get_summarizer()
    return summarizer.summarize(chunks)
