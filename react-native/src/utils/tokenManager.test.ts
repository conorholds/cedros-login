import { afterEach, describe, expect, it, vi } from "vitest";
import type { TokenPair, TokenStorageAdapter } from "../types";
import { TokenManager } from "./tokenManager";
import { LEGACY_TOKEN_CLAIM_KEY, LEGACY_TOKEN_STORAGE_KEY } from "./tokenScope";

const STORED_TOKEN_KEY = "auth_tokens";

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

async function flushMicrotasks(): Promise<void> {
  for (let index = 0; index < 5; index += 1) {
    await Promise.resolve();
  }
}

function storedTokens(tokens: TokenPair, expiresAt: number): string {
  return JSON.stringify({ tokens, expiresAt });
}

function createStorage(getItem: TokenStorageAdapter["getItem"]): {
  securityLevel: "secure";
  getItem: ReturnType<typeof vi.fn<TokenStorageAdapter["getItem"]>>;
  setItem: ReturnType<typeof vi.fn<TokenStorageAdapter["setItem"]>>;
  removeItem: ReturnType<typeof vi.fn<TokenStorageAdapter["removeItem"]>>;
} {
  return {
    securityLevel: "secure",
    getItem: vi.fn(getItem),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  };
}

function sharedStorage(store: Map<string, string>): TokenStorageAdapter {
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

function tokens(label: string): TokenPair {
  return {
    accessToken: `${label}-access`,
    refreshToken: `${label}-refresh`,
    expiresIn: 3600,
  };
}

describe("TokenManager persisted-session hydration", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defers provider-scoped native reads until lifecycle hydration", async () => {
    const storage = createStorage(async () => null);
    const manager = TokenManager.providerScoped(storage, "auth_tokens.v2.test");

    expect(storage.getItem).not.toHaveBeenCalled();
    await manager.hydrate();

    expect(storage.getItem).toHaveBeenCalledWith("auth_tokens.v2.test");
    manager.destroy();
  });

  it("loads a valid access token after delayed secure storage resolves", async () => {
    const stored = deferred<string | null>();
    const storage = createStorage(() => stored.promise);
    const manager = new TokenManager(storage);

    expect(manager.getAccessToken()).toBeNull();

    stored.resolve(
      storedTokens(
        {
          accessToken: "persisted-access",
          refreshToken: "persisted-refresh",
          expiresIn: 3600,
        },
        Date.now() + 3_600_000,
      ),
    );
    await manager.hydrate();

    expect(manager.getAccessToken()).toBe("persisted-access");
    expect(manager.getRefreshToken()).toBe("persisted-refresh");
    expect(storage.getItem).toHaveBeenCalledWith(STORED_TOKEN_KEY);
  });

  it("does not overwrite newly set tokens with a stale delayed storage read", async () => {
    const stored = deferred<string | null>();
    const storage = createStorage(() => stored.promise);
    const manager = new TokenManager(storage);

    await manager.setTokens({
      accessToken: "fresh-access",
      refreshToken: "fresh-refresh",
      expiresIn: 3600,
    });
    stored.resolve(
      storedTokens(
        {
          accessToken: "stale-access",
          refreshToken: "stale-refresh",
          expiresIn: 3600,
        },
        Date.now() + 3_600_000,
      ),
    );
    await flushMicrotasks();

    expect(manager.getAccessToken()).toBe("fresh-access");
    expect(manager.getRefreshToken()).toBe("fresh-refresh");
  });

  it("retains the refresh token when only the persisted access token is expired", async () => {
    const storage = createStorage(async () =>
      storedTokens(
        {
          accessToken: "expired-access",
          refreshToken: "valid-refresh",
          expiresIn: 900,
        },
        Date.now() - 1,
      ),
    );
    const manager = new TokenManager(storage);
    await flushMicrotasks();

    expect(manager.getAccessToken()).toBeNull();
    expect(manager.getRefreshToken()).toBe("valid-refresh");
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it("does not let destroyed instances mutate storage after a late read", async () => {
    const stored = deferred<string | null>();
    const storage = createStorage(() => stored.promise);
    const manager = new TokenManager(storage);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    manager.destroy();
    stored.resolve("malformed-token-data");
    await flushMicrotasks();

    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it("clears malformed persisted data while the manager is active", async () => {
    const storage = createStorage(async () => "malformed-token-data");
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const manager = new TokenManager(storage);
    await flushMicrotasks();

    expect(manager.getAccessToken()).toBeNull();
    expect(manager.getRefreshToken()).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith(STORED_TOKEN_KEY);
  });

  it("orders writes across distinct adapters backed by the same store", async () => {
    const oldWriteStarted = deferred<void>();
    const releaseOldWrite = deferred<void>();
    let persisted: string | null = null;
    const oldStorage = createStorage(async () => persisted);
    const replacementStorage = createStorage(async () => persisted);
    oldStorage.setItem.mockImplementation(async (_key, value) => {
      oldWriteStarted.resolve();
      await releaseOldWrite.promise;
      persisted = value;
    });
    replacementStorage.setItem.mockImplementation(async (_key, value) => {
      persisted = value;
    });
    replacementStorage.removeItem.mockImplementation(async () => {
      persisted = null;
    });

    const oldManager = new TokenManager(oldStorage);
    await oldManager.hydrate();
    const oldWrite = oldManager.setTokens({
      accessToken: "old-access",
      refreshToken: "old-refresh",
      expiresIn: 3600,
    });
    await oldWriteStarted.promise;
    oldManager.destroy();

    expect(replacementStorage).not.toBe(oldStorage);
    const replacement = new TokenManager(replacementStorage);
    const replacementClear = replacement.clear();
    const replacementWrite = replacement.setTokens({
      accessToken: "new-access",
      refreshToken: "new-refresh",
      expiresIn: 3600,
    });
    releaseOldWrite.resolve();
    await Promise.all([
      oldWrite,
      replacementClear,
      replacementWrite,
      replacement.hydrate(),
    ]);

    expect(JSON.parse(persisted ?? "null").tokens.accessToken).toBe(
      "new-access",
    );
    expect(replacement.getAccessToken()).toBe("new-access");
    replacement.destroy();
  });

  it("continues processing mutations after an adapter write rejects", async () => {
    const failedStorage = createStorage(async () => null);
    failedStorage.setItem.mockRejectedValueOnce(
      new Error("storage unavailable"),
    );
    const failedManager = new TokenManager(failedStorage);
    await failedManager.hydrate();

    await expect(
      failedManager.setTokens({
        accessToken: "failed-access",
        refreshToken: "failed-refresh",
        expiresIn: 3600,
      }),
    ).rejects.toThrow("storage unavailable");
    failedManager.destroy();

    let persisted: string | null = null;
    const replacementStorage = createStorage(async () => persisted);
    replacementStorage.setItem.mockImplementation(async (_key, value) => {
      persisted = value;
    });
    const replacement = new TokenManager(replacementStorage);
    await replacement.setTokens({
      accessToken: "recovered-access",
      refreshToken: "recovered-refresh",
      expiresIn: 3600,
    });

    expect(JSON.parse(persisted ?? "null").tokens.accessToken).toBe(
      "recovered-access",
    );
    replacement.destroy();
  });

  it("manual clear does not report session expiry", async () => {
    const storage = createStorage(async () => null);
    const manager = new TokenManager(storage);
    const onSessionExpired = vi.fn();
    manager.setSessionExpiredCallback(onSessionExpired);
    await manager.setTokens({
      accessToken: "access",
      refreshToken: "refresh",
      expiresIn: 3600,
    });

    await manager.clear();

    expect(onSessionExpired).not.toHaveBeenCalled();
    manager.destroy();
  });

  it("notifies once when scheduled and explicit expiry race", async () => {
    const storage = createStorage(async () => null);
    const manager = new TokenManager(storage);
    const onSessionExpired = vi.fn();
    manager.setSessionExpiredCallback(onSessionExpired);
    manager.setRefreshCallback(async () => {
      throw new Error("scheduled refresh rejected");
    });
    await manager.setTokens({
      accessToken: "expired-access",
      refreshToken: "expired-refresh",
      expiresIn: 0,
    });

    await manager.expireSession();
    await flushMicrotasks();

    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(storage.removeItem).toHaveBeenCalledTimes(1);
    manager.destroy();
  });
});

describe("TokenManager provider storage isolation", () => {
  it("hydrates independent scopes through distinct adapters on one backing store", async () => {
    const store = new Map([
      [
        "auth_tokens.v2.scope-a",
        storedTokens(tokens("a"), Date.now() + 60_000),
      ],
      [
        "auth_tokens.v2.scope-b",
        storedTokens(tokens("b"), Date.now() + 60_000),
      ],
    ]);
    const a = TokenManager.providerScoped(
      sharedStorage(store),
      "auth_tokens.v2.scope-a",
    );
    const b = TokenManager.providerScoped(
      sharedStorage(store),
      "auth_tokens.v2.scope-b",
    );

    await Promise.all([a.hydrate(), b.hydrate()]);

    expect(a.getAccessToken()).toBe("a-access");
    expect(b.getAccessToken()).toBe("b-access");
    a.destroy();
    b.destroy();
  });

  it("does not authenticate B when A logs in on the same backing store", async () => {
    const store = new Map<string, string>();
    const a = TokenManager.providerScoped(
      sharedStorage(store),
      "auth_tokens.v2.login-a",
    );
    const b = TokenManager.providerScoped(
      sharedStorage(store),
      "auth_tokens.v2.login-b",
    );
    await Promise.all([a.hydrate(), b.hydrate()]);

    await a.setTokens(tokens("a"));

    expect(a.getAccessToken()).toBe("a-access");
    expect(b.getAccessToken()).toBeNull();
    expect(store.has("auth_tokens.v2.login-b")).toBe(false);
    a.destroy();
    b.destroy();
  });

  it("does not delete A when B logs out on the same backing store", async () => {
    const store = new Map<string, string>();
    const a = TokenManager.providerScoped(
      sharedStorage(store),
      "auth_tokens.v2.logout-a",
    );
    const b = TokenManager.providerScoped(
      sharedStorage(store),
      "auth_tokens.v2.logout-b",
    );
    await Promise.all([a.hydrate(), b.hydrate()]);
    await a.setTokens(tokens("a"));
    await b.setTokens(tokens("b"));

    await b.clear();

    expect(store.has("auth_tokens.v2.logout-a")).toBe(true);
    expect(store.has("auth_tokens.v2.logout-b")).toBe(false);
    expect(a.getAccessToken()).toBe("a-access");
    a.destroy();
    b.destroy();
  });

  it("does not touch legacy tokens without explicit opt-in", async () => {
    const store = new Map([
      [
        LEGACY_TOKEN_STORAGE_KEY,
        storedTokens(tokens("legacy"), Date.now() + 60_000),
      ],
    ]);
    const manager = TokenManager.providerScoped(
      sharedStorage(store),
      "auth_tokens.v2.default-deny",
    );

    await manager.hydrate();

    expect(manager.getAccessToken()).toBeNull();
    expect(store.has(LEGACY_TOKEN_STORAGE_KEY)).toBe(true);
    expect(store.has(LEGACY_TOKEN_CLAIM_KEY)).toBe(false);
    manager.destroy();
  });

  it("allows rightful A but not unauthorized B to import legacy tokens", async () => {
    const store = new Map([
      [
        LEGACY_TOKEN_STORAGE_KEY,
        storedTokens(tokens("legacy"), Date.now() + 60_000),
      ],
    ]);
    const a = TokenManager.providerScoped(
      sharedStorage(store),
      "auth_tokens.v2.rightful-a",
      true,
    );
    const b = TokenManager.providerScoped(
      sharedStorage(store),
      "auth_tokens.v2.unauthorized-b",
    );

    await Promise.all([a.hydrate(), b.hydrate()]);

    expect(a.getAccessToken()).toBe("legacy-access");
    expect(b.getAccessToken()).toBeNull();
    expect(store.has("auth_tokens.v2.unauthorized-b")).toBe(false);
    expect(store.has(LEGACY_TOKEN_STORAGE_KEY)).toBe(false);
    a.destroy();
    b.destroy();
  });

  it("rejects competing opted-in scopes before either imports", async () => {
    const store = new Map([
      [
        LEGACY_TOKEN_STORAGE_KEY,
        storedTokens(tokens("legacy"), Date.now() + 60_000),
      ],
    ]);
    const a = TokenManager.providerScoped(
      sharedStorage(store),
      "auth_tokens.v2.conflict-a",
      true,
    );
    const b = TokenManager.providerScoped(
      sharedStorage(store),
      "auth_tokens.v2.conflict-b",
      true,
    );

    const results = await Promise.allSettled([a.hydrate(), b.hydrate()]);

    expect(results.every((result) => result.status === "rejected")).toBe(true);
    expect(store.has(LEGACY_TOKEN_STORAGE_KEY)).toBe(true);
    expect(store.has(LEGACY_TOKEN_CLAIM_KEY)).toBe(false);
    a.destroy();
    b.destroy();
  });

  it("fences a delayed old-generation write before replacement hydration", async () => {
    const store = new Map<string, string>();
    const writeStarted = deferred<void>();
    const releaseWrite = deferred<void>();
    const key = "auth_tokens.v2.reconfigured";
    const oldStorage = sharedStorage(store);
    oldStorage.setItem = vi.fn(async (storageKey, value) => {
      if (storageKey === key) {
        writeStarted.resolve();
        await releaseWrite.promise;
      }
      store.set(storageKey, value);
    });
    const old = TokenManager.providerScoped(oldStorage, key);
    await old.hydrate();
    const oldWrite = old.setTokens(tokens("stale"));
    await writeStarted.promise;
    old.destroy();

    const replacement = TokenManager.providerScoped(sharedStorage(store), key);
    const replacementHydration = replacement.hydrate();
    releaseWrite.resolve();
    await Promise.all([oldWrite, replacementHydration]);

    expect(replacement.getAccessToken()).toBeNull();
    expect(store.has(key)).toBe(false);
    replacement.destroy();
  });
});

describe("refresh lifecycle authority", () => {
  const old = {
    accessToken: "old",
    refreshToken: "old-refresh",
    expiresIn: 900,
  };
  const replacement = {
    accessToken: "replacement",
    refreshToken: "replacement-refresh",
    expiresIn: 900,
  };
  it("rejects refresh completion after logout and after another login", async () => {
    const manager = new TokenManager(createStorage(async () => null));
    await manager.hydrate();
    await manager.setTokens(old);
    await manager.clear();
    await manager.setTokens(replacement, old.refreshToken);
    expect(manager.getRefreshToken()).toBeNull();
    await manager.setTokens({ ...old, refreshToken: "new-login" });
    await manager.setTokens(replacement, old.refreshToken);
    expect(manager.getRefreshToken()).toBe("new-login");
    await manager.setTokens(replacement, "new-login");
    expect(manager.getRefreshToken()).toBe(replacement.refreshToken);
    manager.destroy();
  });
});
