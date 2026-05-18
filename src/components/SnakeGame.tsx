import { useCallback, useEffect, useRef, useState } from "react";

const SIZE = 10;
type Pt = { x: number; y: number };
type Dir = "U" | "D" | "L" | "R";

const DIRS: Record<Dir, Pt> = {
  U: { x: 0, y: -1 },
  D: { x: 0, y: 1 },
  L: { x: -1, y: 0 },
  R: { x: 1, y: 0 },
};

function rndFood(snake: Pt[]): Pt {
  while (true) {
    const f = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
    if (!snake.some((s) => s.x === f.x && s.y === f.y)) return f;
  }
}

export function SnakeGame({ active }: { active: boolean }) {
  const [snake, setSnake] = useState<Pt[]>([{ x: 4, y: 5 }, { x: 3, y: 5 }]);
  const dirRef = useRef<Dir>("R");
  const [food, setFood] = useState<Pt>({ x: 7, y: 5 });
  const [dead, setDead] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);

  const reset = useCallback(() => {
    const s = [{ x: 4, y: 5 }, { x: 3, y: 5 }];
    setSnake(s);
    dirRef.current = "R";
    setFood(rndFood(s));
    setDead(false);
    setScore(0);
    setStarted(false);
  }, []);

  const setDir = useCallback((nd: Dir) => {
    const cur = dirRef.current;
    if ((cur === "U" && nd === "D") || (cur === "D" && nd === "U")) return;
    if ((cur === "L" && nd === "R") || (cur === "R" && nd === "L")) return;
    dirRef.current = nd;
  }, []);

  // Keyboard: SPACE to start/restart, arrow keys / WASD to steer
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (dead) reset();
        else setStarted(true);
        return;
      }
      if (!started || dead) return;
      switch (e.key) {
        case "ArrowUp": case "w": case "W": e.preventDefault(); setDir("U"); break;
        case "ArrowDown": case "s": case "S": e.preventDefault(); setDir("D"); break;
        case "ArrowLeft": case "a": case "A": e.preventDefault(); setDir("L"); break;
        case "ArrowRight": case "d": case "D": e.preventDefault(); setDir("R"); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, dead, reset, setDir, started]);

  // Tick
  useEffect(() => {
    if (!active || dead || !started) return;
    const id = setInterval(() => {
      setSnake((prev) => {
        const d = DIRS[dirRef.current];
        const head = { x: prev[0].x + d.x, y: prev[0].y + d.y };
        if (head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE) {
          setDead(true);
          return prev;
        }
        if (prev.some((s) => s.x === head.x && s.y === head.y)) {
          setDead(true);
          return prev;
        }
        const ate = head.x === food.x && head.y === food.y;
        const next = [head, ...prev];
        if (ate) {
          setScore((s) => s + 1);
          setFood(rndFood(next));
        } else {
          next.pop();
        }
        return next;
      });
    }, 200);
    return () => clearInterval(id);
  }, [active, dead, food, started]);

  // Measure container so the board is always contained (size = min(w,h))
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [board, setBoard] = useState(0);
  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setBoard(Math.max(40, Math.floor(Math.min(r.width, r.height))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 gap-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] font-semibold opacity-90 shrink-0">
        <span className="truncate">🐍 {started ? "← ↑ ↓ →" : "SPACE to play"}</span>
        <span className="tabular-nums">{score}</span>
      </div>
      <div ref={wrapRef} className="flex-1 min-h-0 min-w-0 grid place-items-center relative overflow-hidden">
        <div
          className="grid bg-black/30 rounded-sm"
          style={{
            width: board,
            height: board,
            gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${SIZE}, 1fr)`,
            gap: "1px",
            padding: "2px",
          }}
        >
          {Array.from({ length: SIZE * SIZE }).map((_, i) => {
            const x = i % SIZE;
            const y = Math.floor(i / SIZE);
            const isHead = snake[0]?.x === x && snake[0]?.y === y;
            const isBody = !isHead && snake.some((s) => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;
            return (
              <div
                key={i}
                className={
                  isHead
                    ? "bg-white"
                    : isBody
                    ? "bg-white/75"
                    : isFood
                    ? "bg-red-400 rounded-full"
                    : "bg-black/20"
                }
              />
            );
          })}
        </div>
        {!started && !dead && (
          <div className="absolute pointer-events-none text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-black/55 px-1.5 py-0.5 rounded-sm">
            SPACE
          </div>
        )}
        {dead && (
          <div className="absolute pointer-events-none text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-black/55 px-1.5 py-0.5 rounded-sm text-center">
            💀 {score}
          </div>
        )}
      </div>
      {dead && (
        <div className="flex items-center justify-center gap-2 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); reset(); }}
            className="text-[10px] uppercase tracking-wider font-bold bg-black/30 hover:bg-black/50 px-2 py-1 rounded-sm"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
