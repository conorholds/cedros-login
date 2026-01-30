//! Admin credit adjustment handlers

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use serde::Serialize;
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::handlers::admin::users::validate_system_admin;
use crate::models::{AdjustCreditsRequest, AdjustCreditsResponse};
use crate::services::{CreditService, EmailService};
use crate::AppState;

/// Credit stats for a single currency (API response)
#[derive(Debug, Clone, Serialize)]
pub struct CurrencyCreditStatsResponse {
    /// Total credited amount (lamports for SOL, micros for USD)
    pub total_credited: i64,
    /// Total spent amount
    pub total_spent: i64,
    /// Total positive adjustments (refunds, bonuses)
    pub total_positive_adjustments: i64,
    /// Total negative adjustments (corrections)
    pub total_negative_adjustments: i64,
    /// Current outstanding balance
    pub current_outstanding: i64,
    /// Number of deposit transactions
    pub deposit_count: u64,
    /// Number of spend transactions
    pub spend_count: u64,
    /// Number of adjustment transactions
    pub adjustment_count: u64,
    /// Display values (human readable)
    pub total_credited_display: f64,
    pub total_spent_display: f64,
    pub current_outstanding_display: f64,
}

/// Admin credit stats response
#[derive(Debug, Clone, Serialize)]
pub struct AdminCreditStatsResponse {
    /// SOL credit stats
    pub sol: CurrencyCreditStatsResponse,
    /// USD credit stats
    pub usd: CurrencyCreditStatsResponse,
    /// Total users with any credit balance
    pub total_users_with_balance: u64,
    /// Total outstanding credits (lamports)
    pub total_outstanding_lamports: i64,
    /// Total outstanding (display)
    pub total_outstanding_sol: f64,
}

/// GET /admin/credits/stats - Get aggregate credit statistics
///
/// Returns overall credit system statistics:
/// - Total credited vs total spent by currency
/// - Outstanding balances
/// - Transaction counts
pub async fn get_stats<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<AdminCreditStatsResponse>, AppError> {
    let _admin_id = validate_system_admin(&state, &headers).await?;

    let stats = state.credit_repo.get_stats().await?;

    // SOL: 9 decimals (lamports)
    let sol_divisor = 1_000_000_000.0;
    // USD: 6 decimals (micros, matching USDC/USDT)
    let usd_divisor = 1_000_000.0;

    Ok(Json(AdminCreditStatsResponse {
        sol: CurrencyCreditStatsResponse {
            total_credited: stats.sol.total_credited,
            total_spent: stats.sol.total_spent,
            total_positive_adjustments: stats.sol.total_positive_adjustments,
            total_negative_adjustments: stats.sol.total_negative_adjustments,
            current_outstanding: stats.sol.current_outstanding,
            deposit_count: stats.sol.deposit_count,
            spend_count: stats.sol.spend_count,
            adjustment_count: stats.sol.adjustment_count,
            total_credited_display: stats.sol.total_credited as f64 / sol_divisor,
            total_spent_display: stats.sol.total_spent as f64 / sol_divisor,
            current_outstanding_display: stats.sol.current_outstanding as f64 / sol_divisor,
        },
        usd: CurrencyCreditStatsResponse {
            total_credited: stats.usd.total_credited,
            total_spent: stats.usd.total_spent,
            total_positive_adjustments: stats.usd.total_positive_adjustments,
            total_negative_adjustments: stats.usd.total_negative_adjustments,
            current_outstanding: stats.usd.current_outstanding,
            deposit_count: stats.usd.deposit_count,
            spend_count: stats.usd.spend_count,
            adjustment_count: stats.usd.adjustment_count,
            total_credited_display: stats.usd.total_credited as f64 / usd_divisor,
            total_spent_display: stats.usd.total_spent as f64 / usd_divisor,
            current_outstanding_display: stats.usd.current_outstanding as f64 / usd_divisor,
        },
        total_users_with_balance: stats.total_users_with_balance,
        total_outstanding_lamports: stats.total_outstanding_lamports,
        total_outstanding_sol: stats.total_outstanding_lamports as f64 / sol_divisor,
    }))
}

