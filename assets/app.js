import { buildGridFromImage } from "./quantize.js";
import { loadDmcCatalog, mapGridToDmc, assignSymbols } from "./dmc.js";
import {
  renderPatternCanvas,
  exportPatternPng,
  exportPatternSvg,
  exportPaletteCsv,
  downloadText,
  CANVAS_PRESETS,
  computeGridDimensions,
  physicalSize,
} from "./grid.js";
import { listStitchStyles, getStitchStyle } from "./stitches.js";
import { buildThreadLinks } from "./dmc-links.js";

const state = {
  sourceImage: null,
  sourceImageData: null,
  dmcGrid: null,
  palette: [],
  symbolMap: new Map(),
  patternCanvas: null,
  gridDims: { width: 100, height: 100, hpi: 14 },
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const presetMap = Object.fromEntries(CANVAS_PRESETS.map((p) => [p.id, p]));

function showToast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { el.hidden = true; }, 2800);
}

function setSection(name) {
  $$(".section-tab").forEach((tab) => {
    const active = tab.dataset.section === name;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });

  $$(".control-panel [data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== name;
  });

  $$(".preview-stage [data-panel]").forEach((panel) => {
    const show = panel.dataset.panel === name;
    panel.hidden = !show;
    panel.classList.toggle("is-visible", show);
  });
}

function updateSizeReadout() {
  const presetId = $("#preset-select").value;
  const customEnabled = presetId === "custom";
  $("#custom-dims").hidden = !customEnabled;

  const sw = state.sourceImage?.naturalWidth ?? 0;
  const sh = state.sourceImage?.naturalHeight ?? 0;
  const dims = computeGridDimensions(
    sw,
    sh,
    customEnabled ? null : presetMap[presetId],
    customEnabled
      ? {
          enabled: true,
          width: parseInt($("#custom-width").value, 10),
          height: parseInt($("#custom-height").value, 10),
          hpi: parseInt($("#custom-hpi").value, 10),
        }
      : null,
    $("#preserve-aspect").checked
  );

  state.gridDims = dims;
  const unit = $("#unit-cm").checked ? "cm" : "in";
  const phys = physicalSize(dims.width, dims.height, dims.hpi, unit);
  $("#size-readout").textContent = `${dims.width} × ${dims.height} holes · ${phys.width} × ${phys.height} ${phys.unit} @ ${dims.hpi} HPI`;
}

function applyImageStyle(ctx, width, height, style) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];
    if (style === "vivid") {
      const avg = (r + g + b) / 3;
      r = Math.min(255, avg + (r - avg) * 1.4);
      g = Math.min(255, avg + (g - avg) * 1.4);
      b = Math.min(255, avg + (b - avg) * 1.4);
    } else if (style === "muted") {
      const avg = (r + g + b) / 3;
      r = avg + (r - avg) * 0.6;
      g = avg + (g - avg) * 0.6;
      b = avg + (b - avg) * 0.6;
    } else if (style === "poster") {
      r = Math.round(r / 32) * 32;
      g = Math.round(g / 32) * 32;
      b = Math.round(b / 32) * 32;
    }
    d[i] = r; d[i + 1] = g; d[i + 2] = b;
  }
  ctx.putImageData(imgData, 0, 0);
  return ctx.getImageData(0, 0, width, height);
}

function loadImageToCanvas(img) {
  const canvas = $("#hidden-canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const style = $("#style-select")?.value ?? "natural";
  return applyImageStyle(ctx, canvas.width, canvas.height, style);
}

function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("Please choose a valid image file.");
    return;
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    state.sourceImage = img;
    $("#source-image").src = url;
    $("#source-preview").hidden = false;
    state.sourceImageData = loadImageToCanvas(img);
    updateSizeReadout();
    showToast("Image loaded — adjust settings and generate.");
    setSection("adjust");
  };
  img.onerror = () => showToast("Could not load that image.");
  img.src = url;
}

