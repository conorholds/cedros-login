import { useState, useCallback, useMemo } from 'react';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { ApiClient, handleApiError } from '../utils/apiClient';
import { useRateLimiter } from './useRateLimiter';
import { useI18n } from '../i18n';
import type { AuthError, AuthResponse, TotpVerifyState } from '../types';

export interface UseTotpVerifyReturn {
  /** Verification state */
  state: TotpVerifyState;
  /** Whether verification is in progress */
  isLoading: boolean;
  /** Error from the last request */
  error: AuthError | null;
  /** Verify MFA code during login */
  verifyTotp: (mfaToken: string, code: string) => Promise<AuthResponse>;
  /** Clear error state */
  clearError: () => void;
  /** Reset to initial state */
  reset: () => void;
  /** Number of remaining verification attempts before rate limiting */
  remainingAttempts: number;
  /** Time in ms until rate limit resets (0 if not rate limited) */
  timeUntilReset: number;
}

/**
 * Hook for verifying TOTP codes during the login flow.
 *
 * Used when a user has TOTP enabled and needs to provide
 * their 6-digit code after password authentication.
 *
 * @example
 * ```tsx
 * function TotpVerifyStep({ mfaToken }) {
 *   const { verifyTotp, isLoading, error } = useTotpVerify();
 *
 *   const handleVerify = async (code: string) => {
 *     const response = await verifyTotp(mfaToken, code);
 *     // User is now authenticated
 *   };
 * }
 * ```
 */
export function useTotpVerify(): UseTotpVerifyReturn {
  const { config, _internal } = useCedrosLogin();
  const { t, message } = useI18n();
  const [state, setState] = useState<TotpVerifyState>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // Rate limiter for TOTP verification (5 attempts per 2 minutes)
  // Stricter than login to prevent brute force on short codes
  const {
    checkLimit,
    getRemainingAttempts,
    getTimeUntilReset,
    reset: resetRateLimit,
  } = useRateLimiter({
    maxAttempts: 5,
    windowMs: 120000,
    rateLimitMessage: (seconds) => message(t.errors.rateLimitedWithSeconds, { seconds }),
  });

  const apiClient = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        retryAttempts: config.retryAttempts,
      }),
    [config.serverUrl, config.requestTimeout, config.retryAttempts]
  );

  const verifyTotp = useCallback(
    async (mfaToken: string, code: string): Promise<AuthResponse> => {
      // Validate code format (6 digits or recovery code)
      const isRecoveryCode =
        /^[A-Z0-9]{16}$/i.test(code) || /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/i.test(code);
      const isValidCode = /^\d{6}$/.test(code) || isRecoveryCode;
      if (!isValidCode) {
        const validationError: AuthError = {
          code: 'VALIDATION_ERROR',
          message: t.auth.invalidTotpCode,
        };
        setError(validationError);
        throw validationError;
      }

      // Rate limit check before API call to prevent brute force
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
      setState('verifying');

      try {
        const response = await apiClient.post<AuthResponse>('/login/mfa', { mfaToken, code });

        setState('success');
        resetRateLimit(); // Reset on successful verification

        config.callbacks?.onLoginSuccess?.(response.user, response.method ?? 'email');

        // Complete authentication via internal API
        if (_internal && response.user && response.tokens) {
          _internal.handleLoginSuccess(response.user, response.tokens);
        }

        return response;
      } catch (err) {
        const authError = handleApiError(err, t.auth.incorrectVerificationCode, {
          networkMessage: t.errors.unableToReachServer,
        });
        setError(authError);
        setState('error');
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, config.callbacks, _internal, checkLimit, resetRateLimit, t.auth, t.errors]
  );

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    setError(null);
    setState('idle');
    setIsLoading(false);
  }, []);

  return {
    state,
    isLoading,
    error,
    verifyTotp,
    clearError,
    reset,
    // Point-in-time snapshots for UI display
    remainingAttempts: getRemainingAttempts(),
    timeUntilReset: getTimeUntilReset(),
  };
}
