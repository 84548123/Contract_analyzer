"""
CUAD Dataset evaluation script.
Tests clause extraction and QA against the CUAD benchmark.
"""

import json
import sys
import logging
from collections import defaultdict

from extractor import extract_clauses
from qa_engine import answer_question

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    # Load CUAD data
    try:
        with open("CUADv1.json", "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("CUADv1.json not found.")
        print("Download from: https://huggingface.co/datasets/theatticusproject/cuad-qa")
        sys.exit(1)

    samples = data["data"]
    print(f"Total contracts in dataset: {len(samples)}")

    # ============ CLAUSE EXTRACTION EVALUATION ============
    print("\n" + "=" * 60)
    print("  CLAUSE EXTRACTION EVALUATION")
    print("=" * 60)

    num_test = min(3, len(samples))
    total_clauses_found = 0
    category_counts = defaultdict(int)

    for i in range(num_test):
        contract = samples[i]
        title = contract.get("title", f"Contract {i+1}")
        print(f"\n[{i+1}/{num_test}] {title}")

        paragraphs = contract["paragraphs"][:3]  # Limit for speed
        clauses = extract_clauses(paragraphs, threshold=0.5)

        if not clauses:
            print("   No clauses detected above threshold")
            continue

        contract_clause_count = 0
        for label, items in clauses.items():
            category_counts[label] += len(items)
            contract_clause_count += len(items)
            best = items[0]
            print(f"   {label} (confidence: {best['confidence']:.2%})")
            print(f"      \"{best['text'][:150]}...\"")

        total_clauses_found += contract_clause_count
        print(f"   Found {contract_clause_count} clause instances across {len(clauses)} categories")

    print(f"\nSummary: {total_clauses_found} total clauses across {num_test} contracts")
    print("Category distribution:")
    for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"   - {cat}: {count}")

    # ============ QA EVALUATION ============
    print("\n" + "=" * 60)
    print("  QA SYSTEM EVALUATION")
    print("=" * 60)

    # Use first contract
    paragraphs = samples[0]["paragraphs"][:3]
    clauses = extract_clauses(paragraphs, threshold=0.4)

    # Collect chunk texts for QA
    chunk_texts = []
    for para in paragraphs:
        ctx = para.get("context", "")
        if ctx:
            chunk_texts.append(ctx)

    questions = [
        "Does this contract have a confidentiality clause?",
        "Is there a non-compete clause?",
        "What is the governing law?",
        "Is there a limitation of liability?",
        "What are the termination provisions?",
    ]

    for q in questions:
        print(f"\nQ: {q}")
        answer = answer_question(q, clauses=clauses, chunks=chunk_texts)
        print(f"   {answer}")

    print("\nEvaluation complete!")


if __name__ == "__main__":
    main()