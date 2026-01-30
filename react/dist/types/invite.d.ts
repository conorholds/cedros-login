import { OrgRole } from './org';
/**
 * Pending invite to an organization
 *
 * TYPE-05: invitedByName removed - backend doesn't populate it.
 * To show inviter name, would need to join users table in backend.
 */
export interface Invite {
    id: string;
    orgId: string;
    email: string;
    role: Exclude<OrgRole, 'owner'>;
    invitedBy: string;
    createdAt: string;
    expiresAt: string;
}
/**
 * Invite response shape returned by the API
 */
export interface InviteApiResponse {
    id: string;
    orgId: string;
    email: string;
    role: Exclude<OrgRole, 'owner'>;
    invitedBy: string;
    createdAt: string;
    expiresAt: string;
    acceptedAt?: string;
}
/**
 * Request to create a new invite
 */
export interface CreateInviteRequest {
    email: string;
    role?: Exclude<OrgRole, 'owner'>;
}
/**
 * Request to accept an invite
 */
export interface AcceptInviteRequest {
    token: string;
}
/**
 * Response from listing invites
 */
export interface ListInvitesResponse {
    invites: InviteApiResponse[];
    total: number;
}
/**
 * Response from creating an invite
 */
export interface CreateInviteResponse {
    id: string;
    orgId: string;
    email: string;
    role: Exclude<OrgRole, 'owner'>;
    invitedBy: string;
    createdAt: string;
    expiresAt: string;
    acceptedAt?: string;
    token: string;
}
/**
 * Response from accepting an invite
 */
export interface AcceptInviteResponse {
    orgId: string;
    orgName: string;
    role: OrgRole;
}
