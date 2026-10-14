use super::*;

fn entry(target_email: Option<&str>, subject_id: Option<&str>) -> VerificationEntry {
    VerificationEntry {
        id: "v1".into(),
        user_id: "u1".into(),
        token_hash: "hash".into(),
        token_type: "email_verification".into(),
        target_email: target_email.map(str::to_string),
        subject_id: subject_id.map(str::to_string),
        created_at: "2026-06-01T00:00:00.000Z".into(),
        expires_at: "2026-06-02T00:00:00.000Z".into(),
        used_at: None,
    }
}

#[test]
fn serializes_bound_target_and_subject() {
    let json = serde_json::to_value(entry(Some("new@example.com"), None)).unwrap();
    assert_eq!(json["targetEmail"], "new@example.com");
}

#[test]
fn serializes_bound_subject_id() {
    let json = serde_json::to_value(entry(None, Some("email-row-1"))).unwrap();
    assert_eq!(json["subjectId"], "email-row-1");
}

#[test]
fn legacy_tokens_without_target_email_deserialize_as_unbound() {
    let json = serde_json::json!({
        "id":"v1", "userId":"u1", "tokenHash":"hash",
        "tokenType":"email_verification", "createdAt":"2026-06-01T00:00:00.000Z",
        "expiresAt":"2026-06-02T00:00:00.000Z", "usedAt":null
    });
    let token: VerificationEntry = serde_json::from_value(json).unwrap();
    assert_eq!(token.target_email, None);
    assert_eq!(token.subject_id, None);
}

#[test]
fn always_serializes_optional_seam_fields_as_null_when_absent() {
    let json = serde_json::to_value(entry(None, None)).unwrap();
    assert!(json.get("targetEmail").is_some());
    assert!(json.get("subjectId").is_some());
    assert!(json["targetEmail"].is_null());
    assert!(json["subjectId"].is_null());
}

#[test]
fn conditional_claim_shape_binds_key_hash_purpose_and_delete() {
    let operation = consume_operation(
        &entry(None, None),
        &["email_verification", "account_email_verify"],
    );
    let json = serde_json::to_value(operation).unwrap();
    assert_eq!(json["op"], "conditional");
    assert_eq!(
        json["operationId"],
        "identity.verifications.consume-live-purpose-bound"
    );
    assert_eq!(json["params"]["entryKey"], "v1");
    assert_eq!(json["params"]["tokenHash"], "hash");
    assert_eq!(
        json["params"]["allowedTokenTypes"],
        serde_json::json!(["email_verification", "account_email_verify"])
    );
    assert_eq!(json["params"]["consume"], "delete");
}

#[test]
fn claimed_payload_fails_closed_on_wrong_purpose_or_identity() {
    let expected = entry(None, None);
    let mut wrong = entry(None, None);
    wrong.token_type = "password_reset".to_string();
    assert!(consumed_payload(&result(wrong), &expected, &["email_verification"]).is_err());
    let mut wrong_id = entry(None, None);
    wrong_id.id = "other".to_string();
    assert!(consumed_payload(&result(wrong_id), &expected, &["email_verification"]).is_err());
}

#[test]
fn required_result_metadata_accepts_exact_types_and_values() {
    let result = result_with_output(serde_json::json!({
        "status": "registered",
        "alreadyApplied": false,
    }));
    require_result_status(&result, "registered").unwrap();
    assert!(!require_result_bool(&result, "alreadyApplied").unwrap());
}

#[test]
fn required_result_metadata_rejects_missing_wrong_or_coerced_values() {
    for output in [
        serde_json::json!({}),
        serde_json::json!({"status": "completed"}),
        serde_json::json!({"status": 1, "alreadyApplied": "false"}),
    ] {
        let result = result_with_output(output);
        assert!(require_result_status(&result, "registered").is_err());
        assert!(require_result_bool(&result, "alreadyApplied").is_err());
    }
}

fn result(payload: VerificationEntry) -> AtomicBatchResult {
    AtomicBatchResult {
        applied: 1,
        results: vec![db::ConditionalBatchResult {
            operation_id: ConditionalOperation::ConsumeLivePurposeBoundVerification
                .id()
                .into(),
            output: serde_json::json!({ "payload": payload }),
        }],
    }
}

fn result_with_output(output: serde_json::Value) -> AtomicBatchResult {
    AtomicBatchResult {
        applied: 1,
        results: vec![db::ConditionalBatchResult {
            operation_id: ConditionalOperation::CompleteWebauthnRegistration
                .id()
                .into(),
            output,
        }],
    }
}
