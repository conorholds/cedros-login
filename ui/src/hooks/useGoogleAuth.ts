import { useExternalEffect } from './effects';
import { useState, useCallback, useRef, useMemo } from 'react';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { useDeviceAccountLink } from '../context/DeviceAccountLinkContext';
import { ApiClient, handleApiError } from '../utils/apiClient';
import { decodeJwtPayload } from '../utils/deviceAccountHint';
import type { AuthError, LoginAttemptResponse } from '../types';

/**
 * Module-level singleton for Google script loading
 *
 * Prevents race conditions when multiple components mount simultaneously.
 * Uses a promise queue pattern to ensure the script is only loaded once.
 *
 * ## SSR Limitations
 *
 * This singleton persists across the module lifecycle. In SSR environments:
 * - Module state persists between requests (potential cross-request leakage)
 * - Google Sign-In requires browser APIs (document, window)
 * - The hook guards against SSR with `googleClientId` checks
 *
 * For SSR frameworks (Next.js, Remix), ensure this hook is only used
 * in client-side components.
 *
 * ## Test Isolation
 *
 * For test isolation, call `scriptLoader._reset()` in test setup/teardown.
 *
 * @internal
 */
const scriptLoader = {
  loading: false,
  loaded: false,
  error: null as Error | null,
  callbacks: [] as Array<{ resolve: () => void; reject: (err: Error) => void }>,

  load(): Promise<void> {
    // SSR guard: avoid touching browser globals when running in Node/SSR.
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return Promise.reject(new Error('Google Sign-In script loader cannot run in SSR'));
    }

    // Already loaded
    if (this.loaded) {
      return Promise.resolve();
    }

    // Loading in progress - queue callback
    if (this.loading) {
      return new Promise((resolve, reject) => {
        this.callbacks.push({ resolve, reject });
      });
    }

    // Start loading
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.callbacks.push({ resolve, reject });

      // Check if script already exists (from previous session or SSR)
      const existingScript = document.getElementById('google-gsi-script');
      if (existingScript) {
        if (window.google?.accounts?.id) {
          this.loaded = true;
          this.loading = false;
          this.callbacks.forEach((cb) => cb.resolve());
          this.callbacks = [];
        } else {
          existingScript.addEventListener('load', () => {
            this.loaded = true;
            this.loading = false;
            this.callbacks.forEach((cb) => cb.resolve());
            this.callbacks = [];
          });
        }
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.id = 'google-gsi-script';

      script.onload = () => {
        this.loaded = true;
        this.loading = false;
        this.callbacks.forEach((cb) => cb.resolve());
        this.callbacks = [];
      };

      script.onerror = () => {
        this.loading = false;
        // Remove failed script from DOM to allow retry on next load() call.
        // Without removal, retry finds existingScript and waits for a load event
        // that will never fire on an already-failed script.
        script.remove();
        const error = new Error('Failed to load Google Sign-In script');
        this.callbacks.forEach((cb) => cb.reject(error));
        this.callbacks = [];
      };

      document.head.appendChild(script);
    });
  },

  /**
   * Reset singleton state for test isolation
   * @internal - Only use in test setup/teardown
   */
  _reset(): void {
    this.loading = false;
    this.loaded = false;
    this.error = null;
    this.callbacks = [];
  },
};

/** @internal */
export const _internalGoogleScriptLoader = scriptLoader;

export interface UseGoogleAuthReturn {
  /** @param accessCode Optional signup access code, forwarded to the server on new registrations. */
  signIn: (accessCode?: string) => Promise<LoginAttemptResponse>;
  isLoading: boolean;
  isInitialized: boolean;
  error: AuthError | null;
  clearError: () => void;
  /** Access token saved when ACCOUNT_LINK_REQUIRED is returned. Pass to POST /auth/link-oauth with the user's password. */
  pendingLinkToken: string | null;
  /** Clear the pending link state */
  clearPendingLink: () => void;
}

interface PromiseCallbacks {
  resolve: (value: LoginAttemptResponse) => void;
  reject: (error: AuthError) => void;
}

