# 🧪 Interface Lab

A gallery of novel UI/UX experiments exploring physics, animation, and creative interaction paradigms.

**[Live Demo →](https://kai-claw.github.io/interface-lab/)**

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-purple)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-blue)

## Experiments

| # | Experiment | What it explores |
|---|-----------|------------------|
| 🃏 | **Elastic Cards** | 3D perspective cards that track your cursor with tilt and light glare |
| 🧲 | **Magnetic Dock** | macOS-style dock with proximity-based magnification using spring physics |
| 🪂 | **Gravity Menu** | Menu items that fall with real gravity simulation and bounce into position |
| 🫧 | **Breathing Grid** | A canvas grid that breathes, ripples, and responds to cursor proximity |
| ✍️ | **Kinetic Typography** | Text that waves, scatters, types itself, and glitches with chromatic offset |
| 🎇 | **Cursor Trail** | Beautiful cursor trails — ribbon, dots, fire, and neon glow effects |
| 🔀 | **Morphing Tabs** | Shared-layout sliding indicator with smooth content transitions |
| 💥 | **Particle Button** | Click to trigger particle explosions with gravity and color physics |
| 🌊 | **Ripple Pond** | Click to create waves that propagate, interfere, and form mesmerizing patterns |

## Features

- **Deep linking** — Share direct links to any experiment via URL hash
- **Keyboard navigation** — Keys 1–9 jump to experiments, arrow keys for prev/next, Esc to return, F for fullscreen
- **Share & fullscreen** — Native share sheet (or clipboard fallback) and fullscreen mode
- **Accessibility** — Skip navigation, ARIA labels, `prefers-reduced-motion` support, focus-visible outlines
- **Performance** — `document.hidden` pauses canvas animations when tab is backgrounded, 30fps throttle for heavy renderers
- **Surprise Me** — Random experiment picker on the gallery page

## Tech Stack

- **React 19** — UI framework
- **TypeScript 5.9** — Type safety
- **Framer Motion 12** — Spring physics, layout transitions, gesture handling
- **Tailwind CSS 4** — Styling via `@tailwindcss/vite` plugin with custom theme tokens
- **Canvas 2D** — Custom rendering for particles, grids, trails, and wave simulations
- **Vite 7** — Build tool with per-experiment code splitting
- **Vitest** — 28 tests covering metadata, physics constants, and rendering

## Architecture

Each experiment is self-contained in `src/experiments/` and lazy-loaded via `React.lazy()` for optimal bundle size:

```
src/
├── App.tsx                    # Gallery shell, routing, deep-linking, keyboard nav
├── components/
│   └── ErrorBoundary.tsx     # Per-experiment crash recovery with retry
├── experiments/
│   ├── BreathingGrid.tsx     # Canvas generative art (30fps throttle, visibility pause)
│   ├── CursorTrail.tsx       # Canvas cursor effects (4 modes, reduced motion)
│   ├── ElasticCards.tsx      # 3D perspective + Framer Motion springs
│   ├── GravityMenu.tsx       # Custom rAF physics simulation
│   ├── KineticType.tsx       # Typography animation (4 modes, kbd hints)
│   ├── MagneticDock.tsx      # Spring-based proximity dock
│   ├── MorphingTabs.tsx      # layoutId shared layout animation
│   ├── ParticleButton.tsx    # Particle system (visibility pause, reduced motion)
│   └── RipplePond.tsx        # Wave interference simulator (4 color palettes, touch)
├── hooks/
│   ├── useKeyboard.ts        # Keyboard shortcut registration
│   └── useReducedMotion.ts   # prefers-reduced-motion detection
├── test/
│   ├── setup.ts              # rAF/canvas/matchMedia mocks
│   ├── experiments.test.tsx  # Gallery rendering + navigation tests
│   └── data.test.ts          # Metadata, physics, wave, color math tests
└── index.css                  # Theme tokens, scrollbar, a11y, selection
```

## Build

```bash
npm install
npm run build    # TypeScript check + Vite production build
npm run dev      # Development server with HMR
npm test         # Run 28 tests via Vitest
```

## Performance

| Asset | Size | Gzip |
|-------|------|------|
| Main bundle | 335 KB | 107 KB |
| CSS | 19 KB | 5 KB |
| Per-experiment chunks | 2–6 KB each | 1–3 KB |
| **Total (no experiments loaded)** | **354 KB** | **112 KB** |

- **0 TypeScript errors**
- **28 passing tests**
- **9 experiments**, each code-split and lazy-loaded

## License

MIT — see [LICENSE](LICENSE)
