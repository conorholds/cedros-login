//! Wallet signing service for server-side transaction signing
//!
//! This service handles the cryptographic operations for v2 wallet signing:
//! - Decrypting Share A using user credentials
//! - Combining shares using Shamir's Secret Sharing
//! - Signing Solana transactions
//! - Secure memory wiping
//!
//! ## Security Model
//!
//! - Share A is encrypted with user's password/PIN (Argon2id KDF) or passkey PRF (HKDF)
//! - Share B is stored as plaintext (SSS math protects it)
//! - Seed is reconstructed JIT, used for signing, then immediately wiped
//! - Server never stores seed or private key at rest

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::{Algorithm, Argon2, Params, Version};
use ed25519_dalek::{Signer, SigningKey};
use hkdf::Hkdf;
use sha2::Sha256;
use tokio::task;
use zeroize::{Zeroize, Zeroizing};

use rand::rngs::OsRng;
use rand::RngCore;

use crate::errors::AppError;
use crate::repositories::{KdfParams, ShareAAuthMethod, WalletMaterialEntity};

/// Generate a random salt for Argon2id KDF (16 bytes)
///
/// SRV-04: Uses OsRng (kernel entropy) rather than thread_rng (ChaCha PRNG)
/// for cryptographic salt generation, per best-practice for Argon2 salts.
fn generate_salt() -> [u8; 16] {
    let mut salt = [0u8; 16];
    OsRng.fill_bytes(&mut salt);
    salt
}

/// Wallet signing service
#[derive(Clone, Default)]
pub struct WalletSigningService;

/// Credential for unlocking Share A
pub enum UnlockCredential {
    /// Password (email users) - derives key with Argon2id
    Password(String),
    /// PIN (OAuth users) - derives key with Argon2id
    Pin(String),
    /// PRF output from passkey - derives key with HKDF
    PrfOutput(Vec<u8>),
    /// Raw API key - derives key with Argon2id
    ApiKey(String),
}

/// Result of re-encrypting Share A with a new password
///
/// Contains the new ciphertext, nonce, and salt needed to update wallet material.
pub struct ReencryptedShareA {
    /// New AES-GCM ciphertext
    pub ciphertext: Vec<u8>,
    /// New 12-byte nonce
    pub nonce: Vec<u8>,
    /// New 16-byte Argon2id salt
    pub salt: Vec<u8>,
}

impl WalletSigningService {
    /// Create a new wallet signing service
    pub fn new() -> Self {
        Self
    }

    /// Sign a transaction using the wallet material and credential
    ///
    /// # Security
    ///
    /// - Decrypts Share A using the credential
    /// - Combines Share A + Share B to reconstruct the seed
    /// - Signs the transaction
    /// - Wipes seed and intermediate values from memory
    ///
    /// # Thread Safety (C-02)
    ///
    /// The `material` reference must remain immutable for the duration of this call.
    /// Share B is read from `material` after Share A is decrypted. If `material`
    /// were mutated between these operations (e.g., during a concurrent rotation),
    /// the shares would be mismatched and reconstruction would fail or produce
    /// an incorrect seed.
    ///
    /// **Caller guarantee:** Do not mutate `WalletMaterialEntity` while signing
    /// operations are in flight. The repository layer ensures this by providing
    /// immutable snapshots per request.
    pub async fn sign_transaction(
        &self,
        material: &WalletMaterialEntity,
        credential: &UnlockCredential,
        transaction: &[u8],
    ) -> Result<Vec<u8>, AppError> {
        // Decrypt Share A
        let mut share_a = self.decrypt_share_a(material, credential).await?;

        // Combine shares to reconstruct seed
        let mut seed = self.combine_shares(&share_a, &material.share_b)?;

        // Wipe Share A immediately after use
        share_a.zeroize();

        // Sign the transaction
        let signature = self.sign_with_seed(&seed, transaction)?;

        // Wipe seed immediately after signing
        seed.zeroize();

        Ok(signature)
    }

    /// Reconstruct the private key (seed) as a base58-encoded string
    ///
    /// Used for Privacy Cash deposits where the sidecar needs the private key.
    /// Returns the 64-byte Ed25519 keypair as base58 (Solana keypair format).
    ///
    /// # Security
    ///
    /// - Uses cached key to decrypt Share A
    /// - Combines Share A + Share B to reconstruct the seed
    /// - Returns the keypair as base58 (caller must handle securely)
    /// - Wipes intermediate values from memory
    ///
    /// # Thread Safety (C-02)
    ///
    /// See [`sign_transaction`] for thread safety requirements.
    /// SRV-05: Returns `Zeroizing<String>` so the base58-encoded private key
    /// is zeroed from heap memory on drop.
    pub fn reconstruct_private_key(
        &self,
        material: &WalletMaterialEntity,
        cached_key: &[u8; 32],
    ) -> Result<Zeroizing<String>, AppError> {
        // Decrypt Share A using cached key
        let mut share_a = self.decrypt_aes_gcm(
            cached_key,
            &material.share_a_nonce,
            &material.share_a_ciphertext,
        )?;

        // Combine shares to reconstruct seed
        let mut seed = self.combine_shares(&share_a, &material.share_b)?;

        // Wipe Share A immediately after use
        share_a.zeroize();

        if seed.len() != 32 {
            seed.zeroize();
            return Err(AppError::Internal(anyhow::anyhow!(
                "Invalid seed length: expected 32, got {}",
                seed.len()
            )));
        }

        // Create the Ed25519 signing key
        let seed_array: [u8; 32] = seed[..32].try_into().map_err(|_| {
            seed.zeroize();
            AppError::Internal(anyhow::anyhow!("Seed conversion failed"))
        })?;

        let signing_key = SigningKey::from_bytes(&seed_array);
        let verifying_key = signing_key.verifying_key();

        // Solana keypair format: 32-byte secret key + 32-byte public key
        let mut keypair_bytes = [0u8; 64];
        keypair_bytes[..32].copy_from_slice(&seed_array);
        keypair_bytes[32..].copy_from_slice(verifying_key.as_bytes());

        // Wipe seed
        seed.zeroize();

        // Encode as base58, wrapped in Zeroizing so it's wiped on drop
        let result = Zeroizing::new(bs58::encode(&keypair_bytes).into_string());

        // Zeroize keypair bytes
        keypair_bytes.zeroize();

        Ok(result)
    }

