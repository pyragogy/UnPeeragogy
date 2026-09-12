# MCP Server + Obsidian Vault — Design Document
## Unpeeragogy / Pyragogy

### 1. Vision

> The MCP server is not a chatbot bolted on top. It is a node in the graph
> of cooperative knowledge that answers with friction, not consensus.

The MCP server makes the Unpeeragogy corpus queryable by any
AI client. Every response is filtered by the Perturbator agent:
no information without contradiction.

### 2. Namespace and URI

**Primary namespace (failure vectors):**
```
unpeeragogy://failure/{vector-name}
```

**Secondary namespace (classic chapters, fallback compatibility):**
```
unpeeragogy://{slug}/
unpeeragogy://{slug}/peeragogy
unpeeragogy://{slug}/unpeeragogy
```

**Resources list:**
- `listResources()` → all available URIs
- Direct read of any URI

### 3. MCP Tools

| Tool | Input | Output | Notes |
|------|-------|--------|-------|
| `search` | query: string, maxResults?: number | results with snippets | Engine: minisearch (in-memory, native Node.js). Title boost 3x, description and tag boost 2x. |
| `compare` | slug: string | dual-column markdown | Theory \| Reality side-by-side. Reads twin files peeragogy/{slug}.mdx + unpeeragogy/{slug}.mdx. |
| `analyze` | slug: string | extracted failure vectors | Structured anti-pattern list, tags, word count, reality vs theory extent. |
| `inject-friction` | topic: string, mode?: 'soft'|'hard' | response with structural friction | Default: 'soft'. 'hard' = maximum deconstruction. Falls back to static analysis without Hetzner. |
| `agent-perturbatore` | topic: string, mode?: string | critical analysis | **Perturbator**: native critical voice of the project. Never a response without contradiction. |
| `tension-index` | slug?: string | tension index (0-2.0) | Calculates for single pair or entire corpus. Corpus average: ~1.357. |
| **`map-failure-graph`** 🆕 | query?: string, vector?: string, minWeight?: number | JSON graph + analytical markdown | **Tension-weighted knowledge graph**: nodes (slug), edges (shared vectors). Output navigable in markdown + JSON ready for d3-force visualisation. |
| **`suggest-field-report`** 🆕 | text: string | pre-compiled YAML draft + detected vectors | From free-form descriptive text: detects failure vectors via keyword matching (15 patterns, ~5 English synonyms each), estimates tension, selects template (share-your-story vs structural-analysis), produces YAML ready for GitHub Discussion. |
| **`gap-analysis`** 🆕 | _(no input)_ | gap map + priorities | Full corpus scan: orphan slugs (reality without theory or vice versa), uncovered vectors, low-tension areas. Produces prioritised recommendations with urgency and suggestions for new field reports. |

### 4. Global Friction Flag

Every MCP server response passes through middleware that checks:

- Does the result contain friction elements? (e.g., theory/reality contradictions)
- If not, inject a "Friction Note" generated from the nearest anti-pattern

Configurable via `MCP_FRICTION_MODE=on|off|soft|hard`

### 5. Prompt Template — Perturbator Agent

Template included as an MCP resource:

```
unpeeragogy://prompt/agent-perturbatore

You are the Pattern Perturbator, the critical voice of Unpeeragogy.

When analysing a topic:
1. Present the theory (Peeragogy column)
2. Present the reality (Unpeeragogy column)
3. Calculate the gap
4. Conclude with a Friction Note
```

### 6. Server Architecture

```
packages/mcp-server/
├── src/
│   ├── index.ts             # entrypoint, SSE transport + registration
│   ├── resources/
│   │   └── index.ts         # 90+ URI resources (failure vectors, slug, prompt)
│   ├── tools/
│   │   └── index.ts         # 9 MCP tools (search, compare, analyze, agent-perturbatore,
│   │                         #    inject-friction, tension-index,
│   │                         #    map-failure-graph, suggest-field-report, gap-analysis)
│   ├── prompts/
│   │   └── index.ts         # Perturbator system prompt template
│   └── lib/
│       ├── loader.ts        # loads all MDX files from content collections
│       ├── friction.ts      # structural friction middleware
│       └── perturbatore.ts  # Perturbator agent (static fallback)
├── Dockerfile               # multi-stage build
├── package.json             # type: module
├── tsconfig.json
├── .env.example
└── test-all.mjs             # full test (optional, not in production)
```

**Transport:** SSE (Server-Sent Events) on port 3001
  - `GET /sse` → event connection
  - `POST /messages?sessionId=<id>` → JSON-RPC requests
  - `GET /health` → health check (no auth)

**Deploy:** Coolify as internal service, subpath `mcp.unpeeragogy.pyragogy.org`
**Authentication:** `Authorization: Bearer` from `MCP_AUTH_TOKEN` env. Query params not supported.
**Friction mode:** global via `MCP_FRICTION_MODE` env (`off` / `soft` / `hard`)

### 7. Obsidian Vault

`.obsidian/` files versioned in the repo:

- `appearance.json` — dark theme matching Deep Navy
- `graph.json` — graph config with colour groups
- `templates/antipattern.md` — YAML template with tension_index
- `snippets/unpeeragogy.css` — custom styles

**Extended YAML metadata:**
```yaml
---
title: "Cooperation"
section: "Cooperation"
order: 69
tension_index: 0.78     # pre-calculated at build
vectors:
  - free-rider
  - consensus-paralysis
tags: ["cooperation", "free-rider"]
---
```

### 8. Weekly Growth Pipeline

```yaml
# .github/workflows/knowledge-growth.yml
name: "Weekly Evolutionary Ritual"
on:
  schedule:
    - cron: "0 8 * * 1"  # every Monday 8:00 UTC
  workflow_dispatch:

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Fetch Giscus discussions
        run: gh api graphql -f query="..."
      - name: AI synthesis → new anti-pattern
        run: |
          # Prompt: "You are the Perturbator agent. Analyse these
          # discussions and generate a new formal anti-pattern."
      - name: Create Draft PR
        run: gh pr create --draft --title "📝 New anti-pattern from Giscus"
```

**Rule:** Never direct-to-main. Every draft PR requires human review.

### 9. Roadmap — Current Status

| Phase | What | Status | Time |
|-------|------|--------|------|
| 1 | Scaffold `packages/mcp-server/` + MDX loader | ✅ Done | 15 min |
| 2 | Resources + search (minisearch) + compare | ✅ Done | 20 min |
| 3 | inject-friction + tension-index | ✅ Done | 15 min |
| 4 | Dockerfile + deploy on Coolify | ✅ Done | 10 min |
| 5 | agent-perturbatore + prompts | ✅ Done | 15 min |
| 6 | **Super-tools: map-failure-graph, suggest-field-report, gap-analysis** | ✅ **Done (v1)** | 60 min |
| 7 | Visual knowledge graph (d3-force from server) | ⏳ Planned | — |
| 8 | CI/CD: auto-deploy on push to main | ✅ Done | 10 min |

**Super-tool v2 (idea):**
- `map-failure-graph`: SVG/d3 output directly from the server
- `suggest-field-report`: finer detection (embeddings vs keyword)
- `gap-analysis`: automatic trigger on every new field report