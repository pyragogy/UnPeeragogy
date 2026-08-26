import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Paths relative to packages/mcp-server/src/lib/loader.ts
// We go up 3 levels to reach project root, then into src/content/
const CONTENT_ROOT = path.resolve(__dirname, "..", "..", "..", "..", "src", "content");

export interface EntryFrontmatter {
  title: string;
  section?: string;
  order?: number;
  description?: string;
  readingTime?: number;
  tags?: string[];
  vectors?: string[];
  tension_index?: number;
}

export interface ContentEntry {
  slug: string;
  collection: "peeragogy" | "unpeeragogy";
  frontmatter: EntryFrontmatter;
  body: string;
  // Full path for reference
  filePath: string;
}

// Known failure vectors mapped from terms in content
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

function frontmatterToErrorCount(frontmatter: EntryFrontmatter): number {
  let count = 0;
  if (frontmatter.tags) {
    for (const tag of frontmatter.tags) {
      if (KNOWN_VECTORS.some((v) => tag.toLowerCase().includes(v))) count++;
    }
  }
  if (frontmatter.vectors) count += frontmatter.vectors.length;
  return count;
}

/**
 * Extract YAML frontmatter from raw MDX text using simple regex
 * (avoids needing gray-matter for basic parsing, we use it for structured)
 */
function parseFrontmatter(raw: string): { frontmatter: EntryFrontmatter; body: string } {
  let frontmatter: EntryFrontmatter = { title: "" };
  let body = raw;

  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (match) {
    const yamlBlock = match[1];
    body = raw.slice(match[0].length);

    // Simple YAML field extraction (no full YAML parser needed for basic fields)
    const title = yamlBlock.match(/title:\s*"([^"]+)"/) || yamlBlock.match(/title:\s*'([^']+)'/);
    const section = yamlBlock.match(/section:\s*"([^"]+)"/);
    const order = yamlBlock.match(/order:\s*(\d+)/);
    const description = yamlBlock.match(/description:\s*"([^"]+)"/);
    const readingTime = yamlBlock.match(/readingTime:\s*(\d+)/);

    // Extract tags array
    const tagsMatch = yamlBlock.match(/tags:\s*(\[[\s\S]*?\])/);
    let tags: string[] = [];
    if (tagsMatch) {
      try {
        // Simple array parsing for string arrays
        tags = tagsMatch[1]
          .replace(/[\[\]]/g, "")
          .split(",")
          .map((t) => t.trim().replace(/["']/g, ""))
          .filter(Boolean);
      } catch {}
    }

    frontmatter = {
      title: title?.[1] || "",
      section: section?.[1] || undefined,
      order: order ? parseInt(order[1]) : undefined,
      description: description?.[1] || undefined,
      readingTime: readingTime ? parseInt(readingTime[1]) : undefined,
      tags: tags.length > 0 ? tags : undefined,
    };
  }

  return { frontmatter, body };
}

/**
 * Detect failure vectors from content body + tags
 * Returns a deduplicated list of vector names
 */
function detectVectors(frontmatter: EntryFrontmatter, body: string): string[] {
  const detected: string[] = [];
  const bodyLower = body.toLowerCase();

  for (const vector of KNOWN_VECTORS) {
    const inTags = frontmatter.tags?.some((t) => t.toLowerCase().includes(vector));
    const inBody = bodyLower.includes(vector.replace(/-/g, " "));
    if (inTags || inBody) {
      detected.push(vector);
    }
  }

  // Also check frontmatter.vectors
  if (frontmatter.vectors) {
    for (const v of frontmatter.vectors) {
      if (!detected.includes(v)) detected.push(v);
    }
  }

  return detected;
}

/**
 * Load all MDX entries from both collections
 */
export function loadAllEntries(): ContentEntry[] {
  const entries: ContentEntry[] = [];
  const collections = ["peeragogy", "unpeeragogy"] as const;

  for (const collection of collections) {
    const dirPath = path.join(CONTENT_ROOT, collection);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { frontmatter, body } = parseFrontmatter(raw);
      const slug = file.replace(/\.mdx$/, "");

      const vectors = detectVectors(frontmatter, body);
      const tensionIndex = frontmatterToErrorCount(frontmatter);

      entries.push({
        slug,
        collection,
        frontmatter: {
          ...frontmatter,
          vectors: vectors.length > 0 ? vectors : undefined,
          tension_index: tensionIndex > 0 ? Math.min(tensionIndex / 4, 2.0) : undefined,
        },
        body,
        filePath,
      });
    }
  }

  return entries;
}

/**
 * Load entries for a specific collection
 */
export function loadCollection(collection: "peeragogy" | "unpeeragogy"): ContentEntry[] {
  return loadAllEntries().filter((e) => e.collection === collection);
}

/**
 * Get a single entry by slug and collection
 */
export function getEntry(slug: string, collection: "peeragogy" | "unpeeragogy"): ContentEntry | undefined {
  return loadAllEntries().find((e) => e.slug === slug && e.collection === collection);
}

/**
 * Get all failure vectors with associated entries
 */
export function getFailureVectors(): Map<string, ContentEntry[]> {
  const entries = loadAllEntries();
  const vectorMap = new Map<string, ContentEntry[]>();

  for (const entry of entries) {
    const vectors = entry.frontmatter.vectors || [];
    for (const vector of vectors) {
      if (!vectorMap.has(vector)) vectorMap.set(vector, []);
      vectorMap.get(vector)!.push(entry);
    }
  }

  return vectorMap;
}

/**
 * Get all unique slugs across both collections
 */
export function getAllSlugs(): string[] {
  const entries = loadAllEntries();
  return [...new Set(entries.map((e) => e.slug))];
}