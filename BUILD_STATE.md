# tejas-v3 build state (resume file for the loop)

Stack: Astro 5 static site + vanilla TS, deployed via Cloudflare (wrangler.jsonc assets -> dist).
Rules: no resume work-history bullets (company/title/dates only); Rupee Engine described generically (README is source of truth: 13 algorithms, 1300+ NSE stocks per resume);
tone = weirdness 3/10, humor 5/10, every joke tagged `TODO(tone)`; light/dark adaptive; interests: watches, markets, code, travel (no invented specifics);
email+LinkedIn public, phone not shown on page; location Bengaluru, India; no analytics (comment block only). Resume PDF IS published at /Tejas_Kothari_Resume.pdf as download-only (Tejas approved; robots-disallowed). Primary CTA = "Let's talk". Portrait = ASCII art from ~/Downloads/gojo_pfp.jpg with cool sunglasses (Tejas approved reference).
Hero default: "I ENGINEER CODE / THAT WRITES CODE / THAT RUNS CODE / THAT SHIPS." (alternates in src/data/content.ts)

## Phases (tick when committed + pushed)
- [x] 0 branch tejas-v3 pushed, old code removed, Astro scaffold + config
- [x] 1 content model src/data/content.ts
- [x] 2 design tokens + layout + header (theme, mode toggle: story/engineering/recruiter)
- [x] 3 hero + ASCII portrait (placeholder until photo; scripts/image-to-ascii.mjs)
- [x] 4 selected work + experience + stack + currently + interests + contact
- [x] 5 project pages: /projects/rupee-engine, /projects/system-design-playground (+ architecture explorer)
- [x] 6 GitHub: scripts/sync-github.mjs + client refresh + freshness/stale/error states
- [ ] 7 command palette (Ctrl/Cmd+K), hidden terminal, easter eggs
- [ ] 8 SEO (meta, OG, sitemap, JSON-LD), 404, a11y, reduced motion, mobile QA
- [ ] 9 final audit vs spec checklist; README with Cloudflare preview steps

NOTE: visual QA (screenshots desktop/mobile, both themes) still pending -> do in phase 8. Portrait quality is mediocre: revisit scripts/image_to_ascii.py params in phase 8 if time.

Phase 6 notes: build runs scripts/sync-github.mjs (public repos + contribution calendar; GraphQL if GITHUB_TOKEN env is set in Cloudflare build env, else public mirror). Snapshot committed at src/data/github.generated.json.
Client re-fetches the calendar on load; only the two summary numbers update live (heatmap cells stay at snapshot). Cloudflare: to refresh the snapshot automatically, add a Deploy Hook + cron (GitHub Action on main) -> mention in README (phase 9).
