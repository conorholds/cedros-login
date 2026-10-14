import { afterEach, describe, expect, it, vi } from "vitest";
import ApiClient from "./client";
import { TokenManager } from "../../utils/tokenManager";

vi.mock("react-native", () => ({
  Platform: {
    OS: "ios",
    Version: "test",
  },
}));

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

function createClient() {
  return new ApiClient({
    config: {
      serverUrl: "https://auth.example.com",
    },
    tokenManager: {
      hydrate: vi.fn(async () => undefined),
      getAccessToken: vi.fn(() => null),
      clear: vi.fn(),
    } as never,
  });
}

function jsonResponse(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function createAuthenticatedClient(): Promise<{
  client: ApiClient;
  tokenManager: TokenManager;
}> {
  const tokenManager = new TokenManager({
    securityLevel: "secure",
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  });
  await tokenManager.setTokens({
    accessToken: "old-access",
    refreshToken: "refresh-token",
    expiresIn: 3600,
  });
  return {
    client: new ApiClient({
      config: { serverUrl: "https://auth.example.com" },
      tokenManager,
    }),
    tokenManager,
  };
}

describe("ApiClient error contract", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses the Rust server top-level error body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            code: "SETUP_REQUIRED",
            message: "Initial setup required",
            details: { setup: true },
          }),
          {
            status: 409,
            headers: { "content-type": "application/json" },
          },
        );
      }),
    );

    const client = createClient();

    await expect(client.post("/auth/register", {})).rejects.toMatchObject({
      code: "SETUP_REQUIRED",
      status: 409,
      message: "Initial setup required",
      details: { setup: true },
    });
  });

  it("maps unknown server error codes to SERVER_ERROR", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            code: "INTERNAL_DB_DETAIL",
            message: "Internal failure",
          }),
          {
            status: 400,
            headers: { "content-type": "application/json" },
          },
        );
      }),
    );

    const client = createClient();

    await expect(client.post("/auth/register", {})).rejects.toMatchObject({
      code: "SERVER_ERROR",
      status: 400,
      message: "Internal failure",
    });
  });

  it("normalizes the extension email-verification error for recovery UI", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(403, {
          error: "email_not_verified",
          message: "Email verification required",
        }),
      ),
    );

    const client = createClient();

    await expect(client.post("/auth/login", {})).rejects.toMatchObject({
      code: "EMAIL_NOT_VERIFIED",
      status: 403,
    });
  });
});

