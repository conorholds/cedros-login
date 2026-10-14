import { useExternalEffect } from './effects';
import { useState, useCallback, useMemo } from 'react';
import type { Credential, AuthError, UseCredentialsReturn } from '../types';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { CredentialApiClient } from '../utils/credentialApi';

/**
 * Hook for managing user credentials (linked sign-in methods).
 *
 * Auto-fetches when authenticated. Provides list, unlink, and refresh operations.
 *
 * @example
 * ```tsx
 * function LinkedAccountsPage() {
 *   const { credentials, isLoading, unlinkCredential } = useCredentials();
 *
 *   return (
 *     <ul>
 *       {credentials.map(cred => (
 *         <li key={cred.id}>
 *           {cred.credentialType}
 *           <button onClick={() => unlinkCredential(cred.id)}>Remove</button>
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useCredentials(): UseCredentialsReturn {
  const { config, authState, _internal } = useCedrosLogin();

  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const apiClient = useMemo(
    () =>
      new CredentialApiClient(
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

  const fetchCredentials = useCallback(async () => {
    if (authState !== 'authenticated') {
      setCredentials([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetched = await apiClient.listCredentials();
      setCredentials(fetched);
    } catch (err) {
      setError(err as AuthError);
    } finally {
      setIsLoading(false);
    }
  }, [authState, apiClient]);

  // Auto-fetch when authenticated
  useExternalEffect(() => {
    if (authState === 'authenticated') {
      fetchCredentials();
    } else {
      setCredentials([]);
    }
  }, [authState, fetchCredentials]);

  const unlinkCredential = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await apiClient.unlinkCredential(id);
        // Refresh list after unlinking
        await fetchCredentials();
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, fetchCredentials]
  );

  return {
    credentials,
    isLoading,
    error,
    fetchCredentials,
    unlinkCredential,
    clearError,
  };
}
