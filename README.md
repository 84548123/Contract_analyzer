# 📄 Contract Clause Extraction & Analysis Engine

## 🚀 Overview
Contract review is one of the most time-consuming and expensive tasks in legal and business workflows. This project presents an AI-powered system that automates the extraction, analysis, and querying of legal clauses from commercial contracts.

Using Natural Language Processing (NLP) and zero-shot learning, the system can identify key clauses, answer user queries, and highlight potential risks — all through an interactive interface.

---

## 🎯 Problem Statement
Given a set of legal contracts, build a system that can:
- Extract important clause types (e.g., Confidentiality, Liability)
- Handle long and complex legal documents
- Answer natural language questions about contract content
- Identify risks such as missing clauses

---

## 🧠 Key Features

### 🔍 Clause Extraction
- Uses zero-shot classification (`facebook/bart-large-mnli`)
- Identifies clauses like:
  - Confidentiality
  - Termination
  - Limitation of Liability
  - Governing Law
  - Payment Terms
- Handles long contracts using chunking

---

### 💬 Question Answering System
Ask natural language questions like:
- *Does this contract have a confidentiality clause?*
- *What is the governing law?*
- *Is there a liability clause?*

The system returns:
- Answer (Yes/No)
- Confidence score
- Extracted clause text

---

### ⚠️ Risk Analysis
Automatically detects potential risks:
- Missing liability clause → High risk
- Missing termination clause → Business risk

---

### 🌐 Interactive UI (Gradio)
- Upload PDF contracts
- Extract clauses instantly
- Ask questions in real-time
- View results in a clean interface

---

## 🏗️ System Architecture


---

## 🧰 Tech Stack

| Component | Technology |
|----------|-----------|
| Language | Python |
| NLP Model | HuggingFace Transformers (BART-MNLI) |
| UI | Gradio |
| PDF Processing | PyMuPDF |
| Dataset | CUAD (Contract Understanding Atticus Dataset) |

---

## 📊 Dataset

**CUAD Dataset**
- 510 real-world contracts
- 13,000+ annotations
- 41 clause categories

Source: https://huggingface.co/datasets/theatticusproject/cuad-qa

---

## ⚙️ Installation

```bash
git clone https://github.com/YOUR_USERNAME/contract-clause-analyzer.git
cd contract-clause-analyzer

pip install -r requirements.txt
