// Tiny WebAudio "tile flip" SFX. No assets.
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as
      | typeof AudioContext
      | undefined;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export function playShuffleSfx() {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  // Two short blips, descending — Windows-Phone-ish "tk-tk"
  [880, 660].forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(freq, now + i * 0.07);
    g.gain.setValueAtTime(0.0001, now + i * 0.07);
    g.gain.exponentialRampToValueAtTime(0.08, now + i * 0.07 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.09);
    o.connect(g).connect(ac.destination);
    o.start(now + i * 0.07);
    o.stop(now + i * 0.07 + 0.1);
  });
}

const KEY = "tejas-portfolio:sound";
export function getSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}
export function setSoundEnabled(v: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, v ? "1" : "0");
}
