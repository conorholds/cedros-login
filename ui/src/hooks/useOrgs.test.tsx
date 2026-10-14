import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  CedrosLoginAdminRuntimeContext,
  type CedrosLoginAdminRuntimeValue,
} from '../admin/CedrosLoginAdminRuntimeContext';
import { useOrgs } from './useOrgs';

const mockListOrgs = vi.fn(async () => [
  {
    id: 'org-1',
    name: 'Default Org',
    slug: 'default',
    isPersonal: false,
    logoUrl: null,
    membership: { role: 'owner' },
  },
]);
const mockGetPermissions = vi.fn(async () => ({ permissions: [], role: 'owner' }));

vi.mock('../utils/orgApi', () => {
  return {
    OrgApiClient: class {
      listOrgs = mockListOrgs;
      getPermissions = mockGetPermissions;
      createOrg = vi.fn();
      updateOrg = vi.fn();
      deleteOrg = vi.fn();
    },
  };
});

function createRuntimeValue(
  overrides: Partial<CedrosLoginAdminRuntimeValue> = {}
): CedrosLoginAdminRuntimeValue {
  return {
    config: { serverUrl: 'http://example.com' },
    user: {
      id: 'user-1',
      email: 'user@example.com',
      authMethods: ['email'],
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    authState: 'authenticated',
    getAccessToken: () => 'token-123',
    ...overrides,
  };
}

describe('useOrgs', () => {
  afterEach(() => {
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
      localStorage.clear();
      Object.defineProperty(window, 'localStorage', {
        value: localStorage,
        configurable: true,
      });
    }
  });

  it('does not crash when localStorage is unavailable', async () => {
    const originalStorage = typeof window !== 'undefined' ? window.localStorage : undefined;

    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      configurable: true,
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <CedrosLoginAdminRuntimeContext.Provider value={createRuntimeValue()}>
        {children}
      </CedrosLoginAdminRuntimeContext.Provider>
    );

    const { result } = renderHook(() => useOrgs(), { wrapper });

    await act(async () => {
      await result.current.fetchOrgs();
    });

    expect(result.current.activeOrg?.id).toBe('org-1');

    Object.defineProperty(window, 'localStorage', {
      value: originalStorage,
      configurable: true,
    });
  });

  it('auto-fetches orgs when authState is authenticated on mount', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CedrosLoginAdminRuntimeContext.Provider value={createRuntimeValue()}>
        {children}
      </CedrosLoginAdminRuntimeContext.Provider>
    );

    const { result } = renderHook(() => useOrgs(), { wrapper });

    // Do NOT manually call fetchOrgs — the auto-fetch effect should handle it
    await waitFor(() => {
      expect(result.current.activeOrg).not.toBeNull();
    });

    expect(mockListOrgs).toHaveBeenCalledTimes(1);
    expect(result.current.activeOrg?.id).toBe('org-1');
    expect(result.current.orgs).toHaveLength(1);
  });

  it('works from the admin runtime context without CedrosLoginContext', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CedrosLoginAdminRuntimeContext.Provider
        value={createRuntimeValue({
          config: {
            serverUrl: 'http://example.com',
            requestTimeout: 1000,
            retryAttempts: 2,
          },
        })}
      >
        {children}
      </CedrosLoginAdminRuntimeContext.Provider>
    );

    const { result } = renderHook(() => useOrgs(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeOrg).not.toBeNull();
    });

    expect(mockListOrgs).toHaveBeenCalledTimes(1);
    expect(result.current.activeOrg?.id).toBe('org-1');
  });

  it('does NOT auto-fetch when authState is unauthenticated', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CedrosLoginAdminRuntimeContext.Provider
        value={createRuntimeValue({ authState: 'unauthenticated', user: null })}
      >
        {children}
      </CedrosLoginAdminRuntimeContext.Provider>
    );

    renderHook(() => useOrgs(), { wrapper });

    // Flush passive effects without introducing a timing dependency.
    await act(async () => {});

    expect(mockListOrgs).not.toHaveBeenCalled();
  });

  it('scopes selection by user and rejects an old identity response', async () => {
    let resolveFirst!: (value: Awaited<ReturnType<typeof mockListOrgs>>) => void;
    let resolveSecond!: (value: Awaited<ReturnType<typeof mockListOrgs>>) => void;
    mockListOrgs
      .mockImplementationOnce(() => new Promise((resolve) => (resolveFirst = resolve)))
      .mockImplementationOnce(() => new Promise((resolve) => (resolveSecond = resolve)));
    localStorage.setItem('cedros_active_org', 'legacy-org');
    localStorage.setItem('cedros_active_org:user-1', 'org-1');
    let runtime = createRuntimeValue();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CedrosLoginAdminRuntimeContext.Provider value={runtime}>
        {children}
      </CedrosLoginAdminRuntimeContext.Provider>
    );
    const { result, rerender } = renderHook(() => useOrgs(), { wrapper });

    runtime = createRuntimeValue({
      user: { ...createRuntimeValue().user!, id: 'user-2', email: 'two@example.com' },
      getAccessToken: () => 'token-456',
    });
    rerender();
    await waitFor(() => expect(mockListOrgs).toHaveBeenCalledTimes(2));

    await act(async () => {
      resolveSecond([
        {
          id: 'org-2',
          name: 'Second Org',
          slug: 'second',
          isPersonal: false,
          logoUrl: null,
          membership: { role: 'owner' },
        },
      ]);
    });
    await waitFor(() => expect(result.current.activeOrg?.id).toBe('org-2'));
    await act(async () =>
      resolveFirst([
        {
          id: 'org-1',
          name: 'First Org',
          slug: 'first',
          isPersonal: false,
          logoUrl: null,
          membership: { role: 'owner' },
        },
      ])
    );

    expect(result.current.activeOrg?.id).toBe('org-2');
    expect(localStorage.getItem('cedros_active_org')).toBeNull();
    expect(localStorage.getItem('cedros_active_org:user-1')).toBeNull();
    expect(localStorage.getItem('cedros_active_org:user-2')).toBe('org-2');
  });
});
