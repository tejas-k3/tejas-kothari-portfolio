// Command palette (Cmd/Ctrl+K) + hidden terminal (backtick, or type "terminal" in the palette).
// Security: only a fixed command table is ever executed. Typed text is matched, never evaluated. Output uses textContent.
import { setMode, toggleTheme } from "./ui";

type Site = { person: { name: string; title: string; focus: string; location: string; email: string; github: string; linkedin: string; resume: string | null }; experience: string[]; projects: { name: string; line: string; page: string | null }[]; stack: string[]; currently: string[] };
const site: Site = JSON.parse(document.getElementById("site-data")!.textContent!);
const palette = document.getElementById("palette") as HTMLDialogElement;
const term = document.getElementById("term") as HTMLDialogElement;
const input = document.getElementById("pal-input") as HTMLInputElement;
const list = document.getElementById("pal-list") as HTMLUListElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const go = (href: string, ext = false) => () => { palette.close(); if (ext) window.open(href, "_blank", "noopener"); else if (location.pathname === "/" && href.startsWith("/#")) location.hash = href.slice(1); else location.href = href; };
const smoke = (msg: string) => () => { palette.close(); openTerm(msg); };

type Cmd = { label: string; hint?: string; keys?: string; run: () => void; hidden?: boolean };
const cmds: Cmd[] = [
  { label: "Selected work", hint: "section", run: go("/#work") },
  { label: "Experience", hint: "section", run: go("/#experience") },
  { label: "How I work", hint: "section", run: go("/#how") },
  { label: "GitHub activity", hint: "section", run: go("/#activity") },
  { label: "Tech stack", hint: "section", run: go("/#stack") },
  { label: "Contact", hint: "section", run: go("/#contact") },
  { label: "Rupee Engine", hint: "case study", run: go("/projects/rupee-engine") },
  { label: "System Design Playground", hint: "case study", run: go("/projects/system-design-playground") },
  ...(site.person.resume ? [{ label: "Download resume", hint: "pdf", run: go(site.person.resume, true) }] : []),
  { label: "GitHub profile", hint: "external", run: go(site.person.github, true) },
  { label: "LinkedIn", hint: "external", run: go(site.person.linkedin, true) },
  { label: "Email Tejas", hint: site.person.email, run: () => { location.href = `mailto:${site.person.email}`; } },
  { label: "Toggle light / dark", hint: "theme", run: () => { palette.close(); toggleTheme(); } },
  { label: "Story view", hint: "mode", run: () => { palette.close(); setMode("story"); } },
  { label: "Engineering view", hint: "mode: architecture, decisions, implementation", run: () => { palette.close(); setMode("engineering"); } },
  { label: "Recruiter view", hint: "mode: compact, no motion", run: () => { palette.close(); setMode("recruiter"); } },
  // Easter eggs: only appear when typed. TODO(tone): tone these up or down.
  { label: "terminal", hidden: true, run: () => { palette.close(); openTerm(); } },
  { label: "sudo hire-me", hidden: true, run: smoke("[sudo] password for recruiter: ********\nAccess granted. Opening mail client. Good call.\n") },
  { label: "coffee", hidden: true, run: smoke("Brewing...\nERROR 418: I'm a teapot. Retrying with coffee. Done.\n") },
  { label: "watch", hidden: true, run: smoke("Mechanical movement detected. No CPU involved. Respect.\n") },
];
cmds.find((c) => c.label === "sudo hire-me")!.run = () => { palette.close(); openTerm("[sudo] password for recruiter: ********\nAccess granted. Opening mail client. Good call.\n"); setTimeout(() => { location.href = `mailto:${site.person.email}?subject=Let's talk`; }, 1200); };

let sel = 0, shown: Cmd[] = [];
function render() {
  const q = input.value.trim().toLowerCase();
  shown = cmds.filter((c) => (c.hidden ? q.length > 2 && c.label.startsWith(q) : !q || c.label.toLowerCase().includes(q) || (c.hint || "").toLowerCase().includes(q)));
  sel = Math.min(sel, Math.max(0, shown.length - 1));
  list.replaceChildren(...shown.map((c, i) => {
    const li = document.createElement("li"); li.setAttribute("role", "option"); li.id = "pal-" + i; li.setAttribute("aria-selected", String(i === sel));
    const a = document.createElement("span"); a.textContent = c.label; li.append(a);
    if (c.hint) { const s = document.createElement("small"); s.textContent = c.hint; li.append(s); }
    li.addEventListener("click", () => c.run()); li.addEventListener("mousemove", () => { sel = i; mark(); });
    return li;
  }));
  if (!shown.length) { const li = document.createElement("li"); li.textContent = "No matches"; list.append(li); }
  input.setAttribute("aria-activedescendant", shown.length ? "pal-" + sel : "");
}
function mark() { list.querySelectorAll("li").forEach((li, i) => li.setAttribute("aria-selected", String(i === sel))); input.setAttribute("aria-activedescendant", "pal-" + sel); }
export function openPalette() { if (term.open) term.close(); input.value = ""; sel = 0; render(); if (!palette.open) palette.showModal(); input.focus(); }

