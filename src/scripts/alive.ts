// "The site as a system": a live status line fed by REAL measurements (interaction rate + frame times on this device),
// and routing packets that travel from the click to the nav item before a page change.
const root = document.documentElement;
const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches || root.getAttribute("data-mode") === "recruiter";

// ---------- Status line ----------
const sys = document.createElement("div");
sys.className = "sys"; sys.setAttribute("aria-hidden", "true"); sys.title = "Real numbers from this page: your interaction rate and this device's frame times.";
sys.innerHTML = '<i class="d"></i><span class="v"></span>';
document.body.append(sys);
const dot = sys.querySelector<HTMLElement>(".d")!, txt = sys.querySelector<HTMLElement>(".v")!;
const events: { t: number; w: number }[] = [];
const hit = (w: number) => events.push({ t: performance.now(), w });
let lastPm = 0;
addEventListener("scroll", () => hit(1), { passive: true });
addEventListener("click", () => hit(4), true);
addEventListener("keydown", () => hit(2), true);
addEventListener("pointermove", () => { const n = performance.now(); if (n - lastPm > 80) { lastPm = n; hit(0.6); } }, { passive: true });
const frames: { t: number; d: number }[] = []; let prev = performance.now();
const tick = (t: number) => { frames.push({ t, d: t - prev }); prev = t; if (!document.hidden) requestAnimationFrame(tick); };
const resume = () => { if (!document.hidden) { prev = performance.now(); requestAnimationFrame(tick); } };
document.addEventListener("visibilitychange", resume); requestAnimationFrame(tick);
setInterval(() => {
  if (document.hidden) return;
  const n = performance.now();
  while (events.length && n - events[0].t > 3000) events.shift();
  while (frames.length && n - frames[0].t > 5000) frames.shift();
  const rate = events.reduce((a, e) => a + e.w, 0) / 3;
  const ds = frames.map((f) => f.d).sort((a, b) => a - b), p95 = ds.length ? ds[Math.floor(ds.length * 0.95)] : 0;
  const state = rate > 60 ? "bad" : rate > 25 || p95 > 50 ? "warn" : "ok";
  const msg = state === "bad" ? "shedding load, please hold" : state === "warn" ? "degraded: very enthusiastic user" : "all green"; // TODO(tone)
  txt.textContent = `${Math.round(rate)} req/s · p95 ${Math.round(p95)} ms · ${msg}`;
  dot.dataset.s = state; sys.dataset.s = state;
}, 500);

// ---------- Routing packets ----------
addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute("download") || reduce()) return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash) || u.pathname === location.pathname || /\.(pdf|xml|png|svg|txt)$/.test(u.pathname)) return;
  e.preventDefault();
  const target = [...document.querySelectorAll<HTMLAnchorElement>(".nav a")].find((n) => new URL(n.href).pathname === u.pathname) ?? document.querySelector<HTMLElement>(".brand")!;
  const tb = target.getBoundingClientRect(), sx = e.clientX, sy = e.clientY, ex = tb.left + tb.width / 2, ey = tb.top + tb.height / 2;
  const chip = document.createElement("div"); chip.className = "pkt-chip"; chip.textContent = `GET ${u.pathname}`; document.body.append(chip);
  const dotEl = document.createElement("div"); dotEl.className = "pkt"; document.body.append(dotEl);
  const t0 = performance.now(), D = 420, cx = (sx + ex) / 2, cy = Math.min(sy, ey) - 80;
  const go = () => { location.href = u.href; };
  let last = 0;
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / D), q = 1 - (1 - k) * (1 - k);
    const x = (1 - q) * (1 - q) * sx + 2 * (1 - q) * q * cx + q * q * ex, y = (1 - q) * (1 - q) * sy + 2 * (1 - q) * q * cy + q * q * ey;
    dotEl.style.transform = `translate(${x}px, ${y}px)`; chip.style.transform = `translate(${x + 12}px, ${y - 8}px)`;
    if (t - last > 28) { last = t; const tr = document.createElement("i"); tr.className = "pkt-tr"; tr.style.transform = `translate(${x}px, ${y}px)`; document.body.append(tr); setTimeout(() => tr.remove(), 500); }
    if (k < 1) requestAnimationFrame(step); else { chip.textContent = `200 OK ${u.pathname}`; target.classList.add("hit"); setTimeout(go, 90); }
  };
  requestAnimationFrame(step);
  setTimeout(go, 1200); // safety net
});

// ---------- Every click gets an HTTP status ----------
let live = 0;
addEventListener("click", (e) => {
  if (reduce() || live > 10) return;
  const t = e.target as HTMLElement;
  const a = t.closest<HTMLAnchorElement>("a[href]"), ctl = t.closest<HTMLElement>("button, input, select, summary, label, [role=button], canvas, [data-arena]");
  let code = "204 No Content", tone = "n"; // TODO(tone): status humor
  if (a) { try { const u = new URL(a.href, location.href); code = u.origin !== location.origin ? "302 Found" : a.getAttribute("href")?.startsWith("mailto:") ? "202 Accepted" : "200 OK"; } catch { code = "200 OK"; } tone = "g"; }
  else if (ctl) { code = (ctl as HTMLButtonElement).disabled ? "403 Forbidden" : "200 OK"; tone = (ctl as HTMLButtonElement).disabled ? "r" : "g"; }
  else if (t.closest("h1, h2, h3")) { code = "418 I'm a teapot"; tone = "n"; }
  const c = document.createElement("span"); c.className = `ck ${tone}`; c.textContent = code; c.style.left = e.clientX + 10 + "px"; c.style.top = e.clientY - 14 + "px"; document.body.append(c); live++;
  setTimeout(() => { c.remove(); live--; }, 900);
}, true);
