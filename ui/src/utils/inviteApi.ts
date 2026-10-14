import type {
  Invite,
  InviteApiResponse,
  CreateInviteRequest,
  AcceptInviteRequest,
  ListInvitesResponse,
  CreateInviteResponse,
  AcceptInviteResponse,
} from '../types';
import { ApiClient, handleApiError } from './apiClient';

/**
 * API client for invite operations
 */
export class InviteApiClient {
  private client: ApiClient;

  constructor(
    baseUrl: string,
    timeoutMs?: number,
    retryAttempts?: number,
    getAccessToken?: () => string | null
  ) {
    this.client = new ApiClient({ baseUrl, timeoutMs, retryAttempts, getAccessToken });
  }

  /**
   * List all pending invites for an organization
   */
  async listInvites(
    orgId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ invites: Invite[]; total: number }> {
    try {
      const response = await this.client.get<ListInvitesResponse>(
        `/orgs/${orgId}/invites?limit=${limit}&offset=${offset}`,
        { cacheTtlMs: 1_000 }
      );
      return {
        invites: response.invites.map((invite: InviteApiResponse) => ({
          id: invite.id,
          orgId: invite.orgId,
          email: invite.email,
          role: invite.role,
          invitedBy: invite.invitedBy,
          createdAt: invite.createdAt,
          expiresAt: invite.expiresAt,
        })),
        total: response.total,
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to list invites');
    }
  }

  /**
   * Create a new invite
   */
  async createInvite(orgId: string, data: CreateInviteRequest): Promise<CreateInviteResponse> {
    try {
      return await this.client.post<CreateInviteResponse>(`/orgs/${orgId}/invites`, data);
    } catch (error) {
      throw handleApiError(error, 'Failed to create invite');
    }
  }

  /**
   * Cancel a pending invite
   */
  async cancelInvite(orgId: string, inviteId: string): Promise<void> {
    try {
      await this.client.delete<void>(`/orgs/${orgId}/invites/${inviteId}`);
    } catch (error) {
      throw handleApiError(error, 'Failed to cancel invite');
    }
  }

  /**
   * Resend an invite email
   */
  async resendInvite(orgId: string, inviteId: string): Promise<void> {
    try {
      await this.client.post<void>(`/orgs/${orgId}/invites/${inviteId}/resend`, {});
    } catch (error) {
      throw handleApiError(error, 'Failed to resend invite');
    }
  }

  /**
   * Accept an invite (public endpoint)
   */
  async acceptInvite(data: AcceptInviteRequest): Promise<AcceptInviteResponse> {
    try {
      return await this.client.post<AcceptInviteResponse>('/invites/accept', data);
    } catch (error) {
      throw handleApiError(error, 'Failed to accept invite');
    }
  }
}
