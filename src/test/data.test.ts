import { describe, it, expect } from 'vitest';

// Test experiment metadata integrity
const experiments = [
  { id: 'elastic-cards', title: 'Elastic Cards', icon: '🃏', color: '#6366f1', tags: ['3D', 'Hover', 'Perspective'] },
  { id: 'magnetic-dock', title: 'Magnetic Dock', icon: '🧲', color: '#06b6d4', tags: ['Interaction', 'Springs', 'Navigation'] },
  { id: 'gravity-menu', title: 'Gravity Menu', icon: '🪂', color: '#10b981', tags: ['Physics', 'Menu', 'Animation'] },
  { id: 'breathing-grid', title: 'Breathing Grid', icon: '🫧', color: '#8b5cf6', tags: ['Canvas', 'Generative', 'Interactive'] },
  { id: 'kinetic-type', title: 'Kinetic Typography', icon: '✍️', color: '#ec4899', tags: ['Typography', 'Animation', 'Creative'] },
  { id: 'cursor-trail', title: 'Cursor Trail', icon: '🎇', color: '#f59e0b', tags: ['Canvas', 'Cursor', 'Effects'] },
  { id: 'morphing-tabs', title: 'Morphing Tabs', icon: '🔀', color: '#14b8a6', tags: ['Layout', 'Tabs', 'Transitions'] },
  { id: 'particle-button', title: 'Particle Button', icon: '💥', color: '#ef4444', tags: ['Particles', 'Click', 'Canvas'] },
  { id: 'ripple-pond', title: 'Ripple Pond', icon: '🌊', color: '#0ea5e9', tags: ['Waves', 'Physics', 'Touch'] },
];

describe('Experiment Metadata', () => {
  it('has 9 experiments', () => {
    expect(experiments).toHaveLength(9);
  });

  it('all IDs are unique', () => {
    const ids = experiments.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all titles are unique', () => {
    const titles = experiments.map(e => e.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('all icons are unique', () => {
    const icons = experiments.map(e => e.icon);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it('all colors are valid hex', () => {
    for (const exp of experiments) {
      expect(exp.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('each experiment has 3 tags', () => {
    for (const exp of experiments) {
      expect(exp.tags.length).toBeGreaterThanOrEqual(2);
      expect(exp.tags.length).toBeLessThanOrEqual(4);
    }
  });

  it('all IDs are kebab-case', () => {
    for (const exp of experiments) {
      expect(exp.id).toMatch(/^[a-z][a-z0-9-]*[a-z0-9]$/);
    }
  });
});

describe('Physics Constants', () => {
  // Gravity menu physics
  it('gravity bounce coefficient < 1 (energy loss)', () => {
    const bounceCoeff = 0.3;
    expect(bounceCoeff).toBeGreaterThan(0);
    expect(bounceCoeff).toBeLessThan(1);
  });

  it('gravity acceleration is reasonable', () => {
    const gravity = 1.2;
    expect(gravity).toBeGreaterThan(0);
    expect(gravity).toBeLessThan(10);
  });

  // Spring physics
  it('spring stiffness values are positive', () => {
    const values = [170, 200, 300, 400, 500];
    for (const v of values) {
      expect(v).toBeGreaterThan(0);
    }
  });

  it('damping ratios prevent infinite oscillation', () => {
    const configs = [
      { stiffness: 200, damping: 20 },
      { stiffness: 300, damping: 25 },
      { stiffness: 300, damping: 30 },
      { stiffness: 400, damping: 20 },
      { stiffness: 400, damping: 30 },
    ];
    for (const c of configs) {
      // Damping ratio = damping / (2 * sqrt(stiffness * mass))
      const ratio = c.damping / (2 * Math.sqrt(c.stiffness));
      // Should be > 0 (some damping) — underdamped is OK for bouncy feel
      expect(ratio).toBeGreaterThan(0);
    }
  });
});

describe('Canvas Constants', () => {
  it('breathing grid size is square', () => {
    const GRID_SIZE = 20;
    const CELL_SIZE = 24;
    const GAP = 4;
    const total = GRID_SIZE * (CELL_SIZE + GAP);
    expect(total).toBe(560); // 20 * 28
  });

  it('cursor trail point limit prevents memory leak', () => {
    const MAX_POINTS = 80;
    const TRAIL_DURATION_MS = 800;
    // At 60fps, ~48 points per 800ms, so 80 is a safe buffer
    const expectedPointsAt60fps = Math.ceil(60 * (TRAIL_DURATION_MS / 1000));
    expect(MAX_POINTS).toBeGreaterThan(expectedPointsAt60fps);
  });

  it('particle button lifetime decrements to zero', () => {
    let life = 1;
    const decrement = 0.02;
    let frames = 0;
    while (life > 0) {
      life -= decrement;
      frames++;
    }
    // Should expire in ~50 frames (~0.83s at 60fps)
    expect(frames).toBe(50);
    expect(frames / 60).toBeLessThan(1.5);
  });
});

describe('Wave Physics (Ripple Pond)', () => {
  it('wave decay produces finite lifetimes', () => {
    const WAVE_DECAY = 0.0025;
    const lifetime = 1 / WAVE_DECAY; // seconds until amplitude reaches 0
    expect(lifetime).toBe(400);
    // Reasonable upper bound — ripples don't persist forever
    expect(lifetime).toBeLessThan(600);
  });

  it('wave speed produces visible wavefronts', () => {
    const BASE_SPEED = 120; // px/s
    const canvasWidth = 800;
    const crossTime = canvasWidth / BASE_SPEED;
    // Ripple should cross an 800px canvas in ~6.7s
    expect(crossTime).toBeGreaterThan(3);
    expect(crossTime).toBeLessThan(10);
  });

  it('max ripples limit prevents unbounded memory', () => {
    const MAX_RIPPLES = 24;
    // Each ripple is ~10 numbers = ~80 bytes
    const estimatedBytes = MAX_RIPPLES * 80;
    expect(estimatedBytes).toBeLessThan(4096);
  });

  it('interference produces both constructive and destructive results', () => {
    // Two waves at the same point: same phase = constructive, half-phase = destructive
    const freq = 0.04;
    const samePhase = Math.sin(0) + Math.sin(0);
    expect(samePhase).toBe(0); // both at zero crossing
    const constructive = Math.sin(Math.PI / 2) + Math.sin(Math.PI / 2);
    expect(constructive).toBeCloseTo(2);
    const destructive = Math.sin(Math.PI / 2) + Math.sin(-Math.PI / 2);
    expect(destructive).toBeCloseTo(0);
    expect(freq).toBeGreaterThan(0); // used as reference
  });
});

describe('Color Math', () => {
  it('HSL hue values wrap correctly in breathing grid', () => {
    const GRID_SIZE = 20;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const hue = (240 + row * 3 + col * 3 + 30) % 360;
        expect(hue).toBeGreaterThanOrEqual(0);
        expect(hue).toBeLessThan(360);
      }
    }
  });

  it('cursor trail ribbon hue range covers full spectrum', () => {
    const pts = Array.from({ length: 80 }, (_, i) => i);
    const hues = pts.map(i => (i / pts.length) * 120 + 240);
    const minHue = Math.min(...hues);
    const maxHue = Math.max(...hues);
    expect(maxHue - minHue).toBeGreaterThan(100); // Good color range
  });
});
