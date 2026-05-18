import { useEffect, useMemo, useRef, useState } from "react";
import type { TileColor, TileData } from "@/lib/portfolioData";
import { PROFILE } from "@/lib/portfolioData";
import { Hourglass } from "./Hourglass";
import { VisitorTile } from "./VisitorTile";
import { WeatherTile } from "./WeatherTile";
import { HeatmapTile } from "./HeatmapTile";
import { CommitsTile } from "./CommitsTile";
import { SnakeGame } from "./SnakeGame";
import { playShuffleSfx, getSoundEnabled } from "@/lib/sound";
import { ArrowUpRight, FileText, Linkedin, Github, Mail, Phone, MapPin, Briefcase, GraduationCap, Code2, Sparkles, Moon, Sun, Globe, CloudSun, GitBranch, Gamepad2, Watch, Hourglass as HourglassIcon, Shuffle, Database, Cloud, Server, Activity, BarChart3, Terminal, Network, Container } from "lucide-react";

function useNightMode() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const update = () => setOn(root.classList.contains("night"));
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return on;
}

const COLOR_BG: Record<TileColor, string> = {
  blue: "bg-tile-blue",
  teal: "bg-tile-teal",
  green: "bg-tile-green",
  lime: "bg-tile-lime",
  orange: "bg-tile-orange",
  red: "bg-tile-red",
  magenta: "bg-tile-magenta",
  purple: "bg-tile-purple",
  indigo: "bg-tile-indigo",
  amber: "bg-tile-amber",
  pink: "bg-tile-pink",
  cyan: "bg-tile-cyan",
};

const KIND_ICON: Partial<Record<TileData["kind"], React.ComponentType<{ className?: string }>>> = {
  linkedin: Linkedin,
  github: Github,
  email: Mail,
  phone: Phone,
  location: MapPin,
  now: Briefcase,
  experience: Briefcase,
  education: GraduationCap,
  project: Code2,
  skills: Code2,
  resume: FileText,
  quote: Sparkles,
  birthday: HourglassIcon,
  night: Moon,
  visitor: Globe,
  weather: CloudSun,
  heatmap: Github,
  commits: GitBranch,
  game: Gamepad2,
  randomizer: Shuffle,
};

interface Props {
  tile?: TileData;
  color: TileColor;
  deco?: boolean;
  area: { x: number; y: number; w: number; h: number };
  onResumeClick?: () => void;
  onShuffle?: () => void;
}

function useBirthdayCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const { target, prev } = useMemo(() => {
    const d = new Date(now);
    let t = new Date(d.getFullYear(), PROFILE.birthday.month - 1, PROFILE.birthday.day, 0, 0, 0);
    if (t.getTime() <= now) t = new Date(d.getFullYear() + 1, PROFILE.birthday.month - 1, PROFILE.birthday.day, 0, 0, 0);
    const p = new Date(t.getFullYear() - 1, PROFILE.birthday.month - 1, PROFILE.birthday.day, 0, 0, 0);
    return { target: t.getTime(), prev: p.getTime() };
  }, [now]);
  const diff = Math.max(0, target - now);
  const total = target - prev;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
    remaining: total > 0 ? diff / total : 0,
  };
}

