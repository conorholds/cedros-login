import { getCsrfToken } from './csrf';
import { isApiErrorResponse, type ApiErrorData } from './apiErrors';
import {
  invalidateSharedReads,
  normalizedHeaders,
  sharedRead,
  type SharedReadOptions,
} from './requestCache';

export { handleApiError } from './apiErrors';
export type { FriendlyAuthMessages } from './apiErrors';

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRY_ATTEMPTS = 2;

export interface ApiClientConfig {
  baseUrl: string;
  timeoutMs?: number;
  retryAttempts?: number;
  getAccessToken?: () => string | null;
}

/**
 * Response validator function type.
 * Returns the validated data or throws on invalid shape.
 */
export type ResponseValidator<T> = (data: unknown) => T;

export interface RequestOptions<T = unknown> extends SharedReadOptions {
  method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  credentials?: RequestCredentials;
  skipRetry?: boolean;
  headers?: Record<string, string>;
  /** M-02: Optional validator to verify response shape at runtime */
  validator?: ResponseValidator<T>;
}

function validateResponse<T>(data: unknown, validator?: ResponseValidator<T>): T {
  if (!validator) return data as T;
  try {
    return validator(data);
  } catch (validationError) {
    throw new Error(
      `Response validation failed: ${validationError instanceof Error ? validationError.message : 'Invalid response shape'}`
    );
  }
}

/**
 * Fetch with timeout support
 */
function createCompatibleTimeoutSignal(
  url: string,
  timeoutMs: number
): { signal?: AbortSignal; timedOut: Promise<never>; cancel: () => void } {
  const controller = new AbortController();
  let signal: AbortSignal | undefined = controller.signal;

  if (typeof Request === 'function') {
    try {
      new Request(url, { signal: controller.signal });
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Expected signal')) {
        signal = undefined;
      } else {
        throw error;
      }
    }
  }

  let rejectTimeout!: (error: Error) => void;
  const timedOut = new Promise<never>((_, reject) => {
    rejectTimeout = reject;
  });
  const timeoutId = setTimeout(() => {
    if (signal) {
      controller.abort();
    }
    const error = new Error('Request timed out');
    error.name = 'AbortError';
    rejectTimeout(error);
  }, timeoutMs);

  return {
    signal,
    timedOut,
    cancel: () => clearTimeout(timeoutId),
  };
}

async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  consume: (response: Response) => Promise<T>
): Promise<T> {
  const timeout = createCompatibleTimeoutSignal(url, timeoutMs);

  try {
    const response = await Promise.race([
      fetch(url, {
        ...options,
        ...(timeout.signal ? { signal: timeout.signal } : {}),
      }).then(consume),
      timeout.timedOut,
    ]);
    return response;
  } finally {
    timeout.cancel();
  }
}

/**
 * Determines if an error is retryable
 * AbortError (timeout) should NOT be retried - server may have processed request
 */
function isRetryableError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && (error as { retryable?: boolean }).retryable) {
    return true;
  }
  if (error instanceof Error) {
    if ((error as { retryable?: boolean }).retryable) return true;
    // AbortError from timeout should NOT be retried
    // Server may have processed the request (just responded slowly)
    // Retrying could cause duplicate operations
    if (error.name === 'AbortError') return false;
    // Network errors (connection failed) are safe to retry
    if (error.message.includes('fetch')) return true;
  }
  return false;
}

/**
 * Delays execution for the specified duration
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * API client for making authenticated requests with timeout and retry support
 */
