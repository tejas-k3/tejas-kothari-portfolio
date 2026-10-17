// Global UI: theme, view mode, mobile menu, scroll reveal. Storage access is always guarded.
const root = document.documentElement;
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
};

const modes = ["story", "engineering", "recruiter"] as const;
const modeBtn = document.getElementById("mode-btn");
export function setMode(m: (typeof modes)[number]) {
  root.setAttribute("data-mode", m);
  store.set("mode", m);
  if (modeBtn) modeBtn.textContent = m;
  window.dispatchEvent(new CustomEvent("modechange", { detail: m }));
}
modeBtn?.addEventListener("click", () => {
  const cur = (root.getAttribute("data-mode") || "story") as (typeof modes)[number];
  setMode(modes[(modes.indexOf(cur) + 1) % modes.length]);
});
if (modeBtn) modeBtn.textContent = root.getAttribute("data-mode") || "story";

export function toggleTheme() {
  const dark = root.getAttribute("data-theme") ? root.getAttribute("data-theme") === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const next = dark ? "light" : "dark";
  root.setAttribute("data-theme", next);
  store.set("theme", next);
}
document.getElementById("theme-btn")?.addEventListener("click", toggleTheme);

const menuBtn = document.getElementById("menu-btn");
const nav = document.getElementById("nav");
menuBtn?.addEventListener("click", () => {
  const open = nav?.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(!!open));
});
nav?.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).tagName === "A") { nav.classList.remove("open"); menuBtn?.setAttribute("aria-expanded", "false"); }
});

const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
