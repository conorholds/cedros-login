//! KYC verification handlers
//!
//! POST /kyc/start                          - Start a KYC verification session (user auth)
//! GET  /kyc/status                         - Get current KYC status for the authenticated user
//! POST /webhook/kyc                        - Receive Stripe Identity webhook (no auth)
//! GET  /admin/users/{user_id}/kyc          - Admin: get KYC status + session history
//! POST /admin/users/{user_id}/kyc/override - Admin: manually set KYC status

use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use chrono::{DateTime, Utc};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::services::EmailService;
use crate::utils::authenticate;
use crate::AppState;

use crate::handlers::admin::validate_system_admin;

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

/// Response for `POST /kyc/start`
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StartKycResponse {
    /// Internal session ID (UUID).
    pub session_id: String,
    /// Redirect URL to send the user to for identity verification.
    pub redirect_url: String,
}

/// Response for `GET /kyc/status`
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct KycStatusApiResponse {
    /// Current KYC status: `"none"`, `"pending"`, `"verified"`, `"failed"`, or `"canceled"`.
    pub status: String,
    /// When the user was KYC-verified (ISO 8601), if applicable.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub verified_at: Option<String>,
    /// When the KYC verification expires (ISO 8601), if applicable.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<String>,
    /// Current enforcement mode: `"none"`, `"optional"`, `"withdrawals"`, `"deposits"`, `"all"`.
    pub enforcement_mode: String,
}

/// A single KYC session item in admin history
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct KycSessionItem {
    pub id: String,
    pub provider: String,
    pub provider_session_id: String,
    /// Session-level status: `"pending"`, `"verified"`, `"failed"`, or `"canceled"`.
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_code: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_reason: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub completed_at: Option<String>,
}

/// Response for `GET /admin/users/{user_id}/kyc`
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminUserKycResponse {
    pub user_id: String,
    /// Current aggregate KYC status on the user record.
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub verified_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<String>,
    pub sessions: Vec<KycSessionItem>,
    pub total_sessions: u64,
}

/// Request body for `POST /admin/users/{user_id}/kyc/override`
#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KycOverrideRequest {
    /// Target status: `"none"`, `"pending"`, `"verified"`, `"failed"`, or `"canceled"`.
    pub status: String,
    /// Optional expiry timestamp for `"verified"` status (ISO 8601).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<String>,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Validate that a KYC status string is one of the accepted values.
fn validate_kyc_status(status: &str) -> Result<(), AppError> {
    match status {
        "none" | "pending" | "verified" | "failed" | "canceled" => Ok(()),
        other => Err(AppError::Validation(format!(
            "Invalid KYC status '{}'. Expected one of: none, pending, verified, failed, canceled",
            other
        ))),
    }
}

fn format_dt(dt: &DateTime<Utc>) -> String {
    dt.to_rfc3339()
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/// POST /kyc/start
///
/// Creates a new KYC verification session for the authenticated user and
/// returns a redirect URL to send the user to the identity provider.
///
/// # Errors
/// - `401 Unauthorized` — missing or invalid JWT.
/// - `404 Not Found` — KYC service not configured.
/// - Propagates service-level errors (network, Stripe API).
pub async fn start_kyc<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<StartKycResponse>, AppError> {
    let auth_user = authenticate(&state, &headers).await?;

    let kyc_service = state
        .kyc_service
        .as_ref()
        .ok_or_else(|| AppError::NotFound("KYC not available".into()))?;

    let result = kyc_service.start_verification(auth_user.user_id).await?;

    tracing::info!(
        user_id = %auth_user.user_id,
        session_id = %result.session_id,
        "KYC verification session started"
    );

    Ok(Json(StartKycResponse {
        session_id: result.session_id.to_string(),
        redirect_url: result.redirect_url,
    }))
}

/// GET /kyc/status
///
/// Returns the current KYC verification status for the authenticated user,
/// including timestamps if verified.
///
/// # Errors
/// - `401 Unauthorized` — missing or invalid JWT.
/// - `404 Not Found` — KYC service not configured.
pub async fn kyc_status<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<KycStatusApiResponse>, AppError> {
    let auth_user = authenticate(&state, &headers).await?;

    let kyc_service = state
        .kyc_service
        .as_ref()
        .ok_or_else(|| AppError::NotFound("KYC not available".into()))?;

    // KycService::get_status returns a struct with DateTime<Utc> timestamp fields.
    let status = kyc_service.get_status(auth_user.user_id).await?;

    Ok(Json(KycStatusApiResponse {
        status: status.status,
        verified_at: status.verified_at.as_ref().map(format_dt),
        expires_at: status.expires_at.as_ref().map(format_dt),
        enforcement_mode: status.enforcement_mode,
    }))
}

/// POST /webhook/kyc
///
/// Receives Stripe Identity webhook events and delegates processing to
/// `KycService`. The `Stripe-Signature` header is required; requests without
/// a valid signature are rejected.
///
/// Returns `200 OK` on success so Stripe does not retry.
///
/// # Errors
/// - `400 Validation` — missing `Stripe-Signature` header.
/// - `404 Not Found` — KYC service not configured.
/// - `401 Unauthorized` — signature verification failed (propagated from service).
pub async fn handle_kyc_webhook<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    body: axum::body::Bytes,
) -> Result<StatusCode, AppError> {
    let kyc_service = state
        .kyc_service
        .as_ref()
        .ok_or_else(|| AppError::NotFound("KYC not available".into()))?;

    let signature = headers
        .get("stripe-signature")
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| AppError::Validation("Missing Stripe-Signature header".into()))?;

    kyc_service.handle_webhook(&body, signature).await?;

    Ok(StatusCode::OK)
}

