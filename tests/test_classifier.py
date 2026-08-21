"""Tests for the classifier module."""

import pytest

try:
    from classifier import DEFAULT_CATEGORIES
except ImportError:
    pytest.skip("transformers not installed", allow_module_level=True)


def test_default_categories_not_empty():
    assert len(DEFAULT_CATEGORIES) > 0


def test_default_categories_has_key_types():
    assert "Confidentiality" in DEFAULT_CATEGORIES
    assert "Termination" in DEFAULT_CATEGORIES
    assert "Governing Law" in DEFAULT_CATEGORIES
    assert "Limitation of Liability" in DEFAULT_CATEGORIES
    assert "Non-Compete" in DEFAULT_CATEGORIES
    assert "Indemnification" in DEFAULT_CATEGORIES


def test_default_categories_count():
    assert len(DEFAULT_CATEGORIES) == 30
