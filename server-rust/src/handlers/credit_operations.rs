//! Server-to-server credit operation handlers
//!
//! These endpoints are designed for service-to-service communication (e.g., cedros-pay).
//! All endpoints require API key authentication with system admin privileges.
//!
//! POST /credits/spend/{user_id}      - Direct spend (debit credits immediately)
//! POST /credits/hold/{user_id}       - Create a hold (reserve credits)
//! POST /credits/capture/{hold_id}    - Capture a hold (finalize spend)
//! POST /credits/release/{hold_id}    - Release a hold (return credits)

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::handlers::admin::validate_system_admin;
use crate::models::{
    CaptureHoldResponse, CreateHoldRequest, CreateHoldResponse, ReleaseHoldResponse,
    SpendCreditsRequest, SpendCreditsResponse,
};
use crate::services::{CreditService, EmailService};
use crate::utils::{validate_currency, validate_metadata_no_secrets, validate_reference_type};
use crate::AppState;

/// POST /credits/spend/{user_id} - Spend credits directly
///
/// Debit credits from a user's account immediately. This is a one-step operation.
/// Use idempotency keys to prevent duplicate charges on retries.
///
/// For two-phase commits (authorize then capture), use hold + capture instead.
pub async fn spend_credits<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
    Json(request): Json<SpendCreditsRequest>,
) -> Result<Json<SpendCreditsResponse>, AppError> {
    // Validate admin API key
    let admin_id = validate_system_admin(&state, &headers).await?;

    // Validate metadata doesn't contain secrets
    validate_metadata_no_secrets(request.metadata.as_ref())?;

    // SRV-13: Validate reference_type against known types
    validate_reference_type(&request.reference_type)?;

    // SRV-14: Validate currency against whitelist
    validate_currency(&request.currency)?;

    // Verify target user exists
    let _target_user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    // Create credit service
    let credit_service =
        CreditService::new(state.credit_repo.clone(), state.credit_hold_repo.clone());

    // Execute spend
    let result = credit_service
        .spend(
            user_id,
            request.amount_lamports,
            &request.currency,
            request.idempotency_key,
            &request.reference_type,
            request.reference_id,
            request.metadata,
        )
        .await?;

    tracing::info!(
        admin_id = %admin_id,
        user_id = %user_id,
        amount_lamports = result.amount_lamports,
        currency = %request.currency,
        reference_type = %request.reference_type,
        reference_id = %request.reference_id,
        transaction_id = %result.transaction_id,
        "Credit spend operation"
    );

    Ok(Json(SpendCreditsResponse::from_result(
        result,
        &request.currency,
    )))
}

/// POST /credits/hold/{user_id} - Create a credit hold
///
/// Reserve credits for a future capture. The held amount is deducted from the
/// user's available balance but not yet spent.
///
/// Holds automatically expire after the TTL (default 15 minutes).
/// Use capture() to finalize the spend, or release() to return the credits.
pub async fn create_hold<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
    Json(request): Json<CreateHoldRequest>,
) -> Result<Json<CreateHoldResponse>, AppError> {
    // Validate admin API key
    let admin_id = validate_system_admin(&state, &headers).await?;

    // Validate metadata doesn't contain secrets
    validate_metadata_no_secrets(request.metadata.as_ref())?;

    // SRV-13: Validate reference_type against known types (if provided)
    if let Some(ref rt) = request.reference_type {
        validate_reference_type(rt)?;
    }

    // SRV-14: Validate currency against whitelist
    validate_currency(&request.currency)?;

    // Verify target user exists
    let _target_user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    // SRV-12: Validate TTL bounds (1-60 minutes). ttl=0 would create an already-expired hold.
    if request.ttl_minutes < 1 || request.ttl_minutes > 60 {
        return Err(AppError::Validation(
            "ttl_minutes must be between 1 and 60".into(),
        ));
    }
    let ttl_minutes = request.ttl_minutes;

    // Create credit service
    let credit_service =
        CreditService::new(state.credit_repo.clone(), state.credit_hold_repo.clone());

    // Create hold
    let result = credit_service
        .hold(
            user_id,
            request.amount_lamports,
            &request.currency,
            request.idempotency_key.clone(),
            Some(ttl_minutes),
            request.reference_type.as_deref(),
            request.reference_id,
            request.metadata,
        )
        .await?;

    tracing::info!(
        admin_id = %admin_id,
        user_id = %user_id,
        hold_id = %result.hold_id,
        amount_lamports = result.amount_lamports,
        currency = %request.currency,
        is_new = result.is_new,
        expires_at = %result.expires_at,
        "Credit hold created"
    );

    Ok(Json(CreateHoldResponse::from_result(
        result,
        &request.currency,
    )))
}

/// POST /credits/capture/{hold_id} - Capture a hold
///
/// Finalize a previously created hold, converting it to a spend transaction.
/// The held amount is permanently deducted from the user's balance.
pub async fn capture_hold<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(hold_id): Path<Uuid>,
) -> Result<Json<CaptureHoldResponse>, AppError> {
    // Validate admin API key
    let admin_id = validate_system_admin(&state, &headers).await?;

    // Create credit service
    let credit_service =
        CreditService::new(state.credit_repo.clone(), state.credit_hold_repo.clone());

    // S-14: Capture returns currency from the hold it fetches internally,
    // avoiding a separate get_hold() call just to read the currency.
    let result = credit_service.capture(hold_id).await?;

    tracing::info!(
        admin_id = %admin_id,
        hold_id = %hold_id,
        transaction_id = %result.transaction_id,
        amount_lamports = result.amount_lamports,
        "Credit hold captured"
    );

    Ok(Json(CaptureHoldResponse::from_result(result)))
}

