//! First-run setup for the initial system-admin user and organization.
//! Setup only succeeds once the admin and default organization are both durable.
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::{error_response, json, require_system_admin_write, validation, RouteError};
use crate::clock;
use crate::data::user_emails::{self, UserEmailEntry};
use crate::data::users::{self, UserEntry};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::db::{self, AtomicBatchOp, ConditionalBatchOp, ConditionalOperation};
use crate::host::{from_json, telemetry, to_json, Result as HostResult, SeamError};
use crate::services::email;
use crate::services::password::PasswordService;

#[path = "setup/bootstrap.rs"]
mod bootstrap;
pub(crate) use bootstrap::{
    configured_default_org_id, ensure_default_org_bootstrap, usable_default_org_id,
};

/// Settings-seam key holding the org new signups join (read by registration).
pub const DEFAULT_ORG_ID_SETTING: &str = "default_org_id";
const DEFAULT_ORG_NAME: &str = "My Organization";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SetupStatusResponse {
    needs_setup: bool,
    has_admin: bool,
    server_version: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateFirstAdminRequest {
    email: String,
    password: String,
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    org_name: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ImportFirstAdminRequest {
    email: String,
    password_hash: String,
    #[serde(default)]
    password_hash_scheme: Option<String>,
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    org_name: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CreateFirstAdminResponse {
    success: bool,
    user_id: String,
    message: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SetupAlreadyConfiguredResponse {
    code: &'static str,
    already_configured: bool,
    success: bool,
    message: &'static str,
}

#[derive(Clone, Copy)]
enum ExistingAdminBehavior {
    Reject,
    ReturnAlreadyConfigured,
}

pub fn status(_request: &RouteRequest) -> RouteResponse {
    run(status_inner())
}
pub fn create_first_admin(request: &RouteRequest) -> RouteResponse {
    run(create_first_admin_inner(request))
}
pub fn import_first_admin(request: &RouteRequest) -> RouteResponse {
    run(import_first_admin_inner(request))
}

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

/// GET /setup/status — public; whether the system still needs its first admin.
fn status_inner() -> Result<RouteResponse, RouteError> {
    let state = bootstrap::setup_state()?;
    Ok(json(
        200,
        &to_json(&SetupStatusResponse {
            needs_setup: !state.complete,
            has_admin: state.has_admin,
            server_version: env!("CARGO_PKG_VERSION").to_string(),
        })?,
    ))
}

/// POST /setup/admin: host-system-admin-gated one-shot setup.
fn create_first_admin_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    // Fail closed before parsing or hashing anything.
    require_system_admin_write(request)?;

    let req: CreateFirstAdminRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;

    let password_service = PasswordService::default();
    password_service.validate(&req.password)?;
    let password_hash = password_service.hash(&req.password)?;

    create_first_admin_with_hash(
        req.email,
        password_hash,
        req.name,
        req.org_name,
        "host-admin",
        ExistingAdminBehavior::Reject,
    )
}

/// POST /setup/admin/import: import Cedros platform's owner/operator password hash.
fn import_first_admin_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;

    // Keep import setup one-shot after the host admin write envelope passes.
    // When setup has completed, do not parse or trust caller-supplied import
    // credentials; only repair the default org pointer and report the stable
    // already-configured response for host retries.
    if users::count_system_admins()? > 0 {
        return already_configured_after_org_repair(ensure_default_org_bootstrap());
    }

    let req: ImportFirstAdminRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    validate_password_hash_scheme(req.password_hash_scheme.as_deref())?;
    let password_hash =
        PasswordService::default().validate_host_admin_imported_hash(&req.password_hash)?;

    create_first_admin_with_hash(
        req.email,
        password_hash,
        req.name,
        req.org_name,
        "host-admin-import",
        ExistingAdminBehavior::ReturnAlreadyConfigured,
    )
}

fn created_admin_response(user_id: String) -> Result<RouteResponse, RouteError> {
    Ok(json(
        201,
        &to_json(&CreateFirstAdminResponse {
            success: true,
            user_id,
            message: "Admin account created successfully. You can now log in.".to_string(),
        })?,
    ))
}

fn create_first_admin_with_hash(
    raw_email: String,
    password_hash: String,
    name: Option<String>,
    org_name: Option<String>,
    completion_source: &str,
    existing_admin_behavior: ExistingAdminBehavior,
) -> Result<RouteResponse, RouteError> {
    // Keep setup one-shot after the host admin write envelope passes.
    if users::count_system_admins()? > 0 {
        return match existing_admin_behavior {
            ExistingAdminBehavior::Reject => {
                ensure_default_org_bootstrap()?;
                Err(RouteError::Status(403, "setup_completed"))
            }
            ExistingAdminBehavior::ReturnAlreadyConfigured => {
                already_configured_after_org_repair(ensure_default_org_bootstrap())
            }
        };
    }
    if !raw_email.contains('@') || raw_email.len() < 5 {
        return Err(validation("Invalid email format"));
    }
    let normalized = email::normalize_email(&raw_email);
    if user_emails::email_blocks_signup(&normalized)?
        || users::find_by_email(&normalized)?.is_some()
    {
        return Err(validation("Email already registered"));
    }

    let now = clock::now_iso();
    let user_id = Uuid::new_v4().to_string();
    let org_name = normalized_org_name(org_name);
    let user = first_admin_entry(user_id.clone(), normalized, password_hash, name, &now);
    claim_first_admin(&user)?;
    bootstrap::bootstrap_admin_org(&user_id, org_name, &now)?;
    emit_setup_completed(completion_source);
    created_admin_response(user_id)
}

fn first_admin_entry(
    id: String,
    email: String,
    password_hash: String,
    name: Option<String>,
    now: &str,
) -> UserEntry {
    UserEntry {
        id,
        email: Some(email),
        email_verified: true,
        password_hash: Some(password_hash),
        name,
        username: None,
        picture: None,
        wallet_address: None,
        evm_wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec!["password".to_string()],
        suspended_at: None,
        is_system_admin: true,
        created_at: now.to_string(),
        updated_at: now.to_string(),
        last_login_at: Some(now.to_string()),
        welcome_completed_at: None,
        avatar_content_type: None,
    }
}

fn normalized_org_name(name: Option<String>) -> String {
    name.map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| DEFAULT_ORG_NAME.to_string())
}

fn emit_setup_completed(completion_source: &str) {
    let _ = telemetry::emit_record(
        "setup",
        "Cedros Login setup completed",
        "First-run setup created the initial system administrator and organization.",
        &serde_json::json!({
            "setupStepId": "cedros-login:setup-login",
            "surfaceId": "cedros-data:settings",
            "completionSource": completion_source,
        }),
    );
}

fn claim_first_admin(user: &UserEntry) -> HostResult<()> {
    let operation = claim_first_admin_operation(user)?;
    db::batch_with_results(&[AtomicBatchOp::from(operation)])?;
    Ok(())
}

fn claim_first_admin_operation(user: &UserEntry) -> HostResult<ConditionalBatchOp> {
    let email = UserEmailEntry::new(
        &user.id,
        user.email
            .clone()
            .ok_or_else(|| SeamError::Db("bootstrap admin email is missing".to_string()))?,
        true,
        true,
    );
    let params = serde_json::json!({
        "user": {
            "entryKey": user.id,
            "data": serde_json::to_value(user)
                .map_err(|error| SeamError::Encoding(error.to_string()))?,
        },
        "email": {
            "entryKey": email.id,
            "data": serde_json::to_value(&email)
                .map_err(|error| SeamError::Encoding(error.to_string()))?,
        },
    });
    Ok(ConditionalBatchOp::new(
        ConditionalOperation::ClaimFirstAdmin,
        params,
    ))
}

fn already_configured_response() -> RouteResponse {
    json(
        200,
        &to_json(&SetupAlreadyConfiguredResponse {
            code: "setup_already_configured",
            already_configured: true,
            success: true,
            message: "Cedros Login already has a system administrator.",
        })
        .expect("already configured response serializes"),
    )
}

fn already_configured_after_org_repair(
    repair: HostResult<String>,
) -> Result<RouteResponse, RouteError> {
    repair?;
    Ok(already_configured_response())
}

fn validate_password_hash_scheme(value: Option<&str>) -> Result<(), RouteError> {
    let Some(value) = value.map(str::trim).filter(|value| !value.is_empty()) else {
        return Ok(());
    };

    match value {
        "argon2id-phc" | "argon2id-phc-v1" | "cedros-login:argon2id-phc:v1" => Ok(()),
        _ => Err(validation(
            "Unsupported password hash scheme for admin import",
        )),
    }
}

#[cfg(test)]
#[path = "setup_tests.rs"]
mod setup_tests;
