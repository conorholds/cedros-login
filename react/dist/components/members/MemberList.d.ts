import { Member, OrgRole, DisplayError } from '../../types';
export interface MemberListProps {
    /** List of members to display */
    members: Member[];
    /** Current user's ID (to prevent self-actions) */
    currentUserId?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error message */
    error?: DisplayError;
    /** Whether the current user can manage members */
    canManage?: boolean;
    /** Whether the current user can change roles */
    canChangeRoles?: boolean;
    /** Callback when role is updated */
    onUpdateRole?: (userId: string, role: OrgRole) => Promise<void>;
    /** Callback when member is removed */
    onRemove?: (userId: string) => Promise<void>;
    /** Additional CSS class */
    className?: string;
}
/**
 * Display and manage organization members.
 *
 * @example
 * ```tsx
 * function TeamMembers() {
 *   const { activeOrg, hasPermission } = useOrgs();
 *   const { members, isLoading, error, updateMemberRole, removeMember } = useMembers(activeOrg?.id);
 *   const { user } = useAuth();
 *
 *   return (
 *     <MemberList
 *       members={members}
 *       currentUserId={user?.id}
 *       isLoading={isLoading}
 *       error={error?.message}
 *       canManage={hasPermission('member:remove')}
 *       canChangeRoles={hasPermission('member:role_change')}
 *       onUpdateRole={updateMemberRole}
 *       onRemove={removeMember}
 *     />
 *   );
 * }
 * ```
 */
export declare function MemberList({ members, currentUserId, isLoading, error, canManage, canChangeRoles, onUpdateRole, onRemove, className, }: MemberListProps): import("react/jsx-runtime").JSX.Element;
