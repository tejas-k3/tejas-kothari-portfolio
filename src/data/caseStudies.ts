// Case studies. Sources: project READMEs / docs (Tejas-owned repos). Rupee Engine is described in GENERIC technical terms
// on purpose (Tejas: "architecture OK but don't reveal internals"): no vendor names, no weights, no strategy details, no returns.
// Anything that is opinion/hindsight is marked TODO(tejas) for confirmation.

export type ArchNode = { id: string; label: string; does: string; why: string; tradeoff: string; failure: string };
export type Decision = { q: string; a: string };
export type CaseStudy = {
  slug: string; name: string; blurb: string; ogTitle: string;
  facts: { k: string; v: string }[];
  problem: string; context: string; constraints: string[];
  archIntro: string; arch: ArchNode[];
  decisions: Decision[]; tradeoffs: string[]; implementation: string[]; outcome: string[]; lessons: string[]; change: string[];
  links: { t: string; h: string }[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "rupee-engine",
    name: "₹ Rupee Engine",
    ogTitle: "Rupee Engine — algorithmic market-analysis system",
    blurb: "A modular equity-analysis and portfolio engine for Indian markets: CLI, API and dashboard.",
    facts: [
      { k: "Status", v: "Active, since Feb 2026" },
      { k: "Coverage", v: "1,300+ NSE stocks" },
      { k: "Algorithms", v: "13 pluggable, registered" },
      { k: "Interfaces", v: "CLI · REST API · React dashboard" },
    ],
    problem: "Judging a stock means combining fundamentals, price behaviour and news sentiment, and doing it consistently across a thousand names. Done by hand it is slow and impossible to audit.",
    context: "I wanted a system where every recommendation is the output of explicit, testable scoring logic, and where the logic itself can be measured against history instead of trusted on instinct.",
    constraints: [
      "Data arrives from several public sources with different shapes, cadences and failure modes.",
      "A full-universe run has to stay fast enough to re-run daily.",
      "Scoring logic changes often, so it has to be isolated and replaceable.",
      "Anything that changes a recommendation must be measurable after the fact.",
    ],
    archIntro: "Data flows left to right. Select a stage to see what it does, why it exists, what it costs and how it fails.",
    arch: [
      { id: "ing", label: "Async ingestion", does: "Pulls market data from several public sources concurrently and normalises it.", why: "Network I/O dominates the runtime, so concurrency is the cheapest speed-up.", tradeoff: "More moving parts than sequential fetching; needs careful rate and error handling.", failure: "A source is slow or down: that source's data goes stale while the rest of the run continues." },
      { id: "cache", label: "TTL cache + incremental refresh", does: "Remembers what was fetched and only re-fetches what has changed or expired.", why: "Avoids repeating work and hammering upstream sources on every run.", tradeoff: "Stale reads are possible inside the TTL window; freshness is a tunable, not a guarantee.", failure: "Cache drift: handled by explicit refresh runs and idempotent collection." },
      { id: "store", label: "Relational store", does: "Persists universe, prices, fundamentals, articles, run snapshots and analysis history.", why: "Backtesting and audit need durable, queryable history rather than files.", tradeoff: "Requires a database and migrations before first use; schema is owned by migrations, nothing is created implicitly.", failure: "API refuses to start against an unreachable or un-migrated database, instead of failing halfway through a run." },
      { id: "score", label: "Scoring engine", does: "Runs a registry of pluggable algorithms per stock and blends them into horizon-aware scores.", why: "Isolating each algorithm behind one interface makes adding, retiring and measuring them cheap.", tradeoff: "A registry and shared interface add ceremony versus a few inline functions.", failure: "A weak algorithm is detectable through backtesting and can be retired without touching the others." },
      { id: "opt", label: "Portfolio optimizer", does: "Turns scores into a risk/return-aware portfolio for a given amount, with transaction costs modelled.", why: "Scores alone do not tell you how to size or combine positions.", tradeoff: "Model assumptions (costs, risk) can differ from reality.", failure: "Inputs outside valid ranges are rejected or flagged rather than silently producing a plan." },
      { id: "bt", label: "Backtest + calibration", does: "Replays history and walks forward to check whether the algorithms still hold up.", why: "It keeps the engine honest: claims about an algorithm must survive measurement.", tradeoff: "History is not the future; results guide decisions, they do not prove them.", failure: "Drift warnings fire when algorithm behaviour changes." },
      { id: "ui", label: "CLI · API · dashboard", does: "Three front doors onto the same engine: command line, REST API with token auth, React dashboard.", why: "One engine, many surfaces, so logic is never duplicated in the UI.", tradeoff: "The API becomes a contract that has to stay stable.", failure: "Requests without a valid token are rejected." },
    ],
    decisions: [
      { q: "Why PostgreSQL only?", a: "Backtesting, run history and analysis snapshots are relational and need transactions and migrations. Running one database everywhere removes a whole class of local-versus-production differences." },
      { q: "Why async ingestion?", a: "The pipeline is I/O bound. Concurrent fetching with caching turns a slow serial crawl into something that can run daily." },
      { q: "Why a plugin registry for algorithms?", a: "Each algorithm is one file behind one interface and is registered by decorator. Adding or retiring one never touches the rest, and the docs are checked against the registry so they cannot drift." },
      { q: "Why a CLI first?", a: "A CLI is the fastest way to iterate on the engine. The API and dashboard were added once the engine's behaviour was stable enough to expose." },
      { q: "What was retired?", a: "Algorithms that failed measurement were de-registered and moved to a historical record with the evidence for removal, instead of being deleted silently." },
    ],
    tradeoffs: [
      "Operational simplicity (one database, one machine) over horizontal scale.",
      "Measurability over cleverness: every algorithm must be scoreable against history.",
      "A small, explicit public surface rather than exposing engine internals.",
    ],
    implementation: [
      "Python with FastAPI, asyncio and httpx for the engine and API; Alembic migrations for schema.",
      "Docker images for the API and for one-shot CLI jobs, so scheduling is just running a container.",
      "React dashboard with typed data-fetching, charts, portfolio builder and backtest views.",
    ],
    outcome: [
      "One pipeline scores 1,300+ NSE stocks with 13 registered algorithms.",
      "Backtest and walk-forward calibration make algorithm changes measurable.",
      "CLI, API and dashboard share a single engine.",
    ],
    lessons: [
      "Making things measurable early changes what you are willing to build.",
      "Schema ownership by migrations (nothing implicit) prevents a lot of silent breakage.",
      "A registry plus a check that docs match code keeps a growing system honest.",
    ],
    change: [
      "TODO(tejas): add what you would do differently today (not derivable from the repo).",
    ],
    links: [],
  },
  {
    slug: "system-design-playground",
    name: "System Design Playground",
    ogTitle: "System Design Playground — a live system-design simulator",
    blurb: "Sketch a system, send traffic, watch it break, then fix it. A deterministic simulator in Go with a hand-drawn React canvas.",
    facts: [
      { k: "Status", v: "Open source, MIT" },
      { k: "Engine", v: "Go, deterministic discrete-event" },
      { k: "Components", v: "13 building blocks" },
      { k: "Challenges", v: "22 guided scenarios" },
    ],
    problem: "System design is usually taught with static boxes and arrows. You never see a queue fill, a connection pool run dry or a retry storm build, which is exactly what interviews and production incidents are about.",
    context: "I wanted a place to build a design and then stress it: send traffic, crash a node, and learn from the failure instead of memorising a diagram.",
    constraints: [
      "Results must be reproducible, so the same design and seed always give the same outcome.",
      "Live edits must apply to a running simulation.",
      "Shared designs come from untrusted users, so they must be sanitised.",
      "It must be fast enough to feel interactive.",
    ],
    archIntro: "A browser edits the diagram and streams it to a Go simulation server over a WebSocket; the server streams stats and request particles back.",
    arch: [
      { id: "ui", label: "Canvas UI", does: "Hand-drawn canvas (roughjs) for editing the diagram, with inspector, charts and request traces.", why: "A tactile editor makes systems feel buildable rather than diagrammed.", tradeoff: "Custom canvas rendering and hit-testing instead of an off-the-shelf diagram library.", failure: "If the server is unreachable, the page says so and goes dormant until you press Play." },
      { id: "ws", label: "WebSocket session", does: "Streams the live diagram to the server and frames of stats and particles back (about 25 Hz).", why: "Live edits should affect a running simulation without restarting it.", tradeoff: "Stateful sessions need limits: at most 64 live simulations, idle sessions closed after 10 minutes.", failure: "Over capacity returns 503 with Retry-After; idle sessions reconnect on Play." },
      { id: "eng", label: "Discrete-event engine", does: "A priority-queue simulation where each request is a chain of callbacks across nodes with bounded queues.", why: "Event-driven simulation models queues, timeouts and retries faithfully and runs far faster than real time.", tradeoff: "A model, not the real system: it captures request flow and capacity, not everything about a product.", failure: "If the server cannot keep up it slows down and warns rather than silently drifting." },
      { id: "chaos", label: "Chaos and traffic", does: "Crash, slow-down and partition events plus open, bursty and closed-loop users.", why: "Failures are the point; they are what teach the lesson.", tradeoff: "More scenarios mean more calibration work.", failure: "Configuration-only challenges reject topology changes on the server too." },
      { id: "scen", label: "Scenarios + scoring", does: "Challenges as data with goals, hints, predictions and a reference solution, scored from one to three stars.", why: "Guided failure is a better teacher than a blank canvas.", tradeoff: "Authoring a good scenario takes care.", failure: "Tests fail unless the starting design fails its goals and the solution passes across several seeds." },
      { id: "api", label: "REST API + sharing", does: "Validation, headless runs, scenarios and shareable designs.", why: "Untrusted diagrams are sanitised and shared by an unguessable id.", tradeoff: "No accounts; the link is the access control.", failure: "Sharing is rate-limited and capped." },
    ],
    decisions: [
      { q: "Why Go for the engine?", a: "A tight event loop with predictable performance. A 30 s run of a 1,000 rps, 20-node design takes about 90 ms, so the simulation can run many times faster than real time." },
      { q: "Why deterministic?", a: "Same diagram and seed give the same result, which makes challenges fair, tests reliable and bugs reproducible." },
      { q: "Why run the simulation on the server?", a: "One authoritative engine, no duplicated logic in the browser, and the UI stays a thin editor and renderer." },
      { q: "Why scenarios as data with tests?", a: "A scenario that does not fail at the start, or does not pass with its reference solution, is caught by the test suite instead of by a learner." },
      { q: "How is it validated?", a: "The engine is checked against queueing theory, and covered by engine, scenario-calibration, API and WebSocket tests." },
    ],
    tradeoffs: [
      "A request-flow and capacity model rather than a full distributed-systems emulator.",
      "Stateful server sessions in exchange for live editing.",
      "Anonymous sharing by capability link rather than accounts.",
    ],
    implementation: [
      "Go backend: engine (no I/O, unit tested), scenarios and an API with REST and WebSocket.",
      "React, TypeScript, Vite and zustand frontend; roughjs canvas; keyboard and touch support with a list-based fallback for the canvas.",
      "Docker image and Makefile for one-command runs.",
    ],
    outcome: [
      "Components cover load balancers, caches, replicas, queues, workers, CDN, rate limiters, shards and more.",
      "22 challenges, request-trace waterfalls, chaos injection and shareable designs.",
    ],
    lessons: [
      "Determinism is a feature: it makes simulation testable.",
      "Treat user input as hostile even in a toy: sanitise diagrams on the server.",
    ],
    change: [
      "From the project's own gap analysis: it models request flow and capacity well, but not data-flow questions such as feeds, chat or video pipelines. Those need new building blocks (fan-out, pub/sub, blob storage).",
      
    ],
    links: [{ t: "Source on GitHub", h: "https://github.com/tejas-k3/system_design_playground" }],
  },
];
