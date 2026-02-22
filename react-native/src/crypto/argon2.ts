/**
 * Argon2id Key Derivation Function using hash-wasm
 *
 * Security:
 * - Argon2id is the recommended variant (hybrid of Argon2i and Argon2d)
 * - Uses OWASP-recommended parameters by default
 * - Memory-hard to resist GPU/ASIC attacks
 *
 * H-01: Memory Limitation
 * JavaScript strings are immutable and cannot be securely wiped from memory.
 * The password parameter persists in memory until garbage collected.
 * For maximum security with sensitive passwords:
 * - Use argon2DeriveFromBytes() with Uint8Array input
 * - Wipe the Uint8Array after derivation using wipeBytes()
 * - Keep password lifetime as short as possible
 */

import { argon2id } from "hash-wasm";
import type { EncryptionKey, Argon2Salt, KdfParams } from "./types";
import { DEFAULT_KDF_PARAMS, toEncryptionKey } from "./types";
import { wipeBytes } from "./secureWipe";

/** Output key length in bytes (256-bit for AES-256) */
const OUTPUT_LENGTH = 32;

/**
 * Derive an encryption key from a password using Argon2id
 *
 * @security H-01: The password string cannot be wiped from memory after use.
 * For sensitive applications, prefer argon2DeriveFromBytes() which accepts
 * Uint8Array that CAN be securely wiped.
 *
 * @param password - User password or PIN
 * @param salt - Unique salt (16+ bytes)
 * @param params - KDF parameters (memory, time, parallelism)
 * @returns 32-byte encryption key
 */
export async function argon2Derive(
  password: string,
  salt: Argon2Salt,
  params: KdfParams = DEFAULT_KDF_PARAMS,
): Promise<EncryptionKey> {
  // Validate parameters (prevent DoS via excessive resource usage)
  validateKdfParams(params);

  try {
    const hash = await argon2id({
      password,
      salt,
      iterations: params.tCost,
      memorySize: params.mCost,
      parallelism: params.pCost,
      hashLength: OUTPUT_LENGTH,
      outputType: "binary",
    });

    return toEncryptionKey(hash);
  } catch {
    // Don't leak internal error details
    throw new Error("Key derivation failed");
  }
}

/**
 * Derive key from password bytes (for non-string passwords like PINs)
 *
 * @param passwordBytes - Password as bytes
 * @param salt - Unique salt
 * @param params - KDF parameters
 * @returns 32-byte encryption key
 */
export async function argon2DeriveFromBytes(
  passwordBytes: Uint8Array,
  salt: Argon2Salt,
  params: KdfParams = DEFAULT_KDF_PARAMS,
): Promise<EncryptionKey> {
  validateKdfParams(params);

  try {
    const hash = await argon2id({
      password: passwordBytes,
      salt,
      iterations: params.tCost,
      memorySize: params.mCost,
      parallelism: params.pCost,
      hashLength: OUTPUT_LENGTH,
      outputType: "binary",
    });

    return toEncryptionKey(hash);
  } catch {
    throw new Error("Key derivation failed");
  }
}

/**
 * Validate KDF parameters are within safe bounds
 *
 * Prevents DoS attacks via excessive resource consumption.
 *
 * @param params - Parameters to validate
 * @throws Error if parameters are out of bounds
 */
export function validateKdfParams(params: KdfParams): void {
  // Memory: 16 MiB minimum (OWASP), 1 GiB maximum (prevent DoS)
  if (params.mCost < 16384) {
    throw new Error("KDF memory cost too low (minimum 16 MiB)");
  }
  if (params.mCost > 1048576) {
    throw new Error("KDF memory cost too high (maximum 1 GiB)");
  }

  // Time: 1 minimum, 10 maximum.
  // The ceiling of 10 is a DoS-prevention limit: an attacker-controlled
  // tCost value could otherwise force arbitrarily long derivation on the
  // client, blocking the UI or draining battery. 10 iterations is well
  // above OWASP recommendations and sufficient for high-security use cases.
  if (params.tCost < 1) {
    throw new Error("KDF time cost must be at least 1");
  }
  if (params.tCost > 10) {
    throw new Error("KDF time cost too high (maximum 10)");
  }

  // Parallelism: 1 minimum, 4 maximum
  if (params.pCost < 1) {
    throw new Error("KDF parallelism must be at least 1");
  }
  if (params.pCost > 4) {
    throw new Error("KDF parallelism too high (maximum 4)");
  }
}

/**
 * Check if Argon2 WASM is available and working
 *
 * @returns true if Argon2 can be used
 */
export async function isArgon2Supported(): Promise<boolean> {
  try {
    // Try a minimal hash operation
    const testResult = await argon2id({
      password: "test",
      salt: new Uint8Array(16),
      iterations: 1,
      memorySize: 1024, // 1 MiB for quick test
      parallelism: 1,
      hashLength: 32,
      outputType: "binary",
    });

    // Verify output length
    if (testResult.length !== 32) {
      return false;
    }

    // Clean up test hash
    wipeBytes(testResult);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify a password against stored parameters
 *
 * This is primarily for testing/validation, not for authentication
 * (the server handles authentication).
 *
 * M-06: Timing Leak Note
 * The length check at the start of comparison returns early on mismatch,
 * creating a timing side-channel. This is acceptable because:
 * 1. Server handles real authentication (not this client-side code)
 * 2. Key lengths are fixed (32 bytes), so mismatch indicates corruption not attack
 * 3. Argon2 derivation dominates timing regardless of comparison path
 *
 * @param password - Password to verify
 * @param salt - Salt used during original derivation
 * @param params - KDF parameters used
 * @param expectedKey - Expected derived key
 * @returns true if password produces the same key
 */
export async function verifyPassword(
  password: string,
  salt: Argon2Salt,
  params: KdfParams,
  expectedKey: Uint8Array,
): Promise<boolean> {
  let derivedKey: Uint8Array | undefined;
  try {
    derivedKey = await argon2Derive(password, salt, params);

    // Constant-time comparison
    if (derivedKey.length !== expectedKey.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < derivedKey.length; i++) {
      result |= derivedKey[i] ^ expectedKey[i];
    }

    return result === 0;
  } finally {
    if (derivedKey) {
      wipeBytes(derivedKey);
    }
  }
}

/**
 * Get recommended KDF parameters based on target duration
 *
 * @param targetMs - Target duration in milliseconds (default: 500ms)
 * @returns Recommended parameters
 */
export function getRecommendedParams(targetMs: number = 500): KdfParams {
  // For now, return OWASP defaults
  // Calibration based on device performance could be implemented in the future
  if (targetMs < 250) {
    // Fast mode (less secure, for testing)
    return {
      mCost: 16384, // 16 MiB
      tCost: 1,
      pCost: 1,
    };
  } else if (targetMs < 1000) {
    // Standard mode
    return DEFAULT_KDF_PARAMS;
  } else {
    // High security mode
    return {
      mCost: 65536, // 64 MiB
      tCost: 3,
      pCost: 1,
    };
  }
}