    /// Sign a transaction using a cached encryption key
    ///
    /// Used when wallet is already unlocked for the session.
    /// The cached_key is the derived encryption key, NOT the Share A or seed.
    ///
    /// # Security
    ///
    /// - Uses cached key to decrypt Share A
    /// - Combines Share A + Share B to reconstruct the seed
    /// - Signs the transaction
    /// - Wipes seed and intermediate values from memory
    ///
    /// # Thread Safety (C-02)
    ///
    /// See [`sign_transaction`] for thread safety requirements. The same
    /// immutability guarantee applies to `material` during this call.
    pub fn sign_transaction_with_cached_key(
        &self,
        material: &WalletMaterialEntity,
        cached_key: &[u8; 32],
        transaction: &[u8],
    ) -> Result<Vec<u8>, AppError> {
        // Decrypt Share A using cached key
        let mut share_a = self.decrypt_aes_gcm(
            cached_key,
            &material.share_a_nonce,
            &material.share_a_ciphertext,
        )?;

        // Combine shares to reconstruct seed
        let mut seed = self.combine_shares(&share_a, &material.share_b)?;

        // Wipe Share A immediately after use
        share_a.zeroize();

        // Sign the transaction
        let signature = self.sign_with_seed(&seed, transaction)?;

        // Wipe seed immediately after signing
        seed.zeroize();

        Ok(signature)
    }

    /// Sign a transaction using a cached key and a derived wallet index
    ///
    /// For index 0 (default wallet), uses master seed directly.
    /// For index > 0, derives a child seed via HKDF-SHA256.
    pub fn sign_transaction_with_derived_index(
        &self,
        material: &WalletMaterialEntity,
        cached_key: &[u8; 32],
        transaction: &[u8],
        derivation_index: i32,
    ) -> Result<Vec<u8>, AppError> {
        // Decrypt Share A using cached key
        let mut share_a = self.decrypt_aes_gcm(
            cached_key,
            &material.share_a_nonce,
            &material.share_a_ciphertext,
        )?;

        // Combine shares to reconstruct master seed
        let mut master_seed = self.combine_shares(&share_a, &material.share_b)?;
        share_a.zeroize();

        let signature = if derivation_index > 0 {
            let mut child = derive_child_seed_from_bytes(&master_seed, derivation_index as u32)?;
            master_seed.zeroize();
            let sig = self.sign_with_seed(&child, transaction)?;
            child.zeroize();
            sig
        } else {
            let sig = self.sign_with_seed(&master_seed, transaction)?;
            master_seed.zeroize();
            sig
        };

        Ok(signature)
    }

    /// Sign a transaction with credential and derived wallet index
    pub async fn sign_transaction_with_derived(
        &self,
        material: &WalletMaterialEntity,
        credential: &UnlockCredential,
        transaction: &[u8],
        derivation_index: i32,
    ) -> Result<Vec<u8>, AppError> {
        let mut share_a = self.decrypt_share_a(material, credential).await?;
        let mut master_seed = self.combine_shares(&share_a, &material.share_b)?;
        share_a.zeroize();

        let signature = if derivation_index > 0 {
            let mut child = derive_child_seed_from_bytes(&master_seed, derivation_index as u32)?;
            master_seed.zeroize();
            let sig = self.sign_with_seed(&child, transaction)?;
            child.zeroize();
            sig
        } else {
            let sig = self.sign_with_seed(&master_seed, transaction)?;
            master_seed.zeroize();
            sig
        };

        Ok(signature)
    }

    /// Derive a child pubkey from the master wallet at a given derivation index.
    ///
    /// Requires the cached encryption key (wallet must be unlocked).
    /// Reconstructs master seed from shares, derives child seed, returns pubkey.
    pub fn derive_pubkey_for_index(
        &self,
        material: &WalletMaterialEntity,
        cached_key: &[u8; 32],
        index: u32,
    ) -> Result<String, AppError> {
        let mut share_a = self.decrypt_aes_gcm(
            cached_key,
            &material.share_a_nonce,
            &material.share_a_ciphertext,
        )?;

        let mut master_seed = self.combine_shares(&share_a, &material.share_b)?;
        share_a.zeroize();

        let pubkey = derive_pubkey_at_index(&master_seed, index)?;
        master_seed.zeroize();

        Ok(pubkey)
    }

