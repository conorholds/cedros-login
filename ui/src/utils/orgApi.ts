import type {
  Organization,
  OrgWithMembership,
  CreateOrgRequest,
  UpdateOrgRequest,
  ListOrgsResponse,
  AuthorizeRequest,
  AuthorizeResponse,
  PermissionsResponse,
} from '../types';
import { ApiClient, handleApiError } from './apiClient';

/**
 * API client for organization operations
 */
export class OrgApiClient {
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
   * List all organizations the current user belongs to
   */
  async listOrgs(): Promise<OrgWithMembership[]> {
    try {
      const response = await this.client.get<ListOrgsResponse>('/orgs', { cacheTtlMs: 2_000 });
      return response.orgs.map((org) => ({
        ...org,
        membership: {
          orgId: org.id,
          role: org.role,
        },
      }));
    } catch (error) {
      throw handleApiError(error, 'Failed to list organizations');
    }
  }

  /**
   * Get a single organization by ID
   */
  async getOrg(orgId: string): Promise<Organization> {
    try {
      return await this.client.get<Organization>(`/orgs/${orgId}`);
    } catch (error) {
      throw handleApiError(error, 'Failed to get organization');
    }
  }

  /**
   * Create a new organization
   */
  async createOrg(data: CreateOrgRequest): Promise<Organization> {
    try {
      return await this.client.post<Organization>('/orgs', data);
    } catch (error) {
      throw handleApiError(error, 'Failed to create organization');
    }
  }

  /**
   * Update an organization
   */
  async updateOrg(orgId: string, data: UpdateOrgRequest): Promise<Organization> {
    try {
      return await this.client.patch<Organization>(`/orgs/${orgId}`, data);
    } catch (error) {
      throw handleApiError(error, 'Failed to update organization');
    }
  }

  /**
   * Delete an organization
   */
  async deleteOrg(orgId: string): Promise<void> {
    try {
      await this.client.delete<void>(`/orgs/${orgId}`);
    } catch (error) {
      throw handleApiError(error, 'Failed to delete organization');
    }
  }

  /**
   * Check authorization for an action
   */
  async authorize(data: AuthorizeRequest): Promise<AuthorizeResponse> {
    try {
      return await this.client.post<AuthorizeResponse>('/authorize', data);
    } catch (error) {
      throw handleApiError(error, 'Failed to check authorization');
    }
  }

  /**
   * Get current user's permissions in an organization
   */
  async getPermissions(orgId: string): Promise<PermissionsResponse> {
    try {
      return await this.client.post<PermissionsResponse>('/permissions', { orgId });
    } catch (error) {
      throw handleApiError(error, 'Failed to get permissions');
    }
  }
}
