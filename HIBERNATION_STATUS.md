# UnPeeragogy — Hibernation Status

**Date:** 2026-10-06  
**State:** **HIBERNATION-READY**

This file records the repository state at the end of the October 2026 maintenance and scientific-audit cycle.

## Operational status

- Default branch: `main`
- Public site: deployed through Coolify
- MCP service: deployed through Coolify
- Open issues: 0
- Open pull requests: 0
- FUP-001: concluded and preserved in `fup-001/formal-kernel`, not merged
- Monthly Scientific Audit: active
- Final Maintenance Pass: successful

## Build and validation

The final maintenance workflow validates:

- root/site dependency installation;
- MCP dependency installation;
- epistemic integrity gate;
- full Astro static build;
- SEO generation;
- Pagefind indexing;
- MCP TypeScript build;
- dependency security gate;
- historical corpus migration;
- direct Coolify deployment for web and MCP.

The maintenance pass completed successfully before hibernation.

## Corpus migration

Historical UnPeeragogy corpus:

- entries inspected: **88**
- migrated from legacy schema: **87**
- already structured before migration: **1**
- final schema state: **88/88 structured or stronger**
- migrated entries with same-slug Peeragogy provenance link: **84**
- unresolved same-slug provenance links: **3**

Unpaired entries:

- `cooperate.mdx`
- `cooperation-where-it-works.mdx`
- `newcomer-where-it-works.mdx`

The migration is structural only. It does not retroactively upgrade evidential confidence.

Default migrated state:

- `epistemic_status: interpreted`
- `verification_status: unverified`
- `method_version: legacy-import-v1`

## Dependency security

Final audit:

| Surface | Low | Moderate | High | Critical |
|---|---:|---:|---:|---:|
| Site/root | 0 | 2 | 0 | 0 |
| MCP server | 0 | 4 | 0 | 0 |

### Accepted residual moderate advisories

#### Site/root

`@tailwindcss/typography -> postcss-selector-parser`

Advisory: quadratic selector parsing may allow CPU exhaustion.

npm's proposed forced remediation installs an older `@tailwindcss/typography@0.5.4`, which is a breaking downgrade. The current patched Astro 7/Tailwind 4 build passes and no high/critical vulnerability remains.

Decision: **accept and document; do not force downgrade before hibernation.**

#### MCP

`gray-matter -> js-yaml -> argparse -> sprintf-js`

Advisory: unbounded precision specifiers may allow denial of service.

npm's proposed forced remediation installs `gray-matter@2.0.1`, a breaking downgrade.

Decision: **accept and document; do not force downgrade before hibernation.**

These advisories should be rechecked when the repository is reactivated.

## Framework/toolchain state

- Astro: 7.x
- MDX integration: 8.x
- Tailwind: 4.x
- Tailwind Vite integration: official `@tailwindcss/vite`
- Node target in Actions: 22
- Astro content consumers migrated to Content Layer `id` semantics
- local `src/icons/` directory retained to avoid astro-icon missing-directory warnings

## Scientific/research state

The project now uses **Monthly Scientific Audit** as the primary continuity mechanism.

FUP-001 final verdict:

**OUTCOME B — INTERESTING BUT INCOMPLETE**

No manuscript is authorized from FUP-001 in its current state.

The formal branch is preserved as research evidence and should not be merged wholesale.

## Resume checklist

When UnPeeragogy is reactivated:

1. run the latest GitHub Actions on `main`;
2. run `npm audit` in root and `packages/mcp-server`;
3. review whether the six documented moderate transitive advisories have upstream fixes;
4. check Astro/Tailwind breaking-change notes before upgrades;
5. inspect new discussions/candidate evidence;
6. create the next Monthly Scientific Audit;
7. open a new formal research track only if a concrete audit question requires it.

## Hibernation rule

Do not modify historical epistemic statuses merely to make the repository look cleaner.

The repository is intentionally left with explicit uncertainty where verification has not occurred.

**Status: ready for hibernation.**
