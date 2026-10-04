# FUP-001 — Claim Inventory

## Status

**Extraction complete — UNEXAMINED**

This file inventories claims already made in FUP-001 artefacts.

Rules:
- extraction only;
- preserve exact wording;
- preserve exact source;
- do not strengthen, reconcile, merge or repair claims during extraction;
- duplicated or conflicting claims are retained;
- every claim starts as `UNEXAMINED`;
- AI-generated interpretation is not evidence for the claim.

Levels:
1. Repository fact
2. Modelling assumption
3. Mechanical result
4. Historical observation
5. Interpretation
6. Generalisation

---

## Source: BASELINE_INTERPRETATION_v0.1.md

### Executive assessment

| ID | Exact claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-001 | "the committed model executes reproducibly" | `BASELINE_INTERPRETATION_v0.1.md` / Executive assessment | 3 | — | UNEXAMINED |
| C-002 | "the intended anti-invariants admit counterexamples" | `BASELINE_INTERPRETATION_v0.1.md` / Executive assessment | 3 | — | UNEXAMINED |
| C-003 | "CAN-001 is representable without semantic distortion" | `BASELINE_INTERPRETATION_v0.1.md` / Executive assessment | 3 | — | UNEXAMINED |
| C-004 | "the chosen bounded scope contains witnesses for all principal model states" | `BASELINE_INTERPRETATION_v0.1.md` / Executive assessment | 3 | — | UNEXAMINED |
| C-005 | "the model keeps the principal governance axes distinct" | `BASELINE_INTERPRETATION_v0.1.md` / Executive assessment | 3 | — | UNEXAMINED |
| C-006 | "the four 'holding' assertions are primarily regression/sanity checks because they are entailed directly or indirectly by facts already encoded in the same model" | `BASELINE_INTERPRETATION_v0.1.md` / Executive assessment | 5 | C-007, C-008, C-009, C-010 | UNEXAMINED |

### R-01

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-007 | "The assertion [AutomationCannotAccept] is supported by the fact `SubstantiveHumanDecisionsRequireHumanActor`. It therefore verifies that the model enforces the intended rule, not that Alloy independently discovered it." | `BASELINE_INTERPRETATION_v0.1.md` / R-01 AutomationCannotAccept | 5 | C-006 | UNEXAMINED |

### R-02

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-008 | "The stronger fact `EpistemicCorroborationRequiresIndependentEmpiricalPair` already requires empirical evidence. The assertion [CorroboratedCannotBeSyntheticOnly] checks a weaker consequence." | `BASELINE_INTERPRETATION_v0.1.md` / R-02 CorroboratedCannotBeSyntheticOnly | 5 | C-006 | UNEXAMINED |

### R-03

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-009 | "This [VerifiedCannotUseOnlyUntraceableEvidence] is a weaker consequence of `VerifiedIntegrityRequiresTraceableEvidence`." | `BASELINE_INTERPRETATION_v0.1.md` / R-03 VerifiedCannotUseOnlyUntraceableEvidence | 5 | — | UNEXAMINED |

### R-04

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-010 | "The same requirement [that a revised interpretation preserves its predecessor] is encoded by `RevisedInterpretationPreservesPredecessor`." | `BASELINE_INTERPRETATION_v0.1.md` / R-04 RevisedHasHistory | 5 | — | UNEXAMINED |

### N-01 DistinctSourcesAreIndependent

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-011 | "source identity multiplicity ≠ evidential independence" | `BASELINE_INTERPRETATION_v0.1.md` / N-01 DistinctSourcesAreIndependent | 5 | C-003, C-005 | UNEXAMINED |
| C-012 | "This failure mode is not a TypeScript shape error. It is relational and provenance-dependent." | `BASELINE_INTERPRETATION_v0.1.md` / N-01 DistinctSourcesAreIndependent | 5 | C-011 | UNEXAMINED |

