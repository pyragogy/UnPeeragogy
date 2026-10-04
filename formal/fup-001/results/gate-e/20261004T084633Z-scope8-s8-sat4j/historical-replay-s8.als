module fup001/historical_replay

// FUP-001 E5 — historical replay for CAN-002 / CAN-003.
// This model encodes only historically supported distinctions.

abstract sig HumanStatus {}
one sig PENDING, ACCEPTED extends HumanStatus {}

abstract sig ProcessingStatus {}
one sig CANDIDATE extends ProcessingStatus {}

sig Source {
  parent: set Source
}

fact Acyclic {
  no s: Source | s in s.^parent
}

fun roots[s: Source]: set Source {
  { r: s.*parent | no r.parent }
}

sig Evidence {
  source: one Source
}

sig Candidate {
  evidence: set Evidence,
  processing: one ProcessingStatus,
  human: one HumanStatus
}

pred sourceDistinct[e1,e2: Evidence] {
  e1 != e2 and e1.source != e2.source
}

pred lineageIndependent[e1,e2: Evidence] {
  e1 != e2 and no (roots[e1.source] & roots[e2.source])
}

// CAN-002 historical shape:
// documentary candidate exists before substantive human decision.
pred CAN002_PendingShape {
  some c: Candidate |
    c.processing = CANDIDATE and
    c.human = PENDING and
    some c.evidence
}

// CAN-003 historical provenance shape:
// multiple documentary nodes but provenance dependency blocks independence.
// A shared root is a conservative abstraction of the historical note that
// the research pages and paper share authors/datasets.
pred CAN003_SharedProvenanceShape {
  some c: Candidate |
    c.processing = CANDIDATE and
    c.human = PENDING and
    some disj e1,e2: c.evidence |
      sourceDistinct[e1,e2] and
      not lineageIndependent[e1,e2]
}

// The exact historical distinction we must NOT infer.
assert CAN003_MultipleSourcesImplyIndependentOrigins {
  all c: Candidate |
    (some disj e1,e2: c.evidence | sourceDistinct[e1,e2])
    implies
    (some disj e1,e2: c.evidence | lineageIndependent[e1,e2])
}

// Positive control: independent documentary origins are still reachable.
pred IndependentDocumentaryPairReachable {
  some c: Candidate |
    some disj e1,e2: c.evidence |
      sourceDistinct[e1,e2] and lineageIndependent[e1,e2]
}

run CAN002_PendingShape for 8
run CAN003_SharedProvenanceShape for 8
check CAN003_MultipleSourcesImplyIndependentOrigins for 8
run IndependentDocumentaryPairReachable for 8
