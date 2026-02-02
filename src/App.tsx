import { useState, useCallback, useEffect, lazy, Suspense, useRef } from 'react';
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
  {
    id: 'ripple-pond',
    title: 'Ripple Pond',
    description: 'Click to create waves that propagate, interfere, and form mesmerizing patterns',
    icon: '🌊',
    color: '#0ea5e9',
    tags: ['Waves', 'Physics', 'Touch'],
    component: lazy(() => import('./experiments/RipplePond')),
  },
];

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{ background: `hsl(${240 + i * 25}, 80%, 65%)` }}
            animate={{
              y: [0, -12, 0],
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <motion.p
        className="text-xs text-[var(--color-text-muted)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Loading experiment…
      </motion.p>
    </div>
  );
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 left-1/2 z-[100] px-5 py-3 rounded-xl text-sm font-medium pointer-events-none"
          style={{
            background: 'rgba(99, 102, 241, 0.95)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
          }}
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 10, x: '-50%' }}
          transition={{ duration: 0.25 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function useToast() {
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, duration = 2000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, visible: true });
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), duration);
  }, []);

  return { toast, show };
}

function ShareButton({ experimentId, color }: { experimentId: string; color: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${experimentId}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Interface Lab', url });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <motion.button
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm cursor-pointer border-0 transition-colors"
      style={{
        background: copied ? `${color}30` : 'rgba(255,255,255,0.06)',
        color: copied ? color : 'var(--color-text-muted)',
      }}
      onClick={handleShare}
      aria-label="Share this experiment"
      whileHover={{ background: 'rgba(255,255,255,0.12)' }}
      whileTap={{ scale: 0.95 }}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </>
      )}
    </motion.button>
  );
}

