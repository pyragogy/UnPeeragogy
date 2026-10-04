// FUP-001 ablation variant — IND-R (Reporter Independence).
// Two sources are independent if they have different reporters.
// Identical to baseline except:
//   - Source adds `reporter: lone Actor`
//   - independent predicate uses reporter comparison

abstract sig Truth {}
one sig YES, NO extends Truth {}

abstract sig ActorKind {}
one sig AK_HUMAN, AK_AUTOMATION extends ActorKind {}

abstract sig HumanReviewStatus {}
one sig
  HR_PENDING, HR_ACCEPTED, HR_REJECTED, HR_REVISE, HR_NEEDS_EVIDENCE, HR_CONTESTED
extends HumanReviewStatus {}

abstract sig ProcessingStatus {}
one sig
  PS_RAW, PS_CANDIDATE, PS_ENGINE_PASSED, PS_ENGINE_DEGRADED, PS_ENGINE_REJECTED
extends ProcessingStatus {}

abstract sig EpistemicStatus {}
one sig
  ES_OBSERVED, ES_REPORTED, ES_INTERPRETED, ES_HYPOTHESIZED,
  ES_CORROBORATED, ES_CONTESTED, ES_REVISED
extends EpistemicStatus {}

abstract sig VerificationStatus {}
one sig
  VS_UNVERIFIED, VS_SOURCE_LINKED, VS_PARTIALLY_SUPPORTED,
  VS_CORROBORATED, VS_CONTESTED
extends VerificationStatus {}

abstract sig IntegrityLevel {}
one sig IL_LEGACY, IL_STRUCTURED, IL_VERIFIED, IL_CONTESTED
extends IntegrityLevel {}

abstract sig GateBStatus {}
one sig GB_PENDING, GB_NO_CHANGE, GB_MUTATION_APPROVED
extends GateBStatus {}

abstract sig Empiricality {}
one sig EMPIRICAL, SYNTHETIC extends Empiricality {}

sig Actor {
  actorKind: one ActorKind
}

// IND-R: Source now carries a reporter (the actor who reported this source).
sig Source {
  parent: set Source,
  traceable: one Truth,
  empiricality: one Empiricality,
  reporter: lone Actor
}

fact SourceLineageIsAcyclic {
  no s: Source | s in s.^parent
}

fun roots[s: Source]: set Source {
  { r: s.*parent | no r.parent }
}

// IND-R definition:
// Two sources are independent when reported by different actors.
// A source with no reporter is NOT independent with anyone
// (cannot contribute to corroboration).
pred independent[s1, s2: Source] {
  some s1.reporter and some s2.reporter and s1.reporter != s2.reporter
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

sig GateBDecision {
  candidate: one Candidate,
  actor: one Actor,
  outcome: one GateBStatus
}

fact SubstantiveHumanDecisionsRequireHumanActor {
  all d: HumanDecision |
    d.outcome != HR_PENDING implies d.actor.actorKind = AK_HUMAN
}

fact CurrentHumanStatusHasAuditRecord {
  all c: Candidate |
    c.human != HR_PENDING implies
      some d: HumanDecision |
        d.candidate = c and d.outcome = c.human
}

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
// Assertions (identical to baseline)
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

assert Naive_DistinctSourcesAreIndependent {
  all disj s1, s2: Source | independent[s1, s2]
}

assert Naive_AcceptedImpliesGateBMutation {
  all c: Candidate |
    c.human = HR_ACCEPTED implies c.gateB = GB_MUTATION_APPROVED
}

assert Naive_AcceptedImpliesCorroborated {
  all c: Candidate |
    c.human = HR_ACCEPTED implies c.epistemic = ES_CORROBORATED
}

assert Naive_EnginePassedImpliesAccepted {
  all c: Candidate |
    c.processing = PS_ENGINE_PASSED implies c.human = HR_ACCEPTED
}

assert Naive_VerificationContestedImpliesHumanContested {
  all c: Candidate |
    c.verification = VS_CONTESTED implies c.human = HR_CONTESTED
}

// ---------------------------------------------------------------------------
// Witness scenarios (identical to baseline)
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

pred can001Shape {
  some c: Candidate, hd: HumanDecision, gd: GateBDecision |
    c.human = HR_ACCEPTED and
    c.gateB = GB_NO_CHANGE and
    c.processing = PS_CANDIDATE and
    hd.candidate = c and hd.outcome = HR_ACCEPTED and
    gd.candidate = c and gd.outcome = GB_NO_CHANGE
}

// Scope 6 commands
check AutomationCannotAccept for 8
check CorroboratedCannotBeSyntheticOnly for 8
check VerifiedCannotUseOnlyUntraceableEvidence for 8
check RevisedHasHistory for 8
check Naive_DistinctSourcesAreIndependent for 8
check Naive_AcceptedImpliesGateBMutation for 8
check Naive_AcceptedImpliesCorroborated for 8
check Naive_EnginePassedImpliesAccepted for 8
check Naive_VerificationContestedImpliesHumanContested for 8

run acceptedWithGateBNoChange for 8
run gateAAcceptedBeforeGateBDecision for 8
run sharedOriginDifferentSources for 8
run acceptedButNotCorroborated for 8
run witnessSubstantiveHumanDecision for 8
run witnessCorroboratedCandidate for 8
run witnessVerifiedCandidate for 8
run witnessRevisedInterpretation for 8
run can001Shape for 8

// Scope 8 commands
check AutomationCannotAccept for 8
check CorroboratedCannotBeSyntheticOnly for 8
check VerifiedCannotUseOnlyUntraceableEvidence for 8
check RevisedHasHistory for 8
check Naive_DistinctSourcesAreIndependent for 8
check Naive_AcceptedImpliesGateBMutation for 8
check Naive_AcceptedImpliesCorroborated for 8
check Naive_EnginePassedImpliesAccepted for 8
check Naive_VerificationContestedImpliesHumanContested for 8

run acceptedWithGateBNoChange for 8
run gateAAcceptedBeforeGateBDecision for 8
run sharedOriginDifferentSources for 8
run acceptedButNotCorroborated for 8
run witnessSubstantiveHumanDecision for 8
run witnessCorroboratedCandidate for 8
run witnessVerifiedCandidate for 8
run witnessRevisedInterpretation for 8
run can001Shape for 8

// Scope 10 commands
check AutomationCannotAccept for 8
check CorroboratedCannotBeSyntheticOnly for 8
check VerifiedCannotUseOnlyUntraceableEvidence for 8
check RevisedHasHistory for 8
check Naive_DistinctSourcesAreIndependent for 8
check Naive_AcceptedImpliesGateBMutation for 8
check Naive_AcceptedImpliesCorroborated for 8
check Naive_EnginePassedImpliesAccepted for 8
check Naive_VerificationContestedImpliesHumanContested for 8

run acceptedWithGateBNoChange for 8
run gateAAcceptedBeforeGateBDecision for 8
run sharedOriginDifferentSources for 8
run acceptedButNotCorroborated for 8
run witnessSubstantiveHumanDecision for 8
run witnessCorroboratedCandidate for 8
run witnessVerifiedCandidate for 8
run witnessRevisedInterpretation for 8
run can001Shape for 8