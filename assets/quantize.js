/** Color quantization: median cut + k-means refinement */

function rgbToLab(r, g, b) {
  let rr = r / 255;
  let gg = g / 255;
  let bb = b / 255;
  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;
  const x = (rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375) / 0.95047;
  const y = (rr * 0.2126729 + gg * 0.7151522 + bb * 0.072175) / 1.0;
  const z = (rr * 0.0193339 + gg * 0.119192 + bb * 0.9503041) / 1.08883;
  const fx = x > 0.008856 ? Math.cbrt(x) : 7.787 * x + 16 / 116;
  const fy = y > 0.008856 ? Math.cbrt(y) : 7.787 * y + 16 / 116;
  const fz = z > 0.008856 ? Math.cbrt(z) : 7.787 * z + 16 / 116;
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

function medianCut(pixels, depth, maxDepth) {
  if (pixels.length === 0) return [];
  if (depth >= maxDepth || pixels.length === 1) {
    const sum = pixels.reduce(
      (acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }),
      { r: 0, g: 0, b: 0 }
    );
    const n = pixels.length;
    return [{ r: sum.r / n, g: sum.g / n, b: sum.b / n, pixels }];
  }

  let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
  for (const p of pixels) {
    minR = Math.min(minR, p.r); maxR = Math.max(maxR, p.r);
    minG = Math.min(minG, p.g); maxG = Math.max(maxG, p.g);
    minB = Math.min(minB, p.b); maxB = Math.max(maxB, p.b);
  }
  const rangeR = maxR - minR;
  const rangeG = maxG - minG;
  const rangeB = maxB - minB;

  let channel = "r";
  if (rangeG >= rangeR && rangeG >= rangeB) channel = "g";
  else if (rangeB >= rangeR && rangeB >= rangeG) channel = "b";

  pixels.sort((a, b) => a[channel] - b[channel]);
  const mid = Math.floor(pixels.length / 2);
  const left = pixels.slice(0, mid);
  const right = pixels.slice(mid);

  return [
    ...medianCut(left, depth + 1, maxDepth),
    ...medianCut(right, depth + 1, maxDepth),
  ];
}

function kMeansRefine(pixels, centroids, iterations = 4) {
  const clusters = centroids.map((c) => ({ ...c, pixels: [] }));

  for (let iter = 0; iter < iterations; iter++) {
    for (const c of clusters) c.pixels = [];

    for (const p of pixels) {
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < clusters.length; i++) {
        const c = clusters[i];
        const dr = p.r - c.r;
        const dg = p.g - c.g;
        const db = p.b - c.b;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      clusters[best].pixels.push(p);
    }

    for (const c of clusters) {
      if (c.pixels.length === 0) continue;
      const sum = c.pixels.reduce(
        (acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }),
        { r: 0, g: 0, b: 0 }
      );
      const n = c.pixels.length;
      c.r = sum.r / n;
      c.g = sum.g / n;
      c.b = sum.b / n;
    }
  }

  return clusters.map((c) => ({
    r: Math.round(c.r),
    g: Math.round(c.g),
    b: Math.round(c.b),
  }));
}

export function sampleImageData(imageData, maxSide = 256) {
  const { width, height, data } = imageData;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const sw = Math.max(1, Math.round(width * scale));
  const sh = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = width;
  srcCanvas.height = height;
  srcCanvas.getContext("2d").putImageData(imageData, 0, 0);
  ctx.drawImage(srcCanvas, 0, 0, sw, sh);
  const sampled = ctx.getImageData(0, 0, sw, sh);
  const pixels = [];
  for (let i = 0; i < sampled.data.length; i += 4) {
    const a = sampled.data[i + 3];
    if (a < 128) continue;
    pixels.push({
      r: sampled.data[i],
      g: sampled.data[i + 1],
      b: sampled.data[i + 2],
      x: (i / 4) % sw,
      y: Math.floor(i / 4 / sw),
    });
  }
  return { pixels, width: sw, height: sh };
}

export function quantizeColors(pixels, colorCount) {
  if (pixels.length === 0) return [];
  const k = Math.max(2, Math.min(colorCount, pixels.length, 60));
  const maxDepth = Math.ceil(Math.log2(k));
  const boxes = medianCut([...pixels], 0, maxDepth);
  let centroids = boxes.slice(0, k).map((b) => ({
    r: b.r ?? b.pixels?.[0]?.r ?? 0,
    g: b.g ?? b.pixels?.[0]?.g ?? 0,
    b: b.b ?? b.pixels?.[0]?.b ?? 0,
  }));

  while (centroids.length < k) {
    centroids.push({ ...pixels[Math.floor(Math.random() * pixels.length)] });
  }

  return kMeansRefine(pixels, centroids.slice(0, k));
}

export function mapPixelsToCentroids(pixels, centroids) {
  return pixels.map((p) => {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < centroids.length; i++) {
      const c = centroids[i];
      const dr = p.r - c.r;
      const dg = p.g - c.g;
      const db = p.b - c.b;
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  });
}

export function buildGridFromImage(imageData, gridWidth, gridHeight, colorCount) {
  const { pixels, width, height } = sampleImageData(imageData);
  const centroids = quantizeColors(pixels, colorCount);
  const indices = mapPixelsToCentroids(pixels, centroids);

  const grid = [];
  for (let gy = 0; gy < gridHeight; gy++) {
    const row = [];
    for (let gx = 0; gx < gridWidth; gx++) {
      const sx = Math.floor((gx / gridWidth) * width);
      const sy = Math.floor((gy / gridHeight) * height);
      let nearest = 0;
      let nearestDist = Infinity;
      for (let i = 0; i < pixels.length; i++) {
        const p = pixels[i];
        const dx = p.x - sx;
        const dy = p.y - sy;
        const dist = dx * dx + dy * dy;
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = indices[i];
        }
      }
      row.push(centroids[nearest]);
    }
    grid.push(row);
  }
  return { grid, centroids };
}

export { rgbToLab };
