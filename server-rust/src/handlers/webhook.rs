//! Webhook handlers for external service notifications
//!
//! POST /webhook/deposit - Handle deposit notifications from Helius/Quicknode
//!
//! Flow:
//! 1. Webhook receives SPL token transfer notification
//! 2. We validate signature and parse payload
//! 3. We check if destination is a known embedded wallet
//! 4. We create/update a pending SPL deposit record
//! 5. User is notified and can confirm the swap via UI (requires auth)

use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    Json,
};
use hmac::{Hmac, Mac};
use serde_json::value::RawValue;
use sha2::Sha256;
use std::collections::{HashMap, HashSet};
use std::sync::Arc;

#[cfg(feature = "postgres")]
use sqlx::PgPool;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::services::EmailService;
use crate::AppState;

/// Helius webhook payload for token transfers
///
/// Some fields are reserved for future use (native SOL transfers, source accounts)
#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct HeliusWebhookPayload {
    /// Transaction signature
    pub signature: String,
    /// Transaction type (e.g., "TRANSFER")
    #[serde(rename = "type")]
    pub tx_type: String,
    /// Token transfers in this transaction
    #[serde(default)]
    pub token_transfers: Vec<HeliusTokenTransfer>,
    /// Native SOL transfers (reserved for future use)
    #[serde(default)]
    pub native_transfers: Vec<HeliusNativeTransfer>,
}

/// Token transfer details from Helius webhook
#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct HeliusTokenTransfer {
    /// Token mint address
    pub mint: String,
    /// Amount transferred (raw JSON; may be a string or number)
    pub token_amount: Box<RawValue>,
    /// Source account (reserved for audit logging)
    pub from_user_account: Option<String>,
    /// Destination account
    pub to_user_account: Option<String>,
}

/// Native SOL transfer from Helius webhook (reserved for future use)
#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct HeliusNativeTransfer {
    /// Amount in lamports
    pub amount: u64,
    /// Source account
    pub from_user_account: Option<String>,
    /// Destination account
    pub to_user_account: Option<String>,
}

