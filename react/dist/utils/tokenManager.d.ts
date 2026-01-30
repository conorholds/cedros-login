import { TokenPair, SessionStorage } from '../types';
/**
 * Token manager for storing and auto-refreshing tokens
 *
 * ## Security Warning: localStorage Storage
 *
 * When using `localStorage` or `sessionStorage`, tokens are stored in the browser
 * and are **vulnerable to XSS attacks**. Any JavaScript running
 * on your page (including third-party scripts, browser extensions, or malicious
 * code injected via XSS) can read these tokens.
 *
 * **Recommendations:**
 * - Use `cookie` storage with httpOnly cookies (tokens stored server-side)
 * - If localStorage is required, implement strong Content Security Policy (CSP)
 * - Sanitize all user input and output
 * - Regularly audit third-party dependencies
 *
 * @example
 * // Recommended: cookie storage (tokens in httpOnly cookies)
 * const manager = new TokenManager('cookie');
 *
 * // Use with caution: localStorage (XSS vulnerable)
 * const manager = new TokenManager('localStorage');
 */
export interface TokenManagerOptions {
    /**
     * Allow `localStorage`/`sessionStorage` token persistence.
     *
     * @security This is intentionally opt-in because these storage modes are vulnerable
     * to XSS token theft.
     */
    allowWebStorage?: boolean;
}
export declare class TokenManager {
    private storage;
    private requestedStorage;
    private storageKey;
    private tokens;
    private expiresAt;
    private refreshTimer;
    private onRefreshNeeded;
    private onSessionExpired;
    private onRefreshError;
    private isDestroyed;
    private allowWebStorage;
    constructor(storage?: SessionStorage, persistKey?: string, options?: TokenManagerOptions);
    /**
     * S-18/UI-XSS: Warn about localStorage XSS vulnerability in all environments.
     * Security warnings should not be suppressed in production - operators need
     * to be aware of the security implications of their storage choices.
     */
    private warnIfLocalStorage;
    /**
     * Set the callback for when tokens need to be refreshed
     */
    setRefreshCallback(callback: () => Promise<void>): void;
    /**
     * Set the callback for when session expires
     */
    setSessionExpiredCallback(callback: () => void): void;
    /**
     * Set the callback for when token refresh fails
     * This allows the UI to show an error message to the user
     */
    setRefreshErrorCallback(callback: (error: Error) => void): void;
    /**
     * Store tokens and schedule auto-refresh
     */
    setTokens(tokens: TokenPair): void;
    /**
     * Get the current access token
     * UI-4 FIX: Store token in local variable before expiry check to eliminate TOCTOU race.
     * UI-TOK-01 FIX: Check isDestroyed to prevent access after manager is cleaned up.
     */
    getAccessToken(): string | null;
    /**
     * Get the current refresh token
     */
    getRefreshToken(): string | null;
    /**
     * Clear stored tokens
     */
    clear(): void;
    /**
     * Check if tokens are stored
     */
    hasTokens(): boolean;
    /**
     * Destroy the token manager and clean up resources.
     * Call this when unmounting components or cleaning up to prevent memory leaks.
     * P-02: Also sets isDestroyed flag to prevent timer callbacks from executing.
     */
    destroy(): void;
    /**
     * Get time until token expiry in ms
     */
    getTimeUntilExpiry(): number;
    private scheduleRefresh;
    private cancelRefresh;
    private loadFromStorage;
    /**
     * Validate that parsed data matches expected StoredTokenData structure
     */
    private isValidStoredTokenData;
    private saveToStorage;
    private clearStorage;
}
