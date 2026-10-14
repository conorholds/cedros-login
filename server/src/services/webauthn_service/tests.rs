//! Tests for WebAuthn service

use super::*;
use crate::repositories::{InMemoryWebAuthnRepository, WebAuthnRepository};
use crate::storage::Storage;
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;
use webauthn_rs::prelude::{AuthenticatorAttachment, RegisterPublicKeyCredential};
use webauthn_rs_proto::UserVerificationPolicy;

#[derive(Debug, Deserialize)]
struct RegistrationStateForTest {
    rs: RegistrationStateOptionsForTest,
}

#[derive(Debug, Deserialize)]
struct RegistrationStateOptionsForTest {
    policy: UserVerificationPolicy,
    authenticator_attachment: Option<AuthenticatorAttachment>,
}

#[derive(Debug, Deserialize)]
struct AuthenticationStateForTest {
    ast: AuthenticationStateOptionsForTest,
}

#[derive(Debug, Deserialize)]
struct AuthenticationStateOptionsForTest {
    policy: UserVerificationPolicy,
}

fn test_settings_service() -> Arc<SettingsService> {
    let storage = Storage::in_memory();
    Arc::new(SettingsService::new(storage.system_settings_repo))
}

async fn enabled_test_settings_service() -> Arc<SettingsService> {
    let settings = test_settings_service();
    settings
        .set("auth_webauthn_enabled", "true", "auth.webauthn", None)
        .await
        .expect("enable WebAuthn for test");
    settings
}

#[test]
fn test_webauthn_service_disabled() {
    let config = WebAuthnConfig::default();
    let service = WebAuthnService::new(&config, test_settings_service());
    assert!(!service.is_enabled());
}

#[test]
fn test_webauthn_rejects_cross_site_rp_origin() {
    let result =
        WebAuthnService::build_webauthn("example.com", "https://attacker.invalid", "Example");
    assert!(matches!(result, Err(AppError::Config(_))));
}

#[test]
fn test_webauthn_rejects_insecure_non_local_origin() {
    let result = WebAuthnService::build_webauthn("example.com", "http://example.com", "Example");
    assert!(matches!(result, Err(AppError::Config(_))));
}

#[test]
fn test_webauthn_rejects_origin_with_path_or_query() {
    assert!(
        WebAuthnService::build_webauthn("example.com", "https://example.com/login", "Example")
            .is_err()
    );
    assert!(WebAuthnService::build_webauthn(
        "example.com",
        "https://example.com/?tenant=other",
        "Example"
    )
    .is_err());
}

#[test]
fn test_webauthn_allows_local_http_origin() {
    assert!(WebAuthnService::build_webauthn("localhost", "http://localhost:3000", "Local").is_ok());
}

#[test]
fn test_webauthn_all_authenticator_types_emit_no_attachment_hint() {
    let service = WebAuthnService::new(&WebAuthnConfig::default(), test_settings_service());
    assert_eq!(service.authenticator_attachment().unwrap(), None);
}

#[tokio::test]
async fn test_webauthn_service_enabled_requires_config() {
    let config = WebAuthnConfig {
        enabled: true,
        rp_id: None, // Missing required config
        rp_name: None,
        rp_origin: None,
        ..Default::default()
    };
    let service = WebAuthnService::new(&config, enabled_test_settings_service().await);
    assert!(service.get_webauthn().await.is_err());
}

#[tokio::test]
async fn test_empty_runtime_rp_settings_fall_back_to_static_config() {
    let config = WebAuthnConfig {
        enabled: true,
        rp_id: Some("example.com".to_string()),
        rp_name: Some("Static RP".to_string()),
        rp_origin: Some("https://login.example.com".to_string()),
        ..Default::default()
    };
    let service = WebAuthnService::new(&config, enabled_test_settings_service().await);

    let (rp_id, rp_origin, rp_name) = service.resolve_rp_config().await;

    assert_eq!(rp_id, "example.com");
    assert_eq!(rp_origin, "https://login.example.com");
    assert_eq!(rp_name, "Static RP");
}

#[tokio::test]
async fn test_disabled_runtime_setting_blocks_registration_with_static_rp_fallback() {
    let config = WebAuthnConfig {
        enabled: false,
        rp_id: Some("example.com".to_string()),
        rp_name: Some("Static RP".to_string()),
        rp_origin: Some("https://login.example.com".to_string()),
        ..Default::default()
    };
    let service = WebAuthnService::new(&config, test_settings_service());
    let repo: Arc<dyn WebAuthnRepository> = Arc::new(InMemoryWebAuthnRepository::new());

    let result = service
        .start_registration(
            RegistrationContext {
                user_id: Uuid::new_v4(),
                session_id: Uuid::new_v4(),
            },
            Some("user@example.com"),
            Some("User"),
            &[],
            &repo,
        )
        .await;

    assert!(matches!(result, Err(AppError::NotFound(_))));
}