export function MetroTile({ tile, color, deco, area, onResumeClick, onShuffle }: Props) {
  const [flipped, setFlipped] = useState(false);
  const heatmapClicks = useRef(0);
  const countdown = useBirthdayCountdown();

  const nightOn = useNightMode();

  if (deco || !tile) {
    return (
      <div
        className={`${COLOR_BG[color]} w-full h-full opacity-85 hover:opacity-100 transition-opacity`}
        aria-hidden
      />
    );
  }

  const isResume = tile.kind === "resume";
  const isHero = tile.kind === "hero";
  const isBirthday = tile.kind === "birthday";
  const isNight = tile.kind === "night";
  const isGame = tile.kind === "game";
  const isCommits = tile.kind === "commits";
  const isHeatmap = tile.kind === "heatmap";
  const isRandomizer = tile.kind === "randomizer";
  const isSkills = tile.kind === "skills";
  const isWatch = tile.kind === "watch";
  const isLinkedInCta = tile.id === "linkedin-cta";
  const isStatic = isCommits || isNight;
  
  const area_cells = area.w * area.h;
  const big = area_cells >= 16;
  const medium = area_cells >= 9;
  const tiny = area_cells <= 4;
  const Icon = isNight ? (nightOn ? Moon : Sun) : KIND_ICON[tile.kind];
  const iconExtra = isNight ? { fill: "currentColor" as const } : {};

  const pad = tiny ? "p-2" : area.h <= 2 ? "p-2.5 sm:p-3" : "p-3 sm:p-4";
  const labelSize = tiny ? "text-[9px]" : "text-[10px] sm:text-xs";

  const frontValue = isBirthday
    ? `${countdown.days}d ${String(countdown.hours).padStart(2, "0")}h`
    : isNight ? (nightOn ? "Night" : "Day")
    : (tile.front.value ?? tile.front.label);

  const valueSize = isBirthday
    ? (big ? "text-3xl sm:text-4xl" : medium ? "text-2xl sm:text-3xl" : "text-lg sm:text-2xl")
    : isHero ? "text-2xl sm:text-4xl md:text-5xl"
    : big ? "text-xl sm:text-3xl"
    : medium ? "text-base sm:text-xl"
    : tiny ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm";

  const birthdayBody = `${countdown.days}d : ${String(countdown.hours).padStart(2, "0")}h : ${String(countdown.mins).padStart(2, "0")}m : ${String(countdown.secs).padStart(2, "0")}s left until Nov 3.`;

  const handleClick = (e: React.MouseEvent) => {
    if (getSoundEnabled()) playShuffleSfx();
    if (isResume) {
      onResumeClick?.();
      return;
    }
    if (isNight) {
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        const on = root.classList.toggle("night");
        try { localStorage.setItem("tejas-portfolio:night", on ? "1" : "0"); } catch {}
      }
      return;
    }
    if (isHeatmap) {
      heatmapClicks.current += 1;
      if (heatmapClicks.current >= 3) {
        heatmapClicks.current = 0;
        setFlipped((f) => !f);
      }
      return;
    }
    if (isRandomizer) {
      onShuffle?.();
      return;
    }
    // For watch / linkedin-cta: first click flips, second click on the back opens href.
    if ((isWatch || isLinkedInCta) && flipped && tile.href) {
      window.open(tile.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (isStatic) return; // keep static so inner controls stay clickable
    setFlipped((f) => !f);
  };

  return (
    <div
      className={`tile-3d ${flipped ? "flipped" : ""} ${isStatic || isHeatmap || isNight ? "no-flip" : ""} block w-full h-full min-h-0 overflow-hidden select-none ${isStatic ? "cursor-default" : "cursor-pointer"}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={tile.front.label}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(e as unknown as React.MouseEvent); } }}
    >
      <div className="tile-inner">
        {/* FRONT */}
        <div
          className={`tile-face ${isHeatmap ? "bg-tile-heatmap" : isWatch ? "" : COLOR_BG[color]} ${pad} flex flex-col justify-between overflow-hidden relative min-h-0 ${isWatch ? "text-slate-900" : ""}`}
          style={isWatch ? { backgroundColor: "#efe9df" } : undefined}
        >
          {isBirthday ? (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-2">
                <Hourglass remaining={countdown.remaining} className="h-full w-auto max-w-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]" />
              </div>
              <div className="relative z-10 flex items-start justify-between gap-2 min-w-0">
                <span className={`${labelSize} uppercase tracking-[0.18em] opacity-95 font-semibold truncate bg-black/15 px-1.5 py-0.5 rounded-sm`}>
                  {tile.front.label}
                </span>
              </div>
              <div className="relative z-10 font-bold leading-none text-right tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)] bg-black/15 self-end px-2 py-1 rounded-sm">
                <div className={big ? "text-2xl sm:text-3xl" : medium ? "text-xl sm:text-2xl" : "text-base sm:text-lg"}>
                  {countdown.days}
                  <span className="text-[0.5em] opacity-90 ml-0.5">d</span>
                </div>
                <div className={`opacity-95 mt-0.5 ${medium ? "text-xs sm:text-sm" : "text-[10px]"}`}>
                  {String(countdown.hours).padStart(2, "0")}:{String(countdown.mins).padStart(2, "0")}:{String(countdown.secs).padStart(2, "0")}
                </div>
              </div>
            </>
          ) : isNight ? (
            <NightSlider on={nightOn} labelSize={labelSize} />
          ) : isWatch ? (
            <WatchFront label={tile.front.label} value={tile.front.value ?? ""} labelSize={labelSize} />
          ) : tile.kind === "visitor" ? (
            <VisitorTile compact={tiny} />
          ) : tile.kind === "weather" ? (
            <WeatherTile compact={tiny} />
          ) : tile.kind === "heatmap" ? (
            <HeatmapTile compact={tiny} />
          ) : tile.kind === "commits" ? (
            <CommitsTile compact={tiny} />
          ) : isGame ? (
            <>
              <div className="flex items-start justify-between gap-2 min-w-0">
                <span className={`${labelSize} uppercase tracking-[0.18em] opacity-80 font-semibold truncate`}>
                  {tile.front.label}
                </span>
                {Icon && <Icon {...iconExtra} className={`${tiny ? "w-3 h-3" : "w-4 h-4"} opacity-90 shrink-0`} />}
              </div>
              <div className={`font-bold leading-[1.05] ${valueSize}`}>
                {tile.front.value}
              </div>
              <div className="text-[10px] opacity-80">tap → press SPACE to start</div>
            </>
          ) : isRandomizer ? (
            <RandomizerFront label={tile.front.label} value={tile.front.value ?? "Shuffle"} labelSize={labelSize} valueSize={valueSize} />
          ) : isSkills ? (
            <SkillsFace label={tile.front.label} title={null} body={tile.front.value ?? ""} compact={tiny || area.h <= 2} labelSize={labelSize} area={area} />
          ) : isLinkedInCta ? (
            <LinkedInCtaFront label={tile.front.label} value={tile.front.value ?? ""} labelSize={labelSize} />
          ) : (
            <>
              <div className="flex items-start justify-between gap-2 min-w-0">
                <span className={`${labelSize} uppercase tracking-[0.18em] opacity-80 font-semibold truncate`}>
                  {tile.front.label}
                </span>
                {Icon && <Icon {...iconExtra} className={`${isNight ? (tiny ? "w-5 h-5" : "w-7 h-7") : tiny ? "w-3 h-3" : "w-4 h-4"} opacity-95 shrink-0 ${isNight ? "drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]" : ""}`} />}
              </div>
              <div className={`font-bold leading-[1.05] break-words ${valueSize}`}>
                {frontValue}
              </div>
              {isHero && (
                <>
                  <p className="text-[11px] sm:text-xs md:text-sm opacity-90 leading-snug mt-1 line-clamp-5">
                    Software engineer with ~5 years of experience in backend and infra development. Enjoys solving problems in distributed and scalable environments. Loves making and learning via projects — open to collaborations.
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs opacity-85 mt-1">
                    <Watch className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="tracking-wide">loves mechanical watches</span>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* BACK */}
        <div className={`tile-back tile-face ${isHeatmap ? "bg-tile-heatmap" : COLOR_BG[color]} brightness-[0.85] ${pad} flex flex-col justify-between overflow-hidden min-h-0`}>
          {isGame ? (
            <SnakeGame active={flipped} />
          ) : isHero ? (
            <div className="flex flex-col h-full min-h-0 min-w-0 gap-1.5">
              <div className="flex items-center justify-between gap-2 shrink-0">
                <span className={`${labelSize} uppercase tracking-[0.18em] opacity-85 font-semibold truncate`}>
                  {tile.back.title}
                </span>
              </div>
              {area.h >= 5 && (
                <p className="text-[11px] leading-snug opacity-90 line-clamp-2 shrink-0">
                  Backend engineer — distributed systems, clean APIs, shipping things that don't wake people at 3am.
                </p>
              )}
              <div className="min-w-0 min-h-0 flex-1 flex flex-col">
                <div className="text-[8px] uppercase tracking-[0.2em] opacity-75 mb-1 flex items-center gap-1 shrink-0">
                  <Briefcase className="w-2.5 h-2.5" /> Career
                </div>
                <div className="flex-1 min-h-0">
                  <HorizontalTimeline compact={area.h <= 4} />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 text-[9px] sm:text-[10px] shrink-0">
                <span className="flex items-center gap-1 opacity-90"><MapPin className="w-3 h-3" /> Bengaluru</span>
                <span className="flex items-center gap-1 opacity-90"><Watch className="w-3 h-3" /> watch nerd</span>
              </div>
            </div>
          ) : isSkills ? (
            <SkillsFace label={tile.back.title} title={tile.back.title} body={tile.back.body} compact={tiny || area.h <= 2} labelSize={labelSize} area={area} showIcons />
          ) : isRandomizer ? (
            <RandomizerBack body={tile.back.body} labelSize={labelSize} title={tile.back.title} />
          ) : (
            <>
              <div className="min-w-0">
                <div className={`${labelSize} uppercase tracking-[0.18em] opacity-80 font-semibold mb-1 truncate`}>
                  {tile.back.title}
                </div>
                <p className={`leading-snug break-words ${medium ? "text-sm" : tiny ? "text-[10px]" : "text-[11px] sm:text-xs"} opacity-95`}>
                  {isBirthday ? birthdayBody : tile.back.body}
                </p>
              </div>
              <div className="flex items-end justify-between gap-2 mt-1">
                {tile.back.meta && !isBirthday && (
                  <span className="text-[10px] opacity-70 truncate">{tile.back.meta}</span>
                )}
                {tile.href && (
                  <a
                    href={tile.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="ml-auto inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider opacity-95 hover:opacity-100 underline-offset-2 hover:underline"
                  >
                    Open <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
                {isResume && <ArrowUpRight className="w-4 h-4 ml-auto opacity-90 shrink-0" />}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const WATCHES = [
  { name: "Seiko SKX007", tag: "diver · automatic", dial: "#0b2545", bezel: "#0a1a30", accent: "#e9c46a" },
  { name: "Omega Speedmaster", tag: "moonwatch · manual", dial: "#000000", bezel: "#1a1a1a", accent: "#ffffff" },
  { name: "Rolex Submariner", tag: "diver · icon", dial: "#0a4d2e", bezel: "#053522", accent: "#c9a84c" },
  { name: "Casio F-91W", tag: "digital · legend", dial: "#1c1c1c", bezel: "#2a2a2a", accent: "#7dd3fc" },
];

function WatchCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % WATCHES.length), 2500);
    return () => clearInterval(id);
  }, []);
  const w = WATCHES[i];
  return (
    <div
      className="flex items-center gap-2 bg-black/20 rounded-sm px-2 py-1.5 min-w-0"
      onClick={(e) => { e.stopPropagation(); setI((x) => (x + 1) % WATCHES.length); }}
      role="button"
      aria-label="next watch"
    >
      <svg viewBox="0 0 40 40" className="w-9 h-9 shrink-0 drop-shadow">
        <rect x="15" y="2" width="10" height="6" rx="1.5" fill={w.bezel} />
        <rect x="15" y="32" width="10" height="6" rx="1.5" fill={w.bezel} />
        <circle cx="20" cy="20" r="13" fill={w.bezel} />
        <circle cx="20" cy="20" r="10.5" fill={w.dial} />
        <line x1="20" y1="20" x2="20" y2="12" stroke={w.accent} strokeWidth="1.4" strokeLinecap="round" />
        <line x1="20" y1="20" x2="26" y2="20" stroke={w.accent} strokeWidth="1" strokeLinecap="round" />
        <circle cx="20" cy="20" r="1" fill={w.accent} />
      </svg>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold leading-tight truncate">{w.name}</div>
        <div className="text-[9px] opacity-75 truncate">{w.tag}</div>
      </div>
      <div className="flex gap-0.5 shrink-0">
        {WATCHES.map((_, k) => (
          <span key={k} className={`w-1 h-1 rounded-full ${k === i ? "bg-white" : "bg-white/30"}`} />
        ))}
      </div>
    </div>
  );
}

const TIMELINE: { y: string; org: string; role: string; logo: string; tone: string; note: string }[] = [
  { y: "Aug 2017 – Jun 2021", org: "Vellore Institute of Technology", role: "B.Tech Computer Science", logo: "vit", tone: "bg-timeline-vit", note: "CGPA 8.24" },
  { y: "Jun 2021 – Feb 2024", org: "Sandvine (now AppLogic)", role: "Software Engineer 2", logo: "https://logo.clearbit.com/sandvine.com", tone: "bg-timeline-sandvine", note: 'Innovated algorithmic features. Very "high throughput" experience!' },
  { y: "Mar 2024 – Nov 2024", org: "1mg", role: "Software Engineer 2", logo: "https://logo.clearbit.com/1mg.com", tone: "bg-timeline-1mg", note: 'Decomposed monolith to microservices architecture. Very "eventful" experience!' },
  { y: "Nov 2024 – Jul 2025", org: "Observe.AI", role: "Software Engineer 2", logo: "https://logo.clearbit.com/observe.ai", tone: "bg-timeline-observe", note: 'Built voice-agent infrastructure and low-latency streaming integrations. Very "utterly conversational" experience!' },
  { y: "Dec 2025 – Apr 2026", org: "CoinTracker", role: "Software Engineer 2", logo: "https://logo.clearbit.com/cointracker.io", tone: "bg-timeline-cointracker", note: 'Integrated multiple blockchains and squished bugs. Very "cryptic" experience!' },
];

function VITShield() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden>
      <defs>
        <linearGradient id="vitg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <path d="M16 2 L29 6 V16 C29 23 23 28 16 30 C9 28 3 23 3 16 V6 Z" fill="url(#vitg)" stroke="#fff" strokeWidth="1.2" />
      <text x="16" y="20" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff" fontFamily="Inter, system-ui, sans-serif">VIT</text>
    </svg>
  );
}

function CompanyMark({ logo, org }: { logo: string; org: string }) {
  if (logo === "vit") return <VITShield />;
  return (
    <img
      src={logo}
      alt={`${org} logo`}
      className="w-full h-full object-cover"
      loading="lazy"
      onError={(e) => {
        const t = e.currentTarget;
        const domain = logo.replace("https://logo.clearbit.com/", "");
        if (!t.dataset.fallback) {
          t.dataset.fallback = "1";
          t.src = `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
          t.className = "w-6 h-6 object-contain";
        }
      }}
    />
  );
}