/// Response for webhook endpoint
#[derive(Debug, serde::Serialize)]
pub struct WebhookResponse {
    pub received: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

type HmacSha256 = Hmac<Sha256>;

// Token mint constants are now in config/privacy.rs

fn token_amount_as_str(token_amount: &RawValue) -> Result<String, AppError> {
    let raw = token_amount.get().trim();
    if raw.starts_with('"') {
        serde_json::from_str::<String>(raw)
            .map_err(|e| AppError::Validation(format!("Invalid token_amount string: {}", e)))
    } else {
        Ok(raw.to_string())
    }
}

fn parse_decimal_to_i64(value: &str, decimals: u8) -> Result<i64, AppError> {
    let v = value.trim();
    if v.is_empty() {
        return Err(AppError::Validation("Empty token amount".into()));
    }
    if v.starts_with('-') {
        return Err(AppError::Validation("Negative token amount".into()));
    }
    if v.contains('e') || v.contains('E') {
        return Err(AppError::Validation(
            "Scientific notation not supported".into(),
        ));
    }

    let mut parts = v.split('.');
    let whole_raw = parts.next().unwrap_or("0");
    let frac_raw = parts.next();
    if parts.next().is_some() {
        return Err(AppError::Validation("Invalid decimal format".into()));
    }

    let whole_str = if whole_raw.is_empty() { "0" } else { whole_raw };
    if !whole_str.chars().all(|c| c.is_ascii_digit()) {
        return Err(AppError::Validation("Invalid decimal digits".into()));
    }

    let whole: i128 = whole_str
        .parse()
        .map_err(|_| AppError::Validation("Invalid integer amount".into()))?;

    let frac_digits = frac_raw.unwrap_or("");
    if !frac_digits.chars().all(|c| c.is_ascii_digit()) {
        return Err(AppError::Validation("Invalid fractional digits".into()));
    }
    if frac_digits.len() > decimals as usize {
        return Err(AppError::Validation("Too many decimal places".into()));
    }

    let mut frac = frac_digits.to_string();
    while frac.len() < decimals as usize {
        frac.push('0');
    }

    let frac_value: i128 = if frac.is_empty() {
        0
    } else {
        frac.parse()
            .map_err(|_| AppError::Validation("Invalid fraction".into()))?
    };

    let scale: i128 = 10i128
        .checked_pow(decimals as u32)
        .ok_or_else(|| AppError::Validation("Invalid decimals".into()))?;

    let total = whole
        .checked_mul(scale)
        .and_then(|x| x.checked_add(frac_value))
        .ok_or_else(|| AppError::Validation("Amount overflow".into()))?;

    i64::try_from(total).map_err(|_| AppError::Validation("Amount overflow".into()))
}

#[cfg(feature = "postgres")]
async fn insert_pending_spl_deposit(
    pool: &PgPool,
    user_id: uuid::Uuid,
    wallet_address: &str,
    token_mint: &str,
    token_amount_raw: &str,
    token_amount: i64,
    tx_signature: &str,
) -> Result<bool, AppError> {
    let result = sqlx::query(
        r#"
        INSERT INTO pending_spl_deposits (
            user_id,
            wallet_address,
            token_mint,
            token_amount_raw,
            token_amount,
            tx_signature
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (tx_signature) DO NOTHING
        "#,
    )
    .bind(user_id)
    .bind(wallet_address)
    .bind(token_mint)
    .bind(token_amount_raw)
    .bind(token_amount)
    .bind(tx_signature)
    .execute(pool)
    .await
    .map_err(|e| AppError::Internal(e.into()))?;

    Ok(result.rows_affected() > 0)
}

/// Verify HMAC-SHA256 signature from webhook
fn verify_webhook_signature(secret: &str, payload: &[u8], signature: &str) -> bool {
    let mut mac = match HmacSha256::new_from_slice(secret.as_bytes()) {
        Ok(m) => m,
        Err(_) => return false,
    };
    mac.update(payload);

    // Signature is hex-encoded.
    // Compare in constant time to avoid leaking signature validity via timing.
    let expected = mac.finalize().into_bytes();
    let provided = match hex::decode(signature.trim()) {
        Ok(b) => b,
        Err(_) => return false,
    };
    if provided.len() != expected.len() {
        return false;
    }
    use subtle::ConstantTimeEq;
    AsRef::<[u8]>::as_ref(&expected).ct_eq(&provided).into()
}

/// POST /webhook/deposit - Handle incoming deposit notifications
///
/// Receives webhook callbacks from Helius/Quicknode when tokens are transferred
/// to a monitored wallet address. Triggers the swap-and-deposit flow for SPL tokens.
///
/// Security:
/// - Validates HMAC-SHA256 signature from webhook provider
/// - Deduplicates by transaction signature
/// - Only processes transfers to known embedded wallet addresses
pub async fn handle_deposit_webhook<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    body: axum::body::Bytes,
) -> Result<(StatusCode, Json<WebhookResponse>), AppError> {
    // Check if privacy deposits are enabled
    if !state.config.privacy.enabled {
        return Ok((
            StatusCode::NOT_FOUND,
            Json(WebhookResponse {
                received: false,
                message: Some("Privacy deposits not enabled".into()),
            }),
        ));
    }

    // Verify webhook secret is configured
    let webhook_secret = state
        .config
        .privacy
        .deposit_webhook_secret
        .as_ref()
        .ok_or_else(|| {
            tracing::warn!("Deposit webhook received but DEPOSIT_WEBHOOK_SECRET not configured");
            AppError::Config("Webhook secret not configured".into())
        })?;

    // Get signature from headers (Helius uses X-Webhook-Signature)
    let signature = headers
        .get("x-webhook-signature")
        .or_else(|| headers.get("x-signature"))
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| {
            tracing::warn!("Deposit webhook missing signature header");
            AppError::Unauthorized("Missing webhook signature".into())
        })?;

    // Verify HMAC signature
    if !verify_webhook_signature(webhook_secret, &body, signature) {
        tracing::warn!("Deposit webhook signature verification failed");
        return Err(AppError::Unauthorized("Invalid webhook signature".into()));
    }

