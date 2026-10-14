import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAuthSession } from './useAuthSession';

const destroyMock = vi.fn();
const clearMock = vi.fn();
const getAccessTokenMock = vi.fn();
const getRefreshTokenMock = vi.fn();
let sessionExpiredCallback: (() => void) | null = null;

vi.mock('../utils/tokenManager', () => ({
  TokenManager: vi.fn().mockImplementation(function TokenManagerMock() {
    return {
      setRefreshCallback: vi.fn(),
      setSessionExpiredCallback: vi.fn((callback: () => void) => {
        sessionExpiredCallback = callback;
      }),
      setTokens: vi.fn(),
      getRefreshToken: getRefreshTokenMock,
      getAccessToken: getAccessTokenMock,
      clear: clearMock,
      destroy: destroyMock,
    };
  }),
}));

vi.mock('../utils/tabSync', () => ({
  TabSync: vi.fn().mockImplementation(function TabSyncMock() {
    return {
      setCallback: vi.fn(),
      broadcastLogin: vi.fn(),
      broadcastLogout: vi.fn(),
      broadcastRefresh: vi.fn(),
      close: vi.fn(),
    };
  }),
}));

describe('useAuthSession', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    destroyMock.mockClear();
    clearMock.mockClear();
    getAccessTokenMock.mockReset();
    getAccessTokenMock.mockReturnValue(null);
    getRefreshTokenMock.mockReset();
    getRefreshTokenMock.mockReturnValue(null);
    sessionExpiredCallback = null;
    document.cookie = '';
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('destroys the token manager on unmount', () => {
    const { unmount } = renderHook(() =>
      useAuthSession({
        serverUrl: 'http://localhost:3000',
        session: { storage: 'cookie', autoRefresh: false, syncTabs: false },
      })
    );

    unmount();

    expect(destroyMock).toHaveBeenCalledTimes(1);
  });

  it('refreshes the session on initial 401 and retries', async () => {
    // UI-CSRF: Token must be at least 32 chars to pass validation
    const csrfToken = 'test_csrf_token_1234567890abcdef';
    document.cookie = `XSRF-TOKEN=${csrfToken}`;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          tokens: { accessToken: 'a', refreshToken: 'r', expiresIn: 300 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ user: { id: 'user-1', email: 'a@b.com' } }),
      });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useAuthSession({
        serverUrl: 'http://localhost:3000',
        session: { storage: 'cookie', autoRefresh: true, syncTabs: false },
      })
    );

    await waitFor(() => {
      expect(result.current.authState).toBe('authenticated');
    });

    const refreshCall = fetchMock.mock.calls.find(
      ([url]) => url === 'http://localhost:3000/refresh'
    );
    expect(refreshCall).toBeDefined();
    const refreshOptions = refreshCall?.[1] as RequestInit | undefined;
    expect(refreshOptions?.headers).toMatchObject({ 'X-CSRF-Token': csrfToken });
  });

  it('includes CSRF header on logout when available', async () => {
    // UI-CSRF: Token must be at least 32 chars to pass validation
    document.cookie = 'XSRF-TOKEN=logout_csrf_token_12345678901234';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useAuthSession({
        serverUrl: 'http://localhost:3000',
        session: { storage: 'cookie', autoRefresh: false, syncTabs: false },
      })
    );

    await act(async () => {
      await result.current.logout();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/logout',
      expect.objectContaining({
        headers: { 'X-CSRF-Token': 'logout_csrf_token_12345678901234' },
      })
    );
  });

  it('includes Authorization header on user fetch for non-cookie storage', async () => {
    getAccessTokenMock.mockReturnValue('access-token');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ user: { id: 'user-1', email: 'a@b.com' } }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useAuthSession({
        serverUrl: 'http://localhost:3000',
        session: { storage: 'localStorage', autoRefresh: false, syncTabs: false },
      })
    );

    await waitFor(() => {
      expect(result.current.authState).toBe('authenticated');
    });

    const userCall = fetchMock.mock.calls.find(([url]) => url === 'http://localhost:3000/user');
    const userOptions = userCall?.[1] as RequestInit | undefined;
    expect(userOptions?.headers).toMatchObject({
      Authorization: 'Bearer access-token',
    });
  });

  it('includes Authorization header on logout for non-cookie storage', async () => {
    getAccessTokenMock.mockReturnValue('access-token');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useAuthSession({
        serverUrl: 'http://localhost:3000',
        session: { storage: 'localStorage', autoRefresh: false, syncTabs: false },
      })
    );

    await act(async () => {
      await result.current.logout();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/logout',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer access-token' }),
      })
    );
  });

  it('deduplicates concurrent refresh attempts', async () => {
    let userCallCount = 0;
    let refreshCallCount = 0;

    const fetchMock = vi.fn((url: string) => {
      if (url.endsWith('/user')) {
        userCallCount += 1;
        if (userCallCount === 1) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ user: { id: 'user-1', email: 'a@b.com' } }),
          });
        }
        if (userCallCount <= 3) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: async () => ({}),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ user: { id: 'user-1', email: 'a@b.com' } }),
        });
      }

      if (url.endsWith('/refresh')) {
        refreshCallCount += 1;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            tokens: { accessToken: 'a', refreshToken: 'r', expiresIn: 300 },
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
    });

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useAuthSession({
        serverUrl: 'http://localhost:3000',
        session: { storage: 'cookie', autoRefresh: true, syncTabs: false },
      })
    );

    await waitFor(() => {
      expect(result.current.authState).toBe('authenticated');
    });

    await act(async () => {
      await Promise.all([result.current.refreshUser(), result.current.refreshUser()]);
    });

    expect(refreshCallCount).toBe(1);
  });

  it('expires session when refresh fails during initial check', async () => {
    getRefreshTokenMock.mockReturnValue('refresh-token');
    const onSessionExpired = vi.fn();
    const fetchMock = vi.fn((url: string) => {
      if (url.endsWith('/user')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: async () => ({}),
        });
      }
      if (url.endsWith('/refresh')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: async () => ({}),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useAuthSession({
        serverUrl: 'http://localhost:3000',
        session: { storage: 'localStorage', autoRefresh: true, syncTabs: false },
        callbacks: { onSessionExpired },
      })
    );

    await waitFor(() => {
      expect(result.current.authState).toBe('unauthenticated');
    });

    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('aborts refresh when request times out', async () => {
    vi.useFakeTimers();
    const onSessionExpired = vi.fn();
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (url.endsWith('/user')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: async () => ({}),
        });
      }
      if (url.endsWith('/refresh')) {
        return new Promise((_resolve, reject) => {
          const signal = options?.signal as AbortSignal | undefined;
          signal?.addEventListener('abort', () => {
            const err = new Error('aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    renderHook(() =>
      useAuthSession({
        serverUrl: 'http://localhost:3000',
        session: { storage: 'cookie', autoRefresh: true, syncTabs: false },
        callbacks: { onSessionExpired },
        requestTimeoutMs: 5,
      })
    );

    try {
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(onSessionExpired).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('avoids state updates after unmount during initial session check', async () => {
    let resolveFetch!: (value: { ok: boolean; json: () => Promise<unknown> }) => void;
    const fetchPromise = new Promise<{ ok: boolean; json: () => Promise<unknown> }>((resolve) => {
      resolveFetch = resolve;
    });

    globalThis.fetch = vi.fn().mockReturnValue(fetchPromise as unknown as Response);

    const { unmount } = renderHook(() =>
      useAuthSession({
        serverUrl: 'http://localhost:3000',
        session: { storage: 'cookie', autoRefresh: false, syncTabs: false },
      })
    );

    unmount();

    resolveFetch({
      ok: false,
      json: async () => ({}),
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(destroyMock).toHaveBeenCalledTimes(1);
  });

  it('clears tokens when session expires', async () => {
    const { result } = renderHook(() =>
      useAuthSession({
        serverUrl: 'http://localhost:3000',
        session: { storage: 'cookie', autoRefresh: false, syncTabs: false },
      })
    );

    await waitFor(() => {
      expect(result.current.authState).toBe('unauthenticated');
    });
    expect(sessionExpiredCallback).not.toBeNull();

    act(() => {
      sessionExpiredCallback?.();
    });

    expect(clearMock).toHaveBeenCalledTimes(1);
  });
});

describe('logout lifecycle races', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('an old user response cannot undo logout', async () => {
    let finish!: (response: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        url.endsWith('/logout')
          ? Promise.resolve(new Response('{}'))
          : new Promise<Response>((resolve) => {
              finish = resolve;
            })
      )
    );
    const { result } = renderHook(() =>
      useAuthSession({
        serverUrl: 'https://login.test',
        session: { storage: 'memory', autoRefresh: false, syncTabs: false },
      })
    );
    await act(async () => {
      await result.current.logout();
    });
    await act(async () => {
      finish(new Response(JSON.stringify({ user: { id: 'stale-user' } })));
    });
    expect(result.current.authState).toBe('unauthenticated');
    expect(result.current.user).toBeNull();
  });

  it('discards an explicit user refresh from a previous server scope', async () => {
    let finish!: (response: Response) => void;
    let requests = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.startsWith('https://old.test') && requests++ > 0) {
          return new Promise<Response>((resolve) => {
            finish = resolve;
          });
        }
        return Promise.resolve(new Response('{}', { status: 403 }));
      })
    );
    const { result, rerender } = renderHook(
      ({ serverUrl }) =>
        useAuthSession({
          serverUrl,
          session: { storage: 'memory', autoRefresh: false, syncTabs: false },
        }),
      { initialProps: { serverUrl: 'https://old.test' } }
    );
    await waitFor(() => expect(result.current.authState).toBe('unauthenticated'));
    let refresh!: Promise<void>;
    act(() => {
      refresh = result.current.refreshUser();
    });
    rerender({ serverUrl: 'https://new.test' });
    await waitFor(() => expect(result.current.authState).toBe('unauthenticated'));
    await act(async () => {
      finish(new Response(JSON.stringify({ user: { id: 'wrong-tenant' } })));
      await refresh;
    });
    expect(result.current.user).toBeNull();
  });

  it('reports failed server revocation instead of successful logout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('{}', { status: 503 })))
    );
    const onLogout = vi.fn();
    const { result } = renderHook(() =>
      useAuthSession({
        serverUrl: 'https://login.test',
        session: { storage: 'memory', autoRefresh: false, syncTabs: false },
        callbacks: { onLogout },
      })
    );
    await act(async () => {
      await expect(result.current.logout()).rejects.toThrow('Session revocation failed');
    });
    expect(onLogout).not.toHaveBeenCalled();
    expect(result.current.authState).toBe('unauthenticated');
  });
});
