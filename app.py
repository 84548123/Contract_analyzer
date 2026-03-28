import streamlit as st
from preprocess import extract_text, chunk_text
from classifier import predict_advanced
from risk_engine import risk_analysis

st.title("📄 Contract Clause Analyzer")

uploaded_file = st.file_uploader("Upload Contract PDF")

if uploaded_file:
    text = extract_text(uploaded_file)
    chunks = chunk_text(text)

    detected_labels = []

    st.subheader("Extracted Clauses")

    for chunk in chunks:
        result = predict_advanced(chunk)
        if result['scores'][0] > 0.7:
            label = result['labels'][0]
            detected_labels.append(label)

            st.write(f"### {label}")
            st.write(chunk[:300])

    risks = risk_analysis(detected_labels)

    st.subheader("Risk Analysis")
    for r in risks:
        st.write(r)