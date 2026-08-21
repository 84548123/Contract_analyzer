"""
Contract risk analysis engine.
Evaluates contracts for missing clauses, risky language, and compliance gaps.
Provides severity levels, risk scoring, and actionable recommendations.
"""

import re
import logging
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


@dataclass
class Risk:
    title: str
    description: str
    severity: Severity
    category: str
    recommendation: str

    def to_dict(self) -> dict:
        return {
            "title": self.title,
            "description": self.description,
            "severity": self.severity.value,
            "category": self.category,
            "recommendation": self.recommendation
        }


# Risk rules: (clause_label, severity, title, description, recommendation)
MISSING_CLAUSE_RULES = [
    (
        "Limitation of Liability",
        Severity.CRITICAL,
        "No Liability Limitation",
        "Contract has no clause limiting liability exposure. This exposes the party to unlimited financial risk.",
        "Add a clause capping liability to a fixed amount or multiple of contract value."
    ),
    (
        "Cap on Liability",
        Severity.CRITICAL,
        "No Liability Cap",
        "No explicit cap on liability found. Potential for unbounded financial exposure.",
        "Negotiate a liability cap proportional to the contract value."
    ),
    (
        "Indemnification",
        Severity.HIGH,
        "No Indemnification Clause",
        "Missing indemnification provisions. Parties may not be protected against third-party claims.",
        "Add mutual indemnification clauses covering IP infringement, data breaches, and negligence."
    ),
    (
        "Termination",
        Severity.HIGH,
        "No Termination Clause",
        "No termination provisions found. The contract may be difficult to exit.",
        "Add termination for convenience with reasonable notice period, and termination for cause provisions."
    ),
    (
        "Confidentiality",
        Severity.HIGH,
        "No Confidentiality Clause",
        "Sensitive information shared under this contract may not be protected.",
        "Add confidentiality/NDA provisions with clear definitions of confidential information and obligations."
    ),
    (
        "Governing Law",
        Severity.MEDIUM,
        "No Governing Law",
        "No governing law specified. Disputes may face jurisdictional uncertainty.",
        "Specify the governing law and jurisdiction for dispute resolution."
    ),
    (
        "Intellectual Property",
        Severity.MEDIUM,
        "No IP Provisions",
        "Intellectual property ownership and rights are not addressed.",
        "Clearly define IP ownership, licensing rights, and work-for-hire provisions."
    ),
    (
        "Payment Terms",
        Severity.MEDIUM,
        "No Payment Terms",
        "Payment schedule, amounts, and conditions are not specified.",
        "Define payment milestones, due dates, late payment penalties, and accepted methods."
    ),
    (
        "Non-Compete",
        Severity.LOW,
        "No Non-Compete Clause",
        "No restrictions on competitive activities.",
        "Consider adding non-compete provisions if applicable to protect business interests."
    ),
    (
        "Insurance",
        Severity.MEDIUM,
        "No Insurance Requirements",
        "No insurance requirements specified for risk mitigation.",
        "Require counterparty to maintain appropriate insurance coverage."
    ),
    (
        "Audit Rights",
        Severity.LOW,
        "No Audit Rights",
        "No provisions for auditing compliance with contract terms.",
        "Add audit rights to verify compliance with financial and operational obligations."
    ),
    (
        "Warranty",
        Severity.MEDIUM,
        "No Warranty Provisions",
        "No warranties on deliverables, services, or products.",
        "Add warranties covering quality, fitness for purpose, and defect remediation."
    ),
]

# Severity weights for scoring
SEVERITY_WEIGHTS = {
    Severity.CRITICAL: 25,
    Severity.HIGH: 15,
    Severity.MEDIUM: 8,
    Severity.LOW: 3,
}


def risk_analysis(detected_labels: List[str], contract_text: str = "") -> List[dict]:
    """
    Perform comprehensive risk analysis on a contract.

    Args:
        detected_labels: List of clause category labels found in the contract
        contract_text: Optional full contract text for text-based risk detection

    Returns:
        List of risk dicts with title, description, severity, category, recommendation
    """
    risks = []
    label_set = set(detected_labels)

    # Check for missing clauses
    for clause_label, severity, title, description, recommendation in MISSING_CLAUSE_RULES:
        if clause_label not in label_set:
            risks.append(Risk(
                title=title,
                description=description,
                severity=severity,
                category="Missing Clause",
                recommendation=recommendation
            ))

    # Text-based risk detection
    if contract_text:
        text_lower = contract_text.lower()

        # Check for unlimited liability language
        if any(phrase in text_lower for phrase in [
            "unlimited liability", "without limitation", "no cap on liability"
        ]):
            risks.append(Risk(
                title="Unlimited Liability Language Detected",
                description="Contract contains language suggesting unlimited liability exposure.",
                severity=Severity.CRITICAL,
                category="Risky Language",
                recommendation="Review and negotiate liability caps."
            ))

        # Check for auto-renewal without opt-out
        if "auto-renew" in text_lower or "automatically renew" in text_lower:
            if "notice" not in text_lower or "opt out" not in text_lower:
                risks.append(Risk(
                    title="Auto-Renewal Without Clear Opt-Out",
                    description="Contract may auto-renew without clear termination notice provisions.",
                    severity=Severity.MEDIUM,
                    category="Risky Terms",
                    recommendation="Ensure auto-renewal includes clear opt-out notice period."
                ))

        # Check for one-sided termination
        if "sole discretion" in text_lower and "terminat" in text_lower:
            risks.append(Risk(
                title="One-Sided Termination Rights",
                description="One party may have sole discretion to terminate, creating imbalanced risk.",
                severity=Severity.HIGH,
                category="Risky Terms",
                recommendation="Negotiate mutual termination rights or clear cause-based termination."
            ))

        # Check for broad indemnification
        if "indemnify" in text_lower and "all claims" in text_lower:
            risks.append(Risk(
                title="Overly Broad Indemnification",
                description="Indemnification clause may be too broad, covering 'all claims' without limitation.",
                severity=Severity.HIGH,
                category="Risky Terms",
                recommendation="Narrow indemnification scope to specific, foreseeable risks."
            ))

    # Sort by severity
    severity_order = {Severity.CRITICAL: 0, Severity.HIGH: 1, Severity.MEDIUM: 2, Severity.LOW: 3}
    risks.sort(key=lambda r: severity_order[r.severity])

    return [r.to_dict() for r in risks]


def calculate_risk_score(risks: List[dict]) -> dict:
    """
    Calculate an overall risk score and letter grade.

    Returns:
        Dict with 'score' (0-100), 'grade' (A-F), 'summary'
    """
    if not risks:
        return {"score": 0, "grade": "A", "summary": "No risks detected. Contract appears well-structured."}

    total_penalty = 0
    for risk in risks:
        severity = Severity(risk["severity"])
        total_penalty += SEVERITY_WEIGHTS.get(severity, 5)

    # Cap at 100
    score = min(total_penalty, 100)

    # Letter grade
    if score <= 10:
        grade = "A"
    elif score <= 25:
        grade = "B"
    elif score <= 45:
        grade = "C"
    elif score <= 70:
        grade = "D"
    else:
        grade = "F"

    critical_count = sum(1 for r in risks if r["severity"] == "CRITICAL")
    high_count = sum(1 for r in risks if r["severity"] == "HIGH")

    summary = f"Risk Score: {score}/100 (Grade: {grade}). "
    summary += f"Found {len(risks)} risks: {critical_count} critical, {high_count} high."

    return {"score": score, "grade": grade, "summary": summary}