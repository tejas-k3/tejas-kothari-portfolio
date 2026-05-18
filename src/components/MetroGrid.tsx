import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TILES } from "@/lib/portfolioData";
import { packTiles, type PackedTile } from "@/lib/tilePacker";
import { MetroTile } from "./MetroTile";
import { ResumeView } from "./ResumeView";
import { playShuffleSfx, getSoundEnabled } from "@/lib/sound";
import { CursorSquirrel } from "./CursorSquirrel";

interface Layout {
  cols: number;
  rows: number;
  mobile: boolean;
}

function computeLayout(vw: number, vh: number): Layout {
  if (vw < 640) {
    // mobile: fewer cols, taller grid (scrollable)
    return { cols: 6, mobile: true, rows: 18 };
  }
  if (vw < 1024) {
    return { cols: 10, mobile: false, rows: vh < 820 ? 10 : 11 };
  }
  return { cols: 12, mobile: false, rows: vh < 640 ? 10 : vh < 820 ? 10 : 9 };
}

export function MetroGrid() {
  const [seed, setSeed] = useState(0);
  const [layout, setLayout] = useState<Layout>({ cols: 12, rows: 8, mobile: false });
  const [mounted, setMounted] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const onResize = () => setLayout(computeLayout(window.innerWidth, window.innerHeight));
    onResize();
    setMounted(true);
    setSound(getSoundEnabled());
    // Restore night mode preference
    try {
      if (localStorage.getItem("tejas-portfolio:night") === "1") {
        document.documentElement.classList.add("night");
      }
    } catch {}
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const doShuffle = () => {
    setSeed((s) => s + 1);
    if (sound) playShuffleSfx();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cursor:reroll"));
    }
  };

  const packed: PackedTile[] | null = useMemo(
    () => (mounted ? packTiles(TILES, layout.cols, layout.rows, layout.mobile) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed, layout.cols, layout.rows, layout.mobile, mounted]
  );

  // Actual rows used (packer may extend or trim if mobile flag is set)
  const renderedRows = packed ? Math.max(layout.rows, ...packed.map((p) => p.y + p.h)) : layout.rows;

  return (
    <div
      className={`relative w-screen bg-background ${
        layout.mobile ? "min-h-screen overflow-x-hidden" : "h-screen overflow-hidden"
      }`}
    >
      <CursorSquirrel />
      {packed && (
        <motion.div
          key={seed + "-" + layout.cols + "-" + renderedRows}
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.012 } } }}
          className={`grid w-full box-border p-px ${layout.mobile ? "" : "h-screen"}`}
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
            gridTemplateRows: layout.mobile
              ? `repeat(${renderedRows}, minmax(76px, auto))`
              : `repeat(${renderedRows}, minmax(0, 1fr))`,
          }}
        >
          {packed.map((p) => (
            <motion.div
              key={p.id}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                show: { opacity: 1, scale: 1 },
              }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              style={{
                gridColumn: `${p.x + 1} / span ${p.w}`,
                gridRow: `${p.y + 1} / span ${p.h}`,
              }}
              className="min-w-0 min-h-0 overflow-hidden"
            >
              <MetroTile
                tile={p.tile}
                color={p.color}
                deco={p.deco}
                area={{ x: 0, y: 0, w: p.w, h: p.h }}
                onResumeClick={() => setShowResume(true)}
                onShuffle={doShuffle}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showResume && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="fixed inset-0 z-10 grid pointer-events-none"
              style={{
                gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${Math.max(8, layout.rows)}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: layout.cols * Math.max(8, layout.rows) }).map((_, i) => {
                const palette = ["bg-tile-blue","bg-tile-green","bg-tile-orange","bg-tile-red","bg-tile-purple","bg-tile-teal","bg-tile-magenta","bg-tile-amber","bg-tile-cyan","bg-tile-indigo","bg-tile-lime","bg-tile-pink"];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (i % layout.cols) * 0.012 + Math.floor(i / layout.cols) * 0.02 }}
                    className={palette[(i * 7) % palette.length]}
                  />
                );
              })}
            </motion.div>
            <ResumeView onClose={() => setShowResume(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
