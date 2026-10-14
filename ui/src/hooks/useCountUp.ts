import { useRef, useState } from 'react';
import { useExternalEffect } from './effects';

/** True when the user has asked the OS to minimize non-essential motion. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Animates a number from its previously settled value (0 on mount) toward
 * `target`, easing out over `durationMs`.
 *
 * Inputs: `target` must be finite; `durationMs` > 0. Returns the value to
 * display this frame; it always settles on exactly `target`.
 *
 * Snaps straight to `target` (no animation) when the user prefers reduced
 * motion, when requestAnimationFrame is unavailable, when `durationMs` <= 0,
 * or when `target` is not finite.
 */
export function useCountUp(target: number, durationMs = 900): number {
  const [display, setDisplay] = useState(0);
  const settledRef = useRef(0);

  useExternalEffect(() => {
    if (
      !Number.isFinite(target) ||
      durationMs <= 0 ||
      prefersReducedMotion() ||
      typeof window === 'undefined' ||
      typeof window.requestAnimationFrame !== 'function'
    ) {
      settledRef.current = target;
      setDisplay(target);
      return;
    }

    const from = settledRef.current;
    if (from === target) {
      setDisplay(target);
      return;
    }

    let frame = 0;
    let startedAt: number | null = null;

    const step = (now: number) => {
      startedAt ??= now;
      const progress = Math.min((now - startedAt) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = progress < 1 ? from + (target - from) * eased : target;
      settledRef.current = value;
      setDisplay(value);
      if (progress < 1) {
        frame = window.requestAnimationFrame(step);
      }
    };

    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return display;
}
