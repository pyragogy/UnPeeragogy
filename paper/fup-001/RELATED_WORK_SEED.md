# FUP-001 Related-Work Seed Map

**Status:** discovery map, not yet a systematic literature review.

The purpose of this file is to prevent novelty claims from outrunning the literature.

## Cluster A — Alloy / lightweight formal methods

### Daniel Jackson — Alloy / lightweight modelling
Starting point: Daniel Jackson's Alloy work and publications.
Use for:
- relational modelling;
- bounded model finding;
- counterexample-oriented analysis;
- lightweight formal methods framing.

Primary discovery:
- https://people.csail.mit.edu/dnj/publications/
- https://alloytools.org/

### AlloyTools 6.2.0
- https://github.com/AlloyTools/org.alloytools.alloy
- https://alloytools.org/

Use for exact execution semantics, versioning, CLI and reproducibility.

## Cluster B — Provenance

### W3C PROV family
- https://www.w3.org/TR/prov-overview/
- https://www.w3.org/TR/prov-o/

Why relevant:
UnPeeragogy already exposes W3C PROV-compatible provenance. FUP-001 is not replacing PROV; it asks what governance constraints should hold over provenance-bearing epistemic transitions.

Novelty must therefore not be stated as “we model provenance”.

## Cluster C — Workflow formalisation with Alloy

### Formal methods applied to enterprise/workflow modelling
Example discovery:
“Leveraging the power of formal methods in the realm of enterprise modeling—On the example of extending the (meta) model verification possibilities of ADOxx with Alloy.”

Why relevant:
demonstrates that applying Alloy to workflow/meta-model validation is established practice.

Novelty must therefore come from the epistemic-governance semantics, not from translating a workflow into Alloy.

## Cluster D — Human–AI governance

### Governance of Augmented Thought
2026 work on semi-automated BPMN governance for human–AI workflows.

Why relevant:
explicitly discusses traceable reasoning pathways, verification gates and visible human authority.

Risk:
this may overlap strongly with the “human authority + verification gates” motivation.

Required differentiation:
FUP-001 must demonstrate executable counterexample semantics and evidential-state separation, not merely propose a governance architecture.

Discovery:
https://doi.org/10.1145/3811839.3811863

## Cluster E — Epistemic provenance / human–AI collaboration

Recent work exists using terms such as:
- epistemic governance;
- traceable reasoning;
- reasoning provenance;
- human–AI collaboration;
- explicit/tacit separation.

These terms require a systematic search before claiming a new conceptual category.

Candidate discovery items:
- “Governing Reflective Human-AI Collaboration: A Framework for Epistemic Scaffolding and Traceable Reasoning” (2026)
- “The Missing Knowledge Layer in AI: A Framework for Stable Human-AI Reasoning” (2026)

Treat preprints as context, not automatically as strong prior evidence.

## Provisional differentiation hypothesis

FUP-001 may be differentiated by the combination of:

1. explicit orthogonal epistemic state dimensions;
2. provenance-aware evidence lineage;
3. machine-generated counterexamples to invalid epistemic implications;
4. distinction between acquisition/processing authority and epistemic/publication authority;
5. historical replay against an operating open research system;
6. formalisation that is allowed to revise the source protocol.

This is a hypothesis, not a novelty claim.

## Search tasks before manuscript

Systematically search:

- “epistemic workflow” formal methods;
- “evidence governance” formal specification;
- Alloy provenance model;
- formal verification human-in-the-loop workflow;
- formal methods AI governance;
- model checking epistemic provenance;
- argumentation frameworks + provenance;
- defeasible reasoning + workflow state;
- evidence graphs + formal verification;
- socio-technical formal methods human authority.

For each paper capture:

- citation;
- venue;
- peer-review status;
- exact formalism;
- object being formalised;
- whether human authority is represented;
- whether provenance is represented;
- whether counterexamples are generated;
- whether real historical cases are replayed;
- overlap with FUP-001;
- residual novelty after comparison.