    // Parse the webhook payload
    let payload: HeliusWebhookPayload = serde_json::from_slice(&body).map_err(|e| {
        tracing::error!(error = %e, "Failed to parse webhook payload");
        AppError::Validation(format!("Invalid webhook payload: {}", e))
    })?;

    tracing::info!(
        signature = %payload.signature,
        tx_type = %payload.tx_type,
        token_transfers = payload.token_transfers.len(),
        "Received deposit webhook"
    );

    // Track detected deposits for response
    let mut deposits_detected = 0;
    let mut deposits_queued = 0;

    #[cfg(feature = "postgres")]
    let pool = state.postgres_pool.as_ref().ok_or_else(|| {
        AppError::Config("Postgres pool is required for deposit webhook persistence".into())
    })?;

    #[cfg(not(feature = "postgres"))]
    {
        return Err(AppError::Config(
            "Deposit webhook requires the 'postgres' feature".into(),
        ));
    }

    // Prefetch known embedded wallet materials to avoid per-transfer lookups.
    let mut unique_wallets: HashSet<String> = HashSet::new();
    let mut to_wallets: Vec<String> = Vec::new();
    for transfer in &payload.token_transfers {
        if let Some(ref to_address) = transfer.to_user_account {
            if unique_wallets.insert(to_address.clone()) {
                to_wallets.push(to_address.clone());
            }
        }
    }

    let materials = state
        .wallet_material_repo
        .find_by_pubkeys(&to_wallets)
        .await?;
    let materials_by_pubkey: HashMap<String, _> = materials
        .into_iter()
        .map(|m| (m.solana_pubkey.clone(), m))
        .collect();

    // Process token transfers
    for transfer in &payload.token_transfers {
        if let Some(ref to_address) = transfer.to_user_account {
            // Check if this is a known embedded wallet address
            if let Some(wallet_material) = materials_by_pubkey.get(to_address.as_str()) {
                // CRITICAL: Validate token is whitelisted before processing
                let token_decimals = match state.config.privacy.get_token_decimals(&transfer.mint) {
                    Some(d) => d,
                    None => {
                        tracing::warn!(
                            token_mint = %transfer.mint,
                            tx_signature = %payload.signature,
                            "Ignoring non-whitelisted token mint in webhook"
                        );
                        continue;
                    }
                };

                let token_amount_ui = token_amount_as_str(&transfer.token_amount)?;
                let raw_amount = parse_decimal_to_i64(&token_amount_ui, token_decimals)?;

                deposits_detected += 1;

                let inserted = insert_pending_spl_deposit(
                    pool,
                    wallet_material.user_id,
                    to_address,
                    &transfer.mint,
                    &token_amount_ui,
                    raw_amount,
                    &payload.signature,
                )
                .await?;

                if inserted {
                    deposits_queued += 1;
                }

                tracing::info!(
                    user_id = %wallet_material.user_id,
                    wallet_address = %to_address,
                    token_mint = %transfer.mint,
                    token_amount_ui = %token_amount_ui,
                    token_amount_raw = %raw_amount,
                    tx_signature = %payload.signature,
                    "SPL token deposit detected - pending user confirmation"
                );

                // Note: The pending_spl_deposits table stores these for user confirmation.
                // User must authenticate and call POST /deposit/confirm-spl to trigger
                // the Jupiter swap and Privacy Cash deposit.
                //
                // For automatic processing without user confirmation, you would need to:
                // 1. Store a server-encrypted copy of the user's private key
                // 2. Or use a different key management approach
                //
                // Current flow:
                // 1. Webhook detects SPL deposit (this handler)
                // 2. Record stored in pending_spl_deposits (INSERT below)
                // 3. User queries GET /deposit/pending-spl to see pending deposits
                // 4. User confirms via POST /deposit/confirm-spl with authentication
                // 5. Server reconstructs keypair and executes swap-and-deposit
            }
        }
    }

    let message = if deposits_detected > 0 {
        Some(format!(
            "{} SPL deposit(s) detected ({} queued for confirmation)",
            deposits_detected, deposits_queued
        ))
    } else {
        None
    };

