// Single source of truth for all static content.
// Every fact here maps to: Tejas_Kothari.pdf (resume), the project READMEs, or a direct Tejas answer.
// Rule: work history = company, title, dates only (no resume bullets). TODO(tejas) marks anything to confirm.

export const person = {
  name: "Tejas Kothari",
  handle: "tejas-k3",
  title: "Senior Software Engineer",
  focus: "Distributed Systems", // Tejas Q5: "Distributed Systems | Senior Software Engineer"
  location: "Bengaluru, India",
  email: "tejaskothari03@gmail.com",
  linkedin: "https://www.linkedin.com/in/tejaskothari03",
  github: "https://github.com/tejas-k3",
  // Phone is not shown on the page. The resume PDF (has the phone) is download-only and robots-disallowed (Tejas approved).
  resumeUrl: "/Tejas_Kothari_Resume.pdf" as string | null, // published on request-only basis: not indexed (robots.txt), not shown inline
};

// HERO — default is #1. TODO(tone): swap by changing `heroIndex`.
export const heroOptions = [
  ["I ENGINEER CODE", "THAT WRITES CODE", "THAT RUNS CODE", "THAT SHIPS."],
  ["I BUILD SYSTEMS", "THAT WRITE CODE", "THAT RUN CODE", "WITHOUT FLINCHING."],
  ["CODE THAT WRITES CODE", "THAT TESTS CODE", "THAT SHIPS CODE", "(I SUPERVISE)."],
  ["I TEACH MACHINES", "TO WRITE, RUN", "AND DEBUG CODE", "SO I CAN SLEEP."],
];
export const heroIndex = 0;

export const heroSub =
  "Senior software engineer in Bengaluru. Distributed systems, backend platforms and observability, with a habit of turning repetitive engineering into tools and shipping fast with AI-assisted development.";

// Primary CTA. TODO(tejas): pick final wording; options are in the chat.
export const cta = { primary: "Let's talk", primaryHref: "#contact", secondary: "Browse the work", secondaryHref: "/work" };

// "Proof strip": only things verifiable from projects/READMEs/resume.
export const proof = [
  { k: "5 yrs", v: "shipping backend systems since 2021" },
  { k: "4", v: "companies: Sandvine, 1mg, ObserveAI, CoinTracker" },
  { k: "13", v: "pluggable scoring algorithms in Rupee Engine" },
  { k: "1,300+", v: "NSE stocks analysed by one pipeline" },
];

export const experience = [
  { company: "CoinTracker", title: "Software Engineer 2", from: "Dec 2025", to: "Apr 2026", theme: "Crypto portfolio platform" },
  { company: "ObserveAI", title: "Software Development Engineer II", from: "Nov 2024", to: "Jul 2025", theme: "Conversation intelligence" },
  { company: "1mg", title: "Software Development Engineer II", from: "Mar 2024", to: "Nov 2024", theme: "Health-tech marketplace" },
  { company: "Sandvine", title: "Software Engineer II", from: "Jun 2021", to: "Feb 2024", theme: "Network intelligence" },
];
// TODO(tejas): "theme" lines are neutral descriptors I wrote (not resume text). Confirm or delete.

export const education = { school: "Vellore Institute of Technology", degree: "B.Tech, Computer Science", from: "2017", to: "2021" };

export type Project = {
  slug: string;
  name: string;
  tag: string;
  status: string;
  dates: string;
  what: string;
  why: string;
  how: string;
  result: string;
  stack: string[];
  href?: string;
  repo?: string;
  page?: string;
};

