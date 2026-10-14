import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

import { useGoogleAuth, _internalGoogleScriptLoader } from './useGoogleAuth';

const apiClientCtor = vi.hoisted(() =>
  vi.fn().mockImplementation(function ApiClientMock() {
    return {
      post: vi.fn(),
    };
  })
);

vi.mock('../context/useCedrosLogin', () => {
  return {
    useCedrosLogin: () => ({
      config: {
        serverUrl: 'http://localhost:3000',
        googleClientId: 'google-client-id',
        requestTimeout: 1000,
        retryAttempts: 2,
      },
      _internal: {
        handleLoginSuccess: vi.fn(),
      },
    }),
  };
});

vi.mock('../utils/apiClient', () => {
  return {
    ApiClient: apiClientCtor,
    handleApiError: vi.fn(),
  };
});

describe('useGoogleAuth', () => {
  let tokenCallback:
    | ((response: { access_token?: string; error?: string; state?: string }) => void)
    | null = null;
  let errorCallback: ((error: { type: string }) => void) | null = null;
  const requestAccessTokenMock = vi.fn();

  beforeEach(() => {
    _internalGoogleScriptLoader._reset();
    requestAccessTokenMock.mockReset();

    // Pre-insert script tag so singleton loader resolves immediately
    const existing = document.getElementById('google-gsi-script');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      document.head.appendChild(script);
    }

    tokenCallback = null;
    errorCallback = null;

    // Mock the oauth2 token client API
    (window as unknown as Record<string, unknown>).google = {
      accounts: {
        id: {
          initialize: vi.fn(),
          prompt: vi.fn(),
          renderButton: vi.fn(),
          disableAutoSelect: vi.fn(),
        },
        oauth2: {
          initTokenClient: vi
            .fn()
            .mockImplementation(
              (config: {
                callback: typeof tokenCallback;
                error_callback: typeof errorCallback;
              }) => {
                tokenCallback = config.callback;
                errorCallback = config.error_callback;
                return { requestAccessToken: requestAccessTokenMock };
              }
            ),
        },
      },
    };
  });

  afterEach(() => {
    const script = document.getElementById('google-gsi-script');
    script?.remove();
    delete (window as unknown as Record<string, unknown>).google;
    _internalGoogleScriptLoader._reset();
  });

  it('rejects when user cancels the Google popup', async () => {
    requestAccessTokenMock.mockImplementation(({ state }: { state: string }) => {
      // Simulate Google responding with access_denied
      tokenCallback?.({ error: 'access_denied', state });
    });

    const { result } = renderHook(() => useGoogleAuth());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    let error: unknown;
    await act(async () => {
      try {
        await result.current.signIn();
      } catch (err) {
        error = err;
      }
    });

    expect(error).toMatchObject({ message: 'Google sign-in was cancelled.' });
  });

  it('rejects and resets loading when popup is closed', async () => {
    requestAccessTokenMock.mockImplementation(() => {
      // Simulate user closing the popup window
      errorCallback?.({ type: 'popup_closed' });
    });

    const { result } = renderHook(() => useGoogleAuth());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    let error: unknown;
    await act(async () => {
      try {
        await result.current.signIn();
      } catch (err) {
        error = err;
      }
    });

    expect(error).toMatchObject({ message: 'Google sign-in was cancelled.' });
    expect(result.current.isLoading).toBe(false);
  });

  it('rejects concurrent sign-in attempts', async () => {
    const { result } = renderHook(() => useGoogleAuth());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    let firstAttempt: Promise<unknown>;
    let firstAttemptHandled: Promise<unknown>;
    act(() => {
      firstAttempt = result.current.signIn();
      firstAttemptHandled = firstAttempt.then(() => null).catch((err) => err);
    });

    let secondError: unknown;
    await act(async () => {
      try {
        await result.current.signIn();
      } catch (err) {
        secondError = err;
      }
    });

    expect(secondError).toMatchObject({ message: 'Google sign-in is already in progress.' });

    // Resolve the first attempt so it doesn't leak
    await act(async () => {
      tokenCallback?.({
        error: 'access_denied',
        state: requestAccessTokenMock.mock.calls.at(-1)?.[0]?.state,
      });
    });

    const firstError = await firstAttemptHandled!;
    expect(firstError).toMatchObject({ message: 'Google sign-in was cancelled.' });
  });
  it.each([undefined, 'attacker-state'])(
    'rejects missing or substituted transaction state (%s)',
    async (state) => {
      requestAccessTokenMock.mockImplementation(() =>
        tokenCallback?.({ access_token: 'token', state })
      );
      const { result } = renderHook(() => useGoogleAuth());
      await waitFor(() => expect(result.current.isInitialized).toBe(true));
      let error: unknown;
      await act(async () => {
        try {
          await result.current.signIn();
        } catch (err) {
          error = err;
        }
      });
      expect(error).toMatchObject({ code: 'INVALID_CREDENTIALS' });
      expect(result.current.isLoading).toBe(false);
    }
  );
  it('accepts a matching callback once and ignores a duplicate during completion', async () => {
    const response = { user: { id: 'user' }, tokens: {} };
    const post = vi.fn().mockResolvedValue(response);
    apiClientCtor.mockImplementation(function () {
      return { post };
    });
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'));
    requestAccessTokenMock.mockImplementation(({ state }: { state: string }) => {
      tokenCallback?.({ access_token: 'token', state });
      tokenCallback?.({ access_token: 'token', state });
    });
    try {
      const { result } = renderHook(() => useGoogleAuth());
      await waitFor(() => expect(result.current.isInitialized).toBe(true));
      await act(async () => {
        expect(await result.current.signIn()).toEqual(response);
      });
      expect(post).toHaveBeenCalledOnce();
      expect(post).toHaveBeenCalledWith(
        '/google',
        expect.objectContaining({ accessToken: 'token' })
      );
    } finally {
      fetch.mockRestore();
    }
  });
});
