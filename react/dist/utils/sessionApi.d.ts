import { Session, RevokeAllSessionsResponse } from '../types';
/**
 * API client for session management operations
 */
export declare class SessionApiClient {
    private client;
    constructor(baseUrl: string, timeoutMs?: number, retryAttempts?: number, getAccessToken?: () => string | null);
    /**
     * List all active sessions for the current user
     */
    listSessions(): Promise<Session[]>;
    /**
     * Revoke all sessions (logout from all devices)
     */
    revokeAllSessions(): Promise<RevokeAllSessionsResponse>;
}
