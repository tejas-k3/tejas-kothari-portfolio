// Build-time GitHub snapshot (public data only). Never fails the build: on any error the last committed snapshot is kept.
// Uses GITHUB_TOKEN if present (higher rate limit); the token is never written to output.
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";

const USER = "tejas-k3";
const OUT = "src/data/github.generated.json";
const headers = { Accept: "application/vnd.github+json", "User-Agent": "portfolio-sync", ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };
const get = async (p) => {
  const r = await fetch(`https://api.github.com${p}`, { headers });
  if (!r.ok) throw new Error(`${p} -> ${r.status}`);
  return r.json();
};

try {
  const [profile, repos] = await Promise.all([get(`/users/${USER}`), get(`/users/${USER}/repos?per_page=100&sort=pushed&type=owner`)]);
  // Contribution calendar: GraphQL when a token is available at build time, otherwise a public calendar mirror.
  let days = {}, total = 0, source = "";
  if (process.env.GITHUB_TOKEN) {
    const r = await fetch("https://api.github.com/graphql", { method: "POST", headers, body: JSON.stringify({ query: `{user(login:"${USER}"){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}` }) });
    const cal = (await r.json())?.data?.user?.contributionsCollection?.contributionCalendar;
    if (cal) { total = cal.totalContributions; source = "GitHub GraphQL"; for (const w of cal.weeks) for (const d of w.contributionDays) days[d.date] = d.contributionCount; }
  }
  if (!source) {
    const r = await fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`);
    if (!r.ok) throw new Error(`calendar mirror -> ${r.status}`);
    const j = await r.json(); total = j.total?.lastYear ?? 0; source = "github-contributions-api (public profile)";
    for (const d of j.contributions) days[d.date] = d.count;
  }
  const own = repos.filter((r) => !r.fork && !r.private);
  const langs = {};
  for (const r of own) if (r.language) langs[r.language] = (langs[r.language] || 0) + 1;
  const snap = {
    fetchedAt: new Date().toISOString(),
    profile: { repos: profile.public_repos, followers: profile.followers, since: profile.created_at },
    repos: own.slice(0, 6).map((r) => ({ name: r.name, description: r.description, language: r.language, stars: r.stargazers_count, pushedAt: r.pushed_at, url: r.html_url })),
    languages: Object.entries(langs).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
    calendar: { total, source, days },
  };
  mkdirSync("src/data", { recursive: true });
  writeFileSync(OUT, JSON.stringify(snap, null, 2) + "\n");
  console.log(`sync-github: ok (${own.length} repos, ${Object.values(days).filter(Boolean).length} active days, ${total} contributions via ${source})`);
} catch (err) {
  console.warn(`sync-github: failed (${err.message}); keeping ${existsSync(OUT) ? "previous snapshot" : "no snapshot (UI falls back to static state)"}`);
}
