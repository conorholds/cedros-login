import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { AuthState, Session } from '../types';

const state = vi.hoisted(() => ({ authState: 'authenticated' as AuthState, userId: 'user-a' }));
const list = vi.hoisted(() => vi.fn());
const revoke = vi.hoisted(() => vi.fn());
const token = vi.hoisted(() => vi.fn(() => 'access'));
vi.mock('../context/useCedrosLogin', () => ({
  useCedrosLogin: () => ({
    config: { serverUrl: 'http://sessions.test' },
    authState: state.authState,
    user: state.userId ? { id: state.userId } : null,
    _internal: { getAccessToken: token },
  }),
}));
vi.mock('../utils/sessionApi', () => ({
  SessionApiClient: vi.fn().mockImplementation(function () {
    return { listSessions: list, revokeAllSessions: revoke };
  }),
}));
import { useSessions } from './useSessions';

const current: Session = {
  id: 'current',
  isCurrent: true,
  createdAt: '2026-09-09T00:00:00Z',
  expiresAt: '2026-09-16T00:00:00Z',
};
const sessions = [current, { ...current, id: 'other', isCurrent: false }];
const revoked = { revokedCount: 1, message: 'Other sessions revoked' };
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
beforeEach(() => {
  state.authState = 'authenticated';
  state.userId = 'user-a';
  list.mockReset().mockResolvedValue(sessions);
  revoke.mockReset().mockResolvedValue(revoked);
});

async function loaded() {
  const hook = renderHook(() => useSessions());
  await waitFor(() => expect(hook.result.current.sessions).toHaveLength(2));
  return hook;
}

describe('useSessions lifecycle', () => {
  it('loads once despite changes to the context wrapper and does not fetch signed out', async () => {
    const { result, rerender } = await loaded();
    rerender();
    expect(list).toHaveBeenCalledTimes(1);
    state.authState = 'unauthenticated';
    state.userId = '';
    rerender();
    expect(result.current.sessions).toEqual([]);
    expect(result.current.error).toBeNull();
    await expect(result.current.revokeAllSessions()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
    expect(revoke).not.toHaveBeenCalled();
  });

  it('recovers from initial load failure on refresh', async () => {
    list.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.error?.code).toBe('NETWORK_ERROR'));
    await act(() => result.current.fetchSessions());
    expect(result.current.sessions).toEqual(sessions);
    expect(result.current.error).toBeNull();
  });

  it('ignores a slower read completed after a newer read', async () => {
    const slow = deferred<Session[]>();
    list.mockReturnValueOnce(slow.promise);
    const { result } = renderHook(() => useSessions());
    await act(() => result.current.fetchSessions());
    await act(async () => slow.resolve([]));
    expect(result.current.sessions).toEqual(sessions);
  });

  it('does not expose the old account or let its request overwrite the new account', async () => {
    const { result, rerender } = await loaded();
    const old = deferred<Session[]>();
    const next = deferred<Session[]>();
    list.mockReturnValueOnce(old.promise).mockReturnValueOnce(next.promise);
    let refresh!: Promise<void>;
    act(() => {
      refresh = result.current.fetchSessions();
    });
    state.userId = 'user-b';
    rerender();
    expect(result.current.sessions).toEqual([]);
    await act(async () => {
      old.resolve(sessions);
      await refresh;
    });
    expect(result.current.sessions).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    await act(async () => next.resolve([{ ...current, id: 'user-b-session' }]));
    expect(result.current.sessions[0].id).toBe('user-b-session');
  });

  it('deduplicates sign-out and ignores reads started before it', async () => {
    const { result } = await loaded();
    const oldRead = deferred<Session[]>();
    const mutation = deferred<typeof revoked>();
    list.mockReturnValueOnce(oldRead.promise).mockResolvedValueOnce([current]);
    revoke.mockReturnValueOnce(mutation.promise);
    let refresh!: Promise<void>;
    let first!: Promise<typeof revoked>;
    let second!: Promise<typeof revoked>;
    act(() => {
      refresh = result.current.fetchSessions();
      first = result.current.revokeAllSessions();
      second = result.current.revokeAllSessions();
    });
    expect(first).toBe(second);
    await act(async () => {
      mutation.resolve(revoked);
      await first;
    });
    await act(async () => {
      oldRead.resolve(sessions);
      await refresh;
    });
    expect(result.current.sessions).toEqual([current]);
    expect(result.current.otherSessionCount).toBe(0);
    expect(revoke).toHaveBeenCalledTimes(1);
  });

  it('retains confirmed revocation when its subsequent refresh fails', async () => {
    const { result } = await loaded();
    list.mockRejectedValueOnce(new Error('offline'));
    await act(async () => {
      expect(await result.current.revokeAllSessions()).toEqual(revoked);
    });
    expect(result.current.sessions).toEqual([current]);
    expect(result.current.error?.message).toContain('Other sessions were signed out');
    expect(result.current.isLoading).toBe(false);
    list.mockResolvedValueOnce([current]);
    await act(() => result.current.fetchSessions());
    expect(result.current.error).toBeNull();
  });

  it('keeps sessions on failed revocation and permits a later retry', async () => {
    const { result } = await loaded();
    revoke.mockRejectedValueOnce(new Error('offline'));
    await act(async () => {
      await expect(result.current.revokeAllSessions()).rejects.toThrow('offline');
    });
    expect(result.current.sessions).toEqual(sessions);
    expect(result.current.isLoading).toBe(false);
    list.mockResolvedValueOnce([current]);
    await act(() => result.current.revokeAllSessions());
    expect(result.current.sessions).toEqual([current]);
  });

  it('prevents an old mutation from issuing a refresh under a different account', async () => {
    const { result, rerender } = await loaded();
    const mutation = deferred<typeof revoked>();
    revoke.mockReturnValueOnce(mutation.promise);
    let pending!: Promise<typeof revoked>;
    act(() => {
      pending = result.current.revokeAllSessions();
    });
    state.userId = 'user-b';
    rerender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const calls = list.mock.calls.length;
    await act(async () => {
      mutation.resolve(revoked);
      await expect(pending).rejects.toThrow('Session owner changed');
    });
    expect(list).toHaveBeenCalledTimes(calls);
  });

  it('refreshes on window focus and removes the listener on unmount', async () => {
    const { unmount } = await loaded();
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(list).toHaveBeenCalledTimes(2);
    unmount();
    window.dispatchEvent(new Event('focus'));
    expect(list).toHaveBeenCalledTimes(2);
  });
});
