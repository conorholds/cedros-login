import type { CedrosLoginConfig } from "../../types";
import { TokenManager } from "../../utils/tokenManager";
import {
  HttpTransport,
  type ApiResponse,
  type ApiError,
} from "./httpTransport";

export type { ApiResponse } from "./httpTransport";

const AUTH_RECOVERY_EXCLUDED_ENDPOINTS = new Set([
  "/auth/login",
  "/auth/login/mfa",
  "/auth/register",
  "/auth/refresh",
  "/auth/google",
  "/auth/apple",
  "/auth/solana",
  "/auth/solana/challenge",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/send-verification",
  "/auth/verify-email",
]);

export interface ApiClientOptions {
  config: CedrosLoginConfig;
  tokenManager: TokenManager;
}

export interface ApiReadOptions {
  cacheTtlMs?: number;
  forceRefresh?: boolean;
}

export const MAX_SETTLED_READS = 256;

class ApiClient {
  private readonly config: CedrosLoginConfig;
  private readonly tokenManager: TokenManager;
  private readonly transport: HttpTransport;
  private readonly readCache = new Map<
    string,
    { value: ApiResponse<unknown>; expiresAt: number }
  >();
  private readonly inFlightReads = new Map<
    string,
    Promise<ApiResponse<unknown>>
  >();
  private readGeneration = 0;
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(options: ApiClientOptions) {
    this.config = options.config;
    this.tokenManager = options.tokenManager;
    this.transport = new HttpTransport(options.config);
  }

  private async authHeaders(): Promise<Record<string, string>> {
    await this.tokenManager.hydrate();
    const accessToken = this.tokenManager.getAccessToken();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }

  private canRecover(method: string, endpoint: string): boolean {
    return method === "GET" && !AUTH_RECOVERY_EXCLUDED_ENDPOINTS.has(endpoint);
  }

  private async expireSession(): Promise<void> {
    this.invalidateReads();
    await this.tokenManager.expireSession().catch(() => undefined);
  }

  private invalidateReads(): void {
    this.readGeneration += 1;
    this.readCache.clear();
    clearTimeout(this.expiryTimer);
    this.expiryTimer = undefined;
    this.inFlightReads.clear();
  }

  // Maintenance scans at most the bounded settled working set, never pending IO.
  private maintainCache(): void {
    clearTimeout(this.expiryTimer);
    this.expiryTimer = undefined;
    const now = Date.now();
    let nextExpiry = Infinity;
    for (const [key, entry] of this.readCache) {
      if (entry.expiresAt <= now) this.readCache.delete(key);
      else nextExpiry = Math.min(nextExpiry, entry.expiresAt);
    }
    while (this.readCache.size > MAX_SETTLED_READS) {
      const oldest = this.readCache.keys().next();
      if (!oldest.done) this.readCache.delete(oldest.value);
    }
    if (this.readCache.size) {
      this.expiryTimer = setTimeout(
        () => this.maintainCache(),
        Math.min(2_147_483_647, Math.max(1, nextExpiry - now)),
      );
    }
  }

  private async readKey(
    endpoint: string,
    queryParams?: Record<string, string>,
  ): Promise<string> {
    await this.tokenManager.hydrate();
    const query = Object.entries(queryParams ?? {}).sort(([left], [right]) =>
      left.localeCompare(right),
    );
    return JSON.stringify([
      this.transport.url(endpoint, Object.fromEntries(query)),
      this.tokenManager.getAccessToken() ?? "",
    ]);
  }

  private async request<T>(
    endpoint: string,
    method: string,
    options: Omit<RequestInit, "method" | "headers"> = {},
    queryParams?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const url = this.transport.url(endpoint, queryParams);
    const execute = async () =>
      this.transport.send<T>(url, method, await this.authHeaders(), options);

    try {
      return await execute();
    } catch (error) {
      if (!(error instanceof Error) || (error as ApiError).status !== 401)
        throw error;
      if (!this.canRecover(method, endpoint)) {
        if (!AUTH_RECOVERY_EXCLUDED_ENDPOINTS.has(endpoint))
          await this.expireSession();
        throw error;
      }
      if (!this.tokenManager.getRefreshToken()) {
        await this.expireSession();
        throw error;
      }
      try {
        await this.tokenManager.refreshTokens();
      } catch {
        await this.expireSession();
        throw error;
      }
      try {
        return await execute();
      } catch (retryError) {
        if (
          retryError instanceof Error &&
          (retryError as ApiError).status === 401
        ) {
          await this.expireSession();
        }
        throw retryError;
      }
    }
  }

  async get<T>(
    endpoint: string,
    queryParams?: Record<string, string>,
    options: ApiReadOptions = {},
  ): Promise<ApiResponse<T>> {
    const key = await this.readKey(endpoint, queryParams);
    const inFlight = this.inFlightReads.get(key);
    if (inFlight) return inFlight as Promise<ApiResponse<T>>;
    const cached = this.readCache.get(key);
    if (!options.forceRefresh && cached && cached.expiresAt > Date.now()) {
      return cached.value as ApiResponse<T>;
    }
    this.readCache.delete(key);

    const generation = this.readGeneration;
    const request = this.request<T>(endpoint, "GET", {}, queryParams);
    this.inFlightReads.set(key, request as Promise<ApiResponse<unknown>>);
    try {
      const response = await request;
      const cacheTtlMs = options.cacheTtlMs ?? 250;
      if (
        generation === this.readGeneration &&
        cacheTtlMs > 0 &&
        Number.isFinite(cacheTtlMs)
      ) {
        this.readCache.set(key, {
          value: response,
          expiresAt: Date.now() + cacheTtlMs,
        });
        this.maintainCache();
      }
      return response;
    } finally {
      if (this.inFlightReads.get(key) === request)
        this.inFlightReads.delete(key);
    }
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    const response = await this.request<T>(endpoint, "POST", {
      body: JSON.stringify(body),
    });
    this.invalidateReads();
    return response;
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    const response = await this.request<T>(endpoint, "PUT", {
      body: JSON.stringify(body),
    });
    this.invalidateReads();
    return response;
  }

  async patch<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    const response = await this.request<T>(endpoint, "PATCH", {
      body: JSON.stringify(body),
    });
    this.invalidateReads();
    return response;
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await this.request<T>(endpoint, "DELETE");
    this.invalidateReads();
    return response;
  }

  getConfig(): CedrosLoginConfig {
    return this.config;
  }

  getTokenManager(): TokenManager {
    return this.tokenManager;
  }
}

export default ApiClient;
