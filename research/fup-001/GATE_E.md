# FUP-001 Gate E — Historical Reconstruction

## Status

**PASS — E5 historical reconstruction**

Adjudicated: 2026-10-04

Gate D passed. The formal result must now be tested against real UnPeeragogy history.

## Purpose

Determine whether the formal distinctions discovered in E1–E4 explain actual governance events rather than only synthetic Alloy structures.

Historical replay is adversarial:

- the historical record is fixed;
- the model must adapt if it cannot represent the record;
- a case must never be rewritten to fit the model.

## Required case classes

Gate E requires at least four historically grounded cases spanning distinct governance situations.

### HE-01 — Gate A accepted / Gate B no-change

Current case: CAN-001.

Questions:
- can the model represent human acceptance without engine passage?
- can Gate A acceptance coexist with Gate B NO_CHANGE?
- does the model preserve separate decision records?

Status: **already reconstructed successfully**.

### HE-02 — Pending or needs-evidence case

Need a real candidate that entered the review pipeline without substantive human acceptance.

Questions:
- can acquisition/processing exist while human review remains pending?
- does the system avoid accidental epistemic promotion?
- is provenance sufficient to audit why the case is pending?

### HE-03 — Contested or revised case

Need a real case whose interpretation or decision changed, or was explicitly contested.

Questions:
- is the previous interpretation preserved?
- can contested state remain auditable without becoming accepted/rejected by collapse?
- is revision lineage explicit?

### HE-04 — Provenance/independence case

Need a real evidence set where apparent multiplicity may share origin, or where reporter/incident/source-lineage dimensions can be distinguished.

Questions:
- would different independence semantics change the admissible corroboration transition?
- can source lineage be reconstructed from actual records?
- is any dependency hidden by URL/source multiplicity?

### HE-05 — AI-assisted acquisition case

Desirable if available.

Questions:
- can an AI-generated candidate enter acquisition/processing without AI output becoming evidence?
- are underlying sources separable from the AI synthesis?
- can human review remain authoritative?

## Replay method

For each case create:

`research/fup-001/cases/<CASE-ID>.md`

with:

1. immutable historical source references;
2. timestamps;
3. acquisition channel;
4. processing state;
5. human review state;
6. epistemic state if explicitly supported;
7. verification state if explicitly supported;
8. Gate B state if applicable;
9. provenance graph;
10. formal reconstruction;
11. mismatch list;
12. whether the mismatch implies:
   - model defect;
   - schema drift;
   - protocol ambiguity;
   - missing historical data;
   - genuine governance failure.

## Evidence discipline

Do not infer undocumented states.

If the historical record does not establish a field, mark it UNKNOWN.

Do not convert:
- ACCEPTED into “true”;
- multiple URLs into independent evidence;
- AI output into evidence;
- absence of a record into a negative decision.

## Gate E pass rule

Gate E passes if:

1. CAN-001 remains reconstructable;
2. at least two additional real cases are reconstructed;
3. at least one case exercises a state not present in CAN-001;
4. at least one replay either:
   - reveals a model/protocol mismatch, or
   - demonstrates a non-trivial formal distinction on real provenance;
5. all mismatches are preserved rather than normalized away.

If no real case engages the independence result, Gate E may still pass as historical validation, but the paper must clearly separate:
- formal semantic result;
- historical governance validation;
- absence of real-world provenance validation for the independence result.


## E5 adjudication

Historical replay executed with:

- SAT4J scopes 6, 8, 10;
- Glucose scope 6;
- 4 commands × 4 executions;
- 16/16 SAT;
- zero scope disagreement;
- zero solver disagreement.

### HE-01 — CAN-001

Already reconstructable and historically decisive for:
- Gate A ≠ Gate B;
- ACCEPTED ≠ ENGINE_PASSED;
- ACCEPTED ≠ automatic vault mutation;
- Gate B requires its own decision semantics.

### HE-02 — CAN-002

`CAN002_PendingShape` is SAT across all tested scopes/solvers.

Historical significance:
- documentary candidate can exist as `CANDIDATE + PENDING`;
- no substantive human decision is required merely for acquisition/processing;
- no epistemic promotion should be inferred from presence in the pipeline.

### HE-04 — CAN-003

`CAN003_SharedProvenanceShape` is SAT across all tested scopes/solvers.

The historical record explicitly notes shared authors/datasets among research pages and paper and warns that these do not constitute independent corroboration.

The replay conservatively represents this as:
- distinct documentary source nodes;
- shared provenance origin sufficient to block lineage independence.

`CAN003_MultipleSourcesImplyIndependentOrigins` is falsified at every tested scope/solver.

Positive control `IndependentDocumentaryPairReachable` is also SAT.

### Historical/formal bridge

Supported:

> A practical provenance concern recorded in UnPeeragogy before the formal replay corresponds structurally to the distinction found in E3/E4: multiplicity of documentary nodes need not imply independent evidential origin.

Not supported:

- that the exact real-world Wikimedia provenance graph is fully reconstructed;
- that shared authorship alone always implies evidential dependence;
- that the Alloy lineage relation is the uniquely correct formalisation of provenance independence;
- that historical replay proves the formal model universally valid.

## Missing historical coverage

HE-03 — CONTESTED / REVISE: **not found**.

HE-05 — AI-assisted acquisition: **not found**.

These remain explicit empirical coverage gaps.

## Gate E verdict

**PASS WITH DOCUMENTED COVERAGE GAPS**

Gate E satisfies its predeclared pass rule:
1. CAN-001 remains reconstructable;
2. CAN-002 and CAN-003 add two real cases;
3. PENDING introduces a state absent from CAN-001;
4. CAN-003 engages the provenance-independence distinction on a real historical record;
5. unresolved gaps and schema drift remain preserved rather than normalized away.

## Next phase

Do **not** begin manuscript drafting yet.

Freeze the exploratory result set E1–E5 and begin a full pre-paper epistemic audit.
