import { useRef, useEffect, useCallback, useState } from 'react';

interface Ripple {
  x: number;
  y: number;
  birth: number;
  amplitude: number;
  frequency: number;
  speed: number;
  hue: number;
}

const MAX_RIPPLES = 24;
const WAVE_DECAY = 0.0025;
const BASE_SPEED = 120;
const BASE_FREQUENCY = 0.04;

const PALETTES = [
  { name: 'Ocean', hueRange: [190, 260], bg: [8, 12, 22] },
  { name: 'Sunset', hueRange: [0, 60], bg: [20, 8, 8] },
  { name: 'Aurora', hueRange: [100, 200], bg: [6, 14, 10] },
  { name: 'Neon', hueRange: [270, 330], bg: [12, 6, 18] },
] as const;

export default function RipplePond() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [autoMode, setAutoMode] = useState(false);
  const autoTimerRef = useRef(0);
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const palette = PALETTES[paletteIndex];

  const addRipple = useCallback((x: number, y: number) => {
    const ripples = ripplesRef.current;
    const [hMin, hMax] = PALETTES[paletteIndex].hueRange;
    const hue = hMin + Math.random() * (hMax - hMin);
    ripples.push({
      x,
      y,
      birth: performance.now() / 1000,
      amplitude: 1,
      frequency: BASE_FREQUENCY * (0.8 + Math.random() * 0.4),
      speed: BASE_SPEED * (0.9 + Math.random() * 0.2),
      hue,
    });
    if (ripples.length > MAX_RIPPLES) ripples.shift();
  }, [paletteIndex]);

  // Canvas click/touch handler
  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    addRipple(x, y);
  }, [addRipple]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    handleInteraction(e.clientX, e.clientY);
  }, [handleInteraction]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
      handleInteraction(e.touches[i].clientX, e.touches[i].clientY);
    }
  }, [handleInteraction]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleInteraction(e.clientX, e.clientY);
    }
  }, [handleInteraction]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
      handleInteraction(e.touches[i].clientX, e.touches[i].clientY);
    }
  }, [handleInteraction]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= PALETTES.length) {
        e.stopPropagation();
        setPaletteIndex(num - 1);
      }
      if (e.key === 'a' || e.key === 'A') {
        e.stopPropagation();
        setAutoMode(a => !a);
      }
      if (e.key === 'c' || e.key === 'C') {
        e.stopPropagation();
        ripplesRef.current = [];
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Auto-ripple mode
  useEffect(() => {
    if (!autoMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const interval = setInterval(() => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      addRipple(x, y);
    }, reducedMotion.current ? 1500 : 800);
    autoTimerRef.current = interval as unknown as number;
    return () => clearInterval(interval);
  }, [autoMode, addRipple]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
    };

    resize();
    window.addEventListener('resize', resize);

    const [bgR, bgG, bgB] = palette.bg;

    const render = (now: number) => {
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const time = now / 1000;
      const dt = Math.min(time - (lastFrameRef.current || time), 0.05);
      lastFrameRef.current = time;

      // Throttle to ~30fps in reduced motion
      if (reducedMotion.current && dt < 0.03) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const { width, height } = canvas;
      const ripples = ripplesRef.current;

      // Create image data for pixel-level manipulation
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      // Sample every 2nd pixel for performance, then fill
      const step = reducedMotion.current ? 4 : 2;

      for (let py = 0; py < height; py += step) {
        for (let px = 0; px < width; px += step) {
          let totalDisplacement = 0;
          let dominantHue: number = palette.hueRange[0];
          let maxContrib = 0;

          for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            const age = time - r.birth;
            const decay = Math.max(0, r.amplitude - age * WAVE_DECAY);
            if (decay <= 0.01) continue;

            const dx = px - r.x;
            const dy = py - r.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const wavefront = r.speed * age;
            const distFromFront = Math.abs(dist - wavefront);

            // Wave envelope — strongest near wavefront, falls off behind
            const envelope = Math.exp(-distFromFront * 0.008) * decay;
            const phase = (dist - wavefront) * r.frequency;
            const displacement = Math.sin(phase * Math.PI * 2) * envelope;

            totalDisplacement += displacement;

            if (Math.abs(displacement) > maxContrib) {
              maxContrib = Math.abs(displacement);
              dominantHue = r.hue;
            }
          }

          // Map displacement to color
          const intensity = Math.tanh(totalDisplacement * 1.5); // soft clamp [-1, 1]
          const absIntensity = Math.abs(intensity);

          let r: number, g: number, b: number;

          if (absIntensity < 0.02) {
            r = bgR;
            g = bgG;
            b = bgB;
          } else {
            // Convert hue to RGB
            const h = dominantHue / 60;
            const sat = 0.7 + absIntensity * 0.3;
            const light = 0.15 + absIntensity * 0.55;
            const c = (1 - Math.abs(2 * light - 1)) * sat;
            const x = c * (1 - Math.abs((h % 2) - 1));
            const m = light - c / 2;

            let r1 = 0, g1 = 0, b1 = 0;
            if (h < 1) { r1 = c; g1 = x; }
            else if (h < 2) { r1 = x; g1 = c; }
            else if (h < 3) { g1 = c; b1 = x; }
            else if (h < 4) { g1 = x; b1 = c; }
            else if (h < 5) { r1 = x; b1 = c; }
            else { r1 = c; b1 = x; }

            const blend = absIntensity;
            r = Math.round((bgR * (1 - blend) + (r1 + m) * 255 * blend));
            g = Math.round((bgG * (1 - blend) + (g1 + m) * 255 * blend));
            b = Math.round((bgB * (1 - blend) + (b1 + m) * 255 * blend));

            // Bright peaks for constructive interference
            if (intensity > 0.6) {
              const boost = (intensity - 0.6) * 2;
              r = Math.min(255, r + Math.round(boost * 80));
              g = Math.min(255, g + Math.round(boost * 80));
              b = Math.min(255, b + Math.round(boost * 60));
            }
          }

          // Fill the step×step block
          for (let sy = 0; sy < step && py + sy < height; sy++) {
            for (let sx = 0; sx < step && px + sx < width; sx++) {
              const idx = ((py + sy) * width + (px + sx)) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = 255;
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Draw ripple origin markers (small glowing dots)
      for (const r of ripples) {
        const age = time - r.birth;
        const alpha = Math.max(0, 1 - age * 0.3);
        if (alpha <= 0) continue;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${r.hue}, 90%, 75%, ${alpha * 0.7})`;
        ctx.fill();
      }

      // Prune dead ripples
      const pruneThreshold = 1 / WAVE_DECAY;
      ripplesRef.current = ripples.filter(r => time - r.birth < pruneThreshold);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [palette]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <p className="text-[var(--color-text-muted)] text-sm text-center">
        Click or tap to create ripples — drag to paint waves.
        Watch interference patterns form.
      </p>

      <div className="flex gap-2 flex-wrap justify-center">
        {PALETTES.map((p, i) => (
          <button
            key={p.name}
            className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border-0 transition-all"
            style={{
              background: paletteIndex === i
                ? `hsla(${p.hueRange[0]}, 70%, 50%, 0.3)`
                : 'rgba(255,255,255,0.06)',
              color: paletteIndex === i
                ? `hsl(${p.hueRange[0]}, 70%, 70%)`
                : 'var(--color-text-muted)',
              border: paletteIndex === i
                ? `1px solid hsla(${p.hueRange[0]}, 70%, 50%, 0.4)`
                : '1px solid transparent',
            }}
            onClick={() => setPaletteIndex(i)}
          >
            {p.name}
            <kbd className="ml-1.5 text-[10px] opacity-40 font-mono">{i + 1}</kbd>
          </button>
        ))}
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border-0 transition-all"
          style={{
            background: autoMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.06)',
            color: autoMode ? '#818cf8' : 'var(--color-text-muted)',
            border: autoMode ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
          }}
          onClick={() => setAutoMode(a => !a)}
        >
          {autoMode ? '⏸ Auto' : '▶ Auto'}
          <kbd className="ml-1.5 text-[10px] opacity-40 font-mono">A</kbd>
        </button>
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border-0 transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}
          onClick={() => { ripplesRef.current = []; }}
        >
          Clear
          <kbd className="ml-1.5 text-[10px] opacity-40 font-mono">C</kbd>
        </button>
      </div>

      <div
        className="relative w-full flex-1 min-h-[300px] rounded-xl overflow-hidden touch-none"
        style={{
          border: '1px solid var(--color-border)',
          background: `rgb(${palette.bg.join(',')})`,
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          role="img"
          aria-label="Interactive ripple pond — click to create wave interference patterns"
        />
      </div>

      <p className="text-[var(--color-text-muted)] text-xs opacity-50 text-center">
        Ripples interfere constructively (bright peaks) and destructively (dark troughs)
      </p>
    </div>
  );
}
