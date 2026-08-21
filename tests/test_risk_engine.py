"""Tests for the risk analysis engine."""

import pytest
from risk_engine import risk_analysis, calculate_risk_score, Severity


def test_risk_analysis_empty_labels():
    risks = risk_analysis([])
    assert len(risks) > 0
    assert all(r["category"] == "Missing Clause" for r in risks)


def test_risk_analysis_all_labels_present():
    labels = [
        "Limitation of Liability", "Cap on Liability", "Indemnification",
        "Termination", "Confidentiality", "Governing Law",
        "Intellectual Property", "Payment Terms", "Non-Compete",
        "Insurance", "Audit Rights", "Warranty"
    ]
    risks = risk_analysis(labels)
    missing_clause_risks = [r for r in risks if r["category"] == "Missing Clause"]
    assert len(missing_clause_risks) == 0


def test_risk_analysis_text_detection_unlimited_liability():
    risks = risk_analysis(
        [],
        contract_text="This contract includes unlimited liability for all parties."
    )
    titles = [r["title"] for r in risks]
    assert "Unlimited Liability Language Detected" in titles


def test_risk_analysis_text_detection_sole_discretion():
    risks = risk_analysis(
        [],
        contract_text="Either party may terminate at sole discretion."
    )
    titles = [r["title"] for r in risks]
    assert "One-Sided Termination Rights" in titles


def test_calculate_risk_score_no_risks():
    result = calculate_risk_score([])
    assert result["score"] == 0
    assert result["grade"] == "A"


def test_calculate_risk_score_with_risks():
    risks = [
        {"severity": "CRITICAL", "title": "test1"},
        {"severity": "HIGH", "title": "test2"},
    ]
    result = calculate_risk_score(risks)
    assert result["score"] > 0
    assert result["grade"] in ["A", "B", "C", "D", "F"]


def test_risk_severity_ordering():
    risks = risk_analysis([])
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    if len(risks) > 1:
        for i in range(len(risks) - 1):
            assert severity_order[risks[i]["severity"]] <= severity_order[risks[i+1]["severity"]]


def test_calculate_risk_score_capped_at_100():
    # Create many risks to exceed 100
    risks = [{"severity": "CRITICAL", "title": f"risk_{i}"} for i in range(10)]
    result = calculate_risk_score(risks)
    assert result["score"] <= 100
    assert result["grade"] == "F"
