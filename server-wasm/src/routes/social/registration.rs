use uuid::Uuid;

use super::super::{auth, cookies, invite_codes, RouteError};
use crate::clock;
use crate::data::memberships::MembershipEntry;
use crate::data::registration_account;
use crate::data::users::UserEntry;
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::telemetry;
use crate::services::jwt::TokenContext;

pub(super) fn complete(
    request: &RouteRequest,
    provider: &str,
    user: UserEntry,
) -> Result<RouteResponse, RouteError> {
    let org_id = auth::resolve_default_org_id()?;
    let membership = MembershipEntry {
        id: Uuid::new_v4().to_string(),
        user_id: user.id.clone(),
        org_id: org_id.clone(),
        role: "member".into(),
        joined_at: clock::now_iso(),
    };
    let gate = invite_codes::gate_enabled();
    let pending = gate.then(|| invite_codes::pending_account(&user.id));
    let verification_required = auth::email_verification_blocks_session(&user);
    let ip = auth::client_ip(request);
    let agent = auth::user_agent(request);
    let context = TokenContext {
        org_id: Some(org_id.clone()),
        role: Some("member".into()),
        email_verified: Some(user.email_verified),
        ..Default::default()
    };
    let prepared = (!gate && !verification_required)
        .then(|| {
            auth::prepare_session(
                &user,
                &context,
                ip.clone(),
                agent.clone(),
                Some(clock::now_iso()),
            )
        })
        .transpose()?;
    let verification_email = if verification_required {
        Some(
            super::super::account::prepare_verification_email(&user, None)
                .ok_or(RouteError::Status(500, "verification_email_unavailable"))?,
        )
    } else {
        None
    };
    if let Some(email) = verification_email.as_ref() {
        registration_account::complete(
            &user,
            None,
            &membership,
            prepared.as_ref().map(|(_, session)| session),
            pending.as_ref(),
            None,
            registration_account::RegistrationEmail {
                verification: &email.verification,
                outbox: &email.outbox,
            },
        )?;
        super::super::account::dispatch_verification_email(email);
    } else {
        registration_account::create(
            &user,
            None,
            &membership,
            prepared.as_ref().map(|(_, session)| session),
            pending.as_ref(),
            None,
        )?;
    }
    if let Some(email) = user.email.as_deref() {
        super::super::flag_email_collision(email, &format!("cedros-login:{provider}-login"));
    }
    emit_registered(provider);
    if gate {
        let token = invite_codes::issue_pending_token(&user.id)?;
        let status = super::super::invite_codes::pending_handoff_status(request, &user)?;
        return auth::respond_invite_code_required(
            201,
            &user,
            true,
            Some(provider),
            &token,
            status,
        );
    }
    if verification_required {
        return auth::respond_without_session(201, &user, true, Some(provider), Some(true));
    }
    let (tokens, session) = prepared.expect("session prepared when invite gate is disabled");
    auth::maybe_alert_new_device_after_session(&user, ip.as_deref(), agent.as_deref(), &session.id);
    auth::respond(201, &user, tokens, true, Some(provider), &cookies::config())
}

fn emit_registered(provider: &str) {
    let route_id = format!("cedros-login:{provider}-login");
    for event in [
        "cedros-login:registered",
        "cedros-login:registration-created",
    ] {
        let _ = telemetry::emit_event(
            event,
            "",
            &serde_json::json!({ "method": provider, "routeId": route_id }),
        );
    }
}
