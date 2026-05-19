import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Cursor follower — picks ONE creature per page load.
 * - Duckling: starts top-middle, slow waddle, webbed prints (orange).
 * - Pixel fox: starts left-middle, zippy, tiny pixel paw prints (rust).
 * - Kitten: starts middle-right, medium, small paw prints (grey).
 * - Tiny turtle: starts bottom-center, sleepy slow, leaf prints (green).
 * Each has unique speed, gap between prints, and print fade duration.
 * Hides behind flipped tiles. Disabled on coarse pointers.
 */

type Kind = "duckling" | "fox" | "kitten" | "turtle";

interface Config {
  kind: Kind;
  follow: number;     // 0..1 lerp factor per frame
  trailGap: number;   // px behind cursor
  printGap: number;   // px traveled between prints
  printTTL: number;   // ms before a print disappears
  start: (vw: number, vh: number) => { x: number; y: number };
  printColor: string;
  bobAmp: number;
  size: number;       // render size in px (width)
}

const CONFIGS: Record<Kind, Config> = {
  duckling: {
    kind: "duckling",
    follow: 0.035,
    trailGap: 30,
    printGap: 28,
    printTTL: 2400,
    start: (vw) => ({ x: vw / 2, y: 80 }),
    printColor: "rgba(230,120,30,0.55)",
    bobAmp: 3,
    size: 36,
  },
  fox: {
    kind: "fox",
    follow: 0.07,
    trailGap: 22,
    printGap: 18,
    printTTL: 1400,
    start: (_vw, vh) => ({ x: 80, y: vh / 2 }),
    printColor: "rgba(170,70,30,0.65)",
    bobAmp: 1.5,
    size: 34,
  },
  kitten: {
    kind: "kitten",
    follow: 0.055,
    trailGap: 26,
    printGap: 22,
    printTTL: 1800,
    start: (vw, vh) => ({ x: vw - 80, y: vh / 2 }),
    printColor: "rgba(90,90,90,0.55)",
    bobAmp: 2,
    size: 36,
  },
  turtle: {
    kind: "turtle",
    follow: 0.02,
    trailGap: 36,
    printGap: 38,
    printTTL: 3200,
    start: (vw, vh) => ({ x: vw / 2, y: vh - 80 }),
    printColor: "rgba(80,140,60,0.55)",
    bobAmp: 1,
    size: 40,
  },
};

type Print = { id: number; x: number; y: number; angle: number; side: 1 | -1 };

