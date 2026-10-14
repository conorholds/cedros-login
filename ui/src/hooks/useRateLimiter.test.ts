/**
 * Unit tests for useRateLimiter hook
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRateLimiter } from './useRateLimiter';

describe('useRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('default configuration', () => {
    it('should use default maxAttempts of 5', () => {
      const { result } = renderHook(() => useRateLimiter());
      expect(result.current.getRemainingAttempts()).toBe(5);
    });

    it('should allow 5 attempts by default', () => {
      const { result } = renderHook(() => useRateLimiter());

      for (let i = 0; i < 5; i++) {
        act(() => {
          expect(() => result.current.checkLimit()).not.toThrow();
        });
      }
    });

    it('should block on 6th attempt by default', () => {
      const { result } = renderHook(() => useRateLimiter());

      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.checkLimit();
        });
      }

      act(() => {
        expect(() => result.current.checkLimit()).toThrow(/Too many attempts/);
      });
    });
  });

  describe('custom configuration', () => {
    it('should respect custom maxAttempts', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 3 }));

      for (let i = 0; i < 3; i++) {
        act(() => {
          result.current.checkLimit();
        });
      }

      act(() => {
        expect(() => result.current.checkLimit()).toThrow();
      });
    });

    it('should respect custom windowMs', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 2, windowMs: 1000 }));

      // Use up all attempts
      act(() => {
        result.current.checkLimit();
        result.current.checkLimit();
      });

      // Should be blocked
      act(() => {
        expect(() => result.current.checkLimit()).toThrow();
      });

      // Advance time past window
      act(() => {
        vi.advanceTimersByTime(1001);
      });

      // Should be allowed again
      act(() => {
        expect(() => result.current.checkLimit()).not.toThrow();
      });
    });
  });

  describe('getRemainingAttempts', () => {
    it('should return max attempts initially', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 3 }));
      expect(result.current.getRemainingAttempts()).toBe(3);
    });

    it('should decrement after each attempt', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 3 }));

      act(() => {
        result.current.checkLimit();
      });
      expect(result.current.getRemainingAttempts()).toBe(2);

      act(() => {
        result.current.checkLimit();
      });
      expect(result.current.getRemainingAttempts()).toBe(1);
    });

    it('should return 0 when exhausted', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 2 }));

      act(() => {
        result.current.checkLimit();
        result.current.checkLimit();
      });

      expect(result.current.getRemainingAttempts()).toBe(0);
    });

    it('should restore attempts after window expires', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 2, windowMs: 1000 }));

      act(() => {
        result.current.checkLimit();
        result.current.checkLimit();
      });

      expect(result.current.getRemainingAttempts()).toBe(0);

      act(() => {
        vi.advanceTimersByTime(1001);
      });

      expect(result.current.getRemainingAttempts()).toBe(2);
    });

    it('updates rendered countdown values until attempts expire', () => {
      const { result, unmount } = renderHook(() => {
        const limiter = useRateLimiter({ maxAttempts: 1, windowMs: 2000, showCountdown: true });
        return {
          limiter,
          remaining: limiter.getRemainingAttempts(),
          waitMs: limiter.getTimeUntilReset(),
        };
      });

      act(() => result.current.limiter.checkLimit());
      expect(result.current).toMatchObject({ remaining: 0, waitMs: 2000 });

      act(() => vi.advanceTimersByTime(1000));
      expect(result.current).toMatchObject({ remaining: 0, waitMs: 1000 });

      act(() => vi.advanceTimersByTime(1000));
      expect(result.current).toMatchObject({ remaining: 1, waitMs: 0 });
      expect(vi.getTimerCount()).toBe(0);
      unmount();
    });

    it('does not schedule countdown work by default', () => {
      const { result, unmount } = renderHook(() => useRateLimiter());
      act(() => result.current.checkLimit());
      expect(vi.getTimerCount()).toBe(0);
      unmount();
    });

    it('cancels an active countdown when unmounted', () => {
      const { result, unmount } = renderHook(() => useRateLimiter({ showCountdown: true }));
      act(() => result.current.checkLimit());
      expect(vi.getTimerCount()).toBe(1);
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('getTimeUntilReset', () => {
    it('should return 0 with no attempts', () => {
      const { result } = renderHook(() => useRateLimiter({ windowMs: 5000 }));
      expect(result.current.getTimeUntilReset()).toBe(0);
    });

    it('should return time until oldest attempt expires', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 3, windowMs: 5000 }));

      act(() => {
        result.current.checkLimit();
      });

      // Should be close to 5000ms
      const timeUntilReset = result.current.getTimeUntilReset();
      expect(timeUntilReset).toBeLessThanOrEqual(5000);
      expect(timeUntilReset).toBeGreaterThan(4990);
    });

    it('should decrease over time', () => {
      const { result } = renderHook(() => useRateLimiter({ windowMs: 5000 }));

      act(() => {
        result.current.checkLimit();
      });

      const initialTime = result.current.getTimeUntilReset();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      const laterTime = result.current.getTimeUntilReset();
      expect(laterTime).toBeLessThan(initialTime);
      expect(laterTime).toBeLessThanOrEqual(3000);
    });

    it('should return 0 after window expires', () => {
      const { result } = renderHook(() => useRateLimiter({ windowMs: 1000 }));

      act(() => {
        result.current.checkLimit();
      });

      act(() => {
        vi.advanceTimersByTime(1001);
      });

      expect(result.current.getTimeUntilReset()).toBe(0);
    });
  });

  describe('isAllowed', () => {
    it('should return true when under limit', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 3 }));
      expect(result.current.isAllowed()).toBe(true);
    });

    it('should return false when at limit', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 2 }));

      act(() => {
        result.current.checkLimit();
        result.current.checkLimit();
      });

      expect(result.current.isAllowed()).toBe(false);
    });

    it('should return true after window expires', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 1, windowMs: 1000 }));

      act(() => {
        result.current.checkLimit();
      });

      expect(result.current.isAllowed()).toBe(false);

      act(() => {
        vi.advanceTimersByTime(1001);
      });

      expect(result.current.isAllowed()).toBe(true);
    });

    it('should not consume an attempt', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 1 }));

      // Check multiple times
      result.current.isAllowed();
      result.current.isAllowed();
      result.current.isAllowed();

      expect(result.current.getRemainingAttempts()).toBe(1);
    });
  });

  describe('reset', () => {
    it('should clear all attempts', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 3 }));

      act(() => {
        result.current.checkLimit();
        result.current.checkLimit();
        result.current.checkLimit();
      });

      expect(result.current.getRemainingAttempts()).toBe(0);

      act(() => {
        result.current.reset();
      });

      expect(result.current.getRemainingAttempts()).toBe(3);
    });

    it('should allow attempts after reset', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 1 }));

      act(() => {
        result.current.checkLimit();
      });

      act(() => {
        expect(() => result.current.checkLimit()).toThrow();
      });

      act(() => {
        result.current.reset();
      });

      act(() => {
        expect(() => result.current.checkLimit()).not.toThrow();
      });
    });

    it('should reset time until reset to 0', () => {
      const { result } = renderHook(() => useRateLimiter({ windowMs: 5000 }));

      act(() => {
        result.current.checkLimit();
      });

      expect(result.current.getTimeUntilReset()).toBeGreaterThan(0);

      act(() => {
        result.current.reset();
      });

      expect(result.current.getTimeUntilReset()).toBe(0);
    });
  });

  describe('checkLimit error messages', () => {
    it('should include wait time in error message', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 1, windowMs: 30000 }));

      act(() => {
        result.current.checkLimit();
      });

      act(() => {
        expect(() => result.current.checkLimit()).toThrow(/30 seconds/);
      });
    });

    it('should use singular "second" for 1 second', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 1, windowMs: 1000 }));

      act(() => {
        result.current.checkLimit();
      });

      act(() => {
        expect(() => result.current.checkLimit()).toThrow(/1 second before/);
      });
    });

    it('should use plural "seconds" for multiple seconds', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 1, windowMs: 5000 }));

      act(() => {
        result.current.checkLimit();
      });

      act(() => {
        expect(() => result.current.checkLimit()).toThrow(/seconds before/);
      });
    });
  });

  describe('sliding window behavior', () => {
    it('should allow new attempts as old ones expire', () => {
      const { result } = renderHook(() => useRateLimiter({ maxAttempts: 2, windowMs: 1000 }));

      // First attempt at t=0
      act(() => {
        result.current.checkLimit();
      });

      // Second attempt at t=500
      act(() => {
        vi.advanceTimersByTime(500);
        result.current.checkLimit();
      });

      // Should be blocked at t=500
      expect(result.current.isAllowed()).toBe(false);

      // At t=1001, first attempt expires
      act(() => {
        vi.advanceTimersByTime(501);
      });

      // Should be allowed (only 1 attempt in window now)
      expect(result.current.isAllowed()).toBe(true);
      expect(result.current.getRemainingAttempts()).toBe(1);
    });
  });
});
