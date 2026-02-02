import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

const COLORS = ['#6366f1', '#818cf8', '#ec4899', '#f472b6', '#10b981', '#34d399', '#f59e0b', '#fbbf24'];

function ParticleCanvas({ particles }: { particles: Particle[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    particlesRef.current = [...particlesRef.current, ...particles];
  }, [particles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const animate = () => {
      // Pause when tab is hidden to save battery
      if (document.hidden) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.life -= 0.02;
        p.vx *= 0.99;

        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

const BUTTON_STYLES = [
  { label: 'Explode', gradient: 'linear-gradient(135deg, #6366f1, #ec4899)', count: 40 },
  { label: 'Sparkle', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', count: 25 },
  { label: 'Confetti', gradient: 'linear-gradient(135deg, #10b981, #06b6d4)', count: 50 },
];

export default function ParticleButton() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [clicks, setClicks] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const spawnParticles = useCallback((e: React.MouseEvent, count: number) => {
    // Reduce particle count for reduced motion preference
    const actualCount = reducedMotion ? Math.min(count, 10) : count;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cx = ((e.clientX - rect.left) / rect.width) * 600;
    const cy = ((e.clientY - rect.top) / rect.height) * 400;

    const newParticles: Particle[] = Array.from({ length: actualCount }, (_, i) => {
      const angle = (Math.PI * 2 * i) / actualCount + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 6;
      return {
        id: Date.now() + i + Math.random(),
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 3 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
      };
    });

    setParticles(newParticles);
    setClicks(c => c + 1);
  }, [reducedMotion]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <p className="text-[var(--color-text-muted)] text-sm text-center">
        Click the buttons to trigger particle explosions
      </p>

      <div
        ref={containerRef}
        className="relative flex items-center justify-center gap-6 w-full max-w-lg h-64"
      >
        <ParticleCanvas particles={particles} />
        {BUTTON_STYLES.map(({ label, gradient, count }) => (
          <motion.button
            key={label}
            className="relative z-10 px-8 py-4 rounded-xl font-bold text-white text-lg cursor-pointer border-0"
            style={{ background: gradient, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(100,100,255,0.4)' }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => spawnParticles(e, count)}
          >
            {label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={clicks}
          className="text-[var(--color-text-muted)] text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {clicks > 0 ? `${clicks} explosion${clicks > 1 ? 's' : ''} triggered` : 'Go ahead, click something'}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
