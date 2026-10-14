import type {
  SetupStatusResponse,
  CreateFirstAdminRequest,
  CreateFirstAdminResponse,
} from '../types/setup';
import { ApiClient, handleApiError } from './apiClient';

/**
 * API client for setup operations.
 *
 * Status is public; first-admin creation relies on the host admin
 * session/CSRF envelope supplied by the embedding dashboard.
 */
export class SetupApiClient {
  private client: ApiClient;

  constructor(baseUrl: string, timeoutMs?: number, retryAttempts?: number) {
    // No Cedros Login token exists yet; host admin cookies/CSRF are sent by ApiClient.
    this.client = new ApiClient({ baseUrl, timeoutMs, retryAttempts });
  }

  /**
   * Check if initial setup is required
   * Returns whether the system needs initial setup (no admin exists)
   */
  async getStatus(): Promise<SetupStatusResponse> {
    try {
      return await this.client.get<SetupStatusResponse>('/setup/status');
    } catch (error) {
      throw handleApiError(error, 'Failed to check setup status');
    }
  }

  /**
   * Create the first admin user
   * Only works when no admin users exist
   */
  async createFirstAdmin(request: CreateFirstAdminRequest): Promise<CreateFirstAdminResponse> {
    try {
      return await this.client.post<CreateFirstAdminResponse>('/setup/admin', request);
    } catch (error) {
      throw handleApiError(error, 'Failed to create admin account');
    }
  }
}
