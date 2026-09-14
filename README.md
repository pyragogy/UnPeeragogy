<div align="center">
  <img src="./public/images/UnPeeragogy-logo-test.webp" alt="UnPeeragogy" width="240" />
</div>

<p align="center">
  <strong>Open research infrastructure for studying where collaborative theory meets operational reality.</strong>
</p>

<p align="center">
  <a href="https://unpeeragogy.pyragogy.org"><img src="https://img.shields.io/badge/site-unpeeragogy.pyragogy.org-teal?style=flat-square" alt="Site" /></a>
  <a href="https://zenodo.org/doi/10.5281/zenodo.22309102"><img src="https://img.shields.io/badge/zenodo-10.5281/zenodo.22309102-2ea44f?style=flat-square" alt="Zenodo DOI" /></a>
  <a href="https://github.com/pyragogy/UnPeeragogy/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-CC0--1.0-lightgrey?style=flat-square" alt="License" /></a>
  <a href="https://github.com/pyragogy/UnPeeragogy/actions"><img src="https://img.shields.io/github/actions/workflow/status/pyragogy/UnPeeragogy/deploy.yml?branch=main&style=flat-square&label=deploy" alt="Deploy" /></a>
</p>

---

## What UnPeeragogy is

UnPeeragogy began as a pressure test of the **Peeragogy Handbook**: place the theory in one column, the friction of real practice in the other, and examine where they stop agreeing.

It is now evolving into something more general: an **open qualitative and socio-technical research substrate** in which sources, incidents, interpretations, hypotheses, counter-evidence and revisions remain distinguishable and machine-readable.

The core question remains:

> **What happens when Peeragogy patterns meet conditions they do not explicitly describe?**

This is not a debunking project. A useful result can be:

- the pattern appears robust under condition X;
- it becomes fragile under condition Y;
- the current theory does not explain Z;
- an UnPeeragogy interpretation was too strong and must be revised.

The last outcome matters as much as the others.

## Why

I contributed to the Peeragogy Handbook from its early editions and believed — genuinely — that people could learn, create and organise knowledge together without a teacher at the centre.

I still think that is true.

But living with an idea is different from reading it. Groups lose motivation. Some people carry invisible work. Consensus can become avoidance. Coordination can quietly become management. None of that makes Peeragogy worthless. It makes the boundary conditions worth studying.

The name *UnPeeragogy* first appeared in material I signed in 2015. Years later it became a protocol, a dual-column corpus, a knowledge graph and an AI-accessible research interface.

> **Peeragogy → UnPeeragogy → Pyragogy**  
> Not rejection. Continuation through friction.

