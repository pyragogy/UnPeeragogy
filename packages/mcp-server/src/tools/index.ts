import MiniSearch from "minisearch";
import {
  loadAllEntries,
  type ContentEntry,
  type EntryFrontmatter,
} from "../lib/loader.js";

// Build miniSearch index from all entries
function buildSearchIndex(): MiniSearch {
  const entries = loadAllEntries();
  const documents = entries.map((entry, id) => ({
    id: id.toString(),
    slug: entry.slug,
    collection: entry.collection,
    title: entry.frontmatter.title,
    section: entry.frontmatter.section || "",
    description: entry.frontmatter.description || "",
    tags: (entry.frontmatter.tags || []).join(" "),
    vectors: (entry.frontmatter.vectors || []).join(" "),
    body: entry.body.slice(0, 5000), // Index first 5000 chars for perf
  }));

  const miniSearch = new MiniSearch({
    fields: ["title", "description", "tags", "vectors", "body", "section"],
    storeFields: ["slug", "collection", "title", "section", "description"],
    searchOptions: {
      boost: { title: 3, description: 2, tags: 2, vectors: 2 },
      prefix: true,
      fuzzy: 0.15,
    },
  });

  miniSearch.addAll(documents);
  return miniSearch;
}

// Singleton index — rebuilt only when server restarts
let searchIndex: MiniSearch | null = null;
function getSearchIndex(): MiniSearch {
  if (!searchIndex) {
    searchIndex = buildSearchIndex();
  }
  return searchIndex;
}

export interface SearchResult {
  slug: string;
  collection: string;
  title: string;
  section?: string;
  description?: string;
  score: number;
}

/**
 * Search across all content. Returns ranked results with snippets.
 */
export function search(query: string, maxResults: number = 10): SearchResult[] {
  const mini = getSearchIndex();
  // Handle empty query
  if (!query.trim()) return [];

  const rawResults = mini.search(query, { fuzzy: 0.15, prefix: true });
  const results: SearchResult[] = [];

  for (const r of rawResults.slice(0, maxResults)) {
    results.push({
      slug: r.slug,
      collection: r.collection,
      title: r.title || "",
      section: r.section || undefined,
      description: r.description || undefined,
      score: r.score || 0,
    });
  }

  return results;
}

/**
 * Reset search index (e.g. after content change)
 */
export function resetSearchIndex(): void {
  searchIndex = null;
}

/**
 * Compare theory vs reality for a given slug
 */
export function compareSlug(slug: string): string {
  const entries = loadAllEntries();
  const peeragogy = entries.find(
    (e) => e.slug === slug && e.collection === "peeragogy"
  );
  const unpeeragogy = entries.find(
    (e) => e.slug === slug && e.collection === "unpeeragogy"
  );

  let output: string[] = [];

  if (peeragogy) {
    output.push("## 📖 Theory (Peeragogy)");
    output.push(`**${peeragogy.frontmatter.title}**`);
    if (peeragogy.frontmatter.description) {
      output.push(`> ${peeragogy.frontmatter.description}`);
    }
    output.push("");
    output.push(peeragogy.body.slice(0, 2000));
  }

  if (unpeeragogy) {
    if (peeragogy) output.push("\n---\n");
    output.push("## ⚡ Reality (Unpeeragogy)");
    output.push(`**${unpeeragogy.frontmatter.title}**`);
    if (unpeeragogy.frontmatter.description) {
      output.push(`> ${unpeeragogy.frontmatter.description}`);
    }
    if (unpeeragogy.frontmatter.tension_index) {
      output.push(
        `\n*Tension index: ${unpeeragogy.frontmatter.tension_index.toFixed(2)}*\n`
      );
    }
    output.push("");
    output.push(unpeeragogy.body.slice(0, 2000));
  }

  if (!peeragogy && !unpeeragogy) {
    return `No content found for "${slug}".`;
  }

  if (!unpeeragogy) {
    output.push(
      "\n\n---\n*Note: no Reality column available for this slug.*"
    );
    output.push(
      "*The Perturbator suspects there's easy consensus here waiting to be dismantled.*"
    );
  }

  return output.join("\n");
}

/**
 * Analyze a slug — extract failure vectors and structure
 */
