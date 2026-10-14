import ApiClient, { ApiClientOptions } from "./client";
import AuthApi from "./auth";
import OrgsApi from "./orgs";
import { TokenManager } from "../../utils/tokenManager";

export type { ApiClientOptions };

export interface ApiServices {
  client: ApiClient;
  auth: AuthApi;
  orgs: OrgsApi;
  tokenManager: TokenManager;
}

export function createApiServices(options: ApiClientOptions): ApiServices {
  const client = new ApiClient(options);
  const auth = new AuthApi(client);
  const orgs = new OrgsApi(client);

  client.getTokenManager().setRefreshCallback(async () => {
    await auth.refreshToken();
  });

  return {
    client,
    auth,
    orgs,
    tokenManager: client.getTokenManager(),
  };
}

// Legacy direct-client accessors are mutated only by explicit initialization.
// CedrosLoginProvider uses isolated createApiServices bundles instead.
let authAPI: AuthApi | null = null;
let orgsAPI: OrgsApi | null = null;

export function initializeApiServices(options: ApiClientOptions): ApiServices {
  const services = createApiServices(options);
  authAPI = services.auth;
  orgsAPI = services.orgs;
  return services;
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
