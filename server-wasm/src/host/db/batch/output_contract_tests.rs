use super::*;

fn examples() -> serde_json::Map<String, Value> {
    serde_json::from_str::<Value>(include_str!(
        "../../../../../contracts/host/operations/v2/guest-wire-examples.json"
    ))
    .unwrap()["operations"]
        .as_object()
        .unwrap()
        .clone()
}

#[test]
fn every_conditional_operation_has_an_exact_valid_output_fixture() {
    let examples = examples();
    assert_eq!(
        examples.len(),
        ConditionalOperation::DATABASE_CONCURRENCY_V2.len()
    );
    for operation in ConditionalOperation::DATABASE_CONCURRENCY_V2 {
        let output = &examples[operation.id()]["output"];
        assert!(
            is_valid(operation, output),
            "valid output fixture rejected for {}",
            operation.id()
        );
    }
}

#[test]
fn every_operation_rejects_missing_extra_and_wrongly_typed_output_fields() {
    let examples = examples();
    for operation in ConditionalOperation::DATABASE_CONCURRENCY_V2 {
        let output = &examples[operation.id()]["output"];
        let mut missing = output.clone();
        let first = missing.as_object().unwrap().keys().next().unwrap().clone();
        missing.as_object_mut().unwrap().remove(&first);
        assert!(
            !is_valid(operation, &missing),
            "{} accepted a missing field",
            operation.id()
        );

        let mut extra = output.clone();
        extra
            .as_object_mut()
            .unwrap()
            .insert("unexpected".into(), Value::Bool(true));
        assert!(
            !is_valid(operation, &extra),
            "{} accepted an extra field",
            operation.id()
        );

        let mut wrong = output.clone();
        let first = wrong.as_object().unwrap().keys().next().unwrap().clone();
        wrong
            .as_object_mut()
            .unwrap()
            .insert(first, Value::Array(Vec::new()));
        assert!(
            !is_valid(operation, &wrong),
            "{} accepted a wrong field type",
            operation.id()
        );
    }
}

#[test]
fn atomic_registration_completion_uses_the_published_registration_result() {
    let output = &examples()[ConditionalOperation::CompleteRegistrationAccount.id()]["output"];
    assert!(is_valid(
        ConditionalOperation::CompleteRegistrationAccount,
        output
    ));

    let mut extra = output.clone();
    extra
        .as_object_mut()
        .unwrap()
        .insert("emailQueued".into(), Value::Bool(true));
    assert!(!is_valid(
        ConditionalOperation::CompleteRegistrationAccount,
        &extra
    ));
}

#[test]
fn registration_limit_rejection_has_an_exact_reset_timestamp_contract() {
    use serde_json::json;
    let output = json!({
        "userId": "u1",
        "status": "limit-reached",
        "proofPayload": null,
        "resetsAt": "2026-08-01T00:00:00.000Z"
    });
    assert!(is_valid(
        ConditionalOperation::CreateRegistrationAccount,
        &output
    ));
    let mut missing_reset = output;
    missing_reset.as_object_mut().unwrap().remove("resetsAt");
    assert!(!is_valid(
        ConditionalOperation::CreateRegistrationAccount,
        &missing_reset
    ));
}

#[test]
fn session_atomic_outputs_fail_closed_on_missing_or_unexpected_fields() {
    use serde_json::json;
    assert!(is_valid(
        ConditionalOperation::RotateSession,
        &json!({"status":"rotated"})
    ));
    assert!(!is_valid(
        ConditionalOperation::RotateSession,
        &json!({"status":"created"})
    ));
    assert!(is_valid(
        ConditionalOperation::RevokeSessions,
        &json!({"revokedCount":0})
    ));
    assert!(is_valid(
        ConditionalOperation::RevokeSessions,
        &json!({"revokedCount":201})
    ));
    for output in [
        json!({}),
        json!({"revokedCount":-1}),
        json!({"revokedCount":"1"}),
        json!({"revokedCount":1,"extra":true}),
    ] {
        assert!(!is_valid(ConditionalOperation::RevokeSessions, &output));
    }
}
