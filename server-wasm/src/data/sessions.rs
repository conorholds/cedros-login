//! Sessions over the host DB seam (dedicated `cedros-login:sessions` model,
//! auto-provisioned at install). Keyed by session id. Revocation is a soft
//! update (set `revoked_at` + `revoked_reason`) so the refresh flow can detect
//! reuse of a rotated token; the cleanup job sweeps them once expired.
pub use super::session_mutations::{
    change_password_and_revoke_others, revoke, revoke_all_for_user, rotate,
    update_user_and_revoke_others,
};
use crate::host::db::{self, Query, SESSIONS};
use crate::host::{Result, SeamError};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SessionEntry {
    pub id: String,
    pub user_id: String,
    pub refresh_token_hash: String,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub created_at: String,
    pub expires_at: String,
    pub revoked_at: Option<String>,
    #[serde(default)]
    pub revoked_reason: Option<String>,
    #[serde(default)]
    pub last_strong_auth_at: Option<String>,
}

pub fn find_by_id(id: &str) -> Result<Option<SessionEntry>> {
    db::find_one(SESSIONS, &Query::key(id))
}

/// Look up a session by the HMAC hash of its refresh token (refresh/logout).
pub fn find_by_refresh_token_hash(hash: &str) -> Result<Option<SessionEntry>> {
    db::find_one(
        SESSIONS,
        &Query {
            filters: vec![db::eq("refreshTokenHash", hash)],
            limit: Some(1),
            ..Default::default()
        },
    )
}

/// A user's most recent sessions (any status), newest first, capped at `limit`.
/// Unlike [`find_active_by_user`] this includes expired/revoked rows, so the
/// new-device-login check still has device history for a user who has logged out
/// everywhere. Backs the new-device security alert.
pub fn find_recent_by_user(user_id: &str, limit: u32) -> Result<Vec<SessionEntry>> {
    db::read_typed::<SessionEntry>(
        SESSIONS,
        &Query {
            filters: vec![db::eq("userId", user_id)],
            order_by: Some(db::desc("createdAt")),
            limit: Some(limit),
            ..Default::default()
        },
    )
}

/// A user's active (unexpired, unrevoked) sessions, newest first.
pub fn find_active_by_user(user_id: &str, now_iso: &str) -> Result<Vec<SessionEntry>> {
    const PAGE_SIZE: u32 = 200;
    let mut sessions = Vec::new();
    let mut after_id: Option<String> = None;
    loop {
        let mut filters = vec![
            db::eq("userId", user_id),
            db::gt("expiresAt", now_iso),
            db::lte("createdAt", now_iso),
        ];
        if let Some(id) = &after_id {
            filters.push(db::gt("id", id.as_str()));
        }
        // Core defaults reads without a limit to 100 rows. Keyset pagination
        // also avoids skipping rows when expired entries are swept mid-read.
        let page = db::read_typed::<SessionEntry>(
            SESSIONS,
            &Query {
                filters,
                order_by: Some(db::asc("id")),
                limit: Some(PAGE_SIZE),
                ..Default::default()
            },
        )?;
        let page_len = page.len();
        if let Some(last) = page.last() {
            if after_id.as_ref().is_some_and(|id| last.id <= *id) {
                return Err(SeamError::Db("session pagination did not advance".into()));
            }
            after_id = Some(last.id.clone());
        }
        sessions.extend(
            page.into_iter()
                .filter(|session| session.revoked_at.is_none()),
        );
        if page_len < PAGE_SIZE as usize {
            break;
        }
    }
    sessions.sort_by(|a, b| {
        b.created_at
            .cmp(&a.created_at)
            .then_with(|| a.id.cmp(&b.id))
    });
    Ok(sessions)
}

