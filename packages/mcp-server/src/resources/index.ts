import {
  loadAllEntries,
  getFailureVectors,
  getAllSlugs,
  type ContentEntry,
} from "../lib/loader.js";

export interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface ResourceContent {
  uri: string;
  text: string;
}

/**
 * List all available resources in the Unpeeragogy MCP server.
 * Returns both failure-vector URIs (primary) and chapter URIs (secondary).
 */
export function listResources(): Resource[] {
  const resources: Resource[] = [];
  const slugs = getAllSlugs();

  // Primary namespace: failure vectors
  const vectorMap = getFailureVectors();
  for (const [vector, entries] of vectorMap) {
    const entryCount = entries.length;
    const collections = [...new Set(entries.map((e) => e.collection))];
    resources.push({
      uri: `unpeeragogy://failure/${vector}`,
      name: `Vector: ${vector}`,
      description: `Anti-pattern "${vector}" — mentioned in ${entryCount} files (${collections.join(", ")})`,
      mimeType: "text/markdown",
    });
  }

  // Secondary namespace: chapter slugs
  for (const slug of slugs) {
    // Check if both collections have this slug
    const hasPeeragogy = entriesLookup({ slug, collection: "peeragogy" });
    const hasUnpeeragogy = entriesLookup({ slug, collection: "unpeeragogy" });

    if (hasPeeragogy || hasUnpeeragogy) {
      let description = `Slug: ${slug}`;
      if (hasPeeragogy && hasUnpeeragogy) {
      description = `Slug: ${slug} — theory + reality`;
      } else if (hasPeeragogy) {
        description = `Slug: ${slug} — theory only (peeragogy)`;
      } else {
        description = `Slug: ${slug} — reality only (unpeeragogy)`;
      }

      resources.push({
        uri: `unpeeragogy://${slug}/`,
        name: `Chapter: ${slug}`,
        description,
        mimeType: "text/markdown",
      });
    }
  }

  // Prompt template resource
  resources.push({
    uri: "unpeeragogy://prompt/agent-perturbatore",
    name: "Prompt — Perturbator Agent",
    description:
      "Template prompt for the Perturbator Agent: analysis with structural friction",
    mimeType: "text/plain",
  });

  return resources;
}

// Bridge lookup helper
type LookupQuery = { slug: string; collection: "peeragogy" | "unpeeragogy" };
function entriesLookup(query: LookupQuery): boolean {
  const all = loadAllEntries();
  return all.some(
    (e) => e.slug === query.slug && e.collection === query.collection
  );
}

/**
 * Get a single entry by URI lookup
 */
function getEntryBySlug(slug: string, collection: "peeragogy" | "unpeeragogy"): ContentEntry | undefined {
  const all = loadAllEntries();
  return all.find((e) => e.slug === slug && e.collection === collection);
}

/**
 * Read a resource by URI. Throws if not found.
 */