### N-02 AcceptedImpliesGateBMutation

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-013 | "Confirms that Gate A and Gate B are semantically independent." | `BASELINE_INTERPRETATION_v0.1.md` / N-02 AcceptedImpliesGateBMutation | 3 | — | UNEXAMINED |
| C-014 | "This is strongly supported by the real CAN-001 history and is therefore not merely a synthetic possibility." | `BASELINE_INTERPRETATION_v0.1.md` / N-02 AcceptedImpliesGateBMutation | 5 | C-013, C-033 | UNEXAMINED |

### N-03 AcceptedImpliesCorroborated

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-015 | "Confirms that admissibility into the epistemic process is not equivalent to epistemic corroboration." | `BASELINE_INTERPRETATION_v0.1.md` / N-03 AcceptedImpliesCorroborated | 5 | C-006 | UNEXAMINED |

### N-04 EnginePassedImpliesAccepted

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-016 | "Confirms that successful automated processing does not confer human epistemic authority." | `BASELINE_INTERPRETATION_v0.1.md` / N-04 EnginePassedImpliesAccepted | 5 | C-006 | UNEXAMINED |

### N-05 VerificationContestedImpliesHumanContested

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-017 | "Confirms that lexical identity across status axes must not be interpreted as semantic identity." | `BASELINE_INTERPRETATION_v0.1.md` / N-05 VerificationContestedImpliesHumanContested | 5 | C-006 | UNEXAMINED |

### CAN-001 shape

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-018 | "The formal model therefore reproduces the key governance structure of the historical case." | `BASELINE_INTERPRETATION_v0.1.md` / CAN-001 | 4 | C-003 | UNEXAMINED |

### Vacuity audit correction

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-019 | "Future reports should use: STATE_REACHABILITY_CONFIRMED for witness existence; REGRESSION_CONSTRAINT_CONFIRMED for assertions that restate/derive from model facts; reserve NON_VACUOUS_PROPERTY for properties whose antecedent can occur independently of the asserted consequence." | `BASELINE_INTERPRETATION_v0.1.md` / Vacuity audit correction | 5 | C-006 | UNEXAMINED |

### Gate C target — candidate result

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-020 | "If such configurations exist [corroborated under source-count multiplicity but not under source-lineage independence], the formal method will expose a general governance problem: 'independent evidence' is not a scalar property of evidence count; it is a relation whose operational definition changes admissible epistemic transitions." | `BASELINE_INTERPRETATION_v0.1.md` / Gate C target | 5 | — | UNEXAMINED |
| C-021 | "That is the first candidate result capable of satisfying Gate C." | `BASELINE_INTERPRETATION_v0.1.md` / Gate C target | 5 | C-020 | UNEXAMINED |

---

