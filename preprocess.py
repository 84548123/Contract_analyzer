import fitz

def extract_text(file):

    # ✅ Works for both Streamlit & Gradio
    if hasattr(file, "read"):
        doc = fitz.open(stream=file.read(), filetype="pdf")
    else:
        doc = fitz.open(file.name)

    text = ""
    for page in doc:
        text += page.get_text()

    return text