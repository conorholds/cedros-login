import { Seed, AesNonce, Argon2Salt, PrfSalt } from './types';
/**
 * Get cryptographically secure random bytes
 *
 * @param length - Number of bytes to generate
 * @returns Random bytes
 * @throws Error if WebCrypto is not available
 */
export declare function getRandomBytes(length: number): Uint8Array;
/**
 * Generate a cryptographically secure 16-byte seed for wallet derivation
 *
 * Note: 16 bytes (128 bits) matches standard Solana wallet format.
 *
 * @returns 16-byte seed
 * @throws Error if WebCrypto is not available
 */
export declare function generateSeed(): Seed;
/**
 * Generate a 12-byte nonce for AES-GCM encryption
 *
 * Security: AES-GCM requires a unique nonce per encryption with the same key.
 * Using random nonces is safe for reasonable message counts (< 2^32).
 *
 * CRYPTO-03: For high-volume encryption scenarios (>2^30 messages with same key),
 * the birthday bound risk of nonce collision increases. Recommendations:
 * 1. Rotate encryption keys periodically (e.g., every 2^20 encryptions)
 * 2. Use counter-based nonces instead of random for sequential encryption
 * 3. Monitor encryption count and trigger re-keying before limits are reached
 *
 * For typical wallet use cases (encrypting seed once), random nonces are safe.
 *
 * @returns 12-byte nonce
 * @throws Error if WebCrypto is not available
 */
export declare function generateNonce(): AesNonce;
/**
 * Generate a 16-byte salt for Argon2id KDF
 *
 * Security: Salt must be unique per user/password combination.
 * 16 bytes provides sufficient uniqueness.
 *
 * @returns 16-byte salt
 * @throws Error if WebCrypto is not available
 */
export declare function generateArgon2Salt(): Argon2Salt;
/**
 * Generate a 32-byte salt for WebAuthn PRF extension
 *
 * Security: PRF salt is used as input to the PRF to derive unique
 * per-credential keys. Must be stored alongside encrypted share.
 *
 * @returns 32-byte PRF salt
 * @throws Error if WebCrypto is not available
 */
export declare function generatePrfSalt(): PrfSalt;