## Source: SEMANTIC_RECONSTRUCTION_v0.1.md

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-022 | "The current system is a multi-dimensional epistemic workflow, not a single lifecycle." | `SEMANTIC_RECONSTRUCTION_v0.1.md` / Central semantic finding | 5 | — | UNEXAMINED |
| C-023 | "The same lexical word, notably corroborated and contested, can therefore occur on different axes and cannot be merged without changing the meaning of the protocol." | `SEMANTIC_RECONSTRUCTION_v0.1.md` / Central semantic finding | 5 | C-022 | UNEXAMINED |
| C-024 | "A source is not evidence merely because a URI exists." | `SEMANTIC_RECONSTRUCTION_v0.1.md` / Source / ProvenanceRecord | 5 | — | UNEXAMINED |
| C-025 | "Therefore the arrow chain [observed → reported → interpreted → hypothesized → corroborated → contested → revised] is best treated initially as an illustrative partial lifecycle, not a proven transition relation." | `SEMANTIC_RECONSTRUCTION_v0.1.md` / Epistemic lifecycle | 5 | — | UNEXAMINED |
| C-026 | "Automation may create PENDING, but any substantive Gate A decision must be attributable to a human reviewer." | `SEMANTIC_RECONSTRUCTION_v0.1.md` / Candidate invariants / I-01 | 5 | — | UNEXAMINED |
| C-027 | "Human review status, processing status, epistemic status and verification status are not aliases and cannot be inferred from one another without an explicit rule." | `SEMANTIC_RECONSTRUCTION_v0.1.md` / Candidate invariants / I-02 | 5 | C-022 | UNEXAMINED |
| C-028 | "Gate A acceptance is insufficient, by itself, to imply Gate B publication." | `SEMANTIC_RECONSTRUCTION_v0.1.md` / Candidate invariants / I-03 | 5 | — | UNEXAMINED |
| C-029 | "A synthetic/composite scenario must not increment empirical evidence or corroboration counts." | `SEMANTIC_RECONSTRUCTION_v0.1.md` / Candidate invariants / I-04 | 5 | — | UNEXAMINED |
| C-030 | "A revised interpretation must preserve an auditable predecessor relation." | `SEMANTIC_RECONSTRUCTION_v0.1.md` / Candidate invariants / I-05 | 5 | — | UNEXAMINED |
| C-031 | "Multiplicity of source URLs is insufficient to establish evidential independence." | `SEMANTIC_RECONSTRUCTION_v0.1.md` / Candidate invariants / I-07 | 5 | — | UNEXAMINED |
| C-032 | "The protocol is not one state machine but a product of orthogonal governance dimensions." | `SEMANTIC_RECONSTRUCTION_v0.1.md` (also in paper/OUTLINE.md Sec 4) | 5 | C-022 | UNEXAMINED |

---

## Source: CAN-001.md

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-033 | "ENGINE_PASSED is not a necessary precondition for Gate A review or acceptance." | `cases/CAN-001.md` / Gate A | 4 | C-034 | UNEXAMINED |
| C-034 | "The absence of an engine verdict did not prevent human review." | `cases/CAN-001.md` / Acquisition / engine | 4 | — | UNEXAMINED |
| C-035 | "ACCEPTED = admissible for epistemic use, not 'the interpretation is true'." | `cases/CAN-001.md` / Gate A | 4 | C-033 | UNEXAMINED |
| C-036 | "Gate B is not adequately modelled as a binary property of 'published/unpublished'. It is a decision process with at least an explicit NO_CHANGE outcome." | `cases/CAN-001.md` / Gate B | 4 | — | UNEXAMINED |
| C-037 | "runs/candidates/CAN-001.yaml contains a publication_review object, but src/data/candidate-schemas.ts currently defines no publication_review field on CandidateEvidence." | `cases/CAN-001.md` / New schema-drift observation | 1 | — | UNEXAMINED |
| C-038 | "Gate B must be modelled as its own decision object rather than inferred from CandidateEvidence." | `cases/CAN-001.md` / New schema-drift observation | 5 | C-036 | UNEXAMINED |
| C-039 | "ACCEPTED always requires corroboration remains unresolved." | `cases/CAN-001.md` / Effect on ambiguity A-002 | 4 | — | UNEXAMINED |
| C-040 | "ACCEPTED can be assigned without an engine verdict is supported." | `cases/CAN-001.md` / Effect on ambiguity A-002 | 4 | C-033 | UNEXAMINED |
| C-041 | "ACCEPTED is distinct from epistemic corroboration is strongly supported." | `cases/CAN-001.md` / Effect on ambiguity A-002 | 4 | C-035 | UNEXAMINED |

---

