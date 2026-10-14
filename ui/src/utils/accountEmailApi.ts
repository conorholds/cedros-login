import type { AccountEmail, ListAccountEmailsResponse } from '../types';
import { ApiClient, handleApiError } from './apiClient';

/**
 * API client for account email identifier operations.
 */
export class AccountEmailApiClient {
  private client: ApiClient;

  constructor(
    baseUrl: string,
    timeoutMs?: number,
    retryAttempts?: number,
    getAccessToken?: () => string | null
  ) {
    this.client = new ApiClient({ baseUrl, timeoutMs, retryAttempts, getAccessToken });
  }

  /** List all email identifiers linked to the current account. */
  async listEmails(): Promise<AccountEmail[]> {
    try {
      const response = await this.client.get<ListAccountEmailsResponse>('/account/emails');
      return response.emails;
    } catch (error) {
      throw handleApiError(error, 'Failed to list account emails');
    }
  }

  /** Add a pending email identifier and send its verification email. */
  async addEmail(email: string): Promise<AccountEmail[]> {
    try {
      const response = await this.client.post<ListAccountEmailsResponse>('/account/emails', {
        email,
      });
      return response.emails;
    } catch (error) {
      throw handleApiError(error, 'Failed to add email address');
    }
  }

  /** Resend verification for a pending email identifier. */
  async resendEmail(id: string): Promise<void> {
    try {
      await this.client.post(`/account/emails/${encodeURIComponent(id)}/resend`, {});
    } catch (error) {
      throw handleApiError(error, 'Failed to resend verification email');
    }
  }

  /** Remove a non-primary email identifier. */
  async removeEmail(id: string): Promise<AccountEmail[]> {
    try {
      const response = await this.client.delete<ListAccountEmailsResponse>(
        `/account/emails/${encodeURIComponent(id)}`
      );
      return response.emails;
    } catch (error) {
      throw handleApiError(error, 'Failed to remove email address');
    }
  }

  /** Promote a verified email identifier to primary. Requires server-side step-up. */
  async setPrimaryEmail(id: string): Promise<AccountEmail[]> {
    try {
      const response = await this.client.post<ListAccountEmailsResponse>(
        `/account/emails/${encodeURIComponent(id)}/primary`,
        {}
      );
      return response.emails;
    } catch (error) {
      throw handleApiError(error, 'Failed to set primary email');
    }
  }

  /** Consume an added-email verification token. */
  async verifyEmail(token: string): Promise<void> {
    try {
      await this.client.post('/account/emails/verify', { token });
    } catch (error) {
      throw handleApiError(error, 'Failed to verify email address');
    }
  }
}
