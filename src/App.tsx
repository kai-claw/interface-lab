import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load experiments for code splitting
const experiments = [
  {
    id: 'elastic-cards',
    title: 'Elastic Cards',
    description: '3D perspective cards that track your cursor with tilt and light glare effects',
    icon: '🃏',
    color: '#6366f1',
    tags: ['3D', 'Hover', 'Perspective'],
    component: lazy(() => import('./experiments/ElasticCards')),
  },
  {
    id: 'magnetic-dock',
    title: 'Magnetic Dock',
    description: 'macOS-style dock with proximity-based magnification using spring physics',
    icon: '🧲',
    color: '#06b6d4',
    tags: ['Interaction', 'Springs', 'Navigation'],
    component: lazy(() => import('./experiments/MagneticDock')),
  },
  {
    id: 'gravity-menu',
    title: 'Gravity Menu',
    description: 'Menu items fall with realistic gravity and bounce into position',
    icon: '🪂',
    color: '#10b981',
    tags: ['Physics', 'Menu', 'Animation'],
    component: lazy(() => import('./experiments/GravityMenu')),
  },
  {
    id: 'breathing-grid',
    title: 'Breathing Grid',
    description: 'A living canvas grid that breathes, ripples, and responds to your cursor',
    icon: '🫧',
    color: '#8b5cf6',
    tags: ['Canvas', 'Generative', 'Interactive'],
    component: lazy(() => import('./experiments/BreathingGrid')),
  },
  {
    id: 'kinetic-type',
    title: 'Kinetic Typography',
    description: 'Text that waves, scatters, types itself, and glitches with chromatic offset',
    icon: '✍️',
    color: '#ec4899',
    tags: ['Typography', 'Animation', 'Creative'],
    component: lazy(() => import('./experiments/KineticType')),
  },
  {
    id: 'cursor-trail',
    title: 'Cursor Trail',
    description: 'Beautiful cursor trails — ribbon, dots, fire, and neon glow effects',
    icon: '🎇',
    color: '#f59e0b',
    tags: ['Canvas', 'Cursor', 'Effects'],
    component: lazy(() => import('./experiments/CursorTrail')),
  },
  {
    id: 'morphing-tabs',
    title: 'Morphing Tabs',
    description: 'Tabs with a shared-layout sliding indicator and smooth content transitions',
    icon: '🔀',
    color: '#14b8a6',
    tags: ['Layout', 'Tabs', 'Transitions'],
    component: lazy(() => import('./experiments/MorphingTabs')),
  },
  {
    id: 'particle-button',
    title: 'Particle Button',
    description: 'Click buttons to trigger particle explosions with gravity and color physics',
    icon: '💥',
    color: '#ef4444',
    tags: ['Particles', 'Click', 'Canvas'],
    component: lazy(() => import('./experiments/ParticleButton')),
  },
];

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        className="w-8 h-8 rounded-full border-2 border-t-transparent"
        style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

