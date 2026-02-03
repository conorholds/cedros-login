import ApiClient, { ApiClientOptions, ApiResponse, ApiError } from "./client";
import AuthApi from "./auth";
import OrgsApi from "./orgs";
import WalletApi from "./wallet";
import { TokenManager } from "../../utils/tokenManager";

export { ApiClient, AuthApi, OrgsApi, WalletApi, TokenManager };
export type { ApiClientOptions, ApiResponse, ApiError };

export interface ApiServices {
  client: ApiClient;
  auth: AuthApi;
  orgs: OrgsApi;
  wallet: WalletApi;
  tokenManager: TokenManager;
}

export function createApiServices(options: ApiClientOptions): ApiServices {
  const client = new ApiClient(options);
  const auth = new AuthApi(client);
  const orgs = new OrgsApi(client);
  const wallet = new WalletApi(client);

  client.getTokenManager().setRefreshCallback(async () => {
    await auth.refreshToken();
  });

  return {
    client,
    auth,
    orgs,
    wallet,
    tokenManager: client.getTokenManager(),
  };
}

// Singleton instances - initialized lazily
let apiClient: ApiClient | null = null;
let authAPI: AuthApi | null = null;
let orgsAPI: OrgsApi | null = null;
let walletAPI: WalletApi | null = null;

export function initializeApiServices(options: ApiClientOptions): ApiServices {
  apiClient = new ApiClient(options);
  authAPI = new AuthApi(apiClient);
  orgsAPI = new OrgsApi(apiClient);
  walletAPI = new WalletApi(apiClient);

  apiClient.getTokenManager().setRefreshCallback(async () => {
    if (authAPI) {
      await authAPI.refreshToken();
    }
  });

  return {
    client: apiClient,
    auth: authAPI,
    orgs: orgsAPI,
    wallet: walletAPI,
    tokenManager: apiClient.getTokenManager(),
  };
}

export function getAuthApi(): AuthApi {
  if (!authAPI) {
    throw new Error(
      "API services not initialized. Call initializeApiServices first.",
    );
  }
  return authAPI;
}

export function getOrgsApi(): OrgsApi {
  if (!orgsAPI) {
    throw new Error(
      "API services not initialized. Call initializeApiServices first.",
    );
  }
  return orgsAPI;
}

export function getWalletApi(): WalletApi {
  if (!walletAPI) {
    throw new Error(
      "API services not initialized. Call initializeApiServices first.",
    );
  }
  return walletAPI;
}

export default createApiServices;
