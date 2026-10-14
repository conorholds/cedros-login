//! Session, JWT, auth-context, and default-org helpers shared by auth routes.
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::super::{cookies, RouteError};
use super::request_helpers::{setting_i64, setting_u64};
use crate::clock;
use crate::data::api_keys;
use crate::data::memberships;
use crate::data::orgs;
use crate::data::outbox;
use crate::data::sessions::{self, SessionEntry};
use crate::data::user_emails;
use crate::data::users::{self, UserEntry};
use crate::exports::cedros::extension::routes::RouteRequest;
use crate::host::{log, secrets, settings, Result as HostResult, SeamError};
use crate::services::api_key;
use crate::services::device;
use crate::services::email_templates;
use crate::services::jwt::{AccessTokenClaims, JwtService, TokenContext, TokenPair};
use crate::services::tokens::{generate_secret_key, hash_refresh_token};

const STEP_UP_MAX_AGE_SECS: i64 = 300;

// Host secret-store keys.
const RSA_PRIVATE_KEY_SECRET: &str = "jwt-rsa-private-key";
const REFRESH_HMAC_SECRET: &str = "jwt-secret";
// Public token identity is fixed; token lifetimes remain operator-configurable.
pub(crate) const ACCESS_TOKEN_ISSUER: &str = "cedros-login";
pub(crate) const ACCESS_TOKEN_AUDIENCE: &str = "cedros";
const DEFAULT_ACCESS_TTL_SECS: u64 = 900;
const DEFAULT_REFRESH_TTL_SECS: i64 = 604_800;
/// Public verifiers may cache JWKS for at most this long. Rotation retains the
/// previous key for one access-token lifetime plus this cache window.
pub(crate) const JWKS_CACHE_MAX_AGE_SECS: u64 = 60;

/// Stamp `lastLoginAt`/`updatedAt` on a successful login, non-fatally: a seam
/// failure is logged and the login proceeds with stale timestamps rather than
/// failing a valid authentication.
pub(crate) fn touch_login_timestamp(user: &mut UserEntry) {
    if let Err(err) = users::touch_last_login(user) {
        log::op_warn("auth", "touch-last-login", err.code());
    }
}

/// Create a session stamped with the user's default org/role context.
pub(crate) fn issue_session(
    user: &UserEntry,
    ip: Option<String>,
    user_agent: Option<String>,
) -> Result<TokenPair, RouteError> {
    // Before persisting the new session so it isn't compared against itself.
    maybe_alert_new_device(user, ip.as_deref(), user_agent.as_deref());
    let context = default_org_context(user)?;
    Ok(create_session(user, &context, ip, user_agent, Some(clock::now_iso()))?.0)
}

/// Setting that opts out of the new-device-login alert email (default ON).
const NEW_DEVICE_ALERT_KEY: &str = "auth_new_device_alert_enabled";
/// Recent sessions consulted for device history.
const RECENT_SESSIONS_FOR_DEVICE: u32 = 10;

/// Email the account owner when a successful login arrives from a device not seen
/// in their recent sessions. Best-effort and opt-out via settings.
pub(crate) fn maybe_alert_new_device(user: &UserEntry, ip: Option<&str>, user_agent: Option<&str>) {
    maybe_alert_new_device_inner(user, ip, user_agent, None);
}

/// Check device history after an atomic session write, excluding that new row.
pub(crate) fn maybe_alert_new_device_after_session(
    user: &UserEntry,
    ip: Option<&str>,
    user_agent: Option<&str>,
    session_id: &str,
) {
    maybe_alert_new_device_inner(user, ip, user_agent, Some(session_id));
}