export const projects: Project[] = [
  {
    slug: "rupee-engine",
    name: "₹ Rupee Engine",
    tag: "Flagship",
    status: "Active",
    dates: "Feb 2026 – present",
    what: "A modular equity-analysis and portfolio engine for Indian markets, with a CLI, an API and a dashboard.",
    why: "Scattered fundamentals, technicals and sentiment are hard to compare. One pipeline makes the reasoning repeatable and testable.",
    how: "Async ingestion with TTL caching and incremental refresh feeds a relational store. A registry of pluggable algorithms scores each stock, and a risk/return-aware optimizer builds the portfolio.",
    result: "13 registered algorithms, 1,300+ NSE stocks, backtesting and walk-forward calibration, and a React dashboard on top.",
    stack: ["Python", "FastAPI", "asyncio", "httpx", "PostgreSQL", "Alembic", "Docker", "React"],
    page: "/projects/rupee-engine",
  },
  {
    slug: "system-design-playground",
    name: "System Design Playground",
    tag: "Open source",
    status: "Active",
    dates: "Oct 2026 – present",
    what: "A browser simulator: sketch a system, send traffic, watch it break, then fix it.",
    why: "System design is learned by seeing queues fill, pools run dry and retries pile up, not by reading about them.",
    how: "A deterministic discrete-event engine in Go streams live state over WebSockets to a hand-drawn canvas UI in React.",
    result: "Guided challenges scored from one to three stars, request-trace waterfalls, chaos injection and shareable designs.",
    stack: ["Go", "WebSocket", "React", "TypeScript", "Vite", "Docker"],
    repo: "https://github.com/tejas-k3/system_design_playground",
    page: "/projects/system-design-playground",
  },
  {
    slug: "aov-studios",
    name: "AOV Studios Website",
    tag: "Shipped",
    status: "Live",
    dates: "Jun – Aug 2023",
    what: "The official website for AOV Studios, a React single-page app that I led and built.",
    why: "A studio needed a real web presence.",
    how: "React SPA, deployed to a custom domain.",
    result: "Live in production.",
    stack: ["JavaScript", "React"],
    href: "https://aovstudios.co.in/",
  },
  {
    slug: "bot-detection",
    name: "Twitter Malicious Bot Detection",
    tag: "Hackathon",
    status: "Archived",
    dates: "Oct 2021",
    what: "A metric that flags malicious bots and botnets from a Twitter handle or hashtag.",
    why: "Sandvine 2021 internal hackathon.",
    how: "Java and Python with SQL, Redis and Vertica behind the Twitter API.",
    result: "Won “Most Radical Idea” among 40+ teams, presented to a C-level panel.",
    stack: ["Java", "Python", "SQL", "Redis", "Vertica"],
  },
];

