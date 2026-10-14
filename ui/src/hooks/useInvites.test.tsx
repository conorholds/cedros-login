import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { AuthState } from '../types';
import { CedrosLoginAdminRuntimeContext } from '../admin/CedrosLoginAdminRuntimeContext';

const authStateRef = vi.hoisted(() => ({ value: 'unauthenticated' as AuthState }));
const listInvitesMock = vi.hoisted(() => vi.fn().mockResolvedValue({ invites: [], total: 0 }));
const inviteApiCtor = vi.hoisted(() =>
  vi.fn().mockImplementation(function InviteApiClientMock() {
    return {
      listInvites: listInvitesMock,
      createInvite: vi.fn(),
      cancelInvite: vi.fn(),
      resendInvite: vi.fn(),
      acceptInvite: vi.fn(),
    };
  })
);

function wrapper({ children }: { children: ReactNode }) {
  return (
    <CedrosLoginAdminRuntimeContext.Provider
      value={{
        config: {
          serverUrl: 'http://localhost:3000',
          requestTimeout: 1000,
          retryAttempts: 2,
        },
        user: null,
        authState: authStateRef.value,
        getAccessToken: vi.fn(),
      }}
    >
      {children}
    </CedrosLoginAdminRuntimeContext.Provider>
  );
}

vi.mock('../utils/inviteApi', () => {
  return {
    InviteApiClient: inviteApiCtor,
  };
});

import { useInvites } from './useInvites';

function createDeferred<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

describe('useInvites', () => {
  it('refetches when auth transitions to authenticated', async () => {
    authStateRef.value = 'unauthenticated';
    listInvitesMock.mockClear();

    const { rerender } = renderHook(() => useInvites('org-1'), { wrapper });

    expect(listInvitesMock).not.toHaveBeenCalled();

    authStateRef.value = 'authenticated';
    rerender();

    await waitFor(() => {
      expect(listInvitesMock).toHaveBeenCalledTimes(1);
    });

    expect(listInvitesMock).toHaveBeenCalledWith('org-1', 50, 0);
  });

  it('ignores stale responses when org changes', async () => {
    authStateRef.value = 'authenticated';
    listInvitesMock.mockClear();

    const first = createDeferred<{ invites: Array<{ id: string }>; total: number }>();
    const second = createDeferred<{ invites: Array<{ id: string }>; total: number }>();

    listInvitesMock.mockImplementation((orgId: string) => {
      return orgId === 'org-1' ? first.promise : second.promise;
    });

    const { result, rerender } = renderHook(({ orgId }) => useInvites(orgId), {
      initialProps: { orgId: 'org-1' },
      wrapper,
    });

    rerender({ orgId: 'org-2' });

    await act(async () => {
      second.resolve({ invites: [{ id: 'i2' }], total: 1 });
    });

    await waitFor(() => {
      expect(result.current.invites[0]?.id).toBe('i2');
    });

    await act(async () => {
      first.resolve({ invites: [{ id: 'i1' }], total: 1 });
    });

    expect(result.current.invites[0]?.id).toBe('i2');
  });
});
