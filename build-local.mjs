#!/usr/bin/env node
/**
 * Build a single self-contained index.html for offline use.
 *
 * The hosted website version uses ES modules + fetch(), which browsers block
 * on the file:// protocol. This script inlines all CSS, JavaScript, and the DMC
 * color catalog into one HTML file that runs by double-clicking it in Chrome
 * (no web server required).
 *
 * Output: dist-local/index.html  ->  zipped as needlepoint-pattern-maker.zip
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const assets = join(root, "assets");
const read = (p) => readFileSync(p, "utf8");

const css = read(join(assets, "styles.css"));
const dmcColors = read(join(assets, "dmc-colors.json"));

// JS modules concatenated in dependency order.
const moduleOrder = [
  "quantize.js",
  "dmc.js",
  "dmc-links.js",
  "stitches.js",
  "grid.js",
  "app.js",
];

function stripModuleSyntax(src) {
  return src
    // Drop `import ... from "...";` statements (single or multi-line).
    .replace(/^\s*import\s[\s\S]*?;\s*$/gm, "")
    // Drop `export { ... };` re-export blocks.
    .replace(/^\s*export\s*\{[\s\S]*?\}\s*;\s*$/gm, "")
    // Turn `export function/const/class/async` into plain declarations.
    .replace(/^(\s*)export\s+(default\s+)?/gm, "$1");
}

let combined = "";
for (const file of moduleOrder) {
  let src = read(join(assets, file));
  if (file === "dmc.js") {
    // Replace the network fetch with the embedded catalog.
    src = src.replace(
      /const res = await fetch\([^)]*\);\s*\n\s*catalog = await res\.json\(\);/,
      "catalog = DMC_COLORS_DATA;"
    );
  }
  combined += `\n/* ===== ${file} ===== */\n` + stripModuleSyntax(src) + "\n";
}

const scriptBlock =
  `const DMC_COLORS_DATA = ${dmcColors};\n` +
  `(function () {\n${combined}\n})();`;

let html = read(join(root, "index.html"));

// Use function replacers so `$`, `$$`, `$&` in the inlined code are inserted
// verbatim (a plain string replacement would treat them as special patterns).
// Inline the stylesheet.
html = html.replace(
  /<link rel="stylesheet" href="assets\/styles\.css" \/>/,
  () => `<style>\n${css}\n</style>`
);

// Inline the module script as a classic script.
html = html.replace(
  /<script type="module" src="assets\/app\.js"><\/script>/,
  () => `<script>\n${scriptBlock}\n</script>`
);

// Mark this build as the offline edition in the title/meta.
html = html.replace(
  /<title>Needlepoint Pattern Maker<\/title>/,
  () => "<title>Needlepoint Pattern Maker — Offline Edition</title>"
);

const outDir = join(root, "dist-local");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), html, "utf8");

const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`Built dist-local/index.html (${kb} KB, fully self-contained).`);
