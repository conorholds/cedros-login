import { useState, useCallback, useMemo } from 'react';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { ApiClient, handleApiError } from '../utils/apiClient';

interface CheckUsernameResponse {
  available: boolean;
  suggestion?: string;
  error?: string;
}

/**
 * Return type for the useUsername hook
 */
export interface UseUsernameReturn {
  /** Check if a username is available. Returns availability + optional suggestion. */
  checkAvailability: (username: string) => Promise<CheckUsernameResponse>;
  /** Get a random username suggestion from the server. */
  getSuggestion: () => Promise<string | null>;
  /** Set the current user's username via PATCH /auth/me. */
  setUsername: (username: string) => Promise<void>;
  /** Whether a request is in progress */
  isLoading: boolean;
  /** Error from the last operation */
  error: Error | null;
}

/**
 * Hook for username availability checking and setting.
 *
 * @example
 * ```tsx
 * const { checkAvailability, getSuggestion, setUsername } = useUsername();
 *
 * // Get a random suggestion
 * const suggestion = await getSuggestion();
 *
 * // Check if a username is available
 * const result = await checkAvailability('swift_falcon_42');
 * if (result.available) {
 *   await setUsername('swift_falcon_42');
 * }
 * ```
 */
export function useUsername(): UseUsernameReturn {
  const { config, _internal } = useCedrosLogin();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const apiClient = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        getAccessToken: _internal?.getAccessToken,
      }),
    [config.serverUrl, config.requestTimeout, _internal]
  );

  const checkAvailability = useCallback(
    async (username: string): Promise<CheckUsernameResponse> => {
      const resp = await apiClient.get<CheckUsernameResponse>(
        `/username/available?username=${encodeURIComponent(username)}`,
        { credentials: 'include' }
      );
      return resp;
    },
    [apiClient]
  );

  const getSuggestion = useCallback(async (): Promise<string | null> => {
    try {
      const resp = await apiClient.get<CheckUsernameResponse>('/username/available?username=', {
        credentials: 'include',
      });
      return resp.suggestion ?? null;
    } catch {
      return null;
    }
  }, [apiClient]);

  const setUsername = useCallback(
    async (username: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await apiClient.patch('/me', { username });
      } catch (err) {
        // apiClient rejects with a structured ApiErrorResponse (not an Error);
        // handleApiError extracts the real server message so consumers reading
        // error.message never see "[object Object]".
        const e = new Error(
          handleApiError(err, 'Unable to update your username. Please try again.').message
        );
        setError(e);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient]
  );

  return { checkAvailability, getSuggestion, setUsername, isLoading, error };
}
