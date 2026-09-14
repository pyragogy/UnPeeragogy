# Contributing to UnPeeragogy

UnPeeragogy is an open qualitative and socio-technical research project examining what happens when peer-learning patterns meet conditions they do not explicitly describe.

The most valuable contribution is not agreement with the project. It is **inspectable experience or evidence that can change what the project currently thinks**.

## Start here

- Research protocol: https://unpeeragogy.pyragogy.org/protocol/
- Open research infrastructure: https://unpeeragogy.pyragogy.org/research/
- Research data model: [`docs/RESEARCH_DATA_MODEL.md`](docs/RESEARCH_DATA_MODEL.md)
- Machine-readable corpus: https://unpeeragogy.pyragogy.org/research.json
- RO-Crate metadata: https://unpeeragogy.pyragogy.org/ro-crate-metadata.json

## Two evidence channels

UnPeeragogy deliberately keeps two channels separate.

### 1. Practitioner field evidence

Use this when you were involved in, or directly observed, a real group.

Open a GitHub Discussion with the **📖 Share Your Story** template:

https://github.com/pyragogy/UnPeeragogy/discussions/new?category=field-reports

The form separates:

1. context;
2. intention;
3. action;
4. what happened;
5. what surprised you;
6. your interpretation;
7. what might make the project's interpretation wrong.

You do not need to know the project's vocabulary. Concrete detail is more useful than theory language.

### 2. Documentary evidence

Use this when you have an inspectable source: a governance document, repository history, issue thread, archived decision, publication, policy, dataset or other public record.

A source must not be treated as proof merely because it is real. Please identify:

- the exact claim you think it supports;
- the source URL or persistent identifier;
- the narrowest practical locator (section, page, issue, commit, timestamp, paragraph);
- whether it **supports**, **complicates**, **contradicts**, or only **contextualises** the claim;
- any limitation that prevents a stronger conclusion.

## Evidence is not interpretation

This distinction is non-negotiable.

- **Observation / incident**: what was reported to have happened.
- **Documentary source**: what an inspectable record actually says or shows.
- **Interpretation**: what we infer from the material.
- **Hypothesis**: a candidate explanation that can be challenged.
- **Counter-evidence**: material that narrows, complicates or contradicts an interpretation.

Synthetic or composite stories are allowed as explanatory devices, but they must be labelled **Illustrative scenario — not empirical evidence** and must never be counted as field evidence.

## Research-grade entries

The historical corpus is being migrated progressively. Do not bulk-promote old entries to `verified`.

New or substantially revised research-grade entries should declare:

```yaml
origin: "field-report" # or documentary-audit, manual-revision, etc.
integrity_level: "structured"
epistemic_status: "interpreted"
verification_status: "source-linked"
method_version: "documentary-audit-v3"
research_channels: ["documentary"]
provenance:
  - id: "SOURCE-001"
    kind: "document"
    uri: "https://example.org/source"
    locator: "Section 4, paragraph 2"
    claim: "The narrow claim supported by this source."
    support: "supports"
    note: "What this source does not establish."
```

The build includes an **Epistemic Integrity Gate**. Structured/verified entries that omit required research metadata fail CI.

## Status vocabulary

Two different axes are used.

### Epistemic status

Where an interpretation is in its lifecycle:

`observed → reported → interpreted → hypothesized → corroborated → contested → revised`

### Verification status

How its supporting material has been checked:

`unverified | source-linked | partially-supported | corroborated | contested`

These are not numeric confidence scores.

## Structural analysis

If you are already familiar with the corpus and want to propose a revision, use the **🔍 Structural Analysis** Discussion template.

A useful structural analysis includes:

- a clear position: confirms / extends / contradicts / question;
- provenance;
- the claim being challenged or extended;
- counter-evidence;
- what would make your own interpretation wrong.

Final editorial decisions remain reviewable in Git history. Authority does not substitute for evidence, including the project maintainer's authority.

## How field reports are processed

1. **Logging** — the report enters as `observed`.
2. **Context matching** — it is linked to relevant pattern(s).
3. **Interpretation** — the project proposes a provisional reading.
4. **Verification** — evidence is checked for provenance and claim-to-source fit.
5. **Tension assessment** — derived values may change, with method/version and rationale recorded.
6. **Counter-evidence review** — contradictory material is retained rather than suppressed.
7. **Revision** — if the interpretation changes, the previous state remains available through the audit trail.

## Tension index

`tension_index` is a descriptive research signal on a canonical **0–3** scale. It is not a statistical confidence score and must not be interpreted as prevalence, effect size or probability.

Legacy scripts that produced similarly named values are not automatically method-equivalent. Research-grade updates must record the method/version used.

## What UnPeeragogy is not

It is not:

- a definitive evaluation of Peeragogy's validity;
- a statistical study of Peeragogy outcomes;
- a repository of failure stories only;
- a replacement for the Handbook;
- a system in which an AI-generated interpretation becomes evidence by being generated;
- a debate platform where popularity determines truth.

It is an open feedback layer in which theory, documentary evidence, practitioner incidents, interpretations and counter-evidence can remain distinguishable and revisable.

## Engineering contributions

The public site uses Astro 5, Tailwind CSS v4, D3-force, Pagefind and GitHub Discussions. The MCP package exposes the corpus to AI clients.

Before proposing a change, run:

```bash
npm ci
npm run check:integrity
npm run build

cd packages/mcp-server
npm ci
npm run build
```

Pull requests should pass the **Research Integrity & Build Gate** before merge.

## License

Project-owned content and code in this repository are dedicated under **CC0 1.0 Universal**, subject to the provenance and rights of external sources that are cited rather than copied.
