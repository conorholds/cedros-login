import { AuthError } from '../types';
export interface ApiClientConfig {
    baseUrl: string;
    timeoutMs?: number;
    retryAttempts?: number;
    getAccessToken?: () => string | null;
}
/**
 * M-02: Response validator function type.
 * Returns the validated data or throws on invalid shape.
 */
export type ResponseValidator<T> = (data: unknown) => T;
export interface RequestOptions<T = unknown> {
    method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    body?: unknown;
    credentials?: RequestCredentials;
    skipRetry?: boolean;
    /** M-02: Optional validator to verify response shape at runtime */
    validator?: ResponseValidator<T>;
}
/**
 * Creates an authentication error from response data
 */
export declare function createAuthError(data: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
}, fallbackMessage: string): AuthError;
/**
 * Creates a network error
 */
export declare function createNetworkError(): AuthError;
/**
 * API client for making authenticated requests with timeout and retry support
 */
export declare class ApiClient {
    private baseUrl;
    private timeoutMs;
    private retryAttempts;
    private getAccessToken?;
    constructor(config: ApiClientConfig);
    /**
     * Make an API request with timeout and optional retry
     */
    request<T>(options: RequestOptions<T>): Promise<T>;
    /**
     * POST request helper
     */
    post<T>(path: string, body: unknown, options?: Partial<RequestOptions<T>>): Promise<T>;
    /**
     * GET request helper
     */
    get<T>(path: string, options?: Partial<RequestOptions<T>>): Promise<T>;
    /**
     * PATCH request helper
     */
    patch<T>(path: string, body: unknown, options?: Partial<RequestOptions<T>>): Promise<T>;
    /**
     * DELETE request helper
     */
    delete<T>(path: string, options?: Partial<RequestOptions<T>>): Promise<T>;
}
/**
 * M-02: Helper to create a basic object shape validator.
 * Checks that required keys exist and are of expected types.
 * @example
 * const validateUser = createValidator<User>({
 *   id: 'string',
 *   email: 'string',
 *   role: 'string',
 * });
 */
export declare function createValidator<T>(shape: Record<keyof T & string, 'string' | 'number' | 'boolean' | 'object'>): ResponseValidator<T>;
/**
 * Converts API errors to AuthError format
 */
export declare function handleApiError(err: unknown, fallbackMessage: string): AuthError;
