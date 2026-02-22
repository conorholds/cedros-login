//! Accept invite handler

use axum::{extract::State, http::HeaderMap, Json};
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::{AcceptInviteRequest, AcceptInviteResponse};
use crate::repositories::{hash_invite_token, TransactionalOps};
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

/// POST /invites/accept - Accept an invite
///
/// Requires authentication. The authenticated user will be added to the organization.
/// For email invites, the user's email must match. For wallet invites, the user's wallet must match.
pub async fn accept_invite<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<AcceptInviteRequest>,
) -> Result<Json<AcceptInviteResponse>, AppError> {
    // Authenticate via JWT or API key
    let auth = authenticate(&state, &headers).await?;

    // Get the user
    let user = state
        .user_repo
        .find_by_id(auth.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    // Hash the invite token and find the invite
    let token_hash = hash_invite_token(&req.token);
    let invite = state
        .invite_repo
        .find_by_token_hash(&token_hash)
        .await?
        .ok_or(AppError::NotFound("Invalid or expired invite".into()))?;

    // Verify the invite recipient matches the authenticated user
    if let Some(ref invite_email) = invite.email {
        // Email-based invite: user must have matching email
        let user_email = user.email.as_ref().ok_or(AppError::Validation(
            "You must have an email to accept this invite".into(),
        ))?;

        if user_email.to_lowercase() != invite_email.to_lowercase() {
            return Err(AppError::Forbidden(
                "This invite was sent to a different email address".into(),
            ));
        }
    } else if let Some(ref invite_wallet) = invite.wallet_address {
        // Wallet-based invite: user must have matching wallet
        let user_wallet = user.wallet_address.as_ref().ok_or(AppError::Validation(
            "You must have a wallet to accept this invite".into(),
        ))?;

        // Wallet addresses are case-sensitive (base58)
        if user_wallet != invite_wallet {
            return Err(AppError::Forbidden(
                "This invite was sent to a different wallet address".into(),
            ));
        }
    } else {
        // Invite has neither email nor wallet - data integrity issue
        return Err(AppError::Internal(anyhow::anyhow!(
            "Invalid invite: missing recipient identifier"
        )));
    }

    // Check if user is already a member
    if state
        .membership_repo
        .find_by_user_and_org(auth.user_id, invite.org_id)
        .await?
        .is_some()
    {
        return Err(AppError::Validation(
            "You are already a member of this organization".into(),
        ));
    }

    // Get PostgreSQL pool for atomic transaction
    let pool = state
        .postgres_pool
        .as_ref()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("PostgreSQL pool not available")))?;

    // Atomically accept invite and create membership
    // This replaces the previous compensation pattern with a true ACID transaction
    let membership = TransactionalOps::accept_invite_atomic(
        pool,
        invite.id,
        auth.user_id,
        invite.org_id,
        invite.role,
    )
    .await?;

    // Get organization details for response
    let org = state
        .org_repo
        .find_by_id(invite.org_id)
        .await?
        .ok_or(AppError::NotFound("Organization not found".into()))?;

    Ok(Json(AcceptInviteResponse {
        org_id: org.id,
        org_name: org.name,
        role: membership.role.as_str().to_string(),
    }))
}
