//! Credential management handlers
//!
//! Provides endpoints for listing and managing user credentials.

use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::CredentialEntity;
use crate::services::EmailService;
use crate::utils::auth::authenticate;
use crate::AppState;

/// Response for listing credentials
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListCredentialsResponse {
    pub credentials: Vec<CredentialResponse>,
}

/// Individual credential in response
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CredentialResponse {
    pub id: Uuid,
    pub credential_type: String,
    pub label: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub last_used_at: Option<chrono::DateTime<chrono::Utc>>,
    /// Whether this is a primary auth method or second factor
    pub is_primary: bool,
}

impl From<CredentialEntity> for CredentialResponse {
    fn from(cred: CredentialEntity) -> Self {
        Self {
            id: cred.id,
            credential_type: cred.credential_type.to_string(),
            label: cred.label,
            created_at: cred.created_at,
            last_used_at: cred.last_used_at,
            is_primary: cred.credential_type.is_primary(),
        }
    }
}

/// Request to update a credential
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCredentialRequest {
    pub label: Option<String>,
}

/// List all credentials for the authenticated user
pub async fn list_credentials<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<ListCredentialsResponse>, AppError> {
    let user = authenticate(&state, &headers).await?;

    let credentials = state
        .storage
        .credential_repository()
        .find_by_user(user.user_id)
        .await?;

    let response = ListCredentialsResponse {
        credentials: credentials.into_iter().map(Into::into).collect(),
    };

    Ok(Json(response))
}

/// Update a credential (e.g., change label)
pub async fn update_credential<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(credential_id): Path<Uuid>,
    Json(request): Json<UpdateCredentialRequest>,
) -> Result<StatusCode, AppError> {
    let user = authenticate(&state, &headers).await?;

    let credential = state
        .storage
        .credential_repository()
        .find_by_id(credential_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Credential not found".into()))?;

    // Verify ownership
    if credential.user_id != user.user_id {
        return Err(AppError::Forbidden("Not your credential".into()));
    }

    state
        .storage
        .credential_repository()
        .update_label(credential_id, request.label)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}

/// Unlink/remove a credential from the user's account
///
/// This is a soft operation that marks the credential as disabled.
/// Users must have at least one primary authentication method remaining.
///
/// # H-01 Fix: Atomic Operation
///
/// Uses `disable_if_not_last_primary` which atomically checks for other
/// primary credentials before disabling. This prevents TOCTOU race conditions
/// where two concurrent requests could both pass a check-then-disable sequence.
pub async fn unlink_credential<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(credential_id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let user = authenticate(&state, &headers).await?;

    let credential = state
        .storage
        .credential_repository()
        .find_by_id(credential_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Credential not found".into()))?;

    // Verify ownership
    if credential.user_id != user.user_id {
        return Err(AppError::Forbidden("Not your credential".into()));
    }

    // H-01: Use atomic disable operation that checks for other primary credentials
    let disabled = state
        .storage
        .credential_repository()
        .disable_if_not_last_primary(credential_id, user.user_id)
        .await?;

    if !disabled {
        return Err(AppError::Validation(
            "Cannot remove last primary authentication method. Add another method first.".into(),
        ));
    }

    Ok(StatusCode::NO_CONTENT)
}
