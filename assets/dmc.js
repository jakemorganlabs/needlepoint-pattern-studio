import { rgbToLab } from "./quantize.js";

let catalog = [];
let labCache = [];

function deltaE(l1, l2) {
  const dL = l1.L - l2.L;
  const da = l1.a - l2.a;
  const db = l1.b - l2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export async function loadDmcCatalog() {
  const res = await fetch("./assets/dmc-colors.json");
  catalog = await res.json();
  labCache = catalog.map((c) => rgbToLab(c.r, c.g, c.b));
  return catalog;
}

export function getCatalog() {
  return catalog;
}

export function findNearestDmc(r, g, b) {
  const lab = rgbToLab(r, g, b);
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < catalog.length; i++) {
    const dist = deltaE(lab, labCache[i]);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return { ...catalog[bestIdx], deltaE: bestDist };
}

export function mapGridToDmc(grid) {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;
  const dmcGrid = [];
  const paletteMap = new Map();

  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const { r, g, b } = grid[y][x];
      const dmc = findNearestDmc(r, g, b);
      row.push(dmc.number);
      if (!paletteMap.has(dmc.number)) {
        paletteMap.set(dmc.number, { ...dmc, count: 0 });
      }
      paletteMap.get(dmc.number).count++;
    }
    dmcGrid.push(row);
  }

  const palette = [...paletteMap.values()].sort((a, b) => b.count - a.count);
  return { dmcGrid, palette };
}

export function findAdjacentShade(dmcNumber, lighter = true) {
  const idx = catalog.findIndex((c) => c.number === dmcNumber);
  if (idx === -1) return catalog[0];
  const current = catalog[idx];
  const currentL = luminance(current.r, current.g, current.b);
  let best = current;
  let bestDiff = Infinity;
  for (const c of catalog) {
    const l = luminance(c.r, c.g, c.b);
    const diff = lighter ? l - currentL : currentL - l;
    if (diff > 0.01 && diff < bestDiff) {
      bestDiff = diff;
      best = c;
    }
  }
  return best;
}

const SYMBOLS =
  "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+*@#%&=~";

export function assignSymbols(palette) {
  return palette.map((entry, i) => ({
    ...entry,
    symbol: SYMBOLS[i % SYMBOLS.length] ?? String(i + 1),
  }));
}
