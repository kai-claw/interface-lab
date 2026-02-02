import { useState, useEffect, useCallback, useRef } from 'react';

export interface MousePos {
  x: number;
  y: number;
  clientX: number;
  clientY: number;
}

export function useMouse(ref?: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = useState<MousePos>({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const rafRef = useRef<number>(0);
  const latestRef = useRef<MousePos>({ x: 0, y: 0, clientX: 0, clientY: 0 });

  const onMove = useCallback((e: MouseEvent) => {
    const el = ref?.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      latestRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        clientX: e.clientX,
        clientY: e.clientY,
      };
    } else {
      latestRef.current = {
        x: e.clientX,
        y: e.clientY,
        clientX: e.clientX,
        clientY: e.clientY,
      };
    }
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        setPos(latestRef.current);
        rafRef.current = 0;
      });
    }
  }, [ref]);

  useEffect(() => {
    const el = ref?.current ?? window;
    el.addEventListener('mousemove', onMove as EventListener);
    return () => {
      el.removeEventListener('mousemove', onMove as EventListener);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onMove, ref]);

  return pos;
}

export function useMouseVelocity() {
  const [velocity, setVelocity] = useState({ vx: 0, vy: 0, speed: 0 });
  const prev = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = now - prev.current.t;
      if (dt > 0) {
        const vx = (e.clientX - prev.current.x) / dt;
        const vy = (e.clientY - prev.current.y) / dt;
        setVelocity({ vx, vy, speed: Math.sqrt(vx * vx + vy * vy) });
      }
      prev.current = { x: e.clientX, y: e.clientY, t: now };
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return velocity;
}