/// POST /credits/release/{hold_id} - Release a hold
///
/// Cancel a previously created hold, returning the reserved credits
/// to the user's available balance.
pub async fn release_hold<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(hold_id): Path<Uuid>,
) -> Result<Json<ReleaseHoldResponse>, AppError> {
    // Validate admin API key
    let admin_id = validate_system_admin(&state, &headers).await?;

    // Create credit service
    let credit_service =
        CreditService::new(state.credit_repo.clone(), state.credit_hold_repo.clone());

    // Release the hold
    credit_service.release(hold_id).await?;

    tracing::info!(
        admin_id = %admin_id,
        hold_id = %hold_id,
        "Credit hold released"
    );

    Ok(Json(ReleaseHoldResponse {
        released: true,
        message: "Hold released successfully".to_string(),
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
            settings_service: std::sync::Arc::new(crate::services::SettingsService::new(
                storage.system_settings_repo.clone(),
            )),
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
            last_login_at: None,
        };
        let user = state.user_repo.create(user).await.unwrap();

        let api_key = generate_api_key();
        let api_key_entity = ApiKeyEntity::new(user.id, &api_key, "default");
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
            last_login_at: None,
        };
        let user = state.user_repo.create(user).await.unwrap();
        user.id
    }

    async fn add_credits_to_user(
        state: &Arc<AppState<NoopCallback, LogEmailService>>,
        admin_id: Uuid,
        user_id: Uuid,
        amount: i64,
    ) {
        let credit_service =
            CreditService::new(state.credit_repo.clone(), state.credit_hold_repo.clone());
        credit_service
            .adjust(admin_id, user_id, amount, "SOL", "Test deposit", None, None)
            .await
            .unwrap();
    }

    #[tokio::test]
    async fn test_spend_credits() {
        let config = base_config();
        let state = build_state(config);
        let (admin_id, api_key) = setup_admin_with_api_key(&state).await;
        let user_id = setup_regular_user(&state).await;

        // Add credits first
        add_credits_to_user(&state, admin_id, user_id, 1_000_000_000).await;

        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", api_key)).unwrap(),
        );

        let request = SpendCreditsRequest {
            amount_lamports: 500_000_000,
            currency: "SOL".to_string(),
            idempotency_key: "order:test-123".to_string(),
            reference_type: "order".to_string(),
            reference_id: Uuid::new_v4(),
            metadata: None,
        };

        let result = spend_credits(State(state.clone()), headers, Path(user_id), Json(request))
            .await
            .unwrap();

        assert_eq!(result.0.amount_lamports, 500_000_000);
        assert_eq!(result.0.new_balance_lamports, 500_000_000);
    }

    #[tokio::test]
    async fn test_spend_insufficient_balance() {
        let config = base_config();
        let state = build_state(config);
        let (_admin_id, api_key) = setup_admin_with_api_key(&state).await;
        let user_id = setup_regular_user(&state).await;

        // Don't add any credits

        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", api_key)).unwrap(),
        );

        let request = SpendCreditsRequest {
            amount_lamports: 500_000_000,
            currency: "SOL".to_string(),
            idempotency_key: "order:test-456".to_string(),
            reference_type: "order".to_string(),
            reference_id: Uuid::new_v4(),
            metadata: None,
        };

        let result =
            spend_credits(State(state.clone()), headers, Path(user_id), Json(request)).await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_hold_capture_flow() {
        let config = base_config();
        let state = build_state(config);
        let (admin_id, api_key) = setup_admin_with_api_key(&state).await;
        let user_id = setup_regular_user(&state).await;

        // Add credits first
        add_credits_to_user(&state, admin_id, user_id, 1_000_000_000).await;

        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", api_key)).unwrap(),
        );

        // Create hold
        let hold_request = CreateHoldRequest {
            amount_lamports: 500_000_000,
            currency: "SOL".to_string(),
            idempotency_key: "hold:test-789".to_string(),
            ttl_minutes: 15,
            reference_type: Some("order".to_string()),
            reference_id: Some(Uuid::new_v4()),
            metadata: None,
        };

        let hold_result = create_hold(
            State(state.clone()),
            headers.clone(),
            Path(user_id),
            Json(hold_request),
        )
        .await
        .unwrap();

        assert!(hold_result.0.is_new);
        assert_eq!(hold_result.0.amount_lamports, 500_000_000);

        // Capture hold
        let capture_result =
            capture_hold(State(state.clone()), headers, Path(hold_result.0.hold_id))
                .await
                .unwrap();

        assert_eq!(capture_result.0.amount_lamports, 500_000_000);
        assert_eq!(capture_result.0.new_balance_lamports, 500_000_000);
    }

    #[tokio::test]
    async fn test_hold_release_flow() {
        let config = base_config();
        let state = build_state(config);
        let (admin_id, api_key) = setup_admin_with_api_key(&state).await;
        let user_id = setup_regular_user(&state).await;

        // Add credits first
        add_credits_to_user(&state, admin_id, user_id, 1_000_000_000).await;

        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", api_key)).unwrap(),
        );

        // Create hold
        let hold_request = CreateHoldRequest {
            amount_lamports: 500_000_000,
            currency: "SOL".to_string(),
            idempotency_key: "hold:test-release".to_string(),
            ttl_minutes: 15,
            reference_type: Some("order".to_string()),
            reference_id: Some(Uuid::new_v4()),
            metadata: None,
        };

        let hold_result = create_hold(
            State(state.clone()),
            headers.clone(),
            Path(user_id),
            Json(hold_request),
        )
        .await
        .unwrap();

        // Release hold
        let release_result =
            release_hold(State(state.clone()), headers, Path(hold_result.0.hold_id))
                .await
                .unwrap();

        assert!(release_result.0.released);
    }
}