/// GET /admin/users/{user_id}/kyc
///
/// Returns the full KYC record for a user: aggregate status from the user row
/// plus paginated session history (most recent 20 sessions).
///
/// # Errors
/// - `401/403` — not authenticated or not a system admin.
/// - `404 Not Found` — KYC service not configured or user not found.
pub async fn get_user_kyc<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
) -> Result<Json<AdminUserKycResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;

    let kyc_service = state
        .kyc_service
        .as_ref()
        .ok_or_else(|| AppError::NotFound("KYC not available".into()))?;

    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    use crate::repositories::KycSessionEntity;
    let sessions: Vec<KycSessionEntity> = kyc_service.list_sessions(user_id, 20, 0).await?;
    let total_sessions: u64 = kyc_service.count_sessions(user_id).await?;

    let session_items = sessions
        .into_iter()
        .map(|s| KycSessionItem {
            id: s.id.to_string(),
            provider: s.provider,
            provider_session_id: s.provider_session_id,
            status: s.status,
            error_code: s.error_code,
            error_reason: s.error_reason,
            created_at: format_dt(&s.created_at),
            updated_at: format_dt(&s.updated_at),
            completed_at: s.completed_at.as_ref().map(format_dt),
        })
        .collect();

    Ok(Json(AdminUserKycResponse {
        user_id: user_id.to_string(),
        status: user.kyc_status,
        verified_at: user.kyc_verified_at.as_ref().map(format_dt),
        expires_at: user.kyc_expires_at.as_ref().map(format_dt),
        sessions: session_items,
        total_sessions,
    }))
}

/// POST /admin/users/{user_id}/kyc/override
///
/// Manually sets the KYC status for a user, bypassing the normal verification
/// flow. Intended for support use-cases (e.g. manual approval, resetting a
/// stuck status).
///
/// # Errors
/// - `401/403` — not authenticated or not a system admin.
/// - `400 Validation` — unrecognised `status` value or malformed `expires_at`.
/// - `404 Not Found` — user not found.
pub async fn override_kyc_status<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
    Json(request): Json<KycOverrideRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    validate_kyc_status(&request.status)?;

    // Ensure the user exists before writing
    let _ = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    // Parse optional expires_at string
    let expires_at: Option<DateTime<Utc>> = match request.expires_at.as_deref() {
        None | Some("") => None,
        Some(s) => {
            let dt = DateTime::parse_from_rfc3339(s)
                .map_err(|_| {
                    AppError::Validation(format!("Invalid expires_at timestamp: '{}'", s))
                })?
                .with_timezone(&Utc);
            Some(dt)
        }
    };

    // Set verified_at to now when overriding to "verified", clear it otherwise
    let verified_at: Option<DateTime<Utc>> = if request.status == "verified" {
        Some(Utc::now())
    } else {
        None
    };

    state
        .user_repo
        .set_kyc_status(user_id, &request.status, verified_at, expires_at)
        .await?;

    tracing::info!(
        admin_id = %admin_id,
        user_id = %user_id,
        status = %request.status,
        "Admin KYC status override applied"
    );

    Ok(Json(serde_json::json!({
        "ok": true,
        "userId": user_id.to_string(),
        "status": request.status,
    })))
}
