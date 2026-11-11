// Encrypts locked blog posts so only ciphertext is ever committed (this repo is public).
//
//   bun run seal            seal new/changed posts
//   bun run seal --force    reseal everything
//   bun run seal --rotate   change the password: reseals everything with a new one
//
// Sources: private/*.md (gitignored plaintext), plus any src/content/blog/*.md with `encrypted: true`
// (those are moved into private/ first). Output: src/content/sealed/<slug>.json.
// Crypto: PBKDF2-SHA256 (600k iterations) -> AES-256-GCM, fresh salt + IV per post, body gzipped before encryption.
// The browser side (src/scripts/blog-unlock.ts) mirrors this with Web Crypto.
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { createMarkdownProcessor, parseFrontmatter } from "@astrojs/markdown-remark";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PRIVATE = join(root, "private");
const PUBLIC_MD = join(root, "src/content/blog");
const SEALED = join(root, "src/content/sealed");
const ITER = 600_000;
const args = new Set(process.argv.slice(2));
const rotate = args.has("--rotate");
const force = args.has("--force") || rotate;
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml", ".avif": "image/avif" };

const die = (m) => { console.error(`\nseal: ${m}`); process.exit(1); };

function askHidden(q) {
  if (!process.stdin.isTTY) die("no TTY for the password prompt. Set BLOG_PASSWORD in the environment instead.");
  process.stdout.write(q);
  const { stdin } = process;
  stdin.setRawMode(true); stdin.resume(); stdin.setEncoding("utf8");
  let s = "";
  return new Promise((res) => {
    const on = (chunk) => {
      for (const c of chunk) {
        if (c === "\r" || c === "\n" || c === "\u0004") { stdin.setRawMode(false); stdin.pause(); stdin.off("data", on); process.stdout.write("\n"); return res(s); }
        if (c === "\u0003") { process.stdout.write("\n"); process.exit(130); }
        if (c === "\u007f") s = s.slice(0, -1); else s += c;
      }
    };
    stdin.on("data", on);
  });
}

const b64 = (b) => Buffer.from(b).toString("base64");
const key = (pw, salt, iter) => pbkdf2Sync(pw, salt, iter, 32, "sha256");

function encrypt(pw, plain) {
  const salt = randomBytes(16), iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(pw, salt, ITER), iv);
  const ct = Buffer.concat([c.update(gzipSync(plain)), c.final(), c.getAuthTag()]); // WebCrypto expects ciphertext || tag
  return { iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
}

function decrypt(pw, d) {
  const ct = Buffer.from(d.ct, "base64");
  const dc = createDecipheriv("aes-256-gcm", key(pw, Buffer.from(d.salt, "base64"), d.iter), Buffer.from(d.iv, "base64"));
  dc.setAuthTag(ct.subarray(ct.length - 16));
  return gunzipSync(Buffer.concat([dc.update(ct.subarray(0, ct.length - 16)), dc.final()])).toString("utf8");
}

// 1) Collect sources, moving `encrypted: true` posts out of the public folder.
mkdirSync(PRIVATE, { recursive: true });
mkdirSync(SEALED, { recursive: true });
for (const f of readdirSync(PUBLIC_MD).filter((f) => f.endsWith(".md"))) {
  const { frontmatter } = parseFrontmatter(readFileSync(join(PUBLIC_MD, f), "utf8"));
  if (frontmatter.encrypted !== true) continue;
  if (existsSync(join(PRIVATE, f))) die(`private/${f} already exists; resolve the duplicate of src/content/blog/${f} first.`);
  renameSync(join(PUBLIC_MD, f), join(PRIVATE, f));
  console.log(`moved src/content/blog/${f} -> private/${f}`);
}
const sources = readdirSync(PRIVATE).filter((f) => f.endsWith(".md"));
const existing = readdirSync(SEALED).filter((f) => f.endsWith(".json"));
if (!sources.length) { console.log("Nothing to seal: put markdown files in private/ (or mark a blog post `encrypted: true`)."); process.exit(0); }

// 2) Password. Must match what the existing sealed posts were encrypted with (one password for the whole blog).
let pw = process.env.BLOG_PASSWORD;
if (!pw) {
  pw = await askHidden(rotate ? "New blog password: " : "Blog password: ");
  if (!pw) die("empty password.");
  if (rotate || !existing.length) {
    if ((await askHidden("Repeat password: ")) !== pw) die("passwords do not match.");
  }
}
if (pw.length < 12) console.warn("warning: this password is short. Anyone can download the ciphertext and guess offline; use a long passphrase.");
if (existing.length && !rotate) {
  try { decrypt(pw, JSON.parse(readFileSync(join(SEALED, existing[0]), "utf8"))); }
  catch { die("that password does not open the already-sealed posts. Use the original one, or run `bun run seal --rotate` to change it for every post."); }
}

// 3) Render + encrypt.
const md = await createMarkdownProcessor({ shikiConfig: { theme: "github-dark" } });
let sealedCount = 0;
for (const f of sources) {
  const slug = f.replace(/\.md$/, "");
  const src = join(PRIVATE, f);
  const out = join(SEALED, `${slug}.json`);
  if (!force && existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) continue;

  const { frontmatter: fm, content } = parseFrontmatter(readFileSync(src, "utf8"));
  if (fm.draft === true) { console.log(`skip (draft): ${f}`); continue; }
  if (!fm.title) die(`${f}: frontmatter needs a title.`);
  if (!fm.date) die(`${f}: frontmatter needs a date (YYYY-MM-DD).`);

  let { code: html } = await md.render(content);
  // Inline local images so they are encrypted with the post instead of sitting in the repo in plaintext.
  html = html.replace(/(<img[^>]*?\ssrc=")([^"]+)(")/g, (m, a, s, z) => {
    if (/^(https?:|data:|\/\/)/.test(s)) return m;
    const file = resolve(PRIVATE, s.replace(/^\.?\//, ""));
    if (!file.startsWith(PRIVATE) || !existsSync(file)) die(`${f}: image not found: ${s} (paths are relative to private/).`);
    const buf = readFileSync(file);
    if (buf.length > 1_500_000) console.warn(`warning: ${s} is ${(buf.length / 1e6).toFixed(1)} MB; resize it, it ships inside the post.`);
    return `${a}data:${MIME[extname(file).toLowerCase()] ?? "application/octet-stream"};base64,${buf.toString("base64")}${z}`;
  });

  const secretTitle = fm.secretTitle === true;
  const payload = JSON.stringify({ title: fm.title, summary: fm.summary ?? "", html });
  const words = content.split(/\s+/).filter(Boolean).length;
  const doc = {
    title: secretTitle ? "Private entry" : String(fm.title),
    date: new Date(fm.date).toISOString().slice(0, 10),
    category: fm.category ?? "random",
    ...(fm.series ? { series: fm.series } : {}),
    ...(fm.part ? { part: fm.part } : {}),
    tags: fm.tags ?? [],
    summary: secretTitle ? "" : String(fm.summary ?? ""),
    secretTitle,
    mins: Math.max(1, Math.round(words / 220)),
    ...encrypt(pw, payload),
  };
  writeFileSync(out, JSON.stringify(doc, null, 2) + "\n");
  sealedCount++;
  console.log(`sealed ${f} -> src/content/sealed/${slug}.json`);
}
console.log(sealedCount ? `\n${sealedCount} sealed. Commit src/content/sealed/ (never private/).` : "\nAll up to date.");
