//! Health check handler
//!
//! REL-001: Enhanced health check that verifies database connectivity
//! when the postgres feature is enabled.

use axum::{extract::State, http::StatusCode, Json};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::middleware::rate_limit::RateLimitStore;
#[cfg(feature = "redis-rate-limit")]
use crate::middleware::rate_limit::RedisRateLimitStore;
use crate::models::HealthResponse;
use crate::services::EmailService;
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

async fn build_health_response<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
) -> HealthResponse {
    let (database, database_degraded) = database_health(state).await;
    let (rate_limit_backend, rate_limit_status, rate_limit_degraded) =
        rate_limit_health(state).await;

    let status = if database_degraded || rate_limit_degraded {
        "degraded".to_string()
    } else {
        "healthy".to_string()
    };

    HealthResponse {
        status,
        version: env!("CARGO_PKG_VERSION").to_string(),
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
    (StatusCode::OK, Json(build_health_response(&state).await))
}

/// Readiness endpoint.
///
/// Returns `503` when required infrastructure for handling traffic is degraded.
pub async fn readiness_check<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
) -> (StatusCode, Json<HealthResponse>) {
    let response = build_health_response(&state).await;
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
        JwtConfig, NotificationConfig, PrivacyConfig, RateLimitConfig, ServerConfig, SolanaConfig,
        SsoConfig, WalletConfig, WebAuthnConfig, WebhookConfig,
    };
    use crate::repositories::LoginAttemptConfig;
    use crate::services::{
        create_wallet_unlock_cache, AppleService, AuditService, CommsService, GoogleService,
        JwtService, LogEmailService, MfaAttemptService, PasswordService, SolanaService,
        TotpService, WalletSigningService, WebAuthnService,
    };
    use crate::utils::TokenCipher;
    use crate::{Config, NoopCallback, Storage};
    use std::sync::Mutex;

    struct EnvGuard {
        key: &'static str,
        previous: Option<String>,
    }

    impl Drop for EnvGuard {
        fn drop(&mut self) {
            if let Some(value) = &self.previous {
                unsafe { std::env::set_var(self.key, value) };
            } else {
                unsafe { std::env::remove_var(self.key) };
            }
        }
    }

    fn set_env(key: &'static str, value: &str) -> EnvGuard {
        let previous = std::env::var(key).ok();
        unsafe { std::env::set_var(key, value) };
        EnvGuard { key, previous }
    }

    static ENV_LOCK: Mutex<()> = Mutex::new(());

    fn base_config() -> Config {
        Config {
            server: ServerConfig {
                host: "127.0.0.1".to_string(),
                port: 3001,
                auth_base_path: "/auth".to_string(),
                frontend_url: None,
                sso_callback_url: None,
                bootstrap_admin_email: None,
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
            settings_service: settings_service.clone(),
            mfa_attempt_service: MfaAttemptService::new(),
            step_up_service,
            wallet_signing_service: WalletSigningService::new(),
            wallet_unlock_cache: create_wallet_unlock_cache(),
            treasury_config_repo: storage.treasury_config_repo.clone(),
            user_withdrawal_log_repo: storage.user_withdrawal_log_repo.clone(),
            privacy_sidecar_client: None,
            note_encryption_service: None,
            sol_price_service: std::sync::Arc::new(crate::services::SolPriceService::new()),
            jupiter_swap_service: None,
            deposit_credit_service: {
                let settings_service = std::sync::Arc::new(crate::services::SettingsService::new(
                    storage.system_settings_repo.clone(),
                ));
                let sol_price_service =
                    std::sync::Arc::new(crate::services::SolPriceService::new());
                let fee_service =
                    std::sync::Arc::new(crate::services::DepositFeeService::new(settings_service));
                std::sync::Arc::new(crate::services::DepositCreditService::new(
                    sol_price_service,
                    fee_service,
                    "USDC".to_string(),
                ))
            },
            referral_payout_repo: storage.referral_payout_repo.clone(),
            referral_code_history_repo: storage.referral_code_history_repo.clone(),
            kyc_service: None,
            accreditation_service: None,
            sanctions_service: std::sync::Arc::new(crate::services::SanctionsService::new(
                settings_service.clone(),
            )),
            token_gating_service: std::sync::Arc::new(crate::services::TokenGatingService::new(
                settings_service.clone(),
                storage.user_repo.clone(),
                storage.wallet_material_repo.clone(),
            )),
            signup_gating_service: std::sync::Arc::new(crate::services::SignupGatingService::new(
                storage.access_code_repo.clone(),
                storage.user_repo.clone(),
                settings_service.clone(),
            )),
            #[cfg(feature = "postgres")]
            postgres_pool: storage.pg_pool.clone(),
            storage,
        })
    }

    #[tokio::test]
    async fn test_health_check_in_memory() {
        let config = base_config();
        let state = build_state(config);

        let (status_code, Json(response)) = health_check(State(state)).await;

        assert_eq!(status_code, StatusCode::OK);
        assert_eq!(response.status, "healthy");
        assert!(!response.version.is_empty());
        // In-memory mode has no database field
        assert!(response.database.is_none());
        assert_eq!(response.rate_limit_backend.as_deref(), Some("memory"));
        assert_eq!(response.rate_limit_status.as_deref(), Some("ready"));
    }

    #[tokio::test]
    async fn test_readiness_check_in_memory() {
        let config = base_config();
        let state = build_state(config);

        let (status_code, Json(response)) = readiness_check(State(state)).await;

        assert_eq!(status_code, StatusCode::OK);
        assert_eq!(response.status, "healthy");
    }

    #[tokio::test]
    async fn test_readiness_check_memory_multi_instance_is_degraded() {
        let _lock = ENV_LOCK.lock().unwrap();
        let _replicas = set_env("REPLICAS", "2");
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
