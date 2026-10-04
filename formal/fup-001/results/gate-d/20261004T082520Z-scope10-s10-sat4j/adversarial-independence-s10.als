module fup001/adversarial_independence

// FUP-001 E4 — Gate D adversarial validation.
// Removes easy null-metadata explanations from E3 by requiring complete
// reporter + incident metadata and exactly two empirical evidence items.

sig Reporter {}
sig Incident {}

sig Source {
  parent: set Source
}

fact AcyclicLineage {
  no s: Source | s in s.^parent
}

fun roots[s: Source]: set Source {
  { r: s.*parent | no r.parent }
}

sig Evidence {
  source: one Source,
  reporter: one Reporter,
  incident: one Incident
}

sig Claim {
  evidence: set Evidence
}

pred exactlyTwoEvidence[c: Claim] {
  #c.evidence = 2
}

pred sourceIndependent[e1,e2: Evidence] {
  e1 != e2 and e1.source != e2.source
}

pred lineageIndependent[e1,e2: Evidence] {
  e1 != e2 and no (roots[e1.source] & roots[e2.source])
}

pred reporterIndependent[e1,e2: Evidence] {
  e1 != e2 and e1.reporter != e2.reporter
}

pred incidentIndependent[e1,e2: Evidence] {
  e1 != e2 and e1.incident != e2.incident
}

// Source multiplicity but common provenance root, with all metadata complete.
pred ADV_SourceVsLineage {
  some c: Claim |
    exactlyTwoEvidence[c] and
    some disj e1,e2: c.evidence |
      sourceIndependent[e1,e2] and
      not lineageIndependent[e1,e2]
}

// Two distinct reporters, same incident, complete metadata.
pred ADV_ReporterVsIncident {
  some c: Claim |
    exactlyTwoEvidence[c] and
    some disj e1,e2: c.evidence |
      reporterIndependent[e1,e2] and
      not incidentIndependent[e1,e2]
}

// Two distinct incidents, same reporter, complete metadata.
pred ADV_IncidentVsReporter {
  some c: Claim |
    exactlyTwoEvidence[c] and
    some disj e1,e2: c.evidence |
      incidentIndependent[e1,e2] and
      not reporterIndependent[e1,e2]
}

// Different reporters, different immediate source nodes, but shared lineage.
pred ADV_ReporterSourceVsLineage {
  some c: Claim |
    exactlyTwoEvidence[c] and
    some disj e1,e2: c.evidence |
      reporterIndependent[e1,e2] and
      sourceIndependent[e1,e2] and
      not lineageIndependent[e1,e2]
}

// Different incidents and reporters, distinct source nodes, but shared lineage.
// This tests whether provenance lineage is genuinely an orthogonal dimension,
// not merely a proxy for reporter/incident/source diversity.
pred ADV_AllSurfaceDiversitySharedLineage {
  some c: Claim |
    exactlyTwoEvidence[c] and
    some disj e1,e2: c.evidence |
      sourceIndependent[e1,e2] and
      reporterIndependent[e1,e2] and
      incidentIndependent[e1,e2] and
      not lineageIndependent[e1,e2]
}

// Positive control: all dimensions can agree.
pred ADV_AllDimensionsIndependent {
  some c: Claim |
    exactlyTwoEvidence[c] and
    some disj e1,e2: c.evidence |
      sourceIndependent[e1,e2] and
      reporterIndependent[e1,e2] and
      incidentIndependent[e1,e2] and
      lineageIndependent[e1,e2]
}

// Explicit invalid implications under complete metadata.
assert CompleteReporterImpliesIncident {
  all disj e1,e2: Evidence |
    reporterIndependent[e1,e2] implies incidentIndependent[e1,e2]
}

assert CompleteIncidentImpliesReporter {
  all disj e1,e2: Evidence |
    incidentIndependent[e1,e2] implies reporterIndependent[e1,e2]
}

assert CompleteSourceImpliesLineage {
  all disj e1,e2: Evidence |
    sourceIndependent[e1,e2] implies lineageIndependent[e1,e2]
}

assert SurfaceDiversityImpliesLineage {
  all disj e1,e2: Evidence |
    (sourceIndependent[e1,e2] and
     reporterIndependent[e1,e2] and
     incidentIndependent[e1,e2])
    implies lineageIndependent[e1,e2]
}

check CompleteReporterImpliesIncident for 10
check CompleteIncidentImpliesReporter for 10
check CompleteSourceImpliesLineage for 10
check SurfaceDiversityImpliesLineage for 10

run ADV_SourceVsLineage for 10
run ADV_ReporterVsIncident for 10
run ADV_IncidentVsReporter for 10
run ADV_ReporterSourceVsLineage for 10
run ADV_AllSurfaceDiversitySharedLineage for 10
run ADV_AllDimensionsIndependent for 10
