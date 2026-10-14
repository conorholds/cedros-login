//! TOTP (Time-based One-Time Password) repository for MFA

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::domain::verify_recovery_code;
use crate::errors::AppError;

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
    /// Last used time step (Unix time / 30) for replay protection
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

/// Enrollment-bound management changes. Proof steps are consumed with the change.
pub enum TotpUpdate {
    RecordStep(i64),
    ReplaceRecoveryCodes {
        time_step: i64,
        hashes: Vec<String>,
    },
    /// Call only after consuming a factor for this enrollment.
    Disable,
}

/// TOTP repository trait
#[async_trait]
pub trait TotpRepository: Send + Sync {
    /// Create or update TOTP secret for a user
    async fn upsert_secret(&self, user_id: Uuid, secret: &str) -> Result<TotpSecret, AppError>;

    /// Atomically replace a pending enrollment and its recovery codes; never an enabled factor.
    async fn setup_factor(
        &self,
        _user_id: Uuid,
        _secret: &str,
        _hashes: Vec<String>,
    ) -> Result<(), AppError> {
        Err(AppError::ServiceUnavailable(
            "Atomic MFA enrollment is not supported by this repository".into(),
        ))
    }

    /// Enable exactly the enrollment whose proof was checked, recording that proof once.
    async fn enable_enrollment(
        &self,
        _user_id: Uuid,
        _enrollment_id: Uuid,
        _time_step: i64,
    ) -> Result<bool, AppError> {
        Err(AppError::ServiceUnavailable(
            "Atomic MFA enrollment is not supported by this repository".into(),
        ))
    }

    /// Mutate only the enabled enrollment whose proof was verified.
    async fn update_enrollment(
        &self,
        _user_id: Uuid,
        _enrollment_id: Uuid,
        _update: TotpUpdate,
    ) -> Result<bool, AppError> {
        Err(AppError::ServiceUnavailable(
            "Atomic MFA updates are not supported by this repository".into(),
        ))
    }

    /// Get TOTP secret for a user
    async fn find_by_user(&self, user_id: Uuid) -> Result<Option<TotpSecret>, AppError>;

    /// Enable MFA for a user (marks the secret as enabled)
    async fn enable_mfa(&self, user_id: Uuid) -> Result<(), AppError>;

    /// Disable MFA for a user (removes the secret)
    async fn disable_mfa(&self, user_id: Uuid) -> Result<(), AppError>;

    /// Check if user has MFA enabled
    async fn has_mfa_enabled(&self, user_id: Uuid) -> Result<bool, AppError>;

    /// Record the time step of a successfully verified TOTP code.
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
#[derive(Clone)]
pub struct InMemoryTotpRepository {
    pub(crate) secrets: Arc<RwLock<HashMap<Uuid, TotpSecret>>>,
    pub(crate) recovery_codes: Arc<RwLock<HashMap<Uuid, Vec<RecoveryCode>>>>,
}

impl InMemoryTotpRepository {
    async fn consume_verified_code(
        &self,
        user_id: Uuid,
        candidate: &RecoveryCode,
    ) -> Result<bool, AppError> {
        let mut codes = self.recovery_codes.write().await;
        let current = codes.get_mut(&user_id).and_then(|codes| {
            codes.iter_mut().find(|code| {
                code.id == candidate.id && code.code_hash == candidate.code_hash && !code.used
            })
        });
        if let Some(code) = current {
            code.used = true;
            code.used_at = Some(Utc::now());
            return Ok(true);
        }
        Ok(false)
    }

