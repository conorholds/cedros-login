import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { CedrosLoginAdminRuntimeContext } from '../admin/CedrosLoginAdminRuntimeContext';
import { useCedrosLoginAdminClientContext } from './useCedrosLoginAdminClientContext';

describe('useCedrosLoginAdminClientContext', () => {
  it('returns the admin runtime context', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CedrosLoginAdminRuntimeContext.Provider
        value={{
          config: {
            serverUrl: 'https://runtime.example.com',
            requestTimeout: 2222,
            retryAttempts: 3,
          },
          user: {
            id: 'runtime-user',
            email: 'runtime@example.com',
            authMethods: ['email'],
            emailVerified: true,
            createdAt: '2026-01-02T00:00:00Z',
            updatedAt: '2026-01-02T00:00:00Z',
          },
          authState: 'authenticated',
          getAccessToken: () => 'runtime-token',
        }}
      >
        {children}
      </CedrosLoginAdminRuntimeContext.Provider>
    );

    const { result } = renderHook(() => useCedrosLoginAdminClientContext(), { wrapper });

    expect(result.current.config.serverUrl).toBe('https://runtime.example.com');
    expect(result.current.config.requestTimeout).toBe(2222);
    expect(result.current.user?.id).toBe('runtime-user');
    expect(result.current._internal.getAccessToken()).toBe('runtime-token');
  });

  it('throws when admin runtime is absent', () => {
    const { result } = renderHook(() => {
      try {
        return useCedrosLoginAdminClientContext();
      } catch (error) {
        return error;
      }
    });

    expect(result.current).toBeInstanceOf(Error);
    expect(String(result.current)).toContain('CedrosLoginAdminRuntimeProvider');
  });
});
