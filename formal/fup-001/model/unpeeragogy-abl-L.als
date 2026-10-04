// FUP-001 minimal relational kernel.
// This model intentionally keeps the major UnPeeragogy state dimensions
// separate. It is exploratory: comments labelled ASSUMPTION are not protocol facts.

abstract sig Truth {}
one sig YES, NO extends Truth {}

abstract sig ActorKind {}
one sig AK_HUMAN, AK_AUTOMATION extends ActorKind {}

abstract sig HumanReviewStatus {}
one sig
  HR_PENDING,
  HR_ACCEPTED,
  HR_REJECTED,
  HR_REVISE,
  HR_NEEDS_EVIDENCE,
  HR_CONTESTED
extends HumanReviewStatus {}

abstract sig ProcessingStatus {}
one sig
  PS_RAW,
  PS_CANDIDATE,
  PS_ENGINE_PASSED,
  PS_ENGINE_DEGRADED,
  PS_ENGINE_REJECTED
extends ProcessingStatus {}

abstract sig EpistemicStatus {}
one sig
  ES_OBSERVED,
  ES_REPORTED,
  ES_INTERPRETED,
  ES_HYPOTHESIZED,
  ES_CORROBORATED,
  ES_CONTESTED,
  ES_REVISED
extends EpistemicStatus {}

abstract sig VerificationStatus {}
one sig
  VS_UNVERIFIED,
  VS_SOURCE_LINKED,
  VS_PARTIALLY_SUPPORTED,
  VS_CORROBORATED,
  VS_CONTESTED
extends VerificationStatus {}

abstract sig IntegrityLevel {}
one sig
  IL_LEGACY,
  IL_STRUCTURED,
  IL_VERIFIED,
  IL_CONTESTED
extends IntegrityLevel {}

abstract sig GateBStatus {}
one sig
  GB_PENDING,
  GB_NO_CHANGE,
  GB_MUTATION_APPROVED
extends GateBStatus {}

abstract sig Empiricality {}
one sig EMPIRICAL, SYNTHETIC extends Empiricality {}

sig Actor {
  actorKind: one ActorKind
}

// parent encodes evidential/source derivation lineage.
// A source can have several parents because a synthesis may derive from several sources.
sig Source {
  parent: set Source,
  traceable: one Truth,
  empiricality: one Empiricality
}

fact SourceLineageIsAcyclic {
  no s: Source | s in s.^parent
}

// A root is an ancestor (possibly self) with no further parent.
fun roots[s: Source]: set Source {
  { r: s.*parent | no r.parent }
}

// PROVISIONAL DEFINITION.
// This is source-lineage independence, not yet a final definition of
// independent incident / independent observer / independent evidence.
pred independent[s1, s2: Source] {
  no (roots[s1] & roots[s2])
}

sig EvidenceItem {
  source: one Source
}

sig Candidate {
  evidence: set EvidenceItem,
  processing: one ProcessingStatus,
  human: one HumanReviewStatus,
  epistemic: one EpistemicStatus,
  verification: one VerificationStatus,
  integrity: one IntegrityLevel,
  gateB: one GateBStatus
}

sig HumanDecision {
  candidate: one Candidate,
  actor: one Actor,
  outcome: one HumanReviewStatus,
  basis: set EvidenceItem
}

// Gate B is an explicit editorial decision, not a boolean publication property.
// CAN-001 demonstrates a real GB_NO_CHANGE outcome after Gate A acceptance.
sig GateBDecision {
  candidate: one Candidate,
  actor: one Actor,
  outcome: one GateBStatus
}

// Repository-grounded: automation may create PENDING but substantive Gate A
// outcomes require explicit human action.
fact SubstantiveHumanDecisionsRequireHumanActor {
  all d: HumanDecision |
    d.outcome != HR_PENDING implies d.actor.actorKind = AK_HUMAN
}

// If a candidate currently carries a substantive human status, at least one
// matching human decision record must exist.
fact CurrentHumanStatusHasAuditRecord {
  all c: Candidate |
    c.human != HR_PENDING implies
      some d: HumanDecision |
        d.candidate = c and d.outcome = c.human
}

// The review guide requires a rationale/evidence-grounded decision.
// The model abstracts the rationale as a non-empty evidential basis for ACCEPTED.
fact DecisionBasisBelongsToCandidate {
  all d: HumanDecision | d.basis in d.candidate.evidence
}

fact AcceptedDecisionHasBasis {
  all d: HumanDecision |
    d.outcome = HR_ACCEPTED implies some d.basis
}

fact CurrentGateBStatusHasAuditRecord {
  all c: Candidate |
    c.gateB != GB_PENDING implies
      some d: GateBDecision |
        d.candidate = c and d.outcome = c.gateB
}

fact SubstantiveGateBDecisionsRequireHumanActor {
  all d: GateBDecision |
    d.outcome != GB_PENDING implies d.actor.actorKind = AK_HUMAN
}

// ASSUMPTION A-003 + provisional A-001 treatment:
// "multiple independent incidents" is operationalised here as at least
// two empirical evidence items whose source lineages have disjoint roots.
pred hasIndependentEmpiricalPair[c: Candidate] {
  some disj e1, e2: c.evidence |
    e1.source.empiricality = EMPIRICAL and
    e2.source.empiricality = EMPIRICAL and
    independent[e1.source, e2.source]
}

fact EpistemicCorroborationRequiresIndependentEmpiricalPair {
  all c: Candidate |
    c.epistemic = ES_CORROBORATED implies hasIndependentEmpiricalPair[c]
}

