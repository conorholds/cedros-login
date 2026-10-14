import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';

vi.mock('./useCedrosLoginAdminClientContext', () => ({
  useCedrosLoginAdminClientContext: () => ({
    config: {
      serverUrl: 'http://localhost:3000/auth',
      requestTimeout: 1000,
      retryAttempts: 0,
    },
    user: null,
    authState: 'unauthenticated',
    _internal: {
      getAccessToken: () => 'test-token',
    },
  }),
}));

import { useSsoProviders } from './useSsoProviders';

const provider = {
  id: 'sso-1',
  orgId: 'org-1',
  name: 'Acme SSO',
  issuerUrl: 'https://issuer.example.com',
  clientId: 'client-id',
  scopes: ['openid', 'email'],
  enabled: true,
  allowRegistration: true,
  emailDomain: 'example.com',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('useSsoProviders', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches providers through the shared API client with auth headers and pagination', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options?: RequestInit) => {
        expect(String(_url)).toBe(
          'http://localhost:3000/auth/admin/sso-providers?org_id=org-1&limit=25&offset=50'
        );
        expect((options?.headers as Record<string, string>).Authorization).toBe(
          'Bearer test-token'
        );
        return new Response(
          JSON.stringify({
            providers: [provider],
            total: 1,
            limit: 25,
            offset: 50,
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      })
    );

    const { result } = renderHook(() => useSsoProviders());

    await act(async () => {
      await result.current.fetchProviders('org-1', 25, 50);
    });

    expect(result.current.providers).toEqual([provider]);
    expect(result.current.total).toBe(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('maps API failures to user-safe hook errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            code: 'FORBIDDEN',
            message: 'You do not have permission to manage SSO providers.',
          }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        );
      })
    );

    const { result } = renderHook(() => useSsoProviders());

    await act(async () => {
      await expect(result.current.fetchProviders()).rejects.toThrow(
        'You do not have permission to manage SSO providers.'
      );
    });

    expect(result.current.error?.message).toBe(
      'You do not have permission to manage SSO providers.'
    );
  });
});
