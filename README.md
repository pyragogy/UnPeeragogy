<div align="center">
   <img src="./public/images/UnPeeragogy-logo-test.webp" alt="Unpeeragogy" width="240" />
</div>

<p align="center">
  <strong>Theory meets friction and research.</strong>
</p>

<p align="center">
  <a href="https://unpeeragogy.pyragogy.org"><img src="https://img.shields.io/badge/site-unpeeragogy.pyragogy.org-teal?style=flat-square" alt="Site" /></a>
  <a href="https://github.com/pyragogy/unpeeragogy/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-CC0--1.0-lightgrey?style=flat-square" alt="License" /></a>
  <a href="https://github.com/pyragogy/unpeeragogy/actions"><img src="https://img.shields.io/github/actions/workflow/status/pyragogy/unpeeragogy/deploy.yml?branch=main&style=flat-square&label=deploy" alt="Deploy" /></a>
  <a href="./packages/mcp-server"><img src="https://img.shields.io/badge/MCP%20Server-available-teal?style=flat-square" alt="MCP Server" /></a>
  <a href="https://unpeeragogy.pyragogy.org/vault"><img src="https://img.shields.io/badge/vault-online-teal?style=flat-square" alt="Vault" /></a>
  <a href="https://unpeeragogy.pyragogy.org/protocol"><img src="https://img.shields.io/badge/protocol-online-teal?style=flat-square" alt="Protocol" /></a>
</p>

---

## Why

I was part of the Peeragogy project for years. I contributed to the Handbook from the very first edition. I genuinely believed that people could learn, create, and organize knowledge together without placing a teacher or an institutional authority at the center.

**I still think that's true.**

But spending time with an idea is different from reading about it. The patterns were useful. The principles made sense. The intentions were good. And in real groups, things were often much messier than the theory suggested.

People lose motivation. Some contribute far more than others. Groups spend enormous energy trying to reach consensus. Coordination quietly becomes management. Difficult conversations get avoided because preserving the group feels more important than questioning it.

I didn't find these contradictions interesting because they proved Peeragogy wrong. **I found them interesting because they made the theory more interesting** — by showing me what it couldn't explain.

> **Peeragogy → Unpeeragogy → Pyragogy**  
> *Not a rejection. A continuation. An attempt to learn by questioning what we thought we already knew.*

