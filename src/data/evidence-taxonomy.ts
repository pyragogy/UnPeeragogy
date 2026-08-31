/**
 * Evidence Taxonomy — Unpeeragogy
 *
 * Every claim in the corpus belongs to one of these epistemic types.
 * This taxonomy is the foundation for structuring the knowledge graph,
 * labeling field reports, and tracing provenance.
 *
 * STATUS: initial / exploratory
 * These types may be refined as the corpus grows.
 */

export type EvidenceType =
  | "source"               // What the Peeragogy Handbook says (fixed text)
  | "observation"          // A practitioner's direct experience (raw)
  | "incident"             // A structured CIT report (context + action + outcome + reflection)
  | "interpretation"       // Project's analysis of an incident (provisional)
  | "hypothesis"           // A candidate explanation for observed behaviour
  | "failure_mode"         // A describable way a pattern deteriorates
  | "counter_evidence"     // Evidence that tensions a previous interpretation
  | "revised_interpretation"; // Updated interpretation after counter-evidence

/**
 * Evidence Status — where a claim is in its lifecycle
 *
 * Not a confidence score. A qualitative description of the claim's
 * current epistemic position.
 */
export type EvidenceStatus =
  | "observed"        // Raw incident received, no analysis yet
  | "reported"        // Incident logged in the corpus with context
  | "interpreted"     // Incident has been analysed
  | "hypothesized"    // Tentative explanation proposed
  | "corroborated"    // Multiple independent incidents support the interpretation
  | "contested"       // Counter-evidence raised against current interpretation
  | "revised";        // Interpretation updated; previous version preserved

/**
 * Graph Node Types — for the knowledge graph
 */
export type GraphNodeType =
  | "pattern"             // A Peeragogy pattern
  | "source"              // Handbook text
  | "incident"            // A CIT field report
  | "observation"         // A raw practitioner observation
  | "hypothesis"          // A candidate explanation
  | "failure_mode"        // A describable failure pattern
  | "counter_evidence"    // Evidence that tensions an interpretation
  | "interpretation";     // Project analysis

/**
 * Graph Edge Types — relationships between nodes
 */
export type GraphEdgeType =
  | "supports"            // Node A supports node B
  | "contradicts"         // Node A contradicts node B
  | "complicates"         // Node A complicates node B (not full contradiction)
  | "qualifies"           // Node A narrows the scope of node B
  | "depends_on"          // Node A depends on condition in node B
  | "observed_in"         // Node A was observed in context B
  | "derived_from"        // Node A is derived from node B
  | "challenged_by"       // Node A is challenged by node B
  | "revised_into";       // Node A was revised into node B

/**
 * Node interface for the knowledge graph
 */
export interface EvidenceNode {
  id: string;
  type: GraphNodeType;
  label: string;
  slug?: string;
  status: EvidenceStatus;
  tension_index?: number;   // 0-3, descriptive only
  provenance?: string[];    // IDs of parent nodes (incidents, sources)
  revised_from?: string;    // ID of previous interpretation (if revised)
  revised_to?: string;      // ID of revised interpretation (if superseded)
  tags?: string[];
  section?: string;
}

/**
 * Edge interface for the knowledge graph
 */
export interface EvidenceEdge {
  source: string;         // Node ID
  target: string;         // Node ID
  type: GraphEdgeType;
  weight?: number;        // Optional strength (descriptive, not statistical)
  label?: string;         // Optional human-readable description
  provenance?: string[];  // IDs of incidents/observations supporting this edge
}

/**
 * Interpretation chain — reconstructable path from source to current understanding
 *
 * source → observation → interpretation → [counter-evidence → revision]
 */
export interface InterpretationChain {
  source: string;
  incidents: string[];
  interpretations: {
    id: string;
    status: EvidenceStatus;
    text: string;
    timestamp: string;
    challenged_by?: string;  // counter-evidence id
    replaced_by?: string;    // revised interpretation id
  }[];
  current: string;  // ID of current interpretation
}