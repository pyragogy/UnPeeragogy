# FUP-001 Semantic Reconstruction Report v0.1

**Gate:** A — semantic reconstruction  
**Date:** 2026-10-03  
**Status:** provisional, repository-grounded

## 1. Scope examined

This reconstruction uses the current protocol and machine-readable architecture rather than a retrospective paraphrase. Primary sources inside the repository:

- `src/pages/protocol.astro`
- `docs/RESEARCH_DATA_MODEL.md`
- `docs/HUMAN_REVIEW_GUIDE.md`
- `src/data/evidence-taxonomy.ts`
- `src/data/candidate-schemas.ts`
- `runs/human-review-ledger.yaml`
- `scripts/validate-epistemic-integrity.mjs`

## 2. Central semantic finding

The current system is a **multi-dimensional epistemic workflow**, not a single lifecycle.

A candidate may simultaneously have values on multiple independent axes:

| Dimension | Current vocabulary | Function |
|---|---|---|
| Acquisition | practitioner / documentary / ai-research | where a candidate enters |
| Processing | RAW / CANDIDATE / ENGINE_PASSED / ENGINE_DEGRADED / ENGINE_REJECTED | what automation has done |
| Human review | PENDING / ACCEPTED / REJECTED / REVISE / NEEDS_EVIDENCE / CONTESTED | explicit Gate A decision |
| Epistemic lifecycle | observed / reported / interpreted / hypothesized / corroborated / contested / revised | lifecycle of a knowledge claim/interpretation |
| Verification | unverified / source-linked / partially-supported / corroborated / contested | support checking |
| Integrity | legacy / structured / verified / contested | record migration/research-grade level |
| Publication | Gate B decision, currently represented procedurally rather than as a canonical type | whether validated material mutates the public vault |

The same lexical word, notably **corroborated** and **contested**, can therefore occur on different axes and cannot be merged without changing the meaning of the protocol.

## 3. Entity inventory

### CandidateEvidence

An acquisition-stage object. It has source, provenance, content, target nodes, grounding, automated engine output and human-review state.

### Source / ProvenanceRecord

A source is not evidence merely because a URI exists. The protocol requires a claim-to-source relationship and, for stronger integrity levels, traceable provenance and locators.

### Observation / Incident

Empirical or reported material. An Incident is a structured Critical Incident account; an Observation is a less interpreted report of what happened.

### Interpretation

A project-level inference derived from evidence. It is explicitly provisional.

### Hypothesis

A tentative explanatory claim intended to remain challengeable.

### Counter-evidence

Material that challenges, qualifies, complicates or contradicts an interpretation.

### Revised interpretation

A successor interpretation whose predecessor must remain recoverable.

### Human decision

Gate A epistemic validation. The automation may prepare candidates but may not assign substantive human outcomes.

### Publication decision

Gate B. Separate from Gate A. Acceptance at Gate A does not itself constitute authority to mutate the vault.

## 4. Relations recovered

The repository already implies a graph:

- source **supports / complicates / contradicts / contextualizes** claim;
- interpretation **derived_from** source/incident;
- hypothesis **depends_on** interpretation/evidence;
- interpretation **challenged_by** counter-evidence;
- interpretation **revised_into** successor;
- candidate **targets** one or more vault nodes;
- provenance record **locates** the material used for a claim;
- human decision **acts_on** candidate;
- publication decision **may_follow** a human decision but is not identical to it.

## 5. Transitions

### Acquisition / engine

`RAW → CANDIDATE → ENGINE_*`

The three terminal-looking engine values are processing outcomes, not epistemic truth states.

### Human review

A candidate begins at `PENDING`. The protocol permits:

- `PENDING → ACCEPTED`
- `PENDING → REJECTED`
- `PENDING → REVISE`
- `PENDING → NEEDS_EVIDENCE`
- `PENDING → CONTESTED`

Re-review transitions after `REVISE` or `NEEDS_EVIDENCE` are implied operationally but not yet normatively specified.

### Epistemic lifecycle

The prose presents:

`observed → reported → interpreted → hypothesized → corroborated → contested → revised`

