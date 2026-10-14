import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { AuthState, Credential } from '../types';

const authStateRef = vi.hoisted(() => ({ value: 'unauthenticated' as AuthState }));
const listCredentialsMock = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const unlinkCredentialMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const stableInternal = vi.hoisted(() => ({ getAccessToken: vi.fn() }));

vi.mock('../context/useCedrosLogin', () => ({
  useCedrosLogin: () => ({
    config: {
      serverUrl: 'http://localhost:3000',
      requestTimeout: 1000,
      retryAttempts: 2,
    },
    authState: authStateRef.value,
    _internal: stableInternal,
  }),
}));

vi.mock('../utils/credentialApi', () => ({
  CredentialApiClient: vi.fn().mockImplementation(function CredentialApiClientMock() {
    return {
      listCredentials: listCredentialsMock,
      unlinkCredential: unlinkCredentialMock,
    };
  }),
}));

import { useCredentials } from './useCredentials';

const mockCredentials: Credential[] = [
  {
    id: 'cred-1',
    credentialType: 'password',
    label: null,
    createdAt: '2024-01-01T00:00:00Z',
    lastUsedAt: '2024-06-01T00:00:00Z',
    isPrimary: true,
  },
  {
    id: 'cred-2',
    credentialType: 'oauth_google',
    label: 'Work Google',
    createdAt: '2024-02-01T00:00:00Z',
    lastUsedAt: null,
    isPrimary: false,
  },
];

describe('useCredentials', () => {
  it('auto-fetches when authenticated', async () => {
    authStateRef.value = 'authenticated';
    listCredentialsMock.mockResolvedValue(mockCredentials);

    const { result } = renderHook(() => useCredentials());

    await waitFor(() => {
      expect(result.current.credentials).toEqual(mockCredentials);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when unauthenticated', async () => {
    authStateRef.value = 'unauthenticated';
    listCredentialsMock.mockClear();

    renderHook(() => useCredentials());

    expect(listCredentialsMock).not.toHaveBeenCalled();
  });

  it('fetches when auth transitions to authenticated', async () => {
    authStateRef.value = 'unauthenticated';
    listCredentialsMock.mockClear();
    listCredentialsMock.mockResolvedValue(mockCredentials);

    const { result, rerender } = renderHook(() => useCredentials());

    expect(listCredentialsMock).not.toHaveBeenCalled();

    authStateRef.value = 'authenticated';
    rerender();

    await waitFor(() => {
      expect(result.current.credentials).toEqual(mockCredentials);
    });
  });

  it('sets error on fetch failure', async () => {
    authStateRef.value = 'authenticated';
    listCredentialsMock.mockRejectedValue({ code: 'SERVER_ERROR', message: 'Server down' });

    const { result } = renderHook(() => useCredentials());

    await waitFor(() => {
      expect(result.current.error).toMatchObject({ code: 'SERVER_ERROR' });
    });
    expect(result.current.credentials).toEqual([]);
  });

  it('unlinkCredential calls API and refreshes list', async () => {
    authStateRef.value = 'authenticated';
    listCredentialsMock.mockResolvedValue(mockCredentials);

    const { result } = renderHook(() => useCredentials());

    await waitFor(() => {
      expect(result.current.credentials).toHaveLength(2);
    });

    // After unlinking, the refreshed list returns only one
    listCredentialsMock.mockResolvedValue([mockCredentials[0]]);

    await act(async () => {
      await result.current.unlinkCredential('cred-2');
    });

    expect(unlinkCredentialMock).toHaveBeenCalledWith('cred-2');
    await waitFor(() => {
      expect(result.current.credentials).toHaveLength(1);
    });
  });

  it('clearError resets error state', async () => {
    authStateRef.value = 'authenticated';
    listCredentialsMock.mockRejectedValue({ code: 'SERVER_ERROR', message: 'fail' });

    const { result } = renderHook(() => useCredentials());

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
