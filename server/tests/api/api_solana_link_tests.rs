//! Integration tests for POST /solana/link (attach a wallet to the
//! authenticated user) and the last-login stamp on returning logins.

use crate::api_support::*;
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use ed25519_dalek::{Signer, SigningKey};

/// A deterministic test wallet: (signing key, base58 public key).
fn wallet(seed: u8) -> (SigningKey, String) {
    let signing = SigningKey::from_bytes(&[seed; 32]);
    let public_key = bs58::encode(signing.verifying_key().to_bytes()).into_string();
    (signing, public_key)
}

/// Request a challenge for `public_key` and sign it: (message, signature b64).
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
    assert_eq!(status, StatusCode::OK);
    let message = body["message"].as_str().unwrap().to_string();
    let signature = STANDARD.encode(signing.sign(message.as_bytes()).to_bytes());
    (message, signature)
}

async fn register(app: axum::Router, email: &str) -> String {
    let (status, body) = json_request(
        app,
        Method::POST,
        "/register",
        Some(json!({ "email": email, "password": "SecurePassword1!" })),
    )
    .await;
    assert!(status.is_success(), "register failed: {body}");
    body["tokens"]["accessToken"].as_str().unwrap().to_string()
}

#[tokio::test]
async fn test_solana_link_attaches_wallet_to_current_user() {
    let app = create_test_app().await;
    let access_token = register(app.clone(), "wallet-link@example.com").await;

    let (signing, public_key) = wallet(11);
    let (message, signature) = challenge_and_sign(app.clone(), &signing, &public_key).await;

    let (status, body) = auth_request(
        app.clone(),
        Method::POST,
        "/solana/link",
        &access_token,
        Some(json!({ "publicKey": public_key, "signature": signature, "message": message })),
    )
    .await;

    assert_eq!(status, StatusCode::OK, "link failed: {body}");
    assert_eq!(body["linked"], "solana");
    assert_eq!(body["user"]["walletAddress"], public_key.as_str());
    let methods = body["user"]["authMethods"].as_array().unwrap();
    assert!(methods.iter().any(|m| m == "solana"));
    assert!(methods.iter().any(|m| m == "email"));

    // The wallet now signs the user in to the SAME account, not a new one.
    let (message, signature) = challenge_and_sign(app.clone(), &signing, &public_key).await;
    let (status, login_body) = json_request(
        app,
        Method::POST,
        "/solana",
        Some(json!({ "publicKey": public_key, "signature": signature, "message": message })),
    )
    .await;
    assert!(status.is_success());
    assert_eq!(login_body["isNewUser"], false);
    assert_eq!(login_body["user"]["id"], body["user"]["id"]);
    assert_eq!(login_body["method"], "solana");
}

#[tokio::test]
async fn test_solana_link_rejects_wallet_owned_by_another_account() {
    let app = create_test_app().await;

    // Account A signs in with the wallet (creates a wallet-only user).
    let (signing, public_key) = wallet(12);
    let (message, signature) = challenge_and_sign(app.clone(), &signing, &public_key).await;
    let (status, _) = json_request(
        app.clone(),
        Method::POST,
        "/solana",
        Some(json!({ "publicKey": public_key, "signature": signature, "message": message })),
    )
    .await;
    assert!(status.is_success());

    // Account B (email) proves wallet control but the wallet belongs to A.
    let access_token = register(app.clone(), "wallet-conflict@example.com").await;
    let (message, signature) = challenge_and_sign(app.clone(), &signing, &public_key).await;
    let (status, body) = auth_request(
        app,
        Method::POST,
        "/solana/link",
        &access_token,
        Some(json!({ "publicKey": public_key, "signature": signature, "message": message })),
    )
    .await;

    assert_eq!(status, StatusCode::CONFLICT);
    assert_eq!(body["code"], "WALLET_EXISTS");
}

#[tokio::test]
async fn test_solana_link_rejects_api_key_without_step_up() {
    use cedros_login::repositories::{ApiKeyEntity, UserEntity};
    use cedros_login::services::PasswordService;

    let config = test_config();
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;
    seed_runtime_auth_settings(&storage, &config).await;

    let password_hash = PasswordService::default()
        .hash("SecurePassword1!".to_string())
        .await
        .unwrap();
    let mut user = UserEntity::new_email_user(
        "wallet-link-api-key@example.com".to_string(),
        password_hash,
        None,
    );
    user.email_verified = true;
    let user_id = user.id;
    storage.user_repo.create(user).await.unwrap();

    let raw_key = cedros_login::repositories::generate_api_key();
    let api_key = ApiKeyEntity::new(user_id, &raw_key, "default");
    storage.api_key_repo.create(api_key).await.unwrap();

    let app = router_with_storage(config, callback, storage);
    let (signing, public_key) = wallet(14);
    let (message, signature) = challenge_and_sign(app.clone(), &signing, &public_key).await;
    let (status, body) = auth_request(
        app,
        Method::POST,
        "/solana/link",
        &raw_key,
        Some(json!({ "publicKey": public_key, "signature": signature, "message": message })),
    )
    .await;

    assert_eq!(status, StatusCode::FORBIDDEN);
    assert_eq!(body["code"], "STEP_UP_REQUIRED");
}

#[tokio::test]
async fn test_solana_link_requires_authentication() {
    let app = create_test_app().await;

    let (signing, public_key) = wallet(13);
    let (message, signature) = challenge_and_sign(app.clone(), &signing, &public_key).await;
    let (status, _) = json_request(
        app,
        Method::POST,
        "/solana/link",
        Some(json!({ "publicKey": public_key, "signature": signature, "message": message })),
    )
    .await;

    assert_eq!(status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_login_stamps_last_login_on_user_row() {
    let app = create_test_app().await;
    let email = "last-login@example.com";
    let (_, register_body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({ "email": email, "password": "SecurePassword1!" })),
    )
    .await;
    let created_at = register_body["user"]["createdAt"]
        .as_str()
        .unwrap()
        .to_string();

    // Login #1 stamps the user row; login #2's response reads the stamped row
    // (each handler serializes the user as fetched at the START of the request,
    // so the freshest observable value lags one login behind).
    for _ in 0..2 {
        let (status, _) = json_request(
            app.clone(),
            Method::POST,
            "/login",
            Some(json!({ "email": email, "password": "SecurePassword1!" })),
        )
        .await;
        assert_eq!(status, StatusCode::OK);
    }
    let (status, second_login) = json_request(
        app,
        Method::POST,
        "/login",
        Some(json!({ "email": email, "password": "SecurePassword1!" })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    // RFC3339 UTC timestamps sort lexicographically.
    let updated_at = second_login["user"]["updatedAt"].as_str().unwrap();
    assert!(
        updated_at > created_at.as_str(),
        "login must stamp last_login_at/updated_at on the user row \
         (createdAt {created_at}, updatedAt {updated_at})"
    );
}
