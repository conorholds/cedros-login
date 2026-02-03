/**
 * HKDF (HMAC-based Key Derivation Function) using Web Crypto API
 *
 * Used to derive encryption keys from WebAuthn PRF output.
 *
 * Security:
 * - RFC 5869 compliant
 * - Uses SHA-256 as underlying hash
 * - Provides cryptographically strong key derivation
 *
 * L-10: Domain Collision Warning
 * =============================
 * The `deriveKeyWithDomain` function constructs info strings using the pattern
 * `cedros-wallet-${domain}`. Callers MUST ensure domain strings are unique across
 * the codebase to prevent accidental key reuse, which would be a serious security issue.
 *
 * Reserved domain prefixes (do not use these patterns elsewhere):
 * - "share-a-encryption" - Server-stored encrypted share
 * - "share-b-encryption" - Device-stored encrypted share (see deriveKeyFromPrf)
 * - "signing" - Transaction signing keys
 * - "encryption" - General encryption keys
 *
 * When adding new derivations:
 * 1. Choose a unique, descriptive domain string
 * 2. Add it to the reserved list above
 * 3. Consider using a versioned suffix if the derivation might change (e.g., "auth-v1")
 */

import type { EncryptionKey } from './types';
import { toEncryptionKey, toBufferSource } from './types';

/**
 * Derive an encryption key using HKDF-SHA256
 *
 * @param inputKeyMaterial - Raw key material (e.g., from PRF)
 * @param salt - Optional salt (if not provided, uses zero-filled buffer)
 * @param info - Context/application-specific info string
 * @param outputLength - Desired output key length in bytes (default: 32)
 * @returns Derived key
 */
export async function hkdfDerive(
  inputKeyMaterial: Uint8Array,
  salt: Uint8Array | undefined,
  info: string,
  outputLength: number = 32
): Promise<Uint8Array> {
  // Import input key material for HKDF
  const baseKey = await crypto.subtle.importKey(
    'raw',
    toBufferSource(inputKeyMaterial),
    'HKDF',
    false,
    ['deriveBits']
  );

  // Convert info string to bytes
  const infoBytes = new TextEncoder().encode(info);

  // Derive bits using HKDF
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: toBufferSource(salt ?? new Uint8Array(32)), // Zero salt if not provided
      info: toBufferSource(infoBytes),
    },
    baseKey,
    outputLength * 8 // bits
  );

  return new Uint8Array(derivedBits);
}

/**
 * Derive a 256-bit encryption key from PRF output
 *
 * @param prfOutput - Output from WebAuthn PRF extension (typically 32 bytes)
 * @param prfSalt - Salt used with PRF (stored with encrypted share)
 * @returns 32-byte encryption key suitable for AES-256-GCM
 */
export async function deriveKeyFromPrf(
  prfOutput: Uint8Array,
  prfSalt: Uint8Array
): Promise<EncryptionKey> {
  const derived = await hkdfDerive(prfOutput, prfSalt, 'cedros-wallet-share-b-encryption', 32);

  return toEncryptionKey(derived);
}

/**
 * Derive a key with domain separation for different purposes
 *
 * @param inputKeyMaterial - Base key material
 * @param domain - Domain separator string (e.g., 'signing', 'encryption')
 * @param salt - Optional salt
 * @returns Derived key
 *
 * @security Domain strings MUST be unique across the codebase. Using the same
 * domain with the same input key material will produce identical keys, which
 * could lead to key reuse vulnerabilities. See module-level docs for reserved domains.
 */
export async function deriveKeyWithDomain(
  inputKeyMaterial: Uint8Array,
  domain: string,
  salt?: Uint8Array
): Promise<Uint8Array> {
  return hkdfDerive(inputKeyMaterial, salt, `cedros-wallet-${domain}`, 32);
}

/**
 * Check if HKDF is supported in the current environment
 *
 * @returns true if HKDF is available
 */
export async function isHkdfSupported(): Promise<boolean> {
  try {
    // Try to import a test key for HKDF
    const testKey = await crypto.subtle.importKey('raw', new Uint8Array(32), 'HKDF', false, [
      'deriveBits',
    ]);

    // Try to derive bits
    await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array(32),
        info: new Uint8Array(0),
      },
      testKey,
      256
    );

    return true;
  } catch {
    return false;
  }
}
