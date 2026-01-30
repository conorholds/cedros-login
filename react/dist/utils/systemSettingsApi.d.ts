import { ListSystemSettingsResponse, UpdateSettingRequest, UpdateSystemSettingsResponse } from '../types';
/**
 * API client for system settings operations (admin only)
 */
export declare class SystemSettingsApiClient {
    private client;
    constructor(baseUrl: string, timeoutMs?: number, retryAttempts?: number, getAccessToken?: () => string | null);
    /**
     * Get all system settings grouped by category
     * Requires system admin privileges
     */
    getSettings(): Promise<ListSystemSettingsResponse>;
    /**
     * Update one or more system settings
     * Requires system admin privileges
     */
    updateSettings(settings: UpdateSettingRequest[]): Promise<UpdateSystemSettingsResponse>;
}
