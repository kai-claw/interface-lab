import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  {
    id: 'design',
    label: 'Design',
    icon: '🎨',
    color: '#ec4899',
    content: {
      title: 'Design Systems',
      body: 'Build consistent, scalable interfaces with tokens, components, and patterns that evolve with your product.',
      stats: [
        { label: 'Components', value: '142' },
        { label: 'Tokens', value: '68' },
        { label: 'Patterns', value: '24' },
      ],
    },
  },
  {
    id: 'code',
    label: 'Code',
    icon: '⚡',
    color: '#6366f1',
    content: {
      title: 'Developer Experience',
      body: 'TypeScript-first APIs with intelligent autocomplete, tree-shaking, and zero-config setup for rapid development.',
      stats: [
        { label: 'APIs', value: '89' },
        { label: 'Hooks', value: '36' },
        { label: 'Utils', value: '51' },
      ],
    },
  },
  {
    id: 'motion',
    label: 'Motion',
    icon: '✨',
    color: '#10b981',
    content: {
      title: 'Animation Engine',
      body: 'Spring-physics animations with gesture recognition, layout transitions, and GPU-accelerated transforms.',
      stats: [
        { label: 'Presets', value: '32' },
        { label: 'Easings', value: '18' },
        { label: 'Gestures', value: '12' },
      ],
    },
  },
  {
    id: 'data',
    label: 'Data',
    icon: '📊',
    color: '#f59e0b',
    content: {
      title: 'Data Visualization',
      body: 'From simple charts to complex dashboards — responsive, accessible, and beautiful by default.',
      stats: [
        { label: 'Charts', value: '24' },
        { label: 'Maps', value: '8' },
        { label: 'Tables', value: '6' },
      ],
    },
  },
];

export default function MorphingTabs() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-4">
      <p className="text-[var(--color-text-muted)] text-sm text-center">
        Watch the indicator morph between tabs, and content smoothly transition
      </p>

      {/* Tab Bar */}
      <div className="relative flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {TABS.map((t, i) => (
          <button
            key={t.id}
            className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm cursor-pointer border-0 bg-transparent transition-colors"
            style={{ color: active === i ? 'white' : 'var(--color-text-muted)' }}
            onClick={() => setActive(i)}
          >
            {active === i && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{ background: tab.color, opacity: 0.2 }}
                layoutId="tab-bg"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span>{t.icon}</span>
            <span className="relative">{t.label}</span>
          </button>
        ))}
        <motion.div
          className="absolute bottom-0 h-[3px] rounded-full"
          style={{ background: tab.color }}
          layoutId="tab-indicator"
          animate={{
            left: `${active * 25 + 2}%`,
            width: '21%',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      </div>

      {/* Content Area */}
      <div className="relative w-full max-w-lg min-h-[260px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab.id}
            className="rounded-2xl p-8"
            style={{
              background: `linear-gradient(135deg, ${tab.color}10, ${tab.color}05)`,
              border: `1px solid ${tab.color}30`,
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.span
                className="text-3xl"
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
              >
                {tab.icon}
              </motion.span>
              <motion.h3
                className="text-xl font-bold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                {tab.content.title}
              </motion.h3>
            </div>

            <motion.p
              className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {tab.content.body}
            </motion.p>

            <div className="flex gap-6">
              {tab.content.stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.1 }}
                >
                  <div className="text-2xl font-bold" style={{ color: tab.color }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
