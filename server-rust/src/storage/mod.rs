//! Storage layer with support for multiple backends

use chrono::{Duration as ChronoDuration, Utc};
use std::sync::Arc;
use std::time::Duration;
use tokio::task::JoinHandle;
use tracing::{debug, error, info};

use crate::config::DatabaseConfig;
use crate::errors::AppError;
use crate::repositories::{
    ApiKeyRepository, AuditLogRepository, CredentialRepository, CreditHoldRepository,
    CreditRefundRequestRepository, CreditRepository, CustomRoleRepository, DepositRepository,
    InMemoryApiKeyRepository, InMemoryAuditLogRepository, InMemoryCredentialRepository,
    InMemoryCreditHoldRepository, InMemoryCreditRefundRequestRepository, InMemoryCreditRepository,
    InMemoryCustomRoleRepository, InMemoryDepositRepository, InMemoryInviteRepository,
    InMemoryLoginAttemptRepository, InMemoryMembershipRepository, InMemoryNonceRepository,
    InMemoryOrgRepository, InMemoryOutboxRepository, InMemoryPendingWalletRecoveryRepository,
    InMemoryPolicyRepository, InMemoryPrivacyNoteRepository, InMemorySessionRepository,
    InMemorySsoRepository, InMemorySystemSettingsRepository, InMemoryTotpRepository,
    InMemoryTreasuryConfigRepository, InMemoryUserRepository, InMemoryUserWithdrawalLogRepository,
    InMemoryVerificationRepository, InMemoryWalletMaterialRepository, InMemoryWebAuthnRepository,
    InMemoryWithdrawalHistoryRepository, InviteRepository, LoginAttemptRepository,
    MembershipRepository, NonceRepository, OrgRepository, OutboxRepository,
    PendingWalletRecoveryRepository, PolicyRepository, PrivacyNoteRepository, SessionRepository,
    SsoRepository, SystemSettingsRepository, TotpRepository, TreasuryConfigRepository,
    UserRepository, UserWithdrawalLogRepository, VerificationRepository, WalletMaterialRepository,
    WebAuthnRepository, WithdrawalHistoryRepository,
};
use crate::services::EncryptionService;

#[cfg(feature = "postgres")]
use crate::repositories::{
    PostgresApiKeyRepository, PostgresAuditLogRepository, PostgresCredentialRepository,
    PostgresCreditHoldRepository, PostgresCreditRefundRequestRepository, PostgresCreditRepository,
    PostgresCustomRoleRepository, PostgresDepositRepository, PostgresInviteRepository,
    PostgresLoginAttemptRepository, PostgresMembershipRepository, PostgresNonceRepository,
    PostgresOrgRepository, PostgresOutboxRepository, PostgresPendingWalletRecoveryRepository,
    PostgresPolicyRepository, PostgresPrivacyNoteRepository, PostgresSessionRepository,
    PostgresSsoRepository, PostgresSystemSettingsRepository, PostgresTotpRepository,
    PostgresTreasuryConfigRepository, PostgresUserRepository, PostgresUserWithdrawalLogRepository,
    PostgresVerificationRepository, PostgresWalletMaterialRepository, PostgresWebAuthnRepository,
    PostgresWithdrawalHistoryRepository,
};

#[cfg(feature = "postgres")]
use sqlx::postgres::PgPoolOptions;
#[cfg(feature = "postgres")]
use sqlx::PgPool;