// Tech stack. `used` links every technology to real evidence only (resume skills + project stacks).
// `logo`: file in /public/logos (simple-icons, tinted via CSS mask) or `glyph:<name>` for concepts without a brand logo.
// `c` = brand colour on light theme, `cd` = on dark theme (dark brands get a lighter variant so they stay visible).
export type Tech = { name: string; logo: string; c: string; cd?: string; used: string[] };
export const stack: { group: string; items: Tech[] }[] = [
  {
    group: "Languages & frameworks",
    items: [
      { name: "Python", logo: "python", c: "#3776AB", cd: "#5B9BD5", used: ["Rupee Engine", "1mg (Sanic services)", "ObserveAI (async services)", "Bot detection"] },
      { name: "FastAPI", logo: "fastapi", c: "#009688", used: ["Rupee Engine"] },
      { name: "Django", logo: "django", c: "#0C4B33", cd: "#44B78B", used: ["Listed skill"] },
      { name: "Flask", logo: "flask", c: "#222222", cd: "#E6E6E6", used: ["Listed skill"] },
      { name: "Sanic", logo: "sanic", c: "#FF0068", used: ["1mg (microservices)"] },
      { name: "Java", logo: "openjdk", c: "#D97706", cd: "#F89820", used: ["Bot detection", "Sandvine"] },
      { name: "Spring Boot", logo: "springboot", c: "#4C9A2A", cd: "#6DB33F", used: ["Listed skill"] },
      { name: "Go", logo: "go", c: "#00ADD8", used: ["System Design Playground"] },
      { name: "TypeScript", logo: "typescript", c: "#3178C6", used: ["System Design Playground", "Rupee Engine UI"] },
      { name: "React", logo: "react", c: "#0891B2", cd: "#61DAFB", used: ["Rupee Engine UI", "System Design Playground", "AOV Studios"] },
      { name: "JavaScript", logo: "javascript", c: "#B58900", cd: "#F7DF1E", used: ["AOV Studios"] },
      { name: "SQL", logo: "glyph:db", c: "#6366F1", cd: "#A5B4FC", used: ["Rupee Engine", "Sandvine", "Bot detection"] },
    ],
  },
  {
    group: "Systems & fundamentals",
    items: [
      { name: "Distributed systems", logo: "glyph:nodes", c: "#0a66d9", cd: "#4cc2ff", used: ["System Design Playground", "Experience"] },
      { name: "Microservices", logo: "glyph:blocks", c: "#0a66d9", cd: "#4cc2ff", used: ["1mg", "ObserveAI"] },
      { name: "System design", logo: "glyph:blueprint", c: "#0a66d9", cd: "#4cc2ff", used: ["LLD / HLD", "System Design Playground"] },
      { name: "Data structures & algorithms", logo: "glyph:tree", c: "#0a66d9", cd: "#4cc2ff", used: ["Rupee Engine", "System Design Playground (event heap)"] },
      { name: "Concurrency", logo: "glyph:cores", c: "#0a66d9", cd: "#4cc2ff", used: ["Multiprocessing / multithreading (listed skill)"] },
      { name: "PostgreSQL", logo: "postgresql", c: "#336791", cd: "#6B9BD1", used: ["Rupee Engine"] },
    ],
  },
  {
    group: "Data & cloud",
    items: [
      { name: "Redis", logo: "redis", c: "#DC382D", used: ["Bot detection"] },
      { name: "AWS", logo: "amazonwebservices", c: "#E68A00", cd: "#FF9900", used: ["Listed skill"] },
      { name: "Kubernetes", logo: "kubernetes", c: "#326CE5", cd: "#5B8DEF", used: ["ObserveAI"] },
      { name: "Docker", logo: "docker", c: "#1D63ED", cd: "#2496ED", used: ["Rupee Engine", "System Design Playground"] },
      { name: "Helm", logo: "helm", c: "#0F1689", cd: "#6F7BFF", used: ["ObserveAI (alerting charts)"] },
    ],
  },
  {
    group: "Observability",
    items: [
      { name: "Prometheus", logo: "prometheus", c: "#E6522C", used: ["ObserveAI"] },
      { name: "Grafana", logo: "grafana", c: "#F46800", used: ["ObserveAI"] },
      { name: "Loki", logo: "glyph:logs", c: "#F5A300", used: ["ObserveAI (log aggregation)"] },
      { name: "Datadog", logo: "datadog", c: "#632CA6", cd: "#A076E0", used: ["ObserveAI"] },
    ],
  },
];

// "How I work": the differentiator Tejas asked for. Principles, not metrics.
// TODO(tejas): review wording; these are positioning statements written from your Q6 answer.
export const howIWork = [
  { n: "01", t: "Translate", d: "Turn a fuzzy requirement into a clear model of the problem before writing any code." },
  { n: "02", t: "Learn fast", d: "Pick up unfamiliar domains, chains and stacks quickly, then ask the sharper questions." },
  { n: "03", t: "Build with AI", d: "Use AI-assisted development for speed, and keep tests, review and judgment in the loop for quality." },
  { n: "04", t: "Ship", d: "Observability and failure handling from day one, so it still works when it meets production." },
];

export const interests = [
  { icon: "◷", t: "Watches", d: "Mechanical things that keep time without a CPU." }, // TODO(tone) humor
  { icon: "↗", t: "Markets", d: "Why Rupee Engine exists." },
  { icon: "</>", t: "Code", d: "Especially code that makes more code." },
  { icon: "✈", t: "Travel", d: "Offline mode, but for engineers." }, // TODO(tone) humor
]; // TODO(tejas): add specifics (favourite watch, places) if you want them public.

export const currently = [
  { k: "Building", v: "Rupee Engine and the System Design Playground" },
  { k: "Exploring", v: "AI-enabled development workflows" }, // TODO(tejas): confirm
  { k: "Open to", v: "Distributed-systems / senior backend roles" }, // TODO(tejas): confirm job-search status wording
];

export const philosophy = [
  "Production is where theories go to get character development.", // TODO(tone)
  "Simple systems are harder to build than complicated ones.",
  "If I did it twice by hand, the third time is a generator.",
];

export const seo = {
  title: "Tejas Kothari — Senior Software Engineer | Distributed Systems & Backend",
  description:
    "Tejas Kothari is a Bengaluru-based senior software engineer working on distributed systems, backend platforms and observability. Projects: Rupee Engine and System Design Playground.",
};
