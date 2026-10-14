import { useExternalEffect } from './effects';
import { useState, useCallback, useMemo, useRef } from 'react';
import type { Member, OrgRole, AuthError } from '../types';
import { MemberApiClient } from '../utils/memberApi';
import { useCedrosLoginAdminClientContext } from './useCedrosLoginAdminClientContext';

export interface UseMembersReturn {
  /** List of members */
  members: Member[];
  /** Total members available on the server */
  total: number;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: AuthError | null;
  /** Fetch/refresh members list */
  fetchMembers: (options?: { limit?: number; offset?: number }) => Promise<void>;
  /** Update a member's role */
  updateMemberRole: (userId: string, role: OrgRole) => Promise<void>;
  /** Remove a member */
  removeMember: (userId: string) => Promise<void>;
}

/**
 * Hook for managing organization members.
 *
 * @param orgId - The organization ID to manage members for
 *
 * @example
 * ```tsx
 * function MembersList() {
 *   const { activeOrg } = useOrgs();
 *   const { members, isLoading, updateMemberRole, removeMember } = useMembers(activeOrg?.id);
 *
 *   if (!activeOrg) return null;
 *
 *   return (
 *     <ul>
 *       {members.map(member => (
 *         <li key={member.id}>
 *           {member.user.name} - {member.role}
 *           <button onClick={() => updateMemberRole(member.userId, 'admin')}>
 *             Make Admin
 *           </button>
 *           <button onClick={() => removeMember(member.userId)}>
 *             Remove
 *           </button>
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useMembers(orgId: string | undefined): UseMembersReturn {
  const { config, authState, _internal } = useCedrosLoginAdminClientContext();

  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  // Track fetched orgId to prevent duplicate fetches on remount
  const fetchedOrgIdRef = useRef<string | undefined>(undefined);
  const requestIdRef = useRef(0);

  const apiClient = useMemo(
    () =>
      new MemberApiClient(
        config.serverUrl,
        config.requestTimeout,
        config.retryAttempts,
        _internal?.getAccessToken
      ),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal]
  );

  // Use ref to avoid apiClient in callback dependencies
  // Prevents infinite loop when apiClient identity changes
  const apiClientRef = useRef(apiClient);
  apiClientRef.current = apiClient;

  const fetchMembers = useCallback(
    async (options?: { limit?: number; offset?: number }) => {
      const requestId = ++requestIdRef.current;
      if (!orgId || authState !== 'authenticated') {
        setMembers([]);
        setTotal(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const { limit = 50, offset = 0 } = options ?? {};
        const response = await apiClientRef.current.listMembers(orgId, limit, offset);
        if (requestId !== requestIdRef.current) return;
        setMembers(response.members);
        setTotal(response.total);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err as AuthError);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [orgId, authState]
  );

  // Auto-fetch when orgId changes, but not on every remount
  useExternalEffect(() => {
    if (authState !== 'authenticated') {
      requestIdRef.current += 1;
      fetchedOrgIdRef.current = undefined;
      setMembers([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    if (orgId !== fetchedOrgIdRef.current) {
      fetchedOrgIdRef.current = orgId;
      fetchMembers();
    }
  }, [orgId, authState, fetchMembers]);

  const updateMemberRole = useCallback(
    async (userId: string, role: OrgRole): Promise<void> => {
      if (!orgId) {
        throw new Error('No organization selected');
      }

      setIsLoading(true);
      setError(null);

      try {
        await apiClientRef.current.updateMemberRole(orgId, userId, { role });
        // Refresh members list
        await fetchMembers();
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [orgId, fetchMembers]
  );

  const removeMember = useCallback(
    async (userId: string): Promise<void> => {
      if (!orgId) {
        throw new Error('No organization selected');
      }

      setIsLoading(true);
      setError(null);

      try {
        await apiClientRef.current.removeMember(orgId, userId);
        // Refresh members list
        await fetchMembers();
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [orgId, fetchMembers]
  );

  return {
    members,
    total,
    isLoading,
    error,
    fetchMembers,
    updateMemberRole,
    removeMember,
  };
}
