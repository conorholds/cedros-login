/**
 * Shamir Secret Sharing using secrets.js-grempe
 *
 * Implements 2-of-3 threshold secret sharing:
 * - Share A: Encrypted with user credential (password/PIN/passkey PRF), stored on server
 * - Share B: Plaintext stored on server (SSS math protects it - 1 share reveals nothing)
 * - Share C: Encoded as BIP-39 mnemonic for recovery (never sent to server)
 *
 * Security:
 * - Any 2 shares can reconstruct the secret
 * - Any 1 share reveals nothing about the secret
 * - Uses GF(2^8) arithmetic for information-theoretic security
 */

import secrets from 'secrets.js-grempe';
import type { Seed, ShamirShare } from './types';
import { toSeed, toShamirShare } from './types';
import { wipeAll } from './secureWipe';

/** Shamir threshold (minimum shares to reconstruct) */
export const SHAMIR_THRESHOLD = 2;

/** Total number of shares */
export const SHAMIR_TOTAL = 3;

/** Share identifiers */
export type ShareId = 'A' | 'B' | 'C';

/** Result of splitting a secret into shares */
export interface ShamirSplitResult {
  /** Share A (for password encryption) */
  shareA: ShamirShare;
  /** Share B (for device PRF encryption) */
  shareB: ShamirShare;
  /** Share C (for recovery phrase) */
  shareC: ShamirShare;
}

/**
 * Split a 16-byte seed into 3 shares using Shamir's Secret Sharing
 *
 * @param seed - 16-byte seed to split
 * @returns Three shares (any 2 can reconstruct the seed)
 */
export function splitSecret(seed: Seed): ShamirSplitResult {
  if (seed.length !== 16) {
    throw new Error(`Invalid seed length: expected 16, got ${seed.length}`);
  }

  // Convert seed to hex string for secrets.js
  const seedHex = uint8ArrayToHex(seed);

  // Split into 3 shares with threshold 2
  const shares = secrets.share(seedHex, SHAMIR_TOTAL, SHAMIR_THRESHOLD);

  if (shares.length !== 3) {
    throw new Error(`Unexpected share count: ${shares.length}`);
  }

  // Convert hex shares back to Uint8Array
  // secrets.js adds a prefix with share index, we keep the full share format
  const shareA = hexShareToBytes(shares[0]);
  const shareB = hexShareToBytes(shares[1]);
  const shareC = hexShareToBytes(shares[2]);

  return {
    shareA: toShamirShare(shareA),
    shareB: toShamirShare(shareB),
    shareC: toShamirShare(shareC),
  };
}

/**
 * Combine 2 shares to reconstruct the original seed
 *
 * @param share1 - First share
 * @param share2 - Second share (must be different from first)
 * @returns Reconstructed 16-byte seed (MAINT-03: fixed from incorrect "32-byte")
 * @throws Error if shares are invalid or cannot reconstruct
 */
export function combineShares(share1: ShamirShare, share2: ShamirShare): Seed {
  // Convert shares back to hex format for secrets.js
  const hexShare1 = bytesToHexShare(share1);
  const hexShare2 = bytesToHexShare(share2);

  try {
    // Combine shares
    const seedHex = secrets.combine([hexShare1, hexShare2]);

    // Convert back to bytes
    const seed = hexToUint8Array(seedHex);

    if (seed.length !== 16) {
      throw new Error(`Reconstructed seed has wrong length: ${seed.length}`);
    }

    return toSeed(seed);
  } catch {
    throw new Error('Failed to reconstruct seed from shares');
  }
}

/**
 * Verify that shares can successfully reconstruct a seed
 *
 * @param share1 - First share
 * @param share2 - Second share
 * @param expectedSeed - Expected seed after reconstruction
 * @returns true if shares reconstruct to expected seed
 */
