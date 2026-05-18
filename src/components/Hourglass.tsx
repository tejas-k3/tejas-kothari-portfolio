import { useEffect, useRef, useState } from "react";

interface Props {
  className?: string;
  /** 0..1, fraction of the year remaining until the next birthday (1 = just had it, 0 = today). */
  remaining?: number;
}

/**
 * Hourglass whose top sand level reflects the actual fraction of the year
 * remaining until the next birthday. On mount it starts full and visibly
 * drains down to the real position over ~1.8s to show it "settling".
 */
export function Hourglass({ className = "", remaining = 1 }: Props) {
  const target = Math.max(0, Math.min(1, remaining));
  const [r, setR] = useState(1); // start with all sand on top
  const [settling, setSettling] = useState(true);
  const initialTarget = useRef(target);
  const settled = useRef(false);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 1;
    const duration = 1800;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3); // easeOutCubic
      setR(from + (initialTarget.current - from) * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
      else {
        settled.current = true;
        setSettling(false);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (settled.current) setR(target);
  }, [target]);

  const elapsed = 1 - r;

  return (
    <svg
      viewBox="0 0 100 140"
      className={`hourglass-svg ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="hg-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.30)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.10)" />
        </linearGradient>
        <linearGradient id="hg-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff1c2" />
          <stop offset="100%" stopColor="#f0b73c" />
        </linearGradient>
        <clipPath id="hg-top-clip">
          <polygon points="14,12 86,12 50,68" />
        </clipPath>
        <clipPath id="hg-bot-clip">
          <polygon points="14,128 86,128 50,72" />
        </clipPath>
      </defs>

      {/* Wood caps */}
      <rect x="6" y="4" width="88" height="8" rx="2.5" fill="currentColor" opacity="0.95" />
      <rect x="6" y="128" width="88" height="8" rx="2.5" fill="currentColor" opacity="0.95" />

      {/* Glass body */}
      <path
        d="M14,12 L86,12 L54,68 Q54,70 54,72 L86,128 L14,128 L46,72 Q46,70 46,68 Z"
        fill="url(#hg-glass)"
        stroke="currentColor"
        strokeOpacity="0.9"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* TOP SAND — clipped triangle. Height shrinks with elapsed time. */}
      <g clipPath="url(#hg-top-clip)">
        <rect
          x="0"
          y={12 + 56 * elapsed}
          width="100"
          height={56 * r + 2}
          fill="url(#hg-sand)"
        />
      </g>

      {/* SAND STREAM — only visible while there is sand left */}
      {settling && r > 0 && (
        <rect x="49.3" y="68" width="1.4" height="60" fill="#f6c14a" opacity="0.85" />
      )}

      {/* Falling grains for a sense of motion */}
      {settling && r > 0 && (
        <>
          <circle className="hg-grain hg-grain-1" cx="50" cy="68" r="0.9" fill="#ffd874" />
          <circle className="hg-grain hg-grain-2" cx="50" cy="68" r="0.7" fill="#ffe39a" />
          <circle className="hg-grain hg-grain-3" cx="50" cy="68" r="0.8" fill="#f6c14a" />
        </>
      )}

      {/* BOTTOM SAND — clipped triangle, grows from the base. */}
      <g clipPath="url(#hg-bot-clip)">
        <rect
          x="0"
          y={128 - 56 * elapsed - 2}
          width="100"
          height={56 * elapsed + 4}
          fill="url(#hg-sand)"
        />
      </g>

      {/* Highlight gleam on glass */}
      <path
        d="M20,16 L30,16 L46,66"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}
