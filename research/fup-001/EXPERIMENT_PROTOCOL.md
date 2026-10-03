# FUP-001 Formal Experiment Protocol v1

## Research objective

Determine whether a compact formal model of UnPeeragogy's evidence-governance process can expose invalid or misleading epistemic transitions that remain possible or ambiguous in prose/schema-based governance.

## Experimental unit

An Alloy command executed against a pinned model revision under a recorded finite scope.

## Primary toolchain

- Alloy Analyzer 6.2.0
- Java 17+
- SAT4J baseline
- Linux execution environment
- JSON artifact output
- Git commit SHA as model identity

## Primary model

`formal/fup-001/model/unpeeragogy.als`

## Hypothesis families

### H1 — Authority separation

Automation must not manufacture substantive human Gate A decisions.

### H2 — State-axis separation

Engine processing, human review, epistemic lifecycle and verification are not mutually inferable without explicit bridge rules.

### H3 — Gate separation

Gate A acceptance does not imply Gate B mutation.

### H4 — Empirical corroboration integrity

Synthetic material cannot, by itself, satisfy empirical corroboration.

### H5 — Provenance integrity

Verified records require traceable evidence.

### H6 — Revision auditability

Revised interpretations preserve predecessor lineage.

### H7 — Independence sensitivity

Corroboration classification is sensitive to the operational definition of independence.

## Negative controls / anti-invariants

The following deliberately naive rules should admit counterexamples:

- distinct source nodes imply independent evidence;
- Gate A ACCEPTED implies Gate B mutation;
- Gate A ACCEPTED implies epistemic CORROBORATED;
- ENGINE_PASSED implies human ACCEPTED;
- verification CONTESTED implies human CONTESTED.

These operate as negative controls: if the model cannot falsify them, either the model is overconstrained or the semantics have been collapsed incorrectly.

## Positive witnesses / vacuity controls

The model must produce instances for:

- a substantive human decision;
- an epistemically corroborated candidate;
- a verified-integrity candidate;
- a revised interpretation;
- Gate A ACCEPTED with Gate B NO_CHANGE;
- Gate A ACCEPTED before a Gate B decision;
- different source nodes with shared lineage root;
- Gate A ACCEPTED without epistemic corroboration;
- CAN-001-shaped historical state.

If the relevant witness is unsatisfiable, a corresponding invariant may be vacuous.

## Scope policy

Start at the committed scope of 6.

Then repeat all commands at larger scopes only after the baseline run is preserved.

Recommended escalation:

- scope 6 — primary minimal-counterexample search;
- scope 8 — replication;
- scope 10 — robustness check if computationally tractable.

A property is reported as:

> No counterexample found up to scope N under model version X and assumptions Y.

Never:

> Proven true.

unless a later proof method justifies that statement.

## Solver replication

Primary: SAT4J.

Optional secondary replication may use another solver reported by `alloy solvers`.

Solver changes must never replace the baseline run.

## Result taxonomy

Every command receives exactly one mechanical classification:

- COUNTEREXAMPLE_FOUND
- NO_COUNTEREXAMPLE_IN_SCOPE
- INSTANCE_FOUND
- NO_INSTANCE_IN_SCOPE
- PARSE_ERROR
- EXECUTION_ERROR

Then a separate researcher classification:

- EXPECTED
- UNEXPECTED_PROTOCOL_FINDING
- MODEL_DEFECT
- ASSUMPTION_SENSITIVITY
- VACUITY
- UNRESOLVED

## Historical consistency requirement

Before Gate C, the model must represent CAN-001:

- processing CANDIDATE;
- Gate A ACCEPTED;
- no requirement for ENGINE_PASSED;
- explicit human decision;
- Gate B NO_CHANGE;
- explicit Gate B decision.

Failure is a model defect or semantic mismatch, not a reason to alter CAN-001.

## Independence ablation

Three rival semantics will be tested:

### IND-L — lineage independence
No common root source lineage.

### IND-R — reporter independence
Different reporting agents, irrespective of source lineage.

### IND-I — incident independence
Different real-world incident/event identity.

Later combinations may include `IND-R ∧ IND-I` or stronger provenance-aware criteria.

The purpose is to measure which epistemic classifications change when independence semantics change.

## Gate C pass rule

Gate C requires at least one result satisfying all of:

1. mechanically generated;
2. non-vacuous;
3. not reducible to ordinary type/schema validation;
4. interpretable as an epistemic-governance failure mode or ambiguity;
5. reproducible from committed artifacts;
6. relevant beyond UnPeeragogy-specific naming.

If no result meets all six conditions, the paper's contribution claim must be weakened or the FAC path abandoned.
