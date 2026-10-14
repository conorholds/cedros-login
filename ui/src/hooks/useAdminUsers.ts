import { useState, useCallback, useMemo, useRef } from 'react';
import { useExternalEffect } from './effects';
import { AdminUserApiClient } from '../utils/adminUserApi';
import { useCedrosLoginAdminClientContext } from './useCedrosLoginAdminClientContext';
import type {
  AdminUser,
  AdminUserStatsResponse,
  ListAdminUsersResponse,
  ListUsersParams,
  UpdateUserRequest,
  UseAdminUsersReturn,
} from '../types';

/**
 * Hook for admin user management operations
 *
 * Provides methods to list all users, get individual users,
 * and manage system admin status. Requires system admin privileges.
 *
 * @example
 * ```tsx
 * function UserManagement() {
 *   const { users, total, isLoading, listUsers, setSystemAdmin } = useAdminUsers();
 *
 *   useExternalEffect(() => {
 *     listUsers({ limit: 20 });
 *   }, [listUsers]);
 *
 *   return (
 *     <AdminUserList
 *       users={users}
 *       total={total}
 *       isLoading={isLoading}
 *       onToggleAdmin={(userId, isAdmin) => setSystemAdmin(userId, isAdmin)}
 *     />
 *   );
 * }
 * ```
 */
export function useAdminUsers(): UseAdminUsersReturn {
  const { config, user, authState, _internal } = useCedrosLoginAdminClientContext();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastParams, setLastParams] = useState<ListUsersParams>({});
  const requestIdRef = useRef(0);
  const identityRef = useRef(user?.id ?? null);

  const apiClient = useMemo(
    () =>
      new AdminUserApiClient(
        config.serverUrl,
        config.requestTimeout,
        config.retryAttempts,
        _internal?.getAccessToken
      ),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal]
  );

  const listUsers = useCallback(
    async (params?: ListUsersParams): Promise<ListAdminUsersResponse> => {
      if (authState !== 'authenticated' || !user) {
        throw new Error('Not authenticated');
      }
      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setError(null);
      setLastParams(params || {});

      try {
        const response = await apiClient.listUsers(params);
        if (requestId !== requestIdRef.current) throw staleRequestError();
        setUsers(response.users);
        setTotal(response.total);
        return response;
      } catch (err) {
        if (requestId !== requestIdRef.current) throw err;
        const error = err instanceof Error ? err : new Error('Failed to list users');
        setError(error);
        throw error;
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    },
    [apiClient, authState, user]
  );

  useExternalEffect(() => {
    const identity = user?.id ?? null;
    if (identityRef.current === identity && authState === 'authenticated') return;
    identityRef.current = identity;
    requestIdRef.current += 1;
    setUsers([]);
    setTotal(0);
    setIsLoading(false);
    setError(null);
  }, [authState, user?.id]);

  const getUser = useCallback(
    async (userId: string): Promise<AdminUser> => {
      setIsLoading(true);
      setError(null);

      try {
        return await apiClient.getUser(userId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get user');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient]
  );

  const setSystemAdmin = useCallback(
    async (userId: string, isAdmin: boolean): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await apiClient.setSystemAdmin(userId, isAdmin);
        // Update local state
        setUsers((prev) =>
          prev.map((user) => (user.id === userId ? { ...user, isSystemAdmin: isAdmin } : user))
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update admin status');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient]
  );

  const updateUser = useCallback(
    async (userId: string, data: UpdateUserRequest): Promise<AdminUser> => {
      setIsLoading(true);
      setError(null);

      try {
        const updated = await apiClient.updateUser(userId, data);
        // Update local state
        setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
        return updated;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update user');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient]
  );

  const deleteUser = useCallback(
    async (userId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await apiClient.deleteUser(userId);
        // Remove from local state
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        setTotal((prev) => prev - 1);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete user');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient]
  );

  const forcePasswordReset = useCallback(
    async (userId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await apiClient.forcePasswordReset(userId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to send password reset');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient]
  );

  const getStats = useCallback(async (): Promise<AdminUserStatsResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      return await apiClient.getStats();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get user stats');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  const refresh = useCallback(async () => {
    await listUsers(lastParams);
  }, [listUsers, lastParams]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    users,
    total,
    isLoading,
    error,
    listUsers,
    getUser,
    setSystemAdmin,
    updateUser,
    deleteUser,
    forcePasswordReset,
    getStats,
    refresh,
    clearError,
  };
}

function staleRequestError(): Error {
  const error = new Error('Request identity changed before completion');
  error.name = 'AbortError';
  return error;
}
