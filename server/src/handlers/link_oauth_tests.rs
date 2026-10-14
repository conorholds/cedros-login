use super::*;
use axum::http::{header, HeaderMap, HeaderValue};
use chrono::{Duration, Utc};
use std::sync::Arc;

use crate::config::{
    AppleConfig, CookieConfig, CorsConfig, DatabaseConfig, EmailConfig, GoogleConfig, JwtConfig,
    NotificationConfig, RateLimitConfig, ServerConfig, SolanaConfig, SsoConfig, WebAuthnConfig,
    WebhookConfig,
};
use crate::repositories::{SessionEntity, UserEntity};
use crate::services::{
    AuditService, CommsService, EncryptionService, GoogleService, InviteCodeService, JwtService,
    LogEmailService, MfaAttemptService, OidcService, PasswordService, SettingsService,
    SolanaService, StepUpService, TokenContext, TotpService, WebAuthnService,
};
use crate::utils::TokenCipher;
use crate::{AppState, Config, NoopCallback, Storage};

fn test_config() -> Config {
    Config {
        server: ServerConfig::default(),
        jwt: JwtConfig {
            secret: "test-secret-key-for-link-oauth-tests".to_string(),
            rsa_private_key_pem: None,
            issuer: "cedros-login-test".to_string(),
            audience: "test-app".to_string(),
            access_token_expiry: 900,
            refresh_token_expiry: 604800,
        },
        email: EmailConfig::default(),
        google: GoogleConfig {
            enabled: true,
            client_id: Some("test-google-client".to_string()),
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
        cookie: CookieConfig {
            enabled: false,
            ..CookieConfig::default()
        },
        webhook: WebhookConfig::default(),
        rate_limit: RateLimitConfig::default(),
        database: DatabaseConfig::default(),
        notification: NotificationConfig::default(),
        sso: SsoConfig::default(),
    }
}

fn build_state() -> Arc<AppState<NoopCallback, LogEmailService>> {
    let config = test_config();
    let storage = Storage::in_memory();
    let settings_service = Arc::new(SettingsService::new(storage.system_settings_repo.clone()));
    let token_cipher = TokenCipher::new(&config.jwt.secret);
    let invite_code_service =
        InviteCodeService::new(storage.invite_code_repo.clone(), settings_service.clone());
    let subscription_selection_service =
        crate::services::SubscriptionSelectionService::new(settings_service.clone());

    Arc::new(AppState {
        jwt_service: JwtService::new(&config.jwt),
        password_service: PasswordService::default(),
        google_service: GoogleService::new(&config.google),
        apple_service: crate::services::AppleService::new(&config.apple),
        solana_service: SolanaService::new(&config.solana),
        totp_service: TotpService::new("Cedros"),
        webauthn_service: WebAuthnService::new(&config.webauthn, settings_service.clone()),
        oidc_service: OidcService::new("http://localhost:8080/auth/sso/callback".to_string()),
        encryption_service: EncryptionService::from_secret(&config.jwt.secret),
        audit_service: AuditService::new(storage.audit_repo.clone(), false),
        comms_service: CommsService::new(
            storage.outbox_repo.clone(),
            "http://localhost:3000".to_string(),
            token_cipher,
        ),
        invite_code_service,
        subscription_selection_service,
        signup_limit_service: crate::services::SignupLimitService::new(
            storage.user_repo.clone(),
            settings_service.clone(),
        ),
        login_attempt_config: crate::repositories::LoginAttemptConfig::default(),
        mfa_attempt_service: MfaAttemptService::new(),
        step_up_service: StepUpService::new(storage.session_repo.clone()),
        config,
        callback: Arc::new(NoopCallback),
        phantom_email: std::marker::PhantomData::<LogEmailService>,
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
        totp_repo: storage.totp_repo.clone(),
        custom_role_repo: storage.custom_role_repo.clone(),
        policy_repo: storage.policy_repo.clone(),
        outbox_repo: storage.outbox_repo.clone(),
        api_key_repo: storage.api_key_repo.clone(),
        credential_repo: storage.credential_repo.clone(),
        webauthn_repo: storage.webauthn_repo.clone(),
        system_settings_repo: storage.system_settings_repo.clone(),
        settings_service,
        storage,
        #[cfg(feature = "postgres")]
        postgres_pool: None,
    })
}

async fn create_user(
    state: &Arc<AppState<NoopCallback, LogEmailService>>,
    email: &str,
) -> UserEntity {
    let hash = state
        .password_service
        .hash("SecurePass1!".to_string())
        .await
        .unwrap();
    let mut user = UserEntity::new_email_user(email.to_string(), hash, None);
    user.email_verified = true;
    state.user_repo.create(user).await.unwrap()
}

async fn bearer_headers(
    state: &Arc<AppState<NoopCallback, LogEmailService>>,
    user_id: uuid::Uuid,
    stepped_up: bool,
) -> HeaderMap {
    let session_id = uuid::Uuid::new_v4();
    let tokens = state
        .jwt_service
        .generate_token_pair_with_context(
            user_id,
            session_id,
            &TokenContext {
                email_verified: Some(true),
                ..TokenContext::default()
            },
        )
        .unwrap();
    let mut session = SessionEntity::new_with_id(
        session_id,
        user_id,
        "refresh-hash".to_string(),
        Utc::now() + Duration::hours(1),
        None,
        None,
    );
    if stepped_up {
        session.last_strong_auth_at = Some(Utc::now());
    }
    state.session_repo.create(session).await.unwrap();

    let mut headers = HeaderMap::new();
    headers.insert(
        header::AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {}", tokens.access_token)).unwrap(),
    );
    headers
}

fn link_request(password: Option<&str>) -> LinkOAuthRequest {
    LinkOAuthRequest {
        id_token: Some("already-verified-by-handler".to_string()),
        access_token: None,
        provider: "google".to_string(),
        authorization_code: None,
        nonce: None,
        password: password.map(str::to_string),
    }
}

#[tokio::test]
async fn session_with_step_up_links_oauth_without_password() {
    let state = build_state();
    let user = create_user(&state, "session-link@example.com").await;
    let headers = bearer_headers(&state, user.id, true).await;
    let req = link_request(None);

    let target = resolve_link_target(&state, &headers, &req, "google-new@example.com", None)
        .await
        .unwrap();
    assert!(matches!(target.proof, LinkProof::Session(_)));
    let updated = link_verified_oauth_to_user(
        &state,
        target.user,
        AuthMethod::Google,
        "google-sub-session".to_string(),
    )
    .await
    .unwrap();

    assert_eq!(updated.id, user.id);
    assert_eq!(updated.google_id.as_deref(), Some("google-sub-session"));
    assert!(updated.auth_methods.contains(&AuthMethod::Google));
}

#[tokio::test]
async fn session_without_step_up_is_rejected() {
    let state = build_state();
    let user = create_user(&state, "session-no-step-up@example.com").await;
    let headers = bearer_headers(&state, user.id, false).await;
    let req = link_request(None);

    let err = resolve_link_target(&state, &headers, &req, "google-new@example.com", None)
        .await
        .unwrap_err();

    assert!(matches!(err, AppError::StepUpRequired));
}

#[tokio::test]
async fn password_path_still_resolves_user_without_session() {
    let state = build_state();
    let user = create_user(&state, "password-link@example.com").await;
    let req = link_request(Some("SecurePass1!"));

    let target = resolve_link_target(
        &state,
        &HeaderMap::new(),
        &req,
        "password-link@example.com",
        None,
    )
    .await
    .unwrap();

    assert_eq!(target.proof, LinkProof::Password);
    assert_eq!(target.user.id, user.id);
}

#[tokio::test]
async fn oauth_sub_linked_to_another_user_is_conflict() {
    let state = build_state();
    let mut existing = create_user(&state, "existing-google@example.com").await;
    existing.google_id = Some("shared-google-sub".to_string());
    state.user_repo.update(existing).await.unwrap();
    let target = create_user(&state, "target-google@example.com").await;

    let err = link_verified_oauth_to_user(
        &state,
        target,
        AuthMethod::Google,
        "shared-google-sub".to_string(),
    )
    .await
    .unwrap_err();

    assert!(matches!(err, AppError::OAuthAccountExists));
    assert_eq!(
        err.into_response().status(),
        axum::http::StatusCode::CONFLICT
    );
}
