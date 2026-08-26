#!/usr/bin/env node
/**
 * convert-org.js — Migrate .org files to Astro Content Collections (Markdown)
 *
 * Pipeline:
 * 1. Extract YAML frontmatter from Org headers
 * 2. Normalise Org syntax via regex (blocks, quotes, links, properties, etc.)
 * 3. Write clean Markdown to src/content/handbook/
 *
 * Usage: node scripts/convert-org.js
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC_DIR = join(ROOT, "src");
const OUT_DIR = join(ROOT, "src/content/handbook");

const SECTION_MAP = {
  foreword: "Introduction", preface: "Introduction", introduction: "Introduction",
  welcome_to_the_peeragogy_workbook: "Introduction", summaries: "Introduction",
  motivation: "Motivation", "5ph1nx": "Motivation",
  practice: "Peeragogy in Practice", patterns: "Peeragogy in Practice",
  peeragogy: "Peeragogy in Practice", roadmap: "Peeragogy in Practice",
  reduce_reuse_recycle: "Peeragogy in Practice", carrying: "Peeragogy in Practice",
  a_specific_project: "Peeragogy in Practice", wrapper: "Peeragogy in Practice",
  heartbeat: "Peeragogy in Practice", newcomer: "Peeragogy in Practice",
  scrapbook: "Peeragogy in Practice", "whats-next-summary": "Peeragogy in Practice",
  swats: "Peeragogy in Practice",
  convening: "Convening a Group", play: "Convening a Group",
  sole: "Convening a Group", a_meeting_with_the_pro_vice_chancellor: "Convening a Group",
  organizing: "Organizing a Learning Context", adding_structure: "Organizing a Learning Context",
  student_syllabus: "Organizing a Learning Context", "collab-ex": "Organizing a Learning Context",
  cofac: "Cooperation", workscape: "Cooperation", participation: "Cooperation",
  coworking: "Cooperation", "coworking-story": "Cooperation",
  assessment: "Assessment", researching_peeragogy: "Assessment",
  technologies: "Technologies, Services, and Platforms", forums: "Technologies, Services, and Platforms",
  wiki: "Technologies, Services, and Platforms", realtime: "Technologies, Services, and Platforms",
  connectivism: "Technologies, Services, and Platforms",
  action: "Resources", recommended_reading: "Resources", license: "Resources",
  peeragogy_handbook_v4: "Resources",
  discerning_a_pattern: "Peeragogy in Practice", distributed_roadmap: "Peeragogy in Practice",
  magical_thinking: "Peeragogy in Practice", navel_gazing: "Peeragogy in Practice",
  pattern_audit: "Peeragogy in Practice", specific: "Peeragogy in Practice",
  stasis: "Peeragogy in Practice", stuck: "Peeragogy in Practice",
  solution: "Resources", problem: "Resources", k12: "Resources", syllabus_2021: "Resources",
};

function slugify(name) {
  return name.toLowerCase().replace(/\.org$/, "").replace(/[^a-z0-9_-]+/g, "-").replace(/^-|-$/g, "");
}

function estimateReadingTime(text) {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

function convertOrgToMarkdown(content, filename) {
  let md = content;
  const section = SECTION_MAP[filename.replace(/\.org$/, "")] || "Miscellaneous";

  // Step 1: Extract metadata from Org headers
  let title = "", frnOrder = "", category = "", tags = [];
  const mT = md.match(/^#\+TITLE:\s+(.+)$/m);
  if (mT) title = mT[1].trim();
  const mC = md.match(/^#\+CATEGORY:\s+(.+)$/m);
  if (mC) category = mC[1].trim();
  const mR = md.match(/^#\+roam_tags:\s+(.+)$/m);
  if (mR) tags = mR[1].trim().split(/\s+/);
  const mO = md.match(/^#\+FIRN_ORDER:\s+(.+)$/m);
  if (mO) frnOrder = mO[1].trim();

  // Step 2: Remove metadata directives (#+TITLE:, #+CATEGORY:, etc.)
  md = md.replace(/^#\+[a-zA-Z_]+:.*$/gim, "");

  // Step 3: Remove :PROPERTIES: drawers
  md = md.replace(/\n\s*:PROPERTIES:\s*\n[\s\S]*?\n\s*:END:\s*\n?/g, "\n");

  // --- Placeholder protection phase ---
  const placeholders = new Map();
  let phCounter = 0;
  const ph = (val) => { const k = "__PH" + phCounter++ + "__"; placeholders.set(k, val); return k; };

  // Step 4: Extract block quotes FIRST (before generic catch-all)
  md = md.replace(/#\+BEGIN_QUOTE\s*\n([\s\S]*?)\n\s*#\+END_QUOTE/gi, (_, q) => {
    const lines = q.trim().split("\n").map(l => l.trim());
    return ph("> " + lines.join("\n> "));
  });

  // Step 5: Extract other BEGIN_/END_ blocks
  // BEGIN_HTML -> raw content
  md = md.replace(/#\+BEGIN_HTML\s*\n([\s\S]*?)\n\s*#\+END_HTML/gi, (_, c) => ph(c.trim()));
  // BEGIN_EXAMPLE -> code block
  md = md.replace(/#\+BEGIN_EXAMPLE\s*\n([\s\S]*?)\n\s*#\+END_EXAMPLE/gi, (_, c) => ph("```\n" + c.trim() + "\n```"));
  // BEGIN_SRC -> code block with language
  md = md.replace(/#\+BEGIN_SRC\s*(\w*)\s*\n([\s\S]*?)\n\s*#\+END_SRC/gi, (_, lang, c) => {
    return ph("```" + (lang || "").trim() + "\n" + c.trim() + "\n```");
  });
  // Any remaining BEGIN_/END_ blocks (QUOTE already handled above)
  md = md.replace(/#\+BEGIN_([A-Z]+)\s*\n([\s\S]*?)\n\s*#\+END_\1/gi, (_, t, c) => ph("```\n" + c.trim() + "\n```"));

  // Step 6: Extract all Org links as placeholders
  // [[file:path][label]] -> [label](/path/)
  md = md.replace(/\[\[file:\.?\/?([^\[\]]+?)\]\[([^\[\]]+?)\]\]/g, (_, path, label) => {
    let clean = path.replace(/^\.\//, "").replace(/^src\//, "").replace(/\.org$/, "").replace(/\.html$/, "");
    clean = clean.replace(/^static\//, "");
    return ph("[" + label + "](/" + clean + "/)");
  });
  // [[url][label]] -> [label](url)
  md = md.replace(/\[\[([^\[\]]+?)\]\[([^\[\]]+?)\]\]/g, (_, url, label) => ph("[" + label + "](" + url + ")"));
  // [[url]] -> [url](url)
  md = md.replace(/\[\[([^\[\]]+?)\]\]/g, (_, url) => ph("[" + url + "](" + url + ")"));

  // --- Text formatting phase (safe: placeholders protected) ---

  // Step 7: Convert Org headlines to Markdown
  md = md.replace(/^\*\*\*\*\s+/gm, "#### ");
  md = md.replace(/^\*\*\*\s+/gm, "### ");
  md = md.replace(/^\*\*\s+/gm, "## ");
  md = md.replace(/^\*\s+/gm, "# ");

  // Step 8: Convert Org italic /text/ -> *text*
  md = md.replace(/\/([^/\n]+?)\//g, (m, text) => {
    if (text.startsWith("http") || text.includes("//")) return m;
    return "*" + text + "*";
  });

  // Step 9: Convert =code= to `code`
  md = md.replace(/=([^=\n]+?)=/g, "`$1`");

  // Step 10: Handle special characters
  md = md.replace(/\\nbsp\{\}/g, "&nbsp;");
  md = md.replace(/\\dots\{\}/g, "...");

  // --- Restore phase ---
  // Step 11: Restore all placeholders
  for (const [k, v] of placeholders) { md = md.split(k).join(v); }

  // Step 12: Convert HTML comments to JSX comments (after restoration)
  md = md.replace(/<!--\s*([\s\S]*?)\s*-->/g, (m, inner) => "{\/* " + inner.trim() + " *\/}");

  // Step 13: Clean up excess blank lines
  md = md.replace(/\n{4,}/g, "\n\n\n");

  return { markdown: md.trim(), title, section, tags, frnOrder, category };
}

// --- File processing ---

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const orgFiles = readdirSync(SRC_DIR).filter(f => f.endsWith(".org") && !f.includes("_firn")).sort();
let converted = 0, errors = [];

for (const file of orgFiles) {
  try {
    const content = readFileSync(join(SRC_DIR, file), "utf-8");
    const { markdown, title, section, tags, frnOrder, category } = convertOrgToMarkdown(content, file);
    const slug = slugify(file);
    let order = 99;
    if (frnOrder) order = parseFloat(frnOrder);

    const fm = [
      "---",
      'title: "' + (title || slug) + '"',
      'section: "' + section + '"',
      "order: " + order,
      "readingTime: " + estimateReadingTime(markdown),
      tags.length > 0 ? "tags: [" + tags.map(t => '"' + t + '"').join(", ") + "]" : "",
      category ? 'category: "' + category + '"' : "",
      "", "---",
    ].filter(Boolean).join("\n");

    writeFileSync(join(OUT_DIR, slug + ".mdx"), fm + "\n\n" + markdown + "\n", "utf-8");
    converted++;
    console.log("OK " + file + " -> " + slug + ".mdx");
  } catch (err) {
    errors.push({ file, error: err.message });
    console.error("FAIL " + file + ": " + err.message);
  }
}

console.log("\n--- Converted " + converted + " file(s). ---");
if (errors.length > 0) {
  console.error("Errors: " + errors.length);
  for (const e of errors) console.error("  " + e.file + ": " + e.error);
}