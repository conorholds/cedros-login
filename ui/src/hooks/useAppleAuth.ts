import { useExternalEffect } from './effects';
import { useState, useCallback, useRef, useMemo } from 'react';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { useDeviceAccountLink } from '../context/DeviceAccountLinkContext';
import { ApiClient, handleApiError } from '../utils/apiClient';
import { decodeJwtPayload } from '../utils/deviceAccountHint';
import type { AuthError, LoginAttemptResponse } from '../types';

// Module-level singleton for Apple Sign In script loading
// Prevents race conditions when multiple components mount simultaneously
const scriptLoader = {
  loading: false,
  loaded: false,
  error: null as Error | null,
  callbacks: [] as Array<{ resolve: () => void; reject: (err: Error) => void }>,

  load(): Promise<void> {
    // SSR guard — avoid touching browser globals in Node/SSR environments
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return Promise.reject(new Error('Apple Sign-In script loader cannot run in SSR'));
    }

    if (this.loaded) {
      return Promise.resolve();
    }

    if (this.loading) {
      return new Promise((resolve, reject) => {
        this.callbacks.push({ resolve, reject });
      });
    }

    this.loading = true;
    return new Promise((resolve, reject) => {
      this.callbacks.push({ resolve, reject });

      const existingScript = document.getElementById('apple-signin-script');
      if (existingScript) {
        if (window.AppleID) {
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
      script.src =
        'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      script.async = true;
      script.defer = true;
      script.id = 'apple-signin-script';

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
        const error = new Error('Failed to load Apple Sign In script');
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

export interface UseAppleAuthReturn {
  /** @param accessCode Optional signup access code, forwarded to the server on new registrations. */
  signIn: (accessCode?: string) => Promise<LoginAttemptResponse>;
  isLoading: boolean;
  isInitialized: boolean;
  error: AuthError | null;
  clearError: () => void;
  /** ID token saved when ACCOUNT_LINK_REQUIRED is returned. Pass to POST /auth/link-oauth with the user's password. */
  pendingLinkIdToken: string | null;
  /** Clear the pending link state */
  clearPendingLink: () => void;
}

/**
 * Hook for Apple Sign In authentication.
 *
 * @example
 * ```tsx
 * function AppleButton() {
 *   const { signIn, isLoading, isInitialized, error } = useAppleAuth();
 *
 *   return (
 *     <button onClick={signIn} disabled={!isInitialized || isLoading}>
 *       {isLoading ? 'Signing in...' : 'Sign in with Apple'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useAppleAuth(): UseAppleAuthReturn {
  const { config, _internal } = useCedrosLogin();
  const deviceAccountLink = useDeviceAccountLink();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const [pendingLinkIdToken, setPendingLinkIdToken] = useState<string | null>(null);

  const configRef = useRef(config);

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

  useExternalEffect(() => {
    configRef.current = config;
  }, [config]);

  // Initialize Apple Sign In SDK
  useExternalEffect(() => {
    if (!config.appleClientId) {
      return;
    }

    let isMounted = true;

    const initializeAppleSignIn = () => {
      if (!isMounted) return;

      try {
        window.AppleID?.auth?.init({
          clientId: config.appleClientId!,
          scope: 'name email',
          redirectURI: window.location.origin,
          usePopup: true,
        });

        if (isMounted) {
          setIsInitialized(true);
        }
      } catch {
        if (isMounted) {
          setError({
            code: 'SERVER_ERROR',
            message: 'Unable to initialize Apple sign-in. Please refresh and try again.',
          });
        }
      }
    };

    scriptLoader
      .load()
      .then(() => {
        if (isMounted) {
          initializeAppleSignIn();
        }
      })
      .catch(() => {
        if (isMounted) {
          setError({
            code: 'SERVER_ERROR',
            message: 'Unable to load Apple sign-in. Please refresh and try again.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [config.appleClientId]);

  const signIn = useCallback(
    async (accessCode?: string): Promise<LoginAttemptResponse> => {
      if (!config.appleClientId) {
        const err: AuthError = {
          code: 'VALIDATION_ERROR',
          message: 'Apple Client ID not configured',
        };
        setError(err);
        throw err;
      }

      if (!isInitialized) {
        const err: AuthError = {
          code: 'VALIDATION_ERROR',
          message: 'Apple sign-in is not ready yet. Please wait a moment and try again.',
        };
        setError(err);
        throw err;
      }

      setIsLoading(true);
      setError(null);

      let idToken: string | undefined;

      try {
        // The server owns nonce generation, expiry, and one-time consumption.
        const { nonce } = await apiClient.post<{ nonce: string }>('/apple/nonce', {});
        const nonceHashBuffer = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(nonce)
        );
        const nonceHash = Array.from(new Uint8Array(nonceHashBuffer), (b) =>
          b.toString(16).padStart(2, '0')
        ).join('');

        // Re-init with fresh nonce hash before each sign-in
        window.AppleID!.auth!.init({
          clientId: config.appleClientId!,
          scope: 'name email',
          redirectURI: window.location.origin,
          usePopup: true,
          nonce: nonceHash,
          state: nonce,
        });

        // Trigger Apple Sign In popup
        const response = await window.AppleID!.auth!.signIn();

        if (response.authorization?.state !== nonce) {
          throw new Error('Apple sign-in response did not match this request');
        }

        // Apple returns authorization with id_token
        idToken = response.authorization?.id_token;
        if (!idToken) {
          throw new Error('No ID token received from Apple');
        }

        // Apple only provides user info on first sign-in
        // The name comes from response.user (if available)
        const userName = response.user?.name
          ? `${response.user.name.firstName || ''} ${response.user.name.lastName || ''}`.trim()
          : undefined;
        const identityEmail = emailFromAppleIdToken(idToken) ?? response.user?.email ?? null;

        if (identityEmail) {
          const deviceDecision = await deviceAccountLink.requestDeviceAccountLink({
            identifier: identityEmail,
            method: 'apple',
            linkExisting: async (_hint, signedInResponse) => {
              try {
                await apiClient.post('/link-oauth', {
                  provider: 'apple',
                  idToken,
                  authorizationCode: response.authorization?.code,
                  nonce,
                });
              } catch (err) {
                throw handleApiError(
                  err,
                  'Unable to link Apple to this account. Please try again.'
                );
              }
              return signedInResponse;
            },
          });
          if (deviceDecision.action === 'linked') {
            setIsLoading(false);
            if (deviceDecision.response) return deviceDecision.response;
            throw {
              code: 'UNKNOWN_ERROR',
              message: 'Account linked. Please refresh your session.',
            } satisfies AuthError;
          }
        }

        // Send to our backend (include nonce for server-side replay verification)
        const data = await apiClient.post<LoginAttemptResponse>('/apple', {
          idToken,
          name: userName || undefined,
          nonce,
          referral: _internal?.getReferralCode?.() ?? undefined,
          accessCode: accessCode || undefined,
        });

        if (!('mfaRequired' in data)) {
          configRef.current.callbacks?.onLoginSuccess?.(data.user, 'apple');
          _internal?.handleLoginSuccess(data.user, data.tokens);
        }
        setIsLoading(false);
        return data;
      } catch (err) {
        // Check if user cancelled
        const appleError = err as { error?: string };
        if (appleError.error === 'popup_closed_by_user') {
          const authError: AuthError = {
            code: 'SERVER_ERROR',
            message: 'Apple sign-in was cancelled.',
          };
          setError(authError);
          setIsLoading(false);
          throw authError;
        }

        const authError = handleApiError(err, 'Unable to sign in with Apple. Please try again.');
        if (authError.code === 'ACCOUNT_LINK_REQUIRED' && idToken) {
          setPendingLinkIdToken(idToken);
        }
        setError(authError);
        setIsLoading(false);
        throw authError;
      }
    },
    [config.appleClientId, isInitialized, apiClient, deviceAccountLink, _internal]
  );

  const clearError = useCallback(() => setError(null), []);
  const clearPendingLink = useCallback(() => setPendingLinkIdToken(null), []);

  return {
    signIn,
    isLoading,
    isInitialized,
    error,
    clearError,
    pendingLinkIdToken,
    clearPendingLink,
  };
}

// Type declaration for Apple Sign In JS SDK
declare global {
  interface Window {
    AppleID?: {
      auth?: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup?: boolean;
          nonce?: string;
          state?: string;
        }) => void;
        signIn: () => Promise<{
          authorization?: {
            id_token?: string;
            code?: string;
            state?: string;
          };
          user?: {
            email?: string;
            name?: {
              firstName?: string;
              lastName?: string;
            };
          };
        }>;
      };
    };
  }
}

function emailFromAppleIdToken(idToken: string): string | null {
  const payload = decodeJwtPayload<{ email?: unknown }>(idToken);
  return typeof payload?.email === 'string' ? payload.email : null;
}
