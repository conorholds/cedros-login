#![recursion_limit = "256"]

//! # Cedros Login Server
//!
//! Authentication server library with email/password, Google OAuth, and Solana wallet sign-in.
//!
//! ## Features
//!
//! - **Email/Password**: Traditional registration and login with argon2id password hashing
//! - **Google OAuth**: Social sign-in via Google ID token verification
//! - **Solana Wallet**: Sign-in by signing a challenge message with an ed25519 wallet
//!
//! ## Usage
//!
//! ### Standalone Server
//!
//! Run the binary directly:
//! ```bash
//! cedros-login-server
//! ```
//!
//! ### Embedded Library
//!
//! Integrate into your own Axum application:
//! ```text
//! use cedros_login::{router, Config, NoopCallback};
//! use std::sync::Arc;
//!
//! let config = Config::from_env()?;
//! let callback = Arc::new(NoopCallback);
//! let auth_router = router(config, callback);
//!
//! let app = Router::new()
//!     .nest("/auth", auth_router)
//!     .layer(/* your middleware */);
//! ```

pub mod callback;
pub mod config;
pub mod errors;
pub mod handlers;
pub mod middleware;
pub mod models;
pub mod repositories;
pub mod services;
pub mod storage;
pub mod utils;

mod router;

pub use callback::{AuthCallback, AuthCallbackPayload, NoopCallback};
pub use config::{Config, DatabaseConfig, NotificationConfig};
pub use errors::AppError;
pub use router::create_router;
// Re-export NotificationService trait for create_withdrawal_worker
pub use services::NotificationService;
pub use services::{
    EmailService, InstantLinkEmailData, LogEmailService, NoopEmailService, PasswordResetEmailData,
    VerificationEmailData,
};
#[cfg(feature = "postgres")]
pub use sqlx::PgPool;
pub use storage::Storage;

use axum::Router;
use repositories::{
    ApiKeyRepository, AuditLogRepository, CredentialRepository, CreditHoldRepository,
    CreditRefundRequestRepository, CreditRepository, CustomRoleRepository, DepositRepository,
    DerivedWalletRepository, InviteRepository, LoginAttemptConfig, LoginAttemptRepository,
    MembershipRepository, NonceRepository, OrgRepository, OutboxRepository, PolicyRepository,
    PrivacyNoteRepository,
    SessionRepository, SystemSettingsRepository, TotpRepository, TreasuryConfigRepository,
    UserRepository, UserWithdrawalLogRepository, VerificationRepository, WalletMaterialRepository,
    WalletRotationHistoryRepository, WebAuthnRepository,
};
use services::{
    create_wallet_unlock_cache, AppleService, AuditService, CommsService, DepositCreditService,
    DepositFeeService, EncryptionService, GoogleService, JupiterSwapService, JwtService,
    MfaAttemptService, NoteEncryptionService, OidcService, PasswordService, PrivacySidecarClient,
    SettingsService, SidecarClientConfig, SolPriceService, SolanaService, StepUpService,
    TotpService, WalletSigningService, WalletUnlockCache, WebAuthnService,
};
use std::sync::Arc;
use utils::TokenCipher;

fn build_privacy_sidecar_client(config: &Config) -> Result<PrivacySidecarClient, AppError> {
    let api_key = config
        .privacy
        .sidecar_api_key
        .clone()
        .ok_or_else(|| AppError::Config("SIDECAR_API_KEY is required".into()))?;
    PrivacySidecarClient::new(SidecarClientConfig {
        base_url: config.privacy.sidecar_url.clone(),
        timeout_ms: config.privacy.sidecar_timeout_ms,
        api_key,
    })
}

fn decode_note_encryption_key(key: &str) -> Result<Vec<u8>, base64::DecodeError> {
    use base64::{engine::general_purpose::STANDARD, Engine as _};

    STANDARD.decode(key)
}

fn build_note_encryption_service(
    key_bytes: &[u8],
    key_id: &str,
) -> Result<NoteEncryptionService, AppError> {
    NoteEncryptionService::new(key_bytes, key_id)
}

