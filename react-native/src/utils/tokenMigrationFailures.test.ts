import { describe, expect, it, vi } from "vitest";
import type { TokenPair, TokenStorageAdapter } from "../types";
import { TokenManager } from "./tokenManager";
import { LEGACY_TOKEN_CLAIM_KEY, LEGACY_TOKEN_STORAGE_KEY } from "./tokenScope";

function storedTokens(): string {
  const tokens: TokenPair = {
    accessToken: "legacy-access",
    refreshToken: "legacy-refresh",
    expiresIn: 3600,
  };
  return JSON.stringify({ tokens, expiresAt: Date.now() + 60_000 });
}

function adapter(store: Map<string, string>): TokenStorageAdapter {
  return {
    securityLevel: "secure",
    getItem: vi.fn(async (key) => store.get(key) ?? null),
    setItem: vi.fn(async (key, value) => {
      store.set(key, value);
    }),
    removeItem: vi.fn(async (key) => {
      store.delete(key);
    }),
  };
}

function legacyStore(): Map<string, string> {
  return new Map([[LEGACY_TOKEN_STORAGE_KEY, storedTokens()]]);
}

describe("legacy token import failures", () => {
  it("surfaces claim-write failure without copying or removing legacy", async () => {
    const store = legacyStore();
    const storage = adapter(store);
    storage.setItem = vi.fn(async (key, value) => {
      if (key === LEGACY_TOKEN_CLAIM_KEY) throw new Error("claim unavailable");
      store.set(key, value);
    });
    const key = "auth_tokens.v2.claim-write-failure";
    const manager = TokenManager.providerScoped(storage, key, true);

    await expect(manager.hydrate()).rejects.toThrow("during claim write");

    expect(store.has(key)).toBe(false);
    expect(store.has(LEGACY_TOKEN_STORAGE_KEY)).toBe(true);
    manager.destroy();
  });

  it("surfaces scoped-copy failure while preserving the binding claim", async () => {
    const store = legacyStore();
    const storage = adapter(store);
    const key = "auth_tokens.v2.copy-failure";
    storage.setItem = vi.fn(async (storageKey, value) => {
      if (storageKey === key) throw new Error("copy unavailable");
      store.set(storageKey, value);
    });
    const manager = TokenManager.providerScoped(storage, key, true);

    await expect(manager.hydrate()).rejects.toThrow("during scoped copy");

    expect(JSON.parse(store.get(LEGACY_TOKEN_CLAIM_KEY) ?? "null")).toEqual({
      version: 1,
      scope: key,
    });
    expect(store.has(LEGACY_TOKEN_STORAGE_KEY)).toBe(true);
    manager.destroy();
  });

  it("retries failed legacy cleanup on the next authorized hydration", async () => {
    const store = legacyStore();
    const key = "auth_tokens.v2.cleanup-retry";
    const firstStorage = adapter(store);
    firstStorage.removeItem = vi.fn(async (storageKey) => {
      if (storageKey === LEGACY_TOKEN_STORAGE_KEY) {
        throw new Error("cleanup unavailable");
      }
      store.delete(storageKey);
    });
    const first = TokenManager.providerScoped(firstStorage, key, true);

    await expect(first.hydrate()).rejects.toThrow("during legacy cleanup");
    expect(store.has(key)).toBe(true);
    expect(store.has(LEGACY_TOKEN_STORAGE_KEY)).toBe(true);
    first.destroy();

    const retry = TokenManager.providerScoped(adapter(store), key, true);
    await retry.hydrate();

    expect(retry.getAccessToken()).toBe("legacy-access");
    expect(store.has(LEGACY_TOKEN_STORAGE_KEY)).toBe(false);
    retry.destroy();
  });
});
