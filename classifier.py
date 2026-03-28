from transformers import pipeline

classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

def predict_advanced(text):

    labels = [
        "Confidentiality",
        "Termination",
        "Indemnification",
        "Limitation of Liability",
        "Governing Law",
        "Payment Terms",
        "Intellectual Property",
        "Non-Compete"
    ]

    result = classifier(text, labels)

    return result