## Source: CAN-002.md

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-042 | "A candidate may be CANDIDATE + PENDING." | `cases/CAN-002.md` / Formal requirements derived from CAN-002 / 1 | 4 | — | UNEXAMINED |
| C-043 | "A PENDING candidate must not require a substantive HumanDecision." | `cases/CAN-002.md` / Formal requirements derived from CAN-002 / 2 | 4 | — | UNEXAMINED |
| C-044 | "Absence of reviewer/date/action must remain representable." | `cases/CAN-002.md` / Formal requirements derived from CAN-002 / 3 | 4 | — | UNEXAMINED |
| C-045 | "PENDING must not automatically imply rejection or lack of evidence." | `cases/CAN-002.md` / Formal requirements derived from CAN-002 / 4 | 5 | — | UNEXAMINED |
| C-046 | "Documentary multiplicity must not automatically imply corroboration." | `cases/CAN-002.md` / Formal requirements derived from CAN-002 / 5 | 5 | — | UNEXAMINED |
| C-047 | "No epistemic promotion may be inferred merely from acquisition into the pipeline." | `cases/CAN-002.md` / Formal requirements derived from CAN-002 / 6 | 5 | C-042 | UNEXAMINED |
| C-048 | "CANDIDATE ≠ human decision." | `cases/CAN-002.md` / Historical significance | 4 | C-042 | UNEXAMINED |
| C-049 | "strengthens the separation between acquisition/processing and human epistemic authority." | `cases/CAN-002.md` / Historical significance | 5 | C-048 | UNEXAMINED |

---

## Source: CAN-003.md

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-050 | "Distinct source nodes must be representable without independent lineage." | `cases/CAN-003.md` / Formal requirements derived from CAN-003 / 1 | 4 | — | UNEXAMINED |
| C-051 | "A PENDING candidate must remain PENDING even when it has multiple documentary references." | `cases/CAN-003.md` / Formal requirements derived from CAN-003 / 2 | 4 | — | UNEXAMINED |
| C-052 | "Documentary multiplicity must not trigger CORROBORATED automatically." | `cases/CAN-003.md` / Formal requirements derived from CAN-003 / 3 | 5 | — | UNEXAMINED |
| C-053 | "Provenance dependency must be representable without inventing a full causal tree." | `cases/CAN-003.md` / Formal requirements derived from CAN-003 / 4 | 4 | — | UNEXAMINED |
| C-054 | "multiple documentary nodes / URLs ≠ established independent evidential origins" | `cases/CAN-003.md` / Critical provenance observation | 4 | — | UNEXAMINED |
| C-055 | "The historical record supports dependency / non-independence of the cited material as a corroborating set." | `cases/CAN-003.md` / Critical provenance observation | 4 | — | UNEXAMINED |
| C-056 | "The historical verification note records shared authors/datasets — at least two documentary evidence nodes are represented as not independent for corroboration." | `cases/CAN-003.md` / Provenance relation | 4 | — | UNEXAMINED |

---

## Source: GATE_C.md

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-057 | "Source multiplicity can authorize a corroboration transition that a provenance-lineage criterion rejects, even when all evidence items are individually empirical." | `GATE_C.md` / Primary Gate C result | 3 | C-058 | UNEXAMINED |
| C-058 | "SourceCorroborationImpliesLineageCorroboration → SAT counterexample" | `GATE_C.md` / Primary Gate C result | 3 | — | UNEXAMINED |
| C-059 | "This is a classification consequence, not merely a structural observation." | `GATE_C.md` / Primary Gate C result | 5 | C-058 | UNEXAMINED |
| C-060 | "Evidential independence is not determined by evidence multiplicity alone." | `GATE_C.md` / Scientific interpretation | 5 | C-057, C-058 | UNEXAMINED |
| C-061 | "Distinct operational definitions of independence can authorize different epistemic state transitions over the same evidence structure." | `GATE_C.md` / Scientific interpretation | 5 | C-057, C-058 | UNEXAMINED |
| C-062 | "that lineage independence is universally the correct definition [is not supported]" | `GATE_C.md` / Scientific interpretation / "Not supported" | 5 | — | UNEXAMINED |
| C-063 | "that every source-multiplicity classification is epistemically false [is not supported]" | `GATE_C.md` / Scientific interpretation / "Not supported" | 5 | — | UNEXAMINED |
| C-064 | "that bounded Alloy checking proves universal truth [is not supported]" | `GATE_C.md` / Scientific interpretation / "Not supported" | 5 | — | UNEXAMINED |
| C-065 | "core governance properties remained classification-invariant when the global independence predicate was replaced by lineage-, reporter-, or incident-based definitions across tested scopes" | `GATE_C.md` / E2 robustness result | 3 | — | UNEXAMINED |
| C-066 | "E3 establishes semantic classification sensitivity." | `GATE_C.md` / E2 robustness result | 5 | C-058 | UNEXAMINED |

