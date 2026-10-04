# FUP-001 Gate D — Adversarial Validation

## Status

**PASS — E4 adversarial validation**

Adjudicated: 2026-10-04

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

Gate D pass criteria (all satisfied by E4):

1. source-vs-lineage divergence survives complete metadata and exact cardinality;
2. positive control remains SAT;
3. at least one reporter/incident divergence survives without null metadata;
4. classifications are stable at scopes 6/8/10;
5. scope 6 is reproduced on a second solver where available.

Gate D does not establish that lineage is normatively superior. It establishes that these dimensions remain formally non-interchangeable after obvious loopholes are closed.


## E4 adjudication

Mechanical report:

- SAT4J scopes 6, 8, 10;
- Glucose scope 6;
- 10 commands × 4 executions = 40 classifications;
- 40/40 SAT;
- zero scope disagreement;
- zero solver disagreement;
- complete reporter metadata;
- complete incident metadata;
- exact target cardinality of two evidence items.

### D1 — null metadata

**SURVIVED**

Reporter/incident divergences remain reachable when both metadata fields are mandatory.

### D2 — cardinality

**SURVIVED**

Divergences remain reachable with exactly two evidence items.

### D3 — surface diversity

**SURVIVED**

`ADV_AllSurfaceDiversitySharedLineage` is SAT.

The same pair of evidence items can have:

- distinct immediate sources;
- distinct reporters;
- distinct incidents;

while still sharing provenance lineage.

Therefore source diversity, reporter diversity and incident diversity do not jointly entail provenance-lineage independence.

### D4 — positive control

**PASS**

`ADV_AllDimensionsIndependent` is SAT.

The model therefore admits structures where source, reporter, incident and lineage independence all hold simultaneously; it is not forcing divergence by construction.

## Gate D conclusion

The E3 semantic-sensitivity result survives the obvious adversarial attacks.

Supported conclusion:

> Provenance-lineage independence is formally orthogonal to source-node, reporter and incident diversity in the tested model. Even complete surface diversity does not guarantee independent evidential origin.

This remains a bounded formal result. It does not establish that provenance lineage is normatively superior in every domain.

## Next gate

Proceed to **Gate E — Historical Reconstruction**.
