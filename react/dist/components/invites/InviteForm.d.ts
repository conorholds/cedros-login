import { OrgRole, DisplayError } from '../../types';
type InviteRole = Exclude<OrgRole, 'owner'>;
export interface InviteFormProps {
    /** Callback when invite is submitted */
    onSubmit: (email: string, role: InviteRole) => Promise<void>;
    /** Loading state */
    isLoading?: boolean;
    /** Error message */
    error?: DisplayError;
    /** Available roles for invite (default: admin, member, viewer) */
    availableRoles?: InviteRole[];
    /** Default role for new invites */
    defaultRole?: InviteRole;
    /** Additional CSS class */
    className?: string;
}
/**
 * Form for inviting new members to an organization.
 *
 * @example
 * ```tsx
 * function InviteManager() {
 *   const { activeOrg } = useOrgs();
 *   const { createInvite, isLoading, error } = useInvites(activeOrg?.id);
 *
 *   return (
 *     <InviteForm
 *       onSubmit={createInvite}
 *       isLoading={isLoading}
 *       error={error?.message}
 *       defaultRole="member"
 *     />
 *   );
 * }
 * ```
 */
export declare function InviteForm({ onSubmit, isLoading, error, availableRoles, defaultRole, className, }: InviteFormProps): import("react/jsx-runtime").JSX.Element;
export {};
