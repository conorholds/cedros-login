/**
 * Hook for setting an initial password (OAuth-only users)
 *
 * Calls POST /auth/set-password. Only succeeds for users who don't yet
 * have a password (Google/Apple/SSO-only accounts).
 */

import { useState, useCallback, useMemo } from 'react';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { ApiClient, handleApiError } from '../utils/apiClient';
import type { AuthError } from '../types';

export interface UseSetPasswordReturn {
  /** Set initial password for the current user */
  setPassword: (password: string) => Promise<void>;
  isLoading: boolean;
  error: AuthError | null;
}

export function useSetPassword(): UseSetPasswordReturn {
  const { config, _internal } = useCedrosLogin();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

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

  const setPasswordFn = useCallback(
    async (password: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await apiClient.post('/set-password', { password });
      } catch (err) {
        const authError = handleApiError(err, 'Failed to set password');
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient]
  );

  return {
    setPassword: setPasswordFn,
    isLoading,
    error,
  };
}
