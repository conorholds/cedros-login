import { EncryptionKey } from './types';
/**
 * Derive an encryption key using HKDF-SHA256
 *
 * @param inputKeyMaterial - Raw key material (e.g., from PRF)
 * @param salt - Optional salt (if not provided, uses zero-filled buffer)
 * @param info - Context/application-specific info string
 * @param outputLength - Desired output key length in bytes (default: 32)
 * @returns Derived key
 */
export declare function hkdfDerive(inputKeyMaterial: Uint8Array, salt: Uint8Array | undefined, info: string, outputLength?: number): Promise<Uint8Array>;
/**
 * Derive a 256-bit encryption key from PRF output
 *
 * @param prfOutput - Output from WebAuthn PRF extension (typically 32 bytes)
 * @param prfSalt - Salt used with PRF (stored with encrypted share)
 * @returns 32-byte encryption key suitable for AES-256-GCM
 */
export declare function deriveKeyFromPrf(prfOutput: Uint8Array, prfSalt: Uint8Array): Promise<EncryptionKey>;
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
export declare function deriveKeyWithDomain(inputKeyMaterial: Uint8Array, domain: string, salt?: Uint8Array): Promise<Uint8Array>;
/**
 * Check if HKDF is supported in the current environment
 *
 * @returns true if HKDF is available
 */
export declare function isHkdfSupported(): Promise<boolean>;
