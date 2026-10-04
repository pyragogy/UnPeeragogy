# FUP-001 Gate C — Non-Trivial Verification

## Current status

**PASS — E3 same-structure semantic ablation**

Adjudicated: 2026-10-04

## Evidence

E3 evaluates competing independence semantics over the **same Claim and Evidence structure**.

Committed result matrix:

`formal/fup-001/results/semantic-ablation/E3_RESULT_MATRIX.csv`

Raw runs:

- SAT4J scope 6
- SAT4J scope 8
- SAT4J scope 10
- Glucose scope 6

All 10 E3 commands retained the same SAT classification across every tested scope/solver.

## Gate C pass criterion

Gate C required at least one classification divergence between plausible independence semantics over the same evidence structure such that the result:

1. is relational/provenance-dependent;
2. is not detectable from static field types alone;
3. is non-vacuous;
4. reproduces at scope 6 and larger tested scopes;
5. is stable across at least two available SAT solvers where operationally possible;
6. can be interpreted without claiming one definition is universally correct.

E3 satisfies all six conditions.

## Primary Gate C result

The strongest result is:

`SourceCorroborationImpliesLineageCorroboration` → **SAT counterexample**

Minimal structure:

- two empirical evidence items;
- distinct immediate source atoms;
- both attached to the same provenance root;
- source-node corroboration holds;
- lineage corroboration does not.

Therefore:

> Source multiplicity can authorize a corroboration transition that a provenance-lineage criterion rejects, even when all evidence items are individually empirical.

This is a classification consequence, not merely a structural observation.

## Additional semantic divergences

E3 also produced SAT witnesses for:

- reporter corroboration without incident corroboration;
- incident corroboration without reporter corroboration;
- reporter corroboration without lineage corroboration;
- incident corroboration without lineage corroboration.

A strong agreement witness is also SAT: a sufficiently diverse evidence set can satisfy lineage, reporter and incident independence simultaneously.

## Scientific interpretation

Supported:

> Evidential independence is not determined by evidence multiplicity alone. Distinct operational definitions of independence can authorize different epistemic state transitions over the same evidence structure.

Not supported:

- that lineage independence is universally the correct definition;
- that every source-multiplicity classification is epistemically false;
- that bounded Alloy checking proves universal truth;
- that all domains require reporter + incident + lineage independence simultaneously.

## Important qualification

Some reporter/incident divergences in the minimal Alloy instances exploit absent metadata (e.g. reporter present but incident unassigned). These are valid semantic-sensitivity witnesses but are weaker than the source-vs-lineage result.

Gate D will therefore include **metadata-complete adversarial variants** requiring reporter and incident assignments on all compared evidence items.

The source-vs-lineage result does not depend on missing reporter/incident metadata and is the primary Gate C contribution.

## E2 robustness result

Commit `7d32a73` is retained separately as E2:

> Core governance properties remained classification-invariant when the global independence predicate was replaced by lineage-, reporter-, or incident-based definitions across tested scopes.

E2 supports robustness of the kernel; E3 establishes semantic classification sensitivity.

## Gate C verdict

**PASS**

Proceed to Gate D — Adversarial Validation.
