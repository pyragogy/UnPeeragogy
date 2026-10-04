# FUP-001 Baseline Interpretation v0.1

**Baseline run:** 20261004T065836Z-primary  
**Model commit:** 8939f8c047de8cacffe1a68d8204ff69d6f46ff0  
**Results commit:** fbd451dca4365be44308be698f2724a821edcf5d  
**Alloy:** 6.2.0  
**Solver:** SAT4J  
**Scope:** 6

## Executive assessment

The baseline run is technically successful and historically consistent.

It is **not yet sufficient to declare Gate C passed**.

The run establishes that:

- the committed model executes reproducibly;
- the intended anti-invariants admit counterexamples;
- CAN-001 is representable without semantic distortion;
- the chosen bounded scope contains witnesses for all principal model states;
- the model keeps the principal governance axes distinct.

However, the four “holding” assertions are primarily regression/sanity checks because they are entailed directly or indirectly by facts already encoded in the same model. They therefore do not constitute independent discoveries.

The scientific value of the baseline lies mainly in:

1. validating the experimental infrastructure;
2. demonstrating cross-axis non-implication through explicit instances;
3. establishing historical consistency;
4. exposing the next research target: the semantics of evidential independence.

## Result classification

### R-01 AutomationCannotAccept

**Mechanical result:** no counterexample in scope 6.

**Interpretation:** regression check.

The assertion is supported by the fact `SubstantiveHumanDecisionsRequireHumanActor`. It therefore verifies that the model enforces the intended rule, not that Alloy independently discovered it.

### R-02 CorroboratedCannotBeSyntheticOnly

**Mechanical result:** no counterexample in scope 6.

**Interpretation:** regression check.

The stronger fact `EpistemicCorroborationRequiresIndependentEmpiricalPair` already requires empirical evidence. The assertion checks a weaker consequence.

### R-03 VerifiedCannotUseOnlyUntraceableEvidence

**Mechanical result:** no counterexample in scope 6.

**Interpretation:** regression check.

This is a weaker consequence of `VerifiedIntegrityRequiresTraceableEvidence`.

### R-04 RevisedHasHistory

**Mechanical result:** no counterexample in scope 6.

**Interpretation:** regression check.

The same requirement is encoded by `RevisedInterpretationPreservesPredecessor`.

## Anti-invariant results

All five anti-invariants generated counterexamples as intended.

### N-01 DistinctSourcesAreIndependent

This is the most scientifically promising baseline counterexample.

The model admits two distinct source nodes sharing evidential lineage. Therefore:

`source identity multiplicity ≠ evidential independence`

This failure mode is not a TypeScript shape error. It is relational and provenance-dependent.

### N-02 AcceptedImpliesGateBMutation

Confirms that Gate A and Gate B are semantically independent.

This is strongly supported by the real CAN-001 history and is therefore not merely a synthetic possibility.

### N-03 AcceptedImpliesCorroborated

Confirms that admissibility into the epistemic process is not equivalent to epistemic corroboration.

### N-04 EnginePassedImpliesAccepted

Confirms that successful automated processing does not confer human epistemic authority.

### N-05 VerificationContestedImpliesHumanContested

Confirms that lexical identity across status axes must not be interpreted as semantic identity.

## CAN-001

`can001Shape` returned SAT.

This is a historical-consistency pass:

- processing = CANDIDATE;
- Gate A = ACCEPTED;
- no ENGINE_PASSED requirement;
- separate HumanDecision;
- Gate B = NO_CHANGE;
- separate GateBDecision.

The formal model therefore reproduces the key governance structure of the historical case.

## Vacuity audit correction

The baseline vacuity report is useful but its terminology should be refined.

For R-02, R-03 and R-04, the witnesses correctly demonstrate that the state classes under discussion are reachable.

For R-01, `witnessSubstantiveHumanDecision` establishes that substantive decisions exist, but does not make the forbidden condition “automation accepts” reachable. Since the forbidden condition is excluded by a model fact, calling this a conventional non-vacuity proof is too strong.

Future reports should use:

- **STATE_REACHABILITY_CONFIRMED** for witness existence;
- **REGRESSION_CONSTRAINT_CONFIRMED** for assertions that restate/derive from model facts;
- reserve **NON_VACUOUS_PROPERTY** for properties whose antecedent can occur independently of the asserted consequence.

This correction does not invalidate any raw Alloy result.

## Gate C status

**NOT YET PASSED.**

Reason:

The baseline counterexamples mostly demonstrate intentionally omitted bridge rules. To pass Gate C, FUP-001 needs a mechanically generated result showing a non-trivial epistemic-governance failure under plausible competing semantics rather than merely the absence of a rule.

## Gate C target

The next experiment tests whether the same evidence set can be:

- corroborated under source-count multiplicity;
- not corroborated under source-lineage independence;
- corroborated under reporter independence but not incident independence;
- corroborated under incident independence but not reporter independence.

If such configurations exist, the formal method will expose a general governance problem:

> “independent evidence” is not a scalar property of evidence count; it is a relation whose operational definition changes admissible epistemic transitions.

That is the first candidate result capable of satisfying Gate C.
