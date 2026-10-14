import type { Credential, ListCredentialsResponse } from '../types';
import { ApiClient, handleApiError } from './apiClient';

/**
 * API client for credential (linked sign-in method) operations
 */
export class CredentialApiClient {
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
   * List all credentials linked to the current user
   */
  async listCredentials(): Promise<Credential[]> {
    try {
      const response = await this.client.get<ListCredentialsResponse>('/credentials');
      return response.credentials;
    } catch (error) {
      throw handleApiError(error, 'Failed to list credentials');
    }
  }

  /**
   * Unlink (delete) a credential by ID.
   * The server prevents removing the last primary credential.
   */
  async unlinkCredential(id: string): Promise<void> {
    try {
      await this.client.delete(`/credentials/${encodeURIComponent(id)}`);
    } catch (error) {
      throw handleApiError(error, 'Failed to unlink credential');
    }
  }
}
