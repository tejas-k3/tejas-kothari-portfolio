export type TileShape = [number, number]; // [cols, rows] on 12-col grid

export type TileColor =
  | "blue" | "teal" | "green" | "lime" | "orange" | "red"
  | "magenta" | "purple" | "indigo" | "amber" | "pink" | "cyan";

export interface TileData {
  id: string;
  color: TileColor;
  kind:
    | "hero" | "now" | "location" | "email" | "linkedin"
    | "github" | "phone" | "skills" | "stat" | "education"
    | "project" | "resume" | "languages" | "quote" | "experience"
    | "birthday" | "night" | "visitor" | "weather" | "heatmap"
    | "commits" | "game" | "randomizer" | "watch";
  // Allowed footprints on the 12-col grid. First is preferred.
  shapes: TileShape[];
  href?: string;
  front: { label: string; value?: string };
  back: { title: string; body: string; meta?: string };
}

export const PROFILE = {
  name: "Tejas Kothari",
  role: "Software Engineer",
  current: "CoinTracker · SE II",
  location: "Bengaluru, India",
  email: "tejaskothari03@gmail.com",
  phone: "+91 96440 49059",
  linkedin: "linkedin.com/in/tejaskothari03",
  github: "github.com/tejas-k3",
  
  birthday: { month: 11, day: 3 }, // November 3
};

