use super::{
    default_org_id_from_optional_setting, default_org_id_from_setting,
    register_should_issue_session, user_blocks_session_when_verification_required, RegisterRequest,
};

#[test]
fn default_org_id_from_setting_accepts_json_string_or_plain_value() {
    assert_eq!(
        default_org_id_from_setting(r#""org-123""#.to_string()).as_deref(),
        Some("org-123")
    );
    assert_eq!(
        default_org_id_from_setting("org-456".to_string()).as_deref(),
        Some("org-456")
    );
}

#[test]
fn default_org_id_from_setting_rejects_blank_values() {
    assert_eq!(default_org_id_from_setting("   ".to_string()), None);
    assert_eq!(default_org_id_from_setting(r#""""#.to_string()), None);
}

#[test]
fn default_org_id_from_optional_setting_fails_closed_when_absent() {
    assert_eq!(default_org_id_from_optional_setting(None), None);
}

#[test]
fn register_request_accepts_camel_and_legacy_access_code_keys() {
    let camel: RegisterRequest = serde_json::from_str(
        r#"{"email":"a@b.com","password":"Password123!","accessCode":"launch"}"#,
    )
    .unwrap();
    assert_eq!(camel.access_code.as_deref(), Some("launch"));

    let legacy: RegisterRequest = serde_json::from_str(
        r#"{"email":"a@b.com","password":"Password123!","access_code":"legacy"}"#,
    )
    .unwrap();
    assert_eq!(legacy.access_code.as_deref(), Some("legacy"));
}

#[test]
fn register_does_not_issue_session_when_email_verification_is_required() {
    assert!(!register_should_issue_session(true));
    assert!(register_should_issue_session(false));
}

#[test]
fn verification_policy_blocks_unverified_email_users_only_when_required() {
    assert!(user_blocks_session_when_verification_required(
        true, false, true
    ));
    assert!(!user_blocks_session_when_verification_required(
        true, true, true
    ));
    assert!(!user_blocks_session_when_verification_required(
        true, false, false
    ));
}

#[test]
fn verification_policy_allows_no_email_wallet_users_even_when_claim_false() {
    assert!(!user_blocks_session_when_verification_required(
        false, false, true
    ));
}
