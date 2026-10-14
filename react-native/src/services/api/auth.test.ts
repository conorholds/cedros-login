import { describe, expect, it, vi } from "vitest";
import { AuthApi } from "./auth";

function createClient() {
  const tokenManager = {
    getRefreshToken: vi.fn(),
    setTokens: vi.fn(),
    clear: vi.fn(),
  };

  const client = {
    post: vi.fn(),
    patch: vi.fn(),
    getTokenManager: vi.fn(() => tokenManager),
  };

  return { client, tokenManager };
}

describe("AuthApi.refreshToken", () => {
  it("stores returned tokens when refresh succeeds", async () => {
    const { client, tokenManager } = createClient();
    tokenManager.getRefreshToken.mockReturnValue("refresh-token");
    client.post.mockResolvedValue({
      data: {
        tokens: {
          accessToken: "new-access",
          refreshToken: "new-refresh",
          expiresIn: 3600,
        },
      },
    });

    const api = new AuthApi(client as never);
    const result = await api.refreshToken();

    expect(client.post).toHaveBeenCalledWith("/auth/refresh", {
      refreshToken: "refresh-token",
    });
    expect(tokenManager.setTokens).toHaveBeenCalledWith(
      {
        accessToken: "new-access",
        refreshToken: "new-refresh",
        expiresIn: 3600,
      },
      "refresh-token",
    );
    expect(result.accessToken).toBe("new-access");
  });

  it("fails when server omits tokens in refresh response", async () => {
    const { client, tokenManager } = createClient();
    tokenManager.getRefreshToken.mockReturnValue("refresh-token");
    client.post.mockResolvedValue({
      data: {},
    });

    const api = new AuthApi(client as never);

    await expect(api.refreshToken()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
    });
    expect(tokenManager.setTokens).not.toHaveBeenCalled();
  });
});

describe("AuthApi.getSolanaChallenge", () => {
  it("uses POST with publicKey payload", async () => {
    const { client } = createClient();
    client.post.mockResolvedValue({
      data: {
        nonce: "n",
        message: "m",
        expiresAt: "2026-01-01T00:00:00Z",
      },
    });

    const api = new AuthApi(client as never);
    const response = await api.getSolanaChallenge("wallet-pubkey");

    expect(client.post).toHaveBeenCalledWith("/auth/solana/challenge", {
      publicKey: "wallet-pubkey",
    });
    expect(response.nonce).toBe("n");
  });
});

describe("AuthApi.getAppleNonce", () => {
  it("requests a fresh server-owned nonce", async () => {
    const { client } = createClient();
    client.post.mockResolvedValue({ data: { nonce: "server-nonce" } });
    const api = new AuthApi(client as never);

    await expect(api.getAppleNonce()).resolves.toBe("server-nonce");
    expect(client.post).toHaveBeenCalledWith("/auth/apple/nonce", {});
  });
});

describe("AuthApi email verification endpoints", () => {
  it("uses /auth/send-verification for resend", async () => {
    const { client } = createClient();
    client.post.mockResolvedValue({ data: {} });
    const api = new AuthApi(client as never);

    await api.resendVerificationEmail("test@example.com");

    expect(client.post).toHaveBeenCalledWith("/auth/send-verification", {
      email: "test@example.com",
    });
  });

  it("uses POST /auth/verify-email with token body", async () => {
    const { client } = createClient();
    client.post.mockResolvedValue({ data: {} });
    const api = new AuthApi(client as never);

    await api.verifyEmail("verification-token");

    expect(client.post).toHaveBeenCalledWith("/auth/verify-email", {
      token: "verification-token",
    });
  });
});

describe("AuthApi.updateProfile", () => {
  it("uses PATCH /auth/me and returns the updated profile", async () => {
    const { client } = createClient();
    client.patch.mockResolvedValue({
      data: {
        id: "user-1",
        email: "shopper@example.com",
        name: "Ada Lovelace",
        emailVerified: true,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-02T00:00:00Z",
      },
    });
    const api = new AuthApi(client as never);

    const response = await api.updateProfile({ name: "Ada Lovelace" });

    expect(client.patch).toHaveBeenCalledWith("/auth/me", {
      name: "Ada Lovelace",
    });
    expect(response.name).toBe("Ada Lovelace");
  });
});

describe("AuthApi.logout", () => {
  it("clears local authority before the revocation request and reports failure", async () => {
    const { client, tokenManager } = createClient();
    tokenManager.getRefreshToken.mockReturnValue("old-refresh");
    client.post.mockImplementation(async () => {
      expect(tokenManager.clear).toHaveBeenCalledOnce();
      throw new Error("network failed");
    });
    await expect(new AuthApi(client as never).logout()).rejects.toThrow(
      "network failed",
    );
    expect(client.post).toHaveBeenCalledWith("/auth/logout", {
      refreshToken: "old-refresh",
    });
  });

  it("does not clear a new login when old logout completes", async () => {
    const { client, tokenManager } = createClient();
    tokenManager.getRefreshToken.mockReturnValue("old-refresh");
    let finish!: () => void;
    client.post.mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    const logout = new AuthApi(client as never).logout();
    await Promise.resolve();
    expect(tokenManager.clear).toHaveBeenCalledOnce();
    tokenManager.getRefreshToken.mockReturnValue("new-login");
    finish();
    await logout;
    expect(tokenManager.clear).toHaveBeenCalledOnce();
  });
});
