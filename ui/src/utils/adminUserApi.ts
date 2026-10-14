import type {
  AdminUser,
  AdminUserStatsResponse,
  ListAdminUsersResponse,
  ListUsersParams,
  UpdateUserRequest,
} from '../types';
import { ApiClient, handleApiError } from './apiClient';

/**
 * API client for admin user operations
 *
 * Requires system admin privileges.
 */
export class AdminUserApiClient {
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
   * List all users in the system
   */
  async listUsers(params?: ListUsersParams): Promise<ListAdminUsersResponse> {
    try {
      const query = new URLSearchParams();
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.offset) query.set('offset', String(params.offset));
      const queryString = query.toString();
      const url = `/admin/users${queryString ? `?${queryString}` : ''}`;
      return await this.client.get<ListAdminUsersResponse>(url, { cacheTtlMs: 1_000 });
    } catch (error) {
      throw handleApiError(error, 'Failed to list users');
    }
  }

  /**
   * Get a specific user by ID
   */
  async getUser(userId: string): Promise<AdminUser> {
    try {
      return await this.client.get<AdminUser>(`/admin/users/${userId}`);
    } catch (error) {
      throw handleApiError(error, 'Failed to get user');
    }
  }

  /**
   * Set a user's system admin status
   */
  async setSystemAdmin(userId: string, isAdmin: boolean): Promise<void> {
    try {
      await this.client.patch(`/admin/users/${userId}/system-admin`, { isAdmin });
    } catch (error) {
      throw handleApiError(error, 'Failed to update system admin status');
    }
  }

  /**
   * Update a user's profile
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<AdminUser> {
    try {
      return await this.client.patch<AdminUser>(`/admin/users/${userId}`, data);
    } catch (error) {
      throw handleApiError(error, 'Failed to update user');
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await this.client.delete(`/admin/users/${userId}`);
    } catch (error) {
      throw handleApiError(error, 'Failed to delete user');
    }
  }

  /**
   * Send a password reset email to a user
   */
  async forcePasswordReset(userId: string): Promise<void> {
    try {
      await this.client.post(`/admin/users/${userId}/force-password-reset`, {});
    } catch (error) {
      throw handleApiError(error, 'Failed to send password reset email');
    }
  }

  /**
   * Get user statistics by auth method
   */
  async getStats(): Promise<AdminUserStatsResponse> {
    try {
      return await this.client.get<AdminUserStatsResponse>('/admin/users/stats', {
        cacheTtlMs: 2_000,
      });
    } catch (error) {
      throw handleApiError(error, 'Failed to get user stats');
    }
  }
}
