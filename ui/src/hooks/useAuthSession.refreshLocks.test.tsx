import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { SessionConfig, TokenPair } from '../types';
import { useAuthSession } from './useAuthSession';

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

const user = { id: 'user-1', email: 'a@b.com' };
const cookieTokens = { accessToken: 'a', refreshToken: 'r', expiresIn: 300 };
const staleTokens = { accessToken: 'stale-a', refreshToken: 'stale-r', expiresIn: 300 };
const refreshedTokens = { accessToken: 'fresh-a', refreshToken: 'fresh-r', expiresIn: 300 };
const originalFetch = globalThis.fetch;
const originalLocksDescriptor = Object.getOwnPropertyDescriptor(navigator, 'locks');
let warnSpy: ReturnType<typeof vi.spyOn> | null = null;

function jsonResponse(body: unknown, status = 200): Promise<Response> {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
}

function setNavigatorLocks(locks: Pick<LockManager, 'request'> | undefined): void {
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: locks,
  });
}

function restoreNavigatorLocks(): void {
  if (originalLocksDescriptor) {
    Object.defineProperty(navigator, 'locks', originalLocksDescriptor);
    return;
  }
  Reflect.deleteProperty(navigator, 'locks');
}

function createSerialLocks(): Pick<LockManager, 'request'> & {
  request: ReturnType<typeof vi.fn>;
} {
  let queue = Promise.resolve();
  const request = vi.fn(<T,>(name: string, callback: LockGrantedCallback<T>): Promise<T> => {
    const result = queue.then(() => callback({ name, mode: 'exclusive' } as Lock));
    queue = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  });
  return { request };
}

function createRefreshRaceFetch() {
  let phase: 'initial' | 'race' = 'initial';
  let raceUserGets = 0;
  let refreshPosts = 0;

  const fetchMock = vi.fn((input: RequestInfo | URL, options?: RequestInit) => {
    const url = String(input);

    if (url.endsWith('/refresh') && options?.method === 'POST') {
      refreshPosts += 1;
      return jsonResponse({ tokens: cookieTokens });
    }

    if (url.endsWith('/user')) {
      if (phase === 'initial') {
        return jsonResponse({ user });
      }
      raceUserGets += 1;
      if (raceUserGets <= 2 || refreshPosts === 0) {
        return jsonResponse({}, 401);
      }
      return jsonResponse({ user });
    }

    return jsonResponse({});
  });

  return {
    beginRace: () => {
      phase = 'race';
      raceUserGets = 0;
      refreshPosts = 0;
      fetchMock.mockClear();
    },
    fetchMock,
    refreshPostCount: () => refreshPosts,
  };
}

function createTokenStorageRaceFetch() {
  let phase: 'initial' | 'race' = 'initial';
  const refreshBodies: unknown[] = [];

  const fetchMock = vi.fn((input: RequestInfo | URL, options?: RequestInit) => {
    const url = String(input);

    if (url.endsWith('/refresh') && options?.method === 'POST') {
      refreshBodies.push(parseJsonBody(options.body));
      return jsonResponse({ tokens: refreshedTokens });
    }

    if (url.endsWith('/user')) {
      if (phase === 'initial') {
        return jsonResponse({ user });
      }
      return getHeader(options?.headers, 'Authorization') ===
        `Bearer ${refreshedTokens.accessToken}`
        ? jsonResponse({ user })
        : jsonResponse({}, 401);
    }

    return jsonResponse({});
  });

  return {
    beginRace: () => {
      phase = 'race';
      refreshBodies.length = 0;
      fetchMock.mockClear();
    },
    fetchMock,
    refreshBodies: () => [...refreshBodies],
  };
}

function parseJsonBody(body: BodyInit | null | undefined): unknown {
  return typeof body === 'string' ? (JSON.parse(body) as unknown) : null;
}

function getHeader(headers: HeadersInit | undefined, name: string): string | undefined {
  if (!headers) return undefined;
  if (headers instanceof Headers) return headers.get(name) ?? undefined;
  if (Array.isArray(headers)) {
    return headers.find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1];
  }
  return headers[name] ?? headers[name.toLowerCase()];
}

function seedStoredTokens(tokens: TokenPair): void {
  localStorage.setItem(
    'cedros_tokens',
    JSON.stringify({
      tokens,
      expiresAt: Date.now() + tokens.expiresIn * 1000,
    })
  );
}

async function renderAuthenticatedPair(session: SessionConfig) {
  const first = renderHook(() =>
    useAuthSession({
      serverUrl: 'http://localhost:3000',
      session,
    })
  );
  const second = renderHook(() =>
    useAuthSession({
      serverUrl: 'http://localhost:3000',
      session,
    })
  );

  await waitFor(() => {
    expect(first.result.current.authState).toBe('authenticated');
    expect(second.result.current.authState).toBe('authenticated');
  });

  return { first, second };
}

