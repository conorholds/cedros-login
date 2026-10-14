//! OAuth consent and token families use host CAS, never read-then-write claims.
//! No authorization code, CSRF secret, or refresh token is persisted in plaintext.
use crate::data::{sessions::SessionEntry, users::UserEntry};
use crate::host::db::{self, BatchOp, Condition, Versioned, OAUTH};
use crate::host::{Result, SeamError};
use crate::services::jwt::AccessTokenClaims;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Connection {
    pub id: String,
    pub client_id: String,
    pub issuer: String,
    pub redirect_uri: String,
    pub resource: String,
    pub scope: String,
    pub state: String,
    pub code_challenge: String,
    pub created_at: String,
    pub expires_at: String,
    pub status: String,
    // Always serialize nullable persistence fields: host schema-on-first-write.
    pub identity: Option<AccessTokenClaims>,
    pub csrf_hash: Option<String>,
    pub code_hash: Option<String>,
    pub code_expires_at: Option<String>,
    pub site_id: Option<String>,
    pub runtime_site_id: Option<String>,
    pub site_name: Option<String>,
    pub refresh_generation: u64,
    #[serde(default)]
    pub cleanup_protocol_version: Option<u32>,
    #[serde(default)]
    pub cleanup_state: Option<String>,
    #[serde(default)]
    pub cleanup_check_at: Option<String>,
}

pub fn read(id: &str) -> Result<Option<Versioned<Connection>>> {
    db::read_versioned(OAUTH, id)
}
pub fn save(connection: &Connection, condition: Condition) -> Result<()> {
    let mut connection = connection.clone();
    if connection.status == "revoked" && connection.cleanup_state.is_none() {
        connection.cleanup_state = Some("pending".into());
        connection.cleanup_check_at = Some(crate::clock::now_iso());
    }
    let payload =
        serde_json::to_value(&connection).map_err(|e| SeamError::Encoding(e.to_string()))?;
    let mut conditions = vec![condition];
    let mut ops = vec![BatchOp::write(OAUTH, &connection.id, payload)];
    // Dedicated OAuth sessions never expose a Login refresh token and cannot
    // rotate. Revoke their row with the consent record in the same CAS.
    if connection.status == "revoked" {
        if let Some(identity) = &connection.identity {
            if let Some(mut session) =
                db::read_versioned::<SessionEntry>(db::SESSIONS, &identity.sid)?
            {
                if session.value.user_id != identity.sub {
                    return Err(SeamError::Db("OAuth session owner mismatch".into()));
                }
                if session.value.revoked_at.is_none() {
                    session.value.revoked_at = Some(crate::clock::now_iso());
                    session.value.revoked_reason = Some("oauth_revoked".into());
                    conditions.push(session.condition);
                    ops.push(BatchOp::write(
                        db::SESSIONS,
                        &session.value.id,
                        serde_json::to_value(&session.value)
                            .map_err(|e| SeamError::Encoding(e.to_string()))?,
                    ));
                }
            }
        }
    }
    db::compare_and_set(&conditions, &ops)
}
pub fn create(connection: &Connection) -> Result<()> {
    save(connection, Condition::absent(OAUTH, &connection.id))
}
pub fn sweep_expired(cutoff: &str, limit: u32) -> Result<u64> {
    // Never erase an unresolved cleanup obligation, including expired grants.
    // Pending and denied requests never had a dedicated session or site key.
    let mut removed = 0;
    for status in ["pending", "denied", "revoked"] {
        let mut filters = vec![db::eq("status", status), db::lt("expiresAt", cutoff)];
        if status == "revoked" {
            filters.push(db::eq("cleanupState", "accepted"));
        }
        for entry in db::read_entries(
            OAUTH,
            &db::Query {
                filters,
                order_by: Some(db::asc("expiresAt")),
                limit: Some(limit),
                ..Default::default()
            },
        )? {
            // A request can be approved concurrently with expiry cleanup. Its
            // row version must still match before removing the record.
            let condition = Condition::version(
                OAUTH,
                &entry.entry_key,
                entry.version.as_deref().unwrap_or(""),
            )?;
            match db::compare_and_set(&[condition], &[BatchOp::delete(OAUTH, &entry.entry_key)]) {
                Ok(()) => removed += 1,
                Err(error) if error.is_db_conflict() => {}
                Err(error) => return Err(error),
            }
        }
    }
    Ok(removed)
}

/// Commit explicit consent and its independent Login session atomically. The
/// browser session is only the approval proof; ordinary browser refresh cannot
/// rotate or revoke this dedicated authorization session.
pub fn approve(
    connection: &Connection,
    condition: Condition,
    session: &SessionEntry,
    user: &UserEntry,
    browser_session_id: &str,
) -> Result<()> {
    let current = db::read_versioned::<UserEntry>(db::USERS, &user.id)?
        .ok_or_else(|| SeamError::Db("OAuth user missing".into()))?;
    if current.value != *user {
        return Err(SeamError::Db("OAuth user changed".into()));
    }
    let browser = db::read_versioned::<SessionEntry>(db::SESSIONS, browser_session_id)?
        .ok_or_else(|| SeamError::Db("OAuth approval session missing".into()))?;
    if browser.value.user_id != user.id
        || browser.value.revoked_at.is_some()
        || browser.value.expires_at <= crate::clock::now_iso()
    {
        return Err(SeamError::Db("OAuth approval session is inactive".into()));
    }
    let identity = connection
        .identity
        .as_ref()
        .ok_or_else(|| SeamError::Db("OAuth consent identity missing".into()))?;
    let organization_id = identity
        .org_id
        .as_deref()
        .ok_or_else(|| SeamError::Db("OAuth consent organization missing".into()))?;
    let membership = crate::data::memberships::find_versioned(&user.id, organization_id)?
        .filter(|row| identity.role.as_deref() == Some(row.value.role.as_str()))
        .ok_or_else(|| SeamError::Db("OAuth consent membership changed".into()))?;
    // Bind the selected membership revision into the same commit as the grant.
    // A removal or downgrade after preflight cannot race approval successfully.
    db::compare_and_set(
        &[
            condition.in_access(db::OAUTH_CONSENT_DB),
            current.condition.in_access(db::OAUTH_CONSENT_DB),
            browser.condition.in_access(db::OAUTH_CONSENT_DB),
            membership.condition.in_access(db::OAUTH_CONSENT_DB),
            Condition::absent(consent_collection(db::SESSIONS), &session.id),
        ],
        &[
            BatchOp::write(
                consent_collection(OAUTH),
                &connection.id,
                serde_json::to_value(connection).map_err(|e| SeamError::Encoding(e.to_string()))?,
            ),
            BatchOp::write(
                consent_collection(db::SESSIONS),
                &session.id,
                serde_json::to_value(session).map_err(|e| SeamError::Encoding(e.to_string()))?,
            ),
        ],
    )
}

fn consent_collection(collection: db::Collection) -> db::Collection {
    db::Collection {
        access: db::OAUTH_CONSENT_DB,
        model: collection.model,
    }
}