#[tokio::test]
async fn test_webauthn_registration_applies_config_options() {
    let config = WebAuthnConfig {
        enabled: true,
        rp_id: Some("example.com".to_string()),
        rp_name: None,
        rp_origin: Some("https://login.example.com".to_string()),
        allow_platform: true,
        allow_cross_platform: false,
        require_user_verification: false,
        ..Default::default()
    };
    let service = WebAuthnService::new(&config, enabled_test_settings_service().await);
    let repo: Arc<dyn WebAuthnRepository> = Arc::new(InMemoryWebAuthnRepository::new());
    let user_id = Uuid::new_v4();

    let response = service
        .start_registration(
            RegistrationContext {
                user_id,
                session_id: Uuid::new_v4(),
            },
            Some("user@example.com"),
            Some("User"),
            &[],
            &repo,
        )
        .await
        .expect("registration start");

    let selection = response
        .options
        .public_key
        .authenticator_selection
        .as_ref()
        .expect("authenticator selection");
    assert_eq!(
        selection.authenticator_attachment,
        Some(AuthenticatorAttachment::Platform)
    );
    assert_eq!(
        selection.user_verification,
        UserVerificationPolicy::Preferred
    );

    let challenge = repo
        .find_challenge(response.challenge_id)
        .await
        .expect("find challenge")
        .expect("challenge present");
    let state: RegistrationStateForTest =
        serde_json::from_str(&challenge.state).expect("state json");
    assert_eq!(state.rs.policy, UserVerificationPolicy::Preferred);
    assert_eq!(
        state.rs.authenticator_attachment,
        Some(AuthenticatorAttachment::Platform)
    );
}

#[tokio::test]
async fn test_webauthn_discoverable_auth_applies_policy() {
    let config = WebAuthnConfig {
        enabled: true,
        rp_id: Some("example.com".to_string()),
        rp_name: None,
        rp_origin: Some("https://login.example.com".to_string()),
        require_user_verification: false,
        ..Default::default()
    };
    let service = WebAuthnService::new(&config, enabled_test_settings_service().await);
    let repo: Arc<dyn WebAuthnRepository> = Arc::new(InMemoryWebAuthnRepository::new());

    let response = service
        .start_discoverable_authentication(&repo)
        .await
        .expect("discoverable start");

    assert_eq!(
        response.options.public_key.user_verification,
        UserVerificationPolicy::Preferred
    );

    let challenge = repo
        .find_challenge(response.challenge_id)
        .await
        .expect("find challenge")
        .expect("challenge present");
    let state: AuthenticationStateForTest =
        serde_json::from_str(&challenge.state).expect("state json");
    assert_eq!(state.ast.policy, UserVerificationPolicy::Preferred);
}

#[tokio::test]
async fn test_signup_registration_stores_register_new_challenge() {
    let config = WebAuthnConfig {
        enabled: true,
        rp_id: Some("example.com".to_string()),
        rp_name: None,
        rp_origin: Some("https://login.example.com".to_string()),
        ..Default::default()
    };
    let service = WebAuthnService::new(&config, enabled_test_settings_service().await);
    let repo: Arc<dyn WebAuthnRepository> = Arc::new(InMemoryWebAuthnRepository::new());

    let response = service
        .start_registration_for_signup(Uuid::new_v4(), &repo)
        .await
        .expect("signup registration start");

    let challenge = repo
        .find_challenge(response.challenge_id)
        .await
        .expect("find challenge")
        .expect("challenge present");

    assert_eq!(challenge.challenge_type, "register_new");
    assert!(
        challenge.user_id.is_none(),
        "signup challenge must not have user_id (FK)"
    );
}

#[tokio::test]
async fn test_finish_signup_rejects_wrong_challenge_type() {
    let config = WebAuthnConfig {
        enabled: true,
        rp_id: Some("example.com".to_string()),
        rp_name: None,
        rp_origin: Some("https://login.example.com".to_string()),
        ..Default::default()
    };
    let service = WebAuthnService::new(&config, enabled_test_settings_service().await);
    let repo: Arc<dyn WebAuthnRepository> = Arc::new(InMemoryWebAuthnRepository::new());

    // Start a regular (authenticated) registration — produces challenge_type "register"
    let reg = service
        .start_registration(
            RegistrationContext {
                user_id: Uuid::new_v4(),
                session_id: Uuid::new_v4(),
            },
            Some("a@b.com"),
            None,
            &[],
            &repo,
        )
        .await
        .expect("registration start");

    // Build a dummy RegisterPublicKeyCredential (will fail type check before crypto)
    let dummy_cred: RegisterPublicKeyCredential = serde_json::from_value(serde_json::json!({
        "id": "AAAA",
        "rawId": "AAAA",
        "type": "public-key",
        "response": {
            "attestationObject": "AAAA",
            "clientDataJSON": "AAAA"
        }
    }))
    .expect("dummy cred");

    let result = service
        .finish_registration_for_signup(
            VerifyRegistrationRequest {
                challenge_id: reg.challenge_id,
                credential: dummy_cred,
                label: None,
            },
            &repo,
        )
        .await;

    assert!(result.is_err());
    let err_msg = format!("{}", result.unwrap_err());
    assert!(
        err_msg.contains("Invalid challenge type"),
        "Expected challenge type rejection, got: {err_msg}"
    );
}
