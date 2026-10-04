# Pi Handoff — Gate E Historical Case Discovery

Goal: locate real repository-backed cases for Gate E. Do not fabricate or infer missing records.

Read:
- research/fup-001/GATE_E.md
- research/fup-001/HISTORICAL_CASE_INVENTORY.md
- research/fup-001/cases/CAN-001.md
- runs/human-review-ledger.yaml
- docs/HUMAN_REVIEW_GUIDE.md

Search the repository history, discussions/issues references, logs and candidate records for cases matching:

1. PENDING or NEEDS_EVIDENCE;
2. CONTESTED or REVISE / revision;
3. provenance duplication / common source lineage;
4. AI-assisted acquisition with underlying sources.

Also attempt to locate immutable source records for the project-history candidates:
- CAN-002 / Wikipedia Adventure
- CAN-003 / Wikipedia Teahouse

Rules:
- do not create candidate evidence from memory;
- do not assign epistemic states not present in source records;
- preserve UNKNOWN where records are incomplete;
- distinguish repository fact from your inference.

Output:
- `research/fup-001/HISTORICAL_DISCOVERY_REPORT.md`
- one row per discovered case with source path/URL/commit, timestamps, observed states and missing fields;
- rank cases by suitability for Gate E;
- no model changes yet.

Commit and push discovery artifacts only.