    pub fn new() -> Self {
        Self {
            secrets: Arc::new(RwLock::new(HashMap::new())),
            recovery_codes: Arc::new(RwLock::new(HashMap::new())),
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
        if secrets.get(&user_id).is_some_and(|factor| factor.enabled) {
            return Err(AppError::Validation("MFA is already enabled".into()));
        }

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

    async fn setup_factor(
        &self,
        user_id: Uuid,
        secret: &str,
        hashes: Vec<String>,
    ) -> Result<(), AppError> {
        let mut secrets = self.secrets.write().await;
        if secrets.get(&user_id).is_some_and(|factor| factor.enabled) {
            return Err(AppError::Validation("MFA is already enabled".into()));
        }
        // Keep the same secrets -> recovery lock order as disable and login.
        self.store_recovery_codes(user_id, hashes).await?;
        secrets.insert(
            user_id,
            TotpSecret {
                id: Uuid::new_v4(),
                user_id,
                secret: secret.into(),
                enabled: false,
                created_at: Utc::now(),
                enabled_at: None,
                last_used_time_step: None,
            },
        );
        Ok(())
    }

    async fn enable_enrollment(
        &self,
        user_id: Uuid,
        enrollment_id: Uuid,
        time_step: i64,
    ) -> Result<bool, AppError> {
        let mut secrets = self.secrets.write().await;
        let Some(secret) = secrets.get_mut(&user_id).filter(|s| {
            s.id == enrollment_id
                && !s.enabled
                && s.last_used_time_step.is_none_or(|last| time_step > last)
        }) else {
            return Ok(false);
        };
        secret.enabled = true;
        secret.enabled_at = Some(Utc::now());
        secret.last_used_time_step = Some(time_step);
        Ok(true)
    }

    async fn update_enrollment(
        &self,
        user_id: Uuid,
        enrollment_id: Uuid,
        update: TotpUpdate,
    ) -> Result<bool, AppError> {
        let mut secrets = self.secrets.write().await;
        let Some(secret) = secrets
            .get_mut(&user_id)
            .filter(|s| s.id == enrollment_id && s.enabled)
        else {
            return Ok(false);
        };
        let step = match &update {
            TotpUpdate::RecordStep(step)
            | TotpUpdate::ReplaceRecoveryCodes {
                time_step: step, ..
            } => Some(*step),
            TotpUpdate::Disable => None,
        };
        if let Some(step) = step {
            if secret.last_used_time_step.is_some_and(|last| step <= last) {
                return Ok(false);
            }
            secret.last_used_time_step = Some(step);
        }
        match update {
            TotpUpdate::ReplaceRecoveryCodes { hashes, .. } => {
                self.store_recovery_codes(user_id, hashes).await?
            }
            TotpUpdate::Disable => {
                secrets.remove(&user_id);
                self.recovery_codes.write().await.remove(&user_id);
            }
            TotpUpdate::RecordStep(_) => {}
        }
        Ok(true)
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
        let candidates = self.get_recovery_codes(user_id).await?;
        let code = code.to_owned();
        let matched = crate::services::cpu_work::auth(move || {
            let mut matched = None;
            // Verify every candidate, never exit on the first match.
            for candidate in candidates {
                if verify_recovery_code(&code, &candidate.code_hash) {
                    matched = Some(candidate);
                }
            }
            Ok(matched)
        })
        .await?;
        let Some(candidate) = matched else {
            return Ok(false);
        };
        self.consume_verified_code(user_id, &candidate).await
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
    use crate::domain::hash_recovery_code;

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
            hash_recovery_code(code1).unwrap(),
            hash_recovery_code(code2).unwrap(),
            hash_recovery_code(code3).unwrap(),
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
        let hashes = vec![hash_recovery_code(code).unwrap()];
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
        let hashes = vec![hash_recovery_code("ABCD-1234").unwrap()];
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

#[cfg(test)]
mod consume_race_tests {
    use super::*;

    #[tokio::test]
    async fn stale_verified_snapshot_cannot_consume_replaced_or_deleted_codes() {
        let repo = InMemoryTotpRepository::new();
        let user = Uuid::new_v4();
        repo.store_recovery_codes(user, vec!["hash".into()])
            .await
            .unwrap();
        let old = repo.get_recovery_codes(user).await.unwrap().remove(0);
        // Even reusing the same hash must not resurrect an old row identity.
        repo.store_recovery_codes(user, vec!["hash".into()])
            .await
            .unwrap();
        assert!(!repo.consume_verified_code(user, &old).await.unwrap());
        let current = repo.get_recovery_codes(user).await.unwrap().remove(0);
        let (a, b) = tokio::join!(
            repo.consume_verified_code(user, &current),
            repo.consume_verified_code(user, &current)
        );
        assert_eq!(u8::from(a.unwrap()) + u8::from(b.unwrap()), 1);
        repo.delete_recovery_codes(user).await.unwrap();
        assert!(!repo.consume_verified_code(user, &current).await.unwrap());
    }
    #[tokio::test]
    async fn enrollment_replacement_and_enablement_are_version_bound() {
        let repo = InMemoryTotpRepository::new();
        let user = Uuid::new_v4();
        repo.setup_factor(user, "old", vec!["old-hash".into()])
            .await
            .unwrap();
        let old = repo.find_by_user(user).await.unwrap().unwrap();
        repo.setup_factor(user, "new", vec!["new-hash".into()])
            .await
            .unwrap();
        let new = repo.find_by_user(user).await.unwrap().unwrap();
        assert!(!repo.enable_enrollment(user, old.id, 10).await.unwrap());
        assert!(repo.enable_enrollment(user, new.id, 10).await.unwrap());
        assert!(!repo.enable_enrollment(user, new.id, 10).await.unwrap());
        assert!(repo.setup_factor(user, "attacker", vec![]).await.is_err());
        assert!(repo.upsert_secret(user, "attacker").await.is_err());
        assert_eq!(
            repo.find_by_user(user).await.unwrap().unwrap().secret,
            "new"
        );
        assert_eq!(
            repo.get_recovery_codes(user).await.unwrap()[0].code_hash,
            "new-hash"
        );
    }
    #[tokio::test]
    async fn stale_enrollment_cannot_step_up_disable_or_replace_recovery_codes() {
        let repo = InMemoryTotpRepository::new();
        let user = Uuid::new_v4();
        repo.setup_factor(user, "old", vec![]).await.unwrap();
        let old = repo.find_by_user(user).await.unwrap().unwrap().id;
        repo.setup_factor(user, "new", vec!["current".into()])
            .await
            .unwrap();
        let current = repo.find_by_user(user).await.unwrap().unwrap().id;
        assert!(repo.enable_enrollment(user, current, 10).await.unwrap());
        for update in [
            TotpUpdate::RecordStep(11),
            TotpUpdate::Disable,
            TotpUpdate::ReplaceRecoveryCodes {
                time_step: 11,
                hashes: vec!["attacker".into()],
            },
        ] {
            assert!(!repo.update_enrollment(user, old, update).await.unwrap());
        }
        assert_eq!(
            repo.get_recovery_codes(user).await.unwrap()[0].code_hash,
            "current"
        );
        assert!(repo
            .update_enrollment(
                user,
                current,
                TotpUpdate::ReplaceRecoveryCodes {
                    time_step: 11,
                    hashes: vec!["replacement".into()]
                }
            )
            .await
            .unwrap());
        assert!(!repo
            .update_enrollment(user, current, TotpUpdate::RecordStep(11))
            .await
            .unwrap());
        assert_eq!(
            repo.get_recovery_codes(user).await.unwrap()[0].code_hash,
            "replacement"
        );
        assert!(repo
            .update_enrollment(user, current, TotpUpdate::Disable)
            .await
            .unwrap());
        assert!(repo.find_by_user(user).await.unwrap().is_none());
        assert!(repo.get_recovery_codes(user).await.unwrap().is_empty());
    }
}
