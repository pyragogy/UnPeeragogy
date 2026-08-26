# unpeeragogy — Context & Guidelines

## Overview
Fork of the Peeragogy Handbook project — a modern Astro 5 site for reimagining peer learning documentation. 
This project will evolve independently from the original Peeragogy Handbook.

## Critical Rules
- **LOCAL WORK ONLY**: Under NO circumstances execute `git push` or push changes to remote repositories. All development, testing, builds, and previews must take place 100% locally until further notice.
- **Voice / Tone**: Clear, educational, experimental, collaborative.

## Tech Stack
- **Framework**: Astro 5.x
- **Styling**: Tailwind CSS + `@tailwindcss/typography` (`prose`)
- **Content**: Astro Content Collections (`src/content/handbook/`) converted from original `.org` files in `src/` via custom regex normalization script (`scripts/convert-org.js`).
- **Discussions**: Giscus component per main section/chapter (`src/components/SectionDiscussion.astro`).
- **Search**: Pagefind client-side search.

## Upcoming
- GitHub repo under `pyragogy` organization on GitHub.
- Separate development path from the original Peeragogy Handbook.

## Build & Preview
- `npm run dev` — Start local dev server
- `npm run build` — Build site + Pagefind search index
- `npm run preview` — Preview the built site
- `npm run convert-org` — Re-run Org-to-MDX conversion