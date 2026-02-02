import { useRef, useState, useCallback } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const ICONS = [
  { emoji: '🏠', label: 'Home' },
  { emoji: '🔍', label: 'Search' },
  { emoji: '💬', label: 'Messages' },
  { emoji: '📁', label: 'Files' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '📷', label: 'Camera' },
  { emoji: '⚙️', label: 'Settings' },
  { emoji: '🎨', label: 'Design' },
  { emoji: '📊', label: 'Analytics' },
];

function DockIcon({ emoji, label, mouseX, index }: {
  emoji: string; label: string; mouseX: ReturnType<typeof useSpring>; index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val: number) => {
    const el = ref.current;
    if (!el) return 200;
    const rect = el.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    return Math.abs(val - center);
  });

  const size = useTransform(distance, [0, 100, 200], [80, 60, 48]);
  const y = useTransform(distance, [0, 100, 200], [-16, -6, 0]);
  const springSize = useSpring(size, { stiffness: 300, damping: 25 });
  const springY = useSpring(y, { stiffness: 300, damping: 25 });

  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col items-center"
      style={{ y: springY }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <motion.div
          className="absolute -top-10 px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap"
          style={{ background: 'rgba(100, 100, 180, 0.9)', color: 'white' }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {label}
        </motion.div>
      )}
      <motion.div
        className="flex items-center justify-center rounded-2xl cursor-pointer select-none"
        style={{
          width: springSize,
          height: springSize,
          background: `linear-gradient(135deg, 
            hsl(${220 + index * 20}, 70%, 55%), 
            hsl(${240 + index * 20}, 80%, 45%))`,
          boxShadow: hovered
            ? '0 8px 30px rgba(100, 100, 255, 0.4)'
            : '0 4px 15px rgba(0,0,0,0.3)',
        }}
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <span style={{ fontSize: `calc(${48}px * 0.5)` }}>{emoji}</span>
      </motion.div>
    </motion.div>
  );
}

export default function MagneticDock() {
  const mouseX = useSpring(0, { stiffness: 300, damping: 30 });
  const dockRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    mouseX.set(e.clientX);
  }, [mouseX]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      mouseX.set(e.touches[0].clientX);
    }
  }, [mouseX]);

  const onLeave = useCallback(() => {
    mouseX.set(-200);
  }, [mouseX]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8" role="region" aria-label="Magnetic Dock — proximity-based icon magnification">
      <div className="text-center space-y-2 mb-8">
        <p className="text-[var(--color-text-muted)] text-sm">
          Hover or drag across the dock icons — they magnify based on proximity
        </p>
      </div>
      <div
        ref={dockRef}
        className="flex items-end gap-2 px-4 py-3 rounded-2xl touch-none"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onTouchMove={onTouchMove}
        onTouchEnd={onLeave}
      >
        {ICONS.map((icon, i) => (
          <DockIcon key={icon.label} {...icon} mouseX={mouseX} index={i} />
        ))}
      </div>
    </div>
  );
}
