import { Invite, DisplayError } from '../../types';
export interface InviteListProps {
    /** List of pending invites */
    invites: Invite[];
    /** Loading state */
    isLoading?: boolean;
    /** Error message */
    error?: DisplayError;
    /** Whether the current user can manage invites */
    canManage?: boolean;
    /** Callback when invite is cancelled */
    onCancel?: (inviteId: string) => Promise<void>;
    /** Callback when invite is resent */
    onResend?: (inviteId: string) => Promise<void>;
    /** Additional CSS class */
    className?: string;
}
/**
 * Display and manage pending organization invites.
 *
 * @example
 * ```tsx
 * function PendingInvites() {
 *   const { activeOrg, hasPermission } = useOrgs();
 *   const { invites, isLoading, error, cancelInvite, resendInvite } = useInvites(activeOrg?.id);
 *
 *   return (
 *     <InviteList
 *       invites={invites}
 *       isLoading={isLoading}
 *       error={error?.message}
 *       canManage={hasPermission('invite:cancel')}
 *       onCancel={cancelInvite}
 *       onResend={resendInvite}
 *     />
 *   );
 * }
 * ```
 */
export declare function InviteList({ invites, isLoading, error, canManage, onCancel, onResend, className, }: InviteListProps): import("react/jsx-runtime").JSX.Element;
