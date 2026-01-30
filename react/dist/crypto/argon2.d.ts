import { EncryptionKey, Argon2Salt, KdfParams } from './types';
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
export declare function argon2Derive(password: string, salt: Argon2Salt, params?: KdfParams): Promise<EncryptionKey>;
/**
 * Derive key from password bytes (for non-string passwords like PINs)
 *
 * @param passwordBytes - Password as bytes
 * @param salt - Unique salt
 * @param params - KDF parameters
 * @returns 32-byte encryption key
 */
export declare function argon2DeriveFromBytes(passwordBytes: Uint8Array, salt: Argon2Salt, params?: KdfParams): Promise<EncryptionKey>;
/**
 * Validate KDF parameters are within safe bounds
 *
 * Prevents DoS attacks via excessive resource consumption.
 *
 * @param params - Parameters to validate
 * @throws Error if parameters are out of bounds
 */
export declare function validateKdfParams(params: KdfParams): void;
/**
 * Check if Argon2 WASM is available and working
 *
 * @returns true if Argon2 can be used
 */
export declare function isArgon2Supported(): Promise<boolean>;
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
export declare function verifyPassword(password: string, salt: Argon2Salt, params: KdfParams, expectedKey: Uint8Array): Promise<boolean>;
/**
 * Get recommended KDF parameters based on target duration
 *
 * @param targetMs - Target duration in milliseconds (default: 500ms)
 * @returns Recommended parameters
 */
export declare function getRecommendedParams(targetMs?: number): KdfParams;
