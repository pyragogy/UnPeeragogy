# FUP-001 Execution Roadmap

## Current position

- Gate A semantic reconstruction: **passed provisionally**
- Gate B executable model: **model written, not yet solver-executed**
- Historical replay: **CAN-001 reconstructed**
- First model revision from replay: **completed**

## Next bounded cycle

### B1 — Pin and execute Alloy
- select a specific Alloy 6 release;
- record Analyzer version and SAT solver;
- run all `check` and `run` commands;
- export counterexamples/instances;
- classify each result as expected, unexpected, vacuous or model-defect.

### B2 — Vacuity audit
For every assertion that “passes”, create a witness predicate showing that the antecedent is satisfiable. A true assertion over an impossible state is not evidence.

### B3 — Independence experiment
Implement at least three rival definitions:
1. source-lineage independence;
2. reporter independence;
3. incident/event independence.

Replay the same cases under each definition and record which classifications change.

### B4 — Historical cases
After CAN-001, reconstruct:
- one PENDING candidate;
- one CONTESTED or revision case;
- one documentary-only case;
- one AI-assisted discovery case.

### B5 — Schema alignment
Decide whether `publication_review` should become part of a canonical TypeScript interface or remain a separate Gate B record. Do not change production schemas until the formal analysis justifies it.

### C — Non-trivial verification gate
Gate C passes only if the formal model detects a governance failure mode that ordinary schema/type validation does not already detect.

## Publication trigger

Do not create `paper/manuscript.tex` until Gate C passes.

A paper outline may be created only after there is at least:
- one non-trivial mechanically generated counterexample;
- one historical replay altered by the model or altering the model;
- one explicit limitation of the formalisation;
- one generalisable claim not specific to the UnPeeragogy brand.
