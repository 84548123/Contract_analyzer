import gradio as gr
from preprocess import extract_text
from extractor import extract_clauses
from qa_engine import answer_question

stored_clauses = {}

def process_contract(file):
    global stored_clauses

    # ✅ Fix 1: correct indentation
    if file is None:
        return "❌ Upload a PDF"

    text = extract_text(file)
    paragraphs = [{"context": text}]

    clauses = extract_clauses(paragraphs)
    stored_clauses = clauses

    # ✅ Fix 2: proper indentation
    if not clauses:
        return "⚠️ No strong clauses detected, showing best guesses..."

    output = ""

    for label, items in clauses.items():
        output += f"\n🔹 {label}\n"
        output += f"Confidence: {items[0]['confidence']}\n"
        output += items[0]["text"][:300] + "\n\n"

    return output


def ask_question(question):
    global stored_clauses

    if not stored_clauses:
        return "❌ Process contract first"

    return answer_question(question, stored_clauses)


def risk_analysis():
    global stored_clauses

    labels = list(stored_clauses.keys())

    risks = []

    if "Limitation of Liability" not in labels:
        risks.append("⚠️ No liability clause → High risk")

    if "Termination" not in labels:
        risks.append("⚠️ No termination clause")

    return "\n".join(risks) if risks else "✅ No major risks"


with gr.Blocks() as app:

    gr.Markdown("# 📄 Contract Analyzer")

    file_input = gr.File(label="Upload PDF")
    extract_btn = gr.Button("Extract Clauses")

    output_box = gr.Textbox(label="Clauses", lines=20)

    extract_btn.click(process_contract, inputs=file_input, outputs=output_box)

    gr.Markdown("## 💬 Ask Questions")

    question_input = gr.Textbox(label="Enter Question")
    ask_btn = gr.Button("Ask")

    answer_box = gr.Textbox(label="Answer")

    ask_btn.click(ask_question, inputs=question_input, outputs=answer_box)

    gr.Markdown("## ⚠️ Risk Analysis")

    risk_btn = gr.Button("Check Risk")
    risk_output = gr.Textbox(label="Risk")

    risk_btn.click(risk_analysis, outputs=risk_output)

app.launch()