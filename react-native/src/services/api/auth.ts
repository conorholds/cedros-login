import type {
  AuthResponse,
  LoginAttemptResponse,
  ChallengeResponse,
  TokenPair,
  MfaLoginRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "../../types";
import type ApiClient from "./client";
import type { ApiReadOptions } from "./client";
import type { ApiResponse } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface GoogleSignInRequest {
  idToken: string;
}

export interface AppleSignInRequest {
  idToken: string;
  authorizationCode?: string;
  name?: string;
  nonce: string;
  referral?: string;
  accessCode?: string;
}

export interface SolanaSignInRequest {
  walletAddress: string;
  signature: string;
  nonce: string;
  publicKey?: string;
}

export class AuthApi {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async login(request: LoginRequest): Promise<LoginAttemptResponse> {
    const response = await this.client.post<LoginAttemptResponse>(
      "/auth/login",
      request,
    );

    if (!("mfaRequired" in response.data) && response.data.tokens) {
      await this.client.getTokenManager().setTokens(response.data.tokens);
    }

    return response.data;
  }

  async loginMfa(request: MfaLoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/auth/login/mfa",
      request,
    );

    if (response.data.tokens) {
      await this.client.getTokenManager().setTokens(response.data.tokens);
    }

    return response.data;
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/auth/register",
      request,
    );

    if (response.data.tokens) {
      await this.client.getTokenManager().setTokens(response.data.tokens);
    }

    return response.data;
  }

  async googleSignIn(
    request: GoogleSignInRequest,
  ): Promise<LoginAttemptResponse> {
    const response = await this.client.post<LoginAttemptResponse>(
      "/auth/google",
      request,
    );

    if (!("mfaRequired" in response.data) && response.data.tokens) {
      await this.client.getTokenManager().setTokens(response.data.tokens);
    }

    return response.data;
  }

  async appleSignIn(
    request: AppleSignInRequest,
  ): Promise<LoginAttemptResponse> {
    const response = await this.client.post<LoginAttemptResponse>(
      "/auth/apple",
      request,
    );

    if (!("mfaRequired" in response.data) && response.data.tokens) {
      await this.client.getTokenManager().setTokens(response.data.tokens);
    }

    return response.data;
  }

  async getAppleNonce(): Promise<string> {
    const response = await this.client.post<{ nonce: string }>(
      "/auth/apple/nonce",
      {},
    );
    return response.data.nonce;
  }

  async solanaSignIn(
    request: SolanaSignInRequest,
  ): Promise<LoginAttemptResponse> {
    const response = await this.client.post<LoginAttemptResponse>(
      "/auth/solana",
      request,
    );

    if (!("mfaRequired" in response.data) && response.data.tokens) {
      await this.client.getTokenManager().setTokens(response.data.tokens);
    }

    return response.data;
  }

  async getSolanaChallenge(walletAddress: string): Promise<ChallengeResponse> {
    const response = await this.client.post<ChallengeResponse>(
      "/auth/solana/challenge",
      { publicKey: walletAddress },
    );
    return response.data;
  }

  async logout(): Promise<void> {
    const manager = this.client.getTokenManager();
    const refreshToken = manager.getRefreshToken();
    // Clear before network IO so an in-flight refresh cannot restore this login.
    await manager.clear();
    if (refreshToken) await this.client.post("/auth/logout", { refreshToken });
  }

  async refreshToken(): Promise<TokenPair> {
    const refreshToken = this.client.getTokenManager().getRefreshToken();

    if (!refreshToken) {
      const error = new Error("No refresh token available") as Error & {
        code: string;
        status: number;
      };
      error.code = "UNAUTHORIZED";
      error.status = 401;
      throw error;
    }

    const response = await this.client.post<{ tokens?: TokenPair }>(
      "/auth/refresh",
      {
        refreshToken,
      },
    );
    const tokens = response.data.tokens;
    if (!tokens) {
      const error = new Error("No refreshed tokens returned") as Error & {
        code: string;
        status: number;
      };
      error.code = "UNAUTHORIZED";
      error.status = 401;
      throw error;
    }
    await this.client.getTokenManager().setTokens(tokens, refreshToken);

    return tokens;
  }

  async forgotPassword(email: string): Promise<void> {
    await this.client.post("/auth/forgot-password", { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.client.post("/auth/reset-password", { token, newPassword });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    await this.client.post("/auth/send-verification", { email });
  }

  async verifyEmail(token: string): Promise<void> {
    await this.client.post("/auth/verify-email", { token });
  }

  async updateProfile(
    request: UpdateProfileRequest,
  ): Promise<UpdateProfileResponse> {
    const response = await this.client.patch<UpdateProfileResponse>(
      "/auth/me",
      request,
    );
    return response.data;
  }

  async requestAccountDeletion(email: string): Promise<void> {
    await this.client.post("/auth/account-deletion/request", { email });
  }

  async deleteCurrentAccount(confirmText = "DELETE"): Promise<void> {
    await this.client.post("/auth/account-deletion/me", { confirmText });
  }

  /** Public accessor for the token manager (avoids private bracket access) */
  getTokenManager() {
    return this.client.getTokenManager();
  }

  /** Public accessor for GET requests (avoids private bracket access) */
  async getRequest<T>(
    endpoint: string,
    options?: ApiReadOptions,
  ): Promise<ApiResponse<T>> {
    return this.client.get<T>(endpoint, undefined, options);
  }
}

export default AuthApi;
