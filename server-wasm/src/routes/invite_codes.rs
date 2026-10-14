//! Invite-code routes: admin management, user-issued account codes, and the
//! registration-gate redemption. Faithful port of
//! `server/src/handlers/invite_codes.rs` + `services/invite_code_service.rs`.
//!
//! Admin reads are system-admin gated; writes also require CSRF-immune (bearer)
//! auth. `redeem` is PUBLIC — it is authorized by the single-use pending-invite
//! token issued during gated registration, not by a session. The gate state
//! helpers (`gate_enabled`/`pending_login_response`/`issue_pending_token`) are
//! consumed by authentication routes.
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[path = "invite_codes/gate.rs"]
mod gate;
use gate::redemption_response_policy;
pub(crate) use gate::{
    activate_user, gate_enabled, is_user_pending, issue_pending_token, pending_account,
    pending_handoff_status, pending_login_response, prepare_pending_token, redeem_for_user,
};
use gate::{prepare_redemption, redemption_account};

use super::auth::{
    authenticated_user, client_ip, issue_session, respond_redeemed,
    respond_without_session_redeemed, user_agent, InviteDiscountView,
};
use super::invite_code_policy;
use super::invite_code_utils::{
    generate_invite_code, normalize_code, path_code_id, validate_window,
};
use super::{
    admin_actor, cookies, error_response, json, pagination, require_system_admin,
    require_system_admin_write, validation, RouteError,
};
use crate::clock;
use crate::data::invite_codes::{self, InviteCode};
use crate::data::login_attempts::{self, LoginAttemptEntry};
use crate::data::users;
use crate::data::verifications::{self, VerificationEntry};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, settings, to_json};
use crate::services::tokens::hash_verification_token;

/// Verification token type proving a gated registration may complete via redeem.
pub(crate) const PENDING_TOKEN_TYPE: &str = "invite_code_pending";
/// Pending-invite token lifetime — 30 days, matching the standalone server.
const PENDING_TOKEN_TTL_SECS: i64 = 30 * 86_400;

