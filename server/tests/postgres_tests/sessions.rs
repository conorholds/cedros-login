use super::*;

#[tokio::test]
async fn test_postgres_session_create_and_find() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    // Create user first
    let user = UserEntity {
        id: Uuid::new_v4(),
        email: Some(test_email()),
        email_verified: false,
        password_hash: Some("hash123".to_string()),
        name: None,
        picture: None,
        wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec![AuthMethod::Email],
        is_system_admin: false,
        last_login_at: None,
        welcome_completed_at: None,
        referral_code: test_referral_code(),
        referred_by: None,
        username: None,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    let user = storage.user_repo.create(user).await.unwrap();

    // Create session
    let session = SessionEntity {
        family_id: Uuid::new_v4(),
        id: Uuid::new_v4(),
        user_id: user.id,
        refresh_token_hash: format!("hash_{}", Uuid::new_v4()),
        ip_address: Some("127.0.0.1".to_string()),
        user_agent: Some("Test Agent".to_string()),
        created_at: Utc::now(),
        expires_at: Utc::now() + Duration::days(30),
        revoked_at: None,
        revoked_reason: None,
        last_strong_auth_at: None,
    };

    let created = storage.session_repo.create(session.clone()).await.unwrap();
    assert_eq!(created.user_id, user.id);

    // Find by ID
    let found = storage.session_repo.find_by_id(created.id).await.unwrap();
    assert!(found.is_some());
    assert_eq!(found.unwrap().ip_address, Some("127.0.0.1".to_string()));

    // A pre-family server must fail closed during a mixed-version deployment.
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(1)
        .connect(&get_test_db_url().unwrap())
        .await
        .unwrap();
    let error = sqlx::query(
        "INSERT INTO sessions (id,user_id,refresh_token_hash,expires_at) VALUES ($1,$2,$3,$4)",
    )
    .bind(Uuid::new_v4())
    .bind(user.id)
    .bind(Uuid::new_v4().to_string())
    .bind(Utc::now() + Duration::days(1))
    .execute(&pool)
    .await
    .unwrap_err();
    let database = error.as_database_error().unwrap();
    assert_eq!(database.code().as_deref(), Some("23502"));
    assert_eq!(
        database
            .downcast_ref::<sqlx::postgres::PgDatabaseError>()
            .column(),
        Some("family_id")
    );
}

#[tokio::test]
async fn test_postgres_session_find_by_refresh_token() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    // Create user
    let user = UserEntity {
        id: Uuid::new_v4(),
        email: Some(test_email()),
        email_verified: false,
        password_hash: Some("hash".to_string()),
        name: None,
        picture: None,
        wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec![AuthMethod::Email],
        is_system_admin: false,
        last_login_at: None,
        welcome_completed_at: None,
        referral_code: test_referral_code(),
        referred_by: None,
        username: None,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    let user = storage.user_repo.create(user).await.unwrap();

    let token_hash = format!("token_{}", Uuid::new_v4());
    let session = SessionEntity {
        family_id: Uuid::new_v4(),
        id: Uuid::new_v4(),
        user_id: user.id,
        refresh_token_hash: token_hash.clone(),
        ip_address: None,
        user_agent: None,
        created_at: Utc::now(),
        expires_at: Utc::now() + Duration::days(30),
        revoked_at: None,
        revoked_reason: None,
        last_strong_auth_at: None,
    };

    storage.session_repo.create(session).await.unwrap();

    let found = storage
        .session_repo
        .find_by_refresh_token(&token_hash)
        .await
        .unwrap();
    assert!(found.is_some());
}

#[tokio::test]
async fn test_postgres_session_revoke() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    // Create user
    let user = UserEntity {
        id: Uuid::new_v4(),
        email: Some(test_email()),
        email_verified: false,
        password_hash: Some("hash".to_string()),
        name: None,
        picture: None,
        wallet_address: None,
        google_id: None,
        apple_id: None,
        auth_methods: vec![AuthMethod::Email],
        is_system_admin: false,
        last_login_at: None,
        welcome_completed_at: None,
        referral_code: test_referral_code(),
        referred_by: None,
        username: None,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    let user = storage.user_repo.create(user).await.unwrap();

    let session = SessionEntity {
        family_id: Uuid::new_v4(),
        id: Uuid::new_v4(),
        user_id: user.id,
        refresh_token_hash: format!("hash_{}", Uuid::new_v4()),
        ip_address: None,
        user_agent: None,
        created_at: Utc::now(),
        expires_at: Utc::now() + Duration::days(30),
        revoked_at: None,
        revoked_reason: None,
        last_strong_auth_at: None,
    };

    let created = storage.session_repo.create(session).await.unwrap();
    assert!(!storage.session_repo.is_revoked(created.id).await.unwrap());

    storage.session_repo.revoke(created.id).await.unwrap();
    assert!(storage.session_repo.is_revoked(created.id).await.unwrap());
}

#[tokio::test]
async fn test_postgres_session_revoke_all_except() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    let user = create_user(&storage).await;
    let keep = SessionEntity {
        family_id: Uuid::new_v4(),
        id: Uuid::new_v4(),
        user_id: user.id,
        refresh_token_hash: format!("hash_{}", Uuid::new_v4()),
        ip_address: None,
        user_agent: None,
        created_at: Utc::now(),
        expires_at: Utc::now() + Duration::days(30),
        revoked_at: None,
        revoked_reason: None,
        last_strong_auth_at: None,
    };
    let other = SessionEntity {
        family_id: Uuid::new_v4(),
        id: Uuid::new_v4(),
        user_id: user.id,
        refresh_token_hash: format!("hash_{}", Uuid::new_v4()),
        ip_address: None,
        user_agent: None,
        created_at: Utc::now(),
        expires_at: Utc::now() + Duration::days(30),
        revoked_at: None,
        revoked_reason: None,
        last_strong_auth_at: None,
    };

    let keep_id = keep.id;
    let other_id = other.id;
    storage.session_repo.create(keep).await.unwrap();
    storage.session_repo.create(other).await.unwrap();

    let revoked = storage
        .session_repo
        .revoke_all_except(user.id, keep_id)
        .await
        .unwrap();
    assert_eq!(revoked, 1);
    assert!(!storage.session_repo.is_revoked(keep_id).await.unwrap());
    assert!(storage.session_repo.is_revoked(other_id).await.unwrap());
}