fn preload_settings_cache(settings_service: &Arc<SettingsService>) {
    if let Ok(handle) = tokio::runtime::Handle::try_current() {
        if handle.runtime_flavor() == tokio::runtime::RuntimeFlavor::MultiThread {
            tokio::task::block_in_place(|| {
                if let Err(error) = handle.block_on(settings_service.refresh()) {
                    tracing::warn!(error = %error, "Failed to preload settings cache during router setup");
                }
            });
        }
    }
}

/// Application state shared across all handlers
pub struct AppState<C: AuthCallback, E: EmailService = LogEmailService> {
    pub config: Config,
    pub callback: Arc<C>,
    pub jwt_service: JwtService,
    pub password_service: PasswordService,
    pub google_service: GoogleService,
    pub apple_service: AppleService,
    pub solana_service: SolanaService,
    pub totp_service: TotpService,
    pub webauthn_service: WebAuthnService,
    pub oidc_service: OidcService,
    pub encryption_service: EncryptionService,
    pub phantom_email: std::marker::PhantomData<E>,
    pub audit_service: AuditService,
    pub comms_service: CommsService,
    pub user_repo: Arc<dyn UserRepository>,
    pub session_repo: Arc<dyn SessionRepository>,
    pub nonce_repo: Arc<dyn NonceRepository>,
    pub verification_repo: Arc<dyn VerificationRepository>,
    pub org_repo: Arc<dyn OrgRepository>,
    pub membership_repo: Arc<dyn MembershipRepository>,
    pub invite_repo: Arc<dyn InviteRepository>,
    pub audit_repo: Arc<dyn AuditLogRepository>,
    pub login_attempt_repo: Arc<dyn LoginAttemptRepository>,
    pub login_attempt_config: LoginAttemptConfig,
    pub totp_repo: Arc<dyn TotpRepository>,
    pub custom_role_repo: Arc<dyn CustomRoleRepository>,
    pub policy_repo: Arc<dyn PolicyRepository>,
    pub outbox_repo: Arc<dyn OutboxRepository>,
    pub api_key_repo: Arc<dyn ApiKeyRepository>,
    pub wallet_material_repo: Arc<dyn WalletMaterialRepository>,
    pub derived_wallet_repo: Arc<dyn DerivedWalletRepository>,
    pub wallet_rotation_history_repo: Arc<dyn WalletRotationHistoryRepository>,
    pub credential_repo: Arc<dyn CredentialRepository>,
    pub webauthn_repo: Arc<dyn WebAuthnRepository>,
    pub deposit_repo: Arc<dyn DepositRepository>,
    pub credit_repo: Arc<dyn CreditRepository>,
    pub credit_hold_repo: Arc<dyn CreditHoldRepository>,
    pub credit_refund_request_repo: Arc<dyn CreditRefundRequestRepository>,
    pub privacy_note_repo: Arc<dyn PrivacyNoteRepository>,
    /// System settings repository for runtime-configurable values
    pub system_settings_repo: Arc<dyn SystemSettingsRepository>,
    /// Treasury configuration repository for micro deposit batching
    pub treasury_config_repo: Arc<dyn TreasuryConfigRepository>,
    /// User withdrawal log repository for tracking user-initiated withdrawals
    pub user_withdrawal_log_repo: Arc<dyn UserWithdrawalLogRepository>,
    /// Settings service with caching for runtime configuration
    pub settings_service: Arc<SettingsService>,
    /// SEC-04: Per-user MFA attempt tracking to prevent brute-force
    pub mfa_attempt_service: MfaAttemptService,
    pub step_up_service: StepUpService,
    /// Wallet signing service for server-side transaction signing
    pub wallet_signing_service: WalletSigningService,
    /// Wallet unlock cache for session-based credential caching
    pub wallet_unlock_cache: Arc<WalletUnlockCache>,
    /// Storage layer for accessing repositories
    pub storage: Storage,
    /// Privacy Cash sidecar client (None if privacy not enabled)
    pub privacy_sidecar_client: Option<Arc<PrivacySidecarClient>>,
    /// Note encryption service for privacy notes (None if privacy not enabled)
    pub note_encryption_service: Option<Arc<NoteEncryptionService>>,
    /// SOL price service for fetching current SOL/USD price
    pub sol_price_service: Arc<SolPriceService>,
    /// Jupiter swap service for public deposits (None if company wallet not configured)
    pub jupiter_swap_service: Option<Arc<JupiterSwapService>>,
    /// Deposit credit service for calculating credits from deposits
    pub deposit_credit_service: Arc<DepositCreditService>,
    #[cfg(feature = "postgres")]
    pub postgres_pool: Option<PgPool>,
}

