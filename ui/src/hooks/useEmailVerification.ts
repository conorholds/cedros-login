import { useCallback, useMemo, useState } from 'react';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { useTranslations } from '../i18n';
import type { AuthError } from '../types';
import { ApiClient, handleApiError } from '../utils/apiClient';
import { safeReturnToPath } from '../utils/returnTo';

export function useEmailVerification() {
  const { config } = useCedrosLogin();
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const apiClient = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        retryAttempts: config.retryAttempts,
      }),
    [config.requestTimeout, config.retryAttempts, config.serverUrl]
  );

  const resend = useCallback(
    async (email: string) => {
      setIsLoading(true);
      setSent(false);
      setError(null);
      try {
        const returnTo = safeReturnToPath(
          typeof window === 'undefined' ? undefined : window.location.href
        );
        await apiClient.post('/send-verification', {
          email,
          ...(returnTo ? { returnTo } : {}),
        });
        setSent(true);
      } catch (cause) {
        const authError = handleApiError(cause, t.errors.serverError, {
          networkMessage: t.errors.unableToReachServer,
        });
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, t.errors.serverError, t.errors.unableToReachServer]
  );

  return {
    resend,
    isLoading,
    sent,
    error,
    clearError: () => setError(null),
  };
}
