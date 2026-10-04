# FUP-001 Context Keeper

**Role:** persistent context-control sub-agent specification  
**Scientific authority:** none  
**Purpose:** prevent loss of assumptions, decisions, unresolved contradictions and provenance while the formalisation evolves.

The Context Keeper does not decide whether a scientific claim is true. It records what the research team currently believes, why, and what would require revision.

## Operating contract

At the beginning of every FUP-001 work cycle:

1. read this file;
2. read `SEMANTIC_RECONSTRUCTION_v0.1.md`;
3. read `AMBIGUITY_REGISTER.md`;
4. read `CLAIM_EVIDENCE_LEDGER.md`;
5. inspect changes since the last recorded checkpoint.

At the end of every work cycle update only facts that actually changed.

## What must be tracked

### Stable facts
Repository-backed statements whose source location is known.

### Modelling assumptions
Choices introduced by FUP-001 that are not explicitly guaranteed by UnPeeragogy.

### Open ambiguities
Protocol statements with more than one defensible formal interpretation.

### Decisions
Formalism choices, scope reductions, rejected modelling approaches and their rationale.

### Counterexamples
Every counterexample found, including those later made impossible by model revision.

### Debt
Known missing evidence, untested properties, incomplete case reconstructions and tool limitations.

## Anti-drift rules

- Never convert an assumption into a protocol fact without repository evidence.
- Never erase superseded decisions; mark them superseded and link the replacement.
- Never summarise `ACCEPTED` as “true”.
- Never collapse human review status, epistemic status and verification status.
- Never equate two URLs with two independent evidential origins.
- Never call an Alloy assertion “proved” merely because bounded checking found no counterexample.
- Never call an AI-generated proposal evidence.

## Current checkpoint — CK-001

Date: 2026-10-03

### Stable findings

- `HumanReviewStatus` is explicitly separate from `ProcessingStatus`.
- `EvidenceStatus` is explicitly separate from `VerificationStatus`.
- Gate A and Gate B are explicitly separate.
- automation may create `PENDING` candidates but must not assign substantive human decisions.
- synthetic scenarios are allowed but must not count as empirical evidence.
- provenance and revision history are normative concepts.
- “Corroborated” appears on both epistemic and verification axes, with different meanings implied by context.

### Modelling decisions

- Do not build a single linear state machine.
- Begin with Alloy 6 as an exploratory relational model.
- Treat human judgment as an exogenous decision event whose **admissibility/auditability** can be checked; do not pretend the model can infer the human judgment itself.
- Use source-lineage independence only as a provisional formal proxy until “independent incidents” is semantically resolved.

### Open blockers

- Define independence: independent source, independent reporter, independent incident, or some combination.
- Define minimum corroboration cardinality beyond the prose term “multiple”.
- Resolve whether provenance is mandatory for Gate A `ACCEPTED` or only for research-grade/verified promotion.
- Define semantics of “human judgment always overrides” when the override violates a machine-checkable invariant.
- Define whether `CONTESTED` human status and `contested` epistemic/verification states require synchronization.
- Define formal publication state for Gate B.

### Tool limitation

This checkpoint specifies the sub-agent role persistently in-repository. The current chat runtime does not expose an independent long-lived sub-agent process, so scientific outputs must not claim that an autonomous Context Keeper has executed unless such a process is actually instantiated. This file is the handoff contract for that role.


## Checkpoint — CK-002

Date: 2026-10-03

### New evidence inspected

- `runs/candidates/CAN-001.yaml`

### New stable findings

- CAN-001 was Gate A `ACCEPTED` while engine verdict fields remained null.
- CAN-001 then received a separate Gate B `NO_CHANGE` decision.
- The record explicitly states that Gate A acceptance permits epistemic use but does not authorize vault mutation.
- `publication_review` exists in the operational YAML record but is not represented in `CandidateEvidence` in `src/data/candidate-schemas.ts`.

### Model revision

The initial binary `PUBLISHED/UNPUBLISHED` abstraction was rejected as too coarse. Gate B is now modelled as a decision object with at least `PENDING`, `NO_CHANGE`, and `MUTATION_APPROVED`.

### Scientific significance

This is the first instance where historical reconstruction changed the formal model rather than merely confirming it. Preserve it as evidence that replay is functioning as an adversarial refinement mechanism.


## Checkpoint — CK-003

Date: 2026-10-04

### Baseline run received

Results commit: `fbd451dca4365be44308be698f2724a821edcf5d`

Confirmed from raw commit artifacts:

- Alloy 6.2.0, SAT4J, scope 6;
- four holding assertions UNSAT;
- five intended anti-invariants SAT with counterexamples;
- all major state witnesses SAT;
- `can001Shape` SAT;
- raw JAR hash and environment preserved.

### Methodological correction

The baseline “holding” assertions are regression/sanity constraints because they are entailed directly or indirectly by model facts. They are not independent discoveries and do not by themselves pass Gate C.

The baseline vacuity terminology is also narrowed: witness reachability is not equivalent to proving a forbidden condition would otherwise be reachable.

### Gate C direction

Primary target is now **independence semantic sensitivity**.

The v0.2 ablation compares:

- source-node multiplicity;
- source-lineage independence;
- reporter independence;
- incident independence.

Gate C remains OPEN until classification divergence is mechanically reproduced across scopes and, where possible, solvers.


