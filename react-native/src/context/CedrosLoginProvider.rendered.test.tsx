import React, { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../types";
import { CedrosLoginProvider } from "./CedrosLoginProvider";
import {
  cleanupRenderedProviders,
  ContextProbe,
  contextValue,
  deferred,
  jsonResponse,
  providerConfig,
  providerTokenKey,
  renderProvider,
  settle,
  storedTokens,
  storageWith,
} from "./CedrosLoginProvider.renderedTestUtils";

vi.mock("react-native", () => ({
  Platform: { OS: "ios", Version: "test" },
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

afterEach(async () => {
  await cleanupRenderedProviders();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("rendered CedrosLoginProvider session lifecycle", () => {
  const user = { id: "user-1", email: "user@example.com" } as AuthUser;

  it("publishes loading while delayed storage hydration is pending", async () => {
    const stored = deferred<string | null>();
    const storage = storageWith(stored.promise);
    const root = await renderProvider(providerConfig(storage));

    expect(contextValue(root)).toMatchObject({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });

    stored.resolve(null);
    await settle();
    expect(contextValue(root).isLoading).toBe(false);
  });

  it("hydrates valid access, fetches the supported user route, and publishes the user", async () => {
    const storage = storageWith(
      storedTokens(
        {
          accessToken: "persisted-access",
          refreshToken: "persisted-refresh",
          expiresIn: 3_600,
        },
        Date.now() + 3_600_000,
      ),
    );
    const fetchMock = vi.fn(
      async (_url: string | URL | Request, _options?: RequestInit) =>
        jsonResponse(200, { user }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const root = await renderProvider(providerConfig(storage));
    await settle();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://auth.example.com/auth/user",
    );
    expect(
      new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("Authorization"),
    ).toBe("Bearer persisted-access");
    expect(contextValue(root)).toMatchObject({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  });

  it("refreshes expired access before restoring the authenticated user", async () => {
    const storage = storageWith(
      storedTokens(
        {
          accessToken: "expired-access",
          refreshToken: "persisted-refresh",
          expiresIn: 900,
        },
        Date.now() - 1,
      ),
    );
    const fetchMock = vi.fn(
      async (url: string | URL | Request, options?: RequestInit) => {
        const target = String(url);
        if (target.endsWith("/auth/refresh")) {
          expect(JSON.parse(String(options?.body))).toEqual({
            refreshToken: "persisted-refresh",
          });
          return jsonResponse(200, {
            tokens: {
              accessToken: "fresh-access",
              refreshToken: "fresh-refresh",
              expiresIn: 3_600,
            },
          });
        }
        return jsonResponse(200, { user });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const root = await renderProvider(providerConfig(storage));
    await settle();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "https://auth.example.com/auth/refresh",
      "https://auth.example.com/auth/user",
    ]);
    expect(contextValue(root)).toMatchObject({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
    expect(storage.setItem).toHaveBeenCalledWith(
      providerTokenKey(storage),
      expect.stringContaining('"accessToken":"fresh-access"'),
    );
  });

  it("clears provider authentication exactly once after terminal request expiry", async () => {
    const onLogout = vi.fn();
    const onSessionExpired = vi.fn();
    const storage = storageWith(
      storedTokens(
        {
          accessToken: "persisted-access",
          refreshToken: "persisted-refresh",
          expiresIn: 3_600,
        },
        Date.now() + 3_600_000,
      ),
    );
    let restored = false;
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      if (!restored && String(url).endsWith("/auth/user")) {
        restored = true;
        return jsonResponse(200, { user });
      }
      return jsonResponse(401, { code: "UNAUTHORIZED" });
    });
    vi.stubGlobal("fetch", fetchMock);
    const root = await renderProvider(
      providerConfig(storage, { callbacks: { onLogout, onSessionExpired } }),
    );
    await settle();
    expect(contextValue(root).isAuthenticated).toBe(true);

    await act(async () => contextValue(root).refreshUser());

    expect(contextValue(root)).toMatchObject({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(onLogout).not.toHaveBeenCalled();
    expect(storage.removeItem).toHaveBeenCalledTimes(1);
    expect(storage.removeItem).toHaveBeenCalledWith(providerTokenKey(storage));
  });

  it("cancels unmounted restoration without network or storage mutation", async () => {
    const stored = deferred<string | null>();
    const onLogout = vi.fn();
    const onSessionExpired = vi.fn();
    const storage = storageWith(stored.promise);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const root = await renderProvider(
      providerConfig(storage, { callbacks: { onLogout, onSessionExpired } }),
    );

    await act(async () => root.unmount());
    stored.resolve("malformed-persisted-value");
    await settle();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
    expect(onSessionExpired).not.toHaveBeenCalled();
    expect(onLogout).not.toHaveBeenCalled();
  });

  it("ignores stale restoration after storage and server configuration change", async () => {
    const oldOnLogout = vi.fn();
    const replacementOnLogout = vi.fn();
    const oldStored = deferred<string | null>();
    const oldStorage = storageWith(oldStored.promise);
    const newStorage = storageWith(
      storedTokens(
        {
          accessToken: "replacement-access",
          refreshToken: "replacement-refresh",
          expiresIn: 3_600,
        },
        Date.now() + 3_600_000,
      ),
    );
    const replacementUser = {
      id: "replacement-user",
      email: "replacement@example.com",
    } as AuthUser;
    const fetchMock = vi.fn(
      async (_url: string | URL | Request, _options?: RequestInit) =>
        jsonResponse(200, { user: replacementUser }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const root = await renderProvider(
      providerConfig(oldStorage, { callbacks: { onLogout: oldOnLogout } }),
    );

    await act(async () => {
      root.render(
        <CedrosLoginProvider
          config={providerConfig(newStorage, {
            serverUrl: "https://replacement.example.com",
            callbacks: { onLogout: replacementOnLogout },
          })}
        >
          <ContextProbe />
        </CedrosLoginProvider>,
      );
      await Promise.resolve();
    });
    await settle();
    oldStored.resolve(
      storedTokens(
        {
          accessToken: "stale-access",
          refreshToken: "stale-refresh",
          expiresIn: 3_600,
        },
        Date.now() + 3_600_000,
      ),
    );
    await settle();

    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "https://replacement.example.com/auth/user",
    ]);
    expect(contextValue(root)).toMatchObject({
      user: replacementUser,
      isAuthenticated: true,
      isLoading: false,
    });
    expect(oldStorage.setItem).not.toHaveBeenCalled();
    expect(oldStorage.removeItem).not.toHaveBeenCalled();
    expect(oldOnLogout).not.toHaveBeenCalled();
    expect(replacementOnLogout).not.toHaveBeenCalled();
  });

  it("does not report restoration failure as manual logout", async () => {
    const onLogout = vi.fn();
    const onSessionExpired = vi.fn();
    const storage = storageWith(
      storedTokens(
        {
          accessToken: "expired-access",
          refreshToken: "rejected-refresh",
          expiresIn: 900,
        },
        Date.now() - 1,
      ),
    );
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(401, { code: "UNAUTHORIZED" })),
    );

    const root = await renderProvider(
      providerConfig(storage, { callbacks: { onLogout, onSessionExpired } }),
    );
    await settle();

    expect(contextValue(root)).toMatchObject({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(onLogout).not.toHaveBeenCalled();
  });
});
