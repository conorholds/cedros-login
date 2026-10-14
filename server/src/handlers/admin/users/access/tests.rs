use super::validate_system_admin;
use axum::http::{header, HeaderMap, HeaderValue};
use chrono::{Duration, Utc};
use std::sync::Arc;
use uuid::Uuid;

use crate::config::{
    default_access_expiry, default_audience, default_issuer, default_refresh_expiry, AppleConfig,
    CookieConfig, CorsConfig, DatabaseConfig, EmailConfig, GoogleConfig, JwtConfig,
    NotificationConfig, RateLimitConfig, ServerConfig, SolanaConfig, SsoConfig, WebAuthnConfig,
    WebhookConfig,
};
use crate::errors::AppError;
use crate::repositories::{
    generate_api_key, ApiKeyEntity, InMemorySystemSettingsRepository, LoginAttemptConfig,
    SessionEntity, UserEntity,
};
use crate::services::{
    AppleService, AuditService, CommsService, EncryptionService, GoogleService, InviteCodeService,
    JwtService, LogEmailService, MfaAttemptService, OidcService, PasswordService, SettingsService,
    SolanaService, StepUpService, SubscriptionSelectionService, TokenContext, TotpService,
    WebAuthnService,
};
use crate::utils::TokenCipher;
use crate::{AppState, Config, NoopCallback, Storage};

fn base_config(bootstrap_email: Option<String>) -> Config {
    Config {
        server: ServerConfig {
            host: "127.0.0.1".to_string(),
            port: 3001,
            auth_base_path: "/auth".to_string(),
            frontend_url: None,
            sso_callback_url: None,
            bootstrap_admin_email: bootstrap_email,
            setup_token: None,
            trust_proxy: false,
        },
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
            ..AppleConfig::default()
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
    }
}

struct StateServices {
    settings: Arc<SettingsService>,
    jwt: JwtService,
    password: PasswordService,
    google: GoogleService,
    apple: AppleService,
    solana: SolanaService,
    totp: TotpService,
    webauthn: WebAuthnService,
    oidc: OidcService,
    encryption: EncryptionService,
    audit: AuditService,
    comms: CommsService,
    invites: InviteCodeService,
    subscriptions: SubscriptionSelectionService,
    step_up: StepUpService,
}

impl StateServices {
    fn new(config: &Config, storage: &Storage) -> Self {
        let settings = Arc::new(SettingsService::new(storage.system_settings_repo.clone()));
        Self {
            jwt: JwtService::new(&config.jwt),
            password: PasswordService::default(),
            google: GoogleService::new(&config.google),
            apple: AppleService::new(&config.apple),
            solana: SolanaService::new(&config.solana),
            totp: TotpService::new("Cedros"),
            webauthn: WebAuthnService::new(&config.webauthn, settings.clone()),
            oidc: OidcService::new("http://localhost:8080/auth/sso/callback".to_string()),
            encryption: EncryptionService::from_secret(&config.jwt.secret),
            audit: AuditService::new(storage.audit_repo.clone(), false),
            comms: CommsService::new(
                storage.outbox_repo.clone(),
                "http://localhost:3000".to_string(),
                TokenCipher::new(&config.jwt.secret),
            ),
            invites: InviteCodeService::new(storage.invite_code_repo.clone(), settings.clone()),
            subscriptions: SubscriptionSelectionService::new(settings.clone()),
            step_up: StepUpService::new(storage.session_repo.clone()),
            settings,
        }
    }
}

fn build_state(config: Config) -> Arc<AppState<NoopCallback, LogEmailService>> {
    let mut storage = Storage::in_memory();
    storage.system_settings_repo = Arc::new(InMemorySystemSettingsRepository::new());
    let services = StateServices::new(&config, &storage);
    state_from_parts(config, storage, services)
}

fn state_from_parts(
    config: Config,
    storage: Storage,
    services: StateServices,
) -> Arc<AppState<NoopCallback, LogEmailService>> {
    Arc::new(AppState {
        config,
        callback: Arc::new(NoopCallback),
        jwt_service: services.jwt,
        password_service: services.password,
        google_service: services.google,
        apple_service: services.apple,
        solana_service: services.solana,
        totp_service: services.totp,
        webauthn_service: services.webauthn,
        oidc_service: services.oidc,
        encryption_service: services.encryption,
        phantom_email: std::marker::PhantomData::<LogEmailService>,
        audit_service: services.audit,
        comms_service: services.comms,
        invite_code_service: services.invites,
        subscription_selection_service: services.subscriptions,
        signup_limit_service: crate::services::SignupLimitService::new(
            storage.user_repo.clone(),
            services.settings.clone(),
        ),
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
        settings_service: services.settings,
        mfa_attempt_service: MfaAttemptService::new(),
        step_up_service: services.step_up,
        #[cfg(feature = "postgres")]
        postgres_pool: storage.pg_pool.clone(),
        storage,
    })
}

fn test_user(email: &str, verified: bool, is_admin: bool) -> UserEntity {
    let now = Utc::now();
    UserEntity {
        id: Uuid::new_v4(),
        email: Some(email.to_string()),
        email_verified: verified,
        password_hash: None,
        name: None,
        username: None,
        picture: None,
        wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec![],
        is_system_admin: is_admin,
        created_at: now,
        updated_at: now,
        last_login_at: None,
        welcome_completed_at: None,
        referral_code: "TESTCODE".to_string(),
        referred_by: None,
    }
}

