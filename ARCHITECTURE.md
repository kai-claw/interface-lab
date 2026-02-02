# ARCHITECTURE — Interface Lab

## Overview

Interface Lab is a gallery of self-contained interactive UI/UX experiments. Each experiment explores a different interaction paradigm — physics simulation, canvas animation, spring dynamics, wave interference, or layout transitions.

## Key Design Decisions

### Lazy Loading
Every experiment is loaded via `React.lazy()` + `Suspense`. This keeps the initial bundle at ~335KB (main + framer-motion) and loads each experiment on demand (2–6KB each).

### Self-Contained Experiments
Each experiment is a single file in `src/experiments/`. No experiment imports from another. They share only:
- Global CSS theme tokens (via `var(--color-*)`)
- Framer Motion (imported directly)
- Canvas API (native)

### State Architecture
- **App-level**: Gallery vs. experiment view (single `activeId` state), deep-linked via URL hash
- **Experiment-level**: Each manages its own state internally
- **No global store**: No Redux/Zustand — each experiment is independent

### Navigation
- **Gallery**: Number keys 1–9 jump to experiments, "Surprise Me" random picker
- **Experiment view**: ← → arrows (keyboard + UI), Esc to return, F for fullscreen
- **Deep linking**: URL hash (`#elastic-cards`) syncs with browser history (back/forward)
- **Share**: Native share sheet on supported browsers, clipboard fallback

### Animation Approaches
| Experiment | Engine | Technique |
|-----------|--------|-----------|
| ElasticCards | Framer Motion | `useMotionValue` + `useSpring` + `useTransform` |
| MagneticDock | Framer Motion | Distance-based spring interpolation |
| GravityMenu | Manual rAF | Custom physics loop (gravity + bounce) |
| BreathingGrid | Canvas 2D | Per-frame grid rendering with cursor proximity (30fps throttle) |
| KineticType | Framer Motion | Per-character animation variants (4 modes) |
| CursorTrail | Canvas 2D | Trail point buffer with mode-specific renderers (4 modes) |
| MorphingTabs | Framer Motion | `layoutId` shared layout animation |
| ParticleButton | Canvas 2D | Particle system with gravity decay |
| RipplePond | Canvas 2D | Wave equation with interference, 4 color palettes, touch support |

### Performance Optimizations
- **`document.hidden` pause**: All 3 canvas experiments (BreathingGrid, CursorTrail, ParticleButton) stop their animation loops when the tab is backgrounded, saving CPU/battery
- **30fps throttle**: BreathingGrid caps at 30fps in reduced motion mode
- **Reduced motion**: CursorTrail uses fewer trail points, ParticleButton reduces particle count
- **Code splitting**: Each experiment is a separate chunk, loaded only when navigated to

### Theming
All colors defined as CSS custom properties in `index.css` via Tailwind's `@theme` directive:
- `--color-bg`, `--color-surface`, `--color-border`
- `--color-text`, `--color-text-muted`
- `--color-accent`, `--color-accent-2`, `--color-accent-3`

### Error Handling
- `ErrorBoundary` wraps each experiment individually
- Crash in one experiment doesn't affect others
- Retry button resets error state

### Accessibility
- Skip navigation link
- ARIA labels on canvas elements and experiment regions
- `prefers-reduced-motion` support (CSS + runtime detection via `useReducedMotion` hook)
- Focus-visible outlines
- Keyboard: 1–9 for experiments, ← → for navigation, Esc to return, F for fullscreen

## File Map

```
src/
├── main.tsx              # Entry point (StrictMode)
├── App.tsx               # Gallery, routing, deep-linking, keyboard nav, share, fullscreen (~500 LOC)
├── index.css             # Theme tokens, scrollbar, a11y, selection (79 LOC)
├── components/
│   └── ErrorBoundary.tsx # Crash recovery with retry (53 LOC)
├── experiments/
│   ├── ElasticCards.tsx   # 3D tilt + glare (135 LOC)
│   ├── MagneticDock.tsx   # Proximity magnification dock (111 LOC)
│   ├── GravityMenu.tsx    # Physics dropdown (178 LOC)
│   ├── BreathingGrid.tsx  # Canvas generative grid (161 LOC, 30fps throttle, visibility pause)
│   ├── KineticType.tsx    # 4 text animation modes (236 LOC, kbd hints)
│   ├── CursorTrail.tsx    # 4 cursor trail modes (190 LOC, reduced motion, visibility pause)
│   ├── MorphingTabs.tsx   # Shared-layout tabs (174 LOC)
│   ├── ParticleButton.tsx # Click-triggered explosions (142 LOC, visibility pause, reduced motion)
│   └── RipplePond.tsx     # Wave interference simulator (250 LOC, 4 palettes, touch)
├── hooks/
│   ├── useKeyboard.ts    # Keyboard shortcut registration
│   └── useReducedMotion.ts # prefers-reduced-motion media query hook
└── test/
    ├── setup.ts           # rAF/canvas/matchMedia mocks (60 LOC)
    ├── experiments.test.tsx# App rendering + navigation tests (8 tests)
    └── data.test.ts       # Metadata, physics, wave, color math tests (20 tests)
```

## Tech Stack
- React 19.2 + ReactDOM 19.2
- Framer Motion 12.29
- Tailwind CSS 4.1 (via @tailwindcss/vite plugin)
- Vite 7.2 + Vitest 4.0
- TypeScript 5.9

## Build Pipeline
```
Vite 7 → TypeScript 5.9 → React 19 + Framer Motion 12 → Tailwind CSS 4
  └── Code splitting per experiment (React.lazy)
  └── GitHub Pages deployment via gh-pages
```
