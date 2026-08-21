"""Tests for the preprocessing module."""

import pytest
from preprocess import clean_text, chunk_text


def test_clean_text_normalizes_whitespace():
    text = "Hello   world\n\n\n\nNew   paragraph"
    result = clean_text(text)
    assert "   " not in result
    assert "\n\n\n\n" not in result


def test_clean_text_removes_page_numbers():
    text = "Some content\n 5 \nMore content"
    result = clean_text(text)
    assert "\n 5 \n" not in result


def test_chunk_text_empty():
    assert chunk_text("") == []
    assert chunk_text("   ") == []


def test_chunk_text_short():
    text = "This is a short sentence."
    chunks = chunk_text(text)
    assert len(chunks) == 1


def test_chunk_text_produces_multiple_chunks():
    sentences = [f"This is sentence number {i}." for i in range(100)]
    text = " ".join(sentences)
    chunks = chunk_text(text, chunk_size=50, overlap=10)
    assert len(chunks) > 1
