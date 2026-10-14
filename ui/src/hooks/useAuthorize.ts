import { useState, useCallback, useMemo } from 'react';
import type { AuthorizeRequest, AuthError } from '../types';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { OrgApiClient } from '../utils/orgApi';

export interface AuthorizationCheck {
  allowed: boolean;
  reason?: string;
  isLoading: boolean;
  error: AuthError | null;
}

export interface UseAuthorizeReturn {
  /**
   * Check if an action is authorized server-side.
   * Use this for dynamic authorization checks.
   */
  authorize: (request: AuthorizeRequest) => Promise<boolean>;
  /**
   * Authorization state for the last check
   */
  lastCheck: AuthorizationCheck;
  /**
   * Clear the last authorization check
   */
  clearCheck: () => void;
  /**
   * Check authorization and return detailed result
   */
  checkAuthorization: (request: AuthorizeRequest) => Promise<AuthorizationCheck>;
}

/**
 * Hook for server-side authorization checks.
 *
 * This hook allows you to check if a specific action is authorized
 * by making a request to the server's /authorize endpoint.
 *
 * For simple permission checks based on the user's role, use `useOrgs().hasPermission()` instead.
 *
 * @example
 * ```tsx
 * function DeleteButton({ resourceId }: { resourceId: string }) {
 *   const { authorize, lastCheck } = useAuthorize();
 *   const { activeOrg } = useOrgs();
 *
 *   const handleDelete = async () => {
 *     const allowed = await authorize({
 *       orgId: activeOrg?.id!,
 *       action: 'delete',
 *       resource: 'document',
 *       resourceId,
 *     });
 *
 *     if (allowed) {
 *       // Proceed with delete
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleDelete} disabled={lastCheck.isLoading}>
 *       Delete
 *     </button>
 *   );
 * }
 * ```
 */
export function useAuthorize(): UseAuthorizeReturn {
  const { config, _internal } = useCedrosLogin();

  const [lastCheck, setLastCheck] = useState<AuthorizationCheck>({
    allowed: false,
    reason: undefined,
    isLoading: false,
    error: null,
  });

  const apiClient = useMemo(
    () =>
      new OrgApiClient(
        config.serverUrl,
        config.requestTimeout,
        config.retryAttempts,
        _internal?.getAccessToken
      ),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal]
  );

  const checkAuthorization = useCallback(
    async (request: AuthorizeRequest): Promise<AuthorizationCheck> => {
      setLastCheck((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await apiClient.authorize(request);
        const result: AuthorizationCheck = {
          allowed: response.allowed,
          reason: response.reason,
          isLoading: false,
          error: null,
        };
        setLastCheck(result);
        return result;
      } catch (err) {
        const result: AuthorizationCheck = {
          allowed: false,
          reason: undefined,
          isLoading: false,
          error: err as AuthError,
        };
        setLastCheck(result);
        return result;
      }
    },
    [apiClient]
  );

  const authorize = useCallback(
    async (request: AuthorizeRequest): Promise<boolean> => {
      const result = await checkAuthorization(request);
      return result.allowed;
    },
    [checkAuthorization]
  );

  const clearCheck = useCallback(() => {
    setLastCheck({
      allowed: false,
      reason: undefined,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    authorize,
    lastCheck,
    clearCheck,
    checkAuthorization,
  };
}
