//! Health check handler
//!
//! Enhanced health check that verifies database connectivity
//! when the postgres feature is enabled.

use axum::{extract::State, http::StatusCode, Extension, Json};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::middleware::rate_limit::RateLimitStore;
#[cfg(feature = "redis-rate-limit")]
use crate::middleware::rate_limit::RedisRateLimitStore;
use crate::models::HealthResponse;
use crate::services::{EmailDeliveryCapability, EmailService};
use crate::AppState;

#[cfg(feature = "postgres")]
async fn database_health<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
) -> (Option<String>, bool) {
    if let Some(pool) = &state.postgres_pool {
        match sqlx::query("SELECT 1").execute(pool).await {
            Ok(_) => (Some("connected".to_string()), false),
            Err(e) => {
                tracing::warn!(error = %e, "Health check: database connectivity failed");
                (Some("unreachable".to_string()), true)
            }
        }
    } else {
        (None, false)
    }
}

#[cfg(not(feature = "postgres"))]
async fn database_health<C: AuthCallback, E: EmailService>(
    _state: &Arc<AppState<C, E>>,
) -> (Option<String>, bool) {
    (None, false)
}

async fn rate_limit_health<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
) -> (Option<String>, Option<String>, bool) {
    if !state.config.rate_limit.enabled {
        return (None, None, false);
    }

    let backend = Some(state.config.rate_limit.store.clone());
    match state.config.rate_limit.store.as_str() {
        "memory" => {
            if RateLimitStore::is_multi_instance_environment() {
                (backend, Some("unshared_multi_instance".to_string()), true)
            } else {
                (backend, Some("ready".to_string()), false)
            }
        }
        "redis" => {
            #[cfg(feature = "redis-rate-limit")]
            {
                let Some(redis_url) = state.config.rate_limit.redis_url.as_deref() else {
                    tracing::warn!("Health check: REDIS_URL missing while RATE_LIMIT_STORE=redis");
                    return (backend, Some("misconfigured".to_string()), true);
                };

                let store = match RedisRateLimitStore::new(redis_url) {
                    Ok(store) => store,
                    Err(e) => {
                        tracing::warn!(
                            error = %e,
                            "Health check: Redis rate limit backend misconfigured"
                        );
                        return (backend, Some("misconfigured".to_string()), true);
                    }
                };

                match store.ping().await {
                    Ok(()) => (backend, Some("connected".to_string()), false),
                    Err(e) => {
                        tracing::warn!(
                            error = %e,
                            "Health check: Redis rate limit backend unreachable"
                        );
                        (backend, Some("unreachable".to_string()), true)
                    }
                }
            }

            #[cfg(not(feature = "redis-rate-limit"))]
            {
                (backend, Some("unsupported".to_string()), true)
            }
        }
        _ => (backend, Some("invalid".to_string()), true),
    }
}

fn email_delivery_degraded<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    capability: EmailDeliveryCapability,
) -> bool {
    if capability.can_deliver_in(&state.config.notification.environment) {
        return false;
    }

    tracing::warn!(
        capability = ?capability,
        "Health check: transactional email delivery is unavailable"
    );
    true
}

async fn build_health_response<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    capability: EmailDeliveryCapability,
) -> HealthResponse {
    let (database, database_degraded) = database_health(state).await;
    let (rate_limit_backend, rate_limit_status, rate_limit_degraded) =
        rate_limit_health(state).await;
    let email_delivery_degraded = email_delivery_degraded(state, capability);

    let status = if database_degraded || rate_limit_degraded || email_delivery_degraded {
        "degraded".to_string()
    } else {
        "healthy".to_string()
    };

    HealthResponse {
        status,
        version: env!("CARGO_PKG_VERSION").to_string(),
        email_delivery: capability.diagnostic().to_string(),
        database,
        rate_limit_backend,
        rate_limit_status,
    }
}

/// Health check endpoint.
///
/// Returns overall service status while tolerating degraded dependencies so the
/// process remains introspectable during incidents.
pub async fn health_check<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
) -> (StatusCode, Json<HealthResponse>) {
    (
        StatusCode::OK,
        Json(build_health_response(&state, EmailDeliveryCapability::Delivering).await),
    )
}

