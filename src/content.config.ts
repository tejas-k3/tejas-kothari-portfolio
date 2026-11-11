import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const meta = {
  title: z.string(),
  date: z.coerce.date(),
  category: z.string().default("random"),
  series: z.string().optional(), // display name; the URL slug is derived
  part: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  summary: z.string().default(""),
  draft: z.boolean().default(false),
};

// Public posts: plain markdown, committed as-is. `encrypted: true` is rejected on purpose:
// this folder is in a public repo, so a locked post must go through `bun run seal` instead.
const blog = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/blog" }),
  schema: z.object({ ...meta, encrypted: z.boolean().default(false) }).refine((d) => !d.encrypted, {
    message: "encrypted: true post found in the public blog folder. Run `bun run seal` to encrypt it and move the plaintext to private/.",
  }),
});

// Locked posts: ciphertext + public metadata, written by scripts/seal.mjs. No plaintext lives here.
const sealed = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/sealed" }),
  schema: z.object({
    ...meta,
    secretTitle: z.boolean().default(false),
    mins: z.number().int().nonnegative().default(1),
    iter: z.number().int().positive(),
    salt: z.string(),
    iv: z.string(),
    ct: z.string(),
  }),
});

export const collections = { blog, sealed };
