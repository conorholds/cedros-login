import { useExternalEffect } from './effects';
import { useState, useCallback, useMemo, useRef } from 'react';
import type { DashboardSection, DashboardPermissions, AuthError } from '../types';
import { DEFAULT_DASHBOARD_PERMISSIONS } from '../types/dashboardPermissions';
import { useCedrosLoginAdminClientContext } from './useCedrosLoginAdminClientContext';
import { useOrgs } from './useOrgs';
import { ApiClient } from '../utils/apiClient';

const DENY_DASHBOARD_PERMISSIONS: DashboardPermissions = {
  admin: Object.fromEntries(
    Object.keys(DEFAULT_DASHBOARD_PERMISSIONS.admin).map((section) => [section, false])
  ) as DashboardPermissions['admin'],
  member: Object.fromEntries(
    Object.keys(DEFAULT_DASHBOARD_PERMISSIONS.member).map((section) => [section, false])
  ) as DashboardPermissions['member'],
};

export interface UseDashboardPermissionsReturn {
  /** Current dashboard permissions config */
  permissions: DashboardPermissions;
  /** Whether the current user can access a specific section */
  canAccess: (section: DashboardSection) => boolean;
  /** Update permissions (owner only) */
  updatePermissions: (permissions: DashboardPermissions) => Promise<void>;
  /** Loading state */
  isLoading: boolean;
  /** Updating state */
  isUpdating: boolean;
  /** Error state */
  error: AuthError | null;
  /** Refresh permissions from server */
  fetchPermissions: () => Promise<void>;
}

/**
 * Hook for managing dashboard permissions per role.
 *
 * Allows org owners to configure which dashboard sections each role can access.
 * - Owner always has full access (not configurable)
 * - Admin and Member roles are configurable
 *
 * @example
 * ```tsx
 * function AdminDashboard() {
 *   const { canAccess, permissions, updatePermissions } = useDashboardPermissions();
 *
 *   // Check if current user can access a section
 *   if (!canAccess('users')) {
 *     return <div>You don't have access to users</div>;
 *   }
 *
 *   // Update permissions (owner only)
 *   const toggleMemberUsers = () => {
 *     updatePermissions({
 *       ...permissions,
 *       member: { ...permissions.member, users: !permissions.member.users },
 *     });
 *   };
 * }
 * ```
 */
export function useDashboardPermissions(): UseDashboardPermissionsReturn {
  // Admin-only hook (PermissionsSection): read from the admin runtime bridge,
  // not the full CedrosLoginProvider (absent in the admin runtime). Mirrors useOrgs.
  const { config, authState, _internal } = useCedrosLoginAdminClientContext();
  const { activeOrg, role } = useOrgs();

  const [permissions, setPermissions] = useState<DashboardPermissions>(
    DEFAULT_DASHBOARD_PERMISSIONS
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const requestIdRef = useRef(0);

  const apiClient = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        retryAttempts: config.retryAttempts,
        getAccessToken: _internal?.getAccessToken,
      }),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal]
  );

  // Use ref to avoid apiClient in callback dependencies
  const apiClientRef = useRef(apiClient);
  apiClientRef.current = apiClient;

  const fetchPermissions = useCallback(async () => {
    if (authState !== 'authenticated' || !activeOrg) {
      setPermissions(DEFAULT_DASHBOARD_PERMISSIONS);
      return;
    }

    setIsLoading(true);
    setError(null);
    const requestId = ++requestIdRef.current;

    try {
      const response = await apiClientRef.current.get<{ permissions: DashboardPermissions }>(
        '/admin/dashboard-permissions'
      );
      if (requestId !== requestIdRef.current) return;
      setPermissions(response.permissions);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const message = err instanceof Error ? err.message : 'Failed to fetch permissions';
      setError({ code: 'NETWORK_ERROR', message } as AuthError);
      // Fail closed on fetch error so access is never widened by client-side fallbacks
      setPermissions(DENY_DASHBOARD_PERMISSIONS);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [authState, activeOrg]);

  const updatePermissions = useCallback(
    async (newPermissions: DashboardPermissions): Promise<void> => {
      if (authState !== 'authenticated' || !activeOrg) {
        throw new Error('Not authenticated');
      }

      if (role !== 'owner') {
        throw new Error('Only owners can modify dashboard permissions');
      }

      setIsUpdating(true);
      setError(null);

      try {
        await apiClientRef.current.request<{ permissions: DashboardPermissions }>({
          method: 'PUT',
          path: '/admin/dashboard-permissions',
          body: newPermissions,
        });
        setPermissions(newPermissions);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update permissions';
        const authError = { code: 'NETWORK_ERROR', message } as AuthError;
        setError(authError);
        throw new Error(message);
      } finally {
        setIsUpdating(false);
      }
    },
    [authState, activeOrg, role]
  );

  /**
   * Check if the current user can access a dashboard section
   * - No org context (system admin): full access (permissions are org-scoped)
   * - Owner: always has full access
   * - Admin: check permissions.admin[section]
   * - Member: check permissions.member[section]
   */
  const canAccess = useCallback(
    (section: DashboardSection): boolean => {
      // No org context = system admin level, allow all
      // (dashboard permissions are org-scoped, not system-scoped)
      if (!activeOrg || !role) {
        return true;
      }

      // Owner always has full access
      if (role === 'owner') {
        return true;
      }

      // Admin and member: check configured permissions
      const rolePermissions = permissions[role as 'admin' | 'member'];
      return rolePermissions?.[section] ?? false;
    },
    [activeOrg, role, permissions]
  );

  // Fetch permissions when org changes
  useExternalEffect(() => {
    if (activeOrg?.id) {
      fetchPermissions();
    }
  }, [activeOrg?.id, fetchPermissions]);

  return {
    permissions,
    canAccess,
    updatePermissions,
    isLoading,
    isUpdating,
    error,
    fetchPermissions,
  };
}