/// Storage backend containing all repositories
#[derive(Clone)]
pub struct Storage {
    pub user_repo: Arc<dyn UserRepository>,
    pub session_repo: Arc<dyn SessionRepository>,
    pub nonce_repo: Arc<dyn NonceRepository>,
    pub verification_repo: Arc<dyn VerificationRepository>,
    pub org_repo: Arc<dyn OrgRepository>,
    pub membership_repo: Arc<dyn MembershipRepository>,
    pub invite_repo: Arc<dyn InviteRepository>,
    pub audit_repo: Arc<dyn AuditLogRepository>,
    pub login_attempt_repo: Arc<dyn LoginAttemptRepository>,
    pub totp_repo: Arc<dyn TotpRepository>,
    pub custom_role_repo: Arc<dyn CustomRoleRepository>,
    pub policy_repo: Arc<dyn PolicyRepository>,
    pub outbox_repo: Arc<dyn OutboxRepository>,
    pub api_key_repo: Arc<dyn ApiKeyRepository>,
    pub wallet_material_repo: Arc<dyn WalletMaterialRepository>,
    pub credential_repo: Arc<dyn CredentialRepository>,
    pub webauthn_repo: Arc<dyn WebAuthnRepository>,
    pub sso_repo: Arc<dyn SsoRepository>,
    pub deposit_repo: Arc<dyn DepositRepository>,
    pub credit_repo: Arc<dyn CreditRepository>,
    pub credit_hold_repo: Arc<dyn CreditHoldRepository>,
    pub credit_refund_request_repo: Arc<dyn CreditRefundRequestRepository>,
    pub privacy_note_repo: Arc<dyn PrivacyNoteRepository>,
    pub system_settings_repo: Arc<dyn SystemSettingsRepository>,
    pub treasury_config_repo: Arc<dyn TreasuryConfigRepository>,
    pub withdrawal_history_repo: Arc<dyn WithdrawalHistoryRepository>,
    pub user_withdrawal_log_repo: Arc<dyn UserWithdrawalLogRepository>,
    pub pending_wallet_recovery_repo: Arc<dyn PendingWalletRecoveryRepository>,
    #[cfg(feature = "postgres")]
    pub pg_pool: Option<PgPool>,
}

impl Storage {
    /// Get the credential repository
    pub fn credential_repository(&self) -> &dyn CredentialRepository {
        self.credential_repo.as_ref()
    }

    /// Get the WebAuthn repository
    pub fn webauthn_repository(&self) -> &Arc<dyn WebAuthnRepository> {
        &self.webauthn_repo
    }

    /// Get the SSO repository
    pub fn sso_repository(&self) -> &Arc<dyn SsoRepository> {
        &self.sso_repo
    }

    /// Create in-memory storage (for development/testing)
    pub fn in_memory() -> Self {
        // Build the credit repository first so the hold repository can share it.
        // This allows `capture_hold` to deduct the balance atomically, mirroring
        // what the Postgres implementation does inside a single DB transaction.
        let credit_repo: Arc<dyn CreditRepository> = Arc::new(InMemoryCreditRepository::new());
        let credit_hold_repo: Arc<dyn CreditHoldRepository> = Arc::new(
            InMemoryCreditHoldRepository::with_credit_repo(Arc::clone(&credit_repo)),
        );

        Self {
            user_repo: Arc::new(InMemoryUserRepository::new()),
            session_repo: Arc::new(InMemorySessionRepository::new()),
            nonce_repo: Arc::new(InMemoryNonceRepository::new()),
            verification_repo: Arc::new(InMemoryVerificationRepository::new()),
            org_repo: Arc::new(InMemoryOrgRepository::new()),
            membership_repo: Arc::new(InMemoryMembershipRepository::new()),
            invite_repo: Arc::new(InMemoryInviteRepository::new()),
            audit_repo: Arc::new(InMemoryAuditLogRepository::new()),
            login_attempt_repo: Arc::new(InMemoryLoginAttemptRepository::new()),
            totp_repo: Arc::new(InMemoryTotpRepository::new()),
            custom_role_repo: Arc::new(InMemoryCustomRoleRepository::new()),
            policy_repo: Arc::new(InMemoryPolicyRepository::new()),
            outbox_repo: Arc::new(InMemoryOutboxRepository::new()),
            api_key_repo: Arc::new(InMemoryApiKeyRepository::new()),
            wallet_material_repo: Arc::new(InMemoryWalletMaterialRepository::new()),
            credential_repo: Arc::new(InMemoryCredentialRepository::new()),
            webauthn_repo: Arc::new(InMemoryWebAuthnRepository::new()),
            sso_repo: Arc::new(InMemorySsoRepository::new()),
            deposit_repo: Arc::new(InMemoryDepositRepository::new()),
            credit_repo,
            credit_hold_repo,
            credit_refund_request_repo: Arc::new(InMemoryCreditRefundRequestRepository::new()),
            privacy_note_repo: Arc::new(InMemoryPrivacyNoteRepository::new()),
            system_settings_repo: Arc::new(InMemorySystemSettingsRepository::with_defaults()),
            treasury_config_repo: Arc::new(InMemoryTreasuryConfigRepository::new()),
            withdrawal_history_repo: Arc::new(InMemoryWithdrawalHistoryRepository::new()),
            user_withdrawal_log_repo: Arc::new(InMemoryUserWithdrawalLogRepository::new()),
            pending_wallet_recovery_repo: Arc::new(InMemoryPendingWalletRecoveryRepository::new()),
            #[cfg(feature = "postgres")]
            pg_pool: None,
        }
    }

