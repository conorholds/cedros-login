//! Organization invite routes (`cedros-login:invites`): create, list, cancel,
//! resend, and accept. Faithful port of `server/src/handlers/invites/*`.
//!
//! An invite targets an `email` XOR a `walletAddress`. The raw token is returned
//! once in the create/resend response (the API contract); for email invites a
//! notification is also queued to the outbox (best-effort) — wallet invites never
//! send email. Accept (mark-accepted + membership) runs as one atomic org-db batch.
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::org_access::{require_membership, role_of};
use super::{
    action_link, auth, error_response, json, pagination, subscription_selection, validation,
    RouteError,
};
use crate::clock;
use crate::data::invites::{self, InviteEntry};
use crate::data::memberships;
use crate::data::{orgs, outbox, users};
use crate::domain::permissions::OrgRole;
use crate::domain::plan_seat_policy::SeatLimit;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, log, telemetry, to_json};
use crate::services::{email, email_templates, solana, tokens};

const INVITE_EXPIRY_SECS: i64 = 7 * 24 * 60 * 60;
const DEFAULT_LIMIT: u32 = 50;
const MAX_LIMIT: u32 = 200;
const MAX_OFFSET: u32 = 1_000_000;

fn default_role() -> String {
    "member".to_string()
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateInviteRequest {
    #[serde(default)]
    email: Option<String>,
    #[serde(default)]
    wallet_address: Option<String>,
    #[serde(default = "default_role")]
    role: String,
}

#[derive(Deserialize)]
struct AcceptInviteRequest {
    token: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct InviteView {
    id: String,
    org_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    wallet_address: Option<String>,
    role: String,
    invited_by: String,
    created_at: String,
    expires_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    accepted_at: Option<String>,
}

impl InviteView {
    fn from_entry(invite: &InviteEntry) -> Self {
        InviteView {
            id: invite.id.clone(),
            org_id: invite.org_id.clone(),
            email: invite.email.clone(),
            wallet_address: invite.wallet_address.clone(),
            role: invite.role.clone(),
            invited_by: invite.invited_by.clone(),
            created_at: invite.created_at.clone(),
            expires_at: invite.expires_at.clone(),
            accepted_at: invite.accepted_at.clone(),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct InviteWithToken {
    #[serde(flatten)]
    invite: InviteView,
    token: String,
}

#[derive(Serialize)]
struct ListInvitesResponse {
    invites: Vec<InviteView>,
    total: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AcceptInviteResponse {
    org_id: String,
    org_name: String,
    role: String,
}

#[derive(Serialize)]
struct MessageResponse {
    message: String,
}

pub fn create(request: &RouteRequest) -> RouteResponse {
    run(create_inner(request))
}
pub fn list(request: &RouteRequest) -> RouteResponse {
    run(list_inner(request))
}
pub fn cancel(request: &RouteRequest) -> RouteResponse {
    run(cancel_inner(request))
}
pub fn resend(request: &RouteRequest) -> RouteResponse {
    run(resend_inner(request))
}
pub fn accept(request: &RouteRequest) -> RouteResponse {
    run(accept_inner(request))
}

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

/// POST /orgs/:org_id/invites — invite by email or wallet; admin+ only.
fn create_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = auth::principal(request)?;
    let org =
        super::org_access::org_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    super::org_access::require_permission(
        &user_id,
        org,
        crate::domain::permissions::Permission::MemberInvite,
    )?;
    super::org_access::require_permission(
        &user_id,
        org,
        crate::domain::permissions::Permission::InviteCreate,
    )?;
    super::abuse::enforce_invite_action(request, &user_id)?;
    let req: CreateInviteRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    validate_recipient(&req)?;

    let actor = require_admin(&user_id, org)?;
    let caller_role = role_of(&actor.value)?;
    let role = OrgRole::from_str(&req.role).ok_or_else(|| validation("Invalid role"))?;
    if role == OrgRole::Owner && caller_role != OrgRole::Owner {
        return Err(RouteError::Status(403, "forbidden"));
    }
    let organization =
        crate::host::db::read_versioned::<orgs::OrgEntry>(crate::host::db::ORGS, org)?
            .ok_or(RouteError::Status(404, "not_found"))?;
    let (email_addr, wallet_address) = resolve_recipient(org, &req)?;
    if let Some(email) = email_addr.as_deref() {
        super::abuse::enforce_email_action(
            request,
            &crate::services::email::normalize_email(email),
        )?;
    }
    let finite_seat_limit = enforce_team_seat_limit(request, &user_id, org)?;
    let token = tokens::generate_invite_token();
    let invite = InviteEntry {
        id: Uuid::new_v4().to_string(),
        org_id: org.to_string(),
        email: email_addr,
        wallet_address,
        role: role.as_str().to_string(),
        token_hash: tokens::hash_invite_token(&token),
        invited_by: user_id.clone(),
        created_at: clock::now_iso(),
        expires_at: clock::in_secs(INVITE_EXPIRY_SECS),
        accepted_at: None,
    };
    let email_design = invite
        .email
        .as_ref()
        .map(|_| crate::services::email_design::resolve("cedros-login/team_invitation"))
        .transpose()?;
    invites::create_authorized(&invite, &actor, &organization)?;
    if let Some((plan_id, limit)) = finite_seat_limit {
        if let Err(error) = confirm_reserved_team_seat(org, &plan_id, limit) {
            invites::delete(&invite.id)?;
            return Err(error);
        }
    }
    if let (Some(to), Some(design)) = (invite.email.as_deref(), email_design.as_ref()) {
        enqueue_invite_email(design, to, org, &invite.role, &token, &user_id);
    }
    emit_invite_sent(&invite, false, "cedros-login:invites-create");
    Ok(json(
        200,
        &to_json(&InviteWithToken {
            invite: InviteView::from_entry(&invite),
            token,
        })?,
    ))
}

fn enforce_team_seat_limit(
    request: &RouteRequest,
    user_id: &str,
    org_id: &str,
) -> Result<Option<(String, u64)>, RouteError> {
    let access_token = bearer(request);
    let resolved =
        subscription_selection::team_seat_limit(user_id, access_token).map_err(|code| {
            log::op_warn("subscription", "team-seat-limit", code);
            RouteError::Status(503, "subscription_plan_unavailable")
        })?;
    let Some(resolved) = resolved else {
        return Ok(None);
    };
    let SeatLimit::Limited(limit) = resolved.limit else {
        return Ok(None);
    };
    let member_count = memberships::count_by_org(org_id)?;
    let now = clock::now_iso();
    let pending_count = invites::find_pending_by_org(org_id)?
        .into_iter()
        .filter(|invite| invite.expires_at > now)
        .count() as u64;
    ensure_capacity(&resolved.plan_id, limit, member_count, pending_count)?;
    Ok(Some((resolved.plan_id, limit)))
}

fn confirm_reserved_team_seat(org_id: &str, plan_id: &str, limit: u64) -> Result<(), RouteError> {
    let member_count = memberships::count_by_org(org_id)?;
    let now = clock::now_iso();
    let pending_count = invites::find_pending_by_org(org_id)?
        .into_iter()
        .filter(|invite| invite.expires_at > now)
        .count() as u64;
    ensure_reserved_capacity(plan_id, limit, member_count, pending_count)
}

fn bearer(request: &RouteRequest) -> Option<&str> {
    request
        .headers
        .iter()
        .find(|(name, _)| name.eq_ignore_ascii_case("authorization"))
        .and_then(|(_, value)| {
            value
                .strip_prefix("Bearer ")
                .or_else(|| value.strip_prefix("bearer "))
        })
}

fn ensure_capacity(
    plan_id: &str,
    limit: u64,
    member_count: u64,
    pending_count: u64,
) -> Result<(), RouteError> {
    if member_count.saturating_add(pending_count) < limit {
        return Ok(());
    }
    seat_limit_error(plan_id, limit)
}

fn ensure_reserved_capacity(
    plan_id: &str,
    limit: u64,
    member_count: u64,
    pending_count: u64,
) -> Result<(), RouteError> {
    if member_count.saturating_add(pending_count) <= limit {
        return Ok(());
    }
    seat_limit_error(plan_id, limit)
}

fn seat_limit_error(plan_id: &str, limit: u64) -> Result<(), RouteError> {
    Err(validation(&format!(
        "The {plan_id} plan allows {limit} team seat{}. Upgrade the subscription or remove a pending invitation before adding another team member.",
        if limit == 1 { "" } else { "s" }
    )))
}

/// Redacted team-growth analytics for a committed invite. `identifierType` is the
/// recipient KIND (email vs wallet), never the address; `role`/`resent` describe
/// the invite, not the people.
fn emit_invite_sent(invite: &InviteEntry, resent: bool, route_id: &str) {
    let identifier_type = if invite.email.is_some() {
        "email"
    } else {
        "wallet"
    };
    let _ = telemetry::emit_event(
        "cedros-login:invite-sent",
        "",
        &serde_json::json!({
            "identifierType": identifier_type,
            "role": invite.role,
            "resent": resent,
            "emailQueued": invite.email.is_some(),
            "routeId": route_id,
        }),
    );
}

/// GET /orgs/:org_id/invites — pending invites; any member may view.
fn list_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = auth::principal(request)?;
    let org =
        super::org_access::org_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    super::org_access::require_permission(
        &user_id,
        org,
        crate::domain::permissions::Permission::InviteRead,
    )?;
    require_membership(&user_id, org)?;

    let (limit, offset) = pagination::paged(&request.query, DEFAULT_LIMIT, MAX_LIMIT, MAX_OFFSET);
    let pending = invites::find_pending_by_org(org)?;
    let total = pending.len() as u64;
    let invites_out = pending
        .into_iter()
        .skip(offset as usize)
        .take(limit as usize)
        .map(|i| InviteView::from_entry(&i))
        .collect();
    Ok(json(
        200,
        &to_json(&ListInvitesResponse {
            invites: invites_out,
            total,
        })?,
    ))
}

/// DELETE /orgs/:org_id/invites/:invite_id — cancel a pending invite; admin+.
fn cancel_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = auth::principal(request)?;
    let org =
        super::org_access::org_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    super::org_access::require_permission(
        &user_id,
        org,
        crate::domain::permissions::Permission::InviteCancel,
    )?;
    let invite_id = invite_id_of(&request.path).ok_or(RouteError::Status(404, "not_found"))?;

    let actor = require_admin(&user_id, org)?;
    let caller_role = role_of(&actor.value)?;
    let invite = load_org_invite(invite_id, org)?;
    ensure_invite_role_manageable(caller_role, &invite.role)?;
    if invite.accepted_at.is_some() {
        return Err(validation("Invite has already been accepted"));
    }
    invites::change_pending_authorized(&invite, &actor, None)?;
    Ok(json(
        200,
        &to_json(&MessageResponse {
            message: "Invite canceled successfully".to_string(),
        })?,
    ))
}

/// POST /orgs/:org_id/invites/:invite_id/resend — rotate token + expiry; admin+.
fn resend_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = auth::principal(request)?;
    let org =
        super::org_access::org_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    super::org_access::require_permission(
        &user_id,
        org,
        crate::domain::permissions::Permission::MemberInvite,
    )?;
    super::org_access::require_permission(
        &user_id,
        org,
        crate::domain::permissions::Permission::InviteCancel,
    )?;
    super::org_access::require_permission(
        &user_id,
        org,
        crate::domain::permissions::Permission::InviteCreate,
    )?;
    let invite_id = invite_id_of(&request.path).ok_or(RouteError::Status(404, "not_found"))?;

    let actor = require_admin(&user_id, org)?;
    let caller_role = role_of(&actor.value)?;
    let old = load_org_invite(invite_id, org)?;
    ensure_invite_role_manageable(caller_role, &old.role)?;
    if old.accepted_at.is_some() {
        return Err(validation("Invite has already been accepted"));
    }
    super::abuse::enforce_invite_action(request, &user_id)?;
    if let Some(email) = old.email.as_deref() {
        super::abuse::enforce_email_action(
            request,
            &crate::services::email::normalize_email(email),
        )?;
    }
    let email_design = old
        .email
        .as_ref()
        .map(|_| crate::services::email_design::resolve("cedros-login/team_invitation"))
        .transpose()?;
    let token = tokens::generate_invite_token();
    let invite = InviteEntry {
        id: Uuid::new_v4().to_string(),
        org_id: org.to_string(),
        email: old.email.clone(),
        wallet_address: old.wallet_address.clone(),
        role: old.role.clone(),
        token_hash: tokens::hash_invite_token(&token),
        invited_by: user_id.clone(),
        created_at: clock::now_iso(),
        expires_at: clock::in_secs(INVITE_EXPIRY_SECS),
        accepted_at: None,
    };
    invites::change_pending_authorized(&old, &actor, Some(&invite))?;
    if let (Some(to), Some(design)) = (invite.email.as_deref(), email_design.as_ref()) {
        enqueue_invite_email(design, to, org, &invite.role, &token, &user_id);
    }
    emit_invite_sent(&invite, true, "cedros-login:invites-resend");
    Ok(json(
        200,
        &to_json(&InviteWithToken {
            invite: InviteView::from_entry(&invite),
            token,
        })?,
    ))
}

/// Queue the invite-notification email (email invites only); best-effort, the
/// token is also returned in the response so a queue failure isn't fatal.
fn enqueue_invite_email(
    design: &crate::services::email_design::Design,
    to: &str,
    org_id: &str,
    role: &str,
    token: &str,
    inviter_id: &str,
) {
    let org_name = orgs::find_by_id(org_id)
        .ok()
        .flatten()
        .map(|o| o.name)
        .unwrap_or_default();
    let inviter = users::find_by_id(inviter_id)
        .ok()
        .flatten()
        .and_then(|u| u.name);
    let url = action_link("/accept-invite", token);
    let email = super::with_subject_override(
        email_templates::invite(
            design,
            &org_name,
            inviter.as_deref(),
            role,
            &url,
            INVITE_EXPIRY_SECS / 86_400,
        ),
        "email_subject_invite",
    );
    if let Err(e) = outbox::enqueue_email(to, &email.subject, Some(&email.html), Some(&email.text))
    {
        log::op_warn("outbox", "enqueue-invite-email", e.code());
    }
}

/// POST /invites/accept — the authenticated user joins the org the token names.
fn accept_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let user_id = auth::principal(request)?;
    let req: AcceptInviteRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    let user = users::find_by_id(&user_id)?.ok_or(RouteError::Status(401, "invalid_token"))?;

    let token_hash = tokens::hash_invite_token(&req.token);
    let invite = invites::find_by_token_hash(&token_hash)?
        .ok_or(RouteError::Status(404, "invalid_invite"))?;
    verify_recipient(&invite, &user)?;

    if memberships::find(&user_id, &invite.org_id)?.is_some() {
        return Err(validation("You are already a member of this organization"));
    }
    let now = clock::now_iso();
    if invite.accepted_at.is_some() || invite.expires_at <= now {
        return Err(validation("Invite not found, already accepted, or expired"));
    }

    let membership = invites::accept(&invite, &user_id)?;

    // Team-growth conversion: the accept half of the invite funnel the
    // identity-health card surfaces. Recipient KIND + role only, no identifiers.
    let _ = telemetry::emit_event(
        "cedros-login:invite-accepted",
        "",
        &serde_json::json!({
            "identifierType": if invite.email.is_some() { "email" } else { "wallet" },
            "role": membership.role,
            "routeId": "cedros-login:invites-accept",
        }),
    );

    let org = orgs::find_by_id(&invite.org_id)?.ok_or(RouteError::Status(404, "not_found"))?;
    Ok(json(
        200,
        &to_json(&AcceptInviteResponse {
            org_id: org.id,
            org_name: org.name,
            role: membership.role,
        })?,
    ))
}

/// Require the caller to be an admin+ member of the org (403 otherwise).
fn require_admin(
    user_id: &str,
    org_id: &str,
) -> Result<memberships::VersionedMembership, RouteError> {
    let actor = memberships::find_versioned(user_id, org_id)?
        .ok_or(RouteError::Status(403, "forbidden"))?;
    let role = role_of(&actor.value)?;
    if role.has_at_least(OrgRole::Admin) {
        Ok(actor)
    } else {
        Err(RouteError::Status(403, "forbidden"))
    }
}

fn ensure_invite_role_manageable(actor_role: OrgRole, invite_role: &str) -> Result<(), RouteError> {
    let invite_role = OrgRole::from_str(invite_role).ok_or(RouteError::Status(403, "forbidden"))?;
    if invite_role == OrgRole::Owner && actor_role != OrgRole::Owner {
        return Err(RouteError::Status(403, "forbidden"));
    }
    Ok(())
}

/// Load an invite and confirm it belongs to `org_id` (404 otherwise — no
/// cross-org existence leak).
fn load_org_invite(invite_id: &str, org_id: &str) -> Result<InviteEntry, RouteError> {
    let invite = invites::find_by_id(invite_id)?.ok_or(RouteError::Status(404, "not_found"))?;
    if invite.org_id != org_id {
        return Err(RouteError::Status(404, "not_found"));
    }
    Ok(invite)
}

/// The recipient (email/wallet) on the access-token holder must match the invite.
fn verify_recipient(invite: &InviteEntry, user: &users::UserEntry) -> Result<(), RouteError> {
    if let Some(invite_email) = &invite.email {
        if !crate::data::user_emails::is_verified_for_user(user, invite_email)? {
            return Err(RouteError::Status(403, "forbidden"));
        }
    } else if let Some(invite_wallet) = &invite.wallet_address {
        let user_wallet = user
            .wallet_address
            .as_ref()
            .ok_or_else(|| validation("You must have a wallet to accept this invite"))?;
        if user_wallet != invite_wallet {
            return Err(RouteError::Status(403, "forbidden"));
        }
    } else {
        // Data integrity: an invite must name exactly one recipient.
        return Err(RouteError::Status(500, "invalid_invite"));
    }
    Ok(())
}

/// Email XOR wallet must be provided.
fn validate_recipient(req: &CreateInviteRequest) -> Result<(), RouteError> {
    match (&req.email, &req.wallet_address) {
        (None, None) => Err(validation("Either email or walletAddress must be provided")),
        (Some(_), Some(_)) => Err(validation("Cannot specify both email and walletAddress")),
        _ => Ok(()),
    }
}

/// Normalize + validate the recipient and reject duplicate members / pending
/// invites. Returns the `(email, wallet)` to store.
fn resolve_recipient(
    org_id: &str,
    req: &CreateInviteRequest,
) -> Result<(Option<String>, Option<String>), RouteError> {
    if let Some(input) = &req.email {
        let normalized = email::normalize_email(input);
        if !email::is_valid_email(&normalized) {
            return Err(validation("Invalid email format"));
        }
        if let Some(user) = users::find_by_email(&normalized)? {
            if memberships::find(&user.id, org_id)?.is_some() {
                return Err(validation("User is already a member of this organization"));
            }
        }
        if pending_invite_matches(org_id, |i| i.email.as_deref() == Some(normalized.as_str()))? {
            return Err(validation("An invite already exists for this email"));
        }
        Ok((Some(normalized), None))
    } else if let Some(input) = &req.wallet_address {
        let wallet = input.trim().to_string();
        if solana::validate_public_key(&wallet).is_err() {
            return Err(validation("Invalid wallet address format"));
        }
        if let Some(user) = users::find_by_wallet(&wallet)? {
            if memberships::find(&user.id, org_id)?.is_some() {
                return Err(validation("User is already a member of this organization"));
            }
        }
        if pending_invite_matches(org_id, |i| {
            i.wallet_address.as_deref() == Some(wallet.as_str())
        })? {
            return Err(validation(
                "An invite already exists for this wallet address",
            ));
        }
        Ok((None, Some(wallet)))
    } else {
        Err(validation("Either email or walletAddress must be provided"))
    }
}

/// Whether the org has an unexpired, unaccepted invite matching `predicate`.
fn pending_invite_matches(
    org_id: &str,
    predicate: impl Fn(&InviteEntry) -> bool,
) -> Result<bool, RouteError> {
    let now = clock::now_iso();
    Ok(invites::find_pending_by_org(org_id)?
        .into_iter()
        .any(|i| i.expires_at > now && predicate(&i)))
}

/// The invite id from `/orgs/{org_id}/invites/{invite_id}[/resend]`.
fn invite_id_of(path: &str) -> Option<&str> {
    let mut parts = path.strip_prefix("/orgs/")?.split('/');
    parts.next()?; // org id
    if parts.next()? != "invites" {
        return None;
    }
    parts.next().filter(|s| !s.is_empty())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_invite_id() {
        assert_eq!(invite_id_of("/orgs/o1/invites/i2"), Some("i2"));
        assert_eq!(invite_id_of("/orgs/o1/invites/i2/resend"), Some("i2"));
        assert_eq!(invite_id_of("/orgs/o1/invites"), None);
        assert_eq!(invite_id_of("/orgs/o1/members/u2"), None);
    }

    #[test]
    fn admins_cannot_manage_owner_invitations() {
        assert!(ensure_invite_role_manageable(OrgRole::Owner, "owner").is_ok());
        assert!(matches!(
            ensure_invite_role_manageable(OrgRole::Admin, "owner"),
            Err(RouteError::Status(403, "forbidden"))
        ));
        assert!(ensure_invite_role_manageable(OrgRole::Admin, "member").is_ok());
    }

    #[test]
    fn recipient_must_be_email_xor_wallet() {
        let none = CreateInviteRequest {
            email: None,
            wallet_address: None,
            role: default_role(),
        };
        let both = CreateInviteRequest {
            email: Some("a@b.test".into()),
            wallet_address: Some("w".into()),
            role: default_role(),
        };
        let email_only = CreateInviteRequest {
            email: Some("a@b.test".into()),
            wallet_address: None,
            role: default_role(),
        };
        assert!(validate_recipient(&none).is_err());
        assert!(validate_recipient(&both).is_err());
        assert!(validate_recipient(&email_only).is_ok());
    }

    #[test]
    fn finite_seat_limit_counts_members_and_pending_invites() {
        assert!(ensure_capacity("team", 3, 1, 1).is_ok());
        assert!(ensure_capacity("team", 3, 2, 1).is_err());
        assert!(ensure_capacity("individual", 1, 1, 0).is_err());
        assert!(ensure_reserved_capacity("team", 3, 2, 1).is_ok());
        assert!(ensure_reserved_capacity("team", 3, 2, 2).is_err());
    }
}
