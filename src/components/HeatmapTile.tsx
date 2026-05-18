import { useEffect, useMemo, useState } from "react";
import { PROFILE } from "@/lib/portfolioData";

interface Day {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const username = PROFILE.github.split("/").pop() || "tejaskothari03";

function synthDays(): Day[] {
  // Deterministic-ish pseudo-random pattern so it looks like a real heatmap.
  const out: Day[] = [];
  const today = new Date();
  for (let i = 52 * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // weighted: more zeros, fewer high levels
    const r = Math.sin(i * 12.9898) * 43758.5453;
    const f = r - Math.floor(r);
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (f > 0.9) level = 4;
    else if (f > 0.75) level = 3;
    else if (f > 0.55) level = 2;
    else if (f > 0.35) level = 1;
    out.push({ date: d.toISOString().slice(0, 10), count: level * 3, level });
  }
  return out;
}

export function HeatmapTile({ compact }: { compact?: boolean }) {
  const [days, setDays] = useState<Day[] | null>(null);
  const [synthetic, setSynthetic] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
        );
        if (!res.ok) throw new Error();
        const j = await res.json();
        if (!alive) return;
        const contrib = (j.contributions as Day[]) ?? [];
        if (contrib.length === 0) {
          setDays(synthDays());
          setSynthetic(true);
        } else {
          setDays(contrib);
        }
      } catch {
        if (alive) {
          setDays(synthDays());
          setSynthetic(true);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Bucket into weeks (7 days each), trimming to last 52 weeks.
  const weeks = useMemo(() => {
    if (!days) return [];
    const last = days.slice(-52 * 7);
    const w: Day[][] = [];
    for (let i = 0; i < last.length; i += 7) w.push(last.slice(i, i + 7));
    return w;
  }, [days]);

  const total = days?.reduce((s, d) => s + d.count, 0) ?? 0;

  return (
    <div className="flex flex-col h-full justify-between min-w-0 gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <div className={`${compact ? "text-[9px]" : "text-[10px] sm:text-xs"} uppercase tracking-[0.18em] opacity-85 font-semibold truncate`}>
          GitHub · last year
        </div>
        <div className={`${compact ? "text-[10px]" : "text-xs"} font-bold tabular-nums opacity-95`}>
          {days ? (synthetic ? "demo" : `${total} commits`) : "…"}
        </div>
      </div>
      <div className="flex-1 min-h-0 flex items-end">
        <div
          className="grid w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${weeks.length || 52}, minmax(0, 1fr))`,
            gridTemplateRows: "repeat(7, minmax(0, 1fr))",
            gridAutoFlow: "column",
            gap: "2px",
          }}
        >
          {weeks.flatMap((wk, wi) =>
            Array.from({ length: 7 }).map((_, di) => {
              const d = wk[di];
              const lvl = d?.level ?? 0;
              const alpha = [0.12, 0.32, 0.55, 0.78, 1][lvl];
              return (
                <div
                  key={`${wi}-${di}`}
                  title={d ? `${d.date}: ${d.count}` : ""}
                  style={{ backgroundColor: `rgba(255,255,255,${alpha})` }}
                  className="rounded-[1px]"
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