fn maybe_alert_new_device_inner(
    user: &UserEntry,
    ip: Option<&str>,
    user_agent: Option<&str>,
    exclude_session_id: Option<&str>,
) {
    if !new_device_alert_enabled() {
        return;
    }
    let Some(to) = user.email.as_deref() else {
        return;
    };
    let prior = match sessions::find_recent_by_user(&user.id, RECENT_SESSIONS_FOR_DEVICE) {
        Ok(rows) => rows,
        Err(_) => return,
    };
    let prior_uas: Vec<Option<String>> = prior
        .into_iter()
        .filter(|session| exclude_session_id != Some(session.id.as_str()))
        .map(|session| session.user_agent)
        .collect();
    if !device::is_new_device(user_agent, &prior_uas) {
        return;
    }
    let design = match crate::services::email_design::resolve("cedros-login/email_verification") {
        Ok(design) => design,
        Err(error) => {
            crate::host::log::op_warn("email", "resolve-security-design", error.code());
            return;
        }
    };
    let label = device::device_fingerprint(user_agent);
    let msg = super::super::with_subject_override(
        email_templates::new_device_login(
            &design,
            user.name.as_deref(),
            &clock::now_iso(),
            ip,
            &label,
        ),
        "email_subject_security_alert",
    );
    if let Err(e) =
        outbox::enqueue_user_email(&user.id, to, &msg.subject, Some(&msg.html), Some(&msg.text))
    {
        log::op_warn("outbox", "enqueue-new-device-alert", e.code());
    }
}

/// New-device alert is on unless explicitly disabled (`false`/`0`).
fn new_device_alert_enabled() -> bool {
    settings::bool(NEW_DEVICE_ALERT_KEY, true)
}

/// Create a session with the given `context`: issue an RS256 access token +
/// opaque refresh token, store the session with the HMAC-hashed refresh token
/// and a refresh-TTL expiry. Returns the token pair and the new session id.
pub(crate) fn create_session(
    user: &UserEntry,
    context: &TokenContext,
    ip: Option<String>,
    user_agent: Option<String>,
    last_strong_auth_at: Option<String>,
) -> Result<(TokenPair, String), RouteError> {
    let (tokens, session) = prepare_session(user, context, ip, user_agent, last_strong_auth_at)?;
    let current = crate::host::db::read_versioned::<UserEntry>(crate::host::db::USERS, &user.id)?
        .ok_or(RouteError::Status(401, "invalid_token"))?;
    if current.value != *user {
        return Err(RouteError::Status(401, "stale_user_context"));
    }
    let data = serde_json::to_value(&session).map_err(|e| SeamError::Encoding(e.to_string()))?;
    crate::host::db::compare_and_set(
        &[
            current.condition,
            crate::host::db::Condition::absent(crate::host::db::SESSIONS, &session.id),
        ],
        &[crate::host::db::BatchOp::write(
            crate::host::db::SESSIONS,
            &session.id,
            data,
        )],
    )?;
    let session_id = session.id;
    Ok((tokens, session_id))
}

/// Build signed tokens and their session row without mutating the database.
pub(crate) fn prepare_session(
    user: &UserEntry,
    context: &TokenContext,
    ip: Option<String>,
    user_agent: Option<String>,
    last_strong_auth_at: Option<String>,
) -> Result<(TokenPair, SessionEntry), RouteError> {
    if user.suspended_at.is_some() {
        return Err(RouteError::Status(403, "account_suspended"));
    }
    let (jwt, access_ttl) = build_jwt()?;
    let hmac = hmac_secret()?;
    let session_id = Uuid::new_v4().to_string();
    let access_token = jwt.generate_access_token(&user.id, &session_id, context)?;
    let refresh_token = jwt.generate_refresh_token();

    let session = SessionEntry {
        id: session_id.clone(),
        user_id: user.id.clone(),
        refresh_token_hash: hash_refresh_token(&refresh_token, &hmac),
        ip_address: ip,
        user_agent,
        created_at: clock::now_iso(),
        expires_at: clock::in_secs(refresh_ttl_secs()),
        revoked_at: None,
        revoked_reason: None,
        last_strong_auth_at,
    };
    Ok((
        TokenPair {
            access_token,
            refresh_token,
            expires_in: access_ttl,
        },
        session,
    ))
}

/// The default org/role context for a user: their first membership (earliest
/// joined), or no org if they belong to none.
pub(crate) fn default_org_context(user: &UserEntry) -> Result<TokenContext, RouteError> {
    let admin_flag = if user.is_system_admin {
        Some(true)
    } else {
        None
    };
    let context = match memberships::page_by_user(&user.id, 1, 0)?
        .into_iter()
        .next()
    {
        Some(m) => TokenContext {
            org_id: Some(m.org_id),
            role: Some(m.role),
            is_system_admin: admin_flag,
            email_verified: Some(user.email_verified),
        },
        None => TokenContext {
            is_system_admin: admin_flag,
            email_verified: Some(user.email_verified),
            ..Default::default()
        },
    };
    Ok(context)
}

