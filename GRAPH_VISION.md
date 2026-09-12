# Vault Graph & Tree — Development Vision

> *A graph that evolves. A tree that gets pruned. A knowledge base
>  that breathes with user discussions and MCP friction.*

## 1. Logical Graph Architecture

### 1.1 Data model

Il vault si fonda su una coppia esatta di collezioni Astro `peeragogy` e `unpeeragogy`, allineate per **slug**:

```
src/content/
  peeragogy/{slug}.mdx     ← teoria (colonna azzurra)
  unpeeragogy/{slug}.mdx   ← realtà (colonna rossa)
```

Every entry produces **one node** in the graph. The node attributes are:

| Field | Type | Source | Role |
|-------|------|-------|-------|
| `id` | string | slug (es. `antipatterns`) | Identificatore unico, usato per navigazione `/{id}/` |
| `name` | string | frontmatter `title` | Label visualizzata |
| `group` | `"peeragogy"` / `"unpeeragogy"` / `"unpeeragogy-only"` | collection membership | Colour: blue (`#3b82f6`) if theory only, red (`#ef4444`) if reality column exists |
| `val` | 1 or 2 | unpeeragogy presence | Node radius: 6px (theory only) or 8px (with reality) |
| `tension` | number \| null | `tension_index` in frontmatter | Shown in tooltip + tree badge |
| `section` | string | frontmatter `section` | Tree grouping |
| `readingTime` | number | frontmatter `readingTime` | Reading time (tree badge) |

### 1.2 Connections (links)

The vault generates **two types of links**:

1. **Section chain** — each `peeragogy` node is linked to the next in the same section, ordered by `order`. This creates a linear structure per section, visible as a "chain" in the graph.

2. **Implicit theory↔reality link** — every entry that has both peeragogy and unpeeragogy shares the same slug. In the graph the two nodes **are not separate**: a single node exists per slug, with `group="unpeeragogy"` if the pair exists. The tension link is implicit: the node is red and the `T:n.n` badge shows the index.

There is no **explicit cross-link** between nodes of different sections. The force-directed layout will naturally surface the proximity of semantically close nodes through the `charge` and `link distance` forces.

### 1.3 Current topology

```
87 nodes · ~86 connections (one per pair in the section chain)
- Sections: ~8-12, variable (depends on frontmatter section)
- Red nodes: ~84 (with unpeeragogy counterpart) + ~1-3 unpeeragogy-only
- Blue nodes: peeragogy only, no unpeeragogy counterpart (few)
```

## 2. Graph Rendering

### 2.1 Engine

Canvas2D + `d3-force` — no graphics accelerator. Bundle JS: ~22KB.

| Parameter | Value | Rationale |
|-----------|--------|-----------------|
| `charge` | -60 | Weak repulsion (inspired by Quartz: `repelForce 0.5 × -100`) |
| `link.distance` | 50 | Short links for visible clusters |
| `link.strength` | 0.2 | Flexibility: graph can deviate from straight lines |
| `center.strength` | 0.3 | Centre attraction (prevents drifting) |
| `collide.radius` | 12 | Minimum separation (prevents overlaps) |
| `alphaDecay` | 0.03 | Slow settling — graph "dances" for a few seconds |
| `velocityDecay` | 0.4 | Natural damping |

Initial positioning is **random** (Quartz-style), not circular or spherical. This prevents centralised collapse because each node starts at varying distance from the centre.

### 2.2 Interactions

| Input | Action | Detail |
|-------|--------|-----------|
| Hover | Tooltip + highlight | Shows node name and `T:n.n` if present |
| Node click | Navigate | `window.location.href = "/{id}/"` |
| Node drag | Move | Fixes position, draggable; release navigates if short click |
| Scroll | Zoom | Scale factor 0.2–6 |
| Pan (background drag) | Move viewport | Translates coordinates |
| Double click | ZoomToFit | Re‑centres on all nodes |
| Buttons: ＋ − ⟲ Aa | Zoom in/out/reset/label toggle | 40px controller |

### 2.3 Theme