    /// Derive the encryption key from a credential
    ///
    /// Returns the derived key that can be cached for session-based signing.
    /// Caller is responsible for securely storing and eventually zeroizing the key.
    pub async fn derive_key(
        &self,
        material: &WalletMaterialEntity,
        credential: &UnlockCredential,
    ) -> Result<[u8; 32], AppError> {
        match (&material.share_a_auth_method, credential) {
            (ShareAAuthMethod::Password, UnlockCredential::Password(password)) => {
                self.derive_key_argon2(
                    password.as_bytes().to_vec(),
                    material
                        .share_a_kdf_salt
                        .as_ref()
                        .ok_or_else(|| {
                            AppError::Internal(anyhow::anyhow!(
                                "Missing KDF salt for password method"
                            ))
                        })?
                        .clone(),
                    material
                        .share_a_kdf_params
                        .as_ref()
                        .ok_or_else(|| {
                            AppError::Internal(anyhow::anyhow!(
                                "Missing KDF params for password method"
                            ))
                        })?
                        .clone(),
                )
                .await
            }
            (ShareAAuthMethod::Pin, UnlockCredential::Pin(pin)) => {
                self.derive_key_argon2(
                    pin.as_bytes().to_vec(),
                    material
                        .share_a_kdf_salt
                        .as_ref()
                        .ok_or_else(|| {
                            AppError::Internal(anyhow::anyhow!("Missing KDF salt for PIN method"))
                        })?
                        .clone(),
                    material
                        .share_a_kdf_params
                        .as_ref()
                        .ok_or_else(|| {
                            AppError::Internal(anyhow::anyhow!("Missing KDF params for PIN method"))
                        })?
                        .clone(),
                )
                .await
            }
            (ShareAAuthMethod::Passkey, UnlockCredential::PrfOutput(prf_output)) => self
                .derive_key_hkdf(
                    prf_output,
                    material.prf_salt.as_ref().ok_or_else(|| {
                        AppError::Internal(anyhow::anyhow!("Missing PRF salt for passkey method"))
                    })?,
                ),
            (ShareAAuthMethod::ApiKey, UnlockCredential::ApiKey(raw_key)) => {
                self.derive_key_argon2(
                    raw_key.as_bytes().to_vec(),
                    material
                        .share_a_kdf_salt
                        .as_ref()
                        .ok_or_else(|| {
                            AppError::Internal(anyhow::anyhow!(
                                "Missing KDF salt for api_key method"
                            ))
                        })?
                        .clone(),
                    material
                        .share_a_kdf_params
                        .as_ref()
                        .ok_or_else(|| {
                            AppError::Internal(anyhow::anyhow!(
                                "Missing KDF params for api_key method"
                            ))
                        })?
                        .clone(),
                )
                .await
            }
            _ => Err(AppError::Validation(
                "Credential type doesn't match wallet auth method".into(),
            )),
        }
    }

    /// Verify a credential by attempting to decrypt Share A
    ///
    /// Returns the derived key if successful, which can be cached.
    pub async fn verify_and_derive_key(
        &self,
        material: &WalletMaterialEntity,
        credential: &UnlockCredential,
    ) -> Result<[u8; 32], AppError> {
        let key = self.derive_key(material, credential).await?;

        // Verify by attempting decryption (will fail with InvalidCredentials if wrong)
        self.decrypt_aes_gcm(&key, &material.share_a_nonce, &material.share_a_ciphertext)?;

        Ok(key)
    }

    /// Decrypt Share A using the credential
    async fn decrypt_share_a(
        &self,
        material: &WalletMaterialEntity,
        credential: &UnlockCredential,
    ) -> Result<Vec<u8>, AppError> {
        // Derive the encryption key based on auth method
        let mut key = match (&material.share_a_auth_method, credential) {
            (ShareAAuthMethod::Password, UnlockCredential::Password(password)) => {
                self.derive_key_argon2(
                    password.as_bytes().to_vec(),
                    material
                        .share_a_kdf_salt
                        .as_ref()
                        .ok_or_else(|| {
                            AppError::Internal(anyhow::anyhow!(
                                "Missing KDF salt for password method"
                            ))
                        })?
                        .clone(),
                    material
                        .share_a_kdf_params
                        .as_ref()
                        .ok_or_else(|| {
                            AppError::Internal(anyhow::anyhow!(
                                "Missing KDF params for password method"
                            ))
                        })?
                        .clone(),
                )
                .await?
            }
            (ShareAAuthMethod::Pin, UnlockCredential::Pin(pin)) => {
                self.derive_key_argon2(
                    pin.as_bytes().to_vec(),
                    material
                        .share_a_kdf_salt
                        .as_ref()
                        .ok_or_else(|| {
                            AppError::Internal(anyhow::anyhow!("Missing KDF salt for PIN method"))
                        })?
                        .clone(),
                    material
                        .share_a_kdf_params
                        .as_ref()
                        .ok_or_else(|| {
                            AppError::Internal(anyhow::anyhow!("Missing KDF params for PIN method"))
                        })?
                        .clone(),
                )
                .await?
            }
            (ShareAAuthMethod::Passkey, UnlockCredential::PrfOutput(prf_output)) => self
                .derive_key_hkdf(
                    prf_output,
                    material.prf_salt.as_ref().ok_or_else(|| {
                        AppError::Internal(anyhow::anyhow!("Missing PRF salt for passkey method"))
                    })?,
                )?,
            (ShareAAuthMethod::ApiKey, UnlockCredential::ApiKey(raw_key)) => {
                self.derive_key_argon2(
                    raw_key.as_bytes().to_vec(),
                    material
                        .share_a_kdf_salt
                        .as_ref()
                        .ok_or_else(|| {
                            AppError::Internal(anyhow::anyhow!(
                                "Missing KDF salt for api_key method"
                            ))
                        })?
                        .clone(),
                    material
                        .share_a_kdf_params
                        .as_ref()
                        .ok_or_else(|| {
                            AppError::Internal(anyhow::anyhow!(
                                "Missing KDF params for api_key method"
                            ))
                        })?
                        .clone(),
                )
                .await?
            }
            _ => {
                return Err(AppError::Validation(
                    "Credential type doesn't match wallet auth method".into(),
                ))
            }
        };

        // Decrypt Share A
        let result =
            self.decrypt_aes_gcm(&key, &material.share_a_nonce, &material.share_a_ciphertext);

        // Wipe key immediately
        key.zeroize();

        result
    }

