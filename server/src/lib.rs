#![recursion_limit = "256"]

//! # Cedros Login Server
//!
//! Authentication and account server library for Cedros Login.
//!
//! ## Features
//!
//! - **Email/Password**: Registration, login, verification, password reset, and password changes
//! - **OAuth**: Google and Apple ID token verification plus OAuth credential linking
//! - **Solana Wallet**: Sign-in by signing a challenge message with an Ed25519 wallet
//! - **Passkeys and MFA**: WebAuthn/passkeys, TOTP setup, recovery codes, and step-up auth
//! - **Account APIs**: Profiles, usernames, sessions, credentials, API keys, and account deletion
//! - **Organizations**: Memberships, invites, custom roles, ABAC policies, and audit logs
//! - **Admin Runtime**: System settings, SSO providers, invite codes, user management, and metrics
//!
//! ## Usage
//!
//! ### Standalone Server
//!
//! Run the binary directly:
//! ```bash
//! cedros-login
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

pub mod autosave;
pub mod callback;
pub mod config;
pub mod domain;
pub mod errors;
mod extension_ai_surface;
mod extension_events;
mod extension_jobs;
mod extension_manifest;
mod extension_manifest_capabilities;
mod extension_manifest_database_access;
mod extension_manifest_metadata;
mod extension_onboarding;
mod extension_server_routes;
mod extension_setup_seeds;
mod extension_starters;
mod extension_visual_builder;
pub mod handlers;
pub mod middleware;
pub mod models;
pub mod repositories;
pub mod services;
pub mod settings_registry;
pub mod storage;
pub mod utils;

mod router;

#[cfg(test)]
pub(crate) mod test_env;

pub use callback::{AuthCallback, AuthCallbackPayload, NoopCallback};
pub use config::{Config, DatabaseConfig, NotificationConfig};
pub use errors::AppError;
pub use extension_events::{
    registration_created_event, user_login_event, CedrosLoginServerEvent,
    CEDROS_LOGIN_REGISTRATION_CREATED_EVENT_ID, CEDROS_LOGIN_USER_LOGIN_EVENT_ID,
};
pub use extension_manifest::{
    register_extension_family, CedrosExtensionCapabilityManifest,
    CedrosExtensionCapabilityScopeManifest, CedrosExtensionCompatibilityManifest,
    CedrosExtensionDependenciesManifest, CedrosExtensionFamilyDependencyManifest,
    CedrosExtensionManifest, CedrosExtensionPackageFamily, CedrosExtensionPackageRef,
    CedrosExtensionPackageSurface, CedrosExtensionRegistrationManifest,
    CedrosExtensionServerSurfaceManifest, CedrosExtensionServiceDependencyManifest,
    CedrosExtensionSurfaceRegistrationManifest, CedrosExtensionSurfacesManifest,
    CEDROS_EXTENSION_PLATFORM_API_VERSION, CEDROS_LOGIN_EXTENSION_ID,
    CEDROS_LOGIN_EXTENSION_VERSION, CEDROS_LOGIN_SERVER_REGISTRATION_ENTRYPOINT,
};
pub use extension_manifest_metadata::{
    CedrosExtensionAdminModuleManifest, CedrosExtensionAnalyticsManifest,
    CedrosExtensionDatabaseAccessManifest, CedrosExtensionProviderAccessManifest,
};
pub use extension_onboarding::CedrosExtensionOnboardingPageManifest;
pub use extension_setup_seeds::{
    CedrosExtensionNotificationAudience, CedrosExtensionNotificationChannelKind,
    CedrosExtensionNotificationSeedManifest, CedrosExtensionNotificationSeverity,
    CedrosExtensionSetupSeedsManifest,
};
pub use extension_starters::{
    CedrosExtensionDocsArticleManifest, CedrosExtensionFormTemplateManifest,
};
pub use extension_visual_builder::{
    CedrosExtensionContentBlockManifest, CedrosExtensionContentTemplateManifest,
    CedrosExtensionPageSeedManifest, CedrosExtensionSeoManifest,
};
pub use router::create_router;
pub use services::NotificationService;
pub use services::{
    EmailDeliveryCapability, EmailDeliveryContext, EmailDeliveryReceipt, EmailService,
    InstantLinkEmailData, LogEmailService, NoopEmailService, PasswordResetEmailData,
    VerificationEmailData, EMAIL_DELIVERY_CONTRACT_VERSION,
};
#[cfg(feature = "postgres")]
pub use sqlx::PgPool;
pub use storage::Storage;

