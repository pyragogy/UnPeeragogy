import { defineCollection, z } from "astro:content";

const handbook = defineCollection({
  schema: z.object({
    title: z.string(),
    section: z.string().optional(),
    order: z.number().optional(),
    description: z.string().optional(),
    readingTime: z.number().optional(), // minutes
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { handbook };