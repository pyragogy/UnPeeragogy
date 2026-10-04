# Pi Handoff — Adversarial Audit / Claim Inventory

## Objective

Extract the claims already made by FUP-001.

Do **not** evaluate them yet.

Do **not** improve their wording.

Do **not** merge similar claims.

Do **not** create new claims.

## Read

- research/fup-001/ADVERSARIAL_SCIENTIFIC_AUDIT.md
- research/fup-001/BASELINE_INTERPRETATION_v0.1.md
- research/fup-001/SEMANTIC_RECONSTRUCTION_v0.1.md
- research/fup-001/cases/CAN-001.md
- research/fup-001/cases/CAN-002.md
- research/fup-001/cases/CAN-003.md
- research/fup-001/GATE_C.md
- research/fup-001/GATE_D.md
- research/fup-001/GATE_E.md
- all interpretation/result summary files under research/fup-001/
- all files under paper/fup-001/

## Output

Update:

`research/fup-001/CLAIM_INVENTORY.md`

For every substantive claim, record:

- sequential ID `C-001`, `C-002`, ...;
- exact claim text;
- exact source file;
- heading and line numbers if locally available;
- level:
  1. repository fact
  2. modelling assumption
  3. mechanical result
  4. historical observation
  5. interpretation
  6. generalisation
- explicit dependencies if stated;
- state = `UNEXAMINED`.

## Inclusion rule

Include statements that could later appear as:

- factual premises;
- methodological claims;
- formal findings;
- historical findings;
- interpretations;
- conclusions;
- generalisations;
- limitations that constrain another claim.

Exclude:

- navigation prose;
- pure instructions;
- shell commands;
- obvious file descriptions;
- duplicated raw solver lines where an interpretation file already states the result.

## Critical discipline

If the same sentence mixes multiple levels, split it into separate inventory rows while preserving the original sentence in a note.

If two files contradict each other, preserve both claims separately and add `CONFLICT_PRESENT` in Dependencies.

If a claim has changed over time, preserve old and new versions separately.

Do not decide which one is correct.

## Deliverables

1. Updated `CLAIM_INVENTORY.md`
2. Short section at bottom:
   - total claims;
   - counts by level;
   - conflicts found;
   - duplicated claims found;
   - claims with unclear provenance.
3. Commit and push.
4. Return only:
   - commit SHA;
   - counts;
   - conflicts;
   - unclear-provenance items.

No formal audit yet.
