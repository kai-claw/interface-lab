import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useKeyboard } from '../hooks/useKeyboard';

const GRID_SIZE = 20;
const CELL_SIZE = 24;
const GAP = 4;

export default function BreathingGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const animRef = useRef<number>(0);
  const [mode, setMode] = useState<'breathe' | 'ripple' | 'wave'>('breathe');
  const [speed, setSpeed] = useState(1);
  const [hueShift, setHueShift] = useState(0);
  const modeRef = useRef(mode);
  const speedRef = useRef(speed);
  const hueShiftRef = useRef(hueShift);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { hueShiftRef.current = hueShift; }, [hueShift]);
  const reducedMotion = useReducedMotion();
  const reducedRef = useRef(reducedMotion);
  useEffect(() => { reducedRef.current = reducedMotion; }, [reducedMotion]);

  const keyMap = useMemo(() => ({
    'b': () => setMode('breathe'),
    'r': () => setMode('ripple'),
    'w': () => setMode('wave'),
  }), []);
  useKeyboard(keyMap);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const totalSize = GRID_SIZE * (CELL_SIZE + GAP);
    canvas.width = totalSize;
    canvas.height = totalSize;

    let time = 0;
    let lastFrame = 0;

    const hslToString = (h: number, s: number, l: number, a: number) =>
      `hsla(${h}, ${s}%, ${l}%, ${a})`;

    const animate = (now: number) => {
      // Pause when tab is hidden to save battery
      if (document.hidden) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      // Throttle to ~30fps in reduced motion mode (every other frame)
      if (reducedRef.current && now - lastFrame < 33) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrame = now;

      // Throttle time progression when reduced motion is on
      if (!reducedRef.current) {
        time += 0.016 * speedRef.current;
      }
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const x = col * (CELL_SIZE + GAP);
          const y = row * (CELL_SIZE + GAP);
          const cx = x + CELL_SIZE / 2;
          const cy = y + CELL_SIZE / 2;

          // Distance from mouse
          const dx = cx - mx;
          const dy = cy - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const mouseFactor = Math.max(0, 1 - dist / 120);

          let scale: number;
          let hue: number;
          let lightness: number;

          const m = modeRef.current;

          const hs = hueShiftRef.current;

          if (m === 'breathe') {
            const phase = time * 2 + row * 0.3 + col * 0.3;
            scale = 0.4 + Math.sin(phase) * 0.3 + mouseFactor * 0.4;
            hue = 240 + hs + row * 3 + col * 3 + Math.sin(time) * 30;
            lightness = 30 + Math.sin(phase) * 15 + mouseFactor * 25;
          } else if (m === 'ripple') {
            const d = Math.sqrt((row - GRID_SIZE / 2) ** 2 + (col - GRID_SIZE / 2) ** 2);
            const ripple = Math.sin(d * 0.8 - time * 4);
            scale = 0.3 + ripple * 0.3 + mouseFactor * 0.5;
            hue = 280 + hs + d * 10 + time * 30;
            lightness = 25 + ripple * 15 + mouseFactor * 30;
          } else {
            const wave = Math.sin(col * 0.4 + time * 3) * Math.cos(row * 0.4 + time * 2);
            scale = 0.3 + wave * 0.35 + mouseFactor * 0.4;
            hue = 160 + hs + col * 5 + row * 5 + time * 20;
            lightness = 25 + wave * 15 + mouseFactor * 25;
          }

          scale = Math.max(0.1, Math.min(1, scale));
          const size = CELL_SIZE * scale;
          const offset = (CELL_SIZE - size) / 2;
          const radius = Math.min(6, size / 2);

          ctx.fillStyle = hslToString(hue % 360, 70, lightness, 0.8 + mouseFactor * 0.2);
          ctx.beginPath();
          ctx.roundRect(x + offset, y + offset, size, size, radius);
          ctx.fill();

          // Glow effect near mouse
          if (mouseFactor > 0.3) {
            ctx.shadowColor = hslToString(hue % 360, 80, 60, 1);
            ctx.shadowBlur = mouseFactor * 15;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const updateMouse = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: ((clientX - rect.left) / rect.width) * (GRID_SIZE * (CELL_SIZE + GAP)),
      y: ((clientY - rect.top) / rect.height) * (GRID_SIZE * (CELL_SIZE + GAP)),
    };
  }, []);

  const onMove = useCallback((e: React.MouseEvent) => {
    updateMouse(e.clientX, e.clientY);
  }, [updateMouse]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [updateMouse]);

  const onLeave = useCallback(() => {
    mouseRef.current = { x: -999, y: -999 };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <p className="text-[var(--color-text-muted)] text-sm text-center">
        A living grid that breathes and responds to your cursor
      </p>

      <div className="flex gap-2">
        {([
          { mode: 'breathe' as const, emoji: '🫁', label: 'Breathe', key: 'B' },
          { mode: 'ripple' as const, emoji: '💧', label: 'Ripple', key: 'R' },
          { mode: 'wave' as const, emoji: '🌊', label: 'Wave', key: 'W' },
        ]).map(({ mode: m, emoji, label, key }) => (
          <button
            key={m}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-0 flex items-center gap-1.5 transition-all group"
            style={{
              background: mode === m ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
              color: mode === m ? 'white' : 'var(--color-text-muted)',
            }}
            onClick={() => setMode(m)}
          >
            <span>{emoji}</span>
            {label}
            <kbd className="hidden sm:inline text-[10px] opacity-40 group-hover:opacity-70 ml-1 px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.1)' }} aria-hidden="true">{key}</kbd>
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        className="rounded-2xl cursor-crosshair touch-none"
        style={{ width: '100%', maxWidth: 560, aspectRatio: '1' }}
        role="img"
        aria-label={`Breathing grid animation in ${mode} mode. Move cursor or touch to interact.`}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onTouchMove={onTouchMove}
        onTouchEnd={onLeave}
      />
    </div>
  );
}