function renderThreadList() {
  const list = $("#thread-list");
  const legend = $("#legend-list");
  list.innerHTML = "";
  legend.innerHTML = "";

  if (!state.palette.length) {
    $("#palette-summary").textContent = "Generate a pattern to see your DMC thread list.";
    return;
  }

  const total = state.palette.reduce((s, p) => s + p.count, 0);
  $("#palette-summary").textContent = `${state.palette.length} DMC colors · ${total.toLocaleString()} stitches`;

  for (const entry of state.palette) {
    const links = buildThreadLinks(entry);
    const li = document.createElement("li");
    li.className = "thread-item";
    li.innerHTML = `
      <div class="swatch" style="background:${entry.hex}" title="${entry.symbol}">${entry.symbol}</div>
      <div class="thread-meta">
        <h4>DMC ${entry.number} — ${entry.name}</h4>
        <p>${entry.count.toLocaleString()} stitches · ${entry.hex}</p>
      </div>
      <div class="thread-links">
        <a href="${links.dmc}" target="_blank" rel="noopener noreferrer">Buy on DMC</a>
        <a href="${links.amazon}" target="_blank" rel="noopener noreferrer">Find on Amazon</a>
      </div>`;
    list.appendChild(li);

    const leg = document.createElement("li");
    leg.className = "legend-item";
    leg.innerHTML = `
      <div class="swatch" style="background:${entry.hex}">${entry.symbol}</div>
      <span><strong>${entry.symbol}</strong> = DMC ${entry.number} ${entry.name}</span>`;
    legend.appendChild(leg);
  }
}

function renderPattern() {
  const mount = $("#pattern-mount");
  mount.innerHTML = "";
  if (!state.dmcGrid) return;

  const cellSize = parseInt($("#zoom-range").value, 10);
  const canvas = renderPatternCanvas({
    dmcGrid: state.dmcGrid,
    palette: state.palette,
    cellSize,
    showLabels: $("#show-labels").checked,
    showStitches: $("#show-stitches").checked,
    stitchStyleId: $("#stitch-select").value,
    symbolMap: state.symbolMap,
  });

  state.patternCanvas = canvas;
  mount.appendChild(canvas);

  const rows = state.dmcGrid.length;
  const cols = state.dmcGrid[0]?.length ?? 0;
  const stats = `${cols} × ${rows} grid · ${state.palette.length} colors`;
  $("#grid-stats").textContent = stats;
  const sideStats = $("#pattern-stats-side");
  if (sideStats) sideStats.textContent = stats;
}

function syncZoom(value) {
  $("#zoom-range").value = value;
  const side = $("#zoom-range-side");
  if (side) side.value = value;
  $("#zoom-value").textContent = value;
}

function syncCheckboxes() {
  const labels = $("#show-labels").checked;
  const stitches = $("#show-stitches").checked;
  const labelsSide = $("#show-labels-side");
  const stitchesSide = $("#show-stitches-side");
  if (labelsSide) labelsSide.checked = labels;
  if (stitchesSide) stitchesSide.checked = stitches;
}

async function generatePattern() {
  if (!state.sourceImageData) {
    showToast("Upload an image first.");
    setSection("upload");
    return;
  }

  $("#generate-btn").disabled = true;
  $("#generate-btn").textContent = "Generating…";

  try {
    state.sourceImageData = loadImageToCanvas(state.sourceImage);
    updateSizeReadout();
    const { width, height } = state.gridDims;
    const colorCount = parseInt($("#color-count").value, 10);

    await new Promise((r) => setTimeout(r, 16));

    const { grid } = buildGridFromImage(state.sourceImageData, width, height, colorCount);
    const { dmcGrid, palette } = mapGridToDmc(grid);
    const withSymbols = assignSymbols(palette);

    state.dmcGrid = dmcGrid;
    state.palette = withSymbols;
    state.symbolMap = new Map(withSymbols.map((p) => [p.number, p.symbol]));

    renderPattern();
    renderThreadList();

    $("#export-png").disabled = false;
    $("#export-svg").disabled = false;
    $("#export-csv").disabled = false;

    showToast("Pattern generated!");
    setSection("pattern");
  } catch (err) {
    console.error(err);
    showToast("Something went wrong generating the pattern.");
  } finally {
    $("#generate-btn").disabled = false;
    $("#generate-btn").textContent = "Generate pattern";
  }
}

