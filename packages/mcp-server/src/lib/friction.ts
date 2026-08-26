import type { ContentEntry } from "./loader.js";
import type { EntryFrontmatter } from "./loader.js";

/**
 * Friction middleware — checks if a response contains friction elements.
 * Injects a "Friction Note" when it detects compliance without critique.
 */

export type FrictionMode = "off" | "soft" | "hard";

/**
 * Generate a friction note for a given topic based on contradictions
 * between peeragogy theory and unpeeragogy reality.
 */
export function generateFrictionNote(
  topic: string,
  peeragogyEntry?: ContentEntry,
  unpeeragogyEntry?: ContentEntry,
  mode: FrictionMode = "soft"
): string | null {
  if (mode === "off") return null;

  const contradictions: string[] = [];

  if (peeragogyEntry && unpeeragogyEntry) {
    const theoryTerms = extractKeyTerms(peeragogyEntry.body);
    const realityTerms = extractKeyTerms(unpeeragogyEntry.body);

    // Find contradictions — terms that appear optimistic in theory
    // but are contradicted in reality
    const optimismSignals = ["everyone", "everyone can", "shared", "collective", "consensus", "together", "open", "free", "collaborative"];
    const frictionSignals = ["fails", "problem", "conflict", "free rider", "burnout", "stalled", "blocked", "frustration", "uncomfortable"];

    for (const signal of optimismSignals) {
      if (theoryTerms.includes(signal) && realityTerms.some((t) => frictionSignals.includes(t))) {
        contradictions.push(
          `${signal} — presente nella teoria ma contraddetto dalla realtà operativa`
        );
      }
    }

    // Check tension index
    if (unpeeragogyEntry.frontmatter.tension_index && unpeeragogyEntry.frontmatter.tension_index > 0.5) {
      contradictions.push(
        `tensione sistemica: ${unpeeragogyEntry.frontmatter.tension_index.toFixed(2)} — ` +
        `la realtà mostra più attrito di quanto la teoria ammetta`
      );
    }
  }

  if (contradictions.length === 0 && mode === "hard") {
    return `**⚡ Friction Note (hard mode):** L'argomento "${topic}" è stato presentato senza contraddizioni evidenti. Questo potrebbe indicare che l'analisi è troppo accomodante. L'Agente Perturbatore raccomanda un esame più approfondito degli attriti nascosti.`;
  }

  if (contradictions.length === 0) return null;

  const frictionNote = [
    `**⚡ Friction Note**`,
    `Analizzando "${topic}":`,
    ...contradictions.map((c) => `- ${c}`),
    mode === "hard" ? `\n*Modalità hard: nessuna conclusione senza attrito esplicito.*` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return frictionNote;
}

/**
 * Extract key terms from body text (simple frequency-based)
 */
function extractKeyTerms(body: string, maxTerms: number = 30): string[] {
  const words = body
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const stopWords = new Set([
    "this", "that", "with", "from", "they", "have", "been", "were",
    "what", "which", "their", "there", "about", "would", "could",
    "should", "more", "some", "them", "into", "than", "then",
    "also", "just", "each", "other", "very", "when", "make",
    "like", "time", "does", "done", "made", "much", "many",
    "such", "over", "most", "after", "before", "where", "while",
    "everyone", "the", "and", "for", "are", "but", "not", "you",
    "all", "can", "has", "was", "its", "one", "two", "three",
    "first", "second", "third", "new", "way", "see", "well",
    "here", "know", "get", "got", "come", "came", "take", "took",
    "use", "used", "need", "needs", "might", "right", "good",
    "part", "work", "group", "page", "edit",
  ]);

  const freq = new Map<string, number>();
  for (const word of words) {
    if (!stopWords.has(word) && word.length > 2) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTerms)
    .map(([word]) => word);
}

/**
 * Check if a response has sufficient friction content
 */
export function hasFriction(response: string): boolean {
  const frictionIndicators = [
    "contraddizion",
    "attrito",
    "falliment",
    "friction",
    "ma in realtà",
    "tuttavia",
    "d'altra parte",
    "problema",
    "tensione",
    "antipattern",
    "perturbatore",
  ];
  return frictionIndicators.some((indicator) =>
    response.toLowerCase().includes(indicator)
  );
}