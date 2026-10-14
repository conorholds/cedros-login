use crate::api_support::*;
use cedros_login::repositories::{
    default_expiry, hash_verification_token, InviteCodeEntity, OutboxEventType, SessionEntity,
    TokenType, UserEntity,
};
use cedros_login::services::{JwtService, TokenContext};
use cedros_login::utils::TokenCipher;

#[tokio::test]
async fn registration_requires_invite_code_and_redeems_after_retry() {
    let (app, storage) = create_invite_gated_app().await;
    seed_invite_code(&storage, "WELCOME").await;

    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "invite-gated@example.com",
            "password": "SecurePassword1!",
            "name": "Invite Gated"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(body["inviteCodeRequired"], true);
    assert!(body["tokens"].is_null());
    let pending_token = body["pendingInviteToken"].as_str().unwrap();

    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/invite-codes/redeem",
        Some(json!({
            "pendingInviteToken": pending_token,
            "code": "WRONG"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::FORBIDDEN);
    assert_eq!(body["code"], "FORBIDDEN");

    let (status, body) = json_request(
        app,
        Method::POST,
        "/invite-codes/redeem",
        Some(json!({
            "pendingInviteToken": pending_token,
            "code": "WELCOME"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert!(body["tokens"]["accessToken"].is_string());
    assert_eq!(body["user"]["email"], "invite-gated@example.com");
}

#[tokio::test]
async fn concurrent_pending_token_redemption_has_exactly_one_winner() {
    let (app, storage) = create_invite_gated_app().await;
    seed_invite_code(&storage, "RACEONE").await;
    seed_invite_code(&storage, "RACETWO").await;

    let (_, registered) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "invite-race@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    let pending_token = registered["pendingInviteToken"]
        .as_str()
        .unwrap()
        .to_string();
    let user_id = uuid::Uuid::parse_str(registered["user"]["id"].as_str().unwrap()).unwrap();

    let first = json_request(
        app.clone(),
        Method::POST,
        "/invite-codes/redeem",
        Some(json!({
            "pendingInviteToken": pending_token,
            "code": "RACEONE"
        })),
    );
    let second = json_request(
        app,
        Method::POST,
        "/invite-codes/redeem",
        Some(json!({
            "pendingInviteToken": registered["pendingInviteToken"],
            "code": "RACETWO"
        })),
    );
    let ((first_status, first_body), (second_status, second_body)) = tokio::join!(first, second);

    let statuses = [first_status, second_status];
    assert_eq!(
        statuses
            .iter()
            .filter(|status| **status == StatusCode::OK)
            .count(),
        1
    );
    assert_eq!(
        statuses
            .iter()
            .filter(|status| **status == StatusCode::UNAUTHORIZED)
            .count(),
        1
    );
    let loser = if first_status == StatusCode::UNAUTHORIZED {
        &first_body
    } else {
        &second_body
    };
    assert_eq!(loser["code"], "INVALID_TOKEN");

    let codes = storage.invite_code_repo.list_admin(10, 0).await.unwrap();
    assert_eq!(codes.iter().map(|code| code.uses_count).sum::<i32>(), 1);
    assert!(!storage
        .invite_code_repo
        .is_user_pending(user_id)
        .await
        .unwrap());
    assert_eq!(
        storage
            .session_repo
            .find_by_user_id(user_id)
            .await
            .unwrap()
            .len(),
        1
    );
}

#[tokio::test]
async fn pending_user_login_returns_fresh_token_then_restores_current_user() {
    let (app, storage) = create_invite_gated_app().await;
    seed_invite_code(&storage, "EARLYACCESS").await;

    let (_, registered) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "returning-waitlist@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    let original_token = registered["pendingInviteToken"].as_str().unwrap();

    let (status, login) = json_request(
        app.clone(),
        Method::POST,
        "/login",
        Some(json!({
            "email": "returning-waitlist@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(login["inviteCodeRequired"], true);
    assert_eq!(login["isNewUser"], false);
    assert!(login["tokens"].is_null());
    let fresh_token = login["pendingInviteToken"].as_str().unwrap();
    assert_ne!(fresh_token, original_token);

    let (status, replayed) = json_request(
        app.clone(),
        Method::POST,
        "/invite-codes/redeem",
        Some(json!({"pendingInviteToken": original_token, "code": "EARLYACCESS"})),
    )
    .await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
    assert_eq!(replayed["code"], "INVALID_TOKEN");

    let (status, redeemed) = json_request(
        app.clone(),
        Method::POST,
        "/invite-codes/redeem",
        Some(json!({"pendingInviteToken": fresh_token, "code": "EARLYACCESS"})),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let access_token = redeemed["tokens"]["accessToken"].as_str().unwrap();

    let (status, current) = auth_request(app, Method::GET, "/user", access_token, None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(current["user"]["email"], "returning-waitlist@example.com");
}

#[tokio::test]
async fn disabling_gate_releases_pending_user_on_next_login() {
    let storage = create_seeded_storage().await;
    let app = router_with_storage(test_config(), Arc::new(NoopCallback), storage.clone());
    let (_, registered) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "released-waitlist@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    let user_id = uuid::Uuid::parse_str(registered["user"]["id"].as_str().unwrap()).unwrap();
    storage
        .invite_code_repo
        .mark_user_pending(user_id)
        .await
        .unwrap();

    let (status, login) = json_request(
        app,
        Method::POST,
        "/login",
        Some(json!({
            "email": "released-waitlist@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert!(login["tokens"]["accessToken"].is_string());
    assert!(!storage
        .invite_code_repo
        .is_user_pending(user_id)
        .await
        .unwrap());
}

#[tokio::test]
async fn stale_mfa_challenge_cannot_mint_an_invite_session() {
    let (app, storage) = create_invite_gated_app().await;
    let (_, registered) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "pending-mfa-invite@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;
    let user_id = uuid::Uuid::parse_str(registered["user"]["id"].as_str().unwrap()).unwrap();
    storage
        .totp_repo
        .upsert_secret(user_id, "test-secret")
        .await
        .unwrap();
    storage.totp_repo.enable_mfa(user_id).await.unwrap();
    let mfa_token = "email.stale-pending-challenge";
    let token_hash = hash_verification_token(mfa_token);
    storage
        .verification_repo
        .create(
            user_id,
            &token_hash,
            TokenType::MfaPending,
            default_expiry(TokenType::MfaPending),
        )
        .await
        .unwrap();

    let (status, body) = json_request(
        app,
        Method::POST,
        "/login/mfa",
        Some(json!({ "mfaToken": mfa_token, "code": "000000" })),
    )
    .await;
    assert_eq!(status, StatusCode::FORBIDDEN);
    assert!(body.get("pendingInviteToken").is_none());
    assert!(storage
        .verification_repo
        .find_valid(&token_hash, &[TokenType::MfaPending])
        .await
        .unwrap()
        .is_none());
    assert!(storage
        .session_repo
        .find_by_user_id(user_id)
        .await
        .unwrap()
        .is_empty());
}

async fn seed_invite_code(storage: &Storage, code: &str) {
    storage
        .invite_code_repo
        .create(InviteCodeEntity::new(
            code.to_string(),
            None,
            None,
            Some(1),
            None,
            None,
            None,
        ))
        .await
        .unwrap();
}

async fn create_invite_gated_app() -> (axum::Router, Storage) {
    let storage = create_seeded_storage().await;
    storage
        .system_settings_repo
        .upsert(SystemSetting::new(
            "invite_codes_enabled".to_string(),
            "true".to_string(),
            "auth.invite_codes".to_string(),
        ))
        .await
        .unwrap();
    let app = router_with_storage(test_config(), Arc::new(NoopCallback), storage.clone());
    (app, storage)
}

#[tokio::test]
async fn solana_signup_and_returning_login_require_invite_code_when_gate_enabled() {
    use base64::engine::general_purpose::STANDARD;
    use base64::Engine;
    use ed25519_dalek::{Signer, SigningKey};

    let (app, storage) = create_invite_gated_app().await;
    let signing = SigningKey::from_bytes(&[42; 32]);
    let public_key = bs58::encode(signing.verifying_key().to_bytes()).into_string();

    let (status, challenge) = json_request(
        app.clone(),
        Method::POST,
        "/solana/challenge",
        Some(json!({ "publicKey": public_key })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let message = challenge["message"].as_str().unwrap().to_string();
    let signature = STANDARD.encode(signing.sign(message.as_bytes()).to_bytes());

    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/solana",
        Some(json!({
            "publicKey": public_key,
            "signature": signature,
            "message": message
        })),
    )
    .await;

    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(body["inviteCodeRequired"], true);
    assert!(body["tokens"].is_null());
    assert!(body["apiKey"].is_null());
    assert!(body["pendingInviteToken"].is_string());
    let user_id = uuid::Uuid::parse_str(body["user"]["id"].as_str().unwrap()).unwrap();
    assert!(storage
        .invite_code_repo
        .is_user_pending(user_id)
        .await
        .unwrap());
    assert!(storage
        .session_repo
        .find_by_user_id(user_id)
        .await
        .unwrap()
        .is_empty());
    assert!(storage
        .api_key_repo
        .find_by_user_id(user_id)
        .await
        .unwrap()
        .is_empty());

    let (status, challenge) = json_request(
        app.clone(),
        Method::POST,
        "/solana/challenge",
        Some(json!({ "publicKey": public_key.clone() })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let message = challenge["message"].as_str().unwrap().to_string();
    let signature = STANDARD.encode(signing.sign(message.as_bytes()).to_bytes());
    let (status, returning) = json_request(
        app,
        Method::POST,
        "/solana",
        Some(json!({
            "publicKey": public_key,
            "signature": signature,
            "message": message
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(returning["inviteCodeRequired"], true);
    assert_eq!(returning["isNewUser"], false);
    assert!(returning["tokens"].is_null());
    assert!(storage
        .session_repo
        .find_by_user_id(user_id)
        .await
        .unwrap()
        .is_empty());
}

#[tokio::test]
async fn instant_link_signup_requires_invite_code_when_gate_enabled() {
    let (app, storage) = create_invite_gated_app().await;
    let email = "instant-invite-gated@example.com";

    let (status, _) = json_request(
        app.clone(),
        Method::POST,
        "/instant-link",
        Some(json!({ "email": email })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let events = storage.outbox_repo.fetch_pending(10, 0).await.unwrap();
    let event = events
        .iter()
        .find(|event| event.event_type == OutboxEventType::EmailInstantLink)
        .expect("instant-link email queued");
    let token_enc = event.payload["token_enc"]
        .as_str()
        .expect("instant-link token encrypted");
    let token = TokenCipher::new(&test_config().jwt.secret)
        .decrypt(token_enc)
        .expect("instant-link token decrypts");

    let (status, body) = json_request(
        app,
        Method::POST,
        "/instant-link/verify",
        Some(json!({ "token": token })),
    )
    .await;

    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(body["inviteCodeRequired"], true);
    assert!(body["tokens"].is_null());
    assert!(body["apiKey"].is_null());
    assert!(body["pendingInviteToken"].is_string());
    assert_eq!(body["user"]["email"], email);
    let user_id = uuid::Uuid::parse_str(body["user"]["id"].as_str().unwrap()).unwrap();
    assert!(storage
        .invite_code_repo
        .is_user_pending(user_id)
        .await
        .unwrap());
    assert!(storage
        .session_repo
        .find_by_user_id(user_id)
        .await
        .unwrap()
        .is_empty());
    assert!(storage
        .api_key_repo
        .find_by_user_id(user_id)
        .await
        .unwrap()
        .is_empty());
}

#[tokio::test]
async fn mailbox_owner_claim_cannot_bypass_existing_invite_gate() {
    let (app, storage) = create_invite_gated_app().await;
    let email = "claimed-invite-gated@example.com";
    let (_, registered) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": email,
            "password": "SecurePassword1!"
        })),
    )
    .await;
    let user_id = uuid::Uuid::parse_str(registered["user"]["id"].as_str().unwrap()).unwrap();

    let (status, _) = json_request(
        app.clone(),
        Method::POST,
        "/instant-link",
        Some(json!({ "email": email })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let events = storage.outbox_repo.fetch_pending(20, 0).await.unwrap();
    let event = events
        .iter()
        .find(|event| event.event_type == OutboxEventType::EmailInstantLink)
        .expect("instant-link email queued");
    let token = TokenCipher::new(&test_config().jwt.secret)
        .decrypt(event.payload["token_enc"].as_str().unwrap())
        .unwrap();

    let (status, claimed) = json_request(
        app,
        Method::POST,
        "/instant-link/verify",
        Some(json!({ "token": token })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(claimed["inviteCodeRequired"], true);
    assert_eq!(claimed["isNewUser"], false);
    assert!(claimed["tokens"].is_null());
    assert!(storage
        .user_repo
        .find_by_id(user_id)
        .await
        .unwrap()
        .unwrap()
        .password_hash
        .is_none());
    assert!(storage
        .session_repo
        .find_by_user_id(user_id)
        .await
        .unwrap()
        .is_empty());
}

#[tokio::test]
async fn admin_can_update_and_delete_invite_code() {
    let (app, storage, admin_token) = create_admin_invite_code_app().await;
    let code = storage
        .invite_code_repo
        .create(InviteCodeEntity::new(
            "WELCOME".to_string(),
            None,
            None,
            Some(1),
            None,
            None,
            None,
        ))
        .await
        .unwrap();

    let (status, body) = auth_request(
        app.clone(),
        Method::PATCH,
        &format!("/admin/invite-codes/{}", code.id),
        &admin_token,
        Some(json!({
            "code": "LAUNCH",
            "maxUses": 7,
            "startsAt": "2026-07-01T00:00:00Z",
            "expiresAt": "2026-08-01T00:00:00Z",
            "active": false
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["code"], "LAUNCH");
    assert_eq!(body["maxUses"], 7);
    assert_eq!(body["active"], false);

    let (status, _) = auth_request(
        app.clone(),
        Method::DELETE,
        &format!("/admin/invite-codes/{}", code.id),
        &admin_token,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::NO_CONTENT);

    let (status, body) =
        auth_request(app, Method::GET, "/admin/invite-codes", &admin_token, None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["codes"].as_array().unwrap().len(), 0);
}

#[tokio::test]
async fn admin_invite_code_update_rejects_invalid_window() {
    let (app, storage, admin_token) = create_admin_invite_code_app().await;
    let code = storage
        .invite_code_repo
        .create(InviteCodeEntity::new(
            "WELCOME".to_string(),
            None,
            None,
            None,
            None,
            None,
            None,
        ))
        .await
        .unwrap();

    let (status, body) = auth_request(
        app,
        Method::PATCH,
        &format!("/admin/invite-codes/{}", code.id),
        &admin_token,
        Some(json!({
            "startsAt": "2026-08-01T00:00:00Z",
            "expiresAt": "2026-07-01T00:00:00Z"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(body["code"], "VALIDATION_ERROR");
}

async fn create_admin_invite_code_app() -> (axum::Router, Storage, String) {
    let config = test_config();
    let storage = create_seeded_storage().await;
    let mut admin = UserEntity::new_email_user(
        "invite-admin@example.com".to_string(),
        "hashed-password".to_string(),
        Some("Invite Admin".to_string()),
    );
    admin.email_verified = true;
    admin.is_system_admin = true;
    let admin = storage.user_repo.create(admin).await.unwrap();

    let jwt_service = JwtService::new(&config.jwt);
    let session_id = uuid::Uuid::new_v4();
    let token_pair = jwt_service
        .generate_token_pair_with_context(
            admin.id,
            session_id,
            &TokenContext {
                is_system_admin: Some(true),
                email_verified: Some(true),
                ..TokenContext::default()
            },
        )
        .unwrap();
    let refresh_expiry =
        chrono::Utc::now() + chrono::Duration::seconds(jwt_service.refresh_expiry_secs() as i64);
    storage
        .session_repo
        .create(SessionEntity::new_with_id(
            session_id,
            admin.id,
            cedros_login::utils::hash_refresh_token(&token_pair.refresh_token, &config.jwt.secret),
            refresh_expiry,
            None,
            None,
        ))
        .await
        .unwrap();

    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());
    (app, storage, token_pair.access_token)
}

#[tokio::test]
async fn discount_code_grants_and_serves_invite_discount() {
    let (app, storage) = create_invite_gated_app().await;
    let mut discounted =
        InviteCodeEntity::new("GOLD50".to_string(), None, None, Some(1), None, None, None);
    discounted.discount_percent = Some(50);
    storage.invite_code_repo.create(discounted).await.unwrap();

    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "discount@example.com",
            "password": "SecurePassword1!",
            "name": "Discount User"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);
    let pending_token = body["pendingInviteToken"].as_str().unwrap().to_string();

    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/invite-codes/redeem",
        Some(json!({
            "pendingInviteToken": pending_token,
            "code": "GOLD50"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["inviteDiscount"]["percentOff"], 50);
    assert_eq!(body["inviteDiscount"]["code"], "GOLD50");
    let access_token = body["tokens"]["accessToken"].as_str().unwrap().to_string();

    let (status, body) = auth_request(
        app,
        Method::GET,
        "/account/invite-discount",
        &access_token,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["discount"]["percentOff"], 50);
    assert_eq!(body["discount"]["code"], "GOLD50");
    assert!(body["discount"]["redeemedAt"].is_string());
}

#[tokio::test]
async fn account_invite_discount_is_null_without_a_discount_grant() {
    let (app, storage) = create_invite_gated_app().await;
    seed_invite_code(&storage, "PLAIN").await;

    let (_, body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "plain@example.com",
            "password": "SecurePassword1!",
            "name": "Plain User"
        })),
    )
    .await;
    let pending_token = body["pendingInviteToken"].as_str().unwrap().to_string();

    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/invite-codes/redeem",
        Some(json!({
            "pendingInviteToken": pending_token,
            "code": "PLAIN"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert!(body.get("inviteDiscount").is_none());
    let access_token = body["tokens"]["accessToken"].as_str().unwrap().to_string();

    let (status, body) = auth_request(
        app,
        Method::GET,
        "/account/invite-discount",
        &access_token,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert!(body["discount"].is_null());
}

#[tokio::test]
async fn admin_invite_code_discount_is_editable_and_validated() {
    let (app, _storage, admin_token) = create_admin_invite_code_app().await;

    let (status, body) = auth_request(
        app.clone(),
        Method::POST,
        "/admin/invite-codes",
        &admin_token,
        Some(json!({ "code": "QUARTER", "discountPercent": 25 })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(body["discountPercent"], 25);
    let id = body["id"].as_str().unwrap().to_string();

    let (status, body) = auth_request(
        app.clone(),
        Method::PATCH,
        &format!("/admin/invite-codes/{id}"),
        &admin_token,
        Some(json!({ "discountPercent": null })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert!(body["discountPercent"].is_null());

    let (status, body) = auth_request(
        app,
        Method::POST,
        "/admin/invite-codes",
        &admin_token,
        Some(json!({ "code": "TOOBIG", "discountPercent": 150 })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(body["code"], "VALIDATION_ERROR");
}

#[tokio::test]
async fn fixed_month_discount_survives_redemption_and_account_lookup() {
    let (app, storage) = create_invite_gated_app().await;
    let mut discounted =
        InviteCodeEntity::new("GOLD50".to_string(), None, None, Some(1), None, None, None);
    discounted.discount_percent = Some(50);
    discounted.discount_months = Some(3);
    storage.invite_code_repo.create(discounted).await.unwrap();

    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "discount@example.com",
            "password": "SecurePassword1!",
            "name": "Discount User"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);
    let pending_token = body["pendingInviteToken"].as_str().unwrap().to_string();

    let (status, body) = json_request(
        app.clone(),
        Method::POST,
        "/invite-codes/redeem",
        Some(json!({
            "pendingInviteToken": pending_token,
            "code": "GOLD50"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["inviteDiscount"]["percentOff"], 50);
    assert_eq!(body["inviteDiscount"]["durationMonths"], 3);
    assert_eq!(body["inviteDiscount"]["code"], "GOLD50");
    let access_token = body["tokens"]["accessToken"].as_str().unwrap().to_string();

    let (status, body) = auth_request(
        app,
        Method::GET,
        "/account/invite-discount",
        &access_token,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["discount"]["percentOff"], 50);
    assert_eq!(body["discount"]["durationMonths"], 3);
    assert_eq!(body["discount"]["code"], "GOLD50");
    assert!(body["discount"]["redeemedAt"].is_string());
}

#[tokio::test]
async fn admin_fixed_month_discount_can_be_changed_or_cleared_and_rejects_invalid_terms() {
    let (app, _storage, token) = create_admin_invite_code_app().await;
    let (status, body) = auth_request(
        app.clone(),
        Method::POST,
        "/admin/invite-codes",
        &token,
        Some(json!({"code":"FIXED", "discountPercent":100, "discountMonths":3})),
    )
    .await;
    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(body["discountMonths"], 3);
    let path = format!("/admin/invite-codes/{}", body["id"].as_str().unwrap());
    let (status, body) = auth_request(
        app.clone(),
        Method::PATCH,
        &path,
        &token,
        Some(json!({"discountMonths":6})),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["discountMonths"], 6);
    let (status, _) = auth_request(
        app.clone(),
        Method::PATCH,
        &path,
        &token,
        Some(json!({"discountMonths":0})),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    let (status, _) = auth_request(
        app.clone(),
        Method::PATCH,
        &path,
        &token,
        Some(json!({"discountPercent":null})),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    let (status, body) = auth_request(
        app.clone(),
        Method::PATCH,
        &path,
        &token,
        Some(json!({"discountMonths":null})),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert!(body["discountMonths"].is_null());
    assert_eq!(body["discountPercent"], 100);
    for months in [json!(0), json!(-1)] {
        let (status, _) = auth_request(
            app.clone(),
            Method::POST,
            "/admin/invite-codes",
            &token,
            Some(json!({"code":"BAD", "discountPercent":100, "discountMonths":months})),
        )
        .await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
    }
    let (status, _) = auth_request(
        app.clone(),
        Method::POST,
        "/admin/invite-codes",
        &token,
        Some(json!({"code":"MISSING", "discountMonths":3})),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
}