export class ApiClient {
  private baseUrl: string;
  private timeoutMs: number;
  private retryAttempts: number;
  private getAccessToken?: () => string | null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.retryAttempts = config.retryAttempts ?? DEFAULT_RETRY_ATTEMPTS;
    this.getAccessToken = config.getAccessToken;
  }

  /**
   * Make an API request with timeout and optional retry
   */
  async request<T>(options: RequestOptions<T>): Promise<T> {
    const {
      method,
      path,
      body,
      credentials = 'include',
      skipRetry = false,
      headers: customHeaders,
      validator,
    } = options;
    const url = `${this.baseUrl}${path}`;
    // DELETE excluded — retrying mid-flight DELETE failures risks double-deletion
    const isIdempotent = method === 'GET' || method === 'HEAD' || method === 'PUT';
    const maxAttempts = skipRetry || !isIdempotent ? 1 : this.retryAttempts + 1;

    // Build headers with CSRF token if available
    const headers: Record<string, string> = { ...(customHeaders ?? {}) };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    const accessToken = this.getAccessToken?.();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fetchWithTimeout(
          url,
          {
            method,
            headers,
            credentials,
            body: body !== undefined ? JSON.stringify(body) : undefined,
          },
          this.timeoutMs,
          async (response) => {
            const contentType = response.headers.get('content-type') || '';
            let data: ApiErrorData = {};

            if (contentType.includes('application/json')) {
              if (response.status !== 204) {
                try {
                  data = (await response.json()) as ApiErrorData;
                } catch (e) {
                  if (e instanceof Error && e.name === 'AbortError') throw e;
                  // UI-JSON: Include actual parse error for easier debugging
                  const parseError = e instanceof Error ? e.message : 'parse failed';
                  throw new Error(`Invalid JSON response: ${parseError}`);
                }
              }
            } else {
              // Handle non-JSON responses with informative error messages
              // Proxies/load balancers may return HTML error pages (502, 503)
              const text = await response.text();
              if (text) {
                // Truncate very long responses (e.g., HTML pages) for readability
                const truncated = text.length > 200 ? text.slice(0, 200) + '...' : text;
                const isHtml =
                  contentType.includes('text/html') || text.trimStart().startsWith('<');
                data = {
                  message: isHtml
                    ? `Unexpected HTML response (${response.status}). The server may be unavailable.`
                    : truncated,
                };
              }
            }

            if (!response.ok) {
              throw {
                isApiError: true,
                data,
                status: response.status,
                retryable: response.status >= 500,
              };
            }

            // The server has committed a successful mutation. Invalidate before
            // response validation so a client-side shape error cannot leave stale
            // reads reusable after an authoritative write.
            if (method !== 'GET' && method !== 'HEAD') {
              invalidateSharedReads(this.baseUrl);
            }

            return validateResponse(data, validator);
          }
        );
      } catch (error) {
        lastError = error;

        // Check if we should retry
        if (attempt < maxAttempts && isRetryableError(error)) {
          // Exponential backoff: 100ms, 200ms, 400ms...
          await delay(100 * Math.pow(2, attempt - 1));
          continue;
        }

        if (isApiErrorResponse(error)) {
          throw error;
        }

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * POST request helper
   */
  async post<T>(path: string, body: unknown, options?: Partial<RequestOptions<T>>): Promise<T> {
    return this.request<T>({ method: 'POST', path, body, ...options });
  }

  /**
   * GET request helper
   */
  async get<T>(path: string, options?: Partial<RequestOptions<T>>): Promise<T> {
    const { validator, ...readOptions } = options ?? {};
    const credentials = options?.credentials ?? 'include';
    const accessToken = this.getAccessToken?.() ?? '';
    const key = [
      this.baseUrl,
      credentials,
      accessToken,
      path,
      normalizedHeaders(options?.headers),
    ].join('\0');
    const data = await sharedRead(
      this.baseUrl,
      key,
      () =>
        this.request<T>({
          ...readOptions,
          method: 'GET',
          path,
          validator: undefined,
        }),
      {
        cacheTtlMs: options?.cacheTtlMs ?? 250,
        forceRefresh: options?.forceRefresh,
      }
    );
    return validateResponse(data, validator);
  }

  /**
   * PATCH request helper
   */
  async patch<T>(path: string, body: unknown, options?: Partial<RequestOptions<T>>): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body, ...options });
  }

  /**
   * DELETE request helper
   */
  async delete<T>(path: string, options?: Partial<RequestOptions<T>>): Promise<T> {
    return this.request<T>({ method: 'DELETE', path, ...options });
  }
}

/**
 * Helper to create a basic object shape validator.
 * Checks that required keys exist and are of expected types.
 * @example
 * const validateUser = createValidator<User>({
 *   id: 'string',
 *   email: 'string',
 *   role: 'string',
 * });
 */
export function createValidator<T>(
  shape: Record<keyof T & string, 'string' | 'number' | 'boolean' | 'object'>
): ResponseValidator<T> {
  return (data: unknown): T => {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Expected object response');
    }
    const obj = data as Record<string, unknown>;
    for (const [key, expectedType] of Object.entries(shape)) {
      if (!(key in obj)) {
        throw new Error(`Missing required field: ${key}`);
      }
      const actualType = typeof obj[key];
      if (actualType !== expectedType) {
        throw new Error(`Invalid type for ${key}: expected ${expectedType}, got ${actualType}`);
      }
    }
    return data as T;
  };
}
