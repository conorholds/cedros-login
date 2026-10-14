use super::ConditionalOperation;
use chrono::DateTime;
use serde_json::{Map, Value};

pub(super) fn is_valid(operation: ConditionalOperation, output: &Value) -> bool {
    use ConditionalOperation as Op;
    match operation {
        Op::RotateSession => status(output, &["status"], "rotated"),
        Op::RevokeSessions => {
            exact(output, &["revokedCount"]).is_some() && unsigned(output, "revokedCount")
        }
        Op::ConsumeLivePurposeBoundVerification => payload(output, &["payload"]),
        Op::ClaimFirstAdmin => status(output, &["status"], "created"),
        Op::DemoteSystemAdmin => {
            status(output, &["status", "updatedAt"], "demoted") && timestamp(output, "updatedAt")
        }
        #[cfg(test)]
        Op::ChangeMembershipRole => exact(output, &["status"])
            .is_some_and(|map| matches!(string(map, "status"), Some("updated" | "removed"))),
        Op::TransitionCanonicalEmail => {
            status(output, &["status", "updatedAt"], "transitioned")
                && timestamp(output, "updatedAt")
        }
        Op::ClaimOutboxDelivery | Op::ReleaseOutboxDelivery => {
            payload(output, &["payload", "updatedAt"]) && timestamp(output, "updatedAt")
        }
        Op::EnqueueTokenEmail => status(output, &["status"], "enqueued"),
        Op::CompleteOutboxDelivery => {
            status(output, &["status", "alreadyApplied"], "completed")
                && boolean(output, "alreadyApplied")
        }
        Op::CompletePasswordReset => {
            payload(output, &["payload", "revokedSessions"]) && unsigned(output, "revokedSessions")
        }
        Op::CompleteInstantLink
        | Op::CompleteSsoAuthentication
        | Op::CompleteWebauthnAuthentication => proof(output),
        Op::CompleteSolanaProof => {
            status(output, &["walletAddress", "status"], "completed")
                && nonempty_string(output, "walletAddress")
        }
        Op::CompleteWebauthnRegistration => {
            status(
                output,
                &["payload", "status", "alreadyApplied"],
                "registered",
            ) && object(output, "payload")
                && boolean(output, "alreadyApplied")
        }
        Op::GetSignupLimitStatus => signup_limit_status(output),
        Op::CreateRegistrationAccount | Op::CompleteRegistrationAccount => registration(output),
        Op::RedeemInviteCode => {
            exact(output, &["userId", "alreadyApplied"]).is_some()
                && nonempty_string(output, "userId")
                && boolean(output, "alreadyApplied")
        }
        Op::ReleaseInviteGate => invite_gate_release(output),
        Op::DeleteAccount | Op::DeleteOrganization => lifecycle_output(operation, output),
    }
}

fn signup_limit_status(output: &Value) -> bool {
    let Some(map) = exact(
        output,
        &["status", "used", "remaining", "limit", "period", "resetsAt"],
    ) else {
        return false;
    };
    string(map, "status") == Some("available")
        && unsigned_map(map, "used")
        && unsigned_map(map, "remaining")
        && unsigned_map(map, "limit")
        && matches!(string(map, "period"), Some("daily" | "weekly" | "monthly"))
        && timestamp(output, "resetsAt")
}

fn lifecycle_output(operation: ConditionalOperation, output: &Value) -> bool {
    match operation {
        ConditionalOperation::DeleteAccount => lifecycle(
            output,
            &[
                "status",
                "detachedMemberships",
                "transferredOrganizations",
                "deletedOrganizations",
                "tombstoneGeneration",
            ],
            &[
                "detachedMemberships",
                "transferredOrganizations",
                "deletedOrganizations",
            ],
        ),
        ConditionalOperation::DeleteOrganization => lifecycle(
            output,
            &[
                "status",
                "deletedMemberships",
                "deletedInvites",
                "deletedCustomRoles",
                "deletedPolicies",
                "deletedSsoProviders",
                "tombstoneGeneration",
            ],
            &[
                "deletedMemberships",
                "deletedInvites",
                "deletedCustomRoles",
                "deletedPolicies",
                "deletedSsoProviders",
            ],
        ),
        _ => false,
    }
}