function TimelineCell({ s, markSize, fontPx, notePx, markPx }: { s: typeof TIMELINE[number]; markSize: string; fontPx: number; notePx: number; markPx: number }) {
  return (
    <div className="w-full h-full flex flex-col items-center text-center px-1 overflow-hidden gap-0.5">
      <span
        className="relative rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.25)] ring-2 ring-white/70 flex items-center justify-center overflow-hidden z-10 shrink-0"
        style={{ width: markPx, height: markPx }}
      >
        <CompanyMark logo={s.logo} org={s.org} />
      </span>
      <div className="tabular-nums opacity-80 leading-tight w-full truncate shrink-0" style={{ fontSize: Math.max(8, fontPx - 2) }}>{s.y}</div>
      <div className="font-semibold leading-tight w-full line-clamp-1 shrink-0" style={{ fontSize: fontPx }}>{s.org}</div>
      <div className={`${s.tone} leading-snug px-1 py-px max-w-full font-semibold text-black/80 rounded-sm line-clamp-3 min-h-0`} style={{ fontSize: notePx }}>{s.note}</div>
    </div>
  );
}

function HorizontalTimeline({ compact = false }: { compact?: boolean }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const numRows = Math.ceil(TIMELINE.length / 2);
  // Fill the parent's height by computing per-row height; clamp to sensible bounds.
  const minRowH = compact ? 64 : 80;
  const maxRowH = compact ? 140 : 200;
  const rowH = size.h > 0
    ? Math.max(minRowH, Math.min(maxRowH, Math.floor(size.h / numRows)))
    : (compact ? 80 : 100);
  const markerY = Math.round(rowH * 0.22);
  const archR = rowH / 2;
  // Scale fonts and marker with available row height.
  const markPx = Math.max(22, Math.min(48, Math.round(rowH * 0.34)));
  const fontPx = Math.max(9, Math.min(15, Math.round(rowH * 0.11)));
  const notePx = Math.max(8, Math.min(13, Math.round(rowH * 0.095)));
  const markSize = "";

  const placed = TIMELINE.map((item, i) => {
    const row = Math.floor(i / 2);
    const isLTR = row % 2 === 0;
    const colInRow = i % 2;
    const col = isLTR ? colInRow : 1 - colInRow;
    return { item, row, col };
  });

  const stroke = "rgba(255,255,255,0.5)";

  return (
    <div ref={wrapRef} className="relative w-full h-full">
      <div className="absolute inset-0 mx-auto" style={{ maxWidth: 640 }}>
        {Array.from({ length: numRows }).map((_, ri) => {
          const rowItems = TIMELINE.slice(ri * 2, ri * 2 + 2);
          if (rowItems.length < 2) return null;
          return (
            <div
              key={`h${ri}`}
              className="absolute"
              style={{
                top: ri * rowH + markerY - 1,
                left: "25%",
                right: "25%",
                height: 2,
                background: stroke,
              }}
            />
          );
        })}

        {Array.from({ length: numRows - 1 }).map((_, ri) => {
          const isLTR = ri % 2 === 0;
          const top = ri * rowH + markerY - 1;
          const common = {
            position: "absolute" as const,
            top,
            height: rowH,
            width: archR,
            borderTop: `2px solid ${stroke}`,
            borderBottom: `2px solid ${stroke}`,
            pointerEvents: "none" as const,
          };
          return isLTR ? (
            <div
              key={`a${ri}`}
              style={{
                ...common,
                left: "75%",
                borderRight: `2px solid ${stroke}`,
                borderTopRightRadius: archR,
                borderBottomRightRadius: archR,
              }}
            />
          ) : (
            <div
              key={`a${ri}`}
              style={{
                ...common,
                right: "75%",
                borderLeft: `2px solid ${stroke}`,
                borderTopLeftRadius: archR,
                borderBottomLeftRadius: archR,
              }}
            />
          );
        })}

        {placed.map(({ item, row, col }) => (
          <div
            key={item.org}
            className="absolute"
            style={{
              top: row * rowH,
              left: `${col * 50}%`,
              width: "50%",
              height: rowH,
            }}
          >
            <TimelineCell s={item} markSize={markSize} fontPx={fontPx} notePx={notePx} markPx={markPx} />
          </div>
        ))}
      </div>
    </div>
  );
}

