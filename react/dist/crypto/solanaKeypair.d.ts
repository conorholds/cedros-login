import { Seed } from './types';
/** Solana keypair with public and secret key */
export interface SolanaKeypair {
    /** 32-byte Ed25519 public key */
    publicKey: Uint8Array;
    /** 64-byte Ed25519 secret key (32-byte expanded seed + 32-byte public key) */
    secretKey: Uint8Array;
}
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
export declare function deriveKeypairFromSeed(seed: Seed): SolanaKeypair;
/**
 * Get the public key from a seed without returning the secret key
 *
 * @param seed - 32-byte seed
 * @returns 32-byte Ed25519 public key
 */
export declare function getPublicKeyFromSeed(seed: Seed): Uint8Array;
/**
 * Encode a public key as a Base58 Solana address
 *
 * @param publicKey - 32-byte public key
 * @returns Base58-encoded address string
 */
export declare function publicKeyToBase58(publicKey: Uint8Array): string;
/**
 * Decode a Base58 Solana address to public key bytes
 *
 * @param address - Base58-encoded address
 * @returns 32-byte public key
 */
export declare function base58ToPublicKey(address: string): Uint8Array;
/**
 * Validate a Solana address format
 *
 * @param address - Address string to validate
 * @returns true if valid Base58 and correct length
 */
export declare function isValidSolanaAddress(address: string): boolean;
