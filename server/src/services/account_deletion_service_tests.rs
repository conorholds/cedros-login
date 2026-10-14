use super::account_deletion_service::delete_account;
use crate::config::{
    default_access_expiry, default_audience, default_issuer, default_refresh_expiry, AppleConfig,
    CookieConfig, CorsConfig, DatabaseConfig, EmailConfig, GoogleConfig, JwtConfig,
    NotificationConfig, RateLimitConfig, ServerConfig, SolanaConfig, SsoConfig, WebAuthnConfig,
    WebhookConfig,
};
use crate::models::AuthMethod;
use crate::repositories::{MembershipEntity, OrgEntity, OrgRole, SessionEntity, UserEntity};
use crate::services::{
    AuditService, CommsService, EncryptionService, GoogleService, InviteCodeService, JwtService,
    LogEmailService, MfaAttemptService, OidcService, PasswordService, SettingsService,
    SolanaService, StepUpService, TotpService, WebAuthnService,
};
use crate::utils::TokenCipher;
use crate::{AppState, Config, NoopCallback, Storage};
use chrono::{Duration, Utc};
use std::sync::Arc;
use uuid::Uuid;

fn base_config() -> Config {
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
        apple: AppleConfig::default(),
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

fn build_state() -> Arc<AppState<NoopCallback, LogEmailService>> {
    let config = base_config();
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
    let now = Utc::now();
    state
        .user_repo
        .create(UserEntity {
            id: Uuid::new_v4(),
            email: Some(email.to_string()),
            email_verified: true,
            password_hash: Some("password-hash".to_string()),
            name: Some("Test User".to_string()),
            username: None,
            picture: None,
            wallet_address: None,
            google_id: None,
            apple_id: None,
            auth_methods: vec![AuthMethod::Email],
            is_system_admin: false,
            created_at: now,
            updated_at: now,
            last_login_at: Some(now),
            welcome_completed_at: None,
            referral_code: format!("REF{}", Uuid::new_v4().simple()),
            referred_by: None,
        })
        .await
        .unwrap()
}

#[tokio::test]
async fn deletes_user_and_single_member_org() {
    let state = build_state();
    let user = create_user(&state, "delete@example.com").await;
    let org = OrgEntity::new(
        "Solo Org".to_string(),
        "solo-org".to_string(),
        user.id,
        false,
    );
    state.org_repo.create(org.clone()).await.unwrap();
    state
        .membership_repo
        .create(MembershipEntity::new_owner(user.id, org.id))
        .await
        .unwrap();
    state
        .session_repo
        .create(SessionEntity::new(
            user.id,
            "refresh-hash".to_string(),
            Utc::now() + Duration::days(1),
            None,
            None,
        ))
        .await
        .unwrap();

    let outcome = delete_account(&state, user.id, None).await.unwrap();

    assert_eq!(outcome.deleted_org_names, vec!["Solo Org".to_string()]);
    let deleted_user = state.user_repo.find_by_id(user.id).await.unwrap().unwrap();
    assert!(deleted_user.is_deleted());
    assert!(deleted_user.email.is_none());
    assert!(state.org_repo.find_by_id(org.id).await.unwrap().is_none());
    let sessions = state.session_repo.find_by_user_id(user.id).await.unwrap();
    assert_eq!(sessions.len(), 1);
    assert!(sessions[0].is_revoked());
}

#[tokio::test]
async fn blocks_delete_when_shared_org_needs_owner_transfer() {
    let state = build_state();
    let owner = create_user(&state, "owner@example.com").await;
    let member = create_user(&state, "member@example.com").await;
    let org = OrgEntity::new(
        "Shared Org".to_string(),
        "shared-org".to_string(),
        owner.id,
        false,
    );
    state.org_repo.create(org.clone()).await.unwrap();
    state
        .membership_repo
        .create(MembershipEntity::new_owner(owner.id, org.id))
        .await
        .unwrap();
    state
        .membership_repo
        .create(MembershipEntity::new(member.id, org.id, OrgRole::Member))
        .await
        .unwrap();

    let error = delete_account(&state, owner.id, None).await.unwrap_err();
    let message = error.to_string();
    assert!(message.contains("Transfer ownership of 'Shared Org'"));

    let owner_after = state.user_repo.find_by_id(owner.id).await.unwrap().unwrap();
    assert!(!owner_after.is_deleted());
    let memberships = state.membership_repo.find_by_user(owner.id).await.unwrap();
    assert_eq!(memberships.len(), 1);
}
