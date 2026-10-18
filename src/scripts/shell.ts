// Interactive "site.sh": `echo <section>` jumps there. Fixed route table; typed text is only compared, never evaluated.
type Route = { name: string; path: string; aliases?: string[] };
const box = document.querySelector<HTMLElement>("[data-shell]");
if (box) {
  const routes: Route[] = JSON.parse(box.dataset.routes || "[]");
  const log = box.querySelector<HTMLElement>("[data-log]")!;
  const input = box.querySelector<HTMLInputElement>("[data-in]")!;
  const find = (q: string) => routes.find((r) => r.name === q || r.name.replace(/\.pdf$/, "") === q || r.aliases?.includes(q));
  const say = (t: string, cls?: string) => { const d = document.createElement("div"); if (cls) d.className = cls; d.textContent = t; log.append(d); };
  const go = (r: Route) => {
    say(`-> ${r.path}`, "d");
    setTimeout(() => {
      const [pg, hash] = r.path.split("#"); const same = (pg || "/") === location.pathname.replace(/\.html$/, "") || (pg === "/" && location.pathname === "/");
      if (hash && same) { document.getElementById(hash)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); history.replaceState(null, "", "#" + hash); }
      else if (r.path.endsWith(".pdf")) window.open(r.path, "_blank", "noopener");
      else location.href = r.path;
    }, 350);
  };
  const names = () => routes.map((r) => r.name).join("  ");
  const run = (raw: string) => {
    const c = raw.trim().replace(/\s+/g, " ").toLowerCase();
    say("$ " + raw, "p");
    if (!c) return;
    const [cmd, ...rest] = c.split(" "); const arg = rest.join(" ");
    if (cmd === "echo" || cmd === "cd" || cmd === "open" || cmd === "goto") {
      if (!arg) return say("usage: echo <section>   e.g. echo work", "d");
      const r = find(arg.replace(/^["'#\/]+|["'\/]+$/g, ""));
      return r ? go(r) : say(`echo: ${arg.slice(0, 30)}: no such section. Try: ${names()}`, "d");
    }
    if (cmd === "ls" || cmd === "tree" || cmd === "help") return say(cmd === "help" ? "echo <section> jumps there. sections: " + names() : names(), "d");
    if (cmd === "clear") return void log.replaceChildren();
    if (cmd === "sudo" && arg === "hire-me") { const r = find("contact"); say("[sudo] password for recruiter: ********"); return r && go(r); }
    const r = find(c); if (r) return say(`hint: echo ${c}`, "d");
    say(`${cmd.slice(0, 20)}: command not found. Try: echo contact`, "d");
  };
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") { run(input.value); input.value = ""; } });
}
