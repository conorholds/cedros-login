//! Audit log over the host DB seam (`cedros-login:settings-audit-records`,
//! settings-audit-db). Append-only operational record of admin + security
//! actions; queried by the admin audit route. No secrets/PII beyond ids + an IP.
use crate::clock;
use crate::host::db::{self, Query, AUDIT};
use crate::host::Result;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// Stable event-type wire values emitted by the routes.
pub const ADMIN_USER_UPDATED: &str = "admin.user_updated";
pub const ADMIN_USER_DELETED: &str = "admin.user_deleted";
pub const ADMIN_SYSTEM_ADMIN_CHANGED: &str = "admin.system_admin_changed";
pub const ADMIN_SSO_PROVIDER_CREATED: &str = "admin.sso_provider_created";
pub const ADMIN_SSO_PROVIDER_UPDATED: &str = "admin.sso_provider_updated";
pub const ADMIN_SSO_PROVIDER_DELETED: &str = "admin.sso_provider_deleted";
pub const ADMIN_IDENTITY_PROFILE_READ: &str = "admin.identity_profile_read";
pub const ACCOUNT_DELETED: &str = "account.deleted";
pub const EMAIL_CHANGED: &str = "account.email_changed";
pub const SECURITY_TOKEN_REUSE: &str = "security.token_reuse_detected";

#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct AuditLogEntry {
    pub id: String,
    pub event_type: String,
    pub actor_user_id: Option<String>,
    /// Service principal for relying-party access. Kept separate from
    /// `actor_user_id` so machine callers are never misrepresented as users.
    #[serde(default)]
    pub relying_party_id: Option<String>,
    /// Tenant in which the audited action was authorized.
    #[serde(default)]
    pub org_id: Option<String>,
    pub target_type: Option<String>,
    pub target_id: Option<String>,
    pub ip_address: Option<String>,
    pub created_at: String,
}

/// Append an audit record. Most mutation callers log best-effort; a
/// security-sensitive read may propagate failure so it never returns data
/// without a durable access record.
pub fn log(
    event_type: &str,
    actor: Option<&str>,
    target_type: Option<&str>,
    target_id: Option<&str>,
) -> Result<()> {
    append(event_type, actor, None, None, target_type, target_id)
}

/// Append a relying-party access record with explicit machine-caller and
/// tenant attribution. Security-sensitive readers propagate any write failure.
pub fn log_relying_party_access(
    event_type: &str,
    relying_party_id: &str,
    org_id: &str,
    target_type: Option<&str>,
    target_id: Option<&str>,
) -> Result<()> {
    append(
        event_type,
        None,
        Some(relying_party_id),
        Some(org_id),
        target_type,
        target_id,
    )
}

fn append(
    event_type: &str,
    actor_user_id: Option<&str>,
    relying_party_id: Option<&str>,
    org_id: Option<&str>,
    target_type: Option<&str>,
    target_id: Option<&str>,
) -> Result<()> {
    let id = Uuid::new_v4().to_string();
    db::write(
        AUDIT,
        &id,
        &AuditLogEntry {
            id: id.clone(),
            event_type: event_type.to_string(),
            actor_user_id: actor_user_id.map(str::to_string),
            relying_party_id: relying_party_id.map(str::to_string),
            org_id: org_id.map(str::to_string),
            target_type: target_type.map(str::to_string),
            target_id: target_id.map(str::to_string),
            ip_address: None,
            created_at: clock::now_iso(),
        },
    )
}

/// One page of audit records, newest first, optionally filtered.
pub fn query(
    event_type: Option<&str>,
    target_id: Option<&str>,
    limit: u32,
    offset: u32,
) -> Result<Vec<AuditLogEntry>> {
    db::read_typed(
        AUDIT,
        &filtered(event_type, target_id, Some(limit), Some(offset)),
    )
}

pub fn count(event_type: Option<&str>, target_id: Option<&str>) -> Result<u64> {
    db::count(AUDIT, &filtered(event_type, target_id, None, None))
}

fn filtered(
    event_type: Option<&str>,
    target_id: Option<&str>,
    limit: Option<u32>,
    offset: Option<u32>,
) -> Query {
    let mut filters = Vec::new();
    if let Some(value) = event_type {
        filters.push(db::eq("eventType", value));
    }
    if let Some(value) = target_id {
        filters.push(db::eq("targetId", value));
    }
    Query {
        filters,
        order_by: Some(db::desc("createdAt")),
        limit,
        offset,
        ..Default::default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_camelcase() {
        let e = AuditLogEntry {
            id: "a1".into(),
            event_type: ADMIN_USER_DELETED.into(),
            actor_user_id: Some("adm".into()),
            relying_party_id: None,
            org_id: None,
            target_type: Some("user".into()),
            target_id: Some("u2".into()),
            ip_address: None,
            created_at: "2026-06-01T00:00:00.000Z".into(),
        };
        let j = serde_json::to_value(&e).unwrap();
        assert_eq!(j["eventType"], "admin.user_deleted");
        assert_eq!(j["actorUserId"], "adm");
        assert!(j["relyingPartyId"].is_null());
        assert!(j["orgId"].is_null());
        assert_eq!(j["targetId"], "u2");
        assert_eq!(serde_json::from_value::<AuditLogEntry>(j).unwrap(), e);
    }

    #[test]
    fn relying_party_access_has_explicit_machine_actor_and_tenant() {
        let entry = AuditLogEntry {
            id: "a2".into(),
            event_type: ADMIN_IDENTITY_PROFILE_READ.into(),
            actor_user_id: None,
            relying_party_id: Some("cedros-casino".into()),
            org_id: Some("org-casino".into()),
            target_type: Some("identity_profile".into()),
            target_id: Some("login-subject-1".into()),
            ip_address: None,
            created_at: "2026-08-19T00:00:00.000Z".into(),
        };
        let value = serde_json::to_value(&entry).unwrap();
        assert!(value["actorUserId"].is_null());
        assert_eq!(value["relyingPartyId"], "cedros-casino");
        assert_eq!(value["orgId"], "org-casino");
        assert_eq!(
            serde_json::from_value::<AuditLogEntry>(value).unwrap(),
            entry
        );
    }
}
