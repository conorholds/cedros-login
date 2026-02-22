//! Solana wallet material repository for server-side signing
//!
//! SECURITY MODEL (v2):
//! - Share A: Encrypted ciphertext stored on server, decrypted server-side with user credential
//! - Share B: Plaintext stored on server (SSS math protects it - 1 share reveals nothing)
//! - Server combines shares JIT for signing, wipes immediately after
//! - Server NEVER stores seed or private key at rest

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// KDF parameters for Argon2id (stored as JSON in database)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct KdfParams {
    /// Memory cost in KiB
    pub m_cost: u32,
    /// Time cost (iterations)
    pub t_cost: u32,
    /// Parallelism
    pub p_cost: u32,
}

impl Default for KdfParams {
    fn default() -> Self {
        // OWASP recommended minimums for Argon2id
        Self {
            m_cost: 19456, // 19 MiB
            t_cost: 2,
            p_cost: 1,
        }
    }
}

/// Auth method for Share A encryption
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ShareAAuthMethod {
    /// Email users reuse login password (Argon2id KDF)
    Password,
    /// OAuth users create wallet PIN (Argon2id KDF)
    Pin,
    /// Users with passkey login use PRF extension (HKDF)
    Passkey,
    /// API key derives encryption key via Argon2id
    ApiKey,
}

impl std::fmt::Display for ShareAAuthMethod {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ShareAAuthMethod::Password => write!(f, "password"),
            ShareAAuthMethod::Pin => write!(f, "pin"),
            ShareAAuthMethod::Passkey => write!(f, "passkey"),
            ShareAAuthMethod::ApiKey => write!(f, "api_key"),
        }
    }
}

impl std::str::FromStr for ShareAAuthMethod {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "password" => Ok(ShareAAuthMethod::Password),
            "pin" => Ok(ShareAAuthMethod::Pin),
            "passkey" => Ok(ShareAAuthMethod::Passkey),
            "api_key" => Ok(ShareAAuthMethod::ApiKey),
            _ => Err(format!("Invalid auth method: {}", s)),
        }
    }
}

/// Solana wallet material entity (v2 - server-side signing)
#[derive(Debug, Clone)]
pub struct WalletMaterialEntity {
    pub id: Uuid,
    pub user_id: Uuid,

    /// Base58-encoded Solana public key
    pub solana_pubkey: String,

    /// Schema version (2 for server-side signing)
    pub scheme_version: i16,

    /// Auth method for Share A: password, pin, passkey, or api_key
    pub share_a_auth_method: ShareAAuthMethod,

    // Share A (encrypted with user credential)
    pub share_a_ciphertext: Vec<u8>,
    pub share_a_nonce: Vec<u8>,
    /// KDF salt for password/PIN/api_key methods (None for passkey)
    pub share_a_kdf_salt: Option<Vec<u8>>,
    /// KDF params for password/PIN/api_key methods (None for passkey)
    pub share_a_kdf_params: Option<KdfParams>,
    /// PRF salt for passkey method (None for password/PIN/api_key)
    pub prf_salt: Option<Vec<u8>>,
    /// PIN hash for PIN method (None for password/passkey/api_key)
    pub share_a_pin_hash: Option<String>,

    // Share B (plaintext - SSS math protects it)
    pub share_b: Vec<u8>,

    /// Optional API key FK (None = default/account-level wallet, Some = key-specific wallet)
    pub api_key_id: Option<Uuid>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Parameters for creating wallet material (v2)
#[derive(Debug, Clone)]
pub struct CreateWalletMaterial {
    pub user_id: Uuid,
    pub solana_pubkey: String,

    /// Auth method for Share A
    pub share_a_auth_method: ShareAAuthMethod,

    // Share A (encrypted)
    pub share_a_ciphertext: Vec<u8>,
    pub share_a_nonce: Vec<u8>,
    /// KDF salt for password/PIN/api_key methods
    pub share_a_kdf_salt: Option<Vec<u8>>,
    /// KDF params for password/PIN/api_key methods
    pub share_a_kdf_params: Option<KdfParams>,
    /// PRF salt for passkey method
    pub prf_salt: Option<Vec<u8>>,
    /// PIN hash for PIN method
    pub share_a_pin_hash: Option<String>,

    // Share B (plaintext)
    pub share_b: Vec<u8>,

