# AUDIT — Interface Lab

## Baseline (Pre-Iteration)

| Metric | Value |
|--------|-------|
| Source files | 18 |
| Lines of code | 2,358 |
| Experiments | 8 |
| Test files | 3 |
| Tests passing | 30 |
| TS errors | 0 (fixed in pass 1) |
| `as any` | 0 |
| TODO/FIXME/HACK | 0 |
| Build size (main) | 325 KB (105 KB gzip) |
| Build size (experiments) | 2–5 KB each (code-split) |
| CSS | 16 KB (4 KB gzip) |
| Dependencies | 3 runtime (react, react-dom, framer-motion) |
| Version | 0.0.0 |

## Issues Found

### Critical (0)
None.

### High (3)
1. **Unused custom hooks** — `useMouse`, `useMouseVelocity`, `useSpringValue` are exported but never imported by any experiment. Only tested in isolation. Dead code.
2. **No OG image / Twitter Card meta** — `og:image` and `twitter:card` missing from `index.html`. Social sharing will look bare.
3. **Version 0.0.0** — Package version never set.

### Medium (6)
4. **No `prefers-reduced-motion` in canvas experiments** — CSS global rule exists, but BreathingGrid, CursorTrail, and ParticleButton canvas animations ignore it. Users with motion sensitivity will still see animations.
5. **MagneticDock is hover-only** — No touch equivalent for proximity magnification. Mobile users see static icons.
6. **No keyboard controls within experiments** — Gallery has 1-8 shortcuts and Esc, but individual experiments (mode selectors, etc.) don't have dedicated keyboard shortcuts.
7. **BreathingGrid renders 400 cells every frame** — No framerate throttle. On low-power devices this could heat up.
8. **Font loading** — Google Fonts Inter loaded but no `font-display: swap` fallback in `@font-face` (relies on Google's `display=swap` param which is not in the URL).
9. **No LICENSE file** — README mentions MIT but no `LICENSE` file exists.

### Low (4)
10. **No JSON-LD structured data** — Would help with rich search results.
11. **No sitemap.xml** — Single-page app, less important but good practice.
12. **`crossorigin` attribute** — Preconnect to gstatic has bare `crossorigin` (valid but inconsistent style).
13. **Test mock leaks DOM props** — Framer-motion mock passes `whileHover`/`whileTap` warnings to console (cosmetic, tests still pass).

## Architecture Summary

```
src/
├── main.tsx              # Entry point (StrictMode)
├── App.tsx               # Router, gallery grid, experiment viewer (401 LOC)
├── index.css             # Theme tokens, scrollbar, a11y, selection (79 LOC)
├── components/
│   └── ErrorBoundary.tsx # Crash recovery with retry (53 LOC)
├── hooks/
│   ├── useSpring.ts      # Custom spring physics (unused) (39 LOC)
│   └── useMouse.ts       # Mouse position + velocity (unused) (73 LOC)
├── experiments/
│   ├── ElasticCards.tsx   # 3D tilt + glare (135 LOC)
│   ├── MagneticDock.tsx   # Proximity magnification dock (111 LOC)
│   ├── GravityMenu.tsx    # Physics dropdown (178 LOC)
│   ├── BreathingGrid.tsx  # Canvas generative grid (161 LOC)
│   ├── KineticType.tsx    # 4 text animation modes (236 LOC)
│   ├── CursorTrail.tsx    # 4 cursor trail modes (190 LOC)
│   ├── MorphingTabs.tsx   # Shared-layout tabs (174 LOC)
│   └── ParticleButton.tsx # Click-triggered explosions (142 LOC)
└── test/
    ├── setup.ts           # rAF/canvas/matchMedia mocks (60 LOC)
    ├── experiments.test.tsx# App rendering tests (103 LOC)
    ├── data.test.ts       # Metadata + physics constants (144 LOC)
    └── hooks.test.ts      # useSpringValue tests (69 LOC)
```

## Tech Stack
- React 19.2 + ReactDOM 19.2
- Framer Motion 12.29
- Tailwind CSS 4.1 (via @tailwindcss/vite plugin)
- Vite 7.2 + Vitest 4.0
- TypeScript 5.9

## Pass Log

| Pass | Hat | Focus | Changes |
|------|-----|-------|---------|
| 1/10 | White Hat — Data & Facts | Baseline audit | Fixed 3 TS errors in test mock (JSX namespace). Wrote AUDIT.md. 0 errors, 30 tests. |
