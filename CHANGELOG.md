# Changelog

All notable changes to Interface Lab are documented here.

## [1.0.0] — 2026-02-02

### Added
- 🌊 **Ripple Pond** experiment — wave interference simulator with 4 color palettes (ocean, fire, neon, mono), multi-touch, adjustable speed/frequency (Pass 5)
- **Deep linking** — URL hash navigation (`#elastic-cards`) with browser back/forward support (Pass 4)
- **Share button** — native share sheet on supported browsers, clipboard fallback (Pass 4)
- **Fullscreen mode** — F key or toolbar button (Pass 4)
- **Prev/next navigation** — arrow keys + UI buttons with counter (1/9) (Pass 2)
- **Keyboard shortcut hints** — `<kbd>` badges on experiment mode buttons (Pass 2)
- **`prefers-reduced-motion` support** — CursorTrail (fewer points), ParticleButton (fewer particles), BreathingGrid (30fps cap) (Passes 2–3)
- **`document.hidden` pause** — all canvas experiments stop animating when tab is backgrounded (Pass 3)
- **OG image + Twitter Card meta** for social sharing (Pass 4)
- **JSON-LD structured data** (WebApplication schema) (Pass 4)
- **Sitemap** for search engines (Pass 4)
- **MIT LICENSE file** (Pass 2)
- **AUDIT.md** — baseline metrics and issue tracker (Pass 1)
- **ARCHITECTURE.md** — design decisions and file map (Pass 1)
- **CHANGELOG.md** — this file (Pass 6)

### Fixed
- 3 TypeScript errors in test mock (JSX namespace issue) (Pass 1)
- Toast message hardcoded "1–8" now uses dynamic experiment count (Pass 6)

### Removed
- Dead hooks: `useMouse`, `useMouseVelocity`, `useSpringValue` (defined but never imported by experiments) (Pass 5)

### Changed
- Version bumped from 0.0.0 → 1.0.0 (Pass 4)
- README updated to reflect 9 experiments, correct architecture, and current perf numbers (Pass 6)

## [0.0.0] — 2026-02-02

### Added
- Initial gallery with 8 experiments: Elastic Cards, Magnetic Dock, Gravity Menu, Breathing Grid, Kinetic Typography, Cursor Trail, Morphing Tabs, Particle Button
- Gallery shell with lazy-loaded experiments, responsive grid, smooth transitions
- ErrorBoundary per experiment
- Custom hooks: useMouse, useSpring
- 30 tests (metadata, physics, rendering)
- GitHub Pages deployment
