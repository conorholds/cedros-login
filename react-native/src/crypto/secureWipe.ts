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
export function wipeBytes(data: Uint8Array): void {
  if (!data || data.length === 0) return;

  // Fill with zeros
  data.fill(0);

  // Additional pass with random-looking pattern to defeat simple optimizations
  for (let i = 0; i < data.length; i++) {
    data[i] = (i * 0x5a) & 0xff;
  }

  // Final zero pass
  data.fill(0);
}

/**
 * Wipe multiple byte arrays
 *
 * @param arrays - Arrays to wipe
 */
export function wipeAll(...arrays: (Uint8Array | undefined | null)[]): void {
  for (const arr of arrays) {
    if (arr) {
      wipeBytes(arr);
    }
  }
}

/**
 * Execute a function with automatic cleanup of byte arrays
 *
 * @param arrays - Arrays to wipe after function completes
 * @param fn - Function to execute
 * @returns Result of function
 */
export async function withSecureCleanup<T>(arrays: Uint8Array[], fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } finally {
    wipeAll(...arrays);
  }
}

/**
 * Execute a synchronous function with automatic cleanup of byte arrays
 *
 * @param arrays - Arrays to wipe after function completes
 * @param fn - Function to execute
 * @returns Result of function
 */
export function withSecureCleanupSync<T>(arrays: Uint8Array[], fn: () => T): T {
  try {
    return fn();
  } finally {
    wipeAll(...arrays);
  }
}

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
export function createSecureContainer(): SecureContainer {
  const tracked: Uint8Array[] = [];

  return {
    track<T extends Uint8Array>(data: T): T {
      tracked.push(data);
      return data;
    },
    wipeAll(): void {
      for (const arr of tracked) {
        wipeBytes(arr);
      }
      tracked.length = 0;
    },
  };
}

export interface SecureContainer {
  /** Track a byte array for later cleanup */
  track<T extends Uint8Array>(data: T): T;
  /** Wipe all tracked arrays */
  wipeAll(): void;
}