    Ok((
        StatusCode::OK,
        Json(WebhookResponse {
            received: true,
            message,
        }),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verify_webhook_signature_valid() {
        let secret = "test-secret";
        let payload = br#"{\"hello\":\"world\"}"#;

        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(payload);
        let expected_hex = hex::encode(mac.finalize().into_bytes());

        assert!(verify_webhook_signature(secret, payload, &expected_hex));
    }

    #[test]
    fn test_verify_webhook_signature_rejects_invalid_hex() {
        let secret = "test-secret";
        let payload = br#"{\"hello\":\"world\"}"#;
        assert!(!verify_webhook_signature(secret, payload, "not-hex"));
    }

    #[test]
    fn test_verify_webhook_signature_rejects_wrong_signature() {
        let secret = "test-secret";
        let payload = br#"{\"hello\":\"world\"}"#;
        assert!(!verify_webhook_signature(secret, payload, "00"));
    }

    #[test]
    fn test_parse_decimal_to_i64_ok() {
        assert_eq!(parse_decimal_to_i64("10.5", 6).unwrap(), 10_500_000);
        assert_eq!(parse_decimal_to_i64("1", 6).unwrap(), 1_000_000);
        assert_eq!(parse_decimal_to_i64("0.000001", 6).unwrap(), 1);
        assert_eq!(parse_decimal_to_i64(".5", 6).unwrap(), 500_000);
    }

    #[test]
    fn test_parse_decimal_to_i64_rejects_invalid() {
        assert!(parse_decimal_to_i64("-1", 6).is_err());
        assert!(parse_decimal_to_i64("1e3", 6).is_err());
        assert!(parse_decimal_to_i64("1.0000001", 6).is_err());
        assert!(parse_decimal_to_i64("abc", 6).is_err());
    }

    #[test]
    fn test_token_amount_as_str_accepts_string_and_number() {
        let s_raw: Box<RawValue> = serde_json::from_str("\"10.5\"").unwrap();
        assert_eq!(token_amount_as_str(&s_raw).unwrap(), "10.5");

        let n_raw: Box<RawValue> = serde_json::from_str("10.5").unwrap();
        assert_eq!(token_amount_as_str(&n_raw).unwrap(), "10.5");
    }

    #[cfg(feature = "postgres")]
    #[tokio::test]
    async fn test_insert_pending_spl_deposit_dedup_by_tx_signature() {
        use crate::config::privacy::USDC_MINT;
        use crate::config::DatabaseConfig;
        use crate::repositories::UserEntity;
        use crate::Storage;
        use chrono::Utc;
        use std::env;

        let url = match env::var("TEST_DATABASE_URL") {
            Ok(u) => u,
            Err(_) => return, // skip when not configured
        };

        let storage = Storage::from_config(&DatabaseConfig {
            url: Some(url),
            max_connections: 2,
            min_connections: 1,
            connect_timeout_secs: 10,
            idle_timeout_secs: 60,
        })
        .await
        .expect("failed to create test storage");

        let pool = storage
            .pg_pool
            .as_ref()
            .expect("expected postgres pool")
            .clone();

        let user = UserEntity {
            id: uuid::Uuid::new_v4(),
            email: Some(format!("test_{}@example.com", uuid::Uuid::new_v4())),
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
            created_at: Utc::now(),
            updated_at: Utc::now(),
            last_login_at: None,
        };
        let user = storage
            .user_repo
            .create(user)
            .await
            .expect("failed to create user");

        let tx_signature = format!("sig_{}", uuid::Uuid::new_v4());
        let inserted1 = insert_pending_spl_deposit(
            &pool,
            user.id,
            "WalletAddr",
            USDC_MINT,
            "10.5",
            10_500_000,
            &tx_signature,
        )
        .await
        .unwrap();
        let inserted2 = insert_pending_spl_deposit(
            &pool,
            user.id,
            "WalletAddr",
            USDC_MINT,
            "10.5",
            10_500_000,
            &tx_signature,
        )
        .await
        .unwrap();

        assert!(inserted1);
        assert!(!inserted2);
    }
}