use axum::Router;
use repositories::{
    ApiKeyRepository, AuditLogRepository, CredentialRepository, CustomRoleRepository,
    InviteCodeRepository, InviteRepository, LoginAttemptConfig, LoginAttemptRepository,
    MembershipRepository, NonceRepository, OrgRepository, OutboxRepository, PolicyRepository,
    SessionRepository, SystemSettingsRepository, TotpRepository, UserEmailRepository,
    UserRepository, VerificationRepository, WebAuthnRepository,
};
use services::{
    AppleService, AuditService, CommsService, EncryptionService, GoogleService, InviteCodeService,
    JwtService, MfaAttemptService, OidcService, PasswordService, SettingsService,
    SignupLimitService, SolanaService, StepUpService, SubscriptionSelectionService, TotpService,
    WebAuthnService,
};
use std::sync::Arc;
use utils::TokenCipher;

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
    pub invite_code_service: InviteCodeService,
    pub subscription_selection_service: SubscriptionSelectionService,
    pub signup_limit_service: SignupLimitService,
    pub user_repo: Arc<dyn UserRepository>,
    pub user_email_repo: Arc<dyn UserEmailRepository>,
    pub session_repo: Arc<dyn SessionRepository>,
    pub nonce_repo: Arc<dyn NonceRepository>,
    pub verification_repo: Arc<dyn VerificationRepository>,
    pub org_repo: Arc<dyn OrgRepository>,
    pub membership_repo: Arc<dyn MembershipRepository>,
    pub invite_repo: Arc<dyn InviteRepository>,
    pub invite_code_repo: Arc<dyn InviteCodeRepository>,
    pub audit_repo: Arc<dyn AuditLogRepository>,
    pub login_attempt_repo: Arc<dyn LoginAttemptRepository>,
    pub login_attempt_config: LoginAttemptConfig,
    pub totp_repo: Arc<dyn TotpRepository>,
    pub custom_role_repo: Arc<dyn CustomRoleRepository>,
    pub policy_repo: Arc<dyn PolicyRepository>,
    pub outbox_repo: Arc<dyn OutboxRepository>,
    pub api_key_repo: Arc<dyn ApiKeyRepository>,
    pub credential_repo: Arc<dyn CredentialRepository>,
    pub webauthn_repo: Arc<dyn WebAuthnRepository>,
    /// System settings repository for runtime-configurable values
    pub system_settings_repo: Arc<dyn SystemSettingsRepository>,
    /// Settings service with caching for runtime configuration
    pub settings_service: Arc<SettingsService>,
    /// Per-user MFA attempt tracking to prevent brute-force
    pub mfa_attempt_service: MfaAttemptService,
    pub step_up_service: StepUpService,
    /// Storage layer for accessing repositories
    pub storage: Storage,
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
/// This compatibility entrypoint cannot prove that the embedding host drains
/// the outbox, so health reports email delivery as unavailable and production
/// readiness fails closed. Hosts with a real provider and active drain must use
/// [`router_with_storage_and_email_delivery`] with an explicit capability.
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
    router_with_storage_and_email_delivery(
        config,
        callback,
        storage,
        EmailDeliveryCapability::Unavailable,
    )
}

/// Create the authentication router with an explicit outbound-email capability.
///
/// Standalone composition uses this so readiness can fail closed if runtime
/// settings enable email authentication after startup without a real provider.
pub fn router_with_storage_and_email_delivery<C: AuthCallback + 'static>(
    config: Config,
    callback: Arc<C>,
    storage: Storage,
    email_delivery_capability: EmailDeliveryCapability,
) -> Router {
    let encryption_service = EncryptionService::from_secret(&config.jwt.secret);
    let settings_service = Arc::new(SettingsService::with_encryption(
        storage.system_settings_repo.clone(),
        encryption_service.clone(),
    ));
    preload_settings_cache(&settings_service);

    build_router_with_settings(
        config,
        callback,
        storage,
        settings_service,
        encryption_service,
        email_delivery_capability,
    )
}

/// Create the authentication router with a complete, preloaded settings snapshot.
///
/// Standalone startup uses this after merging and validating restart settings.
/// Reusing the same service avoids a second fallible settings read during
/// composition and keeps the router and background workers on one cache.
pub fn router_with_preloaded_settings_and_email_delivery<C: AuthCallback + 'static>(
    config: Config,
    callback: Arc<C>,
    storage: Storage,
    settings_service: Arc<SettingsService>,
    email_delivery_capability: EmailDeliveryCapability,
) -> Router {
    let encryption_service = EncryptionService::from_secret(&config.jwt.secret);
    build_router_with_settings(
        config,
        callback,
        storage,
        settings_service,
        encryption_service,
        email_delivery_capability,
    )
}

