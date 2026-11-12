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
async function put(path: string, text: string, message: string) {
  const res = await gh(`/contents/${path}`, { method: "PUT", body: JSON.stringify({ message, branch: BRANCH, content: toB64(enc.encode(text)) }) });
  if (!res.ok) await ghFail(res, `Committing ${path}`);
  return (await res.json()).commit.html_url as string;
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

/* ---------- editor ---------- */
const field = <T extends HTMLElement>(n: string) => form.elements.namedItem(n) as unknown as T;
const val = (n: string) => (field<HTMLInputElement>(n).value ?? "").trim();
const checked = (n: string) => field<HTMLInputElement>(n).checked;
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

let slugTouched = false;
field("slug").addEventListener("input", () => { slugTouched = true; });
field("title").addEventListener("input", () => { if (!slugTouched) field<HTMLInputElement>("slug").value = slugify(val("title")); });

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

// Unsent draft survives a refresh. Locked posts are never written to browser storage.
const SAVED = ["title", "slug", "date", "category", "tags", "summary", "series", "part", "body"];
function saveDraft() {
  try {
    if (checked("locked")) { localStorage.removeItem(DRAFT); return; }
    localStorage.setItem(DRAFT, JSON.stringify(Object.fromEntries(SAVED.map((n) => [n, field<HTMLInputElement>(n).value]))));
  } catch { /* storage blocked: fine */ }
}
try {
  const d = JSON.parse(localStorage.getItem(DRAFT) ?? "null");
  if (d) for (const n of SAVED) if (typeof d[n] === "string" && d[n] && n !== "date") field<HTMLInputElement>(n).value = d[n];
  if (d?.slug) slugTouched = true;
} catch { /* ignore */ }
form.addEventListener("input", () => { renderPreview(); saveDraft(); });
renderPreview();

// Local "today": the build-time date baked into the page goes stale.
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
field<HTMLInputElement>("date").value = localToday();

const say = (t: string, ok = false) => { msg.textContent = t; msg.classList.toggle("ok", ok); };

// One blog password for all sealed posts: check it against an existing one so we never seal something unreadable.
async function verifyBlogPassword(pw: string) {
  const list = await gh(`/contents/src/content/sealed?ref=${encodeURIComponent(BRANCH)}`);
  if (!list.ok) return; // no sealed folder yet: first locked post defines the password
  const first = (await list.json()).find((f: { name: string }) => f.name.endsWith(".json"));
  if (!first) return;
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
    say("Checking slug…");
    if ((await exists(`src/content/blog/${slug}.md`)) || (await exists(`src/content/sealed/${slug}.json`))) throw new Error(`"${slug}" already exists. Pick another slug (editing existing posts isn't built yet).`);

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
        ...(await encrypt(pw, await gzip(JSON.stringify({ title, summary, html })))),
      };
      say("Committing…");
      url = await put(`src/content/sealed/${slug}.json`, JSON.stringify(doc, null, 2) + "\n", secretTitle ? "Blog: add private entry" : `Blog: ${title} (locked)`);
    } else {
      const fm = ["---", `title: ${JSON.stringify(title)}`, `date: ${date}`, `category: ${JSON.stringify(category)}`,
        ...(series ? [`series: ${JSON.stringify(series)}`] : []), ...(part ? [`part: ${Number(part)}`] : []),
        `tags: ${JSON.stringify(tags)}`, `summary: ${JSON.stringify(summary)}`, `draft: ${draft}`, "---", "", text].join("\n");
      say("Committing…");
      url = await put(`src/content/blog/${slug}.md`, fm, `Blog: ${title}${draft ? " (draft)" : ""}`);
    }
    msg.classList.add("ok"); msg.textContent = "";
    const a = document.createElement("a"); a.href = url; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Committed. View commit ↗";
    msg.append(a, document.createTextNode(" · live after the next deploy."));
    form.reset(); slugTouched = false; syncLocked(); renderPreview();
    try { localStorage.removeItem(DRAFT); } catch { /* ignore */ }
    field<HTMLInputElement>("date").value = localToday();
  } catch (err) {
    say((err as Error).message);
  } finally { publishBtn.disabled = false; }
});

if (!crypto?.subtle) { gmsg.textContent = "This browser can't do the crypto here (needs HTTPS)."; }
showGate();
