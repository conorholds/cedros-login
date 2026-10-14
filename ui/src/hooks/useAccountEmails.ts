import { useCallback, useMemo, useState } from 'react';
import { useExternalEffect } from './effects';
import type { AccountEmail, AuthError, UseAccountEmailsReturn } from '../types';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { AccountEmailApiClient } from '../utils/accountEmailApi';

/**
 * Hook for managing email identifiers on the authenticated account.
 *
 * Auto-fetches when authenticated. Mutations refresh local email state from the
 * server response so primary/verified invariants stay server-owned.
 */
export function useAccountEmails(): UseAccountEmailsReturn {
  const { config, authState, _internal } = useCedrosLogin();

  const [emails, setEmails] = useState<AccountEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const apiClient = useMemo(
    () =>
      new AccountEmailApiClient(
        config.serverUrl,
        config.requestTimeout,
        config.retryAttempts,
        _internal?.getAccessToken
      ),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchEmails = useCallback(async () => {
    if (authState !== 'authenticated') {
      setEmails([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setEmails(await apiClient.listEmails());
    } catch (err) {
      setError(err as AuthError);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, authState]);

  useExternalEffect(() => {
    if (authState === 'authenticated') {
      fetchEmails();
    } else {
      setEmails([]);
    }
  }, [authState, fetchEmails]);

  const runMutation = useCallback(
    async (mutate: () => Promise<AccountEmail[] | void>) => {
      setIsLoading(true);
      setError(null);
      try {
        const next = await mutate();
        if (next) {
          setEmails(next);
        } else {
          await fetchEmails();
        }
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchEmails]
  );

  const addEmail = useCallback(
    async (email: string) => {
      await runMutation(() => apiClient.addEmail(email));
    },
    [apiClient, runMutation]
  );

  const resendEmail = useCallback(
    async (id: string) => {
      await runMutation(() => apiClient.resendEmail(id));
    },
    [apiClient, runMutation]
  );

  const removeEmail = useCallback(
    async (id: string) => {
      await runMutation(() => apiClient.removeEmail(id));
    },
    [apiClient, runMutation]
  );

  const setPrimaryEmail = useCallback(
    async (id: string) => {
      await runMutation(() => apiClient.setPrimaryEmail(id));
    },
    [apiClient, runMutation]
  );

  const verifyEmail = useCallback(
    async (token: string) => {
      await runMutation(() => apiClient.verifyEmail(token));
    },
    [apiClient, runMutation]
  );

  return {
    emails,
    isLoading,
    error,
    fetchEmails,
    addEmail,
    resendEmail,
    removeEmail,
    setPrimaryEmail,
    verifyEmail,
    clearError,
  };
}
