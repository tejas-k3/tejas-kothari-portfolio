// Private writing desk. Commits new posts to GitHub straight from the browser.
//
// Access model: the page and this script are public, so the real secret is a GitHub fine-grained token. It is kept in
// localStorage encrypted with an editor password (PBKDF2-SHA256 -> AES-256-GCM, same primitives as scripts/seal.mjs),
// decrypted into memory only while the editor is open. Wrong password = GCM auth failure = no token.
//
// Locked posts mirror scripts/seal.mjs exactly (render -> gzip -> AES-GCM with the shared blog password) so the plaintext
// never leaves the browser; only src/content/sealed/<slug>.json is committed.
import { marked } from "marked";

const root = document.querySelector<HTMLElement>("[data-write]")!;
const REPO = root.dataset.repo!;
const BRANCH = root.dataset.branch!;
const VAULT = "write-vault";
const DRAFT = "write-draft";
const ITER = 600_000;

const $ = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
const gate = $("[data-gate]"), editor = $("[data-editor]");
const setup = $<HTMLFormElement>("[data-setup]"), unlock = $<HTMLFormElement>("[data-unlock]");
const gmsg = $("[data-gmsg]");
const form = $<HTMLFormElement>("[data-form]");
const msg = $("[data-msg]");
const lmsg = $("[data-lmsg]");
const preview = $("[data-preview]");
const publishBtn = $<HTMLButtonElement>("[data-publish]");

let token: string | null = null; // memory only

/* ---------- crypto helpers ---------- */
const enc = new TextEncoder();
const toB64 = (buf: ArrayBuffer | Uint8Array) => {
  const u = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(s);
};
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function deriveKey(pw: string, salt: Uint8Array, iter: number, usage: KeyUsage[]) {
  const base = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, usage);
}
async function encrypt(pw: string, data: Uint8Array) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await deriveKey(pw, salt, ITER, ["encrypt"]), data);
  return { iter: ITER, salt: toB64(salt), iv: toB64(iv), ct: toB64(ct) };
}
async function decrypt(pw: string, d: { iter: number; salt: string; iv: string; ct: string }) {
  const key = await deriveKey(pw, fromB64(d.salt), d.iter, ["decrypt"]);
  return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(d.iv) }, key, fromB64(d.ct)));
}
const gzip = async (text: string) => new Uint8Array(await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());
const gunzip = (u: Uint8Array) => new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"))).text();

/* ---------- GitHub ---------- */
async function gh(path: string, init: RequestInit = {}, raw = false) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: raw ? "application/vnd.github.raw+json" : "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(init.headers ?? {}) },
  });
  return res;
}
async function ghFail(res: Response, what: string): Promise<never> {
  let detail = "";
  try { detail = (await res.json()).message ?? ""; } catch { /* no body */ }
  throw new Error(`${what}: ${res.status} ${detail}`.trim());
}
async function exists(path: string) {
  const res = await gh(`/contents/${path}?ref=${encodeURIComponent(BRANCH)}`);
  if (res.status === 404) return false;
  if (!res.ok) await ghFail(res, `Checking ${path}`);
  return true;
}
async function put(path: string, text: string, message: string, sha?: string) {
  const res = await gh(`/contents/${path}`, { method: "PUT", body: JSON.stringify({ message, branch: BRANCH, content: toB64(enc.encode(text)), ...(sha ? { sha } : {}) }) });
  if (!res.ok) await ghFail(res, `Committing ${path}`);
  return (await res.json()).commit.html_url as string;
}
async function del(path: string, sha: string, message: string) {
  const res = await gh(`/contents/${path}`, { method: "DELETE", body: JSON.stringify({ message, branch: BRANCH, sha }) });
  if (!res.ok) await ghFail(res, `Deleting ${path}`);
}
async function listDir(dir: string): Promise<{ name: string; path: string; sha: string }[]> {
  const res = await gh(`/contents/${dir}?ref=${encodeURIComponent(BRANCH)}`);
  if (res.status === 404) return [];
  if (!res.ok) await ghFail(res, `Listing ${dir}`);
  return res.json();
}
async function readFile(path: string) {
  const res = await gh(`/contents/${path}?ref=${encodeURIComponent(BRANCH)}`);
  if (!res.ok) await ghFail(res, `Reading ${path}`);
  const j = await res.json();
  return { sha: j.sha as string, text: new TextDecoder().decode(fromB64(String(j.content).replace(/\n/g, ""))) };
}

