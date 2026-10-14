import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const getMock = vi.fn();

const apiClientCtor = vi.hoisted(() =>
  vi.fn().mockImplementation(function ApiClientMock() {
    return {
      get: getMock,
    };
  })
);

vi.mock('../utils/apiClient', () => ({
  ApiClient: apiClientCtor,
}));

import { useAutoFeatures } from './useAutoFeatures';

describe('useAutoFeatures', () => {
  beforeEach(() => {
    getMock.mockReset();
    apiClientCtor.mockClear();
  });

  it('returns features and client IDs from the server', async () => {
    getMock.mockResolvedValueOnce({
      email: true,
      google: true,
      apple: true,
      solana: false,
      webauthn: false,
      instantLink: false,
      googleClientId: 'goog-123.apps.googleusercontent.com',
      appleClientId: 'com.example.auth',
      signupAvailability: {
        remaining: 12,
        limit: 100,
        period: 'monthly',
        resetsAt: '2099-10-01T00:00:00Z',
      },
    });

    const { result } = renderHook(() => useAutoFeatures('http://localhost:3000', true));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.features).toEqual({
      email: true,
      google: true,
      apple: true,
      solana: false,
      webauthn: false,
      instantLink: false,
    });
    expect(result.current.googleClientId).toBe('goog-123.apps.googleusercontent.com');
    expect(result.current.appleClientId).toBe('com.example.auth');
    expect(result.current.signupAvailability).toEqual({
      remaining: 12,
      limit: 100,
      period: 'monthly',
      resetsAt: '2099-10-01T00:00:00Z',
    });
  });

  it('returns undefined client IDs when server omits them', async () => {
    getMock.mockResolvedValueOnce({
      email: true,
      google: false,
      apple: false,
      solana: false,
      webauthn: false,
      instantLink: false,
    });

    const { result } = renderHook(() => useAutoFeatures('http://localhost:3000', true));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.googleClientId).toBeUndefined();
    expect(result.current.appleClientId).toBeUndefined();
  });

  it('falls back to registry defaults on error without client IDs', async () => {
    getMock.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useAutoFeatures('http://localhost:3000', true));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.features).toEqual({
      email: true,
      google: true,
      apple: true,
      solana: true,
      webauthn: true,
      instantLink: false,
    });
    expect(result.current.googleClientId).toBeUndefined();
    expect(result.current.appleClientId).toBeUndefined();
  });

  it('does not fetch when disabled', () => {
    const { result } = renderHook(() => useAutoFeatures('http://localhost:3000', false));

    expect(getMock).not.toHaveBeenCalled();
    expect(result.current.features).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
