// Global UI: theme, view mode, mobile menu, scroll reveal. Storage access is always guarded.
const root = document.documentElement;
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
};

const modes = ["story", "engineering", "recruiter"] as const;
type Mode = (typeof modes)[number];
const blurb: Record<Mode, string> = {
  story: "",
  engineering: "Engineering view: project cards expand with architecture, key decisions and trade-offs, and the stack shows where each tool was used.",
  recruiter: "Recruiter view: a compact summary with motion and extras hidden. Resume, email and LinkedIn are one click away.",
};
export function setMode(m: Mode) {
  root.setAttribute("data-mode", m);
  store.set("mode", m);
  document.querySelectorAll<HTMLButtonElement>(".seg button[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
  const t = document.getElementById("modebar-text"); if (t) t.textContent = blurb[m];
  window.dispatchEvent(new CustomEvent("modechange", { detail: m }));
}
document.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-mode]");
  if (b && (modes as readonly string[]).includes(b.dataset.mode || "")) setMode(b.dataset.mode as Mode);
});
setMode((root.getAttribute("data-mode") as Mode) || "story");

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
