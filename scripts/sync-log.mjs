/**
 * sync-log.mjs — Generate a monthly log entry
 *
 * Collects:
 * 1. Active GitHub discussions tagged "discussione"
 * 2. Entries modified in the last month (git log)
 * 3. Graph metrics (from dist/api/graph.json or recalculated)
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx node scripts/sync-log.mjs
 *
 * Output:
 *   src/content/log/YYYY-MM.mdx
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_LOG = path.resolve(__dirname, "..", "src", "content", "log");
const GRAPH_JSON = path.resolve(__dirname, "..", "dist", "api", "graph.json");
const MONTHLY_AUDITS = path.resolve(__dirname, "..", "research", "monthly-audits");

// ─── Helpers ──────────────────────────────────────────────────

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: "utf-8", ...opts }).trim();
  } catch {
    return "";
  }
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ─── 1. GitHub Discussions ────────────────────────────────────

async function getActiveDiscussions(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };

  // Query discussions with "discussione" label (kept as is for consistency)
  const query = `query {
    repository(owner: "pyragogy", name: "UnPeeragogy") {
      discussions(orderBy: {field: CREATED_AT, direction: DESC}, first: 50) {
        nodes {
          number
          title
          createdAt
          comments { totalCount }
          labels(first: 10) { nodes { name } }
          category { name }
          body
        }
      }
    }
  }`;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    const discussions = data?.data?.repository?.discussions?.nodes || [];
    return discussions.filter((d) => {
      const labels = d.labels?.nodes?.map((l) => l.name) || [];
      return labels.includes("field-reports");
    });
  } catch (e) {
    console.error("⚠️  GitHub API error:", e.message);
    return [];
  }
}

// ─── 2. Git changes in last month ──────────────────────────

function getRecentChanges() {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const since = oneMonthAgo.toISOString().split("T")[0];

  const log = run(`git log --since="${since}" --oneline --name-only`);
  if (!log) return { commits: 0, files: [], entries: [] };

  const lines = log.split("\n");
  const commits = lines.filter((l) => /^[0-9a-f]{7}\s/.test(l)).length;
  const files = lines
    .filter((l) => l.startsWith("src/content/unpeeragogy/") && l.endsWith(".mdx"))
    .map((f) => f.replace("src/content/unpeeragogy/", "").replace(".mdx", ""));
  const unique = [...new Set(files)];

  return { commits, files: unique, entries: unique };
}

// ─── 3. Graph metrics ──────────────────────────────────────

function getGraphMetrics() {
  try {
    const raw = fs.readFileSync(GRAPH_JSON, "utf-8");
    const g = JSON.parse(raw);
    return g.metrics || {};
  } catch {
    return { nodeCount: 0, linkCount: 0, avgTension: 0, coverage: 0, density: 0, totalWords: 0 };
  }
}

function getTotalWords() {
  let total = 0;
  const dir = path.resolve(__dirname, "..", "src", "content", "unpeeragogy");
  if (!fs.existsSync(dir)) return 0;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".mdx")) continue;
    const content = fs.readFileSync(path.join(dir, f), "utf-8");
    const body = content.startsWith("---") ? content.split("---", 2)[2] || "" : content;
    total += body.split(/\s+/).filter(Boolean).length;
  }
  return total;
}

function getMonthlyAudit(month) {
  const auditPath = path.join(MONTHLY_AUDITS, `${month}.md`);
  if (!fs.existsSync(auditPath)) return "";
  return fs.readFileSync(auditPath, "utf-8").trim();
}

// ─── 4. Generate markdown entry ────────────────────────────

function parseLedgerYamlSimple(content) {
  // Simple parser for the review ledger format
  const entries = [];
  const lines = content.split("\n");
  let current = null;

  for (const line of lines) {
    if (line.match(/^\s{2}- review_id:/)) {
      if (current) entries.push(current);
      current = { review_id: line.split(":")[1].trim().replace(/"/g, "") };
    } else if (current && line.match(/^\s{4}\w+:/)) {
      const [key, ...rest] = line.trim().split(":");
      const val = rest.join(":").trim().replace(/"/g, "");
      current[key] = val === "null" ? null : val;
    }
  }
  if (current) entries.push(current);
  return entries;
}

function getPendingReviews() {
  const ledgerPath = path.resolve(__dirname, "..", "runs", "human-review-ledger.yaml");
  if (!fs.existsSync(ledgerPath)) return [];

  const content = fs.readFileSync(ledgerPath, "utf-8");
  const entries = parseLedgerYamlSimple(content);

  // Return only PENDING entries
  return entries.filter((e) => e.human_status === "PENDING");
}

function generateMarkdown({ month, discussions, changes, metrics, assessments, monthlyAudit }) {
  const discussionCount = discussions.length;
  const sortedDiscussions = discussions.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const yaml = `---
title: "Month ${month}"
month: "${month}"
description: "Monthly review — ${discussionCount} active discussions, ${changes.entries.length} entries modified, ${changes.commits} commits."
metrics:
  nodeCount: ${metrics.nodeCount}
  linkCount: ${metrics.linkCount}
  avgTension: ${metrics.avgTension}
  coverage: ${metrics.coverage}
  density: ${metrics.density}
  totalWords: ${metrics.totalWords || 0}
  discussionsActive: ${discussionCount}
changes:
${changes.items.map((c) => `  - type: ${c.type}\n    description: "${c.description}"${c.detail ? `\n    detail: "${c.detail}"` : ""}`).join("\n")}
assessments:${(assessments || []).length === 0 ? " []" : "\n" + (assessments || []).map((a) => `  - discussion: ${a.discussion}
    candidate_id: "${a.candidate_id}"
    review_id: "${a.review_id}"
    slug: "${a.slug}"
    template: "${a.template}"
    proposed_valence: "${a.proposed_valence}"
    acquisition_channel: "${a.acquisition_channel}"
    processing_status: "${a.processing_status}"
    review_status: "${a.review_status}"
    requires_manual_extraction: ${a.requires_manual_extraction}
    source_url: "${a.source_url}"`).join("\n")}

buildTimestamp: "${new Date().toISOString()}"
---`;

  let body = `## Monthly Summary\n\n`;
  body += `**${changes.commits} commits** on **${changes.entries.length} entries** modified.\n`;
  body += `**${discussionCount} active discussions** on GitHub.\n\n`;

  // Discussions section
  if (sortedDiscussions.length > 0) {
    body += `### 💬 Active Discussions\n\n`;
    for (const d of sortedDiscussions) {
      body += `- **#${d.number}** — ${d.title} (${d.comments?.totalCount || 0} commenti)\n`;
    }
    body += "\n";
  }

  // Changes section
  const types = { discussion: "💬 Discussions", entry: "✏️ Modified Entries", graph: "🕸️ Graph", decision: "⚡ Decisions" };
  for (const [type, label] of Object.entries(types)) {
    const typeChanges = changes.items.filter((c) => c.type === type);
    if (typeChanges.length === 0) continue;
    body += `### ${label}\n\n`;
    for (const c of typeChanges) {
      body += `- **${c.description}**`;
      if (c.detail) body += ` — ${c.detail}`;
      body += "\n";
    }
    body += "\n";
  }

  // Review Queue section
  if (assessments && assessments.length > 0) {
    body += `### 📋 Human Review Queue\n\n`;
    body += `| Review | Candidate | Source | Slug | Valence | Status | Extraction |\n`;
    body += `|--------|-----------|--------|------|---------|--------|------------|\n`;
    for (const a of assessments) {
      body += `| ${a.review_id} | ${a.candidate_id} | #${a.discussion} | ${a.slug} | ${a.proposed_valence} | ${a.review_status} | ${a.requires_manual_extraction ? '⚠️ Manual' : '✅ Auto'} |\n`;
    }
    body += `\n`;
    body += `*${assessments.length} candidate(s) waiting for Gate A (human review). `;
    body += `See runs/human-review-ledger.yaml for full details.*\n\n`;
  }

    // Metrics section
  body += `### 📊 Metrics\n\n`;
  body += `| Metric | Value |\n|---------|-------|\n`;
  body += `| Nodes | ${metrics.nodeCount} |\n`;
  body += `| Links | ${metrics.linkCount} |\n`;
  body += `| Average Tension | ${metrics.avgTension} |\n`;
  body += `| Coverage | ${metrics.coverage} |\n`;
  body += `| Density | ${metrics.density} |\n`;
  body += `| Total Words | ${metrics.totalWords || 0} |\n`;
  body += `| Active Discussions | ${discussionCount} |\n\n`;

  body += `### 🤖 Agent Scientific Audit status\n\n`;
  if (monthlyAudit) {
    body += `A curated scientific audit is attached below. It is distinct from the automatic repository metrics above.\n\n`;
  } else {
    body += `No curated agent audit has been committed for this month yet. Automatic metrics remain available above.\n\n`;
  }

  if (monthlyAudit) {
    body += `---\n\n${monthlyAudit}\n\n`;
  }

  body += `---\n\n*Log generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.*\n`;

  return `${yaml}\n\n${body}`;
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
  const month = process.argv[2] || getCurrentMonth();
  const filePath = path.join(CONTENT_LOG, `${month}.mdx`);

  console.log(`📋 Sync log for ${month}...`);

  // Collect metrics
  const metrics = getGraphMetrics();
  metrics.totalWords = getTotalWords();

  // Get discussions
  const discussions = token ? await getActiveDiscussions(token) : [];
  console.log(`  💬 ${discussions.length} discussions found`);console.log(`  💬 ${discussions.length} discussions found`);

  // Read human review queue
  const pendingReviews = getPendingReviews();
  const assessments = pendingReviews.map((r) => ({
    discussion: parseInt((r.source_url || '').match(/discussions\/(\d+)/)?.[1] || '0', 10),
    candidate_id: r.candidate_id || '',
    review_id: r.review_id || '',
    slug: r.target_node || 'unknown',
    template: r.proposed_valence === 'confirming' ? 'share-your-story' : 'share-your-story',
    proposed_valence: r.proposed_valence || 'complicating',
    acquisition_channel: r.acquisition_channel || 'practitioner',
    processing_status: r.processing_status || 'CANDIDATE',
    review_status: r.human_status || 'PENDING',
    requires_manual_extraction: (r.source_description || '').includes('MANUAL_EXTRACTION_REQUIRED'),
    source_url: r.source_url || '',
  }));
  console.log(`  📋 ${assessments.length} pending human reviews`);



  // Get git changes
  const changes = getRecentChanges();
  console.log(`  ✏️ ${changes.entries.length} entries modified (${changes.commits} commits)`);

  // Build changes list
  const changeItems = [];

  for (const d of discussions) {
    const slug = slugify(d.title.replace(/^\[.*?\]\s*/, "").split("—")[0]?.trim() || "");
    changeItems.push({
      type: "discussion",
      description: `#${d.number} — ${d.title}`,
      detail: `${d.comments?.totalCount || 0} comments${slug ? ` (slug: ${slug})` : ""}`,
    });
  }

  for (const entry of changes.entries) {
    changeItems.push({
      type: "entry",
      description: `Modified entry: ${entry}`,
    });
  }

  // Only add graph change if metrics changed meaningfully
  const prevFile = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "";
  const prevMatch = prevFile.match(/avgTension: ([\d.]+)/);
  if (prevMatch) {
    const prevTension = parseFloat(prevMatch[1]);
    const diff = Math.abs(metrics.avgTension - prevTension);
    if (diff > 0.01 || changes.commits > 0) {
      changeItems.push({
        type: "graph",
        description: `Updated metrics: ${metrics.nodeCount} nodes, ${metrics.linkCount} links, tension ${metrics.avgTension}`,
        detail: diff > 0.01 ? `Tension delta: ${(metrics.avgTension - prevTension).toFixed(2)}` : undefined,
      });
    }
  } else {
    changeItems.push({
      type: "graph",
      description: `Snapshot: ${metrics.nodeCount} nodes, ${metrics.linkCount} links`,
    });
  }

  const monthlyAudit = getMonthlyAudit(month);
  console.log(`  🤖 ${monthlyAudit ? "monthly scientific audit found" : "no monthly scientific audit found"}`);

  // Generate and write
  const markdown = generateMarkdown({
    month,
    discussions,
    changes: { ...changes, items: changeItems },
    metrics,
    assessments,
    monthlyAudit,
  });

  fs.mkdirSync(CONTENT_LOG, { recursive: true });
  fs.writeFileSync(filePath, markdown, "utf-8");
  console.log(`✅ Written: ${filePath}`);

  // Print summary for CI
  const summary = {
    month,
    discussions: discussions.length,
    entries: changes.entries.length,
    commits: changes.commits,
    metrics,
  };
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});