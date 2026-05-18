import { useEffect, useState } from "react";

// WMO weather code → label + icon kind
type IconKind = "sun" | "partly" | "cloud" | "fog" | "drizzle" | "rain" | "snow" | "storm";
const WMO: Record<number, [IconKind, string]> = {
  0: ["sun", "Clear sky"],
  1: ["partly", "Mostly clear"],
  2: ["partly", "Partly cloudy"],
  3: ["cloud", "Overcast"],
  45: ["fog", "Foggy"],
  48: ["fog", "Foggy"],
  51: ["drizzle", "Light drizzle"],
  53: ["drizzle", "Drizzle"],
  55: ["drizzle", "Heavy drizzle"],
  61: ["rain", "Light rain"],
  63: ["rain", "Rain"],
  65: ["rain", "Heavy rain"],
  71: ["snow", "Light snow"],
  73: ["snow", "Snow"],
  75: ["snow", "Heavy snow"],
  80: ["rain", "Showers"],
  81: ["rain", "Showers"],
  82: ["storm", "Heavy showers"],
  95: ["storm", "Thunderstorm"],
  96: ["storm", "Thunderstorm + hail"],
  99: ["storm", "Severe thunder"],
};

function WeatherIcon({ kind, size = 44 }: { kind: IconKind; size?: number }) {
  const s = size;
  const sun = (
    <g>
      <circle cx="22" cy="22" r="8" fill="#ffd166" stroke="#f4a261" strokeWidth="1.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1="22" y1="22" x2={22 + Math.cos((a * Math.PI) / 180) * 16}
          y2={22 + Math.sin((a * Math.PI) / 180) * 16}
          stroke="#ffd166" strokeWidth="2.2" strokeLinecap="round"
        />
      ))}
      <circle cx="22" cy="22" r="8" fill="#ffd166" stroke="#f4a261" strokeWidth="1.5" />
    </g>
  );
  const cloud = (
    <g>
      <path
        d="M14 36 Q6 36 6 28 Q6 22 13 21 Q15 14 23 14 Q31 14 33 21 Q40 22 40 28 Q40 36 32 36 Z"
        fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.4"
      />
    </g>
  );
  switch (kind) {
    case "sun":
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" className="drop-shadow">
          {sun}
        </svg>
      );
    case "partly":
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" className="drop-shadow">
          <g transform="translate(-4 -5) scale(0.9)">{sun}</g>
          <g transform="translate(2 6)">{cloud}</g>
        </svg>
      );
    case "cloud":
      return <svg width={s} height={s} viewBox="0 0 44 44" className="drop-shadow">{cloud}</svg>;
    case "fog":
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" className="drop-shadow">
          {cloud}
          <line x1="8" y1="40" x2="36" y2="40" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="12" y1="42" x2="40" y2="42" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "drizzle":
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" className="drop-shadow">
          {cloud}
          {[14, 22, 30].map((x) => (
            <line key={x} x1={x} y1="38" x2={x - 1} y2="42" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" />
          ))}
        </svg>
      );
    case "rain":
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" className="drop-shadow">
          {cloud}
          {[12, 18, 24, 30].map((x) => (
            <line key={x} x1={x} y1="37" x2={x - 2} y2="43" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
          ))}
        </svg>
      );
    case "snow":
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" className="drop-shadow">
          {cloud}
          {[14, 22, 30].map((x) => (
            <text key={x} x={x - 3} y="43" fontSize="7" fill="#e0f2fe">❄</text>
          ))}
        </svg>
      );
    case "storm":
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" className="drop-shadow">
          {cloud}
          <polygon points="20,36 16,44 22,42 19,50 28,40 22,40 25,36" fill="#facc15" stroke="#eab308" strokeWidth="1" />
        </svg>
      );
  }
}

export function WeatherTile({ compact }: { compact?: boolean }) {
  const [data, setData] = useState<{ temp: number; code: number } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Bengaluru — 12.9716°N, 77.5946°E
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current=temperature_2m,weather_code&timezone=Asia%2FKolkata"
        );
        const j = await res.json();
        if (!alive) return;
        setData({
          temp: Math.round(j.current?.temperature_2m ?? 0),
          code: j.current?.weather_code ?? 0,
        });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const [kind, label] = data ? WMO[data.code] ?? ["cloud" as IconKind, "—"] : ["cloud" as IconKind, "Loading"];

  return (
    <div className="flex flex-col h-full justify-between min-w-0">
      <div className={`${compact ? "text-[9px]" : "text-[10px] sm:text-xs"} uppercase tracking-[0.18em] opacity-85 font-semibold truncate`}>
        Bengaluru · live
      </div>
      <div className="leading-tight flex items-center gap-2">
        <WeatherIcon kind={kind} size={compact ? 32 : 40} />
        <div className="min-w-0">
          <div className={`font-bold ${compact ? "text-lg" : "text-2xl"} tabular-nums leading-none`}>
            {data ? `${data.temp}°` : "—"}
          </div>
          <div className={`${compact ? "text-[10px]" : "text-xs"} opacity-90 truncate`}>{label}</div>
        </div>
      </div>
    </div>
  );
}
