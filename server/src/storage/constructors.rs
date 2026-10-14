use std::sync::Arc;
#[cfg(feature = "postgres")]
use std::time::Duration;

use crate::config::DatabaseConfig;
use crate::errors::AppError;
use crate::repositories::{
    InMemoryApiKeyRepository, InMemoryAtomicMfaRepository, InMemoryAuditLogRepository,
    InMemoryCanonicalEmailRepository, InMemoryCredentialLifecycleRepository,
    InMemoryCredentialRepository, InMemoryCredentialStores, InMemoryCustomRoleRepository,
    InMemoryEmailVerificationRepository, InMemoryInviteCodeRepository, InMemoryInviteRepository,
    InMemoryLoginAttemptRepository, InMemoryMembershipRepository, InMemoryNonceRepository,
    InMemoryOrgRepository, InMemoryOutboxRepository, InMemoryPendingInviteRedemptionRepository,
    InMemoryPolicyRepository, InMemorySessionRepository, InMemorySsoRepository,
    InMemorySystemSettingsRepository, InMemoryTotpRepository, InMemoryUserEmailRepository,
    InMemoryUserRepository, InMemoryVerificationRepository, InMemoryWebAuthnRepository,
};
#[cfg(feature = "postgres")]
use crate::repositories::{
    PostgresApiKeyRepository, PostgresAtomicMfaRepository, PostgresAuditLogRepository,
    PostgresCanonicalEmailRepository, PostgresCredentialLifecycleRepository,
    PostgresCredentialRepository, PostgresCustomRoleRepository,
    PostgresEmailVerificationRepository, PostgresInviteCodeRepository, PostgresInviteRepository,
    PostgresLoginAttemptRepository, PostgresMembershipRepository, PostgresNonceRepository,
    PostgresOrgRepository, PostgresOutboxRepository, PostgresPendingInviteRedemptionRepository,
    PostgresPolicyRepository, PostgresSessionRepository, PostgresSsoRepository,
    PostgresSystemSettingsRepository, PostgresTotpRepository, PostgresUserEmailRepository,
    PostgresUserRepository, PostgresVerificationRepository, PostgresWebAuthnRepository,
    TotpRepository,
};
#[cfg(feature = "postgres")]
use crate::services::EncryptionService;

#[cfg(feature = "postgres")]
use sqlx::postgres::PgPoolOptions;
#[cfg(feature = "postgres")]
use sqlx::PgPool;

use super::Storage;

