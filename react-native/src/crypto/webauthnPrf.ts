/**
 * @platform browser - not available in React Native
 *
 * WebAuthn PRF (Pseudo-Random Function) extension for device key derivation
 *
 * The PRF extension allows deriving unique cryptographic keys from passkeys.
 * This is used to encrypt Share B with a device-bound key that cannot be
 * extracted or exported.
 *
 * ## Platform Limitation
 *
 * This module uses browser-specific APIs (`window.location.hostname`,
 * `navigator.credentials`, `PublicKeyCredential`) that are not available
 * in React Native. WebAuthn/PRF features require a browser environment with
 * platform authenticator support.
 *
 * ## Architectural Note (SEC-02)
 *
 * This module creates **client-side-only** passkeys for wallet encryption.
 * These are SEPARATE from the server-managed WebAuthn credentials used for
 * authentication (see: /webauthn/register/*, /webauthn/auth/*).
 *
 * **Why two separate credential types?**
 *
 * 1. **Different purposes**: Server WebAuthn is for authentication (proving
 *    identity), while PRF passkeys are for encryption (deriving device keys).
 *
 * 2. **Privacy**: The server never learns the PRF output or derived keys.
 *    Share B encryption is entirely client-side. Server WebAuthn credentials
 *    expose the public key to the server.
 *
 * 3. **Independence**: A user can authenticate with any method (password,
 *    Google, etc.) while still using PRF passkeys for wallet encryption.
 *    The two systems are intentionally decoupled.
 *
 * 4. **Credential per device**: PRF credentials are device-bound. Users may
 *    register multiple PRF credentials (one per device) without affecting
 *    their authentication methods.
 *
 * **Security implications**:
 * - Server WebAuthn credentials are validated by the server (counter tracking,
 *   challenge verification, origin validation)
 * - PRF credentials are purely client-side; security relies on the
 *   authenticator's tamper resistance and the HKDF-derived key strength
 *
 * Security:
 * - PRF output is bound to the specific credential and device
 * - Cannot be exported or extracted from the authenticator
 * - Requires user gesture (biometric/PIN) for each operation
 *
 * Browser Support (as of 2024):
 * - Chrome 116+ on Windows, macOS, Android (platform authenticators)
 * - Safari 17+ on macOS, iOS (platform authenticators)
 * - Firefox: Limited support
 */

import type { PrfSalt } from "./types";
import { toBufferSource } from "./types";
import { generatePrfSalt } from "./entropy";
import { deriveKeyFromPrf } from "./hkdf";
import { uint8ArrayToBase64, base64ToUint8Array } from "./aesGcm";

/**
 * SEC-004: Check if the current hostname is a development domain
 */
function isDevelopmentDomain(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost")
  );
}

/**
 * SEC-004: Validate the current hostname against allowed RP domains.
 *
 * This prevents WebAuthn credential creation/usage on unexpected domains,
 * which could be used in phishing attacks.
 *
 * @param allowedDomains - List of allowed domain names. Empty means validation is skipped.
 * @throws Error if hostname is not in allowed list (production only)
 */
function validateRpDomain(allowedDomains?: string[]): void {
  if (typeof window === "undefined") {
    return; // SSR - skip validation
  }

  const hostname = window.location.hostname;

  // Always allow development domains
  if (isDevelopmentDomain(hostname)) {
    return;
  }

  // If no allowed domains configured, log warning but allow (backward compatibility)
  if (!allowedDomains || allowedDomains.length === 0) {
    if (__DEV__) {
      console.warn(
        "[Cedros] SEC-004: WebAuthn RP domain validation not configured. " +
          "In production, set wallet.allowedRpDomains to prevent passkey phishing.",
      );
    }
    return;
  }

  // Check if hostname matches any allowed domain
  const isAllowed = allowedDomains.some(
    (domain) => hostname === domain || hostname.endsWith("." + domain),
  );

  if (!isAllowed) {
    throw new Error(
      `WebAuthn operation blocked: domain '${hostname}' is not in the allowed list. ` +
        "This may indicate a phishing attempt.",
    );
  }
}

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
export function isWebAuthnAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof navigator.credentials !== "undefined"
  );
}