export function analyzeSlug(slug: string): string {
  const entries = loadAllEntries();
  const peeragogy = entries.find(
    (e) => e.slug === slug && e.collection === "peeragogy"
  );
  const unpeeragogy = entries.find(
    (e) => e.slug === slug && e.collection === "unpeeragogy"
  );

  if (!peeragogy && !unpeeragogy) {
    return `No content for "${slug}".`;
  }

  const output: string[] = [];
  output.push(`# Analysis: ${slug}\n`);

  const vectors = new Set<string>();
  if (peeragogy?.frontmatter.vectors) {
    peeragogy.frontmatter.vectors.forEach((v) => vectors.add(v));
  }
  if (unpeeragogy?.frontmatter.vectors) {
    unpeeragogy.frontmatter.vectors.forEach((v) => vectors.add(v));
  }

  const tags = new Set<string>();
  if (peeragogy?.frontmatter.tags) {
    peeragogy.frontmatter.tags.forEach((t) => tags.add(t));
  }
  if (unpeeragogy?.frontmatter.tags) {
    unpeeragogy.frontmatter.tags.forEach((t) => tags.add(t));
  }

  output.push(`## Failure Vectors`);
  if (vectors.size > 0) {
    for (const v of vectors) {
      output.push(`- \`${v}\``);
    }
  } else {
    output.push("No explicit vectors detected.");
    output.push("*The Perturbator recommends re-examining this content for hidden friction.*");
  }

  output.push(`\n## Tag`);
  if (tags.size > 0) {
    output.push([...tags].join(", "));
  } else {
    output.push("No tags.");
  }

  if (peeragogy) {
    const wordCount = peeragogy.body.split(/\s+/).length;
    output.push(`\n## Theory (${peeragogy.collection})`);
    output.push(`- Title: ${peeragogy.frontmatter.title}`);
    output.push(`- Section: ${peeragogy.frontmatter.section || "N/A"}`);
    output.push(`- Words: ${wordCount}`);
  }


  if (unpeeragogy) {
    const wordCount = unpeeragogy.body.split(/\s+/).length;
    output.push(`\n## Reality (${unpeeragogy.collection})`);
    output.push(`- Title: ${unpeeragogy.frontmatter.title}`);
    output.push(`- Section: ${unpeeragogy.frontmatter.section || "N/A"}`);
    output.push(`- Tension index: ${unpeeragogy.frontmatter.tension_index?.toFixed(2) || "N/A"}`);
    output.push(`- Words: ${wordCount}`);
  }

  if (peeragogy && unpeeragogy) {
    output.push(`\n## Theory/Reality Gap`);
    const peerWords = peeragogy.body.split(/\s+/).length;
    const unpeerWords = unpeeragogy.body.split(/\s+/).length;
    const ratio = unpeerWords / Math.max(peerWords, 1);
    output.push(
      `The Reality column is ${ratio > 1.2 ? "more extensive" : ratio < 0.8 ? "less extensive" : "similar in length"} compared to the theory.`
    );
    output.push(
      `Shared vectors: ${vectors.size > 0 ? [...vectors].join(", ") : "none"}`
    );
  }

  return output.join("\n");
}

/**
 * Calculate tension index for a slug or the entire corpus
 */
export function calculateTensionIndex(slug?: string): {
  slug?: string;
  index: number;
  interpretation: string;
} {
  if (slug) {
    const entries = loadAllEntries();
    const peeragogy = entries.find(
      (e) => e.slug === slug && e.collection === "peeragogy"
    );
    const unpeeragogy = entries.find(
      (e) => e.slug === slug && e.collection === "unpeeragogy"
    );

    if (!peeragogy && !unpeeragogy) {
      return { slug, index: 0, interpretation: `No content for "${slug}".` };
    }

    const ti = unpeeragogy?.frontmatter.tension_index || 0;
    return {
      slug,
      index: ti,
      interpretation: interpretTension(ti),
    };
  }

  // Calculate over entire corpus
  const entries = loadAllEntries();
  const peerEntries = entries.filter((e) => e.collection === "peeragogy");
  const unpeerEntries = entries.filter((e) => e.collection === "unpeeragogy");

  if (peerEntries.length === 0) {
    return { index: 0, interpretation: "No Peeragogy content in the corpus." };
  }

  const totalTi = unpeerEntries.reduce(
    (sum, e) => sum + (e.frontmatter.tension_index || 0),
    0
  );
  const avgTi = totalTi / Math.max(unpeerEntries.length, 1);

  return {
    index: avgTi,
    interpretation: `Average tension across ${peerEntries.length} theory files and ${unpeerEntries.length} reality files: ${interpretTension(avgTi)}`,
  };
}

function interpretTension(index: number): string {
  if (index === 0) return "No tension detected — possible easy consensus.";
  if (index < 0.3) return "Low tension — slight theory/reality discrepancy.";
  if (index < 0.6) return "Moderate tension — structural friction present.";
  if (index < 1.0) return "High tension — significant contradictions.";
  if (index < 1.5) return "Critical tension — system shows deep fractures.";
  return "Maximum tension — pattern collapse. Anti-pattern dominant.";
}

/**
 * Agent Perturbatore — generates structural friction analysis.
 *
 * Previously backed by Hetzner Inference API (GLM-5.2). Now uses static
 * friction analysis via injectFriction. Ready to accept a new AI backend
 * when available.
 */
export async function agentPerturbatore(
  topic: string,
  mode: "soft" | "hard" | "max" = "hard"
): Promise<string> {
  // Without an AI backend, fall through to static corpus friction
  return injectFriction(topic, mode === "max" ? "hard" : mode);
}

/**
 * Check if the AI-based Perturbatore is available.
 * Currently false — no AI backend configured.
 */
export function isPerturbatoreAvailable(): boolean {
  return false;
}

// ─────────────────────────────────────────────────────────────
// SUPER-TOOL 1: map-failure-graph
// ─────────────────────────────────────────────────────────────

/**
 * Graph node in the tension-weighted knowledge graph.
 */
export interface GraphNode {
  id: string;
  slug: string;
  collection: "peeragogy" | "unpeeragogy";
  title: string;
  tensionIndex: number;
  vectors: string[];
  section?: string;
  /** Node size proportional to tension for visualisation */
  weight: number;
}

/**
 * Graph edge with weight and semantics.
 */
export interface GraphEdge {
  source: string;   // node id
  target: string;   // node id
  weight: number;   // number of shared vectors
  sharedVectors: string[];
  bidirectional: boolean;
  /** Tension differential — abs difference between the two nodes' tension_index */
  tensionDelta: number;
}

/**
 * The full graph structure.
 */
export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    nodeCount: number;
    edgeCount: number;
    density: number;          // edge count / possible edges
    avgTension: number;
    maxTension: number;
    dominantVectors: Array<{ vector: string; count: number }>;
  };
}

/**
 * Build the complete failure vector knowledge graph.
 *
 * Options:
 *   query  — filter graph to nodes matching query + their neighbours (1-hop expansion)
 *   vector — filter graph to only nodes with THAT vector
 *   minWeight — minimum edge weight threshold (default 1)
 */
