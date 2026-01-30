import { EncryptionKey, AesNonce } from './types';
/** Result of AES-GCM encryption */
export interface AesGcmEncryptResult {
    /** Ciphertext including authentication tag */
    ciphertext: Uint8Array;
    /** 12-byte nonce used */
    nonce: AesNonce;
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
export declare function aesGcmEncrypt(plaintext: Uint8Array, key: EncryptionKey, nonce?: AesNonce): Promise<AesGcmEncryptResult>;
/**
 * Decrypt ciphertext using AES-256-GCM
 *
 * @param ciphertext - Data to decrypt (includes auth tag)
 * @param key - 32-byte encryption key
 * @param nonce - 12-byte nonce used during encryption
 * @returns Decrypted plaintext
 * @throws Error if decryption or authentication fails
 */
export declare function aesGcmDecrypt(ciphertext: Uint8Array, key: EncryptionKey, nonce: AesNonce): Promise<Uint8Array>;
/**
 * Encrypt plaintext and return base64-encoded results
 *
 * @param plaintext - Data to encrypt
 * @param key - 32-byte encryption key
 * @returns Base64-encoded ciphertext and nonce
 */
export declare function aesGcmEncryptToBase64(plaintext: Uint8Array, key: EncryptionKey): Promise<{
    ciphertext: string;
    nonce: string;
}>;
/**
 * Decrypt base64-encoded ciphertext
 *
 * @param ciphertextB64 - Base64-encoded ciphertext
 * @param nonceB64 - Base64-encoded nonce
 * @param key - 32-byte encryption key
 * @returns Decrypted plaintext
 */
export declare function aesGcmDecryptFromBase64(ciphertextB64: string, nonceB64: string, key: EncryptionKey): Promise<Uint8Array>;
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
export declare function encryptWithPasswordKey(plaintext: Uint8Array, passwordKey: Uint8Array): Promise<AesGcmEncryptResult>;
/**
 * Decrypt with password-derived key
 *
 * @param ciphertext - Data to decrypt
 * @param nonce - Nonce used during encryption
 * @param passwordKey - Key derived from password via Argon2
 * @returns Decrypted plaintext
 */
export declare function decryptWithPasswordKey(ciphertext: Uint8Array, nonce: AesNonce, passwordKey: Uint8Array): Promise<Uint8Array>;
/**
 * Convert Uint8Array to base64 string
 *
 * MAINT-01: Uses chunked String.fromCharCode for O(n) performance.
 * Simple concatenation (`binary += char`) would be O(n²).
 */
export declare function uint8ArrayToBase64(bytes: Uint8Array): string;
/**
 * Convert base64 string to Uint8Array
 *
 * @throws Error if input is not valid base64
 */
export declare function base64ToUint8Array(base64: string): Uint8Array;
/**
 * Encrypt and securely wipe plaintext after encryption
 *
 * @param plaintext - Data to encrypt (will be wiped)
 * @param key - Encryption key
 * @returns Encrypted result
 */
export declare function encryptAndWipe(plaintext: Uint8Array, key: EncryptionKey): Promise<AesGcmEncryptResult>;
