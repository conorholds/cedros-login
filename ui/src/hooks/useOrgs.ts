import { useExternalEffect } from './effects';
import { useState, useCallback, useMemo, useRef } from 'react';
import type {
  OrgWithMembership,
  Organization,
  CreateOrgRequest,
  UpdateOrgRequest,
  Permission,
  OrgRole,
  AuthError,
} from '../types';
import { OrgApiClient } from '../utils/orgApi';
import { safeGetItem, safeRemoveItem, safeSetItem } from '../utils/safeStorage';
import { useCedrosLoginAdminClientContext } from './useCedrosLoginAdminClientContext';

export interface UseOrgsReturn {
  /** All organizations the user belongs to */
  orgs: OrgWithMembership[];
  /** Currently active organization */
  activeOrg: OrgWithMembership | null;
  /** User's permissions in the active org */
  permissions: Permission[];
  /** User's role in the active org */
  role: OrgRole | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: AuthError | null;
  /** Fetch/refresh organizations list */
  fetchOrgs: () => Promise<void>;
  /** Switch to a different organization */
  switchOrg: (orgId: string) => Promise<void>;
  /** Create a new organization */
  createOrg: (data: CreateOrgRequest) => Promise<Organization>;
  /** Update an organization */
  updateOrg: (orgId: string, data: UpdateOrgRequest) => Promise<Organization>;
  /** Delete an organization */
  deleteOrg: (orgId: string) => Promise<void>;
  /** Check if user has a specific permission */
  hasPermission: (permission: Permission) => boolean;
}

const ACTIVE_ORG_KEY = 'cedros_active_org';

function activeOrgKey(userId: string): string {
  return `${ACTIVE_ORG_KEY}:${userId}`;
}