impl Storage {
    /// Create in-memory storage for development and tests.
    pub fn in_memory() -> Self {
        let user_repo = Arc::new(InMemoryUserRepository::new());
        let api_key_repo = Arc::new(InMemoryApiKeyRepository::new());
        let user_email_repo = Arc::new(InMemoryUserEmailRepository::new());
        let verification_repo = Arc::new(InMemoryVerificationRepository::new());
        let session_repo = InMemorySessionRepository::new();
        let totp_repo = InMemoryTotpRepository::new();
        let atomic_mfa_repo = Arc::new(InMemoryAtomicMfaRepository::new(
            verification_repo.as_ref().clone(),
            totp_repo.clone(),
            session_repo.clone(),
        ));
        let credential_repo = Arc::new(InMemoryCredentialRepository::new());
        let webauthn_repo = Arc::new(InMemoryWebAuthnRepository::new());
        let invite_code_repo = Arc::new(InMemoryInviteCodeRepository::new());
        let pending_invite_redemption_repo =
            Arc::new(InMemoryPendingInviteRedemptionRepository::new(
                user_repo.clone(),
                verification_repo.clone(),
                invite_code_repo.clone(),
            ));
        let credential_lifecycle_repo = Arc::new(InMemoryCredentialLifecycleRepository::new(
            verification_repo.clone(),
            user_repo.clone(),
            Arc::new(session_repo.clone()),
            user_email_repo.clone(),
            InMemoryCredentialStores {
                credentials: credential_repo.clone(),
                webauthn: webauthn_repo.clone(),
                totp: Arc::new(totp_repo.clone()),
                api_keys: api_key_repo.clone(),
            },
        ));

        let outbox_repo = Arc::new(InMemoryOutboxRepository::with_verification_repository(
            verification_repo.as_ref().clone(),
        ));

        Self {
            user_repo: user_repo.clone(),
            user_email_repo: user_email_repo.clone(),
            canonical_email_repo: Arc::new(InMemoryCanonicalEmailRepository::new(
                user_repo.clone(),
                user_email_repo.clone(),
            )),
            email_verification_repo: Arc::new(InMemoryEmailVerificationRepository::new(
                user_repo,
                user_email_repo,
                verification_repo.clone(),
                credential_lifecycle_repo.clone(),
            )),
            session_repo: Arc::new(session_repo),
            nonce_repo: Arc::new(InMemoryNonceRepository::new()),
            verification_repo,
            atomic_mfa_repo,
            org_repo: Arc::new(InMemoryOrgRepository::new()),
            membership_repo: Arc::new(InMemoryMembershipRepository::new()),
            invite_repo: Arc::new(InMemoryInviteRepository::new()),
            invite_code_repo,
            pending_invite_redemption_repo,
            audit_repo: Arc::new(InMemoryAuditLogRepository::new()),
            login_attempt_repo: Arc::new(InMemoryLoginAttemptRepository::new()),
            totp_repo: Arc::new(totp_repo),
            custom_role_repo: Arc::new(InMemoryCustomRoleRepository::new()),
            policy_repo: Arc::new(InMemoryPolicyRepository::new()),
            outbox_repo,
            api_key_repo,
            credential_repo,
            credential_lifecycle_repo,
            webauthn_repo,
            sso_repo: Arc::new(InMemorySsoRepository::new()),
            system_settings_repo: Arc::new(InMemorySystemSettingsRepository::with_defaults()),
            #[cfg(feature = "postgres")]
            pg_pool: None,
        }
    }

    /// Create storage from configuration, using PostgreSQL when configured.
    #[cfg(feature = "postgres")]
    pub async fn from_config(config: &DatabaseConfig) -> Result<Self, AppError> {
        match &config.url {
            Some(url) => Self::postgres(url, config).await,
            None => Ok(Self::in_memory()),
        }
    }

    /// Create in-memory storage when PostgreSQL support is disabled.
    #[cfg(not(feature = "postgres"))]
    pub async fn from_config(config: &DatabaseConfig) -> Result<Self, AppError> {
        if config.url.is_some() {
            return Err(AppError::Config(
                "Persistent identity storage requires the postgres feature".into(),
            ));
        }
        Ok(Self::in_memory())
    }

    /// Connect to PostgreSQL and construct all repository adapters.
    #[cfg(feature = "postgres")]
    pub async fn postgres(url: &str, config: &DatabaseConfig) -> Result<Self, AppError> {
        let pool = PgPoolOptions::new()
            .max_connections(config.max_connections)
            .min_connections(config.min_connections)
            .acquire_timeout(Duration::from_secs(config.connect_timeout_secs))
            .idle_timeout(Duration::from_secs(config.idle_timeout_secs))
            .after_connect(|connection, _| {
                Box::pin(async move {
                    sqlx::query("SET statement_timeout = '30s'")
                        .execute(&mut *connection)
                        .await?;
                    Ok(())
                })
            })
            .connect(url)
            .await
            .map_err(|error| AppError::Internal(error.into()))?;
        Self::postgres_with_pool(pool).await
    }

    /// Construct PostgreSQL storage from an existing pool and run migrations.
    #[cfg(feature = "postgres")]
    pub async fn postgres_with_pool(pool: PgPool) -> Result<Self, AppError> {
        let mut migrator = sqlx::migrate!();
        migrator.set_ignore_missing(true);
        migrator
            .run(&pool)
            .await
            .map_err(|error| AppError::Internal(error.into()))?;
        let totp_secret = select_totp_encryption_secret()?;
        let totp_repo: Arc<dyn TotpRepository> = Arc::new(PostgresTotpRepository::with_encryption(
            pool.clone(),
            Arc::new(EncryptionService::from_secret(&totp_secret)),
        ));
        Ok(postgres_repositories(pool, totp_repo))
    }
}