const TECH_STACK: { name: string; slug: string }[] = [
  { name: "Python", slug: "python" },
  { name: "FastAPI", slug: "fastapi" },
  { name: "AWS", slug: "amazonwebservices" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "Redis", slug: "redis" },
  { name: "Data Structures", slug: "_ds" },
  { name: "Algorithms", slug: "_algo" },
  { name: "Prometheus", slug: "prometheus" },
  { name: "Grafana", slug: "grafana" },
  { name: "Bash", slug: "gnubash" },
  { name: "Distributed", slug: "_network" },
  { name: "K8s", slug: "kubernetes" },
  { name: "Datadog", slug: "datadog" },
];

// Brand colors so custom icons match the simpleicons brand palette.
const BRAND: Record<string, string> = {
  python: "#3776AB",
  fastapi: "#009688",
  postgresql: "#4169E1",
  redis: "#DC382D",
  prometheus: "#E6522C",
  grafana: "#F46800",
  gnubash: "#4EAA25",
  kubernetes: "#326CE5",
  datadog: "#632CA6",
  _network: "#06B6D4",
  _ds: "#8B5CF6",
  _algo: "#EC4899",
  amazonwebservices: "#FF9900",
};

function IconChip({ children, title, size }: { children: React.ReactNode; title: string; size: number }) {
  return (
    <div
      className="rounded-md bg-white flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.25)] ring-1 ring-black/5"
      style={{ width: size, height: size }}
      title={title}
    >
      {children}
    </div>
  );
}

