//! TOTP (Time-based One-Time Password) repository for MFA

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;
use crate::services::TotpService;

/// TOTP secret entity
#[derive(Debug, Clone)]
pub struct TotpSecret {
    pub id: Uuid,
    pub user_id: Uuid,
    /// Base32-encoded TOTP secret
    pub secret: String,
    /// Whether MFA is enabled for this user
    pub enabled: bool,
    /// When the secret was created
    pub created_at: DateTime<Utc>,
    /// When MFA was enabled (None if not yet enabled)
    pub enabled_at: Option<DateTime<Utc>>,
    /// S-14: Last used time step (Unix time / 30) for replay protection
    pub last_used_time_step: Option<i64>,
}

/// Recovery code entity
#[derive(Debug, Clone)]
pub struct RecoveryCode {
    pub id: Uuid,
    pub user_id: Uuid,
    /// Argon2id hash of the recovery code
    pub code_hash: String,
    /// Whether this code has been used
    pub used: bool,
    /// When it was created
    pub created_at: DateTime<Utc>,
    /// When it was used (if applicable)
    pub used_at: Option<DateTime<Utc>>,
}

/// TOTP repository trait
#[async_trait]
pub trait TotpRepository: Send + Sync {
    /// Create or update TOTP secret for a user
    async fn upsert_secret(&self, user_id: Uuid, secret: &str) -> Result<TotpSecret, AppError>;

    /// Get TOTP secret for a user
    async fn find_by_user(&self, user_id: Uuid) -> Result<Option<TotpSecret>, AppError>;

    /// Enable MFA for a user (marks the secret as enabled)
    async fn enable_mfa(&self, user_id: Uuid) -> Result<(), AppError>;

    /// Disable MFA for a user (removes the secret)
    async fn disable_mfa(&self, user_id: Uuid) -> Result<(), AppError>;

    /// Check if user has MFA enabled
    async fn has_mfa_enabled(&self, user_id: Uuid) -> Result<bool, AppError>;

    /// S-14: Record the time step of a successfully verified TOTP code.
    /// Returns true only if the time step is newer than any previously recorded value.
    async fn record_used_time_step_if_newer(
        &self,
        user_id: Uuid,
        time_step: i64,
    ) -> Result<bool, AppError>;

    /// Store recovery codes for a user (replaces existing)
    async fn store_recovery_codes(
        &self,
        user_id: Uuid,
        code_hashes: Vec<String>,
    ) -> Result<(), AppError>;

    /// Get unused recovery codes for a user
    async fn get_recovery_codes(&self, user_id: Uuid) -> Result<Vec<RecoveryCode>, AppError>;

    /// Use a recovery code (verifies against stored hashes and marks as used)
    ///
    /// # Arguments
    /// * `user_id` - The user attempting to use a recovery code
    /// * `code` - The plaintext recovery code to verify (not the hash)
    ///
    /// # Returns
    /// * `Ok(true)` if the code was valid and has been marked as used
    /// * `Ok(false)` if the code was invalid or already used
    async fn use_recovery_code(&self, user_id: Uuid, code: &str) -> Result<bool, AppError>;

    /// Delete all recovery codes for a user
    async fn delete_recovery_codes(&self, user_id: Uuid) -> Result<(), AppError>;
}

/// In-memory TOTP repository
pub struct InMemoryTotpRepository {
    secrets: RwLock<HashMap<Uuid, TotpSecret>>,
    recovery_codes: RwLock<HashMap<Uuid, Vec<RecoveryCode>>>,
}