#[cfg(feature = "postgres")]
fn postgres_repositories(pool: PgPool, totp_repo: Arc<dyn TotpRepository>) -> Storage {
    Storage {
        user_repo: Arc::new(PostgresUserRepository::new(pool.clone())),
        user_email_repo: Arc::new(PostgresUserEmailRepository::new(pool.clone())),
        canonical_email_repo: Arc::new(PostgresCanonicalEmailRepository::new(pool.clone())),
        email_verification_repo: Arc::new(PostgresEmailVerificationRepository::new(pool.clone())),
        session_repo: Arc::new(PostgresSessionRepository::new(pool.clone())),
        nonce_repo: Arc::new(PostgresNonceRepository::new(pool.clone())),
        verification_repo: Arc::new(PostgresVerificationRepository::new(pool.clone())),
        atomic_mfa_repo: Arc::new(PostgresAtomicMfaRepository::new(pool.clone())),
        org_repo: Arc::new(PostgresOrgRepository::new(pool.clone())),
        membership_repo: Arc::new(PostgresMembershipRepository::new(pool.clone())),
        invite_repo: Arc::new(PostgresInviteRepository::new(pool.clone())),
        invite_code_repo: Arc::new(PostgresInviteCodeRepository::new(pool.clone())),
        pending_invite_redemption_repo: Arc::new(PostgresPendingInviteRedemptionRepository::new(
            pool.clone(),
        )),
        audit_repo: Arc::new(PostgresAuditLogRepository::new(pool.clone())),
        outbox_repo: Arc::new(PostgresOutboxRepository::new(pool.clone())),
        login_attempt_repo: Arc::new(PostgresLoginAttemptRepository::new(pool.clone())),
        totp_repo,
        custom_role_repo: Arc::new(PostgresCustomRoleRepository::new(pool.clone())),
        policy_repo: Arc::new(PostgresPolicyRepository::new(pool.clone())),
        api_key_repo: Arc::new(PostgresApiKeyRepository::new(pool.clone())),
        credential_repo: Arc::new(PostgresCredentialRepository::new(pool.clone())),
        credential_lifecycle_repo: Arc::new(PostgresCredentialLifecycleRepository::new(
            pool.clone(),
        )),
        webauthn_repo: Arc::new(PostgresWebAuthnRepository::new(pool.clone())),
        sso_repo: Arc::new(PostgresSsoRepository::new(pool.clone())),
        system_settings_repo: Arc::new(PostgresSystemSettingsRepository::new(pool.clone())),
        pg_pool: Some(pool),
    }
}

#[cfg(feature = "postgres")]
pub(super) fn select_totp_encryption_secret() -> Result<String, AppError> {
    if let Ok(secret) = std::env::var("TOTP_ENCRYPTION_SECRET") {
        if !secret.trim().is_empty() {
            return Ok(secret);
        }
    }
    let environment = std::env::var("ENVIRONMENT").unwrap_or_else(|_| "development".into());
    let normalized = environment.trim().to_ascii_lowercase();
    if !matches!(
        normalized.as_str(),
        "dev" | "development" | "local" | "test"
    ) {
        return Err(AppError::Config(
            "TOTP_ENCRYPTION_SECRET is required in production-like environments".into(),
        ));
    }
    if let Ok(secret) = std::env::var("JWT_SECRET") {
        tracing::warn!(
            environment,
            "TOTP_ENCRYPTION_SECRET not set - using JWT_SECRET for TOTP encryption (development only)"
        );
        return Ok(secret);
    }
    Err(AppError::Config(
        "TOTP encryption is required: set TOTP_ENCRYPTION_SECRET (recommended) or JWT_SECRET"
            .into(),
    ))
}
