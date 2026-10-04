# FUP-001 Gate D — Adversarial Validation

## Status

**OPEN**

Gate C passed on E3 semantic sensitivity.

Gate D attempts to destroy the interpretation by removing easy modelling loopholes.

## Primary attacks

### D1 — Null-metadata attack

E3 reporter/incident divergences can use absent reporter/incident assignments.

E4 removes this possibility:
- reporter is mandatory;
- incident is mandatory.

### D2 — Cardinality attack

E4 requires exactly two evidence items for the target Claim.

This prevents divergence from being an artefact of larger unconstrained evidence sets.

### D3 — Surface-diversity attack

Test whether all three observable diversities can hold simultaneously:

- different immediate sources;
- different reporters;
- different incidents;

while provenance roots still overlap.

If SAT, lineage remains an orthogonal dimension even under complete surface diversity.

### D4 — Positive-control attack

`ADV_AllDimensionsIndependent` must be SAT.

Otherwise the model may have been overconstrained so that lineage agreement is impossible.

## E4 commands

Checks:
- CompleteReporterImpliesIncident
- CompleteIncidentImpliesReporter
- CompleteSourceImpliesLineage
- SurfaceDiversityImpliesLineage

Runs:
- ADV_SourceVsLineage
- ADV_ReporterVsIncident
- ADV_IncidentVsReporter
- ADV_ReporterSourceVsLineage
- ADV_AllSurfaceDiversitySharedLineage
- ADV_AllDimensionsIndependent

## Pass rule

Gate D receives PASS if:

1. source-vs-lineage divergence survives complete metadata and exact cardinality;
2. positive control remains SAT;
3. at least one reporter/incident divergence survives without null metadata;
4. classifications are stable at scopes 6/8/10;
5. scope 6 is reproduced on a second solver where available.

Gate D does not establish that lineage is normatively superior. It establishes that these dimensions remain formally non-interchangeable after obvious loopholes are closed.
