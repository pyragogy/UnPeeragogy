import MiniSearch from "minisearch";
import {
  loadAllEntries,
  type ContentEntry,
  type EntryFrontmatter,
} from "../lib/loader.js";
import {
  callPerturbatore,
  isPerturbatoreEnabled,
  type PerturbatoreInput,
  type PerturbatoreOutput,
} from "../lib/perturbatore.js";

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
    output.push("## 📖 Teoria (Peeragogy)");
    output.push(`**${peeragogy.frontmatter.title}**`);
    if (peeragogy.frontmatter.description) {
      output.push(`> ${peeragogy.frontmatter.description}`);
    }
    output.push("");
    output.push(peeragogy.body.slice(0, 2000));
  }

  if (unpeeragogy) {
    if (peeragogy) output.push("\n---\n");
    output.push("## ⚡ Realtà (Unpeeragogy)");
    output.push(`**${unpeeragogy.frontmatter.title}**`);
    if (unpeeragogy.frontmatter.description) {
      output.push(`> ${unpeeragogy.frontmatter.description}`);
    }
    if (unpeeragogy.frontmatter.tension_index) {
      output.push(
        `\n*Indice di tensione: ${unpeeragogy.frontmatter.tension_index.toFixed(2)}*\n`
      );
    }
    output.push("");
    output.push(unpeeragogy.body.slice(0, 2000));
  }

  if (!peeragogy && !unpeeragogy) {
    return `Nessun contenuto trovato per "${slug}".`;
  }

  if (!unpeeragogy) {
    output.push(
      "\n\n---\n*Nota: nessuna colonna Realtà disponibile per questo slug.*"
    );
    output.push(
      "*L'Agente Perturbatore sospetta che qui ci sia del consenso facile in attesa di essere smontato.*"
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
    return `Nessun contenuto per "${slug}".`;
  }

  const output: string[] = [];
  output.push(`# Analisi: ${slug}\n`);

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

  output.push(`## Vettori di fallimento`);
  if (vectors.size > 0) {
    for (const v of vectors) {
      output.push(`- \`${v}\``);
    }
  } else {
    output.push("Nessun vettore esplicito rilevato.");
    output.push("*L'Agente Perturbatore consiglia di riesaminare questo contenuto per attriti nascosti.*");
  }

  output.push(`\n## Tag`);
  if (tags.size > 0) {
    output.push([...tags].join(", "));
  } else {
    output.push("Nessun tag.");
  }

  if (peeragogy) {
    const wordCount = peeragogy.body.split(/\s+/).length;
    output.push(`\n## Teoria (${peeragogy.collection})`);
    output.push(`- Titolo: ${peeragogy.frontmatter.title}`);
    output.push(`- Sezione: ${peeragogy.frontmatter.section || "N/A"}`);
    output.push(`- Parole: ${wordCount}`);
  }

  if (unpeeragogy) {
    const wordCount = unpeeragogy.body.split(/\s+/).length;
    output.push(`\n## Realtà (${unpeeragogy.collection})`);
    output.push(`- Titolo: ${unpeeragogy.frontmatter.title}`);
    output.push(`- Sezione: ${unpeeragogy.frontmatter.section || "N/A"}`);
    output.push(`- Indice di tensione: ${unpeeragogy.frontmatter.tension_index?.toFixed(2) || "N/A"}`);
    output.push(`- Parole: ${wordCount}`);
  }

  if (peeragogy && unpeeragogy) {
    output.push(`\n## Scarto teoria/realtà`);
    const peerWords = peeragogy.body.split(/\s+/).length;
    const unpeerWords = unpeeragogy.body.split(/\s+/).length;
    const ratio = unpeerWords / Math.max(peerWords, 1);
    output.push(
      `La colonna Realtà è ${ratio > 1.2 ? "più estesa" : ratio < 0.8 ? "meno estesa" : "simile in estensione"} rispetto alla teoria.`
    );
    output.push(
      `Vettori condivisi: ${vectors.size > 0 ? [...vectors].join(", ") : "nessuno"}`
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
      return { slug, index: 0, interpretation: `Nessun contenuto per "${slug}".` };
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
    return { index: 0, interpretation: "Nessun contenuto Peeragogy nel corpus." };
  }

  const totalTi = unpeerEntries.reduce(
    (sum, e) => sum + (e.frontmatter.tension_index || 0),
    0
  );
  const avgTi = totalTi / Math.max(unpeerEntries.length, 1);

  return {
    index: avgTi,
    interpretation: `Tensione media su ${peerEntries.length} file teoria e ${unpeerEntries.length} file realtà: ${interpretTension(avgTi)}`,
  };
}

function interpretTension(index: number): string {
  if (index === 0) return "Nessuna tensione rilevata — possibile consenso facile.";
  if (index < 0.3) return "Tensione bassa — lieve discrepanza teoria/realtà.";
  if (index < 0.6) return "Tensione moderata — attrito strutturale presente.";
  if (index < 1.0) return "Tensione alta — contraddizioni significative.";
  if (index < 1.5) return "Tensione critica — il sistema mostra fratture profonde.";
  return "Tensione massima — collasso del pattern. Anti-pattern dominante.";
}

/**
 * Inject friction into a response for a given topic
 */
/**
 * Agente Perturbatore — chiamata live all'AI via Hetzner Inference API.
 * Usa GLM-5.2 (reasoning_effort: max) per generare un'analisi con attrito
 * strutturale. Richiede HETZNER_API_KEY configurata.
 */
export async function agentPerturbatore(
  topic: string,
  mode: "soft" | "hard" | "max" = "hard",
  theoryContext?: string
): Promise<string> {
  if (!isPerturbatoreEnabled()) {
    return (
      `**⚡ Agente Perturbatore — NON CONFIGURATO**\n\n` +
      `Per attivare l'Agente Perturbatore live con GLM-5.2 su Hetzner:\n` +
      `1. Ottieni un token su https://experiments.hetzner.com (App > Inference)\n` +
      `2. Imposta \`HETZNER_API_KEY\` nell'ambiente\n` +
      `3. Riavvia il server MCP\n\n` +
      `Intanto, ecco l'analisi statica basata sul corpus esistente:\n\n` +
      injectFriction(topic, mode === "max" ? "hard" : mode)
    );
  }

  // Trova contesto teoria se disponibile
  if (!theoryContext) {
    const entries = loadAllEntries();
    const lowerTopic = topic.toLowerCase();
    const peerEntry = entries.find(
      (e) =>
        e.collection === "peeragogy" &&
        (e.slug.toLowerCase().includes(lowerTopic) ||
          e.frontmatter.title.toLowerCase().includes(lowerTopic))
    );
    if (peerEntry) {
      theoryContext = peerEntry.body.slice(0, 3000);
    }
  }

  const result = await callPerturbatore({
    topic,
    theoryContext,
    mode,
  });

  if (result.error) {
    return (
      `**⚡ Agente Perturbatore — ERRORE**\n\n` +
      `Model: ${result.model}\n` +
      `Errore: ${result.error}\n\n` +
      `Fallback all'analisi statica:\n\n` +
      injectFriction(topic, mode === "max" ? "hard" : mode)
    );
  }

  let output = `## ⚡ Agente Perturbatore — Analisi con Attrito Strutturale\n\n`;
  output += `*Modello: ${result.model}*\n`;
  output += `*Tempo: ${(result.durationMs / 1000).toFixed(1)}s*\n`;
  output += `*Costo: $0 (Hetzner Inference API experimental)*\n\n`;
  output += `---\n\n`;

  if (result.reasoning) {
    output += `### 🧠 Ragionamento\n\n${result.reasoning}\n\n---\n\n`;
  }

  output += result.analysis;

  return output;
}

/**
 * Verifica se l'Agente Perturbatore AI è disponibile.
 */
export function isPerturbatoreAvailable(): boolean {
  return isPerturbatoreEnabled();
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
 * Costruisce il knowledge graph completo dei vettori di fallimento.
 *
 * Opzioni:
 *   query  — filtra il grafo a nodi che matchano la query + loro vicini (1-hop)
 *   vector — filtra il grafo a soli nodi che hanno QUEL vettore
 *   minWeight — soglia minima di edge weight per includere un arco (default 1)
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
      return emptyGraph(`Nessun nodo trovato per query: "${opts.query}"`);
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
      return emptyGraph(`Nessun nodo con vettore: "${opts.vector}"`);
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

*Grafo vuoto — nessun nodo corrisponde ai criteri.*

${graph.metadata.dominantVectors.length === 0 ? "*Il grafo è disponibile ma non contiene nodi." : ""}`;
  }

  const lines: string[] = [];
  lines.push(`## 🕸️ Knowledge Graph — Failure Vectors`);
  lines.push(``);
  lines.push(`**${graph.metadata.nodeCount}** nodi, **${graph.metadata.edgeCount}** archi, densità **${(graph.metadata.density * 100).toFixed(1)}%**`);
  lines.push(`Tensione media: **${graph.metadata.avgTension.toFixed(2)}** | Tensione max: **${graph.metadata.maxTension.toFixed(2)}**`);
  lines.push(``);

  // Dominant vectors
  if (graph.metadata.dominantVectors.length > 0) {
    lines.push(`### Vettori dominanti`);
    for (const dv of graph.metadata.dominantVectors) {
      const pct = ((dv.count / graph.metadata.nodeCount) * 100).toFixed(0);
      lines.push(`- **${dv.vector}** — presente in ${dv.count}/${graph.metadata.nodeCount} nodi (${pct}%)`);
    }
    lines.push(``);
  }

  // Subgraph: cluster ad alta tensione
  const highTension = graph.nodes.filter((n) => n.tensionIndex >= 1.0);
  if (highTension.length > 0) {
    lines.push(`### ⚡ Nodi a tensione critica (≥ 1.0)`);
    for (const n of highTension) {
      const col = n.collection === "peeragogy" ? "📖" : "⚡";
      lines.push(`- ${col} **${n.title}** (\`${n.slug}\`) — ti: **${n.tensionIndex.toFixed(2)}**`);
      if (n.vectors.length > 0) {
        lines.push(`  Vettori: ${n.vectors.map((v) => `\`${v}\``).join(", ")}`);
      }
    }
    lines.push(``);
  }

  // Bridges: nodi con più connessioni
  const nodeDegree = new Map<string, number>();
  for (const e of graph.edges) {
    nodeDegree.set(e.source, (nodeDegree.get(e.source) || 0) + 1);
    nodeDegree.set(e.target, (nodeDegree.get(e.target) || 0) + 1);
  }
  const topHubs = [...nodeDegree.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topHubs.length > 0) {
    lines.push(`### 🔗 Hub — nodi più connessi`);
    for (const [id, degree] of topHubs) {
      const n = graph.nodes.find((n) => n.id === id);
      if (!n) continue;
      lines.push(`- **${n.title}** (\`${n.slug}\`) — ${degree} connessioni`);
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

  lines.push(`### 📊 Dati strutturati (JSON)`);
  lines.push(`\`\`\`json`);
  lines.push(JSON.stringify(d3Data, null, 2));
  lines.push(`\`\`\``);

  return lines.join(`\n`);
}


// ─────────────────────────────────────────────────────────────
// SUPER-TOOL 2: suggest-field-report
// ─────────────────────────────────────────────────────────────

/**
 * Struttura di un field report suggerito.
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
 * Analizza testo libero e genera una bozza precompilata di field report.
 *
 * Input: testo libero (esperienza, dubbio, osservazione)
 * Output: template suggerito, slug, vettori, tension_index stimato
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
        evidence: `Menzione esplicita di "${readable}"`,
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
        evidence: `Rilevati ${matchCount} keyword: ${keywords.filter((k) => textLower.includes(k)).join(", ")}`,
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
      ? `Osservazione su ${detectedVectors[0].vector.replace(/-/g, " ")}`
      : "Nuova osservazione";
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
      "(Descrivi il gruppo: dimensioni, scopo, durata. Ometti dati identificativi.)";
    prefill["what-you-tried"] =
      detectedVectors.length > 0
        ? `Abbiamo provato ad applicare il pattern "${detectedVectors[0].vector.replace(/-/g, " ")}"...`
        : "(Cosa hai fatto, basandoti su quale pattern?)";
    prefill["what-happened"] = "(Cosa è successo. Sii specifico.)";
    prefill["interpretation"] =
      "(Cosa pensi significhi — distinto da cosa è successo.)";
    prefill["takeaway"] =
      "(Cosa diresti a qualcuno che sta per provare questo pattern?)";
    prefill["counter-evidence"] = "(Cosa potremmo sbagliare? Opzionale)";
  } else {
    prefill["entry-slug"] = suggestedSlug;
    prefill["position"] =
      detectedVectors.length > 0 && relatedEntries.length > 0
        ? "Extends"
        : "Question";
    prefill["analysis"] = text.slice(0, 2000);
    prefill["provenance"] =
      "(Da dove viene questa osservazione? Cita incidenti specifici.)";
    prefill["counter-evidence"] = "(Cosa, se esistesse, indebolirebbe la tua analisi?)";
  }

  // ── 8. Note ─────────────────────────────────────────────
  const noteParts: string[] = [];
  if (detectedVectors.length === 0) {
    noteParts.push(
      "Nessun vettore di fallimento riconosciuto automaticamente. La revisione manuale potrebbe identificarne."
    );
  }
  if (relatedEntries.length === 0) {
    noteParts.push(
      "Nessuna correlazione con slug esistenti. Potrebbe essere un pattern non ancora documentato."
    );
  }
  if (template === "share-your-story") {
    noteParts.push(
      "Template 'Share your story' suggerito — non è necessario conoscere la tassonomia per contribuire."
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
 * Keyword map per ogni vettore di fallimento.
 */
function vectorKeywords(vector: string): string[] {
  const map: Record<string, string[]> = {
    "free-rider": ["free rider", "free riders", "non contribuisce", "si appoggia", "lazy", "passenger", "parassita", "scrocca"],
    "consensus-paralysis": ["paralisi", "decisione", "bloccato", "non decide", "stallo", "consensus", "non si decide mai", "voto"],
    "premature-consensus": ["consenso frettoloso", "falsa armonia", "non ha obiettato", "silenzio", "tutti d'accordo", "finto consenso"],
    "benevolent-dictator": ["dittatore", "dittatura", "benevolent", "fondatore decide", "delega", "collo di bottiglia", "si è bruciato", "single point of failure", "bottleneck"],
    "coordination-fatigue": ["fatica", "coordinamento", "burnout", "stanc", "call", "troppe riunioni", "troppo tempo", "coordinare", "organizzare"],
    "meeting-theatre": ["riunione", "meeting", "call", "senza decisioni", "parlare senza", "discutere senza", "teatro"],
    "decision-evasion": ["decisione", "evitare", "rimandare", "deferire", "nessuno decide", "rimandiamo", "aspettiamo"],
    "participation-theatre": ["partecipazione", "partecipare", "sembra", "presenza", "apparenza", "finta partecipazione", "partecipazione finta"],
    "cognitive-overload": ["sovraccarico", "troppe info", "overload", "non riesco a seguire", "informazioni", "troppi messaggi", "info"],
    "responsibility-diffusion": ["responsabilità", "diffusione", "nessuno fa", "si aspettano", "bystander", "non è compito mio", "qualcun altro"],
    "inclusivity-theatre": ["inclusione", "inclusività", "diversity", "token", "rappresentanza", "inclusione finta", "diversity theatre"],
    "structure-paralysis": ["struttura", "troppe regole", "burocrazia", "processo", "procedure", "formalizzato", "rigidità"],
    "founder-syndrome": ["fondatore", "founder", "lasciare", "passaggio", "successione", "non sa delegare", "accentra"],
    "documentation-illusion": ["documentazione", "wiki", "non leggono", "scrivere", "documentare", "nessuno legge", "documentazione fantasma"],
    "misaligned-incentives": ["incentivi", "incentivo", "motivazione", "reward", "ricompensa", "non siamo allineati", "interessi divergenti"],
  };
  return map[vector] || [vector];
}

/**
 * Formatta il field report suggerito in markdown.
 */
export function formatSuggestedReport(sr: SuggestedFieldReport): string {
  const lines: string[] = [];
  lines.push(`## 📝 Field Report Suggerito\n`);
  lines.push(`**Template:** ${sr.template === "share-your-story" ? "📖 Share your story" : "🔍 Structural analysis"}`);
  lines.push(`**Slug suggerito:** \`${sr.suggestedSlug}\``);
  lines.push(`**Titolo suggerito:** ${sr.suggestedTitle}`);
  lines.push(`**Tensione stimata:** ${sr.estimatedTensionIndex.toFixed(2)}`);
  lines.push(``);

  if (sr.detectedVectors.length > 0) {
    lines.push(`### Vettori di fallimento rilevati`);
    for (const dv of sr.detectedVectors) {
      lines.push(`- **${dv.vector}** (confidenza: ${(dv.confidence * 100).toFixed(0)}%) — ${dv.evidence}`);
    }
    lines.push(``);
  }

  if (sr.relatedEntries.length > 0) {
    lines.push(`### Correlazioni trovate nel corpus`);
    for (const r of sr.relatedEntries.slice(0, 5)) {
      const icon = r.collection === "peeragogy" ? "📖" : "⚡";
      lines.push(`- ${icon} **${r.title}** (\`${r.slug}\`)`);
    }
    lines.push(``);
  }

  lines.push(`### Bozza precompilata\n`);
  lines.push(`\`\`\`yaml`);
  lines.push(`# ${sr.template === "share-your-story" ? "📖 Share your story" : "🔍 Structural analysis"}`);
  for (const [key, val] of Object.entries(sr.prefill)) {
    lines.push(`${key}: "${val.replace(/"/g, "'")}"`);
  }
  lines.push(`\`\`\``);

  if (sr.note) {
    lines.push(``);
    lines.push(`> **Nota:** ${sr.note}`);
  }

  return lines.join(`\n`);
}


// ─────────────────────────────────────────────────────────────
// SUPER-TOOL 3: gap-analysis
// ─────────────────────────────────────────────────────────────

/**
 * Risultato della gap analysis.
 */
export interface GapAnalysis {
  /** Slugh che esistono solo in peeragogy (teoria senza field report) */
  theoryOrphans: Array<{ slug: string; title: string; section?: string }>;
  /** Slugh che esistono solo in unpeeragogy (realtà senza teoria) */
  realityOrphans: Array<{ slug: string; title: string; section?: string }>;
  /** Vettori non coperti da nessun field report */
  uncoveredVectors: Array<{ vector: string; theoryCount: number; realityCount: number }>;
  /** Aree a bassa tensione (consenso facile sospetto) */
  lowTensionAreas: Array<{ slug: string; title: string; tension: number }>;
  /** Raccomandazioni prioritarie */
  priorities: Array<{ rank: number; type: string; recommendation: string; urgency: "alta" | "media" | "bassa" }>;
  /** Statistiche generali */
  stats: {
    totalTheories: number;
    totalRealities: number;
    dualCoverage: number;
    coveragePercent: number;
  };
}

/**
 * Scansiona il corpus e produce una mappa delle lacune epistemiche.
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
      recommendation: `Servono field report per "${o.title}" (\`${o.slug}\`). ${o.vecCount} vettori di fallimento identificati.`,
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
      recommendation: `Il vettore "${v.vector}" è menzionato in ${v.theoryCount} pattern teorici ma non ha field report. Priorità alta per nuovi contributi.`,
      urgency: "alta",
    });
  }

  // Priority 3: low tension areas (possible false consensus)
  for (const lta of lowTensionAreas.slice(0, 5)) {
    priorities.push({
      rank: rank++,
      type: "possible-false-consensus",
      recommendation: `"${lta.title}" ha tensione ${lta.tension.toFixed(2)} — possibile consenso facile. L'Agente Perturbatore raccomanda un esame più approfondito.`,
      urgency: "media",
    });
  }

  // Priority 4: reality orphans (practice without theory)
  for (const ro of realityOrphans.slice(0, 3)) {
    priorities.push({
      rank: rank++,
      type: "theory-needed",
      recommendation: `"${ro.title}" esiste come field report ma non ha una teoria corrispondente. Potrebbe essere un pattern emergente da documentare.`,
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
 * Formatta la gap analysis in markdown.
 */
export function formatGapAnalysis(g: GapAnalysis): string {
  const lines: string[] = [];
  lines.push(`## 🗺️ Gap Analysis — Mappa delle Lacune Epistemiche\n`);

  // Stats header
  lines.push(`### Statistiche`);
  lines.push(`- **${g.stats.totalTheories}** file teoria (Peeragogy)`);
  lines.push(`- **${g.stats.totalRealities}** file realtà (Unpeeragogy)`);
  lines.push(`- **${g.stats.dualCoverage}** slug coperti da entrambe le colonne (**${g.stats.coveragePercent}%**)`);
  lines.push(``);

  // Orphans
  if (g.theoryOrphans.length > 0) {
    lines.push(`### 📖 Teoria senza Realtà (${g.theoryOrphans.length})`);
    lines.push(`Slug che esistono solo in Peeragogy — nessun field report per validare o falsificare la teoria.\n`);
    for (const o of g.theoryOrphans.slice(0, 10)) {
      lines.push(`- **${o.title}** (\`${o.slug}\`)${o.section ? ` — Sezione: ${o.section}` : ""}`);
    }
    if (g.theoryOrphans.length > 10) {
      lines.push(`- ... e ${g.theoryOrphans.length - 10} altri`);
    }
    lines.push(``);
  }

  if (g.realityOrphans.length > 0) {
    lines.push(`### ⚡ Realtà senza Teoria (${g.realityOrphans.length})`);
    lines.push(`Field report senza un pattern teorico corrispondente. Potrebbero essere pattern emergenti.\n`);
    for (const o of g.realityOrphans.slice(0, 10)) {
      lines.push(`- **${o.title}** (\`${o.slug}\`)`);
    }
    if (g.realityOrphans.length > 10) {
      lines.push(`- ... e ${g.realityOrphans.length - 10} altri`);
    }
    lines.push(``);
  }

  // Priorities
  if (g.priorities.length > 0) {
    lines.push(`### 🚨 Raccomandazioni Prioritarie\n`);
    for (const p of g.priorities) {
      const urgencyIcon =
        p.urgency === "alta" ? "🔴" : p.urgency === "media" ? "🟡" : "🟢";
      lines.push(`${urgencyIcon} **[${p.rank}] ${p.recommendation}`);
    }
    lines.push(``);
  }

  // Vector coverage summary
  const uncovered = g.uncoveredVectors.filter((v) => v.realityCount === 0);
  if (uncovered.length > 0) {
    lines.push(`### Vettori non coperti da field report`);
    for (const v of uncovered.slice(0, 10)) {
      lines.push(`- **${v.vector}** — menzionato in ${v.theoryCount} teoria, **0 field report**`);
    }
    lines.push(``);
  }

  if (g.lowTensionAreas.length > 0) {
    lines.push(`### ⚠️ Aree a bassa tensione (possibile falso consenso)`);
    for (const lta of g.lowTensionAreas.slice(0, 8)) {
      lines.push(`- **${lta.title}** (\`${lta.slug}\`) — tensione: **${lta.tension.toFixed(2)}**`);
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
    return `**⚡ Friction Note (${mode} mode):** L'argomento "${topic}" non è coperto dal corpus. Questo silenzio è già un segnale — forse il tema è troppo controverso per essere stato affrontato.`;
  }

  let output: string[] = [];

  output.push(`# Analisi con attrito: "${topic}"`);
  output.push(`Modalità: ${mode}\n`);

  if (peerEntries.length > 0) {
    output.push("## 📖 Cosa dice la teoria");
    for (const e of peerEntries) {
      output.push(`- **${e.frontmatter.title}** (${e.slug})`);
      if (e.frontmatter.description) {
        output.push(`  > ${e.frontmatter.description}`);
      }
    }
  }

  if (unpeerEntries.length > 0) {
    output.push("\n## ⚡ Cosa mostra la realtà");
    for (const e of unpeerEntries) {
      const ti =
        e.frontmatter.tension_index !== undefined
          ? ` [tensione: ${e.frontmatter.tension_index.toFixed(2)}]`
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
        `L'analisi rivela ${onlyUnpeer.length} vettori di fallimento che la teoria ignora:`
      );
      for (const v of onlyUnpeer) {
        output.push(`- \`${v}\` — presente nella realtà, assente nella teoria`);
      }
    } else {
      output.push(
        "I vettori di fallimento sono condivisi tra teoria e realtà, " +
          "suggerendo che il problema è riconosciuto ma non risolto."
      );
    }
  } else if (peerEntries.length > 0 && unpeerEntries.length === 0) {
    output.push(
      "⚠️ Esiste solo la teoria per questo argomento. " +
        "L'assenza di una colonna Realtà è essa stessa un segnale di attrito — " +
        "forse perché la pratica è troppo dolorosa da documentare."
    );
  } else if (unpeerEntries.length > 0 && peerEntries.length === 0) {
    output.push(
      "⚠️ Esiste solo l'evidenza di fallimento, senza una teoria corrispondente. " +
        "Questo è un anti-pattern senza pattern: l'attrito puro."
    );
  }

  if (mode === "hard") {
    output.push(
      "\n\n*Hard mode: ogni affermazione deve essere accompagnata dalla sua contraddizione.*"
    );
    output.push(
      "*Se non trovi attrito in questa analisi, il problema è nell'analisi, non nel sistema.*"
    );
  }

  return output.join("\n");
}