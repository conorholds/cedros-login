use crate::api_support::*;

// =============================================================================
// Organization Tests
// =============================================================================

#[tokio::test]
async fn test_delete_org_removes_from_list() {
    let app = create_test_app().await;

    let (_, register_body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "org-delete@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let access_token = register_body["tokens"]["accessToken"].as_str().unwrap();

    let (status, org_body) = auth_request(
        app.clone(),
        Method::POST,
        "/orgs",
        access_token,
        Some(json!({
            "name": "Acme Inc"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    let org_id = org_body["id"].as_str().unwrap();

    let (status, body) = auth_request(
        app.clone(),
        Method::DELETE,
        &format!("/orgs/{org_id}"),
        access_token,
        None,
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert!(body["message"].as_str().unwrap().contains("deleted"));

    let (status, list_body) = auth_request(app, Method::GET, "/orgs", access_token, None).await;

    assert_eq!(status, StatusCode::OK);
    let orgs = list_body["orgs"].as_array().unwrap();
    assert!(!orgs.iter().any(|org| org["id"] == org_id));
}

#[tokio::test]
async fn test_list_orgs_pagination() {
    let app = create_test_app().await;

    let (_, register_body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "org-paged@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let access_token = register_body["tokens"]["accessToken"].as_str().unwrap();

    for name in ["Org One", "Org Two"] {
        let (status, _) = auth_request(
            app.clone(),
            Method::POST,
            "/orgs",
            access_token,
            Some(json!({ "name": name })),
        )
        .await;
        assert_eq!(status, StatusCode::OK);
    }

    let (status, list_body) = auth_request(
        app.clone(),
        Method::GET,
        "/orgs?limit=2&offset=0",
        access_token,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(list_body["orgs"].as_array().unwrap().len(), 2);
    assert_eq!(list_body["total"], 3);
    assert_eq!(list_body["limit"], 2);
    assert_eq!(list_body["offset"], 0);

    let (status, list_body) = auth_request(
        app.clone(),
        Method::GET,
        "/orgs?limit=2&offset=2",
        access_token,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(list_body["orgs"].as_array().unwrap().len(), 1);
    assert_eq!(list_body["total"], 3);
    assert_eq!(list_body["limit"], 2);
    assert_eq!(list_body["offset"], 2);

    // Empty paginated slices must not trigger self-healing writes.
    let (status, empty_page_body) = auth_request(
        app.clone(),
        Method::GET,
        "/orgs?limit=2&offset=99",
        access_token,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(empty_page_body["orgs"].as_array().unwrap().len(), 0);
    assert_eq!(empty_page_body["total"], 3);

    // Verify canonical page remains unchanged after empty-page query.
    let (status, first_page_body) = auth_request(
        app,
        Method::GET,
        "/orgs?limit=2&offset=0",
        access_token,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(first_page_body["orgs"].as_array().unwrap().len(), 2);
    assert_eq!(first_page_body["total"], 3);
}

#[tokio::test]
async fn test_list_orgs_does_not_reassign_default_org_when_user_has_no_memberships() {
    use cedros_login::repositories::{
        MembershipEntity, OrgEntity, OrgRole, SessionEntity, UserEntity,
    };
    use cedros_login::services::{JwtService, TokenContext};

    let config = test_config();
    let callback = Arc::new(NoopCallback);
    let storage = Storage::in_memory();
    seed_default_org(&storage).await;

    let mut user = UserEntity::new_email_user(
        "removed-user@example.com".to_string(),
        "hashed-password".to_string(),
        None,
    );
    user.email_verified = true;
    let user = storage.user_repo.create(user).await.unwrap();

    let org = OrgEntity::new(
        "Test Org".to_string(),
        "test-org-for-removal".to_string(),
        user.id,
        false,
    );
    let org = storage.org_repo.create(org).await.unwrap();

    let membership = MembershipEntity::new(user.id, org.id, OrgRole::Member);
    storage.membership_repo.create(membership).await.unwrap();
    storage
        .membership_repo
        .delete_by_user_and_org(user.id, org.id)
        .await
        .unwrap();

    let jwt_service = JwtService::new(&config.jwt);
    let session_id = uuid::Uuid::new_v4();
    let token_pair = jwt_service
        .generate_token_pair_with_context(user.id, session_id, &TokenContext::default())
        .unwrap();
    let refresh_expiry =
        chrono::Utc::now() + chrono::Duration::seconds(jwt_service.refresh_expiry_secs() as i64);
    let session = SessionEntity::new_with_id(
        session_id,
        user.id,
        cedros_login::utils::hash_refresh_token(&token_pair.refresh_token, &config.jwt.secret),
        refresh_expiry,
        None,
        None,
    );
    storage.session_repo.create(session).await.unwrap();

    let app = router_with_storage(config, callback, storage);
    let (status, list_body) =
        auth_request(app, Method::GET, "/orgs", &token_pair.access_token, None).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(list_body["orgs"].as_array().unwrap().len(), 0);
    assert_eq!(list_body["total"], 0);
}

#[tokio::test]
async fn test_create_org_rejects_empty_generated_slug() {
    let app = create_test_app().await;

    let (_, register_body) = json_request(
        app.clone(),
        Method::POST,
        "/register",
        Some(json!({
            "email": "org-empty-slug@example.com",
            "password": "SecurePassword1!"
        })),
    )
    .await;

    let access_token = register_body["tokens"]["accessToken"].as_str().unwrap();

    let (status, body) = auth_request(
        app,
        Method::POST,
        "/orgs",
        access_token,
        Some(json!({ "name": "!!!" })),
    )
    .await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(body["code"], "VALIDATION_ERROR");
}

// =============================================================================
// Solana Challenge Tests
// =============================================================================

#[tokio::test]
async fn test_solana_challenge_success() {
    let app = create_test_app().await;

    // Use a valid-looking base58 public key (44 chars)
    let public_key = "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV";

    let (status, body) = json_request(
        app,
        Method::POST,
        "/solana/challenge",
        Some(json!({
            "publicKey": public_key
        })),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert!(body["nonce"].is_string());
    assert!(body["message"].is_string());
    assert!(body["expiresAt"].is_string());

    // Message should contain the nonce
    let message = body["message"].as_str().unwrap();
    let nonce = body["nonce"].as_str().unwrap();
    assert!(message.contains(nonce));
}

#[tokio::test]
async fn test_solana_challenge_invalid_pubkey() {
    let app = create_test_app().await;

    let (status, body) = json_request(
        app,
        Method::POST,
        "/solana/challenge",
        Some(json!({
            "publicKey": "short"
        })),
    )
    .await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(body["code"], "VALIDATION_ERROR");
}
