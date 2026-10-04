# FUP-001 — Novelty Audit v0.1

## Status

**PRELIMINARY EXTERNAL AUDIT — 2026-10-04**

Purpose: determine which apparent FUP-001 contributions are already established elsewhere.

This is not yet a systematic review. It is sufficient to invalidate several overly broad novelty hypotheses.

## Finding N1 — source multiplicity is not evidential independence

**NOT NOVEL**

Relevant prior work includes:

### Barakat et al. — Corroboration via Provenance Patterns (TaPP / USENIX, 2017)

https://www.usenix.org/conference/tapp17/workshop-program/presentation/barakat

The work explicitly uses provenance patterns for corroborating claims against reports from other sources.

Consequence for FUP-001:
- do not claim novelty for using provenance to reason about corroboration;
- do not claim novelty for the basic observation that apparent source multiplicity can hide dependence.

### Variety-of-evidence literature

Examples:

- The Independence Condition in the Variety-of-Evidence Thesis, Philosophy of Science (2013)
- Robustness and Independent Evidence, Philosophy of Science (2017)
- The variety of evidence thesis and its independence of degrees of independence, Synthese (2020/2021)

This literature already distinguishes forms and degrees of evidential independence/dependence and analyses their effect on confirmation.

Consequence:
- “independence is not simply evidence count” is established background, not a FUP-001 contribution.

## Finding N2 — multi-agent multiplicity is not evidence multiplicity

**DIRECTLY PRE-EMPTED AS A BROAD CLAIM**

### Marc Bara — Epistemic Sybil Resistance: Multiplying AI Agents Without Multiplying Evidence (arXiv:2609.01873, 2026)

https://arxiv.org/abs/2609.01873

The paper explicitly formalises the problem that many agent reports may descend from one evidence root and evaluates it experimentally with large-scale LLM-agent runs.

Consequence:
- FUP-001 cannot claim novelty for `many agents != many independent confirmations`;
- any multi-agent contribution must be more specific than ancestry-aware corroboration.

## Finding N3 — provenance-aware multi-agent analysis predates FUP-001

### Friedman et al. — Provenance-Based Interpretation of Multi-Agent Information Analysis (2020)

https://arxiv.org/abs/2011.04016

The work tracks agent provenance with PROV-O, evidence links, source/agent sensitivity and counterfactual refutation in multi-agent analysis.

Consequence:
- provenance + multi-agent + evidence sensitivity is not novel as a combination.

## Finding N4 — human authority and explicit verification gates are active current research

Examples include:

### Governance of Augmented Thought (2026)

https://doi.org/10.1145/3811839.3811863

This work models human–AI governance with explicit verification gates, traceable reasoning and visible human authority.

### Governing Agentic AI in Enterprise Workflows (2026)

https://www.mdpi.com/2078-2489/17/9/923

This work separates delegated authority, human authority, provenance, controlled execution and verification.

Consequence:
- “AI processing is distinct from human authority” is important but unlikely to be novel alone.

## Finding N5 — provenance guardrails for persistent agents are current work

### Stored Is Not Supported: Typed Provenance and Assertion Guardrails for Persistent AI Agents (arXiv:2609.02127, 2026)

https://arxiv.org/abs/2609.02127

The paper distinguishes stored/retrieved material from supported assertions and specifies provenance/evidence guardrails.

Consequence:
- FUP-001's distinction between availability/processing and epistemic standing has close contemporary neighbours.

## Candidate residual novelty

The following combination has not yet been established as novel and remains a hypothesis:

1. reconstructing an operating human–AI knowledge protocol into explicitly separate governance axes;
2. treating invalid cross-axis implications as executable formal counterexample targets;
3. allowing historical replay to revise the formalisation itself;
4. preserving the distinction between mechanical solver result, historical fact and interpretation as an auditable research object;
5. conducting the formal audit through an AI research agent under human orchestration with complete trace provenance.

The novelty, if any, may therefore be **methodological/systemic**, not a new theorem about evidence independence.

## Strongest novelty threat

A paper framed around:

> “multiple sources/agents can share one evidential origin”

would currently be weak because that proposition is already directly represented in prior and contemporary work.

A stronger paper would need to answer a narrower question, such as:

> Can a live human–AI knowledge system expose its epistemic governance as an executable specification whose invalid authority/evidence transitions are mechanically testable and historically replayable?

Even this must undergo a systematic review before being called novel.

## Novelty status

| Candidate claim | Status |
|---|---|
| Source count != independence | ESTABLISHED PRIOR ART |
| Independence has multiple dimensions/degrees | ESTABLISHED PRIOR ART |
| Agent count != evidence count | DIRECT 2026 PRIOR ART |
| Provenance matters to multi-agent analysis | ESTABLISHED PRIOR ART |
| Human authority != AI processing | ACTIVE / CROWDED AREA |
| Formal counterexamples across governance axes | NOVELTY UNKNOWN |
| Formalisation + historical replay + protocol revision | NOVELTY UNKNOWN |
| Agentic adversarial audit as research method | NOVELTY UNKNOWN |

## Verdict

**No broad novelty claim is currently justified.**

The project remains scientifically interesting only if the residual methodological contribution survives deeper comparison.
