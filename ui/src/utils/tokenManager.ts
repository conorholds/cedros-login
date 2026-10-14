import type { TokenPair, SessionStorage } from '../types';

const DEFAULT_STORAGE_KEY = 'cedros_tokens';
const REFRESH_BUFFER_MS = 60_000; // Refresh 1 minute before expiry

interface StoredTokenData {
  tokens: TokenPair;
  expiresAt: number; // Unix timestamp in ms
}

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

export class TokenManager {
  private storage: SessionStorage;
  private requestedStorage: SessionStorage;
  private storageKey: string;
  private tokens: TokenPair | null = null;
  private expiresAt: number = 0;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private onRefreshNeeded: (() => Promise<void>) | null = null;
  private onSessionExpired: (() => void) | null = null;
  private onRefreshError: ((error: Error) => void) | null = null;
  // Track destruction to prevent timer callbacks from executing after cleanup
  private isDestroyed: boolean = false;
  // Prevent onSessionExpired from firing multiple times
  private sessionExpiredFired: boolean = false;
  private allowWebStorage: boolean;
  private generation = 0;

  constructor(
    storage: SessionStorage = 'cookie',
    persistKey: string = DEFAULT_STORAGE_KEY,
    options: TokenManagerOptions = {}
  ) {
    this.requestedStorage = storage;
    this.storage = storage;
    this.storageKey = persistKey;
    this.allowWebStorage = options.allowWebStorage ?? false;

    this.warnIfLocalStorage();

    // Web storage is explicit opt-in. If not enabled, downgrade to memory
    // so callers don't accidentally assume persistence across reloads.
    if (
      !this.allowWebStorage &&
      (this.requestedStorage === 'localStorage' || this.requestedStorage === 'sessionStorage')
    ) {
      this.storage = 'memory';
    }
    this.loadFromStorage();
  }

  /**
   * Warn about localStorage XSS vulnerability in all environments.
   * Security warnings should not be suppressed in production - operators need
   * to be aware of the security implications of their storage choices.
   */
  private warnIfLocalStorage(): void {
    if (
      (this.requestedStorage === 'localStorage' || this.requestedStorage === 'sessionStorage') &&
      typeof console !== 'undefined'
    ) {
      const suffix = this.allowWebStorage
        ? ''
        : ' (web storage disabled by default; set allowWebStorage=true to enable)';

      console.warn(
        '[cedros-login] SECURITY: Using web storage for token storage. ' +
          'Tokens are vulnerable to XSS attacks.' +
          suffix +
          ' PRODUCTION RECOMMENDATIONS: (1) Use httpOnly cookie storage instead, ' +
          '(2) If web storage required: implement strict Content-Security-Policy, ' +
          'sanitize all input/output, audit third-party scripts. ' +
          'See https://owasp.org/www-community/attacks/xss/'
      );
    }
  }

  /**
   * Set the callback for when tokens need to be refreshed
   */
  setRefreshCallback(callback: () => Promise<void>): void {
    this.onRefreshNeeded = callback;
    this.scheduleRefresh();
  }

  /**
   * Set the callback for when session expires
   */
  setSessionExpiredCallback(callback: () => void): void {
    this.onSessionExpired = callback;
  }

  /**
   * Set the callback for when token refresh fails
   * This allows the UI to show an error message to the user
   */
  setRefreshErrorCallback(callback: (error: Error) => void): void {
    this.onRefreshError = callback;
  }

  /**
   * Store tokens and schedule auto-refresh
   */
  setTokens(tokens: TokenPair, expiresAt = Date.now() + tokens.expiresIn * 1000): void {
    if (this.isDestroyed) return;
    if (
      !Number.isFinite(expiresAt) ||
      !Number.isFinite(tokens.expiresIn) ||
      tokens.expiresIn <= 0 ||
      !tokens.accessToken ||
      !tokens.refreshToken
    ) {
      throw new Error('Invalid token response structure');
    }
    this.generation += 1;
    this.tokens = tokens;
    this.expiresAt = expiresAt;
    this.sessionExpiredFired = false; // S-13: Reset guard for new token lifecycle
    this.saveToStorage();
    this.scheduleRefresh();
  }

  /**
   * Get the current access token
   * Store token in local variable before expiry check to eliminate TOCTOU race.
   * Check isDestroyed to prevent access after the manager is cleaned up.
   */
  getAccessToken(): string | null {
    // Prevent token access after destruction.
    if (this.isDestroyed) return null;
    const token = this.tokens?.accessToken;
    if (!token) return null;
    if (Date.now() >= this.expiresAt) {
      // Access expiry does not expire the independent refresh credential.
      return null;
    }
    return token;
  }

  /**
   * Get the current refresh token
   */
  getRefreshToken(): string | null {
    return this.tokens?.refreshToken ?? null;
  }

  /**
   * Clear stored tokens
   */
  clear(): void {
    this.generation += 1;
    this.tokens = null;
    this.expiresAt = 0;
    this.cancelRefresh();
    this.clearStorage();
  }

  /**
   * Check if tokens are stored
   */
  hasTokens(): boolean {
    return this.tokens !== null && Date.now() < this.expiresAt;
  }

  /**
   * Destroy the token manager and clean up resources.
   * Call this when unmounting components or cleaning up to prevent memory leaks.
   * Also sets isDestroyed flag to prevent timer callbacks from executing.
   */
  destroy(): void {
    this.isDestroyed = true;
    this.cancelRefresh();
    this.generation += 1;
    this.onRefreshNeeded = null;
    this.onSessionExpired = null;
    this.onRefreshError = null;
    this.tokens = null;
  }

