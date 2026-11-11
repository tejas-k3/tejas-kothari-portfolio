# Tejas Kothari — portfolio (v3)

Static Astro site (vanilla TS, no UI framework), deployed on Cloudflare. Content lives in `src/data/`.

```bash
bun install
bun run dev        # local dev
bun run build      # syncs GitHub snapshot, then builds to dist/
bun run preview
python3 scripts/make_portrait.py <photo.jpg> 96   # regenerate ASCII portrait
python3 scripts/make_og.py                          # regenerate social cards
```

## Where things are
- `src/data/content.ts`: all copy (hero lines in `heroOptions`, CTA in `cta`). `TODO(tone)` marks jokes; `TODO(tejas)` marks items to confirm.
- `src/data/caseStudies.ts`: case studies + architecture explorer data (Rupee Engine is intentionally generic).
- `scripts/sync-github.mjs`: build-time GitHub snapshot (public data). Set `GITHUB_TOKEN` in the build env for the GraphQL calendar.
- Analytics: none by design; see the comment block in `src/layouts/Base.astro`.

## Blog (`/blog`)
Quick path: `bun run new -- "Title" [--private] [--category travel] [--series "Name" --part 2]` creates a post from the standard template (starts as `draft: true`; flip it when ready). Put `BLOG_PASSWORD=...` in `.env.local` (gitignored), then `bun run publish-post` seals private posts and commits only blog files (`-- --push` also pushes). Details below.
Markdown files, no backend. Push a file, it appears after the deploy.
- **Public post:** `src/content/blog/<slug>.md`. Frontmatter: `title`, `date`, `category` (travel / tech / random), optional `series` + `part`, `tags`, `summary`, `draft: true` (hidden in production, visible in dev). Images: put them in `public/blog/<slug>/` and use `![alt](/blog/<slug>/pic.webp)`.
- **Locked post** (the repo is public, so plaintext must never be committed): write it as `private/<slug>.md` (gitignored), or in `src/content/blog/` with `encrypted: true`, then run `bun run seal`. It prompts for the password, encrypts (PBKDF2 600k -> AES-256-GCM, gzipped, images inlined) into `src/content/sealed/<slug>.json`; commit that. One password for the whole blog: sealing checks it against existing posts, and `bun run seal --rotate` changes it. Optional `secretTitle: true` hides the title and summary until unlocked. Locked posts are left out of the RSS feed and sitemap, and are `noindex`.
- A build fails if a public post has `encrypted: true`, so a forgotten seal step can't publish plaintext once it reaches a build. Back up `private/` yourself: it is the only copy of the plaintext, and a lost password means lost posts.
- Readers unlock once per tab (password kept in `sessionStorage`; "lock again" clears it).

## Preview this branch on Cloudflare (without touching main)
1. Cloudflare dashboard → Workers & Pages → this project → Settings → Build → Branch control → enable **non-production branch builds**.
2. Build command `bun run build`; deploy command `npx wrangler deploy` (uses `wrangler.jsonc`, assets from `dist/`).
3. Push to `tejas-v3` → the preview URL appears under Deployments (branch `tejas-v3`).
4. Go live: open a PR `tejas-v3` → `main` and merge. `main` is unchanged until then.

## Keeping GitHub data fresh
The page refreshes headline numbers client-side on load; the full snapshot refreshes on every deploy. To refresh daily, create a Cloudflare **Deploy Hook** and call it from a scheduled GitHub Action on `main`.
