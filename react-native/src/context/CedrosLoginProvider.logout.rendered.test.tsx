import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../types";
import {
  cleanupRenderedProviders,
  contextValue,
  deferred,
  jsonResponse,
  providerConfig,
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

describe("rendered CedrosLoginProvider logout lifecycle", () => {
  const user = { id: "user-1", email: "user@example.com" } as AuthUser;

  it("clears state without reporting session expiry", async () => {
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
    const fetchMock = vi.fn(async (url: string | URL | Request) =>
      String(url).endsWith("/auth/user")
        ? jsonResponse(200, { user })
        : jsonResponse(200, {}),
    );
    vi.stubGlobal("fetch", fetchMock);
    const root = await renderProvider(
      providerConfig(storage, {
        callbacks: { onLogout, onSessionExpired },
      }),
    );
    await settle();

    await act(async () => contextValue(root).logout());

    expect(contextValue(root)).toMatchObject({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    expect(storage.removeItem).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).not.toHaveBeenCalled();
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("does not invoke onLogout when local persistence fails", async () => {
    const onLogout = vi.fn();
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
    storage.removeItem.mockRejectedValueOnce(new Error("storage unavailable"));
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request) =>
        String(url).endsWith("/auth/user")
          ? jsonResponse(200, { user })
          : jsonResponse(200, {}),
      ),
    );
    const root = await renderProvider(
      providerConfig(storage, { callbacks: { onLogout } }),
    );
    await settle();

    await act(async () => contextValue(root).logout());

    expect(contextValue(root)).toMatchObject({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: { code: "LOGOUT_FAILED", message: "storage unavailable" },
    });
    expect(onLogout).not.toHaveBeenCalled();
  });

  it("does not invoke onLogout after unmount", async () => {
    const onLogout = vi.fn();
    const logoutResponse = deferred<Response>();
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
    const fetchMock = vi.fn(async (url: string | URL | Request) =>
      String(url).endsWith("/auth/user")
        ? jsonResponse(200, { user })
        : logoutResponse.promise,
    );
    vi.stubGlobal("fetch", fetchMock);
    const root = await renderProvider(
      providerConfig(storage, { callbacks: { onLogout } }),
    );
    await settle();

    let logoutPromise!: Promise<void>;
    await act(async () => {
      logoutPromise = contextValue(root).logout();
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    });
    await act(async () => root.unmount());
    logoutResponse.resolve(jsonResponse(200, {}));
    await act(async () => logoutPromise);

    expect(onLogout).not.toHaveBeenCalled();
  });
});
