import { useState, useCallback, useMemo } from 'react';
import type { AuthError } from '../types';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { ApiClient, handleApiError } from '../utils/apiClient';

const DELETE_CONFIRM_TEXT = 'DELETE';

export interface UseAccountDeletionReturn {
  isLoading: boolean;
  error: AuthError | null;
  accountDeletionUrl: string;
  requestDeletionEmail: (email: string) => Promise<void>;
  deleteAccount: (confirmText?: string) => Promise<void>;
  clearError: () => void;
}

export function useAccountDeletion(): UseAccountDeletionReturn {
  const { config, logout } = useCedrosLogin();
  const [isLoading, setIsLoading] = useState(false);
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

  const accountDeletionUrl = useMemo(
    () => `${config.serverUrl.replace(/\/$/, '')}/account-deletion`,
    [config.serverUrl]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const requestDeletionEmail = useCallback(
    async (email: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await apiClient.post('/account-deletion/request', { email });
      } catch (err) {
        const authError = handleApiError(
          err,
          'Unable to send the account deletion link. Please try again.'
        );
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient]
  );

  const deleteAccount = useCallback(
    async (confirmText: string = DELETE_CONFIRM_TEXT) => {
      setIsLoading(true);
      setError(null);

      try {
        await apiClient.post('/account-deletion/me', { confirmText });
        await logout().catch(() => undefined);
      } catch (err) {
        const authError = handleApiError(
          err,
          'Unable to delete the account. Please review the requirements and try again.'
        );
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, logout]
  );

  return {
    isLoading,
    error,
    accountDeletionUrl,
    requestDeletionEmail,
    deleteAccount,
    clearError,
  };
}
