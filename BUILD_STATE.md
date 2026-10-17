# tejas-v3 build state (resume file for the loop)

Stack: Astro 5 static site + vanilla TS, deployed via Cloudflare (wrangler.jsonc assets -> dist).
Rules: no resume work-history bullets (company/title/dates only); Rupee Engine described generically (README is source of truth: 13 algorithms, 1300+ NSE stocks per resume);
tone = weirdness 3/10, humor 5/10, every joke tagged `TODO(tone)`; light/dark adaptive; interests: watches, markets, code, travel (no invented specifics);
email+LinkedIn public, phone NOT public, location Bengaluru, India; no analytics (concise comment block only); no resume PDF published (contains phone).
Hero default: "I ENGINEER CODE / THAT WRITES CODE / THAT RUNS CODE / THAT SHIPS." (alternates in src/data/content.ts)

## Phases (tick when committed + pushed)
- [x] 0 branch tejas-v3 pushed, old code removed, Astro scaffold + config
- [ ] 1 content model src/data/content.ts
- [ ] 2 design tokens + layout + header (theme, mode toggle: story/engineering/recruiter)
- [ ] 3 hero + ASCII portrait (placeholder until photo; scripts/image-to-ascii.mjs)
- [ ] 4 selected work + experience + stack + currently + interests + contact
- [ ] 5 project pages: /projects/rupee-engine, /projects/system-design-playground (+ architecture explorer)
- [ ] 6 GitHub: scripts/sync-github.mjs + client refresh + freshness/stale/error states
- [ ] 7 command palette (Ctrl/Cmd+K), hidden terminal, easter eggs
- [ ] 8 SEO (meta, OG, sitemap, JSON-LD), 404, a11y, reduced motion, mobile QA
- [ ] 9 final audit vs spec checklist; README with Cloudflare preview steps
