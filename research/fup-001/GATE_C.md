# FUP-001 Gate C — Non-Trivial Verification

## Current status

**OPEN — baseline insufficient; independence ablation pending.**

## Why the baseline does not yet pass Gate C

The baseline successfully validates the executable architecture, historical consistency and several intended non-implications.

However:

- the holding assertions are regression constraints or consequences of existing model facts;
- four cross-axis anti-invariants demonstrate the deliberate absence of bridge rules;
- these are useful but not yet strong enough, alone, to support a general formal-methods contribution.

The strongest baseline candidate is the provenance result:

`distinct source nodes ≠ independent source lineage`

This becomes non-trivial when tied to a **classification consequence**: whether a claim would be promoted to corroborated under one plausible rule but not another.

## Pass criterion

Gate C passes when committed solver artifacts establish at least one **classification divergence** between plausible independence semantics over the same evidence structure, and the result:

1. is relational/provenance-dependent;
2. is not detectable from static field types alone;
3. is non-vacuous;
4. reproduces at scope 6 and larger tested scopes;
5. is stable across at least two available SAT solvers where operationally possible;
6. remains interpretable without claiming one independence definition is universally correct.

## Candidate general result

If supported by the ablation:

> Evidential independence is not determined by evidence multiplicity alone. Distinct operational definitions of independence can authorize different epistemic state transitions over the same evidence set.

## Stronger candidate result

If source-node multiplicity produces corroboration while shared source lineage blocks it:

> A source-count rule can produce false corroboration relative to a provenance-aware independence criterion, even when every evidence item is individually empirical.

“False” here is always relative to the declared lineage criterion, not metaphysical truth.

## Gate C adjudication outcomes

- **PASS** — classification divergence reproduced and generalisable.
- **PARTIAL** — divergence exists but is solver/scope/assumption fragile.
- **FAIL** — rival semantics do not materially change reachable classifications.
- **REVISE MODEL** — divergence is caused by modelling defect rather than the intended semantic distinction.
