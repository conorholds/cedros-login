//! Login attempts over the host DB seam (`cedros-login:login-attempts`).
//!
//! Retains purpose-specific MFA and invite proof failures for short-lived audit
//! and lockout checks. General endpoint abuse budgets use Cedros Data's atomic,
//! expiring abuse-budget capability instead of this ledger.
use crate::host::db::{self, Query, LOGIN_ATTEMPTS};
use crate::host::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct LoginAttemptEntry {
    pub id: String,
    pub user_id: Option<String>,
    pub email: String,
    pub ip_address: Option<String>,
    pub successful: bool,
    pub attempted_at: String,
}

pub fn record(attempt: &LoginAttemptEntry) -> Result<()> {
    db::write(LOGIN_ATTEMPTS, &attempt.id, attempt)
}

/// Count failed attempts for an email since `since_iso` — drives lockout.
pub fn count_recent_failures(email: &str, since_iso: &str) -> Result<u64> {
    let filters = vec![
        db::eq("email", email),
        db::eq("successful", false),
        db::gt("attemptedAt", since_iso),
    ];
    db::count(
        LOGIN_ATTEMPTS,
        &Query {
            filters,
            ..Default::default()
        },
    )
}

/// Prune attempts older than the retention cutoff (uniform `Sweep` shape).
pub fn sweep_expired(cutoff_iso: &str, page: u32) -> Result<u64> {
    db::sweep_expired(LOGIN_ATTEMPTS, "attemptedAt", cutoff_iso, page)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::host::db::test_support;
    use std::cell::RefCell;
    use std::rc::Rc;

    #[test]
    fn round_trips_optional_and_bool_fields() {
        let a = LoginAttemptEntry {
            id: "a1".into(),
            user_id: None,
            email: "u@x.test".into(),
            ip_address: Some("203.0.113.1".into()),
            successful: false,
            attempted_at: "2026-05-31T00:00:00.000Z".into(),
        };
        let j = serde_json::to_value(&a).unwrap();
        assert_eq!(j["successful"], false);
        assert!(j["userId"].is_null());
        assert_eq!(serde_json::from_value::<LoginAttemptEntry>(j).unwrap(), a);
    }

    #[test]
    fn failure_counts_include_identity_time_and_row_kind() {
        let captured = Rc::new(RefCell::new(None));
        let observed = Rc::clone(&captured);
        let count = test_support::with_db(
            move |op, collection, query| {
                assert_eq!(op, "count");
                assert_eq!(collection.model, LOGIN_ATTEMPTS.model);
                *observed.borrow_mut() = Some(serde_json::to_value(query).unwrap());
                Ok(serde_json::json!({"count": 7}))
            },
            || count_recent_failures("mfa:user-1", "2026-09-16T00:00:00.000Z").unwrap(),
        );

        assert_eq!(count, 7);
        let query = captured.borrow().clone().unwrap();
        assert_eq!(query["filters"].as_array().unwrap().len(), 3);
        assert!(query["filters"]
            .as_array()
            .unwrap()
            .iter()
            .any(|filter| { filter["field"] == "successful" && filter["value"] == false }));
        assert!(query["filters"]
            .as_array()
            .unwrap()
            .iter()
            .any(|filter| { filter["field"] == "attemptedAt" && filter["op"] == "gt" }));
    }
}
