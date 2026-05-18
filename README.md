# Tejas's Personal Portfolio — Metro Tiles

A live, interactive personal site built in the spirit of the Windows Phone / Metro UI. Every tile is a small, self-contained experience — a flippable card, a mini game, a music player, a live clock, an hourglass that visualises the time left until your next birthday, and more.

## ✨ Highlights

- **Metro tile grid** — colourful, animated, hover-and-flip cards with front/back content.
- **Horizontal career timeline** with real company logos (VIT shield, Sandvine, 1mg, Observe.AI, CoinTracker) and colour-coded highlight chips.
- **GitHub commits heatmap** with a hidden easter egg (triple-click 👀).
- **Pinned GitHub repos carousel** — Random-n-interesting & most-commits with one-liner descriptions.
- **Snake mini-game** — keyboard controls (Arrow keys / WASD), press `Space` to start.
- **Now Playing mini-player** — real Web Audio playback with play/pause/skip and a small playlist.
- **Bengaluru live weather** with custom SVG icons (sun, clouds, rain, storms).
- **Hourglass birthday countdown** — starts completely full on mount, settles down to the actual remaining time via an `easeOutCubic` animation.
- **Visitor greeting** — detects the visitor's locale/timezone and says hello; flip for a thank-you.
- **Resume view** — a clean, printable longform CV.

## 🧰 Tech Stack

| Layer | Choice |
|---|---|
| Framework | **TanStack Start v1** (React 19, SSR-capable, file-based routing) |
| Build tool | **Vite 7** |
| Styling | **Tailwind CSS v4** via `src/styles.css` (`@theme inline` + `oklch` tokens) |
| Animation | **Motion** (framer-motion successor) |
| Icons | **lucide-react** |
| UI primitives | **shadcn/ui** (Radix-based) |
| Language | **TypeScript** (strict) |
| Runtime target | **Cloudflare Workers** (via `wrangler.jsonc`) |
| Package manager | **Bun** |

## 🚀 Getting Started

```bash
bun install
bun run dev
```

Then open http://localhost:5173.

To build for production:

```bash
bun run build
```

## 📁 Where things live

| What you want to edit | File |
|---|---|
| Name, role, email, phone, location, song, birthday | `src/lib/portfolioData.ts` |
| Tile front/back copy & layout | `src/lib/portfolioData.ts` |
| Career timeline (orgs, roles, dates, logos, colours) | `src/components/MetroTile.tsx` (`TIMELINE` array) |
| Full résumé page | `src/components/ResumeView.tsx` |
| Pinned GitHub repos | `src/components/CommitsTile.tsx` |
| Now-playing playlist | `src/components/NowPlayingTile.tsx` |
| Weather location & icons | `src/components/WeatherTile.tsx` |
| Hourglass behaviour | `src/components/Hourglass.tsx` |
| Snake game | `src/components/SnakeGame.tsx` |
| Visitor greeting | `src/components/VisitorTile.tsx` |
| Design tokens (colours, shadows, gradients) | `src/styles.css` |

> Most user-facing strings are centralised in `src/lib/portfolioData.ts`. The timeline and résumé are deliberately co-located with their components because their structure is richer than plain key/value text — feel free to hoist them into a `resumeData.ts` if you want a single source of truth.

## 🥚 Easter Eggs

- Triple-click the **GitHub commits heatmap**.
- The **hourglass** is a real-time visualisation — sand grains drop at the correct rate to match days/hours left.

## 📦 Deploying

This project targets Cloudflare Workers via `wrangler.jsonc`. Any Lovable-published deployment works out of the box.

## 📝 License

Personal project — feel free to fork and remix, just swap out the content for your own.