export function verifyShares(
  share1: ShamirShare,
  share2: ShamirShare,
  expectedSeed: Seed
): boolean {
  let reconstructed: Seed | undefined;
  try {
    reconstructed = combineShares(share1, share2);

    // Constant-time comparison
    if (reconstructed.length !== expectedSeed.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < reconstructed.length; i++) {
      result |= reconstructed[i] ^ expectedSeed[i];
    }

    return result === 0;
  } catch {
    return false;
  } finally {
    if (reconstructed) {
      wipeAll(reconstructed);
    }
  }
}

/**
 * Extract share index from a share (useful for debugging)
 *
 * @param share - Share to inspect
 * @returns Share index (1-based)
 */
export function getShareIndex(share: ShamirShare): number {
  // secrets.js encodes the index in the first byte(s)
  // The hex format is: {bits}{id}{data}
  const hexShare = bytesToHexShare(share);
  return secrets.extractShareComponents(hexShare).id;
}

// --- Internal utilities ---

/**
 * Convert Uint8Array to hex string
 */
function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 * CRYPTO-01: Validates hex characters and length before parsing
 */
function hexToUint8Array(hex: string): Uint8Array {
  // CRYPTO-01: Validate hex characters before parsing
  if (!/^[0-9a-fA-F]*$/.test(hex)) {
    throw new Error('Invalid hex string: contains non-hex characters');
  }
  // CRYPTO-01: Validate even length (each byte is 2 hex chars)
  if (hex.length % 2 !== 0) {
    throw new Error(`Invalid hex string: length ${hex.length} is odd (must be even)`);
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Convert hex share from secrets.js to bytes
 *
 * M-08: Padding Logic Explanation
 *
 * secrets.js shares have format: {bits}{id}{data} where:
 * - bits: 1-2 hex chars indicating bit mode (e.g., "8" for 8-bit)
 * - id: 1-2 hex chars for share ID (1-255)
 * - data: the actual share data
 *
 * Example: "8011abcd..." = 8-bit mode, share ID 1, data "1abcd..."
 *
 * The hex string can have odd length (e.g., "801..." is 3 hex chars for prefix).
 * Since Uint8Array stores bytes (2 hex chars each), we must pad odd-length
 * strings to even length by prepending "0".
 *
 * This padding is reversed in bytesToHexShare() when reconstructing.
 */
function hexShareToBytes(hexShare: string): Uint8Array {
  // Pad to even length if necessary (prepend "0" to make byte-aligned)
  const paddedHex = hexShare.length % 2 === 0 ? hexShare : '0' + hexShare;
  return hexToUint8Array(paddedHex);
}

/**
 * Convert bytes back to hex share format for secrets.js
 *
 * M-08: Padding Removal Logic
 *
 * When hexShareToBytes() pads an odd-length hex string, it prepends "0".
 * We need to remove this padding, but only if it was actually added.
 *
 * Safe removal logic:
 * - If hex starts with "0X" (where X != 0): this was padding, remove "0"
 * - If hex starts with "00": NOT padding, this is actual data (e.g., share ID 0x00XX)
 *
 * Why this is safe:
 * 1. secrets.js shares always start with bit mode indicator (e.g., "8" for 8-bit)
 * 2. Valid shares never start with "00" as a single byte (that would be 0-bit mode)
 * 3. If we padded "801..." to "0801...", we remove "0" to restore "801..."
 * 4. If original was "00ab...", it wasn't padded and we keep it as-is
 */
function bytesToHexShare(bytes: Uint8Array): string {
  const hex = uint8ArrayToHex(bytes);
  // Remove leading "0" only if it was padding (not part of "00" prefix)
  if (hex.startsWith('0') && !hex.startsWith('00')) {
    return hex.substring(1);
  }
  return hex;
}

/**
 * Pad a Uint8Array to a specific length
 */
export function padToLength(data: Uint8Array, targetLength: number): Uint8Array {
  if (data.length >= targetLength) {
    return data;
  }
  const padded = new Uint8Array(targetLength);
  padded.set(data);
  return padded;
}
