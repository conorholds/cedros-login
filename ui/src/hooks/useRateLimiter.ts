import { useExternalEffect } from './effects';
import { useRef, useCallback, useState } from 'react';

export interface UseRateLimiterOptions {
  /** Maximum number of attempts allowed within the window */
  maxAttempts?: number;
  /** Time window in milliseconds */
  windowMs?: number;
  /**
   * Set to true to enable the 1s countdown interval for displaying
   * time-until-reset in the UI. When false (default), no interval is started,
   * saving resources for callers that don't display a countdown.
   */
  showCountdown?: boolean;
  /** Localized message builder for blocked attempts. */
  rateLimitMessage?: (waitSeconds: number) => string;
}

export interface UseRateLimiterReturn {
  /**
   * Check if an action is allowed. Throws an error if rate limited.
   * Call this before performing the action.
   */
  checkLimit: () => void;
  /**
   * Check if an action is allowed without throwing.
   * Returns true if allowed, false if rate limited.
   */
  isAllowed: () => boolean;
  /**
   * Get remaining attempts in current window
   */
  getRemainingAttempts: () => number;
  /**
   * Get time until rate limit resets (in ms)
   */
  getTimeUntilReset: () => number;
  /**
   * Reset the rate limiter (e.g., after successful action)
   */
  reset: () => void;
}

/**
 * Rate limiting hook to prevent excessive API calls from the client.
 *
 * @param options - Rate limiter configuration
 * @returns Rate limiter functions
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { checkLimit, getRemainingAttempts } = useRateLimiter({
 *     maxAttempts: 5,
 *     windowMs: 60000, // 1 minute
 *   });
 *
 *   const handleLogin = async () => {
 *     try {
 *       checkLimit(); // Throws if rate limited
 *       await login(email, password);
 *     } catch (err) {
 *       if (err.message.includes('Too many attempts')) {
 *         // Show rate limit message
 *       }
 *     }
 *   };
 * }
 * ```
 */
export function useRateLimiter(options: UseRateLimiterOptions = {}): UseRateLimiterReturn {
  const { maxAttempts = 5, windowMs = 60000, showCountdown = false, rateLimitMessage } = options;

  // Store timestamps of recent attempts
  const attemptsRef = useRef<number[]>([]);
  const [hasAttempts, setHasAttempts] = useState(false);
  const [, setTick] = useState(0);

  const bump = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  /**
   * Remove expired attempts from the tracking array (no state update).
   * Safe to call during render for getter functions.
   */
  const cleanupAttemptsArray = useCallback(() => {
    const now = Date.now();
    attemptsRef.current = attemptsRef.current.filter((timestamp) => now - timestamp < windowMs);
  }, [windowMs]);

  /**
   * Remove expired attempts AND update hasAttempts state.
   * Use functional setState to avoid hasAttempts dependency cascade.
   * Only call from event handlers and effects, NOT during render.
   */
  const cleanupExpiredAttempts = useCallback(() => {
    cleanupAttemptsArray();
    // Functional update avoids dependency on hasAttempts
    setHasAttempts((current) => (attemptsRef.current.length === 0 && current ? false : current));
  }, [cleanupAttemptsArray]);

  /**
   * Get the number of remaining attempts
   * Uses cleanupAttemptsArray (no state) so safe to call during render.
   */
  const getRemainingAttempts = useCallback((): number => {
    cleanupAttemptsArray();
    return Math.max(0, maxAttempts - attemptsRef.current.length);
  }, [cleanupAttemptsArray, maxAttempts]);

  /**
   * Get time until rate limit resets
   * Uses cleanupAttemptsArray (no state) so safe to call during render.
   */
  const getTimeUntilReset = useCallback((): number => {
    cleanupAttemptsArray();
    if (attemptsRef.current.length === 0) {
      return 0;
    }
    const oldestAttempt = attemptsRef.current[0];
    const resetTime = oldestAttempt + windowMs;
    return Math.max(0, resetTime - Date.now());
  }, [cleanupAttemptsArray, windowMs]);

  /**
   * Check if an action is allowed without throwing
   * Uses cleanupAttemptsArray (no state) so safe to call during render.
   */
  const isAllowed = useCallback((): boolean => {
    cleanupAttemptsArray();
    return attemptsRef.current.length < maxAttempts;
  }, [cleanupAttemptsArray, maxAttempts]);

  /**
   * Check rate limit and throw if exceeded
   */
  const checkLimit = useCallback((): void => {
    cleanupExpiredAttempts();

    if (attemptsRef.current.length >= maxAttempts) {
      const waitTime = getTimeUntilReset();
      const waitSeconds = Math.ceil(waitTime / 1000);
      throw new Error(
        rateLimitMessage?.(waitSeconds) ??
          `Too many attempts. Please wait ${waitSeconds} second${waitSeconds === 1 ? '' : 's'} before trying again.`
      );
    }

    // Record this attempt
    attemptsRef.current.push(Date.now());
    // Functional update avoids hasAttempts dependency
    setHasAttempts((current) => (current ? current : true));
    bump();
  }, [cleanupExpiredAttempts, maxAttempts, getTimeUntilReset, rateLimitMessage, bump]);

  /**
   * Reset the rate limiter
   */
  const reset = useCallback((): void => {
    attemptsRef.current = [];
    // Functional update avoids hasAttempts dependency
    setHasAttempts((current) => (current ? false : current));
    bump();
  }, [bump]);

  // Only start the 1s interval when the caller opts into countdown display.
  // This avoids a tick firing every second for all callers that don't show a countdown.
  useExternalEffect(() => {
    if (!hasAttempts || !showCountdown) return;
    const intervalId = window.setInterval(() => {
      cleanupExpiredAttempts();
      bump();
    }, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasAttempts, showCountdown, bump, cleanupExpiredAttempts]);

  return {
    checkLimit,
    isAllowed,
    getRemainingAttempts,
    getTimeUntilReset,
    reset,
  };
}
