# Prompt for Pi — FUP-001 Independence Ablation

You are Pi, mechanical verification operator.

The baseline run is complete and immutable at results commit:

`fbd451dca4365be44308be698f2724a821edcf5d`

Do not alter or overwrite the baseline artifacts.

Read:

1. `research/fup-001/BASELINE_INTERPRETATION_v0.1.md`
2. `research/fup-001/INDEPENDENCE_ABLATION_PROTOCOL.md`
3. `formal/fup-001/model/independence-ablation.als`

Then execute the new model as a separate experiment using the committed runner `formal/fup-001/scripts/run-independence-ablation.sh`.

## Required sequence

1. Record current branch and commit SHA.
2. Confirm baseline result directory still exists.
3. Capture environment again.
4. Run `bash formal/fup-001/scripts/run-independence-ablation.sh 6 sat4j primary`.
5. Preserve raw artifacts before any edit.
6. Run `bash formal/fup-001/scripts/run-independence-ablation.sh 8 sat4j scope8`.
7. Run `bash formal/fup-001/scripts/run-independence-ablation.sh 10 sat4j scope10` if tractable.
8. Run scope 6 with one second solver reported by `alloy solvers`, preferably `minisat` or `glucose`, e.g. `bash formal/fup-001/scripts/run-independence-ablation.sh 6 minisat solver-replication`.
9. Create a result matrix comparing command × scope × solver.
10. For every SAT counterexample, preserve its JSON and create a concise structural record.

## Commands of primary interest

Checks:
- `SourceDistinctImpliesLineageIndependent`
- `ReporterIndependentImpliesIncidentIndependent`
- `IncidentIndependentImpliesReporterIndependent`
- `ReporterIndependentImpliesLineageIndependent`

Runs:
- `sourceMultiplicityFalsePositive`
- `reporterIncidentDivergence`
- `incidentReporterDivergence`
- `reporterLineageDivergence`
- `incidentLineageDivergence`
- `witnessStrongIndependence`

## Do not interpret

Your job is to report whether each structure is SAT/UNSAT and preserve the minimal relation structure.

Do not state that lineage/reporters/incidents are the “correct” definition of independence.

## Stop conditions

Stop and preserve an anomaly report if:

- parser error;
- model requires modification;
- scope 8/10 causes resource failure;
- second solver unavailable;
- a primary SAT/UNSAT classification changes across scopes or solvers.

A classification change is a research result and must not be hidden.

Commit and push all raw results on `fup-001/formal-kernel`, then return the result commit SHA.
