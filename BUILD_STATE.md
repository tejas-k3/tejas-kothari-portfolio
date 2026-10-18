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

Round 2 (user feedback): logos for tech stack (public/logos, simple-icons via CSS mask, light/dark brand tints), even grids + marquee; "More projects" heading;
effects (scroll progress, cursor spotlight, card tilt, magnetic buttons, counters, portrait row reveal + scan, heatmap wave, packet arrows, typed "code that writes code" demo);
accent switched to electric blue (+ cool neutrals); portrait replaced by simple pixel-art sunglasses character (scripts/make_portrait.py; image_to_ascii.py kept as braille converter).

Round 3: portrait = hand-authored 8-bit side-view sprite (scripts/make_portrait.py, 3 tones); tech stack = static always-coloured logo tiles in even 6-col rows (no marquee, no selection);
"Code that writes code" gained site.sh: sitemap tree + `echo <section>` navigation (src/scripts/shell.ts, fixed route table).

Round 4: portrait now via structure-based glyph matching (scripts/make_portrait.py, needs numpy+Pillow); view modes made explicit:
header segmented control + banner. Engineering = per-project "Under the hood" (architecture stages, decisions, trade-offs) + "used in" under each stack tile; Recruiter = compact summary card, hides portrait/demo/how-i-work/activity/interests, no motion.

Round 5 (UX restructure): multi-page (/, /work, /experience, /activity, /about) + case studies; home = hero, Netflix-style ProjectRow (hover previews), MiniSim ("Break the system" toy queueing model), CodeDemo + site.sh, contact.
Native cross-page View Transitions (CSS @view-transition) + Astro hover prefetch; chapter rail, sticky "Let's talk" pill, 30-second dialog, headline decode, timeline draw.

Round 6: alive.ts = footer status line (real interaction rate + rAF p95 frame time; green/amber/red) + routing packets on internal link clicks (dot + "GET /path" chip travels to the nav item, then navigates; skipped for reduced motion/recruiter);
heatmap "Replay the year" (GithubActivity); cursor-lit two-layer ASCII portrait with 3D tilt + idle drifting light (Portrait.astro/fx.ts); brief->built diff reveal on /work cards (content.ts `brief` fields derived from each project's `why`/`what`).

Round 7: /interests page (watch dial with live time + beat-rate sweep, CS2 crosshair arena, "Portfolio I dream of" 10L->40L chart, 3D travel globe from src/data/travel.ts [from,to] pairs; land = public/data/land.json from Natural Earth via world-atlas).
Every click now shows an HTTP status chip (alive.ts). Interests removed from /about cards -> link cards to /interests.
To add a trip: append [from, to] in src/data/travel.ts; unknown names need [lat, lon] in `places` (build fails with a message otherwise).

Round 8: travel redesign (TravelMap.astro): adaptive projection (flat regional map when trips span <55deg, globe otherwise, toggle), scoreboard derived from data (trips/places/countries/km/farthest),
trip log side panel with hover-highlight + click-to-focus, cluster pins with collision-free labels, "Play my trips" chronological tour with counters. Data: trips are [from,to,{when,mode,note}?] in src/data/travel.ts; places are [lat,lon,country].
Dates are approximate (from Tejas). Jaipur / Guwahati / Umngot River have no dates (shown as "date unknown").
