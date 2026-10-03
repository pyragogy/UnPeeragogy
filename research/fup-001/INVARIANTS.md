# FUP-001 Invariant Catalogue v0.1

## Class A — repository-grounded

### I-01 — Human authority
A substantive Gate A decision must be attributable to a human actor.

**Violation:** automation sets ACCEPTED, REJECTED, REVISE, NEEDS_EVIDENCE or CONTESTED.

### I-02 — Axis separation
Processing, human review, epistemic status and verification status are independent dimensions unless an explicit bridge rule exists.

**Violation:** `ENGINE_PASSED ⇒ ACCEPTED` or `ACCEPTED ⇒ corroborated` merely by name/workflow proximity.

### I-03 — Gate separation
Gate A and Gate B are distinct acts.

**Required witness:** a valid state with Gate A ACCEPTED and no Gate B mutation.

### I-04 — Synthetic exclusion
Synthetic/composite scenarios cannot satisfy empirical evidence counts.

### I-05 — Revision history
A revised interpretation has an auditable predecessor.

### I-06 — Verified traceability
A verified research object cannot rely exclusively on untraceable evidence.

## Class B — explicit formalisation assumptions

### A-01 — Independence proxy
For v0.1, two source-backed evidence items are independent when their source-lineage root sets are disjoint.

This is intentionally provisional.

### A-02 — “Multiple” means at least two
Used only to make `corroborated` executable in the first bounded model.

### A-03 — Acceptance basis abstraction
A non-empty `basis` relation stands in for the richer rationale required by the review ledger.

## Class C — anti-invariants / rules expected to be falsified

These are deliberately checked because a useful counterexample demonstrates why a simpler governance implementation would be wrong.

- N-01: different source nodes imply independence;
- N-02: ACCEPTED implies PUBLISHED;
- N-03: ACCEPTED implies epistemic CORROBORATED;
- N-04: ENGINE_PASSED implies ACCEPTED;
- N-05: verification CONTESTED implies human-review CONTESTED.

## Gate C criterion

FUP-001 does not pass the non-trivial verification gate merely because Class A assertions hold.

Gate C requires at least one counterexample or property that exposes a semantic failure mode not already caught by ordinary TypeScript/schema validation.
