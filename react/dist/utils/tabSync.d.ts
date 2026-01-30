import { AuthUser } from '../types';
type AuthSyncEvent = {
    type: 'login';
    user: AuthUser;
} | {
    type: 'logout';
} | {
    type: 'refresh';
};
type AuthSyncCallback = (event: AuthSyncEvent) => void;
/**
 * Cross-tab synchronization for auth state using BroadcastChannel
 * UI-6 FIX: Use addEventListener/removeEventListener for proper cleanup.
 */
export declare class TabSync {
    private channel;
    private callback;
    private boundHandler;
    constructor();
    /**
     * Handle incoming sync messages
     */
    private handleMessage;
    /**
     * Set the callback for sync events from other tabs
     */
    setCallback(callback: AuthSyncCallback): void;
    /**
     * Broadcast login event to other tabs
     */
    broadcastLogin(user: AuthUser): void;
    /**
     * Broadcast logout event to other tabs
     */
    broadcastLogout(): void;
    /**
     * Broadcast token refresh event to other tabs
     */
    broadcastRefresh(): void;
    /**
     * Close the channel and clean up references
     * UI-6: Use removeEventListener for proper cleanup
     */
    close(): void;
}
export {};
