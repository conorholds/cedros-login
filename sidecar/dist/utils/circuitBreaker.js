"use strict";
/**
 * Circuit breaker for external service calls (Jupiter, RPC).
 *
 * States:
 * - CLOSED: Requests pass through. Consecutive failures tracked.
 * - OPEN: All requests fail immediately. After cooldown, transitions to HALF_OPEN.
 * - HALF_OPEN: One probe request allowed. Success → CLOSED, failure → OPEN.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
class CircuitBreaker {
    state = 'closed';
    consecutiveFailures = 0;
    lastFailureTime = 0;
    failureThreshold;
    cooldownMs;
    name;
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold ?? 5;
        this.cooldownMs = options.cooldownMs ?? 30_000;
        this.name = options.name ?? 'CircuitBreaker';
    }
    /** Current circuit state */
    getState() {
        return this.state;
    }
    /**
     * Execute an async function through the circuit breaker.
     *
     * @throws Error with message containing "circuit open" if circuit is open
     * @throws The original error from `fn` if it fails (and records the failure)
     */
    async call(fn) {
        if (this.state === 'open') {
            const elapsed = Date.now() - this.lastFailureTime;
            if (elapsed < this.cooldownMs) {
                throw new Error(`[${this.name}] Circuit open — failing fast (${Math.ceil((this.cooldownMs - elapsed) / 1000)}s until probe)`);
            }
            // Cooldown elapsed: transition to half-open
            this.state = 'half_open';
            console.log(`[${this.name}] Circuit half-open — allowing probe request`);
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        if (this.state !== 'closed') {
            console.log(`[${this.name}] Circuit closed (${this.state} → closed)`);
        }
        this.consecutiveFailures = 0;
        this.state = 'closed';
    }
    onFailure() {
        this.consecutiveFailures++;
        this.lastFailureTime = Date.now();
        if (this.state === 'half_open') {
            this.state = 'open';
            console.log(`[${this.name}] Probe failed — circuit re-opened`);
            return;
        }
        if (this.consecutiveFailures >= this.failureThreshold) {
            this.state = 'open';
            console.log(`[${this.name}] Circuit opened after ${this.consecutiveFailures} consecutive failures`);
        }
    }
    /** Force-reset to closed (for testing or admin action) */
    reset() {
        this.state = 'closed';
        this.consecutiveFailures = 0;
        this.lastFailureTime = 0;
    }
}
exports.CircuitBreaker = CircuitBreaker;
