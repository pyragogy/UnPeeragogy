# FUP-001 — E6 Design Gate

## Status

**DESIGN ONLY — DO NOT EXECUTE YET**

E6 is permitted only after A0–A4 review because E1–E5 over-privileged a binary lineage predicate.

## Objective

Test epistemic transition policies over explicitly multi-dimensional evidence dependence.

E6 must not attempt to discover that different definitions differ. That is trivial.

Instead it should test **policy properties**.

## Proposed entities

Evidence:
- source node;
- provenance root(s);
- reporter;
- incident;
- dataset;
- method;
- organisation.

Policy:
- dimensions required;
- minimum independent units;
- missing-metadata behaviour;
- transition being authorized.

Decision:
- AUTHORIZE;
- DEFER;
- REJECT / INSUFFICIENT.

## Candidate non-trivial properties

### P1 — No derivative-evidence inflation

Adding a documentary derivative whose relevant provenance/dataset dimensions add no new independent unit must not change a provenance-aware policy from DEFER to AUTHORIZE.

This is explicitly related to epistemic-Sybil prior work and therefore cannot be claimed as novel without differentiation.

### P2 — Missing provenance must not silently become independence

If a required independence dimension is unknown, a policy configured for conservative handling should return DEFER, not AUTHORIZE.

### P3 — Policy transparency

Two policies that produce different authorization decisions over the same evidence structure must expose which dimension caused the difference.

This is a governance/auditability property, not a claim that one policy is universally correct.

### P4 — Authority separation

A mechanical policy decision may propose transition authorization but must not itself instantiate a human-governed Gate A/Gate B decision.

### P5 — Historical replay fidelity

A historical record containing only partial dependency information must be representable without inventing values for unknown dimensions.

## Required adversarial cases

- same source lineage, different datasets;
- different lineages, same dataset;
- same dataset, different methods;
- same organisation, independent collection;
- multi-root synthesis;
- partial metadata;
- derivative publication;
- same incident, multiple reporters;
- multiple incidents, one reporter.

## Stop condition

Do not implement E6 until systematic related-work review establishes that the policy-governance framing is not already substantially covered.

The audit may decide E6 is unnecessary.
