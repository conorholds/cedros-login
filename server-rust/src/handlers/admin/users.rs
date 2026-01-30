//! Admin user handlers

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{
    AdminUpdateUserRequest, AdminUserResponse, ListUsersQueryParams, ListUsersResponse,
    MessageResponse, SetSystemAdminRequest,
};
use crate::repositories::pagination::{cap_limit, cap_offset};
use crate::repositories::{
    default_expiry, generate_verification_token, hash_verification_token, normalize_email,
    TokenType,
};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

use super::deposits::AdminDepositItem;

/// Validate system admin access, with bootstrap support
///
/// If no system admins exist and BOOTSTRAP_ADMIN_EMAIL is configured,
/// the first matching user to access admin endpoints is auto-promoted.
pub async fn validate_system_admin<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    headers: &HeaderMap,
) -> Result<Uuid, AppError> {
    // Authenticate via JWT or API key
    let auth_user = authenticate(state, headers).await?;

    let user = state
        .user_repo
        .find_by_id(auth_user.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    if user.is_system_admin {
        return Ok(auth_user.user_id);
    }

    // Check for bootstrap scenario: no admins exist + user matches bootstrap email
    if let Some(ref bootstrap_email) = state.config.server.bootstrap_admin_email {
        let admin_count = state.user_repo.count_system_admins().await?;
        if admin_count == 0 {
            // HANDLER-08/SEC-10: Use NFKC normalization to prevent Unicode homograph attacks.
            // An attacker could register with visually similar Cyrillic characters
            // (e.g., "аdmin@..." with Cyrillic 'а' instead of Latin 'a').
            // normalize_email() applies NFKC + lowercase for consistent comparison.
            if let Some(ref user_email) = user.email {
                let normalized_user = normalize_email(user_email);
                let normalized_bootstrap = normalize_email(bootstrap_email);
                if normalized_user == normalized_bootstrap && user.email_verified {
                    // Auto-promote this user to system admin
                    state
                        .user_repo
                        .set_system_admin(auth_user.user_id, true)
                        .await?;

                    tracing::info!(
                        user_id = %auth_user.user_id,
                        email = %user_email,
                        "Bootstrapped first system admin via BOOTSTRAP_ADMIN_EMAIL"
                    );

                    return Ok(auth_user.user_id);
                }
            }
        }
    }

    Err(AppError::Forbidden(
        "Only system administrators can access this resource".into(),
    ))
}

/// GET /admin/users - List all users
///
/// Requires system admin privileges.
pub async fn list_users<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(params): Query<ListUsersQueryParams>,
) -> Result<Json<ListUsersResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let limit = cap_limit(params.limit);
    let offset = cap_offset(params.offset);

    // PERF-02: Parallelize user list and count queries for better latency.
    // These queries are independent and can run concurrently.
    let (users_result, total_result) = tokio::join!(
        state.user_repo.list_all(limit, offset),
        state.user_repo.count()
    );
    let users = users_result?;
    let total = total_result?;

    let user_responses: Vec<AdminUserResponse> =
        users.iter().map(AdminUserResponse::from).collect();

    Ok(Json(ListUsersResponse {
        users: user_responses,
        total,
        limit,
        offset,
    }))
}

/// GET /admin/users/:user_id - Get a specific user
///
/// Requires system admin privileges.
pub async fn get_user<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
) -> Result<Json<AdminUserResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    Ok(Json(AdminUserResponse::from(&user)))
}

/// PATCH /admin/users/:user_id/system-admin - Set system admin status
///
/// Requires system admin privileges.
pub async fn set_system_admin<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
    Json(request): Json<SetSystemAdminRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    // Prevent admin from removing their own admin status
    if user_id == admin_id && !request.is_admin {
        return Err(AppError::Validation(
            "Cannot remove your own system admin status".into(),
        ));
    }

    // Verify user exists
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    if user.is_system_admin == request.is_admin {
        let status = if request.is_admin { "already" } else { "not" };
        return Ok(Json(MessageResponse {
            message: format!("User is {} a system admin", status),
        }));
    }

    state
        .user_repo
        .set_system_admin(user_id, request.is_admin)
        .await?;

    let action = if request.is_admin {
        "granted"
    } else {
        "revoked"
    };

    tracing::info!(
        admin_id = %admin_id,
        target_user_id = %user_id,
        target_email = ?user.email,
        action = %action,
        "Admin {} system admin status for user",
        action
    );

    Ok(Json(MessageResponse {
        message: format!("System admin status {} for user", action),
    }))
}

