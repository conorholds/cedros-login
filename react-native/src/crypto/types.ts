/**
 * Cryptographic type definitions for SSS wallet implementation
 *
 * Security: These types define the structure for client-side key material.
 * The server never receives plaintext seeds or derived keys.
 */

/** 16-byte seed for wallet derivation (128 bits, standard Solana format) */
export type Seed = Uint8Array & { readonly _brand: 'Seed' };

/** 16-byte Shamir share (128 bits) */
export type ShamirShare = Uint8Array & { readonly _brand: 'ShamirShare' };

/** 32-byte encryption key */
export type EncryptionKey = Uint8Array & { readonly _brand: 'EncryptionKey' };

/** 12-byte AES-GCM nonce */
export type AesNonce = Uint8Array & { readonly _brand: 'AesNonce' };

/** 16+ byte Argon2 salt */
export type Argon2Salt = Uint8Array & { readonly _brand: 'Argon2Salt' };

/** 32-byte PRF salt */
export type PrfSalt = Uint8Array & { readonly _brand: 'PrfSalt' };

/** Argon2id KDF parameters (OWASP recommended) */
export interface KdfParams {
  /** Memory cost in KiB (default: 19456 = 19 MiB) */
  mCost: number;
  /** Time cost / iterations (default: 2) */
  tCost: number;
  /** Parallelism (default: 1) */
  pCost: number;
}

/** Default OWASP-recommended Argon2id parameters */
export const DEFAULT_KDF_PARAMS: KdfParams = {
  mCost: 19456, // 19 MiB
  tCost: 2,
  pCost: 1,
};

/** Encrypted data with nonce for AES-GCM */
export interface EncryptedData {
  /** Base64-encoded ciphertext */
  ciphertext: string;
  /** Base64-encoded 12-byte nonce */
  nonce: string;
}

/** Enrollment flow state */
export type EnrollmentStep =
  | 'idle'
  | 'generating_seed'
  | 'splitting_shares'
  | 'encrypting_shares'
  | 'registering_passkey'
  | 'uploading'
  | 'showing_recovery'
  | 'complete'
  | 'error';

/** Enrollment flow state machine */
export interface EnrollmentState {
  step: EnrollmentStep;
  error?: string;
  /** BIP-39 mnemonic words (only during showing_recovery step) */
  recoveryPhrase?: string[];
  /** Solana public key (after complete) */
  solanaPubkey?: string;
}

/** Recovery flow state */
export type RecoveryStep =
  | 'idle'
  | 'entering_phrase'
  | 'validating'
  | 'prompting_password'
  | 'registering_passkey'
  | 'encrypting'
  | 'uploading'
  | 'complete'
  | 'error';

/** Recovery flow state machine */
export interface RecoveryState {
  step: RecoveryStep;
  error?: string;
  /**
   * New recovery phrase (12 words) shown ONLY on successful completion.
   * SECURITY: Must be displayed to user immediately and never logged.
   * User should write down and securely store this phrase.
   */
  recoveryPhrase?: string[];
}

/** Crypto capability detection results */
export interface CryptoCapabilities {
  /** WebCrypto API available */
  webCrypto: boolean;
  /** AES-GCM supported */
  aesGcm: boolean;
  /** HKDF supported */
  hkdf: boolean;
  /** Ed25519 signing supported */
  ed25519: boolean;
  /** WebAuthn available */
  webAuthn: boolean;
  /** WebAuthn PRF extension supported */
  webAuthnPrf: boolean;
  /** Argon2 WASM can be loaded */
  argon2: boolean;
  /** All required capabilities available */
  allSupported: boolean;
}

/** Wallet status */
export type WalletStatus =
  | 'loading'
  | 'not_enrolled'
  | 'enrolled_locked'
  | 'enrolled_unlocked'
  | 'unlocked'
  | 'error';

/** Type guard: verify Seed length (16 bytes) */
export function isSeed(data: Uint8Array): data is Seed {
  return data.length === 16;
}

