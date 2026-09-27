/**
 * CandidateEvidence — Common schema for all acquisition channels
 *
 * Three canonical dimensions (MUST NOT be collapsed):
 *   acquisition_channel — where the candidate came from
 *   processing_status   — what the Engine has done with it
 *   human_review        — what the human/gate has decided
 *
 * Plus: provenance, source, content, grounding, engine output.
 *
 * STATUS: v1 — aligned with L0-L4 architecture (2026-09-27)
 * See: runs/human-review-ledger.yaml for decision history.
 */

export type AcquisitionChannel =
  | "practitioner"       // GitHub Discussion, CIT, first-person report
  | "documentary"        // Paper, DOI, repository, historical record, institutional document
  | "ai-research";       // AI-assisted discovery → verified source

export type ProcessingStatus =
  | "RAW"
  | "CANDIDATE"
  | "ENGINE_PASSED"
  | "ENGINE_DEGRADED"
  | "ENGINE_REJECTED";

export type HumanReviewStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "REVISE"
  | "NEEDS_EVIDENCE"
  | "CONTESTED";

export type PhenomenonType =
  | "confirming"
  | "complicating"
  | "contradicting";

export interface SourceInfo {
  type: "github_discussion" | "url" | "doi" | "vault_path" | "parametric" | "manual";
  uri: string;
  retrieved_at: string; // ISO 8601
  title?: string;
}

export interface ProvenanceInfo {
  author: string;
  date: string;       // ISO 8601 or original date
  context?: string;   // free-text contextual note
}

export interface ContentInfo {
  claim: string;
  phenomenon_type: PhenomenonType;
  summary: string;
  entity_name?: string;
  entity_year?: number;
  domain?: string;
  tags: string[];
}

export interface GroundingInfo {
  grounded_in_source: boolean;
  source_ref: string | null;
  entity_anchor: boolean;
  verification_note?: string;
}

export interface EngineOutputInfo {
  plausibility_score: number | null;
  noise_estimate: number | null;
  verdict: ProcessingStatus | null;
  tension_delta_proposed: number | null;
  engine_run_id?: string;
}

export interface HumanReviewInfo {
  status: HumanReviewStatus;
  reviewer: string | null;
  decision_date: string | null; // ISO 8601
  rationale: string | null;
  review_ledger_id: string | null;
  resulting_action: string | null;
}

export interface CandidateEvidence {
  id: string;                    // CAN-XXX
  acquisition_channel: AcquisitionChannel;
  processing_status: ProcessingStatus;
  human_review: HumanReviewInfo;
  source: SourceInfo;
  provenance: ProvenanceInfo;
  content: ContentInfo;
  target_nodes: string[];
  grounding: GroundingInfo;
  engine_output: EngineOutputInfo;
  created_at: string;            // ISO 8601
  updated_at: string;            // ISO 8601
}