    /// Optional API key ID (None = default wallet, Some = key-specific wallet)
    pub api_key_id: Option<Uuid>,
}

// Note: RotateDeviceShare removed in v2 - Share B is plaintext, no rotation needed

/// Parameters for rotating the user secret (re-encrypting Share A)
#[derive(Debug, Clone)]
pub struct RotateUserSecret {
    /// New auth method (can change methods)
    pub new_auth_method: ShareAAuthMethod,

    pub share_a_ciphertext: Vec<u8>,
    pub share_a_nonce: Vec<u8>,
    /// KDF salt for password/PIN methods
    pub share_a_kdf_salt: Option<Vec<u8>>,
    /// KDF params for password/PIN methods
    pub share_a_kdf_params: Option<KdfParams>,
    /// PRF salt for passkey method
    pub prf_salt: Option<Vec<u8>>,
    /// PIN hash for PIN method
    pub share_a_pin_hash: Option<String>,
}

/// Wallet material repository trait
#[async_trait]
pub trait WalletMaterialRepository: Send + Sync {
    /// Create wallet material for a user (enrollment)
    async fn create(
        &self,
        material: CreateWalletMaterial,
    ) -> Result<WalletMaterialEntity, AppError>;

    /// Find default wallet for user (api_key_id IS NULL)
    async fn find_default_by_user(
        &self,
        user_id: Uuid,
    ) -> Result<Option<WalletMaterialEntity>, AppError>;

    /// Find wallet material linked to a specific API key
    async fn find_by_api_key_id(
        &self,
        api_key_id: Uuid,
    ) -> Result<Option<WalletMaterialEntity>, AppError>;

    /// Find all wallets for a user (default + per-API-key)
    async fn find_all_by_user(&self, user_id: Uuid) -> Result<Vec<WalletMaterialEntity>, AppError>;

    /// Find wallet material by Solana public key
    async fn find_by_pubkey(&self, pubkey: &str) -> Result<Option<WalletMaterialEntity>, AppError>;

    /// Find wallet materials by Solana public keys.
    ///
    /// Used to avoid N+1 lookups in batch processing (e.g., webhooks).
    async fn find_by_pubkeys(
        &self,
        pubkeys: &[String],
    ) -> Result<Vec<WalletMaterialEntity>, AppError>;

    /// Check if user has a default wallet (backwards compat)
    async fn exists_for_user(&self, user_id: Uuid) -> Result<bool, AppError>;

    /// Atomically rotate user secret (re-encrypt Share A) on default wallet
    /// Used when user changes password/PIN or switches auth method
    async fn rotate_user_secret(
        &self,
        user_id: Uuid,
        params: RotateUserSecret,
    ) -> Result<WalletMaterialEntity, AppError>;

    /// Delete a specific wallet by ID (ownership verified by user_id)
    async fn delete_by_id(&self, wallet_id: Uuid, user_id: Uuid) -> Result<bool, AppError>;

