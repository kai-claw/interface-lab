import { useRef, useEffect, useState } from 'react';

type TrailMode = 'ribbon' | 'dots' | 'fire' | 'neon';

const MODE_CONFIG: Record<TrailMode, { name: string; emoji: string }> = {
  ribbon: { name: 'Ribbon', emoji: '🎀' },
  dots: { name: 'Dots', emoji: '⚪' },
  fire: { name: 'Fire', emoji: '🔥' },
  neon: { name: 'Neon', emoji: '💜' },
};

interface TrailPoint {
  x: number;
  y: number;
  t: number;
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<TrailPoint[]>([]);
  const animRef = useRef<number>(0);
  const [mode, setMode] = useState<TrailMode>('ribbon');
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
    };
    resize();

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointsRef.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        t: performance.now(),
      });
      if (pointsRef.current.length > 80) {
        pointsRef.current = pointsRef.current.slice(-80);
      }
    };

    canvas.addEventListener('mousemove', onMove);

    const animate = () => {
      const w = canvas.width / 2;
      const h = canvas.height / 2;
      ctx.clearRect(0, 0, w, h);

      const now = performance.now();
      const m = modeRef.current;
      const pts = pointsRef.current.filter(p => now - p.t < 800);
      pointsRef.current = pts;

      if (pts.length < 2) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      if (m === 'ribbon') {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 1; i < pts.length; i++) {
          const age = 1 - (now - pts[i].t) / 800;
          const width = age * 20;
          const hue = (i / pts.length) * 120 + 240;
          ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${age * 0.8})`;
          ctx.lineWidth = Math.max(1, width);
          ctx.beginPath();
          ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
          ctx.lineTo(pts[i].x, pts[i].y);
          ctx.stroke();
        }
      } else if (m === 'dots') {
        for (let i = 0; i < pts.length; i++) {
          const age = 1 - (now - pts[i].t) / 800;
          const size = age * 12;
          const hue = (i / pts.length) * 360;
          ctx.fillStyle = `hsla(${hue}, 90%, 70%, ${age})`;
          ctx.beginPath();
          ctx.arc(pts[i].x, pts[i].y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (m === 'fire') {
        for (let i = 0; i < pts.length; i++) {
          const age = 1 - (now - pts[i].t) / 800;
          const jx = (Math.random() - 0.5) * 10 * (1 - age);
          const jy = -Math.random() * 15 * age;
          const size = age * 16;
          const hue = age > 0.5 ? 50 : 20 - (1 - age) * 20;
          const light = 40 + age * 30;
          ctx.fillStyle = `hsla(${hue}, 100%, ${light}%, ${age * 0.9})`;
          ctx.beginPath();
          ctx.arc(pts[i].x + jx, pts[i].y + jy, size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (m === 'neon') {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Outer glow
        for (let g = 3; g >= 1; g--) {
          ctx.lineWidth = g * 8;
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.05 * (4 - g)})`;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.stroke();
        }
        // Core
        for (let i = 1; i < pts.length; i++) {
          const age = 1 - (now - pts[i].t) / 800;
          ctx.strokeStyle = `hsla(270, 90%, 75%, ${age})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
          ctx.lineTo(pts[i].x, pts[i].y);
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      canvas.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <p className="text-[var(--color-text-muted)] text-sm text-center">
        Move your cursor across the canvas — choose different trail effects
      </p>

      <div className="flex gap-2">
        {(Object.keys(MODE_CONFIG) as TrailMode[]).map(m => (
          <button
            key={m}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-0 flex items-center gap-1.5 transition-all"
            style={{
              background: mode === m ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
              color: mode === m ? 'white' : 'var(--color-text-muted)',
            }}
            onClick={() => setMode(m)}
          >
            <span>{MODE_CONFIG[m].emoji}</span>
            {MODE_CONFIG[m].name}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        className="rounded-2xl cursor-none w-full max-w-2xl"
        style={{
          height: 360,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--color-border)',
        }}
      />
    </div>
  );
}