| Element | Light | Dark |
|----------|--------|-------|
| Canvas background | `--color-bg` (#ffffff) | `--color-bg` (#0c0c0e) |
| Link | `rgba(100,110,130,0.2)` | `rgba(200,210,230,0.35)` |
| Label | `rgba(80,85,95,0.6)` | `rgba(210,220,240,0.65)` |
| Legend | Peeragogy: `#3b82f6`, Unpeeragogy: `#ef4444` | unchanged |
| Tooltip | `--surface-raised` | `--surface-raised` |

## 3. Tree View

### 3.1 Structure

The alternative view is a **section-based tree**:

```
Section 1 (N theory nodes · M reality nodes)   ← collapsible header
├── entry 1 ● [T n.n] [Xm] →
├── entry 2 ● [T n.n] [Xm] →
└── entry 3 ● [T n.n] [Xm] →

Section 2 ...
```

Each section is collapsible. Nodes with `hasUnpeeragogy=true` have a red dot, others blue. The `T n.n` badge follows a colour scale:
- `T < 0.6`: blue
- `T 0.6–0.99`: orange
- `T ≥ 1.0`: red

### 3.2 Filters

- **Text search**: live filter on entry title and content (case‑insensitive)
- **Tag filter**: each tag generates a button; clicking shows only entries with that tag

### 3.3 Graph ↔ Tree Relationship

```
┌─────────────────────┐     ┌───────────────────────┐
│       GRAPH         │     │        TREE           │
│  Force-directed     │     │  Section-based         │
│  Exploratory        │     │  Linear navigation    │
│  "Where are the     │     │  "What are the         │
│   red clusters?"    │     │   chapters?"          │
│  Bond = link        │     │  Bond = section       │
│  Zoom/pan/drag      │     │  Collapse/expand      │
└─────────────────────┘     └───────────────────────┘
         ↕ user toggle ↕
```

The user switches between graph and tree with a toggle (`view-graph-btn` / `view-tree-btn`). The data is the same — only the presentation changes.

## 4. Graph Evolution (Phases)

The ambitious goal: the graph must be able to **evolve dynamically** in response to:

1. **New content** (new peeragogy/unpeeragogy entries written by AI or editor)
2. **MCP interaction** (`inject-friction`, `analyze`, `tension-index` tools)
3. **User discussions** (Giscus / page comments → new unpeeragogy)

### Phase A — Static Population (in progress)

- Write unpeeragogy content for every existing slug where it is missing
- Each new unpeeragogy file enters the graph automatically on site rebuild
- `tension_index` updated via script (static pre-calculation)

**Trigger**: `git push → Coolify rebuild → new graph deployed`

### Phase B — MCP Reactivity (next)

The MCP server **instrumentalises** the graph: an AI client can call tools and receive data that the graph will display.

| MCP Tool | Effect on Graph |
|----------|------------------|
| `search(query)` | Returns slug + score — usable for highlighting nodes in the graph |
| `compare(slug)` | Returns dual‑column — usable for generating weighted edges between theory and reality |
| `analyze(slug)` | Extracts failure vectors — new tags/groups in the graph |
| `inject-friction(topic, mode)` | Produces synthesis — could generate **new unpeeragogy-only node** if friction is novel |
| `tension-index(slug)` | Updates `tension_index` — changes node radius/colour live |

The evolutionary leap: **an MCP tool that generates sufficiently high friction could create a new graph node without a site rebuild**. This requires:

1. An `/api/graph/upsert-node` endpoint on the web server (Astro API route or middleware)
2. Or alternatively: MCP Server writes to a JSON file that the client reads via browser fetch

**Open decision**: Phase B should be implemented **after** the static content is solid. Without a robust corpus, dynamic evolution produces only noise.

### Phase C — Community Feedback Loop (visionary)

```
Giscus discussion on a page
       ↓
A user reports: "this doesn't work in practice"
       ↓
The Perturbator agent (via MCP) analyses the comment
       ↓
If the comment reveals a new failure vector:
  → A draft unpeeragogy entry is created
  → The draft becomes a Draft PR on GitHub
  → The human editor validates and merges
       ↓
On next rebuild: the graph has a new red node
```

This flow is already partially implemented by the MCP + GitHub Actions architecture. Missing:

- A **friction classifier** (AI + MCP `analyze`) that decides whether a Giscus comment deserves a new entry
- A **proposition queue** (automatic Draft PR with pre-compiled template)
- A **timer** (weekly, not real-time — the graph must not oscillate on every comment)

## 5. Graph Health Metrics

The graph itself must be measurable. I propose these metrics, calculable via MCP:

| Metric | Calculation | Ideal Threshold |
|---------|---------|---------------|
| **Reality coverage** | `|unpeeragogy| / |peeragogy|` | ≥ 0.8 (80% of slugs with a reality column) |
| **Average tension** | `avg(tension_index)` across all red nodes | ≥ 0.5 (if too low, friction is fake) |
| **Edge density** | `|links| / |nodes|` | 0.8–1.2 (graph neither too sparse nor too dense) |
| **Unpeeragogy-only nodes** | `group="unpeeragogy-only"` count | ≥ 5% of total (novel friction) |
| **Red cluster** | % red nodes within 3 links of a red node | ≥ 40% (red nodes must aggregate) |

## 6. Action Plan

### Now — Content Population

1. For every peeragogy slug without a corresponding unpeeragogy → write `.mdx` file in
   `src/content/unpeeragogy/` with:
   - Same `slug`
   - Matching `title`
   - `tension_index` calculated (script or manual)
   - Body that highlights the failure/real-world practice

2. For every slug that only has unpeeragogy → write or identify the corresponding
   peeragogy theory, or leave it as `unpeeragogy-only` (red node without
   blue — pure friction).

3. Recalculate global `tension_index` with `scripts/calculate-tension-index.js`.

### Soon — Graph Refinement

1. Add **edge weighting** based on how many tags two nodes share
   (thicker link = more common tags)
2. Add **section filter** in the graph (show/hide sections)
3. Add **radial layout** for sections (Quartz option `enableRadial: true`)
4. Add **visited node highlighting** (localStorage, Quartz-style)

### Later — MCP Bridge

1. API route `/api/graph` serving updated graph data
2. MCP tool `graph-status` returning health metrics
3. MCP tool `graph-suggest-link` proposing new edges based on semantic similarity
4. Giscus webhook → MCP `inject-friction` → Draft PR

## 7. Rules of the Game

1. **No WebGL**. Ever. Canvas2D forever.
2. **No fake hubs**. Nodes represent only real entries.
3. **Red is a signal, not decoration**. Every red node must have a reason
   (a documented failure vector or tension index > 0).
4. **Unpeeragogy is core, not periphery**. Red nodes are not "errors" to ignore,
   they are the original contribution. They must be clearly visible.
5. **Population before automation**. Phase A (static content) comes before
   Phase B (MCP bridge) and Phase C (community feedback). Without content,
   the graph is just an exercise in style.
6. **Every unpeeragogy entry is an act of courage**. Documenting failures is harder
   than documenting successes. The graph reflects this: red nodes are
   larger not out of vanity, but because they weigh more.