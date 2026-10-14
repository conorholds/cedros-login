import type {
  ChangeEmailRequest,
  ChangeEmailResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '../types';
import { ApiClient, handleApiError } from './apiClient';

/**
 * API client for user profile operations
 *
 * Supports:
 * - POST /change-password - Change user password
 * - PATCH /me - Update profile (name, picture)
 */
export class ProfileApiClient {
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
   * Change the user's password
   *
   * Requires the current password for verification. Also revokes all other sessions
   * and re-encrypts wallet Share A if using password-based wallet protection.
   */
  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      return await this.client.post<ChangePasswordResponse>('/change-password', data);
    } catch (error) {
      throw handleApiError(error, 'Failed to change password');
    }
  }

  /**
   * Update user profile (name, picture)
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    try {
      return await this.client.patch<UpdateProfileResponse>('/me', data);
    } catch (error) {
      throw handleApiError(error, 'Failed to update profile');
    }
  }

  /**
   * Change the account email. The server validates the address, re-authenticates
   * with the current password when one exists, and queues a verification email to
   * the new address (which stays unverified until confirmed).
   */
  async changeEmail(data: ChangeEmailRequest): Promise<ChangeEmailResponse> {
    try {
      return await this.client.post<ChangeEmailResponse>('/me/email', data);
    } catch (error) {
      throw handleApiError(error, 'Failed to change email');
    }
  }
}
