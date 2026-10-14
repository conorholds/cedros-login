import type {
  AuthResponse,
  CreateInviteCodeRequest,
  InviteCode,
  ListInviteCodesResponse,
  UpdateInviteCodeRequest,
} from '../types';
import { ApiClient, handleApiError } from './apiClient';

export class InviteCodeApiClient {
  private client: ApiClient;

  constructor(
    baseUrl: string,
    timeoutMs?: number,
    retryAttempts?: number,
    getAccessToken?: () => string | null
  ) {
    this.client = new ApiClient({ baseUrl, timeoutMs, retryAttempts, getAccessToken });
  }

  async redeem(pendingInviteToken: string, code: string): Promise<AuthResponse> {
    try {
      return await this.client.post<AuthResponse>('/invite-codes/redeem', {
        pendingInviteToken,
        code,
      });
    } catch (error) {
      throw handleApiError(error, 'Unable to apply invite code');
    }
  }

  async listAccountCodes(): Promise<ListInviteCodesResponse> {
    try {
      return await this.client.get<ListInviteCodesResponse>('/account/invite-codes');
    } catch (error) {
      throw handleApiError(error, 'Unable to load invite codes');
    }
  }

  async listAdminCodes(): Promise<ListInviteCodesResponse> {
    try {
      return await this.client.get<ListInviteCodesResponse>('/admin/invite-codes');
    } catch (error) {
      throw handleApiError(error, 'Unable to load invite codes');
    }
  }

  async createAdminCode(request: CreateInviteCodeRequest): Promise<InviteCode> {
    try {
      return await this.client.post<InviteCode>('/admin/invite-codes', request);
    } catch (error) {
      throw handleApiError(error, 'Unable to create invite code');
    }
  }

  async updateAdminCode(id: string, request: UpdateInviteCodeRequest): Promise<InviteCode> {
    try {
      return await this.client.patch<InviteCode>(`/admin/invite-codes/${id}`, request);
    } catch (error) {
      throw handleApiError(error, 'Unable to update invite code');
    }
  }

  async deleteAdminCode(id: string): Promise<void> {
    try {
      await this.client.delete<void>(`/admin/invite-codes/${id}`);
    } catch (error) {
      throw handleApiError(error, 'Unable to delete invite code');
    }
  }
}
