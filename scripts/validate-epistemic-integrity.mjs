#!/usr/bin/env node

/**
 * Epistemic Integrity Gate
 *
 * Static validation for the research corpus. This is intentionally separate
 * from Astro schema validation: Astro checks shape; this script checks a small
 * set of cross-field research invariants and catches dangerous overclaims.
 *
 * Existing audit-v2 entries are allowed to remain `legacy` during migration.
 * New `structured` / `verified` entries are held to the stronger contract.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CORPUS = path.join(ROOT, "src", "content", "unpeeragogy");

const ALLOWED_ORIGINS = new Set([
  "seed",
  "audit-v2",
  "field-report",
  "documentary-audit",
  "manual-revision",
  "imported",
]);

const ALLOWED_INTEGRITY = new Set(["legacy", "structured", "verified", "contested"]);
const ALLOWED_EPISTEMIC = new Set([
  "observed",
  "reported",
  "interpreted",
  "hypothesized",
  "corroborated",
  "contested",
  "revised",
]);
const ALLOWED_VERIFICATION = new Set([
  "unverified",
  "source-linked",
  "partially-supported",
  "corroborated",
  "contested",
]);

const FORBIDDEN_OVERCLAIMS = [
  {
    re: /every pattern in the handbook has been tested in the real world/i,
    why: "The corpus contains documentary stress tests and seed analyses; this wording overstates direct empirical testing.",
  },
  {
    re: /the pipeline is fully reproducible/i,
    why: "Use traceable/auditable unless the exact run inputs, prompts, model identifiers, parameters and outputs are published together.",
  },
];

function listMdx(dir) {
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => path.join(dir, name))
    .sort();
}

function frontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return { text: "", map: new Map() };
  const text = m[1];
  const map = new Map();
  for (const line of text.split("\n")) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (mm) map.set(mm[1], mm[2].trim());
  }
  return { text, map };
}

function scalar(value) {
  if (value == null) return undefined;
  return value.replace(/^['"]|['"]$/g, "").trim();
}

function bool(value) {
  return scalar(value) === "true";
}

function number(value) {
  if (value == null) return undefined;
  const n = Number(scalar(value));
  return Number.isFinite(n) ? n : undefined;
}

function inlineArrayContains(value, item) {
  if (!value) return false;
  return value
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((v) => scalar(v.trim()))
    .includes(item);
}

const errors = [];
const warnings = [];
let structuredCount = 0;
let legacyCount = 0;

for (const file of listMdx(CORPUS)) {
  const rel = path.relative(ROOT, file);
  const raw = fs.readFileSync(file, "utf8");
  const fm = frontmatter(raw);

  const origin = scalar(fm.map.get("origin") ?? "seed");
  const integrity = scalar(fm.map.get("integrity_level") ?? "legacy");
  const epistemic = scalar(fm.map.get("epistemic_status"));
  const verification = scalar(fm.map.get("verification_status"));
  const tension = number(fm.map.get("tension_index"));
  const methodVersion = scalar(fm.map.get("method_version"));
  const channelsRaw = fm.map.get("research_channels");
  const synthetic = bool(fm.map.get("synthetic_scenario"));

  if (!ALLOWED_ORIGINS.has(origin)) {
    errors.push(`${rel}: unknown origin '${origin}'`);
  }

  if (!ALLOWED_INTEGRITY.has(integrity)) {
    errors.push(`${rel}: unknown integrity_level '${integrity}'`);
  }

  if (epistemic && !ALLOWED_EPISTEMIC.has(epistemic)) {
    errors.push(`${rel}: unknown epistemic_status '${epistemic}'`);
  }

  if (verification && !ALLOWED_VERIFICATION.has(verification)) {
    errors.push(`${rel}: unknown verification_status '${verification}'`);
  }

  if (tension !== undefined && (tension < 0 || tension > 3)) {
    errors.push(`${rel}: tension_index ${tension} is outside canonical 0..3 range`);
  }

  if (integrity === "legacy") {
    legacyCount += 1;
    if (origin === "audit-v2") {
      warnings.push(`${rel}: audit-v2 entry is still legacy; migrate provenance/status before calling it research-grade`);
    }
  } else {
    structuredCount += 1;

    if (!fm.map.has("origin")) errors.push(`${rel}: ${integrity} entry must declare origin explicitly`);
    if (!epistemic) errors.push(`${rel}: ${integrity} entry requires epistemic_status`);
    if (!verification) errors.push(`${rel}: ${integrity} entry requires verification_status`);
    if (!methodVersion) errors.push(`${rel}: ${integrity} entry requires method_version`);
    if (!channelsRaw) errors.push(`${rel}: ${integrity} entry requires research_channels`);

    // Provenance is usually a multiline YAML list, so checking for the key is
    // safer here than attempting to implement a YAML parser in the validator.
    if (!/^provenance:\s*$/m.test(fm.text) && !/^provenance:\s*\[/m.test(fm.text)) {
      errors.push(`${rel}: ${integrity} entry requires provenance`);
    }
  }

  if (origin === "field-report" && !inlineArrayContains(channelsRaw, "field-report")) {
    errors.push(`${rel}: origin=field-report requires research_channels to include 'field-report'`);
  }

  if (origin === "documentary-audit" && !inlineArrayContains(channelsRaw, "documentary")) {
    errors.push(`${rel}: origin=documentary-audit requires research_channels to include 'documentary'`);
  }

  if (synthetic && !inlineArrayContains(channelsRaw, "synthetic")) {
    errors.push(`${rel}: synthetic_scenario=true requires research_channels to include 'synthetic'`);
  }

  for (const rule of FORBIDDEN_OVERCLAIMS) {
    if (rule.re.test(raw)) errors.push(`${rel}: prohibited overclaim — ${rule.why}`);
  }
}

console.log("\nEpistemic Integrity Gate");
console.log("────────────────────────");
console.log(`Corpus: ${legacyCount + structuredCount} entries`);
console.log(`Research-grade: ${structuredCount}`);
console.log(`Legacy migration queue: ${legacyCount}`);
console.log(`Warnings: ${warnings.length}`);
console.log(`Errors: ${errors.length}`);

if (warnings.length) {
  console.log("\nWarnings:");
  for (const warning of warnings.slice(0, 25)) console.log(`  ⚠ ${warning}`);
  if (warnings.length > 25) console.log(`  … ${warnings.length - 25} more migration warnings`);
}

if (errors.length) {
  console.error("\nIntegrity errors:");
  for (const error of errors) console.error(`  ✗ ${error}`);
  process.exit(1);
}

console.log("\n✓ Epistemic integrity checks passed");
