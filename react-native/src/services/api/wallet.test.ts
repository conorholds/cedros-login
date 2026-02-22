import { describe, expect, it, vi } from "vitest";
import { WalletApi } from "./wallet";

function createClient() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
}

describe("WalletApi contracts", () => {
  it("uses /auth/wallet/share-b for recovery share lookup", async () => {
    const client = createClient();
    client.post.mockResolvedValue({
      data: { shareB: "share", solanaPubkey: "pubkey" },
    });
    const api = new WalletApi(client as never);

    await api.getShareBForRecovery({ shareC: "enc-c" });

    expect(client.post).toHaveBeenCalledWith("/auth/wallet/share-b", {
      shareC: "enc-c",
    });
  });

  it("uses /auth/wallet/rotate-user-secret for secret rotation", async () => {
    const client = createClient();
    client.post.mockResolvedValue({ data: {} });
    const api = new WalletApi(client as never);

    await api.rotateUserSecret({
      oldEncryptedShareA: "old",
      newEncryptedShareA: "new",
      newSalt: "salt",
      newNonce: "nonce",
      keyDerivationVersion: "v2",
    } as never);

    expect(client.post).toHaveBeenCalledWith(
      "/auth/wallet/rotate-user-secret",
      {
        oldEncryptedShareA: "old",
        newEncryptedShareA: "new",
        newSalt: "salt",
        newNonce: "nonce",
        keyDerivationVersion: "v2",
      },
    );
  });
});
