<div align="center">
   <img src="./public/images/UnPeeragogy-logo-test.webp" alt="Unpeeragogy" width="240" />
</div>

<p align="center">
  <strong>Peeragogy's uncomfortable second question.</strong>
</p>

<p align="center">
  <a href="https://unpeeragogy.pyragogy.org"><img src="https://img.shields.io/badge/site-unpeeragogy.pyragogy.org-teal?style=flat-square" alt="Site" /></a>
  <a href="https://github.com/pyragogy/unpeeragogy/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-CC--BY--4.0-lightgrey?style=flat-square" alt="License" /></a>
  <a href="https://github.com/pyragogy/unpeeragogy/actions"><img src="https://img.shields.io/github/actions/workflow/status/pyragogy/unpeeragogy/deploy.yml?branch=main&style=flat-square&label=deploy" alt="Deploy" /></a>
  <a href="./packages/mcp-server"><img src="https://img.shields.io/badge/MCP%20Server-available-teal?style=flat-square" alt="MCP Server" /></a>
  <a href="https://unpeeragogy.pyragogy.org/vault"><img src="https://img.shields.io/badge/vault-online-teal?style=flat-square" alt="Vault" /></a>
  <a href="https://unpeeragogy.pyragogy.org/mcp"><img src="https://img.shields.io/badge/NotebookLM-free-teal?style=flat-square" alt="NotebookLM" /></a>
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

Unpeeragogy is a **dual-column experiment**. On one side, the original Peeragogy theory. On the other, the friction produced when that theory encounters actual human behaviour, power dynamics, coordination fatigue, and the failure patterns that academic models tend to flatten.

### The two-column method

| Peeragogy (theory) | Unpeeragogy (reality) |
|---|---|
| Collaborative learning | Paralyzing consensus |
| Self-organization | Academic free-rider |
| Participatory design | Coordination fatigue |
| Distributed leadership | The tyranny of strutturelessness |

Between the two columns: **the reader** — asked not to choose which side is correct, but to notice where the two stop agreeing. That gap is the experiment.

---

## The Agente Perturbatore

Unpeeragogy introduces a critical native entity: the **Perturbator** — a voice that lives in the analysis boxes, speaking with a colloquial, complicit, sharp, anti-academic tone. Not the smartest person. Not the leader. Someone willing to say: *wait — why are we assuming this?*

> *"The Perturbator is useful precisely because they introduce uncertainty into a system that has become too comfortable with its own assumptions."*

---

## What's inside

| Path | Content |
|---|---|
| `src/content/peeragogy/` | Historical Peeragogy texts (MDX) |
| `src/content/unpeeragogy/` | Anti-patterns, critique, operational reality |
| `src/content/chat/` | Conversation logs |
| `packages/mcp-server/` | MCP server for AI integration |
| `scripts/` | Org-to-MDX conversion, log sync |

### Features

- **Dual-column reading** — responsive CSS grid with independent scrolling + scroll sync
- **View toggle** (Alpine.js) — Dual View, Solo Peeragogy, Solo Unpeeragogy
- **Giscus discussions** — bound to the Unpeeragogy column (the plane of real conflict)
- **Pagefind search** — full-text search across both collections
- **LLMs.txt** — AI-friendly content distillation (`/llms.txt`, `/llms-full.txt`)
- **MCP server** — expose resources, tools, and friction injection to AI clients

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

## MCP Server

Unpeeragogy ships with an MCP server that exposes:

- **Resources** — failure vectors (`unpeeragogy://failure/<slug>`)
- **Tools** — `search`, `injectFriction`, `calculateTensionIndex`, `listPrompts`
- **Prompts** — Agente Perturbatore prompts for AI clients

```bash
cd packages/mcp-server
npm run dev
```

See [`packages/mcp-server/DEPLOY.md`](packages/mcp-server/DEPLOY.md) for deployment and authentication.

---

## Architecture

```
unpeeragogy/
├── src/
│   ├── components/       # Astro components (SectionDiscussion, ViewToggle, ...)
│   ├── content/          # Astro Content Collections
│   │   ├── peeragogy/    # Historical texts (MDX)
│   │   └── unpeeragogy/  # Anti-patterns (MDX)
│   ├── layouts/          # BaseLayout, DualLayout
│   ├── pages/            # Routes (index, why, mcp, ...)
│   └── styles/           # Global CSS
├── packages/
│   └── mcp-server/       # MCP server (TypeScript)
├── public/               # Static assets (icons, images)
├── scripts/              # Conversion & utility scripts
└── .github/workflows/    # CI/CD (Coolify deploy)
```

**Stack:** Astro 5 · Tailwind CSS v4 · Alpine.js · Pagefind · Giscus · MCP SDK

---

## License

[CC BY 4.0](LICENSE) — You are free to share and adapt, as long as you give appropriate credit.

---

<p align="center">
  <a href="https://unpeeragogy.pyragogy.org">unpeeragogy.pyragogy.org</a> ·
  <a href="https://pyragogy.org">pyragogy.org</a> ·
  <a href="https://github.com/pyragogy/unpeeragogy">GitHub</a>
</p>
