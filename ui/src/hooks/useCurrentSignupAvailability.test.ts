import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useCurrentSignupAvailability } from './useCurrentSignupAvailability';

afterEach(() => {
  vi.useRealTimers();
});

describe('useCurrentSignupAvailability', () => {
  it('removes a full snapshot as soon as its period expires', () => {
    vi.useFakeTimers();
    vi.setSystemTime('2026-09-12T12:00:00Z');
    const { result } = renderHook(() =>
      useCurrentSignupAvailability({
        remaining: 0,
        limit: 100,
        period: 'monthly',
        resetsAt: '2026-09-12T12:00:01Z',
      })
    );

    expect(result.current?.remaining).toBe(0);
    act(() => vi.advanceTimersByTime(1_250));
    expect(result.current).toBeUndefined();
  });
});
