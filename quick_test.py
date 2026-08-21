"""
Super Fast Contract Analyzer Test (runs in <10 seconds on CPU)
"""
import sys
import logging
from classifier import get_classifier
from qa_engine import get_qa_engine
from risk_engine import risk_analysis, calculate_risk_score

logging.basicConfig(level=logging.INFO)

sample_contract = """
CONFIDENTIALITY AGREEMENT & SERVICES CONTRACT
1. Confidentiality: Each party agrees that all proprietary information received shall be kept strictly confidential and not disclosed to any third party for a period of five (5) years.
2. Governing Law: This agreement shall be governed by and construed under the laws of the State of California.
3. Limitation of Liability: Neither party shall be liable for indirect, punitive, or consequential damages. Maximum liability is capped at $50,000.
4. Termination: Either party may terminate upon thirty (30) days written notice.
"""

print("=" * 60)
print("1. TESTING CLAUSE CLASSIFICATION (BART-MNLI)")
print("=" * 60)
classifier = get_classifier()
results = classifier.classify(sample_contract, threshold=0.6)
print(f"Detected {len(results)} clauses:")
for r in results:
    print(f"  - {r['label']} (Confidence: {r['score']:.1%})")

print("\n" + "=" * 60)
print("2. TESTING EXTRACTIVE QA (RoBERTa)")
print("=" * 60)
qa = get_qa_engine()
questions = [
    "What is the governing law?",
    "What is the liability cap amount?",
    "How many days notice are required for termination?"
]

for q in questions:
    ans = qa.answer(q, [sample_contract])
    print(f"\nQ: {q}")
    print(f"A: {ans['answer']} (Confidence: {ans['confidence']:.1%})")

print("\n" + "=" * 60)
print("3. TESTING RISK ENGINE")
print("=" * 60)
detected_labels = [r["label"] for r in results]
risks = risk_analysis(detected_labels, sample_contract)
score_info = calculate_risk_score(risks)
print(f"Risk Score: {score_info['score']}/100 | Grade: {score_info['grade']}")
print(score_info['summary'])
print("\n[SUCCESS] All systems operational!")
