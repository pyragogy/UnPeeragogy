<div align="center">
   <img src="./public/images/UnPeeragogy-logo-test.webp" alt="Unpeeragogy" width="240" />
</div>

<p align="center">
  <strong>Theory meets friction — published.</strong>
</p>

<p align="center">
  <a href="https://unpeeragogy.pyragogy.org"><img src="https://img.shields.io/badge/site-unpeeragogy.pyragogy.org-teal?style=flat-square" alt="Site" /></a>
  <a href="https://zenodo.org/doi/10.5281/zenodo.22309102"><img src="https://img.shields.io/badge/zenodo-10.5281/zenodo.22309102-2ea44f?style=flat-square" alt="Zenodo DOI" /></a>
  <a href="https://github.com/pyragogy/unpeeragogy/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-CC0--1.0-lightgrey?style=flat-square" alt="License" /></a>
  <a href="https://github.com/pyragogy/unpeeragogy/actions"><img src="https://img.shields.io/github/actions/workflow/status/pyragogy/unpeeragogy/deploy.yml?branch=main&style=flat-square&label=deploy" alt="Deploy" /></a>
  <a href="https://unpeeragogy.pyragogy.org/vault"><img src="https://img.shields.io/badge/vault-online-teal?style=flat-square" alt="Vault" /></a>
  <a href="https://unpeeragogy.pyragogy.org/protocol"><img src="https://img.shields.io/badge/protocol-online-teal?style=flat-square" alt="Protocol" /></a>
</p>

---

## Why

I was part of the Peeragogy project for years. Contributed to the Handbook from the very first edition. Believed — genuinely — that people could learn, create, and organize knowledge together without a teacher at the center.

**I still think that's true.**

But spending time with an idea is different from reading about it. The patterns were useful. The principles made sense. The intentions were good. And in real groups, things were often messier than the theory admitted.

People lose motivation. Some carry the group, others ghost. Coordination quietly becomes management. Difficult conversations get avoided because preserving the group feels more important than questioning it.

I didn't find these contradictions interesting because they proved Peeragogy wrong. **I found them interesting because they made the theory more interesting** — by showing me what it couldn't explain.

### The 2015 seed

The name itself is older than the project.

On June 26, 2015, I signed an eLearning compendium with the word *"UnPeeragogy"* — a gesture more than a concept. A semantic marker for something I couldn't yet name. The document is still there: [Best Practices for Self-Directed Learning in Online Communities](https://fliphtml5.com/xrvq/ffgq/basic).

Eleven years of latency. Then, in 2024, the name condensed into a protocol, a dual-column architecture, a knowledge graph, and an MCP server — the system you see here.