input.addEventListener("input", () => { sel = 0; render(); });
input.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); mark(); list.children[sel]?.scrollIntoView({ block: "nearest" }); }
  else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); list.children[sel]?.scrollIntoView({ block: "nearest" }); }
  else if (e.key === "Enter") { e.preventDefault(); shown[sel]?.run(); }
});
palette.addEventListener("click", (e) => { if (e.target === palette) palette.close(); });
document.getElementById("palette-btn")?.addEventListener("click", openPalette);

// ---------- Terminal ----------
const out = document.getElementById("term-out")!;
const tin = document.getElementById("term-in") as HTMLInputElement;
const print = (t: string, cls?: string) => { const d = document.createElement("div"); if (cls) d.className = cls; d.textContent = t; out.append(d); out.scrollTop = out.scrollHeight; };
const link = (label: string, href: string) => { const d = document.createElement("div"); const a = document.createElement("a"); a.href = href; a.textContent = label; if (href.startsWith("http")) { a.target = "_blank"; a.rel = "noopener"; } d.append(a); out.append(d); };
const table: Record<string, () => void> = {
  help: () => print("help about projects rupee-engine playground github experience stack currently contact resume theme mode <story|engineering|recruiter> clear exit"),
  about: () => print(`${site.person.name}: ${site.person.title}, ${site.person.focus}. ${site.person.location}.`),
  projects: () => site.projects.forEach((p) => print(`- ${p.name}: ${p.line}`)),
  "rupee-engine": () => { print("Rupee Engine: modular equity-analysis and portfolio engine for Indian markets."); link("open case study ->", "/projects/rupee-engine"); },
  playground: () => { print("System Design Playground: sketch a system, send traffic, watch it break, fix it."); link("open case study ->", "/projects/system-design-playground"); },
  github: () => link(site.person.github, site.person.github),
  experience: () => site.experience.forEach((e) => print(e)),
  stack: () => site.stack.forEach((e) => print(e)),
  currently: () => site.currently.forEach((e) => print(e)),
  contact: () => { link(site.person.email, `mailto:${site.person.email}`); link(site.person.linkedin, site.person.linkedin); },
  resume: () => site.person.resume ? link("download resume (pdf)", site.person.resume) : print("Resume available on request."),
  theme: () => { toggleTheme(); print("Theme toggled."); },
  whoami: () => print("a curious visitor. Welcome."),
  ls: () => print("about  projects  experience  stack  contact"),
  coffee: () => print("ERROR 418: I'm a teapot."), // TODO(tone)
  watch: () => print("tick. tick. tick. (no CPU involved)"), // TODO(tone)
  "sudo hire-me": () => { print("[sudo] password for recruiter: ********"); print("Access granted."); link(`mailto:${site.person.email}`, `mailto:${site.person.email}`); },
  clear: () => out.replaceChildren(),
  exit: () => term.close(),
};
function run(raw: string) {
  const c = raw.trim().replace(/\s+/g, " ").toLowerCase();
  print("$ " + raw, "p");
  if (!c) return;
  if (c.startsWith("mode ")) { const m = c.slice(5); if (m === "story" || m === "engineering" || m === "recruiter") { setMode(m); print(`Mode: ${m}`); } else print("usage: mode <story|engineering|recruiter>"); return; }
  const f = Object.prototype.hasOwnProperty.call(table, c) ? table[c] : null;
  f ? f() : print(`command not found: ${c.slice(0, 40)}. Try 'help'.`);
}
export function openTerm(first?: string) {
  if (palette.open) palette.close();
  if (!term.open) term.showModal();
  if (!out.childElementCount) { print("Terminal is optional; everything here is also on the page. Type 'help'."); }
  if (first) first.trim().split("\n").forEach((l) => print(l));
  tin.focus();
}
tin.addEventListener("keydown", (e) => { if (e.key === "Enter") { run(tin.value); tin.value = ""; } });
document.getElementById("term-x")?.addEventListener("click", () => term.close());
term.addEventListener("click", (e) => { if (e.target === term) term.close(); });

// ---------- Global shortcuts ----------
const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); palette.open ? palette.close() : openPalette(); }
  else if (e.key === "`" && !typing(e.target) && !e.metaKey && !e.ctrlKey) { e.preventDefault(); term.open ? term.close() : openTerm(); }
});
if (!reduce) console.log("%cHello, curious one. Press ` to open a terminal, or Cmd/Ctrl+K.", "color:#ffb454"); // TODO(tone)
