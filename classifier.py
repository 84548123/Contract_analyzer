"""
Zero-shot clause classification module.
Uses facebook/bart-large-mnli for legal clause type identification.
"""

import csv
import logging
from typing import List, Dict, Optional

from transformers import pipeline

logger = logging.getLogger(__name__)

# Comprehensive clause categories covering key legal provisions
DEFAULT_CATEGORIES = [
    "Confidentiality",
    "Termination",
    "Indemnification",
    "Limitation of Liability",
    "Governing Law",
    "Payment Terms",
    "Intellectual Property",
    "Non-Compete",
    "Exclusivity",
    "Non-Solicitation",
    "Non-Disparagement",
    "Change of Control",
    "Anti-Assignment",
    "Revenue Sharing",
    "Price Restrictions",
    "Minimum Commitment",
    "License Grant",
    "Warranty",
    "Insurance",
    "Audit Rights",
    "Liquidated Damages",
    "Renewal Terms",
    "Notice Period",
    "Most Favored Nation",
    "Source Code Escrow",
    "Post-Termination Services",
    "Cap on Liability",
    "Uncapped Liability",
    "Covenant Not to Sue",
    "Third Party Beneficiary",
]


def load_categories_from_csv(csv_path: str = "category_descriptions.csv") -> Dict[str, str]:
    """Load clause categories and descriptions from CSV file."""
    categories = {}
    try:
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cat = row.get("Category (incl. context and answer)", "")
                desc = row.get("Description", "")
                if cat.startswith("Category: "):
                    cat_name = cat.replace("Category: ", "").strip()
                    categories[cat_name] = desc
        logger.info(f"Loaded {len(categories)} categories from {csv_path}")
    except FileNotFoundError:
        logger.warning(f"CSV file not found: {csv_path}. Using default categories.")
    return categories


class ClauseClassifier:
    """Zero-shot clause classifier using BART-MNLI."""

    def __init__(self, model_name: str = "facebook/bart-large-mnli", categories: Optional[List[str]] = None):
        logger.info(f"Loading classification model: {model_name}")
        self._classifier = pipeline(
            "zero-shot-classification",
            model=model_name,
            device=-1  # CPU; change to 0 for GPU
        )
        self.categories = categories or DEFAULT_CATEGORIES
        logger.info(f"Classifier ready with {len(self.categories)} categories")

    def classify(self, text: str, threshold: float = 0.5, multi_label: bool = True) -> List[Dict]:
        """
        Classify a text chunk into clause categories.

        Args:
            text: Text to classify
            threshold: Minimum confidence score to include a label
            multi_label: Whether a chunk can belong to multiple categories

        Returns:
            List of dicts with 'label' and 'score' keys, sorted by score descending
        """
        if not text or not text.strip():
            return []

        # Truncate very long text to avoid model issues
        if len(text.split()) > 600:
            text = ' '.join(text.split()[:600])

        try:
            result = self._classifier(
                text,
                self.categories,
                multi_label=multi_label
            )

            classifications = []
            for label, score in zip(result["labels"], result["scores"]):
                if score >= threshold:
                    classifications.append({
                        "label": label,
                        "score": round(score, 4)
                    })

            return classifications

        except Exception as e:
            logger.error(f"Classification error: {e}")
            return []

    def classify_batch(self, texts: List[str], threshold: float = 0.5) -> List[List[Dict]]:
        """Classify multiple text chunks."""
        results = []
        for i, text in enumerate(texts):
            logger.debug(f"Classifying chunk {i+1}/{len(texts)}")
            results.append(self.classify(text, threshold=threshold))
        return results


# Module-level singleton
_classifier_instance: Optional[ClauseClassifier] = None


def get_classifier() -> ClauseClassifier:
    """Get or create the singleton classifier instance."""
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = ClauseClassifier()
    return _classifier_instance


def predict_advanced(text: str, threshold: float = 0.5) -> dict:
    """
    Legacy-compatible classification function.
    Returns dict with 'labels' and 'scores' keys.
    """
    classifier = get_classifier()
    result = classifier._classifier(text, classifier.categories)
    return result