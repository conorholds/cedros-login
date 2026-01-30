/**
 * Secure memory wiping utilities
 *
 * Security: JavaScript does not guarantee memory clearing due to GC and
 * JIT optimization. These functions provide best-effort clearing of
 * sensitive data. For truly sensitive operations, consider using
 * WebAssembly with explicit memory management.
 *
 * IMPORTANT - String vs Uint8Array:
 * - Uint8Array CAN be wiped (wipeBytes) - use for keys, seeds, passwords
 * - Strings CANNOT be wiped in JavaScript - they are immutable
 * - The wipeString() function returns '' but does NOT clear memory
 * - Always prefer Uint8Array for sensitive cryptographic material
 *
 * Best practices:
 * - Call wipe functions as soon as sensitive data is no longer needed
 * - Use try/finally blocks to ensure wiping on errors
 * - Keep sensitive data lifetime as short as possible
 * - Convert sensitive strings to Uint8Array immediately, wipe after use
 */
/**
 * Best-effort wipe of a Uint8Array by zeroing all bytes
 *
 * Warning: JavaScript JIT may optimize away this operation. This provides
 * defense-in-depth but is not a guarantee against memory inspection.
 *
 * @param data - Array to wipe
 */
export declare function wipeBytes(data: Uint8Array): void;
/**
 * Wipe multiple byte arrays
 *
 * @param arrays - Arrays to wipe
 */
export declare function wipeAll(...arrays: (Uint8Array | undefined | null)[]): void;
/**
 * Best-effort wipe of a string by replacing with spaces
 *
 * @security CRYPTO-2: JavaScript strings are immutable - this is a BEST-EFFORT
 * operation only. The original string content WILL persist in memory until
 * garbage collected, and may be copied by the JS engine's string interning.
 * There is NO WAY to securely wipe strings in JavaScript.
 *
 * DO NOT rely on this for security-critical wiping. Always prefer Uint8Array
 * for sensitive data (keys, passwords, seeds) which CAN be securely wiped.
 *
 * @deprecated This function provides NO security guarantee. It exists only
 * for API completeness. Use Uint8Array + wipeBytes() for sensitive data.
 *
 * @param _str - String to "wipe" (cannot actually be cleared)
 * @returns Empty string (original cannot be modified)
 */
export declare function wipeString(_str: string): string;
/**
 * Execute a function with automatic cleanup of byte arrays
 *
 * @param arrays - Arrays to wipe after function completes
 * @param fn - Function to execute
 * @returns Result of function
 */
export declare function withSecureCleanup<T>(arrays: Uint8Array[], fn: () => Promise<T>): Promise<T>;
/**
 * Execute a synchronous function with automatic cleanup of byte arrays
 *
 * @param arrays - Arrays to wipe after function completes
 * @param fn - Function to execute
 * @returns Result of function
 */
export declare function withSecureCleanupSync<T>(arrays: Uint8Array[], fn: () => T): T;
/**
 * Create a scoped container for sensitive byte data with automatic cleanup
 *
 * Usage:
 * ```typescript
 * const container = createSecureContainer();
 * try {
 *   const key = container.track(generateKey());
 *   // use key...
 * } finally {
 *   container.wipeAll();
 * }
 * ```
 */
export declare function createSecureContainer(): SecureContainer;
export interface SecureContainer {
    /** Track a byte array for later cleanup */
    track<T extends Uint8Array>(data: T): T;
    /** Wipe all tracked arrays */
    wipeAll(): void;
}
