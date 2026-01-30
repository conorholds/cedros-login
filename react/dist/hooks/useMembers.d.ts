import { Member, OrgRole, AuthError } from '../types';
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
    fetchMembers: (options?: {
        limit?: number;
        offset?: number;
    }) => Promise<void>;
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
export declare function useMembers(orgId: string | undefined): UseMembersReturn;