pub(crate) async fn health_check_with_delivery<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    Extension(capability): Extension<EmailDeliveryCapability>,
) -> (StatusCode, Json<HealthResponse>) {
    (
        StatusCode::OK,
        Json(build_health_response(&state, capability).await),
    )
}

/// Readiness endpoint.
///
/// Returns `503` when required infrastructure for handling traffic is degraded.
pub async fn readiness_check<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
) -> (StatusCode, Json<HealthResponse>) {
    readiness_response(&state, EmailDeliveryCapability::Delivering).await
}

pub(crate) async fn readiness_check_with_delivery<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    Extension(capability): Extension<EmailDeliveryCapability>,
) -> (StatusCode, Json<HealthResponse>) {
    readiness_response(&state, capability).await
}

async fn readiness_response<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    capability: EmailDeliveryCapability,
) -> (StatusCode, Json<HealthResponse>) {
    let response = build_health_response(state, capability).await;
    let status = if response.status == "healthy" {
        StatusCode::OK
    } else {
        StatusCode::SERVICE_UNAVAILABLE
    };

    (status, Json(response))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::{
        default_access_expiry, default_audience, default_issuer, default_refresh_expiry,
        AppleConfig, CookieConfig, CorsConfig, DatabaseConfig, EmailConfig, GoogleConfig,
        JwtConfig, NotificationConfig, RateLimitConfig, ServerConfig, SolanaConfig, SsoConfig,
        WebAuthnConfig, WebhookConfig,
    };
    use crate::repositories::LoginAttemptConfig;
    use crate::services::{
        AppleService, AuditService, CommsService, EmailDeliveryCapability, GoogleService,
        InviteCodeService, JwtService, LogEmailService, MfaAttemptService, PasswordService,
        SolanaService, TotpService, WebAuthnService,
    };
    use crate::test_env::{clear_env, lock_env_async, set_env};
    use crate::utils::TokenCipher;
    use crate::{Config, NoopCallback, Storage};

    fn base_config() -> Config {
        Config {
            server: ServerConfig {
                host: "127.0.0.1".to_string(),
                port: 3001,
                auth_base_path: "/auth".to_string(),
                frontend_url: None,
                sso_callback_url: None,
                bootstrap_admin_email: None,
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

    fn build_state(config: Config) -> Arc<AppState<NoopCallback, LogEmailService>> {
        let storage = Storage::in_memory();
        let settings_service = std::sync::Arc::new(crate::services::SettingsService::new(
            storage.system_settings_repo.clone(),
        ));
        let jwt_service = JwtService::new(&config.jwt);
        let password_service = PasswordService::default();
        let google_service = GoogleService::new(&config.google);
        let apple_service = AppleService::new(&config.apple);
        let solana_service = SolanaService::new(&config.solana);
        let totp_service = TotpService::new("Cedros");
        let webauthn_service = WebAuthnService::new(&config.webauthn, settings_service.clone());
        let oidc_service = crate::services::OidcService::new(
            "http://localhost:8080/auth/sso/callback".to_string(),
        );
        let encryption_service =
            crate::services::EncryptionService::from_secret(&config.jwt.secret);
        let audit_service = AuditService::new(storage.audit_repo.clone(), false);
        let step_up_service = crate::services::StepUpService::new(storage.session_repo.clone());
        let token_cipher = TokenCipher::new(&config.jwt.secret);
        let comms_service = CommsService::new(
            storage.outbox_repo.clone(),
            "http://localhost:3000".to_string(),
            token_cipher,
        );
        let invite_code_service =
            InviteCodeService::new(storage.invite_code_repo.clone(), settings_service.clone());
        let subscription_selection_service =
            crate::services::SubscriptionSelectionService::new(settings_service.clone());

        Arc::new(AppState {
            config,
            callback: Arc::new(NoopCallback),
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
            invite_code_service,
            subscription_selection_service,
            signup_limit_service: crate::services::SignupLimitService::new(
                storage.user_repo.clone(),
                settings_service.clone(),
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
            settings_service: settings_service.clone(),
            mfa_attempt_service: MfaAttemptService::new(),
            step_up_service,
            #[cfg(feature = "postgres")]
            postgres_pool: storage.pg_pool.clone(),
            storage,
        })
    }

    #[tokio::test]
    async fn test_health_check_in_memory() {
        let _lock = lock_env_async().await;
        let _replicas = clear_env("REPLICAS");
        let config = base_config();
        let state = build_state(config);

        let (status_code, Json(response)) = health_check(State(state)).await;

        assert_eq!(status_code, StatusCode::OK);
        assert_eq!(response.status, "healthy");
        assert_eq!(response.email_delivery, "provider");
        assert!(!response.version.is_empty());
        // In-memory mode has no database field
        assert!(response.database.is_none());
        assert_eq!(response.rate_limit_backend.as_deref(), Some("memory"));
        assert_eq!(response.rate_limit_status.as_deref(), Some("ready"));
    }

    #[test]
    fn legacy_app_state_shape_still_builds_create_router() {
        let state = build_state(base_config());
        let _router = crate::create_router(state);
    }

    #[tokio::test]
    async fn test_readiness_check_in_memory() {
        let _lock = lock_env_async().await;
        let _replicas = clear_env("REPLICAS");
        let config = base_config();
        let state = build_state(config);

        let (status_code, Json(response)) = readiness_check_with_delivery(
            State(state),
            Extension(EmailDeliveryCapability::DevelopmentLog),
        )
        .await;

        assert_eq!(status_code, StatusCode::OK);
        assert_eq!(response.status, "healthy");
        assert_eq!(response.email_delivery, "development_log");
    }

    #[tokio::test]
    async fn test_readiness_allows_log_email_in_local_environment() {
        let _lock = lock_env_async().await;
        let _replicas = clear_env("REPLICAS");
        let mut config = base_config();
        config.notification.environment = "local".to_string();
        config.email.enabled = true;
        let state = build_state(config);
        state
            .settings_service
            .set("auth_email_enabled", "true", "auth.email", None)
            .await
            .unwrap();

        let (status_code, Json(response)) = readiness_check_with_delivery(
            State(state),
            Extension(EmailDeliveryCapability::DevelopmentLog),
        )
        .await;

        assert_eq!(status_code, StatusCode::OK);
        assert_eq!(response.status, "healthy");
        assert_eq!(response.email_delivery, "development_log");
    }

    #[tokio::test]
    async fn test_readiness_rejects_production_log_email_when_email_auth_is_enabled() {
        let _lock = lock_env_async().await;
        let _replicas = clear_env("REPLICAS");
        let mut config = base_config();
        config.notification.environment = "production".to_string();
        config.email.enabled = true;
        let state = build_state(config);
        state
            .settings_service
            .set("auth_email_enabled", "true", "auth.email", None)
            .await
            .unwrap();

        let (status_code, Json(response)) = readiness_check_with_delivery(
            State(state),
            Extension(EmailDeliveryCapability::DevelopmentLog),
        )
        .await;

        assert_eq!(status_code, StatusCode::SERVICE_UNAVAILABLE);
        assert_eq!(response.status, "degraded");
        assert_eq!(response.email_delivery, "development_log");
    }

    #[tokio::test]
    async fn test_readiness_requires_delivery_for_non_auth_transactional_email() {
        let _lock = lock_env_async().await;
        let _replicas = clear_env("REPLICAS");
        let mut config = base_config();
        config.notification.environment = "production".to_string();
        config.email.enabled = false;
        let state = build_state(config);
        state
            .settings_service
            .set("auth_email_enabled", "false", "auth.email", None)
            .await
            .unwrap();

        let (status_code, Json(response)) = readiness_check_with_delivery(
            State(state),
            Extension(EmailDeliveryCapability::Unavailable),
        )
        .await;

        assert_eq!(status_code, StatusCode::SERVICE_UNAVAILABLE);
        assert_eq!(response.status, "degraded");
        assert_eq!(response.email_delivery, "unavailable");
    }

    #[tokio::test]
    async fn test_readiness_check_memory_multi_instance_is_degraded() {
        let _lock = lock_env_async().await;
        let _replicas = set_env("REPLICAS", Some("2"));
        let config = base_config();
        let state = build_state(config);

        let (status_code, Json(response)) = readiness_check(State(state)).await;

        assert_eq!(status_code, StatusCode::SERVICE_UNAVAILABLE);
        assert_eq!(response.status, "degraded");
        assert_eq!(response.rate_limit_backend.as_deref(), Some("memory"));
        assert_eq!(
            response.rate_limit_status.as_deref(),
            Some("unshared_multi_instance")
        );
    }
}
