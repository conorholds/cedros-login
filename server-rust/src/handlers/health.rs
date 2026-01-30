//! Health check handler
//!
//! REL-001: Enhanced health check that verifies database connectivity
//! when the postgres feature is enabled.

use axum::{extract::State, http::StatusCode, Json};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::models::HealthResponse;
use crate::services::EmailService;
use crate::AppState;

/// Health check endpoint
///
/// Returns basic health status and version. When the postgres feature is enabled,
/// also checks database connectivity and returns appropriate status:
/// - "healthy": All systems operational
/// - "degraded": Database unreachable but service running
///
/// # HTTP Status Codes
/// - 200: Healthy or degraded (service is running)
/// - 503: Would be returned if critical systems fail (future enhancement)
pub async fn health_check<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
) -> (StatusCode, Json<HealthResponse>) {
    #[cfg(feature = "postgres")]
    let (status, database) = {
        if let Some(pool) = &state.postgres_pool {
            // REL-001: Perform a lightweight database connectivity check
            match sqlx::query("SELECT 1").execute(pool).await {
                Ok(_) => ("healthy".to_string(), Some("connected".to_string())),
                Err(e) => {
                    tracing::warn!(error = %e, "Health check: database connectivity failed");
                    ("degraded".to_string(), Some("unreachable".to_string()))
                }
            }
        } else {
            // In-memory mode, no database to check
            ("healthy".to_string(), None)
        }
    };

    #[cfg(not(feature = "postgres"))]
    let (status, database) = ("healthy".to_string(), None::<String>);

    (
        StatusCode::OK,
        Json(HealthResponse {
            status,
            version: env!("CARGO_PKG_VERSION").to_string(),
            database,
        }),
    )
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
        let jwt_service = JwtService::new(&config.jwt);
        let password_service = PasswordService::default();
        let google_service = GoogleService::new(&config.google);
        let apple_service = AppleService::new(&config.apple);
        let solana_service = SolanaService::new(&config.solana, "Cedros Login".to_string());
        let totp_service = TotpService::new("Cedros");
        let webauthn_service = WebAuthnService::new(&config.webauthn);
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
            credential_repo: storage.credential_repo.clone(),
            webauthn_repo: storage.webauthn_repo.clone(),
            deposit_repo: storage.deposit_repo.clone(),
            credit_repo: storage.credit_repo.clone(),
            credit_hold_repo: storage.credit_hold_repo.clone(),
            credit_refund_request_repo: storage.credit_refund_request_repo.clone(),
            privacy_note_repo: storage.privacy_note_repo.clone(),
            system_settings_repo: storage.system_settings_repo.clone(),
            settings_service: std::sync::Arc::new(crate::services::SettingsService::new(
                storage.system_settings_repo.clone(),
            )),
            mfa_attempt_service: MfaAttemptService::new(),
            step_up_service,
            wallet_signing_service: WalletSigningService::new(),
            wallet_unlock_cache: create_wallet_unlock_cache(),
            treasury_config_repo: storage.treasury_config_repo.clone(),
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
    }
}