    /// Create storage from configuration
    /// Uses Postgres if DATABASE_URL is set, otherwise falls back to in-memory
    #[cfg(feature = "postgres")]
    pub async fn from_config(config: &DatabaseConfig) -> Result<Self, AppError> {
        if let Some(url) = &config.url {
            Self::postgres(url, config).await
        } else {
            Ok(Self::in_memory())
        }
    }

    /// Create storage from configuration (no-postgres fallback)
    #[cfg(not(feature = "postgres"))]
    pub async fn from_config(_config: &DatabaseConfig) -> Result<Self, AppError> {
        Ok(Self::in_memory())
    }

    /// Create PostgreSQL storage by connecting to the given URL.
    #[cfg(feature = "postgres")]
    pub async fn postgres(url: &str, config: &DatabaseConfig) -> Result<Self, AppError> {
        let pool = PgPoolOptions::new()
            .max_connections(config.max_connections)
            .min_connections(config.min_connections)
            .acquire_timeout(Duration::from_secs(config.connect_timeout_secs))
            .idle_timeout(Duration::from_secs(config.idle_timeout_secs))
            // SRV-14: Set per-connection statement timeout to prevent runaway queries
            .after_connect(|conn, _meta| {
                Box::pin(async move {
                    sqlx::query("SET statement_timeout = '30s'")
                        .execute(&mut *conn)
                        .await?;
                    Ok(())
                })
            })
            .connect(url)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Self::postgres_with_pool(pool).await
    }

