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
  // Phone is intentionally NOT public. Resume PDF is intentionally NOT published (it contains the phone number).
  // TODO(tejas): if you want a public resume, upload a phone-free PDF to /public and set this.
  resumeUrl: null as string | null,
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
export const cta = { primary: "Let's talk", primaryHref: "#contact", secondary: "See the work", secondaryHref: "#work" };

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
export const stack: { group: string; items: { name: string; used: string[] }[] }[] = [
  {
    group: "Languages & frameworks",
    items: [
      { name: "Python", used: ["Rupee Engine", "1mg (Sanic services)", "ObserveAI (async services)", "Bot detection"] },
      { name: "FastAPI", used: ["Rupee Engine"] },
      { name: "Django", used: ["Listed skill"] },
      { name: "Flask", used: ["Listed skill"] },
      { name: "Java", used: ["Bot detection", "Spring Boot (listed skill)"] },
      { name: "SQL", used: ["Rupee Engine", "Sandvine", "Bot detection"] },
      { name: "Go", used: ["System Design Playground"] },
      { name: "TypeScript / React", used: ["Rupee Engine UI", "System Design Playground", "AOV Studios"] },
    ],
  },
  {
    group: "Systems & data",
    items: [
      { name: "Distributed systems", used: ["System Design Playground", "Experience"] },
      { name: "Microservices", used: ["1mg", "ObserveAI"] },
      { name: "System design (LLD/HLD)", used: ["System Design Playground"] },
      { name: "PostgreSQL", used: ["Rupee Engine"] },
      { name: "Redis", used: ["Bot detection"] },
    ],
  },
  {
    group: "Infra & observability",
    items: [
      { name: "AWS", used: ["Listed skill"] },
      { name: "Kubernetes", used: ["ObserveAI"] },
      { name: "Docker", used: ["Rupee Engine", "System Design Playground"] },
      { name: "Prometheus / Grafana / Loki", used: ["ObserveAI"] },
      { name: "Datadog", used: ["ObserveAI"] },
    ],
  },
  {
    group: "Foundations",
    items: [
      { name: "Data structures & algorithms", used: ["Rupee Engine", "System Design Playground (event heap)"] },
      { name: "Multiprocessing / multithreading", used: ["Listed skill"] },
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
