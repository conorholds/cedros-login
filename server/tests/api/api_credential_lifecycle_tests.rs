//! End-to-end regressions for authoritative credential inventory/removal and
//! concurrent anti-lockout behavior.

use crate::api_support::*;
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use ed25519_dalek::{Signer, SigningKey};

const PASSWORD: &str = "SecurePassword1!";

fn wallet(seed: u8) -> (SigningKey, String) {
    let signing = SigningKey::from_bytes(&[seed; 32]);
    let public_key = bs58::encode(signing.verifying_key().to_bytes()).into_string();
    (signing, public_key)
}

async fn challenge_and_sign(
    app: axum::Router,
    signing: &SigningKey,
    public_key: &str,
) -> (String, String) {
    let (status, body) = json_request(
        app,
        Method::POST,
        "/solana/challenge",
        Some(json!({ "publicKey": public_key })),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "challenge failed: {body}");
    let message = body["message"].as_str().unwrap().to_string();
    let signature = STANDARD.encode(signing.sign(message.as_bytes()).to_bytes());
    (message, signature)
}

async fn register(app: axum::Router, email: &str) -> Value {
    let (status, body) = json_request(
        app,
        Method::POST,
        "/register",
        Some(json!({ "email": email, "password": PASSWORD })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED, "register failed: {body}");
    body
}

async fn login(app: axum::Router, email: &str) -> String {
    let (status, body) = json_request(
        app,
        Method::POST,
        "/login",
        Some(json!({ "email": email, "password": PASSWORD })),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "login failed: {body}");
    body["tokens"]["accessToken"].as_str().unwrap().to_string()
}

async fn link_wallet(app: axum::Router, access: &str, signing: &SigningKey, public_key: &str) {
    let (message, signature) = challenge_and_sign(app.clone(), signing, public_key).await;
    let (status, body) = auth_request(
        app,
        Method::POST,
        "/solana/link",
        access,
        Some(json!({
            "publicKey": public_key,
            "signature": signature,
            "message": message,
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "wallet link failed: {body}");
}

async fn list_credentials(app: axum::Router, access: &str) -> Vec<Value> {
    let (status, body) = auth_request(app, Method::GET, "/credentials", access, None).await;
    assert_eq!(status, StatusCode::OK, "credential list failed: {body}");
    body["credentials"].as_array().unwrap().clone()
}

fn credential_id(credentials: &[Value], kind: &str) -> String {
    credentials
        .iter()
        .find(|credential| credential["credentialType"] == kind)
        .and_then(|credential| credential["id"].as_str())
        .unwrap_or_else(|| panic!("missing {kind} credential in {credentials:?}"))
        .to_string()
}

#[tokio::test]
async fn authoritative_removal_disables_login_and_revokes_other_sessions() {
    let app = create_test_app().await;
    let email = "credential-authority@example.com";
    let registered = register(app.clone(), email).await;
    let first_access = registered["tokens"]["accessToken"]
        .as_str()
        .unwrap()
        .to_string();
    let other_access = login(app.clone(), email).await;
    let (signing, public_key) = wallet(51);
    link_wallet(app.clone(), &first_access, &signing, &public_key).await;

    let credentials = list_credentials(app.clone(), &first_access).await;
    assert_eq!(credentials.len(), 2);
    let wallet_id = credential_id(&credentials, "solana");
    let (status, body) = auth_request(
        app.clone(),
        Method::DELETE,
        &format!("/credentials/{wallet_id}"),
        &first_access,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::NO_CONTENT, "unlink failed: {body}");

    let credentials = list_credentials(app.clone(), &first_access).await;
    assert_eq!(credentials.len(), 1);
    assert_eq!(credentials[0]["credentialType"], "password");
    let (status, _) = auth_request(app, Method::GET, "/user", &other_access, None).await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn final_primary_credential_cannot_be_removed() {
    let app = create_test_app().await;
    let registered = register(app.clone(), "credential-final@example.com").await;
    let access = registered["tokens"]["accessToken"].as_str().unwrap();
    let credentials = list_credentials(app.clone(), access).await;
    let password_id = credential_id(&credentials, "password");

    let (status, body) = auth_request(
        app,
        Method::DELETE,
        &format!("/credentials/{password_id}"),
        access,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert!(body["message"]
        .as_str()
        .is_some_and(|message| message.contains("last primary")));
}

#[tokio::test]
async fn concurrent_removals_preserve_exactly_one_usable_primary_credential() {
    let app = create_test_app().await;
    let email = "credential-race@example.com";
    let registered = register(app.clone(), email).await;
    let first_access = registered["tokens"]["accessToken"]
        .as_str()
        .unwrap()
        .to_string();
    let second_access = login(app.clone(), email).await;
    let (signing, public_key) = wallet(52);
    link_wallet(app.clone(), &first_access, &signing, &public_key).await;
    let credentials = list_credentials(app.clone(), &first_access).await;
    let password_id = credential_id(&credentials, "password");
    let wallet_id = credential_id(&credentials, "solana");

    let password_uri = format!("/credentials/{password_id}");
    let wallet_uri = format!("/credentials/{wallet_id}");
    let remove_password = auth_request(
        app.clone(),
        Method::DELETE,
        &password_uri,
        &first_access,
        None,
    );
    let remove_wallet = auth_request(
        app.clone(),
        Method::DELETE,
        &wallet_uri,
        &second_access,
        None,
    );
    let (password_result, wallet_result) = tokio::join!(remove_password, remove_wallet);
    let statuses = [password_result.0, wallet_result.0];
    assert_eq!(
        statuses
            .iter()
            .filter(|status| **status == StatusCode::NO_CONTENT)
            .count(),
        1,
        "exactly one removal must commit: {statuses:?}"
    );
    assert!(statuses.iter().all(|status| matches!(
        *status,
        StatusCode::NO_CONTENT | StatusCode::BAD_REQUEST | StatusCode::UNAUTHORIZED
    )));

    let winner_access = if password_result.0 == StatusCode::NO_CONTENT {
        &first_access
    } else {
        &second_access
    };
    let remaining = list_credentials(app.clone(), winner_access).await;
    assert_eq!(remaining.len(), 1);
    match remaining[0]["credentialType"].as_str().unwrap() {
        "password" => {
            let _ = login(app, email).await;
        }
        "solana" => {
            let (message, signature) = challenge_and_sign(app.clone(), &signing, &public_key).await;
            let (status, body) = json_request(
                app,
                Method::POST,
                "/solana",
                Some(json!({
                    "publicKey": public_key,
                    "signature": signature,
                    "message": message,
                })),
            )
            .await;
            assert_eq!(status, StatusCode::OK, "wallet login failed: {body}");
        }
        kind => panic!("unexpected remaining credential: {kind}"),
    }
}

#[tokio::test]
async fn wallet_cannot_be_removed_when_remaining_password_has_no_login_email() {
    let app = create_test_app().await;
    let (signing, public_key) = wallet(73);
    let (message, signature) = challenge_and_sign(app.clone(), &signing, &public_key).await;
    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/solana",
        Some(json!({"publicKey":public_key,"message":message,"signature":signature})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{body}");
    let access = body["tokens"]["accessToken"].as_str().unwrap();
    let (status, body) = auth_request(
        app.clone(),
        Method::POST,
        "/set-password",
        access,
        Some(json!({"password":PASSWORD})),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{body}");
    let credentials = list_credentials(app.clone(), access).await;
    let wallet_id = credential_id(&credentials, "solana");
    let password_id = credential_id(&credentials, "password");
    let (status, body) = auth_request(
        app.clone(),
        Method::DELETE,
        &format!("/credentials/{wallet_id}"),
        access,
        None,
    )
    .await;
    assert_eq!(
        status,
        StatusCode::BAD_REQUEST,
        "unusable password permitted lockout: {body}"
    );
    let (status, body) = auth_request(
        app.clone(),
        Method::DELETE,
        &format!("/credentials/{password_id}"),
        access,
        None,
    )
    .await;
    assert_eq!(
        status,
        StatusCode::NO_CONTENT,
        "usable wallet should permit removing unusable password: {body}"
    );
    let (message, signature) = challenge_and_sign(app.clone(), &signing, &public_key).await;
    let (status, body) = json_request(
        app,
        Method::POST,
        "/solana",
        Some(json!({"publicKey":public_key,"message":message,"signature":signature})),
    )
    .await;
    assert_eq!(
        status,
        StatusCode::OK,
        "remaining wallet must still sign in: {body}"
    );
}
