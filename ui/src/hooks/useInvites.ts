import { useExternalEffect } from './effects';
import { useState, useCallback, useMemo, useRef } from 'react';
import type { Invite, OrgRole, AuthError, AcceptInviteResponse } from '../types';
import { InviteApiClient } from '../utils/inviteApi';
import { useCedrosLoginAdminClientContext } from './useCedrosLoginAdminClientContext';

export interface UseInvitesReturn {
  /** List of pending invites */
  invites: Invite[];
  /** Total pending invites available on the server */
  total: number;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: AuthError | null;
  /** Fetch/refresh invites list */
  fetchInvites: (options?: { limit?: number; offset?: number }) => Promise<void>;
  /** Create a new invite */
  createInvite: (email: string, role?: Exclude<OrgRole, 'owner'>) => Promise<void>;
  /** Cancel a pending invite */
  cancelInvite: (inviteId: string) => Promise<void>;
  /** Resend an invite email */
  resendInvite: (inviteId: string) => Promise<void>;
  /** Accept an invite (public) */
  acceptInvite: (token: string) => Promise<AcceptInviteResponse>;
}

/**
 * Hook for managing organization invites.
 *
 * @param orgId - The organization ID to manage invites for
 *
 * @example
 * ```tsx
 * function InviteManager() {
 *   const { activeOrg } = useOrgs();
 *   const { invites, createInvite, cancelInvite, resendInvite } = useInvites(activeOrg?.id);
 *
 *   const handleInvite = async (email: string) => {
 *     await createInvite(email, 'member');
 *   };
 *
 *   return (
 *     <div>
 *       <InviteForm onSubmit={handleInvite} />
 *       <ul>
 *         {invites.map(invite => (
 *           <li key={invite.id}>
 *             {invite.email} ({invite.role})
 *             <button onClick={() => resendInvite(invite.id)}>Resend</button>
 *             <button onClick={() => cancelInvite(invite.id)}>Cancel</button>
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useInvites(orgId: string | undefined): UseInvitesReturn {
  const { config, authState, _internal } = useCedrosLoginAdminClientContext();

  const [invites, setInvites] = useState<Invite[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  // Track fetched orgId to prevent duplicate fetches on remount
  const fetchedOrgIdRef = useRef<string | undefined>(undefined);
  const requestIdRef = useRef(0);

  const apiClient = useMemo(
    () =>
      new InviteApiClient(
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

  const fetchInvites = useCallback(
    async (options?: { limit?: number; offset?: number }) => {
      const requestId = ++requestIdRef.current;
      if (!orgId || authState !== 'authenticated') {
        setInvites([]);
        setTotal(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const { limit = 50, offset = 0 } = options ?? {};
        const response = await apiClientRef.current.listInvites(orgId, limit, offset);
        if (requestId !== requestIdRef.current) return;
        setInvites(response.invites);
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
      setInvites([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    if (orgId !== fetchedOrgIdRef.current) {
      fetchedOrgIdRef.current = orgId;
      fetchInvites();
    }
  }, [orgId, authState, fetchInvites]);

  const createInvite = useCallback(
    async (email: string, role: Exclude<OrgRole, 'owner'> = 'member'): Promise<void> => {
      if (!orgId) {
        throw new Error('No organization selected');
      }

      setIsLoading(true);
      setError(null);

      try {
        await apiClientRef.current.createInvite(orgId, { email, role });
        // Refresh invites list
        await fetchInvites();
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [orgId, fetchInvites]
  );

  const cancelInvite = useCallback(
    async (inviteId: string): Promise<void> => {
      if (!orgId) {
        throw new Error('No organization selected');
      }

      setIsLoading(true);
      setError(null);

      try {
        await apiClientRef.current.cancelInvite(orgId, inviteId);
        // Refresh invites list
        await fetchInvites();
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [orgId, fetchInvites]
  );

  const resendInvite = useCallback(
    async (inviteId: string): Promise<void> => {
      if (!orgId) {
        throw new Error('No organization selected');
      }

      setIsLoading(true);
      setError(null);

      try {
        await apiClientRef.current.resendInvite(orgId, inviteId);
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [orgId]
  );

  const acceptInvite = useCallback(async (token: string): Promise<AcceptInviteResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      return await apiClientRef.current.acceptInvite({ token });
    } catch (err) {
      setError(err as AuthError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    invites,
    total,
    isLoading,
    error,
    fetchInvites,
    createInvite,
    cancelInvite,
    resendInvite,
    acceptInvite,
  };
}
