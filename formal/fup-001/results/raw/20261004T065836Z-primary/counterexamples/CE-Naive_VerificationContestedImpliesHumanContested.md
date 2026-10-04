# Counterexample Record — Naive_VerificationContestedImpliesHumanContested

- **Run ID:** 20261004T065836Z-primary
- **Command:** check Naive_VerificationContestedImpliesHumanContested for 6
- **Model commit:** 8939f8c047de8cacffe1a68d8204ff69d6f46ff0
- **Model file:** formal/fup-001/model/unpeeragogy.als
- **Alloy version:** 6.2.0
- **Alloy JAR SHA-256:** 6b8c1cb5bc93bedfc7c61435c4e1ab6e688a242dc702a394628d9a9801edb78d
- **Solver:** SAT4J
- **Scope:** 6
- **Result:** COUNTEREXAMPLE_FOUND
- **Expected?:** yes — anti-invariant N-05

## Raw artifact

`solutions/Naive_VerificationContestedImpliesHumanContested-solution-0.json`

Skolems: `c` = Candidate$0.

## Minimal structural summary

Candidate$0 has `verification = VS_CONTESTED` while `human ≠ HR_CONTESTED`. Demonstrates that the same lexical term ("contested") on different axes (verification vs. human review) does not imply synchronization. A candidate may be verification-contested while its human review status remains PENDING, ACCEPTED, etc.

## Classification

- [x] intended anti-invariant witness