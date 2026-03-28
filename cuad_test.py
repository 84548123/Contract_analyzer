import json
from extractor import extract_clauses
from qa_engine import answer_question

# ================= LOAD DATA =================

with open("CUADv1.json", "r", encoding="utf-8") as f:
    data = json.load(f)

samples = data["data"]

print(f"Total contracts: {len(samples)}")


# ================= CLAUSE EXTRACTION =================

print("\n=========== CLAUSE EXTRACTION ===========")

for i in range(1):  # test first 2 contracts

    print(f"\n📄 Contract {i+1}")

    paragraphs = samples[i]["paragraphs"][:2]  # only 2 paragraphs
    clauses = extract_clauses(paragraphs)

    if not clauses:
        print("No clauses detected")
        continue

    for label, items in clauses.items():
        print(f"\n🔹 {label}")
        for item in items:
            print(f"Confidence: {item['confidence']}")
            print(item["text"][:300])


# ================= QA SYSTEM =================

print("\n================ QA SYSTEM ================")

paragraphs = samples[0]["paragraphs"]

# ✅ Extract ONCE (important)
clauses = extract_clauses(paragraphs)

questions = [
    "Does this contract have confidentiality?",
    "Is there a non compete clause?",
    "What is the governing law?",
    "Is there a liability clause?"
]

for q in questions:
    print(f"\nQ: {q}")
    print(answer_question(q, clauses))