import { useEffect, useState } from "react";

function flagFromCC(cc: string): string {
  if (!cc || cc.length !== 2) return "🌍";
  const codePoints = cc
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

interface Info {
  city: string;
  country: string;
  cc: string;
  tz: string;
}

export function VisitorTile({ compact }: { compact?: boolean }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error("ipapi");
        const j = await res.json();
        if (!alive) return;
        setInfo({
          city: j.city || "—",
          country: j.country_name || "—",
          cc: j.country_code || "",
          tz: j.timezone || tz,
        });
      } catch {
        if (!alive) return;
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        setInfo({ city: tz.split("/").pop() || "Earth", country: "", cc: "", tz });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const tz = info?.tz;
    const tick = () => {
      try {
        const t = new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: tz,
        });
        setTime(t);
      } catch {
        setTime(new Date().toLocaleTimeString());
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [info?.tz]);

  return (
    <div className="flex flex-col h-full justify-between min-w-0">
      <div className={`${compact ? "text-[9px]" : "text-[10px] sm:text-xs"} uppercase tracking-[0.18em] opacity-85 font-semibold leading-tight`}>
        Hello — looks like this is<br/>the time & place you're visiting from
      </div>
      <div className="leading-tight min-w-0">
        <div className={`font-bold ${compact ? "text-lg" : "text-2xl sm:text-3xl"} flex items-center gap-1.5`}>
          <span aria-hidden>{info ? flagFromCC(info.cc) : "🌍"}</span>
          <span className="tabular-nums">{time || "--:--"}</span>
        </div>
        <div className={`${compact ? "text-[10px]" : "text-xs sm:text-sm"} opacity-90 truncate`}>
          {info ? `${info.city}${info.country ? ", " + info.country : ""}` : "locating…"}
        </div>
      </div>
    </div>
  );
}
