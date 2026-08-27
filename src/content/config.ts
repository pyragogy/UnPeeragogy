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
  }),
});

export const collections = { peeragogy, unpeeragogy };