/// The org new signups join; pre-setup signup must fail closed.
pub(crate) fn resolve_default_org_id() -> Result<String, RouteError> {
    resolve_default_org_with(
        super::super::setup::usable_default_org_id,
        super::super::setup::ensure_default_org_bootstrap,
    )
}

fn resolve_default_org_with<Read, Repair>(
    mut read_live: Read,
    mut repair: Repair,
) -> Result<String, RouteError>
where
    Read: FnMut() -> HostResult<Option<String>>,
    Repair: FnMut() -> HostResult<String>,
{
    if let Some(org_id) = read_live().map_err(default_org_unavailable)? {
        return Ok(org_id);
    }
    repair().map_err(default_org_unavailable)?;
    read_live()
        .map_err(default_org_unavailable)?
        .ok_or(RouteError::Status(503, "setup_required"))
}

fn default_org_unavailable(error: SeamError) -> RouteError {
    #[cfg(not(test))]
    log::op_warn("setup", "default-org-repair", error.code());
    #[cfg(test)]
    let _ = error;
    RouteError::Status(503, "setup_required")
}

pub(crate) fn email_blocks_signup(email: &str) -> Result<bool, RouteError> {
    Ok(user_emails::email_blocks_signup(email)? || users::find_by_email(email)?.is_some())
}

pub(crate) fn find_user_by_verified_email(email: &str) -> Result<Option<UserEntry>, RouteError> {
    if let Some(row) = user_emails::find_verified_by_email(email)? {
        return users::find_by_id(&row.user_id).map_err(Into::into);
    }
    let Some(user) = users::find_by_email(email)? else {
        return Ok(None);
    };
    if user.email_verified {
        user_emails::ensure_primary(&user)?;
        Ok(Some(user))
    } else {
        Ok(None)
    }
}

pub(crate) fn find_user_by_password_email(
    email: &str,
    require_verification: bool,
) -> Result<Option<UserEntry>, RouteError> {
    if require_verification {
        return find_user_by_verified_email(email);
    }
    if let Some(row) = user_emails::find_verified_by_email(email)? {
        return users::find_by_id(&row.user_id).map_err(Into::into);
    }
    users::find_by_email(email).map_err(Into::into)
}