// ---- request / response shapes (mirror the standalone + React client) --------

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateRequest {
    #[serde(default)]
    code: Option<String>,
    #[serde(default)]
    max_uses: Option<i32>,
    #[serde(default)]
    starts_at: Option<String>,
    #[serde(default)]
    expires_at: Option<String>,
    #[serde(default)]
    discount_percent: Option<i32>,
    discount_months: Option<i32>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateRequest {
    #[serde(default)]
    code: Option<String>,
    #[serde(default)]
    max_uses: PatchValue<i32>,
    #[serde(default)]
    starts_at: PatchValue<String>,
    #[serde(default)]
    expires_at: PatchValue<String>,
    #[serde(default)]
    active: Option<bool>,
    #[serde(default)]
    discount_percent: PatchValue<i32>,
    #[serde(default)]
    discount_months: PatchValue<i32>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RedeemRequest {
    pending_invite_token: String,
    code: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct InviteCodeView {
    id: String,
    code: String,
    max_uses: Option<i32>,
    uses_count: i32,
    starts_at: Option<String>,
    expires_at: Option<String>,
    active: bool,
    owner_user_id: Option<String>,
    discount_percent: Option<i32>,
    discount_months: Option<i32>,
    created_at: String,
    updated_at: String,
}

#[derive(Serialize)]
struct ListResponse {
    codes: Vec<InviteCodeView>,
}

#[derive(Serialize)]
struct MessageResponse {
    message: String,
}

/// Body of `GET /account/invite-discount` (public-auth): the caller's held
/// invite-code discount or null. Read by billing (Cedros Pay) at checkout.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DiscountResponse {
    discount: Option<DiscountGrantView>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DiscountGrantView {
    percent_off: i32,
    duration_months: Option<i32>,
    code: String,
    redeemed_at: String,
}

#[derive(Debug, Clone, Default)]
enum PatchValue<T> {
    #[default]
    Unchanged,
    Set(Option<T>),
}

impl<'de, T> Deserialize<'de> for PatchValue<T>
where
    T: Deserialize<'de>,
{
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        Option::<T>::deserialize(deserializer).map(Self::Set)
    }
}

impl<T: Clone> PatchValue<T> {
    fn is_set(&self) -> bool {
        matches!(self, Self::Set(_))
    }

    fn value(&self) -> Option<T> {
        match self {
            Self::Unchanged => None,
            Self::Set(value) => value.clone(),
        }
    }

    fn resolve(&self, current: Option<T>) -> Option<T> {
        match self {
            Self::Unchanged => current,
            Self::Set(value) => value.clone(),
        }
    }
}

fn view(code: &InviteCode) -> InviteCodeView {
    InviteCodeView {
        id: code.id.clone(),
        code: code.code.clone(),
        max_uses: code.max_uses,
        uses_count: code.uses_count,
        starts_at: code.starts_at.clone(),
        expires_at: code.expires_at.clone(),
        active: code.active,
        owner_user_id: code.owner_user_id.clone(),
        discount_percent: code.discount_percent,
        discount_months: code.discount_months,
        created_at: code.created_at.clone(),
        updated_at: code.updated_at.clone(),
    }
}

fn validate_discount_months(months: Option<i32>, percent: Option<i32>) -> Result<(), RouteError> {
    if matches!(months, Some(value) if value <= 0 || percent.is_none()) {
        return Err(validation(
            "discountMonths must be a positive integer and requires discountPercent",
        ));
    }
    Ok(())
}

fn validate_discount_percent(value: Option<i32>) -> Result<(), RouteError> {
    if matches!(value, Some(percent) if !(1..=100).contains(&percent)) {
        return Err(validation("discountPercent must be between 1 and 100"));
    }
    Ok(())
}

// ---- admin handlers ----------------------------------------------------------

/// GET /admin/invite-codes — newest-first paged listing (system admin).
pub fn list_admin(request: &RouteRequest) -> RouteResponse {
    wrap(list_admin_inner(request))
}

fn list_admin_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin(request)?;
    let (limit, offset) = pagination::paged(&request.query, 50, 100, 1_000_000);
    let codes = invite_codes::list_admin(limit, offset)?;
    Ok(json(
        200,
        &to_json(&ListResponse {
            codes: codes.iter().map(view).collect(),
        })?,
    ))
}

/// POST /admin/invite-codes — create an admin-issued code (system admin, write).
pub fn create_admin(request: &RouteRequest) -> RouteResponse {
    wrap(create_admin_inner(request))
}

fn create_admin_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let req: CreateRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    validate_window(req.starts_at.as_deref(), req.expires_at.as_deref())?;
    if matches!(req.max_uses, Some(value) if value <= 0) {
        return Err(validation("maxUses must be greater than 0"));
    }
    validate_discount_percent(req.discount_percent)?;
    validate_discount_months(req.discount_months, req.discount_percent)?;

    let code_value = match req.code.as_deref().map(str::trim).filter(|c| !c.is_empty()) {
        Some(code) => normalize_code(code)?,
        None => generate_invite_code(),
    };
    if !invite_codes::find_by_code(&code_value)?.is_empty() {
        return Err(validation("Invite code already exists"));
    }

    let now = clock::now_iso();
    let entity = InviteCode {
        id: Uuid::new_v4().to_string(),
        code: code_value,
        created_by: admin_actor(request),
        owner_user_id: None,
        max_uses: req.max_uses,
        uses_count: 0,
        starts_at: req.starts_at,
        expires_at: req.expires_at,
        active: true,
        batch_key: None,
        discount_percent: req.discount_percent,
        discount_months: req.discount_months,
        created_at: now.clone(),
        updated_at: now,
    };
    invite_codes::create(&entity)?;
    Ok(json(201, &to_json(&view(&entity))?))
}