The protocol and the Terzi Conjecture are now published on Zenodo ([10.5281/zenodo.22309102](https://zenodo.org/doi/10.5281/zenodo.22309102)).

> **Peeragogy → Unpeeragogy → Pyragogy**  
> *Not a rejection. A continuation. An attempt to learn by questioning what we thought we already knew.*

— *Fabrizio Terzi, [pyragogy.org](https://pyragogy.org)*

[Read the full account →](https://unpeeragogy.pyragogy.org/why)

---

## Quick Links

| Link | URL |
|---|---|
| Dedicated Audit Page | [unpeeragogy.pyragogy.org/audit](https://unpeeragogy.pyragogy.org/audit) |
| Full Report (Zenodo) | [doi.org/10.5281/zenodo.22309102](https://doi.org/10.5281/zenodo.22309102) |
| Pipeline Repository | [github.com/pyragogy/UnPeeragogy](https://github.com/pyragogy/UnPeeragogy) |
| UnPeeragogy Protocol | [unpeeragogy.pyragogy.org/protocol](https://unpeeragogy.pyragogy.org/protocol) |
| Background Blog — Part I | [blog.pyragogy.org/posts/2dd675a5](https://blog.pyragogy.org/posts/2dd675a5) |
| Background Blog — Part II | [blog.pyragogy.org/posts/e5f507dd](https://blog.pyragogy.org/posts/e5f507dd) |
| Peeragogy Handbook | [peeragogy.org](https://peeragogy.org) |
| License | [CC Zero — Public Domain](https://github.com/pyragogy/unpeeragogy/blob/main/LICENSE) |

---

## What is Unpeeragogy

A **dual-column experiment**. On one side, the original Peeragogy theory. On the other, the friction produced when that theory encounters actual human behaviour — power dynamics, coordination fatigue, the failure patterns that academic models tend to flatten.

| Peeragogy (theory) | Unpeeragogy (reality) |
|---|---|
| Collaborative learning | Paralyzing consensus |
| Self-organization | Academic free-rider dynamics |
| Participatory design | Coordination fatigue |
| Distributed leadership | Tyranny of structurelessness |

Between the two columns: **the reader** — asked not to choose which side is correct, but to notice where they stop agreeing.

---

## Evidence Protocol

The protocol is the epistemic backbone: **how we collect, classify, and challenge evidence**.

| Concept | What it does |
|---|---|
| **Research question** | *What happens when Peeragogy patterns meet conditions they don't explicitly describe?* |
| **Evidence taxonomy** | 8 types: source → observation → incident → interpretation → hypothesis → failure_mode → counter_evidence → revised_interpretation |
| **Epistemic statuses** | 7 states: observed → reported → interpreted → hypothesized → corroborated → contested → revised |
| **Discussion templates** | Two GitHub templates — one for free-form stories ([share-your-story.yml](.github/DISCUSSION_TEMPLATE/share-your-story.yml)), one for structured analysis ([structural-analysis.yml](.github/DISCUSSION_TEMPLATE/structural-analysis.yml)) |
| **Provenance** | Every claim traceable: who observed, under what conditions, what might contradict it |

Full protocol at **[unpeeragogy.pyragogy.org/protocol](https://unpeeragogy.pyragogy.org/protocol)**. Taxonomy lives in [`src/data/evidence-taxonomy.ts`](src/data/evidence-taxonomy.ts).

> The framework must remain open to its own revision. Counter-evidence is not a bug — it's data.

---

## Get Involved

Unpeeragogy is built to be used, challenged, and improved. If you're applying peer-learning patterns in your own context — a classroom, a community, an open-source project — your field reports are the evidence that makes the audit meaningful over time.

- [Submit a field report](https://github.com/pyragogy/UnPeeragogy/discussions/new?category=field-reports) via the UnPeeragogy repository
- [Discuss the protocol](https://forum.pyragogy.org) on the Pyragogy Forum
- Fork the pipeline and run it on your own corpus — it's CC0, no permission needed

---

## Agente Perturbatore (MCP Server)

The **Perturbator** is not a chatbot. It's a **friction engine** — a structured MCP server that forces the gap between theory and practice into visibility.

**Resources:**
- `unpeeragogy://failure/<slug>` — failure vectors from the corpus
- `unpeeragogy://tension/<slug>` — quantified friction level (0.0–3.0)

**Tools:**
- `search(query)` — does a failure vector exist for this topic?
- `compare(slug)` — read the theory/reality pair
- `analyze(slug)` — extract scope, preconditions, failure mode
- `tension-index(slug)` — quantified friction level
- `inject-friction(prompt, slug)` — apply the Perturbator's analytic function to arbitrary text

```
cd packages/mcp-server
npm run dev
```

See [`packages/mcp-server/DEPLOY.md`](packages/mcp-server/DEPLOY.md) for deployment and auth.

---

## What's inside

| Path | Content |
|---|---|
| `src/content/peeragogy/` | Historical Peeragogy texts (MDX) |
| `src/content/unpeeragogy/` | Anti-patterns, critique, operational reality |
| `src/data/evidence-taxonomy.ts` | Epistemic types, statuses, failure vectors |
| `packages/mcp-server/` | MCP server for AI integration |
| `scripts/` | Org-to-MDX conversion, log sync |
| `.github/DISCUSSION_TEMPLATE/` | Structured field report templates |

**Features:** dual-column reading · view toggle (Alpine.js) · Giscus discussions · Pagefind search · knowledge graph (D3-force) · evidence protocol · MCP server · llms.txt / llms-full.txt

---

## Quick start

```bash
git clone git@github.com:pyragogy/unpeeragogy.git
cd unpeeragogy
npm install
npm run dev
```

Open `http://localhost:4321`.

```bash
# Build for production
npm run build
npm run preview

# Content conversion
npm run convert-org    # Org-to-MDX (legacy .org files)
npm run seed-unpeeragogy  # Regenerate seed anti-pattern content
```

---

## Architecture

```
unpeeragogy/
├── src/
│   ├── components/        # Astro components
│   ├── content/           # Astro Content Collections (peeragogy/ + unpeeragogy/)
│   ├── data/              # Evidence taxonomy, failure vectors
│   ├── layouts/           # BaseLayout, DualLayout
│   ├── pages/             # Routes (index, why, protocol, vault, audit, ...)
│   └── styles/            # Global CSS (dark theme default)
├── packages/
│   └── mcp-server/        # MCP server (TypeScript)
├── public/                # Static assets
├── scripts/               # Conversion & utility scripts
└── .github/workflows/     # CI/CD (Coolify deploy)
```

**Stack:** Astro 5 · Tailwind CSS v4 · Alpine.js · Pagefind · Giscus · D3-force · MCP SDK

---

## License

[CC0 1.0 Universal (Public Domain)](LICENSE) — No rights reserved. Use, copy, modify, don't ask permission.

---

<p align="center">
  <a href="https://unpeeragogy.pyragogy.org">unpeeragogy.pyragogy.org</a> ·
  <a href="https://pyragogy.org">pyragogy.org</a> ·
  <a href="https://github.com/pyragogy/unpeeragogy">GitHub</a> ·
  <a href="https://zenodo.org/doi/10.5281/zenodo.22309102">Zenodo</a>
</p>