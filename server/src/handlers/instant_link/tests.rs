use super::*;

#[test]
fn test_instant_link_request_deserialize() {
    let json = r#"{"email": "test@example.com"}"#;
    let req: InstantLinkRequest = serde_json::from_str(json).unwrap();
    assert_eq!(req.email, "test@example.com");
}

#[test]
fn test_verify_instant_link_request_deserialize() {
    let json = r#"{"token": "abc123xyz"}"#;
    let req: VerifyInstantLinkRequest = serde_json::from_str(json).unwrap();
    assert_eq!(req.token, "abc123xyz");
}

#[test]
fn test_should_complete_instant_link_signup_after_primary_mailbox_claim() {
    assert!(should_complete_instant_link_signup(true, true));
}

#[test]
fn test_should_not_complete_instant_link_signup_without_primary_mailbox_claim() {
    assert!(!should_complete_instant_link_signup(true, false));
}

#[test]
fn test_should_not_complete_instant_link_signup_for_existing_membership() {
    assert!(!should_complete_instant_link_signup(false, true));
}

#[test]
fn instant_link_does_not_add_email_auth_to_stronger_only_account() {
    assert!(!supports_email_login(None, &[AuthMethod::Google]));
    assert!(!supports_email_login(None, &[AuthMethod::Apple]));
    assert!(!supports_email_login(None, &[AuthMethod::WebAuthn]));
    assert!(!supports_email_login(None, &[AuthMethod::Solana]));
}

#[test]
fn instant_link_remains_available_when_email_auth_was_established() {
    assert!(supports_email_login(None, &[AuthMethod::Email]));
    assert!(supports_email_login(
        Some("$argon2id$redacted"),
        &[AuthMethod::Google]
    ));
}

#[tokio::test]
async fn instant_link_expiry_observes_hot_setting() {
    use crate::repositories::{
        InMemorySystemSettingsRepository, SystemSetting, SystemSettingsRepository,
    };
    use crate::services::SettingsService;

    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    repo.upsert(SystemSetting::new(
        "auth_instantlink_expiry".to_string(),
        "120".to_string(),
        "auth.instantlink".to_string(),
    ))
    .await
    .unwrap();
    let settings = SettingsService::with_ttl(repo, 0);

    assert_eq!(
        resolve_instant_link_expiry_secs(&settings).await.unwrap(),
        120
    );
}

#[tokio::test]
async fn invalid_legacy_instant_link_expiry_uses_safe_default() {
    use crate::repositories::{
        InMemorySystemSettingsRepository, SystemSetting, SystemSettingsRepository,
    };
    use crate::services::SettingsService;

    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    repo.upsert(SystemSetting::new(
        "auth_instantlink_expiry".to_string(),
        "0".to_string(),
        "auth.instantlink".to_string(),
    ))
    .await
    .unwrap();
    let settings = SettingsService::with_ttl(repo, 0);

    assert_eq!(
        resolve_instant_link_expiry_secs(&settings).await.unwrap(),
        DEFAULT_INSTANT_LINK_EXPIRY_SECS
    );
}