/// PATCH /admin/users/:user_id - Update a user's profile
///
/// Requires system admin privileges.
pub async fn update_user<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
    Json(request): Json<AdminUpdateUserRequest>,
) -> Result<Json<AdminUserResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    // Get existing user
    let mut user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    // Capture fields for audit logging before move
    let updated_name = request.name.clone();
    let updated_email = request.email.clone();
    let updated_email_verified = request.email_verified;

    // Update fields if provided
    if let Some(name) = request.name {
        user.name = Some(name);
    }
    if let Some(email) = request.email {
        // Check if email is already taken by another user
        if let Some(existing) = state.user_repo.find_by_email(&email).await? {
            if existing.id != user_id {
                return Err(AppError::Validation("Email is already in use".into()));
            }
        }
        user.email = Some(email);
    }
    if let Some(email_verified) = request.email_verified {
        user.email_verified = email_verified;
    }

    // Save changes
    let updated = state.user_repo.update(user).await?;

    tracing::info!(
        admin_id = %admin_id,
        target_user_id = %user_id,
        updated_name = ?updated_name,
        updated_email = ?updated_email,
        updated_email_verified = ?updated_email_verified,
        "Admin updated user profile"
    );

    Ok(Json(AdminUserResponse::from(&updated)))
}

/// DELETE /admin/users/:user_id - Delete a user
///
/// Requires system admin privileges.
/// Cannot delete yourself or another system admin.
pub async fn delete_user<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
) -> Result<Json<MessageResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    // Prevent deleting yourself
    if user_id == admin_id {
        return Err(AppError::Validation(
            "Cannot delete your own account".into(),
        ));
    }

    // Check if user exists and is not a system admin
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    if user.is_system_admin {
        return Err(AppError::Validation(
            "Cannot delete a system admin. Remove admin status first.".into(),
        ));
    }

    // Delete the user
    state.user_repo.delete(user_id).await?;

    tracing::info!(
        admin_id = %admin_id,
        deleted_user_id = %user_id,
        deleted_email = ?user.email,
        "Admin deleted user account"
    );

    Ok(Json(MessageResponse {
        message: "User deleted successfully".to_string(),
    }))
}

/// POST /admin/users/:user_id/force-password-reset - Send password reset email
///
/// Requires system admin privileges.
/// Sends a password reset email to the user.
pub async fn force_password_reset<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
) -> Result<Json<MessageResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    // Get user
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    // User must have an email to reset password
    let email = user
        .email
        .ok_or(AppError::Validation("User has no email address".into()))?;

    // Delete any existing reset tokens for this user
    state
        .verification_repo
        .delete_for_user(user_id, TokenType::PasswordReset)
        .await?;

    // Generate and store token
    let token = generate_verification_token();
    let token_hash = hash_verification_token(&token);

    state
        .verification_repo
        .create(
            user_id,
            &token_hash,
            TokenType::PasswordReset,
            default_expiry(TokenType::PasswordReset),
        )
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create token: {}", e)))?;

    // Queue password reset email via comms service
    state
        .comms_service
        .queue_password_reset_email(&email, user.name.as_deref(), &token, Some(user_id))
        .await?;

    Ok(Json(MessageResponse {
        message: "Password reset email queued".to_string(),
    }))
}

/// Response for user deposits list
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminUserDepositsResponse {
    pub deposits: Vec<AdminDepositItem>,
    pub total: u64,
    pub limit: u32,
    pub offset: u32,
}

