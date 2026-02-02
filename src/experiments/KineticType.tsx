import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeyboard } from '../hooks/useKeyboard';

/** Generate deterministic-looking scatter offsets from a seed */
function makeScatterOffsets(count: number) {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 400,
    y: (Math.random() - 0.5) * 300,
    rotate: (Math.random() - 0.5) * 180,
  }));
}

type TypeMode = 'wave' | 'scatter' | 'typewriter' | 'glitch';

const SAMPLE_TEXTS = [
  'Interface Lab',
  'Motion Design',
  'Creative Code',
  'Future UI',
];

const MODE_INFO: Record<TypeMode, { name: string; emoji: string; key: string }> = {
  wave: { name: 'Wave', emoji: '🌊', key: 'W' },
  scatter: { name: 'Scatter', emoji: '💥', key: 'S' },
  typewriter: { name: 'Typewriter', emoji: '⌨️', key: 'T' },
  glitch: { name: 'Glitch', emoji: '⚡', key: 'G' },
};

function WaveText({ text }: { text: string }) {
  return (
    <div className="flex justify-center">
      {text.split('').map((char, i) => (
        <motion.span
          key={`${text}-${i}`}
          className="text-5xl md:text-7xl font-black inline-block"
          style={{ color: `hsl(${240 + i * 15}, 80%, 70%)` }}
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.08,
            ease: 'easeInOut',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </div>
  );
}

function ScatterText({ text }: { text: string }) {
  const [key, setKey] = useState(0);
  // Pre-compute random offsets so render stays pure
  const offsets = useRef(makeScatterOffsets(text.length));
  useEffect(() => { offsets.current = makeScatterOffsets(text.length); }, [key, text]);

  return (
    <div className="text-center">
      <div className="flex justify-center flex-wrap cursor-pointer" onClick={() => setKey(k => k + 1)}>
        {text.split('').map((char, i) => {
          const off = offsets.current[i] ?? { x: 0, y: 0, rotate: 0 };
          return (
            <motion.span
              key={`${key}-${i}`}
              className="text-5xl md:text-7xl font-black inline-block"
              style={{ color: `hsl(${330 + i * 12}, 80%, 65%)` }}
              initial={{
                x: off.x,
                y: off.y,
                rotate: off.rotate,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: 0, y: 0, rotate: 0, opacity: 1, scale: 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 12,
                delay: i * 0.05,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          );
        })}
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mt-4">Click to replay</p>
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [shown, setShown] = useState(0);
  const [blinkVisible, setBlinkVisible] = useState(true);

  useEffect(() => {
    setShown(0);
    const id = setInterval(() => {
      setShown(s => {
        if (s >= text.length) {
          clearInterval(id);
          return s;
        }
        return s + 1;
      });
    }, 100);
    return () => clearInterval(id);
  }, [text]);

  useEffect(() => {
    const id = setInterval(() => setBlinkVisible(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex justify-center items-center">
      <span className="text-5xl md:text-7xl font-mono font-bold text-[var(--color-accent)]">
        {text.slice(0, shown)}
      </span>
      <motion.span
        className="text-5xl md:text-7xl font-mono font-bold inline-block w-1 ml-1"
        style={{
          background: 'var(--color-accent)',
          opacity: shown < text.length || blinkVisible ? 1 : 0,
          height: '1.1em',
        }}
      />
    </div>
  );
}

interface GlitchState {
  chars: Record<number, string>;
  offsets: Record<number, number>;
}

function GlitchText({ text }: { text: string }) {
  const [glitch, setGlitch] = useState<GlitchState>({ chars: {}, offsets: {} });
  const glitchPool = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789';

  useEffect(() => {
    const id = setInterval(() => {
      const chars: Record<number, string> = {};
      const offsets: Record<number, number> = {};
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * text.length);
        chars[idx] = glitchPool[Math.floor(Math.random() * glitchPool.length)];
        offsets[idx] = (Math.random() - 0.5) * 4;
      }
      setGlitch({ chars, offsets });
      setTimeout(() => setGlitch({ chars: {}, offsets: {} }), 100);
    }, 300);
    return () => clearInterval(id);
  }, [text]);

  return (
    <div className="flex justify-center relative">
      {/* Offset layers */}
      <div className="absolute" style={{ left: -2, top: -1, opacity: 0.3, color: '#ef4444' }}>
        <span className="text-5xl md:text-7xl font-black">{text}</span>
      </div>
      <div className="absolute" style={{ left: 2, top: 1, opacity: 0.3, color: '#3b82f6' }}>
        <span className="text-5xl md:text-7xl font-black">{text}</span>
      </div>
      {/* Main text */}
      <div className="relative">
        {text.split('').map((char, i) => (
          <span
            key={i}
            className="text-5xl md:text-7xl font-black inline-block"
            style={{
              color: glitch.chars[i] ? '#10b981' : 'var(--color-text)',
              transform: glitch.chars[i] ? `translateY(${glitch.offsets[i] ?? 0}px)` : 'none',
            }}
          >
            {glitch.chars[i] || (char === ' ' ? '\u00A0' : char)}
          </span>
        ))}
      </div>
    </div>
  );
}

const TEXT_COMPONENTS: Record<TypeMode, React.ComponentType<{ text: string }>> = {
  wave: WaveText,
  scatter: ScatterText,
  typewriter: TypewriterText,
  glitch: GlitchText,
};

export default function KineticType() {
  const [mode, setMode] = useState<TypeMode>('wave');
  const [textIndex, setTextIndex] = useState(0);
  const TextComponent = TEXT_COMPONENTS[mode];
  const text = SAMPLE_TEXTS[textIndex];

  const keyMap = useMemo(() => ({
    'w': () => setMode('wave'),
    's': () => setMode('scatter'),
    't': () => setMode('typewriter'),
    'g': () => setMode('glitch'),
    'n': () => setTextIndex(i => (i + 1) % SAMPLE_TEXTS.length),
  }), []);
  useKeyboard(keyMap);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <p className="text-[var(--color-text-muted)] text-sm text-center">
        Text that moves, glitches, scatters, and types itself
      </p>

      <div className="flex gap-2 flex-wrap justify-center">
        {(Object.keys(MODE_INFO) as TypeMode[]).map(m => (
          <button
            key={m}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-0 flex items-center gap-1.5 transition-all group"
            style={{
              background: mode === m ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
              color: mode === m ? 'white' : 'var(--color-text-muted)',
            }}
            onClick={() => setMode(m)}
          >
            <span>{MODE_INFO[m].emoji}</span>
            {MODE_INFO[m].name}
            <kbd className="hidden sm:inline text-[10px] opacity-40 group-hover:opacity-70 ml-1 px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.1)' }} aria-hidden="true">{MODE_INFO[m].key}</kbd>
          </button>
        ))}
      </div>

      <div className="min-h-[120px] flex items-center justify-center w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${textIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TextComponent text={text} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        {SAMPLE_TEXTS.map((t, i) => (
          <button
            key={t}
            className="px-3 py-1.5 rounded-lg text-xs cursor-pointer border-0 transition-all"
            style={{
              background: textIndex === i ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
              color: textIndex === i ? 'var(--color-accent)' : 'var(--color-text-muted)',
              border: textIndex === i ? '1px solid var(--color-accent)' : '1px solid transparent',
            }}
            onClick={() => setTextIndex(i)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
