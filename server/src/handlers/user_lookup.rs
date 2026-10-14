//! Server-to-server user lookup handlers
//!
//! These endpoints expose privileged identity lookup to interactive system
//! administrators. Service integrations must use scoped relying-party APIs.
//!
//! GET /users/by-wallet/{wallet_address} - Look up user by wallet address

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

/// GET /users/by-wallet/{wallet_address} - Look up user by wallet address
///
/// Returns the user_id associated with a wallet address, or null if the wallet
/// is not linked to any user account.
///
/// # Response
/// - 200: Always returns, with user_id set or null
/// - 401/403: Invalid session or missing system-admin authority
/// - 400: Invalid wallet address format
pub async fn lookup_by_wallet<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(wallet_address): Path<String>,
) -> Result<Json<WalletLookupResponse>, AppError> {
    // Validate the current interactive system-admin session.
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
