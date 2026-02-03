/**
 * Solana Ed25519 keypair derivation from seed
 *
 * Derives a Solana-compatible Ed25519 keypair from the 16-byte wallet seed.
 * The 16-byte seed is expanded to 32 bytes using SHA-256 for Ed25519 compatibility.
 *
 * Security:
 * - Uses @noble/curves for audited Ed25519 implementation (CRYPTO-1 fix)
 * - Uses SHA-256 to deterministically expand 16-byte seed to 32 bytes
 * - Produces deterministic keypairs from the same seed
 * - Private key material is wiped after derivation when requested
 */

import { ed25519 } from '@noble/curves/ed25519.js';
import { sha256 } from '@noble/hashes/sha256';
import type { Seed } from './types';
import { wipeBytes } from './secureWipe';

/** Solana keypair with public and secret key */
export interface SolanaKeypair {
  /** 32-byte Ed25519 public key */
  publicKey: Uint8Array;
  /** 64-byte Ed25519 secret key (32-byte expanded seed + 32-byte public key) */
  secretKey: Uint8Array;
}

/** Base58 alphabet used by Solana */
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Derive an Ed25519 keypair from a 16-byte seed
 *
 * The 16-byte seed is expanded to 32 bytes using SHA-256, then used for
 * Ed25519 derivation which internally:
 * - Hashes expanded seed with SHA-512
 * - Clamps lower 32 bytes to form scalar
 * - Multiplies by Ed25519 base point
 *
 * @param seed - 16-byte seed (128-bit entropy)
 * @returns Keypair with 32-byte public key and 64-byte secret key
 *
 * @security **CALLER MUST WIPE secretKey AFTER USE**
 * The returned `secretKey` contains sensitive cryptographic material.
 * Callers are responsible for wiping it when no longer needed:
 * ```ts
 * const keypair = deriveKeypairFromSeed(seed);
 * try {
 *   // use keypair.secretKey for signing
 * } finally {
 *   wipeBytes(keypair.secretKey);
 * }
 * ```
 * Failure to wipe may leave key material in memory, vulnerable to memory
 * dump attacks. The internal `expandedSeed` is automatically wiped.
 */
export function deriveKeypairFromSeed(seed: Seed): SolanaKeypair {
  if (seed.length !== 16) {
    throw new Error(`Invalid seed length: expected 16, got ${seed.length}`);
  }

  // Expand 16-byte seed to 32 bytes using SHA-256
  // This is deterministic and provides the 32 bytes needed for Ed25519
  const expandedSeed = sha256(seed);

  // Use @noble/curves audited Ed25519 implementation (CRYPTO-1)
  const publicKey = ed25519.getPublicKey(expandedSeed);

  // Create the 64-byte secret key (expandedSeed || publicKey)
  // Solana uses this format for compatibility with nacl
  const secretKey = new Uint8Array(64);
  secretKey.set(expandedSeed, 0);
  secretKey.set(publicKey, 32);

  // Wipe the expanded seed
  wipeBytes(expandedSeed);

  return { publicKey, secretKey };
}

/**
 * Get the public key from a seed without returning the secret key
 *
 * @param seed - 32-byte seed
 * @returns 32-byte Ed25519 public key
 */
export function getPublicKeyFromSeed(seed: Seed): Uint8Array {
  const keypair = deriveKeypairFromSeed(seed);
  const publicKey = keypair.publicKey;

  // Wipe the secret key
  wipeBytes(keypair.secretKey);

  return publicKey;
}

/**
 * Encode a public key as a Base58 Solana address
 *
 * @param publicKey - 32-byte public key
 * @returns Base58-encoded address string
 */
export function publicKeyToBase58(publicKey: Uint8Array): string {
  if (publicKey.length !== 32) {
    throw new Error(`Invalid public key length: expected 32, got ${publicKey.length}`);
  }

  return base58Encode(publicKey);
}

/**
 * Decode a Base58 Solana address to public key bytes
 *
 * @param address - Base58-encoded address
 * @returns 32-byte public key
 */
export function base58ToPublicKey(address: string): Uint8Array {
  const decoded = base58Decode(address);

  if (decoded.length !== 32) {
    throw new Error(`Invalid address: decoded to ${decoded.length} bytes`);
  }

  return decoded;
}

/**
 * Validate a Solana address format
 *
 * @param address - Address string to validate
 * @returns true if valid Base58 and correct length
 */
export function isValidSolanaAddress(address: string): boolean {
  if (typeof address !== 'string') return false;
  if (address.length < 32 || address.length > 44) return false;

  try {
    const decoded = base58Decode(address);
    return decoded.length === 32;
  } catch {
    return false;
  }
}

// --- Base58 implementation ---

function base58Encode(bytes: Uint8Array): string {
  // Count leading zeros
  let zeros = 0;
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    zeros++;
  }

  // Convert to big integer
  let num = 0n;
  for (let i = 0; i < bytes.length; i++) {
    num = num * 256n + BigInt(bytes[i]);
  }

  // Convert to base58
  let str = '';
  while (num > 0n) {
    const remainder = Number(num % 58n);
    str = BASE58_ALPHABET[remainder] + str;
    num = num / 58n;
  }

  // Add leading '1's for each leading zero byte
  return '1'.repeat(zeros) + str;
}

function base58Decode(str: string): Uint8Array {
  // Count leading '1's
  let zeros = 0;
  for (let i = 0; i < str.length && str[i] === '1'; i++) {
    zeros++;
  }

  // Convert from base58
  let num = 0n;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid base58 character: ${char}`);
    }
    num = num * 58n + BigInt(index);
  }

  // Convert to bytes
  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num % 256n));
    num = num / 256n;
  }

  // Add leading zeros
  const result = new Uint8Array(zeros + bytes.length);
  result.set(bytes, zeros);

  return result;
}
