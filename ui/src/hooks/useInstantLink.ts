import { useState, useCallback, useMemo } from 'react';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { useDeviceAccountLink } from '../context/DeviceAccountLinkContext';
import { validateEmail } from '../utils/validation';
import { useRateLimiter } from './useRateLimiter';
import { ApiClient, handleApiError } from '../utils/apiClient';
import { AccountEmailApiClient } from '../utils/accountEmailApi';
import { useI18n } from '../i18n';
import type { AuthError, AuthResponse, MfaRequiredResponse } from '../types';

function isMfaRequiredResponse(data: unknown): data is MfaRequiredResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'mfaRequired' in data &&
    (data as { mfaRequired?: unknown }).mfaRequired === true
  );
}

export interface UseInstantLinkReturn {
  /** Send an instant link email to the given address */
  sendInstantLink: (email: string) => Promise<void>;
  /** Verify an instant link token and sign in */
  verifyInstantLink: (token: string) => Promise<AuthResponse | MfaRequiredResponse>;
  /** Whether a request is in progress */
  isLoading: boolean;
  /** Whether the instant link was sent successfully */
  isSuccess: boolean;
  /** Error from the last request */
  error: AuthError | null;
  /** Clear the error state */
  clearError: () => void;
  /** Reset to initial state */
  reset: () => void;
  /** Number of remaining attempts before rate limiting */
  remainingAttempts: number;
}

/**
 * Hook for instant link (passwordless) authentication.
 *
 * Sends an instant link email that allows the user to sign in
 * without entering their password.
 *
 * @example
 * ```tsx
 * function InstantLinkForm() {
 *   const { sendInstantLink, isLoading, isSuccess, error } = useInstantLink();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     await sendInstantLink(email);
 *   };
 *
 *   if (isSuccess) {
 *     return <p>Check your email for the sign-in link</p>;
 *   }
 * }
 * ```
 */
export function useInstantLink(): UseInstantLinkReturn {
  const { config, _internal } = useCedrosLogin();
  const deviceAccountLink = useDeviceAccountLink();
  const { t, message } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const apiClient = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        retryAttempts: config.retryAttempts,
      }),
    [config.serverUrl, config.requestTimeout, config.retryAttempts]
  );

  const accountEmailClient = useMemo(
    () =>
      new AccountEmailApiClient(
        config.serverUrl,
        config.requestTimeout,
        config.retryAttempts,
        _internal?.getAccessToken
      ),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal?.getAccessToken]
  );

  // Rate limiter for instant link attempts (3 attempts per 5 minutes)
  const { checkLimit, getRemainingAttempts } = useRateLimiter({
    maxAttempts: 3,
    windowMs: 300000,
    rateLimitMessage: (seconds) => message(t.errors.rateLimitedWithSeconds, { seconds }),
  });

  const sendInstantLink = useCallback(
    async (email: string): Promise<void> => {
      // Validate email format before API call
      if (!validateEmail(email)) {
        const validationError: AuthError = {
          code: 'VALIDATION_ERROR',
          message: t.errors.invalidEmail,
        };
        setError(validationError);
        throw validationError;
      }

      // Check rate limit before API call
      try {
        checkLimit();
      } catch (err) {
        const rateLimitError: AuthError = {
          code: 'RATE_LIMITED',
          message: err instanceof Error ? err.message : t.errors.tooManyRequests,
        };
        setError(rateLimitError);
        throw rateLimitError;
      }

      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        const deviceDecision = await deviceAccountLink.requestDeviceAccountLink({
          identifier: email,
          method: 'instantLink',
          linkExisting: async (_hint, signedInResponse) => {
            await accountEmailClient.addEmail(email);
            return signedInResponse;
          },
        });
        if (deviceDecision.action === 'linked') {
          setIsSuccess(true);
          return;
        }

        await apiClient.post('/instant-link', {
          email,
          referral: _internal?.getReferralCode?.() ?? undefined,
        });
        setIsSuccess(true);
      } catch (err) {
        const authError = handleApiError(err, t.errors.signInFallback, {
          networkMessage: t.errors.unableToReachServer,
        });
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [accountEmailClient, apiClient, checkLimit, deviceAccountLink, _internal, t.errors]
  );

  const verifyInstantLink = useCallback(
    async (token: string): Promise<AuthResponse | MfaRequiredResponse> => {
      if (!token || token.trim().length === 0) {
        const validationError: AuthError = {
          code: 'VALIDATION_ERROR',
          message: t.errors.linkExpired,
        };
        setError(validationError);
        throw validationError;
      }

      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        const data = await apiClient.post<AuthResponse | MfaRequiredResponse>(
          '/instant-link/verify',
          {
            token,
          }
        );

        if (isMfaRequiredResponse(data)) {
          return data;
        }

        // Successful login
        config.callbacks?.onLoginSuccess?.(data.user, 'email');
        _internal?.handleLoginSuccess(data.user, data.tokens);
        return data;
      } catch (err) {
        const authError = handleApiError(err, t.errors.signInFallback, {
          networkMessage: t.errors.unableToReachServer,
        });
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, config.callbacks, _internal, t.errors]
  );

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    setError(null);
    setIsSuccess(false);
    setIsLoading(false);
  }, []);

  return {
    sendInstantLink,
    verifyInstantLink,
    isLoading,
    isSuccess,
    error,
    clearError,
    reset,
    remainingAttempts: getRemainingAttempts(),
  };
}