impl InMemoryTotpRepository {
    pub fn new() -> Self {
        Self {
            secrets: RwLock::new(HashMap::new()),
            recovery_codes: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryTotpRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl TotpRepository for InMemoryTotpRepository {
    async fn upsert_secret(&self, user_id: Uuid, secret: &str) -> Result<TotpSecret, AppError> {
        let mut secrets = self.secrets.write().await;

        let totp_secret = TotpSecret {
            id: Uuid::new_v4(),
            user_id,
            secret: secret.to_string(),
            enabled: false,
            created_at: Utc::now(),
            enabled_at: None,
            last_used_time_step: None,
        };

        secrets.insert(user_id, totp_secret.clone());
        Ok(totp_secret)
    }

    async fn find_by_user(&self, user_id: Uuid) -> Result<Option<TotpSecret>, AppError> {
        let secrets = self.secrets.read().await;

        Ok(secrets.get(&user_id).cloned())
    }

    async fn enable_mfa(&self, user_id: Uuid) -> Result<(), AppError> {
        let mut secrets = self.secrets.write().await;

        if let Some(secret) = secrets.get_mut(&user_id) {
            secret.enabled = true;
            secret.enabled_at = Some(Utc::now());
            Ok(())
        } else {
            Err(AppError::NotFound("TOTP secret not found".into()))
        }
    }

    async fn disable_mfa(&self, user_id: Uuid) -> Result<(), AppError> {
        let mut secrets = self.secrets.write().await;

        secrets.remove(&user_id);

        // Also remove recovery codes
        let mut codes = self.recovery_codes.write().await;
        codes.remove(&user_id);

        Ok(())
    }

    async fn has_mfa_enabled(&self, user_id: Uuid) -> Result<bool, AppError> {
        let secrets = self.secrets.read().await;

        Ok(secrets.get(&user_id).map(|s| s.enabled).unwrap_or(false))
    }

    async fn record_used_time_step_if_newer(
        &self,
        user_id: Uuid,
        time_step: i64,
    ) -> Result<bool, AppError> {
        let mut secrets = self.secrets.write().await;

        if let Some(secret) = secrets.get_mut(&user_id) {
            let should_update = secret
                .last_used_time_step
                .map(|last| time_step > last)
                .unwrap_or(true);
            if should_update {
                secret.last_used_time_step = Some(time_step);
            }
            Ok(should_update)
        } else {
            Err(AppError::NotFound("TOTP secret not found".into()))
        }
    }

    async fn store_recovery_codes(
        &self,
        user_id: Uuid,
        code_hashes: Vec<String>,
    ) -> Result<(), AppError> {
        let mut codes = self.recovery_codes.write().await;

        let now = Utc::now();
        let recovery_codes: Vec<RecoveryCode> = code_hashes
            .into_iter()
            .map(|hash| RecoveryCode {
                id: Uuid::new_v4(),
                user_id,
                code_hash: hash,
                used: false,
                created_at: now,
                used_at: None,
            })
            .collect();

        codes.insert(user_id, recovery_codes);
        Ok(())
    }

    async fn get_recovery_codes(&self, user_id: Uuid) -> Result<Vec<RecoveryCode>, AppError> {
        let codes = self.recovery_codes.read().await;

        Ok(codes
            .get(&user_id)
            .map(|c| c.iter().filter(|code| !code.used).cloned().collect())
            .unwrap_or_default())
    }

    async fn use_recovery_code(&self, user_id: Uuid, code: &str) -> Result<bool, AppError> {
        let mut codes = self.recovery_codes.write().await;

        if let Some(user_codes) = codes.get_mut(&user_id) {
            // Verify the plaintext code against each stored Argon2id hash.
            // Argon2 verification is already constant-time.
            // We check all unused codes to maintain consistent timing.
            let mut matched_idx: Option<usize> = None;
            for (idx, stored_code) in user_codes.iter().enumerate() {
                if !stored_code.used {
                    // Use Argon2id verification (constant-time)
                    if TotpService::verify_recovery_code(code, &stored_code.code_hash) {
                        matched_idx = Some(idx);
                        // Don't break early - continue checking to maintain constant time
                    }
                }
            }

            if let Some(idx) = matched_idx {
                user_codes[idx].used = true;
                user_codes[idx].used_at = Some(Utc::now());
                return Ok(true);
            }
        }

        Ok(false)
    }

    async fn delete_recovery_codes(&self, user_id: Uuid) -> Result<(), AppError> {
        let mut codes = self.recovery_codes.write().await;

        codes.remove(&user_id);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_and_enable_mfa() {
        let repo = InMemoryTotpRepository::new();
        let user_id = Uuid::new_v4();

        // Create secret
        let secret = repo
            .upsert_secret(user_id, "JBSWY3DPEHPK3PXP")
            .await
            .unwrap();
        assert!(!secret.enabled);

        // Check not enabled yet
        assert!(!repo.has_mfa_enabled(user_id).await.unwrap());

        // Enable MFA
        repo.enable_mfa(user_id).await.unwrap();
        assert!(repo.has_mfa_enabled(user_id).await.unwrap());
    }

    #[tokio::test]
    async fn test_disable_mfa() {
        let repo = InMemoryTotpRepository::new();
        let user_id = Uuid::new_v4();

        repo.upsert_secret(user_id, "JBSWY3DPEHPK3PXP")
            .await
            .unwrap();
        repo.enable_mfa(user_id).await.unwrap();
        assert!(repo.has_mfa_enabled(user_id).await.unwrap());

        repo.disable_mfa(user_id).await.unwrap();
        assert!(!repo.has_mfa_enabled(user_id).await.unwrap());
    }

    #[tokio::test]
    async fn test_recovery_codes() {
        let repo = InMemoryTotpRepository::new();
        let user_id = Uuid::new_v4();

        // Create Argon2id hashes for test codes
        let code1 = "ABCD-1234";
        let code2 = "EFGH-5678";
        let code3 = "IJKL-9012";
        let hashes = vec![
            TotpService::hash_recovery_code(code1).unwrap(),
            TotpService::hash_recovery_code(code2).unwrap(),
            TotpService::hash_recovery_code(code3).unwrap(),
        ];
        repo.store_recovery_codes(user_id, hashes).await.unwrap();

        let codes = repo.get_recovery_codes(user_id).await.unwrap();
        assert_eq!(codes.len(), 3);

        // Use one code with plaintext
        assert!(repo.use_recovery_code(user_id, code1).await.unwrap());
        assert!(!repo.use_recovery_code(user_id, code1).await.unwrap()); // Can't reuse

        let codes = repo.get_recovery_codes(user_id).await.unwrap();
        assert_eq!(codes.len(), 2);

        // Wrong code should fail
        assert!(!repo.use_recovery_code(user_id, "WRONG-CODE").await.unwrap());
    }

    #[tokio::test]
    async fn test_recovery_code_case_insensitive() {
        let repo = InMemoryTotpRepository::new();
        let user_id = Uuid::new_v4();

        // Store hash for uppercase code
        let code = "ABCD-1234";
        let hashes = vec![TotpService::hash_recovery_code(code).unwrap()];
        repo.store_recovery_codes(user_id, hashes).await.unwrap();

        // Verify works with different case/format
        assert!(repo.use_recovery_code(user_id, "abcd-1234").await.unwrap());
    }

    #[tokio::test]
    async fn test_disable_mfa_removes_recovery_codes() {
        let repo = InMemoryTotpRepository::new();
        let user_id = Uuid::new_v4();

        repo.upsert_secret(user_id, "JBSWY3DPEHPK3PXP")
            .await
            .unwrap();
        let hashes = vec![TotpService::hash_recovery_code("ABCD-1234").unwrap()];
        repo.store_recovery_codes(user_id, hashes).await.unwrap();

        assert_eq!(repo.get_recovery_codes(user_id).await.unwrap().len(), 1);

        repo.disable_mfa(user_id).await.unwrap();
        assert_eq!(repo.get_recovery_codes(user_id).await.unwrap().len(), 0);
    }

    #[tokio::test]
    async fn test_record_used_time_step_if_newer() {
        let repo = InMemoryTotpRepository::new();
        let user_id = Uuid::new_v4();

        repo.upsert_secret(user_id, "JBSWY3DPEHPK3PXP")
            .await
            .unwrap();

        assert!(repo
            .record_used_time_step_if_newer(user_id, 100)
            .await
            .unwrap());
        assert!(!repo
            .record_used_time_step_if_newer(user_id, 100)
            .await
            .unwrap());
        assert!(!repo
            .record_used_time_step_if_newer(user_id, 99)
            .await
            .unwrap());
        assert!(repo
            .record_used_time_step_if_newer(user_id, 101)
            .await
            .unwrap());
    }

    #[tokio::test]
    async fn test_record_used_time_step_if_newer_concurrent() {
        let repo = InMemoryTotpRepository::new();
        let user_id = Uuid::new_v4();

        repo.upsert_secret(user_id, "JBSWY3DPEHPK3PXP")
            .await
            .unwrap();

        let (first, second) = tokio::join!(
            repo.record_used_time_step_if_newer(user_id, 200),
            repo.record_used_time_step_if_newer(user_id, 200)
        );

        let first = first.unwrap();
        let second = second.unwrap();
        assert_ne!(first, second);
    }
}
