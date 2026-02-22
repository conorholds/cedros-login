/**
 * Crypto capability detection
 *
 * Checks for availability of all required crypto features before
 * allowing wallet enrollment. If any feature is missing, the wallet
 * feature should be disabled with an appropriate message.
 */

import { Platform } from 'react-native';
import type { CryptoCapabilities } from './types';
import { isArgon2Supported } from './argon2';
import { isHkdfSupported } from './hkdf';
// WebAuthn PRF is browser-only; in React Native these always return false
function isWebAuthnAvailable(): boolean {
  return false;
}
async function isPrfSupported(): Promise<boolean> {
  return false;
}

/**
 * Check all required crypto capabilities
 *
 * @returns Capability check results
 */
export async function checkCryptoCapabilities(): Promise<CryptoCapabilities> {
  const [webCrypto, aesGcm, hkdf, ed25519, webAuthn, webAuthnPrf, argon2] = await Promise.all([
    checkWebCrypto(),
    checkAesGcm(),
    isHkdfSupported(),
    checkEd25519(),
    Promise.resolve(isWebAuthnAvailable()),
    isPrfSupported(),
    isArgon2Supported(),
  ]);

  // WebAuthn/PRF are browser-only; exclude from allSupported on React Native
  const allSupported = webCrypto && aesGcm && hkdf && argon2;

  return {
    webCrypto,
    aesGcm,
    hkdf,
    ed25519,
    webAuthn,
    webAuthnPrf,
    argon2,
    allSupported,
  };
}

/**
 * Check if basic WebCrypto API is available
 */
async function checkWebCrypto(): Promise<boolean> {
  try {
    return (
      typeof crypto !== 'undefined' &&
      typeof crypto.subtle !== 'undefined' &&
      typeof crypto.getRandomValues === 'function'
    );
  } catch {
    return false;
  }
}

/**
 * Check if AES-GCM is supported
 */
async function checkAesGcm(): Promise<boolean> {
  try {
    // Generate a test key
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
      'encrypt',
      'decrypt',
    ]);

    // Try encryption
    const testData = new Uint8Array([1, 2, 3, 4]);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, testData);

    // Try decryption
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);

    // Verify roundtrip
    const decryptedArr = new Uint8Array(decrypted);
    return (
      decryptedArr.length === testData.length && decryptedArr.every((b, i) => b === testData[i])
    );
  } catch {
    return false;
  }
}

/**
 * Check if Ed25519 is supported (for signing, not required for derivation)
 */
async function checkEd25519(): Promise<boolean> {
  try {
    // Try to generate an Ed25519 key pair
    await crypto.subtle.generateKey('Ed25519', false, ['sign', 'verify']);
    return true;
  } catch {
    // Ed25519 may not be supported in SubtleCrypto
    // We have a fallback implementation, so this is not critical
    return false;
  }
}

/**
 * Get a human-readable message about missing capabilities
 *
 * @param capabilities - Capability check results
 * @returns Error message describing what's missing, or null if all supported
 */
export function getMissingCapabilitiesMessage(capabilities: CryptoCapabilities): string | null {
  if (capabilities.allSupported) {
    return null;
  }

  const missing: string[] = [];

  if (!capabilities.webCrypto) {
    missing.push('Web Crypto API');
  }
  if (!capabilities.aesGcm) {
    missing.push('AES-GCM encryption');
  }
  if (!capabilities.hkdf) {
    missing.push('HKDF key derivation');
  }
  if (!capabilities.webAuthn) {
    missing.push('WebAuthn/Passkeys');
  }
  if (!capabilities.webAuthnPrf) {
    missing.push('WebAuthn PRF extension (requires platform authenticator)');
  }
  if (!capabilities.argon2) {
    missing.push('Argon2 password hashing');
  }

  if (missing.length === 0) {
    return null;
  }

  return `Your browser or device is missing required features: ${missing.join(', ')}. Please use a modern browser with a platform authenticator (e.g., Touch ID, Face ID, Windows Hello).`;
}

/**
 * Get platform info relevant to crypto support.
 *
 * In React Native, browser UA parsing is not meaningful. Returns the
 * React Native platform (ios/android/etc.) and OS version instead.
 *
 * @returns Object with platform info and support status
 */
export function getBrowserSupportInfo(): {
  browser: string;
  version: string;
  likelySupported: boolean;
} {
  return {
    browser: Platform.OS,
    version: String(Platform.Version),
    // React Native crypto support depends on the JS engine and native modules,
    // not the OS version. Use checkCryptoCapabilities() for a definitive check.
    likelySupported: true,
  };
}

/** TTL for capability cache: 60 seconds */
const CAPABILITY_CACHE_TTL_MS = 60_000;

/**
 * Cache for capability check results
 */
let cachedCapabilities: CryptoCapabilities | null = null;
let cacheExpiresAt: number = 0;

/**
 * Get cached capabilities or check if not cached or expired
 *
 * @param forceRefresh - If true, bypass cache and recheck
 * @returns Capability check results
 */
export async function getCryptoCapabilities(forceRefresh = false): Promise<CryptoCapabilities> {
  if (!forceRefresh && cachedCapabilities !== null && Date.now() < cacheExpiresAt) {
    return cachedCapabilities;
  }

  cachedCapabilities = await checkCryptoCapabilities();
  cacheExpiresAt = Date.now() + CAPABILITY_CACHE_TTL_MS;
  return cachedCapabilities;
}

/**
 * Clear the capability cache (useful for testing)
 */
export function clearCapabilityCache(): void {
  cachedCapabilities = null;
  cacheExpiresAt = 0;
}
