// Unlocks a sealed post in the browser. Mirrors scripts/seal.mjs: PBKDF2-SHA256 -> AES-256-GCM -> gunzip -> JSON.
// The decrypted HTML is only injected after AES-GCM authenticates it, so it can only have been produced by someone who knows the password.
type Sealed = { iter: number; salt: string; iv: string; ct: string };
type Payload = { title: string; summary: string; html: string };

const root = document.querySelector<HTMLElement>("[data-lock]");
if (root) {
  const sealed: Sealed = JSON.parse(document.getElementById("sealed-data")!.textContent!);
  const form = root.querySelector<HTMLFormElement>("form")!;
  const input = form.querySelector<HTMLInputElement>("input")!;
  const btn = form.querySelector<HTMLButtonElement>("button")!;
  const msg = root.querySelector<HTMLElement>("[data-msg]")!;
  const body = document.querySelector<HTMLElement>("[data-body]")!;
  const relock = document.querySelector<HTMLButtonElement>("[data-relock]");
  const KEY = "blog-pw";

  const bytes = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function open(pw: string): Promise<Payload> {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: bytes(sealed.salt), iterations: sealed.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const zipped = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(sealed.iv) }, key, bytes(sealed.ct));
    const text = await new Response(new Blob([zipped]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
    return JSON.parse(text);
  }

  function show(p: Payload) {
    body.innerHTML = p.html;
    msg.textContent = "";
    body.hidden = false;
    root!.hidden = true;
    if (relock) relock.hidden = false;
    const h1 = document.querySelector("h1");
    if (h1) h1.textContent = p.title;
    document.title = `${p.title} | Tejas Kothari`;
    const lede = document.querySelector("[data-summary]");
    if (lede && p.summary) { lede.textContent = p.summary; lede.removeAttribute("hidden"); }
  }

  async function attempt(pw: string, remembered: boolean) {
    btn.disabled = true; msg.textContent = "Unlocking…";
    try {
      show(await open(pw));
      try { sessionStorage.setItem(KEY, pw); } catch { /* storage blocked: just ask again next time */ }
    } catch {
      msg.textContent = remembered ? "" : "Wrong password.";
      if (remembered) { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } }
      input.select();
    } finally { btn.disabled = false; }
  }

  if (!crypto?.subtle) msg.textContent = "Your browser can't decrypt here (needs HTTPS).";
  form.addEventListener("submit", (e) => { e.preventDefault(); if (input.value) attempt(input.value, false); });
  relock?.addEventListener("click", () => { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } location.reload(); });
  let saved: string | null = null;
  try { saved = sessionStorage.getItem(KEY); } catch { /* ignore */ }
  if (saved && crypto?.subtle) attempt(saved, true);
  else input.focus({ preventScroll: true });
}
