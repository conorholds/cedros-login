import { Platform } from "react-native";
import type {
  CedrosLoginConfig,
  TokenPair,
  AuthError,
  AuthErrorCode,
} from "../../types";
import { TokenManager } from "../../utils/tokenManager";

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
    const code = (errorData.error?.code as AuthErrorCode) || "SERVER_ERROR";
    const message =
      errorData.error?.message || `HTTP Error: ${response.status}`;
    const details = errorData.error?.details;

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
    response.headers.forEach((value, key) => {
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