    /// Create PostgreSQL storage from an existing connection pool.
    ///
    /// Use this when you already have a `PgPool` (e.g. shared with other
    /// services) instead of creating a second pool to the same database.
    /// Runs pending migrations automatically.
    #[cfg(feature = "postgres")]
    pub async fn postgres_with_pool(pool: PgPool) -> Result<Self, AppError> {
        // Run database migrations automatically so library consumers
        // don't need a separate migration step.
        // ignore_missing = true so we don't choke on migration entries
        // from the host app or other embedded packages sharing the DB.
        let mut migrator = sqlx::migrate!();
        migrator.set_ignore_missing(true);
        migrator
            .run(&pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        let totp_secret = select_totp_encryption_secret()?;
        let totp_repo: Arc<dyn TotpRepository> = Arc::new(PostgresTotpRepository::with_encryption(
            pool.clone(),
            Arc::new(EncryptionService::from_secret(&totp_secret)),
        ));

        Ok(Self {
            user_repo: Arc::new(PostgresUserRepository::new(pool.clone())),
            session_repo: Arc::new(PostgresSessionRepository::new(pool.clone())),
            nonce_repo: Arc::new(PostgresNonceRepository::new(pool.clone())),
            verification_repo: Arc::new(PostgresVerificationRepository::new(pool.clone())),
            org_repo: Arc::new(PostgresOrgRepository::new(pool.clone())),
            membership_repo: Arc::new(PostgresMembershipRepository::new(pool.clone())),
            invite_repo: Arc::new(PostgresInviteRepository::new(pool.clone())),
            audit_repo: Arc::new(PostgresAuditLogRepository::new(pool.clone())),
            outbox_repo: Arc::new(PostgresOutboxRepository::new(pool.clone())),
            login_attempt_repo: Arc::new(PostgresLoginAttemptRepository::new(pool.clone())),
            totp_repo,
            custom_role_repo: Arc::new(PostgresCustomRoleRepository::new(pool.clone())),
            policy_repo: Arc::new(PostgresPolicyRepository::new(pool.clone())),
            api_key_repo: Arc::new(PostgresApiKeyRepository::new(pool.clone())),
            wallet_material_repo: Arc::new(PostgresWalletMaterialRepository::new(pool.clone())),
            credential_repo: Arc::new(PostgresCredentialRepository::new(pool.clone())),
            webauthn_repo: Arc::new(PostgresWebAuthnRepository::new(pool.clone())),
            sso_repo: Arc::new(PostgresSsoRepository::new(pool.clone())),
            deposit_repo: Arc::new(PostgresDepositRepository::new(pool.clone())),
            credit_repo: Arc::new(PostgresCreditRepository::new(pool.clone())),
            credit_hold_repo: Arc::new(PostgresCreditHoldRepository::new(pool.clone())),
            credit_refund_request_repo: Arc::new(PostgresCreditRefundRequestRepository::new(
                pool.clone(),
            )),
            privacy_note_repo: Arc::new(PostgresPrivacyNoteRepository::new(pool.clone())),
            system_settings_repo: Arc::new(PostgresSystemSettingsRepository::new(pool.clone())),
            treasury_config_repo: Arc::new(PostgresTreasuryConfigRepository::new(pool.clone())),
            withdrawal_history_repo: Arc::new(PostgresWithdrawalHistoryRepository::new(
                pool.clone(),
            )),
            user_withdrawal_log_repo: Arc::new(PostgresUserWithdrawalLogRepository::new(
                pool.clone(),
            )),
            pending_wallet_recovery_repo: Arc::new(PostgresPendingWalletRecoveryRepository::new(
                pool.clone(),
            )),
            #[cfg(feature = "postgres")]
            pg_pool: Some(pool),
        })
    }

    /// Start a background task that periodically cleans up expired data.
    ///
    /// Cleans up:
    /// - Expired sessions
    /// - Expired/used Solana nonces
    /// - Expired/used verification tokens
    /// - Expired invites
    /// - Old outbox events
    /// - Old login attempt records
    ///
    /// # Arguments
    /// * `interval_secs` - Interval between cleanup runs in seconds
    /// * `shutdown` - Watch receiver for graceful shutdown signaling
    ///
    /// Returns a JoinHandle that completes when shutdown is signaled.
    pub fn start_cleanup_task(
        &self,
        interval_secs: u64,
        mut shutdown: tokio::sync::watch::Receiver<bool>,
    ) -> JoinHandle<()> {
        let session_repo = self.session_repo.clone();
        let nonce_repo = self.nonce_repo.clone();
        let verification_repo = self.verification_repo.clone();
        let invite_repo = self.invite_repo.clone();
        let outbox_repo = self.outbox_repo.clone();
        let login_attempt_repo = self.login_attempt_repo.clone();
        let sso_repo = self.sso_repo.clone();
        let webauthn_repo = self.webauthn_repo.clone();
        let pending_wallet_recovery_repo = self.pending_wallet_recovery_repo.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(interval_secs));
            info!(
                "Background cleanup task started (interval: {}s)",
                interval_secs
            );

            loop {
                tokio::select! {
                    _ = interval.tick() => {
                        // Clean up expired sessions
                        match session_repo.delete_expired().await {
                            Ok(count) if count > 0 => {
                                debug!("Cleaned up {} expired sessions", count);
                            }
                            Err(e) => {
                                error!("Failed to clean up expired sessions: {}", e);
                            }
                            _ => {}
                        }

                        // Clean up expired nonces
                        match nonce_repo.delete_expired().await {
                            Ok(count) if count > 0 => {
                                debug!("Cleaned up {} expired nonces", count);
                            }
                            Err(e) => {
                                error!("Failed to clean up expired nonces: {}", e);
                            }
                            _ => {}
                        }

                        // Clean up expired verification tokens
                        match verification_repo.delete_expired().await {
                            Ok(count) if count > 0 => {
                                debug!("Cleaned up {} expired verification tokens", count);
                            }
                            Err(e) => {
                                error!("Failed to clean up expired verification tokens: {}", e);
                            }
                            _ => {}
                        }

                        // Clean up expired invites
                        match invite_repo.delete_expired().await {
                            Ok(count) if count > 0 => {
                                debug!("Cleaned up {} expired invites", count);
                            }
                            Err(e) => {
                                error!("Failed to clean up expired invites: {}", e);
                            }
                            _ => {}
                        }

                        // Clean up expired SSO auth states
                        match sso_repo.delete_expired_states().await {
                            Ok(count) if count > 0 => {
                                debug!("Cleaned up {} expired SSO auth states", count);
                            }
                            Err(e) => {
                                error!("Failed to clean up expired SSO auth states: {}", e);
                            }
                            _ => {}
                        }

                        // Clean up expired WebAuthn challenges
                        match webauthn_repo.delete_expired_challenges().await {
                            Ok(count) if count > 0 => {
                                debug!("Cleaned up {} expired WebAuthn challenges", count);
                            }
                            Err(e) => {
                                error!("Failed to clean up expired WebAuthn challenges: {}", e);
                            }
                            _ => {}
                        }

                        // Clean up old outbox events (keep 30 days)
                        let outbox_cutoff = Utc::now() - ChronoDuration::days(30);
                        match outbox_repo.cleanup_old(outbox_cutoff).await {
                            Ok(count) if count > 0 => {
                                debug!("Cleaned up {} old outbox events", count);
                            }
                            Err(e) => {
                                error!("Failed to clean up outbox events: {}", e);
                            }
                            _ => {}
                        }

                        // Clean up old login attempt records (keep 24 hours)
                        let login_attempt_cutoff = Utc::now() - ChronoDuration::hours(24);
                        match login_attempt_repo
                            .cleanup_old_records(login_attempt_cutoff)
                            .await
                        {
                            Ok(count) if count > 0 => {
                                debug!("Cleaned up {} old login attempts", count);
                            }
                            Err(e) => {
                                error!("Failed to clean up login attempts: {}", e);
                            }
                            _ => {}
                        }

                        // Clean up expired pending wallet recovery data
                        match pending_wallet_recovery_repo.delete_expired().await {
                            Ok(count) if count > 0 => {
                                debug!("Cleaned up {} expired pending wallet recovery records", count);
                            }
                            Err(e) => {
                                error!("Failed to clean up pending wallet recovery: {}", e);
                            }
                            _ => {}
                        }
                    }
                    _ = shutdown.changed() => {
                        info!("Cleanup task received shutdown signal, stopping gracefully");
                        break;
                    }
                }
            }
        })
    }
}