[Read the full account →](https://unpeeragogy.pyragogy.org/why/)

---

## Research integrity first

The project separates concepts that knowledge bases often collapse together.

| Object | Meaning |
|---|---|
| **Source** | What an original document or theory says |
| **Observation** | What a practitioner directly reports |
| **Incident** | A structured Critical Incident account |
| **Interpretation** | What the project infers from the material |
| **Hypothesis** | A candidate explanation that can be challenged |
| **Failure mode** | A describable way a pattern deteriorates |
| **Counter-evidence** | Material that narrows, complicates or contradicts an interpretation |
| **Revised interpretation** | A changed interpretation with the previous state preserved |

A URL is **not** automatically evidence for a claim. Research-grade records can state whether a source supports, complicates, contradicts or merely contextualises a claim, and can include a precise locator into the source.

Synthetic or composite narratives are allowed for explanation, but must be marked **Illustrative scenario — not empirical evidence** and excluded from empirical evidence counts.

See:

- [Research Protocol](https://unpeeragogy.pyragogy.org/protocol/)
- [Open Research Infrastructure](https://unpeeragogy.pyragogy.org/research/)
- [`docs/RESEARCH_DATA_MODEL.md`](docs/RESEARCH_DATA_MODEL.md)
- [`src/data/evidence-taxonomy.ts`](src/data/evidence-taxonomy.ts)

---

## Two evidence channels

UnPeeragogy keeps two research channels separate before triangulating them.

### Documentary audit

Inspectable material such as governance documents, repositories, public records, archived discussions, policies, datasets and publications.

### Practitioner field evidence

Critical Incident reports and first-person accounts describing what happened in real groups, with context, intention, action, outcome and reflection.

Documents are often better at showing formal structure. Field reports are often better at exposing lived practice. Neither is treated as a transparent window onto reality.

---

## Integrity levels

The historical corpus predates the stricter schema. It is therefore being migrated honestly rather than bulk-labelled as verified.

| Level | Meaning |
|---|---|
| `legacy` | Useful historical corpus, not yet provenance-enforced |
| `structured` | Origin, method, research channel, status and provenance are explicit |
| `verified` | Material empirical claims have been checked against traceable evidence |
| `contested` | Counter-evidence actively challenges the current interpretation |

Two status axes remain independent:

- **epistemic status**: `observed → reported → interpreted → hypothesized → corroborated → contested → revised`
- **verification status**: `unverified | source-linked | partially-supported | corroborated | contested`

Neither is a numeric confidence score.

---

## Open machine-readable research

The project is designed to be read by people **and** reused by research software.

| Endpoint | Purpose |
|---|---|
| [`/research.json`](https://unpeeragogy.pyragogy.org/research.json) | Corpus index with origin, statuses, research channels, tension and provenance |
| [`/ro-crate-metadata.json`](https://unpeeragogy.pyragogy.org/ro-crate-metadata.json) | RO-Crate 1.3 JSON-LD research-object metadata |
| [`/feed.xml`](https://unpeeragogy.pyragogy.org/feed.xml) | Atom feed |
| `llms.txt` / `llms-full.txt` | AI-readable public corpus surfaces |

The internal model is intentionally project-specific, while the export layer is designed to map cleanly toward open research standards including **W3C PROV**, **RO-Crate** and **DataCite metadata**.

Interoperability is a mapping layer, not a replacement for qualitative method.

---

## The dual-column interface

| Peeragogy | UnPeeragogy |
|---|---|
| Theory / source text | Evidence, friction and provisional interpretation |
| What the pattern proposes | What documented cases or incidents complicate |
| Intended operating logic | Boundary conditions, failure modes, counter-evidence |

Between the columns is the reader. The interface does not ask which side is “correct”. It asks what each side can and cannot explain.

Browse the [Knowledge Vault](https://unpeeragogy.pyragogy.org/vault/).

---

## Tension index

`tension_index` is a **descriptive research signal on a 0–3 scale**. It is not a probability, effect size, prevalence estimate or statistical confidence score.

Legacy scripts and audit pipelines have historically produced values using different methods. The current integrity work therefore requires research-grade changes to declare the method/version that produced a derived value.

Values should not be compared as if they came from the same instrument unless the method is the same.

---

## Reproducibility vocabulary

The project uses these terms deliberately:

- **traceable** — a claim can be followed back to a source or incident;
- **auditable** — transformations and editorial decisions can be inspected;
- **re-runnable** — the necessary code, inputs and parameters are available;
- **reproducible** — an independent party can rerun the documented process and obtain materially comparable results, with stochastic/model limits declared.

An LLM-assisted audit is not called fully reproducible merely because some code is public. A reproducible run requires the relevant inputs, prompts, model identifiers, parameters, transformation code and run manifest to be published together.

---

## Epistemic Integrity Gate

The build now includes a research-specific validation layer in addition to normal software compilation.

```bash
npm run check:integrity
npm run build
```

The gate checks, among other things:

- canonical `tension_index` range;
- valid origin and status vocabularies;
- provenance requirements for research-grade records;
- field-report/documentary channel consistency;
- explicit marking of synthetic scenarios;
- known overclaims that should not silently re-enter the corpus.

GitHub Actions run the integrity gate and both the Astro and MCP builds before deployment.

---

## Contribute evidence

The best contribution is not agreement. It is evidence that changes the boundary of what we think we know.

- [Submit a practitioner field report](https://github.com/pyragogy/UnPeeragogy/discussions/new?category=field-reports)
- Use the structured-analysis template for a specific revision or counter-claim
- Fork the schema and apply it to another theory/corpus
- Open an issue or discussion when a source does **not** support the claim attached to it

Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting research-grade material.

---

## Perturbator MCP server

The **Perturbator** is the AI-access layer over the corpus. It is not evidence and it is not an autonomous authority. Its role is to expose structural friction, search the corpus and generate questions or provisional analyses that remain subordinate to provenance.

Current tools include:

- `search`
- `compare`
- `analyze`
- `agent-perturbatore`
- `inject-friction`
- `tension-index`
- `map-failure-graph`
- `suggest-field-report`
- `gap-analysis`

```bash
cd packages/mcp-server
npm install
npm run build
npm run dev
```

See [`packages/mcp-server/DEPLOY.md`](packages/mcp-server/DEPLOY.md).

---

## Repository structure

```text
UnPeeragogy/
├── src/
│   ├── content/
│   │   ├── peeragogy/        # source/theory corpus
│   │   ├── unpeeragogy/      # friction/evidence/interpretation corpus
│   │   └── log/              # project log
│   ├── data/                 # epistemic taxonomy and structured data
│   ├── pages/                # public site + machine-readable endpoints
│   ├── components/
│   └── layouts/
├── docs/
│   └── RESEARCH_DATA_MODEL.md
├── packages/
│   └── mcp-server/           # MCP interface for AI clients
├── scripts/
│   └── validate-epistemic-integrity.mjs
└── .github/
    ├── DISCUSSION_TEMPLATE/
    └── workflows/            # integrity, build and deployment gates
```

**Stack:** Astro 5 · MDX · Tailwind CSS v4 · Pagefind · D3-force · GitHub Discussions · Model Context Protocol

---

## Development

```bash
git clone https://github.com/pyragogy/UnPeeragogy.git
cd UnPeeragogy
npm ci
npm run check:integrity
npm run build
npm run dev
```

Then open `http://localhost:4321`.

For MCP development:

```bash
cd packages/mcp-server
npm ci
npm run build
```

---

## Publication and provenance

- Project: https://unpeeragogy.pyragogy.org/
- Protocol / publication: https://doi.org/10.5281/zenodo.22309102
- Repository: https://github.com/pyragogy/UnPeeragogy
- ORCID: https://orcid.org/0009-0004-7191-0455

The original Peeragogy source material is retained with its provenance. External sources remain external sources: citing them inside a CC0 corpus does not relicense third-party material.

---

## License

Project-owned material in this repository is dedicated under [CC0 1.0 Universal](LICENSE).

Use it, fork it, contradict it, improve it.
