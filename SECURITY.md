# Security Policy

## Reporting a Vulnerability

Unpeeragogy is a static site with minimal attack surface. If you discover a
security issue, please report it privately — **do not open a public issue**.

Send details to: `info@pyragogy.org` (obfuscated in HTML, clickable in rendered page).

We aim to acknowledge receipt within 48 hours and resolve critical issues
within 7 days.

## Scope

The following components are in scope for security reports:

- **Source code** in this repository (Astro pages, MCP server, scripts)
- **Dependencies** — if a known vulnerability affects a dependency used by
  the build or runtime
- **Configuration** — misconfigurations in CSP, CORS, or auth mechanisms
- **Deployment** — issues in `Dockerfile.web`, `nginx.conf`,
  `docker-compose.yaml`, or Coolify configuration

## Out of scope

- The upstream Peeragogy Handbook content (original text hosted in this repo
  under CC0 is historical material, not actively maintained for security)
- Social engineering attacks against project contributors
- Availability / DoS attacks (this is a small personal project)

## Responsible Disclosure

We ask that you give us reasonable time to fix the issue before publicly
disclosing it. We will credit you in the release notes unless you prefer
to remain anonymous.