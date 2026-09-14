import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CONTENT_ROOT env var overrides the content path (for Docker/production)
// Fall back to relative path from packages/mcp-server/src/lib/loader.ts
const CONTENT_ROOT = process.env.CONTENT_ROOT || path.resolve(__dirname, "..", "..", "..", "..", "src", "content");

export type EpistemicStatus =
  | "observed"
  | "reported"
  | "interpreted"
  | "hypothesized"
  | "corroborated"
  | "contested"
  | "revised";

export type VerificationStatus =
  | "unverified"
  | "source-linked"
  | "partially-supported"
  | "corroborated"
  | "contested";

export type IntegrityLevel = "legacy" | "structured" | "verified" | "contested";

export type ResearchChannel =
  | "documentary"
  | "field-report"
  | "first-person"
  | "repository"
  | "public-record"
  | "synthetic";

export interface ProvenanceRecord {
  id?: string;
  kind?: string;
  uri?: string;
  locator?: string;
  author?: string;
  date?: string;
  claim?: string;
  support?: "supports" | "complicates" | "contradicts" | "context-only";
  note?: string;
}

export interface EntryFrontmatter {
  title: string;
  section?: string;
  order?: number;
  description?: string;
  readingTime?: number;
  tags?: string[];
  vectors?: string[];
  /** Canonical descriptive value on the project 0..3 scale. Never synthesised implicitly. */
  tension_index?: number;
  origin?: string;
  integrity_level?: IntegrityLevel;
  epistemic_status?: EpistemicStatus;
  verification_status?: VerificationStatus;
  method_version?: string;
  research_channels?: ResearchChannel[];
  provenance?: ProvenanceRecord[];
  synthetic_scenario?: boolean;
  claim_id?: string;
  revised_from?: string;
  revised_to?: string;
}

export interface ContentEntry {
  slug: string;
  collection: "peeragogy" | "unpeeragogy";
  frontmatter: EntryFrontmatter;
  body: string;
  filePath: string;
}

// Known failure vectors mapped from terms in content.
// Detection is a navigation aid, not empirical evidence and not a tension score.
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

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  return out.length ? out : undefined;
}

function finiteNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return value;
}

function parseFrontmatter(raw: string): { frontmatter: EntryFrontmatter; body: string } {
  const parsed = matter(raw);
  const data = parsed.data as Record<string, unknown>;

  const tension = finiteNumber(data.tension_index);
  const boundedTension = tension !== undefined && tension >= 0 && tension <= 3 ? tension : undefined;

  const provenance = Array.isArray(data.provenance)
    ? data.provenance.filter((p): p is ProvenanceRecord => typeof p === "object" && p !== null)
    : undefined;

  const frontmatter: EntryFrontmatter = {
    title: typeof data.title === "string" ? data.title : "",
    section: typeof data.section === "string" ? data.section : undefined,
    order: finiteNumber(data.order),
    description: typeof data.description === "string" ? data.description : undefined,
    readingTime: finiteNumber(data.readingTime),
    tags: stringArray(data.tags),
    vectors: stringArray(data.vectors),
    tension_index: boundedTension,
    origin: typeof data.origin === "string" ? data.origin : undefined,
    integrity_level: typeof data.integrity_level === "string" ? data.integrity_level as IntegrityLevel : undefined,
    epistemic_status: typeof data.epistemic_status === "string" ? data.epistemic_status as EpistemicStatus : undefined,
    verification_status: typeof data.verification_status === "string" ? data.verification_status as VerificationStatus : undefined,
    method_version: typeof data.method_version === "string" ? data.method_version : undefined,
    research_channels: stringArray(data.research_channels) as ResearchChannel[] | undefined,
    provenance,
    synthetic_scenario: typeof data.synthetic_scenario === "boolean" ? data.synthetic_scenario : undefined,
    claim_id: typeof data.claim_id === "string" ? data.claim_id : undefined,
    revised_from: typeof data.revised_from === "string" ? data.revised_from : undefined,
    revised_to: typeof data.revised_to === "string" ? data.revised_to : undefined,
  };

  return { frontmatter, body: parsed.content };
}

/**
 * Detect failure vectors from content body + tags.
 * Returns a deduplicated list of vector names.
 *
 * IMPORTANT: vector detection is heuristic indexing metadata only. It must not
 * be used as provenance, corroboration, or an implicit tension calculation.
 */
function detectVectors(frontmatter: EntryFrontmatter, body: string): string[] {
  const detected: string[] = [];
  const bodyLower = body.toLowerCase();

  for (const vector of KNOWN_VECTORS) {
    const inTags = frontmatter.tags?.some((t) => t.toLowerCase().includes(vector));
    const inBody = bodyLower.includes(vector.replace(/-/g, " "));
    if (inTags || inBody) detected.push(vector);
  }

  if (frontmatter.vectors) {
    for (const v of frontmatter.vectors) {
      if (!detected.includes(v)) detected.push(v);
    }
  }

  return detected;
}

/**
 * Load all MDX entries from both collections.
 *
 * The loader does not manufacture research values. In particular, a missing
 * tension_index remains missing; historical lexical/vector heuristics are no
 * longer promoted into a canonical research signal.
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

      entries.push({
        slug,
        collection,
        frontmatter: {
          ...frontmatter,
          vectors: vectors.length > 0 ? vectors : undefined,
        },
        body,
        filePath,
      });
    }
  }

  return entries;
}

export function loadCollection(collection: "peeragogy" | "unpeeragogy"): ContentEntry[] {
  return loadAllEntries().filter((e) => e.collection === collection);
}

export function getEntry(slug: string, collection: "peeragogy" | "unpeeragogy"): ContentEntry | undefined {
  return loadAllEntries().find((e) => e.slug === slug && e.collection === collection);
}

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

export function getAllSlugs(): string[] {
  const entries = loadAllEntries();
  return [...new Set(entries.map((e) => e.slug))];
}