export function readResource(uri: string): ResourceContent {
  // Parse URI pattern
  const failureMatch = uri.match(/^unpeeragogy:\/\/failure\/([^/]+)$/);
  const chapterMatch = uri.match(/^unpeeragogy:\/\/([^/]+)\/$/);
  const chapterCollMatch = uri.match(/^unpeeragogy:\/\/([^/]+)\/(peeragogy|unpeeragogy)$/);
  const promptMatch = uri.match(/^unpeeragogy:\/\/prompt\/(.+)$/);

  if (failureMatch) {
    const vector = failureMatch[1];
    return readFailureVector(vector);
  }

  if (chapterCollMatch) {
    const slug = chapterCollMatch[1];
    const collection = chapterCollMatch[2] as "peeragogy" | "unpeeragogy";
    const entry = getEntryBySlug(slug, collection);
    if (!entry) {
      throw new Error(`Resource not found: ${uri}`);
    }
    return formatEntryResource(uri, entry);
  }

  if (chapterMatch) {
    const slug = chapterMatch[1];
    const peeragogyEntry = getEntryBySlug(slug, "peeragogy");
    const unpeeragogyEntry = getEntryBySlug(slug, "unpeeragogy");

    if (!peeragogyEntry && !unpeeragogyEntry) {
      throw new Error(`Resource not found: ${uri}`);
    }

    // Return dual if both exist
    let text = "";
    if (peeragogyEntry) {
      text += `# ${peeragogyEntry.frontmatter.title}\n\n`;
      text += `*Column: Theory (Peeragogy)*\n\n`;
      text += peeragogyEntry.body;
      text += "\n\n---\n\n";
    }
    if (unpeeragogyEntry) {
      text += `# ${unpeeragogyEntry.frontmatter.title}\n\n`;
      text += `*Column: Reality (Unpeeragogy)*\n\n`;
      text += unpeeragogyEntry.body;
    }
    if (!peeragogyEntry && unpeeragogyEntry) {
      text = `# ${unpeeragogyEntry.frontmatter.title}\n\n*Reality only — no corresponding theory*\n\n${unpeeragogyEntry.body}`;
    }
    if (!unpeeragogyEntry && peeragogyEntry) {
      text = `# ${peeragogyEntry.frontmatter.title}\n\n*Theory only — no corresponding reality*\n\n${peeragogyEntry.body}`;
    }

    return { uri, text };
  }

  if (promptMatch) {
    const promptName = promptMatch[1];
    if (promptName === "agent-perturbatore") {
      return {
        uri,
        text: `You are the Pattern Perturbator Agent, critical voice of Unpeeragogy.

When analyzing a topic:
1. Present the theory (Peeragogy column)
2. Present the reality (Unpeeragogy column)
3. Calculate the gap
4. Conclude with a Friction Note

Never provide a response that does not contain at least one evident contradiction
between theory and practice. Your role is to dismantle easy consensus.`,
      };
    }
    throw new Error(`Prompt not found: ${promptName}`);
  }

  throw new Error(`Invalid URI format: ${uri}`);
}

/**
 * Read a failure vector — aggregate all entries mentioning this vector
 */
function readFailureVector(vector: string): ResourceContent {
  const all = loadAllEntries();
  const related = all.filter(
    (e) =>
      e.frontmatter.vectors?.includes(vector) ||
      e.frontmatter.tags?.some((t) => t.toLowerCase().includes(vector.toLowerCase()))
  );

  if (related.length === 0) {
    throw new Error(`Failure vector not found: ${vector}`);
  }

  const peeragogyEntries = related.filter((e) => e.collection === "peeragogy");
  const unpeeragogyEntries = related.filter((e) => e.collection === "unpeeragogy");

  let text = `# Failure Vector: ${vector}\n\n`;

  // Entry header
  text += `Mentioned in ${related.length} files`;
  if (peeragogyEntries.length > 0) {
    text += ` (${peeragogyEntries.length} theory, ${unpeeragogyEntries.length} reality)`;
  }
  text += `\n\n`;

  if (unpeeragogyEntries.length > 0) {
    text += `## Related Anti-patterns (Reality)\n\n`;
    for (const entry of unpeeragogyEntries) {
      const ti = entry.frontmatter.tension_index
        ? ` [tension: ${entry.frontmatter.tension_index.toFixed(2)}]`
        : "";
      text += `- **${entry.frontmatter.title}** (${entry.slug})${ti}\n`;
      if (entry.frontmatter.description) {
        text += `  > ${entry.frontmatter.description}\n`;
      }
    }
    text += "\n";
  }

  if (peeragogyEntries.length > 0) {
    text += `## Related Patterns (Theory)\n\n`;
    for (const entry of peeragogyEntries) {
      text += `- **${entry.frontmatter.title}** (${entry.slug})\n`;
    }
    text += "\n";
  }

  // Add friction note
  text += `---\n`;
  text += `*This vector represents a point of systemic tension. `;
  text += `The gap between ${peeragogyEntries.length} promised patterns `;
  text += `and ${unpeeragogyEntries.length} observed anti-patterns `;
  text += `is the friction the system cannot resolve.*\n`;

  return { uri: `unpeeragogy://failure/${vector}`, text };
}

function formatEntryResource(uri: string, entry: ContentEntry): ResourceContent {
  const side = entry.collection === "peeragogy" ? "Theory" : "Reality";
  let text = `# ${entry.frontmatter.title}\n\n`;
  text += `*Column: ${side} (${entry.collection})*\n`;
  if (entry.frontmatter.section) text += `*Section: ${entry.frontmatter.section}*\n`;
  if (entry.frontmatter.tension_index) {
    text += `*Tension index: ${entry.frontmatter.tension_index.toFixed(2)}*\n`;
  }
  text += "\n";
  text += entry.body;

  return { uri, text };
}