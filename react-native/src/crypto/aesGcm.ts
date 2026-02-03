/**
 * AES-256-GCM encryption/decryption using Web Crypto API
 *
 * Security:
 * - Uses authenticated encryption (GCM mode provides integrity)
 * - Requires unique 12-byte nonce per encryption with same key
 * - 256-bit key provides strong security margin
 */

import type { EncryptionKey, AesNonce } from './types';
import { toEncryptionKey, toBufferSource } from './types';
import { generateNonce } from './entropy';
import { wipeBytes } from './secureWipe';

/** Result of AES-GCM encryption */
export interface AesGcmEncryptResult {
  /** Ciphertext including authentication tag */
  ciphertext: Uint8Array;
  /** 12-byte nonce used */
  nonce: AesNonce;
}

/**
 * Import a raw 256-bit key for AES-GCM operations
 *
 * ## PERF-05: Key Caching Opportunity
 *
 * This function is called on every encrypt/decrypt operation. For high-frequency
 * use cases (e.g., bulk encryption in a loop), consider caching the CryptoKey:
 *
 * ```ts
 * const cryptoKey = await importAesKey(key); // cache once
 * for (const item of items) {
 *   // reuse cryptoKey for multiple operations
 * }
 * ```
 *
 * Current callers (share encryption, unlock verification) are low-frequency,
 * so caching is not implemented here to avoid added complexity.
 *
 * @param keyBytes - 32-byte raw key material
 * @returns CryptoKey for AES-GCM operations
 * @throws Error if key import fails
 */
async function importAesKey(keyBytes: EncryptionKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    toBufferSource(keyBytes),
    { name: 'AES-GCM', length: 256 },
    false, // not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext using AES-256-GCM
 *
 * @param plaintext - Data to encrypt
 * @param key - 32-byte encryption key
 * @param nonce - Optional 12-byte nonce (generated if not provided)
 * @returns Ciphertext and nonce
 * @throws Error if encryption fails
 */
export async function aesGcmEncrypt(
  plaintext: Uint8Array,
  key: EncryptionKey,
  nonce?: AesNonce
): Promise<AesGcmEncryptResult> {
  const iv = nonce ?? generateNonce();
  const cryptoKey = await importAesKey(key);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toBufferSource(iv) },
    cryptoKey,
    toBufferSource(plaintext)
  );

  return {
    ciphertext: new Uint8Array(ciphertext),
    nonce: iv,
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM
 *
 * @param ciphertext - Data to decrypt (includes auth tag)
 * @param key - 32-byte encryption key
 * @param nonce - 12-byte nonce used during encryption
 * @returns Decrypted plaintext
 * @throws Error if decryption or authentication fails
 */
export async function aesGcmDecrypt(
  ciphertext: Uint8Array,
  key: EncryptionKey,
  nonce: AesNonce
): Promise<Uint8Array> {
  const cryptoKey = await importAesKey(key);

  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toBufferSource(nonce) },
      cryptoKey,
      toBufferSource(ciphertext)
    );

    return new Uint8Array(plaintext);
  } catch {
    // GCM authentication failure - don't leak details
    throw new Error('Decryption failed: invalid key or corrupted data');
  }
}

/**
 * Encrypt plaintext and return base64-encoded results
 *
 * @param plaintext - Data to encrypt
 * @param key - 32-byte encryption key
 * @returns Base64-encoded ciphertext and nonce
 */
export async function aesGcmEncryptToBase64(
  plaintext: Uint8Array,
  key: EncryptionKey
): Promise<{ ciphertext: string; nonce: string }> {
  const result = await aesGcmEncrypt(plaintext, key);

  return {
    ciphertext: uint8ArrayToBase64(result.ciphertext),
    nonce: uint8ArrayToBase64(result.nonce),
  };
}

/**
 * Decrypt base64-encoded ciphertext
 *
 * @param ciphertextB64 - Base64-encoded ciphertext
 * @param nonceB64 - Base64-encoded nonce
 * @param key - 32-byte encryption key
 * @returns Decrypted plaintext
 */
export async function aesGcmDecryptFromBase64(
  ciphertextB64: string,
  nonceB64: string,
  key: EncryptionKey
): Promise<Uint8Array> {
  const ciphertext = base64ToUint8Array(ciphertextB64);
  const nonce = base64ToUint8Array(nonceB64);

  if (nonce.length !== 12) {
    throw new Error(`Invalid nonce length: expected 12, got ${nonce.length}`);
  }

  return aesGcmDecrypt(ciphertext, key, nonce as AesNonce);
}

/**
 * Encrypt with automatic key derivation from password
 *
 * This is a convenience wrapper that combines Argon2 KDF with AES-GCM.
 * For more control, use argon2 and aesGcmEncrypt separately.
 *
 * @param plaintext - Data to encrypt
 * @param passwordKey - Key derived from password via Argon2
 * @returns Encrypted result with nonce
 */
export async function encryptWithPasswordKey(
  plaintext: Uint8Array,
  passwordKey: Uint8Array
): Promise<AesGcmEncryptResult> {
  if (passwordKey.length !== 32) {
    throw new Error(`Invalid password key length: expected 32, got ${passwordKey.length}`);
  }

  return aesGcmEncrypt(plaintext, toEncryptionKey(passwordKey));
}

/**
 * Decrypt with password-derived key
 *
 * @param ciphertext - Data to decrypt
 * @param nonce - Nonce used during encryption
 * @param passwordKey - Key derived from password via Argon2
 * @returns Decrypted plaintext
 */
export async function decryptWithPasswordKey(
  ciphertext: Uint8Array,
  nonce: AesNonce,
  passwordKey: Uint8Array
): Promise<Uint8Array> {
  if (passwordKey.length !== 32) {
    throw new Error(`Invalid password key length: expected 32, got ${passwordKey.length}`);
  }

  return aesGcmDecrypt(ciphertext, toEncryptionKey(passwordKey), nonce);
}

// --- Base64 utilities ---

/**
 * Convert Uint8Array to base64 string
 *
 * MAINT-01: Uses chunked String.fromCharCode for O(n) performance.
 * Simple concatenation (`binary += char`) would be O(n²).
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  // String.fromCharCode has argument limits (~65536), so process in chunks
  const CHUNK_SIZE = 0x8000; // 32KB chunks
  const parts: string[] = [];

  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.length));
    parts.push(String.fromCharCode(...chunk));
  }

  return btoa(parts.join(''));
}

/**
 * Convert base64 string to Uint8Array
 *
 * @throws Error if input is not valid base64
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  // M-07: Validate base64 input to provide meaningful error message
  // atob() throws DOMException on invalid input, which is not descriptive
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new Error('Invalid base64 string: input is malformed or contains invalid characters');
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt and securely wipe plaintext after encryption
 *
 * @param plaintext - Data to encrypt (will be wiped)
 * @param key - Encryption key
 * @returns Encrypted result
 */
export async function encryptAndWipe(
  plaintext: Uint8Array,
  key: EncryptionKey
): Promise<AesGcmEncryptResult> {
  try {
    return await aesGcmEncrypt(plaintext, key);
  } finally {
    wipeBytes(plaintext);
  }
}
