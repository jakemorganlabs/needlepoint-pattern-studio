# Design System — Needlepoint Pattern Maker

## Scene

A crafter at a well-lit table, laptop open beside canvas and floss bobbins. The interface should feel like a premium craft journal — deep harbor indigo and brass warmth, not generic cream SaaS.

## Color Strategy

Committed: pure white background with saturated indigo primary and warm brass accent. Mood carried by brand colors and typography, not tinted cream surfaces.

## Palette (OKLCH)

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `oklch(1.000 0.000 0)` | Page background |
| `--surface` | `oklch(0.970 0.004 230)` | Panels, sidebars |
| `--ink` | `oklch(0.220 0.030 230)` | Body text |
| `--primary` | `oklch(0.450 0.086 230)` | Primary actions, headings accent |
| `--accent` | `oklch(0.620 0.120 75)` | Warm brass highlights, badges |
| `--muted` | `oklch(0.480 0.018 230)` | Secondary text |

## Typography

- Display: **Fraunces** (serif) — headings, hero
- Body/UI: **Source Sans 3** (humanist sans) — controls, labels, body

## Layout

Asymmetric two-column workspace on desktop: controls left (fixed ~360px), pattern preview right (flex). Single column on mobile. No nested cards. Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px.

## Components

- Upload dropzone with dashed border, hover lift
- Section tabs (Upload / Adjust / Pattern / Threads / Export)
- Range sliders with visible value
- Pattern canvas with pan/zoom
- Thread list rows: swatch + symbol + DMC number + name + count + buy links
- Primary button: filled indigo, white text
- Secondary button: outline only, no shadow pairing

## Motion

Ease-out-quart transitions (200–350ms). Staggered section reveals on load. `@media (prefers-reduced-motion: reduce)` → instant/crossfade only.

## Z-index Scale

- dropdown: 100
- sticky header: 200
- modal backdrop: 300
- modal: 400
- toast: 500
