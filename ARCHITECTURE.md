# ARCHITECTURE — Interface Lab

## Overview

Interface Lab is a gallery of self-contained interactive UI/UX experiments. Each experiment explores a different interaction paradigm — physics simulation, canvas animation, spring dynamics, or layout transitions.

## Key Design Decisions

### Lazy Loading
Every experiment is loaded via `React.lazy()` + `Suspense`. This keeps the initial bundle at ~325KB (main + framer-motion) and loads each experiment on demand (2–5KB each).

### Self-Contained Experiments
Each experiment is a single file in `src/experiments/`. No experiment imports from another. They share only:
- Global CSS theme tokens (via `var(--color-*)`)
- Framer Motion (imported directly)
- Canvas API (native)

### State Architecture
- **App-level**: Gallery vs. experiment view (single `activeId` state)
- **Experiment-level**: Each manages its own state internally
- **No global store**: No Redux/Zustand — each experiment is independent

### Animation Approaches
| Experiment | Engine | Technique |
|-----------|--------|-----------|
| ElasticCards | Framer Motion | `useMotionValue` + `useSpring` + `useTransform` |
| MagneticDock | Framer Motion | Distance-based spring interpolation |
| GravityMenu | Manual rAF | Custom physics loop (gravity + bounce) |
| BreathingGrid | Canvas 2D | Per-frame grid rendering with cursor proximity |
| KineticType | Framer Motion | Per-character animation variants |
| CursorTrail | Canvas 2D | Trail point buffer with mode-specific renderers |
| MorphingTabs | Framer Motion | `layoutId` shared layout animation |
| ParticleButton | Canvas 2D | Particle system with gravity decay |

### Theming
All colors defined as CSS custom properties in `index.css` via Tailwind's `@theme` directive:
- `--color-bg`, `--color-surface`, `--color-border`
- `--color-text`, `--color-text-muted`
- `--color-accent`, `--color-accent-2`, `--color-accent-3`

### Error Handling
- `ErrorBoundary` wraps each experiment individually
- Crash in one experiment doesn't affect others
- Retry button resets error state

### Accessibility Baseline
- Skip navigation link
- ARIA labels on canvas elements
- `prefers-reduced-motion` CSS rule
- Focus-visible outlines
- Keyboard: 1–8 for experiments, Esc to return

## Build Pipeline
```
Vite 7 → TypeScript 5.9 → React 19 + Framer Motion 12 → Tailwind CSS 4
  └── Code splitting per experiment
  └── GitHub Pages deployment via gh-pages
```