/// Credit transaction item for user detail
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminCreditTransactionItem {
    pub id: String,
    pub amount_lamports: i64,
    pub currency: String,
    pub tx_type: String,
    pub reference_type: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

/// User credit stats for admin view
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminUserCreditStats {
    pub currency: String,
    pub total_deposited_lamports: i64,
    pub total_deposited_sol: f64,
    pub total_spent_lamports: i64,
    pub total_spent_sol: f64,
    pub total_refunds_lamports: i64,
    pub total_refunds_sol: f64,
    pub current_balance_lamports: i64,
    pub current_balance_sol: f64,
    pub deposit_count: u64,
    pub spend_count: u64,
}

/// Response for user credits (stats + transactions)
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminUserCreditsResponse {
    pub stats: AdminUserCreditStats,
    pub transactions: Vec<AdminCreditTransactionItem>,
    pub total_transactions: u64,
    pub limit: u32,
    pub offset: u32,
}

/// Withdrawal history entry for admin view
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminWithdrawalHistoryItem {
    pub id: String,
    pub deposit_session_id: String,
    pub amount_lamports: i64,
    pub amount_sol: f64,
    pub tx_signature: String,
    pub cumulative_withdrawn_lamports: i64,
    pub cumulative_withdrawn_sol: f64,
    pub remaining_lamports: i64,
    pub remaining_sol: f64,
    pub is_final: bool,
    pub withdrawal_percentage: Option<i16>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

/// Response for user withdrawal history
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminUserWithdrawalHistoryResponse {
    pub withdrawals: Vec<AdminWithdrawalHistoryItem>,
    pub total: u64,
    pub limit: u32,
    pub offset: u32,
}

/// GET /admin/users/:user_id/deposits - List deposits for a specific user
///
/// Requires system admin privileges.
pub async fn get_user_deposits<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
    Query(params): Query<ListUsersQueryParams>,
) -> Result<Json<AdminUserDepositsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    // Verify user exists
    state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    let limit = cap_limit(params.limit).min(100);
    let offset = cap_offset(params.offset);

    // Fetch deposits for this user
    let deposits = state
        .deposit_repo
        .list_by_user(user_id, None, limit, offset)
        .await?;

    // Count total for this user
    let total = state.deposit_repo.count_by_user(user_id, None).await?;

    let items: Vec<AdminDepositItem> = deposits
        .iter()
        .map(|d| AdminDepositItem {
            id: d.id.to_string(),
            user_id: d.user_id.to_string(),
            wallet_address: d.wallet_address.clone(),
            status: d.status.as_str().to_string(),
            amount_lamports: d.deposit_amount_lamports,
            tx_signature: d.privacy_deposit_tx_signature.clone(),
            withdrawal_tx_signature: d.withdrawal_tx_signature.clone(),
            created_at: d.created_at,
            completed_at: d.completed_at,
            withdrawal_available_at: d.withdrawal_available_at,
            error_message: d.error_message.clone(),
        })
        .collect();

    Ok(Json(AdminUserDepositsResponse {
        deposits: items,
        total,
        limit,
        offset,
    }))
}

/// GET /admin/users/:user_id/credits - Get credit stats and transactions for a user
///
/// Requires system admin privileges.
pub async fn get_user_credits<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
    Query(params): Query<ListUsersQueryParams>,
) -> Result<Json<AdminUserCreditsResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    // Verify user exists
    state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    let limit = cap_limit(params.limit).min(100);
    let offset = cap_offset(params.offset);

    // Get credit stats for SOL (primary currency)
    let stats = state.credit_repo.get_user_stats(user_id, "SOL").await?;

    // Get transactions
    let transactions = state
        .credit_repo
        .get_transactions(user_id, Some("SOL"), None, limit, offset)
        .await?;

    // Count total transactions
    let total_transactions = state
        .credit_repo
        .count_transactions(user_id, Some("SOL"), None)
        .await?;

    let tx_items: Vec<AdminCreditTransactionItem> = transactions
        .iter()
        .map(|t| AdminCreditTransactionItem {
            id: t.id.to_string(),
            amount_lamports: t.amount,
            currency: t.currency.clone(),
            tx_type: t.tx_type.as_str().to_string(),
            reference_type: t.reference_type.clone(),
            created_at: t.created_at,
        })
        .collect();

    Ok(Json(AdminUserCreditsResponse {
        stats: AdminUserCreditStats {
            currency: stats.currency,
            total_deposited_lamports: stats.total_deposited,
            total_deposited_sol: stats.total_deposited as f64 / 1_000_000_000.0,
            total_spent_lamports: stats.total_spent,
            total_spent_sol: stats.total_spent as f64 / 1_000_000_000.0,
            total_refunds_lamports: stats.total_refunds,
            total_refunds_sol: stats.total_refunds as f64 / 1_000_000_000.0,
            current_balance_lamports: stats.current_balance,
            current_balance_sol: stats.current_balance as f64 / 1_000_000_000.0,
            deposit_count: stats.deposit_count,
            spend_count: stats.spend_count,
        },
        transactions: tx_items,
        total_transactions,
        limit,
        offset,
    }))
}

