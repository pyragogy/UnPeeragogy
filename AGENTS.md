# Unpeeragogy — Context & Guidelines

## Epistemic Position

Unpeeragogy is not a commentary on the Peeragogy Handbook. It is a **validation protocol for social knowledge**.

The question it answers is simple and devastating: *what happens to a theory when it leaves the room where it was written?*

Most social knowledge exists as **theory without validation** — patterns written by people who had time to write them, tested by people who had time to test them, generalised far beyond the context where they were observed. Peeragogy is rich in good intentions. It has zero systematic feedback loops. Unpeeragogy builds that loop from scratch.

The core methodological innovation is this: **theory and operational reality are presented as structurally equivalent columns.** Not commentary. Not footnotes. A second column with the same typographic weight, the same navigability, the same right to be wrong. This epistemic dualism — treating lived experience as a valid knowledge category, not as anecdotal evidence below the fold — is the architectural statement of the project.

## Methodological Innovation

**1. Critical Incident Technique as validation protocol** (`share-your-story.yml`)
Instead of asking "does this confirm or contradict the theory?" (which requires already being inside the theory), the CIT form asks: what happened, what did you try, what surprised you, what would you tell someone about to try this? This inverts the epistemic burden: **the theory is responsible to the experience**, not the other way around.

**2. Two-tier discussion infrastructure** (`structural-analysis.yml`)
For contributors who are already inside the framework, a structured analysis form with position (Confirms/Extends/Contradicts/Question) and optional suggested-impact. The key design choice: **the final call on impact (tension_index, Failure Vector, Perturbator sharpness) stays in review, not on the contributor**. The framework never outsources editorial judgment to whoever happens to show up.

**3. Dual-audience access without gating**
Newcomers and analysts share the same category (`field-reports`), the same URL, the same repository. The template picker differentiates the entry point, not the access. This means **no sign-up friction, no "you need to understand tension_index first"** — the social contract is: *tell us what happened, we'll figure out the rest.*

**4. Failure patterns as stable knowledge objects**
Best practices are fragile — they depend on context, timing, and the people who wrote them. **Failure patterns are more stable.** A pattern that failed under known conditions is more predictive than a pattern that worked once and was never stress-tested. The tension_index quantifies this: how much friction has been observed between a theoretical pattern and operational reality.

**5. The Perturbator as critical function**
The *Agente Perturbatore* (Pattern Disruptor) is not a chatbot. It is a **systematic friction injector** embedded in the content layer. Every analysis box ends with a native critical voice that complicates, undermines, and sharpens the theoretical claim. This is structural, not decorative: the Perturbator is the project's immune system against academic drift.

**6. Knowledge graph (Vault) with tension-weighted edges**
The Vault maps every pattern as a node, every observed friction as a weighted edge. The tension_index determines node size. The graph is queryable both visually (d3-force, bundled from node_modules, no CDN) and programmatically (MCP server). This is the first AI-native knowledge base built on **validated social friction**, not on consensus.

## Architecture

- **Dual Content Collections**: `src/content/peeragogy/` (historical texts, CC0) + `src/content/unpeeragogy/` (failure patterns, analysis, operational reality), mapped by slug
- **Dual-Column Layout**: Responsive CSS grid (`grid-cols-1 lg:grid-cols-2`) with scroll sync and independent scrolling
- **View Toggle** (Alpine.js, SRI-pinned): Three modes — Dual View, Solo Peeragogy, Solo Unpeeragogy
- **Field-Report System**: Two YAML templates (share-your-story + structural-analysis), category `field-reports`, labels for filtering
- **Knowledge Graph** (Vault): d3-force bundled, tension-weighted nodes, tree + graph views, section palette filters
- **MCP Server**: Exposes resources, tools (`inject-friction`, `tension-index`), authentication via Authorization: Bearer, fail-secure
- **Search**: Pagefind client-side (indexes both collections, detects `en`)
- **Analytics**: Plausible self-hosted (no cookies, no profiling)

## Voice & Tone

- **Pattern Disruptor (Perturbator)**: Native critical entity in Unpeeragogy analysis boxes. Colloquial, complicit, sharp, anti-academic. Speaks in operational reality, not theoretical abstraction.
- **Content Tone**: Clear, honest, zero formalism. The site speaks to someone who tried something and it didn't work, not to someone evaluating a contribution.
- **Content Taxonomy**: Failure Patterns, not Best Practices. Tension_index, not consensus. Field Reports, not comments.

## The Innovation in Context

The landscape of social knowledge validation today:
- **Academic peer review** — slow, gatekept, produces consensus that lags reality by 3-5 years
- **Social media** — fast, unstructured, produces noise without systematic learning
- **Wikis** — structured, low-friction, but optimised for consensus, not for capturing failed experiments
- **GitHub Issues** — good for bug reports, not for epistemic contribution

Unpeeragogy occupies a **new quadrant**: structured, asynchronous, friction-optimised, with dual-audience access. It treats operational reality as a **valid knowledge contribution**, not as anecdote. It is designed to **fail informatively** — every field report that contradicts a pattern is more valuable than one that confirms it.

This is the first project, to our knowledge, that:
- Uses **Critical Incident Technique** as a discussion template for social knowledge validation
- Encodes **failure patterns** as first-class knowledge objects with quantified tension
- Wires a **knowledge graph** dynamically weighted by observed friction
- Exposes the whole via **MCP protocol** for AI-native querying
- Does all of this with **zero venture capital, zero tracking, zero academic affiliation**

## Repository

- **GitHub**: `github.com/pyragogy/unpeeragogy` (public)
- **Remote**: `origin` → `git@github.com:pyragogy/unpeeragogy.git`
- **Branch**: `main`
- **Tagged releases**: `v0.1.0` (pre-launch audit), `v1.0` (launch)

## Build & Preview

- `npm run dev` — Local dev server
- `npm run build` — Build site (Astro + Pagefind)
- `npm run preview` — Preview the built site
- `npm run convert-org` — Org-to-MDX conversion (legacy)
- `npm run seed-unpeeragogy` — Regenerate seed anti-pattern content
- `npx @pyragogy/mcp-server --setup --token <TOKEN>` — Configure MCP for Claude Desktop / pi

## Prerequisites for Giscus (Future)

Giscus embedding is not yet active. The system currently uses GitHub Discussions directly (external links, not embedded iframes). If embedded comments are desired later:
1. Ensure repository is Public with Discussions enabled
2. Install Giscus GitHub App
3. Set Discussion Category (recommended: `Field reports`)
4. Update `src/components/SectionDiscussion.astro` with `data-repo-id` and `data-category-id`

The current design intentionally prefers **external linking** over embedding — lower maintenance, no moderation burden, and the link to GitHub Discussions shows repository activity even when no one is commenting.