function ExperimentCard({
  experiment,
  onClick,
  index,
}: {
  experiment: typeof experiments[0];
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.button
      className="relative text-left rounded-2xl p-6 cursor-pointer border-0 w-full overflow-hidden group"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Top accent gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-60 transition-opacity group-hover:opacity-100"
        style={{ background: experiment.color }}
      />

      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${experiment.color}15, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{experiment.icon}</span>
          <h3 className="text-base font-bold text-[var(--color-text)]">
            {experiment.title}
          </h3>
        </div>

        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4">
          {experiment.description}
        </p>

        <div className="flex gap-2 flex-wrap">
          {experiment.tags.map(tag => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-md text-xs font-medium"
              style={{
                background: `${experiment.color}18`,
                color: experiment.color,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

function Header({ onHome, hasActive }: { onHome: () => void; hasActive: boolean }) {
  return (
    <header className="sticky top-0 z-50 px-6 py-4 flex items-center gap-4" style={{
      background: 'rgba(10, 10, 15, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <button
        className="flex items-center gap-3 cursor-pointer border-0 bg-transparent"
        onClick={onHome}
      >
        <span className="text-2xl">🧪</span>
        <h1 className="text-lg font-bold text-[var(--color-text)]">
          Interface Lab
        </h1>
      </button>

      <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline">
        Novel UI/UX Exploration Gallery
      </span>

      <div className="flex-1" />

      {hasActive && (
        <motion.button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-0 transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}
          onClick={onHome}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ background: 'rgba(255,255,255,0.1)' }}
        >
          ← Gallery
        </motion.button>
      )}

      <a
        href="https://github.com/kai-claw/interface-lab"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)', textDecoration: 'none' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        <span className="hidden sm:inline">Source</span>
      </a>
    </header>
  );
}

function GalleryView({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent"
          style={{
            backgroundImage: 'linear-gradient(135deg, #6366f1, #ec4899, #10b981)',
          }}
        >
          Explore Novel Interfaces
        </motion.h2>
        <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto leading-relaxed">
          A collection of interactive UI experiments exploring physics, animation,
          and creative interaction paradigms. Built with React, Framer Motion, and Canvas.
        </p>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {experiments.map((exp, i) => (
          <ExperimentCard
            key={exp.id}
            experiment={exp}
            index={i}
            onClick={() => onSelect(exp.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <motion.div
        className="text-center mt-20 pt-8"
        style={{ borderTop: '1px solid var(--color-border)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-sm text-[var(--color-text-muted)]">
          Built with React · Framer Motion · Canvas · Tailwind CSS
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-2 opacity-60">
          Every experiment is self-contained. Hover, click, and interact.
        </p>
      </motion.div>
    </div>
  );
}

function ExperimentView({
  experiment,
  onBack,
}: {
  experiment: typeof experiments[0];
  onBack: () => void;
}) {
  const Component = experiment.component;

  // Keyboard shortcut: Escape to go back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  return (
    <motion.div
      className="flex flex-col h-[calc(100vh-57px)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="region"
      aria-label={`${experiment.title} experiment`}
    >
      {/* Experiment toolbar */}
      <div className="flex items-center gap-4 px-6 py-3" style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer border-0 transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}
          onClick={onBack}
          aria-label="Back to gallery"
        >
          ← Back
        </button>
        <span className="text-lg" aria-hidden="true">{experiment.icon}</span>
        <h2 className="font-bold text-base">{experiment.title}</h2>
        <div className="flex-1" />
        <kbd className="hidden sm:inline text-xs text-[var(--color-text-muted)] opacity-50" aria-hidden="true">
          Esc to close
        </kbd>
        <div className="flex gap-2 hidden sm:flex">
          {experiment.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-xs"
              style={{ background: `${experiment.color}18`, color: experiment.color }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Experiment content with error boundary */}
      <div className="flex-1 overflow-auto p-6">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Component />
          </Suspense>
        </ErrorBoundary>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeExperiment = activeId
    ? experiments.find(e => e.id === activeId) ?? null
    : null;

  const goHome = useCallback(() => setActiveId(null), []);

  // Keyboard shortcuts for gallery navigation
  useEffect(() => {
    if (activeExperiment) return; // Let ExperimentView handle its own shortcuts

    const onKey = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= experiments.length) {
        e.preventDefault();
        setActiveId(experiments[num - 1].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeExperiment]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Skip navigation link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
        style={{ background: 'var(--color-accent)', color: 'white' }}
      >
        Skip to content
      </a>

      <Header onHome={goHome} hasActive={!!activeId} />

      <main id="main-content">
        <AnimatePresence mode="wait">
          {activeExperiment ? (
            <ExperimentView
              key={activeExperiment.id}
              experiment={activeExperiment}
              onBack={goHome}
            />
          ) : (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <GalleryView onSelect={setActiveId} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
