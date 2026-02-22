import { Platform } from "react-native";
import type {
  CedrosLoginConfig,
  AuthErrorCode,
} from "../../types";
import { TokenManager } from "../../utils/tokenManager";

/**
 * The set of error codes the server is permitted to communicate to the client.
 * Any code not in this set is replaced with SERVER_ERROR to avoid leaking
 * internal implementation details (RN-05).
 */
const ALLOWED_ERROR_CODES = new Set<AuthErrorCode>([
  "INVALID_CREDENTIALS",
  "ACCOUNT_LOCKED",
  "EMAIL_EXISTS",
  "WALLET_EXISTS",
  "INVALID_TOKEN",
  "TOKEN_EXPIRED",
  "INVALID_SIGNATURE",
  "INVALID_PUBLIC_KEY",
  "CHALLENGE_EXPIRED",
  "VALIDATION_ERROR",
  "RATE_LIMITED",
  "NOT_FOUND",
  "FORBIDDEN",
  "UNAUTHORIZED",
  "STEP_UP_REQUIRED",
  "TOTP_REQUIRED",
  "INVALID_TOTP_CODE",
  "LOGIN_FAILED",
  "REGISTER_FAILED",
  "LOGOUT_FAILED",
  "REFRESH_FAILED",
  "SERVICE_UNAVAILABLE",
  "SERVER_ERROR",
  "NETWORK_ERROR",
  "UNKNOWN_ERROR",
]);

export interface ApiClientOptions {
  config: CedrosLoginConfig;
  tokenManager: TokenManager;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface ApiError extends Error {
  code: AuthErrorCode;
  status: number;
  details?: Record<string, unknown>;
}

export class ApiClient {
  private config: CedrosLoginConfig;
  private tokenManager: TokenManager;

  constructor(options: ApiClientOptions) {
    this.config = options.config;
    this.tokenManager = options.tokenManager;
  }

  private getBaseUrl(): string {
    return this.config.serverUrl.replace(/\/$/, "");
  }

  private getMobileHeaders(): Record<string, string> {
    return {
      "User-Agent": `CedrosReactNative/${Platform.OS}/${Platform.Version}`,
      "X-Mobile-App": "cedros-login-react-native",
      "X-Mobile-Platform": Platform.OS,
      "X-Mobile-Version": String(Platform.Version),
      Accept: "application/json",
    };
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = this.tokenManager.getAccessToken();
    if (!accessToken) {
      return {};
    }
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  private createApiError(response: Response, data: unknown): ApiError {
    const errorData = data as {
      error?: {
        code?: string;
        message?: string;
        details?: Record<string, unknown>;
      };
    };

    // RN-05: Only forward codes that are part of the known contract.
    const rawCode = errorData.error?.code as AuthErrorCode | undefined;
    const code: AuthErrorCode =
      rawCode && ALLOWED_ERROR_CODES.has(rawCode) ? rawCode : "SERVER_ERROR";

    // RN-05: Suppress server-originated message for 5xx — avoids leaking
    // internal stack traces or DB errors to the client.
    const is5xx = response.status >= 500;
    const message = is5xx
      ? "An unexpected server error occurred. Please try again later."
      : errorData.error?.message || `Request failed (${response.status})`;

    // RN-05: Never forward server details on 5xx responses.
    const details = is5xx ? undefined : errorData.error?.details;

    const error = new Error(message) as ApiError;
    error.code = code;
    error.status = response.status;
    error.details = details;
    return error;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!response.ok) {
      if (response.status === 401) {
        await this.tokenManager.clear();
      }
      const data = isJson
        ? await response.json()
        : { error: { code: "SERVER_ERROR", message: response.statusText } };
      throw this.createApiError(response, data);
    }

    const data = isJson ? await response.json() : (null as T);
    const headers: Record<string, string> = {};
    response.headers.forEach((value: string, key: string) => {
      headers[key] = value;
    });

    return {
      data,
      status: response.status,
      headers,
    };
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs: number,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        const timeoutError = new Error("Request timeout") as ApiError;
        timeoutError.code = "NETWORK_ERROR";
        timeoutError.status = 0;
        throw timeoutError;
      }
      const networkError = new Error("Network error") as ApiError;
      networkError.code = "NETWORK_ERROR";
      networkError.status = 0;
      throw networkError;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(
    endpoint: string,
    queryParams?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const baseUrl = this.getBaseUrl();
    const url = new URL(`${baseUrl}${endpoint}`);

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }

    const authHeaders = await this.getAuthHeaders();
    const timeout = this.config.requestTimeout || 10000;

    const response = await this.fetchWithTimeout(
      url.toString(),
      {
        method: "GET",
        headers: {
          ...this.getMobileHeaders(),
          ...authHeaders,
        },
      },
      timeout,
    );

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();
    const timeout = this.config.requestTimeout || 10000;

    const response = await this.fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: {
          ...this.getMobileHeaders(),
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      timeout,
    );

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();
    const timeout = this.config.requestTimeout || 10000;

    const response = await this.fetchWithTimeout(
      url,
      {
        method: "PUT",
        headers: {
          ...this.getMobileHeaders(),
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      timeout,
    );

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();
    const timeout = this.config.requestTimeout || 10000;

    const response = await this.fetchWithTimeout(
      url,
      {
        method: "PATCH",
        headers: {
          ...this.getMobileHeaders(),
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      timeout,
    );

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();
    const timeout = this.config.requestTimeout || 10000;

    const response = await this.fetchWithTimeout(
      url,
      {
        method: "DELETE",
        headers: {
          ...this.getMobileHeaders(),
          ...authHeaders,
        },
      },
      timeout,
    );

    return this.handleResponse<T>(response);
  }

  getConfig(): CedrosLoginConfig {
    return this.config;
  }

  getTokenManager(): TokenManager {
    return this.tokenManager;
  }
}

export default ApiClient;
