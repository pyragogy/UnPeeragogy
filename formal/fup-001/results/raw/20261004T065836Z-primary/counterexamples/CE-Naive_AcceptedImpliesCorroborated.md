# Counterexample Record — Naive_AcceptedImpliesCorroborated

- **Run ID:** 20261004T065836Z-primary
- **Command:** check Naive_AcceptedImpliesCorroborated for 6
- **Model commit:** 8939f8c047de8cacffe1a68d8204ff69d6f46ff0
- **Model file:** formal/fup-001/model/unpeeragogy.als
- **Alloy version:** 6.2.0
- **Alloy JAR SHA-256:** 6b8c1cb5bc93bedfc7c61435c4e1ab6e688a242dc702a394628d9a9801edb78d
- **Solver:** SAT4J
- **Scope:** 6
- **Result:** COUNTEREXAMPLE_FOUND
- **Expected?:** yes — anti-invariant N-03

## Raw artifact

`solutions/Naive_AcceptedImpliesCorroborated-solution-0.json`

Skolems: `c` = Candidate$2.

## Minimal structural summary

Candidate$2 has `epistemic` ≠ ES_CORROBORATED while `human = HR_ACCEPTED`. Demonstates that human Gate A acceptance does not automatically constitute epistemic corroboration.

## Classification

- [x] intended anti-invariant witness