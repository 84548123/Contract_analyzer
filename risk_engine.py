def risk_analysis(clauses):
    risks = []
    labels = [c for c in clauses]

    if "Liability Cap" not in labels:
        risks.append("⚠️ No liability cap → High risk")

    if "Termination" not in labels:
        risks.append("⚠️ No termination clause")

    return risks