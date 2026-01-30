/**
 * Organization role in RBAC hierarchy
 * owner > admin > member > viewer
 */
export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';
/**
 * Organization entity
 */
export interface Organization {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    isPersonal: boolean;
    createdAt: string;
    updatedAt: string;
}
/**
 * Membership - user's relationship to an organization
 */
export interface Membership {
    id?: string;
    userId?: string;
    orgId?: string;
    role: OrgRole;
    joinedAt?: string;
}
/**
 * Organization with membership details for the current user
 */
export interface OrgWithMembership extends Organization {
    membership: Membership;
}
/**
 * Permission types for RBAC
 */
export type Permission = 'org:delete' | 'org:update' | 'org:read' | 'member:invite' | 'member:remove' | 'member:role_change' | 'member:read' | 'invite:create' | 'invite:cancel' | 'invite:read' | 'audit:read';
/**
 * Create organization request
 */
export interface CreateOrgRequest {
    name: string;
    slug?: string;
}
/**
 * Update organization request
 */
export interface UpdateOrgRequest {
    name?: string;
    slug?: string;
    logoUrl?: string;
}
/**
 * List organizations response
 */
export interface ListOrgsResponse {
    orgs: Array<Organization & {
        role: OrgRole;
    }>;
    total?: number;
    limit?: number;
    offset?: number;
}
/**
 * Authorization check request
 */
export interface AuthorizeRequest {
    orgId: string;
    action: string;
    resource?: string;
    resourceId?: string;
}
/**
 * Authorization check response
 */
export interface AuthorizeResponse {
    allowed: boolean;
    reason?: string;
}
/**
 * Permissions response
 */
export interface PermissionsResponse {
    permissions: Permission[];
    role: OrgRole;
}
/**
 * Organization state for context
 */
export interface OrgState {
    /** Currently active organization */
    activeOrg: OrgWithMembership | null;
    /** All organizations the user belongs to */
    orgs: OrgWithMembership[];
    /** User's permissions in the active org */
    permissions: Permission[];
    /** User's role in the active org */
    role: OrgRole | null;
    /** Loading state for org operations */
    isLoading: boolean;
}
