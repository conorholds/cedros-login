import { Platform } from "react-native";
import type { AuthErrorCode, CedrosLoginConfig } from "../../types";

const ALLOWED_ERROR_CODES = new Set<AuthErrorCode>([
  "INVALID_CREDENTIALS",
  "ACCOUNT_LOCKED",
  "EMAIL_EXISTS",
  "EMAIL_NOT_VERIFIED",
  "ACCOUNT_LINK_REQUIRED",
  "WALLET_EXISTS",
  "INVALID_TOKEN",
  "TOKEN_EXPIRED",
  "INVALID_SIGNATURE",
  "INVALID_PUBLIC_KEY",
  "CHALLENGE_EXPIRED",
  "VALIDATION_ERROR",
  "RATE_LIMITED",
  "SIGNUP_LIMIT_REACHED",
  "NOT_FOUND",
  "FORBIDDEN",
  "UNAUTHORIZED",
  "STEP_UP_REQUIRED",
  "SETUP_REQUIRED",
  "DISPOSABLE_EMAIL_BLOCKED",
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

interface ServerErrorBody {
  code?: string;
  error?: string;
  message?: string;
  details?: Record<string, unknown>;
}

function apiError(message: string, code: AuthErrorCode, status: number) {
  const error = new Error(message) as ApiError;
  error.code = code;
  error.status = status;
  return error;
}

/** React Native HTTP transport. Session recovery remains in ApiClient. */
export class HttpTransport {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config: CedrosLoginConfig) {
    this.baseUrl = config.serverUrl.replace(/\/$/, "");
    this.timeoutMs = config.requestTimeout || 10_000;
  }

  url(endpoint: string, queryParams?: Record<string, string>): string {
    if (!queryParams) return `${this.baseUrl}${endpoint}`;
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
    return url.toString();
  }

  async send<T>(
    url: string,
    method: string,
    authHeaders: Record<string, string>,
    options: Omit<RequestInit, "method" | "headers"> = {},
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timedOut = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(apiError("Request timeout", "NETWORK_ERROR", 0));
        controller.abort();
      }, this.timeoutMs);
    });
    try {
      const operation = Promise.resolve()
        .then(() =>
          fetch(url, {
            ...options,
            method,
            signal: controller.signal,
            headers: {
              "User-Agent": `CedrosReactNative/${Platform.OS}/${Platform.Version}`,
              "X-Mobile-App": "cedros-login-react-native",
              "X-Mobile-Platform": Platform.OS,
              "X-Mobile-Version": String(Platform.Version),
              Accept: "application/json",
              ...authHeaders,
              ...(options.body ? { "Content-Type": "application/json" } : {}),
            },
          }),
        )
        .catch((error: unknown) => {
          throw apiError(
            error instanceof Error && error.name === "AbortError"
              ? "Request timeout"
              : "Network error",
            "NETWORK_ERROR",
            0,
          );
        })
        .then((response) => this.parse<T>(response));
      return await Promise.race([operation, timedOut]);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw apiError("Request timeout", "NETWORK_ERROR", 0);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async parse<T>(response: Response): Promise<ApiResponse<T>> {
    const isJson = (response.headers.get("content-type") || "").includes(
      "application/json",
    );
    // Consume even discarded non-JSON bodies under the same attempt deadline.
    if (!isJson && response.status !== 204) await response.text();
    if (!response.ok) {
      const data = isJson
        ? await response.json()
        : { code: "SERVER_ERROR", message: response.statusText };
      throw this.responseError(response, data);
    }

    const data =
      isJson && response.status !== 204 ? await response.json() : null;
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return { data, status: response.status, headers };
  }

  private responseError(response: Response, data: unknown): ApiError {
    const body =
      typeof data === "object" && data !== null
        ? (data as ServerErrorBody)
        : {};
    const rawCode = (body.code ?? body.error)?.toUpperCase() as
      | AuthErrorCode
      | undefined;
    const code =
      rawCode && ALLOWED_ERROR_CODES.has(rawCode) ? rawCode : "SERVER_ERROR";
    const is5xx = response.status >= 500;
    const error = apiError(
      is5xx
        ? "An unexpected server error occurred. Please try again later."
        : body.message || `Request failed (${response.status})`,
      code,
      response.status,
    );
    error.details = is5xx ? undefined : body.details;
    return error;
  }
}