function TechIcon({ slug, name, size }: { slug: string; name: string; size: number }) {
  const color = BRAND[slug] ?? "#111";
  const inner = Math.round(size * 0.66);
  const innerStyle = { width: inner, height: inner } as React.CSSProperties;
  if (slug === "_network") {
    return <IconChip title={name} size={size}><Network style={{ ...innerStyle, color }} /></IconChip>;
  }
  if (slug === "_ds") {
    return <IconChip title={name} size={size}><Database style={{ ...innerStyle, color }} /></IconChip>;
  }
  if (slug === "_algo") {
    return <IconChip title={name} size={size}><BarChart3 style={{ ...innerStyle, color }} /></IconChip>;
  }
  if (slug === "amazonwebservices") {
    const awsW = Math.round(size * 0.78);
    return (
      <IconChip title={name} size={size}>
        <svg viewBox="0 0 64 40" style={{ width: awsW, height: awsW }} aria-hidden>
          <path d="M18 18 A 10 10 0 0 1 36 14 A 8 8 0 0 1 48 22 A 6 6 0 0 1 46 34 H 18 A 8 8 0 0 1 18 18 Z" fill="#232F3E" />
          <path d="M8 36 Q 32 46 56 36" stroke="#FF9900" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M52 33 L57 36 L52 39" stroke="#FF9900" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </IconChip>
    );
  }
  const hex = (BRAND[slug] ?? "111111").replace("#", "");
  return (
    <IconChip title={name} size={size}>
      <img
        src={`https://cdn.simpleicons.org/${slug}/${hex}`}
        alt={name}
        loading="lazy"
        style={innerStyle}
        className="object-contain"
        onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
      />
    </IconChip>
  );
}

