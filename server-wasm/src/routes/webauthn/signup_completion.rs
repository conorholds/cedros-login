use uuid::Uuid;

use super::super::{account, auth, cookies, RouteError};
use crate::clock;
use crate::data::credentials::CredentialEntry;
use crate::data::memberships::MembershipEntry;
use crate::data::registration_account::{self, RegistrationProof};
use crate::data::users::UserEntry;
use crate::data::verifications::VerificationEntry;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::telemetry;
use crate::services::jwt::TokenContext;

const SIGNUP_CHALLENGE: &str = "webauthn_signup";

pub(super) fn persist(
    request: &RouteRequest,
    user: UserEntry,
    credential: CredentialEntry,
    proof: &VerificationEntry,
) -> Result<RouteResponse, RouteError> {
    let org_id = auth::resolve_default_org_id()?;
    let membership = MembershipEntry {
        id: Uuid::new_v4().to_string(),
        user_id: user.id.clone(),
        org_id: org_id.clone(),
        role: "member".into(),
        joined_at: clock::now_iso(),
    };
    let gate = super::super::invite_codes::gate_enabled();
    let pending = gate.then(|| super::super::invite_codes::pending_account(&user.id));
    let session_allowed = !gate && !auth::email_verification_blocks_session(&user);
    let ip = auth::client_ip(request);
    let user_agent = auth::user_agent(request);
    let context = TokenContext {
        org_id: Some(org_id.clone()),
        role: Some("member".into()),
        email_verified: Some(user.email_verified),
        ..Default::default()
    };
    let prepared = session_allowed
        .then(|| {
            auth::prepare_session(
                &user,
                &context,
                ip.clone(),
                user_agent.clone(),
                Some(clock::now_iso()),
            )
        })
        .transpose()?;
    registration_account::create(
        &user,
        Some(&credential),
        &membership,
        prepared.as_ref().map(|(_, session)| session),
        pending.as_ref(),
        Some(RegistrationProof::Verification(proof, &[SIGNUP_CHALLENGE])),
    )?;
    emit_registered();
    finish(
        request,
        user,
        gate,
        session_allowed,
        prepared,
        ip,
        user_agent,
    )
}

fn finish(
    request: &RouteRequest,
    user: UserEntry,
    gate: bool,
    session_allowed: bool,
    prepared: Option<(
        crate::services::jwt::TokenPair,
        crate::data::sessions::SessionEntry,
    )>,
    ip: Option<String>,
    user_agent: Option<String>,
) -> Result<RouteResponse, RouteError> {
    if gate {
        let token = super::super::invite_codes::issue_pending_token(&user.id)?;
        let status = super::super::invite_codes::pending_handoff_status(request, &user)?;
        return auth::respond_invite_code_required(
            201,
            &user,
            true,
            Some("webauthn"),
            &token,
            status,
        );
    }
    if !session_allowed {
        account::send_verification_email(&user, None);
        return Err(RouteError::Status(403, "email_not_verified"));
    }
    let (tokens, session) = prepared.expect("session prepared when policy allows it");
    auth::maybe_alert_new_device_after_session(
        &user,
        ip.as_deref(),
        user_agent.as_deref(),
        &session.id,
    );
    auth::respond(
        201,
        &user,
        tokens,
        true,
        Some("webauthn"),
        &cookies::config(),
    )
}

fn emit_registered() {
    for event in [
        "cedros-login:registered",
        "cedros-login:registration-created",
    ] {
        let _ = telemetry::emit_event(
            event,
            "",
            &serde_json::json!({
                "method": "webauthn", "routeId": "cedros-login:webauthn-signup-verify"
            }),
        );
    }
}
