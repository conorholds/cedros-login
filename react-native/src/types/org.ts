/**
 * Organization role in RBAC hierarchy.
 *
 * Values must match the server `OrgRole` enum serialization.
 */
export type OrgRole = 'owner' | 'admin' | 'member';

/**
 * Organization entity returned by org APIs.
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
 * User membership details for an organization.
 */
export interface Membership {
  id?: string;
  userId?: string;
  orgId?: string;
  role: OrgRole;
  joinedAt?: string;
}

/**
 * Organization plus the current user's membership details.
 */
export interface OrgWithMembership extends Organization {
  membership: Membership;
}

/**
 * Built-in organization permission values.
 */
export type Permission =
  | 'org:delete'
  | 'org:update'
  | 'org:read'
  | 'member:invite'
  | 'member:remove'
  | 'member:role_change'
  | 'member:read'
  | 'invite:create'
  | 'invite:cancel'
  | 'invite:read'
  | 'audit:read';

/**
 * Request to create an organization.
 */
export interface CreateOrgRequest {
  name: string;
  slug?: string;
}

/**
 * Request to update an organization.
 */
export interface UpdateOrgRequest {
  name?: string;
  slug?: string;
  logoUrl?: string;
}

/**
 * Response from listing organizations.
 */
export interface ListOrgsResponse {
  orgs: Array<Organization & { role: OrgRole }>;
  total?: number;
  limit?: number;
  offset?: number;
}

/**
 * Authorization check request.
 */
export interface AuthorizeRequest {
  orgId: string;
  action: string;
  resource?: string;
  resourceId?: string;
}

/**
 * Authorization check response.
 */
export interface AuthorizeResponse {
  allowed: boolean;
  reason?: string;
}

/**
 * Permissions response for the active organization.
 */
export interface PermissionsResponse {
  permissions: Permission[];
  role: OrgRole;
}

/**
 * Organization state for auth/org contexts.
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