    /// Derive encryption key using Argon2id
    ///
    /// PERF-001: Runs in spawn_blocking to avoid blocking the async runtime.
    /// Argon2 key derivation is CPU-intensive (~50-100ms) and would otherwise
    /// saturate the tokio thread pool under load.
    async fn derive_key_argon2(
        &self,
        password: Vec<u8>,
        salt: Vec<u8>,
        params: KdfParams,
    ) -> Result<[u8; 32], AppError> {
        task::spawn_blocking(move || {
            let argon2_params = Params::new(params.m_cost, params.t_cost, params.p_cost, Some(32))
                .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid Argon2 params: {}", e)))?;

            let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, argon2_params);

            let mut key = [0u8; 32];
            argon2
                .hash_password_into(&password, &salt, &mut key)
                .map_err(|e| {
                    AppError::Internal(anyhow::anyhow!("Argon2 key derivation failed: {}", e))
                })?;

            Ok(key)
        })
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Argon2 task failed: {}", e)))?
    }

    /// Derive encryption key using HKDF-SHA256 (for passkey PRF)
    fn derive_key_hkdf(&self, prf_output: &[u8], salt: &[u8]) -> Result<[u8; 32], AppError> {
        use hmac::{Hmac, Mac};

        type HmacSha256 = Hmac<Sha256>;

        // HKDF Extract
        let mut extract_hmac: HmacSha256 = Mac::new_from_slice(salt)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("HMAC init failed: {}", e)))?;
        extract_hmac.update(prf_output);
        let prk = extract_hmac.finalize().into_bytes();

        // HKDF Expand (single iteration for 32 bytes)
        let info = b"wallet-share-a-encryption";
        let mut expand_hmac: HmacSha256 = Mac::new_from_slice(&prk)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("HMAC init failed: {}", e)))?;
        expand_hmac.update(info);
        expand_hmac.update(&[1u8]); // Counter byte
        let result = expand_hmac.finalize().into_bytes();

        let mut key = [0u8; 32];
        key.copy_from_slice(&result);

        Ok(key)
    }

    /// Decrypt ciphertext using AES-256-GCM
    fn decrypt_aes_gcm(
        &self,
        key: &[u8; 32],
        nonce: &[u8],
        ciphertext: &[u8],
    ) -> Result<Vec<u8>, AppError> {
        let cipher = Aes256Gcm::new_from_slice(key)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("AES cipher init failed: {}", e)))?;

        #[allow(deprecated)]
        let nonce = Nonce::from_slice(nonce);

        cipher
            .decrypt(nonce, ciphertext)
            .map_err(|_| AppError::InvalidCredentials)
    }

    /// Combine two Shamir shares to reconstruct the seed
    ///
    /// Compatible with secrets.js-grempe format (GF(2^8) arithmetic)
    fn combine_shares(&self, share_a: &[u8], share_b: &[u8]) -> Result<Vec<u8>, AppError> {
        // SRV-04: Reject oversized shares to prevent unbounded allocation
        const MAX_SHARE_LEN: usize = 128;
        if share_a.len() > MAX_SHARE_LEN || share_b.len() > MAX_SHARE_LEN {
            return Err(AppError::Validation(format!(
                "Share exceeds maximum length of {} bytes",
                MAX_SHARE_LEN
            )));
        }

        // Parse shares in secrets.js format
        let (id_a, data_a) = parse_share(share_a)?;
        let (id_b, data_b) = parse_share(share_b)?;

        if id_a == id_b {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Cannot combine shares with same ID"
            )));
        }

        if data_a.len() != data_b.len() {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Share data length mismatch"
            )));
        }

        // Lagrange interpolation at x=0 in GF(2^8)
        // For 2 shares: secret = y1 * L1(0) + y2 * L2(0)
        // L1(0) = (0 - x2) / (x1 - x2) = x2 / (x1 XOR x2)
        // L2(0) = (0 - x1) / (x2 - x1) = x1 / (x1 XOR x2)
        let x1 = id_a;
        let x2 = id_b;
        let denom = gf256_add(x1, x2); // x1 XOR x2

        // C-01: gf256_div now returns Result, but denom can never be 0 here
        // since x1 != x2 (checked above) implies x1 XOR x2 != 0.
        // We still propagate the error for defensive correctness.
        let l1 = gf256_div(x2, denom)?; // x2 / (x1 XOR x2)
        let l2 = gf256_div(x1, denom)?; // x1 / (x1 XOR x2)

        // Reconstruct each byte of the secret
        let mut secret = vec![0u8; data_a.len()];
        for i in 0..secret.len() {
            let term1 = gf256_mul(data_a[i], l1);
            let term2 = gf256_mul(data_b[i], l2);
            secret[i] = gf256_add(term1, term2);
        }

        Ok(secret)
    }

    /// Verify Share C ownership for Share C recovery mode
    ///
    /// Combines Share B (from stored material) + Share C (from user) to reconstruct
    /// the seed, then derives the pubkey and verifies it matches the stored pubkey.
    ///
    /// # Security
    ///
    /// - Only returns Share B if ownership is verified
    /// - Seed is reconstructed temporarily and wiped immediately
    ///
    /// Returns: true if Share C is valid (pubkey matches)
    pub fn verify_share_c(
        &self,
        material: &WalletMaterialEntity,
        share_c: &[u8],
    ) -> Result<bool, AppError> {
        // Share C comes as raw 32-byte entropy from mnemonic
        // We need to convert it to secrets.js format for combining
        // Share C has ID 3 in our 2-of-3 scheme
        let share_c_formatted = format_share(3, share_c);

        // Combine Share B + Share C to reconstruct seed
        let mut seed = self.combine_shares(&material.share_b, &share_c_formatted)?;

        // Derive pubkey from seed
        let pubkey = derive_pubkey_from_seed(&seed)?;

        // Wipe seed immediately
        seed.zeroize();

        // Verify pubkey matches stored pubkey
        Ok(pubkey == material.solana_pubkey)
    }

    /// Re-encrypt Share A with a new password
    ///
    /// Used when user changes their login password - transparently re-encrypts Share A
    /// without requiring the user to do anything special.
    ///
    /// # Security
    ///
    /// - Decrypts Share A using old password
    /// - Re-encrypts with new password
    /// - Wipes plaintext Share A and keys from memory
    pub async fn reencrypt_share_a(
        &self,
        material: &WalletMaterialEntity,
        old_password: &str,
        new_password: &str,
    ) -> Result<ReencryptedShareA, AppError> {
        // Verify auth method is password
        if material.share_a_auth_method != ShareAAuthMethod::Password {
            return Err(AppError::Validation(
                "Wallet is not using password authentication".into(),
            ));
        }

        // Get existing KDF params and salt
        let kdf_params = material.share_a_kdf_params.as_ref().ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!("Missing KDF params for password method"))
        })?;
        let old_salt = material.share_a_kdf_salt.as_ref().ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!("Missing KDF salt for password method"))
        })?;

        // Derive old key and decrypt Share A
        let mut old_key = self
            .derive_key_argon2(
                old_password.as_bytes().to_vec(),
                old_salt.clone(),
                kdf_params.clone(),
            )
            .await?;
        let mut share_a = self.decrypt_aes_gcm(
            &old_key,
            &material.share_a_nonce,
            &material.share_a_ciphertext,
        )?;
        old_key.zeroize();

        // Generate new salt and derive new key
        let new_salt = generate_salt();
        let mut new_key = self
            .derive_key_argon2(
                new_password.as_bytes().to_vec(),
                new_salt.to_vec(),
                kdf_params.clone(),
            )
            .await?;

        // Encrypt Share A with new key
        let (ciphertext, nonce) = self.encrypt_aes_gcm(&new_key, &share_a)?;

        // Wipe sensitive data
        new_key.zeroize();
        share_a.zeroize();

        Ok(ReencryptedShareA {
            ciphertext,
            nonce: nonce.to_vec(),
            salt: new_salt.to_vec(),
        })
    }

    /// Encrypt data using AES-256-GCM
    fn encrypt_aes_gcm(
        &self,
        key: &[u8; 32],
        plaintext: &[u8],
    ) -> Result<(Vec<u8>, [u8; 12]), AppError> {
        use aes_gcm::aead::OsRng;
        use aes_gcm::AeadCore;

        let cipher = Aes256Gcm::new_from_slice(key)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("AES cipher init failed: {}", e)))?;

        let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

        let ciphertext = cipher
            .encrypt(&nonce, plaintext)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("AES encryption failed: {}", e)))?;

        let mut nonce_bytes = [0u8; 12];
        nonce_bytes.copy_from_slice(&nonce);

        Ok((ciphertext, nonce_bytes))
    }

    /// Sign data using Ed25519
    fn sign_with_seed(&self, seed: &[u8], message: &[u8]) -> Result<Vec<u8>, AppError> {
        if seed.len() != 32 {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Invalid seed length: expected 32, got {}",
                seed.len()
            )));
        }

        let seed_array: [u8; 32] = seed
            .try_into()
            .map_err(|_| AppError::Internal(anyhow::anyhow!("Seed conversion failed")))?;

        let signing_key = SigningKey::from_bytes(&seed_array);
        let signature = signing_key.sign(message);

        Ok(signature.to_bytes().to_vec())
    }
}

