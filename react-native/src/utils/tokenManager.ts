import type { TokenPair } from "../types";
import { getItem, setItem, removeItem } from "./storage";

const TOKEN_KEY = "auth_tokens";
const REFRESH_BUFFER_MS = 60_000; // Refresh 1 minute before expiry

interface StoredTokenData {
  tokens: TokenPair;
  expiresAt: number;
}

/**
 * Token manager for React Native using AsyncStorage
 */
export class TokenManager {
  private tokens: TokenPair | null = null;
  private expiresAt: number = 0;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private onRefreshNeeded: (() => Promise<void>) | null = null;
  private onSessionExpired: (() => void) | null = null;
  private isDestroyed: boolean = false;
  /** RN-03: Deduplicates concurrent refresh calls. */
  private refreshInFlight: Promise<void> | null = null;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load tokens from AsyncStorage on initialization
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const data = await getItem(TOKEN_KEY);
      if (data) {
        const parsed = JSON.parse(data) as StoredTokenData;
        // Only load if not expired
        if (parsed.expiresAt > Date.now()) {
          this.tokens = parsed.tokens;
          this.expiresAt = parsed.expiresAt;
          this.scheduleRefresh();
        } else {
          // Clear expired tokens
          await removeItem(TOKEN_KEY);
        }
      }
    } catch (err) {
      console.warn('[TokenManager] Failed to parse stored tokens; clearing corrupted data.', err instanceof Error ? err.message : String(err));
      await removeItem(TOKEN_KEY).catch(() => undefined);
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
   * Store tokens and schedule auto-refresh
   */
  async setTokens(tokens: TokenPair): Promise<void> {
    if (this.isDestroyed) return;

    this.tokens = tokens;
    this.expiresAt = Date.now() + tokens.expiresIn * 1000;

    // Persist to AsyncStorage
    const data: StoredTokenData = {
      tokens,
      expiresAt: this.expiresAt,
    };
    await setItem(TOKEN_KEY, JSON.stringify(data));

    this.scheduleRefresh();
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    if (this.isDestroyed) return null;
    if (!this.tokens) return null;
    if (Date.now() >= this.expiresAt) return null;
    return this.tokens.accessToken;
  }

  /**
   * Get the current refresh token
   */
  getRefreshToken(): string | null {
    if (this.isDestroyed) return null;
    return this.tokens?.refreshToken ?? null;
  }

  /**
   * Get token pair if available and not expired
   */
  getTokens(): TokenPair | null {
    if (this.isDestroyed) return null;
    if (!this.tokens) return null;
    if (Date.now() >= this.expiresAt) return null;
    return this.tokens;
  }

  /**
   * Check if tokens exist and are not expired
   */
  hasValidTokens(): boolean {
    return this.getAccessToken() !== null;
  }

  /**
   * Clear tokens from memory and storage
   */
  async clear(): Promise<void> {
    this.tokens = null;
    this.expiresAt = 0;
    this.clearRefreshTimer();
    await removeItem(TOKEN_KEY);
  }

  /**
   * Execute refresh with deduplication. Concurrent callers share one in-flight request.
   */
  private doRefresh(): void {
    if (this.refreshInFlight || !this.onRefreshNeeded) return;

    this.refreshInFlight = this.onRefreshNeeded()
      .catch(() => {
        this.onSessionExpired?.();
      })
      .finally(() => {
        this.refreshInFlight = null;
      });
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleRefresh(): void {
    this.clearRefreshTimer();

    if (!this.tokens || !this.onRefreshNeeded) return;

    const refreshAt = this.expiresAt - REFRESH_BUFFER_MS;
    const delay = refreshAt - Date.now();

    if (delay <= 0) {
      this.doRefresh();
    } else {
      this.refreshTimer = setTimeout(() => {
        if (!this.isDestroyed) {
          this.doRefresh();
        }
      }, delay);
    }
  }

  /**
   * Clear the refresh timer
   */
  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Destroy the token manager and cleanup
   */
  destroy(): void {
    this.isDestroyed = true;
    this.clearRefreshTimer();
    this.onRefreshNeeded = null;
    this.onSessionExpired = null;
  }
}

export default TokenManager;
