import type {
  AuthResponse,
  TokenPair,
  MfaRequiredResponse,
  MfaLoginRequest,
} from "../../types";
import type ApiClient from "./client";

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
  user?: string;
  fullName?: {
    givenName?: string;
    familyName?: string;
  };
}

export interface SolanaSignInRequest {
  walletAddress: string;
  signature: string;
  nonce: string;
  publicKey?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken?: string;
}

export class AuthApi {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/auth/login",
      request,
    );

    if (response.data.tokens) {
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

  async googleSignIn(request: GoogleSignInRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/auth/google",
      request,
    );

    if (response.data.tokens) {
      await this.client.getTokenManager().setTokens(response.data.tokens);
    }

    return response.data;
  }

  async appleSignIn(request: AppleSignInRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/auth/apple",
      request,
    );

    if (response.data.tokens) {
      await this.client.getTokenManager().setTokens(response.data.tokens);
    }

    return response.data;
  }

  async solanaSignIn(request: SolanaSignInRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/auth/solana",
      request,
    );

    if (response.data.tokens) {
      await this.client.getTokenManager().setTokens(response.data.tokens);
    }

    return response.data;
  }

  async getSolanaChallenge(
    walletAddress: string,
  ): Promise<{ nonce: string; message: string; expiresAt: string }> {
    const response = await this.client.get<{
      nonce: string;
      message: string;
      expiresAt: string;
    }>("/auth/solana/challenge", { walletAddress });
    return response.data;
  }

  async logout(): Promise<void> {
    const refreshToken = this.client.getTokenManager().getRefreshToken();

    try {
      if (refreshToken) {
        await this.client.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Ignore logout errors
    } finally {
      await this.client.getTokenManager().clear();
    }
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

    const response = await this.client.post<TokenPair>("/auth/refresh", {
      refreshToken,
    });
    await this.client.getTokenManager().setTokens(response.data);

    return response.data;
  }

  async forgotPassword(email: string): Promise<void> {
    await this.client.post("/auth/forgot-password", { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.client.post("/auth/reset-password", { token, newPassword });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    await this.client.post("/auth/resend-verification", { email });
  }

  async verifyEmail(token: string): Promise<void> {
    await this.client.get("/auth/verify-email", { token });
  }
}

export default AuthApi;
