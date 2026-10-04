# FUP-001 Gate E — Historical Discovery Report

**Operator:** pi (mechanical discovery agent)  
**Date:** 2026-10-04  
**Branch:** `fup-001/formal-kernel`  
**Commit:** `486fc29f0d53a441d2a0475be217917c0792bb9c` (HEAD at discovery start)

---

## Methodology

All observations below are backed by committed repository records or GitHub
Discussion API responses. No inference, memory, or AI-generated evidence is used.

Sources inspected:
- `runs/human-review-ledger.yaml` — ledger of all human reviews
- `runs/candidates/CAN-{001,002,003}.yaml` — candidate evidence records
- `research/fup-001/cases/CAN-001.md` — existing reconstruction
- `src/data/candidate-schemas.ts` — canonical candidate interface
- `docs/HUMAN_REVIEW_GUIDE.md` — review protocol
- `research/fup-001/GATE_E.md` — pass criteria
- `research/fup-001/HISTORICAL_CASE_INVENTORY.md` — known candidates
- GitHub Discussions #3, #4, #5, #7, #10, #11 (via API)

---

## Discovered cases

### 1. CAN-001 — Wikibooks deletion (HE-01)

| Field | Value |
|---|---|
| **Path** | `runs/candidates/CAN-001.yaml` |
| **Source** | Discussion #7 |
| **Acquisition channel** | `practitioner` |
| **Processing status** | `CANDIDATE` |
| **Human review status** | `ACCEPTED` |
| **Human reviewer** | Fabrizio |
| **Decision date** | 2026-09-28T12:59:00Z |
| **Gate B** | `NO_CHANGE` (separate `publication_review` object) |
| **Engine output** | `null` (no verdict, no score) |
| **Grounding** | `grounded_in_source: true` |
| **Reconstruction** | `research/fup-001/cases/CAN-001.md` (existing) |
| **Schema drift** | YAML contains `publication_review` not present in `CandidateEvidence` interface |

**Suitability for Gate E:** ✅ **HE-01** — Already reconstructed. Demonstrates Gate A ≠ Gate B,
human acceptance without engine passage, and separate decision records.

---

### 2. CAN-002 — Wikipedia Adventure (HE-02)

| Field | Value |
|---|---|
| **Path** | `runs/candidates/CAN-002.yaml` |
| **Source** | Discussion #10 |
| **Acquisition channel** | `documentary` |
| **Processing status** | `CANDIDATE` |
| **Human review status** | **`PENDING`** — no decision taken |
| **Human reviewer** | `null` |
| **Decision date** | `null` |
| **Rationale** | `DOCUMENTARY_CASE — requires manual extraction` |
| **Resulting action** | `null` |
| **Gate B** | not applicable (no acceptance yet) |
| **Engine output** | `null` (no verdict, no score) |
| **Grounding** | `grounded_in_source: true` |
| **Documentary references** | |
| - Wikimedia Meta research page | `https://meta.wikimedia.org/wiki/Research:Impact_of_The_Wikipedia_Adventure_on_new_editor_retention` |
| - CSCW 2017 paper (DOI) | `https://doi.org/10.1145/2998181.2998307` |
| - Open preprint | `https://mako.cc/academic/narayan_etal-the_wikipedia_adventure-cscw2017.pdf` |
| **Provenance author** | FTG-003 |
| **Provenance date** | 2026-09-29T16:10:43Z |
| **Missing fields** | `human_review.status` is `PENDING`; no reviewer, date, rationale, action |
| **Open questions** | 4 documented in YAML `content.open_questions` |

**Suitability for Gate E:** ✅ **HE-02** — Pending case. Enters review pipeline without
substantive human acceptance. Can test whether the formal model prevents accidental
epistemic promotion when human review is `PENDING`. Has verifiable documentary sources
with DOIs and institutional URLs.

---

### 3. CAN-003 — Wikipedia Teahouse (HE-02 / HE-04)

| Field | Value |
|---|---|
| **Path** | `runs/candidates/CAN-003.yaml` |
| **Source** | Discussion #11 |
| **Acquisition channel** | `documentary` |
| **Processing status** | `CANDIDATE` |
| **Human review status** | **`PENDING`** — no decision taken |
| **Human reviewer** | `null` |
| **Decision date** | `null` |
| **Rationale** | `DOCUMENTARY_CASE — requires manual extraction` |
| **Resulting action** | `null` |
| **Gate B** | not applicable (no acceptance yet) |
| **Engine output** | `null` (no verdict, no score) |
| **Grounding** | `grounded_in_source: true` |
| **Documentary references** | |
| - Meta research page (long-term retention) | `https://meta.wikimedia.org/wiki/Research:Teahouse_long_term_new_editor_retention` |
| - Meta research hub | `https://meta.wikimedia.org/wiki/Research:Teahouse` |
| - Meta pilot metrics | `https://meta.wikimedia.org/wiki/Research:Teahouse/Metrics` |
| - OpenSym 2018 paper (DOI) | `https://doi.org/10.1145/3233391.3233544` |
| - Open proceedings copy | `https://www.opensym.org/wp-content/uploads/2018/07/OpenSym2018_paper_15.pdf` |
| **Provenance duplication warning** | `grounding.verification_note` explicitly states: |
| | *"research pages and paper share authors/datasets — not independent corroboration"* |
| **Provenance author** | FTG-003 |
| **Provenance date** | 2026-09-29T16:10:58Z |
| **Missing fields** | `human_review.status` is `PENDING`; no reviewer, date, rationale, action |

