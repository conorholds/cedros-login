//! Admin canonical-email transition regression tests.

use crate::api_support::*;
use cedros_login::repositories::{SessionEntity, UserEmailEntity, UserEntity};
use cedros_login::services::{JwtService, TokenContext};

async fn app_with_admin() -> (axum::Router, Storage, String) {
    let config = test_config();
    let storage = create_seeded_storage().await;
    let mut admin =
        UserEntity::new_email_user("canonical-admin@example.com".into(), "unused".into(), None);
    admin.email_verified = true;
    admin.is_system_admin = true;
    let admin = storage.user_repo.create(admin).await.unwrap();
    let jwt = JwtService::new(&config.jwt);
    let session_id = uuid::Uuid::new_v4();
    let tokens = jwt
        .generate_token_pair_with_context(
            admin.id,
            session_id,
            &TokenContext {
                is_system_admin: Some(true),
                email_verified: Some(true),
                ..Default::default()
            },
        )
        .unwrap();
    storage
        .session_repo
        .create(SessionEntity::new_with_id(
            session_id,
            admin.id,
            cedros_login::utils::hash_refresh_token(&tokens.refresh_token, &config.jwt.secret),
            chrono::Utc::now() + chrono::Duration::days(1),
            None,
            None,
        ))
        .await
        .unwrap();
    let app = router_with_storage(config, Arc::new(NoopCallback), storage.clone());
    (app, storage, tokens.access_token)
}

async fn create_user_with_primary(storage: &Storage, email: &str, verified: bool) -> UserEntity {
    let mut user = UserEntity::new_email_user(email.into(), "unused".into(), None);
    user.email_verified = verified;
    let user = storage.user_repo.create(user).await.unwrap();
    storage
        .user_email_repo
        .create(UserEmailEntity::new(user.id, email.into(), verified, true))
        .await
        .unwrap();
    user
}

async fn patch_user(
    app: axum::Router,
    token: &str,
    user_id: uuid::Uuid,
    body: Value,
) -> (StatusCode, Value) {
    auth_request(
        app,
        Method::PATCH,
        &format!("/admin/users/{user_id}"),
        token,
        Some(body),
    )
    .await
}

#[tokio::test]
async fn changed_address_is_atomic_and_preserves_verified_old_secondary() {
    let (app, storage, token) = app_with_admin().await;
    let user = create_user_with_primary(&storage, "old-admin@example.com", true).await;
    let (status, body) = patch_user(
        app,
        &token,
        user.id,
        json!({"email":"New-Admin@Example.COM"}),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{body}");
    assert_eq!(body["email"], "new-admin@example.com");
    assert_eq!(body["emailVerified"], false);

    let stored = storage
        .user_repo
        .find_by_id(user.id)
        .await
        .unwrap()
        .unwrap();
    let rows = storage.user_email_repo.list_by_user(user.id).await.unwrap();
    assert_eq!(stored.email.as_deref(), Some("new-admin@example.com"));
    assert_eq!(rows.iter().filter(|row| row.is_primary).count(), 1);
    assert!(rows.iter().any(|row| {
        row.email == "old-admin@example.com" && row.is_verified() && !row.is_primary
    }));
    assert!(rows.iter().any(|row| {
        row.email == "new-admin@example.com" && !row.is_verified() && row.is_primary
    }));
}

#[tokio::test]
async fn verification_only_update_changes_both_canonical_records() {
    let (app, storage, token) = app_with_admin().await;
    let user = create_user_with_primary(&storage, "verify-admin@example.com", false).await;
    let (status, body) = patch_user(app, &token, user.id, json!({"emailVerified":true})).await;
    assert_eq!(status, StatusCode::OK, "{body}");
    assert_eq!(body["emailVerified"], true);
    let row = &storage.user_email_repo.list_by_user(user.id).await.unwrap()[0];
    assert!(row.is_primary && row.is_verified());
}

#[tokio::test]
async fn invalid_duplicate_and_legacy_mismatch_fail_without_partial_write() {
    let (app, storage, token) = app_with_admin().await;
    let user = create_user_with_primary(&storage, "unchanged@example.com", true).await;
    create_user_with_primary(&storage, "taken-admin@example.com", true).await;

    let (invalid_status, _) = patch_user(
        app.clone(),
        &token,
        user.id,
        json!({"email":"not-an-email"}),
    )
    .await;
    assert_eq!(invalid_status, StatusCode::BAD_REQUEST);
    let (duplicate_status, _) = patch_user(
        app.clone(),
        &token,
        user.id,
        json!({"email":"taken-admin@example.com"}),
    )
    .await;
    assert_eq!(duplicate_status, StatusCode::CONFLICT);
    let stored = storage
        .user_repo
        .find_by_id(user.id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(stored.email.as_deref(), Some("unchanged@example.com"));

    let legacy = storage
        .user_repo
        .create(UserEntity::new_email_user(
            "legacy-missing@example.com".into(),
            "unused".into(),
            None,
        ))
        .await
        .unwrap();
    let (legacy_status, _) =
        patch_user(app, &token, legacy.id, json!({"emailVerified":true})).await;
    assert_eq!(legacy_status, StatusCode::SERVICE_UNAVAILABLE);
    assert!(
        !storage
            .user_repo
            .find_by_id(legacy.id)
            .await
            .unwrap()
            .unwrap()
            .email_verified
    );
}
