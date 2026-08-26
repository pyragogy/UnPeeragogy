/**
 * Script di pre-calcolo Tension Index
 * 
 * Questo script analizza tutti i file MDX nelle due content collections,
 * calcola il tension_index per ogni entry nella colonna Realtà,
 * e aggiorna il frontmatter YAML.
 * 
 * Usage:
 *   node scripts/calculate-tension-index.js
 * 
 * Viene eseguito automaticamente a ogni build.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = path.resolve(__dirname, "..", "src", "content");

// Known failure vectors
const KNOWN_VECTORS = [
  "free-rider",
  "consensus-paralysis",
  "premature-consensus",
  "benevolent-dictator",
  "coordination-fatigue",
  "meeting-theatre",
  "decision-evasion",
  "participation-theatre",
  "cognitive-overload",
  "responsibility-diffusion",
  "inclusivity-theatre",
  "structure-paralysis",
  "founder-syndrome",
  "documentation-illusion",
  "misaligned-incentives",
];

/**
 * Parse YAML frontmatter from MDX file
 */
function parseFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { frontmatter: {}, body: raw, raw, pre: "", post: raw };
  }

  const yamlBlock = match[1];
  const body = raw.slice(match[0].length);
  const pre = match[0];

  const title =
    yamlBlock.match(/title:\s*"([^"]+)"/)?.[1] ||
    yamlBlock.match(/title:\s*'([^']+)'/)?.[1] ||
    "";

  // Extract tags array
  const tagsMatch = yamlBlock.match(/tags:\s*(\[[\s\S]*?\])/);
  let tags = [];
  if (tagsMatch) {
    tags = tagsMatch[1]
      .replace(/[\[\]]/g, "")
      .split(",")
      .map((t) => t.trim().replace(/["']/g, ""))
      .filter(Boolean);
  }

  // Existing tension_index
  const tensionMatch = yamlBlock.match(/tension_index:\s*([\d.]+)/);
  const existingTension = tensionMatch ? parseFloat(tensionMatch[1]) : undefined;

  return {
    frontmatter: { title, tags, tension_index: existingTension },
    body,
    raw,
    pre,
    post: raw.slice(match[0].length),
    yamlBlock,
  };
}

/**
 * Calculate tension index for a file
 * Algorithm: count anti-pattern signals vs theoretical promises
 */
function calculateTension(body, tags) {
  const bodyLower = body.toLowerCase();
  const wordCount = body.split(/\s+/).length;

  // Anti-pattern signals — words indicating failure/friction
  const frictionSignals = [
    "fail", "problem", "conflict", "difficult", "hard", "impossible",
    "broken", "doesn't work", "frustrat", "uncomfortable", "tension",
    "contradict", "paradox", "stuck", "blocked", "stalled", "burnout",
    "free rider", "freeload", "inequal", "unfair", "bias", "power",
    "hierarchy", "exclusion", "silence", "invisible work", "invisible labor",
    "unpaid", "unrecognized", "marginalize", "tokenism", "performative",
  ];

  // Count anti-pattern vectors in body
  let frictionCount = 0;
  for (const signal of frictionSignals) {
    const regex = new RegExp(signal, "gi");
    const matches = bodyLower.match(regex);
    if (matches) frictionCount += matches.length;
  }

  // Normalize by word count
  const density = frictionCount / Math.max(wordCount, 100);

  // Scale tension index (0 to 2.0)
  let tensionIndex = Math.min(density * 40, 2.0);

  // Boost if vectors are present
  for (const vector of KNOWN_VECTORS) {
    if (bodyLower.includes(vector.replace(/-/g, " "))) {
      tensionIndex += 0.15;
    }
  }

  return Math.min(tensionIndex, 2.0);
}

/**
 * Update frontmatter tension_index in a file
 */
function updateTensionIndex(filePath) {
  const parsed = parseFile(filePath);
  if (!parsed.frontmatter.title) return null;

  const calculatedIndex = calculateTension(parsed.body, parsed.frontmatter.tags);
  const roundedIndex = Math.round(calculatedIndex * 100) / 100;

  const existing = parsed.frontmatter.tension_index;

  if (existing !== undefined && Math.abs(existing - roundedIndex) < 0.01) {
    return { filePath, unchanged: true, index: existing };
  }

  // Rebuild YAML frontmatter
  let yamlLines = [];
  const existingLines = parsed.yamlBlock.split("\n");
  let hasTensionField = false;

  for (const line of existingLines) {
    if (line.startsWith("tension_index:")) {
      yamlLines.push(`tension_index: ${roundedIndex}`);
      hasTensionField = true;
    } else {
      yamlLines.push(line);
    }
  }

  if (!hasTensionField) {
    // Add tension_index after order field, or at end of frontmatter
    const insertAfter = yamlLines.findIndex((l) => l.startsWith("order:") || l.startsWith("tags:"));
    if (insertAfter >= 0) {
      yamlLines.splice(insertAfter + 1, 0, `tension_index: ${roundedIndex}`);
    } else {
      yamlLines.push(`tension_index: ${roundedIndex}`);
    }
  }

  const newFrontmatter = `---\n${yamlLines.join("\n")}\n---`;
  const newContent = newFrontmatter + parsed.post;

  fs.writeFileSync(filePath, newContent, "utf-8");

  return {
    filePath,
    unchanged: false,
    oldIndex: existing ?? "N/A",
    newIndex: roundedIndex,
  };
}

// ─── Main ────────────────────────────────────────────────────

const collections = ["peeragogy", "unpeeragogy"];
const results = [];

for (const collection of collections) {
  const dirPath = path.join(CONTENT_ROOT, collection);
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    continue;
  }

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".mdx"));
  console.log(`\n📁 ${collection}/ — ${files.length} files`);

  for (const file of files.sort()) {
    const filePath = path.join(dirPath, file);
    const result = updateTensionIndex(filePath);
    if (result) {
      results.push(result);
      if (result.unchanged) {
        // Skip printing unchanged
      } else {
        console.log(
          `  ${result.unchanged ? "⏭️" : "✏️"}  ${file}: ${result.oldIndex} → ${result.newIndex}`
        );
      }
    }
  }
}

// Summary
console.log("\n═══════════════════════════════════════");
console.log(`Files analyzed: ${results.length}`);
const changed = results.filter((r) => !r.unchanged).length;
console.log(`Files updated: ${changed}`);
const avgTension =
  results
    .filter((r) => !r.unchanged)
    .reduce((sum, r) => sum + r.newIndex, 0) / Math.max(changed, 1);
console.log(`Average new tension index: ${avgTension.toFixed(2)}`);

// Collect tension by section
const sectionTensions = {};
for (const r of results) {
  if (r.unchanged) continue;
  const section = path.basename(path.dirname(r.filePath));
  if (!sectionTensions[section]) sectionTensions[section] = [];
  sectionTensions[section].push(r.newIndex);
}

console.log("\n📊 Tension by collection:");
for (const [section, indices] of Object.entries(sectionTensions)) {
  const avg = indices.reduce((a, b) => a + b, 0) / indices.length;
  const max = Math.max(...indices);
  const min = Math.min(...indices);
  console.log(`  ${section}: avg ${avg.toFixed(2)} | min ${min.toFixed(2)} | max ${max.toFixed(2)}`);
}

console.log("\n✅ Done.");