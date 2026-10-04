# Pi Handoff — E3 Same-Structure Independence Semantics

This supersedes previous independence-ablation instructions.

Do NOT create separate L/R/I variants of the baseline kernel. E2 (commit 7d32a73) already did that.

E3 asks: can the SAME Claim + Evidence structure be classified as corroborated under one independence semantics and not another?

Use only:

- formal/fup-001/model/independence-semantics.als
- formal/fup-001/scripts/run-independence-semantics.sh

Preflight:

git fetch origin
git checkout fup-001/formal-kernel
git pull origin fup-001/formal-kernel
git rev-parse HEAD
grep -Ec '^(check|run) ' formal/fup-001/model/independence-semantics.als

The last command MUST print 10. Otherwise stop.

Primary runs:

bash formal/fup-001/scripts/run-independence-semantics.sh 6 sat4j primary
bash formal/fup-001/scripts/run-independence-semantics.sh 8 sat4j scope8
bash formal/fup-001/scripts/run-independence-semantics.sh 10 sat4j scope10

Then, if available:

bash formal/fup-001/scripts/run-independence-semantics.sh 6 glucose solver-replication

Expected command names:

Checks:
1. SourceCorroborationImpliesLineageCorroboration
2. ReporterCorroborationImpliesIncidentCorroboration
3. IncidentCorroborationImpliesReporterCorroboration
4. ReporterCorroborationImpliesLineageCorroboration

Runs:
5. FP_SourceVsLineage
6. DIV_ReporterVsIncident
7. DIV_IncidentVsReporter
8. DIV_ReporterVsLineage
9. DIV_IncidentVsLineage
10. AGREE_Strong

If output contains baseline command names such as AutomationCannotAccept or can001Shape, STOP: wrong model.

Preserve all raw artifacts and push them without modifying E1/E2.
Return results commit SHA plus SAT/UNSAT matrix for all 10 commands.
