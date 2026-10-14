import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { AnimatedNumber } from './AnimatedNumber';

type FrameCallback = (time: number) => void;

let frameQueue: FrameCallback[] = [];
let originalRaf: typeof window.requestAnimationFrame;
let originalCancelRaf: typeof window.cancelAnimationFrame;
let originalMatchMedia: typeof window.matchMedia;

function flushFrames(time: number) {
  const callbacks = frameQueue;
  frameQueue = [];
  act(() => {
    for (const callback of callbacks) callback(time);
  });
}

function stubMatchMedia(reducedMotion: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reducedMotion && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

describe('AnimatedNumber', () => {
  beforeEach(() => {
    originalRaf = window.requestAnimationFrame;
    originalCancelRaf = window.cancelAnimationFrame;
    originalMatchMedia = window.matchMedia;
    frameQueue = [];
    window.requestAnimationFrame = ((callback: FrameCallback) => {
      frameQueue.push(callback);
      return frameQueue.length;
    }) as typeof window.requestAnimationFrame;
    window.cancelAnimationFrame = vi.fn();
    stubMatchMedia(false);
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRaf;
    window.cancelAnimationFrame = originalCancelRaf;
    window.matchMedia = originalMatchMedia;
  });

  it('counts up and settles on the exact final value', () => {
    render(<AnimatedNumber value={120} duration={900} />);
    // First frame establishes the start time; value is still at 0.
    flushFrames(0);
    expect(screen.getByText('0')).toBeInTheDocument();
    // Halfway: strictly between start and target.
    flushFrames(450);
    const midway = Number(screen.getByText(/^\d+$/).textContent);
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(120);
    // Past the duration: settles exactly on the target.
    flushFrames(2000);
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(frameQueue).toHaveLength(0);
  });

  it('renders the final value immediately when reduced motion is preferred', () => {
    stubMatchMedia(true);
    render(<AnimatedNumber value={120} />);
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(frameQueue).toHaveLength(0);
  });

  it('preserves custom formatting on the settled value', () => {
    render(<AnimatedNumber value={0.42} format={(value) => `${Math.round(value * 100)}%`} />);
    flushFrames(0);
    flushFrames(5000);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });
});
