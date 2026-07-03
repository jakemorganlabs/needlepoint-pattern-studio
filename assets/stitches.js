import { findAdjacentShade } from "./dmc.js";

function stroke(ctx, x1, y1, x2, y2, color, width = 1.5) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawTent(ctx, x, y, size, direction = 1) {
  const pad = size * 0.15;
  if (direction > 0) {
    stroke(ctx, x + pad, y + size - pad, x + size - pad, y + pad, "rgba(0,0,0,0.35)", 1.2);
  } else {
    stroke(ctx, x + pad, y + pad, x + size - pad, y + size - pad, "rgba(0,0,0,0.35)", 1.2);
  }
}

function drawCross(ctx, x, y, size) {
  drawTent(ctx, x, y, size, 1);
  drawTent(ctx, x, y, size, -1);
}

function drawHalfCross(ctx, x, y, size) {
  drawTent(ctx, x, y, size, 1);
}

function drawBasketweave(ctx, x, y, size, row, col) {
  const dir = (row + col) % 2 === 0 ? 1 : -1;
  drawTent(ctx, x, y, size, dir);
  stroke(ctx, x + size * 0.2, y + size * 0.5, x + size * 0.8, y + size * 0.5, "rgba(0,0,0,0.15)", 0.8);
}

function waveClusterSeed(x, y) {
  return ((x * 73856093) ^ (y * 19349663)) >>> 0;
}

function drawWaveTent(ctx, x, y, size, row, col, dmcNumber, paletteLookup) {
  const seed = waveClusterSeed(col, row);
  const clusterPhase = seed % 5;
  const offsetDir = seed % 2 === 0 ? "h" : "v";
  const blendShift = (seed >> 3) % 3 === 0;

  const pad = size * 0.12;
  const cx = x + size / 2;
  const cy = y + size / 2;

  let ox = 0;
  let oy = 0;
  if (offsetDir === "h") ox = (clusterPhase - 2) * size * 0.06;
  else oy = (clusterPhase - 2) * size * 0.06;

  stroke(
    ctx,
    cx - size * 0.28 + ox,
    y + size - pad + oy,
    cx + size * 0.22 + ox,
    y + pad + oy,
    blendShift ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)",
    1.4
  );

  if (blendShift && dmcNumber) {
    const adj = paletteLookup?.get?.(dmcNumber);
    if (adj) {
      ctx.fillStyle = adj.hex;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(cx + ox, cy + oy, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  if (clusterPhase === 0 || clusterPhase === 4) {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.arc(x + pad, y + size - pad, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const STITCH_STYLES = {
  tent: {
    id: "tent",
    name: "Tent Stitch",
    description: "Classic diagonal stitch covering one canvas intersection.",
    draw(ctx, x, y, size, row, col) {
      drawTent(ctx, x, y, size, (row + col) % 2 === 0 ? 1 : 1);
    },
  },
  continental: {
    id: "continental",
    name: "Continental",
    description: "All stitches slant the same direction across the row.",
    draw(ctx, x, y, size) {
      drawTent(ctx, x, y, size, 1);
    },
  },
  basketweave: {
    id: "basketweave",
    name: "Basketweave",
    description: "Alternating diagonal directions create a woven texture.",
    draw(ctx, x, y, size, row, col) {
      drawBasketweave(ctx, x, y, size, row, col);
    },
  },
  half_cross: {
    id: "half_cross",
    name: "Half Cross",
    description: "Single diagonal leg — quick coverage with less yarn.",
    draw(ctx, x, y, size) {
      drawHalfCross(ctx, x, y, size);
    },
  },
  cross_stitch: {
    id: "cross_stitch",
    name: "Cross Stitch",
    description: "Full X over each intersection — ideal for counted work.",
    draw(ctx, x, y, size) {
      drawCross(ctx, x, y, size);
    },
  },
  wave_tent: {
    id: "wave_tent",
    name: "Wave Tent",
    description:
      "Bring the needle up at the bottom of a canvas hole. Take a short diagonal tent stitch over one intersection. On the return under canvas, skip one thread horizontally or vertically before coming back up. Blend two strands — one current shade, one adjacent lighter or darker — in gentle clusters of 3–5 stitches with a staggered wave pattern.",
    draw(ctx, x, y, size, row, col, dmcNumber, paletteLookup) {
      drawWaveTent(ctx, x, y, size, row, col, dmcNumber, paletteLookup);
    },
  },
};

export function getStitchStyle(id) {
  return STITCH_STYLES[id] ?? STITCH_STYLES.tent;
}

export function buildPaletteLookup(palette) {
  const map = new Map();
  for (const entry of palette) {
    const lighter = findAdjacentShade(entry.number, true);
    map.set(entry.number, { ...entry, blend: lighter });
  }
  return map;
}

export function listStitchStyles() {
  return Object.values(STITCH_STYLES);
}