/// Create the authentication router with in-memory storage.
///
/// This is the simplest entry point, useful for development and testing.
/// For production with PostgreSQL, use `router_with_storage` instead.
pub fn router<C: AuthCallback + 'static>(config: Config, callback: Arc<C>) -> Router {
    router_with_storage(config, callback, Storage::in_memory())
}

/// Create the authentication router with custom storage backend.
///
/// Use this when you need PostgreSQL or a custom storage implementation.
///
/// ## Example with PostgreSQL
///
/// ```text
/// use cedros_login::{router_with_storage, Config, Storage, NoopCallback};
/// use std::sync::Arc;
///
/// let config = Config::from_env()?;
/// let storage = Storage::from_config(&config.database).await?;
/// let callback = Arc::new(NoopCallback);
/// let auth_router = router_with_storage(config, callback, storage);
/// ```
pub fn router_with_storage<C: AuthCallback + 'static>(
    config: Config,
    callback: Arc<C>,
    storage: Storage,
) -> Router {
    let jwt_service = JwtService::new(&config.jwt);
    let password_service = PasswordService::default();
    let google_service = GoogleService::new(&config.google);
    let apple_service = AppleService::new(&config.apple);
    let solana_service = SolanaService::new(&config.solana, "Cedros Login".to_string());
    let totp_service = TotpService::new("Cedros");
    let webauthn_service = WebAuthnService::new(&config.webauthn);
    let audit_service = AuditService::new(storage.audit_repo.clone(), config.server.trust_proxy);
    let step_up_service = StepUpService::new(storage.session_repo.clone());

    // Create SSO services
    // SEC-02: Use HTTPS for SSO callback URL when frontend URL is HTTPS
    let protocol = if config
        .server
        .frontend_url
        .as_ref()
        .map(|u| u.starts_with("https://"))
        .unwrap_or(false)
    {
        "https"
    } else {
        "http"
    };
    let sso_callback_url = config.server.sso_callback_url.clone().unwrap_or_else(|| {
        format!(
            "{}://{}:{}/auth/sso/callback",
            protocol, config.server.host, config.server.port
        )
    });
    let oidc_service = OidcService::new(sso_callback_url);
    let encryption_service = EncryptionService::from_secret(&config.jwt.secret);

    // Create CommsService for async email/notification delivery
    let base_url = config
        .server
        .frontend_url
        .clone()
        .unwrap_or_else(|| "http://localhost:3000".to_string());
    let token_cipher = TokenCipher::new(&config.jwt.secret);
    let comms_service = CommsService::new(storage.outbox_repo.clone(), base_url, token_cipher);

    // Create SettingsService for runtime configuration
    // Note: The cache starts empty. Sync cache accessors used during router setup
    // (e.g., rate limit configuration) will return None and fall back to config defaults.
    // The cache is populated on first async access (e.g., deposit handler, withdrawal worker).
    let settings_service = Arc::new(SettingsService::new(storage.system_settings_repo.clone()));
    preload_settings_cache(&settings_service);

    // Create privacy services if enabled
    let (privacy_sidecar_client, note_encryption_service) = if config.privacy.enabled {
        let mut errors = Vec::new();

        let sidecar = match build_privacy_sidecar_client(&config) {
            Ok(s) => Some(Arc::new(s)),
            Err(e) => {
                errors.push(format!("Failed to create privacy sidecar client: {}", e));
                None
            }
        };

        let note_encryption = match config.privacy.note_encryption_key.as_ref() {
            Some(key) => match decode_note_encryption_key(key) {
                Ok(key_bytes) => match build_note_encryption_service(
                    &key_bytes,
                    &config.privacy.note_encryption_key_id,
                ) {
                    Ok(n) => Some(Arc::new(n)),
                    Err(e) => {
                        errors.push(format!("Failed to create note encryption service: {}", e));
                        None
                    }
                },
                Err(e) => {
                    errors.push(format!("Invalid base64 in note_encryption_key: {}", e));
                    None
                }
            },
            None => {
                errors.push("note_encryption_key is required when privacy is enabled".to_string());
                None
            }
        };

        // S-04: Fail startup when privacy is enabled but required services can't be created.
        // Silently disabling would allow the server to accept deposits it cannot process.
        if !errors.is_empty() {
            for error in &errors {
                tracing::error!("{}", error);
            }
            panic!(
                "Privacy is enabled but required services failed to initialize: {}",
                errors.join("; ")
            );
        } else {
            (sidecar, note_encryption)
        }
    } else {
        (None, None)
    };

    // Build Jupiter swap service if company wallet is configured (for public deposits)
    let jupiter_swap_service = config
        .privacy
        .company_wallet_address
        .as_ref()
        .and_then(|wallet| {
            match JupiterSwapService::new(
                wallet.clone(),
                &config.privacy.company_currency,
                None, // API key from env could be added later
            ) {
                Ok(service) => Some(Arc::new(service)),
                Err(e) => {
                    tracing::error!(error = %e, "Failed to create Jupiter swap service, swap features disabled");
                    None
                }
            }
        });

    // Create SOL price service (shared across deposit services)
    let sol_price_service = Arc::new(SolPriceService::new());

    // Create deposit fee and credit services
    let fee_service = Arc::new(DepositFeeService::new(settings_service.clone()));
    let deposit_credit_service = Arc::new(DepositCreditService::new(
        sol_price_service.clone(),
        fee_service,
        config.privacy.company_currency.clone(),
    ));

    let state = Arc::new(AppState {
        config,
        callback,
        jwt_service,
        password_service,
        google_service,
        apple_service,
        solana_service,
        totp_service,
        webauthn_service,
        oidc_service,
        encryption_service,
        phantom_email: std::marker::PhantomData::<LogEmailService>,
        audit_service,
        comms_service,
        user_repo: storage.user_repo.clone(),
        session_repo: storage.session_repo.clone(),
        nonce_repo: storage.nonce_repo.clone(),
        verification_repo: storage.verification_repo.clone(),
        org_repo: storage.org_repo.clone(),
        membership_repo: storage.membership_repo.clone(),
        invite_repo: storage.invite_repo.clone(),
        audit_repo: storage.audit_repo.clone(),
        login_attempt_repo: storage.login_attempt_repo.clone(),
        login_attempt_config: LoginAttemptConfig::default(),
        totp_repo: storage.totp_repo.clone(),
        custom_role_repo: storage.custom_role_repo.clone(),
        policy_repo: storage.policy_repo.clone(),
        outbox_repo: storage.outbox_repo.clone(),
        api_key_repo: storage.api_key_repo.clone(),
        wallet_material_repo: storage.wallet_material_repo.clone(),
        derived_wallet_repo: storage.derived_wallet_repo.clone(),
        wallet_rotation_history_repo: storage.wallet_rotation_history_repo.clone(),
        credential_repo: storage.credential_repo.clone(),
        webauthn_repo: storage.webauthn_repo.clone(),
        deposit_repo: storage.deposit_repo.clone(),
        credit_repo: storage.credit_repo.clone(),
        credit_hold_repo: storage.credit_hold_repo.clone(),
        credit_refund_request_repo: storage.credit_refund_request_repo.clone(),
        privacy_note_repo: storage.privacy_note_repo.clone(),
        system_settings_repo: storage.system_settings_repo.clone(),
        treasury_config_repo: storage.treasury_config_repo.clone(),
        user_withdrawal_log_repo: storage.user_withdrawal_log_repo.clone(),
        settings_service: settings_service.clone(),
        mfa_attempt_service: MfaAttemptService::new(),
        step_up_service,
        wallet_signing_service: WalletSigningService::new(),
        wallet_unlock_cache: create_wallet_unlock_cache(),
        privacy_sidecar_client,
        note_encryption_service,
        sol_price_service,
        jupiter_swap_service,
        deposit_credit_service,
        #[cfg(feature = "postgres")]
        postgres_pool: storage.pg_pool.clone(),
        storage,
    });
    create_router(state)
}

