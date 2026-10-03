# ADR FUP-001-001 — First Formalism

**Decision:** use Alloy 6 for the first executable model.  
**Status:** accepted for Gate B, revisable.

## Context

The first scientific problem is not primarily algorithmic or temporal. It is to determine whether combinations of provenance, lineage, human-review state, verification state and publication state admit configurations that contradict the intended protocol.

## Why Alloy first

Alloy is well suited to:

- small relational models;
- graph lineage;
- cross-product state constraints;
- bounded instance generation;
- minimal counterexample discovery;
- rapidly revising semantics while ambiguities remain open.

The bounded nature of Alloy analysis must be stated explicitly. “No counterexample within the checked scope” is not a proof of the unrestricted system.

## Why not TLA+ first

TLA+ becomes the stronger candidate when we investigate:

- eventual review of PENDING candidates;
- oscillating classifications;
- evidence withdrawal;
- repeated revision;
- ordering of Gate A and Gate B events;
- liveness obligations.

Those questions require stable static semantics first.

## Why not a proof assistant first

Lean/Isabelle/Coq would increase proof strength while simultaneously increasing the cost of changing definitions. At present the dominant uncertainty is semantic, not deductive. Proving an underspecified model more strongly would not improve the science.

## Re-evaluation trigger

Re-open this decision after:

1. static invariants are executable;
2. at least five counterexamples are preserved;
3. CAN-001 and at least one contested/revision case are reconstructed;
4. a temporal research question survives those tests.
