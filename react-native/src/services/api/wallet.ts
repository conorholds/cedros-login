import type {
  WalletStatusApiResponse,
  WalletMaterialResponse,
  WalletEnrollRequest,
  WalletRecoverRequest,
  SignTransactionRequest,
  SignTransactionResponse,
  RotateUserSecretRequest,
  WalletUnlockRequest,
  WalletUnlockResponse,
  ShareCRecoveryRequest,
  ShareCRecoveryResponse,
  PendingWalletRecoveryResponse,
  AcknowledgeRecoveryRequest,
  CreateDerivedWalletRequest,
  DerivedWalletResponse,
  AllWalletsListResponse,
} from "../../types";
import type ApiClient from "./client";

/** Discovery endpoint response */
export interface DiscoveryResponse {
  wallet?: {
    enabled: boolean;
    recoveryMode: string;
    unlockTtlSeconds: number;
  };
}

export class WalletApi {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async getWalletStatus(): Promise<WalletStatusApiResponse> {
    const response =
      await this.client.get<WalletStatusApiResponse>("/auth/wallet/status");
    return response.data;
  }

  async getWalletMaterial(): Promise<WalletMaterialResponse | null> {
    try {
      const response =
        await this.client.get<WalletMaterialResponse>("/auth/wallet/material");
      return response.data;
    } catch (error) {
      const apiError = error as { status?: number };
      if (apiError.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async enroll(request: WalletEnrollRequest): Promise<void> {
    await this.client.post("/auth/wallet/enroll", request);
  }

  async recover(request: WalletRecoverRequest): Promise<void> {
    await this.client.post("/auth/wallet/recover", request);
  }

  async getShareBForRecovery(
    request: ShareCRecoveryRequest,
  ): Promise<ShareCRecoveryResponse> {
    const response = await this.client.post<ShareCRecoveryResponse>(
      "/auth/wallet/share-b",
      request,
    );
    return response.data;
  }

  async signTransaction(
    request: SignTransactionRequest,
  ): Promise<SignTransactionResponse> {
    const response = await this.client.post<SignTransactionResponse>(
      "/auth/wallet/sign",
      request,
    );
    return response.data;
  }

  async rotateUserSecret(request: RotateUserSecretRequest): Promise<void> {
    await this.client.post("/auth/wallet/rotate-user-secret", request);
  }

  async unlock(request: WalletUnlockRequest): Promise<WalletUnlockResponse> {
    const response = await this.client.post<WalletUnlockResponse>(
      "/auth/wallet/unlock",
      request,
    );
    return response.data;
  }

  async lock(): Promise<void> {
    await this.client.post("/auth/wallet/lock", {});
  }

  async checkPendingRecovery(): Promise<PendingWalletRecoveryResponse> {
    const response = await this.client.get<PendingWalletRecoveryResponse>(
      "/auth/wallet/pending-recovery",
    );
    return response.data;
  }

  async acknowledgeRecovery(
    request: AcknowledgeRecoveryRequest,
  ): Promise<void> {
    await this.client.post("/auth/wallet/acknowledge-recovery", request);
  }

  async getDiscovery(): Promise<DiscoveryResponse> {
    const response =
      await this.client.get<DiscoveryResponse>("/auth/discovery");
    return response.data;
  }

  async listDerived(): Promise<AllWalletsListResponse> {
    const response =
      await this.client.get<AllWalletsListResponse>("/auth/wallet/derived");
    return response.data;
  }

  async createDerived(
    request: CreateDerivedWalletRequest,
  ): Promise<DerivedWalletResponse> {
    const response = await this.client.post<DerivedWalletResponse>(
      "/auth/wallet/derived",
      request,
    );
    return response.data;
  }

  async deleteDerived(walletId: string): Promise<void> {
    await this.client.delete(`/auth/wallet/derived/${walletId}`);
  }

}

export default WalletApi;
