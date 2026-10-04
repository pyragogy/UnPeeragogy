# E5 — Counterexample Structures (scope 6, SAT4J, primary)

**Note:** These are SAT solutions found by the solver. For the `check` command
(CAN003_MultipleSourcesImplyIndependentOrigins), SAT means the assertion is
**falsified** — the claimed implication does not hold in all models.

---

## CAN002_PendingShape — RUN, SAT

Witness: `Candidate$1`  
Predicate verified: `some c: Candidate | c.processing = CANDIDATE and c.human = PENDING and some c.evidence`

The solver found a candidate with `PENDING` human status and `CANDIDATE` processing,
with at least one attached evidence atom. This confirms that `PENDING + CANDIDATE`
with non-empty evidence is a reachable state — the CAN-002 historical record is
representable.

---

## CAN003_SharedProvenanceShape — RUN, SAT

Witness: `Candidate$2` (with `Evidence$1`, `Evidence$2`)  
Predicate verified: `some c: Candidate |
  c.processing = CANDIDATE and c.human = PENDING and
  sourceDistinct[e1,e2] and not lineageIndependent[e1,e2]`

Two distinct evidence atoms with distinct source nodes (`sourceDistinct` holds) but
where the source nodes share a common provenance root (`lineageIndependent` fails —
`roots[e1.source] & roots[e2.source]` is non-empty).

**Meaning for CAN-003:** A candidate can have multiple documentary references that
are structurally distinct (`sourceDistinct`) but provenance-dependent
(shared parent/root in the source hierarchy). The historical verification note
*"research pages and paper share authors/datasets — not independent corroboration"*
is representable in the formal model.

---

## CAN003_MultipleSourcesImplyIndependentOrigins — CHECK, SAT (ASSERTION FALSIFIED)

Counterexample: `Candidate$4` (with `Evidence$0`, `Evidence$1`)

The assertion claims:
> Every candidate with at least one pair of source-distinct evidence also has at
> least one pair of lineage-independent evidence.

The solver found a candidate where `some c.evidence` holds with `sourceDistinct[e1,e2]`
TRUE for at least one pair, but NO pair in the candidate has `lineageIndependent`.

The counterexample structure shows:
- `Candidate$4`: processing=`CANDIDATE`, human=`PENDING`
- Evidence assigned: `[Evidence$0, Evidence$1]`
- The pair `(Evidence$0, Evidence$1)` has source-distinct sources
  (different immediate Source atoms) but the sources share a provenance root
  (lineage dependency via parent chain)

**Implication:** Source multiplicity at the documentary-node level does NOT
guarantee provenance-lineage independence. This is the formal counterpart of
the CAN-003 `verification_note` — multiple URLs can cite material sharing
authors/datasets.

---

## IndependentDocumentaryPairReachable — RUN, SAT

Witness: `Candidate$5` (with `Evidence$2`, `Evidence$3`)  
Predicate verified: `some c: Candidate |
  some disj e1,e2: c.evidence |
    sourceDistinct[e1,e2] and lineageIndependent[e1,e2]`

Evidence atoms with independent documentary origins are still reachable:
- `Evidence$2.source = Source$0`, `Evidence$3.source = Source$1`
- `Source$0` has no parent, `Source$1` has no parent
- `roots[Source$0] = {Source$0}`, `roots[Source$1] = {Source$1}` → disjoint
- Therefore `lineageIndependent[Evidence$2, Evidence$3]` holds

Also shows other Candidate configurations in the same solution:
- `Candidate$0`: 1 evidence, CANDIDATE+PENDING
- `Candidate$1,2,3`: 1 evidence each, CANDIDATE+ACCEPTED
- `Candidate$4`: 1 evidence, CANDIDATE+PENDING
- `Candidate$5`: 3 evidence, CANDIDATE+ACCEPTED

**Meaning:** The model does NOT force all evidence to be provenance-dependent.
Independent documentary pairs are still constructible — the assertion
falsification only blocks the *implication* from source multiplicity to
independence.

---

## Summary of counterexample semantics

| Command | Result | Epistemic meaning |
|---|---|---|
| CAN002_PendingShape | SAT | `PENDING+CANDIDATE+evidence` is reachable |
| CAN003_SharedProvenanceShape | SAT | Dependence-with-multiplicity is representable |
| CAN003_MultipleSourcesImplyIndependentOrigins | SAT (falsified) | Source multiplicity ≠ lineage independence |
| IndependentDocumentaryPairReachable | SAT | Independent pairs are still reachable |

The 4xSAT result is structurally consistent:
- The CAN-002 and CAN-003 historical shapes are **reachable** in the model.
- The formal independence result from E3/E4 is **not overridden** — the
  non-implication `sourceDistinct → lineageIndependent` is preserved.
- Independent documentary pairs remain **reachable** as a positive control.