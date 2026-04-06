import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const about = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/about" }),
  schema: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    work: z.string().optional(),
    section: z.string().optional(),
  }),
});

export const collections = { about };
