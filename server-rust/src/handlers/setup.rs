//! Setup handlers for first-run configuration
//!
//! These endpoints are used during initial setup before any admin user exists.
//! Once an admin is created, most of these endpoints become disabled.

use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::sync::OnceLock;
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::AuthMethod;
use crate::repositories::{
    normalize_email, MembershipEntity, OrgEntity, OrgRole, SystemSetting, UserEntity,
};
use crate::services::EmailService;
use crate::AppState;

static SETUP_ADMIN_LOCK: OnceLock<Mutex<()>> = OnceLock::new();
#[cfg(feature = "postgres")]
const SETUP_ADVISORY_LOCK_KEY: i64 = 8_827_381_001;

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
/// This endpoint only works when no admin users exist.
/// After the first admin is created, this endpoint returns 403 Forbidden.
pub async fn create_first_admin<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    Json(req): Json<CreateFirstAdminRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Serialize setup requests to avoid in-process TOCTOU races.
    let _lock = setup_admin_lock().lock().await;

    // Check if admin already exists (re-checked while lock is held)
    let has_admin = check_has_admin(&state).await?;
    if has_admin {
        return Err(AppError::Forbidden(
            "Setup already completed. An admin user already exists.".into(),
        ));
    }

    // Validate email format
    if !req.email.contains('@') || req.email.len() < 5 {
        return Err(AppError::Validation("Invalid email format".into()));
    }

    // Validate password strength
    if req.password.len() < 8 {
        return Err(AppError::Validation(
            "Password must be at least 8 characters".into(),
        ));
    }

    // F-34: Normalize email (NFKC + lowercase) to prevent Unicode homograph bypasses
    let email = normalize_email(&req.email);

    // Check if email already exists
    if let Some(_existing) = state.user_repo.find_by_email(&email).await? {
        return Err(AppError::Validation("Email already registered".into()));
    }

    // Hash password using the password service
    let password_hash = state.password_service.hash(req.password.clone()).await?;

    // Create user entity
    let user_id = Uuid::new_v4();
    let now = chrono::Utc::now();
    let user = UserEntity {
        id: user_id,
        email: Some(email.clone()),
        email_verified: true, // Auto-verify for setup admin
        password_hash: Some(password_hash),
        name: req.name,
        picture: None,
        wallet_address: None,
        google_id: None,
        apple_id: None,
        stripe_customer_id: None,
        auth_methods: vec![AuthMethod::Email],
        is_system_admin: true, // This is the key - make them admin
        created_at: now,
        updated_at: now,
        last_login_at: Some(now),
    };

    // Create site organization
    let org_name = req
        .org_name
        .unwrap_or_else(|| "My Organization".to_string());
    let slug = slug_from_name(&org_name);
    let org = OrgEntity::new(org_name, slug, user_id, false);

    // F-06: Ensure setup bootstrap writes are atomic in postgres deployments.
    // Fallback to repository operations when postgres pool is unavailable.
    #[cfg(feature = "postgres")]
    {
        if let Some(pool) = &state.postgres_pool {
            create_first_admin_postgres_atomic(pool, &user, &org).await?;
        } else {
            create_first_admin_non_atomic(&state, user, org).await?;
        }
    }

    #[cfg(not(feature = "postgres"))]
    {
        create_first_admin_non_atomic(&state, user, org).await?;
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
    ))
}

