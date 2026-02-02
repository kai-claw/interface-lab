import { useRef, useCallback } from 'react';

interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

interface SpringState {
  value: number;
  velocity: number;
  target: number;
}

export function useSpringValue(
  initial: number = 0,
  config: SpringConfig = {}
) {
  const { stiffness = 170, damping = 26, mass = 1 } = config;
  const state = useRef<SpringState>({ value: initial, velocity: 0, target: initial });

  const step = useCallback((dt: number): number => {
    const s = state.current;
    const springForce = -stiffness * (s.value - s.target);
    const dampingForce = -damping * s.velocity;
    const acceleration = (springForce + dampingForce) / mass;
    s.velocity += acceleration * dt;
    s.value += s.velocity * dt;
    return s.value;
  }, [stiffness, damping, mass]);

  const setTarget = useCallback((target: number) => {
    state.current.target = target;
  }, []);

  const getValue = useCallback(() => state.current.value, []);

  return { step, setTarget, getValue, state };
}