    /// Delete all wallet material for a user (account deletion cascade)
    async fn delete_by_user(&self, user_id: Uuid) -> Result<(), AppError>;
}

/// In-memory wallet material repository for development/testing
pub struct InMemoryWalletMaterialRepository {
    // Lock ordering: always acquire `materials` before `pubkey_index` to prevent deadlocks
    materials: RwLock<HashMap<Uuid, WalletMaterialEntity>>,
    pubkey_index: RwLock<HashMap<String, Uuid>>,
}

impl InMemoryWalletMaterialRepository {
    pub fn new() -> Self {
        Self {
            materials: RwLock::new(HashMap::new()),
            pubkey_index: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryWalletMaterialRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl WalletMaterialRepository for InMemoryWalletMaterialRepository {
    async fn create(
        &self,
        material: CreateWalletMaterial,
    ) -> Result<WalletMaterialEntity, AppError> {
        let mut materials = self.materials.write().await;

        // Check uniqueness constraints
        if material.api_key_id.is_none() {
            // Default wallet: one per user
            let exists = materials
                .values()
                .any(|m| m.user_id == material.user_id && m.api_key_id.is_none());
            if exists {
                return Err(AppError::Validation(
                    "User already has a default wallet".into(),
                ));
            }
        } else {
            // API key wallet: one per api_key_id
            let exists = materials
                .values()
                .any(|m| m.api_key_id == material.api_key_id);
            if exists {
                return Err(AppError::Validation(
                    "Wallet already exists for this API key".into(),
                ));
            }
        }

        let mut pubkey_index = self.pubkey_index.write().await;
        if pubkey_index.contains_key(&material.solana_pubkey) {
            return Err(AppError::Validation(
                "Solana pubkey already registered".into(),
            ));
        }

        let now = Utc::now();
        let id = Uuid::new_v4();
        let entity = WalletMaterialEntity {
            id,
            user_id: material.user_id,
            solana_pubkey: material.solana_pubkey.clone(),
            scheme_version: 2,
            share_a_auth_method: material.share_a_auth_method,
            share_a_ciphertext: material.share_a_ciphertext,
            share_a_nonce: material.share_a_nonce,
            share_a_kdf_salt: material.share_a_kdf_salt,
            share_a_kdf_params: material.share_a_kdf_params,
            prf_salt: material.prf_salt,
            share_a_pin_hash: material.share_a_pin_hash,
            share_b: material.share_b,
            api_key_id: material.api_key_id,
            created_at: now,
            updated_at: now,
        };

        pubkey_index.insert(entity.solana_pubkey.clone(), id);
        materials.insert(id, entity.clone());

        Ok(entity)
    }

    async fn find_default_by_user(
        &self,
        user_id: Uuid,
    ) -> Result<Option<WalletMaterialEntity>, AppError> {
        let materials = self.materials.read().await;
        Ok(materials
            .values()
            .find(|m| m.user_id == user_id && m.api_key_id.is_none())
            .cloned())
    }

    async fn find_by_api_key_id(
        &self,
        api_key_id: Uuid,
    ) -> Result<Option<WalletMaterialEntity>, AppError> {
        let materials = self.materials.read().await;
        Ok(materials
            .values()
            .find(|m| m.api_key_id == Some(api_key_id))
            .cloned())
    }

    async fn find_all_by_user(&self, user_id: Uuid) -> Result<Vec<WalletMaterialEntity>, AppError> {
        let materials = self.materials.read().await;
        let mut result: Vec<_> = materials
            .values()
            .filter(|m| m.user_id == user_id)
            .cloned()
            .collect();
        result.sort_by_key(|m| m.created_at);
        Ok(result)
    }

    async fn find_by_pubkey(&self, pubkey: &str) -> Result<Option<WalletMaterialEntity>, AppError> {
        let pubkey_index = self.pubkey_index.read().await;
        let wallet_id = match pubkey_index.get(pubkey) {
            Some(id) => *id,
            None => return Ok(None),
        };
        drop(pubkey_index);

        let materials = self.materials.read().await;
        Ok(materials.get(&wallet_id).cloned())
    }

    async fn find_by_pubkeys(
        &self,
        pubkeys: &[String],
    ) -> Result<Vec<WalletMaterialEntity>, AppError> {
        if pubkeys.is_empty() {
            return Ok(Vec::new());
        }

        let materials = self.materials.read().await;
        let pubkey_index = self.pubkey_index.read().await;

        let mut out = Vec::new();
        for pubkey in pubkeys {
            if let Some(wallet_id) = pubkey_index.get(pubkey) {
                if let Some(material) = materials.get(wallet_id) {
                    out.push(material.clone());
                }
            }
        }
        Ok(out)
    }

    async fn exists_for_user(&self, user_id: Uuid) -> Result<bool, AppError> {
        let materials = self.materials.read().await;
        Ok(materials
            .values()
            .any(|m| m.user_id == user_id && m.api_key_id.is_none()))
    }

    async fn rotate_user_secret(
        &self,
        user_id: Uuid,
        params: RotateUserSecret,
    ) -> Result<WalletMaterialEntity, AppError> {
        let mut materials = self.materials.write().await;

        let material = materials
            .values_mut()
            .find(|m| m.user_id == user_id && m.api_key_id.is_none())
            .ok_or_else(|| AppError::NotFound("Wallet material not found".into()))?;

        material.share_a_auth_method = params.new_auth_method;
        material.share_a_ciphertext = params.share_a_ciphertext;
        material.share_a_nonce = params.share_a_nonce;
        material.share_a_kdf_salt = params.share_a_kdf_salt;
        material.share_a_kdf_params = params.share_a_kdf_params;
        material.prf_salt = params.prf_salt;
        material.share_a_pin_hash = params.share_a_pin_hash;
        material.updated_at = Utc::now();

        Ok(material.clone())
    }

    async fn delete_by_id(&self, wallet_id: Uuid, user_id: Uuid) -> Result<bool, AppError> {
        let mut materials = self.materials.write().await;

        if let Some(material) = materials.get(&wallet_id) {
            if material.user_id != user_id {
                return Ok(false);
            }
            let pubkey = material.solana_pubkey.clone();
            materials.remove(&wallet_id);
            let mut pubkey_index = self.pubkey_index.write().await;
            pubkey_index.remove(&pubkey);
            return Ok(true);
        }

        Ok(false)
    }

    async fn delete_by_user(&self, user_id: Uuid) -> Result<(), AppError> {
        let mut materials = self.materials.write().await;
        let mut pubkey_index = self.pubkey_index.write().await;

        let to_remove: Vec<Uuid> = materials
            .values()
            .filter(|m| m.user_id == user_id)
            .map(|m| m.id)
            .collect();

        for id in to_remove {
            if let Some(material) = materials.remove(&id) {
                pubkey_index.remove(&material.solana_pubkey);
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Create sample share_b: 33 bytes (1-byte share index + 32-byte value)
    fn sample_share_b() -> Vec<u8> {
        let mut share_b = vec![0x02]; // Share index (2 = share B)
        share_b.extend([0xaa; 32]); // 32-byte share value
        share_b
    }

    fn sample_create_material_password(user_id: Uuid) -> CreateWalletMaterial {
        CreateWalletMaterial {
            user_id,
            solana_pubkey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU".to_string(),
            share_a_auth_method: ShareAAuthMethod::Password,
            share_a_ciphertext: vec![1, 2, 3, 4, 5, 6, 7, 8],
            share_a_nonce: vec![0; 12],
            share_a_kdf_salt: Some(vec![0; 16]),
            share_a_kdf_params: Some(KdfParams::default()),
            prf_salt: None,
            share_a_pin_hash: None,
            share_b: sample_share_b(),
            api_key_id: None,
        }
    }

    fn sample_create_material_passkey(user_id: Uuid) -> CreateWalletMaterial {
        CreateWalletMaterial {
            user_id,
            solana_pubkey: "8xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV".to_string(),
            share_a_auth_method: ShareAAuthMethod::Passkey,
            share_a_ciphertext: vec![1, 2, 3, 4, 5, 6, 7, 8],
            share_a_nonce: vec![0; 12],
            share_a_kdf_salt: None,
            share_a_kdf_params: None,
            prf_salt: Some(vec![0xbb; 32]),
            share_a_pin_hash: None,
            share_b: sample_share_b(),
            api_key_id: None,
        }
    }

    #[tokio::test]
    async fn test_create_and_find_by_user() {
        let repo = InMemoryWalletMaterialRepository::new();
        let user_id = Uuid::new_v4();

        let material = repo
            .create(sample_create_material_password(user_id))
            .await
            .unwrap();
        assert_eq!(material.user_id, user_id);
        assert_eq!(material.scheme_version, 2);
        assert_eq!(material.share_a_auth_method, ShareAAuthMethod::Password);

        let found = repo.find_default_by_user(user_id).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().user_id, user_id);
    }

    #[tokio::test]
    async fn test_create_passkey_method() {
        let repo = InMemoryWalletMaterialRepository::new();
        let user_id = Uuid::new_v4();

        let material = repo
            .create(sample_create_material_passkey(user_id))
            .await
            .unwrap();
        assert_eq!(material.share_a_auth_method, ShareAAuthMethod::Passkey);
        assert!(material.prf_salt.is_some());
        assert!(material.share_a_kdf_salt.is_none());
    }

    #[tokio::test]
    async fn test_find_by_pubkey() {
        let repo = InMemoryWalletMaterialRepository::new();
        let user_id = Uuid::new_v4();

        let material = repo
            .create(sample_create_material_password(user_id))
            .await
            .unwrap();

        let found = repo.find_by_pubkey(&material.solana_pubkey).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().user_id, user_id);

        let not_found = repo.find_by_pubkey("nonexistent").await.unwrap();
        assert!(not_found.is_none());
    }

    #[tokio::test]
    async fn test_find_by_pubkeys_returns_matches() {
        let repo = InMemoryWalletMaterialRepository::new();
        let user1 = Uuid::new_v4();
        let user2 = Uuid::new_v4();

        let material1 = repo
            .create(sample_create_material_password(user1))
            .await
            .unwrap();
        let material2 = repo
            .create(sample_create_material_passkey(user2))
            .await
            .unwrap();

        let pubkeys = vec![
            material1.solana_pubkey.clone(),
            "missing".to_string(),
            material2.solana_pubkey.clone(),
        ];
        let found = repo.find_by_pubkeys(&pubkeys).await.unwrap();
        assert_eq!(found.len(), 2);
        assert!(found.iter().any(|m| m.user_id == user1));
        assert!(found.iter().any(|m| m.user_id == user2));
    }

    #[tokio::test]
    async fn test_duplicate_user_fails() {
        let repo = InMemoryWalletMaterialRepository::new();
        let user_id = Uuid::new_v4();

        repo.create(sample_create_material_password(user_id))
            .await
            .unwrap();

        let result = repo.create(sample_create_material_password(user_id)).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_duplicate_pubkey_fails() {
        let repo = InMemoryWalletMaterialRepository::new();
        let user1 = Uuid::new_v4();
        let user2 = Uuid::new_v4();

        repo.create(sample_create_material_password(user1))
            .await
            .unwrap();

        let mut material2 = sample_create_material_password(user2);
        material2.solana_pubkey = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU".to_string();

        let result = repo.create(material2).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_exists_for_user() {
        let repo = InMemoryWalletMaterialRepository::new();
        let user_id = Uuid::new_v4();

        assert!(!repo.exists_for_user(user_id).await.unwrap());

        repo.create(sample_create_material_password(user_id))
            .await
            .unwrap();

        assert!(repo.exists_for_user(user_id).await.unwrap());
    }

    #[tokio::test]
    async fn test_rotate_user_secret_change_method() {
        let repo = InMemoryWalletMaterialRepository::new();
        let user_id = Uuid::new_v4();

        repo.create(sample_create_material_password(user_id))
            .await
            .unwrap();

        // Switch from password to passkey
        let new_ciphertext = vec![0xca, 0xfe, 0xba, 0xbe];
        let new_nonce = vec![3; 12];
        let new_prf_salt = vec![0xee; 32];

        let updated = repo
            .rotate_user_secret(
                user_id,
                RotateUserSecret {
                    new_auth_method: ShareAAuthMethod::Passkey,
                    share_a_ciphertext: new_ciphertext.clone(),
                    share_a_nonce: new_nonce.clone(),
                    share_a_kdf_salt: None,
                    share_a_kdf_params: None,
                    prf_salt: Some(new_prf_salt.clone()),
                    share_a_pin_hash: None,
                },
            )
            .await
            .unwrap();

        assert_eq!(updated.share_a_auth_method, ShareAAuthMethod::Passkey);
        assert_eq!(updated.share_a_ciphertext, new_ciphertext);
        assert_eq!(updated.prf_salt, Some(new_prf_salt));
        assert!(updated.share_a_kdf_salt.is_none());
    }

    #[tokio::test]
    async fn test_rotate_nonexistent_fails() {
        let repo = InMemoryWalletMaterialRepository::new();
        let user_id = Uuid::new_v4();

        let result = repo
            .rotate_user_secret(
                user_id,
                RotateUserSecret {
                    new_auth_method: ShareAAuthMethod::Password,
                    share_a_ciphertext: vec![],
                    share_a_nonce: vec![],
                    share_a_kdf_salt: None,
                    share_a_kdf_params: None,
                    prf_salt: None,
                    share_a_pin_hash: None,
                },
            )
            .await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_delete_by_user() {
        let repo = InMemoryWalletMaterialRepository::new();
        let user_id = Uuid::new_v4();

        let material = repo
            .create(sample_create_material_password(user_id))
            .await
            .unwrap();
        let pubkey = material.solana_pubkey.clone();

        assert!(repo.exists_for_user(user_id).await.unwrap());
        assert!(repo.find_by_pubkey(&pubkey).await.unwrap().is_some());

        repo.delete_by_user(user_id).await.unwrap();

        assert!(!repo.exists_for_user(user_id).await.unwrap());
        assert!(repo.find_by_pubkey(&pubkey).await.unwrap().is_none());
    }

    #[tokio::test]
    async fn test_delete_nonexistent_succeeds() {
        let repo = InMemoryWalletMaterialRepository::new();
        let user_id = Uuid::new_v4();

        // Should not error on nonexistent user
        let result = repo.delete_by_user(user_id).await;
        assert!(result.is_ok());
    }
}
