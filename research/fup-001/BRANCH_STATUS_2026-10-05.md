# FUP-001 — Branch Status

**Date:** 2026-10-05  
**Branch:** `fup-001/formal-kernel`  
**PR:** #12 (draft)  
**Role:** isolated formal-research laboratory feeding UnPeeragogy's Monthly Scientific Audit.

## Executive status

FUP-001 is no longer being driven toward a paper.

The branch now serves as a preserved experimental record for:

- semantic reconstruction of UnPeeragogy governance;
- Alloy models;
- solver artifacts and replications;
- historical replay;
- adversarial claim audit;
- novelty/epistemological review;
- candidate future experiments.

The production project on `main` now uses a recurring **Monthly Scientific Audit** as its continuity mechanism.

## Branch topology

At the 2026-10-05 checkpoint:

- branch head: `fc83dcb795b180d39a57d23fcb079757df831e8c`;
- branch is **82 commits ahead** of the merge base;
- branch is **19 commits behind `main`**;
- PR #12 contains **515 changed files**, largely because raw formal-verification outputs are preserved;
- PR #12 remains **draft and unmerged**.

Therefore:

> **Do not merge PR #12 wholesale.**

Any production-worthy result should be promoted selectively to `main` with explicit review.

## What FUP-001 established

### Strong / useful

1. UnPeeragogy governance is better represented as multiple distinct axes than as one state machine.
2. Gate A and Gate B are distinct decisions.
3. Automated processing status must not be treated as human epistemic authority.
4. Historical replay can reveal defects in the formal abstraction and schema.
5. Invalid bridge rules between state axes can be made executable and counterexample-tested.
6. The project has a reproducible Alloy evidence trail across multiple scopes and solvers.

### Bounded / conditional

1. Source-node, reporter, incident and lineage relations are non-interchangeable **in the tested models**.
2. Same-structure independence semantics can produce different corroboration classifications.
3. Historical cases CAN-002/CAN-003 exhibit documentary multiplicity with shared project/study provenance.

### Downgraded / not novel

1. Source multiplicity != evidential independence.
2. Agent multiplicity != evidence multiplicity.
3. Provenance matters for corroboration.
4. Evidential independence is multi-dimensional.

These are established in prior literature and cannot carry a novelty claim.

## Claim audit

The original 100-claim extraction at commit `3bbaf54` contained incorrect hand-written summary counts.

Mechanically recomputed inventory:

| Category | Count |
|---|---:|
| Repository fact | 3 |
| Modelling assumption | 5 |
| Mechanical result | 13 |
| Historical observation | 20 |
| Interpretation | 56 |
| Generalisation | 3 |
| **Total** | **100** |

Independent audit verdicts:

| State | Count |
|---|---:|
| SUPPORTED | 51 |
| CONDITIONAL | 35 |
| REDUNDANT | 5 |
| UNDERDETERMINED | 2 |
| FALSIFIED | 5 |
| NOVELTY_UNKNOWN | 2 |

Important correction:
the two “conflicts” originally reported by Pi are not established logical contradictions.

- C-035 vs C-039 = unresolved semantic ambiguity.
- C-062 vs C-067 = decontextualisation risk, not contradiction.

## Audit files now authoritative

- `ADVERSARIAL_SCIENTIFIC_AUDIT.md`
- `A0_INVENTORY_AUDIT.md`
- `A1_FORMAL_AUDIT.md`
- `A2_HISTORICAL_AUDIT.md`
- `A3_EPISTEMOLOGICAL_AUDIT.md`
- `NOVELTY_AUDIT_v0.1.md`
- `CLAIM_AUDIT_MATRIX_v0.1.md`
- `SCIENTIFIC_STATUS_2026-10-04.md`
- `AUDIT_MASTER_STATUS.md`
- `E6_DESIGN_GATE.md`
- `CONTEXT_KEEPER.md` CK-007

## Current scientific verdict

**OUTCOME B — INTERESTING BUT INCOMPLETE**

There is a serious formal and historical research artifact.

There is not yet an established novel publishable contribution.

The strongest residual research direction is not a universal theory of evidential independence. It is:

> executable epistemic governance for a live human–AI knowledge system: explicit separation of evidence, processing, authority and publication transitions; adversarial testing of invalid bridge rules; and historical replay that can revise the specification.

Novelty of this residual methodology remains unresolved.

## Relationship to Monthly Scientific Audit

FUP-001 should now feed the recurring audit process on `main`.

Recommended promotion pattern:

```
formal branch experiment
        ↓
adversarial audit
        ↓
bounded finding / limitation
        ↓
curated monthly scientific audit on main
        ↓
optional protocol change after human review
```

A formal experiment does not automatically modify production UnPeeragogy.

A paper is optional and downstream.

## E6

`E6_DESIGN_GATE.md` remains **DESIGN ONLY**.

Do not execute E6 merely to continue the sequence.

Only execute if a future monthly audit identifies a concrete unresolved governance question for which the proposed multidimensional policy model can discriminate among plausible alternatives.

## Next branch actions

1. Preserve E1–E5 and audit artifacts unchanged.
2. Do not rebase/merge merely to synchronise with `main`.
3. Promote only selected stable findings to the Monthly Scientific Audit.
4. Keep PR #12 draft.
5. Treat future formal experiments as new explicit audit probes, not as automatic “Gate F/G” progression.
