# unpeeragogy — Context & Guidelines

## Vision
Unpeeragogy is the radical deconstruction of peeragogy academic theory, confronted with the naked operational reality of daily life. A dual-column reading experience: theory on the left, reality on the right.

## Architecture
- **Dual Content Collections**: `src/content/peeragogy/` (historical texts) + `src/content/unpeeragogy/` (anti-patterns, critique, operational reality), mapped by slug.
- **Dual-Column Layout**: Responsive CSS grid (`grid-cols-1 lg:grid-cols-2`) with independent scrolling and scroll sync between columns.
- **View Toggle** (Alpine.js): Three modes — Dual View (side-by-side), Solo Peeragogy (theory only), Solo Unpeeragogy (reality only).
- **Giscus**: Bound to the Unpeeragogy column only — discussions anchored to the plane of real conflict.

## Voice & Tone
- **Pattern Disruptor (Agente Perturbatore)**: A critical native entity in Unpeeragogy analysis boxes, speaking with a colloquial, complicit, sharp, anti-academic voice.
- **Tone**: Colloquial, complicit, sharp, honest, rigorously anti-academic. Zero formalism, zero caste self-referentiality.
- **Content Taxonomy**: Old theory patterns replaced with operational *Failure Patterns* (e.g., *paralyzing consensus*, *academic free-rider*, *coordination fatigue*).

## Tech Stack
- **Framework**: Astro 5.x
- **Styling**: Tailwind CSS v4 + `@tailwindcss/typography`
- **Interactivity**: Alpine.js (CDN) for view toggle, scroll sync
- **Content**: Astro Content Collections (peeragogy + unpeeragogy) converted from original `.org` files via `scripts/convert-org.js`
- **Discussions**: Giscus (`src/components/SectionDiscussion.astro`) on Unpeeragogy column
- **Search**: Pagefind client-side (indexes both collections)

## Repository
- **GitHub**: `github.com/pyragogy/unpeeragogy` (public)
- **Remote**: `origin` → `git@github.com:pyragogy/unpeeragogy.git`
- **Branch**: `main`

## Giscus Prerequisites (For Future Deployment)
1. Enable GitHub Discussions in repository settings (`Settings -> Features -> Discussions`)
2. Ensure the repository is Public
3. Install the Giscus GitHub App on the repository
4. Set Discussion Category (e.g. `Announcements` or `General`)
5. Update `src/components/SectionDiscussion.astro` with:
   - `data-repo-id` (from Giscus app installation)
   - `data-category-id` (from the Discussion category)

## Build & Preview
- `npm run dev` — Start local dev server
- `npm run build` — Build site (Astro + Pagefind)
- `npm run preview` — Preview the built site
- `npm run convert-org` — Re-run Org-to-MDX conversion
- `npm run seed-unpeeragogy` — Regenerate seed anti-pattern content