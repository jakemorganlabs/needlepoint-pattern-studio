# Needlepoint Pattern Maker

Turn any photo or artwork into a stitch-ready needlepoint chart with DMC floss colors, labeled grids, and thread shopping links — entirely in your browser.

## Features

- **Image upload** — PNG, JPG, WebP, GIF, and BMP
- **Color control** — adjust color count (2–60) and style (natural, vivid, muted, poster)
- **Canvas sizing** — preset sizes at 10–18 HPI, or custom width × height in canvas holes
- **DMC matching** — 456 DMC floss colors matched via CIE76 color distance
- **Stitch styles** — Tent, Continental, Basketweave, Half Cross, Cross Stitch, and **Wave Tent**
- **Labeled grid** — symbols on each cell for black-and-white printing
- **Thread list** — DMC number, name, hex, stitch count, buy links (DMC + Amazon)
- **Export** — PNG chart, SVG chart, CSV thread list

## Two ways to run

This project ships in two forms for two different use cases.

### 1. Offline zip — runs directly in Chrome, no server

Download [`needlepoint-pattern-maker.zip`](needlepoint-pattern-maker.zip), unzip it, and
**double-click `index.html`** to open it in Google Chrome. That's it.

The zip is a single, fully self-contained HTML file — all CSS, JavaScript, and the
DMC color catalog are inlined, so it runs straight from the `file://` protocol with
no web server and no internet connection required.

### 2. Hosted website — deploy to any static host

The repository source (`index.html` + `assets/`) is the website edition. It uses ES
modules and `fetch()`, so it must be served over HTTP (these are blocked on `file://`).

Run it locally:

```bash
git clone https://github.com/jakemorganlabs/needlepoint-pattern-studio.git
cd needlepoint-pattern-studio
python3 -m http.server 8080
# open http://localhost:8080
```

Deploy to GitHub Pages:

1. Push this repo to GitHub
2. **Settings → Pages**
3. Source: **Deploy from branch** → `main` → `/ (root)`
4. Live at `https://<username>.github.io/needlepoint-pattern-studio/`

Works on Netlify, Vercel, or any static host — just serve the root directory.

### Rebuilding the offline zip

The offline file is generated from the website source by a build script:

```bash
node build-local.mjs                       # -> dist-local/index.html
cd dist-local && zip -j ../needlepoint-pattern-maker.zip index.html
```

## How to Use

1. **Upload** — drop or browse for an image
2. **Adjust** — set color count, canvas size, stitch style, and display options
3. **Generate** — click "Generate pattern"
4. **Pattern** — pan/zoom the labeled grid preview
5. **Threads** — review your DMC palette with buy links
6. **Export** — download PNG, SVG, or CSV

## Wave Tent Stitch

A custom stitch style for organic, painterly texture:

1. Bring the needle up at the bottom of a canvas hole
2. Take a short diagonal tent stitch over one intersection
3. On the return under canvas, skip one thread horizontally or vertically before coming back up
4. Blend two strands — one from the current shade, one from the next lighter or darker
5. Repeat in gentle wave or staggered clusters of 3–5 stitches

Select **Wave Tent** in the stitch style dropdown to preview the staggered pattern overlay.

## Canvas Presets

| Preset | Size | HPI | Holes |
|--------|------|-----|-------|
| Mini | 4×4 in | 18 | 72×72 |
| Small | 6×6 in | 14 | 84×84 |
| Medium | 8×10 in | 14 | 112×140 |
| Large | 10×12 in | 14 | 140×168 |
| Pillow | 14×14 in | 10 | 140×140 |

Custom mode lets you set width, height, and HPI directly.

## DMC Color Data

Color matching uses a curated DMC floss catalog (456 colors). Buy links point to:

- [DMC official store](https://www.dmc.com/us/) — search by color number
- [Amazon](https://www.amazon.com/) — fallback search by number and name

This project is not affiliated with DMC or Amazon.

## License

**Exclusive — no commercial use without permission.**

Personal, non-commercial needlepoint use is permitted. Commercial use, redistribution, and derivative distribution require written permission from the copyright holder. See [LICENSE](LICENSE) for full terms.

## Tech

- Vanilla HTML, CSS, JavaScript (ES modules)
- Canvas 2D for image processing and pattern rendering
- No build step, no server, no dependencies
- All processing runs client-side — your images never leave your device