export function mapFailureGraph(opts: {
  query?: string;
  vector?: string;
  minWeight?: number;
}): KnowledgeGraph {
  const entries = loadAllEntries();
  const minWeight = opts.minWeight ?? 1;

  // ── Build all nodes ──────────────────────────────────────
  const nodeMap = new Map<string, GraphNode>();
  for (const e of entries) {
    const id = `${e.collection}:${e.slug}`;
    const ti = e.frontmatter.tension_index ?? 0;
    nodeMap.set(id, {
      id,
      slug: e.slug,
      collection: e.collection,
      title: e.frontmatter.title || e.slug,
      tensionIndex: ti,
      vectors: e.frontmatter.vectors || [],
      section: e.frontmatter.section,
      weight: Math.max(ti, 0.1),
    });
  }

  // ── Filter: by query or vector ──────────────────────────
  let activeIds: Set<string>;

  if (opts.query) {
    const lowerQ = opts.query.toLowerCase();
    activeIds = new Set(
      [...nodeMap.values()]
        .filter((n) =>
          n.slug.includes(lowerQ) ||
          n.title.toLowerCase().includes(lowerQ) ||
          n.vectors.some((v) => v.includes(lowerQ)) ||
          n.section?.toLowerCase().includes(lowerQ)
        )
        .map((n) => n.id)
    );

    // If nothing matched, return empty
    if (activeIds.size === 0) {
      return emptyGraph(`No nodes found matching query: "${opts.query}"`);
    }

    // 1-hop expansion: add neighbours of active nodes
    const allIds = new Set(activeIds);
    const nodesArr = [...nodeMap.values()];
    for (const id of activeIds) {
      const a = nodeMap.get(id)!;
      for (const b of nodesArr) {
        if (a.id === b.id) continue;
        const shared = a.vectors.filter((v) => b.vectors.includes(v));
        if (shared.length >= minWeight) {
          allIds.add(b.id);
        }
      }
    }
    activeIds = allIds;
  } else if (opts.vector) {
    const lowerV = opts.vector.toLowerCase();
    activeIds = new Set(
      [...nodeMap.values()]
        .filter((n) => n.vectors.some((v) => v.toLowerCase().includes(lowerV)))
        .map((n) => n.id)
    );
    if (activeIds.size === 0) {
      return emptyGraph(`No nodes found with vector: "${opts.vector}"`);
    }
  } else {
    // Full graph
    activeIds = new Set(nodeMap.keys());
  }

  const activeNodes = [...activeIds].map((id) => nodeMap.get(id)!);
  const activeNodeSet = new Set(activeIds);

  // ── Build edges ─────────────────────────────────────────
  const edgeMap = new Map<string, GraphEdge>();
  for (let i = 0; i < activeNodes.length; i++) {
    for (let j = i + 1; j < activeNodes.length; j++) {
      const a = activeNodes[i];
      const b = activeNodes[j];
      const shared = a.vectors.filter((v) => b.vectors.includes(v));
      if (shared.length < minWeight) continue;

      const key = [a.id, b.id].sort().join("|");
      if (edgeMap.has(key)) continue;

      edgeMap.set(key, {
        source: a.id,
        target: b.id,
        weight: shared.length,
        sharedVectors: shared,
        bidirectional: true,
        tensionDelta: Math.abs(a.tensionIndex - b.tensionIndex),
      });
    }
  }

  const edges = [...edgeMap.values()];
  const totalPossible = (activeNodes.length * (activeNodes.length - 1)) / 2;

  // ── Dominant vectors ────────────────────────────────────
  const vectorCount = new Map<string, number>();
  for (const n of activeNodes) {
    for (const v of n.vectors) {
      vectorCount.set(v, (vectorCount.get(v) || 0) + 1);
    }
  }
  const dominantVectors = [...vectorCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([vector, count]) => ({ vector, count }));

  const tensions = activeNodes.map((n) => n.tensionIndex);
  const avgTension =
    tensions.reduce((a, b) => a + b, 0) / Math.max(tensions.length, 1);

  return {
    nodes: activeNodes,
    edges,
    metadata: {
      nodeCount: activeNodes.length,
      edgeCount: edges.length,
      density: totalPossible > 0 ? edges.length / totalPossible : 0,
      avgTension,
      maxTension: Math.max(...tensions, 0),
      dominantVectors,
    },
  };
}

function emptyGraph(reason: string): KnowledgeGraph {
  return {
    nodes: [],
    edges: [],
    metadata: {
      nodeCount: 0,
      edgeCount: 0,
      density: 0,
      avgTension: 0,
      maxTension: 0,
      dominantVectors: [],
    },
  };
}

/**
 * Serializza il knowledge graph in markdown + JSON embed.
 */
