# Review of commit 7d32a73 — Independence Experiment Adjudication

## Verdict

**VALID ROBUSTNESS EXPERIMENT — NOT THE PLANNED SEMANTIC ABLATION**

Commit: 7d32a7386846461c00da5b4990c79591d56a89a9

Pi created three variants of the original kernel (lineage, reporter, incident) and reran the baseline property suite. The invariance across scopes/solvers is a useful robustness result.

It establishes that the baseline governance properties — Gate A/Gate B separation, machine/human separation, revision constraints, and CAN-001 consistency — are insensitive within tested bounds to substituting those three definitions of independence.

It does **not** test whether the same evidence set changes corroboration classification under rival independence semantics. Therefore it does not falsify the semantic-sensitivity hypothesis.

Gate C remains OPEN.

Use 7d32a73 in the paper, if appropriate, as **E2 — Kernel robustness under substituted independence semantics**.
