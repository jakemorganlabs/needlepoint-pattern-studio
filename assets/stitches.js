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

function drawDot(ctx, cx, cy, r, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawVertical(ctx, x, y, size) {
  const pad = size * 0.2;
  stroke(ctx, x + size / 2, y + pad, x + size / 2, y + size - pad, "rgba(0,0,0,0.4)", 1.4);
}

function drawHorizontal(ctx, x, y, size) {
  const pad = size * 0.2;
  stroke(ctx, x + pad, y + size / 2, x + size - pad, y + size / 2, "rgba(0,0,0,0.4)", 1.4);
}

function drawSlavobasket(ctx, x, y, size, row, col) {
  const pad = size * 0.15;
  if ((row + col) % 2 === 0) {
    stroke(ctx, x + pad, y + pad, x + size - pad, y + size - pad, "rgba(0,0,0,0.35)", 1.3);
    stroke(ctx, x + pad, y + size - pad, x + size - pad, y + pad, "rgba(255,255,255,0.25)", 0.7);
  } else {
    stroke(ctx, x + size / 2, y + pad, x + size / 2, y + size - pad, "rgba(0,0,0,0.4)", 1.3);
  }
}

function drawParisian(ctx, x, y, size, row, col) {
  const tall = (row + col) % 2 === 0;
  const pad = size * 0.18;
  if (tall) {
    stroke(ctx, x + pad, y + size - pad, x + size - pad, y + pad, "rgba(0,0,0,0.35)", 1.3);
  } else {
    stroke(ctx, x + pad, y + pad, x + size - pad, y + size - pad, "rgba(0,0,0,0.35)", 1.3);
  }
}

function drawMosaic(ctx, x, y, size, row, col) {
  const p = (row + col) % 2;
  const pad = size * 0.12;
  if (p === 0) {
    drawTent(ctx, x, y, size, 1);
  } else {
    stroke(ctx, x + pad, y + size / 2, x + size - pad, y + size / 2, "rgba(0,0,0,0.25)", 1);
  }
}

function drawCashmere(ctx, x, y, size, row, col) {
  const p = row % 2;
  const pad = size * 0.14;
  if (p === 0) {
    stroke(ctx, x + pad, y + pad, x + size - pad, y + size - pad, "rgba(0,0,0,0.32)", 1.4);
  } else {
    stroke(ctx, x + pad, y + size - pad, x + size - pad, y + pad, "rgba(0,0,0,0.32)", 1.4);
  }
}

function drawBrick(ctx, x, y, size, row, col) {
  const pad = size * 0.18;
  if (col % 2 === 0) {
    stroke(ctx, x + pad, y + size / 2, x + size * 0.5, y + size / 2, "rgba(0,0,0,0.4)", 1.3);
  } else {
    stroke(ctx, x + size * 0.5, y + size / 2, x + size - pad, y + size / 2, "rgba(0,0,0,0.4)", 1.3);
  }
}

function drawHungarian(ctx, x, y, size, row, col) {
  const pad = size * 0.15;
  const mid = (row + col) % 3;
  if (mid === 0) {
    stroke(ctx, x + pad, y + size - pad, x + size / 2, y + pad, "rgba(0,0,0,0.35)", 1.3);
    stroke(ctx, x + size / 2, y + size - pad, x + size - pad, y + pad, "rgba(0,0,0,0.35)", 1.3);
  } else {
    drawTent(ctx, x, y, size, mid === 1 ? 1 : -1);
  }
}

function drawEncroaching(ctx, x, y, size, row, col) {
  const pad = size * 0.12;
  const offset = (row % 2) * size * 0.25;
  stroke(ctx, x + pad, y + size - pad, x + size - pad - offset, y + pad, "rgba(0,0,0,0.32)", 1.3);
  stroke(ctx, x + pad + offset, y + size - pad, x + size - pad, y + pad, "rgba(255,255,255,0.2)", 0.6);
}

function drawKenny(ctx, x, y, size, row, col) {
  const pad = size * 0.18;
  const cx = x + size / 2;
  const cy = y + size / 2;
  stroke(ctx, x + pad, y + pad, x + size - pad, y + size - pad, "rgba(0,0,0,0.32)", 1.1);
  stroke(ctx, x + pad, y + size - pad, x + size - pad, y + pad, "rgba(0,0,0,0.32)", 1.1);
  stroke(ctx, x + pad, cy, x + size - pad, cy, (row + col) % 2 === 0 ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)", 0.9);
}

function drawScotch(ctx, x, y, size, row, col) {
  const pad = size * 0.12;
  const cx = x + size / 2;
  const cy = y + size / 2;
  stroke(ctx, x + pad, cy, cx, y + pad, "rgba(0,0,0,0.35)", 1.2);
  stroke(ctx, cx, y + pad, x + size - pad, cy, "rgba(0,0,0,0.35)", 1.2);
  stroke(ctx, x + size - pad, cy, cx, y + size - pad, "rgba(0,0,0,0.35)", 1.2);
  stroke(ctx, cx, y + size - pad, x + pad, cy, "rgba(0,0,0,0.35)", 1.2);
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
  vertical: {
    id: "vertical",
    name: "Vertical Stitch",
    description: "Straight upright stitch over a single canvas intersection. Strong, architectural coverage.",
    draw(ctx, x, y, size) {
      drawVertical(ctx, x, y, size);
    },
  },
  horizontal: {
    id: "horizontal",
    name: "Horizontal Stitch",
    description: "Straight side-to-side stitch, useful for backgrounds and skies.",
    draw(ctx, x, y, size) {
      drawHorizontal(ctx, x, y, size);
    },
  },
  parisian: {
    id: "parisian",
    name: "Parisian",
    description: "Alternating tall/short diagonals producing a striped, woven look from the back.",
    draw(ctx, x, y, size, row, col) {
      drawParisian(ctx, x, y, size, row, col);
    },
  },
  mosaic: {
    id: "mosaic",
    name: "Mosaic",
    description: "Small alternating diagonals and short bars grouped into tessellated 2×2 blocks.",
    draw(ctx, x, y, size, row, col) {
      drawMosaic(ctx, x, y, size, row, col);
    },
  },
  cashmere: {
    id: "cashmere",
    name: "Cashmere",
    description: "Satin-style stitch laid on alternating diagonal rows — good for smooth gradients and skies.",
    draw(ctx, x, y, size, row, col) {
      drawCashmere(ctx, x, y, size, row, col);
    },
  },
  brick: {
    id: "brick",
    name: "Brick",
    description: "Offset horizontal bars staggered row-to-row, mimicking brickwork.",
    draw(ctx, x, y, size, row, col) {
      drawBrick(ctx, x, y, size, row, col);
    },
  },
  hungarian: {
    id: "hungarian",
    name: "Hungarian",
    description: "Two short diagonals per cell with every third cell a single tent — a textured diamond rhythm.",
    draw(ctx, x, y, size, row, col) {
      drawHungarian(ctx, x, y, size, row, col);
    },
  },
  encroaching: {
    id: "encroaching",
    name: "Encroaching",
    description: "Diagonal stitches overlapped row-to-row with a lighter shimmer pass, smoothing color transitions.",
    draw(ctx, x, y, size, row, col) {
      drawEncroaching(ctx, x, y, size, row, col);
    },
  },
  kenny: {
    id: "kenny",
    name: "Kenny",
    description: "Cross plus a center tie-down bar; a decorative cross variant that holds long stitches flat.",
    draw(ctx, x, y, size, row, col) {
      drawKenny(ctx, x, y, size, row, col);
    },
  },
  scotch: {
    id: "scotch",
    name: "Scotch",
    description: "Four diagonal legs meeting at the cell center — a square woven block, stable on the bias.",
    draw(ctx, x, y, size, row, col) {
      drawScotch(ctx, x, y, size, row, col);
    },
  },
  slavobasket: {
    id: "slavobasket",
    name: "Slavobasket",
    description: "Alternating crossed diagonals and verticals — a basketweave-meets-cross hybrid.",
    draw(ctx, x, y, size, row, col) {
      drawSlavobasket(ctx, x, y, size, row, col);
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
