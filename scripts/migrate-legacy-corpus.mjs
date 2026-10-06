#!/usr/bin/env node

/**
 * One-time deterministic migration of the historical UnPeeragogy corpus.
 *
 * Goal: remove schema-level "legacy" state without pretending that historical
 * interpretations have been independently verified.
 *
 * Migration semantics:
 * - integrity_level: structured
 * - epistemic_status: interpreted
 * - verification_status: unverified
 * - method_version: legacy-import-v1
 * - research_channels: [documentary]
 * - provenance: paired local Peeragogy source when a same-slug file exists;
 *   otherwise an explicit legacy-import provenance note.
 *
 * This script never assigns "verified" or "corroborated".
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const UNPEER = path.join(ROOT, "src", "content", "unpeeragogy");
const PEER = path.join(ROOT, "src", "content", "peeragogy");
const REPORT_DIR = path.join(ROOT, "research", "corpus-migration");
const REPORT = path.join(REPORT_DIR, "2026-10-06.md");

const files = fs.readdirSync(UNPEER).filter((x) => x.endsWith(".mdx")).sort();
const migrated = [];
const skipped = [];

function hasKey(fm, key) {
  return new RegExp(`^${key}:\\s*`, "m").test(fm);
}

function addScalar(fm, key, value) {
  if (hasKey(fm, key)) return fm;
  return fm.trimEnd() + `\n${key}: ${value}`;
}

for (const name of files) {
  const file = path.join(UNPEER, name);
  const raw = fs.readFileSync(file, "utf8");
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---([\s\S]*)$/);
  if (!m) throw new Error(`Missing frontmatter: ${name}`);

  let fm = m[1];
  const body = m[2];

  if (hasKey(fm, "integrity_level")) {
    skipped.push(name);
    continue;
  }

  const paired = fs.existsSync(path.join(PEER, name));

  fm = addScalar(fm, "origin", '"imported"');
  fm = addScalar(fm, "integrity_level", '"structured"');
  fm = addScalar(fm, "epistemic_status", '"interpreted"');
  fm = addScalar(fm, "verification_status", '"unverified"');
  fm = addScalar(fm, "method_version", '"legacy-import-v1"');
  fm = addScalar(fm, "research_channels", '["documentary"]');

  if (!hasKey(fm, "provenance")) {
    if (paired) {
      fm += `
provenance:
  - kind: "handbook"
    uri: "repo:src/content/peeragogy/${name}"
    locator: "paired Peeragogy source entry"
    support: "context-only"
    note: "Deterministic legacy metadata migration; paired source linkage is not independent verification."`;
    } else {
      fm += `
provenance:
  - kind: "other"
    locator: "legacy UnPeeragogy corpus import"
    support: "context-only"
    note: "No same-slug Peeragogy source file was found during deterministic migration; record remains unverified."`;
    }
  }

  fm = addScalar(fm, "synthetic_scenario", "false");

  fs.writeFileSync(file, `---\n${fm.trim()}\n---${body}`, "utf8");
  migrated.push({ name, paired });
}

fs.mkdirSync(REPORT_DIR, { recursive: true });
const pairedCount = migrated.filter((x) => x.paired).length;
const unpairedCount = migrated.length - pairedCount;

const report = `# Historical Corpus Migration — 2026-10-06

## Purpose

Complete the schema migration of the historical UnPeeragogy corpus before repository hibernation without upgrading evidential confidence.

## Deterministic policy

Every previously legacy entry migrated by this run receives:

- \`integrity_level: structured\`
- \`epistemic_status: interpreted\`
- \`verification_status: unverified\`
- \`method_version: legacy-import-v1\`
- \`research_channels: [documentary]\`
- explicit provenance

Where a same-slug Peeragogy source exists, provenance points to that local source entry as context only.

Where no same-slug source exists, the record explicitly states that the source linkage is unresolved.

**No entry is promoted to verified or corroborated by this migration.**

## Result

- Corpus entries inspected: **${files.length}**
- Entries migrated: **${migrated.length}**
- Entries already structured/verified/contested and left unchanged: **${skipped.length}**
- Migrated entries with same-slug Peeragogy source: **${pairedCount}**
- Migrated entries without same-slug Peeragogy source: **${unpairedCount}**

## Unpaired entries

${migrated.filter((x) => !x.paired).map((x) => `- \`${x.name}\``).join("\n") || "- None"}

## Interpretation

This is a metadata and provenance-structure migration, not a retrospective verification exercise.

The resulting corpus is fully schema-structured, while historical claims remain explicitly \`unverified\` unless a separate evidence review has already assigned a stronger status.
`;

fs.writeFileSync(REPORT, report, "utf8");
console.log(`Migrated ${migrated.length}/${files.length} entries; ${skipped.length} already structured.`);
console.log(`Paired source links: ${pairedCount}; unresolved same-slug links: ${unpairedCount}.`);
