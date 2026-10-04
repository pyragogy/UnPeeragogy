# Pi Handoff — E4 Gate D Adversarial Validation

Pull the latest `fup-001/formal-kernel`.

Read:
- research/fup-001/GATE_D.md
- formal/fup-001/model/adversarial-independence.als
- formal/fup-001/scripts/run-gate-d.sh

Preflight:

```bash
git pull origin fup-001/formal-kernel
grep -Ec '^(check|run) ' formal/fup-001/model/adversarial-independence.als
```

The count must be exactly 10.

Execute:

```bash
bash formal/fup-001/scripts/run-gate-d.sh 6 sat4j primary
bash formal/fup-001/scripts/run-gate-d.sh 8 sat4j scope8
bash formal/fup-001/scripts/run-gate-d.sh 10 sat4j scope10
bash formal/fup-001/scripts/run-gate-d.sh 6 glucose solver-replication
```

Preserve raw artifacts before interpretation.

Return:
- result commit SHA;
- 10 × 4 SAT/UNSAT matrix;
- minimal structure of every counterexample/witness;
- any scope/solver disagreement;
- whether `ADV_AllSurfaceDiversitySharedLineage` is SAT;
- whether `ADV_AllDimensionsIndependent` is SAT.

Do not alter E1/E2/E3 artifacts.
Do not declare Gate D PASS/FAIL; researcher adjudicates.