/// Create a withdrawal worker for Privacy Cash deposits.
///
/// Returns `Some(JoinHandle)` if privacy is enabled, `None` otherwise.
/// The worker will poll for completed deposits and withdraw them to the company wallet.
///
/// Runtime-tunable settings (poll_interval, batch_size, timeout, retries, percentage,
/// partial_withdrawal_*) are read from the database via SettingsService.
pub fn create_withdrawal_worker(
    config: &Config,
    storage: &Storage,
    settings_service: Arc<SettingsService>,
    notification_service: Arc<dyn services::NotificationService>,
    cancel_token: tokio_util::sync::CancellationToken,
) -> Option<tokio::task::JoinHandle<()>> {
    if !config.privacy.enabled {
        return None;
    }

    // Create sidecar client
    let sidecar = match build_privacy_sidecar_client(config) {
        Ok(s) => Arc::new(s),
        Err(e) => {
            tracing::error!(error = %e, "Failed to create privacy sidecar client for withdrawal worker");
            return None;
        }
    };

    // S-05: Gracefully handle missing key instead of panicking
    let encryption_key = match config.privacy.note_encryption_key.as_ref() {
        Some(k) => k,
        None => {
            tracing::error!("note_encryption_key is required when privacy is enabled");
            return None;
        }
    };
    let key_bytes = match decode_note_encryption_key(encryption_key) {
        Ok(k) => k,
        Err(e) => {
            tracing::error!(error = %e, "Invalid base64 in note_encryption_key");
            return None;
        }
    };
    let note_encryption = match build_note_encryption_service(
        &key_bytes,
        &config.privacy.note_encryption_key_id,
    ) {
        Ok(s) => Arc::new(s),
        Err(e) => {
            tracing::error!(error = %e, "Failed to create note encryption service for withdrawal worker");
            return None;
        }
    };

    // Create withdrawal worker - runtime settings come from SettingsService (DB)
    // Only company_currency stays in config (env var)
    use services::{WithdrawalWorker, WithdrawalWorkerConfig};
    let worker_config = WithdrawalWorkerConfig {
        company_currency: config.privacy.company_currency.clone(),
    };
    let worker = WithdrawalWorker::new(
        storage.deposit_repo.clone(),
        storage.withdrawal_history_repo.clone(),
        sidecar,
        note_encryption,
        notification_service,
        settings_service,
        worker_config,
    );

    Some(worker.start(cancel_token))
}