// --- secrets.js-grempe compatible share parsing ---

/// Parse a secrets.js share format
///
/// Format: first 2 hex chars = config (bits + flags), next 2 hex chars = share ID, rest = data
/// In binary: byte[0] = 0x80 | flags, byte[1] = share_id, byte[2..] = share_data
fn parse_share(share: &[u8]) -> Result<(u8, Vec<u8>), AppError> {
    if share.len() < 3 {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Share too short: {} bytes",
            share.len()
        )));
    }

    // First byte indicates bit mode (0x80 = 8-bit mode)
    let config = share[0];
    if config & 0xF0 != 0x80 {
        // Check for alternate format (may have extra nibble)
        // secrets.js can produce odd-length hex strings, which get padded with 0
        // If first byte is 0x08, the share was padded
        if config == 0x08 {
            // Padded format: 0x08, 0x0N (where N is share ID), data...
            if share.len() < 3 {
                return Err(AppError::Internal(anyhow::anyhow!(
                    "Padded share too short"
                )));
            }
            let id = share[1] & 0x0F; // Extract share ID from low nibble
            return Ok((id, share[2..].to_vec()));
        }
        return Err(AppError::Internal(anyhow::anyhow!(
            "Invalid share format: expected 8-bit mode (0x8_), got 0x{:02X}",
            config
        )));
    }

    // Second byte is share ID (1-255)
    let id = share[1];
    if id == 0 {
        return Err(AppError::Internal(anyhow::anyhow!("Invalid share ID: 0")));
    }

    // Rest is share data
    let data = share[2..].to_vec();

    Ok((id, data))
}

