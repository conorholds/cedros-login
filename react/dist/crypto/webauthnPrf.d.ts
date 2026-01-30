import { PrfSalt } from './types';
/**
 * SEC-004: Validate the current hostname against allowed RP domains.
 *
 * This prevents WebAuthn credential creation/usage on unexpected domains,
 * which could be used in phishing attacks.
 *
 * @param allowedDomains - List of allowed domain names. Empty means validation is skipped.
 * @throws Error if hostname is not in allowed list (production only)
 */
export declare function validateRpDomain(allowedDomains?: string[]): void;
/** Result of registering a new passkey with PRF */
export interface PasskeyRegistrationResult {
    /** Base64-encoded credential ID */
    credentialId: string;
    /** Base64-encoded PRF salt */
    prfSalt: string;
    /** PRF output (32 bytes) for key derivation */
    prfOutput: Uint8Array;
}
/** Result of authenticating with an existing passkey */
export interface PasskeyAuthResult {
    /** PRF output (32 bytes) for key derivation */
    prfOutput: Uint8Array;
}
/**
 * Check if WebAuthn is available in this browser
 */
export declare function isWebAuthnAvailable(): boolean;
/**
 * Check if the PRF extension is supported
 *
 * Note: This only checks for API support, not actual authenticator support.
 * The actual PRF availability depends on the user's authenticator.
 */
export declare function isPrfSupported(): Promise<boolean>;
/** Options for passkey operations */
export interface PasskeyOptions {
    /** SEC-004: Allowed domains for RP ID validation */
    allowedDomains?: string[];
}
/**
 * Register a new passkey with PRF extension for wallet encryption
 *
 * @param userId - User ID bytes (from authenticated user)
 * @param userName - Display name for the passkey
 * @param displayName - User's display name
 * @param prfSalt - Optional PRF salt (generated if not provided)
 * @param options - Optional configuration including allowed domains
 * @returns Registration result with credential ID and PRF output
 * @throws Error if registration fails or PRF is not supported
 */
export declare function registerPasskeyWithPrf(userId: Uint8Array, userName: string, displayName: string, prfSalt?: PrfSalt, options?: PasskeyOptions): Promise<PasskeyRegistrationResult>;
/**
 * Authenticate with an existing passkey and get PRF output
 *
 * @param credentialId - Base64-encoded credential ID
 * @param prfSalt - Base64-encoded PRF salt
 * @param options - Optional configuration including allowed domains
 * @returns Authentication result with PRF output
 * @throws Error if authentication fails
 */
export declare function authenticateWithPrf(credentialId: string, prfSalt: string, options?: PasskeyOptions): Promise<PasskeyAuthResult>;
/**
 * Get encryption key from passkey via PRF extension
 *
 * This combines authentication and key derivation in a single operation.
 *
 * ## SEC-03: Key Lifecycle Management
 *
 * **IMPORTANT**: The returned encryption key is sensitive cryptographic material.
 * Callers are responsible for:
 *
 * 1. Using the key only for its intended purpose (Share B decryption)
 * 2. Wiping the key from memory after use by calling `key.fill(0)`
 * 3. Not storing the key in persistent storage (localStorage, IndexedDB, etc.)
 * 4. Not logging or transmitting the key
 *
 * The PRF output used to derive this key is automatically wiped in the finally
 * block, but the derived key must be managed by the caller.
 *
 * @example
 * ```typescript
 * const key = await getEncryptionKeyFromPasskey(credentialId, prfSalt);
 * try {
 *   const plaintext = await decryptShareB(ciphertext, key);
 *   // ... use plaintext
 * } finally {
 *   key.fill(0); // Wipe key after use
 * }
 * ```
 *
 * @param credentialId - Base64-encoded credential ID
 * @param prfSalt - Base64-encoded PRF salt
 * @param options - Optional configuration including allowed domains
 * @returns 32-byte encryption key derived from PRF output. **Caller must wipe after use.**
 */
export declare function getEncryptionKeyFromPasskey(credentialId: string, prfSalt: string, options?: PasskeyOptions): Promise<Uint8Array>;
/**
 * Check if a credential ID is valid for this user
 *
 * @param credentialId - Base64-encoded credential ID to check
 * @param options - Optional configuration including allowed domains
 * @returns true if credential exists and can be used
 */
export declare function isCredentialAvailable(credentialId: string, options?: PasskeyOptions): Promise<boolean>;
/**
 * Authenticate with any discoverable passkey and get PRF output
 *
 * This allows authentication without specifying a credential ID, letting
 * the browser present all available passkeys for this domain.
 *
 * @param prfSalt - Base64-encoded PRF salt
 * @param options - Optional configuration including allowed domains
 * @returns Authentication result with PRF output
 * @throws Error if authentication fails
 */
export declare function authenticateWithDiscoverablePrf(prfSalt: string, options?: PasskeyOptions): Promise<PasskeyAuthResult>;
