import type { TileData, TileColor, TileShape } from "./portfolioData";

export interface PackedTile {
  id: string;
  x: number; // col (0..cols-1)
  y: number; // row
  w: number;
  h: number;
  color: TileColor;
  tile?: TileData; // undefined for decorative filler tiles
  deco?: boolean;
}

const DECO_COLORS: TileColor[] = [
  "blue", "teal", "green", "lime", "orange", "red",
  "magenta", "purple", "indigo", "amber", "pink", "cyan",
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeGrid(cols: number, rows: number): boolean[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(false));
}

function canFit(grid: boolean[][], r: number, c: number, w: number, h: number, cols: number, rows: number) {
  if (r + h > rows || c + w > cols) return false;
  for (let y = r; y < r + h; y++)
    for (let x = c; x < c + w; x++)
      if (grid[y][x]) return false;
  return true;
}

function fill(grid: boolean[][], r: number, c: number, w: number, h: number) {
  for (let y = r; y < r + h; y++)
    for (let x = c; x < c + w; x++)
      grid[y][x] = true;
}

function findSlot(grid: boolean[][], w: number, h: number, cols: number, rows: number) {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (canFit(grid, r, c, w, h, cols, rows)) return { r, c };
  return null;
}

function smallerShapes(shape: TileShape): TileShape[] {
  const [w, h] = shape;
  const out: TileShape[] = [];
  if (w > 2) out.push([w - 1, h]);
  if (h > 2) out.push([w, h - 1]);
  if (w > 2 && h > 2) out.push([w - 1, h - 1]);
  return out;
}

export function packTiles(tiles: TileData[], cols: number, rows: number, mobile = false): PackedTile[] {
  // On mobile / narrow grids, scale shape widths down proportionally so tiles stay legible.
  const scale = mobile ? cols / 12 : 1;
  const scaleShape = (s: TileShape): TileShape => {
    if (!mobile) return [Math.min(s[0], cols), s[1]];
    const w = Math.max(2, Math.min(cols, Math.ceil(s[0] * scale)));
    const h = Math.max(2, s[1]);
    return [w, h];
  };

  // On mobile, allow the grid to grow as needed (vertical scroll)
  const effectiveRows = mobile ? Math.max(rows, 30) : rows;
  const grid = makeGrid(cols, effectiveRows);
  const placed: PackedTile[] = [];

  // Always place hero + resume + interactive tiles first so they get placed.
  const PRIORITY_KINDS = new Set(["game", "hero", "resume", "heatmap", "commits", "visitor", "weather", "birthday", "night", "randomizer", "skills", "watch"]);
  const PRIORITY_IDS = new Set(["linkedin-cta"]);
  const priority = tiles
    .filter((t) => PRIORITY_KINDS.has(t.kind) || PRIORITY_IDS.has(t.id))
    .sort((a, b) => (a.kind === "game" ? -1 : b.kind === "game" ? 1 : 0));
  const rest = shuffle(tiles.filter((t) => !(PRIORITY_KINDS.has(t.kind) || PRIORITY_IDS.has(t.id))));
  const order = [...priority, ...rest];

  for (const tile of order) {
    const scaledShapes = tile.shapes.map(scaleShape);
    const shapes = shuffle(scaledShapes.slice());
    // Try preferred shapes, then degrade.
    const tryList: TileShape[] = [...shapes];
    for (const s of shapes) tryList.push(...smallerShapes(s));
    tryList.push([2, 2]);

    let done = false;
    for (const [w, h] of tryList) {
      const pos = findSlot(grid, w, h, cols, effectiveRows);
      if (pos) {
        fill(grid, pos.r, pos.c, w, h);
        placed.push({ id: tile.id, x: pos.c, y: pos.r, w, h, color: tile.color, tile });
        done = true;
        break;
      }
    }
    if (!done) {
      // last-ditch: skip — extremely unlikely
    }
  }

  // Determine final row span: extend just enough to cover all placed tiles.
  const usedRows = placed.reduce((m, p) => Math.max(m, p.y + p.h), 0);
  const fillRows = mobile ? usedRows : rows;

  // Fill remaining cells with decorative tiles. Prefer 2x2, then 2x1/1x2, then 1x1.
  let decoIdx = 0;
  for (let r = 0; r < fillRows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c]) continue;
      let w = 1, h = 1;
      if (canFit(grid, r, c, 2, 2, cols, fillRows)) { w = 2; h = 2; }
      else if (canFit(grid, r, c, 2, 1, cols, fillRows)) { w = 2; h = 1; }
      else if (canFit(grid, r, c, 1, 2, cols, fillRows)) { w = 1; h = 2; }
      fill(grid, r, c, w, h);
      placed.push({
        id: `deco-${r}-${c}-${decoIdx++}`,
        x: c, y: r, w, h,
        color: DECO_COLORS[Math.floor(Math.random() * DECO_COLORS.length)],
        deco: true,
      });
    }
  }

  return placed;
}
