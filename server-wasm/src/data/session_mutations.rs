//! Host-atomic session mutations. No read/write fallback: the manifest requires
//! the session-atomic capability before this extension can be activated.
use super::sessions::{find_by_id, SessionEntry};
use crate::host::db::{self, ConditionalBatchOp, ConditionalOperation};
use crate::host::{Result, SeamError};
use serde_json::{json, Value};

pub fn rotate(old: &SessionEntry, replacement: &SessionEntry, reason: &str) -> Result<()> {
    if old.user_id != replacement.user_id || old.id == replacement.id {
        return Err(SeamError::Db("invalid session replacement".into()));
    }
    let mut replacement = replacement.clone();
    replacement.expires_at = replacement.expires_at.min(old.expires_at.clone());
    execute(
        ConditionalOperation::RotateSession,
        json!({
            "userId": old.user_id, "sessionId": old.id,
            "refreshTokenHash": old.refresh_token_hash,
            "reason": reason,
            "replacement": { "entryKey": replacement.id, "data": replacement },
        }),
    )?;
    Ok(())
}

/// Revoke a session and any replacement produced by a concurrent rotation.
pub fn revoke(id: &str, reason: &str) -> Result<bool> {
    let Some(session) = find_by_id(id)? else {
        return Ok(false);
    };
    execute(
        ConditionalOperation::RevokeSessions,
        json!({
            "userId": session.user_id, "sessionId": id, "reason": reason,
        }),
    )?;
    Ok(true)
}

pub fn revoke_all_for_user(user_id: &str, reason: &str, except_id: Option<&str>) -> Result<u64> {
    let output = execute(
        ConditionalOperation::RevokeSessions,
        json!({
            "userId": user_id, "reason": reason, "exceptSessionId": except_id,
        }),
    )?;
    output
        .get("revokedCount")
        .and_then(Value::as_u64)
        .ok_or_else(|| SeamError::Db("invalid session revocation result".into()))
}

/// Commit the password update and other-session revocation together, checking
/// the revision that was read before current-password verification.
pub fn change_password_and_revoke_others(
    user: &super::users::VersionedUserEntry,
    current_session_id: &str,
) -> Result<()> {
    update_user_and_revoke_others(user, current_session_id, "password_change")
}

/// Commit a security-sensitive user update and revoke every other session in
/// the same host transaction, using the exact user revision the caller read.
pub fn update_user_and_revoke_others(
    user: &super::users::VersionedUserEntry,
    current_session_id: &str,
    reason: &str,
) -> Result<()> {
    execute(
        ConditionalOperation::RevokeSessions,
        json!({
            "userId": user.value.id, "reason": reason, "exceptSessionId": current_session_id,
            "user": {"entryKey": user.entry_key, "expectedUpdatedAt": user.updated_at, "data": user.value},
        }),
    )?;
    Ok(())
}

fn execute(operation: ConditionalOperation, params: Value) -> Result<Value> {
    let result = db::batch_with_results(&[ConditionalBatchOp::new(operation, params).into()])?;
    result
        .results
        .into_iter()
        .next()
        .map(|result| result.output)
        .ok_or_else(|| SeamError::Db("missing session mutation result".into()))
}
