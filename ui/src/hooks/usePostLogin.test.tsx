import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { server } from '../test/mocks/server';
import { CedrosLoginProvider } from '../context/CedrosLoginProvider';
import { usePostLogin } from './usePostLogin';
import type { CedrosLoginConfig } from '../types';

const TEST_CONFIG: CedrosLoginConfig = {
  serverUrl: 'http://localhost:8080',
  requestTimeout: 5000,
  retryAttempts: 0,
};

function wrapper({ children }: { children: ReactNode }) {
  return <CedrosLoginProvider config={TEST_CONFIG}>{children}</CedrosLoginProvider>;
}

describe('usePostLogin', () => {
  afterEach(() => vi.clearAllMocks());

  it('surfaces a friendly message when markWelcomeCompleted hits a server error', async () => {
    server.use(
      http.post('http://localhost:8080/welcome-completed', () =>
        HttpResponse.json({ code: 'INTERNAL_ERROR', message: 'boom' }, { status: 500 })
      )
    );
    const { result } = renderHook(() => usePostLogin(), { wrapper });

    let caught: Error | undefined;
    await act(async () => {
      try {
        await result.current.markWelcomeCompleted();
      } catch (e) {
        caught = e as Error;
      }
    });

    // 500 maps to the SERVER_ERROR friendly message — never "[object Object]".
    expect(caught).toBeInstanceOf(Error);
    expect(caught?.message).toBe('Something went wrong. Please try again later.');
    expect(caught?.message).not.toBe('[object Object]');
    await waitFor(() =>
      expect(result.current.error?.message).toBe('Something went wrong. Please try again later.')
    );
  });

  it('resolves and leaves error null on success', async () => {
    server.use(
      http.post('http://localhost:8080/welcome-completed', () =>
        HttpResponse.json({ success: true })
      )
    );
    const { result } = renderHook(() => usePostLogin(), { wrapper });

    await act(async () => {
      await result.current.markWelcomeCompleted();
    });

    expect(result.current.error).toBeNull();
  });
});