async fn create_first_admin_non_atomic<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: UserEntity,
    org: OrgEntity,
) -> Result<(), AppError> {
    state.user_repo.create(user.clone()).await?;
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

#[cfg(feature = "postgres")]
async fn create_first_admin_postgres_atomic(
    pool: &sqlx::PgPool,
    user: &UserEntity,
    org: &OrgEntity,
) -> Result<(), AppError> {
    let mut tx = pool
        .begin()
        .await
        .map_err(|e| AppError::Database(format!("Failed to begin setup transaction: {}", e)))?;

    // F-07: cross-process serialization for multi-instance deployments.
    // This lock is held for the transaction lifetime.
    sqlx::query("SELECT pg_advisory_xact_lock($1)")
        .bind(SETUP_ADVISORY_LOCK_KEY)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Database(format!("Failed to acquire setup advisory lock: {}", e)))?;

    let auth_methods = vec!["email".to_string()];

    sqlx::query(
        r#"
        INSERT INTO users (
            id, email, email_verified, password_hash, name, picture, wallet_address, google_id,
            apple_id, stripe_customer_id, auth_methods, is_system_admin, created_at, updated_at, last_login_at
        ) VALUES (
            $1, $2, $3, $4, $5, NULL, NULL, NULL,
            NULL, NULL, $6, $7, $8, $9, $10
        )
        "#,
    )
    .bind(user.id)
    .bind(&user.email)
    .bind(user.email_verified)
    .bind(&user.password_hash)
    .bind(&user.name)
    .bind(&auth_methods)
    .bind(user.is_system_admin)
    .bind(user.created_at)
    .bind(user.updated_at)
    .bind(user.last_login_at)
    .execute(&mut *tx)
    .await
    .map_err(|e| AppError::Database(format!("Failed to create setup admin user: {}", e)))?;

    sqlx::query(
        r#"
        INSERT INTO organizations (id, name, slug, logo_url, is_personal, owner_id, created_at, updated_at)
        VALUES ($1, $2, $3, NULL, $4, $5, $6, $7)
        "#,
    )
    .bind(org.id)
    .bind(&org.name)
    .bind(&org.slug)
    .bind(org.is_personal)
    .bind(org.owner_id)
    .bind(org.created_at)
    .bind(org.updated_at)
    .execute(&mut *tx)
    .await
    .map_err(|e| AppError::Database(format!("Failed to create setup organization: {}", e)))?;

    sqlx::query(
        r#"
        INSERT INTO system_settings (key, value, category, description, is_secret, encryption_version, updated_at, updated_by)
        VALUES ($1, $2, $3, NULL, false, NULL, NOW(), NULL)
        ON CONFLICT (key) DO UPDATE SET
            value = EXCLUDED.value,
            category = EXCLUDED.category,
            updated_at = NOW(),
            updated_by = NULL
        "#,
    )
    .bind("default_org_id")
    .bind(org.id.to_string())
    .bind("org")
    .execute(&mut *tx)
    .await
    .map_err(|e| AppError::Database(format!("Failed to set default org id: {}", e)))?;

    sqlx::query(
        r#"
        INSERT INTO memberships (id, user_id, org_id, role, joined_at)
        VALUES ($1, $2, $3, $4, $5)
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(user.id)
    .bind(org.id)
    .bind(OrgRole::Owner.as_str())
    .bind(chrono::Utc::now())
    .execute(&mut *tx)
    .await
    .map_err(|e| AppError::Database(format!("Failed to create owner membership: {}", e)))?;

    tx.commit()
        .await
        .map_err(|e| AppError::Database(format!("Failed to commit setup transaction: {}", e)))?;

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
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use tokio::time::{sleep, Duration};

    #[test]
    fn test_setup_status_serialization() {
        let status = SetupStatusResponse {
            needs_setup: true,
            has_admin: false,
            server_version: "1.0.0".to_string(),
        };
        let json = serde_json::to_string(&status).unwrap();
        assert!(json.contains("needsSetup"));
        assert!(json.contains("hasAdmin"));
    }

    #[test]
    fn test_create_admin_request_deserialization() {
        let json = r#"{"email":"admin@example.com","password":"secret123","name":"Admin"}"#;
        let req: CreateFirstAdminRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, "admin@example.com");
        assert_eq!(req.password, "secret123");
        assert_eq!(req.name, Some("Admin".to_string()));
        assert_eq!(req.org_name, None);
    }

    #[test]
    fn test_create_admin_request_with_org_name() {
        let json = r#"{"email":"admin@example.com","password":"secret123","orgName":"Acme Corp"}"#;
        let req: CreateFirstAdminRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.org_name, Some("Acme Corp".to_string()));
    }

    #[test]
    fn test_slug_from_name() {
        assert_eq!(slug_from_name("My Organization"), "my-organization");
        assert_eq!(slug_from_name("Acme Corp!"), "acme-corp");
        assert_eq!(slug_from_name("  Hello  World  "), "hello-world");
    }

    #[tokio::test]
    async fn test_setup_lock_serializes_concurrent_access() {
        let concurrent = Arc::new(AtomicUsize::new(0));
        let max_seen = Arc::new(AtomicUsize::new(0));

        let mut tasks = Vec::new();
        for _ in 0..8 {
            let concurrent = Arc::clone(&concurrent);
            let max_seen = Arc::clone(&max_seen);
            tasks.push(tokio::spawn(async move {
                let _guard = setup_admin_lock().lock().await;
                let now = concurrent.fetch_add(1, Ordering::SeqCst) + 1;
                max_seen.fetch_max(now, Ordering::SeqCst);
                sleep(Duration::from_millis(5)).await;
                concurrent.fetch_sub(1, Ordering::SeqCst);
            }));
        }

        for task in tasks {
            task.await.expect("task join");
        }

        assert_eq!(max_seen.load(Ordering::SeqCst), 1);
    }
}
