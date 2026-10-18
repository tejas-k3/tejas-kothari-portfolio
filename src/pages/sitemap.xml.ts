import { caseStudies } from "../data/caseStudies";
export function GET({ site }: { site: URL }) {
  const urls = ["", "work", "experience", "activity", "interests", "about", ...caseStudies.map((c) => `projects/${c.slug}`)].map((p) => `<url><loc>${new URL(p, site).toString()}</loc></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { "Content-Type": "application/xml" } });
}
