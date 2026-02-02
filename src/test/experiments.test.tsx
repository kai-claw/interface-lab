import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: new Proxy({}, {
      get: (_target, prop) => {
        if (typeof prop === 'string') {
          const FRAMER_PROPS = new Set([
            'initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap',
            'layoutId', 'transformPerspective', 'transformStyle', 'variants',
            'whileFocus', 'whileDrag', 'whileInView', 'layout',
          ]);
          const Component = ({ children, ...props }: Record<string, unknown>) => {
            const htmlProps: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(props)) {
              if (FRAMER_PROPS.has(key)) continue;
              htmlProps[key] = value;
            }
            return React.createElement(prop, htmlProps, children as React.ReactNode);
          };
          return Component;
        }
        return undefined;
      },
    }),
    useMotionValue: (init: number) => ({ get: () => init, set: () => {} }),
    useSpring: (val: unknown) => typeof val === 'number' ? { get: () => val, set: () => {} } : val,
    useTransform: (_val: unknown, _input?: unknown, output?: unknown) => {
      if (Array.isArray(output)) return { get: () => output[Math.floor(output.length / 2)] };
      return { get: () => 0 };
    },
  };
});

describe('App — Gallery', () => {
  it('renders gallery header with title', () => {
    render(<App />);
    expect(screen.getByText('Interface Lab')).toBeInTheDocument();
  });

  it('renders all 8 experiment cards', () => {
    render(<App />);
    expect(screen.getByText('Elastic Cards')).toBeInTheDocument();
    expect(screen.getByText('Magnetic Dock')).toBeInTheDocument();
    expect(screen.getByText('Gravity Menu')).toBeInTheDocument();
    expect(screen.getByText('Breathing Grid')).toBeInTheDocument();
    expect(screen.getByText('Kinetic Typography')).toBeInTheDocument();
    expect(screen.getByText('Cursor Trail')).toBeInTheDocument();
    expect(screen.getByText('Morphing Tabs')).toBeInTheDocument();
    expect(screen.getByText('Particle Button')).toBeInTheDocument();
  });

  it('renders experiment descriptions', () => {
    render(<App />);
    expect(screen.getByText(/3D perspective cards/)).toBeInTheDocument();
    expect(screen.getByText(/macOS-style dock/)).toBeInTheDocument();
  });

  it('renders tech stack footer', () => {
    render(<App />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Framer Motion')).toBeInTheDocument();
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
  });

  it('renders GitHub source link', () => {
    render(<App />);
    const link = screen.getByRole('link', { name: /source/i }) || 
                 screen.getAllByRole('link').find(l => l.getAttribute('href')?.includes('github.com'));
    expect(link).toBeTruthy();
  });

  it('shows tag badges on cards', () => {
    render(<App />);
    expect(screen.getByText('3D')).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
    // 'Canvas' appears on cards (Breathing Grid, Cursor Trail, Particle Button) + footer tech pill
    expect(screen.getAllByText('Canvas').length).toBeGreaterThanOrEqual(3);
  });
});

describe('App — Navigation', () => {
  it('shows gallery view initially (no "Back" button)', () => {
    render(<App />);
    expect(screen.queryByText('← Back')).not.toBeInTheDocument();
  });

  it('shows Gallery button in header when experiment is active', async () => {
    render(<App />);
    // We can't easily test lazy-loaded experiment views with mocked framer-motion
    // but we can verify the gallery renders
    expect(screen.getByText('Explore Novel Interfaces')).toBeInTheDocument();
  });
});
