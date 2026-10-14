/**
 * Hook for managing SSO providers (admin)
 */
import { useState, useCallback, useMemo } from 'react';
import { useCedrosLoginAdminClientContext } from './useCedrosLoginAdminClientContext';
import { ApiClient, handleApiError } from '../utils/apiClient';

export interface SsoProvider {
  id: string;
  orgId: string;
  name: string;
  issuerUrl: string;
  clientId: string;
  scopes: string[];
  enabled: boolean;
  allowRegistration: boolean;
  emailDomain: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSsoProviderInput {
  orgId: string;
  name: string;
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  scopes?: string[];
  enabled?: boolean;
  allowRegistration?: boolean;
  emailDomain?: string | null;
}

export interface UpdateSsoProviderInput {
  name?: string;
  issuerUrl?: string;
  clientId?: string;
  clientSecret?: string;
  scopes?: string[];
  enabled?: boolean;
  allowRegistration?: boolean;
  emailDomain?: string | null;
}

interface ListResponse {
  providers: SsoProvider[];
  total: number;
  limit: number;
  offset: number;
}

export function useSsoProviders() {
  // Admin-only hook: read transport/auth from the admin runtime bridge, not the
  // full CedrosLoginProvider (which isn't mounted in the admin runtime — using
  // useCedrosLogin() here threw and blanked the SSO providers tab). Mirrors useOrgs.
  const { config, _internal } = useCedrosLoginAdminClientContext();

  const [providers, setProviders] = useState<SsoProvider[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

  const fetchProviders = useCallback(
    async (orgId?: string, limit = 50, offset = 0) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (orgId) params.set('org_id', orgId);
        params.set('limit', String(limit));
        params.set('offset', String(offset));

        const data = await apiClient.get<ListResponse>(`/admin/sso-providers?${params}`);
        setProviders(data.providers);
        setTotal(data.total);
        return data;
      } catch (err) {
        const authError = handleApiError(err, 'Failed to fetch SSO providers');
        const error = new Error(authError.message);
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient]
  );

  const createProvider = useCallback(
    async (input: CreateSsoProviderInput): Promise<SsoProvider> => {
      setIsLoading(true);
      setError(null);
      try {
        const provider = await apiClient.post<SsoProvider>('/admin/sso-providers', input);
        setProviders((prev) => [...prev, provider]);
        setTotal((prev) => prev + 1);
        return provider;
      } catch (err) {
        const authError = handleApiError(err, 'Failed to create SSO provider');
        const error = new Error(authError.message);
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient]
  );

  const updateProvider = useCallback(
    async (id: string, input: UpdateSsoProviderInput): Promise<SsoProvider> => {
      setIsLoading(true);
      setError(null);
      try {
        const provider = await apiClient.request<SsoProvider>({
          method: 'PUT',
          path: `/admin/sso-providers/${id}`,
          body: input,
        });
        setProviders((prev) => prev.map((p) => (p.id === id ? provider : p)));
        return provider;
      } catch (err) {
        const authError = handleApiError(err, 'Failed to update SSO provider');
        const error = new Error(authError.message);
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient]
  );

  const deleteProvider = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await apiClient.delete(`/admin/sso-providers/${id}`);

        setProviders((prev) => prev.filter((p) => p.id !== id));
        setTotal((prev) => prev - 1);
      } catch (err) {
        const authError = handleApiError(err, 'Failed to delete SSO provider');
        const error = new Error(authError.message);
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient]
  );

  const toggleProvider = useCallback(
    async (id: string, enabled: boolean): Promise<SsoProvider> => {
      return updateProvider(id, { enabled });
    },
    [updateProvider]
  );

  return {
    providers,
    total,
    isLoading,
    error,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    toggleProvider,
  };
}
