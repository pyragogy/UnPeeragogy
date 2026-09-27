#!/usr/bin/env node

/**
 * ingest-field-report.mjs — Normalize a practitioner field report
 * into a CandidateEvidence artifact for human review.
 *
 * Acquisition channel: practitioner
 * Processing status:   CANDIDATE (not yet ENGINE_PASSED)
 * Human review:        PENDING (automation never sets decision states)
 *
 * Supports:
 *   - Structured CIT (conforms to share-your-story.yml template)
 *   - Unstructured CIT (narrative only) → MANUAL_EXTRACTION_REQUIRED
 *
 * Usage:
 *   node scripts/ingest-field-report.mjs \
 *     --discussion 7 \
 *     [--dry-run]
 *
 *   node scripts/ingest-field-report.mjs \
 *     --fixture ./test/fixtures/discussion-structured.txt \
 *     [--token ghp_xxx]
 *
 * Environment:
 *   GITHUB_TOKEN          — Required for --discussion mode
 *   INGEST_CANDIDATES_DIR — Override candidate output dir (default: runs/candidates)
 *   INGEST_LEDGER_PATH    — Override ledger path (default: runs/human-review-ledger.yaml)
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const CANDIDATES_DIR = process.env.INGEST_CANDIDATES_DIR || path.resolve(REPO_ROOT, "runs", "candidates");
const LEDGER_PATH = process.env.INGEST_LEDGER_PATH || path.resolve(REPO_ROOT, "runs", "human-review-ledger.yaml");

// ─── Helpers ──────────────────────────────────────────────────

function nowISO() {
  return new Date().toISOString();
}

function pad(num, width = 3) {
  return String(num).padStart(width, "0");
}

/**
 * Detect if a discussion body follows the share-your-story.yml template
 * by checking for the structured field markers.
 */
function detectStructure(body) {
  const hasEntrySlug = /### Which pattern is this about(?:\?)?\s*\n/.test(body) ||
                       /entry-slug/.test(body);
  const hasRelationDropdown = /### Optional: how does this compare/.test(body) ||
                              /relation-to-theory/.test(body);
  const hasObserverRole = /### Your relationship to the event/.test(body) ||
                           /observer-role/.test(body);

  return {
    isStructured: hasEntrySlug && hasRelationDropdown,
    hasEntrySlug,
    hasRelationDropdown,
    hasObserverRole,
  };
}

/**
 * Extract the target slug from a structured discussion body.
 */
