# FUP-001 Gate E — Historical Reconstruction

## Status

**OPEN**

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
