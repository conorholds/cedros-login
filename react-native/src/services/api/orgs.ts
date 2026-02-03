import type {
  Organization,
  OrgWithMembership,
  CreateOrgRequest,
  UpdateOrgRequest,
  ListOrgsResponse,
  AuthorizeRequest,
  AuthorizeResponse,
  PermissionsResponse,
} from "../../types";
import type ApiClient from "./client";

export interface SwitchOrgRequest {
  orgId: string;
}

export interface SwitchOrgResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  org: OrgWithMembership;
}

export class OrgsApi {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async listOrgs(): Promise<ListOrgsResponse> {
    const response = await this.client.get<ListOrgsResponse>("/orgs");
    return response.data;
  }

  async getOrg(orgId: string): Promise<Organization> {
    const response = await this.client.get<Organization>(`/orgs/${orgId}`);
    return response.data;
  }

  async createOrg(request: CreateOrgRequest): Promise<Organization> {
    const response = await this.client.post<Organization>("/orgs", request);
    return response.data;
  }

  async updateOrg(
    orgId: string,
    request: UpdateOrgRequest,
  ): Promise<Organization> {
    const response = await this.client.patch<Organization>(
      `/orgs/${orgId}`,
      request,
    );
    return response.data;
  }

  async deleteOrg(orgId: string): Promise<void> {
    await this.client.delete(`/orgs/${orgId}`);
  }

  async getCurrentOrg(): Promise<OrgWithMembership | null> {
    try {
      const response =
        await this.client.get<OrgWithMembership>("/orgs/current");
      return response.data;
    } catch (error) {
      const apiError = error as { status?: number };
      if (apiError.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async switchOrg(request: SwitchOrgRequest): Promise<SwitchOrgResponse> {
    const response = await this.client.post<SwitchOrgResponse>(
      "/orgs/switch",
      request,
    );

    if (response.data.tokens) {
      await this.client.getTokenManager().setTokens(response.data.tokens);
    }

    return response.data;
  }

  async checkPermission(request: AuthorizeRequest): Promise<AuthorizeResponse> {
    const response = await this.client.post<AuthorizeResponse>(
      "/orgs/authorize",
      request,
    );
    return response.data;
  }

  async getPermissions(orgId: string): Promise<PermissionsResponse> {
    const response = await this.client.get<PermissionsResponse>(
      `/orgs/${orgId}/permissions`,
    );
    return response.data;
  }

  async leaveOrg(orgId: string): Promise<void> {
    await this.client.post(`/orgs/${orgId}/leave`, {});
  }
}

export default OrgsApi;
