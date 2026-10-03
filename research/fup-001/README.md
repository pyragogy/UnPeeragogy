# FUP-001 — Formal UnPeeragogy

**Status:** semantic reconstruction / Gate A  
**Target question:** Can evidence-governance protocols for human–AI knowledge systems be formally specified so that epistemic state transitions are mechanically auditable and invalid transitions can be detected?

## Scientific stance

FUP-001 does not exist to prove that UnPeeragogy works. It exists to make parts of the protocol precise enough that a model checker can expose where they do not work, are underspecified, or permit unintended states.

Formalisation is accepted only when it increases testability. A notation change without a new mechanically checkable property is not a contribution.

## Baseline

The formalisation is derived from the current UnPeeragogy repository, especially:

- `src/pages/protocol.astro`
- `docs/RESEARCH_DATA_MODEL.md`
- `docs/HUMAN_REVIEW_GUIDE.md`
- `src/data/evidence-taxonomy.ts`
- `src/data/candidate-schemas.ts`
- `runs/human-review-ledger.yaml`
- `scripts/validate-epistemic-integrity.mjs`

The existing protocol remains authoritative. FUP-001 is an analytical layer and must not silently redefine it.

## Research gates

1. **Gate A — Semantic reconstruction.** Recover entities, dimensions, constraints, transitions, assumptions and ambiguities.
2. **Gate B — Minimal executable model.** Produce an executable specification with explicit modelling assumptions.
3. **Gate C — Non-trivial verification.** Assertions must detect more than type/schema errors.
4. **Gate D — Adversarial validation.** Generate and preserve counterexamples.
5. **Gate E — Historical reconstruction.** Replay real UnPeeragogy review cases against the model.
6. **Gate F — Scientific contribution.** Identify a generalisable result beyond “we represented UnPeeragogy formally”.
7. **Gate G — Venue fit.** Evaluate FAC only after the contribution exists.

## Architecture discovered in Gate A

UnPeeragogy is not one state machine. The current repository separates at least these dimensions:

1. acquisition channel;
2. engine processing status;
3. human review status;
4. epistemic lifecycle status;
5. verification status;
6. integrity level;
7. publication/vault mutation (Gate B).

FUP-001 therefore begins as a **product-state / constrained-transition model**, not as a single linear lifecycle.

## Initial formal kernel

The smallest promising kernel is:

`Candidate + Evidence + SourceLineage + HumanDecision + Verification + Publication + Revision`

The first verification targets are:

- automation cannot manufacture a human decision;
- Gate A acceptance cannot imply Gate B publication by itself;
- synthetic material cannot satisfy empirical corroboration;
- corroboration cannot be manufactured from sources with common lineage;
- accepted/verified states require traceable provenance as defined by the protocol;
- revision must preserve a link to the previous interpretation;
- a contested object must remain auditable rather than disappear.

See the semantic reconstruction, ambiguity register and model directory for current details.

## Publication discipline

No manuscript will be drafted until Gate C is passed. No FAC-specific framing may be used to force the model toward a publishable result.

A negative result, including “the protocol is too underspecified to verify this property”, is a valid FUP-001 result.