/// PATCH /admin/invite-codes/:id — edit admin-managed code fields.
pub fn update_admin(request: &RouteRequest) -> RouteResponse {
    wrap(update_admin_inner(request))
}

fn update_admin_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let id = path_code_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    let req: UpdateRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let mut code = invite_codes::find_by_id(id)?.ok_or(RouteError::Status(404, "not_found"))?;
    if let Some(raw_code) = req.code.as_deref() {
        let normalized = normalize_code(raw_code)?;
        let duplicate = invite_codes::find_by_code(&normalized)?
            .into_iter()
            .any(|existing| existing.id != code.id);
        if duplicate {
            return Err(validation("Invite code already exists"));
        }
        code.code = normalized;
    }
    if matches!(req.max_uses, PatchValue::Set(Some(value)) if value <= 0) {
        return Err(validation("maxUses must be greater than 0"));
    }
    if let PatchValue::Set(value) = req.discount_percent {
        validate_discount_percent(value)?;
    }
    validate_window(
        req.starts_at.resolve(code.starts_at.clone()).as_deref(),
        req.expires_at.resolve(code.expires_at.clone()).as_deref(),
    )?;
    if req.max_uses.is_set() {
        code.max_uses = req.max_uses.value();
    }
    if req.starts_at.is_set() {
        code.starts_at = req.starts_at.value();
    }
    if req.expires_at.is_set() {
        code.expires_at = req.expires_at.value();
    }
    if let Some(active) = req.active {
        code.active = active;
    }
    if req.discount_percent.is_set() {
        code.discount_percent = req.discount_percent.value();
    }
    code.discount_months = req.discount_months.resolve(code.discount_months);
    validate_discount_months(code.discount_months, code.discount_percent)?;
    code.updated_at = clock::now_iso();
    invite_codes::update(&code)?;
    Ok(json(200, &to_json(&view(&code))?))
}

/// DELETE /admin/invite-codes/:id — delete one invite code (system admin, write).
pub fn delete_admin(request: &RouteRequest) -> RouteResponse {
    wrap(delete_admin_inner(request))
}

fn delete_admin_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    require_system_admin_write(request)?;
    let id = path_code_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    if !invite_codes::delete(id)? {
        return Err(RouteError::Status(404, "not_found"));
    }
    Ok(json(
        200,
        &to_json(&MessageResponse {
            message: "Invite code deleted".to_string(),
        })?,
    ))
}

// ---- account (user-issued) handler -------------------------------------------

/// GET /account/invite-codes — the caller's currently-redeemable one-time codes,
/// issuing fresh ones for the active reset window when policy allows.
pub fn list_account(request: &RouteRequest) -> RouteResponse {
    wrap(list_account_inner(request))
}

fn list_account_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = authenticated_user(request)?.sub;
    let now = clock::now_iso();
    let codes: Vec<InviteCodeView> = invite_code_policy::list_or_create_user_codes(&user_id)?
        .into_iter()
        .filter(|c| c.active && c.uses_count == 0 && c.is_available_at(&now))
        .map(|c| view(&c))
        .collect();
    Ok(json(200, &to_json(&ListResponse { codes })?))
}

// ---- public redeem (registration-gate completion) ----------------------------

/// POST /invite-codes/redeem — complete a gated registration: validate the
/// pending-invite token, redeem the code, activate the account, and (unless an
/// email-verification gate still applies) issue the session.
pub fn redeem(request: &RouteRequest) -> RouteResponse {
    wrap(redeem_inner(request))
}

