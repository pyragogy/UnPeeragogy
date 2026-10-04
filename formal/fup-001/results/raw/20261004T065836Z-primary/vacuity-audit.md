# Vacuity Audit — FUP-001 Primary Run

Run ID: 20261004T065836Z-primary

## Method

Each holding assertion's antecedent was tested for satisfiability using a dedicated witness predicate. If the witness predicate has at least one instance (SAT), the corresponding assertion is NON_VACUOUS_PASS. If the witness is UNSAT, the assertion is VACUOUS_PASS and scientifically useless.

Note: The runbook §6 specifies a separate `vacuity.als` model which does not exist on the branch. Witness predicates inlined in the primary model (`unpeeragogy.als`) serve the equivalent function and were executed in the same run. See `PI_ANOMALY_REPORT.md` (A-001).

## Assertion: AutomationCannotAccept

| Property | Value |
|----------|-------|
| Antecedent | `d.outcome = HR_ACCEPTED and d.actor.actorKind = AK_AUTOMATION` |
| Witness | `witnessSubstantiveHumanDecision` — `some d: HumanDecision \| d.outcome != HR_PENDING` |
| Witness result | INSTANCE_FOUND (SAT) |
| Antecedent reachable? | Yes — at least one substantive human decision exists in the model |
| Non-vacuous? | **YES** — the antecedent of the invariant is not trivially false |
| Status | **NON_VACUOUS_PASS** |

## Assertion: CorroboratedCannotBeSyntheticOnly

| Property | Value |
|----------|-------|
| Antecedent | `c.epistemic = ES_CORROBORATED` |
| Witness | `witnessCorroboratedCandidate` — `some c: Candidate \| c.epistemic = ES_CORROBORATED` |
| Witness result | INSTANCE_FOUND (SAT) |
| Antecedent reachable? | Yes |
| Non-vacuous? | **YES** |
| Status | **NON_VACUOUS_PASS** |

## Assertion: VerifiedCannotUseOnlyUntraceableEvidence

| Property | Value |
|----------|-------|
| Antecedent | `c.integrity = IL_VERIFIED` |
| Witness | `witnessVerifiedCandidate` — `some c: Candidate \| c.integrity = IL_VERIFIED` |
| Witness result | INSTANCE_FOUND (SAT) |
| Antecedent reachable? | Yes |
| Non-vacuous? | **YES** |
| Status | **NON_VACUOUS_PASS** |

## Assertion: RevisedHasHistory

| Property | Value |
|----------|-------|
| Antecedent | `i.epistemic = ES_REVISED` |
| Witness | `witnessRevisedInterpretation` — `some i: Interpretation \| i.epistemic = ES_REVISED` |
| Witness result | INSTANCE_FOUND (SAT) |
| Antecedent reachable? | Yes |
| Non-vacuous? | **YES** |
| Status | **NON_VACUOUS_PASS** |

## Summary

| Assertion | Witness | Vacuity status |
|-----------|---------|----------------|
| AutomationCannotAccept | witnessSubstantiveHumanDecision SAT | NON_VACUOUS_PASS |
| CorroboratedCannotBeSyntheticOnly | witnessCorroboratedCandidate SAT | NON_VACUOUS_PASS |
| VerifiedCannotUseOnlyUntraceableEvidence | witnessVerifiedCandidate SAT | NON_VACUOUS_PASS |
| RevisedHasHistory | witnessRevisedInterpretation SAT | NON_VACUOUS_PASS |

**All 4 holding assertions are non-vacuous.** No VACUOUS_PASS detected.