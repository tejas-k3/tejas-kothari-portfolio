// What the flagship case studies say beyond the basics: impact, decisions, principles, gaps. Plain English, few numbers.
// Figures come from the repos' own dated notes and tests (docs/perf, docs/measurements, engine tests). Rupee Engine: engineering only, no strategy details or returns.

export type Node = { id: string; label: string; sub?: string; x: number; y: number; w: number; h: number; kind?: "store" | "edge" | "core" };
export type Edge = { from: string; to: string; label?: string; both?: boolean };
export type Diagram = { w: number; h: number; nodes: Node[]; edges: Edge[]; title: string; caption: string };
export type Impact = { big: string; label: string; note: string };
export type Story = { title: string; situation: string; decision: string; result: string };
export type Gap = { gap: string; next: string };
export type Evidence = { diagram: Diagram; impact: Impact[]; stories: Story[]; principles: string[]; gaps: Gap[]; practice?: string };

export const evidence: Record<string, Evidence> = {
  "rupee-engine": {
    diagram: {
      w: 900, h: 330, title: "Rupee Engine data flow",
      caption: "Data flows from public sources through a rate-limited async ingestion layer and a TTL cache into PostgreSQL. Scoring and the optimizer read from it, and backtesting replays history from the same store.",
      nodes: [
        { id: "src", label: "Public data sources", sub: "exchange + fundamentals + news", x: 20, y: 40, w: 170, h: 74, kind: "edge" },
        { id: "ing", label: "Async ingestion", sub: "httpx · asyncio · rate limits", x: 240, y: 40, w: 180, h: 74 },
        { id: "cache", label: "TTL cache", sub: "incremental refresh", x: 470, y: 40, w: 150, h: 74 },
        { id: "pg", label: "PostgreSQL", sub: "schema owned by migrations", x: 670, y: 40, w: 210, h: 74, kind: "store" },
        { id: "score", label: "Scoring engine", sub: "registry of 13 algorithms", x: 440, y: 200, w: 200, h: 80, kind: "core" },
        { id: "opt", label: "Portfolio optimizer", sub: "costs · risk/return", x: 230, y: 200, w: 170, h: 80, kind: "core" },
        { id: "ui", label: "CLI · REST API · dashboard", sub: "token-protected API", x: 10, y: 200, w: 180, h: 80, kind: "edge" },
        { id: "bt", label: "Backtest + calibration", sub: "replays history", x: 700, y: 200, w: 180, h: 80 },
      ],
      edges: [
        { from: "src", to: "ing" }, { from: "ing", to: "cache" }, { from: "cache", to: "pg" },
        { from: "pg", to: "score", label: "snapshots" }, { from: "score", to: "opt" }, { from: "opt", to: "ui" },
        { from: "pg", to: "bt", both: true },
      ],
    },
    impact: [
      { big: "-91%", label: "Memory for big backtests", note: "From about 50 GB to about 4 GB, with the same results." },
      { big: "50-70%", label: "Faster on the slow parts", note: "A run that used to hang now finishes in about 11 minutes." },
      { big: "2,600+", label: "Stocks scored in one run", note: "The whole market, end to end, with no failed lookups." },
    ],
    stories: [
      {
        title: "Faster and lighter, same answers",
        situation: "Big runs were slow, one hung, and a large backtest ran out of memory on a 64 GB machine.",
        decision: "Find the real cause with profilers instead of guessing. Accept a change only if the results stay identical. Make a missed shortcut fail loudly, so a speed-up cannot quietly rot.",
        result: "Up to 91% less memory, 50-70% faster, and the hang is gone. Nothing about the output changed.",
      },
      {
        title: "Fail loudly, never guess",
        situation: "When data is missing, the easy path is to score what is left and carry on.",
        decision: "Stop with a clear error instead. If most data is missing, or the database is not ready, the run or the API refuses to start.",
        result: "No quietly wrong portfolio. A failure is visible the moment it happens.",
      },
      {
        title: "Be kind to the data sources",
        situation: "The sources limit how fast I can ask, and a naive run repeated almost all of its work.",
        decision: "Remember what is already fetched, skip what is stored, and refresh only what is due.",
        result: "A repeat pass over the news sources dropped from about a minute to a few seconds.",
      },
    ],
    principles: [
      "Measure before and after, every time.",
      "Fail loudly instead of guessing.",
      "Same inputs give the same answers: changes to the scoring are fingerprinted and frozen outputs are reviewed.",
      "Docs are checked against the code, so they cannot drift.",
    ],
    gaps: [
      { gap: "It runs from one machine, started by hand.", next: "Scheduled runs with an alert when one fails." },
      { gap: "A data source can change its page and go quiet.", next: "A health check per source that says so." },
      { gap: "It ranks and sizes a portfolio. It does not trade, and it is not advice.", next: "Stay a research tool, on purpose." },
    ],
    practice: "Incidents get a written postmortem and a runbook, not just a fix.",
  },

  "system-design-playground": {
    diagram: {
      w: 900, h: 330, title: "System Design Playground architecture",
      caption: "The browser edits the diagram and streams it to a Go simulation over a WebSocket; frames of stats and request particles stream back. REST handles validation, headless runs, scenarios and shared designs.",
      nodes: [
        { id: "ui", label: "React canvas UI", sub: "zustand · roughjs · inspector", x: 20, y: 40, w: 200, h: 90, kind: "edge" },
        { id: "ws", label: "WebSocket session", sub: "live edits · play · chaos", x: 320, y: 40, w: 220, h: 90 },
        { id: "eng", label: "Discrete-event engine", sub: "event heap · stations · 100 ms ticks", x: 620, y: 40, w: 260, h: 90, kind: "core" },
        { id: "rest", label: "REST API", sub: "validate · run · scenarios · share", x: 320, y: 210, w: 220, h: 80 },
        { id: "san", label: "Sanitiser", sub: "untrusted diagrams", x: 20, y: 210, w: 200, h: 80 },
        { id: "sc", label: "Scenarios as data", sub: "start must fail, solution must pass", x: 620, y: 210, w: 170, h: 80, kind: "store" },
        { id: "ds", label: "Designs store", sub: "rate-limited", x: 800, y: 210, w: 90, h: 80, kind: "store" },
      ],
      edges: [
        { from: "ui", to: "ws", label: "edits", both: true }, { from: "ws", to: "eng", label: "25 Hz", both: true },
        { from: "ui", to: "rest" }, { from: "rest", to: "san" }, { from: "rest", to: "eng", label: "headless run" }, { from: "rest", to: "sc" }, { from: "rest", to: "ds" },
      ],
    },
    impact: [
      { big: "108", label: "Guided challenges", note: "Each one starts broken and teaches one kind of failure." },
      { big: "6-8%", label: "Gap to queueing theory", note: "Simulated waits match textbook formulas, so the lessons can be trusted." },
      { big: "~330x", label: "Faster than real time", note: "30 simulated seconds of a busy system run in about 90 ms." },
    ],
    stories: [
      {
        title: "Make the simulator trustworthy",
        situation: "A toy simulator that is wrong teaches the wrong thing.",
        decision: "Check queue waits against known queueing formulas, and make every run repeatable: same design and seed, same result.",
        result: "Waits land within 6-8% of theory, and any odd result can be reproduced and debugged.",
      },
      {
        title: "Show why retries can kill a system",
        situation: "Many outages are not the first fault, but the retries that follow.",
        decision: "Model it faithfully: one node slows down briefly while clients retry straight away into a deep queue.",
        result: "That system never recovers. With backoff, no retries, a short queue or newest-first service, it recovers fully. This became a challenge.",
      },
      {
        title: "Live, fast and safe to share",
        situation: "Edits must show up instantly, and anyone can send a design.",
        decision: "The server owns the simulation. Every shared design is cleaned and size-limited, and sharing is rate-limited.",
        result: "It feels live, and untrusted input never reaches the engine.",
      },
    ],
    principles: [
      "Same design and seed give the same result.",
      "The server decides, the browser only shows.",
      "Treat every incoming design as hostile.",
      "Teach by breaking things, then fixing them.",
    ],
    gaps: [
      { gap: "It models traffic and capacity, not product data flows like feeds, chat or video.", next: "Add fan-out, publish-subscribe and blob-storage blocks." },
      { gap: "Service times are smoother than real services.", next: "Make realistic, spiky times the default." },
      { gap: "Screen-reader use has not been tested by a person yet.", next: "Run the scripted pass and fix what it finds." },
    ],
  },
};
