/**
 * sync-log.mjs — Genera una entry di log mensile
 *
 * Raccoglie:
 * 1. Discussioni GitHub active col tag "discussione"
 * 2. Entry modificate nell'ultimo mese (git log)
 * 3. Metriche del grafo (da dist/api/graph.json o ricalcolate)
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

// ─── Helpers ────────────────────────────────────────────────

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

// ─── 1. GitHub Discussions ──────────────────────────────────

async function getActiveDiscussions(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };

  // Query discussions with "discussione" label
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
      return labels.includes("discussione");
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

// ─── 4. Generate markdown entry ────────────────────────────

function generateMarkdown({ month, discussions, changes, metrics }) {
  const discussionCount = discussions.length;
  const sortedDiscussions = discussions.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const yaml = `---
title: "Mese ${month}"
month: "${month}"
description: "Revisione mensile — ${discussionCount} discussioni attive, ${changes.entries.length} entry modificate, ${changes.commits} commit."
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
buildTimestamp: "${new Date().toISOString()}"
---`;

  let body = `## Riepilogo del mese\n\n`;
  body += `**${changes.commits} commit** su **${changes.entries.length} entry** modificate.\n`;
  body += `**${discussionCount} discussioni attive** su GitHub.\n\n`;

  // Discussions section
  if (sortedDiscussions.length > 0) {
    body += `### 💬 Discussioni attive\n\n`;
    for (const d of sortedDiscussions) {
      body += `- **#${d.number}** — ${d.title} (${d.comments?.totalCount || 0} commenti)\n`;
    }
    body += "\n";
  }

  // Changes section
  const types = { discussion: "💬 Discussioni", entry: "✏️ Entry modificate", graph: "🕸️ Grafo", decision: "⚡ Decisioni" };
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

  // Metrics section
  body += `### 📊 Metriche\n\n`;
  body += `| Metrica | Valore |\n|---------|-------|\n`;
  body += `| Nodi | ${metrics.nodeCount} |\n`;
  body += `| Link | ${metrics.linkCount} |\n`;
  body += `| Tensione media | ${metrics.avgTension} |\n`;
  body += `| Copertura | ${metrics.coverage} |\n`;
  body += `| Densità | ${metrics.density} |\n`;
  body += `| Parole totali | ${metrics.totalWords || 0} |\n`;
  body += `| Discussioni attive | ${discussionCount} |\n\n`;

  body += `---\n\n*Log generato il ${new Date().toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" })}.*\n`;

  return `${yaml}\n\n${body}`;
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
  const month = process.argv[2] || getCurrentMonth();
  const filePath = path.join(CONTENT_LOG, `${month}.mdx`);

  console.log(`📋 Sync log per ${month}...`);

  // Collect metrics
  const metrics = getGraphMetrics();
  metrics.totalWords = getTotalWords();

  // Get discussions
  const discussions = token ? await getActiveDiscussions(token) : [];
  console.log(`  💬 ${discussions.length} discussioni trovate`);

  // Get git changes
  const changes = getRecentChanges();
  console.log(`  ✏️ ${changes.entries.length} entry modificate (${changes.commits} commit)`);

  // Build changes list
  const changeItems = [];

  for (const d of discussions) {
    const slug = slugify(d.title.replace(/^\[.*?\]\s*/, "").split("—")[0]?.trim() || "");
    changeItems.push({
      type: "discussion",
      description: `#${d.number} — ${d.title}`,
      detail: `${d.comments?.totalCount || 0} commenti${slug ? ` (slug: ${slug})` : ""}`,
    });
  }

  for (const entry of changes.entries) {
    changeItems.push({
      type: "entry",
      description: `Entry modificata: ${entry}`,
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
        description: `Metriche aggiornate: ${metrics.nodeCount} nodi, ${metrics.linkCount} link, tensione ${metrics.avgTension}`,
        detail: diff > 0.01 ? `Delta tensione: ${(metrics.avgTension - prevTension).toFixed(2)}` : undefined,
      });
    }
  } else {
    changeItems.push({
      type: "graph",
      description: `Snapshot: ${metrics.nodeCount} nodi, ${metrics.linkCount} link`,
    });
  }

  // Generate and write
  const markdown = generateMarkdown({
    month,
    discussions,
    changes: { ...changes, items: changeItems },
    metrics,
  });

  fs.mkdirSync(CONTENT_LOG, { recursive: true });
  fs.writeFileSync(filePath, markdown, "utf-8");
  console.log(`✅ ${filePath}`);

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