/* ---------- gate ---------- */
const hasVault = () => { try { return !!localStorage.getItem(VAULT); } catch { return false; } };
function showGate() {
  token = null;
  editor.hidden = true; gate.hidden = false;
  setup.hidden = hasVault(); unlock.hidden = !hasVault();
  gmsg.textContent = "";
  (hasVault() ? unlock : setup).querySelector("input")?.focus();
}
function showEditor(login: string) {
  gate.hidden = true; editor.hidden = false;
  $("[data-who]").textContent = `signed in as ${login} · ${REPO}@${BRANCH}`;
}
async function openWith(t: string) {
  token = t;
  const res = await gh("");
  if (!res.ok) { token = null; await ghFail(res, "GitHub rejected the token"); }
  const info = await res.json();
  if (!info.permissions?.push) { token = null; throw new Error("This token cannot push to the repo (needs Contents: read & write)."); }
  const me = await (await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${t}` } })).json().catch(() => ({}));
  showEditor(me.login ?? "token");
}

setup.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(setup);
  const t = String(f.get("token")).trim(), pw = String(f.get("pw")), pw2 = String(f.get("pw2"));
  if (pw !== pw2) { gmsg.textContent = "Passwords do not match."; return; }
  gmsg.textContent = "Checking token…";
  try {
    await openWith(t);
    localStorage.setItem(VAULT, JSON.stringify(await encrypt(pw, enc.encode(JSON.stringify({ token: t })))));
    setup.reset(); gmsg.textContent = "";
  } catch (err) { gmsg.textContent = (err as Error).message; }
});

unlock.addEventListener("submit", async (e) => {
  e.preventDefault();
  gmsg.textContent = "Unlocking…";
  try {
    const vault = JSON.parse(localStorage.getItem(VAULT)!);
    const { token: t } = JSON.parse(new TextDecoder().decode(await decrypt(String(new FormData(unlock).get("pw")), vault)));
    await openWith(t);
    unlock.reset(); gmsg.textContent = "";
  } catch (err) {
    gmsg.textContent = err instanceof DOMException ? "Wrong password." : (err as Error).message;
  }
});

$("[data-forget]").addEventListener("click", () => {
  if (!confirm("Forget the stored token on this device? You'll need to paste it again.")) return;
  try { localStorage.removeItem(VAULT); } catch { /* ignore */ }
  showGate();
});
$("[data-lock]").addEventListener("click", showGate);

/* ---------- frontmatter (reads files from this page and from the CLI: flat keys only) ---------- */
type Fm = { title: string; date: string; category: string; tags: string[]; summary: string; series: string; part: string; draft: boolean };
function scalar(raw: string): string {
  const v = raw.trim();
  let m = v.match(/^"((?:[^"\\]|\\.)*)"/);
  if (m) { try { return JSON.parse(`"${m[1]}"`); } catch { return m[1]; } }
  m = v.match(/^'((?:[^']|'')*)'/);
  if (m) return m[1].replace(/''/g, "'");
  return v.replace(/\s+#.*$/, "").trim();
}
function parseFm(src: string): { fm: Fm; body: string } {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const fm: Fm = { title: "", date: "", category: "", tags: [], summary: "", series: "", part: "", draft: false };
  if (!m) return { fm, body: src };
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!kv) continue;
    const [, k, raw] = kv;
    if (k === "tags") {
      const inner = raw.replace(/\s+#.*$/, "").trim().replace(/^\[|\]$/g, "");
      try { fm.tags = JSON.parse(`[${inner}]`); } catch { fm.tags = inner.split(",").map((t) => scalar(t)).filter(Boolean); }
    } else if (k === "draft") fm.draft = scalar(raw) === "true";
    else if (k === "date") fm.date = scalar(raw).slice(0, 10);
    else if (k in fm) (fm as unknown as Record<string, string>)[k] = scalar(raw);
  }
  return { fm, body: m[2].replace(/^\s*\n/, "") };
}

/* ---------- editor ---------- */
const field = <T extends HTMLElement>(n: string) => form.elements.namedItem(n) as unknown as T;
const val = (n: string) => (field<HTMLInputElement>(n).value ?? "").trim();
const checked = (n: string) => field<HTMLInputElement>(n).checked;
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
// Local "today": a build-time date baked into the page goes stale.
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

type Editing = { kind: "public" | "locked"; slug: string; path: string; sha: string };
let editing: Editing | null = null;
let slugTouched = false;
field("slug").addEventListener("input", () => { slugTouched = true; });
field("title").addEventListener("input", () => { if (!slugTouched && !editing) field<HTMLInputElement>("slug").value = slugify(val("title")); });

const body = field<HTMLTextAreaElement>("body");
const renderPreview = () => { preview.innerHTML = marked.parse(body.value, { async: false }) as string; };
function syncLocked() {
  const locked = checked("locked");
  $("[data-secret]").hidden = !locked;
  $("[data-bpw]").hidden = !locked;
  if (locked) field<HTMLInputElement>("draft").checked = false; // sealed posts are published or not written at all
  field<HTMLInputElement>("draft").disabled = locked;
}
field("locked").addEventListener("change", syncLocked);

// Unsent draft survives a refresh. Locked posts and edits of existing posts are never written to browser storage.
const SAVED = ["title", "slug", "date", "category", "tags", "summary", "series", "part", "body"];
function saveDraft() {
  try {
    if (checked("locked") || editing) { if (!editing) localStorage.removeItem(DRAFT); return; }
    localStorage.setItem(DRAFT, JSON.stringify(Object.fromEntries(SAVED.map((n) => [n, field<HTMLInputElement>(n).value]))));
  } catch { /* storage blocked: fine */ }
}
function restoreDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT) ?? "null");
    if (d) for (const n of SAVED) if (typeof d[n] === "string" && d[n] && n !== "date") field<HTMLInputElement>(n).value = d[n];
    if (d?.slug) slugTouched = true;
  } catch { /* ignore */ }
}
form.addEventListener("input", () => { renderPreview(); saveDraft(); });

const say = (t: string, ok = false) => { msg.textContent = t; msg.classList.toggle("ok", ok); };
const lsay = (t: string, ok = false) => { lmsg.textContent = t; lmsg.classList.toggle("ok", ok); };

function fillForm(fm: Fm, text: string) {
  field<HTMLInputElement>("title").value = fm.title;
  field<HTMLInputElement>("date").value = fm.date || localToday();
  field<HTMLInputElement>("category").value = fm.category;
  field<HTMLInputElement>("tags").value = fm.tags.join(", ");
  field<HTMLInputElement>("summary").value = fm.summary;
  field<HTMLInputElement>("series").value = fm.series;
  field<HTMLInputElement>("part").value = fm.part;
  field<HTMLInputElement>("draft").checked = fm.draft;
  body.value = text;
  renderPreview();
}

function enterEdit(e: Editing) {
  editing = e;
  slugTouched = true;
  const slug = field<HTMLInputElement>("slug");
  slug.value = e.slug; slug.readOnly = true;
  const lk = field<HTMLInputElement>("locked");
  lk.checked = e.kind === "locked"; lk.disabled = true;
  syncLocked();
  $("[data-eslug]").textContent = `${e.slug} (${e.kind})`;
  $("[data-editing]").hidden = false;
  publishBtn.textContent = "Save changes";
  say("");
  tab("write");
}
function exitEdit() {
  editing = null;
  form.reset();
  field<HTMLInputElement>("slug").readOnly = false;
  field<HTMLInputElement>("locked").disabled = false;
  slugTouched = false;
  syncLocked();
  $("[data-editing]").hidden = true;
  publishBtn.textContent = `Publish to ${BRANCH}`;
  field<HTMLInputElement>("date").value = localToday();
  renderPreview();
}
$("[data-cancel]").addEventListener("click", () => { exitEdit(); say(""); });

// One blog password for all sealed posts: check it against an existing one so we never seal something unreadable.
async function verifyBlogPassword(pw: string) {
  const first = (await listDir("src/content/sealed")).find((f) => f.name.endsWith(".json"));
  if (!first) return; // first locked post ever defines the password
  const raw = await gh(`/contents/${first.path}?ref=${encodeURIComponent(BRANCH)}`, {}, true);
  try { await gunzip(await decrypt(pw, await raw.json())); } catch { throw new Error("That blog password doesn't open the existing locked posts."); }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!token) return showGate();
  const title = val("title"), slug = val("slug"), date = val("date"), category = val("category"), summary = val("summary");
  const series = val("series"), part = val("part"), text = body.value.replace(/\s+$/, "") + "\n";
  const tags = val("tags").split(",").map((t) => t.trim()).filter(Boolean);
  const locked = checked("locked"), draft = checked("draft"), secretTitle = locked && checked("secretTitle");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return say("Slug must be lowercase letters, numbers and dashes.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return say("Date must be YYYY-MM-DD.");
  if (part && !series) return say("A part number needs a series.");
  if (locked && !val("bpw")) return say("Enter the blog password to lock this post.");

  publishBtn.disabled = true;
  try {
    if (!editing) {
      say("Checking slug…");
      if ((await exists(`src/content/blog/${slug}.md`)) || (await exists(`src/content/sealed/${slug}.json`))) throw new Error(`"${slug}" already exists. Pick another slug, or edit it from Manage posts.`);
    }

    let url: string;
    if (locked) {
      say("Encrypting…");
      const pw = field<HTMLInputElement>("bpw").value;
      await verifyBlogPassword(pw);
      const html = marked.parse(text, { async: false }) as string;
      const words = text.split(/\s+/).filter(Boolean).length;
      const doc = {
        title: secretTitle ? "Private entry" : title,
        date, category,
        ...(series ? { series } : {}),
        ...(part ? { part: Number(part) } : {}),
        tags,
        summary: secretTitle ? "" : summary,
        secretTitle,
        mins: Math.max(1, Math.round(words / 220)),
        // md = the source, so the post can be edited here later; the unlock page only reads title/summary/html.
        ...(await encrypt(pw, await gzip(JSON.stringify({ title, summary, html, md: text })))),
      };
      say("Committing…");
      const path = `src/content/sealed/${slug}.json`;
      url = await put(path, JSON.stringify(doc, null, 2) + "\n", editing ? (secretTitle ? "Blog: update private entry" : `Blog: update ${title} (locked)`) : secretTitle ? "Blog: add private entry" : `Blog: ${title} (locked)`, editing?.sha);
    } else {
      const fm = ["---", `title: ${JSON.stringify(title)}`, `date: ${date}`, `category: ${JSON.stringify(category)}`,
        ...(series ? [`series: ${JSON.stringify(series)}`] : []), ...(part ? [`part: ${Number(part)}`] : []),
        `tags: ${JSON.stringify(tags)}`, `summary: ${JSON.stringify(summary)}`, `draft: ${draft}`, "---", "", text].join("\n");
      say("Committing…");
      url = await put(`src/content/blog/${slug}.md`, fm, `Blog: ${editing ? "update " : ""}${title}${draft ? " (draft)" : ""}`, editing?.sha);
    }
    const wasEditing = !!editing;
    msg.classList.add("ok"); msg.textContent = "";
    const a = document.createElement("a"); a.href = url; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Committed. View commit ↗";
    msg.append(a, document.createTextNode(" · live after the next deploy."));
    exitEdit();
    try { localStorage.removeItem(DRAFT); } catch { /* ignore */ }
    if (wasEditing) { tab("manage"); }
  } catch (err) {
    say((err as Error).message);
  } finally { publishBtn.disabled = false; }
});

/* ---------- manage posts ---------- */
type Row = { kind: "public" | "locked"; slug: string; path: string; sha: string; title: string; date: string; category: string; draft: boolean; secret: boolean };
async function loadRows(): Promise<Row[]> {
  const [pub, sealed] = await Promise.all([listDir("src/content/blog"), listDir("src/content/sealed")]);
  const rows = await Promise.all([
    ...pub.filter((f) => f.name.endsWith(".md")).map(async (f): Promise<Row> => {
      const raw = await (await gh(`/contents/${f.path}?ref=${encodeURIComponent(BRANCH)}`, {}, true)).text();
      const { fm } = parseFm(raw);
      return { kind: "public", slug: f.name.replace(/\.md$/, ""), path: f.path, sha: f.sha, title: fm.title, date: fm.date, category: fm.category, draft: fm.draft, secret: false };
    }),
    ...sealed.filter((f) => f.name.endsWith(".json")).map(async (f): Promise<Row> => {
      const d = await (await gh(`/contents/${f.path}?ref=${encodeURIComponent(BRANCH)}`, {}, true)).json();
      return { kind: "locked", slug: f.name.replace(/\.json$/, ""), path: f.path, sha: f.sha, title: d.title, date: d.date, category: d.category, draft: false, secret: !!d.secretTitle };
    }),
  ]);
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

function button(label: string, cls: string, on: () => void) {
  const b = document.createElement("button");
  b.type = "button"; b.className = cls; b.textContent = label; b.addEventListener("click", on);
  return b;
}

async function openForEdit(r: Row, pw?: string) {
  lsay("Loading…");
  try {
    const { sha, text } = await readFile(r.path);
    if (r.kind === "public") {
      const { fm, body: md } = parseFm(text);
      enterEdit({ kind: "public", slug: r.slug, path: r.path, sha });
      fillForm(fm, md);
      field<HTMLInputElement>("secretTitle").checked = false;
    } else {
      const doc = JSON.parse(text);
      let payload: { title: string; summary: string; html: string; md?: string };
      try { payload = JSON.parse(await gunzip(await decrypt(pw!, doc))); } catch { throw new Error("Wrong blog password."); }
      enterEdit({ kind: "locked", slug: r.slug, path: r.path, sha });
      fillForm({ title: payload.title, date: doc.date, category: doc.category, tags: doc.tags ?? [], summary: payload.summary ?? "", series: doc.series ?? "", part: doc.part ? String(doc.part) : "", draft: false }, payload.md ?? payload.html);
      field<HTMLInputElement>("secretTitle").checked = !!doc.secretTitle;
      field<HTMLInputElement>("bpw").value = pw!;
      if (payload.md === undefined) say("This post was sealed from the command line, so only its rendered HTML is available. It's loaded as HTML (markdown accepts that); saving here stores it with a markdown source from now on.");
    }
    lsay("");
  } catch (err) { lsay((err as Error).message); }
}

async function refreshList() {
  const ul = $("[data-list]");
  lsay("Loading posts…");
  try {
    const rows = await loadRows();
    ul.replaceChildren(...rows.map((r) => {
      const li = document.createElement("li");
      const top = document.createElement("div"); top.className = "top";
      const t = document.createElement("span"); t.className = "t"; t.textContent = r.secret ? "Private entry (hidden title)" : r.title || r.slug;
      const m = document.createElement("span"); m.className = "m";
      m.append(...[r.date, r.category, r.slug].map((x) => Object.assign(document.createElement("span"), { textContent: x })));
      if (r.kind === "locked") m.append(Object.assign(document.createElement("span"), { className: "badge", textContent: "locked" }));
      if (r.draft) m.append(Object.assign(document.createElement("span"), { className: "badge", textContent: "draft" }));
      top.append(t, m);

      const acts = document.createElement("div"); acts.className = "acts";
      const editBtn = button("Edit", "btn", () => {
        if (r.kind === "public") return openForEdit(r);
        // locked: ask for the blog password inline, never stored
        acts.replaceChildren();
        const i = document.createElement("input"); i.type = "password"; i.placeholder = "Blog password"; i.autocomplete = "off";
        const go = button("Open", "btn primary", () => { if (i.value) openForEdit(r, i.value); });
        i.addEventListener("keydown", (ev) => { if (ev.key === "Enter") { ev.preventDefault(); go.click(); } });
        acts.append(i, go, button("Cancel", "linkish", () => refreshList()));
        i.focus();
      });
      const delBtn = button("Delete", "btn danger", () => {
        delBtn.textContent = "Click again to confirm";
        const timer = setTimeout(() => { delBtn.textContent = "Delete"; delBtn.onclick = null; }, 4000);
        delBtn.onclick = async () => {
          clearTimeout(timer); delBtn.disabled = true; lsay("Deleting…");
          try {
            await del(r.path, r.sha, r.secret ? "Blog: remove private entry" : `Blog: remove ${r.slug}`);
            li.remove(); lsay(`Deleted ${r.slug}. Gone from the site after the next deploy.`, true);
          } catch (err) { lsay((err as Error).message); delBtn.disabled = false; delBtn.textContent = "Delete"; }
        };
      });
      acts.append(editBtn, delBtn);
      li.append(top, acts);
      return li;
    }));
    lsay(`${rows.length} posts`, true);
  } catch (err) { lsay((err as Error).message); }
}

/* ---------- tabs ---------- */
function tab(name: "write" | "manage") {
  root.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === name)));
  root.querySelectorAll<HTMLElement>("[data-pane]").forEach((p) => { p.hidden = p.dataset.pane !== name; });
  if (name === "manage") refreshList();
}
root.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((b) => b.addEventListener("click", () => tab(b.dataset.tab as "write" | "manage")));

restoreDraft();
field<HTMLInputElement>("date").value = localToday();
renderPreview();
if (!crypto?.subtle) { gmsg.textContent = "This browser can't do the crypto here (needs HTTPS)."; }
showGate();
