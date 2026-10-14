import type { OrgRole } from './org';

/**
 * Pending invite to an organization.
 *
 * Exactly one of email or walletAddress is present.
 */
export interface Invite {
  id: string;
  orgId: string;
  email?: string;
  walletAddress?: string;
  role: Exclude<OrgRole, 'owner'>; // owner role cannot be invited
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Invite response shape returned by the API.
 */
export interface InviteApiResponse {
  id: string;
  orgId: string;
  email?: string;
  walletAddress?: string;
  role: Exclude<OrgRole, 'owner'>;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

/**
 * Request to create a new invite.
 *
 * Exactly one of email or walletAddress must be provided.
 */
export interface CreateInviteRequest {
  email?: string;
  walletAddress?: string;
  role?: Exclude<OrgRole, 'owner'>;
}

/**
 * Request to accept an invite.
 */
export interface AcceptInviteRequest {
  token: string;
}

/**
 * Response from listing invites.
 */
export interface ListInvitesResponse {
  invites: InviteApiResponse[];
  total: number;
}

/**
 * Response from creating an invite.
 */
export interface CreateInviteResponse {
  id: string;
  orgId: string;
  email?: string;
  walletAddress?: string;
  role: Exclude<OrgRole, 'owner'>;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  token: string;
}

/**
 * Response from accepting an invite.
 */
export interface AcceptInviteResponse {
  orgId: string;
  orgName: string;
  role: OrgRole;
}
