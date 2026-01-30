/**
 * Crypto module exports for SSS wallet implementation
 *
 * This module provides all cryptographic primitives needed for the
 * non-custodial Solana wallet feature using Shamir Secret Sharing.
 *
 * Key components:
 * - Entropy: Secure random number generation
 * - Shamir: Secret splitting and reconstruction
 * - AES-GCM: Authenticated encryption
 * - Argon2: Password-based key derivation
 * - HKDF: Key derivation from PRF output
 * - BIP-39: Mnemonic encoding for recovery phrase
 * - WebAuthn PRF: Device key derivation via passkeys
 * - Solana Keypair: Ed25519 keypair derivation
 * - Secure Wipe: Memory cleanup utilities
 * - Capabilities: Feature detection
 */
export * from './types';
export { getRandomBytes, generateSeed, generateNonce, generateArgon2Salt, generatePrfSalt, } from './entropy';
export { wipeBytes, wipeAll, withSecureCleanup, withSecureCleanupSync, createSecureContainer, type SecureContainer, } from './secureWipe';
export { aesGcmEncrypt, aesGcmDecrypt, aesGcmEncryptToBase64, aesGcmDecryptFromBase64, encryptWithPasswordKey, decryptWithPasswordKey, encryptAndWipe, uint8ArrayToBase64, base64ToUint8Array, type AesGcmEncryptResult, } from './aesGcm';
export { hkdfDerive, deriveKeyFromPrf, deriveKeyWithDomain, isHkdfSupported } from './hkdf';
export { argon2Derive, argon2DeriveFromBytes, validateKdfParams, isArgon2Supported, verifyPassword, getRecommendedParams, } from './argon2';
export { argon2DeriveInWorker } from './argon2WorkerClient';
export { splitSecret, combineShares, verifyShares, getShareIndex, padToLength, SHAMIR_THRESHOLD, SHAMIR_TOTAL, type ShareId, type ShamirSplitResult, } from './shamir';
export { shareToMnemonic, mnemonicToShare, seedToMnemonic, mnemonicToSeed, isValidMnemonic, isValidWord, getWordSuggestions, generateRandomMnemonic, formatMnemonicForDisplay, parseMnemonicInput, wipeMnemonic, getWordlist, getWordIndex, MNEMONIC_WORD_COUNT, } from './bip39';
export { isWebAuthnAvailable, isPrfSupported, registerPasskeyWithPrf, authenticateWithPrf, authenticateWithDiscoverablePrf, getEncryptionKeyFromPasskey, isCredentialAvailable, type PasskeyRegistrationResult, type PasskeyAuthResult, } from './webauthnPrf';
export { deriveKeypairFromSeed, getPublicKeyFromSeed, publicKeyToBase58, base58ToPublicKey, isValidSolanaAddress, type SolanaKeypair, } from './solanaKeypair';
export { checkCryptoCapabilities, getMissingCapabilitiesMessage, getBrowserSupportInfo, getCryptoCapabilities, clearCapabilityCache, } from './capabilities';
