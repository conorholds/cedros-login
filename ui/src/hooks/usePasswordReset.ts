import { useState, useCallback, useMemo } from 'react';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { validateEmail } from '../utils/validation';
import { useRateLimiter } from './useRateLimiter';
import { ApiClient, handleApiError } from '../utils/apiClient';
import { useI18n } from '../i18n';
import type { AuthError } from '../types';

export interface UsePasswordResetReturn {
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  error: AuthError | null;
  clearError: () => void;
  reset: () => void;
  /** Number of remaining attempts before rate limiting */
  remainingAttempts: number;
}

/**
 * Hook for password reset functionality.
 *
 * @example
 * ```tsx
 * function ForgotPasswordForm() {
 *   const { forgotPassword, isLoading, isSuccess, error } = usePasswordReset();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     await forgotPassword(email);
 *   };
 *
 *   if (isSuccess) {
 *     return <p>Check your email for reset instructions</p>;
 *   }
 * }
 * ```
 */
export function usePasswordReset(): UsePasswordResetReturn {
  const { config } = useCedrosLogin();
  const { t, message } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // Use ApiClient for consistent error handling and timeout/retry
  const apiClient = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        retryAttempts: config.retryAttempts,
      }),
    [config.serverUrl, config.requestTimeout, config.retryAttempts]
  );

  // Rate limiter for password reset attempts (3 attempts per 5 minutes)
  const { checkLimit, getRemainingAttempts } = useRateLimiter({
    maxAttempts: 3,
    windowMs: 300000,
    rateLimitMessage: (seconds) => message(t.errors.rateLimitedWithSeconds, { seconds }),
  });

  const forgotPassword = useCallback(
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
        // Use ApiClient for consistent error handling
        await apiClient.post('/forgot-password', { email });
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
    [apiClient, checkLimit, t.errors]
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        // Use ApiClient for consistent error handling
        await apiClient.post('/reset-password', { token, newPassword });
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
    [apiClient, t.errors]
  );

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    setError(null);
    setIsSuccess(false);
    setIsLoading(false);
  }, []);

  return {
    forgotPassword,
    resetPassword,
    isLoading,
    isSuccess,
    error,
    clearError,
    reset,
    remainingAttempts: getRemainingAttempts(),
  };
}
