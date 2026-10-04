module fup001/independence_ablation

// FUP-001 v0.2 — independence semantics ablation.
//
// Goal:
// Show that different plausible operationalisations of "independent evidence"
// can classify the same evidence set differently.
//
// This model does NOT declare one definition to be universally correct.
// It makes the sensitivity mechanically inspectable.

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

// ---------------------------------------------------------------------------
// Rival independence definitions
// ---------------------------------------------------------------------------

// IND-S: naive source multiplicity.
// Two evidence items count as independent when their immediate source nodes differ.
pred independentBySourceNode[e1, e2: Evidence] {
  e1.source != e2.source
}

// IND-L: provenance/source-lineage independence.
// Their root evidential origins do not intersect.
pred independentByLineage[e1, e2: Evidence] {
  no (roots[e1.source] & roots[e2.source])
}

// IND-R: reporter independence.
// Requires two identified, different reporters.
pred independentByReporter[e1, e2: Evidence] {
  some e1.reporter
  some e2.reporter
  e1.reporter != e2.reporter
}

// IND-I: incident independence.
// Requires two identified, different real-world incidents/events.
pred independentByIncident[e1, e2: Evidence] {
  some e1.incident
  some e2.incident
  e1.incident != e2.incident
}

pred empiricalPair[c: Claim, rel: Evidence -> Evidence] {
  some disj e1, e2: c.evidence |
    e1.source.empiricality = EMPIRICAL and
    e2.source.empiricality = EMPIRICAL and
    e1 -> e2 in rel
}

fun relSourceNode: Evidence -> Evidence {
  { e1, e2: Evidence | independentBySourceNode[e1,e2] }
}

fun relLineage: Evidence -> Evidence {
  { e1, e2: Evidence | independentByLineage[e1,e2] }
}

fun relReporter: Evidence -> Evidence {
  { e1, e2: Evidence | independentByReporter[e1,e2] }
}

fun relIncident: Evidence -> Evidence {
  { e1, e2: Evidence | independentByIncident[e1,e2] }
}

pred corroboratedBySourceNode[c: Claim] {
  empiricalPair[c, relSourceNode]
}

pred corroboratedByLineage[c: Claim] {
  empiricalPair[c, relLineage]
}

pred corroboratedByReporter[c: Claim] {
  empiricalPair[c, relReporter]
}

pred corroboratedByIncident[c: Claim] {
  empiricalPair[c, relIncident]
}

// ---------------------------------------------------------------------------
// Gate C candidate counterexamples
// ---------------------------------------------------------------------------

// False corroboration candidate:
// two distinct source nodes appear to corroborate, but descend from common roots.
pred sourceMultiplicityFalsePositive {
  some c: Claim |
    corroboratedBySourceNode[c] and
    not corroboratedByLineage[c]
}

// Two different people can report the same incident.
// Reporter independence therefore need not imply incident independence.
pred reporterIncidentDivergence {
  some c: Claim |
    corroboratedByReporter[c] and
    not corroboratedByIncident[c]
}

// One reporter can describe multiple distinct incidents.
// Incident independence therefore need not imply reporter independence.
pred incidentReporterDivergence {
  some c: Claim |
    corroboratedByIncident[c] and
    not corroboratedByReporter[c]
}

// Different reporters may still derive claims from a common evidential source lineage.
pred reporterLineageDivergence {
  some c: Claim |
    corroboratedByReporter[c] and
    not corroboratedByLineage[c]
}

// Distinct incidents may still be represented through a common derived/synthetic
// documentary lineage. This is not necessarily invalid; it demonstrates dimensions.
pred incidentLineageDivergence {
  some c: Claim |
    corroboratedByIncident[c] and
    not corroboratedByLineage[c]
}

// Strong conjunction: all three substantive dimensions agree.
pred stronglyIndependentPair[c: Claim] {
  some disj e1, e2: c.evidence |
    e1.source.empiricality = EMPIRICAL and
    e2.source.empiricality = EMPIRICAL and
    independentByLineage[e1,e2] and
    independentByReporter[e1,e2] and
    independentByIncident[e1,e2]
}

pred witnessStrongIndependence {
  some c: Claim | stronglyIndependentPair[c]
}

// ---------------------------------------------------------------------------
// Assertions deliberately testing invalid implications.
// Counterexamples are the experimental result.
// ---------------------------------------------------------------------------

assert SourceDistinctImpliesLineageIndependent {
  all disj e1, e2: Evidence |
    independentBySourceNode[e1,e2] implies independentByLineage[e1,e2]
}

assert ReporterIndependentImpliesIncidentIndependent {
  all disj e1, e2: Evidence |
    independentByReporter[e1,e2] implies independentByIncident[e1,e2]
}

assert IncidentIndependentImpliesReporterIndependent {
  all disj e1, e2: Evidence |
    independentByIncident[e1,e2] implies independentByReporter[e1,e2]
}

assert ReporterIndependentImpliesLineageIndependent {
  all disj e1, e2: Evidence |
    independentByReporter[e1,e2] implies independentByLineage[e1,e2]
}

// Minimal bounded experiments.
check SourceDistinctImpliesLineageIndependent for 6
check ReporterIndependentImpliesIncidentIndependent for 6
check IncidentIndependentImpliesReporterIndependent for 6
check ReporterIndependentImpliesLineageIndependent for 6

run sourceMultiplicityFalsePositive for 6
run reporterIncidentDivergence for 6
run incidentReporterDivergence for 6
run reporterLineageDivergence for 6
run incidentLineageDivergence for 6
run witnessStrongIndependence for 6
