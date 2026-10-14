import type {
  Member,
  MemberApiResponse,
  UpdateMemberRoleRequest,
  ListMembersResponse,
} from '../types';
import { ApiClient, handleApiError } from './apiClient';

/**
 * API client for member operations within an organization
 */
export class MemberApiClient {
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
   * List all members of an organization
   */
  async listMembers(
    orgId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ members: Member[]; total: number }> {
    try {
      const response = await this.client.get<ListMembersResponse>(
        `/orgs/${orgId}/members?limit=${limit}&offset=${offset}`,
        { cacheTtlMs: 1_000 }
      );
      return {
        members: response.members.map((member: MemberApiResponse) => ({
          id: member.id,
          userId: member.userId,
          orgId,
          role: member.role,
          joinedAt: member.joinedAt,
          user: {
            id: member.userId,
            email: member.email,
            name: member.name,
          },
        })),
        total: response.total,
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to list members');
    }
  }

  /**
   * Update a member's role
   */
  async updateMemberRole(
    orgId: string,
    userId: string,
    data: UpdateMemberRoleRequest
  ): Promise<Member> {
    try {
      return await this.client.patch<Member>(`/orgs/${orgId}/members/${userId}`, data);
    } catch (error) {
      throw handleApiError(error, 'Failed to update member role');
    }
  }

  /**
   * Remove a member from the organization
   */
  async removeMember(orgId: string, userId: string): Promise<void> {
    try {
      await this.client.delete<void>(`/orgs/${orgId}/members/${userId}`);
    } catch (error) {
      throw handleApiError(error, 'Failed to remove member');
    }
  }
}
