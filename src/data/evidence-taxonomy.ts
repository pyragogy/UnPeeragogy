/**
 * Evidence Taxonomy — UnPeeragogy
 *
 * The taxonomy separates WHAT a research object is, WHERE it entered the
 * corpus, WHERE an interpretation is in its lifecycle, and HOW its supporting
 * material has been verified. These dimensions must not be collapsed.
 *
 * STATUS: v1 / exploratory and intentionally revisable.
 */

export type EvidenceType =
  | "source"                  // What an original source says
  | "observation"             // A practitioner's direct report (raw)
  | "incident"                // Structured Critical Incident report
  | "interpretation"          // Project analysis of evidence (provisional)
  | "hypothesis"              // Candidate explanation
  | "failure_mode"            // A describable way a pattern deteriorates
  | "counter_evidence"        // Evidence that challenges a prior interpretation
  | "revised_interpretation"  // Interpretation changed after counter-evidence
  | "illustrative_scenario";  // Synthetic/composite narrative; never empirical evidence

/**
 * Where material entered the corpus.
 * Documentary and practitioner evidence remain analytically distinct before
 * any triangulation is attempted.
 */
export type ResearchChannel =
  | "documentary"
  | "field-report"
  | "first-person"
  | "repository"
  | "public-record"
  | "synthetic";

/**
 * Evidence Status — where a claim/interpretation is in its lifecycle.
 *
 * Not a confidence score.
 */
export type EvidenceStatus =
  | "observed"
  | "reported"
  | "interpreted"
  | "hypothesized"
  | "corroborated"
  | "contested"
  | "revised";

/**
 * Verification Status — how the supporting material has been checked.
 * Independent of EvidenceStatus.
 */
export type VerificationStatus =
  | "unverified"
  | "source-linked"
  | "partially-supported"
  | "corroborated"
  | "contested";

/**
 * Integrity level for corpus migration.
 */
export type IntegrityLevel =
  | "legacy"
  | "structured"
  | "verified"
  | "contested";

/**
 * Claim-to-source relation. A real source may be relevant without actually
 * supporting the stronger claim attached to it.
 */
export type SupportRelation =
  | "supports"
  | "complicates"
  | "contradicts"
  | "context-only";

export interface ProvenanceRecord {
  id?: string;
  kind:
    | "handbook"
    | "field-report"
    | "document"
    | "repository"
    | "discussion"
    | "web-source"
    | "dataset"
    | "synthetic-scenario"
    | "other";
  uri?: string;
  /** Narrow locator: page, section, paragraph, issue, commit, timestamp, etc. */
  locator?: string;
  author?: string;
  date?: string;
  /** Narrow claim for which this record is being cited. */
  claim?: string;
  support?: SupportRelation;
  /** What the source does not establish, or other relevant limitation. */
  note?: string;
}

/**
 * Graph Node Types — for the knowledge graph.
 */
export type GraphNodeType =
  | "pattern"
  | "source"
  | "incident"
  | "observation"
  | "hypothesis"
  | "failure_mode"
  | "counter_evidence"
  | "interpretation"
  | "illustrative_scenario";

/**
 * Graph Edge Types — relationships between nodes.
 */
export type GraphEdgeType =
  | "supports"
  | "contradicts"
  | "complicates"
  | "qualifies"
  | "depends_on"
  | "observed_in"
  | "derived_from"
  | "challenged_by"
  | "revised_into"
  | "contextualizes";

/**
 * Node interface for the knowledge graph.
 */
export interface EvidenceNode {
  id: string;
  type: GraphNodeType;
  label: string;
  slug?: string;
  status: EvidenceStatus;
  verification_status?: VerificationStatus;
  integrity_level?: IntegrityLevel;
  research_channels?: ResearchChannel[];
  tension_index?: number;   // canonical 0..3; descriptive, not statistical
  provenance?: string[];    // IDs of provenance records / parent nodes
  revised_from?: string;
  revised_to?: string;
  tags?: string[];
  section?: string;
}

/**
 * Edge interface for the knowledge graph.
 */
export interface EvidenceEdge {
  source: string;
  target: string;
  type: GraphEdgeType;
  weight?: number;          // descriptive unless a method explicitly defines otherwise
  label?: string;
  provenance?: string[];
}

/**
 * Interpretation chain — reconstructable path from source to current understanding.
 *
 * source → observation/incident → interpretation → hypothesis
 *        → [counter-evidence → revised interpretation]
 */
export interface InterpretationChain {
  source: string;
  incidents: string[];
  interpretations: {
    id: string;
    status: EvidenceStatus;
    verification_status?: VerificationStatus;
    text: string;
    timestamp: string;
    challenged_by?: string;
    replaced_by?: string;
  }[];
  current: string;
}
