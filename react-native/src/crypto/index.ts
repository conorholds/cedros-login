/**
 * Crypto module exports for SSS wallet implementation
 */

// Types
export * from "./types";

// Entropy generation
export {
  getRandomBytes,
  generateSeed,
  generateNonce,
  generateArgon2Salt,
  generatePrfSalt,
} from "./entropy";

// Secure memory wiping
export {
  wipeBytes,
  wipeAll,
  withSecureCleanup,
  withSecureCleanupSync,
  createSecureContainer,
  type SecureContainer,
} from "./secureWipe";

// AES-GCM encryption
export {
  aesGcmEncrypt,
  aesGcmDecrypt,
  aesGcmEncryptToBase64,
  aesGcmDecryptFromBase64,
  encryptWithPasswordKey,
  decryptWithPasswordKey,
  encryptAndWipe,
  uint8ArrayToBase64,
  base64ToUint8Array,
  type AesGcmEncryptResult,
} from "./aesGcm";

// HKDF key derivation
export { hkdfDerive, deriveKeyFromPrf } from "./hkdf";

// Argon2id password KDF
export {
  argon2Derive,
  argon2DeriveFromBytes,
  isArgon2Supported,
} from "./argon2";

// Shamir Secret Sharing
export {
  splitSecret,
  combineShares,
  verifyShares,
  SHAMIR_THRESHOLD,
  SHAMIR_TOTAL,
  type ShareId,
  type ShamirSplitResult,
} from "./shamir";

// BIP-39 mnemonic
export {
  shareToMnemonic,
  mnemonicToShare,
  seedToMnemonic,
  mnemonicToSeed,
  isValidMnemonic,
  wipeMnemonic,
  MNEMONIC_WORD_COUNT,
} from "./bip39";

// Solana keypair derivation
export {
  deriveKeypairFromSeed,
  getPublicKeyFromSeed,
  publicKeyToBase58,
  base58ToPublicKey,
  isValidSolanaAddress,
  type SolanaKeypair,
} from "./solanaKeypair";

// WebAuthn PRF (limited support on mobile)
export {
  isWebAuthnAvailable,
  isPrfSupported,
  registerPasskeyWithPrf,
  authenticateWithPrf,
  getEncryptionKeyFromPasskey,
  type PasskeyRegistrationResult,
  type PasskeyAuthResult,
} from "./webauthnPrf";
