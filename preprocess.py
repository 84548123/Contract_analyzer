"""
Contract text preprocessing module.
Handles PDF text extraction, cleaning, and chunking for transformer models.
"""

import re
import logging
from typing import List

import pymupdf as fitz

logger = logging.getLogger(__name__)


def extract_text(file) -> str:
    """
    Extract text from a PDF file.

    Supports:
    - File paths (strings)
    - Streamlit UploadedFile objects (have .read())
    - Gradio file objects (have .name)

    Args:
        file: PDF file (path string, UploadedFile, or file object)

    Returns:
        Extracted text as string
    """
    try:
        if isinstance(file, str):
            doc = fitz.open(file)
        elif hasattr(file, "read"):
            data = file.read()
            if hasattr(file, "seek"):
                file.seek(0)
            doc = fitz.open(stream=data, filetype="pdf")
        elif hasattr(file, "name"):
            doc = fitz.open(file.name)
        else:
            raise ValueError(f"Unsupported file type: {type(file)}")

        text = ""
        for page in doc:
            page_text = page.get_text()
            if page_text.strip():
                text += page_text + "\n"

        page_count = doc.page_count
        doc.close()

        if not text.strip():
            logger.warning("No text extracted from PDF. The file may be scanned/image-based.")
            return ""

        logger.info(f"Extracted {len(text)} characters from PDF ({page_count} pages)")
        return text

    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise


def clean_text(text: str) -> str:
    """
    Clean and normalize extracted text.

    - Normalizes excessive whitespace and newlines
    - Removes standalone page numbers
    - Removes common header/footer patterns
    - Fixes hyphenated line breaks from OCR
    """
    # Normalize excessive newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Normalize excessive spaces/tabs
    text = re.sub(r'[ \t]+', ' ', text)

    # Remove standalone page numbers
    text = re.sub(r'\n\s*\d{1,3}\s*\n', '\n', text)

    # Remove common header/footer patterns
    text = re.sub(r'\n\s*Page \d+ of \d+\s*\n', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'\n\s*-\s*\d+\s*-\s*\n', '\n', text)

    # Fix hyphenated line breaks (common in OCR)
    text = re.sub(r'(?<=[a-z])- \n(?=[a-z])', '', text)

    return text.strip()


def chunk_text(text: str, chunk_size: int = 512, overlap: int = 128) -> List[str]:
    """
    Split text into overlapping chunks for processing by transformer models.

    Uses sentence-aware splitting to avoid breaking mid-sentence.

    Args:
        text: Input text to chunk
        chunk_size: Approximate number of words per chunk
        overlap: Number of words to overlap between consecutive chunks

    Returns:
        List of text chunks
    """
    if not text or not text.strip():
        return []

    # Clean the text first
    text = clean_text(text)

    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
    sentences = [s.strip() for s in sentences if s.strip()]

    if not sentences:
        return [text] if text.strip() else []

    chunks = []
    current_chunk = []
    current_word_count = 0

    for sentence in sentences:
        word_count = len(sentence.split())

        if current_word_count + word_count > chunk_size and current_chunk:
            # Save current chunk
            chunk_str = ' '.join(current_chunk)
            chunks.append(chunk_str)

            # Calculate overlap: keep last N words worth of sentences
            overlap_sentences = []
            overlap_word_count = 0
            for s in reversed(current_chunk):
                s_words = len(s.split())
                if overlap_word_count + s_words > overlap:
                    break
                overlap_sentences.insert(0, s)
                overlap_word_count += s_words

            current_chunk = overlap_sentences
            current_word_count = overlap_word_count

        current_chunk.append(sentence)
        current_word_count += word_count

    # Don't forget the last chunk
    if current_chunk:
        chunk_str = ' '.join(current_chunk)
        if chunk_str.strip():
            chunks.append(chunk_str)

    logger.info(f"Split text into {len(chunks)} chunks (chunk_size={chunk_size}, overlap={overlap})")
    return chunks