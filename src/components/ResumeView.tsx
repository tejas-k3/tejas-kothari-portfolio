import { motion } from "motion/react";
import { ArrowLeft, Mail, Phone, Linkedin, MapPin } from "lucide-react";
import { PROFILE } from "@/lib/portfolioData";

interface Props { onClose: () => void; }

const experience = [
  {
    co: "CoinTracker", role: "Software Engineer II", date: "Dec 2025 — Apr 2026",
    bullets: [
      "Led 3 blockchain integrations (Bittensor, Starknet, Tezos) end-to-end with full test coverage.",
      "Fixed balance discrepancies across 5 chains by identifying upstream data issues.",
      "Built code-generation tool for blockchain integrations, cutting setup time from 1–2 weeks to 2 days.",
      "Improved reliability via node failover, state-driven flows, removed N+1 queries.",
      "Hardened CSV ingestion pipeline with race-condition handling and validation.",
    ],
  },
  {
    co: "ObserveAI", role: "SDE II", date: "Nov 2024 — Jul 2025",
    bullets: [
      "Instrumented custom backend metrics and built Helm charts for log + metric-based alerts.",
      "Added context-enriched logging across async Python services, speeding up debugging.",
      "Engineered custom load-testing framework for TTS, STT, and LLM vendor APIs.",
      "Set K8s service label + log aggregation standards, unifying collection across microservices.",
    ],
  },
  {
    co: "1mg", role: "SDE II", date: "Mar 2024 — Nov 2024",
    bullets: [
      "Decomposed Catalog Management from a Rails monolith to Python + Sanic, dropping API latency 40%.",
      "Implemented Tenant Management microservice for multi-tenant architecture.",
      "Designed right-sized schema aligned with the SaaS model.",
    ],
  },
  {
    co: "Sandvine", role: "Software Engineer II", date: "Jun 2021 — Feb 2024",
    bullets: [
      "Developed SQL-powered REST APIs filtering 1M+ subscribers' internet activity, +40% engagement.",
      "Built an algorithm to detect social-media uploads from raw internet data at 90% precision.",
      "Composed state-management module for PCAP processing, 30% faster via parallel processing.",
      "Built cleanup module pruning records by date range — 23 TB saved on-prem.",
    ],
  },
];

const projects = [
  {
    name: "Rupee Engine", date: "Feb 2026 — present",
    bullets: [
      "CLI equity analysis across 1300+ NSE stocks combining fundamentals, technicals, sentiment.",
      "11 pluggable algorithms (momentum, value, mean reversion, sentiment, …) for scoring + portfolio optimization.",
      "Async ingestion, TTL-based caching, incremental refresh over NSE + Screener APIs.",
    ],
    stack: "Python · httpx · msgspec",
  },
  {
    name: "AOV Studios Website", date: "Jun 2023 — Aug 2023",
    bullets: ["Led & built React SPA — aovstudios.co.in"],
    stack: "JavaScript · React",
  },
  {
    name: "Twitter Malicious Bot Detection", date: "Oct 2021",
    bullets: [
      "Metric to detect malicious bots/botnets with 90% confidence.",
      "Won 'Most Radical Idea' at Sandvine 2021 Hackathon (40+ teams).",
    ],
    stack: "Java · Python · SQL · Redis · Vertica · Twitter API",
  },
];

const skills = {
  Languages: ["Python", "Java", "JavaScript", "SQL", "LogQL"],
  Frameworks: ["FastAPI", "Django", "Flask", "Sanic", "Spring Boot", "React"],
  Systems: ["Distributed Systems", "Microservices", "HLD/LLD", "PostgreSQL", "Redis"],
  Platform: ["AWS", "Kubernetes", "Prometheus", "Grafana", "Loki", "Datadog"],
};

export function ResumeView({ onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-30 bg-background scroll-y"
    >
      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to tiles
        </button>

        <header className="border-b border-border pb-6 mb-8">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">{PROFILE.name}</h1>
          <p className="text-lg text-muted-foreground mt-1">{PROFILE.role}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{PROFILE.email}</span>
            <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{PROFILE.phone}</span>
            <span className="inline-flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5" />{PROFILE.linkedin}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{PROFILE.location}</span>
          </div>
        </header>

        <Section title="Skills">
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(skills).map(([k, v]) => (
              <div key={k}>
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">{k}</div>
                <div className="text-sm">{v.join(" · ")}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Experience">
          <div className="space-y-6">
            {experience.map((e) => (
              <div key={e.co}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold">{e.co} <span className="text-muted-foreground font-normal">· {e.role}</span></h3>
                  <span className="text-xs text-muted-foreground">{e.date}</span>
                </div>
                <ul className="mt-2 space-y-1.5 text-sm list-disc list-outside pl-5 marker:text-muted-foreground">
                  {e.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Projects">
          <div className="space-y-5">
            {projects.map((p) => (
              <div key={p.name}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <span className="text-xs text-muted-foreground">{p.date}</span>
                </div>
                <ul className="mt-2 space-y-1.5 text-sm list-disc list-outside pl-5 marker:text-muted-foreground">
                  {p.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
                <div className="text-xs text-muted-foreground mt-1.5">{p.stack}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Education">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold">Vellore Institute of Technology, Bhopal</h3>
            <span className="text-xs text-muted-foreground">Aug 2017 — Jun 2021</span>
          </div>
          <p className="text-sm text-muted-foreground">B.Tech, Computer Science · CGPA 8.24</p>
        </Section>
      </div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}