async fn setup_user_with_api_key(
    state: &Arc<AppState<NoopCallback, LogEmailService>>,
    email: &str,
    email_verified: bool,
) -> (Uuid, String) {
    let user = state
        .user_repo
        .create(test_user(email, email_verified, false))
        .await
        .unwrap();
    let api_key = generate_api_key();
    state
        .api_key_repo
        .create(ApiKeyEntity::new(user.id, &api_key, "default"))
        .await
        .unwrap();
    (user.id, api_key)
}

async fn setup_user_with_jwt(
    state: &Arc<AppState<NoopCallback, LogEmailService>>,
    email: &str,
    email_verified: bool,
    db_is_system_admin: bool,
    token_is_system_admin: Option<bool>,
) -> (Uuid, String) {
    let user = state
        .user_repo
        .create(test_user(email, email_verified, db_is_system_admin))
        .await
        .unwrap();
    let session_id = Uuid::new_v4();
    state
        .session_repo
        .create(SessionEntity::new_with_id(
            session_id,
            user.id,
            "refresh_hash".to_string(),
            Utc::now() + Duration::hours(1),
            None,
            None,
        ))
        .await
        .unwrap();
    let context = TokenContext {
        is_system_admin: token_is_system_admin,
        ..TokenContext::default()
    };
    let token = state
        .jwt_service
        .generate_access_token_with_context(user.id, session_id, &context)
        .unwrap();
    (user.id, token)
}

fn bearer_headers(token: &str) -> HeaderMap {
    let mut headers = HeaderMap::new();
    headers.insert(
        header::AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {token}")).unwrap(),
    );
    headers
}

#[tokio::test]
async fn bootstrap_admin_requires_verified_email() {
    let state = build_state(base_config(Some("admin@example.com".to_string())));
    let (user_id, token) =
        setup_user_with_jwt(&state, "admin@example.com", false, false, None).await;
    let result = validate_system_admin(&state, &bearer_headers(&token)).await;
    assert!(matches!(result, Err(AppError::Forbidden(_))));
    assert!(
        !state
            .user_repo
            .find_by_id(user_id)
            .await
            .unwrap()
            .unwrap()
            .is_system_admin
    );
}

#[tokio::test]
async fn bootstrap_admin_promotes_verified_email() {
    let mut config = base_config(Some("admin@example.com".to_string()));
    config.email.require_verification = true;
    let state = build_state(config);
    let (user_id, token) =
        setup_user_with_jwt(&state, "admin@example.com", true, false, None).await;
    assert!(validate_system_admin(&state, &bearer_headers(&token))
        .await
        .is_ok());
    assert!(
        state
            .user_repo
            .find_by_id(user_id)
            .await
            .unwrap()
            .unwrap()
            .is_system_admin
    );
}

#[tokio::test]
async fn bootstrap_admin_rejects_when_verification_disabled() {
    let state = build_state(base_config(Some("admin@example.com".to_string())));
    let (user_id, token) =
        setup_user_with_jwt(&state, "admin@example.com", true, false, None).await;
    let result = validate_system_admin(&state, &bearer_headers(&token)).await;
    assert!(matches!(result, Err(AppError::Forbidden(_))));
    assert!(
        !state
            .user_repo
            .find_by_id(user_id)
            .await
            .unwrap()
            .unwrap()
            .is_system_admin
    );
}

#[tokio::test]
async fn bootstrap_admin_rejects_cyrillic_lookalike() {
    let state = build_state(base_config(Some("admin@example.com".to_string())));
    let cyrillic_email = "\u{0430}dmin@example.com";
    let (user_id, token) = setup_user_with_jwt(&state, cyrillic_email, true, false, None).await;
    let result = validate_system_admin(&state, &bearer_headers(&token)).await;
    assert!(matches!(result, Err(AppError::Forbidden(_))));
    assert!(
        !state
            .user_repo
            .find_by_id(user_id)
            .await
            .unwrap()
            .unwrap()
            .is_system_admin
    );
}

#[tokio::test]
async fn validate_system_admin_allows_current_db_admin_even_with_jwt_claim() {
    let state = build_state(base_config(None));
    let (user_id, token) =
        setup_user_with_jwt(&state, "admin@example.com", true, true, Some(true)).await;
    let result = validate_system_admin(&state, &bearer_headers(&token)).await;
    assert_eq!(result.unwrap(), user_id);
}

#[tokio::test]
async fn validate_system_admin_rejects_stale_jwt_admin_claim_after_demotion() {
    let state = build_state(base_config(None));
    let (_, token) =
        setup_user_with_jwt(&state, "demoted@example.com", true, false, Some(true)).await;
    let result = validate_system_admin(&state, &bearer_headers(&token)).await;
    assert!(matches!(result, Err(AppError::InvalidToken)));
}

#[tokio::test]
async fn system_admin_api_key_is_not_an_admin_session() {
    let state = build_state(base_config(None));
    let (user_id, api_key) = setup_user_with_api_key(&state, "admin@example.com", true).await;
    state
        .user_repo
        .set_system_admin(user_id, true)
        .await
        .unwrap();

    let result = validate_system_admin(&state, &bearer_headers(&api_key)).await;
    assert!(matches!(result, Err(AppError::Forbidden(_))));
}