export function formatGraphAsMarkdown(graph: KnowledgeGraph): string {
  if (graph.nodes.length === 0) {
    return `## 🕸️ Failure Graph

*Empty graph — no nodes match the criteria.*

${graph.metadata.dominantVectors.length === 0 ? "*Graph is available but contains no nodes." : ""}`;
  }

  const lines: string[] = [];
  lines.push(`## 🕸️ Knowledge Graph — Failure Vectors`);
  lines.push(``);
  lines.push(`**${graph.metadata.nodeCount}** nodes, **${graph.metadata.edgeCount}** edges, density **${(graph.metadata.density * 100).toFixed(1)}%**`);
  lines.push(`Avg tension: **${graph.metadata.avgTension.toFixed(2)}** | Max tension: **${graph.metadata.maxTension.toFixed(2)}**`);
  lines.push(``);

  // Dominant vectors
  if (graph.metadata.dominantVectors.length > 0) {
    lines.push(`### Dominant Vectors`);
    for (const dv of graph.metadata.dominantVectors) {
      const pct = ((dv.count / graph.metadata.nodeCount) * 100).toFixed(0);
      lines.push(`- **${dv.vector}** — present in ${dv.count}/${graph.metadata.nodeCount} nodes (${pct}%)`);
    }
    lines.push(``);
  }

  // Subgraph: high-tension cluster
  const highTension = graph.nodes.filter((n) => n.tensionIndex >= 1.0);
  if (highTension.length > 0) {
    lines.push(`### ⚡ Critical Tension Nodes (≥ 1.0)`);
    for (const n of highTension) {
      const col = n.collection === "peeragogy" ? "📖" : "⚡";
      lines.push(`- ${col} **${n.title}** (\`${n.slug}\`) — ti: **${n.tensionIndex.toFixed(2)}**`);
      if (n.vectors.length > 0) {
        lines.push(`  Vectors: ${n.vectors.map((v) => `\`${v}\``).join(", ")}`);
      }
    }
    lines.push(``);
  }

  // Bridges: most connected nodes
  const nodeDegree = new Map<string, number>();
  for (const e of graph.edges) {
    nodeDegree.set(e.source, (nodeDegree.get(e.source) || 0) + 1);
    nodeDegree.set(e.target, (nodeDegree.get(e.target) || 0) + 1);
  }
  const topHubs = [...nodeDegree.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topHubs.length > 0) {
    lines.push(`### 🔗 Hub — most connected nodes`);
    for (const [id, degree] of topHubs) {
      const n = graph.nodes.find((n) => n.id === id);
      if (!n) continue;
      lines.push(`- **${n.title}** (\`${n.slug}\`) — ${degree} connections`);
    }
    lines.push(``);
  }

  // JSON embed per d3-force
  const d3Data = {
    nodes: graph.nodes.map((n) => ({
      id: n.id,
      slug: n.slug,
      collection: n.collection,
      title: n.title,
      tensionIndex: n.tensionIndex,
      vectors: n.vectors,
      weight: n.weight,
    })),
    links: graph.edges.map((e) => ({
      source: e.source,
      target: e.target,
      weight: e.weight,
      sharedVectors: e.sharedVectors,
      tensionDelta: e.tensionDelta,
    })),
  };

  lines.push(`### 📊 Structured Data (JSON)`);
  lines.push(`\`\`\`json`);
  lines.push(JSON.stringify(d3Data, null, 2));
  lines.push(`\`\`\``);

  return lines.join(`\n`);
}


// ─────────────────────────────────────────────────────────────
// SUPER-TOOL 2: suggest-field-report
// ─────────────────────────────────────────────────────────────

/**
 * Structure of a suggested field report.
 */
export interface SuggestedFieldReport {
  template: "share-your-story" | "structural-analysis";
  suggestedSlug: string;
  suggestedTitle: string;
  detectedVectors: Array<{ vector: string; confidence: number; evidence: string }>;
  estimatedTensionIndex: number;
  relatedEntries: Array<{ slug: string; collection: string; title: string }>;
  prefill: Record<string, string>;
  note: string;
}

/**
 * Suggest a field report pre-fill from free text.
 *
 * Input: free text (experience, doubt, observation)
 * Output: suggested template, slug, vectors, estimated tension_index
 */
export function suggestFieldReport(text: string): SuggestedFieldReport {
  const textLower = text.toLowerCase();
  const entries = loadAllEntries();

  // ── 1. Detect failure vectors ───────────────────────────
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

  const detectedVectors: SuggestedFieldReport["detectedVectors"] = [];
  for (const vector of KNOWN_VECTORS) {
    const readable = vector.replace(/-/g, " ");
    // Direct mention
    if (textLower.includes(readable) || textLower.includes(vector)) {
      detectedVectors.push({
        vector,
        confidence: 0.8,
        evidence: `Explicit mention of "${readable}"`,
      });
      continue;
    }
    // Keyword-based
    const keywords = vectorKeywords(vector);
    const matchCount = keywords.filter((k) => textLower.includes(k)).length;
    if (matchCount >= 2) {
      detectedVectors.push({
        vector,
        confidence: Math.min(0.3 + matchCount * 0.15, 0.85),
        evidence: `Detected ${matchCount} keywords: ${keywords.filter((k) => textLower.includes(k)).join(", ")}`,
      });
    }
  }

  // ── 2. Find matching slug entries ────────────────────────
  const relatedEntries: SuggestedFieldReport["relatedEntries"] = [];
  const matchedSlugs = new Set<string>();

  for (const e of entries) {
    const titleLower = e.frontmatter.title.toLowerCase();
    const bodyLower = e.body.toLowerCase();
    let score = 0;

    if (titleLower.includes(textLower.slice(0, 30)) || textLower.includes(titleLower.slice(0, 20))) {
      score += 5;
    }
    for (const dv of detectedVectors) {
      if (e.frontmatter.vectors?.includes(dv.vector)) score += 3;
      if (e.frontmatter.tags?.some((t) => t.includes(dv.vector))) score += 2;
    }
    if (bodyLower.includes(textLower.slice(0, 50))) score += 1;

    if (score >= 4 && !matchedSlugs.has(e.slug)) {
      matchedSlugs.add(e.slug);
      relatedEntries.push({
        slug: e.slug,
        collection: e.collection,
        title: e.frontmatter.title || e.slug,
      });
    }
  }

  relatedEntries.sort((a, b) => b.slug.length - a.slug.length).slice(0, 8);

  // ── 3. Determine template ───────────────────────────────
  const hasAnalysisLanguage =
    /contradd|conferm|estend|failure pattern|tension.\s*index/i.test(text);
  const isStructural =
    detectedVectors.length >= 2 || hasAnalysisLanguage;
  const template: "share-your-story" | "structural-analysis" =
    isStructural ? "structural-analysis" : "share-your-story";

  // ── 4. Estimate slug ────────────────────────────────────
  // Use first related slug or generate from first vector
  const suggestedSlug =
    relatedEntries.length > 0
      ? relatedEntries[0].slug
      : detectedVectors.length > 0
        ? detectedVectors[0].vector
        : "new-field-report";

  // ── 5. Suggested title ──────────────────────────────────
  const firstSentence = text.split(/[.!?]/).find((s) => s.trim().length > 20);
  const titleBase = firstSentence
    ? firstSentence.trim().slice(0, 60)
    : detectedVectors.length > 0
      ? `Observation on ${detectedVectors[0].vector.replace(/-/g, " ")}`
      : "New observation";
  const suggestedTitle = titleBase + (titleBase.length > 55 ? "" : "...");

  // ── 6. Estimate tension_index ───────────────────────────
  const tiContributions = detectedVectors.map((dv) => {
    const matching = entries.filter(
      (e) =>
        e.frontmatter.vectors?.includes(dv.vector) &&
        e.frontmatter.tension_index !== undefined
    );
    if (matching.length === 0) return 0.4; // default for unmatched vector
    return (
      matching.reduce((s, e) => s + (e.frontmatter.tension_index ?? 0), 0) /
      matching.length
    );
  });
  const estimatedTensionIndex =
    tiContributions.length > 0
      ? parseFloat(
          (
            tiContributions.reduce((a, b) => a + b, 0) /
            tiContributions.length
          ).toFixed(2)
        )
      : 0.3;

  // ── 7. Prefill ──────────────────────────────────────────
  const prefill: Record<string, string> = {};
  if (template === "share-your-story") {
    prefill["entry-slug"] = suggestedSlug;
    prefill["context"] =
      "(Describe the group: size, purpose, duration. Omit identifying info.)";
    prefill["what-you-tried"] =
      detectedVectors.length > 0
        ? `We tried applying the pattern "${detectedVectors[0].vector.replace(/-/g, " ")}"...`
        : "(What did you do, based on which pattern?)";
    prefill["what-happened"] = "(What happened. Be specific.)";
    prefill["interpretation"] =
      "(What you think it means — distinct from what happened.)";
    prefill["takeaway"] =
      "(What would you tell someone about to try this pattern?)";
    prefill["counter-evidence"] = "(What could we be wrong about? Optional)";
  } else {
    prefill["entry-slug"] = suggestedSlug;
    prefill["position"] =
      detectedVectors.length > 0 && relatedEntries.length > 0
        ? "Extends"
        : "Question";
    prefill["analysis"] = text.slice(0, 2000);
    prefill["provenance"] =
      "(Where does this observation come from? Cite specific incidents.)";
    prefill["counter-evidence"] = "(What, if it existed, would weaken your analysis?)";
  }

  // ── 8. Note ─────────────────────────────────────────────
  const noteParts: string[] = [];
  if (detectedVectors.length === 0) {
    noteParts.push(
      "No failure vectors automatically recognised. Manual review may identify more."
    );
  }
  if (relatedEntries.length === 0) {
    noteParts.push(
      "No matches found in existing slugs. This may be an undocumented pattern."
    );
  }
  if (template === "share-your-story") {
    noteParts.push(
      "Template 'Share your story' suggested — no taxonomy knowledge needed to contribute."
    );
  }
  const note = noteParts.join(" ");

  return {
    template,
    suggestedSlug,
    suggestedTitle,
    detectedVectors,
    estimatedTensionIndex,
    relatedEntries,
    prefill,
    note,
  };
}

/**
 * Keyword map for each failure vector.
 */
function vectorKeywords(vector: string): string[] {
  const map: Record<string, string[]> = {
    "free-rider": ["free rider", "free riders", "doesn't contribute", "lazy", "passenger", "parasite", "freeloader", "non contribuisce", "si appoggia", "parassita", "scrocca"],
    "consensus-paralysis": ["paralysis", "paralyzed", "stuck", "can't decide", "deadlock", "stalemate", "consensus", "never decides", "vote", "paralisi", "decisione", "bloccato", "non decide", "stallo", "non si decide mai", "voto"],
    "premature-consensus": ["premature consensus", "false harmony", "no one objected", "silence", "everyone agrees", "fake consensus", "rushed agreement", "consenso frettoloso", "falsa armonia", "non ha obiettato", "silenzio", "tutti d'accordo", "finto consenso"],
    "benevolent-dictator": ["dictator", "dictatorship", "benevolent", "founder decides", "bottleneck", "single point of failure", "delegation", "burned out", "dittatore", "dittatura", "fondatore decide", "delega", "collo di bottiglia", "si è bruciato", "single point of failure", "bottleneck"],
    "coordination-fatigue": ["fatigue", "coordination", "burnout", "tired", "too many meetings", "too much time", "organize", "coordinate", "fatica", "coordinamento", "stanc", "call", "troppe riunioni", "troppo tempo", "coordinare", "organizzare"],
    "meeting-theatre": ["meeting", "meetings", "no decisions", "talk without", "discuss without", "theatre", "performance", "riunione", "call", "senza decisioni", "parlare senza", "discutere senza", "teatro"],
    "decision-evasion": ["decision", "evade", "defer", "avoid", "nobody decides", "procrastinate", "let's wait", "decisione", "evitare", "rimandare", "deferire", "nessuno decide", "rimandiamo", "aspettiamo"],
    "participation-theatre": ["participation", "participate", "appearance", "presence", "pretend", "token", "theatre", "partecipazione", "partecipare", "sembra", "presenza", "apparenza", "finta partecipazione", "partecipazione finta"],
    "cognitive-overload": ["overload", "too much info", "can't keep up", "information", "too many messages", "info", "sovraccarico", "troppe info", "non riesco a seguire", "informazioni", "troppi messaggi"],
    "responsibility-diffusion": ["responsibility", "diffusion", "no one does", "bystander", "not my job", "someone else", "waiting for", "responsabilità", "diffusione", "nessuno fa", "si aspettano", "non è compito mio", "qualcun altro"],
    "inclusivity-theatre": ["inclusion", "inclusivity", "diversity", "token", "representation", "performative", "inclusione", "inclusività", "rappresentanza", "inclusione finta", "diversity theatre"],
    "structure-paralysis": ["structure", "too many rules", "bureaucracy", "process", "procedures", "rigidity", "formalized", "struttura", "troppe regole", "burocrazia", "processo", "procedure", "formalizzato", "rigidità"],
    "founder-syndrome": ["founder", "can't let go", "succession", "transition", "delegate", "centralizes", "fondatore", "lasciare", "passaggio", "successione", "non sa delegare", "accentra"],
    "documentation-illusion": ["documentation", "wiki", "no one reads", "writing", "document", "ghost docs", "nobody reads", "documentazione", "non leggono", "scrivere", "documentare", "nessuno legge", "documentazione fantasma"],
    "misaligned-incentives": ["incentives", "misaligned", "motivation", "reward", "not aligned", "conflicting interests", "incentivi", "incentivo", "motivazione", "reward", "ricompensa", "non siamo allineati", "interessi divergenti"],
  };
  return map[vector] || [vector];
}

/**
 * Format the suggested field report as markdown.
 */
export function formatSuggestedReport(sr: SuggestedFieldReport): string {
  const lines: string[] = [];
  lines.push(`## 📝 Suggested Field Report\n`);
  lines.push(`**Template:** ${sr.template === "share-your-story" ? "📖 Share your story" : "🔍 Structural analysis"}`);
  lines.push(`**Suggested slug:** \`${sr.suggestedSlug}\``);
  lines.push(`**Suggested title:** ${sr.suggestedTitle}`);
  lines.push(`**Estimated tension:** ${sr.estimatedTensionIndex.toFixed(2)}`);
  lines.push(``);

  if (sr.detectedVectors.length > 0) {
    lines.push(`### Detected Failure Vectors`);
    for (const dv of sr.detectedVectors) {
      lines.push(`- **${dv.vector}** (confidence: ${(dv.confidence * 100).toFixed(0)}%) — ${dv.evidence}`);
    }
    lines.push(``);
  }

  if (sr.relatedEntries.length > 0) {
    lines.push(`### Corpus Matches Found`);
    for (const r of sr.relatedEntries.slice(0, 5)) {
      const icon = r.collection === "peeragogy" ? "📖" : "⚡";
      lines.push(`- ${icon} **${r.title}** (\`${r.slug}\`)`);
    }
    lines.push(``);
  }

  lines.push(`### Pre-filled Draft\n`);
  lines.push(`\`\`\`yaml`);
  lines.push(`# ${sr.template === "share-your-story" ? "📖 Share your story" : "🔍 Structural analysis"}`);
  for (const [key, val] of Object.entries(sr.prefill)) {
    lines.push(`${key}: "${val.replace(/"/g, "'")}"`);
  }
  lines.push(`\`\`\``);

  if (sr.note) {
    lines.push(``);
    lines.push(`> **Note:** ${sr.note}`);
  }

  return lines.join(`\n`);
}


// ─────────────────────────────────────────────────────────────
// SUPER-TOOL 3: gap-analysis
// ─────────────────────────────────────────────────────────────

/**
 * Results of the gap analysis.
 */
export interface GapAnalysis {
  /** Slugs that exist only in peeragogy (theory without field reports) */
  theoryOrphans: Array<{ slug: string; title: string; section?: string }>;
  /** Slugs that exist only in unpeeragogy (reality without theory) */
  realityOrphans: Array<{ slug: string; title: string; section?: string }>;
  /** Vectors not covered by any field report */
  uncoveredVectors: Array<{ vector: string; theoryCount: number; realityCount: number }>;
  /** Low-tension areas (suspected easy consensus) */
  lowTensionAreas: Array<{ slug: string; title: string; tension: number }>;
  /** Priority recommendations */
  priorities: Array<{ rank: number; type: string; recommendation: string; urgency: "alta" | "media" | "bassa" }>;
  /** General stats */
  stats: {
    totalTheories: number;
    totalRealities: number;
    dualCoverage: number;
    coveragePercent: number;
  };
}

/**
 * Scan the corpus and produce an epistemic gap map.
 */
export function analyzeGaps(): GapAnalysis {
  const entries = loadAllEntries();

  const peerEntries = entries.filter((e) => e.collection === "peeragogy");
  const unpeerEntries = entries.filter((e) => e.collection === "unpeeragogy");

  const peerSlugs = new Set(peerEntries.map((e) => e.slug));
  const unpeerSlugs = new Set(unpeerEntries.map((e) => e.slug));

  const allSlugs = new Set([...peerSlugs, ...unpeerSlugs]);

  // ── Orphans ─────────────────────────────────────────────
  const theoryOrphans: GapAnalysis["theoryOrphans"] = [];
  const realityOrphans: GapAnalysis["realityOrphans"] = [];

  for (const slug of allSlugs) {
    if (peerSlugs.has(slug) && !unpeerSlugs.has(slug)) {
      const p = peerEntries.find((e) => e.slug === slug)!;
      theoryOrphans.push({
        slug,
        title: p.frontmatter.title || slug,
        section: p.frontmatter.section,
      });
    }
    if (!peerSlugs.has(slug) && unpeerSlugs.has(slug)) {
      const u = unpeerEntries.find((e) => e.slug === slug)!;
      realityOrphans.push({
        slug,
        title: u.frontmatter.title || slug,
        section: u.frontmatter.section,
      });
    }
  }

  // ── Vector coverage ─────────────────────────────────────
  const allVectors = new Set<string>();
  for (const e of entries) {
    for (const v of e.frontmatter.vectors || []) {
      allVectors.add(v);
    }
  }

  const uncoveredVectors: GapAnalysis["uncoveredVectors"] = [];
  for (const vector of allVectors) {
    const inTheory = peerEntries.filter(
      (e) => e.frontmatter.vectors?.includes(vector)
    ).length;
    const inReality = unpeerEntries.filter(
      (e) => e.frontmatter.vectors?.includes(vector)
    ).length;
    uncoveredVectors.push({ vector, theoryCount: inTheory, realityCount: inReality });
  }

  // ── Low tension areas ───────────────────────────────────
  const lowTensionAreas: GapAnalysis["lowTensionAreas"] = [];
  for (const slug of allSlugs) {
    const u = unpeerEntries.find((e) => e.slug === slug);
    if (u && u.frontmatter.tension_index !== undefined && u.frontmatter.tension_index < 0.3) {
      lowTensionAreas.push({
        slug,
        title: u.frontmatter.title || slug,
        tension: u.frontmatter.tension_index,
      });
    }
  }
  lowTensionAreas.sort((a, b) => a.tension - b.tension).slice(0, 15);

  // ── Stats ───────────────────────────────────────────────
  const dualSlugs = [...allSlugs].filter(
    (s) => peerSlugs.has(s) && unpeerSlugs.has(s)
  );
  const stats = {
    totalTheories: peerSlugs.size,
    totalRealities: unpeerSlugs.size,
    dualCoverage: dualSlugs.length,
    coveragePercent:
      allSlugs.size > 0
        ? parseFloat(((dualSlugs.length / allSlugs.size) * 100).toFixed(1))
        : 0,
  };

  // ── Priorities ──────────────────────────────────────────
  const priorities: GapAnalysis["priorities"] = [];
  let rank = 1;

  // Priority 1: theory orphans with high vector count (likely important gaps)
  const weightedOrphans = theoryOrphans
    .map((o) => {
      const p = peerEntries.find((e) => e.slug === o.slug)!;
      const vecCount = p.frontmatter.vectors?.length || 0;
      const hasTags = (p.frontmatter.tags?.length || 0) > 0;
      return { ...o, vecCount, priority: vecCount * 2 + (hasTags ? 3 : 0) };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);

  for (const o of weightedOrphans) {
    priorities.push({
      rank: rank++,
      type: "field-report-needed",
      recommendation: `Field reports needed for "${o.title}" (\`${o.slug}\`). ${o.vecCount} failure vectors identified.`,
      urgency: o.vecCount >= 2 ? "alta" : "media",
    });
  }

  // Priority 2: uncovered vectors
  const priorityVectors = uncoveredVectors
    .filter((v) => v.realityCount === 0 && v.theoryCount > 0)
    .sort((a, b) => b.theoryCount - a.theoryCount)
    .slice(0, 5);

  for (const v of priorityVectors) {
    priorities.push({
      rank: rank++,
      type: "uncovered-vector",
      recommendation: `Vector "${v.vector}" is mentioned in ${v.theoryCount} theoretical patterns but has zero field reports. High priority for new contributions.`,
      urgency: "alta",
    });
  }

  // Priority 3: low tension areas (possible false consensus)
  for (const lta of lowTensionAreas.slice(0, 5)) {
    priorities.push({
      rank: rank++,
      type: "possible-false-consensus",
      recommendation: `"${lta.title}" has tension ${lta.tension.toFixed(2)} — possible easy consensus. The Perturbator recommends deeper examination.`,
      urgency: "media",
    });
  }

  // Priority 4: reality orphans (practice without theory)
  for (const ro of realityOrphans.slice(0, 3)) {
    priorities.push({
      rank: rank++,
      type: "theory-needed",
      recommendation: `"${ro.title}" exists as a field report but has no corresponding theory. Could be an emerging pattern to document.`,
      urgency: "bassa",
    });
  }

  return {
    theoryOrphans,
    realityOrphans,
    uncoveredVectors,
    lowTensionAreas,
    priorities,
    stats,
  };
}

/**
 * Format the gap analysis as markdown.
 */
export function formatGapAnalysis(g: GapAnalysis): string {
  const lines: string[] = [];
  lines.push(`## 🗺️ Gap Analysis — Epistemic Gap Map\n`);

  // Stats header
  lines.push(`### Stats`);
  lines.push(`- **${g.stats.totalTheories}** theory files (Peeragogy)`);
  lines.push(`- **${g.stats.totalRealities}** reality files (Unpeeragogy)`);
  lines.push(`- **${g.stats.dualCoverage}** slugs covered by both columns (**${g.stats.coveragePercent}%**)`);
  lines.push(``);

  // Orphans
  if (g.theoryOrphans.length > 0) {
    lines.push(`### 📖 Theory without Reality (${g.theoryOrphans.length})`);
    lines.push(`Slugs that exist only in Peeragogy — no field report to validate or falsify the theory.\n`);
    for (const o of g.theoryOrphans.slice(0, 10)) {
      lines.push(`- **${o.title}** (\`${o.slug}\`)${o.section ? ` — Section: ${o.section}` : ""}`);
    }
    if (g.theoryOrphans.length > 10) {
      lines.push(`- ... and ${g.theoryOrphans.length - 10} more`);
    }
    lines.push(``);
  }

  if (g.realityOrphans.length > 0) {
    lines.push(`### ⚡ Reality without Theory (${g.realityOrphans.length})`);
    lines.push(`Field reports without a corresponding theoretical pattern. They could be emerging patterns.\n`);
    for (const o of g.realityOrphans.slice(0, 10)) {
      lines.push(`- **${o.title}** (\`${o.slug}\`)`);
    }
    if (g.realityOrphans.length > 10) {
      lines.push(`- ... and ${g.realityOrphans.length - 10} more`);
    }
    lines.push(``);
  }

  // Priorities
  if (g.priorities.length > 0) {
    lines.push(`### 🚨 Priority Recommendations\n`);
    for (const p of g.priorities) {
      const urgencyIcon =
        p.urgency === "alta" ? "🔴" : p.urgency === "media" ? "🟡" : "🟢";
      lines.push(`${urgencyIcon} **[${p.rank}] ${p.recommendation}**`);
    }
    lines.push(``);
  }

  // Vector coverage summary
  const uncovered = g.uncoveredVectors.filter((v) => v.realityCount === 0);
  if (uncovered.length > 0) {
    lines.push(`### Vectors not covered by field reports`);
    for (const v of uncovered.slice(0, 10)) {
      lines.push(`- **${v.vector}** — mentioned in ${v.theoryCount} theory, **0 field reports**`);
    }
    lines.push(``);
  }

  if (g.lowTensionAreas.length > 0) {
    lines.push(`### ⚠️ Low-tension areas (possible false consensus)`);
    for (const lta of g.lowTensionAreas.slice(0, 8)) {
      lines.push(`- **${lta.title}** (\`${lta.slug}\`) — tension: **${lta.tension.toFixed(2)}**`);
    }
    lines.push(``);
  }

  return lines.join(`\n`);
}

export function injectFriction(
  topic: string,
  mode: "soft" | "hard" = "soft"
): string {
  const entries = loadAllEntries();

  // Find entries matching the topic
  const lowerTopic = topic.toLowerCase();
  const matching = entries.filter(
    (e) =>
      e.slug.toLowerCase().includes(lowerTopic) ||
      e.frontmatter.title.toLowerCase().includes(lowerTopic) ||
      e.body.toLowerCase().includes(lowerTopic)
  );

  const peerEntries = matching.filter((e) => e.collection === "peeragogy");
  const unpeerEntries = matching.filter((e) => e.collection === "unpeeragogy");

  if (matching.length === 0) {
    return `**⚡ Friction Note (${mode} mode):** Topic "${topic}" is not covered by the corpus. This silence is already a signal — perhaps the topic is too controversial to have been addressed.`;
  }

  let output: string[] = [];

  output.push(`# Friction analysis: "${topic}"`);
  output.push(`Mode: ${mode}\n`);

  if (peerEntries.length > 0) {
    output.push("## 📖 What theory says");
    for (const e of peerEntries) {
      output.push(`- **${e.frontmatter.title}** (${e.slug})`);
      if (e.frontmatter.description) {
        output.push(`  > ${e.frontmatter.description}`);
      }
    }
  }

  if (unpeerEntries.length > 0) {
    output.push("\n## ⚡ What reality shows");
    for (const e of unpeerEntries) {
      const ti =
        e.frontmatter.tension_index !== undefined
          ? ` [tension: ${e.frontmatter.tension_index.toFixed(2)}]`
          : "";
      output.push(`- **${e.frontmatter.title}**${ti}`);
      if (e.frontmatter.description) {
        output.push(`  > ${e.frontmatter.description}`);
      }
    }
  }

  // Friction synthesis
  output.push("\n## 🔥 Friction Synthesis");
  if (peerEntries.length > 0 && unpeerEntries.length > 0) {
    const peerVectors = new Set(
      peerEntries.flatMap((e) => e.frontmatter.vectors || [])
    );
    const unpeerVectors = new Set(
      unpeerEntries.flatMap((e) => e.frontmatter.vectors || [])
    );
    const onlyUnpeer = [...unpeerVectors].filter((v) => !peerVectors.has(v));

    if (onlyUnpeer.length > 0) {
      output.push(
        `Analysis reveals ${onlyUnpeer.length} failure vectors that theory ignores:`
      );
      for (const v of onlyUnpeer) {
        output.push(`- \`${v}\` — present in reality, absent from theory`);
      }
    } else {
      output.push(
        "The failure vectors are shared between theory and reality, " +
          "suggesting the problem is recognised but unresolved."
      );
    }
  } else if (peerEntries.length > 0 && unpeerEntries.length === 0) {
    output.push(
      "⚠️ Only theory exists for this topic. " +
        "The absence of a Reality column is itself a friction signal — " +
        "perhaps because the practice is too painful to document."
    );
  } else if (unpeerEntries.length > 0 && peerEntries.length === 0) {
    output.push(
      "⚠️ Only failure evidence exists, without a corresponding theory. " +
        "This is an anti-pattern without a pattern: pure friction."
    );
  }

  if (mode === "hard") {
    output.push(
      "\n\n*Hard mode: every claim must be accompanied by its contradiction.*"
    );
    output.push(
      "*If you find no friction in this analysis, the problem is in the analysis, not the system.*"
    );
  }

  return output.join("\n");
}