## Checkpoint — CK-004

Date: 2026-10-04

### E2 adjudication

Commit `7d32a73` is retained as a valid robustness experiment.

It substituted lineage/reporter/incident definitions into separate baseline kernels and found no classification change in the baseline governance suite. It does not test same-structure semantic sensitivity.

### E3 result

Same-structure semantic ablation completed.

Result matrix:

- 10 commands;
- SAT4J scopes 6, 8, 10;
- Glucose scope 6;
- 40/40 classifications SAT;
- no solver/scope disagreement.

Primary counterexample:

- two empirical evidence items;
- distinct immediate source nodes;
- shared provenance root;
- source-node corroboration = true;
- lineage corroboration = false.

### Gate C

**PASS**

Reason: the primary E3 counterexample is a non-trivial relational classification divergence, reproduced across scopes and solvers, and not reducible to static schema/type validation.

### Qualification

Reporter/incident minimal witnesses sometimes rely on missing metadata. Do not elevate those examples to the primary claim before metadata-complete adversarial tests.

### Next gate

Gate D — Adversarial Validation.

Primary attack targets:

1. force complete reporter + incident metadata;
2. require exactly two evidence items where possible;
3. test duplicated derivation through multi-parent source lineage;
4. test whether stronger conjunctions accidentally overconstrain corroboration;
5. test symmetry/renaming artifacts;
6. test source-lineage counterexample under stricter empirical/traceability assumptions.


## Checkpoint — CK-005

Date: 2026-10-04

### E4 / Gate D

Adversarial validation completed.

Conditions imposed:

- reporter mandatory;
- incident mandatory;
- exactly two evidence items.

Replications:

- SAT4J scopes 6, 8, 10;
- Glucose scope 6.

Primary result:

`ADV_AllSurfaceDiversitySharedLineage` is SAT.

Thus two evidence items can simultaneously have:

- different immediate source nodes;
- different reporters;
- different incidents;

while sharing provenance lineage.

Positive control `ADV_AllDimensionsIndependent` is also SAT.

### Gate D

**PASS**

Interpretation:

The semantic divergence found in E3 is not explained solely by missing reporter/incident metadata, excess cardinality, or an overconstrained model.

Do not claim lineage is universally superior. Claim only formal non-interchangeability / orthogonality under the declared model.

### Next gate

Gate E — Historical Reconstruction.

Need real cases that exercise:
- source multiplicity vs common lineage;
- reporter vs incident independence;
- Gate A / Gate B separation;
- revision / contested history;
- AI-assisted acquisition without AI output becoming evidence.


## Checkpoint — CK-006

Date: 2026-10-04

### E5 historical replay

Commit: `eda8ecc3de5d413f2d5e16decc0c274bc0a37e44`

Results:
- CAN002_PendingShape: SAT across SAT4J s6/s8/s10 and Glucose s6;
- CAN003_SharedProvenanceShape: SAT across all runs;
- CAN003_MultipleSourcesImplyIndependentOrigins: SAT counterexample across all runs;
- IndependentDocumentaryPairReachable: SAT across all runs.

### Gate E

**PASS WITH DOCUMENTED COVERAGE GAPS**

Historical bridge:
CAN-003 contains an explicit warning that research pages and paper share authors/datasets and are not independent corroboration. This is structurally aligned with the E3/E4 source-node vs provenance-lineage distinction.

Qualification:
the replay uses a conservative shared-origin abstraction. It does not establish a complete real-world lineage graph or prove that the Alloy lineage predicate is uniquely correct.

### Missing coverage

- no repository-backed CONTESTED/REVISE case;
- no AI-assisted acquisition case.

### Decision

Freeze exploratory FUP-001 E1–E5 before manuscript drafting.

Next phase: full epistemic audit, independent re-verification, adversarial model review, claim/evidence traceability, and systematic related-work search.


## Checkpoint — CK-007

Date: 2026-10-04

### Pre-paper adversarial audit

FUP-001 manuscript work is frozen.

New audit artifacts:
- `A0_INVENTORY_AUDIT.md`
- `A1_FORMAL_AUDIT.md`
- `A2_HISTORICAL_AUDIT.md`
- `A3_EPISTEMOLOGICAL_AUDIT.md`
- `NOVELTY_AUDIT_v0.1.md`
- `CLAIM_AUDIT_MATRIX_v0.1.md`
- `SCIENTIFIC_STATUS_2026-10-04.md`
- `AUDIT_MASTER_STATUS.md`
- `E6_DESIGN_GATE.md`

Current scientific verdict:

**OUTCOME B — INTERESTING BUT INCOMPLETE**

Key corrections:
- source multiplicity != independence is prior art, not headline novelty;
- multi-agent multiplicity != evidence multiplicity is directly addressed by 2026 prior work;
- E3/E4 remain valid bounded model results but are definition-sensitive;
- E5 is representability/history alignment, not proof of unique lineage semantics;
- CAN-002 also exhibits documentary/provenance duplication because project page, DOI and open PDF belong to the same underlying study/publication;
- CAN-003 external sources support project-to-paper continuity and shared investigators/data context;
- residual possible contribution is methodological: executable multi-axis epistemic governance + invalid bridge-rule counterexamples + historical replay/co-refinement.

No production redesign should be performed merely to strengthen the research claim.

E6 remains design-only until deeper related-work review justifies execution.