function FullscreenButton() {
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen not supported
    }
  };

  return (
    <motion.button
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm cursor-pointer border-0 transition-colors"
      style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}
      onClick={toggle}
      aria-label={isFs ? 'Exit fullscreen' : 'Enter fullscreen'}
      whileHover={{ background: 'rgba(255,255,255,0.12)' }}
      whileTap={{ scale: 0.95 }}
      title={isFs ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
    >
      {isFs ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
          <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      )}
    </motion.button>
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
      whileHover={{ scale: 1.04, y: -6 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      {/* Top accent gradient — thicker, more visible */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 opacity-50 transition-all duration-300 group-hover:opacity-100 group-hover:h-2"
        style={{ background: `linear-gradient(90deg, ${experiment.color}, ${experiment.color}cc)` }}
      />

      {/* Glow on hover — stronger, warmer */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% -20%, ${experiment.color}25, transparent 70%)`,
          boxShadow: `0 0 40px ${experiment.color}10`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{experiment.icon}</span>
          <h3 className="text-base font-bold text-[var(--color-text)] flex-1">
            {experiment.title}
          </h3>
          <kbd
            className="text-[10px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-40 transition-opacity"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--color-text-muted)' }}
            aria-hidden="true"
          >
            {index + 1}
          </kbd>
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

function AmbientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {[
        { color: '#6366f1', x: '15%', y: '20%', size: 300, delay: 0 },
        { color: '#ec4899', x: '80%', y: '30%', size: 250, delay: 2 },
        { color: '#10b981', x: '50%', y: '70%', size: 200, delay: 4 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}12, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            delay: orb.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function GalleryView({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="relative max-w-6xl mx-auto px-6 py-12">
      <AmbientOrbs />

      {/* Hero */}
      <motion.div
        className="relative text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent shimmer-text"
          style={{
            backgroundImage: 'linear-gradient(135deg, #6366f1, #ec4899, #10b981, #6366f1)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          Explore Novel Interfaces
        </motion.h2>
        <motion.p
          className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          A collection of interactive UI experiments exploring physics, animation,
          and creative interaction paradigms. Built with React, Framer Motion, and Canvas.
        </motion.p>
      </motion.div>

      {/* Surprise Me */}
      <motion.div
        className="relative flex justify-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer border-0"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.15))',
            color: 'var(--color-text)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
          whileHover={{
            scale: 1.05,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(236,72,153,0.25))',
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const randomIndex = Math.floor(Math.random() * experiments.length);
            onSelect(experiments[randomIndex].id);
          }}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🎲
          </motion.span>
          Surprise Me
        </motion.button>
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
        className="relative text-center mt-20 pt-8"
        style={{ borderTop: '1px solid var(--color-border)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          {['React', 'Framer Motion', 'Canvas', 'Tailwind CSS'].map((tech, i) => (
            <motion.span
              key={tech}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-muted)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              whileHover={{ background: 'rgba(255,255,255,0.08)', scale: 1.05 }}
            >
              {tech}
            </motion.span>
          ))}
        </div>
        <p className="text-xs text-[var(--color-text-muted)] opacity-60">
          {experiments.length} self-contained experiments · Hover, click, and interact
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-2 opacity-40">
          Use keys 1–{experiments.length} to jump to any experiment
        </p>
      </motion.div>
    </div>
  );
}

function ExperimentView({
  experiment,
  experimentIndex,
  onBack,
  onNavigate,
}: {
  experiment: typeof experiments[0];
  experimentIndex: number;
  onBack: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}) {
  const Component = experiment.component;
  const hasPrev = experimentIndex > 0;
  const hasNext = experimentIndex < experiments.length - 1;
  const prevExp = hasPrev ? experiments[experimentIndex - 1] : null;
  const nextExp = hasNext ? experiments[experimentIndex + 1] : null;

  // Keyboard shortcuts: Escape to go back, arrow keys for prev/next, F for fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate('prev');
      if (e.key === 'ArrowRight' && hasNext) onNavigate('next');
      if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack, onNavigate, hasPrev, hasNext]);

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
      <motion.div
        className="flex items-center gap-3 px-4 sm:px-6 py-3"
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <motion.button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer border-0 transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}
          onClick={onBack}
          aria-label="Back to gallery"
          whileHover={{ background: 'rgba(255,255,255,0.12)', x: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>

        {/* Prev/Next navigation */}
        <div className="flex items-center gap-1">
          <motion.button
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm cursor-pointer border-0 transition-colors disabled:opacity-25 disabled:cursor-default"
            style={{ background: hasPrev ? 'rgba(255,255,255,0.06)' : 'transparent', color: 'var(--color-text-muted)' }}
            onClick={() => hasPrev && onNavigate('prev')}
            disabled={!hasPrev}
            aria-label={prevExp ? `Previous: ${prevExp.title}` : 'No previous experiment'}
            whileHover={hasPrev ? { background: 'rgba(255,255,255,0.12)' } : {}}
            whileTap={hasPrev ? { scale: 0.95 } : {}}
            title={prevExp ? prevExp.title : undefined}
          >
            ‹
          </motion.button>
          <span className="text-xs text-[var(--color-text-muted)] opacity-50 tabular-nums min-w-[3ch] text-center">
            {experimentIndex + 1}/{experiments.length}
          </span>
          <motion.button
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm cursor-pointer border-0 transition-colors disabled:opacity-25 disabled:cursor-default"
            style={{ background: hasNext ? 'rgba(255,255,255,0.06)' : 'transparent', color: 'var(--color-text-muted)' }}
            onClick={() => hasNext && onNavigate('next')}
            disabled={!hasNext}
            aria-label={nextExp ? `Next: ${nextExp.title}` : 'No next experiment'}
            whileHover={hasNext ? { background: 'rgba(255,255,255,0.12)' } : {}}
            whileTap={hasNext ? { scale: 0.95 } : {}}
            title={nextExp ? nextExp.title : undefined}
          >
            ›
          </motion.button>
        </div>

        <motion.span
          className="text-lg"
          aria-hidden="true"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
        >
          {experiment.icon}
        </motion.span>
        <motion.h2
          className="font-bold text-base"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          {experiment.title}
        </motion.h2>
        <div className="flex-1" />
        <div className="hidden sm:flex items-center gap-2">
          <ShareButton experimentId={experiment.id} color={experiment.color} />
          <FullscreenButton />
        </div>
        <kbd className="hidden lg:inline text-xs text-[var(--color-text-muted)] opacity-50" aria-hidden="true">
          ← → navigate · F fullscreen · Esc close
        </kbd>
        <div className="hidden sm:flex gap-2">
          {experiment.tags.map((tag, i) => (
            <motion.span
              key={tag}
              className="px-2 py-0.5 rounded text-xs"
              style={{ background: `${experiment.color}18`, color: experiment.color }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </motion.div>

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

// Read experiment ID from URL hash
function getHashExperiment(): string | null {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  return experiments.find(e => e.id === hash) ? hash : null;
}

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(getHashExperiment);
  const { toast, show: showToast } = useToast();
  const hasShownWelcome = useRef(false);

  // Sync URL hash → state (handle browser back/forward)
  useEffect(() => {
    const onHashChange = () => {
      const id = getHashExperiment();
      setActiveId(id);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Sync state → URL hash
  useEffect(() => {
    const newHash = activeId ? `#${activeId}` : '';
    if (window.location.hash !== newHash) {
      if (activeId) {
        window.history.pushState(null, '', newHash);
      } else {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
  }, [activeId]);

  // Welcome toast on first visit
  useEffect(() => {
    if (hasShownWelcome.current) return;
    hasShownWelcome.current = true;
    if (!activeId) {
      const timer = setTimeout(() => showToast('Try pressing 1–8 to jump to experiments ✨', 3000), 1500);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeIndex = activeId
    ? experiments.findIndex(e => e.id === activeId)
    : -1;
  const activeExperiment = activeIndex >= 0 ? experiments[activeIndex] : null;

  const goHome = useCallback(() => setActiveId(null), []);

  const navigateExperiment = useCallback((direction: 'prev' | 'next') => {
    setActiveId(prev => {
      const idx = experiments.findIndex(e => e.id === prev);
      if (idx < 0) return prev;
      const next = direction === 'prev' ? idx - 1 : idx + 1;
      if (next < 0 || next >= experiments.length) return prev;
      return experiments[next].id;
    });
  }, []);

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
              experimentIndex={activeIndex}
              onBack={goHome}
              onNavigate={navigateExperiment}
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

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