This must **not** be treated as a mandatory total order. Counter-evidence can arise before corroboration; revised interpretations may themselves become hypothesized or contested; some source/documentary objects do not naturally pass through every state.

Therefore the arrow chain is best treated initially as an illustrative partial lifecycle, not a proven transition relation.

### Gate A / Gate B

`Gate A ACCEPTED ↛ automatic Gate B mutation`.

This is a core separation invariant. Gate B is an independent editorial act.

## 6. Candidate invariants grounded strongly enough to model now

### I-01 Human authority

Automation may create `PENDING`, but any substantive Gate A decision must be attributable to a human reviewer.

### I-02 Dimensional separation

Human review status, processing status, epistemic status and verification status are not aliases and cannot be inferred from one another without an explicit rule.

### I-03 Gate separation

Gate A acceptance is insufficient, by itself, to imply Gate B publication.

### I-04 Synthetic exclusion

A synthetic/composite scenario must not increment empirical evidence or corroboration counts.

### I-05 Revision trace

A revised interpretation must preserve an auditable predecessor relation.

### I-06 Provenance strengthening

Research-grade records above `legacy` require explicit provenance; `verified` carries a stronger expectation of claim-level traceability.

### I-07 No URL-count independence

Multiplicity of source URLs is insufficient to establish evidential independence.

## 7. Properties requiring semantic refinement before becoming hard facts

### P-01 Corroboration cardinality

The protocol says “multiple independent incidents” but does not define a numeric minimum. Ordinary semantics suggests at least two; encoding two is defensible for exploration but remains a modelling assumption.

### P-02 Independence relation

The current text alternates among “independent incidents”, “independent sources”, documentary corroboration and first-person accounts. Independence may refer to:

- distinct events;
- distinct observers;
- distinct primary evidential origins;
- distinct institutions/repositories;
- causal/source-lineage independence.

These are not equivalent.

### P-03 ACCEPTED preconditions

The Human Review Guide says ACCEPTED requires adequate provenance and corroboration, while the meaning of Gate A is “sufficiently documented to enter the epistemic process”. It is unclear whether corroboration is mandatory for every accepted first-person incident or merely desirable/conditional.

### P-04 Human override

The review guide states that the decision tree is orientative and human judgment can override it. The formal system must distinguish:

- a human decision that the model permits;
- a human override that violates a recommended rule but is explicitly recorded;
- a transition that should be considered structurally invalid even if a human requested it.

Without this distinction, “human override” can make all invariants vacuous.

### P-05 Contested synchronization

Human `CONTESTED`, epistemic `contested`, verification `contested` and integrity `contested` are distinct constructs. The repository does not yet specify when one must imply another.

## 8. Minimal formal kernel

The first executable model should include only:

- actors (human / automation);
- candidates;
- evidence items;
- source lineage;
- human decisions;
- epistemic and verification classifications;
- integrity level;
- publication state;
- interpretation revision links.

Do not model `tension_index` in v0.1. Its semantics are descriptive, method-dependent and not necessary to test the first governance invariants.

## 9. Formalism decision

### Alloy 6 — selected for v0.1

Best fit for the first phase because the hard problem is relational:

- source lineage;
- provenance graphs;
- cross-axis constraints;
- forbidden combinations;
- bounded counterexample generation;
- minimal structures showing why an invariant fails.

### TLA+ — deferred

Likely valuable once the research question shifts from admissible configurations to liveness and temporal behaviour: indefinite PENDING, oscillation, re-review cycles, withdrawal after acceptance, eventual handling of counter-evidence.

Using it now would force temporal detail before the static semantics are stable.

### Event-B / proof assistants — deferred

Potentially useful for refinement/proof once the protocol is stable. Premature for discovery because many obligations are currently semantic ambiguities rather than theorems waiting to be proved.

## 10. Gate A result

The protocol is sufficiently structured to support a minimal executable relational model, but not sufficiently precise to encode all prose statements as hard invariants.

The formalisation should therefore distinguish three layers:

1. **repository facts** — directly supported by normative/project code;
2. **formalisation assumptions** — explicit choices needed to execute the model;
3. **hypotheses under test** — candidate rules that the model should try to break.

## Recommendation

**PROCEED TO FORMAL MODEL**
