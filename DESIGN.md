# Design System — Live Oak Design House

## Scene

A crafter at a well-lit coastal table, laptop open beside canvas and floss bobbins. The interface should feel like a premium coastal craft studio — deep live-oak green primary with warm bronze accent, never generic cream SaaS.

## Color Strategy

Committed: warm off-white background with saturated deep-green primary (#2F4F3A → oklch primary) and warm bronze accent (#D59940 → oklch accent). Mood carried by brand colors and typography, not tinted cream surfaces.

## Brand mark

A clean silhouette of a coastal live oak tree in bronze (#D59940) on a deep forest green square (#2F4F3A). Used as the header logo and favicon.

## Palette (OKLCH)

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `oklch(0.985 0.006 100)` | Page background (warm off-white, almost pure) |
| `--surface` | `oklch(0.965 0.012 100)` | Panels, sidebars |
| `--ink` | `oklch(0.250 0.025 155)` | Body text (warm dark green-black) |
| `--primary` | `oklch(0.320 0.042 155)` | Deep live-oak green — primary actions, active tab |
| `--accent` | `oklch(0.700 0.130 70)` | Warm coastal bronze — highlights, kickers, focus |
| `--muted` | `oklch(0.490 0.020 150)` | Secondary text |

## Typography

- Display: **Fraunces** (serif) — headings, hero
- Body/UI: **Source Sans 3** (humanist sans) — controls, labels, body

## Layout

Asymmetric two-column workspace on desktop: controls left (fixed ~360px), pattern preview right (flex). Single column on mobile. No nested cards. Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px.

## Components

- Upload dropzone with dashed border, hover lift
- Section tabs (Upload / Adjust / Pattern / Threads / Export)
- Range sliders with visible value
- Custom Mesh Count/HPI numeric input (any value 2–60)
- Pattern canvas with pan/zoom
- Thread list rows: swatch + symbol + DMC number + name + count + buy links
- Primary button: filled deep green, light text
- Secondary button: outline only, no shadow pairing

## Motion

Ease-out-quart transitions (200–350ms). Staggered section reveals on load. `@media (prefers-reduced-motion: reduce)` → instant/crossfade only.

## Z-index Scale

- dropdown: 100
- sticky header: 200
- modal backdrop: 300
- modal: 400
- toast: 500