  /**
   * Get time until token expiry in ms
   */
  getTimeUntilExpiry(): number {
    if (!this.tokens) return 0;
    return Math.max(0, this.expiresAt - Date.now());
  }

  /**
   * Fire onSessionExpired at most once per token lifecycle.
   * Reset by setTokens() when new tokens are stored.
   */
  private fireSessionExpired(): void {
    if (this.sessionExpiredFired) return;
    this.sessionExpiredFired = true;
    this.onSessionExpired?.();
  }

  private scheduleRefresh(): void {
    this.cancelRefresh();

    if (!this.tokens || !this.onRefreshNeeded) return;

    const timeUntilExpiry = this.getTimeUntilExpiry();
    const refreshIn = Math.max(
      0,
      timeUntilExpiry - Math.min(REFRESH_BUFFER_MS, this.tokens.expiresIn * 500)
    );
    const generation = this.generation;

    if (refreshIn <= 0) {
      // Token is about to expire or expired, refresh immediately
      // Check if destroyed before executing
      if (this.isDestroyed) return;
      this.onRefreshNeeded().catch((err) => {
        if (this.isDestroyed || generation !== this.generation) return;
        const error = err instanceof Error ? err : new Error('Token refresh failed');
        this.onRefreshError?.(error);
        this.clear();
        this.fireSessionExpired();
      });
      return;
    }

    this.refreshTimer = setTimeout(() => {
      // Check if destroyed before executing timer callback
      if (this.isDestroyed) return;
      this.onRefreshNeeded?.().catch((err) => {
        if (this.isDestroyed || generation !== this.generation) return;
        const error = err instanceof Error ? err : new Error('Token refresh failed');
        this.onRefreshError?.(error);
        this.clear();
        this.fireSessionExpired();
      });
    }, refreshIn);
  }

  private cancelRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private loadFromStorage(): void {
    if (this.storage === 'memory') return;
    if (typeof window === 'undefined') return;

    // Web storage is an explicit opt-in. If not enabled, treat this as
    // memory storage and do not read persisted tokens.
    if (
      !this.allowWebStorage &&
      (this.storage === 'localStorage' || this.storage === 'sessionStorage')
    ) {
      return;
    }

    try {
      if (this.storage === 'localStorage' || this.storage === 'sessionStorage') {
        const storage = this.storage === 'localStorage' ? localStorage : sessionStorage;
        const data = storage.getItem(this.storageKey);
        if (data) {
          const parsed = JSON.parse(data) as unknown;
          if (this.isValidStoredTokenData(parsed)) {
            this.tokens = parsed.tokens;
            this.expiresAt = parsed.expiresAt;
          } else {
            // Invalid data structure, clear it
            storage.removeItem(this.storageKey);
          }
        }
      }
      // Cookie storage is handled by the server
    } catch {
      // Ignore storage errors, clear corrupted data
      if (this.storage === 'localStorage' || this.storage === 'sessionStorage') {
        const storage = this.storage === 'localStorage' ? localStorage : sessionStorage;
        try {
          storage.removeItem(this.storageKey);
        } catch {
          // Ignore
        }
      }
    }
  }

  /**
   * Validate that parsed data matches expected StoredTokenData structure
   */
  private isValidStoredTokenData(data: unknown): data is StoredTokenData {
    if (typeof data !== 'object' || data === null) return false;

    const obj = data as Record<string, unknown>;

    if (typeof obj.expiresAt !== 'number' || !Number.isFinite(obj.expiresAt)) return false;
    if (typeof obj.tokens !== 'object' || obj.tokens === null) return false;

    const tokens = obj.tokens as Record<string, unknown>;
    if (typeof tokens.accessToken !== 'string') return false;
    if (typeof tokens.refreshToken !== 'string') return false;
    if (
      typeof tokens.expiresIn !== 'number' ||
      !Number.isFinite(tokens.expiresIn) ||
      tokens.expiresIn <= 0
    )
      return false;

    return true;
  }

  private saveToStorage(): void {
    if (this.storage === 'memory' || !this.tokens) return;
    if (typeof window === 'undefined') return;

    // Web storage is an explicit opt-in.
    if (
      !this.allowWebStorage &&
      (this.storage === 'localStorage' || this.storage === 'sessionStorage')
    ) {
      return;
    }

    try {
      if (this.storage === 'localStorage' || this.storage === 'sessionStorage') {
        const storage = this.storage === 'localStorage' ? localStorage : sessionStorage;
        const data: StoredTokenData = {
          tokens: this.tokens,
          expiresAt: this.expiresAt,
        };
        storage.setItem(this.storageKey, JSON.stringify(data));
      }
      // Cookie storage is handled by the server
    } catch {
      // Ignore storage errors
    }
  }

  private clearStorage(): void {
    if (this.storage === 'memory') return;
    if (typeof window === 'undefined') return;

    // If web storage isn't allowed, we should not mutate it either.
    if (
      !this.allowWebStorage &&
      (this.storage === 'localStorage' || this.storage === 'sessionStorage')
    ) {
      return;
    }

    try {
      if (this.storage === 'localStorage' || this.storage === 'sessionStorage') {
        const storage = this.storage === 'localStorage' ? localStorage : sessionStorage;
        storage.removeItem(this.storageKey);
      }
      // Cookie storage is handled by the server
    } catch {
      // Ignore storage errors
    }
  }
}
