import { Organization, OrgWithMembership, CreateOrgRequest, UpdateOrgRequest, AuthorizeRequest, AuthorizeResponse, PermissionsResponse } from '../types';
/**
 * API client for organization operations
 */
export declare class OrgApiClient {
    private client;
    constructor(baseUrl: string, timeoutMs?: number, retryAttempts?: number, getAccessToken?: () => string | null);
    /**
     * List all organizations the current user belongs to
     */
    listOrgs(): Promise<OrgWithMembership[]>;
    /**
     * Get a single organization by ID
     */
    getOrg(orgId: string): Promise<Organization>;
    /**
     * Create a new organization
     */
    createOrg(data: CreateOrgRequest): Promise<Organization>;
    /**
     * Update an organization
     */
    updateOrg(orgId: string, data: UpdateOrgRequest): Promise<Organization>;
    /**
     * Delete an organization
     */
    deleteOrg(orgId: string): Promise<void>;
    /**
     * Check authorization for an action
     */
    authorize(data: AuthorizeRequest): Promise<AuthorizeResponse>;
    /**
     * Get current user's permissions in an organization
     */
    getPermissions(orgId: string): Promise<PermissionsResponse>;
}
