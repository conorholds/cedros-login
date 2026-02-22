/**
 * Circuit breaker for external service calls (Jupiter, RPC).
 *
 * States:
 * - CLOSED: Requests pass through. Consecutive failures tracked.
 * - OPEN: All requests fail immediately. After cooldown, transitions to HALF_OPEN.
 * - HALF_OPEN: One probe request allowed. Success → CLOSED, failure → OPEN.
 */
export type CircuitState = 'closed' | 'open' | 'half_open';
export interface CircuitBreakerOptions {
    /** Consecutive failures before opening (default: 5) */
    failureThreshold?: number;
    /** Milliseconds to wait in open state before half-open probe (default: 30000) */
    cooldownMs?: number;
    /** Name for logging (default: "CircuitBreaker") */
    name?: string;
}
export declare class CircuitBreaker {
    private state;
    private consecutiveFailures;
    private lastFailureTime;
    private readonly failureThreshold;
    private readonly cooldownMs;
    private readonly name;
    constructor(options?: CircuitBreakerOptions);
    /** Current circuit state */
    getState(): CircuitState;
    /**
     * Execute an async function through the circuit breaker.
     *
     * @throws Error with message containing "circuit open" if circuit is open
     * @throws The original error from `fn` if it fails (and records the failure)
     */
    call<T>(fn: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    /** Force-reset to closed (for testing or admin action) */
    reset(): void;
}