/// GET /admin/users/:user_id/withdrawal-history - Get withdrawal history for a user
///
/// Requires system admin privileges.
/// Returns all withdrawal transactions (partial and final) for a specific user.
pub async fn get_user_withdrawal_history<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
    Query(params): Query<ListUsersQueryParams>,
) -> Result<Json<AdminUserWithdrawalHistoryResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    // Verify user exists
    state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    let limit = cap_limit(params.limit).min(100);
    let offset = cap_offset(params.offset);

    // Get withdrawal history for this user
    let withdrawals = state
        .storage
        .withdrawal_history_repo
        .find_by_user(user_id, limit, offset)
        .await?;

    let total = state
        .storage
        .withdrawal_history_repo
        .count_by_user(user_id)
        .await?;

    let items: Vec<AdminWithdrawalHistoryItem> = withdrawals
        .iter()
        .map(|w| AdminWithdrawalHistoryItem {
            id: w.id.to_string(),
            deposit_session_id: w.deposit_session_id.to_string(),
            amount_lamports: w.amount_lamports,
            amount_sol: w.amount_lamports as f64 / 1_000_000_000.0,
            tx_signature: w.tx_signature.clone(),
            cumulative_withdrawn_lamports: w.cumulative_withdrawn_lamports,
            cumulative_withdrawn_sol: w.cumulative_withdrawn_lamports as f64 / 1_000_000_000.0,
            remaining_lamports: w.remaining_lamports,
            remaining_sol: w.remaining_lamports as f64 / 1_000_000_000.0,
            is_final: w.is_final,
            withdrawal_percentage: w.withdrawal_percentage,
            created_at: w.created_at,
        })
        .collect();

    Ok(Json(AdminUserWithdrawalHistoryResponse {
        withdrawals: items,
        total,
        limit,
        offset,
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
    use crate::errors::AppError;
    use crate::repositories::{generate_api_key, ApiKeyEntity, LoginAttemptConfig, UserEntity};
    use crate::services::{
        create_wallet_unlock_cache, AppleService, AuditService, CommsService, GoogleService,
        JwtService, LogEmailService, MfaAttemptService, PasswordService, SolanaService,
        TotpService, WalletSigningService, WebAuthnService,
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

    async fn setup_user_with_api_key(
        state: &Arc<AppState<NoopCallback, LogEmailService>>,
        email: &str,
        email_verified: bool,
    ) -> (Uuid, String) {
        let now = Utc::now();
        let user = UserEntity {
            id: Uuid::new_v4(),
            email: Some(email.to_string()),
            email_verified,
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

        (user.id, api_key)
    }

    #[tokio::test]
    async fn test_bootstrap_admin_requires_verified_email() {
        let config = base_config(Some("admin@example.com".to_string()));
        let state = build_state(config);
        let (user_id, api_key) = setup_user_with_api_key(&state, "admin@example.com", false).await;

        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", api_key)).unwrap(),
        );

        let result = validate_system_admin(&state, &headers).await;
        assert!(matches!(result, Err(AppError::Forbidden(_))));

        let user = state.user_repo.find_by_id(user_id).await.unwrap().unwrap();
        assert!(!user.is_system_admin);
    }

    #[tokio::test]
    async fn test_bootstrap_admin_promotes_verified_email() {
        let config = base_config(Some("admin@example.com".to_string()));
        let state = build_state(config);
        let (user_id, api_key) = setup_user_with_api_key(&state, "admin@example.com", true).await;

        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", api_key)).unwrap(),
        );

        let result = validate_system_admin(&state, &headers).await;
        assert!(result.is_ok());

        let user = state.user_repo.find_by_id(user_id).await.unwrap().unwrap();
        assert!(user.is_system_admin);
    }

    #[tokio::test]
    async fn test_bootstrap_admin_rejects_cyrillic_lookalike() {
        // HANDLER-08: Test that Cyrillic 'а' (U+0430) doesn't match Latin 'a' (U+0061)
        let config = base_config(Some("admin@example.com".to_string()));
        let state = build_state(config);

        // Use Cyrillic 'а' (U+0430) instead of Latin 'a' - visually identical!
        let cyrillic_email = "\u{0430}dmin@example.com"; // аdmin@example.com
        let (user_id, api_key) = setup_user_with_api_key(&state, cyrillic_email, true).await;

        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", api_key)).unwrap(),
        );

        let result = validate_system_admin(&state, &headers).await;
        assert!(
            matches!(result, Err(AppError::Forbidden(_))),
            "Cyrillic lookalike should not match bootstrap email"
        );

        let user = state.user_repo.find_by_id(user_id).await.unwrap().unwrap();
        assert!(
            !user.is_system_admin,
            "User with Cyrillic lookalike should not be promoted"
        );
    }
}