/**
 * Check if the PRF extension is supported
 *
 * Note: This only checks for API support, not actual authenticator support.
 * The actual PRF availability depends on the user's authenticator.
 */
export async function isPrfSupported(): Promise<boolean> {
  if (!isWebAuthnAvailable()) {
    return false;
  }

  try {
    // Check if platform authenticator is available
    const available =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

    if (!available) {
      return false;
    }

    // Check for PRF extension support by examining extension capabilities
    // This is a heuristic - actual support is only known at credential creation time
    if (
      "getClientCapabilities" in PublicKeyCredential &&
      typeof (
        PublicKeyCredential as unknown as {
          getClientCapabilities: () => Promise<unknown>;
        }
      ).getClientCapabilities === "function"
    ) {
      const caps = await (
        PublicKeyCredential as unknown as {
          getClientCapabilities: () => Promise<Record<string, boolean>>;
        }
      ).getClientCapabilities();
      if (caps && "prf" in caps) {
        return caps.prf === true;
      }
    }

    // Fallback: assume PRF is supported on modern browsers with platform authenticators
    // Actual support will be confirmed during registration
    return true;
  } catch {
    return false;
  }
}

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
export async function registerPasskeyWithPrf(
  userId: Uint8Array,
  userName: string,
  displayName: string,
  prfSalt?: PrfSalt,
  options?: PasskeyOptions,
): Promise<PasskeyRegistrationResult> {
  if (!isWebAuthnAvailable()) {
    throw new Error("WebAuthn is not available in this browser");
  }

  // SEC-004: Validate RP domain before creating credential
  validateRpDomain(options?.allowedDomains);

  const salt = prfSalt ?? generatePrfSalt();

  // Create credential with PRF extension
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: {
        name: "Cedros Wallet",
        id: window.location.hostname,
      },
      user: {
        id: toBufferSource(userId),
        name: userName,
        displayName: displayName,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "required",
      },
      timeout: 60000,
      attestation: "none",
      extensions: {
        prf: {
          eval: {
            first: salt,
          },
        },
      } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error("Passkey registration was cancelled");
  }

  // Check PRF extension output
  const extensionResults = credential.getClientExtensionResults() as {
    prf?: {
      enabled?: boolean;
      results?: {
        first?: ArrayBuffer;
      };
    };
  };

  // CRYPTO-3 FIX: Use || instead of && to correctly detect PRF failure.
  // Should throw if EITHER enabled is false/undefined OR results are missing.
  // The old && logic only threw if BOTH conditions were false.
  if (!extensionResults.prf?.enabled || !extensionResults.prf?.results?.first) {
    throw new Error(
      "PRF extension is not supported by this authenticator. " +
        "Please use a device with a compatible platform authenticator.",
    );
  }

  const prfResult = extensionResults.prf?.results?.first;
  if (!prfResult) {
    throw new Error("PRF extension did not return a result");
  }

  // CRYPTO-04/CRYPTO-06: Validate PRF output length
  // The WebAuthn PRF extension returns HMAC-SHA256 output (32 bytes) per spec.
  // This strict validation ensures we have the expected entropy for key derivation.
  // Future authenticators using SHA-512 variants would produce 64 bytes; if that
  // becomes common, consider accepting 32 or 64 bytes and truncating to 32.
  const prfOutput = new Uint8Array(prfResult);
  if (prfOutput.length !== 32) {
    throw new Error(
      `Unexpected PRF output length: expected 32 bytes, got ${prfOutput.length}. ` +
        "The authenticator may not be compatible.",
    );
  }

  return {
    credentialId: uint8ArrayToBase64(new Uint8Array(credential.rawId)),
    prfSalt: uint8ArrayToBase64(salt),
    prfOutput,
  };
}

/**
 * Authenticate with an existing passkey and get PRF output
 *
 * @param credentialId - Base64-encoded credential ID
 * @param prfSalt - Base64-encoded PRF salt
 * @param options - Optional configuration including allowed domains
 * @returns Authentication result with PRF output
 * @throws Error if authentication fails
 */