/// Remove one page of sessions expired before `now_iso` (uniform `Sweep` shape).
pub fn sweep_expired(now_iso: &str, page: u32) -> Result<u64> {
    db::sweep_expired(SESSIONS, "expiresAt", now_iso, page)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_camelcase_with_revocation() {
        let s = SessionEntry {
            id: "s1".into(),
            user_id: "u1".into(),
            refresh_token_hash: "h".into(),
            ip_address: None,
            user_agent: Some("ua".into()),
            created_at: "2026-05-31T00:00:00.000Z".into(),
            expires_at: "2026-06-30T00:00:00.000Z".into(),
            revoked_at: Some("2026-06-01T00:00:00.000Z".into()),
            revoked_reason: Some("rotated".into()),
            last_strong_auth_at: Some("2026-06-01T00:00:00.000Z".into()),
        };
        let j = serde_json::to_value(&s).unwrap();
        assert_eq!(j["refreshTokenHash"], "h");
        assert_eq!(j["revokedReason"], "rotated");
        assert_eq!(j["lastStrongAuthAt"], "2026-06-01T00:00:00.000Z");
        assert_eq!(serde_json::from_value::<SessionEntry>(j).unwrap(), s);
    }

    #[test]
    fn revoked_reason_defaults_when_absent() {
        // Older rows without the field still deserialize.
        let s: SessionEntry = serde_json::from_value(serde_json::json!({
            "id": "s", "userId": "u", "refreshTokenHash": "h",
            "ipAddress": null, "userAgent": null,
            "createdAt": "2026-05-31T00:00:00.000Z", "expiresAt": "2026-06-30T00:00:00.000Z",
            "revokedAt": null
        }))
        .unwrap();
        assert!(s.revoked_reason.is_none());
        assert!(s.last_strong_auth_at.is_none());
    }
}

#[cfg(test)]
mod pagination_tests {
    use super::*;
    use serde_json::json;

    const NOW: &str = "2026-09-09T00:00:00.000Z";

    fn row(index: usize, revoked: bool) -> serde_json::Value {
        json!({
            "entry_key": format!("s{index:04}"),
            "payload": {
                "id": format!("s{index:04}"), "userId": "user-1", "refreshTokenHash": "hash",
                "createdAt": "2026-09-08T00:00:00.000Z", "expiresAt": "2026-09-16T00:00:00.000Z",
                "revokedAt": if revoked { Some(NOW) } else { None },
                "ipAddress": null, "userAgent": null
            }
        })
    }

    #[test]
    fn reads_beyond_a_full_page_of_revoked_sessions() {
        let mut calls = 0;
        db::test_support::with_db(
            move |op, collection, query| {
                assert_eq!(op, "read");
                assert_eq!(collection.model, SESSIONS.model);
                assert_eq!(query.limit, Some(200));
                assert_eq!(query.order_by.as_ref().unwrap().field, "id");
                assert!(query
                    .filters
                    .iter()
                    .any(|f| f.field == "userId" && f.value == "user-1"));
                assert!(query
                    .filters
                    .iter()
                    .any(|f| f.field == "expiresAt" && f.op == "gt" && f.value == NOW));
                calls += 1;
                match calls {
                    1 => Ok(json!({"entries": (0..200).map(|i| row(i, true)).collect::<Vec<_>>()})),
                    2 => {
                        assert!(query
                            .filters
                            .iter()
                            .any(|f| f.field == "id" && f.op == "gt" && f.value == "s0199"));
                        Ok(json!({"entries": [row(200, false), row(201, false)]}))
                    }
                    _ => panic!("unexpected page"),
                }
            },
            || {
                let result = find_active_by_user("user-1", NOW).unwrap();
                assert_eq!(
                    result.iter().map(|s| s.id.as_str()).collect::<Vec<_>>(),
                    ["s0200", "s0201"]
                );
            },
        );
    }

    #[test]
    fn incomplete_listing_is_not_returned_as_complete() {
        db::test_support::with_db(
            |_, _, query| {
                if query.filters.iter().any(|f| f.field == "id") {
                    return Err(SeamError::Db("unavailable".into()));
                }
                Ok(json!({"entries": (0..200).map(|i| row(i, false)).collect::<Vec<_>>()}))
            },
            || assert!(find_active_by_user("user-1", NOW).is_err()),
        );
    }
}
