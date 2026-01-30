import { Invite, OrgRole, AuthError, AcceptInviteResponse } from '../types';
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
    fetchInvites: (options?: {
        limit?: number;
        offset?: number;
    }) => Promise<void>;
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
export declare function useInvites(orgId: string | undefined): UseInvitesReturn;
