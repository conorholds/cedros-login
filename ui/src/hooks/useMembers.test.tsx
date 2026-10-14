import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { AuthState } from '../types';
import { CedrosLoginAdminRuntimeContext } from '../admin/CedrosLoginAdminRuntimeContext';

const authStateRef = vi.hoisted(() => ({ value: 'unauthenticated' as AuthState }));
const listMembersMock = vi.hoisted(() => vi.fn().mockResolvedValue({ members: [], total: 0 }));
const memberApiCtor = vi.hoisted(() =>
  vi.fn().mockImplementation(function MemberApiClientMock() {
    return {
      listMembers: listMembersMock,
      updateMemberRole: vi.fn(),
      removeMember: vi.fn(),
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

vi.mock('../utils/memberApi', () => {
  return {
    MemberApiClient: memberApiCtor,
  };
});

import { useMembers } from './useMembers';

function createDeferred<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

describe('useMembers', () => {
  it('refetches when auth transitions to authenticated', async () => {
    authStateRef.value = 'unauthenticated';
    listMembersMock.mockClear();

    const { rerender } = renderHook(() => useMembers('org-1'), { wrapper });

    expect(listMembersMock).not.toHaveBeenCalled();

    authStateRef.value = 'authenticated';
    rerender();

    await waitFor(() => {
      expect(listMembersMock).toHaveBeenCalledTimes(1);
    });

    expect(listMembersMock).toHaveBeenCalledWith('org-1', 50, 0);
  });

  it('ignores stale responses when org changes', async () => {
    authStateRef.value = 'authenticated';
    listMembersMock.mockClear();

    const first = createDeferred<{ members: Array<{ id: string }>; total: number }>();
    const second = createDeferred<{ members: Array<{ id: string }>; total: number }>();

    listMembersMock.mockImplementation((orgId: string) => {
      return orgId === 'org-1' ? first.promise : second.promise;
    });

    const { result, rerender } = renderHook(({ orgId }) => useMembers(orgId), {
      initialProps: { orgId: 'org-1' },
      wrapper,
    });

    rerender({ orgId: 'org-2' });

    await act(async () => {
      second.resolve({ members: [{ id: 'm2' }], total: 1 });
    });

    await waitFor(() => {
      expect(result.current.members[0]?.id).toBe('m2');
    });

    await act(async () => {
      first.resolve({ members: [{ id: 'm1' }], total: 1 });
    });

    expect(result.current.members[0]?.id).toBe('m2');
  });
});