export const TILES: TileData[] = [
  {
    id: "hero",
    color: "blue",
    kind: "hero",
    shapes: [[8, 4], [6, 5], [6, 4], [8, 5]],
    front: { label: PROFILE.name, value: PROFILE.role },
    back: {
      title: "Hello, I'm Tejas",
      body: "Software engineer with ~5 years of experience in backend and infra development. Enjoys solving problems in distributed and scalable environments.",
    },
  },
  {
    id: "now",
    color: "green",
    kind: "now",
    shapes: [[4, 2], [3, 3], [6, 2]],
    front: { label: "Currently", value: "CoinTracker" },
    back: {
      title: "Software Engineer II",
      body: "Leading blockchain integrations (Bittensor, Starknet, Tezos) and fixing balance discrepancies across 5 chains.",
      meta: "Dec 2025 — Apr 2026",
    },
  },
  {
    id: "github-cta",
    color: "purple",
    kind: "github",
    shapes: [[3, 2], [2, 2], [4, 2]],
    href: "https://github.com/tejas-k3",
    front: { label: "GitHub", value: "@tejas-k3 →" },
    back: { title: "My code", body: "github.com/tejas-k3 — projects, experiments, scrapbook." },
  },
  {
    id: "birthday",
    color: "amber",
    kind: "birthday",
    shapes: [[4, 2], [3, 3], [6, 2]],
    front: { label: "Birthday in", value: "—" },
    back: {
      title: "Nov 3 — sand running",
      body: "Hourglass counting down to my next birthday. Gifts, samosas, and pull-requests all accepted.",
    },
  },
  {
    id: "location",
    color: "teal",
    kind: "location",
    shapes: [[2, 2], [3, 2]],
    front: { label: "Based in", value: PROFILE.location },
    back: { title: "Bengaluru, IN", body: "Coffee, traffic, 1000m elevation. The good kind of weather all year." },
  },
  {
    id: "email",
    color: "orange",
    kind: "email",
    shapes: [[4, 2], [3, 2], [6, 2]],
    front: { label: "Email", value: "tejaskothari03@…" },
    back: { title: "Say hi", body: PROFILE.email },
  },
  {
    id: "linkedin",
    color: "indigo",
    kind: "linkedin",
    shapes: [[3, 2], [2, 2], [4, 2]],
    href: "https://www.linkedin.com/in/tejaskothari03",
    front: { label: "LinkedIn", value: "/tejaskothari03" },
    back: { title: "Connect", body: PROFILE.linkedin },
  },
  {
    id: "github",
    color: "purple",
    kind: "github",
    shapes: [[3, 2], [2, 2], [4, 2]],
    href: "https://github.com/tejaskothari03",
    front: { label: "GitHub", value: "/tejaskothari03" },
    back: { title: "Code", body: PROFILE.github },
  },
  {
    id: "linkedin-cta",
    color: "cyan",
    kind: "linkedin",
    shapes: [[2, 2]],
    href: "https://www.linkedin.com/in/tejaskothari03",
    front: { label: "Let's connect", value: "LinkedIn →" },
    back: { title: "Connect with me", body: "linkedin.com/in/tejaskothari03 — drop a hello!" },
  },
  {
    id: "watch-tissot",
    color: "indigo",
    kind: "watch",
    shapes: [[3, 3], [2, 3], [3, 2]],
    href: "https://www.tissotwatches.com/en-in/T0064071103303.html",
    front: { label: "Next item on my wish list", value: "Tissot PRC 200" },
    back: { title: "Tissot PRC 200 Chronograph", body: "Watch I'm eyeing to include in my collection.", meta: "tissotwatches.com →" },
  },
  {
    id: "randomizer",
    color: "pink",
    kind: "randomizer",
    shapes: [[3, 2], [4, 2], [3, 3]],
    front: { label: "Randomizer", value: "Shuffle ✨" },
    back: { title: "Reshuffle", body: "Click to re-pack every tile into a fresh layout." },
  },
  {
    id: "skills",
    color: "purple",
    kind: "skills",
    shapes: [[6, 3], [4, 4], [6, 4]],
    front: { label: "Stack", value: "Python · Java · Postgres · K8s" },
    back: {
      title: "Toolbelt",
      body: "Python, FastAPI, Django, Flask, Java, Spring Boot, PostgreSQL, Redis, Kubernetes, AWS, Prometheus, Grafana, Loki, Datadog.",
    },
  },
  {
    id: "stat-stocks",
    color: "amber",
    kind: "stat",
    shapes: [[2, 2], [3, 2]],
    front: { label: "Analyzed", value: "1300+" },
    back: { title: "NSE stocks", body: "Covered by Rupee Engine across fundamentals, technicals, and sentiment." },
  },
  {
    id: "stat-storage",
    color: "red",
    kind: "stat",
    shapes: [[2, 2], [3, 2]],
    front: { label: "Saved", value: "23 TB" },
    back: { title: "Storage reduction", body: "Cleanup module pruning records with configurable date ranges at Sandvine." },
  },
  {
    id: "stat-latency",
    color: "pink",
    kind: "stat",
    shapes: [[2, 2], [3, 2]],
    front: { label: "Latency ↓", value: "40%" },
    back: { title: "Catalog APIs", body: "Decomposed a Rails monolith into a Python + Sanic microservice at 1mg." },
  },
  {
    id: "stat-users",
    color: "blue",
    kind: "stat",
    shapes: [[2, 2], [3, 2]],
    front: { label: "Reached", value: "1M+" },
    back: { title: "Subscribers", body: "Internet activity APIs at Sandvine driving 40% higher engagement." },
  },
  {
    id: "project-rupee",
    color: "green",
    kind: "project",
    shapes: [[4, 3], [3, 3], [6, 2]],
    front: { label: "Building", value: "Rupee Engine" },
    back: {
      title: "Rupee Engine",
      body: "CLI equity analysis: 11 pluggable algorithms scoring 1300+ NSE stocks. Async ingestion, TTL cache, incremental refresh.",
      meta: "Feb 2026 — present",
    },
  },
  {
    id: "experience-obs",
    color: "teal",
    kind: "experience",
    shapes: [[4, 2], [3, 3], [4, 3]],
    front: { label: "Before that", value: "ObserveAI" },
    back: {
      title: "SDE II · ObserveAI",
      body: 'Worked on voice-agent infrastructure. Very "utterly conversational" experience!',
      meta: "Nov 2024 — Jul 2025",
    },
  },
  {
    id: "education",
    color: "indigo",
    kind: "education",
    shapes: [[4, 2], [3, 2], [6, 2]],
    front: { label: "Studied at", value: "Vellore Institute of Technology" },
    back: {
      title: "B.Tech, Computer Science",
      body: "Vellore Institute of Technology, Bhopal · CGPA 8.24",
      meta: "Aug 2017 — Jun 2021",
    },
  },
  {
    id: "quote",
    color: "orange",
    kind: "quote",
    shapes: [[4, 2], [3, 2], [6, 2]],
    front: { label: "Mantra", value: "Ship. Measure. Repeat." },
    back: { title: "How I work", body: "Small commits. Honest metrics. Boring tech where it counts, weird tech where it pays." },
  },
  {
    id: "resume",
    color: "red",
    kind: "resume",
    shapes: [[4, 3], [3, 3], [4, 2]],
    front: { label: "Click me", value: "Resume →" },
    back: { title: "Open résumé", body: "All tiles will line up and the full résumé will render. Click anywhere to open." },
  },
  {
    id: "night",
    color: "indigo",
    kind: "night",
    shapes: [[2, 2], [3, 2], [2, 3], [3, 3]],
    front: { label: "Theme", value: "🌙 Night" },
    back: { title: "Night mode", body: "Tap to flip the whole grid into a warm cream + ink palette. Tap again to come back." },
  },
  {
    id: "visitor",
    color: "cyan",
    kind: "visitor",
    shapes: [[3, 2], [4, 2]],
    front: { label: "Visitor", value: "" },
    back: { title: "Thanks for visiting!", body: "Genuinely — wherever in the world you're reading this from. ❤️" },
  },
  {
    id: "weather",
    color: "blue",
    kind: "weather",
    shapes: [[3, 2], [2, 2]],
    front: { label: "Weather", value: "" },
    back: { title: "Bengaluru weather", body: "Live conditions in my corner of the world via Open-Meteo." },
  },
  {
    id: "heatmap",
    color: "green",
    kind: "heatmap",
    shapes: [[6, 2], [4, 2], [8, 2]],
    front: { label: "GitHub heat", value: "" },
    back: { title: "Easter egg", body: "Woah, looks like you found an easter egg." },
  },
  {
    id: "commits",
    color: "purple",
    kind: "commits",
    shapes: [[4, 3], [3, 3], [4, 2]],
    front: { label: "Just shipped", value: "" },
    back: { title: "Recent pushes", body: "Latest commits across my public repos. Click any to open on GitHub." },
  },
  {
    id: "game",
    color: "lime",
    kind: "game",
    shapes: [[4, 3], [3, 3], [5, 3], [3, 4], [4, 2], [3, 2]],
    front: { label: "Play me", value: "🐍 Snake" },
    back: { title: "Snake", body: "Arrow keys / WASD / on-screen pad. Don't bite yourself." },
  },
];
