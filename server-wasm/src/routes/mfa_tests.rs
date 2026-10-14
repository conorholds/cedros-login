use super::*;
use totp_rs::{Algorithm, Secret, TOTP};

const NOW: u64 = 1_900_000_000;

#[test]
fn status_disable_methods_always_require_an_mfa_factor() {
    assert_eq!(disable_methods(), ["code", "recoveryCode"]);
}

fn passwordless_request(body: &str) -> DisableRequest {
    serde_json::from_str(body).expect("disable request should parse")
}

fn entry(secret: &str, recovery_codes: Vec<String>) -> TotpEntry {
    TotpEntry {
        user_id: "u1".to_string(),
        secret: Some(secret.to_string()),
        secret_key: None,
        enabled: true,
        created_at: "2026-06-01T00:00:00.000Z".to_string(),
        enabled_at: Some("2026-06-01T00:01:00.000Z".to_string()),
        last_used_time_step: None,
        recovery_codes,
    }
}

fn code_at(secret: &str, email: &str) -> String {
    let bytes = Secret::Encoded(secret.to_string()).to_bytes().unwrap();
    TOTP::new(
        Algorithm::SHA1,
        6,
        1,
        30,
        bytes,
        Some("Cedros".to_string()),
        email.to_string(),
    )
    .unwrap()
    .generate(NOW)
}

#[test]
fn passwordless_disable_with_totp_deletes_mfa() {
    let secret = totp_svc::generate_secret();
    let (result, deleted_user_id) = disable_passwordless(
        &format!(r#"{{"code":"{}"}}"#, code_at(&secret, "u@test")),
        entry(&secret, Vec::new()),
        Some("u@test"),
        &secret,
    );

    assert!(result.is_ok());
    assert_eq!(deleted_user_id.as_deref(), Some("u1"));
}

#[test]
fn passwordless_disable_with_recovery_code_deletes_mfa() {
    let secret = totp_svc::generate_secret();
    let (result, deleted_user_id) = disable_passwordless(
        r#"{"recoveryCode":"RECOVERY-1"}"#,
        entry(&secret, vec![hash_recovery_code("RECOVERY-1")]),
        Some("u@test"),
        &secret,
    );

    assert!(result.is_ok());
    assert_eq!(deleted_user_id.as_deref(), Some("u1"));
}

#[test]
fn passwordless_disable_rejects_bad_missing_or_duplicate_factor() {
    let secret = totp_svc::generate_secret();
    let valid_code = code_at(&secret, "u@test");

    for body in [
        format!(r#"{{"code":"{}"}}"#, wrong_code(&valid_code)),
        "{}".to_string(),
        format!(r#"{{"code":"{valid_code}","recoveryCode":"RECOVERY-1"}}"#),
    ] {
        let (result, deleted_user_id) = disable_passwordless(
            &body,
            entry(&secret, vec![hash_recovery_code("RECOVERY-1")]),
            Some("u@test"),
            &secret,
        );

        assert!(result.is_err());
        assert_eq!(deleted_user_id, None);
    }
}

#[test]
fn passwordless_disable_surfaces_delete_failure_after_valid_factor() {
    let secret = totp_svc::generate_secret();
    let req = passwordless_request(&format!(r#"{{"code":"{}"}}"#, code_at(&secret, "u@test")));
    let result = disable_mfa(
        &entry(&secret, Vec::new()),
        Some("u@test"),
        &req,
        &secret,
        NOW,
        |_| Err(RouteError::Status(502, "db_error")),
    );

    assert!(matches!(result, Err(RouteError::Status(502, "db_error"))));
}

#[test]
fn password_field_alone_cannot_disable_mfa() {
    let secret = totp_svc::generate_secret();
    let (result, deleted_user_id) = disable_passwordless(
        r#"{"password":"ValidPassword123!"}"#,
        entry(&secret, Vec::new()),
        Some("u@test"),
        &secret,
    );
    assert!(result.is_err());
    assert_eq!(deleted_user_id, None);
}

fn disable_passwordless(
    body: &str,
    entry: TotpEntry,
    email: Option<&str>,
    secret: &str,
) -> (Result<(), RouteError>, Option<String>) {
    let req = passwordless_request(body);
    let mut deleted_user_id = None;
    let result = disable_mfa(&entry, email, &req, secret, NOW, |user_id| {
        deleted_user_id = Some(user_id.to_string());
        Ok(())
    });
    (result, deleted_user_id)
}

fn wrong_code(code: &str) -> String {
    let mut chars: Vec<char> = code.chars().collect();
    let last = chars.last_mut().expect("code has digits");
    *last = if *last == '0' { '1' } else { '0' };
    chars.into_iter().collect()
}

#[test]
fn factor_policy_change_advances_account_revision_atomically_and_rejects_conflicts() {
    use crate::host::db;
    use serde_json::json;
    for conflict in [false, true] {
        db::test_support::with_db(
            move |op, _, query| {
                if op == "read" {
                    return Ok(
                        json!({"entries":[{"entry_key":"u1", "version":"user-v1", "payload": {
                            "id":"u1", "emailVerified":true, "isSystemAdmin":false,
                            "passwordHash":"preserved", "createdAt":"2026-01-01T00:00:00.000Z", "updatedAt":"2100-01-01T00:00:00.000Z"
                        }}]}),
                    );
                }
                assert_eq!(op, "compare-and-set");
                let body = &query.filters[0].value;
                assert_eq!(body["conditions"][0]["expectedVersion"], "factor-v1");
                assert_eq!(body["conditions"][1]["expectedVersion"], "user-v1");
                assert_eq!(body["ops"][0]["data"]["enabled"], true);
                assert_eq!(
                    body["ops"][1]["data"]["updatedAt"],
                    "2100-01-01T00:00:00.001Z"
                );
                assert_eq!(body["ops"][1]["data"]["passwordHash"], "preserved");
                if conflict {
                    return Err(crate::host::SeamError::DbConflict {
                        category: crate::host::DbConflictCategory::Precondition,
                        operation: "compare-and-set".into(),
                    });
                }
                Ok(
                    json!({"outcome":"applied", "applied":2, "replayed":false, "entries":[], "results":[]}),
                )
            },
            || {
                let result = write_factor_and_account_revision(
                    &entry("encrypted-secret", vec![]),
                    db::Condition::version(db::TOTP, "u1", "factor-v1").unwrap(),
                );
                assert_eq!(result.is_err(), conflict);
            },
        );
    }
}
