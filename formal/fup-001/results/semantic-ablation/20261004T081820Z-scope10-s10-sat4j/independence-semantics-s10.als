module fup001/independence_semantics

abstract sig Empiricality {}
one sig EMPIRICAL, SYNTHETIC extends Empiricality {}

sig Reporter {}
sig Incident {}

sig Source {
  parent: set Source,
  empiricality: one Empiricality
}

fact SourceLineageAcyclic {
  no s: Source | s in s.^parent
}

fun roots[s: Source]: set Source {
  { r: s.*parent | no r.parent }
}

sig Evidence {
  source: one Source,
  reporter: lone Reporter,
  incident: lone Incident
}

sig Claim {
  evidence: set Evidence
}

pred indSource[e1, e2: Evidence] {
  e1 != e2
  e1.source != e2.source
}

pred indLineage[e1, e2: Evidence] {
  e1 != e2
  no (roots[e1.source] & roots[e2.source])
}

pred indReporter[e1, e2: Evidence] {
  e1 != e2
  some e1.reporter
  some e2.reporter
  e1.reporter != e2.reporter
}

pred indIncident[e1, e2: Evidence] {
  e1 != e2
  some e1.incident
  some e2.incident
  e1.incident != e2.incident
}

pred empirical[e: Evidence] {
  e.source.empiricality = EMPIRICAL
}

pred corroboratedSource[c: Claim] {
  some disj e1, e2: c.evidence |
    empirical[e1] and empirical[e2] and indSource[e1,e2]
}

pred corroboratedLineage[c: Claim] {
  some disj e1, e2: c.evidence |
    empirical[e1] and empirical[e2] and indLineage[e1,e2]
}

pred corroboratedReporter[c: Claim] {
  some disj e1, e2: c.evidence |
    empirical[e1] and empirical[e2] and indReporter[e1,e2]
}

pred corroboratedIncident[c: Claim] {
  some disj e1, e2: c.evidence |
    empirical[e1] and empirical[e2] and indIncident[e1,e2]
}

pred FP_SourceVsLineage {
  some c: Claim |
    corroboratedSource[c] and not corroboratedLineage[c]
}

pred DIV_ReporterVsIncident {
  some c: Claim |
    corroboratedReporter[c] and not corroboratedIncident[c]
}

pred DIV_IncidentVsReporter {
  some c: Claim |
    corroboratedIncident[c] and not corroboratedReporter[c]
}

pred DIV_ReporterVsLineage {
  some c: Claim |
    corroboratedReporter[c] and not corroboratedLineage[c]
}

pred DIV_IncidentVsLineage {
  some c: Claim |
    corroboratedIncident[c] and not corroboratedLineage[c]
}

pred AGREE_Strong {
  some c: Claim |
    corroboratedLineage[c] and
    corroboratedReporter[c] and
    corroboratedIncident[c]
}

assert SourceCorroborationImpliesLineageCorroboration {
  all c: Claim |
    corroboratedSource[c] implies corroboratedLineage[c]
}

assert ReporterCorroborationImpliesIncidentCorroboration {
  all c: Claim |
    corroboratedReporter[c] implies corroboratedIncident[c]
}

assert IncidentCorroborationImpliesReporterCorroboration {
  all c: Claim |
    corroboratedIncident[c] implies corroboratedReporter[c]
}

assert ReporterCorroborationImpliesLineageCorroboration {
  all c: Claim |
    corroboratedReporter[c] implies corroboratedLineage[c]
}

check SourceCorroborationImpliesLineageCorroboration for 10
check ReporterCorroborationImpliesIncidentCorroboration for 10
check IncidentCorroborationImpliesReporterCorroboration for 10
check ReporterCorroborationImpliesLineageCorroboration for 10

run FP_SourceVsLineage for 10
run DIV_ReporterVsIncident for 10
run DIV_IncidentVsReporter for 10
run DIV_ReporterVsLineage for 10
run DIV_IncidentVsLineage for 10
run AGREE_Strong for 10
