import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type TypeMode = 'wave' | 'scatter' | 'typewriter' | 'glitch';

const SAMPLE_TEXTS = [
  'Interface Lab',
  'Motion Design',
  'Creative Code',
  'Future UI',
];

const MODE_INFO: Record<TypeMode, { name: string; emoji: string }> = {
  wave: { name: 'Wave', emoji: '🌊' },
  scatter: { name: 'Scatter', emoji: '💥' },
  typewriter: { name: 'Typewriter', emoji: '⌨️' },
  glitch: { name: 'Glitch', emoji: '⚡' },
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

  return (
    <div className="text-center">
      <div className="flex justify-center flex-wrap cursor-pointer" onClick={() => setKey(k => k + 1)}>
        {text.split('').map((char, i) => (
          <motion.span
            key={`${key}-${i}`}
            className="text-5xl md:text-7xl font-black inline-block"
            style={{ color: `hsl(${330 + i * 12}, 80%, 65%)` }}
            initial={{
              x: (Math.random() - 0.5) * 400,
              y: (Math.random() - 0.5) * 300,
              rotate: (Math.random() - 0.5) * 180,
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
        ))}
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

function GlitchText({ text }: { text: string }) {
  const [glitchChars, setGlitchChars] = useState<Record<number, string>>({});
  const glitchPool = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789';

  useEffect(() => {
    const id = setInterval(() => {
      const newGlitch: Record<number, string> = {};
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * text.length);
        newGlitch[idx] = glitchPool[Math.floor(Math.random() * glitchPool.length)];
      }
      setGlitchChars(newGlitch);
      setTimeout(() => setGlitchChars({}), 100);
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
              color: glitchChars[i] ? '#10b981' : 'var(--color-text)',
              transform: glitchChars[i] ? `translateY(${(Math.random() - 0.5) * 4}px)` : 'none',
            }}
          >
            {glitchChars[i] || (char === ' ' ? '\u00A0' : char)}
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

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <p className="text-[var(--color-text-muted)] text-sm text-center">
        Text that moves, glitches, scatters, and types itself
      </p>

      <div className="flex gap-2 flex-wrap justify-center">
        {(Object.keys(MODE_INFO) as TypeMode[]).map(m => (
          <button
            key={m}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-0 flex items-center gap-1.5 transition-all"
            style={{
              background: mode === m ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
              color: mode === m ? 'white' : 'var(--color-text-muted)',
            }}
            onClick={() => setMode(m)}
          >
            <span>{MODE_INFO[m].emoji}</span>
            {MODE_INFO[m].name}
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
