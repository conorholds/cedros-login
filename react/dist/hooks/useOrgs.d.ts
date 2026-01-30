import { OrgWithMembership, Organization, CreateOrgRequest, UpdateOrgRequest, Permission, OrgRole, AuthError } from '../types';
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
export declare function useOrgs(): UseOrgsReturn;
