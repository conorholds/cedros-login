import { describe, expect, it, vi } from "vitest";
import type { AuthUser, TokenPair, TokenStorageAdapter } from "../types";
import { TokenManager } from "../utils/tokenManager";
import { restorePersistedSession } from "./sessionRestoration";

function storedTokens(tokens: TokenPair, expiresAt: number): string {
  return JSON.stringify({ tokens, expiresAt });
}

function storageWith(value: string | Promise<string | null>): {
  storage: TokenStorageAdapter;
  removeItem: ReturnType<typeof vi.fn>;
} {
  const removeItem = vi.fn(async () => undefined);
  return {
    storage: {
      securityLevel: "secure",
      getItem: vi.fn(async () => value),
      setItem: vi.fn(async () => undefined),
      removeItem,
    },
    removeItem,
  };
}

function sessionApi(manager: TokenManager, user: AuthUser) {
  const getRequest = vi.fn(async () => ({
    data: { user },
    status: 200,
    headers: {},
  }));
  return {
    api: {
      getTokenManager: () => manager,
      getRequest,
    } as never,
    getRequest,
  };
}

describe("persisted provider session restoration", () => {
  const user = { id: "user-1", email: "user@example.com" } as AuthUser;

  it("hydrates a valid persisted session before fetching the user", async () => {
    const { storage } = storageWith(
      storedTokens(
        {
          accessToken: "persisted-access",
          refreshToken: "persisted-refresh",
          expiresIn: 3600,
        },
        Date.now() + 3_600_000,
      ),
    );
    const manager = new TokenManager(storage);
    const { api, getRequest } = sessionApi(manager, user);

    await expect(restorePersistedSession(api)).resolves.toEqual(user);
    expect(getRequest).toHaveBeenCalledWith("/auth/user");
    manager.destroy();
  });

  it("refreshes an expired access token before fetching the user", async () => {
    const { storage } = storageWith(
      storedTokens(
        {
          accessToken: "expired-access",
          refreshToken: "persisted-refresh",
          expiresIn: 900,
        },
        Date.now() - 1,
      ),
    );
    const manager = new TokenManager(storage);
    const refresh = vi.fn(async () => {
      await manager.setTokens({
        accessToken: "fresh-access",
        refreshToken: "fresh-refresh",
        expiresIn: 3600,
      });
    });
    manager.setRefreshCallback(refresh);
    const { api, getRequest } = sessionApi(manager, user);

    await expect(restorePersistedSession(api)).resolves.toEqual(user);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(getRequest).toHaveBeenCalledWith("/auth/user");
    manager.destroy();
  });

  it("does not fetch or mutate provider state after cancellation", async () => {
    let resolveStorage!: (value: string | null) => void;
    const delayedStorage = new Promise<string | null>((resolve) => {
      resolveStorage = resolve;
    });
    const { storage } = storageWith(delayedStorage);
    const manager = new TokenManager(storage);
    const { api, getRequest } = sessionApi(manager, user);
    let active = true;
    const restoration = restorePersistedSession(api, () => active);

    active = false;
    resolveStorage(null);

    await expect(restoration).resolves.toBeNull();
    expect(getRequest).not.toHaveBeenCalled();
    manager.destroy();
  });

  it("clears an expired session when refresh fails", async () => {
    const { storage, removeItem } = storageWith(
      storedTokens(
        {
          accessToken: "expired-access",
          refreshToken: "rejected-refresh",
          expiresIn: 900,
        },
        Date.now() - 1,
      ),
    );
    const manager = new TokenManager(storage);
    manager.setRefreshCallback(async () => {
      throw new Error("refresh rejected");
    });
    const { api, getRequest } = sessionApi(manager, user);

    await expect(restorePersistedSession(api)).rejects.toThrow(
      "refresh rejected",
    );
    expect(removeItem).toHaveBeenCalledWith("auth_tokens");
    expect(getRequest).not.toHaveBeenCalled();
    manager.destroy();
  });
});