function SkillsFace({
  label,
  body,
  compact,
  labelSize,
  area,
}: {
  label: string | null;
  title?: string | null;
  body?: string;
  compact: boolean;
  labelSize: string;
  area?: { w: number; h: number };
  showIcons?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((e) => {
      const r = e[0].contentRect;
      setBox({ w: r.width, h: r.height });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const cols = 4;
  const rows = Math.ceil(TECH_STACK.length / cols);
  const gap = 8;
  const labelGutter = !compact ? 14 : 0; // room for caption
  const cellW = box.w > 0 ? (box.w - gap * (cols - 1)) / cols : 32;
  const cellH = box.h > 0 ? (box.h - gap * (rows - 1)) / rows - labelGutter : 32;
  const chipSize = Math.max(20, Math.min(72, Math.floor(Math.min(cellW, cellH))));
  const captionSize = Math.max(8, Math.min(13, Math.floor(chipSize * 0.22)));

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 gap-1.5">
      {label && (
        <div className={`${labelSize} uppercase tracking-[0.18em] opacity-85 font-semibold truncate shrink-0`}>
          {label}
        </div>
      )}
      <div ref={wrapRef} className="grid grid-cols-4 gap-2 flex-1 min-h-0 place-items-center content-center">
        {TECH_STACK.map((t) => (
          <div key={t.name} className="flex flex-col items-center gap-0.5 min-w-0">
            <TechIcon slug={t.slug} name={t.name} size={chipSize} />
            {!compact && (
              <span
                className="opacity-85 truncate max-w-full leading-none"
                style={{ fontSize: captionSize }}
              >
                {t.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RandomizerFront({ label, value, labelSize, valueSize }: { label: string; value: string; labelSize: string; valueSize: string }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2 min-w-0">
        <span className={`${labelSize} uppercase tracking-[0.18em] opacity-85 font-semibold truncate`}>{label}</span>
        <Shuffle className="w-4 h-4 opacity-90 shrink-0" />
      </div>
      <div className="flex-1 min-h-0 my-1"><FloatingMosaic /></div>
      <div className={`font-bold leading-[1.05] ${valueSize}`}>{value}</div>
    </>
  );
}

function RandomizerBack({ title, body, labelSize }: { title: string; body: string; labelSize: string }) {
  return (
    <div className="flex flex-col h-full min-h-0 gap-1.5">
      <div className={`${labelSize} uppercase tracking-[0.18em] opacity-85 font-semibold truncate shrink-0`}>{title}</div>
      <div className="flex-1 min-h-0"><FloatingMosaic /></div>
      <p className="text-[10px] sm:text-[11px] opacity-90 leading-snug shrink-0">{body}</p>
    </div>
  );
}

const MOSAIC_PALETTE = [
  "bg-tile-blue","bg-tile-green","bg-tile-orange","bg-tile-red","bg-tile-purple",
  "bg-tile-teal","bg-tile-magenta","bg-tile-amber","bg-tile-cyan","bg-tile-indigo",
  "bg-tile-lime","bg-tile-pink",
];

function FloatingMosaic() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1400);
    return () => clearInterval(id);
  }, []);
  const cells = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      color: MOSAIC_PALETTE[Math.floor(Math.random() * MOSAIC_PALETTE.length)],
      dx: (Math.random() - 0.5) * 10,
      dy: (Math.random() - 0.5) * 10,
      rot: (Math.random() - 0.5) * 10,
      key: `${tick}-${i}`,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);
  return (
    <div className="relative w-full h-full rounded-sm overflow-hidden bg-black/20 p-1">
      <div className="grid grid-cols-4 grid-rows-3 gap-1 w-full h-full">
        {cells.map((c) => (
          <div
            key={c.key}
            className={`${c.color} rounded-sm shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition-all duration-[1200ms] ease-out`}
            style={{ transform: `translate(${c.dx}px, ${c.dy}px) rotate(${c.rot}deg)` }}
          />
        ))}
      </div>
    </div>
  );
}


function NightSlider({ on, labelSize }: { on: boolean; labelSize: string }) {
  return (
    <div className="flex flex-col h-full min-h-0 gap-1.5">
      <div className={`${labelSize} uppercase tracking-[0.18em] opacity-85 font-semibold truncate shrink-0 flex items-center justify-between`}>
        <span>Theme</span>
        <span className="opacity-80 normal-case tracking-normal text-[10px]">{on ? "Night" : "Day"}</span>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div
          className={`relative w-full max-w-[120px] h-9 rounded-full transition-colors duration-500 ${on ? "bg-slate-900/40" : "bg-amber-200/40"} ring-1 ring-white/30 shadow-inner`}
        >
          {/* tiny stars / rays decorations */}
          <span className={`absolute left-2 top-1/2 -translate-y-1/2 text-[10px] transition-opacity duration-500 ${on ? "opacity-90" : "opacity-40"}`} aria-hidden>✦</span>
          <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] transition-opacity duration-500 ${on ? "opacity-40" : "opacity-90"}`} aria-hidden>☼</span>
          <div
            className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-[0_4px_10px_rgba(0,0,0,0.35)] flex items-center justify-center transition-all duration-500 ease-out"
            style={{ left: on ? "calc(100% - 30px)" : "2px" }}
          >
            {on ? (
              <Moon className="w-4 h-4 text-slate-700" fill="currentColor" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" fill="currentColor" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkedInCtaFront({ label, value, labelSize }: { label: string; value: string; labelSize: string }) {
  return (
    <div className="flex flex-col h-full min-h-0 justify-between items-center text-center gap-1.5">
      <div className={`${labelSize} uppercase tracking-[0.18em] opacity-85 font-semibold truncate self-stretch text-left`}>
        {label}
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center w-full">
        <div className="rounded-md bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] ring-1 ring-black/5 w-[60%] aspect-square max-w-[64px]">
          <Linkedin className="w-[70%] h-[70%] text-[#0A66C2]" fill="#0A66C2" />
        </div>
      </div>
      <div className="font-bold leading-[1.05] text-xs sm:text-sm self-stretch text-right">{value}</div>
    </div>
  );
}

function WatchFront({ label, value, labelSize }: { label: string; value: string; labelSize: string }) {
  const TISSOT_IMG = "https://www.tissotwatches.com/dw/image/v2/BKKD_PRD/on/demandware.static/-/Sites-Tissot-Catalogue/default/dw9cd76665/product-pictures/081f190e-c331-497b-9d9d-3bcbdd48aee4_T006-407-11-033-03_shadow.png";
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 gap-1.5">
      <div className={`${labelSize} uppercase tracking-[0.18em] opacity-70 font-semibold shrink-0 flex items-start gap-1 break-words [overflow-wrap:anywhere] leading-snug`}>
        <Watch className="w-3 h-3 mt-0.5 shrink-0" /> <span className="min-w-0">{label}</span>
      </div>
      <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center relative">
        {!failed ? (
          <img
            src={TISSOT_IMG}
            alt="Tissot PRC 200"
            className="max-h-full max-w-full object-contain"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <svg viewBox="0 0 100 100" className="h-full w-auto max-w-full" aria-hidden>
            <circle cx="50" cy="50" r="34" fill="#0f172a" stroke="#475569" strokeWidth="3" />
            <circle cx="50" cy="50" r="28" fill="#1e293b" />
            <line x1="50" y1="50" x2="50" y2="28" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="50" x2="66" y2="50" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="50" r="2" fill="#f59e0b" />
          </svg>
        )}
      </div>
      <div className="font-semibold leading-tight text-xs sm:text-sm shrink-0 break-words [overflow-wrap:anywhere]">{value}</div>
    </div>
  );
}

