# Pi Handoff — E5 Historical Replay

Discovery is complete. Now execute the historical replay.

Read:
- research/fup-001/cases/CAN-002.md
- research/fup-001/cases/CAN-003.md
- formal/fup-001/model/historical-replay.als
- formal/fup-001/scripts/run-historical-replay.sh
- research/fup-001/GATE_E.md

Preflight:

```bash
git pull origin fup-001/formal-kernel
grep -Ec '^(check|run) ' formal/fup-001/model/historical-replay.als
```

Must return exactly `4`.

Run:

```bash
bash formal/fup-001/scripts/run-historical-replay.sh 6 sat4j primary
bash formal/fup-001/scripts/run-historical-replay.sh 8 sat4j scope8
bash formal/fup-001/scripts/run-historical-replay.sh 10 sat4j scope10
bash formal/fup-001/scripts/run-historical-replay.sh 6 glucose solver-replication
```

Expected commands:

- CAN002_PendingShape
- CAN003_SharedProvenanceShape
- CAN003_MultipleSourcesImplyIndependentOrigins
- IndependentDocumentaryPairReachable

Preserve all raw artifacts.

Critical interpretation rule:
- SAT for the two historical shape runs means the model can represent those historical constraints.
- SAT counterexample for `CAN003_MultipleSourcesImplyIndependentOrigins` means source multiplicity does not force independent origin.
- Do not claim the formal instance reproduces the exact undocumented causal graph of the real Wikimedia sources.

Return:
- result commit SHA;
- 4 × 4 SAT/UNSAT matrix;
- structural summary;
- any scope/solver disagreement;
- no Gate E adjudication.
