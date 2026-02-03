/**
 * Crypto capability detection
 *
 * Checks for availability of all required crypto features before
 * allowing wallet enrollment. If any feature is missing, the wallet
 * feature should be disabled with an appropriate message.
 */

import type { CryptoCapabilities } from './types';
import { isArgon2Supported } from './argon2';
import { isHkdfSupported } from './hkdf';
import { isWebAuthnAvailable, isPrfSupported } from './webauthnPrf';

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

  const allSupported = webCrypto && aesGcm && hkdf && webAuthn && webAuthnPrf && argon2;

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
 * Check if the browser is known to support all required features
 *
 * @returns Object with browser info and support status
 */
export function getBrowserSupportInfo(): {
  browser: string;
  version: string;
  likelySupported: boolean;
} {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  // Chrome
  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  if (chromeMatch) {
    const version = parseInt(chromeMatch[1], 10);
    return {
      browser: 'Chrome',
      version: chromeMatch[1],
      likelySupported: version >= 116,
    };
  }

  // Safari
  const safariMatch = ua.match(/Version\/(\d+)/);
  if (safariMatch && ua.includes('Safari') && !ua.includes('Chrome')) {
    const version = parseInt(safariMatch[1], 10);
    return {
      browser: 'Safari',
      version: safariMatch[1],
      likelySupported: version >= 17,
    };
  }

  // Firefox
  const firefoxMatch = ua.match(/Firefox\/(\d+)/);
  if (firefoxMatch) {
    return {
      browser: 'Firefox',
      version: firefoxMatch[1],
      likelySupported: false, // Firefox PRF support is limited
    };
  }

  // Edge
  const edgeMatch = ua.match(/Edg\/(\d+)/);
  if (edgeMatch) {
    const version = parseInt(edgeMatch[1], 10);
    return {
      browser: 'Edge',
      version: edgeMatch[1],
      likelySupported: version >= 116,
    };
  }

  return {
    browser: 'Unknown',
    version: 'Unknown',
    likelySupported: false,
  };
}

/**
 * Cache for capability check results
 */
let cachedCapabilities: CryptoCapabilities | null = null;

/**
 * Get cached capabilities or check if not cached
 *
 * @param forceRefresh - If true, bypass cache and recheck
 * @returns Capability check results
 */
export async function getCryptoCapabilities(forceRefresh = false): Promise<CryptoCapabilities> {
  if (!forceRefresh && cachedCapabilities !== null) {
    return cachedCapabilities;
  }

  cachedCapabilities = await checkCryptoCapabilities();
  return cachedCapabilities;
}

/**
 * Clear the capability cache (useful for testing)
 */
export function clearCapabilityCache(): void {
  cachedCapabilities = null;
}