// --- GF(2^8) arithmetic ---

/// GF(2^8) addition (XOR)
#[inline]
fn gf256_add(a: u8, b: u8) -> u8 {
    a ^ b
}

/// GF(2^8) multiplication using AES polynomial (0x11B)
fn gf256_mul(a: u8, b: u8) -> u8 {
    let mut result = 0u8;
    let mut a = a;
    let mut b = b;

    while b != 0 {
        if b & 1 != 0 {
            result ^= a;
        }
        let high_bit = a & 0x80;
        a <<= 1;
        if high_bit != 0 {
            a ^= 0x1B; // AES irreducible polynomial: x^8 + x^4 + x^3 + x + 1
        }
        b >>= 1;
    }

    result
}

/// GF(2^8) multiplicative inverse using extended Euclidean algorithm
///
/// # Errors
///
/// Returns an error if `a` is 0, since 0 has no multiplicative inverse.
fn gf256_inv(a: u8) -> Result<u8, AppError> {
    if a == 0 {
        // C-01: Return explicit error instead of silently returning 0
        return Err(AppError::Internal(anyhow::anyhow!(
            "GF(2^8) inverse undefined for zero"
        )));
    }

    // Use exponentiation: a^254 = a^(-1) in GF(2^8)
    // 254 = 128 + 64 + 32 + 16 + 8 + 4 + 2 = 11111110 in binary
    let mut result = 1u8;
    let mut base = a;
    let mut exp = 254u8;

    while exp > 0 {
        if exp & 1 != 0 {
            result = gf256_mul(result, base);
        }
        base = gf256_mul(base, base);
        exp >>= 1;
    }

    Ok(result)
}

/// GF(2^8) division
///
/// # Errors
///
/// Returns an error if `b` is 0 (division by zero).
#[inline]
fn gf256_div(a: u8, b: u8) -> Result<u8, AppError> {
    Ok(gf256_mul(a, gf256_inv(b)?))
}

/// Format raw 32-byte data as a secrets.js share
///
/// secrets.js format: byte[0] = 0x80 (8-bit mode), byte[1] = share_id, byte[2..] = data
fn format_share(id: u8, data: &[u8]) -> Vec<u8> {
    let mut share = Vec::with_capacity(2 + data.len());
    share.push(0x80); // 8-bit mode marker
    share.push(id);
    share.extend_from_slice(data);
    share
}

/// Derive a child seed from a master seed using HKDF-SHA256
///
/// Index 0 = master seed directly (backward compatible).
/// Index > 0 = HKDF-SHA256(ikm=master_seed, salt="cedros-derived-wallet", info=u32_be(index)).
///
/// Uses a custom derivation (NOT BIP-44) to keep wallets app-locked.
pub fn derive_child_seed_from_bytes(master_seed: &[u8], index: u32) -> Result<Vec<u8>, AppError> {
    if master_seed.len() != 32 {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Invalid master seed length: expected 32, got {}",
            master_seed.len()
        )));
    }
    if index == 0 {
        return Ok(master_seed.to_vec());
    }
    let hk = Hkdf::<Sha256>::new(Some(b"cedros-derived-wallet"), master_seed);
    let mut child = vec![0u8; 32];
    hk.expand(&index.to_be_bytes(), &mut child)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("HKDF expand failed: {}", e)))?;
    Ok(child)
}

/// Derive the Solana pubkey (base58) for a given derivation index from a master seed
pub fn derive_pubkey_at_index(master_seed: &[u8], index: u32) -> Result<String, AppError> {
    let mut child = derive_child_seed_from_bytes(master_seed, index)?;
    let pubkey = derive_pubkey_from_seed(&child)?;
    child.zeroize();
    Ok(pubkey)
}

