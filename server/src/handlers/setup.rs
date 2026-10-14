//! Setup handlers for first-run configuration
//!
//! These endpoints are used during initial setup before any admin user exists.
//! Once an admin is created, most of these endpoints become disabled.

use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::sync::OnceLock;
use subtle::ConstantTimeEq;
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::AuthMethod;
use crate::repositories::{
    normalize_email, MembershipEntity, OrgEntity, OrgRole, SystemSetting, UserEntity,
};
use crate::services::EmailService;
use crate::utils::ensure_primary_email_row;
use crate::AppState;

static SETUP_ADMIN_LOCK: OnceLock<Mutex<()>> = OnceLock::new();
const SETUP_TOKEN_HEADER: &str = "x-cedros-setup-token";
const MIN_SETUP_TOKEN_LEN: usize = 32;
#[cfg(feature = "postgres")]
mod postgres;
#[cfg(feature = "postgres")]
use postgres::create_first_admin_postgres_atomic;

fn setup_admin_lock() -> &'static Mutex<()> {
    SETUP_ADMIN_LOCK.get_or_init(|| Mutex::new(()))
}

/// Response for setup status check
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetupStatusResponse {
    /// Whether initial setup is needed (no admin exists)
    pub needs_setup: bool,
    /// Whether at least one admin user exists
    pub has_admin: bool,
    /// Server version for compatibility checking
    pub server_version: String,
}

/// Request to create the first admin user
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateFirstAdminRequest {
    /// Admin email address
    pub email: String,
    /// Admin password (will be hashed)
    pub password: String,
    /// Optional display name
    pub name: Option<String>,
    /// Organization name (defaults to "My Organization")
    pub org_name: Option<String>,
}

/// Request to import the first admin from a Cedros platform owner/operator account.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportFirstAdminRequest {
    /// Admin email address from Cedros platform
    pub email: String,
    /// Cedros-compatible Argon2id PHC password hash
    pub password_hash: String,
    /// Optional hash contract identifier; must be Cedros Argon2id PHC when present
    pub password_hash_scheme: Option<String>,
    /// Optional display name
    pub name: Option<String>,
    /// Organization name (defaults to "My Organization")
    pub org_name: Option<String>,
}

/// Response after creating first admin
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateFirstAdminResponse {
    /// Whether admin was successfully created
    pub success: bool,
    /// Created user ID
    pub user_id: Uuid,
    /// Message for the user
    pub message: String,
}

/// Response for idempotent setup import retries after Login is already configured.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetupAlreadyConfiguredResponse {
    /// Stable machine code for host activation idempotency
    pub code: &'static str,
    /// Whether Login already has a system admin
    pub already_configured: bool,
    /// Whether the host can treat this activation step as complete
    pub success: bool,
    /// Message for operators and logs
    pub message: &'static str,
}

/// Check if initial setup is required
///
/// GET /setup/status
///
/// This endpoint is always accessible (no auth required).
/// Returns whether the system needs initial setup (no admin exists).
pub async fn setup_status<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Result<impl IntoResponse, AppError> {
    let has_admin = check_has_admin(&state).await?;

    Ok(Json(SetupStatusResponse {
        needs_setup: !has_admin,
        has_admin,
        server_version: env!("CARGO_PKG_VERSION").to_string(),
    }))
}

/// Create the first admin user
///
/// POST /setup/admin
///
/// This endpoint requires the operator-configured `SETUP_TOKEN` and only works
/// when no admin users exist.
/// After the first admin is created, this endpoint returns 403 Forbidden.
pub async fn create_first_admin<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<CreateFirstAdminRequest>,
) -> Result<Response, AppError> {
    require_setup_token(state.config.server.setup_token.as_deref(), &headers)?;

    // Setup credentials follow the same policy as registration and password changes.
    state.password_service.validate(&req.password)?;

    // Hash password using the password service
    let password_hash = state.password_service.hash(req.password.clone()).await?;

    create_first_admin_with_hash(&state, req.email, password_hash, req.name, req.org_name).await
}

fn require_setup_token(configured: Option<&str>, headers: &HeaderMap) -> Result<(), AppError> {
    let configured = configured
        .filter(|token| token.len() >= MIN_SETUP_TOKEN_LEN)
        .ok_or_else(|| AppError::Forbidden("Valid setup token required".into()))?;
    let provided = headers
        .get(SETUP_TOKEN_HEADER)
        .and_then(|value| value.to_str().ok())
        .unwrap_or_default();
    if bool::from(provided.as_bytes().ct_eq(configured.as_bytes())) {
        Ok(())
    } else {
        Err(AppError::Forbidden("Valid setup token required".into()))
    }
}

/// Import the first admin with a Cedros-compatible password hash.
///
/// POST /setup/admin/import
///
/// Native Axum deployments do not receive the Cedros host-admin route context
/// needed to authorize this import safely. Fail closed here; the equivalent
/// `server-wasm` route remains available behind the host-admin write gate.
pub async fn import_first_admin<C: AuthCallback, E: EmailService>(
    State(_state): State<Arc<AppState<C, E>>>,
) -> Result<StatusCode, AppError> {
    Err(AppError::Forbidden(
        "Admin hash import requires Cedros host-admin activation".into(),
    ))
}

