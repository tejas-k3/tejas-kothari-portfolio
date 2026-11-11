import { getCollection, render, type CollectionEntry } from "astro:content";

export type Post = {
  slug: string;
  title: string;
  date: Date;
  category: string;
  categorySlug: string;
  series?: string;
  seriesSlug?: string;
  part?: number;
  tags: string[];
  summary: string;
  mins: number;
  locked: boolean;
  secretTitle: boolean;
  entry?: CollectionEntry<"blog">;
  sealed?: { iter: number; salt: string; iv: string; ct: string };
};

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-");
export const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const mins = (text: string) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 220));

export async function getPosts(): Promise<Post[]> {
  const [pub, sealed] = await Promise.all([getCollection("blog"), getCollection("sealed")]);
  const keep = <T extends { data: { draft: boolean } }>(e: T) => !import.meta.env.PROD || !e.data.draft;
  const base = (d: CollectionEntry<"blog">["data"]) => ({
    title: d.title, date: d.date, category: d.category, categorySlug: slugify(d.category),
    series: d.series, seriesSlug: d.series ? slugify(d.series) : undefined, part: d.part, tags: d.tags, summary: d.summary,
  });
  const posts: Post[] = [
    ...pub.filter(keep).map((e) => ({ ...base(e.data), slug: e.id, mins: mins(e.body ?? ""), locked: false, secretTitle: false, entry: e })),
    ...sealed.filter(keep).map((e) => ({
      ...base(e.data), slug: e.id, mins: e.data.mins, locked: true, secretTitle: e.data.secretTitle,
      sealed: { iter: e.data.iter, salt: e.data.salt, iv: e.data.iv, ct: e.data.ct },
    })),
  ];
  const seen = new Set<string>();
  for (const p of posts) {
    if (seen.has(p.slug)) throw new Error(`Duplicate blog slug "${p.slug}" (a public and a sealed post share a filename).`);
    seen.add(p.slug);
  }
  return posts.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function categories(posts: Post[]) {
  const m = new Map<string, { slug: string; name: string; count: number }>();
  for (const p of posts) {
    const c = m.get(p.categorySlug) ?? { slug: p.categorySlug, name: p.category, count: 0 };
    c.count++; m.set(p.categorySlug, c);
  }
  return [...m.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// Posts of one series in reading order (part number, then date).
export function seriesPosts(posts: Post[], seriesSlug: string) {
  return posts.filter((p) => p.seriesSlug === seriesSlug).sort((a, b) => (a.part ?? 0) - (b.part ?? 0) || a.date.getTime() - b.date.getTime());
}

export function allSeries(posts: Post[]) {
  const m = new Map<string, { slug: string; name: string; count: number; latest: Date }>();
  for (const p of posts) {
    if (!p.seriesSlug || !p.series) continue;
    const s = m.get(p.seriesSlug) ?? { slug: p.seriesSlug, name: p.series, count: 0, latest: p.date };
    s.count++; if (p.date > s.latest) s.latest = p.date; m.set(p.seriesSlug, s);
  }
  return [...m.values()].sort((a, b) => b.latest.getTime() - a.latest.getTime());
}

export const renderPost = (p: Post) => render(p.entry!);
