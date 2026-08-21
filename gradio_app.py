"""
Gradio UI for the Contract Analyzer.
Provides an interactive tabbed interface for clause extraction, Q&A,
risk analysis, and contract summarization.
"""

import logging
import gradio as gr

from preprocess import extract_text, chunk_text, clean_text
from extractor import extract_clauses_from_text
from qa_engine import answer_question
from risk_engine import risk_analysis, calculate_risk_score
from summarizer import summarize_contract

logger = logging.getLogger(__name__)

# Session state
_session = {
    "text": "",
    "chunks": [],
    "clauses": {},
    "risks": [],
    "risk_score": {},
}


def process_contract(file):
    """Process uploaded PDF and run full analysis pipeline."""
    if file is None:
        return "\u274c Please upload a PDF file.", "", ""

    try:
        text = extract_text(file)
        if not text.strip():
            return "\u274c Could not extract text from PDF. The file may be scanned or empty.", "", ""

        text = clean_text(text)
        chunks = chunk_text(text)

        # Extract clauses
        clauses = extract_clauses_from_text(text, threshold=0.5)

        # Risk analysis
        detected_labels = list(clauses.keys())
        risks = risk_analysis(detected_labels, text)
        risk_score = calculate_risk_score(risks)

        # Summary
        summary = summarize_contract(chunks)

        # Save to session
        _session["text"] = text
        _session["chunks"] = chunks
        _session["clauses"] = clauses
        _session["risks"] = risks
        _session["risk_score"] = risk_score

        # Format clause output
        if not clauses:
            clause_output = "\u26a0\ufe0f No strong clauses detected above the confidence threshold."
        else:
            clause_output = f"\U0001f4cb **Found {len(clauses)} clause categories across {len(chunks)} text chunks**\n\n"
            for label, items in sorted(clauses.items(), key=lambda x: x[1][0]["confidence"], reverse=True):
                top = items[0]
                conf = top["confidence"]
                bar = "\u2588" * int(conf * 20) + "\u2591" * (20 - int(conf * 20))
                clause_output += f"### \U0001f539 {label}\n"
                clause_output += f"**Confidence:** {conf:.1%} |{bar}|\n"
                clause_output += f"**Best match ({len(items)} found):**\n"
                clause_output += f"> {top['text'][:300]}...\n\n"
                clause_output += "---\n\n"

        # Format risk output
        if not risks:
            risk_output = "\u2705 **No significant risks detected.** Contract appears well-structured."
        else:
            severity_emoji = {"CRITICAL": "\U0001f534", "HIGH": "\U0001f7e0", "MEDIUM": "\U0001f7e1", "LOW": "\U0001f7e2"}
            risk_output = f"## Risk Score: {risk_score['score']}/100 \u2014 Grade: **{risk_score['grade']}**\n\n"
            risk_output += f"{risk_score['summary']}\n\n---\n\n"
            for r in risks:
                emoji = severity_emoji.get(r["severity"], "\u26aa")
                risk_output += f"### {emoji} [{r['severity']}] {r['title']}\n"
                risk_output += f"{r['description']}\n"
                risk_output += f"\U0001f4a1 **Recommendation:** {r['recommendation']}\n\n"

        return clause_output, risk_output, summary

    except Exception as e:
        logger.error(f"Processing error: {e}", exc_info=True)
        return f"\u274c Error processing contract: {str(e)}", "", ""


def ask_question_handler(question):
    """Handle Q&A questions about the processed contract."""
    if not _session["chunks"]:
        return "\u274c Please upload and process a contract first."

    if not question or not question.strip():
        return "\u274c Please enter a question."

    return answer_question(question, clauses=_session["clauses"], chunks=_session["chunks"])


def create_gradio_app():
    """Create and return the Gradio Blocks application."""

    with gr.Blocks(
        title="Contract Analyzer",
        theme=gr.themes.Soft(primary_hue="blue"),
    ) as demo:

        gr.Markdown(
            """
            # \U0001f4c4 Contract Clause Analyzer
            ### AI-Powered Legal Contract Analysis Engine
            Upload a PDF contract to extract clauses, analyze risks, get summaries, and ask questions.
            """
        )

        with gr.Row():
            file_input = gr.File(label="\U0001f4c1 Upload Contract PDF", file_types=[".pdf"], type="filepath")
            analyze_btn = gr.Button("\U0001f50d Analyze Contract", variant="primary", size="lg")

        with gr.Tabs():
            with gr.TabItem("\U0001f4cb Clause Extraction"):
                clause_output = gr.Markdown(
                    label="Extracted Clauses",
                    value="*Upload a contract to see extracted clauses*"
                )

            with gr.TabItem("\u26a0\ufe0f Risk Analysis"):
                risk_output = gr.Markdown(
                    label="Risk Assessment",
                    value="*Upload a contract to see risk analysis*"
                )

            with gr.TabItem("\U0001f4dd Summary"):
                summary_output = gr.Textbox(
                    label="Executive Summary",
                    lines=8,
                    value="Upload a contract to generate summary"
                )

            with gr.TabItem("\U0001f4ac Q&A"):
                gr.Markdown("### Ask questions about the contract")
                with gr.Row():
                    question_input = gr.Textbox(
                        label="Your Question",
                        placeholder="e.g., What is the governing law? Is there a liability cap?",
                        scale=4
                    )
                    ask_btn = gr.Button("Ask", variant="primary", scale=1)
                answer_output = gr.Textbox(label="Answer", lines=6)

                gr.Markdown("#### \U0001f4a1 Example Questions")
                gr.Examples(
                    examples=[
                        ["Does this contract have a confidentiality clause?"],
                        ["What is the governing law?"],
                        ["Is there a limitation of liability?"],
                        ["What are the payment terms?"],
                        ["Can the contract be terminated for convenience?"],
                        ["Are there any non-compete restrictions?"],
                    ],
                    inputs=question_input
                )

        # Event handlers
        analyze_btn.click(
            fn=process_contract,
            inputs=file_input,
            outputs=[clause_output, risk_output, summary_output]
        )

        ask_btn.click(
            fn=ask_question_handler,
            inputs=question_input,
            outputs=answer_output
        )

        question_input.submit(
            fn=ask_question_handler,
            inputs=question_input,
            outputs=answer_output
        )

    return demo