export function CursorSquirrel() {
  const enabledRef = useRef(true);
  const [rollSeed, setRollSeed] = useState(0);
  const chosen = useMemo<Kind>(() => {
    const kinds: Kind[] = ["duckling", "fox", "kitten", "turtle"];
    return kinds[Math.floor(Math.random() * kinds.length)];
    // rollSeed forces a fresh pick when the user shuffles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollSeed]);
  const cfg = CONFIGS[chosen];

  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const angleRef = useRef(0);
  const speedRef = useRef(0);
  const lastPrintRef = useRef({ x: 0, y: 0 });
  const sideRef = useRef<1 | -1>(1);
  const printIdRef = useRef(0);
  const elRef = useRef<HTMLDivElement | null>(null);
  const arrivalStartRef = useRef<number>(0);

  const [prints, setPrints] = useState<Print[]>([]);
  const [hiding, setHiding] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Enable on both desktop (mouse) and mobile (touch)
    enabledRef.current = true;
    const start = cfg.start(window.innerWidth, window.innerHeight);
    posRef.current = { ...start };
    targetRef.current = { ...start };
    lastPrintRef.current = { ...start };
    arrivalStartRef.current = performance.now();
    setPrints([]);
    setReady(true);
  }, [cfg]);

  // Listen for shuffle event to reroll the creature
  useEffect(() => {
    const onReroll = () => setRollSeed((s) => s + 1);
    window.addEventListener("cursor:reroll", onReroll);
    return () => window.removeEventListener("cursor:reroll", onReroll);
  }, []);

  useEffect(() => {
    if (!enabledRef.current || !ready) return;
    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      const el = document.elementFromPoint(e.clientX, e.clientY);
      setHiding(!!el?.closest(".tile-3d.flipped"));
    };
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      targetRef.current = { x: touch.clientX, y: touch.clientY };
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      setHiding(!!el?.closest(".tile-3d.flipped"));
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [ready]);

  useEffect(() => {
    if (!enabledRef.current || !ready) return;
    let raf = 0;
    const ARRIVAL_MS = 6500; // grand, leisurely entrance
    const step = () => {
      const p = posRef.current;
      const t = targetRef.current;
      const dx = t.x - p.x;
      const dy = t.y - p.y;
      const dist = Math.hypot(dx, dy);

      // Ease in over arrival window: 0 → 1 (eased)
      const t01 = Math.min(1, (performance.now() - arrivalStartRef.current) / ARRIVAL_MS);
      const ease = t01 * t01 * (3 - 2 * t01); // smoothstep
      const follow = cfg.follow * (0.02 + 0.98 * ease); // start ~50x slower

      let nx = p.x;
      let ny = p.y;
      if (dist > cfg.trailGap) {
        nx = p.x + dx * follow;
        ny = p.y + dy * follow;
      }
      const moved = Math.hypot(nx - p.x, ny - p.y);
      speedRef.current = speedRef.current * 0.7 + moved * 0.3;

      if (moved > 0.4) {
        angleRef.current = (Math.atan2(ny - p.y, nx - p.x) * 180) / Math.PI;
      }
      posRef.current = { x: nx, y: ny };

      const lp = lastPrintRef.current;
      const since = Math.hypot(nx - lp.x, ny - lp.y);
      if (since > cfg.printGap && !hiding) {
        const side = sideRef.current;
        sideRef.current = (side === 1 ? -1 : 1) as 1 | -1;
        const ang = angleRef.current;
        const perpX = -Math.sin((ang * Math.PI) / 180);
        const perpY = Math.cos((ang * Math.PI) / 180);
        const id = ++printIdRef.current;
        const px = nx - Math.cos((ang * Math.PI) / 180) * 14 + perpX * 6 * side;
        const py = ny - Math.sin((ang * Math.PI) / 180) * 14 + perpY * 6 * side;
        setPrints((arr) => [...arr.slice(-30), { id, x: px, y: py, angle: ang, side }]);
        const ttl = cfg.printTTL;
        setTimeout(() => setPrints((arr) => arr.filter((p) => p.id !== id)), ttl);
        lastPrintRef.current = { x: nx, y: ny };
      }

      if (elRef.current) {
        const bob = Math.sin(performance.now() / 80) * Math.min(cfg.bobAmp, speedRef.current * 0.5);
        elRef.current.style.transform =
          `translate3d(${nx}px, ${ny + bob}px, 0) translate(-50%, -50%) rotate(${angleRef.current}deg)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [hiding, ready, cfg]);

  if (!enabledRef.current || !ready) return null;

  const running = speedRef.current > 0.3;

  return (
    <>
      {prints.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none fixed z-[9997]"
          style={{
            left: 0,
            top: 0,
            transform: `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) rotate(${p.angle + 90}deg)`,
            animation: `pawFade ${cfg.printTTL}ms ease-out forwards`,
          }}
          aria-hidden
        >
          <PrintGlyph kind={cfg.kind} color={cfg.printColor} />
        </div>
      ))}

      <div
        ref={elRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] select-none"
        style={{
          width: cfg.size,
          height: cfg.size,
          opacity: hiding ? 0.18 : 1,
          filter: hiding ? "blur(2px)" : "drop-shadow(0 3px 4px rgba(0,0,0,0.35))",
          transition: "opacity 250ms ease, filter 250ms ease",
        }}
        aria-hidden
      >
        <CreatureGlyph kind={cfg.kind} running={running} />
      </div>

      <style>{`
        @keyframes pawFade {
          0% { opacity: 0.9; }
          70% { opacity: 0.5; }
          100% { opacity: 0; }
        }
        @keyframes wag { 0%,100% { transform: rotate(-8deg); } 50% { transform: rotate(18deg); } }
        @keyframes idleWag { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(8deg); } }
        @keyframes legA { 0%,100% { transform: rotate(-30deg);} 50% { transform: rotate(30deg);} }
        @keyframes legB { 0%,100% { transform: rotate(30deg);} 50% { transform: rotate(-30deg);} }
        @keyframes waddle { 0%,100% { transform: rotate(-6deg);} 50% { transform: rotate(6deg);} }
        @keyframes turtleStep { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-1px);} }
      `}</style>
    </>
  );
}

/* ------------------------------------------------------------- prints */

function PrintGlyph({ kind, color }: { kind: Kind; color: string }) {
  if (kind === "duckling") {
    // webbed footprint
    return (
      <svg width="10" height="12" viewBox="0 0 10 12">
        <path d="M5 2 L2 10 Q5 8 8 10 Z" fill={color} />
      </svg>
    );
  }
  if (kind === "fox") {
    // tiny pixel paw (4 squares)
    return (
      <svg width="8" height="8" viewBox="0 0 8 8" shapeRendering="crispEdges">
        <rect x="3" y="4" width="2" height="2" fill={color} />
        <rect x="1" y="2" width="1" height="1" fill={color} />
        <rect x="3" y="1" width="1" height="1" fill={color} />
        <rect x="6" y="2" width="1" height="1" fill={color} />
      </svg>
    );
  }
  if (kind === "kitten") {
    // dainty paw print
    return (
      <svg width="9" height="11" viewBox="0 0 9 11">
        <ellipse cx="4.5" cy="7" rx="2.2" ry="2.7" fill={color} />
        <circle cx="1.8" cy="3.3" r="0.9" fill={color} />
        <circle cx="4.5" cy="2.0" r="0.9" fill={color} />
        <circle cx="7.2" cy="3.3" r="0.9" fill={color} />
      </svg>
    );
  }
  // turtle — leaf trail
  return (
    <svg width="12" height="14" viewBox="0 0 12 14">
      <path d="M6 1 C 10 4, 10 10, 6 13 C 2 10, 2 4, 6 1 Z" fill={color} />
      <line x1="6" y1="2" x2="6" y2="12" stroke="rgba(40,80,30,0.6)" strokeWidth="0.7" />
    </svg>
  );
}

/* ----------------------------------------------------------- creatures */

function CreatureGlyph({ kind, running }: { kind: Kind; running: boolean }) {
  if (kind === "duckling") {
    return (
      <svg viewBox="0 0 60 44" width="36" height="28" overflow="visible">
        <ellipse cx="30" cy="26" rx="14" ry="9" fill="#fde047" stroke="#854d0e" strokeWidth="1.2" />
        <circle cx="44" cy="20" r="7.5" fill="#fde047" stroke="#854d0e" strokeWidth="1.2" />
        <path d="M50 21 L56 22 L50 24 Z" fill="#f97316" stroke="#7c2d12" strokeWidth="0.8" />
        <circle cx="45.5" cy="19" r="1.2" fill="#111" />
        <circle cx="45.8" cy="18.6" r="0.4" fill="#fff" />
        <path d="M22 32 L20 36 M24 32 L24 36" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        <g style={{ transformOrigin: "16px 26px", animation: running ? "waddle 360ms ease-in-out infinite" : "idleWag 1.8s ease-in-out infinite" }}>
          <path d="M18 22 Q 10 22, 12 30 Q 18 28, 20 26 Z" fill="#facc15" stroke="#854d0e" strokeWidth="1" />
        </g>
      </svg>
    );
  }
  if (kind === "fox") {
    // 16-bit pixel fox
    return (
      <svg viewBox="0 0 16 12" width="34" height="26" shapeRendering="crispEdges" overflow="visible">
        {/* body */}
        <rect x="3" y="5" width="8" height="4" fill="#d97706" />
        <rect x="3" y="9" width="8" height="1" fill="#92400e" />
        {/* head */}
        <rect x="10" y="3" width="4" height="4" fill="#d97706" />
        <rect x="10" y="2" width="1" height="1" fill="#d97706" />
        <rect x="13" y="2" width="1" height="1" fill="#d97706" />
        {/* white muzzle */}
        <rect x="13" y="6" width="1" height="1" fill="#fef3c7" />
        {/* eye */}
        <rect x="12" y="4" width="1" height="1" fill="#111" />
        {/* tail (with white tip) */}
        <rect x="1" y="4" width="2" height="3" fill="#d97706" />
        <rect x="0" y="5" width="1" height="2" fill="#fef3c7" />
        {/* legs (toggle for run) */}
        <rect x="4" y="10" width="1" height={running ? 1 : 2} fill="#92400e" />
        <rect x="6" y="10" width="1" height={running ? 2 : 1} fill="#92400e" />
        <rect x="8" y="10" width="1" height={running ? 1 : 2} fill="#92400e" />
        <rect x="10" y="10" width="1" height={running ? 2 : 1} fill="#92400e" />
      </svg>
    );
  }
  if (kind === "kitten") {
    return (
      <svg viewBox="0 0 60 44" width="36" height="28" overflow="visible">
        <g style={{ transformOrigin: "12px 24px", animation: running ? "wag 280ms ease-in-out infinite" : "idleWag 1.6s ease-in-out infinite" }}>
          <path d="M14 24 C 4 22, 2 12, 8 8 C 12 6, 16 10, 14 18 Z" fill="#a3a3a3" stroke="#262626" strokeWidth="1.1" />
        </g>
        <ellipse cx="30" cy="26" rx="14" ry="8.5" fill="#d4d4d4" stroke="#262626" strokeWidth="1.1" />
        <circle cx="44" cy="20" r="8" fill="#d4d4d4" stroke="#262626" strokeWidth="1.1" />
        {/* ears */}
        <path d="M39 13 L40 8 L44 12 Z" fill="#a3a3a3" stroke="#262626" strokeWidth="0.8" />
        <path d="M47 12 L48 8 L50 13 Z" fill="#a3a3a3" stroke="#262626" strokeWidth="0.8" />
        {/* eyes */}
        <circle cx="42" cy="19" r="1.2" fill="#111" />
        <circle cx="47" cy="19" r="1.2" fill="#111" />
        {/* nose */}
        <path d="M44 22 L45 22 L44.5 22.8 Z" fill="#f472b6" />
        {/* whiskers */}
        <line x1="40" y1="22" x2="36" y2="22" stroke="#262626" strokeWidth="0.5" />
        <line x1="48" y1="22" x2="52" y2="22" stroke="#262626" strokeWidth="0.5" />
        {/* legs */}
        <g style={{ transformOrigin: "26px 32px", animation: running ? "legA 260ms linear infinite" : "none" }}>
          <line x1="26" y1="32" x2="24" y2="38" stroke="#262626" strokeWidth="2.2" strokeLinecap="round" />
        </g>
        <g style={{ transformOrigin: "34px 32px", animation: running ? "legB 260ms linear infinite" : "none" }}>
          <line x1="34" y1="32" x2="36" y2="38" stroke="#262626" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      </svg>
    );
  }
  // turtle
  return (
    <svg viewBox="0 0 60 44" width="40" height="30" overflow="visible">
      {/* shell */}
      <ellipse cx="28" cy="24" rx="16" ry="11" fill="#65a30d" stroke="#365314" strokeWidth="1.4" />
      <path d="M16 24 L40 24 M22 14 L22 34 M34 14 L34 34" stroke="#3f6212" strokeWidth="0.9" />
      <circle cx="28" cy="24" r="4" fill="#84cc16" stroke="#365314" strokeWidth="0.8" />
      {/* head */}
      <circle cx="46" cy="22" r="5" fill="#a3e635" stroke="#365314" strokeWidth="1.2" />
      <circle cx="48" cy="21" r="0.9" fill="#111" />
      {/* tail */}
      <path d="M12 24 L8 25 L12 27 Z" fill="#a3e635" stroke="#365314" strokeWidth="0.8" />
      {/* feet */}
      <g style={{ animation: running ? "turtleStep 600ms ease-in-out infinite" : "none" }}>
        <ellipse cx="20" cy="36" rx="3" ry="1.6" fill="#a3e635" stroke="#365314" strokeWidth="0.8" />
        <ellipse cx="38" cy="36" rx="3" ry="1.6" fill="#a3e635" stroke="#365314" strokeWidth="0.8" />
      </g>
    </svg>
  );
}