/// Create a micro batch worker for SOL micro deposits.
///
/// Returns `Some(JoinHandle)` if privacy is enabled and treasury is configured,
/// `None` otherwise. The worker polls for pending micro deposits and batches them
/// when the accumulated value reaches the threshold ($10).
///
/// Runtime-tunable settings (poll_interval, threshold_usd) are read from the database
/// via SettingsService.
pub fn create_micro_batch_worker(
    config: &Config,
    storage: &Storage,
    settings_service: Arc<SettingsService>,
    cancel_token: tokio_util::sync::CancellationToken,
) -> Option<tokio::task::JoinHandle<()>> {
    if !config.privacy.enabled {
        return None;
    }

    // Create sidecar client
    let sidecar = match build_privacy_sidecar_client(config) {
        Ok(s) => Arc::new(s),
        Err(e) => {
            tracing::error!(error = %e, "Failed to create privacy sidecar client for micro batch worker");
            return None;
        }
    };

    // S-05: Gracefully handle missing key instead of panicking
    let encryption_key = match config.privacy.note_encryption_key.as_ref() {
        Some(k) => k,
        None => {
            tracing::error!("note_encryption_key is required when privacy is enabled");
            return None;
        }
    };
    let key_bytes = match decode_note_encryption_key(encryption_key) {
        Ok(k) => k,
        Err(e) => {
            tracing::error!(error = %e, "Invalid base64 in note_encryption_key");
            return None;
        }
    };
    let note_encryption = match build_note_encryption_service(
        &key_bytes,
        &config.privacy.note_encryption_key_id,
    ) {
        Ok(s) => Arc::new(s),
        Err(e) => {
            tracing::error!(error = %e, "Failed to create note encryption service for micro batch worker");
            return None;
        }
    };

    // Create sol price service
    let sol_price_service = Arc::new(services::SolPriceService::new());

    // Create the worker
    use services::MicroBatchWorker;
    let worker = MicroBatchWorker::new(
        storage.deposit_repo.clone(),
        storage.treasury_config_repo.clone(),
        sidecar,
        sol_price_service,
        note_encryption,
        settings_service,
        config.privacy.company_currency.clone(),
    );

    Some(worker.start(cancel_token))
}