describe("ApiClient session recovery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shares one refresh across concurrent eligible 401 responses and retries once", async () => {
    const { client, tokenManager } = await createAuthenticatedClient();
    let releaseRefresh!: () => void;
    const refreshGate = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });
    const refresh = vi.fn(async () => {
      await refreshGate;
      await tokenManager.setTokens({
        accessToken: "new-access",
        refreshToken: "new-refresh",
        expiresIn: 3600,
      });
    });
    tokenManager.setRefreshCallback(refresh);

    const fetchMock = vi.fn(
      async (_url: string | URL | Request, options?: RequestInit) => {
        const authorization = new Headers(options?.headers).get(
          "Authorization",
        );
        return authorization === "Bearer new-access"
          ? jsonResponse(200, { user: { id: "user-1" } })
          : jsonResponse(401, { code: "UNAUTHORIZED" });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const requests = [
      client.get<{ user: { id: string } }>("/auth/user"),
      client.get<{ user: { id: string } }>("/auth/user"),
    ];
    const outcome = Promise.all(requests).then(
      (responses) => ({ ok: true as const, responses }),
      (failure: unknown) => ({ ok: false as const, failure }),
    );
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    releaseRefresh();

    await expect(outcome).resolves.toEqual({
      ok: true,
      responses: [
        expect.objectContaining({ data: { user: { id: "user-1" } } }),
        expect.objectContaining({ data: { user: { id: "user-1" } } }),
      ],
    });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry authentication endpoints after a 401", async () => {
    const { client, tokenManager } = await createAuthenticatedClient();
    const onSessionExpired = vi.fn();
    tokenManager.setSessionExpiredCallback(onSessionExpired);
    const refresh = vi.fn(async () => undefined);
    tokenManager.setRefreshCallback(refresh);
    const fetchMock = vi.fn(async () =>
      jsonResponse(401, { code: "INVALID_CREDENTIALS" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(client.post("/auth/login", {})).rejects.toMatchObject({
      status: 401,
    });
    expect(refresh).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(tokenManager.getAccessToken()).toBe("old-access");
    expect(tokenManager.getRefreshToken()).toBe("refresh-token");
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it("does not replay non-idempotent authenticated requests", async () => {
    const { client, tokenManager } = await createAuthenticatedClient();
    const refresh = vi.fn(async () => undefined);
    tokenManager.setRefreshCallback(refresh);
    const fetchMock = vi.fn(async () => jsonResponse(401, {}));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      client.patch("/auth/me", { name: "New Name" }),
    ).rejects.toMatchObject({ status: 401 });
    expect(refresh).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
  });

  it("clears the session when refresh is rejected", async () => {
    const { client, tokenManager } = await createAuthenticatedClient();
    let sessionOwnerAuthenticated = true;
    const onSessionExpired = vi.fn(() => {
      sessionOwnerAuthenticated = false;
    });
    tokenManager.setSessionExpiredCallback(onSessionExpired);
    const refresh = vi.fn(async () => {
      throw new Error("refresh rejected");
    });
    tokenManager.setRefreshCallback(refresh);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(401, {})),
    );

    await expect(client.get("/auth/user")).rejects.toMatchObject({
      status: 401,
    });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(sessionOwnerAuthenticated).toBe(false);
  });

  it("surfaces a retry network error without clearing refreshed tokens", async () => {
    const { client, tokenManager } = await createAuthenticatedClient();
    const onSessionExpired = vi.fn();
    tokenManager.setSessionExpiredCallback(onSessionExpired);
    tokenManager.setRefreshCallback(async () => {
      await tokenManager.setTokens({
        accessToken: "new-access",
        refreshToken: "new-refresh",
        expiresIn: 3600,
      });
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockRejectedValueOnce(new TypeError("network unavailable"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(client.get("/auth/user")).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      status: 0,
    });
    expect(tokenManager.getAccessToken()).toBe("new-access");
    expect(tokenManager.getRefreshToken()).toBe("new-refresh");
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it("surfaces a retry server error without clearing refreshed tokens", async () => {
    const { client, tokenManager } = await createAuthenticatedClient();
    const onSessionExpired = vi.fn();
    tokenManager.setSessionExpiredCallback(onSessionExpired);
    tokenManager.setRefreshCallback(async () => {
      await tokenManager.setTokens({
        accessToken: "new-access",
        refreshToken: "new-refresh",
        expiresIn: 3600,
      });
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(401, {}))
        .mockResolvedValueOnce(
          jsonResponse(503, { code: "SERVICE_UNAVAILABLE" }),
        ),
    );

    await expect(client.get("/auth/user")).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      status: 503,
    });
    expect(tokenManager.getAccessToken()).toBe("new-access");
    expect(tokenManager.getRefreshToken()).toBe("new-refresh");
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it("notifies session expiry once when concurrent refreshes fail", async () => {
    const { client, tokenManager } = await createAuthenticatedClient();
    const refreshGate = deferred<void>();
    const onSessionExpired = vi.fn();
    tokenManager.setSessionExpiredCallback(onSessionExpired);
    tokenManager.setRefreshCallback(async () => {
      await refreshGate.promise;
      throw new Error("refresh rejected");
    });
    const fetchMock = vi.fn(async () => jsonResponse(401, {}));
    vi.stubGlobal("fetch", fetchMock);

    const requests = [client.get("/auth/user"), client.get("/auth/user")];
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    refreshGate.resolve();
    await Promise.allSettled(requests);

    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
  });

  it("caps an eligible request at one retry", async () => {
    const { client, tokenManager } = await createAuthenticatedClient();
    const onSessionExpired = vi.fn();
    tokenManager.setSessionExpiredCallback(onSessionExpired);
    const refresh = vi.fn(async () => {
      await tokenManager.setTokens({
        accessToken: "new-access",
        refreshToken: "new-refresh",
        expiresIn: 3600,
      });
    });
    tokenManager.setRefreshCallback(refresh);
    const fetchMock = vi.fn(async () => jsonResponse(401, {}));
    vi.stubGlobal("fetch", fetchMock);

    await expect(client.get("/auth/user")).rejects.toMatchObject({
      status: 401,
    });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });
});
