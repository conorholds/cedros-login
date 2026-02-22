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
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  org: OrgWithMembership;
}

interface ServerSwitchOrgResponse {
  orgId: string;
  role: OrgWithMembership["membership"]["role"];
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  /** Full org object returned by server on switch (avoids a second GET request) */
  org?: Organization;
}

export class OrgsApi {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async listOrgs(): Promise<ListOrgsResponse> {
    const response = await this.client.get<ListOrgsResponse>("/auth/orgs");
    return response.data;
  }

  async getOrg(orgId: string): Promise<Organization> {
    const response = await this.client.get<Organization>(`/auth/orgs/${orgId}`);
    return response.data;
  }

  async createOrg(request: CreateOrgRequest): Promise<Organization> {
    const response = await this.client.post<Organization>("/auth/orgs", request);
    return response.data;
  }

  async updateOrg(
    orgId: string,
    request: UpdateOrgRequest,
  ): Promise<Organization> {
    const response = await this.client.patch<Organization>(
      `/auth/orgs/${orgId}`,
      request,
    );
    return response.data;
  }

  async deleteOrg(orgId: string): Promise<void> {
    await this.client.delete(`/auth/orgs/${orgId}`);
  }

  async getCurrentOrg(): Promise<OrgWithMembership | null> {
    const response = await this.listOrgs();
    const first = response.orgs[0];
    if (!first) {
      return null;
    }

    return {
      ...first,
      membership: { role: first.role },
    };
  }

  async switchOrg(request: SwitchOrgRequest): Promise<SwitchOrgResponse> {
    const response = await this.client.post<ServerSwitchOrgResponse>(
      `/auth/orgs/${request.orgId}/switch`,
      {},
    );

    if (response.data.tokens) {
      await this.client.getTokenManager().setTokens(response.data.tokens);
    }

    // Use org data from switch response directly to avoid a redundant GET request.
    // If the server does not include org details, fall back to a separate getOrg call.
    const org = response.data.org ?? (await this.getOrg(response.data.orgId));
    return {
      tokens: response.data.tokens,
      org: {
        ...org,
        membership: { role: response.data.role },
      },
    };
  }

  async checkPermission(request: AuthorizeRequest): Promise<AuthorizeResponse> {
    const response = await this.client.post<AuthorizeResponse>(
      "/auth/authorize",
      {
        orgId: request.orgId,
        permission: request.action,
      },
    );
    return response.data;
  }

  async getPermissions(orgId: string): Promise<PermissionsResponse> {
    const response = await this.client.post<PermissionsResponse>(
      "/auth/permissions",
      { orgId },
    );
    return response.data;
  }

}

export default OrgsApi;