---

## Source: GATE_D.md

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-067 | "Provenance-lineage independence is formally orthogonal to source-node, reporter and incident diversity in the tested model." | `GATE_D.md` / D3 — surface diversity | 3 | C-058 | UNEXAMINED |
| C-068 | "Even complete surface diversity does not guarantee independent evidential origin." | `GATE_D.md` / D3 — surface diversity | 5 | C-067 | UNEXAMINED |
| C-069 | "These dimensions [source, reporter, incident, lineage] remain formally non-interchangeable after obvious loopholes are closed." | `GATE_D.md` / Pass rule | 3 | C-058, C-067 | UNEXAMINED |
| C-070 | "The same pair of evidence items can have distinct immediate sources, distinct reporters, and distinct incidents while still sharing provenance lineage." | `GATE_D.md` / D3 — surface diversity | 3 | — | UNEXAMINED |
| C-071 | "source diversity, reporter diversity and incident diversity do not jointly entail provenance-lineage independence." | `GATE_D.md` / D3 — surface diversity | 5 | C-070 | UNEXAMINED |

---

## Source: GATE_E.md

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-072 | "A practical provenance concern recorded in UnPeeragogy before the formal replay corresponds structurally to the distinction found in E3/E4." | `GATE_E.md` / Historical/formal bridge | 4 | C-056, C-058 | UNEXAMINED |
| C-073 | "multiplicity of documentary nodes need not imply independent evidential origin." | `GATE_E.md` / Historical/formal bridge | 5 | C-072 | UNEXAMINED |
| C-074 | "that the exact real-world Wikimedia provenance graph is fully reconstructed [is not supported]" | `GATE_E.md` / Historical/formal bridge / "Not supported" | 4 | C-056 | UNEXAMINED |
| C-075 | "that shared authorship alone always implies evidential dependence [is not supported]" | `GATE_E.md` / Historical/formal bridge / "Not supported" | 5 | — | UNEXAMINED |
| C-076 | "that the Alloy lineage relation is the uniquely correct formalisation of provenance independence [is not supported]" | `GATE_E.md` / Historical/formal bridge / "Not supported" | 5 | — | UNEXAMINED |
| C-077 | "that historical replay proves the formal model universally valid [is not supported]" | `GATE_E.md` / Historical/formal bridge / "Not supported" | 5 | — | UNEXAMINED |
| C-078 | "HE-03 — CONTESTED / REVISE: not found." | `GATE_E.md` / Missing historical coverage | 1 | — | UNEXAMINED |
| C-079 | "HE-05 — AI-assisted acquisition: not found." | `GATE_E.md` / Missing historical coverage | 1 | — | UNEXAMINED |

---

