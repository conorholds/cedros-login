//! Server-to-server user lookup handlers
//!
//! These endpoints are designed for service-to-service communication (e.g., cedros-pay).
//! All endpoints require API key authentication with system admin privileges.
//!
//! GET /users/by-wallet/{wallet_address} - Look up user by wallet address
//! GET /users/by-stripe-customer/{stripe_customer_id} - Look up user by Stripe customer ID
//! POST /users/by-stripe-customer/{stripe_customer_id}/link - Link Stripe customer ID to a user

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::handlers::admin::validate_system_admin;
use crate::services::EmailService;
use crate::AppState;

/// Response from wallet lookup endpoint
#[derive(Debug, Serialize, Deserialize)]
pub struct WalletLookupResponse {
    /// User ID if wallet is linked, null if not
    pub user_id: Option<Uuid>,
    /// The wallet address that was looked up
    pub wallet_address: String,
}

/// Response from Stripe customer lookup endpoint
#[derive(Debug, Serialize, Deserialize)]
pub struct StripeCustomerLookupResponse {
    /// User ID if customer is linked, null if not
    pub user_id: Option<Uuid>,
    /// Stripe customer ID that was looked up
    pub stripe_customer_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LinkStripeCustomerRequest {
    pub user_id: Uuid,
}

/// GET /users/by-wallet/{wallet_address} - Look up user by wallet address
///
/// Returns the user_id associated with a wallet address, or null if the wallet
/// is not linked to any user account.
///
/// This endpoint is designed for X402 payment flows where only a wallet address
/// is available (no JWT).
///
/// # Response
/// - 200: Always returns, with user_id set or null
/// - 401: Invalid or missing API key
/// - 400: Invalid wallet address format
pub async fn lookup_by_wallet<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(wallet_address): Path<String>,
) -> Result<Json<WalletLookupResponse>, AppError> {
    // Validate admin API key
    let admin_id = validate_system_admin(&state, &headers).await?;

    // Basic validation - Solana addresses are base58, 32-44 chars
    if wallet_address.len() < 32 || wallet_address.len() > 44 {
        return Err(AppError::Validation("Invalid wallet address format".into()));
    }

    // Look up user by wallet
    let user = state.user_repo.find_by_wallet(&wallet_address).await?;
    let user_id = user.map(|u| u.id);

    tracing::info!(
        admin_id = %admin_id,
        wallet_address = %wallet_address,
        user_found = user_id.is_some(),
        "Wallet lookup"
    );

    Ok(Json(WalletLookupResponse {
        user_id,
        wallet_address,
    }))
}

/// GET /users/by-stripe-customer/{stripe_customer_id} - Look up user by Stripe customer ID
///
/// Returns the user_id associated with a Stripe customer ID, or null if not linked.
///
/// - 200: Always returns, with user_id set or null
/// - 401/403: Invalid auth or not system admin
/// - 400: Invalid stripe customer id format
pub async fn lookup_by_stripe_customer<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(stripe_customer_id): Path<String>,
) -> Result<Json<StripeCustomerLookupResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    // Basic validation - Stripe customers are typically like `cus_...`
    if !stripe_customer_id.starts_with("cus_")
        || stripe_customer_id.len() < 8
        || stripe_customer_id.len() > 64
    {
        return Err(AppError::Validation(
            "Invalid Stripe customer ID format".into(),
        ));
    }

    let user = state
        .user_repo
        .find_by_stripe_customer_id(&stripe_customer_id)
        .await?;
    let user_id = user.map(|u| u.id);

    tracing::info!(
        admin_id = %admin_id,
        stripe_customer_id = %stripe_customer_id,
        user_found = user_id.is_some(),
        "Stripe customer lookup"
    );

    Ok(Json(StripeCustomerLookupResponse {
        user_id,
        stripe_customer_id,
    }))
}

/// POST /users/by-stripe-customer/{stripe_customer_id}/link
///
/// Links a Stripe customer ID to a user.
///
/// - 200: Linked (idempotent if already linked to the same user)
/// - 400: Invalid input or customer already linked to another user
/// - 401/403: Invalid auth or not system admin
pub async fn link_stripe_customer<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(stripe_customer_id): Path<String>,
    Json(req): Json<LinkStripeCustomerRequest>,
) -> Result<Json<StripeCustomerLookupResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    if !stripe_customer_id.starts_with("cus_")
        || stripe_customer_id.len() < 8
        || stripe_customer_id.len() > 64
    {
        return Err(AppError::Validation(
            "Invalid Stripe customer ID format".into(),
        ));
    }

    // Ensure user exists
    let user = state
        .user_repo
        .find_by_id(req.user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    // If already linked to this same user, treat as idempotent
    if user
        .stripe_customer_id
        .as_deref()
        .map(|v| v == stripe_customer_id)
        .unwrap_or(false)
    {
        return Ok(Json(StripeCustomerLookupResponse {
            user_id: Some(req.user_id),
            stripe_customer_id,
        }));
    }

    // If this stripe customer is already linked to another user, reject
    if let Some(existing) = state
        .user_repo
        .find_by_stripe_customer_id(&stripe_customer_id)
        .await?
    {
        if existing.id != req.user_id {
            return Err(AppError::Validation(
                "Stripe customer ID is already linked to another user".into(),
            ));
        }
    }

    // Set mapping
    state
        .user_repo
        .set_stripe_customer_id(req.user_id, &stripe_customer_id)
        .await?;

    tracing::info!(
        admin_id = %admin_id,
        user_id = %req.user_id,
        stripe_customer_id = %stripe_customer_id,
        "Linked Stripe customer to user"
    );

    Ok(Json(StripeCustomerLookupResponse {
        user_id: Some(req.user_id),
        stripe_customer_id,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wallet_lookup_response_serialization() {
        // With user
        let response = WalletLookupResponse {
            user_id: Some(Uuid::parse_str("550e8400-e29b-41d4-a716-446655440000").unwrap()),
            wallet_address: "ABC123...".to_string(),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("user_id"));
        assert!(json.contains("550e8400"));

        // Without user (null)
        let response = WalletLookupResponse {
            user_id: None,
            wallet_address: "XYZ789...".to_string(),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"user_id\":null"));
    }
}
