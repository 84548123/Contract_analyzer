def answer_question(question, clauses):

    question = question.lower()

    mapping = {
        "confidentiality": "Confidentiality",
        "confidential": "Confidentiality",
        "non compete": "Non-Compete",
        "non-compete": "Non-Compete",
        "termination": "Termination",
        "liability": "Limitation of Liability",
        "law": "Governing Law",
        "payment": "Payment Terms",
        "intellectual property": "Intellectual Property"
    }

    detected_label = None

    for key, label in mapping.items():
        if key in question:
            detected_label = label
            break

    if not detected_label:
        return "❌ Could not understand question"

    if detected_label in clauses:
        item = clauses[detected_label][0]

        return f"""
✅ YES — {detected_label} clause found
Confidence: {item['confidence']}

📄 Clause Text:
{item['text'][:300]}
"""
    else:
        return f"❌ NO — {detected_label} clause not found"