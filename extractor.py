"""
Clause extraction orchestration module.
Coordinates preprocessing, classification, and result aggregation.
"""

import logging
from typing import Dict, List
from collections import defaultdict

from preprocess import chunk_text, clean_text
from classifier import get_classifier

logger = logging.getLogger(__name__)


def extract_clauses(
    paragraphs: List[dict],
    threshold: float = 0.5,
    max_clauses_per_label: int = 5
) -> Dict[str, List[dict]]:
    """
    Extract and classify clauses from contract paragraphs.

    Args:
        paragraphs: List of dicts with 'context' key containing text
        threshold: Minimum confidence for clause detection
        max_clauses_per_label: Maximum number of clauses to keep per category

    Returns:
        Dict mapping clause labels to list of matched items:
        {
            "Confidentiality": [
                {"text": "...", "confidence": 0.92, "chunk_index": 3},
            ]
        }
    """
    classifier = get_classifier()
    clauses = defaultdict(list)

    for para in paragraphs:
        text = para.get("context", "")
        if not text or not text.strip():
            continue

        text = clean_text(text)
        chunks = chunk_text(text, chunk_size=400, overlap=100)
        total_chunks = len(chunks)
        print(f"      Analyzing {total_chunks} text chunks with BART-large model...")
        for chunk_idx, chunk in enumerate(chunks):
            if len(chunk.split()) < 10:
                continue

            print(f"      -> Processing chunk {chunk_idx + 1}/{total_chunks}...", end="\r", flush=True)
            classifications = classifier.classify(chunk, threshold=threshold)

            for cls in classifications:
                label = cls["label"]
                score = cls["score"]

                clauses[label].append({
                    "text": chunk,
                    "confidence": round(score, 4),
                    "chunk_index": chunk_idx
                })

    # Sort by confidence and limit per label
    result = {}
    for label, items in clauses.items():
        sorted_items = sorted(items, key=lambda x: x["confidence"], reverse=True)
        result[label] = sorted_items[:max_clauses_per_label]

    logger.info(f"Extracted {sum(len(v) for v in result.values())} clauses across {len(result)} categories")
    return result


def extract_clauses_from_text(
    text: str,
    threshold: float = 0.5
) -> Dict[str, List[dict]]:
    """
    Convenience function: extract clauses directly from raw text.
    """
    return extract_clauses(
        [{"context": text}],
        threshold=threshold
    )
