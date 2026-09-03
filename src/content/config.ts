import { defineCollection, z } from "astro:content";

const peeragogy = defineCollection({
  schema: z.object({
    title: z.string(),
    section: z.string().optional(),
    order: z.number().optional(),
    description: z.string().optional(),
    readingTime: z.number().optional(),
    tags: z.array(z.string()).optional(),
    tension_index: z.number().optional(),
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
    tension_index: z.number().optional(),
    origin: z.enum(["seed", "audit-v2"]).default("seed"),
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