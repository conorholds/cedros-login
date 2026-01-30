import { Member, UpdateMemberRoleRequest } from '../types';
/**
 * API client for member operations within an organization
 */
export declare class MemberApiClient {
    private client;
    constructor(baseUrl: string, timeoutMs?: number, retryAttempts?: number, getAccessToken?: () => string | null);
    /**
     * List all members of an organization
     */
    listMembers(orgId: string, limit?: number, offset?: number): Promise<{
        members: Member[];
        total: number;
    }>;
    /**
     * Update a member's role
     */
    updateMemberRole(orgId: string, userId: string, data: UpdateMemberRoleRequest): Promise<Member>;
    /**
     * Remove a member from the organization
     */
    removeMember(orgId: string, userId: string): Promise<void>;
}
