use super::*;

#[test]
fn auth_options_pad_unknown_and_known_accounts_to_the_same_shape() {
    let unknown = pad_credential_hints(Vec::new());
    let known = pad_credential_hints(vec!["real-credential-id".into()]);
    assert_eq!(unknown.len(), MIN_AUTH_CREDENTIAL_HINTS);
    assert_eq!(known.len(), MIN_AUTH_CREDENTIAL_HINTS);
    assert!(known.iter().any(|id| id == "real-credential-id"));
}
use serde_json::json;

#[test]
fn extract_assertion_canonicalizes_and_decodes() {
    // credential id "AQID" (bytes 1,2,3) with standard chars + padding tolerated.
    let cred = json!({
        "id": "AQID", "rawId": "AQID", "type": "public-key",
        "response": { "clientDataJSON": "e30", "authenticatorData": "AQ", "signature": "Ag" }
    });
    let a = extract_assertion(&cred).unwrap();
    assert_eq!(a.credential_id, "AQID");
    assert_eq!(a.client_data, b"{}");
    assert_eq!(a.authenticator_data, vec![1u8]);
    assert_eq!(a.signature, vec![2u8]);
}

#[test]
fn signup_options_request_accepts_empty_and_partial_bodies() {
    // Regression: the unified passkey flow posts `{}` (no email at options
    // time). The prior required-`email` contract 400'd here, which surfaced
    // as "Something went wrong." Email/name are now optional hints.
    let empty: SignupOptionsRequest = serde_json::from_str("{}").unwrap();
    assert!(empty.email.is_none() && empty.name.is_none());

    let with_email: SignupOptionsRequest =
        serde_json::from_str(r#"{"email":"a@b.com","name":"A"}"#).unwrap();
    assert_eq!(with_email.email.as_deref(), Some("a@b.com"));
    assert_eq!(with_email.name.as_deref(), Some("A"));
}

#[test]
fn signup_verify_request_treats_email_and_name_as_optional() {
    // The unified flow sends only challengeId + credential; the explicit
    // signupWithPasskey flow additionally sends email/name.
    let minimal: SignupVerifyRequest =
        serde_json::from_str(r#"{"challengeId":"c","credential":{}}"#).unwrap();
    assert!(
        minimal.email.is_none()
            && minimal.name.is_none()
            && minimal.label.is_none()
            && minimal.access_code.is_none()
    );

    let full: SignupVerifyRequest = serde_json::from_str(
        r#"{"challengeId":"c","credential":{},"email":"a@b.com","name":"A","label":"Mac","accessCode":"launch"}"#,
    )
    .unwrap();
    assert_eq!(full.email.as_deref(), Some("a@b.com"));
    assert_eq!(full.label.as_deref(), Some("Mac"));
    assert_eq!(full.access_code.as_deref(), Some("launch"));
}

#[test]
fn signup_verify_request_accepts_legacy_access_code_key() {
    let legacy: SignupVerifyRequest =
        serde_json::from_str(r#"{"challengeId":"c","credential":{},"access_code":"legacy"}"#)
            .unwrap();
    assert_eq!(legacy.access_code.as_deref(), Some("legacy"));
}

#[test]
fn passkey_signup_cannot_pre_register_someone_elses_email() {
    let request: SignupVerifyRequest =
        serde_json::from_str(r#"{"challengeId":"c","credential":{},"email":"victim@example.com"}"#)
            .unwrap();
    assert!(matches!(
        signup_email(&request),
        Err(RouteError::Status(409, "email_requires_authenticated_link"))
    ));
}

#[test]
fn assertion_envelope_and_user_handle_are_bound_to_the_credential_owner() {
    let good = json!({"id":"AQID", "rawId":"AQID", "type":"public-key", "response":{
        "clientDataJSON":"e30", "authenticatorData":"AQ", "signature":"Ag", "userHandle":rp::b64url_encode(b"user-1")}});
    let assertion = extract_assertion(&good).unwrap();
    assert!(ceremony::verify_assertion_identity(&assertion, &[], "user-1").is_ok());
    assert!(ceremony::verify_assertion_identity(&assertion, &[], "other-user").is_err());
    assert!(
        ceremony::verify_assertion_identity(&assertion, &["other-id".into()], "user-1").is_err()
    );
    for (field, value) in [("type", "password"), ("rawId", "BAUG"), ("id", "")] {
        let mut bad = good.clone();
        bad[field] = json!(value);
        assert!(extract_assertion(&bad).is_err());
    }
    let mut missing_handle = good;
    missing_handle["response"]
        .as_object_mut()
        .unwrap()
        .remove("userHandle");
    let assertion = extract_assertion(&missing_handle).unwrap();
    assert!(ceremony::verify_assertion_identity(&assertion, &[], "user-1").is_err());
    assert!(ceremony::verify_assertion_identity(&assertion, &["AQID".into()], "user-1").is_ok());
}
