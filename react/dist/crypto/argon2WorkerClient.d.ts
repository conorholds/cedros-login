import { Argon2Salt, EncryptionKey, KdfParams } from './types';
/**
 * Derive an encryption key from password using Argon2id in a Web Worker.
 *
 * Offloads CPU-intensive Argon2id KDF to a background thread to avoid
 * blocking the main thread. Falls back to synchronous derivation if
 * Web Workers are not available.
 *
 * @param password - User's password
 * @param salt - 16-byte random salt
 * @param params - KDF parameters (memory, iterations, parallelism)
 * @returns 32-byte encryption key
 *
 * @security **CALLER MUST WIPE RETURNED KEY AFTER USE**
 * The returned key contains sensitive cryptographic material.
 * Callers are responsible for wiping it when no longer needed:
 * ```ts
 * const key = await argon2DeriveInWorker(password, salt);
 * try {
 *   // use key for encryption/decryption
 * } finally {
 *   wipeBytes(key);
 * }
 * ```
 * Failure to wipe may leave key material in memory, vulnerable to memory
 * dump attacks.
 */
export declare function argon2DeriveInWorker(password: string, salt: Argon2Salt, params?: KdfParams): Promise<EncryptionKey>;