/// Derive Solana public key (base58) from 32-byte seed
fn derive_pubkey_from_seed(seed: &[u8]) -> Result<String, AppError> {
    if seed.len() != 32 {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Invalid seed length: expected 32, got {}",
            seed.len()
        )));
    }

    let seed_array: [u8; 32] = seed
        .try_into()
        .map_err(|_| AppError::Internal(anyhow::anyhow!("Seed conversion failed")))?;

    let signing_key = SigningKey::from_bytes(&seed_array);
    let verifying_key = signing_key.verifying_key();
    let pubkey_bytes = verifying_key.as_bytes();

    // Encode as base58
    Ok(bs58::encode(pubkey_bytes).into_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gf256_add() {
        assert_eq!(gf256_add(0, 0), 0);
        assert_eq!(gf256_add(0xFF, 0xFF), 0);
        assert_eq!(gf256_add(0x53, 0xCA), 0x99);
    }

    #[test]
    fn test_gf256_mul() {
        assert_eq!(gf256_mul(0, 0x53), 0);
        assert_eq!(gf256_mul(1, 0x53), 0x53);
        assert_eq!(gf256_mul(0x53, 0xCA), 0x01); // These are multiplicative inverses
    }

    #[test]
    fn test_gf256_inv() {
        // Test some known inverses
        assert_eq!(gf256_mul(0x53, gf256_inv(0x53).unwrap()), 1);
        assert_eq!(gf256_mul(0xCA, gf256_inv(0xCA).unwrap()), 1);
        assert_eq!(gf256_mul(0x02, gf256_inv(0x02).unwrap()), 1);
        assert_eq!(gf256_mul(0xFF, gf256_inv(0xFF).unwrap()), 1);
    }

    #[test]
    fn test_gf256_inv_zero_returns_error() {
        // C-01: Verify that gf256_inv(0) returns an error instead of silently returning 0
        let result = gf256_inv(0);
        assert!(result.is_err(), "gf256_inv(0) should return an error");
    }

    #[test]
    fn test_gf256_div() {
        // a / a = 1
        assert_eq!(gf256_div(0x53, 0x53).unwrap(), 1);
        // a / 1 = a
        assert_eq!(gf256_div(0x53, 1).unwrap(), 0x53);
    }

    #[test]
    fn test_gf256_div_by_zero_returns_error() {
        // C-01: Verify that gf256_div(a, 0) returns an error
        let result = gf256_div(0x53, 0);
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_share_valid() {
        // 0x80 = 8-bit mode, 0x01 = share ID 1, followed by data
        let share = vec![0x80, 0x01, 0xAB, 0xCD, 0xEF];
        let (id, data) = parse_share(&share).unwrap();
        assert_eq!(id, 1);
        assert_eq!(data, vec![0xAB, 0xCD, 0xEF]);
    }

    #[test]
    fn test_parse_share_padded_format() {
        // Padded format: 0x08, 0x01, data...
        let share = vec![0x08, 0x01, 0xAB, 0xCD];
        let (id, data) = parse_share(&share).unwrap();
        assert_eq!(id, 1);
        assert_eq!(data, vec![0xAB, 0xCD]);
    }

    #[test]
    fn test_parse_share_invalid_mode() {
        let share = vec![0x40, 0x01, 0xAB]; // Wrong bit mode
        assert!(parse_share(&share).is_err());
    }

    #[test]
    fn test_parse_share_too_short() {
        let share = vec![0x80, 0x01];
        assert!(parse_share(&share).is_err());
    }

    #[test]
    fn test_combine_shares_simple() {
        // Create two simple shares with known values
        // Share 1: ID=1, data=[0x01]
        // Share 2: ID=2, data=[0x02]
        let share1 = vec![0x80, 0x01, 0x01];
        let share2 = vec![0x80, 0x02, 0x02];

        let service = WalletSigningService::new();
        let result = service.combine_shares(&share1, &share2);
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_derive_key_argon2() {
        let service = WalletSigningService::new();
        let params = KdfParams {
            m_cost: 19456,
            t_cost: 2,
            p_cost: 1,
        };
        let salt = vec![0u8; 16];
        let password = b"test-password".to_vec();

        let key = service
            .derive_key_argon2(password.clone(), salt.clone(), params.clone())
            .await
            .unwrap();
        assert_eq!(key.len(), 32);

        // Same inputs should produce same key
        let key2 = service
            .derive_key_argon2(password.clone(), salt.clone(), params.clone())
            .await
            .unwrap();
        assert_eq!(key, key2);

        // Different password should produce different key
        let key3 = service
            .derive_key_argon2(b"different".to_vec(), salt, params)
            .await
            .unwrap();
        assert_ne!(key, key3);
    }

    #[test]
    fn test_derive_key_hkdf() {
        let service = WalletSigningService::new();
        let prf_output = [0u8; 32];
        let salt = [0u8; 32];

        let key = service.derive_key_hkdf(&prf_output, &salt).unwrap();
        assert_eq!(key.len(), 32);

        // Same inputs should produce same key
        let key2 = service.derive_key_hkdf(&prf_output, &salt).unwrap();
        assert_eq!(key, key2);
    }

    #[test]
    fn test_sign_with_seed() {
        let service = WalletSigningService::new();
        let seed = [0u8; 32];
        let message = b"test message";

        let signature = service.sign_with_seed(&seed, message).unwrap();
        assert_eq!(signature.len(), 64); // Ed25519 signatures are 64 bytes

        // Same inputs should produce same signature
        let signature2 = service.sign_with_seed(&seed, message).unwrap();
        assert_eq!(signature, signature2);
    }

    #[test]
    fn test_sign_with_seed_invalid_length() {
        let service = WalletSigningService::new();
        let seed = [0u8; 16]; // Wrong length

        let result = service.sign_with_seed(&seed, b"test");
        assert!(result.is_err());
    }

    #[test]
    fn test_encrypt_decrypt_roundtrip() {
        let service = WalletSigningService::new();
        let key = [0x42u8; 32];
        let plaintext = b"secret data to encrypt";

        // Encrypt
        let (ciphertext, nonce) = service.encrypt_aes_gcm(&key, plaintext).unwrap();
        assert_ne!(ciphertext.as_slice(), plaintext.as_slice());

        // Decrypt
        let decrypted = service.decrypt_aes_gcm(&key, &nonce, &ciphertext).unwrap();
        assert_eq!(decrypted, plaintext);
    }

    #[tokio::test]
    async fn test_reencrypt_share_a() {
        use chrono::Utc;
        use uuid::Uuid;

        let service = WalletSigningService::new();

        // Create test material
        let old_password = "old-password-123";
        let new_password = "new-password-456";
        let kdf_params = KdfParams {
            m_cost: 19456,
            t_cost: 2,
            p_cost: 1,
        };
        let old_salt = generate_salt();

        // Derive old key and encrypt test data
        let old_key = service
            .derive_key_argon2(
                old_password.as_bytes().to_vec(),
                old_salt.to_vec(),
                kdf_params.clone(),
            )
            .await
            .unwrap();
        let test_share_a = b"test share a data here!";
        let (ciphertext, nonce) = service.encrypt_aes_gcm(&old_key, test_share_a).unwrap();

        // Create wallet material
        let material = WalletMaterialEntity {
            id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            solana_pubkey: "test-pubkey".to_string(),
            scheme_version: 2,
            share_a_auth_method: ShareAAuthMethod::Password,
            share_a_ciphertext: ciphertext,
            share_a_nonce: nonce.to_vec(),
            share_a_kdf_salt: Some(old_salt.to_vec()),
            share_a_kdf_params: Some(kdf_params.clone()),
            prf_salt: None,
            share_a_pin_hash: None,
            share_b: vec![],
            api_key_id: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // Re-encrypt with new password
        let reencrypted = service
            .reencrypt_share_a(&material, old_password, new_password)
            .await
            .unwrap();

        // Verify we can decrypt with new password
        let new_key = service
            .derive_key_argon2(
                new_password.as_bytes().to_vec(),
                reencrypted.salt.clone(),
                kdf_params.clone(),
            )
            .await
            .unwrap();
        let decrypted = service
            .decrypt_aes_gcm(&new_key, &reencrypted.nonce, &reencrypted.ciphertext)
            .unwrap();
        assert_eq!(decrypted, test_share_a);

        // Verify old password no longer works
        let old_key_attempt = service
            .derive_key_argon2(
                old_password.as_bytes().to_vec(),
                reencrypted.salt.clone(),
                kdf_params,
            )
            .await
            .unwrap();
        let decrypt_result = service.decrypt_aes_gcm(
            &old_key_attempt,
            &reencrypted.nonce,
            &reencrypted.ciphertext,
        );
        assert!(decrypt_result.is_err());
    }

    #[test]
    fn test_derive_child_seed_index_0_returns_master() {
        let master = [0x42u8; 32];
        let child = derive_child_seed_from_bytes(&master, 0).unwrap();
        assert_eq!(child, master.to_vec());
    }

    #[test]
    fn test_derive_child_seed_deterministic() {
        let master = [0x42u8; 32];
        let c1 = derive_child_seed_from_bytes(&master, 1).unwrap();
        let c2 = derive_child_seed_from_bytes(&master, 1).unwrap();
        assert_eq!(c1, c2);
        assert_eq!(c1.len(), 32);
    }

    #[test]
    fn test_derive_child_seed_distinct_per_index() {
        let master = [0x42u8; 32];
        let c1 = derive_child_seed_from_bytes(&master, 1).unwrap();
        let c2 = derive_child_seed_from_bytes(&master, 2).unwrap();
        assert_ne!(c1, c2);
        // Neither should equal master
        assert_ne!(c1, master.to_vec());
        assert_ne!(c2, master.to_vec());
    }

    #[test]
    fn test_derive_child_seed_invalid_length() {
        let short = [0u8; 16];
        assert!(derive_child_seed_from_bytes(&short, 1).is_err());
    }

    #[test]
    fn test_derive_pubkey_at_index_backward_compat() {
        let master = [0xABu8; 32];
        // Index 0 pubkey should match derive_pubkey_from_seed(master)
        let pk0 = derive_pubkey_at_index(&master, 0).unwrap();
        let pk_direct = derive_pubkey_from_seed(&master).unwrap();
        assert_eq!(pk0, pk_direct);
    }

    #[test]
    fn test_derive_pubkey_at_index_distinct() {
        let master = [0xABu8; 32];
        let pk0 = derive_pubkey_at_index(&master, 0).unwrap();
        let pk1 = derive_pubkey_at_index(&master, 1).unwrap();
        assert_ne!(pk0, pk1);
    }

    #[tokio::test]
    async fn test_reencrypt_share_a_wrong_auth_method() {
        use chrono::Utc;
        use uuid::Uuid;

        let service = WalletSigningService::new();

        // Create wallet material with passkey method (not password)
        let material = WalletMaterialEntity {
            id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            solana_pubkey: "test-pubkey".to_string(),
            scheme_version: 2,
            share_a_auth_method: ShareAAuthMethod::Passkey,
            share_a_ciphertext: vec![],
            share_a_nonce: vec![],
            share_a_kdf_salt: None,
            share_a_kdf_params: None,
            prf_salt: Some(vec![0u8; 32]),
            share_a_pin_hash: None,
            share_b: vec![],
            api_key_id: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // Should fail because wallet uses passkey, not password
        let result = service.reencrypt_share_a(&material, "old", "new").await;
        assert!(result.is_err());
    }
}
