import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpringValue } from '../hooks/useSpring';

describe('useSpringValue', () => {
  it('initializes with the given value', () => {
    const { result } = renderHook(() => useSpringValue(100));
    expect(result.current.getValue()).toBe(100);
  });

  it('sets target', () => {
    const { result } = renderHook(() => useSpringValue(0));
    act(() => {
      result.current.setTarget(50);
    });
    expect(result.current.state.current.target).toBe(50);
  });

  it('steps toward target', () => {
    const { result } = renderHook(() => useSpringValue(0, { stiffness: 100, damping: 10, mass: 1 }));
    act(() => {
      result.current.setTarget(100);
    });
    // Step the simulation
    const val = result.current.step(0.016);
    // Should have moved toward target
    expect(val).toBeGreaterThan(0);
    expect(val).toBeLessThan(100);
  });

  it('converges after many steps', () => {
    const { result } = renderHook(() => useSpringValue(0, { stiffness: 300, damping: 30, mass: 1 }));
    act(() => {
      result.current.setTarget(100);
    });
    // Run 500 steps
    for (let i = 0; i < 500; i++) {
      result.current.step(0.016);
    }
    // Should be very close to target
    expect(Math.abs(result.current.getValue() - 100)).toBeLessThan(1);
  });

  it('spring with zero damping oscillates', () => {
    const { result } = renderHook(() => useSpringValue(0, { stiffness: 100, damping: 0, mass: 1 }));
    act(() => {
      result.current.setTarget(100);
    });
    // Run a few steps
    for (let i = 0; i < 100; i++) {
      result.current.step(0.016);
    }
    // With zero damping, it should overshoot
    // (value won't settle at target)
    const val = result.current.getValue();
    // It could be above or below target, but not exactly at it
    expect(Math.abs(val - 100)).toBeGreaterThan(0.01);
  });

  it('custom config overrides defaults', () => {
    const { result } = renderHook(() => useSpringValue(0, { stiffness: 500, damping: 50 }));
    act(() => {
      result.current.setTarget(100);
    });
    // High stiffness = moves faster
    const val = result.current.step(0.016);
    expect(val).toBeGreaterThan(0);
  });
});
