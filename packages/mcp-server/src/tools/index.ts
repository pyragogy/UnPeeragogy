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