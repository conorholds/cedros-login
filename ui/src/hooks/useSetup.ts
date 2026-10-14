import { useState, useCallback, useMemo, useRef } from 'react';
import type {
  SetupStatusResponse,
  CreateFirstAdminRequest,
  CreateFirstAdminResponse,
  UseSetupReturn,
} from '../types/setup';
import { useCedrosLoginOptional } from '../context/useCedrosLogin';
import { useCedrosLoginAdminClientContextOptional } from './useCedrosLoginAdminClientContext';
import { SetupApiClient } from '../utils/setupApi';

/**
 * Hook for first-run setup operations.
 *
 * Checks if setup is needed (no admin exists) and provides
 * ability to create the first admin user.
 *
 * @example
 * ```tsx
 * function SetupCheck() {
 *   const { status, isLoading, checkStatus, createAdmin } = useSetup();
 *
 *   useExternalEffect(() => {
 *     checkStatus();
 *   }, [checkStatus]);
 *
 *   if (isLoading) return <Loading />;
 *   if (status?.needsSetup) {
 *     return <SetupWizard onCreateAdmin={createAdmin} />;
 *   }
 *   return <AdminRoute />;
 * }
 * ```
 */
export function useSetup(): UseSetupReturn {
  // Public hook + used by SetupWizard inside the admin runtime. Resolve transport
  // config from whichever context is mounted: the admin runtime bridge (no
  // CedrosLoginProvider there — useCedrosLogin() threw and blanked the wizard) or
  // the full provider (external consumers). Prefer the admin bridge when present.
  const adminClientContext = useCedrosLoginAdminClientContextOptional();
  const loginContext = useCedrosLoginOptional();
  const config = adminClientContext?.config ?? loginContext?.config;
  if (!config) {
    throw new Error(
      'useSetup must be used within a CedrosLoginProvider or the login admin runtime'
    );
  }

  const [status, setStatus] = useState<SetupStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const apiClient = useMemo(
    () => new SetupApiClient(config.serverUrl, config.requestTimeout, config.retryAttempts),
    [config.serverUrl, config.requestTimeout, config.retryAttempts]
  );

  // Use ref to avoid apiClient in callback dependencies
  const apiClientRef = useRef(apiClient);
  apiClientRef.current = apiClient;

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const requestId = ++requestIdRef.current;

    try {
      const response = await apiClientRef.current.getStatus();
      if (requestId !== requestIdRef.current) return;
      setStatus(response);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err : new Error('Failed to check setup status'));
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const createAdmin = useCallback(
    async (request: CreateFirstAdminRequest): Promise<CreateFirstAdminResponse> => {
      setIsCreating(true);
      setError(null);

      try {
        const response = await apiClientRef.current.createFirstAdmin(request);
        // Refresh status after creating admin
        await checkStatus();
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create admin');
        setError(error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [checkStatus]
  );

  return {
    status,
    isLoading,
    isCreating,
    error,
    checkStatus,
    createAdmin,
  };
}
