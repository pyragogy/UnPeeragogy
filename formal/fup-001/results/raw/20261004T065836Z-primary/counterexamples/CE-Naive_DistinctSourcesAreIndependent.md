# Counterexample Record — Naive_DistinctSourcesAreIndependent

- **Run ID:** 20261004T065836Z-primary
- **Command:** check Naive_DistinctSourcesAreIndependent for 6
- **Model commit:** 8939f8c047de8cacffe1a68d8204ff69d6f46ff0
- **Model file:** formal/fup-001/model/unpeeragogy.als
- **Alloy version:** 6.2.0
- **Alloy JAR SHA-256:** 6b8c1cb5bc93bedfc7c61435c4e1ab6e688a242dc702a394628d9a9801edb78d
- **Solver:** SAT4J
- **Scope:** 6
- **Result:** COUNTEREXAMPLE_FOUND
- **Expected?:** yes — anti-invariant N-01

## Raw artifact

`solutions/Naive_DistinctSourcesAreIndependent-solution-0.json`

Skolems: `s1` = Source$1, `s2` = Source$0.

## Minimal structural summary

Two Source atoms (Source$0, Source$1) whose root sets intersect through the parent relation lineage, violating `independent`. This demonstrates that distinct source nodes are not automatically independent.

## Classification

- [x] intended anti-invariant witness