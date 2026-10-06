#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

const root = read(".maintenance-root-audit.json");
const mcp = read(".maintenance-mcp-audit.json");

function counts(audit) {
  const v = audit.metadata?.vulnerabilities ?? {};
  return {
    low: v.low ?? 0,
    moderate: v.moderate ?? 0,
    high: v.high ?? 0,
    critical: v.critical ?? 0,
    total: v.total ?? 0,
  };
}

const r = counts(root);
const m = counts(mcp);
const out = `# Repository Maintenance Audit — 2026-10-06

## Scope

Final maintenance pass before planned project hibernation.

Checks performed:

- non-breaking \`npm audit fix\` on the public site;
- non-breaking \`npm audit fix\` on the MCP package;
- full Astro build and epistemic integrity gate;
- MCP type-check/build;
- historical corpus schema migration;
- high/critical vulnerability gate.

## Dependency audit after fixes

| Package surface | Low | Moderate | High | Critical | Total |
|---|---:|---:|---:|---:|---:|
| Site/root | ${r.low} | ${r.moderate} | ${r.high} | ${r.critical} | ${r.total} |
| MCP server | ${m.low} | ${m.moderate} | ${m.high} | ${m.critical} | ${m.total} |

The maintenance workflow fails if either package surface retains a high or critical vulnerability.

## Corpus

See \`research/corpus-migration/2026-10-06.md\` for the deterministic metadata migration report.

## Status

This report records the automated maintenance state. A final hibernation checkpoint is written only after all GitHub Actions complete successfully.
`;

fs.mkdirSync(path.join(ROOT, "research", "maintenance"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "research", "maintenance", "2026-10-06.md"), out, "utf8");