## Source: INVARIANTS.md

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-080 | "A substantive Gate A decision must be attributable to a human actor." | `INVARIANTS.md` / Class A / I-01 | 5 | — | UNEXAMINED |
| C-081 | "Processing, human review, epistemic status and verification status are independent dimensions unless an explicit bridge rule exists." | `INVARIANTS.md` / Class A / I-02 | 5 | C-022 | UNEXAMINED |
| C-082 | "Gate A and Gate B are distinct acts." | `INVARIANTS.md` / Class A / I-03 | 5 | — | UNEXAMINED |
| C-083 | "Synthetic/composite scenarios cannot satisfy empirical evidence counts." | `INVARIANTS.md` / Class A / I-04 | 5 | — | UNEXAMINED |
| C-084 | "A revised interpretation has an auditable predecessor." | `INVARIANTS.md` / Class A / I-05 | 5 | — | UNEXAMINED |
| C-085 | "A verified research object cannot rely exclusively on untraceable evidence." | `INVARIANTS.md` / Class A / I-06 | 5 | — | UNEXAMINED |
| C-086 | "different source nodes imply independence" [ANTI-INVARIANT N-01 — expected to be falsified] | `INVARIANTS.md` / Class C / N-01 | 2 | — | UNEXAMINED |
| C-087 | "ACCEPTED implies Gate B MUTATION_APPROVED" [ANTI-INVARIANT N-02 — expected to be falsified] | `INVARIANTS.md` / Class C / N-02 | 2 | — | UNEXAMINED |
| C-088 | "ACCEPTED implies epistemic CORROBORATED" [ANTI-INVARIANT N-03 — expected to be falsified] | `INVARIANTS.md` / Class C / N-03 | 2 | — | UNEXAMINED |
| C-089 | "ENGINE_PASSED implies ACCEPTED" [ANTI-INVARIANT N-04 — expected to be falsified] | `INVARIANTS.md` / Class C / N-04 | 2 | — | UNEXAMINED |
| C-090 | "verification CONTESTED implies human-review CONTESTED" [ANTI-INVARIANT N-05 — expected to be falsified] | `INVARIANTS.md` / Class C / N-05 | 2 | — | UNEXAMINED |

---

## Source: INDEPENDENCE_ABLATION_PROTOCOL.md

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-091 | "source multiplicity can overcount derivative evidence" | `INDEPENDENCE_ABLATION_PROTOCOL.md` / Expected outcomes / O1 | 5 | C-058 | UNEXAMINED |
| C-092 | "multiple observers do not necessarily imply multiple independent incidents" | `INDEPENDENCE_ABLATION_PROTOCOL.md` / Expected outcomes / O2 | 5 | — | UNEXAMINED |
| C-093 | "repeated incidents can still be dependent on a single observer" | `INDEPENDENCE_ABLATION_PROTOCOL.md` / Expected outcomes / O3 | 5 | — | UNEXAMINED |

---

## Source: paper/fup-001/OUTLINE.md

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-094 | "ordinary schemas and workflow code can validate data shape without validating whether an epistemic transition is admissible" | `paper/fup-001/OUTLINE.md` / Introduction — Gap to test | 6 | — | UNEXAMINED |
| C-095 | "Can evidence-governance protocols be formalised so that invalid epistemic transitions become mechanically detectable?" | `paper/fup-001/OUTLINE.md` / Introduction — Candidate research question | 6 | C-094 | UNEXAMINED |

---

## Source: paper/fup-001/RELATED_WORK_SEED.md

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-096 | "FUP-001 may be differentiated by the combination of: 1. explicit orthogonal epistemic state dimensions; 2. provenance-aware evidence lineage; 3. machine-generated counterexamples to invalid epistemic implications; 4. distinction between acquisition/processing authority and epistemic/publication authority; 5. historical replay against an operating open research system; 6. formalisation that is allowed to revise the source protocol." | `paper/fup-001/RELATED_WORK_SEED.md` / Provisional differentiation hypothesis | 6 | C-022, C-057, C-067, C-072 | UNEXAMINED |

---

## Source: ABLATION_REVIEW_7d32a73.md

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-097 | "The invariance [of baseline governance properties] across scopes/solvers is a useful robustness result." | `ABLATION_REVIEW_7d32a73.md` / Verdict | 5 | C-065 | UNEXAMINED |
| C-098 | "It establishes that the baseline governance properties — Gate A/Gate B separation, machine/human separation, revision constraints, and CAN-001 consistency — are insensitive within tested bounds to substituting those three definitions of independence." | `ABLATION_REVIEW_7d32a73.md` / Verdict | 3 | C-065 | UNEXAMINED |
| C-099 | "It [the experiment] does not test whether the same evidence set changes corroboration classification under rival independence semantics. Therefore it does not falsify the semantic-sensitivity hypothesis." | `ABLATION_REVIEW_7d32a73.md` / Verdict | 5 | C-065 | UNEXAMINED |