function initStitchSelect() {
  const select = $("#stitch-select");
  select.innerHTML = "";
  for (const style of listStitchStyles()) {
    const opt = document.createElement("option");
    opt.value = style.id;
    opt.textContent = style.name;
    select.appendChild(opt);
  }
  select.value = "wave_tent";
  updateStitchDescription();
}

function updateStitchDescription() {
  const style = getStitchStyle($("#stitch-select").value);
  $("#stitch-description").textContent = style.description;
}

function bindEvents() {
  const dropzone = $("#dropzone");
  const fileInput = $("#file-input");

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("is-dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-dragover"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("is-dragover");
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  $$(".section-tab").forEach((tab) => {
    tab.addEventListener("click", () => setSection(tab.dataset.section));
  });

  $("#color-count").addEventListener("input", (e) => {
    $("#color-count-value").textContent = e.target.value;
  });

  ["preset-select", "custom-width", "custom-height", "custom-hpi", "preserve-aspect", "unit-cm"].forEach((id) => {
    $("#" + id)?.addEventListener("change", updateSizeReadout);
    $("#" + id)?.addEventListener("input", updateSizeReadout);
  });

  $("#preset-select").addEventListener("change", () => {
    $("#custom-dims").hidden = $("#preset-select").value !== "custom";
    updateSizeReadout();
  });

  $("#stitch-select").addEventListener("change", () => {
    updateStitchDescription();
    if (state.dmcGrid) renderPattern();
  });

  ["show-labels", "show-stitches", "zoom-range", "show-labels-side", "show-stitches-side", "zoom-range-side"].forEach((id) => {
    $("#" + id)?.addEventListener("change", (e) => {
      if (id === "show-labels-side") $("#show-labels").checked = e.target.checked;
      if (id === "show-stitches-side") $("#show-stitches").checked = e.target.checked;
      if (id === "show-labels") { const s = $("#show-labels-side"); if (s) s.checked = e.target.checked; }
      if (id === "show-stitches") { const s = $("#show-stitches-side"); if (s) s.checked = e.target.checked; }
      if (id === "zoom-range-side") syncZoom(e.target.value);
      if (id === "zoom-range") syncZoom(e.target.value);
      if (state.dmcGrid) renderPattern();
    });
    $("#" + id)?.addEventListener("input", (e) => {
      if (id.startsWith("zoom")) syncZoom(e.target.value);
      if (state.dmcGrid && !id.startsWith("zoom")) renderPattern();
    });
  });

  $("#regenerate-btn")?.addEventListener("click", generatePattern);

  $("#style-select")?.addEventListener("change", () => {
    if (state.sourceImage) state.sourceImageData = loadImageToCanvas(state.sourceImage);
  });

  $("#generate-btn").addEventListener("click", generatePattern);

  $("#export-png").addEventListener("click", () => {
    if (!state.patternCanvas) return;
    exportPatternPng(state.patternCanvas);
    showToast("PNG downloaded.");
  });

  $("#export-svg").addEventListener("click", () => {
    if (!state.dmcGrid) return;
    const svg = exportPatternSvg({
      dmcGrid: state.dmcGrid,
      palette: state.palette,
      cellSize: 20,
      showLabels: $("#show-labels").checked,
      showStitches: false,
      stitchStyleId: $("#stitch-select").value,
      symbolMap: state.symbolMap,
    });
    downloadText(svg, "needlepoint-pattern.svg", "image/svg+xml");
    showToast("SVG downloaded.");
  });

  $("#export-csv").addEventListener("click", () => {
    if (!state.palette.length) return;
    downloadText(exportPaletteCsv(state.palette), "thread-list.csv", "text/csv");
    showToast("Thread list downloaded.");
  });
}

async function init() {
  await loadDmcCatalog();
  initStitchSelect();
  bindEvents();
  updateSizeReadout();
}

init();