// Research Data Model: verified records require traceable evidence.
fact VerifiedIntegrityRequiresTraceableEvidence {
  all c: Candidate |
    c.integrity = IL_VERIFIED implies
      some c.evidence and
      all e: c.evidence | e.source.traceable = YES
}

sig Interpretation {
  epistemic: one EpistemicStatus,
  revisedFrom: lone Interpretation
}

fact RevisionGraphIsAcyclic {
  no i: Interpretation | i in i.^revisedFrom
}

fact RevisedInterpretationPreservesPredecessor {
  all i: Interpretation |
    i.epistemic = ES_REVISED implies some i.revisedFrom
}

// ---------------------------------------------------------------------------
// Properties expected to HOLD in v0.1
// ---------------------------------------------------------------------------

assert AutomationCannotAccept {
  no d: HumanDecision |
    d.outcome = HR_ACCEPTED and d.actor.actorKind = AK_AUTOMATION
}

assert CorroboratedCannotBeSyntheticOnly {
  all c: Candidate |
    c.epistemic = ES_CORROBORATED implies
      some e: c.evidence | e.source.empiricality = EMPIRICAL
}

assert VerifiedCannotUseOnlyUntraceableEvidence {
  all c: Candidate |
    c.integrity = IL_VERIFIED implies
      some e: c.evidence | e.source.traceable = YES
}

assert RevisedHasHistory {
  all i: Interpretation |
    i.epistemic = ES_REVISED implies some i.revisedFrom
}

// ---------------------------------------------------------------------------
// Naive properties expected to FAIL.
// Their counterexamples are useful scientific artifacts.
// ---------------------------------------------------------------------------

// Distinct URLs/source nodes do not guarantee independent origin.
assert Naive_DistinctSourcesAreIndependent {
  all disj s1, s2: Source | independent[s1, s2]
}

// Gate A is not Gate B.
assert Naive_AcceptedImpliesGateBMutation {
  all c: Candidate |
    c.human = HR_ACCEPTED implies c.gateB = GB_MUTATION_APPROVED
}

// Human acceptance is not epistemic corroboration.
assert Naive_AcceptedImpliesCorroborated {
  all c: Candidate |
    c.human = HR_ACCEPTED implies c.epistemic = ES_CORROBORATED
}

// Engine processing outcome is not a human decision.
assert Naive_EnginePassedImpliesAccepted {
  all c: Candidate |
    c.processing = PS_ENGINE_PASSED implies c.human = HR_ACCEPTED
}

// Same lexical term on different axes does not justify synchronization.
assert Naive_VerificationContestedImpliesHumanContested {
  all c: Candidate |
    c.verification = VS_CONTESTED implies c.human = HR_CONTESTED
}

// ---------------------------------------------------------------------------
// Witness scenarios
// ---------------------------------------------------------------------------

pred acceptedWithGateBNoChange {
  some c: Candidate |
    c.human = HR_ACCEPTED and c.gateB = GB_NO_CHANGE
}

pred gateAAcceptedBeforeGateBDecision {
  some c: Candidate |
    c.human = HR_ACCEPTED and c.gateB = GB_PENDING
}

pred sharedOriginDifferentSources {
  some disj s1, s2: Source |
    s1 != s2 and some (roots[s1] & roots[s2])
}

pred acceptedButNotCorroborated {
  some c: Candidate |
    c.human = HR_ACCEPTED and c.epistemic != ES_CORROBORATED
}

// Vacuity witnesses: a passing assertion is useful only if the relevant
// antecedent/state can actually occur in the bounded model.
pred witnessSubstantiveHumanDecision {
  some d: HumanDecision | d.outcome != HR_PENDING
}

pred witnessCorroboratedCandidate {
  some c: Candidate | c.epistemic = ES_CORROBORATED
}

pred witnessVerifiedCandidate {
  some c: Candidate | c.integrity = IL_VERIFIED
}

pred witnessRevisedInterpretation {
  some i: Interpretation | i.epistemic = ES_REVISED
}

// Historical regression witness derived from CAN-001.
// It intentionally does not require ENGINE_PASSED.
pred can001Shape {
  some c: Candidate, hd: HumanDecision, gd: GateBDecision |
    c.human = HR_ACCEPTED and
    c.gateB = GB_NO_CHANGE and
    c.processing = PS_CANDIDATE and
    hd.candidate = c and hd.outcome = HR_ACCEPTED and
    gd.candidate = c and gd.outcome = GB_NO_CHANGE
}

// Bounded exploration commands.
// Scope values are deliberately small to favour minimal counterexamples.
check AutomationCannotAccept for 6
check CorroboratedCannotBeSyntheticOnly for 6
check VerifiedCannotUseOnlyUntraceableEvidence for 6
check RevisedHasHistory for 6

check Naive_DistinctSourcesAreIndependent for 6
check Naive_AcceptedImpliesGateBMutation for 6
check Naive_AcceptedImpliesCorroborated for 6
check Naive_EnginePassedImpliesAccepted for 6
check Naive_VerificationContestedImpliesHumanContested for 6

run acceptedWithGateBNoChange for 6
run gateAAcceptedBeforeGateBDecision for 6
run sharedOriginDifferentSources for 6
run acceptedButNotCorroborated for 6

run witnessSubstantiveHumanDecision for 6
run witnessCorroboratedCandidate for 6
run witnessVerifiedCandidate for 6
run witnessRevisedInterpretation for 6
run can001Shape for 6
