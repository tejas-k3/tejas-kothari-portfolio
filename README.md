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

## Preview this branch on Cloudflare (without touching main)
1. Cloudflare dashboard → Workers & Pages → this project → Settings → Build → Branch control → enable **non-production branch builds**.
2. Build command `bun run build`; deploy command `npx wrangler deploy` (uses `wrangler.jsonc`, assets from `dist/`).
3. Push to `tejas-v3` → the preview URL appears under Deployments (branch `tejas-v3`).
4. Go live: open a PR `tejas-v3` → `main` and merge. `main` is unchanged until then.

## Keeping GitHub data fresh
The page refreshes headline numbers client-side on load; the full snapshot refreshes on every deploy. To refresh daily, create a Cloudflare **Deploy Hook** and call it from a scheduled GitHub Action on `main`.
