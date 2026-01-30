export interface UseRateLimiterOptions {
    /** Maximum number of attempts allowed within the window */
    maxAttempts?: number;
    /** Time window in milliseconds */
    windowMs?: number;
}
export interface UseRateLimiterReturn {
    /**
     * Check if an action is allowed. Throws an error if rate limited.
     * Call this before performing the action.
     */
    checkLimit: () => void;
    /**
     * Check if an action is allowed without throwing.
     * Returns true if allowed, false if rate limited.
     */
    isAllowed: () => boolean;
    /**
     * Get remaining attempts in current window
     */
    getRemainingAttempts: () => number;
    /**
     * Get time until rate limit resets (in ms)
     */
    getTimeUntilReset: () => number;
    /**
     * Reset the rate limiter (e.g., after successful action)
     */
    reset: () => void;
}
/**
 * Rate limiting hook to prevent excessive API calls from the client.
 *
 * @param options - Rate limiter configuration
 * @returns Rate limiter functions
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { checkLimit, getRemainingAttempts } = useRateLimiter({
 *     maxAttempts: 5,
 *     windowMs: 60000, // 1 minute
 *   });
 *
 *   const handleLogin = async () => {
 *     try {
 *       checkLimit(); // Throws if rate limited
 *       await login(email, password);
 *     } catch (err) {
 *       if (err.message.includes('Too many attempts')) {
 *         // Show rate limit message
 *       }
 *     }
 *   };
 * }
 * ```
 */
export declare function useRateLimiter(options?: UseRateLimiterOptions): UseRateLimiterReturn;