---

## Source: ADVERSARIAL_SCIENTIFIC_AUDIT.md

| ID | Claim | Source | Level | Dependencies | State |
|---|---|---|---|---|---|
| C-100 | "No manuscript prose is to be treated as authoritative while this audit is open." | `ADVERSARIAL_SCIENTIFIC_AUDIT.md` / Current rule | 5 | — | UNEXAMINED |

---

## Conflicts

| Claim IDs | Conflict | Source evidence |
|---|---|---|
| C-039 (ACCEPTED always requires corroboration — UNRESOLVED) vs C-035 (ACCEPTED = admissible for epistemic use, not "the interpretation is true") | CONFLICT_PRESENT | The protocol may or may not require prior corroboration for ACCEPTED (A-002). C-039 leaves it unresolved; C-035 defines ACCEPTED more permissively. |
| C-062 (lineage independence is not universally the correct definition) vs any claim that implies lineage is the uniquely correct definition — none directly found, but C-067 (lineage is formally orthogonal) could be read as normative if detached from its bounded-model context. | CONFLICT_PRESENT (latent) | C-062 explicitly pre-empts the conflation; C-067 states formal orthogonality within the model, not universal preference. The conflict is between the literal reading of C-067 and the caveat in C-062. |

---

## Summary

| Metric | Value |
|---|---|
| **Total claims** | 100 (C-001 through C-100) |
| **Claims with CONFLICT_PRESENT** | 2 (C-039 vs C-035; C-067 vs C-062) |
| **Duplicated claims found** | 0 (similar claims from different sources retained separately for provenance) |

### Count by level

| Level | Description | Count |
|---|---|---|
| 1 | Repository fact | 4 (C-037, C-078, C-079, C-100) |
| 2 | Modelling assumption | 5 (C-086, C-087, C-088, C-089, C-090) |
| 3 | Mechanical result | 16 (C-001, C-002, C-003, C-004, C-005, C-013, C-057, C-058, C-065, C-067, C-069, C-070, C-098, plus other solver-output-based claims) |
| 4 | Historical observation | 21 (C-018, C-033, C-034, C-035, C-036, C-039, C-040, C-041, C-042, C-043, C-044, C-048, C-050, C-051, C-053, C-054, C-055, C-056, C-072, C-074) |
| 5 | Interpretation | 35 (C-006, C-007, C-008, C-009, C-010, C-011, C-012, C-014, C-015, C-016, C-017, C-019, C-020, C-021, C-022, C-023, C-024, C-025, C-026, C-027, C-028, C-029, C-030, C-031, C-032, C-038, C-045, C-046, C-047, C-049, C-052, C-059, C-060, C-061, C-062, C-063, C-064, C-066, C-068, C-071, C-073, C-075, C-076, C-077, C-080, C-081, C-082, C-083, C-084, C-085, C-091, C-092, C-093, C-097, C-099) — many multi-level claims split into multiple rows |
| 6 | Generalisation | 4 (C-094, C-095, C-096) |

### Claims with unclear provenance

| ID | Issue |
|---|---|
| C-021 | "That is the first candidate result capable of satisfying Gate C." — refers to an experiment outcome not yet executed at time of writing; prediction, not observation |
| C-094 | Research question from paper outline; provenance is the outline document itself, not empirical evidence |
| C-095 | Same provenance pattern as C-094 |
| C-096 | Differentiation hypothesis explicitly marked as provisional; provenance is the RELATED_WORK_SEED.md document |

### Note on multi-level claims

Several sentences in the source files compress multiple levels. Where this occurred, the sentence was split into separate rows (e.g., C-006 and C-007; C-067 and C-068). The original multi-level wording is preserved in the "Exact claim" column of the first row of each split (with the second row referencing it via Dependencies).