#[cfg(feature = "postgres")]
fn select_totp_encryption_secret() -> Result<String, AppError> {
    if let Ok(secret) = std::env::var("TOTP_ENCRYPTION_SECRET") {
        return Ok(secret);
    }

    let env = std::env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string());
    let env_lc = env.trim().to_ascii_lowercase();
    let is_production_like = !matches!(env_lc.as_str(), "dev" | "development" | "local" | "test");

    if is_production_like {
        return Err(AppError::Config(
            "TOTP_ENCRYPTION_SECRET is required in production-like environments".into(),
        ));
    }

    if let Ok(secret) = std::env::var("JWT_SECRET") {
        tracing::warn!(
            environment = %env,
            "TOTP_ENCRYPTION_SECRET not set - using JWT_SECRET for TOTP encryption (development only)"
        );
        return Ok(secret);
    }

    Err(AppError::Config(
        "TOTP encryption is required: set TOTP_ENCRYPTION_SECRET (recommended) or JWT_SECRET"
            .into(),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::sso::SsoAuthState;
    use crate::repositories::{NonceEntity, SessionEntity, UserEntity, WebAuthnChallenge};
    use chrono::{Duration as ChronoDuration, Utc};
    use std::sync::Mutex;
    use std::time::Duration;
    use uuid::Uuid;

    #[test]
    fn test_in_memory_storage_creation() {
        let storage = Storage::in_memory();
        // Verify all repositories are created
        assert!(Arc::strong_count(&storage.user_repo) >= 1);
        assert!(Arc::strong_count(&storage.session_repo) >= 1);
        assert!(Arc::strong_count(&storage.nonce_repo) >= 1);
        assert!(Arc::strong_count(&storage.verification_repo) >= 1);
        assert!(Arc::strong_count(&storage.org_repo) >= 1);
        assert!(Arc::strong_count(&storage.membership_repo) >= 1);
        assert!(Arc::strong_count(&storage.invite_repo) >= 1);
        assert!(Arc::strong_count(&storage.audit_repo) >= 1);
        assert!(Arc::strong_count(&storage.totp_repo) >= 1);
        assert!(Arc::strong_count(&storage.api_key_repo) >= 1);
    }

    #[test]
    fn test_storage_clone() {
        let storage1 = Storage::in_memory();
        let storage2 = storage1.clone();
        // Both should point to same underlying repos (Arc)
        assert!(Arc::ptr_eq(&storage1.user_repo, &storage2.user_repo));
        assert!(Arc::ptr_eq(&storage1.session_repo, &storage2.session_repo));
        assert!(Arc::ptr_eq(&storage1.nonce_repo, &storage2.nonce_repo));
        assert!(Arc::ptr_eq(
            &storage1.verification_repo,
            &storage2.verification_repo
        ));
        assert!(Arc::ptr_eq(&storage1.org_repo, &storage2.org_repo));
        assert!(Arc::ptr_eq(
            &storage1.membership_repo,
            &storage2.membership_repo
        ));
        assert!(Arc::ptr_eq(&storage1.invite_repo, &storage2.invite_repo));
        assert!(Arc::ptr_eq(&storage1.audit_repo, &storage2.audit_repo));
        assert!(Arc::ptr_eq(&storage1.totp_repo, &storage2.totp_repo));
        assert!(Arc::ptr_eq(&storage1.api_key_repo, &storage2.api_key_repo));
    }

    #[tokio::test]
    async fn test_from_config_no_url_returns_in_memory() {
        let config = DatabaseConfig {
            url: None,
            max_connections: 5,
            min_connections: 1,
            connect_timeout_secs: 10,
            idle_timeout_secs: 60,
        };
        let storage = Storage::from_config(&config).await.unwrap();
        // Should work - in-memory storage created
        assert!(Arc::strong_count(&storage.user_repo) >= 1);
    }

    #[tokio::test]
    async fn test_in_memory_user_operations() {
        let storage = Storage::in_memory();

        let user = UserEntity {
            id: Uuid::new_v4(),
            email: Some("test@example.com".to_string()),
            email_verified: false,
            password_hash: Some("hash".to_string()),
            name: Some("Test".to_string()),
            picture: None,
            wallet_address: None,
            google_id: None,
            apple_id: None,
            stripe_customer_id: None,
            auth_methods: vec![crate::models::AuthMethod::Email],
            is_system_admin: false,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            last_login_at: None,
        };

        let created = storage.user_repo.create(user.clone()).await.unwrap();
        assert_eq!(created.email, Some("test@example.com".to_string()));

        let found = storage.user_repo.find_by_id(created.id).await.unwrap();
        assert!(found.is_some());
    }

    #[tokio::test]
    async fn test_in_memory_session_operations() {
        let storage = Storage::in_memory();

        // Create user first
        let user = UserEntity {
            id: Uuid::new_v4(),
            email: Some("session_test@example.com".to_string()),
            email_verified: false,
            password_hash: Some("hash".to_string()),
            name: None,
            picture: None,
            wallet_address: None,
            google_id: None,
            apple_id: None,
            stripe_customer_id: None,
            auth_methods: vec![crate::models::AuthMethod::Email],
            is_system_admin: false,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            last_login_at: None,
        };
        let user = storage.user_repo.create(user).await.unwrap();

        let session = SessionEntity {
            id: Uuid::new_v4(),
            user_id: user.id,
            refresh_token_hash: "token_hash".to_string(),
            ip_address: Some("127.0.0.1".to_string()),
            user_agent: None,
            created_at: Utc::now(),
            expires_at: Utc::now() + ChronoDuration::days(30),
            revoked_at: None,
            revoked_reason: None,
            last_strong_auth_at: None,
        };

        let created = storage.session_repo.create(session).await.unwrap();
        assert_eq!(created.user_id, user.id);

        let found = storage.session_repo.find_by_id(created.id).await.unwrap();
        assert!(found.is_some());
    }

    #[tokio::test]
    async fn test_in_memory_nonce_operations() {
        let storage = Storage::in_memory();

        let nonce = NonceEntity {
            nonce: "test_nonce_123".to_string(),
            public_key: "pubkey123".to_string(),
            message: "Sign this message".to_string(),
            created_at: Utc::now(),
            expires_at: Utc::now() + ChronoDuration::minutes(5),
            used_at: None,
        };

        let created = storage.nonce_repo.create(nonce).await.unwrap();
        assert_eq!(created.nonce, "test_nonce_123");

        let is_valid = storage.nonce_repo.is_valid("test_nonce_123").await.unwrap();
        assert!(is_valid);
    }

    #[tokio::test]
    async fn test_cleanup_task_removes_expired_sso_states() {
        let storage = Storage::in_memory();

        let sso_state = SsoAuthState::new(
            Uuid::new_v4(),
            Uuid::new_v4(),
            "verifier".into(),
            "nonce".into(),
            None,
            -10,
        );
        storage.sso_repo.store_auth_state(sso_state).await.unwrap();

        let (shutdown_tx, shutdown_rx) = tokio::sync::watch::channel(false);
        let handle = storage.start_cleanup_task(1, shutdown_rx);
        tokio::time::sleep(Duration::from_millis(50)).await;
        shutdown_tx.send(true).unwrap();
        handle.await.unwrap();

        let removed_states = storage.sso_repo.delete_expired_states().await.unwrap();
        assert_eq!(removed_states, 0);
    }

    #[tokio::test]
    async fn test_cleanup_task_removes_expired_webauthn_challenges() {
        let storage = Storage::in_memory();

        let challenge = WebAuthnChallenge {
            challenge_id: Uuid::new_v4(),
            user_id: None,
            state: "challenge".into(),
            challenge_type: "register".into(),
            created_at: Utc::now() - ChronoDuration::minutes(10),
            expires_at: Utc::now() - ChronoDuration::minutes(5),
        };
        storage
            .webauthn_repo
            .store_challenge(challenge)
            .await
            .unwrap();

        let (shutdown_tx, shutdown_rx) = tokio::sync::watch::channel(false);
        let handle = storage.start_cleanup_task(1, shutdown_rx);
        tokio::time::sleep(Duration::from_millis(50)).await;
        shutdown_tx.send(true).unwrap();
        handle.await.unwrap();

        let removed_challenges = storage
            .webauthn_repo
            .delete_expired_challenges()
            .await
            .unwrap();
        assert_eq!(removed_challenges, 0);
    }

    #[cfg(feature = "postgres")]
    static ENV_LOCK: Mutex<()> = Mutex::new(());

    #[cfg(feature = "postgres")]
    struct EnvGuard {
        key: &'static str,
        prev: Option<String>,
    }

    #[cfg(feature = "postgres")]
    impl Drop for EnvGuard {
        fn drop(&mut self) {
            match self.prev.as_deref() {
                Some(v) => std::env::set_var(self.key, v),
                None => std::env::remove_var(self.key),
            }
        }
    }

    #[cfg(feature = "postgres")]
    fn set_env(key: &'static str, value: Option<&str>) -> EnvGuard {
        let prev = std::env::var(key).ok();
        match value {
            Some(v) => std::env::set_var(key, v),
            None => std::env::remove_var(key),
        }
        EnvGuard { key, prev }
    }

    #[test]
    #[cfg(feature = "postgres")]
    fn test_select_totp_encryption_secret_requires_dedicated_secret_in_staging() {
        let _lock = ENV_LOCK.lock().unwrap();
        let _env = set_env("ENVIRONMENT", Some("staging"));
        let _totp = set_env("TOTP_ENCRYPTION_SECRET", None);
        let _jwt = set_env("JWT_SECRET", Some(&"s".repeat(32)));

        let err = select_totp_encryption_secret().unwrap_err().to_string();
        assert!(err.contains("TOTP_ENCRYPTION_SECRET is required in production-like environments"));
    }

    #[test]
    #[cfg(feature = "postgres")]
    fn test_select_totp_encryption_secret_allows_jwt_secret_in_development() {
        let _lock = ENV_LOCK.lock().unwrap();
        let _env = set_env("ENVIRONMENT", Some("development"));
        let _totp = set_env("TOTP_ENCRYPTION_SECRET", None);
        let _jwt = set_env("JWT_SECRET", Some(&"s".repeat(32)));

        let secret = select_totp_encryption_secret().unwrap();
        assert_eq!(secret.len(), 32);
    }
}
