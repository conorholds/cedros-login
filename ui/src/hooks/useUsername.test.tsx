import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { server } from '../test/mocks/server';
import { CedrosLoginProvider } from '../context/CedrosLoginProvider';
import { useUsername } from './useUsername';
import type { CedrosLoginConfig } from '../types';

const TEST_CONFIG: CedrosLoginConfig = {
  serverUrl: 'http://localhost:8080',
  requestTimeout: 5000,
  retryAttempts: 0,
};

function wrapper({ children }: { children: ReactNode }) {
  return <CedrosLoginProvider config={TEST_CONFIG}>{children}</CedrosLoginProvider>;
}

describe('useUsername', () => {
  afterEach(() => vi.clearAllMocks());

  it('surfaces the real server message when setUsername fails (not "[object Object]")', async () => {
    server.use(
      http.patch('http://localhost:8080/me', () =>
        HttpResponse.json(
          { code: 'VALIDATION_ERROR', message: 'Username already taken' },
          { status: 409 }
        )
      )
    );
    const { result } = renderHook(() => useUsername(), { wrapper });

    let caught: Error | undefined;
    await act(async () => {
      try {
        await result.current.setUsername('taken_name');
      } catch (e) {
        caught = e as Error;
      }
    });

    expect(caught).toBeInstanceOf(Error);
    expect(caught?.message).toBe('Username already taken');
    expect(caught?.message).not.toBe('[object Object]');
    await waitFor(() => expect(result.current.error?.message).toBe('Username already taken'));
  });

  it('resolves and leaves error null on success', async () => {
    server.use(http.patch('http://localhost:8080/me', () => HttpResponse.json({ success: true })));
    const { result } = renderHook(() => useUsername(), { wrapper });

    await act(async () => {
      await result.current.setUsername('swift_falcon_42');
    });

    expect(result.current.error).toBeNull();
  });
});