/// POST /admin/users/:user_id/credits - Adjust a user's credit balance
///
/// Requires system admin privileges. Used for:
/// - Refunds
/// - Bonus credits
/// - Promotional credits
/// - Manual corrections
///
/// Positive amounts add credits, negative amounts remove credits.
pub async fn adjust_credits<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
    Json(request): Json<AdjustCreditsRequest>,
) -> Result<Json<AdjustCreditsResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    // Verify target user exists
    let _target_user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    // Create credit service
    let credit_service =
        CreditService::new(state.credit_repo.clone(), state.credit_hold_repo.clone());

    // Perform the adjustment
    let result = credit_service
        .adjust(
            admin_id,
            user_id,
            request.amount_lamports,
            &request.currency,
            &request.reason,
            request.reference_type.as_deref(),
            request.reference_id,
        )
        .await?;

    // Format display value
    let sol_amount = result.new_balance_lamports as f64 / 1_000_000_000.0;
    let display = format!("{:.4} SOL", sol_amount);

    // Log the adjustment for audit trail
    tracing::info!(
        admin_id = %admin_id,
        user_id = %user_id,
        amount_lamports = result.amount_lamports,
        currency = %request.currency,
        reason = %request.reason,
        reference_type = ?request.reference_type,
        transaction_id = %result.transaction_id,
        "Admin credit adjustment"
    );

    Ok(Json(AdjustCreditsResponse {
        transaction_id: result.transaction_id,
        new_balance_lamports: result.new_balance_lamports,
        amount_lamports: result.amount_lamports,
        currency: request.currency,
        display,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::{header, HeaderValue};
    use chrono::Utc;
    use std::sync::Arc;
    use uuid::Uuid;

    use crate::config::{
        default_access_expiry, default_audience, default_issuer, default_refresh_expiry,
        AppleConfig, CookieConfig, CorsConfig, DatabaseConfig, EmailConfig, GoogleConfig,
        JwtConfig, NotificationConfig, PrivacyConfig, RateLimitConfig, ServerConfig, SolanaConfig,
        SsoConfig, WalletConfig, WebAuthnConfig, WebhookConfig,
    };
    use crate::repositories::{generate_api_key, ApiKeyEntity, LoginAttemptConfig, UserEntity};
    use crate::services::{
        create_wallet_unlock_cache, AppleService, AuditService, CommsService, GoogleService,
        JwtService, LogEmailService, MfaAttemptService, PasswordService, SolanaService,
        TotpService, WalletSigningService, WebAuthnService,
    };
    use crate::utils::TokenCipher;
    use crate::{AppState, Config, NoopCallback, Storage};

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

    async fn setup_admin_with_api_key(
        state: &Arc<AppState<NoopCallback, LogEmailService>>,
    ) -> (Uuid, String) {
        let now = Utc::now();
        let user = UserEntity {
            id: Uuid::new_v4(),
            email: Some("admin@example.com".to_string()),
            email_verified: true,
            password_hash: None,
            name: None,
            picture: None,
            wallet_address: None,
            google_id: None,
            apple_id: None,
            stripe_customer_id: None,
            auth_methods: vec![],
            is_system_admin: true,
            created_at: now,
            updated_at: now,
        };
        let user = state.user_repo.create(user).await.unwrap();

        let api_key = generate_api_key();
        let api_key_entity = ApiKeyEntity::new(user.id, &api_key);
        state.api_key_repo.create(api_key_entity).await.unwrap();

        (user.id, api_key)
    }

    async fn setup_regular_user(state: &Arc<AppState<NoopCallback, LogEmailService>>) -> Uuid {
        let now = Utc::now();
        let user = UserEntity {
            id: Uuid::new_v4(),
            email: Some("user@example.com".to_string()),
            email_verified: true,
            password_hash: None,
            name: None,
            picture: None,
            wallet_address: None,
            google_id: None,
            apple_id: None,
            stripe_customer_id: None,
            auth_methods: vec![],
            is_system_admin: false,
            created_at: now,
            updated_at: now,
        };
        let user = state.user_repo.create(user).await.unwrap();
        user.id
    }

    #[tokio::test]
    async fn test_adjust_credits_add() {
        let config = base_config();
        let state = build_state(config);
        let (_admin_id, api_key) = setup_admin_with_api_key(&state).await;
        let user_id = setup_regular_user(&state).await;

        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", api_key)).unwrap(),
        );

        let request = AdjustCreditsRequest {
            amount_lamports: 1_000_000_000, // 1 SOL
            currency: "SOL".to_string(),
            reason: "Welcome bonus".to_string(),
            reference_type: Some("bonus".to_string()),
            reference_id: None,
        };

        let result = adjust_credits(State(state.clone()), headers, Path(user_id), Json(request))
            .await
            .unwrap();

        assert_eq!(result.0.amount_lamports, 1_000_000_000);
        assert_eq!(result.0.new_balance_lamports, 1_000_000_000);
        assert_eq!(result.0.currency, "SOL");
    }

    #[tokio::test]
    async fn test_adjust_credits_requires_admin() {
        let config = base_config();
        let state = build_state(config);

        // Create non-admin user with API key
        let now = Utc::now();
        let user = UserEntity {
            id: Uuid::new_v4(),
            email: Some("nonadmin@example.com".to_string()),
            email_verified: true,
            password_hash: None,
            name: None,
            picture: None,
            wallet_address: None,
            google_id: None,
            apple_id: None,
            stripe_customer_id: None,
            auth_methods: vec![],
            is_system_admin: false,
            created_at: now,
            updated_at: now,
        };
        let user = state.user_repo.create(user).await.unwrap();
        let api_key = generate_api_key();
        let api_key_entity = ApiKeyEntity::new(user.id, &api_key);
        state.api_key_repo.create(api_key_entity).await.unwrap();

        let target_user_id = setup_regular_user(&state).await;

        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", api_key)).unwrap(),
        );

        let request = AdjustCreditsRequest {
            amount_lamports: 1_000_000_000,
            currency: "SOL".to_string(),
            reason: "Should fail".to_string(),
            reference_type: None,
            reference_id: None,
        };

        let result =
            adjust_credits(State(state), headers, Path(target_user_id), Json(request)).await;

        assert!(matches!(result, Err(AppError::Forbidden(_))));
    }

    #[tokio::test]
    async fn test_adjust_credits_user_not_found() {
        let config = base_config();
        let state = build_state(config);
        let (_admin_id, api_key) = setup_admin_with_api_key(&state).await;

        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", api_key)).unwrap(),
        );

        let request = AdjustCreditsRequest {
            amount_lamports: 1_000_000_000,
            currency: "SOL".to_string(),
            reason: "Should fail".to_string(),
            reference_type: None,
            reference_id: None,
        };

        let result = adjust_credits(
            State(state),
            headers,
            Path(Uuid::new_v4()), // Non-existent user
            Json(request),
        )
        .await;

        assert!(matches!(result, Err(AppError::NotFound(_))));
    }
}