function extractSlug(body) {
  // Try to find the answer after "Which pattern is this about?"
  const slugMatch = body.match(/### Which pattern is this about\??\s*\n\s*([a-z0-9_-]+)/i);
  if (slugMatch) return slugMatch[1].toLowerCase();

  // Try YAML-style field
  const fieldMatch = body.match(/entry-slug[:\s]+([a-z0-9_-]+)/i);
  if (fieldMatch) return fieldMatch[1].toLowerCase();

  return null;
}

/**
 * Extract the relation-to-theory value to determine phenomenon_type.
 */
function extractPhenomenonType(body) {
  const relationMap = {
    "matched what the pattern describes": "confirming",
    "went differently than the pattern describes": "complicating",
    "somewhere in between": "complicating",
    "skip this": null,
  };

  // Try dropdown answer
  const relationMatch = body.match(
    /### Optional: how does this compare[^]*?\n\s*(-\s*)?\[x\]\s*(.+?)(?:\n|$)/
  );
  if (relationMatch) {
    const answer = relationMatch[2].trim().toLowerCase();
    for (const [key, val] of Object.entries(relationMap)) {
      if (answer.includes(key)) return val;
    }
  }

  return null;
}

/**
 * Extract the "What happened" section for the claim.
 */
function extractClaim(body) {
  const claimMatch = body.match(/### What happened[^]*?\n\s*([^]+?)(?=\n### |\n---|$)/);
  if (claimMatch) {
    return claimMatch[1].trim().slice(0, 300) + (claimMatch[1].trim().length > 300 ? "..." : "");
  }
  return null;
}

/**
 * Extract the "The situation" / "context" section.
 */
function extractContext(body) {
  const ctxMatch = body.match(/### The situation\s*\n\s*([^]+?)(?=\n### |\n---|$)/i);
  if (ctxMatch) return ctxMatch[1].trim().slice(0, 200);
  return null;
}

/**
 * Extract observer role.
 */
function extractObserverRole(body) {
  const roleMatch = body.match(
    /### Your relationship to the event[^]*?\n\s*(-\s*)?\[x\]\s*(.+?)(?:\n|$)/i
  );
  if (roleMatch) return roleMatch[2].trim();
  return null;
}

/**
 * Extract the body author from Discussion metadata (title/preamble).
 * For unstructured, tries to find the title.
 */
function extractAuthor(body, discussion) {
  // If we have discussion metadata with author
  if (discussion?.author?.login) return discussion.author.login;
  return "unknown";
}

// ─── Discussion fetching ─────────────────────────────────────

async function fetchDiscussion(number, token) {
  const query = `query {
    repository(owner: "pyragogy", name: "UnPeeragogy") {
      discussion(number: ${number}) {
        number
        title
        body
        createdAt
        url
        category { name }
        labels(first: 10) { nodes { name } }
        author { login }
      }
    }
  }`;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();
  const discussion = data?.data?.repository?.discussion;
  if (!discussion) {
    throw new Error(`Discussion #${number} not found: ${JSON.stringify(data.errors || data)}`);
  }
  return discussion;
}

// ─── Candidate generation ────────────────────────────────────

async function generateCandidate(discussion, body) {
  const structure = detectStructure(body);
  const slug = extractSlug(body);
  const phenomenonType = extractPhenomenonType(body);
  const claim = extractClaim(body);
  const context = extractContext(body);
  const observerRole = extractObserverRole(body);
  const author = extractAuthor(body, discussion);

  // Generate candidate ID from next available
  const nextId = getNextCandidateId();

  const candidate = {
    id: nextId,
    acquisition_channel: "practitioner",
    processing_status: "CANDIDATE",
    human_review: {
      status: "PENDING",
      reviewer: null,
      decision_date: null,
      rationale: null,
      review_ledger_id: `REV-${pad(parseInt(nextId.replace("CAN-", ""), 10))}`,
      resulting_action: null,
    },
    source: {
      type: "github_discussion",
      uri: discussion?.url || `https://github.com/pyragogy/UnPeeragogy/discussions/${discussion?.number || "??"}`,
      retrieved_at: nowISO(),
      title: discussion?.title || null,
    },
    provenance: {
      author: author,
      date: discussion?.createdAt || nowISO(),
      context: context || "First-person practitioner report",
    },
    content: {
      claim: claim || (structure.isStructured ? "(extraction failed)" : "Unstructured CIT — requires manual extraction"),
      phenomenon_type: phenomenonType || "complicating",
      summary: (claim || body || "").slice(0, 200),
      entity_name: slug || null,
      entity_year: null,
      domain: "peer-learning",
      tags: [slug || "uncategorized", "field-report"],
    },
    target_nodes: slug ? [slug] : [],
    grounding: {
      grounded_in_source: true,
      source_ref: discussion?.url || "practitioner-report",
      entity_anchor: !!slug,
      verification_note: null,
    },
    engine_output: {
      plausibility_score: null,
      noise_estimate: null,
      verdict: null,
      tension_delta_proposed: null,
      engine_run_id: null,
    },
    created_at: nowISO(),
    updated_at: nowISO(),
  };

  // Add structure detection warning
  if (!structure.isStructured) {
    candidate.grounding.verification_note =
      "MANUAL_EXTRACTION_REQUIRED — non-structured CIT (narrative report, no template fields detected). " +
      "Human reviewer must extract slug, phenomenon_type, and claim manually.";
  }

  return candidate;
}

function getNextCandidateId() {
  const dir = CANDIDATES_DIR;
  if (!fs.existsSync(dir)) return "CAN-001";

  const files = fs.readdirSync(dir).filter((f) => f.startsWith("CAN-") && f.endsWith(".yaml"));
  if (files.length === 0) return "CAN-001";

  const nums = files.map((f) => {
    const m = f.match(/CAN-(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  });
  const max = Math.max(...nums, 0);
  return `CAN-${pad(max + 1)}`;
}

// ─── Persistence ──────────────────────────────────────────────

function writeCandidate(candidate) {
  fs.mkdirSync(CANDIDATES_DIR, { recursive: true });

  const filePath = path.join(CANDIDATES_DIR, `${candidate.id}.yaml`);
  const yamlContent = toYaml(candidate);
  fs.writeFileSync(filePath, yamlContent, "utf-8");
  return filePath;
}

function appendToLedger(candidate, note) {
  // Build a new ledger entry
  const entry = {
    review_id: candidate.human_review.review_ledger_id,
    candidate_id: candidate.id,
    acquisition_channel: candidate.acquisition_channel,
    processing_status: candidate.processing_status,
    target_node: candidate.target_nodes[0] || "unknown",
    proposed_valence: candidate.content.phenomenon_type,
    source_description: candidate.source.title || candidate.provenance.context || "Field report",
    source_url: candidate.source.uri,
    engine_output_ref: null,
    human_status: "PENDING",
    reviewer: null,
    decision_timestamp: null,
    rationale: note || null,
    resulting_action: null,
  };

  // Read existing ledger
  let ledger = { ledger: [] };
  if (fs.existsSync(LEDGER_PATH)) {
    const existing = fs.readFileSync(LEDGER_PATH, "utf-8");
    // Simple YAML-like parse (we maintain exact format)
    const match = existing.match(/^ledger:\n(?:  - .*\n?)*/m);
    // Better: just append
    ledger = parseLedger(existing);
  }

  ledger.ledger.push(entry);

  const yamlContent = toLedgerYaml(ledger.ledger);
  fs.writeFileSync(LEDGER_PATH, yamlContent, "utf-8");
}

function parseLedger(yaml) {
  // Simple line-based parse for YAML list
  const entries = [];
  const lines = yaml.split("\n");
  let current = null;

  for (const line of lines) {
    if (line.match(/^  - review_id:/)) {
      if (current) entries.push(current);
      current = { review_id: line.split(":")[1].trim().replace(/"/g, "") };
    } else if (current && line.match(/^\s{4,}\w+:/)) {
      const [key, ...rest] = line.trim().split(":");
      const val = rest.join(":").trim().replace(/"/g, "");
      current[key] = val === "null" ? null : val;
    }
  }
  if (current) entries.push(current);

  return { ledger: entries };
}

function toYaml(obj, indent = 0) {
  const pad = " ".repeat(indent);
  let out = "";
  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) {
      out += `${pad}${key}: null\n`;
    } else if (typeof val === "object" && !Array.isArray(val)) {
      out += `${pad}${key}:\n${toYaml(val, indent + 2)}`;
    } else if (Array.isArray(val)) {
      out += `${pad}${key}:\n`;
      for (const item of val) {
        if (typeof item === "object") {
          out += `${pad}  - \n${toYaml(item, indent + 4)}`;
        } else {
          out += `${pad}  - ${JSON.stringify(item)}\n`;
        }
      }
    } else if (typeof val === "string") {
      out += `${pad}${key}: "${val.replace(/"/g, "'")}"\n`;
    } else {
      out += `${pad}${key}: ${val}\n`;
    }
  }
  return out;
}

function toLedgerYaml(entries) {
  let out = "# Human Review Ledger — UnPeeragogy\n";
  out += "# Auto-generated PENDING entry. Human must set status.\n";
  out += "# See file header for state definitions.\n\n";
  out += "ledger:\n";

  for (const e of entries) {
    out += `  - review_id: "${e.review_id}"\n`;
    out += `    candidate_id: "${e.candidate_id}"\n`;
    out += `    acquisition_channel: "${e.acquisition_channel}"\n`;
    out += `    processing_status: "${e.processing_status}"\n`;
    out += `    target_node: "${e.target_node}"\n`;
    out += `    proposed_valence: "${e.proposed_valence}"\n`;
    out += `    source_description: "${(e.source_description || "").replace(/"/g, "'")}"\n`;
    out += `    source_url: "${e.source_url}"\n`;
    out += `    engine_output_ref: ${e.engine_output_ref ? `"${e.engine_output_ref}"` : null}\n`;
    out += `    human_status: "${e.human_status}"\n`;
    out += `    reviewer: ${e.reviewer ? `"${e.reviewer}"` : "null"}\n`;
    out += `    decision_timestamp: ${e.decision_timestamp ? `"${e.decision_timestamp}"` : "null"}\n`;
    out += `    rationale: ${e.rationale ? `"${e.rationale.replace(/"/g, "'")}"` : "null"}\n`;
    out += `    resulting_action: ${e.resulting_action ? `"${e.resulting_action}"` : "null"}\n`;
    out += "\n";
  }

  return out;
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const discussionIdx = args.indexOf("--discussion");
  const fixtureIdx = args.indexOf("--fixture");
  const isDryRun = args.includes("--dry-run");
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

  let discussion = null;
  let body = "";

  // Phase 2: Read input
  if (discussionIdx >= 0) {
    const number = parseInt(args[discussionIdx + 1], 10);
    if (!token) {
      console.error("❌ GITHUB_TOKEN environment variable required for --discussion mode");
      process.exit(1);
    }
    discussion = await fetchDiscussion(number, token);
    body = discussion.body;
    if (!body) throw new Error(`Discussion #${number} has no body`);
  } else if (fixtureIdx >= 0) {
    const fixturePath = path.resolve(REPO_ROOT, args[fixtureIdx + 1]);
    body = fs.readFileSync(fixturePath, "utf-8");
    discussion = { number: 0, title: "FIXTURE", url: "fixture://local", createdAt: nowISO(), author: { login: "fixture" } };
  } else {
    console.error("Usage: node scripts/ingst-field-report.mjs --discussion <number> [--dry-run]");
    console.error("       node scripts/ingst-field-report.mjs --fixture <path> [--dry-run]");
    process.exit(1);
  }

  // Phase 3: Generate candidate
  const candidate = await generateCandidate(discussion, body);

  // Phase 4: Structure detection
  const structure = detectStructure(body);
  const warning = !structure.isStructured ? " ⚠️  UNSTRUCTURED — requires manual extraction" : "";

  // Output summary
  console.log(`\n📄 Candidate: ${candidate.id}${warning}`);
  console.log(`   Target:     ${candidate.target_nodes[0] || "(unknown — manual extraction required)"}`);
  console.log(`   Valence:    ${candidate.content.phenomenon_type || "(unknown — manual)"}`);
  console.log(`   Source:     #${discussion.number || "fixture"} — ${discussion.title || "(no title)"}`);
  console.log(`   Channel:    ${candidate.acquisition_channel}`);
  console.log(`   Status:     ${candidate.processing_status}`);
  console.log(`   Review:     ${candidate.human_review.status}`);
  console.log(`   Claim:      ${(candidate.content.claim || "(none)").slice(0, 100)}...`);

  // Print full candidate in dry-run mode
  if (isDryRun) {
    console.log("\n--- Candidate YAML ---");
    console.log(toYaml(candidate));
    console.log("--- END ---\n");
    console.log("ℹ️  Dry-run mode — nothing was written to disk.");
    return;
  }

  // Phase 5: Persist (never writes human decision states)
  // Automation only sets PENDING. Human must set ACCEPTED/REJECTED/etc.
  if (candidate.human_review.status !== "PENDING") {
    throw new Error(
      `Automation tried to set human_review.status='${candidate.human_review.status}'. ` +
      "Only PENDING is allowed. Human must set decision states."
    );
  }

  // Write candidate file
  fs.mkdirSync(CANDIDATES_DIR, { recursive: true });
  const candidatePath = writeCandidate(candidate);
  console.log(`   ✅ Candidate written: ${path.relative(REPO_ROOT, candidatePath)}`);

  // Append to ledger (only PENDING)
  const note = !structure.isStructured
    ? "MANUAL_EXTRACTION_REQUIRED — non-structured practitioner report"
    : null;
  appendToLedger(candidate, note);
  console.log(`   ✅ Ledger entry created: ${candidate.human_review.review_ledger_id} (PENDING)`);

  if (structure.isStructured) {
    console.log(`\n   ✅ Structured CIT — fields parsed successfully.`);
  } else {
    console.log(`\n   ⚠️  Unstructured CIT — set to MANUAL_EXTRACTION_REQUIRED.`);
    console.log(`   Human reviewer must extract: slug, phenomenon_type, claim.`);
  }

  console.log(`\n📋 Summary:`);
  console.log(`   Candidate:    runs/candidates/${candidate.id}.yaml`);
  console.log(`   Ledger:       runs/human-review-ledger.yaml`);
  console.log(`   Review ID:    ${candidate.human_review.review_ledger_id}`);
  console.log(`   Status:       ${candidate.processing_status} → ${candidate.human_review.status}`);
  console.log(`\n⚠️  This candidate has NOT entered the validated corpus.`);
  console.log(`   Gate A (human review) required for promotion.`);
}

main().catch((err) => {
  console.error("❌", err.message || err);
  process.exit(1);
});