pub(crate) fn build_jwt() -> Result<(JwtService, u64), RouteError> {
    let access_ttl = setting_u64("jwt_access_ttl_secs", DEFAULT_ACCESS_TTL_SECS);
    let ring = rsa_signing_key_ring()?;
    let previous = ring
        .previous
        .as_ref()
        .filter(|key| key.valid_until > clock::now_unix())
        .map(|key| key.private_key_pem.as_str());
    let jwt = JwtService::from_key_ring(
        &ring.active_private_key_pem,
        previous,
        ACCESS_TOKEN_ISSUER.to_string(),
        ACCESS_TOKEN_AUDIENCE.to_string(),
        access_ttl,
    )?;
    Ok((jwt, access_ttl))
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct SigningKeyRing {
    active_private_key_pem: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    previous: Option<PreviousSigningKey>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct PreviousSigningKey {
    private_key_pem: String,
    valid_until: u64,
}

/// The JWT signing key ring, seeded on first use. Legacy PEM-only secrets remain
/// readable and are migrated to the versioned JSON ring on first rotation.
fn rsa_signing_key_ring() -> HostResult<SigningKeyRing> {
    let stored = secrets::get_or_create(RSA_PRIVATE_KEY_SECRET, || {
        crate::services::jwt::generate_private_key_pem()
            .map_err(|e| SeamError::Secrets(e.to_string()))
    })?;
    decode_signing_key_ring(&stored)
}

fn decode_signing_key_ring(stored: &str) -> HostResult<SigningKeyRing> {
    if stored
        .trim_start()
        .starts_with("-----BEGIN RSA PRIVATE KEY-----")
    {
        return Ok(SigningKeyRing {
            active_private_key_pem: stored.to_string(),
            previous: None,
        });
    }
    serde_json::from_str(stored)
        .map_err(|error| SeamError::Secrets(format!("invalid JWT signing key ring: {error}")))
}

/// Rotate the active JWT signing key while retaining the old public key long
/// enough for every already-issued access token and cached JWKS to expire.
/// Called only by the system-admin rotation route.
pub(crate) fn rotate_signing_key() -> Result<(String, String, u64), RouteError> {
    let stored = crate::host::secret_versions::get_or_create(RSA_PRIVATE_KEY_SECRET, || {
        crate::services::jwt::generate_private_key_pem()
            .map_err(|e| SeamError::Secrets(e.to_string()))
    })?;
    let current = decode_signing_key_ring(&stored.value)?;
    let now = clock::now_unix();
    if rotation_in_progress(&current, now) {
        return Err(RouteError::Status(409, "key_rotation_in_progress"));
    }
    let access_ttl = setting_u64("jwt_access_ttl_secs", DEFAULT_ACCESS_TTL_SECS);
    let next_pem = crate::services::jwt::generate_private_key_pem()?;
    let valid_until = now
        .saturating_add(access_ttl.max(super::super::oauth::ACCESS_TTL as u64))
        .saturating_add(JWKS_CACHE_MAX_AGE_SECS);
    let next = SigningKeyRing {
        active_private_key_pem: next_pem,
        previous: Some(PreviousSigningKey {
            private_key_pem: current.active_private_key_pem,
            valid_until,
        }),
    };
    let encoded = serde_json::to_string(&next)
        .map_err(|error| SeamError::Secrets(format!("encode JWT signing key ring: {error}")))?;
    crate::host::secret_versions::replace(RSA_PRIVATE_KEY_SECRET, stored.condition, &encoded)
        .map_err(|error| {
            if error.is_db_conflict() {
                RouteError::Status(409, "key_rotation_in_progress")
            } else {
                error.into()
            }
        })?;
    let persisted = next;
    let new_kid = JwtService::from_pem(
        &persisted.active_private_key_pem,
        ACCESS_TOKEN_ISSUER.to_string(),
        ACCESS_TOKEN_AUDIENCE.to_string(),
        access_ttl,
    )?
    .kid()
    .to_string();
    let previous = persisted
        .previous
        .as_ref()
        .ok_or(RouteError::Status(500, "key_rotation_failed"))?;
    let previous_kid = JwtService::from_pem(
        &previous.private_key_pem,
        ACCESS_TOKEN_ISSUER.to_string(),
        ACCESS_TOKEN_AUDIENCE.to_string(),
        access_ttl,
    )?
    .kid()
    .to_string();
    Ok((new_kid, previous_kid, previous.valid_until))
}

fn rotation_in_progress(ring: &SigningKeyRing, now: u64) -> bool {
    ring.previous
        .as_ref()
        .is_some_and(|key| key.valid_until > now)
}

pub(crate) fn hmac_secret() -> HostResult<String> {
    secrets::get_or_create(REFRESH_HMAC_SECRET, || Ok(generate_secret_key()))
}

pub(crate) fn refresh_ttl_secs() -> i64 {
    setting_i64("jwt_refresh_ttl_secs", DEFAULT_REFRESH_TTL_SECS)
}

/// The end-user access token from `Authorization: Bearer`, else the access cookie.
pub(crate) fn access_token(request: &RouteRequest) -> Option<String> {
    request
        .headers
        .iter()
        .find(|(k, _)| k.eq_ignore_ascii_case("authorization"))
        .map(|(_, v)| v.as_str())
        .and_then(|v| {
            v.strip_prefix("Bearer ")
                .or_else(|| v.strip_prefix("bearer "))
        })
        .map(str::to_string)
        .or_else(|| cookies::extract(request, &cookies::config().access_name))
}

/// Authenticate the END USER from their RS256 access token. 401 if absent or
/// invalid.
pub(crate) fn authenticated_user(request: &RouteRequest) -> Result<AccessTokenClaims, RouteError> {
    authenticated_context(request).map(|context| context.claims)
}

pub(crate) struct AuthenticatedContext {
    pub claims: AccessTokenClaims,
    pub session: SessionEntry,
    pub user: UserEntry,
    pub organization: Option<ValidatedOrganization>,
}

pub(crate) struct ValidatedOrganization {
    pub org: orgs::OrgEntry,
    pub membership: memberships::MembershipEntry,
}

pub(crate) fn authenticated_context(
    request: &RouteRequest,
) -> Result<AuthenticatedContext, RouteError> {
    let token = access_token(request).ok_or(RouteError::Status(401, "unauthenticated"))?;
    authenticate_access_token(&token)
}

fn authenticate_access_token(token: &str) -> Result<AuthenticatedContext, RouteError> {
    let (jwt, _) = build_jwt()?;
    let claims = jwt.validate_access_token(token)?;
    authoritative_session(claims)
}

/// Re-check mutable Login state on every authenticated request. JWT validation
/// proves provenance and bounded age; this lookup makes logout/revocation,
/// suspension, deletion, membership removal, and role changes effective now.
pub(crate) fn authoritative_session(
    claims: AccessTokenClaims,
) -> Result<AuthenticatedContext, RouteError> {
    let session =
        sessions::find_by_id(&claims.sid)?.ok_or(RouteError::Status(401, "invalid_session"))?;
    if !session_matches_claims(&session, &claims, &clock::now_iso()) {
        return Err(RouteError::Status(401, "invalid_session"));
    }
    let user = users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(401, "invalid_session"))?;
    require_current_user_state(&user, &claims)?;
    require_verified_access_claims(&claims, &user)?;
    let organization = match claims.org_id.as_deref() {
        Some(org_id) => {
            let org = orgs::find_by_id(org_id)?
                .ok_or(RouteError::Status(403, "organization_unavailable"))?;
            let membership = memberships::find(&claims.sub, org_id)?;
            current_membership_matches_claims(&claims, membership.as_ref())?;
            Some(ValidatedOrganization {
                org,
                membership: membership
                    .ok_or(RouteError::Status(403, "organization_membership_removed"))?,
            })
        }
        None if claims.role.is_some() => return Err(RouteError::Status(401, "stale_user_context")),
        None => None,
    };
    Ok(AuthenticatedContext {
        claims,
        session,
        user,
        organization,
    })
}

fn require_current_user_state(
    user: &UserEntry,
    claims: &AccessTokenClaims,
) -> Result<(), RouteError> {
    if user.suspended_at.is_some() {
        return Err(RouteError::Status(403, "account_suspended"));
    }
    if claims.is_system_admin.unwrap_or(false) != user.is_system_admin {
        return Err(RouteError::Status(401, "stale_user_context"));
    }
    Ok(())
}

fn session_matches_claims(
    session: &SessionEntry,
    claims: &AccessTokenClaims,
    now_iso: &str,
) -> bool {
    session.user_id == claims.sub
        && session.revoked_at.is_none()
        && session.expires_at.as_str() > now_iso
}

fn current_membership_matches_claims(
    claims: &AccessTokenClaims,
    membership: Option<&crate::data::memberships::MembershipEntry>,
) -> Result<(), RouteError> {
    let membership =
        membership.ok_or(RouteError::Status(403, "organization_membership_removed"))?;
    if claims.role.as_deref() != Some(membership.role.as_str()) {
        return Err(RouteError::Status(401, "organization_role_changed"));
    }
    Ok(())
}

/// Authenticate the acting end user from either their RS256 access token or a
/// `ck_` API key.
pub(crate) fn principal(request: &RouteRequest) -> Result<String, RouteError> {
    Ok(authorization_principal(request)?.user_id)
}

pub(crate) struct AuthorizationPrincipal {
    pub(crate) user_id: String,
    /// API keys prove identity but never inherit Login system-admin authority.
    pub(crate) allow_system_admin: bool,
}

pub(crate) fn authorization_principal(
    request: &RouteRequest,
) -> Result<AuthorizationPrincipal, RouteError> {
    let token = access_token(request).ok_or(RouteError::Status(401, "unauthenticated"))?;
    if token.starts_with("ck_") {
        return Ok(AuthorizationPrincipal {
            user_id: api_key_user(&token)?,
            allow_system_admin: false,
        });
    }
    Ok(AuthorizationPrincipal {
        user_id: authenticate_access_token(&token)?.claims.sub,
        allow_system_admin: true,
    })
}

pub(crate) fn ensure_email_verified_session_allowed(user: &UserEntry) -> Result<(), RouteError> {
    if email_verification_blocks_session(user) {
        Err(RouteError::Status(403, "email_not_verified"))
    } else {
        Ok(())
    }
}

fn require_verified_access_claims(
    claims: &AccessTokenClaims,
    user: &UserEntry,
) -> Result<(), RouteError> {
    require_verified_access_claims_for_policy(
        claims,
        user,
        settings::bool("auth_email_require_verification", true),
    )
}

fn require_verified_access_claims_for_policy(
    claims: &AccessTokenClaims,
    user: &UserEntry,
    require_verification: bool,
) -> Result<(), RouteError> {
    if claims
        .email_verified
        .is_some_and(|verified| verified != user.email_verified)
    {
        return Err(RouteError::Status(401, "stale_user_context"));
    }
    if email_verification_blocks_session_for_policy(user, require_verification) {
        return Err(RouteError::Status(403, "email_not_verified"));
    }

    Ok(())
}

pub(crate) fn email_verification_blocks_session(user: &UserEntry) -> bool {
    email_verification_blocks_session_for_policy(
        user,
        settings::bool("auth_email_require_verification", true),
    )
}

fn email_verification_blocks_session_for_policy(
    user: &UserEntry,
    require_verification: bool,
) -> bool {
    user_blocks_session_when_verification_required(
        user.email.is_some(),
        user.email_verified,
        require_verification,
    )
}

pub(crate) fn user_blocks_session_when_verification_required(
    has_email: bool,
    email_verified: bool,
    require_verification: bool,
) -> bool {
    require_verification && has_email && !email_verified
}

pub(crate) fn register_should_issue_session(require_verification: bool) -> bool {
    !require_verification
}

/// Require recent strong authentication on the current end-user session before
/// allowing a sensitive credential-linking operation.
pub(crate) fn require_step_up(claims: &AccessTokenClaims) -> Result<(), RouteError> {
    let session =
        sessions::find_by_id(&claims.sid)?.ok_or(RouteError::Status(401, "invalid_token"))?;
    if session.user_id != claims.sub
        || session.revoked_at.is_some()
        || session.expires_at <= clock::now_iso()
    {
        return Err(RouteError::Status(401, "invalid_token"));
    }
    let Some(last_strong_auth_at) = session.last_strong_auth_at.as_deref() else {
        return Err(RouteError::Status(403, "step_up_required"));
    };
    let ts = chrono::DateTime::parse_from_rfc3339(last_strong_auth_at)
        .map_err(|_| RouteError::Status(403, "step_up_required"))?
        .with_timezone(&chrono::Utc);
    let age = chrono::Utc::now().signed_duration_since(ts);
    if age < chrono::Duration::zero() || age.num_seconds() > STEP_UP_MAX_AGE_SECS {
        return Err(RouteError::Status(403, "step_up_required"));
    }
    Ok(())
}

/// Resolve a raw `ck_` API key to its owning user id (revocation deletes the row).
fn api_key_user(raw: &str) -> Result<String, RouteError> {
    let entry = api_keys::find_by_hash(&api_key::hash(raw))?
        .ok_or(RouteError::Status(401, "unauthenticated"))?;
    let user_id = entry.user_id.clone();
    let user = users::find_by_id(&user_id)?.ok_or(RouteError::Status(401, "unauthenticated"))?;
    if user.suspended_at.is_some() {
        return Err(RouteError::Status(403, "account_suspended"));
    }
    ensure_email_verified_session_allowed(&user)?;
    let _ = api_keys::touch_last_used(entry, &clock::now_iso());
    Ok(user_id)
}

#[cfg(test)]
#[path = "auth_session_tests.rs"]
mod tests;

