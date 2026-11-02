// Evidence for the two flagship projects. Every figure is either (a) measured on 2026-11-02 for this site, or (b) copied from a dated
// measurement document in the project repo (docs/perf, docs/measurements) and cited by date. Rupee Engine figures are engineering
// numbers only: no strategy internals, weights or returns are published here.

export type Node = { id: string; label: string; sub?: string; x: number; y: number; w: number; h: number; kind?: "store" | "edge" | "core" };
export type Edge = { from: string; to: string; label?: string; both?: boolean };
export type Diagram = { w: number; h: number; nodes: Node[]; edges: Edge[]; title: string; caption: string };
export type Metric = { label: string; before?: string; after?: string; value?: string; delta?: string; note: string; source: string };
export type Failure = { scenario: string; trigger: string; behaviour: string; outcome: string };
export type Evidence = {
  intro: string;
  diagram: Diagram;
  benchmarks: Metric[];
  method: { k: string; v: string }[];
  testsIntro: string;
  tests: { k: string; v: string; note: string }[];
  failures: Failure[];
  limitations: string[];
};

export const evidence: Record<string, Evidence> = {
  "rupee-engine": {
    intro: "Measurements below come from the project's own dated performance notes, written while fixing real problems. They are engineering numbers: how fast, how much memory, what broke. I deliberately do not publish strategy details or returns.",
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
    benchmarks: [
      { label: "Peak memory, bulk price-history enrichment", before: "1,264 MB", after: "480 MB", delta: "-62%", note: "2,126 symbols x 320 days = 408,725 rows. The fix streams columns instead of materialising row dicts.", source: "docs/perf, 2026-08-18 (memray)" },
      { label: "Peak memory, 100-date backtest (3.4M observations)", before: "50.7 GB", after: "4.4 GB", delta: "-91%", note: "A window cache kept an entry per (symbol, date) and was never evicted. Run time also fell from 876 s to 811 s. Reports were hash-compared and identical.", source: "docs/perf, 2026-10-06 (tracemalloc)" },
      { label: "Calibration workload after the scoring-stall fixes", before: "483.9 s", after: "154.7 s", delta: "-68%", note: "Eight verified fixes. The original full-universe run hung for 25+ minutes and had to be killed; after the fixes it completes end to end in 11 min 4 s.", source: "docs/perf, 2026-09-23 (py-spy, cProfile)" },
      { label: "4-month, 5-algorithm, 30-day backtest", before: "66 s", after: "33 s", delta: "-50%", note: "Price windows are prefetched in bulk instead of queried inside each score. 176 reported numbers matched to 4 decimals.", source: "CHANGELOG 0.8.1, 2026-11-01" },
      { label: "Repeat news discovery, 30 symbols", before: "66 s", after: "4 s", delta: "-94%", note: "Known links are skipped and redirects cached. Body downloads fell 168 → 86 → 28 → 7 over successive passes; redirect decodes 236 → 4 → 0.", source: "docs/perf, article-skip-known" },
      { label: "Full-universe run", value: "2,622 of 2,623 stocks scored", note: "1,309 s wall time: 1,292 s collecting from rate-limited sources (100 requests/min), 15 s optimising. Peak memory 829 MB (memray), max RSS 1.25 GB. No failed enrichments.", source: "docs/perf, 2026-10-31" },
    ],
    method: [
      { k: "Profilers", v: "memray for allocation profiles and flamegraphs, tracemalloc to find growth by source line, py-spy to sample a live hung process, cProfile for time." },
      { k: "Pinned workloads", v: "Before and after use the same symbols, dates and calibration workload, so a change in the number is the code, not the data." },
      { k: "Equivalence check", v: "Optimised paths must reproduce the old output: reports are hash-compared or compared to four decimals before a speed-up is accepted." },
      { k: "Environment", v: "One developer laptop (64 GB, macOS), local PostgreSQL. Cold versus warm caches are stated per measurement." },
      { k: "How to read them", v: "Single machine, not a controlled lab: treat these as order-of-magnitude evidence. Each figure cites the dated note it came from." },
    ],
    testsIntro: "Quality is enforced by tests that pin behaviour, not just by unit coverage.",
    tests: [
      { k: "3,853", v: "automated tests", note: "280 test files; counted with pytest --collect-only on 2026-11-02." },
      { k: "Green", v: "CI on recent runs", note: "GitHub Actions: the three most recent runs (2026-11-01) all succeeded." },
      { k: "Golden", v: "frozen optimizer output", note: "When a cost constant changes, the golden files are refrozen deliberately and the diff is reviewed." },
      { k: "Drift", v: "fingerprint tests", note: "Algorithm-code and scoring fingerprints change when behaviour does, so the next run recalibrates instead of mixing old and new scores." },
      { k: "Docs", v: "checked against code", note: "The algorithm reference is tested against the registry, and a staleness script scans the docs, so documentation cannot quietly drift." },
      { k: "Strict", v: "fail-loud price windows", note: "In strict mode a window that was not prefetched raises an error instead of silently querying the database." },
    ],
    failures: [
      { scenario: "Database unreachable or not migrated", trigger: "API started against a missing or out-of-date schema", behaviour: "The API refuses to start.", outcome: "Fails fast at boot rather than half-way through a run. The schema is owned by migrations and nothing is created implicitly." },
      { scenario: "Upstream rate limits", trigger: "Collection is bounded by a 100 requests/minute limit", behaviour: "TTL caches, incremental refresh and known-link skipping avoid repeat work.", outcome: "Measured: a repeat discovery pass went from 66 s to 4 s. Expected steady state is about 2 discovery requests per symbol instead of about 23." },
      { scenario: "Degraded backfill", trigger: "More than half the symbols the index scan missed have no usable cache", behaviour: "The run stops with a dedicated error.", outcome: "No short, misleading universe is scored. This replaced scoring a short universe and only logging an error." },
      { scenario: "Run started from another directory", trigger: "A detached job ran from its run directory", behaviour: "It saw an empty cache and scored about 500 stocks instead of all of them.", outcome: "Data paths now resolve from the project root, not the working directory." },
      { scenario: "Scoring stall", trigger: "Full-universe run hung at symbol 1 of 2,316 at 75-80% CPU, memory above 4 GB", behaviour: "Found with py-spy: repeated per-call scans and lookups in scoring, plus uncached price windows.", outcome: "Eight verified fixes (caching and memoisation); the run now completes in about 11 minutes." },
      { scenario: "Unbounded memory in backtests", trigger: "A 100-date run exhausted a 64 GB machine", behaviour: "A cache with no eviction held every window.", outcome: "Cleared per date: 50.7 GB peak became 4.4 GB, with identical output." },
    ],
    limitations: [
      "It ranks and sizes. It places no orders and gives no stops or targets.",
      "Its measured edge is modest and statistical, across hundreds of stocks at longer horizons. It is not a prediction for one name, and it is not investment advice.",
      "Operated from a single machine and run by hand; there is no scheduled production run, so freshness depends on running collection.",
      "A page-structure change at a news source can silence that source for up to seven days because successful fetches are remembered. Stories shared by several symbols attach to the first one that finds them.",
      "Performance figures are from one laptop and one dataset, and the sources are dated notes, not a repeatable benchmark suite.",
    ],
  },

  "system-design-playground": {
    intro: "Numbers below were measured on 2026-11-02 on the project's current main, plus the validation tests the engine ships with. Methodology and caveats are listed beside them.",
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
    benchmarks: [
      { label: "Large-design simulation (performance guard)", value: "90 ms per run", note: "30 simulated seconds of a 1,000 requests/s, 20-node design: 114.8 MB and 1,860,014 allocations. Roughly 330x faster than real time. CI fails if time, bytes or allocations regress.", source: "make perf-guard, 2026-11-02" },
      { label: "Same design (Go benchmark harness)", value: "126-129 ms per op", note: "Three runs: 126.2, 128.6, 128.2 ms/op; 120.4 MB/op; 1,860,013 allocs/op. About 230-240x real time. The harness and the guard differ by about 40%, so I report both.", source: "go test -bench, count=3, 2026-11-02" },
      { label: "Queue wait vs Pollaczek-Khinchine (single server)", value: "within 6% at utilisation 0.50 and 0.81", note: "At 0.90 the mean over six seeds is within 8% (a single seed can be 10% off near saturation).", source: "engine/queueing_test.go" },
      { label: "Queue wait vs Allen-Cunneen (4 threads)", value: "within 8% at utilisation 0.80 and 0.90", note: "Checked against closed-form theory, so a scheduling change that distorts waiting times is caught.", source: "engine/queueing_test.go" },
      { label: "Closed-system behaviour vs Little's law", value: "mean response within 15%", note: "100 users who think for 1 s settle at about 20 requests/s instead of overwhelming the server; an open crowd at the same nominal rate is drowned.", source: "engine/behaviour_test.go" },
    ],
    method: [
      { k: "Machine", v: "Apple M4 Max (arm64), macOS 27.2, Go 1.27.2, run on 2026-11-02." },
      { k: "Commands", v: "make perf-guard, and go test -run xxx -bench . -benchmem -count=3 ./internal/engine/. Test counts from go test ./... -count=1 and npm test." },
      { k: "Determinism", v: "Same diagram and seed give the same result, so runs are comparable and failures reproducible." },
      { k: "What is measured", v: "Engine time only: no network, no browser, one design. Wall-clock speed-up is simulated time divided by run time." },
      { k: "Caveat", v: "Single machine and a single design. Harness overhead explains the 90 ms versus ~127 ms difference; I did not average them." },
    ],
    testsIntro: "The engine has no I/O, so almost everything is testable as plain functions, and challenges are tested like code.",
    tests: [
      { k: "703", v: "Go test functions", note: "1,091 including subtests, across 5 packages; all pass (2 min 6 s, go test ./... -count=1 on 2026-11-02)." },
      { k: "701", v: "frontend tests", note: "84 files with Vitest; all pass in 1.3 s." },
      { k: "108", v: "challenges, tested as data", note: "A test fails unless the starting design fails its goals and the reference solution passes across several seeds." },
      { k: "Theory", v: "closed-form checks", note: "Queue waits are compared with M/G/1, M/G/c and Little's law with stated tolerances (above)." },
      { k: "Browser", v: "headless Chrome checks", note: "Accessible names on every control, live region while running, focus in dialogs, layout at five laptop sizes, drag behaviour." },
      { k: "Guard", v: "performance regression", note: "A CI step fails if the large-design benchmark regresses in time, bytes or allocations." },
    ],
    failures: [
      { scenario: "Metastable failure", trigger: "55 req/s, one node slowed 8x for 5 s, clients retry immediately into a 500-deep queue", behaviour: "Success is still at or below 20% 35 s after the trigger ends.", outcome: "No retries, exponential backoff, a short queue, or a LIFO queue with a wait limit each recover to 95% or better." },
      { scenario: "Open vs closed crowd", trigger: "100 users at the same nominal rate", behaviour: "A closed crowd waits for answers and settles near 20 req/s; an open crowd at 100 req/s is drowned (success at or below 50%).", outcome: "Both match Little's law and the model explains why load tests that ignore think time lie." },
      { scenario: "Too many live simulations", trigger: "More than 64 sessions", behaviour: "New connections get 503 with Retry-After.", outcome: "Idle sessions are closed after 10 minutes and reconnect on Play." },
      { scenario: "Server cannot keep real time", trigger: "A heavy design", behaviour: "It advances at most 100 ms of wall time per tick under a 12 ms CPU budget.", outcome: "It slows down and warns instead of silently drifting." },
      { scenario: "Hostile diagram", trigger: "A crafted or oversized diagram sent over the API", behaviour: "It is sanitised and validated on the server; configuration-only challenges reject topology changes server-side too.", outcome: "The engine only ever runs sanitised designs. Sharing is rate-limited to 20 a minute per client and capped at 5,000 stored." },
    ],
    limitations: [
      "It is a request-flow and capacity model. It does not model product data flows such as feeds, chat or video pipelines, which would need fan-out, pub/sub and blob-storage blocks (the project's own gap analysis).",
      "Service times default to a low-variance distribution (SCV 0.25). Real services are usually far more variable; an advanced setting switches to exponential or heavy-tailed times.",
      "No recorded screen-reader pass yet: the automated accessibility checks confirm a well-formed tree, not that the experience makes sense to someone who cannot see it.",
      "Designs live in memory unless a data directory is configured; sharing is anonymous (the link is the access control, there are no accounts).",
      "One process, 64 concurrent live simulations. Benchmarks are from one machine and one design.",
    ],
  },
};