#[tokio::test]
async fn postgres_rotation_serializes_with_logout_and_password_change() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };
    let user = storage
        .user_repo
        .create(UserEntity::new_email_user(
            test_email(),
            "original-hash".into(),
            None,
        ))
        .await
        .unwrap();
    let make = || {
        SessionEntity::new(
            user.id,
            Uuid::new_v4().to_string(),
            Utc::now() + Duration::hours(1),
            None,
            None,
        )
    };
    let source = storage.session_repo.create(make()).await.unwrap();
    let first = make();
    let second = make();
    let (a, b) = tokio::join!(
        storage.session_repo.rotate(&source, first, "rotated"),
        storage.session_repo.rotate(&source, second, "rotated")
    );
    assert_ne!(a.unwrap(), b.unwrap());
    let winner = storage
        .session_repo
        .find_active_by_user_id(user.id)
        .await
        .unwrap()
        .pop()
        .unwrap();
    assert_eq!(winner.family_id, source.family_id);
    assert_eq!(winner.expires_at, source.expires_at);
    storage
        .session_repo
        .revoke_with_reason(source.id, "logout")
        .await
        .unwrap();
    assert!(storage.session_repo.is_revoked(winner.id).await.unwrap());

    for _ in 0..4 {
        let source = storage.session_repo.create(make()).await.unwrap();
        let (rotate, revoke) = tokio::join!(
            storage.session_repo.rotate(&source, make(), "rotated"),
            storage.session_repo.revoke_all_for_user(user.id)
        );
        rotate.unwrap();
        revoke.unwrap();
        assert_eq!(
            storage
                .session_repo
                .count_active_by_user_id(user.id)
                .await
                .unwrap(),
            0
        );
    }
    let source = storage.session_repo.create(make()).await.unwrap();
    let (rotate, change) = tokio::join!(
        storage.session_repo.rotate(&source, make(), "rotated"),
        storage.credential_lifecycle_repo.change_password(
            user.id,
            Some("original-hash"),
            "changed-hash",
            None
        )
    );
    rotate.unwrap();
    change.unwrap();
    assert_eq!(
        storage
            .session_repo
            .count_active_by_user_id(user.id)
            .await
            .unwrap(),
        0
    );
    assert!(storage
        .credential_lifecycle_repo
        .change_password(user.id, Some("original-hash"), "stale-hash", None)
        .await
        .is_err());
    assert_eq!(
        storage
            .user_repo
            .find_by_id(user.id)
            .await
            .unwrap()
            .unwrap()
            .password_hash
            .as_deref(),
        Some("changed-hash")
    );
}

#[tokio::test]
async fn postgres_credential_revision_guards_issuance_and_survives_reconnect() {
    let Some(storage) = create_test_storage().await else {
        return;
    };
    let user = create_user(&storage).await;
    let make = || {
        SessionEntity::new(
            user.id,
            Uuid::new_v4().to_string(),
            Utc::now() + Duration::days(1),
            None,
            None,
        )
    };
    let session = make();
    storage
        .credential_lifecycle_repo
        .create_session_if_current(&user, session.clone())
        .await
        .unwrap();
    let expiry = Utc::now() + Duration::minutes(5);
    let hash = Uuid::new_v4().to_string();
    storage
        .credential_lifecycle_repo
        .create_mfa_challenge_if_current(&user, &hash, expiry)
        .await
        .unwrap();
    storage
        .credential_lifecycle_repo
        .change_password(user.id, user.password_hash.as_deref(), "replacement", None)
        .await
        .unwrap();
    assert!(storage
        .verification_repo
        .find_by_hash(&hash)
        .await
        .unwrap()
        .is_none());
    assert!(storage
        .credential_lifecycle_repo
        .create_session_if_current(&user, make())
        .await
        .is_err());
    assert!(storage
        .credential_lifecycle_repo
        .create_mfa_challenge_if_current(&user, &hash, expiry)
        .await
        .is_err());
    let mut stale = user.clone();
    stale.name = Some("stale profile".into());
    assert!(storage
        .user_repo
        .update_if_current(stale, user.updated_at)
        .await
        .is_err());
    drop(storage);
    let reconnected = create_test_storage().await.unwrap();
    assert!(reconnected
        .session_repo
        .is_revoked(session.id)
        .await
        .unwrap());
    let fresh = reconnected
        .user_repo
        .find_by_id(user.id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(fresh.password_hash.as_deref(), Some("replacement"));
    reconnected
        .credential_lifecycle_repo
        .create_session_if_current(&fresh, make())
        .await
        .unwrap();
    reconnected
        .credential_lifecycle_repo
        .create_mfa_challenge_if_current(&fresh, &hash, expiry)
        .await
        .unwrap();
    let mut changed = fresh.clone();
    changed.name = Some("fresh profile".into());
    assert_eq!(
        reconnected
            .user_repo
            .update_if_current(changed, fresh.updated_at)
            .await
            .unwrap()
            .name
            .as_deref(),
        Some("fresh profile")
    );
}