/** Type guard: verify ShamirShare is valid
 * CRYPTO-4: Improved validation to check secrets.js format markers.
 * secrets.js produces shares with format: {bits}{id}{data}
 *
 * Note: BIP-39 mnemonic system stores 16-byte entropy without secrets.js
 * metadata, so we also accept exactly 16-byte arrays for compatibility.
 */
export function isShamirShare(data: Uint8Array): data is ShamirShare {
  // Accept 16-byte arrays (used by BIP-39 mnemonic system for Share C)
  if (data.length === 16) return true;

  // For secrets.js shares with metadata (>16 bytes)
  if (data.length < 18) return false;

  // CRYPTO-4: Check for secrets.js 8-bit mode marker
  // When hex share starts with "80", first byte after hex decode is 0x80
  const firstByte = data[0];
  if (firstByte !== 0x80 && firstByte !== 0x08) return false;

  return true;
}

/** Type guard: verify EncryptionKey length */
export function isEncryptionKey(data: Uint8Array): data is EncryptionKey {
  return data.length === 32;
}

/** Type guard: verify AesNonce length */
export function isAesNonce(data: Uint8Array): data is AesNonce {
  return data.length === 12;
}

/** Type guard: verify Argon2Salt length (16+ bytes) */
export function isArgon2Salt(data: Uint8Array): data is Argon2Salt {
  return data.length >= 16;
}

/** Type guard: verify PrfSalt length */
export function isPrfSalt(data: Uint8Array): data is PrfSalt {
  return data.length === 32;
}

/** Create branded Seed from Uint8Array (throws if invalid) */
export function toSeed(data: Uint8Array): Seed {
  if (!isSeed(data)) {
    throw new Error(`Invalid seed length: expected 16, got ${data.length}`);
  }
  return data as Seed;
}

/** Create branded ShamirShare from Uint8Array (throws if invalid) */
export function toShamirShare(data: Uint8Array): ShamirShare {
  if (!isShamirShare(data)) {
    throw new Error(`Invalid share length: expected >=16, got ${data.length}`);
  }
  return data as ShamirShare;
}

/** Create branded EncryptionKey from Uint8Array (throws if invalid) */
export function toEncryptionKey(data: Uint8Array): EncryptionKey {
  if (!isEncryptionKey(data)) {
    throw new Error(`Invalid key length: expected 32, got ${data.length}`);
  }
  return data as EncryptionKey;
}

/** Create branded AesNonce from Uint8Array (throws if invalid) */
export function toAesNonce(data: Uint8Array): AesNonce {
  if (!isAesNonce(data)) {
    throw new Error(`Invalid nonce length: expected 12, got ${data.length}`);
  }
  return data as AesNonce;
}

/** Create branded Argon2Salt from Uint8Array (throws if invalid) */
export function toArgon2Salt(data: Uint8Array): Argon2Salt {
  if (!isArgon2Salt(data)) {
    throw new Error(`Invalid salt length: expected >=16, got ${data.length}`);
  }
  return data as Argon2Salt;
}

/** Create branded PrfSalt from Uint8Array (throws if invalid) */
export function toPrfSalt(data: Uint8Array): PrfSalt {
  if (!isPrfSalt(data)) {
    throw new Error(`Invalid PRF salt length: expected 32, got ${data.length}`);
  }
  return data as PrfSalt;
}

/**
 * Cast branded Uint8Array types to BufferSource for Web Crypto API compatibility.
 *
 * Web Crypto APIs (importKey, encrypt, decrypt, etc.) expect BufferSource which only
 * accepts plain Uint8Array with ArrayBuffer (not ArrayBufferLike), not our branded types.
 * This function returns a new Uint8Array backed by a plain ArrayBuffer to satisfy the type.
 *
 * @param data - Any branded Uint8Array type (Seed, EncryptionKey, AesNonce, etc.)
 * @returns BufferSource suitable for Web Crypto APIs
 */
export function toBufferSource<T extends Uint8Array>(data: T): BufferSource {
  // Create a new Uint8Array backed by a plain ArrayBuffer to satisfy TypeScript's
  // strict BufferSource type which doesn't accept ArrayBufferLike
  return new Uint8Array(data) as BufferSource;
}
