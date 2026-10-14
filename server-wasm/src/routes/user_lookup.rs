//! Server-to-server user lookup: `GET /users/by-wallet/{wallet_address}`.
//! Host-admin gated (the host owns admin/M2M auth in extension mode). Returns
//! the linked user id, or null when the wallet is not linked. Port of
//! `server/src/handlers/user_lookup.rs`.
use serde::Serialize;

use super::{error_response, json, require_system_admin, validation, RouteError};
use crate::data::users;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::to_json;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct WalletLookupResponse {
    user_id: Option<String>,
    wallet_address: String,
}

pub fn by_wallet(request: &RouteRequest) -> RouteResponse {
    match by_wallet_inner(request) {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn by_wallet_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin(request)?;
    let wallet = wallet_address(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    // Solana addresses are base58, 32-44 chars (mirrors the standalone guard).
    if wallet.len() < 32 || wallet.len() > 44 {
        return Err(validation("Invalid wallet address format"));
    }
    let user_id = users::find_by_wallet(wallet)?.map(|user| user.id);
    Ok(json(
        200,
        &to_json(&WalletLookupResponse {
            user_id,
            wallet_address: wallet.to_string(),
        })?,
    ))
}

/// The wallet segment from `/users/by-wallet/{wallet_address}`.
fn wallet_address(path: &str) -> Option<&str> {
    path.split("/users/by-wallet/")
        .nth(1)?
        .split('/')
        .next()
        .filter(|s| !s.is_empty())
}

#[cfg(test)]
mod tests {
    use super::wallet_address;

    #[test]
    fn extracts_wallet_segment() {
        assert_eq!(wallet_address("/users/by-wallet/ABC123"), Some("ABC123"));
        assert_eq!(wallet_address("/users/by-wallet/"), None);
        assert_eq!(wallet_address("/users/by-wallet/W/x"), Some("W"));
    }
}
