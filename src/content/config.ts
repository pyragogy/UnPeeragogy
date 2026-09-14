import { defineCollection, z } from "astro:content";

const epistemicStatus = z.enum([
  "observed",
  "reported",
  "interpreted",
  "hypothesized",
  "corroborated",
  "contested",
  "revised",
]);

const verificationStatus = z.enum([
  "unverified",
  "source-linked",
  "partially-supported",
  "corroborated",
  "contested",
]);

const researchChannel = z.enum([
  "documentary",
  "field-report",
  "first-person",
  "repository",
  "public-record",
  "synthetic",
]);

const provenanceItem = z.object({
  id: z.string().optional(),
  kind: z.enum([
    "handbook",
    "field-report",
    "document",
    "repository",
    "discussion",
    "web-source",
    "dataset",
    "synthetic-scenario",
    "other",
  ]),
  uri: z.string().optional(),
  locator: z.string().optional(),
  author: z.string().optional(),
  date: z.string().optional(),
  claim: z.string().optional(),
  support: z.enum(["supports", "complicates", "contradicts", "context-only"]).optional(),
  note: z.string().optional(),
});

const peeragogy = defineCollection({
  schema: z.object({
    title: z.string(),
    section: z.string().optional(),
    order: z.number().optional(),
    description: z.string().optional(),
    readingTime: z.number().optional(),
    tags: z.array(z.string()).optional(),
    tension_index: z.number().min(0).max(3).optional(),
  }),
});

const unpeeragogy = defineCollection({
  schema: z.object({
    title: z.string(),
    section: z.string().optional(),
    order: z.number().optional(),
    description: z.string().optional(),
    readingTime: z.number().optional(),
    tags: z.array(z.string()).optional(),

    // Backwards-compatible scalar used throughout the current UI.
    // Canonical scale is 0..3. It is descriptive, not statistical.
    tension_index: z.number().min(0).max(3).optional(),

    // Where this entry came from. "field-report" is now a first-class origin.
    origin: z.enum([
      "seed",
      "audit-v2",
      "field-report",
      "documentary-audit",
      "manual-revision",
      "imported",
    ]).default("seed"),

    // Migration state. Existing entries may remain legacy while they are upgraded.
    // New research-grade records should be structured or verified.
    integrity_level: z.enum(["legacy", "structured", "verified", "contested"]).default("legacy"),

    // Two independent axes: where an interpretation is in its lifecycle,
    // and how strongly its supporting evidence has been verified.
    epistemic_status: epistemicStatus.optional(),
    verification_status: verificationStatus.optional(),

    // Method/provenance fields used by the research substrate.
    method_version: z.string().optional(),
    research_channels: z.array(researchChannel).optional(),
    provenance: z.array(provenanceItem).optional(),

    // Explicit marker for narratives used only to explain a mechanism.
    // Synthetic scenarios must never be presented as empirical incidents.
    synthetic_scenario: z.boolean().default(false),

    // Revision chain. Git history remains the ultimate audit trail,
    // these fields make the chain machine-readable.
    revised_from: z.string().optional(),
    revised_to: z.string().optional(),
    claim_id: z.string().optional(),
  }),
});

const logCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    month: z.string(),
    description: z.string(),
    metrics: z.object({
      nodeCount: z.number(),
      linkCount: z.number(),
      avgTension: z.number(),
      coverage: z.number(),
      density: z.number(),
      totalWords: z.number(),
      discussionsActive: z.number(),
    }),
    changes: z.array(z.object({
      type: z.enum(["discussion", "entry", "graph", "decision"]),
      description: z.string(),
      detail: z.string().optional(),
    })),
    buildTimestamp: z.string(),
  }),
});

export const collections = { peeragogy, unpeeragogy, log: logCollection };
