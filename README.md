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

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — Type safety
- **Framer Motion** — Spring physics animations, layout transitions, gesture handling
- **Tailwind CSS 4** — Styling with custom theme tokens
- **Canvas 2D** — Custom rendering for particles, grids, and trails
- **Zustand** — State management
- **Vite 7** — Build tool with code splitting

## Architecture

Each experiment is self-contained in `src/experiments/` and lazy-loaded for optimal bundle size:

```
src/
├── App.tsx                    # Gallery shell with routing
├── experiments/
│   ├── BreathingGrid.tsx     # Canvas generative art
│   ├── CursorTrail.tsx       # Canvas cursor effects
│   ├── ElasticCards.tsx      # 3D perspective + Framer Motion
│   ├── GravityMenu.tsx       # Custom physics simulation
│   ├── KineticType.tsx       # Typography animation
│   ├── MagneticDock.tsx      # Spring-based dock
│   ├── MorphingTabs.tsx      # Layout animation
│   └── ParticleButton.tsx    # Particle system
├── hooks/
│   ├── useMouse.ts           # Mouse position + velocity tracking
│   └── useSpring.ts          # Custom spring physics
└── index.css                  # Theme tokens + global styles
```

## Build

```bash
npm install
npm run build    # TypeScript check + Vite production build
npm run dev      # Development server with HMR
```

## Performance

- **Main bundle:** 323 KB (104 KB gzip)
- **Per-experiment chunks:** 2-5 KB each (lazy loaded)
- **CSS:** 14 KB (4 KB gzip)
- **0 TypeScript errors**

## License

MIT