struct RouterServices {
    jwt: JwtService,
    password: PasswordService,
    google: GoogleService,
    apple: AppleService,
    solana: SolanaService,
    totp: TotpService,
    webauthn: WebAuthnService,
    oidc: OidcService,
    audit: AuditService,
    comms: CommsService,
    invite_code: InviteCodeService,
    subscription_selection: SubscriptionSelectionService,
    signup_limit: SignupLimitService,
    step_up: StepUpService,
}

impl RouterServices {
    fn new(config: &Config, storage: &Storage, settings: Arc<SettingsService>) -> Self {
        let signup_limit = SignupLimitService::new(storage.user_repo.clone(), settings.clone());
        #[cfg(feature = "postgres")]
        let signup_limit = signup_limit.with_postgres_pool(storage.pg_pool.clone());

        Self {
            jwt: JwtService::new(&config.jwt),
            password: PasswordService::default(),
            google: GoogleService::new(&config.google),
            apple: AppleService::new(&config.apple),
            solana: SolanaService::new(&config.solana),
            totp: TotpService::new("Cedros"),
            webauthn: WebAuthnService::new(&config.webauthn, settings.clone()),
            oidc: OidcService::new(sso_callback_url(config)),
            audit: AuditService::new(storage.audit_repo.clone(), config.server.trust_proxy),
            comms: comms_service(config, storage),
            invite_code: InviteCodeService::new(storage.invite_code_repo.clone(), settings.clone()),
            subscription_selection: SubscriptionSelectionService::new(settings),
            signup_limit,
            step_up: StepUpService::new(storage.session_repo.clone()),
        }
    }
}

fn sso_callback_url(config: &Config) -> String {
    let protocol = if config
        .server
        .frontend_url
        .as_ref()
        .is_some_and(|url| url.starts_with("https://"))
    {
        "https"
    } else {
        "http"
    };
    config.server.sso_callback_url.clone().unwrap_or_else(|| {
        format!(
            "{}://{}:{}/auth/sso/callback",
            protocol, config.server.host, config.server.port
        )
    })
}

fn comms_service(config: &Config, storage: &Storage) -> CommsService {
    let base_url = config
        .server
        .frontend_url
        .clone()
        .unwrap_or_else(|| "http://localhost:57164".to_string());
    CommsService::new(
        storage.outbox_repo.clone(),
        base_url,
        TokenCipher::new(&config.jwt.secret),
    )
}

fn build_router_with_settings<C: AuthCallback + 'static>(
    config: Config,
    callback: Arc<C>,
    storage: Storage,
    settings_service: Arc<SettingsService>,
    encryption_service: EncryptionService,
    email_delivery_capability: EmailDeliveryCapability,
) -> Router {
    let services = RouterServices::new(&config, &storage, settings_service.clone());

    let state = Arc::new(AppState {
        config,
        callback,
        jwt_service: services.jwt,
        password_service: services.password,
        google_service: services.google,
        apple_service: services.apple,
        solana_service: services.solana,
        totp_service: services.totp,
        webauthn_service: services.webauthn,
        oidc_service: services.oidc,
        encryption_service,
        phantom_email: std::marker::PhantomData::<LogEmailService>,
        audit_service: services.audit,
        comms_service: services.comms,
        invite_code_service: services.invite_code,
        subscription_selection_service: services.subscription_selection,
        signup_limit_service: services.signup_limit,
        user_repo: storage.user_repo.clone(),
        user_email_repo: storage.user_email_repo.clone(),
        session_repo: storage.session_repo.clone(),
        nonce_repo: storage.nonce_repo.clone(),
        verification_repo: storage.verification_repo.clone(),
        org_repo: storage.org_repo.clone(),
        membership_repo: storage.membership_repo.clone(),
        invite_repo: storage.invite_repo.clone(),
        invite_code_repo: storage.invite_code_repo.clone(),
        audit_repo: storage.audit_repo.clone(),
        login_attempt_repo: storage.login_attempt_repo.clone(),
        login_attempt_config: LoginAttemptConfig::default(),
        totp_repo: storage.totp_repo.clone(),
        custom_role_repo: storage.custom_role_repo.clone(),
        policy_repo: storage.policy_repo.clone(),
        outbox_repo: storage.outbox_repo.clone(),
        api_key_repo: storage.api_key_repo.clone(),
        credential_repo: storage.credential_repo.clone(),
        webauthn_repo: storage.webauthn_repo.clone(),
        system_settings_repo: storage.system_settings_repo.clone(),
        settings_service: settings_service.clone(),
        mfa_attempt_service: MfaAttemptService::new(),
        step_up_service: services.step_up,
        #[cfg(feature = "postgres")]
        postgres_pool: storage.pg_pool.clone(),
        storage,
    });
    router::create_router_with_email_delivery(state, email_delivery_capability)
}

#[cfg(test)]
mod tests {
    use super::*;

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
