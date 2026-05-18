import { Pin, ArrowUpRight } from "lucide-react";

interface Repo {
  name: string;
  desc: string;
  url: string;
  lang: string;
}

const PINNED: Repo[] = [
  {
    name: "Random-n-interesting",
    desc: "A scrapbook of small, random, surprisingly fun experiments.",
    url: "https://github.com/tejas-k3/Random-n-interesting",
    lang: "Misc",
  },
  {
    name: "most-commits",
    desc: "GitHub repo with most number of commits on the platform.",
    url: "https://github.com/tejas-k3/most-commits",
    lang: "Python",
  },
];

export function CommitsTile({ compact }: { compact?: boolean }) {
  return (
    <div className="flex flex-col h-full min-w-0 gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className={`${compact ? "text-[9px]" : "text-[10px] sm:text-xs"} uppercase tracking-[0.18em] opacity-90 font-semibold truncate flex items-center gap-1`}>
          <Pin className="w-3 h-3" /> Pinned repos
        </div>
        <a
          href="https://github.com/tejas-k3"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[9px] sm:text-[10px] uppercase tracking-wider opacity-80 hover:opacity-100 hover:underline shrink-0"
        >
          @tejas-k3
        </a>
      </div>
      <div className="flex-1 min-h-0 flex flex-col gap-1.5 overflow-hidden">
        {PINNED.map((r, i) => (
          <a
            key={i}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="block min-w-0 rounded-sm px-1.5 py-1 -mx-1.5 hover:bg-black/20 transition-colors group"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`${compact ? "text-[10px]" : "text-xs sm:text-sm"} font-semibold truncate`}>
                {r.name}
              </span>
              <ArrowUpRight className="w-3 h-3 ml-auto opacity-60 group-hover:opacity-100 shrink-0" />
            </div>
            <div className={`${compact ? "text-[9px]" : "text-[10px] sm:text-[11px]"} opacity-80 leading-snug line-clamp-2`}>
              {r.desc}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
