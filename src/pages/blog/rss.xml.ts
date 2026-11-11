import { getPosts } from "../../lib/blog";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Locked posts are left out of the feed on purpose.
export async function GET({ site }: { site: URL }) {
  const posts = (await getPosts()).filter((p) => !p.locked);
  const items = posts.map((p) => `<item><title>${esc(p.title)}</title><link>${new URL(`blog/${p.slug}`, site)}</link><guid>${new URL(`blog/${p.slug}`, site)}</guid><pubDate>${p.date.toUTCString()}</pubDate><category>${esc(p.category)}</category><description>${esc(p.summary)}</description></item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Tejas Kothari: blog</title><link>${new URL("blog", site)}</link><description>Random writings: travel, tech and more.</description>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
