//! Trusted Cedros platform handoff for a durably created invite-gated account.

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::context::RouteContext;
use crate::exports::cedros::extension::routes::RouteRequest;
use crate::host::{crm_source_events, log, to_json};

const ACCESS_ID: &str = "cedros-login:invite-gate-handoff";
const SOURCE_KIND: &str = "cedros_login";
const EVENT_TYPE: &str = "invite_gate.pending";
const REASON: &str = "registration_without_invite_code";
const CONTRACT_VERSION: &str = "1";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) enum InviteGateHandoffStatus {
    Accepted,
    Rejected,
    Unavailable,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct PendingHandoff<'a> {
    contract_version: &'static str,
    event_id: String,
    occurrence_id: String,
    event_type: &'static str,
    reason: &'static str,
    login_user_id: &'a str,
    login_org_id: &'a str,
    extension_id: &'static str,
    site_id: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    installation_id: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    environment: Option<&'a str>,
    occurred_at: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct HandoffReceipt {
    accepted: bool,
    receipt_id: Option<String>,
}

pub(crate) fn submit_pending(
    request: &RouteRequest,
    user_id: &str,
    org_id: &str,
) -> InviteGateHandoffStatus {
    let occurred_at = crate::clock::now_iso();
    submit_with(
        request,
        user_id,
        org_id,
        &occurred_at,
        |code| log::op_warn("invite-gate", "handoff", code),
        |payload| crm_source_events::submit(ACCESS_ID, SOURCE_KIND, EVENT_TYPE, payload),
    )
}

fn submit_with<W, F>(
    request: &RouteRequest,
    user_id: &str,
    org_id: &str,
    occurred_at: &str,
    warn: W,
    submit: F,
) -> InviteGateHandoffStatus
where
    W: Fn(&str),
    F: FnOnce(&str) -> crate::host::Result<String>,
{
    let context = RouteContext::parse(&request.context_json);
    let Some(site_id) = non_empty(context.site_id.as_deref()) else {
        warn("site_context_unavailable");
        return InviteGateHandoffStatus::Unavailable;
    };
    let payload = pending_payload(&context, site_id, user_id, org_id, occurred_at);
    let Ok(payload_json) = to_json(&payload) else {
        return InviteGateHandoffStatus::Unavailable;
    };
    match submit(&payload_json) {
        Ok(raw) => receipt_status(&raw),
        Err(error) => {
            warn(error.code());
            InviteGateHandoffStatus::Unavailable
        }
    }
}

fn pending_payload<'a>(
    context: &'a RouteContext,
    site_id: &'a str,
    user_id: &'a str,
    org_id: &'a str,
    occurred_at: &'a str,
) -> PendingHandoff<'a> {
    let occurrence_id = occurrence_id(site_id, user_id);
    PendingHandoff {
        contract_version: CONTRACT_VERSION,
        event_id: occurrence_id.clone(),
        occurrence_id,
        event_type: EVENT_TYPE,
        reason: REASON,
        login_user_id: user_id,
        login_org_id: org_id,
        extension_id: "cedros-login",
        site_id,
        installation_id: non_empty(context.installation_id.as_deref()),
        environment: non_empty(context.environment.as_deref()),
        occurred_at: occurred_at.to_string(),
    }
}

fn occurrence_id(site_id: &str, user_id: &str) -> String {
    let input = format!("{CONTRACT_VERSION}|{EVENT_TYPE}|{site_id}|{user_id}");
    format!("igp_{:x}", Sha256::digest(input.as_bytes()))
}

fn receipt_status(raw: &str) -> InviteGateHandoffStatus {
    let Ok(receipt) = serde_json::from_str::<HandoffReceipt>(raw) else {
        return InviteGateHandoffStatus::Rejected;
    };
    if receipt.accepted && non_empty(receipt.receipt_id.as_deref()).is_some() {
        InviteGateHandoffStatus::Accepted
    } else {
        InviteGateHandoffStatus::Rejected
    }
}

fn non_empty(value: Option<&str>) -> Option<&str> {
    value.map(str::trim).filter(|value| !value.is_empty())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn request(context_json: &str) -> RouteRequest {
        RouteRequest {
            route_id: "cedros-login:register".into(),
            method: "POST".into(),
            path: "/register".into(),
            headers: vec![],
            query: vec![],
            body: String::new(),
            context_json: context_json.into(),
        }
    }

    #[test]
    fn handoff_is_stable_and_contains_no_email_or_token() {
        let req = request(r#"{"siteId":"site-1","installationId":"install-1"}"#);
        let mut captured = String::new();
        let status = submit_with(
            &req,
            "user-1",
            "org-1",
            "2026-07-13T12:00:00.000Z",
            |_| {},
            |payload| {
                captured = payload.to_string();
                Ok(r#"{"accepted":true,"receiptId":"waitlist-1"}"#.into())
            },
        );
        assert_eq!(status, InviteGateHandoffStatus::Accepted);
        let value: serde_json::Value = serde_json::from_str(&captured).unwrap();
        assert_eq!(value["eventId"], value["occurrenceId"]);
        assert_eq!(value["loginUserId"], "user-1");
        assert_eq!(value["siteId"], "site-1");
        assert!(!captured.contains("email"));
        assert!(!captured.contains("token"));
        assert_eq!(
            occurrence_id("site-1", "user-1"),
            occurrence_id("site-1", "user-1")
        );
        assert_ne!(
            occurrence_id("site-1", "user-1"),
            occurrence_id("site-2", "user-1")
        );
    }

    #[test]
    fn missing_context_or_durable_receipt_never_claims_acceptance() {
        assert_eq!(
            submit_with(
                &request("{}"),
                "user-1",
                "org-1",
                "2026-07-13T12:00:00.000Z",
                |_| {},
                |_| unreachable!()
            ),
            InviteGateHandoffStatus::Unavailable
        );
        assert_eq!(
            receipt_status(r#"{"accepted":true}"#),
            InviteGateHandoffStatus::Rejected
        );
        assert_eq!(
            receipt_status("not-json"),
            InviteGateHandoffStatus::Rejected
        );
    }
}
