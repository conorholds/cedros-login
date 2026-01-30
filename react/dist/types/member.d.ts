import { OrgRole } from './org';
/**
 * Member of an organization
 */
export interface Member {
    id: string;
    userId: string;
    orgId: string;
    role: OrgRole;
    joinedAt: string;
    user: MemberUser;
}
/**
 * Member response shape returned by the API
 */
export interface MemberApiResponse {
    id: string;
    userId: string;
    role: OrgRole;
    joinedAt: string;
    email?: string;
    name?: string;
}
/**
 * User info within a membership context
 */
export interface MemberUser {
    id: string;
    email?: string;
    name?: string;
    picture?: string;
}
/**
 * Request to update a member's role
 */
export interface UpdateMemberRoleRequest {
    role: OrgRole;
}
/**
 * Response from listing members
 */
export interface ListMembersResponse {
    members: MemberApiResponse[];
    total: number;
}
