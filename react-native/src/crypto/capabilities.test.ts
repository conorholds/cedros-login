import { describe, expect, it, vi } from 'vitest';

// react-native ships Flow-typed source that Vite/Rollup cannot parse.
// Provide a minimal stub so the test runner never touches the real package.
vi.mock('react-native', () => ({
  Platform: { OS: 'ios', Version: '17.0' },
}));

import { checkCryptoCapabilities } from './capabilities';

// Mock the async dependencies so we control their return values
vi.mock('./argon2', () => ({
  isArgon2Supported: vi.fn().mockResolvedValue(true),
}));

vi.mock('./hkdf', () => ({
  isHkdfSupported: vi.fn().mockResolvedValue(true),
}));

describe('checkCryptoCapabilities', () => {
  it('allSupported is true when RN-relevant caps are available', async () => {
    // In Node/vitest, crypto.subtle is available, so webCrypto/aesGcm/hkdf should be true.
    // We mocked argon2 and hkdf to return true.
    const caps = await checkCryptoCapabilities();

    // webAuthn and webAuthnPrf are always false on RN — but allSupported should
    // NOT depend on them (B-01r fix).
    expect(caps.webAuthn).toBe(false);
    expect(caps.webAuthnPrf).toBe(false);

    // If webCrypto, aesGcm, hkdf, and argon2 are all true, allSupported should be true
    if (caps.webCrypto && caps.aesGcm && caps.hkdf && caps.argon2) {
      expect(caps.allSupported).toBe(true);
    }
  });

  it('allSupported is false when a RN-relevant cap is missing', async () => {
    // Re-mock argon2 to return false
    const argon2 = await import('./argon2');
    vi.mocked(argon2.isArgon2Supported).mockResolvedValueOnce(false);

    const caps = await checkCryptoCapabilities();
    expect(caps.argon2).toBe(false);
    expect(caps.allSupported).toBe(false);
  });
});
