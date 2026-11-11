import { caseStudies } from "../data/caseStudies";
import { allSeries, categories, getPosts } from "../lib/blog";
export async function GET({ site }: { site: URL }) {
  const posts = await getPosts();
  const blog = ["blog", ...categories(posts).map((c) => `blog/category/${c.slug}`), ...allSeries(posts).map((s) => `blog/series/${s.slug}`), ...posts.filter((p) => !p.locked).map((p) => `blog/${p.slug}`)];
  const urls = ["", "work", "experience", "activity", "interests", "about", ...caseStudies.map((c) => `projects/${c.slug}`), ...blog].map((p) => `<url><loc>${new URL(p, site).toString()}</loc></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { "Content-Type": "application/xml" } });
}
