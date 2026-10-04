# FUP-001 — Adversarial Scientific Audit

## Status

**OPEN — PRE-PAPER REVIEW**

Gate F and Gate G are frozen until this audit is complete.

## Audit question

> Do E1–E5 contain a non-trivial, reproducible and scientifically defensible contribution, or are the apparent findings primarily consequences of modelling choices, repository-specific semantics, or interpretive overreach?

The audit is permitted to conclude:

> **No publishable scientific contribution has yet been established.**

That outcome is methodologically valid.

## Non-negotiable separation of levels

Every claim must be decomposed across six levels.

1. **Repository fact** — directly present in committed project records, code, protocol or historical artefacts.
2. **Modelling assumption** — a representation choice introduced to make the system executable.
3. **Mechanical result** — solver output or other deterministic computational result.
4. **Historical observation** — what is documented in a real historical case.
5. **Interpretation** — what the research team infers from facts/results.
6. **Generalisation** — what is proposed beyond the specific repository/model/case.

No audit entry may collapse levels 2→3→5→6 into one statement.

## Claim states

Each claim receives one aggregate state:

- `UNEXAMINED`
- `SUPPORTED`
- `CONDITIONAL`
- `REDUNDANT`
- `UNDERDETERMINED`
- `FALSIFIED`
- `NOVELTY_UNKNOWN`

These are audit states, not epistemic truth labels.

## Required trace for every surviving claim

```
Claim
  -> source/provenance
  -> modelling assumptions
  -> executable test or documentary evidence
  -> mechanical/historical result
  -> interpretation
  -> strongest objection
  -> known limitation
  -> falsifier
```

A claim that cannot be reconstructed across this chain is not eligible for manuscript use.

## Audit attacks

### Attack 1 — Formal audit

Purpose: determine whether formal findings are non-trivial and robust.

Required checks include:

- facts that make assertions tautological;
- assertions that merely restate facts;
- vacuous antecedents;
- unconstrained atoms or relations;
- degenerate counterexamples;
- scope sensitivity;
- solver sensitivity;
- alternate plausible definitions of provenance lineage;
- alternate root semantics;
- partial overlap rather than binary shared lineage;
- shared authors with distinct datasets;
- shared dataset with distinct analyses;
- common institution but distinct evidential origin;
- sources derived from multiple independent roots;
- citation/republication chains;
- cardinality effects;
- whether positive controls remain reachable.

The goal is to break the formal interpretation, not defend it.

### Attack 2 — Historical audit

Purpose: reconstruct CAN-001/002/003 from immutable or primary historical sources while temporarily ignoring the existing interpretive summaries.

For every field:
- record documented value;
- use `UNKNOWN` when unsupported;
- distinguish event from later interpretation;
- do not infer negative decisions from missing records;
- do not infer independence from URL multiplicity;
- do not infer lineage structure beyond documentary support.

### Attack 3 — Epistemological audit

Purpose: determine whether key concepts have been compressed into unjustified scalar definitions.

At minimum distinguish:

- source-node independence;
- provenance-lineage independence;
- reporter independence;
- incident independence;
- dataset independence;
- analytical-method independence;
- institutional independence;
- causal/evidential origin independence.

Question under attack:

> Is “independence” a single relation at all, or a multidimensional family whose relevance depends on the epistemic transition being authorized?

No preferred answer is assumed.

### Attack 4 — Novelty audit

Purpose: determine what, if anything, is scientifically new.

Required related-work areas include:

- data and information provenance;
- evidence graphs;
- argumentation systems;
- defeasible reasoning;
- source dependence and corroboration;
- information cascades / common-source effects;
- formal epistemology;
- multi-agent epistemic systems;
- human-in-the-loop verification;
- formal methods for socio-technical systems;
- AI governance and epistemic accountability;
- provenance-aware RAG / agentic systems.

Possible outcomes:

1. known problem + trivial formalisation;
2. known problem + useful new formalisation/application;
3. known concepts + novel integration;
4. genuinely novel distinction/result;
5. novelty cannot yet be established.

## Claim inventory schema

| ID | Claim | Exact source | Level | Dependencies | Initial state |
|---|---|---|---|---|---|
| C-XX | ... | file + heading/line | 1–6 | assumptions/evidence | UNEXAMINED |

No paraphrased claim enters the inventory without the exact originating text also being preserved.

## Final audit matrix

| ID | Claim | Formal | Historical | Epistemological | Novelty | Strongest objection | Aggregate state |
|---|---|---|---|---|---|---|---|

## Stop conditions

Stop manuscript preparation if any of the following holds:

- central result is tautological or fact-entailing;
- historical analogue depends on reconstructed facts not present in the record;
- key formal result disappears under equally plausible semantics;
- claimed novelty is already established substantially in prior literature;
- contribution reduces to repository-specific implementation detail;
- interpretation depends on AI-generated text rather than evidence.

## Outcomes

### Outcome A — Strong contribution

A small set of claims survives all four attacks.

Action: construct manuscript around only those claims.

### Outcome B — Interesting but incomplete

Some claims survive conditionally but require new empirical/formal work.

Action: design new experiments before manuscript drafting.

### Outcome C — No current scientific contribution

Claims are redundant, underdetermined, repository-specific or non-novel.

Action: use the audit to redesign UnPeeragogy and repeat the research cycle.

## Current rule

**No manuscript prose is to be treated as authoritative while this audit is open.**
