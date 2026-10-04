# Counterexample Record — Naive_EnginePassedImpliesAccepted

- **Run ID:** 20261004T065836Z-primary
- **Command:** check Naive_EnginePassedImpliesAccepted for 6
- **Model commit:** 8939f8c047de8cacffe1a68d8204ff69d6f46ff0
- **Model file:** formal/fup-001/model/unpeeragogy.als
- **Alloy version:** 6.2.0
- **Alloy JAR SHA-256:** 6b8c1cb5bc93bedfc7c61435c4e1ab6e688a242dc702a394628d9a9801edb78d
- **Solver:** SAT4J
- **Scope:** 6
- **Result:** COUNTEREXAMPLE_FOUND
- **Expected?:** yes — anti-invariant N-04

## Raw artifact

`solutions/Naive_EnginePassedImpliesAccepted-solution-0.json`

Skolems: `c` = Candidate$0.

## Minimal structural summary

Candidate$0 has `processing = PS_ENGINE_PASSED` while `human = HR_PENDING` (or another non-HR_ACCEPTED status). No HumanDecision with HR_ACCEPTED maps to Candidate$0. The assertion `processing=PS_ENGINE_PASSED ⇒ human=HR_ACCEPTED` fails because engine processing outcome does not imply human acceptance.

## Classification

- [x] intended anti-invariant witness