describe('useAuthSession refresh locks', () => {
  it('revokes logout even when another tab indefinitely holds the refresh lock', async () => {
    const locks = { request: vi.fn(<T,>(): Promise<T> => new Promise<T>(() => {})) };
    setNavigatorLocks(locks);
    let expired = false;
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      if (String(input).endsWith('/logout')) return jsonResponse({});
      return expired ? jsonResponse({}, 401) : jsonResponse({ user });
    });
    globalThis.fetch = fetchMock;
    const { result } = renderHook(() =>
      useAuthSession({
        serverUrl: 'http://localhost:3000',
        session: { storage: 'cookie', autoRefresh: true, syncTabs: false },
        requestTimeoutMs: 25,
      })
    );
    await waitFor(() => expect(result.current.authState).toBe('authenticated'));
    expired = true;
    act(() => {
      void result.current.refreshUser();
    });
    await waitFor(() => expect(locks.request).toHaveBeenCalled());
    await act(async () => {
      await result.current.logout();
    });
    expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/logout'))).toBe(true);
    expect(result.current.authState).toBe('unauthenticated');
  });

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = '';
    setNavigatorLocks(undefined);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    restoreNavigatorLocks();
    warnSpy?.mockRestore();
    warnSpy = null;
    localStorage.clear();
    sessionStorage.clear();
  });

  it('serializes cookie refresh across hook instances with Web Locks', async () => {
    const locks = createSerialLocks();
    setNavigatorLocks(locks);
    const raceFetch = createRefreshRaceFetch();
    globalThis.fetch = raceFetch.fetchMock as unknown as typeof fetch;

    const { first, second } = await renderAuthenticatedPair({
      storage: 'cookie',
      autoRefresh: true,
      syncTabs: false,
    });
    raceFetch.beginRace();

    await act(async () => {
      await Promise.all([first.result.current.refreshUser(), second.result.current.refreshUser()]);
    });

    expect(locks.request).toHaveBeenCalledTimes(2);
    expect(locks.request).toHaveBeenCalledWith('cedros-login:refresh', expect.any(Function));
    expect(raceFetch.refreshPostCount()).toBe(1);
  });

  it('reconciles token storage inside Web Locks and avoids stale refresh replay', async () => {
    const locks = createSerialLocks();
    setNavigatorLocks(locks);
    seedStoredTokens(staleTokens);
    const raceFetch = createTokenStorageRaceFetch();
    globalThis.fetch = raceFetch.fetchMock as unknown as typeof fetch;

    const { first, second } = await renderAuthenticatedPair({
      storage: 'localStorage',
      autoRefresh: true,
      syncTabs: false,
      allowWebStorage: true,
    });
    raceFetch.beginRace();

    await act(async () => {
      await Promise.all([first.result.current.refreshUser(), second.result.current.refreshUser()]);
    });

    await waitFor(() => {
      expect(first.result.current.authState).toBe('authenticated');
      expect(second.result.current.authState).toBe('authenticated');
    });
    expect(locks.request).toHaveBeenCalledTimes(2);
    expect(raceFetch.refreshBodies()).toEqual([{ refreshToken: staleTokens.refreshToken }]);
    expect(first.result.current.getAccessToken()).toBe(refreshedTokens.accessToken);
    expect(second.result.current.getAccessToken()).toBe(refreshedTokens.accessToken);
  });

  it('preserves independent cookie refreshes when Web Locks are unavailable', async () => {
    const raceFetch = createRefreshRaceFetch();
    globalThis.fetch = raceFetch.fetchMock as unknown as typeof fetch;

    const { first, second } = await renderAuthenticatedPair({
      storage: 'cookie',
      autoRefresh: true,
      syncTabs: false,
    });
    raceFetch.beginRace();

    await act(async () => {
      await Promise.all([first.result.current.refreshUser(), second.result.current.refreshUser()]);
    });

    expect(raceFetch.refreshPostCount()).toBe(2);
  });

  it('preserves independent token-storage refreshes when Web Locks are unavailable', async () => {
    seedStoredTokens(staleTokens);
    const raceFetch = createTokenStorageRaceFetch();
    globalThis.fetch = raceFetch.fetchMock as unknown as typeof fetch;

    const { first, second } = await renderAuthenticatedPair({
      storage: 'localStorage',
      autoRefresh: true,
      syncTabs: false,
      allowWebStorage: true,
    });
    raceFetch.beginRace();

    await act(async () => {
      await Promise.all([first.result.current.refreshUser(), second.result.current.refreshUser()]);
    });

    expect(raceFetch.refreshBodies()).toEqual([
      { refreshToken: staleTokens.refreshToken },
      { refreshToken: staleTokens.refreshToken },
    ]);
  });

  it('falls back to a direct refresh when Web Lock acquisition is denied', async () => {
    const locks = {
      request: vi.fn().mockRejectedValue(new Error('Lock acquisition denied')),
    } as unknown as Pick<LockManager, 'request'>;
    setNavigatorLocks(locks);
    let phase: 'initial' | 'refresh' = 'initial';
    let refreshed = false;
    const fetchMock = vi.fn((input: RequestInfo | URL, options?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/refresh') && options?.method === 'POST') {
        refreshed = true;
        return jsonResponse({ tokens: cookieTokens });
      }
      if (url.endsWith('/user')) {
        return phase === 'initial' || refreshed ? jsonResponse({ user }) : jsonResponse({}, 401);
      }
      return jsonResponse({});
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const session = renderHook(() =>
      useAuthSession({
        serverUrl: 'http://localhost:3000',
        session: { storage: 'cookie', autoRefresh: true, syncTabs: false },
      })
    );
    await waitFor(() => expect(session.result.current.authState).toBe('authenticated'));
    phase = 'refresh';
    fetchMock.mockClear();

    await act(async () => {
      await session.result.current.refreshUser();
    });

    expect(locks.request).toHaveBeenCalledTimes(1);
    expect(
      fetchMock.mock.calls.filter(
        ([input, options]) => String(input).endsWith('/refresh') && options?.method === 'POST'
      )
    ).toHaveLength(1);
    expect(session.result.current.authState).toBe('authenticated');
  });
});
