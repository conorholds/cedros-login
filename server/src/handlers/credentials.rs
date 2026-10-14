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
use crate::repositories::{AuditEventType, CredentialEntity, CredentialUnlinkOutcome};
use crate::services::{
    extract_apple_refresh_token_metadata, revoke_encrypted_refresh_token, EmailService,
};
use crate::utils::auth::authenticate_session;
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
    let user = authenticate_session(&state, &headers).await?;

    let credentials = state
        .storage
        .credential_lifecycle_repo
        .list(user.user_id)
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
    let user = authenticate_session(&state, &headers).await?;

    let updated = state
        .storage
        .credential_lifecycle_repo
        .update_label(user.user_id, credential_id, request.label)
        .await?;
    if !updated {
        return Err(AppError::NotFound("Credential not found".into()));
    }

    Ok(StatusCode::NO_CONTENT)
}

/// Unlink/remove a credential from the user's account
///
/// Removes the credential from its authoritative store and revokes every other
/// session. The persistence boundary serializes concurrent removals and refuses
/// to remove the final primary authentication method.
pub async fn unlink_credential<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(credential_id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let user = authenticate_session(&state, &headers).await?;
    let session_id = user.session_id.ok_or(AppError::StepUpRequired)?;
    state.step_up_service.require_step_up(session_id).await?;

    let outcome = state
        .storage
        .credential_lifecycle_repo
        .unlink(user.user_id, credential_id, session_id)
        .await?;
    match outcome {
        CredentialUnlinkOutcome::Removed(credential) => {
            if let Some((refresh_token, client_id)) =
                extract_apple_refresh_token_metadata(&credential.metadata)
            {
                if let Err(error) = revoke_encrypted_refresh_token(
                    &state.settings_service,
                    &state.config.apple,
                    &state.config.jwt.secret,
                    &client_id,
                    &refresh_token,
                )
                .await
                {
                    tracing::warn!(
                        user_id = %user.user_id,
                        client_id = %client_id,
                        error = %error,
                        "Failed to revoke Apple refresh token after credential unlink"
                    );
                }
            }
            state
                .audit_service
                .log_user_event_or_warn(
                    AuditEventType::CredentialUnlinked,
                    user.user_id,
                    Some(&headers),
                )
                .await;
            Ok(StatusCode::NO_CONTENT)
        }
        CredentialUnlinkOutcome::LastPrimary => Err(AppError::Validation(
            "Cannot remove last primary authentication method. Add another method first.".into(),
        )),
        CredentialUnlinkOutcome::RequiresDedicatedMfaFlow => Err(AppError::Validation(
            "Disable MFA through the MFA confirmation flow".into(),
        )),
        CredentialUnlinkOutcome::NotFound => Err(AppError::NotFound("Credential not found".into())),
    }
}