/// Create a hold expiration worker for credit holds.
///
/// This worker periodically expires stale credit holds that have exceeded their TTL,
/// releasing the held credits back to users' available balance.
///
/// Returns the JoinHandle for the background task.
pub fn create_hold_expiration_worker(
    storage: &Storage,
    cancel_token: tokio_util::sync::CancellationToken,
) -> tokio::task::JoinHandle<()> {
    use services::{HoldExpirationConfig, HoldExpirationWorker};

    let worker = HoldExpirationWorker::new(
        storage.credit_repo.clone(),
        storage.credit_hold_repo.clone(),
        HoldExpirationConfig::default(),
    );

    worker.start(cancel_token)
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::Engine;

    fn base_config() -> Config {
        use crate::config::{
            default_access_expiry, default_audience, default_issuer, default_refresh_expiry,
            AppleConfig, CookieConfig, CorsConfig, DatabaseConfig, EmailConfig, GoogleConfig,
            JwtConfig, NotificationConfig, PrivacyConfig, RateLimitConfig, ServerConfig,
            SolanaConfig, SsoConfig, WalletConfig, WebAuthnConfig, WebhookConfig,
        };

        Config {
            server: ServerConfig::default(),
            jwt: JwtConfig {
                secret: "s".repeat(32),
                rsa_private_key_pem: None,
                issuer: default_issuer(),
                audience: default_audience(),
                access_token_expiry: default_access_expiry(),
                refresh_token_expiry: default_refresh_expiry(),
            },
            email: EmailConfig::default(),
            google: GoogleConfig {
                enabled: false,
                client_id: None,
            },
            apple: AppleConfig {
                enabled: false,
                client_id: None,
                team_id: None,
            },
            solana: SolanaConfig::default(),
            webauthn: WebAuthnConfig::default(),
            cors: CorsConfig::default(),
            cookie: CookieConfig::default(),
            webhook: WebhookConfig::default(),
            rate_limit: RateLimitConfig::default(),
            database: DatabaseConfig::default(),
            notification: NotificationConfig::default(),
            sso: SsoConfig::default(),
            wallet: WalletConfig::default(),
            privacy: PrivacyConfig::default(),
        }
    }

    #[test]
    fn test_decode_note_encryption_key_valid() {
        let key = base64::engine::general_purpose::STANDARD.encode([0u8; 32]);
        let bytes = decode_note_encryption_key(&key).expect("valid base64 should decode");
        assert_eq!(bytes.len(), 32);
        assert!(bytes.iter().all(|byte| *byte == 0));
    }

    #[test]
    fn test_decode_note_encryption_key_invalid() {
        assert!(decode_note_encryption_key("not-base64").is_err());
    }

    #[test]
    fn test_build_privacy_sidecar_client_requires_api_key() {
        let mut config = base_config();
        config.privacy.enabled = true;
        config.privacy.sidecar_api_key = None;

        match build_privacy_sidecar_client(&config) {
            Ok(_) => panic!("expected error for missing SIDECAR_API_KEY"),
            Err(err) => {
                assert!(err.to_string().contains("SIDECAR_API_KEY is required"));
            }
        }
    }

    #[test]
    fn test_build_privacy_sidecar_client_with_api_key() {
        let mut config = base_config();
        config.privacy.enabled = true;
        config.privacy.sidecar_api_key = Some("test-key".to_string());

        assert!(build_privacy_sidecar_client(&config).is_ok());
    }

    #[test]
    fn test_preload_settings_cache_populates_cached_values() {
        let storage = Storage::in_memory();
        let settings_service = Arc::new(SettingsService::new(storage.system_settings_repo));
        let runtime = tokio::runtime::Builder::new_multi_thread()
            .worker_threads(1)
            .enable_all()
            .build()
            .expect("runtime");

        runtime.block_on(async {
            preload_settings_cache(&settings_service);
        });

        assert!(settings_service
            .get_cached_u32_sync("rate_limit_auth")
            .is_some());
    }
}