async fn create_first_admin_with_hash<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    raw_email: String,
    password_hash: String,
    name: Option<String>,
    org_name: Option<String>,
) -> Result<Response, AppError> {
    // Serialize setup requests to avoid in-process TOCTOU races.
    let _lock = setup_admin_lock().lock().await;

    // Check if admin already exists (re-checked while lock is held)
    let has_admin = check_has_admin(state).await?;
    if has_admin {
        return Err(AppError::Forbidden(
            "Setup already completed. An admin user already exists.".into(),
        ));
    }

    create_first_admin_with_hash_unlocked(state, raw_email, password_hash, name, org_name).await
}

async fn create_first_admin_with_hash_unlocked<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    raw_email: String,
    password_hash: String,
    name: Option<String>,
    org_name: Option<String>,
) -> Result<Response, AppError> {
    let (email, user, org) =
        prepare_setup_entities(state, raw_email, password_hash, name, org_name).await?;
    let user_id = user.id;

    // Ensure setup bootstrap writes are atomic in postgres deployments.
    // Fallback to repository operations when postgres pool is unavailable.
    #[cfg(feature = "postgres")]
    {
        if let Some(pool) = &state.postgres_pool {
            create_first_admin_postgres_atomic(pool, &user, &org).await?;
        } else {
            create_first_admin_non_atomic(state, user, org).await?;
        }
    }

    #[cfg(not(feature = "postgres"))]
    {
        create_first_admin_non_atomic(state, user, org).await?;
    }

    tracing::info!(
        user_id = %user_id,
        email = %email,
        "First admin user created during setup"
    );

    Ok((
        StatusCode::CREATED,
        Json(CreateFirstAdminResponse {
            success: true,
            user_id,
            message: "Admin account created successfully. You can now log in.".to_string(),
        }),
    )
        .into_response())
}

async fn prepare_setup_entities<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    raw_email: String,
    password_hash: String,
    name: Option<String>,
    org_name: Option<String>,
) -> Result<(String, UserEntity, OrgEntity), AppError> {
    if !raw_email.contains('@') || raw_email.len() < 5 {
        return Err(AppError::Validation("Invalid email format".into()));
    }

    // Normalize email (NFKC + lowercase) to prevent Unicode homograph bypasses.
    let email = normalize_email(&raw_email);
    if state.user_repo.find_by_email(&email).await?.is_some() {
        return Err(AppError::Validation("Email already registered".into()));
    }

    let user_id = Uuid::new_v4();
    let now = chrono::Utc::now();
    let user = UserEntity {
        id: user_id,
        email: Some(email.clone()),
        email_verified: true,
        password_hash: Some(password_hash),
        name,
        username: None,
        picture: None,
        wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec![AuthMethod::Email],
        is_system_admin: true,
        created_at: now,
        updated_at: now,
        last_login_at: Some(now),
        welcome_completed_at: None,
        referral_code: crate::repositories::generate_referral_code(),
        referred_by: None,
    };
    let org_name = org_name.unwrap_or_else(|| "My Organization".to_string());
    let slug = slug_from_name(&org_name);
    let org = OrgEntity::new(org_name, slug, user_id, false);
    Ok((email, user, org))
}

#[cfg(test)]
fn validate_password_hash_scheme(value: Option<&str>) -> Result<(), AppError> {
    let Some(value) = value.map(str::trim).filter(|value| !value.is_empty()) else {
        return Ok(());
    };

    match value {
        "argon2id-phc" | "argon2id-phc-v1" | "cedros-login:argon2id-phc:v1" => Ok(()),
        _ => Err(AppError::Validation(
            "Unsupported password hash scheme for admin import".into(),
        )),
    }
}

async fn create_first_admin_non_atomic<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: UserEntity,
    org: OrgEntity,
) -> Result<(), AppError> {
    state.user_repo.create(user.clone()).await?;
    ensure_primary_email_row(state, &user).await?;
    state.org_repo.create(org.clone()).await?;

    let setting = SystemSetting::new(
        "default_org_id".to_string(),
        org.id.to_string(),
        "org".to_string(),
    );
    state.system_settings_repo.upsert(setting).await?;

    let membership = MembershipEntity::new(user.id, org.id, OrgRole::Owner);
    state.membership_repo.create(membership).await?;
    Ok(())
}

/// Check if any system admin users exist
async fn check_has_admin<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
) -> Result<bool, AppError> {
    // Check for any user with is_system_admin = true
    let admin_count = state.user_repo.count_system_admins().await?;
    Ok(admin_count > 0)
}

/// Convert an org name to a URL-friendly slug
fn slug_from_name(name: &str) -> String {
    let slug: String = name
        .to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect();
    // Collapse multiple dashes and trim edges
    let mut result = String::new();
    for ch in slug.chars() {
        if ch == '-' && result.ends_with('-') {
            continue;
        }
        result.push(ch);
    }
    result.trim_matches('-').to_string()
}

#[cfg(test)]
#[path = "setup_tests.rs"]
mod tests;
