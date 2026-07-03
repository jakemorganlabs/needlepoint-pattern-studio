import { getStitchStyle, buildPaletteLookup } from "./stitches.js";

export function renderPatternCanvas({
  dmcGrid,
  palette,
  cellSize = 16,
  showLabels = true,
  showStitches = true,
  stitchStyleId = "tent",
  symbolMap = new Map(),
}) {
  const rows = dmcGrid.length;
  const cols = dmcGrid[0]?.length ?? 0;
  const canvas = document.createElement("canvas");
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  const ctx = canvas.getContext("2d");

  const colorByNumber = new Map(palette.map((p) => [p.number, p]));
  const stitch = getStitchStyle(stitchStyleId);
  const paletteLookup = buildPaletteLookup(palette);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const num = dmcGrid[y][x];
      const color = colorByNumber.get(num);
      const px = x * cellSize;
      const py = y * cellSize;

      ctx.fillStyle = color?.hex ?? "#ccc";
      ctx.fillRect(px, py, cellSize, cellSize);

      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);

      if (showStitches) {
        stitch.draw(ctx, px, py, cellSize, y, x, num, paletteLookup);
      }

      if (showLabels) {
        const sym = symbolMap.get(num) ?? color?.symbol ?? num;
        const lum = color ? 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b : 128;
        ctx.fillStyle = lum > 140 ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.9)";
        ctx.font = `600 ${Math.max(8, cellSize * 0.45)}px "Source Sans 3", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(sym), px + cellSize / 2, py + cellSize / 2);
      }
    }
  }

  return canvas;
}

export function exportPatternPng(canvas, filename = "needlepoint-pattern.png") {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

export function exportPatternSvg({
  dmcGrid,
  palette,
  cellSize = 20,
  showLabels = true,
  showStitches = false,
  stitchStyleId = "tent",
  symbolMap = new Map(),
}) {
  const rows = dmcGrid.length;
  const cols = dmcGrid[0]?.length ?? 0;
  const w = cols * cellSize;
  const h = rows * cellSize;
  const colorByNumber = new Map(palette.map((p) => [p.number, p]));

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += `<rect width="100%" height="100%" fill="#ffffff"/>`;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const num = dmcGrid[y][x];
      const color = colorByNumber.get(num);
      const px = x * cellSize;
      const py = y * cellSize;
      svg += `<rect x="${px}" y="${py}" width="${cellSize}" height="${cellSize}" fill="${color?.hex ?? "#ccc"}" stroke="#00000014" stroke-width="0.5"/>`;
      if (showLabels) {
        const sym = symbolMap.get(num) ?? color?.symbol ?? num;
        const lum = color ? 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b : 128;
        const fill = lum > 140 ? "#1a1a1a" : "#ffffff";
        svg += `<text x="${px + cellSize / 2}" y="${py + cellSize / 2}" fill="${fill}" font-size="${cellSize * 0.45}" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">${escapeXml(String(sym))}</text>`;
      }
    }
  }

  if (showStitches) {
    svg += `<!-- Stitch style: ${stitchStyleId} — render stitches in app preview -->`;
  }

  svg += "</svg>";
  return svg;
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function downloadText(content, filename, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPaletteCsv(palette) {
  const header = "Symbol,DMC Number,Name,Hex,Stitch Count,Estimated Skeins";
  const total = palette.reduce((s, p) => s + p.count, 0);
  const rows = palette.map((p) => {
    const skeins = Math.max(1, Math.ceil((p.count / total) * palette.length * 0.15));
    return `${p.symbol},${p.number},"${p.name.replace(/"/g, '""')}",${p.hex},${p.count},${skeins}`;
  });
  return [header, ...rows].join("\n");
}

export const CANVAS_PRESETS = [
  { id: "small", label: "Small — 6×6 in @ 14 HPI", width: 84, height: 84, hpi: 14, inches: 6 },
  { id: "medium", label: "Medium — 8×10 in @ 14 HPI", width: 112, height: 140, hpi: 14, inchesW: 8, inchesH: 10 },
  { id: "large", label: "Large — 10×12 in @ 14 HPI", width: 140, height: 168, hpi: 14, inchesW: 10, inchesH: 12 },
  { id: "pillow", label: "Pillow — 14×14 in @ 10 HPI", width: 140, height: 140, hpi: 10, inches: 14 },
  { id: "mini", label: "Mini — 4×4 in @ 18 HPI", width: 72, height: 72, hpi: 18, inches: 4 },
];

export function computeGridDimensions(sourceWidth, sourceHeight, preset, custom, preserveAspect = true) {
  if (custom?.enabled) {
    return {
      width: Math.max(10, Math.min(400, custom.width)),
      height: Math.max(10, Math.min(400, custom.height)),
      hpi: custom.hpi ?? 14,
    };
  }

  if (preset) {
    let w = preset.width;
    let h = preset.height;
    if (preserveAspect && sourceWidth && sourceHeight) {
      const aspect = sourceWidth / sourceHeight;
      const presetAspect = w / h;
      if (aspect > presetAspect) h = Math.round(w / aspect);
      else w = Math.round(h * aspect);
    }
    return { width: w, height: h, hpi: preset.hpi };
  }

  return { width: 100, height: 100, hpi: 14 };
}

export function physicalSize(width, height, hpi, unit = "in") {
  const wIn = width / hpi;
  const hIn = height / hpi;
  if (unit === "cm") {
    return { width: (wIn * 2.54).toFixed(1), height: (hIn * 2.54).toFixed(1), unit: "cm" };
  }
  return { width: wIn.toFixed(1), height: hIn.toFixed(1), unit: "in" };
}
