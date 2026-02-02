import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_ITEMS = [
  { label: 'Dashboard', icon: '📊', shortcut: '⌘D' },
  { label: 'Projects', icon: '📁', shortcut: '⌘P' },
  { label: 'Messages', icon: '💬', shortcut: '⌘M', badge: 3 },
  { label: 'Calendar', icon: '📅', shortcut: '⌘K' },
  { label: 'Analytics', icon: '📈', shortcut: '⌘A' },
  { label: 'Settings', icon: '⚙️', shortcut: '⌘,' },
];

interface PhysicsItem {
  y: number;
  vy: number;
  targetY: number;
  settled: boolean;
}

function useGravityAnimation(isOpen: boolean, count: number) {
  const [items, setItems] = useState<PhysicsItem[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      // Initialize items above viewport
      setItems(
        Array.from({ length: count }, (_, i) => ({
          y: -(count - i) * 60 - 100,
          vy: 0,
          targetY: i * 52,
          settled: false,
        }))
      );
    } else {
      setItems([]);
    }
  }, [isOpen, count]);

  useEffect(() => {
    if (!isOpen || items.length === 0) return;

    const animate = () => {
      setItems(prev => {
        let allSettled = true;
        const next = prev.map(item => {
          if (item.settled) return item;

          const gravity = 1.2;
          let vy = item.vy + gravity;
          let y = item.y + vy;

          // Bounce off target
          if (y >= item.targetY) {
            y = item.targetY;
            vy = -vy * 0.3; // Bounce with energy loss
            if (Math.abs(vy) < 1.5) {
              return { ...item, y: item.targetY, vy: 0, settled: true };
            }
          }

          allSettled = false;
          return { ...item, y, vy };
        });

        if (allSettled) {
          cancelAnimationFrame(animRef.current);
        }
        return next;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isOpen, items.length]);

  return items;
}

export default function GravityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const physicsItems = useGravityAnimation(isOpen, MENU_ITEMS.length);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <p className="text-[var(--color-text-muted)] text-sm text-center">
        Open the menu — items fall with gravity and bounce into place
      </p>

      <div className="relative">
        <motion.button
          className="px-8 py-4 rounded-xl font-bold text-white text-lg cursor-pointer border-0"
          style={{
            background: isOpen
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsOpen(!isOpen); setSelected(null); }}
        >
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0 }}
            className="inline-block mr-2"
          >
            {isOpen ? '✕' : '☰'}
          </motion.span>
          {isOpen ? 'Close' : 'Open Menu'}
        </motion.button>

        {/* Dropdown with physics */}
        {isOpen && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-72 overflow-hidden"
            style={{ height: MENU_ITEMS.length * 52 + 16 }}
          >
            <div className="relative p-2 rounded-2xl" style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              {MENU_ITEMS.map((item, i) => {
                const physics = physicsItems[i];
                if (!physics) return null;

                return (
                  <div
                    key={item.label}
                    className="absolute left-2 right-2"
                    style={{ transform: `translateY(${physics.y}px)` }}
                  >
                    <motion.button
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border-0 bg-transparent text-left"
                      style={{
                        color: selected === item.label ? 'white' : 'var(--color-text)',
                        background: selected === item.label ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                      }}
                      whileHover={{ background: 'rgba(255,255,255,0.08)' }}
                      onClick={() => setSelected(item.label)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="flex-1 font-medium text-sm">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-xs text-[var(--color-text-muted)] font-mono">
                        {item.shortcut}
                      </span>
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="text-[var(--color-accent)] text-sm font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Selected: {selected}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
