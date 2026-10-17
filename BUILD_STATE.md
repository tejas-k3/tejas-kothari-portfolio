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
- [x] 7 command palette (Ctrl/Cmd+K), hidden terminal, easter eggs
- [x] 8 SEO (meta, OG, sitemap, JSON-LD), 404, a11y, reduced motion, mobile QA
- [x] 9 final audit vs spec checklist; README with Cloudflare preview steps

NOTE: visual QA (screenshots desktop/mobile, both themes) still pending -> do in phase 8. Portrait quality is mediocre: revisit scripts/image_to_ascii.py params in phase 8 if time.

Phase 6 notes: build runs scripts/sync-github.mjs (public repos + contribution calendar; GraphQL if GITHUB_TOKEN env is set in Cloudflare build env, else public mirror). Snapshot committed at src/data/github.generated.json.
Client re-fetches the calendar on load; only the two summary numbers update live (heatmap cells stay at snapshot). Cloudflare: to refresh the snapshot automatically, add a Deploy Hook + cron (GitHub Action on main) -> mention in README (phase 9).
Phase 7 untested in browser yet: verify palette (Cmd/Ctrl+K), terminal (backtick), easter eggs, mode switching in phase 8 QA.

Phase 8 done: sitemap, 404, OG cards (scripts/make_og.py), per-page meta, mobile overflow fixed, palette verified in Chrome, no console errors.
OPEN ITEMS for Tejas: (1) site domain in astro.config.mjs is a PLACEHOLDER (tejaskothari.dev) -> canonical/OG/sitemap/robots use it; (2) "What I would change" for Rupee Engine; (3) interest specifics; (4) tone TODO(tone) tags; (5) ASCII portrait quality.