/**
 * Hook for Google OAuth authentication.
 *
 * @example
 * ```tsx
 * function GoogleButton() {
 *   const { signIn, isLoading, isInitialized, error } = useGoogleAuth();
 *
 *   return (
 *     <button onClick={signIn} disabled={!isInitialized || isLoading}>
 *       {isLoading ? 'Signing in...' : 'Sign in with Google'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useGoogleAuth(): UseGoogleAuthReturn {
  const { config, _internal } = useCedrosLogin();
  const deviceAccountLink = useDeviceAccountLink();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const [pendingLinkToken, setPendingLinkToken] = useState<string | null>(null);

  const promiseCallbacksRef = useRef<PromiseCallbacks | null>(null);
  const configRef = useRef(config);
  const oauthStateRef = useRef<string | null>(null);
  const tokenClientRef = useRef<GoogleTokenClient | null>(null);
  const pendingAccessCodeRef = useRef<string | undefined>(undefined);

  const apiClient = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        retryAttempts: config.retryAttempts,
        getAccessToken: _internal?.getAccessToken,
      }),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal?.getAccessToken]
  );

  // Keep config ref in sync
  useExternalEffect(() => {
    configRef.current = config;
  }, [config]);

  // Handle access token from OAuth popup (initTokenClient flow)
  const handleTokenResponse = useCallback(
    async (response: GoogleTokenResponse) => {
      const callbacks = promiseCallbacksRef.current;
      if (!callbacks) return;

      const expectedState = oauthStateRef.current;
      if (!expectedState) return;
      oauthStateRef.current = null;
      if (response.state !== expectedState) {
        const err: AuthError = {
          code: 'INVALID_CREDENTIALS',
          message: 'Google sign-in response did not match this request. Please try again.',
        };
        setError(err);
        setIsLoading(false);
        promiseCallbacksRef.current = null;
        callbacks.reject(err);
        return;
      }
      // Clearing state before asynchronous work makes duplicate callbacks inert.
      if (response.error) {
        const err: AuthError = {
          code: 'SERVER_ERROR',
          message:
            response.error === 'access_denied'
              ? 'Google sign-in was cancelled.'
              : 'Unable to sign in with Google. Please try again.',
        };
        setError(err);
        setIsLoading(false);
        promiseCallbacksRef.current = null;
        callbacks.reject(err);
        return;
      }

      try {
        const identityEmail = await emailFromGoogleTokenResponse(response);
        if (identityEmail) {
          const deviceDecision = await deviceAccountLink.requestDeviceAccountLink({
            identifier: identityEmail,
            method: 'google',
            linkExisting: async (_hint, signedInResponse) => {
              try {
                await apiClient.post('/link-oauth', {
                  provider: 'google',
                  accessToken: response.access_token,
                  idToken: response.id_token,
                });
              } catch (err) {
                throw handleApiError(
                  err,
                  'Unable to link Google to this account. Please try again.'
                );
              }
              return signedInResponse;
            },
          });
          if (deviceDecision.action === 'linked') {
            setIsLoading(false);
            if (deviceDecision.response) {
              callbacks.resolve(deviceDecision.response);
            } else {
              const authError: AuthError = {
                code: 'UNKNOWN_ERROR',
                message: 'Account linked. Please refresh your session.',
              };
              setError(authError);
              callbacks.reject(authError);
            }
            return;
          }
        }

        const data = await apiClient.post<LoginAttemptResponse>('/google', {
          accessToken: response.access_token,
          idToken: response.id_token,
          referral: _internal?.getReferralCode?.() ?? undefined,
          accessCode: pendingAccessCodeRef.current || undefined,
        });
        if (!('mfaRequired' in data)) {
          configRef.current.callbacks?.onLoginSuccess?.(data.user, 'google');
          _internal?.handleLoginSuccess(data.user, data.tokens);
        }
        setIsLoading(false);
        callbacks.resolve(data);
      } catch (err) {
        const authError = handleApiError(err, 'Unable to sign in with Google. Please try again.');
        if (authError.code === 'ACCOUNT_LINK_REQUIRED') {
          setPendingLinkToken(response.access_token ?? null);
        }
        setError(authError);
        setIsLoading(false);
        callbacks.reject(authError);
      } finally {
        promiseCallbacksRef.current = null;
        pendingAccessCodeRef.current = undefined;
      }
    },
    [apiClient, deviceAccountLink, _internal]
  );

  // Handle popup closed / blocked without completing auth.
  // Google calls error_callback (not callback) when the user closes the popup.
  const handleTokenError = useCallback((err: GoogleTokenErrorResponse) => {
    const callbacks = promiseCallbacksRef.current;
    if (!callbacks) return;

    const authError: AuthError = {
      code: 'SERVER_ERROR',
      message:
        err.type === 'popup_failed_to_open'
          ? 'Google sign-in popup was blocked. Please allow popups for this site.'
          : 'Google sign-in was cancelled.',
    };
    setError(authError);
    setIsLoading(false);
    promiseCallbacksRef.current = null;
    callbacks.reject(authError);
  }, []);

  // Initialize Google OAuth token client using singleton loader.
  // Uses initTokenClient (OAuth popup) instead of One Tap prompt() which
  // has exponential cooldown after dismissal and is blocked by Brave.
  useExternalEffect(() => {
    if (!config.googleClientId) {
      return;
    }

    let isMounted = true;

    scriptLoader
      .load()
      .then(() => {
        if (!isMounted) return;

        const client = window.google?.accounts?.oauth2?.initTokenClient({
          client_id: config.googleClientId!,
          scope: 'openid email profile',
          callback: handleTokenResponse,
          error_callback: handleTokenError,
        });

        if (client) {
          tokenClientRef.current = client;
          setIsInitialized(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError({
            code: 'SERVER_ERROR',
            message: 'Unable to load Google sign-in. Please refresh and try again.',
          });
        }
      });

    return () => {
      isMounted = false;
      tokenClientRef.current = null;
    };
  }, [config.googleClientId, handleTokenResponse, handleTokenError]);

  const signIn = useCallback(
    async (accessCode?: string): Promise<LoginAttemptResponse> => {
      pendingAccessCodeRef.current = accessCode;
      if (!config.googleClientId) {
        const err: AuthError = {
          code: 'VALIDATION_ERROR',
          message: 'Google Client ID not configured',
        };
        setError(err);
        throw err;
      }

      if (!isInitialized) {
        const err: AuthError = {
          code: 'VALIDATION_ERROR',
          message: 'Google sign-in is not ready yet. Please wait a moment and try again.',
        };
        setError(err);
        throw err;
      }

      if (promiseCallbacksRef.current) {
        const err: AuthError = {
          code: 'VALIDATION_ERROR',
          message: 'Google sign-in is already in progress.',
        };
        setError(err);
        throw err;
      }

      setIsLoading(true);
      setError(null);

      return new Promise<LoginAttemptResponse>((resolve, reject) => {
        promiseCallbacksRef.current = { resolve, reject };

        // Open the Google OAuth popup via initTokenClient.
        // This avoids One Tap's exponential cooldown after dismissal and works
        // in browsers that block One Tap (e.g., Brave).
        const state = crypto.randomUUID();
        oauthStateRef.current = state;
        tokenClientRef.current?.requestAccessToken({ state });
      });
    },
    [config.googleClientId, isInitialized]
  );

  const clearError = useCallback(() => setError(null), []);
  const clearPendingLink = useCallback(() => setPendingLinkToken(null), []);

  return {
    signIn,
    isLoading,
    isInitialized,
    error,
    clearError,
    pendingLinkToken,
    clearPendingLink,
  };
}

/** Response from Google's initTokenClient callback */
interface GoogleTokenResponse {
  state?: string;
  access_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

/** Error from initTokenClient error_callback (popup closed/blocked) */
interface GoogleTokenErrorResponse {
  type: 'popup_failed_to_open' | 'popup_closed' | 'unknown';
}

async function emailFromGoogleTokenResponse(response: GoogleTokenResponse): Promise<string | null> {
  if (response.id_token) {
    const payload = decodeJwtPayload<{ email?: unknown }>(response.id_token);
    if (typeof payload?.email === 'string') return payload.email;
  }
  if (!response.access_token) return null;

  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${response.access_token}` },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { email?: unknown };
    return typeof body.email === 'string' ? body.email : null;
  } catch {
    return null;
  }
}

/** Token client returned by google.accounts.oauth2.initTokenClient */
interface GoogleTokenClient {
  requestAccessToken: (options: { state: string }) => void;
}

// Type declaration for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts?: {
        /** Used only to detect if the GIS script has loaded */
        id?: object;
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: GoogleTokenErrorResponse) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}