fn invite_gate_release(output: &Value) -> bool {
    let Some(map) = exact(
        output,
        &[
            "userId",
            "status",
            "activatedAt",
            "redemptionId",
            "inviteCodeId",
        ],
    ) else {
        return false;
    };
    nonempty(string(map, "userId"))
        && matches!(
            string(map, "status"),
            Some("released" | "already-activated")
        )
        && timestamp(output, "activatedAt")
        && nullable_nonempty_string(map, "redemptionId")
        && nullable_nonempty_string(map, "inviteCodeId")
}

fn proof(output: &Value) -> bool {
    status(output, &["payload", "status"], "completed") && object(output, "payload")
}

fn registration(output: &Value) -> bool {
    if let Some(map) = exact(output, &["userId", "status", "proofPayload", "resetsAt"]) {
        return nonempty(string(map, "userId"))
            && string(map, "status") == Some("limit-reached")
            && matches!(map.get("proofPayload"), Some(Value::Null))
            && timestamp(output, "resetsAt");
    }
    let Some(map) = exact(output, &["userId", "status", "proofPayload"]) else {
        return false;
    };
    nonempty(string(map, "userId"))
        && matches!(string(map, "status"), Some("created" | "already-created"))
        && matches!(
            map.get("proofPayload"),
            Some(Value::Object(_)) | Some(Value::Null)
        )
}

fn lifecycle(output: &Value, keys: &[&str], counts: &[&str]) -> bool {
    let Some(map) = exact(output, keys) else {
        return false;
    };
    string(map, "status") == Some("deleted")
        && nonempty(string(map, "tombstoneGeneration"))
        && counts.iter().all(|key| unsigned_map(map, key))
}

fn payload(output: &Value, keys: &[&str]) -> bool {
    exact(output, keys).is_some() && object(output, "payload")
}

fn status(output: &Value, keys: &[&str], expected: &str) -> bool {
    exact(output, keys).is_some_and(|map| string(map, "status") == Some(expected))
}

fn exact<'a>(output: &'a Value, keys: &[&str]) -> Option<&'a Map<String, Value>> {
    let map = output.as_object()?;
    (map.len() == keys.len() && keys.iter().all(|key| map.contains_key(*key))).then_some(map)
}

fn timestamp(output: &Value, key: &str) -> bool {
    output
        .get(key)
        .and_then(Value::as_str)
        .is_some_and(|value| DateTime::parse_from_rfc3339(value).is_ok())
}

fn object(output: &Value, key: &str) -> bool {
    output.get(key).is_some_and(Value::is_object)
}

fn boolean(output: &Value, key: &str) -> bool {
    output.get(key).is_some_and(Value::is_boolean)
}

fn unsigned(output: &Value, key: &str) -> bool {
    output.as_object().is_some_and(|map| unsigned_map(map, key))
}

fn unsigned_map(map: &Map<String, Value>, key: &str) -> bool {
    map.get(key).and_then(Value::as_u64).is_some()
}

fn nonempty_string(output: &Value, key: &str) -> bool {
    nonempty(output.get(key).and_then(Value::as_str))
}

fn nonempty(value: Option<&str>) -> bool {
    value.is_some_and(|value| !value.is_empty())
}

fn string<'a>(map: &'a Map<String, Value>, key: &str) -> Option<&'a str> {
    map.get(key).and_then(Value::as_str)
}

fn nullable_nonempty_string(map: &Map<String, Value>, key: &str) -> bool {
    matches!(map.get(key), Some(Value::Null))
        || map
            .get(key)
            .and_then(Value::as_str)
            .is_some_and(|value| !value.is_empty())
}

#[cfg(test)]
#[path = "output_contract_tests.rs"]
mod tests;