— *Fabrizio Terzi, [pyragogy.org](https://pyragogy.org)*

[Read the full account →](https://unpeeragogy.pyragogy.org/why)

---

## What is Unpeeragogy?

A **dual-column experiment**. On one side, the original Peeragogy theory. On the other, the friction produced when that theory encounters actual human behaviour, power dynamics, coordination fatigue, and the failure patterns that academic models tend to flatten.

| Peeragogy (theory) | Unpeeragogy (reality) |
|---|---|
| Collaborative learning | Paralyzing consensus |
| Self-organization | Academic free-rider |
| Participatory design | Coordination fatigue |
| Distributed leadership | Tyranny of structurelessness |

Between the two columns: **the reader** — asked not to choose which side is correct, but to notice where the two stop agreeing.

---

## Evidence Protocol

The protocol is the epistemic backbone of the project — **how we collect, classify, and challenge evidence**. It defines:

| Concept | What it does |
|---|---|
| **Research question** | *What happens when Peeragogy patterns meet conditions they don't explicitly describe?* |
| **Evidence taxonomy** | 8 types: `source`, `observation`, `incident`, `interpretation`, `hypothesis`, `failure_mode`, `counter_evidence`, `revised_interpretation` |
| **Discussion templates** | Two GitHub Discussion templates — one for free-form stories ([`share-your-story.yml`](.github/DISCUSSION_TEMPLATE/share-your-story.yml)), one for structured analysis ([`structural-analysis.yml`](.github/DISCUSSION_TEMPLATE/structural-analysis.yml)) — enforcing provenance tracking and epistemic discipline |
| **Provenance** | Each claim is traceable: *who observed, under what conditions, and what might contradict it* |

The protocol is documented at **[unpeeragogy.pyragogy.org/protocol](https://unpeeragogy.pyragogy.org/protocol)** and lives in [`src/data/evidence-taxonomy.ts`](src/data/evidence-taxonomy.ts).

> **Key rule**: The framework must remain open to its own revision. Counter-evidence is not a bug — it's data.

---

## The Agente Perturbatore (MCP Server)

The **Perturbator** is not a chatbot. It's a **friction engine** — a structured MCP server that forces the gap between theory and practice into visibility.

**Resources:**
- `unpeeragogy://failure/<slug>` — failure vectors from the corpus
- `unpeeragogy://tension/<slug>` — quantified friction level (0.0–3.2)

**Tools:**
- `search(query)` — does a failure vector exist for this topic?
- `compare(slug)` — read the theory/reality pair
- `analyze(slug)` — extract scope, preconditions, failure mode name
- `tension-index(slug)` — get the quantified friction level
- `injectFriction(prompt, slug)` — apply the Perturbator's voice to arbitrary text

**Prompts:**
- AGENTE_PERTURBATORE_PROMPT v2.0 — operational protocol with mandatory phases: *search → compare → analyze → tension-index → inject*

```
cd packages/mcp-server
npm run dev
```

See [`packages/mcp-server/DEPLOY.md`](packages/mcp-server/DEPLOY.md) for deployment and auth (Coolify, JWT).

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

### Features

- **Dual-column reading** — responsive CSS grid with independent scrolling + scroll sync
- **View toggle** (Alpine.js) — Dual View, Solo Peeragogy, Solo Unpeeragogy
- **Giscus discussions** — bound to the Unpeeragogy column (the plane of real conflict)
- **Pagefind search** — full-text search across both collections
- **Knowledge graph** — interactive 3D force-directed graph of nodes and connections ([vault](https://unpeeragogy.pyragogy.org/vault))
- **Evidence Protocol** — research framework + GitHub Discussion templates with provenance tracking
- **MCP Server** — Agente Perturbatore exposed as resources, tools, and prompts
- **LLMs.txt** — AI-friendly content distillation (`/llms.txt`, `/llms-full.txt`)

---

## Quick start

```bash
git clone git@github.com:pyragogy/unpeeragogy.git
cd unpeeragogy
npm install
npm run dev
```

Open `http://localhost:4321`.

### Build for production

```bash
npm run build
npm run preview
```

### Content conversion

```bash
# Re-run Org-to-MDX conversion (from original .org files)
npm run convert-org

# Regenerate seed anti-pattern content
npm run seed-unpeeragogy
```

---

## How to contribute

1. **Read the protocol**: [unpeeragogy.pyragogy.org/protocol](https://unpeeragogy.pyragogy.org/protocol)
2. **Open a Discussion** with your field report — use the template that fits:
   - [📖 Share your story](https://github.com/pyragogy/unpeeragogy/discussions/new?category=field-reports&template=share-your-story.yml) — for raw experience, no jargon required
   - [🔍 Structural analysis](https://github.com/pyragogy/unpeeragogy/discussions/new?category=field-reports&template=structural-analysis.yml) — for people familiar with tension_index / failure vectors
3. **Contribute via PR** for content revisions, new anti-patterns, or protocol refinements.

---

## Architecture

```
unpeeragogy/
├── src/
│   ├── components/        # Astro components (SectionDiscussion, ViewToggle, ...)
│   ├── content/           # Astro Content Collections
│   │   ├── peeragogy/     # Historical texts (MDX)
│   │   └── unpeeragogy/   # Anti-patterns (MDX)
│   ├── data/              # Evidence taxonomy, failure vectors
│   ├── layouts/           # BaseLayout, DualLayout
│   ├── pages/             # Routes (index, why, protocol, mcp, vault, ...)
│   └── styles/            # Global CSS (dark theme default)
├── packages/
│   └── mcp-server/        # MCP server (TypeScript)
├── public/                # Static assets (icons, images)
├── scripts/               # Conversion & utility scripts
└── .github/workflows/     # CI/CD (Coolify deploy)
```

**Stack:** Astro 5 · Tailwind CSS v4 · Alpine.js · Pagefind · Giscus · MCP SDK

---

## License

[CC0 1.0 Universal (Public Domain)](LICENSE) — No rights reserved. Use, copy, modify, don't ask permission.

---

<p align="center">
  <a href="https://unpeeragogy.pyragogy.org">unpeeragogy.pyragogy.org</a> ·
  <a href="https://pyragogy.org">pyragogy.org</a> ·
  <a href="https://github.com/pyragogy/unpeeragogy">GitHub</a>
</p>