# UnPeeragogy Research Data Model

> Status: **v1 / migration in progress**

UnPeeragogy is evolving from a critical reading of Peeragogy into an open research substrate for qualitative and socio-technical inquiry.

The design goal is simple: **a reader, researcher, or machine should be able to tell what a statement is, where it came from, how it was interpreted, what could challenge it, and how it changed over time.**

This document is normative for new research-grade records. Existing corpus entries are being migrated progressively.

## 1. Core principle

UnPeeragogy separates five things that are often collapsed in qualitative knowledge systems:

1. **Source** — what an original document or actor says.
2. **Observation / incident** — what was reported to have happened.
3. **Interpretation** — what the project infers from that material.
4. **Hypothesis** — a testable explanation for the observed relationship.
5. **Revision** — how an interpretation changes after counter-evidence.

A URL is not evidence by itself. A real source only supports a claim when the source actually entails, documents, or materially constrains that claim.

## 2. Research channels

Evidence can enter the corpus through multiple channels. They must remain distinguishable.

| Channel | Typical material | Primary limitation |
|---|---|---|
| `documentary` | policies, governance documents, publications | documents may not describe lived practice |
| `field-report` | practitioner Critical Incident reports | self-selection and recall bias |
| `first-person` | direct testimony from a participant | positionality and retrospective reconstruction |
| `repository` | commits, issues, pull requests, logs | records action better than motivation |
| `public-record` | archived discussions, public decisions | incomplete context |
| `synthetic` | illustrative/composite scenario | **not empirical evidence** |

Documentary audit and practitioner field evidence are separate analytical channels. They may later be triangulated, but one must not silently substitute for the other.

## 3. Entry integrity levels

Every UnPeeragogy entry has an `integrity_level`.

### `legacy`

Historical corpus content that predates the research-grade schema. It remains publishable during migration but should not be treated as fully provenance-enforced.

### `structured`

The entry declares at least:

- `origin`
- `epistemic_status`
- `verification_status`
- `method_version`
- `research_channels`
- `provenance`

### `verified`

A structured entry for which each material empirical claim has a traceable source or incident, with a locator where reasonably possible, and where claim-to-source support has been manually or independently checked.

### `contested`

An entry whose current interpretation is actively challenged by counter-evidence. Contested is not a failure state. It is a visible research state.

## 4. Two independent status axes

Do not collapse these.

### Epistemic status

Describes where an interpretation is in its lifecycle:

`observed → reported → interpreted → hypothesized → corroborated → contested → revised`

This is not a confidence score.

### Verification status

Describes the evidentiary support currently available:

- `unverified`
- `source-linked`
- `partially-supported`
- `corroborated`
- `contested`

A statement can therefore be, for example, `hypothesized` and `source-linked`, or `interpreted` and `contested`.

## 5. Provenance records

Each provenance object may contain:

```yaml
provenance:
  - id: OSM-DWG-001
    kind: document
    uri: https://wiki.osmfoundation.org/wiki/Data_Working_Group
    locator: "Mandate / dispute resolution section"
    claim: "The Data Working Group handles disputes beyond normal community mechanisms."
    support: supports
    author: OpenStreetMap Foundation
    date: "2026-09-14"
    note: "Supports existence of a formal escalation body; does not by itself prove all informal consensus fails."
```

The `locator` should point as closely as practical to the supporting material: section heading, page, paragraph, issue number, commit, timestamp, or discussion fragment.

## 6. Claim-source entailment

The Grounding Gate must answer more than **“does this source exist?”**.

For each material claim it should ask:

1. Is the source authentic and retrievable?
2. Is the claim actually present or reasonably entailed by the source?
3. Is the project adding a causal interpretation that the source does not establish?
4. Is the source being used only as context? If so, mark `support: context-only`.
5. What is the narrowest defensible formulation of the claim?

A source about an organisation's governance model does not automatically prove that the governance model caused a specific social outcome.

## 7. Synthetic and composite scenarios

Narrative examples are allowed. They are useful for explanation and teaching.

They must be marked explicitly:

```yaml
synthetic_scenario: true
research_channels: ["synthetic"]
```

And the rendered page should label them **Illustrative scenario — not empirical evidence**.

Synthetic scenarios must never increment evidence counts, corroboration counts, or tension estimates derived from empirical material.

## 8. Tension index

`tension_index` is a **descriptive research signal**, not a validated psychometric or statistical measure.

Canonical range: **0.0–3.0**.

Every research-grade value should eventually carry:

- method/version used to derive it;
- evidence set it was derived from;
- rationale for changes;
- previous value when revised.

Legacy lexical-density scripts must not be treated as equivalent to audit-derived values merely because they share the same field name.

Future versions should migrate toward a structured representation such as:

```yaml
tension:
  value: 1.48
  scale_max: 3
  method: documentary-audit-v3
  rationale: "Two confirming and three complicating cases; one direct first-person incident."
```

The scalar `tension_index` remains for backward compatibility until the UI and MCP server are migrated.

## 9. Revision and counter-evidence

Research objects should be append-revisable, not silently overwritten.

Git history is the ultimate audit trail. `revised_from` and `revised_to` provide machine-readable links between semantic versions of an interpretation.

Counter-evidence must be retained even when the current interpretation survives it.

## 10. Interoperability direction

The model is intentionally small and transportable. Future work should provide exports aligned where useful with open research standards such as:

- JSON-LD for machine-readable provenance;
- W3C PROV concepts for entity/activity/agent relationships;
- RO-Crate for research-object packaging;
- DataCite metadata for citable releases;
- schema.org / ScholarlyArticle metadata for public discovery.

Adoption of a standard should not erase the project's qualitative distinctions. Interoperability is a mapping layer, not the research method itself.

## 11. Reproducibility vocabulary

Use these terms precisely:

- **Traceable** — a claim can be followed back to a source or incident.
- **Auditable** — transformations and editorial decisions are inspectable.
- **Re-runnable** — code, inputs, parameters, and model identifiers needed for a run are available.
- **Reproducible** — an independent party can execute the documented process and obtain materially comparable outputs, subject to declared stochastic/model limits.

Until model snapshots, run manifests, prompts, inputs, and transformation code for a particular audit are published together, call that audit **traceable/auditable**, not fully reproducible.

## 12. Minimum standard for new research-grade entries

A new `structured` or `verified` entry should answer:

- What kind of object is this?
- Who or what produced the underlying evidence?
- Through which research channel did it enter?
- What claim is being made?
- Where exactly is the supporting evidence?
- Does the source support, complicate, contradict, or merely contextualise the claim?
- What is interpretation rather than observation?
- What evidence could change the interpretation?
- What method/version produced derived values?
- Has the entry been revised, and why?

If those questions are answerable from the record itself, UnPeeragogy is functioning as research infrastructure rather than merely a publication website.
