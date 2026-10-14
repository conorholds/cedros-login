import type { TokenPair, TokenStorageAdapter } from "../types";
import {
  TOKEN_STORAGE_KEY,
  readStoredTokens,
  serializeStoredTokens,
} from "./tokenPersistence";
import {
  activateTokenStorageOwner,
  createTokenStorageOwner,
  enqueueOwnedTokenMutation,
  isTokenStorageOwner,
  LegacyTokenImporterLease,
  type TokenStorageOwner,
} from "./tokenMutationQueue";
import { createAsyncStorageTokenStorage } from "./tokenStorage";
import { TokenRefreshScheduler } from "./tokenRefreshScheduler";

interface TokenManagerOptions {
  deferHydration?: boolean;
  migrateLegacy?: boolean;
  storageKey?: string;
  storageOwner?: TokenStorageOwner;
}

export class TokenManager {
  private tokens: TokenPair | null = null;
  private expiresAt = 0;
  private mutationVersion = 0;
  private hydrationPromise: Promise<void> | null;
  private onSessionExpired: (() => void) | null = null;
  private isDestroyed = false;
  private readonly refreshScheduler = new TokenRefreshScheduler();
  private readonly storageKey: string;
  private readonly legacyImporter: LegacyTokenImporterLease;
  private readonly storageOwner: TokenStorageOwner | null;
  private activationPromise: Promise<void> | null = null;

  constructor(
    private readonly storage: TokenStorageAdapter = createAsyncStorageTokenStorage(),
    options: TokenManagerOptions = {},
  ) {
    this.storageKey = options.storageKey ?? TOKEN_STORAGE_KEY;
    this.legacyImporter = new LegacyTokenImporterLease(
      this.storageKey,
      options.migrateLegacy ?? false,
    );
    this.storageOwner = options.storageOwner ?? null;
    this.hydrationPromise = options.deferHydration
      ? null
      : this.loadFromStorage(this.mutationVersion);
  }
  static providerScoped(
    storage: TokenStorageAdapter,
    storageKey: string,
    importLegacyTokens = false,
  ): TokenManager {
    return new TokenManager(storage, {
      deferHydration: true,
      migrateLegacy: importLegacyTokens,
      storageKey,
      storageOwner: createTokenStorageOwner(),
    });
  }
  hydrate(): Promise<void> {
    this.hydrationPromise ??= this.loadFromStorage(this.mutationVersion);
    return this.hydrationPromise;
  }
  private isCurrent(version: number): boolean {
    const ownsStorage =
      !this.storageOwner ||
      isTokenStorageOwner(this.storageKey, this.storageOwner);
    return !this.isDestroyed && version === this.mutationVersion && ownsStorage;
  }
  private activateStorage(): Promise<void> {
    if (!this.storageOwner) return Promise.resolve();
    this.activationPromise ??= activateTokenStorageOwner(
      this.storage,
      this.storageKey,
      this.storageOwner,
      () => !this.isDestroyed,
    );
    return this.activationPromise;
  }
  private async loadFromStorage(version: number): Promise<void> {
    await this.legacyImporter.activate(() => this.activateStorage());
    const parsed = await readStoredTokens(
      this.storage,
      this.storageKey,
      () => this.isCurrent(version),
      this.legacyImporter.enabled,
    );
    if (!parsed || !this.isCurrent(version)) return;
    this.tokens = parsed.tokens;
    this.expiresAt = parsed.expiresAt;
    this.scheduleRefresh();
  }
  setRefreshCallback(callback: () => Promise<void>): void {
    this.refreshScheduler.setCallback(callback);
    this.scheduleRefresh();
  }
  setSessionExpiredCallback(callback: () => void): void {
    this.onSessionExpired = callback;
  }

  async setTokens(
    tokens: TokenPair,
    expectedRefreshToken?: string,
  ): Promise<void> {
    if (this.isDestroyed) return;
    await this.activateStorage();
    if (
      this.isDestroyed ||
      (expectedRefreshToken !== undefined &&
        this.getRefreshToken() !== expectedRefreshToken) ||
      (this.storageOwner &&
        !isTokenStorageOwner(this.storageKey, this.storageOwner))
    )
      return;

    this.mutationVersion += 1;
    this.tokens = tokens;
    this.expiresAt = Date.now() + tokens.expiresIn * 1000;

    const data = serializeStoredTokens(tokens, this.expiresAt);
    await enqueueOwnedTokenMutation(this.storageKey, this.storageOwner, () =>
      this.storage.setItem(this.storageKey, data),
    );

    this.scheduleRefresh();
  }

  getAccessToken(): string | null {
    if (this.isDestroyed) return null;
    if (!this.tokens) return null;
    if (Date.now() >= this.expiresAt) return null;
    return this.tokens.accessToken;
  }

  getRefreshToken(): string | null {
    if (this.isDestroyed) return null;
    return this.tokens?.refreshToken ?? null;
  }

  getTokens(): TokenPair | null {
    if (this.isDestroyed) return null;
    if (!this.tokens) return null;
    if (Date.now() >= this.expiresAt) return null;
    return this.tokens;
  }

  hasValidTokens(): boolean {
    return this.getAccessToken() !== null;
  }

  async clear(): Promise<void> {
    if (this.isDestroyed) return;
    this.clearSessionState();
    await this.activateStorage();
    if (this.isDestroyed) return;
    await enqueueOwnedTokenMutation(this.storageKey, this.storageOwner, () =>
      this.storage.removeItem(this.storageKey),
    );
  }

  async expireSession(): Promise<void> {
    if (this.isDestroyed || !this.tokens) return;
    const callback = this.onSessionExpired;
    this.clearSessionState();
    if (!this.isDestroyed) callback?.();
    await this.activateStorage();
    if (this.isDestroyed) return;
    const removal = enqueueOwnedTokenMutation(
      this.storageKey,
      this.storageOwner,
      () => this.storage.removeItem(this.storageKey),
    );
    await removal;
  }

  private clearSessionState(): void {
    this.mutationVersion += 1;
    this.tokens = null;
    this.expiresAt = 0;
    this.refreshScheduler.clearTimer();
  }

  async refreshTokens(): Promise<void> {
    return this.refreshScheduler.refresh();
  }

  private scheduleRefresh(): void {
    const version = this.mutationVersion;
    this.refreshScheduler.schedule(this.expiresAt, !!this.tokens, () => {
      if (this.isCurrent(version))
        void this.expireSession().catch(() => undefined);
    });
  }

  destroy(): void {
    this.isDestroyed = true;
    this.mutationVersion += 1;
    this.refreshScheduler.destroy();
    this.onSessionExpired = null;
    this.legacyImporter.destroy();
  }
}