fn redeem_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let req: RedeemRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let token_hash = hash_verification_token(&req.pending_invite_token);
    let token = verifications::find_by_token_hash_versioned(&token_hash)?
        .ok_or(RouteError::Status(400, "invalid_token"))?;
    let now = clock::now_iso();
    if !pending_token_is_live(&token.value, &now) {
        return Err(RouteError::Status(400, "invalid_token"));
    }
    let user =
        users::find_by_id(&token.value.user_id)?.ok_or(RouteError::Status(400, "invalid_token"))?;
    let account = redemption_account(&token.value.user_id)?;

    let code = prepare_redeem_code(request, &req.code, &user)?;
    let outcome = invite_codes::redeem(&token, &code, &account)?;
    let invite_discount = code
        .value
        .discount_percent
        .map(|percent_off| InviteDiscountView {
            percent_off,
            duration_months: code.value.discount_months,
            code: code.value.code.clone(),
        });
    let require_verified_email = settings::bool("auth_email_require_verification", true);
    let (is_new_user, issue_authenticated_session) =
        redemption_response_policy(outcome, user.email_verified, require_verified_email)?;
    if !issue_authenticated_session {
        return respond_without_session_redeemed(
            200,
            &user,
            is_new_user,
            Some("password"),
            invite_discount,
            None,
        );
    }
    let tokens = issue_session(&user, client_ip(request), user_agent(request))?;
    respond_redeemed(
        200,
        &user,
        tokens,
        is_new_user,
        Some("password"),
        &cookies::config(),
        invite_discount,
    )
}

// ---- account discount lookup (public-auth) ------------------------------------

/// GET /account/invite-discount — the authenticated caller's subscription
/// discount from the invite code they redeemed, or `{"discount": null}`.
/// Billing (Cedros Pay) reads this at checkout to apply invite-granted
/// discounts; the percent tracks the code's current value.
pub fn discount_account(request: &RouteRequest) -> RouteResponse {
    wrap(discount_account_inner(request))
}

fn discount_account_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = authenticated_user(request)?.sub;
    let account = invite_codes::find_account(&user_id)?
        .filter(|account| account.activated_at.is_some() && account.invite_code_id.is_some());
    let discount = match account {
        Some(account) => {
            let code_id = account.invite_code_id.as_deref().unwrap_or_default();
            invite_codes::find_by_id(code_id)?.and_then(|code| {
                Some(DiscountGrantView {
                    percent_off: code.discount_percent?,
                    duration_months: code.discount_months,
                    code: code.code,
                    redeemed_at: account.activated_at.clone()?,
                })
            })
        }
        None => None,
    };
    Ok(json(200, &to_json(&DiscountResponse { discount })?))
}

fn prepare_redeem_code(
    request: &RouteRequest,
    raw_code: &str,
    user: &crate::data::users::UserEntry,
) -> Result<crate::data::invite_codes::VersionedInviteCode, RouteError> {
    let throttle_key = user.email.as_deref().unwrap_or(user.id.as_str());
    let since = clock::ago_iso(super::auth::LOCKOUT_WINDOW_SECS);
    if login_attempts::count_recent_failures(throttle_key, &since)?
        >= super::auth::LOCKOUT_MAX_FAILURES
    {
        return Err(RouteError::Status(429, "too_many_attempts"));
    }
    match prepare_redemption(raw_code) {
        Ok(code) => Ok(code),
        Err(err) => {
            // Count a bad-code guess toward lockout; never count seam errors.
            if matches!(err, RouteError::Status(403, _)) {
                let _ = login_attempts::record(&LoginAttemptEntry {
                    id: Uuid::new_v4().to_string(),
                    user_id: Some(user.id.clone()),
                    email: throttle_key.to_string(),
                    ip_address: client_ip(request),
                    successful: false,
                    attempted_at: clock::now_iso(),
                });
            }
            Err(err)
        }
    }
}

// ---- pure helpers ------------------------------------------------------------

fn wrap(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    result.unwrap_or_else(error_response)
}

fn pending_token_is_live(token: &VerificationEntry, now: &str) -> bool {
    token.token_type == PENDING_TOKEN_TYPE
        && token.used_at.is_none()
        && token.expires_at.as_str() > now
}

#[cfg(test)]
#[path = "invite_codes_tests.rs"]
mod tests;
