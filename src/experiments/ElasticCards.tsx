import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const CARDS = [
  {
    title: 'Neural Networks',
    description: 'Deep learning architectures that mimic biological neural pathways',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    icon: '🧠',
    tags: ['AI', 'Deep Learning'],
  },
  {
    title: 'Quantum Computing',
    description: 'Harnessing quantum mechanics for exponentially faster computation',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0284c7 100%)',
    icon: '⚛️',
    tags: ['Quantum', 'Physics'],
  },
  {
    title: 'Generative Art',
    description: 'Creating visual art through algorithms, noise, and mathematical beauty',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #ef4444 100%)',
    icon: '🎨',
    tags: ['Creative', 'Code'],
  },
  {
    title: 'Edge Computing',
    description: 'Processing data closer to users for ultra-low latency experiences',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    icon: '🌐',
    tags: ['Infrastructure', 'IoT'],
  },
];

function Card3D({ title, description, gradient, icon, tags }: typeof CARDS[0]) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
    stiffness: 200, damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 200, damping: 20,
  });
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), {
    stiffness: 200, damping: 20,
  });
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), {
    stiffness: 200, damping: 20,
  });

  const handleMouse = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className="relative w-64 rounded-2xl p-6 cursor-pointer overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        rotateX,
        rotateY,
        transformPerspective: 800,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.02 }}
    >
      {/* Glare overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([x, y]) =>
              `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.12), transparent 60%)`
          ),
        }}
      />

      {/* Gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: gradient }}
      />

      <div style={{ transform: 'translateZ(30px)' }}>
        <span className="text-3xl mb-3 block">{icon}</span>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4">
          {description}
        </p>
        <div className="flex gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 rounded-md text-xs font-medium"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--color-text-muted)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ElasticCards() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8" role="region" aria-label="Elastic Cards — 3D perspective cards that track your cursor">
      <p className="text-[var(--color-text-muted)] text-sm text-center">
        Hover and tilt the cards — they follow your cursor with 3D perspective and light glare
      </p>
      <div className="flex flex-wrap gap-6 justify-center px-4">
        {CARDS.map(card => (
          <Card3D key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}
