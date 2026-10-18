// Visual effects. All decorative, all skipped for reduced-motion, recruiter view and touch where noted.
const root = document.documentElement;
const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches || root.getAttribute("data-mode") === "recruiter";
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

// 1. Scroll progress bar
const bar = document.createElement("div"); bar.className = "progress"; bar.setAttribute("aria-hidden", "true"); document.body.prepend(bar);
let tick = false;
addEventListener("scroll", () => { if (tick) return; tick = true; requestAnimationFrame(() => { const h = root.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; tick = false; }); }, { passive: true });

// 2. Number counters
const counters = document.querySelectorAll<HTMLElement>(".proof b, .stats b");
const cio = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return; cio.unobserve(e.target);
  const el = e.target as HTMLElement; const m = el.textContent!.trim().match(/^([\d,]+)(.*)$/); if (!m || reduce()) return;
  const end = parseInt(m[1].replace(/,/g, ""), 10), suffix = m[2], t0 = performance.now(), dur = 1100;
  const step = (t: number) => { const p = clamp((t - t0) / dur, 0, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3))); el.textContent = v.toLocaleString("en-US") + suffix; if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}), { threshold: 0.6 });
counters.forEach((c) => cio.observe(c));

// 3. ASCII portrait: rows materialise top to bottom
const pre = document.querySelector<HTMLElement>(".portrait pre");
if (pre && !reduce()) {
  const lines = pre.textContent!.split("\n"); pre.textContent = "";
  lines.forEach((l, i) => { const s = document.createElement("span"); s.className = "row"; s.style.setProperty("--i", String(i)); s.textContent = l + "\n"; pre.append(s); });
}

// 4. Code-that-writes-code typewriter
const stage = document.querySelector<HTMLElement>("[data-demo]");
if (stage) {
  const g = stage.querySelector<HTMLElement>('[data-target="gen"]')!, o = stage.querySelector<HTMLElement>('[data-target="out"]')!;
  const gt = stage.dataset.gen!, ot = stage.dataset.out!; let run = 0;
  const type = async (el: HTMLElement, text: string, id: number, speed: number) => { el.classList.add("typing"); for (let i = 1; i <= text.length; i++) { if (id !== run) return; el.textContent = text.slice(0, i); await new Promise((r) => setTimeout(r, speed + (text[i - 1] === "\n" ? 90 : 0))); } el.classList.remove("typing"); };
  const play = async () => { if (reduce()) return; const id = ++run; g.textContent = ""; o.textContent = ""; await type(g, gt, id, 16); if (id !== run) return; await new Promise((r) => setTimeout(r, 350)); await type(o, ot, id, 9); };
  new IntersectionObserver((es, ob) => { if (es[0].isIntersecting) { ob.disconnect(); play(); } }, { threshold: 0.4 }).observe(stage);
  document.querySelector("[data-replay]")?.addEventListener("click", play);
}

if (fine) {
  // 5. Card spotlight + 3D tilt
  document.querySelectorAll<HTMLElement>(".card").forEach((c) => {
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty("--mx", x + "px"); c.style.setProperty("--my", y + "px");
      if (c.classList.contains("proj") && !reduce()) c.style.transform = `perspective(1000px) rotateX(${(-(y / r.height - 0.5) * 3).toFixed(2)}deg) rotateY(${((x / r.width - 0.5) * 3).toFixed(2)}deg) translateY(-3px)`;
    });
    c.addEventListener("pointerleave", () => { c.style.transform = ""; });
  });
  // 6. Magnetic buttons
  document.querySelectorAll<HTMLElement>(".btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => { if (reduce()) return; const r = b.getBoundingClientRect(); b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px)`; });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });
  // 7. Hero glow + portrait parallax
  const hero = document.querySelector<HTMLElement>(".hero");
  hero?.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect(); hero.style.setProperty("--hx", e.clientX - r.left + "px"); hero.style.setProperty("--hy", e.clientY - r.top + "px");
    const p = hero.querySelector<HTMLElement>(".portrait"); if (p && !reduce()) p.style.transform = `translate(${((e.clientX / innerWidth - 0.5) * -14).toFixed(1)}px, ${((e.clientY / innerHeight - 0.5) * -10).toFixed(1)}px)`;
  });
}

// ---- Chapter rail, sticky CTA, 30-second dialog, headline decode, timeline draw ----
const chapters = [...document.querySelectorAll<HTMLElement>("[data-chapter]")];
if (chapters.length > 2) {
  const rail = document.createElement("nav"); rail.className = "rail"; rail.setAttribute("aria-label", "Page chapters");
  const links = chapters.map((c) => { const a = document.createElement("a"); a.href = "#" + (c.id || ""); a.dataset.for = c.id; const s = document.createElement("span"); s.textContent = c.dataset.chapter!; a.append(s); a.addEventListener("click", (e) => { e.preventDefault(); c.scrollIntoView({ behavior: reduce() ? "auto" : "smooth" }); }); rail.append(a); return a; });
  document.body.append(rail);
  const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((l) => l.classList.toggle("on", l.dataset.for === (e.target as HTMLElement).id)); }), { rootMargin: "-45% 0px -50% 0px" });
  chapters.forEach((c) => rio.observe(c));
}
const contactEl = document.getElementById("contact");
if (contactEl) {
  const pill = document.createElement("a"); pill.className = "pill"; pill.href = "#contact"; pill.textContent = "Let's talk →"; document.body.append(pill);
  let past = false, near = false; const upd = () => pill.classList.toggle("show", past && !near);
  addEventListener("scroll", () => { past = scrollY > 700; upd(); }, { passive: true });
  new IntersectionObserver((es) => { near = es[0].isIntersecting; upd(); }).observe(contactEl);
}
const tl = document.getElementById("tldr") as HTMLDialogElement | null;
document.querySelectorAll("[data-open='tldr']").forEach((b) => b.addEventListener("click", () => tl?.showModal()));
tl?.querySelector("[data-close]")?.addEventListener("click", () => tl.close());
tl?.addEventListener("click", (e) => { if (e.target === tl) tl.close(); });
document.querySelectorAll<HTMLElement>("[data-draw]").forEach((n) => new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { n.classList.add("in"); o.disconnect(); } }, { threshold: 0.2 }).observe(n));
if (!reduce()) {
  const glyphs = "01<>/{}#=+*";
  document.querySelectorAll<HTMLElement>(".hero h1 .line").forEach((ln, idx) => {
    const text = ln.textContent!; const t0 = performance.now() + idx * 140; ln.setAttribute("aria-label", text);
    const tick = (t: number) => { const p = clamp((t - t0) / 650, 0, 1); ln.textContent = text.split("").map((c, i) => (c === " " || i < p * text.length ? c : glyphs[Math.floor(Math.random() * glyphs.length)])).join(""); if (p < 1) requestAnimationFrame(tick); else ln.textContent = text; };
    requestAnimationFrame(tick);
  });
}
