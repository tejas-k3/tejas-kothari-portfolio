// Rewrites a branch's history through the GitHub Git Data API, so a deleted or edited post leaves no earlier trace in git.
// Environment-free on purpose: it only needs an `Api` (the browser passes fetch-backed calls, tests pass a git-backed fake).
//
//   remove: the file is taken out of every commit; commits that only existed to touch it are dropped.
//   latest: older versions are replaced with the version at the branch tip ("scrub old versions"); same dropping rule.
//
// Every commit from the first one that touched the file onwards gets a new hash (author, committer, dates and
// messages are kept; signatures cannot be). The branch is then force-moved, after checking it hasn't moved meanwhile.
export type Api = {
  get<T = any>(path: string): Promise<T | null>; // null on 404
  post<T = any>(path: string, body: unknown): Promise<T>;
  patch<T = any>(path: string, body: unknown): Promise<T>;
};
export type Mode = "remove" | "latest";
type Raw = { sha: string; parents: { sha: string }[]; commit: { tree: { sha: string }; author: unknown; committer: unknown; message: string } };
type C = { sha: string; parents: string[]; tree: string; author: unknown; committer: unknown; message: string };
export type Plan = { path: string; mode: Mode; branch: string; head: string; final?: string; order: C[] };

const enc = (p: string) => p.split("/").map(encodeURIComponent).join("/");
const toC = (r: Raw): C => ({ sha: r.sha, parents: r.parents.map((p) => p.sha), tree: r.commit.tree.sha, author: r.commit.author, committer: r.commit.committer, message: r.commit.message });

async function pages(api: Api, base: string, until?: string): Promise<Raw[]> {
  const out: Raw[] = [];
  for (let page = 1; ; page++) {
    const batch = await api.get<Raw[]>(`${base}${base.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    if (!batch?.length) break;
    out.push(...batch);
    if (until && batch.some((c) => c.sha === until)) break;
    if (batch.length < 100) break;
  }
  return out;
}

export async function plan(api: Api, branch: string, path: string, mode: Mode): Promise<Plan> {
  const head = (await api.get(`/git/ref/heads/${branch}`))?.object.sha as string;
  if (!head) throw new Error(`Branch ${branch} not found.`);
  const touching = await pages(api, `/commits?sha=${head}&path=${encodeURIComponent(path)}`);
  if (!touching.length) throw new Error(`${path} never appeared on ${branch}.`);
  const first = touching[touching.length - 1].sha;
  const all = await pages(api, `/commits?sha=${head}`, first);
  const idx = new Map(all.map((r) => [r.sha, toC(r)]));
  // parents before children
  const order: C[] = [], seen = new Set<string>();
  const visit = (sha: string) => {
    const c = idx.get(sha);
    if (!c || seen.has(sha)) return;
    seen.add(sha);
    c.parents.forEach(visit);
    order.push(c);
  };
  all.forEach((r) => visit(r.sha));
  // only commits at or after the first touch can differ
  const startAt = order.findIndex((c) => c.sha === first);
  let final: string | undefined;
  if (mode === "latest") {
    final = (await api.get(`/contents/${enc(path)}?ref=${head}`))?.sha;
    if (!final) throw new Error(`${path} doesn't exist at the tip of ${branch}; nothing to scrub.`);
  }
  return { path, mode, branch, head, final, order: order.slice(startAt) };
}

export async function run(api: Api, p: Plan, progress: (done: number, total: number) => void = () => {}) {
  const current = (await api.get(`/git/ref/heads/${p.branch}`))?.object.sha;
  if (current !== p.head) throw new Error("The branch changed since this was planned. Nothing was rewritten; try again.");
  const map = new Map<string, string>(), trees = new Map<string, string>();
  const fetchTree = async (sha: string) => (await api.get(`/git/commits/${sha}`))!.tree.sha as string;
  const treeOf = async (sha: string) => trees.get(sha) ?? (trees.set(sha, await fetchTree(sha)), trees.get(sha)!);
  const original = new Map(p.order.map((c) => [c.sha, c.tree]));
  const originalTreeOf = async (sha: string) => original.get(sha) ?? fetchTree(sha);
  let done = 0;
  for (const c of p.order) {
    progress(done++, p.order.length);
    const parents = c.parents.map((x) => map.get(x) ?? x);
    const at = await api.get(`/contents/${enc(p.path)}?ref=${c.sha}`);
    let tree = c.tree;
    if (at && (p.mode === "remove" || at.sha !== p.final)) {
      tree = (await api.post("/git/trees", { base_tree: c.tree, tree: [{ path: p.path, mode: "100644", type: "blob", sha: p.mode === "remove" ? null : p.final }] })).sha;
    }
    const moved = parents.some((x, i) => x !== c.parents[i]);
    if (tree === c.tree && !moved) { map.set(c.sha, c.sha); trees.set(c.sha, c.tree); continue; }
    // a commit whose only change was this file becomes empty: drop it (but keep commits that were empty to begin with)
    if (parents.length === 1 && (await treeOf(parents[0])) === tree && (await originalTreeOf(c.parents[0])) !== c.tree) { map.set(c.sha, parents[0]); continue; }
    const made = await api.post("/git/commits", { message: c.message, tree, parents, author: c.author, committer: c.committer });
    map.set(c.sha, made.sha); trees.set(made.sha, tree);
  }
  progress(done, p.order.length);
  const tip = map.get(p.head) ?? p.head;
  if (tip === p.head) return { tip, changed: false };
  await api.patch(`/git/refs/heads/${p.branch}`, { sha: tip, force: true });
  return { tip, changed: true };
}