**Critical finding — Provenance duplication:**
Three Wikimedia Meta URLs and one DOI lead to sources that share authors and
datasets. This is a direct historical analogue of the formal independence result:
**surface URL multiplicity hides provenance dependency.** The `verification_note`
already flags this.

**Suitability for Gate E:**
- ✅ **HE-02** — Pending case (same as CAN-002)
- ✅ **HE-04** — **Provenance duplication / common source lineage**
  The note *"research pages and paper share authors/datasets — not independent
  corroboration"* is exactly the real-world counterpart of `indSource` ≠ `indLineage`.
  This case engages the formal independence result.

---

### 4. Schema drift — `publication_review` (cross-cutting)

| Field | Status |
|---|---|
| `publication_review` in CAN-001.yaml | **PRESENT** with `status: NO_CHANGE` |
| `publication_review` in `CandidateEvidence` (schemas.ts) | **ABSENT** — not defined |

This confirms the mismatch documented in `cases/CAN-001.md`. Gate B has operational
semantics that are not represented in the canonical candidate interface.

**Suitability for Gate E:** Cross-cutting — any HE reconstruction must decide whether
to use the YAML record (which has Gate B) or the schema (which does not).

---

## Missing case classes — gap analysis

### HE-03 — Contested or revised case

**No case found.**

The `HumanReviewStatus` union type defines `CONTESTED`, `REVISE`, and
`NEEDS_EVIDENCE` as valid states, but no candidate in the repository exercises them.

Possible explanations:
- The project has not yet encountered a contested case.
- Contestation may occur outside the YAML record (e.g., discussion threads).
- No discussion comment API data indicated a contestation label.

**Effect on Gate E:** Missing HE-03 is a gap. The formal model has no adversarial
test of contested-state preservation or revision lineage.

### HE-05 — AI-assisted acquisition case

**No case found.**

The `ai-research` acquisition channel is defined in the schema but unused.
No candidate YAML file or discussion uses it.

The `share-your-story` and `structural-analysis` templates are human-facing
only. No AI-specific discussion template exists.

**Effect on Gate E:** Missing HE-05 is a gap but not blockers. AI-assisted
acquisition is desirable but not required per GATE_E.md.

---

## Summary table

| Case | HE class | Source record | Human status | Provenance issue | Suitable for Gate E? |
|---|---|---|---|---|---|
| CAN-001 | HE-01 | `CAN-001.yaml` + Discussion #7 | ACCEPTED | — | ✅ (already done) |
| CAN-002 | HE-02 | `CAN-002.yaml` + Discussion #10 | **PENDING** | — | ✅ |
| CAN-003 | HE-02 + HE-04 | `CAN-003.yaml` + Discussion #11 | **PENDING** | **shared authors/datasets** | ✅✅ (HE-04 engages independence) |
| — | HE-03 | NOT FOUND | — | — | ❌ gap |
| — | HE-05 | NOT FOUND | — | — | ❌ gap (non-blocking) |
| Schema drift | cross-cutting | `CAN-001.yaml` vs `schemas.ts` | — | — | ✅ documented |

## Recommendations for Gate E reconstruction

1. **HE-02 (CAN-002)**: Reconstruct with `human_review.status = PENDING`.
   Verify that the formal model does not promote `PENDING` cases to any epistemic
   state beyond `CANDIDATE`.

2. **HE-02 (CAN-003)**: Same as CAN-002. Additionally document the provenance
   dependency in the formal representation.

3. **HE-04 (CAN-003)**: Use the `verification_note` as a real historical instance
   of the formal independence problem. Map the three Meta URLs and the DOI to a
   provenance graph showing shared authorship/dataset origin. Test whether
   `corroboratedSource` (URL multiplicity) would be SAT while `corroboratedLineage`
   (independent origin) would be UNSAT for this evidence set.

4. **HE-03 (gap)**: Note in the reconstruction that no contested or revised case
   exists in the repository. The formal model's CONTESTED state is untested by
   historical replay.

5. **Schema drift**: Address whether the formal model should refer to the YAML
   record (which has `publication_review`) or the TypeScript schema (which does
   not).

## Evidence discipline verification

- [x] No field invented or inferred
- [x] `PENDING` status from YAML and ledger (not assumed)
- [x] `UNKNOWN` used where records absent (reviewer, date for PENDING cases)
- [x] Two URLs ≠ independent sources — CAN-003 verification_note explicitly flags this
- [x] No AI output treated as evidence — no AI channel used in any candidate
- [x] Schema drift documented by comparing YAML to TypeScript interface
- [x] GitHub Discussion data from API, not from memory