export async function authenticateWithPrf(
  credentialId: string,
  prfSalt: string,
  options?: PasskeyOptions,
): Promise<PasskeyAuthResult> {
  if (!isWebAuthnAvailable()) {
    throw new Error("WebAuthn is not available in this browser");
  }

  // SEC-004: Validate RP domain before authentication
  validateRpDomain(options?.allowedDomains);

  const credentialIdBytes = base64ToUint8Array(credentialId);
  const prfSaltBytes = base64ToUint8Array(prfSalt);

  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rpId: window.location.hostname,
      allowCredentials: [
        {
          type: "public-key",
          id: toBufferSource(credentialIdBytes),
        },
      ],
      userVerification: "required",
      timeout: 60000,
      extensions: {
        prf: {
          eval: {
            first: prfSaltBytes,
          },
        },
      } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null;

  if (!assertion) {
    throw new Error("Passkey authentication was cancelled");
  }

  // Check PRF extension output
  const extensionResults = assertion.getClientExtensionResults() as {
    prf?: {
      results?: {
        first?: ArrayBuffer;
      };
    };
  };

  const prfResult = extensionResults.prf?.results?.first;
  if (!prfResult) {
    throw new Error(
      "PRF extension did not return a result during authentication",
    );
  }

  return {
    prfOutput: new Uint8Array(prfResult),
  };
}

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
export async function getEncryptionKeyFromPasskey(
  credentialId: string,
  prfSalt: string,
  options?: PasskeyOptions,
): Promise<Uint8Array> {
  const { prfOutput } = await authenticateWithPrf(
    credentialId,
    prfSalt,
    options,
  );
  const prfSaltBytes = base64ToUint8Array(prfSalt);

  try {
    return await deriveKeyFromPrf(prfOutput, prfSaltBytes);
  } finally {
    // Wipe PRF output
    prfOutput.fill(0);
  }
}

/**
 * Check if a credential ID is valid for this user
 *
 * @param credentialId - Base64-encoded credential ID to check
 * @param options - Optional configuration including allowed domains
 * @returns true if credential exists and can be used
 */
export async function isCredentialAvailable(
  credentialId: string,
  options?: PasskeyOptions,
): Promise<boolean> {
  if (!isWebAuthnAvailable()) {
    return false;
  }

  try {
    // SEC-004: Validate RP domain before credential check
    validateRpDomain(options?.allowedDomains);

    const credentialIdBytes = base64ToUint8Array(credentialId);

    // Use conditional mediation to check if credential is available
    // without prompting the user
    const result = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rpId: window.location.hostname,
        allowCredentials: [
          {
            type: "public-key",
            id: toBufferSource(credentialIdBytes),
          },
        ],
        userVerification: "discouraged",
        // M-01: 30s timeout for conditional mediation on slower devices/authenticators.
        // Conditional mediation checks credential availability without user prompt,
        // but may be slow on older hardware or when authenticator is busy.
        timeout: 30000,
      },
      mediation: "conditional" as CredentialMediationRequirement,
    });

    return result !== null;
  } catch {
    // Credential not available or other error
    return false;
  }
}

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
export async function authenticateWithDiscoverablePrf(
  prfSalt: string,
  options?: PasskeyOptions,
): Promise<PasskeyAuthResult> {
  if (!isWebAuthnAvailable()) {
    throw new Error("WebAuthn is not available in this browser");
  }

  // SEC-004: Validate RP domain before authentication
  validateRpDomain(options?.allowedDomains);

  const prfSaltBytes = base64ToUint8Array(prfSalt);

  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rpId: window.location.hostname,
      // Empty allowCredentials lets browser show all discoverable credentials
      allowCredentials: [],
      userVerification: "required",
      timeout: 60000,
      extensions: {
        prf: {
          eval: {
            first: prfSaltBytes,
          },
        },
      } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null;

  if (!assertion) {
    throw new Error("Passkey authentication was cancelled");
  }

  // Check PRF extension output
  const extensionResults = assertion.getClientExtensionResults() as {
    prf?: {
      results?: {
        first?: ArrayBuffer;
      };
    };
  };

  const prfResult = extensionResults.prf?.results?.first;
  if (!prfResult) {
    throw new Error(
      "PRF extension did not return a result during authentication",
    );
  }

  return {
    prfOutput: new Uint8Array(prfResult),
  };
}