/**
 * Hook for managing organizations, memberships, and permissions.
 *
 * @example
 * ```tsx
 * function OrgSelector() {
 *   const { orgs, activeOrg, switchOrg, hasPermission } = useOrgs();
 *
 *   return (
 *     <select
 *       value={activeOrg?.id}
 *       onChange={(e) => switchOrg(e.target.value)}
 *     >
 *       {orgs.map(org => (
 *         <option key={org.id} value={org.id}>{org.name}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useOrgs(): UseOrgsReturn {
  const { config, user, authState, _internal } = useCedrosLoginAdminClientContext();
  const hasStorage = typeof window !== 'undefined' && !!window.localStorage;

  const [orgs, setOrgs] = useState<OrgWithMembership[]>([]);
  const [activeOrg, setActiveOrg] = useState<OrgWithMembership | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [role, setRole] = useState<OrgRole | null>(null);
  const [isLoading, setIsLoading] = useState(authState === 'authenticated');
  const [error, setError] = useState<AuthError | null>(null);
  const requestIdRef = useRef(0);
  const previousUserIdRef = useRef<string | null>(user?.id ?? null);

  // Memoize API client and use ref to prevent callback dependency cascades
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

  // Store apiClient in ref to stabilize callback dependencies
  const apiClientRef = useRef(apiClient);
  useExternalEffect(() => {
    apiClientRef.current = apiClient;
  }, [apiClient]);

  // Use ref in callback to break dependency chain
  const loadPermissions = useCallback(async (orgId: string, requestId: number) => {
    try {
      const response = await apiClientRef.current.getPermissions(orgId);
      if (requestId !== requestIdRef.current) return;
      setPermissions(response.permissions);
      setRole(response.role);
    } catch {
      if (requestId !== requestIdRef.current) return;
      // Permissions loading failure is non-fatal, just clear them
      setPermissions([]);
      setRole(null);
    }
  }, []);

  // Ref to latest fetchOrgs for stable auto-fetch effect
  const fetchOrgsRef = useRef<() => Promise<void>>(async () => {});

  // Use ref to break apiClient dependency chain
  const fetchOrgs = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    if (authState !== 'authenticated' || !user) {
      setOrgs([]);
      setActiveOrg(null);
      setPermissions([]);
      setRole(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedOrgs = await apiClientRef.current.listOrgs();
      if (requestId !== requestIdRef.current) return;
      setOrgs(fetchedOrgs);

      // Scope browser preference by user. Remove the obsolete unscoped value so
      // one account can never inherit another account's selection.
      if (hasStorage) safeRemoveItem(ACTIVE_ORG_KEY);
      const savedOrgId = hasStorage ? safeGetItem(activeOrgKey(user.id)) : null;
      let selectedOrg = fetchedOrgs.find((org) => org.id === savedOrgId);

      if (!selectedOrg && fetchedOrgs.length > 0) {
        // Default to personal org or first org
        selectedOrg = fetchedOrgs.find((org) => org.isPersonal) || fetchedOrgs[0];
      }

      if (selectedOrg) {
        setActiveOrg(selectedOrg);
        if (hasStorage) {
          safeSetItem(activeOrgKey(user.id), selectedOrg.id);
        }
        await loadPermissions(selectedOrg.id, requestId);
      } else {
        setActiveOrg(null);
        setPermissions([]);
        setRole(null);
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err as AuthError);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [authState, user, loadPermissions, hasStorage]);

  // Keep fetchOrgsRef current so auto-fetch always calls the latest version
  useExternalEffect(() => {
    fetchOrgsRef.current = fetchOrgs;
  }, [fetchOrgs]);

  // Auto-fetch orgs when auth becomes ready.
  // Uses only `authState` (a string) as dep — immune to object-identity churn
  // from the admin runtime bridge recreating `user` objects.
  const autoFetchedUserIdRef = useRef<string | null>(null);
  useExternalEffect(() => {
    const nextUserId = user?.id ?? null;
    const previousUserId = previousUserIdRef.current;
    if (previousUserId !== nextUserId) {
      requestIdRef.current += 1;
      setOrgs([]);
      setActiveOrg(null);
      setPermissions([]);
      setRole(null);
      setIsLoading(authState === 'authenticated');
      if (previousUserId && hasStorage) safeRemoveItem(activeOrgKey(previousUserId));
    }
    previousUserIdRef.current = nextUserId;
    if (
      authState === 'authenticated' &&
      nextUserId &&
      autoFetchedUserIdRef.current !== nextUserId
    ) {
      autoFetchedUserIdRef.current = nextUserId;
      fetchOrgsRef.current();
    } else if (authState !== 'authenticated') {
      requestIdRef.current += 1;
      autoFetchedUserIdRef.current = null;
      setOrgs([]);
      setActiveOrg(null);
      setPermissions([]);
      setRole(null);
      setIsLoading(false);
    }
  }, [authState, user?.id, hasStorage]);

  const switchOrg = useCallback(
    async (orgId: string) => {
      const requestId = ++requestIdRef.current;
      const org = orgs.find((o) => o.id === orgId);
      if (!org) {
        setError({ code: 'UNKNOWN_ERROR', message: 'Organization not found' });
        return;
      }

      setActiveOrg(org);
      if (hasStorage && user) {
        safeSetItem(activeOrgKey(user.id), orgId);
      }
      await loadPermissions(orgId, requestId);
    },
    [orgs, loadPermissions, hasStorage, user]
  );

  // Use ref to break apiClient dependency chain
  const createOrg = useCallback(
    async (data: CreateOrgRequest): Promise<Organization> => {
      setIsLoading(true);
      setError(null);

      try {
        const newOrg = await apiClientRef.current.createOrg(data);
        // Refresh orgs list to include the new org with membership
        await fetchOrgs();
        return newOrg;
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchOrgs]
  );

  const updateOrg = useCallback(
    async (orgId: string, data: UpdateOrgRequest): Promise<Organization> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedOrg = await apiClientRef.current.updateOrg(orgId, data);
        // Refresh orgs list to reflect changes
        await fetchOrgs();
        return updatedOrg;
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchOrgs]
  );

  const deleteOrg = useCallback(
    async (orgId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await apiClientRef.current.deleteOrg(orgId);
        // Refresh orgs list
        await fetchOrgs();
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchOrgs]
  );

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  return {
    orgs,
    activeOrg,
    permissions,
    role,
    isLoading,
    error,
    fetchOrgs,
    switchOrg,
    createOrg,
    updateOrg,
    deleteOrg,
    hasPermission,
  };
}
