/**
 * Secure entropy generation using Web Crypto API
 *
 * Security: Uses crypto.getRandomValues() for cryptographically secure
 * random number generation. This is the only source of entropy for
 * wallet seed generation.
 */

import {
  type Seed,
  type AesNonce,
  type Argon2Salt,
  type PrfSalt,
  toSeed,
  toAesNonce,
  toArgon2Salt,
  toPrfSalt,
} from './types';

/**
 * Get cryptographically secure random bytes
 *
 * @param length - Number of bytes to generate
 * @returns Random bytes
 * @throws Error if WebCrypto is not available
 */
export function getRandomBytes(length: number): Uint8Array {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw new Error(
      'WebCrypto API not available. Secure random generation requires a modern browser.'
    );
  }

  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Generate a cryptographically secure 16-byte seed for wallet derivation
 *
 * Note: 16 bytes (128 bits) matches standard Solana wallet format.
 *
 * @returns 16-byte seed
 * @throws Error if WebCrypto is not available
 */
export function generateSeed(): Seed {
  return toSeed(getRandomBytes(16));
}

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
export function generateNonce(): AesNonce {
  return toAesNonce(getRandomBytes(12));
}

/**
 * Generate a 16-byte salt for Argon2id KDF
 *
 * Security: Salt must be unique per user/password combination.
 * 16 bytes provides sufficient uniqueness.
 *
 * @returns 16-byte salt
 * @throws Error if WebCrypto is not available
 */
export function generateArgon2Salt(): Argon2Salt {
  return toArgon2Salt(getRandomBytes(16));
}

/**
 * Generate a 32-byte salt for WebAuthn PRF extension
 *
 * Security: PRF salt is used as input to the PRF to derive unique
 * per-credential keys. Must be stored alongside encrypted share.
 *
 * @returns 32-byte PRF salt
 * @throws Error if WebCrypto is not available
 */
export function generatePrfSalt(): PrfSalt {
  return toPrfSalt(getRandomBytes(32));
}
