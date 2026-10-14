import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CedrosLoginAdminRuntimeProvider } from '../admin/CedrosLoginAdminRuntimeProvider';
import type { AdminSectionProps } from '../admin/types';
import { useSystemSettings } from './useSystemSettings';

describe('useSystemSettings loading state', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is loading on the first authenticated render and settles after an empty response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ settings: {} }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
      )
    );
    const { result } = renderHook(() => useSystemSettings(), {
      wrapper: authenticatedRuntime,
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await result.current.fetchSettings();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.settings).toEqual({});
  });

  it('does not report a request as pending without an authenticated admin', () => {
    const { result } = renderHook(() => useSystemSettings(), {
      wrapper: unauthenticatedRuntime,
    });

    expect(result.current.isLoading).toBe(false);
  });
});

function authenticatedRuntime({ children }: PropsWithChildren) {
  return (
    <CedrosLoginAdminRuntimeProvider pluginContext={pluginContext(true)}>
      {children}
    </CedrosLoginAdminRuntimeProvider>
  );
}

function unauthenticatedRuntime({ children }: PropsWithChildren) {
  return (
    <CedrosLoginAdminRuntimeProvider pluginContext={pluginContext(false)}>
      {children}
    </CedrosLoginAdminRuntimeProvider>
  );
}

function pluginContext(authenticated: boolean): AdminSectionProps['pluginContext'] {
  return {
    serverUrl: 'https://admin-loading.example.com/extensions/cedros-login',
    getAccessToken: () => (authenticated ? 'admin-token' : null),
    hasPermission: () => authenticated,
    pluginData: authenticated
      ? { user: { id: 'admin-1', email: 'admin@example.com' } }
      : { user: null },
  };
}
