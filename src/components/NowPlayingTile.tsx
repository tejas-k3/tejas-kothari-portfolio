import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Music2 } from "lucide-react";

const TRACKS = [
  { title: "Mitwa", artist: "Lagaan · A.R. Rahman", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Drift",  artist: "SoundHelix",            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { title: "Pulse",  artist: "SoundHelix",            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
  { title: "Glide",  artist: "SoundHelix",            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" },
];

export function NowPlayingTile({ compact }: { compact?: boolean }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio(TRACKS[i].src);
    a.preload = "metadata";
    a.crossOrigin = "anonymous";
    audioRef.current = a;
    const onTime = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    const onEnd = () => { setPlaying(false); setI((x) => (x + 1) % TRACKS.length); };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    if (playing) a.play().catch(() => setPlaying(false));
    return () => {
      a.pause();
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.play().catch(() => setPlaying(false));
    else a.pause();
  }, [playing]);

  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const t = TRACKS[i];

  return (
    <div className="flex flex-col h-full min-w-0 justify-between gap-1.5" onClick={stop}>
      <div className={`${compact ? "text-[9px]" : "text-[10px] sm:text-xs"} uppercase tracking-[0.18em] opacity-85 font-semibold flex items-center gap-1`}>
        <Music2 className="w-3 h-3" /> Now playing
      </div>
      <div className="min-w-0">
        <div className={`font-bold leading-tight truncate ${compact ? "text-sm" : "text-base sm:text-lg"}`}>{t.title}</div>
        <div className={`opacity-80 truncate ${compact ? "text-[9px]" : "text-[10px] sm:text-xs"}`}>{t.artist}</div>
      </div>
      <div className="h-1 w-full bg-black/25 rounded-full overflow-hidden">
        <div className="h-full bg-white/90" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <div className="flex items-center justify-between gap-1">
        <button
          aria-label="prev"
          onClick={(e) => { stop(e); setI((x) => (x - 1 + TRACKS.length) % TRACKS.length); }}
          className="p-1 rounded-full bg-black/20 hover:bg-black/40 transition"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>
        <button
          aria-label={playing ? "pause" : "play"}
          onClick={(e) => { stop(e); setPlaying((p) => !p); }}
          className="p-1.5 rounded-full bg-white text-black hover:scale-105 transition"
        >
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          aria-label="next"
          onClick={(e) => { stop(e); setI((x) => (x + 1) % TRACKS.length); }}
          className="p-1 rounded-full bg-black/20 hover:bg-black/40 transition"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
