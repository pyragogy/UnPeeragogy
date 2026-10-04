# FUP-001 — A0 Claim Inventory Audit

## Status

**COMPLETE — inventory is usable only with annotations**

Commit audited: `3bbaf5428081dadc92ca520637a0d56e09e54104`

The purpose of A0 is not to evaluate the scientific truth of the claims. It tests whether the inventory itself is a reliable substrate for later review.

## Mechanical integrity

The inventory contains exactly 100 rows, C-001 through C-100.

Mechanically recomputed level counts:

| Level | Category | Count |
|---|---|---:|
| 1 | Repository fact | 3 |
| 2 | Modelling assumption | 5 |
| 3 | Mechanical result | 13 |
| 4 | Historical observation | 20 |
| 5 | Interpretation | 56 |
| 6 | Generalisation | 3 |
| **Total** |  | **100** |

The earlier manually written summary was inconsistent with the actual rows.

## Taxonomy defects

The six-level taxonomy is useful for separating evidence from interpretation, but it is insufficient for every extracted sentence.

At least four additional sentence roles exist:

- research question;
- methodological rule;
- prediction / pre-registration;
- limitation / negative claim.

These should not automatically be treated as scientific claims.

Examples:

- C-095 is a research question, not a generalisation.
- C-021 is a prospective prediction about a not-yet-executed experiment at time of writing.
- C-064, C-075, C-076 and C-077 are limitation claims.
- C-100 is a methodological rule governing manuscript use.

## Misclassified or mixed claims requiring later annotation

### C-003

> “CAN-001 is representable without semantic distortion”

The SAT witness is mechanical; “without semantic distortion” is interpretive. The row compresses Level 3 and Level 5.

### C-005

> “the model keeps the principal governance axes distinct”

This is primarily a property of model construction. It is not a discovery produced independently by the solver.

### C-013

> “Confirms that Gate A and Gate B are semantically independent.”

A counterexample to `ACCEPTED => MUTATION_APPROVED` establishes non-implication in the model. “Semantically independent” is a stronger interpretive phrase and should not be classified purely mechanical.

### C-018

> “The formal model therefore reproduces the key governance structure of the historical case.”

This is a model/history correspondence interpretation, not itself a historical observation.

### C-035

> “ACCEPTED = admissible for epistemic use, not ‘the interpretation is true’.”

This is an interpretation of protocol semantics supported by CAN-001, not a raw historical observation.

### C-036

The existence of `NO_CHANGE` is historical. The conclusion that Gate B is “a decision process” is interpretive.

### C-050 / C-053

These are model requirements derived after historical inspection, not historical observations.

### C-067 / C-069 / C-070

These statements are mechanically supported only inside the chosen relational semantics. They must remain explicitly model-relative.

### C-072

The correspondence between CAN-003 and E3/E4 is an interpretation connecting a historical record and formal result, not a raw historical observation.

## Conflict audit

The two conflicts reported during extraction are not established logical contradictions.

### C-035 vs C-039

No contradiction.

- C-035 addresses what ACCEPTED means.
- C-039 addresses whether corroboration is a prerequisite for assigning ACCEPTED.

These can both be true. Status: **AMBIGUITY, NOT CONFLICT**.

### C-062 vs C-067

No contradiction when bounded context is retained.

- C-062 rejects universal normative priority for lineage.
- C-067 states a formal structural result in the tested model.

Status: **DECONTEXTUALISATION RISK, NOT CONFLICT**.

## Main inventory signal

56 of 100 rows are currently labelled interpretations.

This does not invalidate FUP-001, but it means the project is interpretation-heavy relative to its direct factual and mechanical substrate.

The scientific audit must therefore operate on **claim clusters**, not on rhetorical frequency. Repetition of an interpretation across several documents is not additional evidence.

## A0 verdict

**PASS WITH TAXONOMY REPAIR REQUIRED**

The inventory is complete enough to audit, but row levels must not be treated as authoritative.

Subsequent audit files should preserve original IDs and wording while adding independent audit classifications.
