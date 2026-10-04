# FUP-001 — A1 Formal Audit

## Status

**COMPLETE FOR EXISTING E1–E5 MODELS**

This audit asks whether the present formal results are non-trivial consequences of the encoded semantics or whether they are primarily consequences of model construction.

## Executive result

The Alloy work is technically useful, reproducible and internally coherent, but its scientific strength is uneven.

The strongest current formal result is **not** that source multiplicity can differ from lineage independence. Given the definitions used, that divergence is structurally easy to construct.

The stronger contribution candidate is the explicit separation of multiple governance and independence dimensions and the use of executable counterexamples to expose invalid bridge rules between them.

That contribution remains conditional on external novelty and on stronger semantic tests.

## E1 — baseline

### Holding assertions

The four holding assertions are regression constraints:

- AutomationCannotAccept
- CorroboratedCannotBeSyntheticOnly
- VerifiedCannotUseOnlyUntraceableEvidence
- RevisedHasHistory

Each is entailed directly or indirectly by model facts.

Verdict:

**REDUNDANT AS SCIENTIFIC FINDINGS / USEFUL AS REGRESSION TESTS**

They verify implementation consistency, not independent discovery.

### Naive anti-invariants

The five anti-invariants produce counterexamples because the model deliberately keeps the corresponding axes unconstrained except for local facts.

Examples:

- ACCEPTED does not force Gate B mutation.
- ENGINE_PASSED does not force ACCEPTED.
- verification CONTESTED does not force human CONTESTED.

These counterexamples are valuable as executable demonstrations of category separation, but are not deep mathematical results.

Verdict:

**SUPPORTED AS MODEL DIAGNOSTICS / LOW NOVELTY BY THEMSELVES**

## E2 — global semantic substitution

The E2 result shows that selected baseline properties remained classification-invariant when the global independence predicate was replaced.

This is a robustness result about the kernel.

It does not establish semantic sensitivity.

Verdict:

**SUPPORTED, SECONDARY**

## E3 — same-structure semantic sensitivity

E3 correctly compares rival operationalisations over the same evidence structure.

This is methodologically stronger than E2.

However, the source-vs-lineage result follows from definitions that deliberately distinguish immediate source identity from root ancestry.

If:
- `indSource` means immediate nodes differ; and
- `indLineage` means root sets are disjoint,

then a DAG containing two distinct descendants of one root is an immediate counterexample.

Therefore the existence of that counterexample should not be presented as a surprising formal discovery.

What E3 legitimately establishes is narrower:

> Under the declared operational definitions, the same evidence structure can receive different corroboration classifications.

Verdict:

**SUPPORTED BUT INTERPRETATION MUST BE NARROWED**

## E4 — adversarial independence model

E4 removes two easy artefacts:

- missing reporter/incident metadata;
- arbitrary evidence-set cardinality.

The positive control confirms that the model does not force every pair to share lineage.

However, E4 still leaves source, reporter, incident and lineage relations largely independent by construction. Therefore their non-implications are expected unless bridge constraints are introduced.

The statement:

> provenance-lineage independence is orthogonal to source, reporter and incident diversity

is valid as a structural property of the model, but “orthogonal” should not be allowed to imply empirical independence, causal independence, or normative superiority.

Verdict:

**SUPPORTED AS STRUCTURAL MODEL RESULT / NOT YET A GENERAL SCIENTIFIC RESULT**

## E5 — historical replay

E5 is better understood as **representability testing** than validation of the truth of the formal semantics.

CAN-002 shows that the model can represent a PENDING candidate.

CAN-003 shows that a historical warning about shared authors/datasets can be represented with distinct documentary nodes plus shared provenance ancestry.

The replay does not establish that:
- the real Wikimedia source graph is identical to the Alloy graph;
- shared authorship implies common evidential root;
- root-disjointness is the correct universal independence criterion.

Verdict:

**SUPPORTED AS MODEL/HISTORY CORRESPONDENCE, CONDITIONAL AS VALIDATION**

## Central formal weakness

The current independence models use a binary lineage relation:

```
independentByLineage(e1,e2) :=
  roots(e1.source) ∩ roots(e2.source) = ∅
```

Real evidential dependence can be partial and multi-dimensional.

Examples not represented by the current binary semantics:

1. same authors, different datasets;
2. different authors, same dataset;
3. same dataset, independent analysis pipelines;
4. same institution, independent collection;
5. shared upstream dataset plus independent additional evidence;
6. synthesis derived from two independent roots;
7. citation chains with partial transformation;
8. replicated measurement using common instrumentation;
9. multiple incidents observed through one reporter;
10. multiple reporters coordinated by one source.

These cases matter because existing epistemology of evidence treats dependence as richer than binary identity/common-root tests.

## Required next formal experiment

Before any manuscript, construct E6: **graded/multidimensional dependence stress test**.

E6 must not start with a privileged definition of independence.

Represent at least:

- source node;
- provenance root;
- dataset;
- reporter;
- incident;
- method;
- institution.

Then define candidate transition policies rather than a single universal predicate.

Questions:

1. Which dimensions are necessary/sufficient for which epistemic transition?
2. Can two policies disagree while each is internally coherent?
3. Are there dominance relations among policies?
4. What information is required to decide a policy?
5. Which conclusions become UNKNOWN when provenance is incomplete?

## A1 verdict

**OUTCOME B — INTERESTING BUT INCOMPLETE**

The formal programme is not empty. It has produced:
- executable separation of governance axes;
- reproducible counterexamples to invalid bridge rules;
- a useful model/history co-refinement cycle.

But the current central independence counterexample is too definition-driven to carry a paper by itself.

Do not claim a new theory of evidential independence from E1–E5.
