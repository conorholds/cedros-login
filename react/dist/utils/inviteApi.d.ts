import { Invite, CreateInviteRequest, AcceptInviteRequest, CreateInviteResponse, AcceptInviteResponse } from '../types';
/**
 * API client for invite operations
 */
export declare class InviteApiClient {
    private client;
    constructor(baseUrl: string, timeoutMs?: number, retryAttempts?: number, getAccessToken?: () => string | null);
    /**
     * List all pending invites for an organization
     */
    listInvites(orgId: string, limit?: number, offset?: number): Promise<{
        invites: Invite[];
        total: number;
    }>;
    /**
     * Create a new invite
     */
    createInvite(orgId: string, data: CreateInviteRequest): Promise<CreateInviteResponse>;
    /**
     * Cancel a pending invite
     */
    cancelInvite(orgId: string, inviteId: string): Promise<void>;
    /**
     * Resend an invite email
     */
    resendInvite(orgId: string, inviteId: string): Promise<void>;
    /**
     * Accept an invite (public endpoint)
     */
    acceptInvite(data: AcceptInviteRequest): Promise<AcceptInviteResponse>;
}
