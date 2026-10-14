use super::*;

#[tokio::test]
async fn test_postgres_totp_secret_encrypted_at_rest() {
    if get_test_db_url().is_none() {
        return;
    }

    let storage = match create_test_storage().await {
        Some(storage) => storage,
        None => return,
    };

    let user = create_user(&storage).await;
    let secret = "JBSWY3DPEHPK3PXP";

    storage
        .totp_repo
        .upsert_secret(user.id, secret)
        .await
        .unwrap();

    let pool = storage.pg_pool.as_ref().unwrap();
    let stored_secret: String = query_scalar(
        "SELECT secret FROM totp_secrets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
    )
    .bind(user.id)
    .fetch_one(pool)
    .await
    .unwrap();

    assert!(stored_secret.starts_with("v1:"));
    assert_ne!(stored_secret, secret);

    let stored = storage.totp_repo.find_by_user(user.id).await.unwrap();
    assert_eq!(stored.unwrap().secret, secret);
}

#[tokio::test]
async fn test_postgres_totp_setup_and_recovery_codes() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    let user = create_user(&storage).await;
    let secret = storage
        .totp_repo
        .upsert_secret(user.id, "JBSWY3DPEHPK3PXP")
        .await
        .unwrap();
    assert!(!secret.enabled);

    storage.totp_repo.enable_mfa(user.id).await.unwrap();
    assert!(storage.totp_repo.has_mfa_enabled(user.id).await.unwrap());

    storage
        .totp_repo
        .store_recovery_codes(
            user.id,
            vec![
                TotpService::hash_recovery_code("CODE-0001").unwrap(),
                TotpService::hash_recovery_code("CODE-0002").unwrap(),
            ],
        )
        .await
        .unwrap();

    let codes = storage.totp_repo.get_recovery_codes(user.id).await.unwrap();
    assert_eq!(codes.len(), 2);

    assert!(storage
        .totp_repo
        .use_recovery_code(user.id, "CODE-0001")
        .await
        .unwrap());
    assert!(!storage
        .totp_repo
        .use_recovery_code(user.id, "CODE-0001")
        .await
        .unwrap());
}

#[tokio::test]
async fn test_postgres_totp_recovery_code_consumed_once_under_contention() {
    let Some(storage) = create_test_storage().await else {
        return;
    };
    let user = create_user(&storage).await;
    storage
        .totp_repo
        .store_recovery_codes(
            user.id,
            vec![TotpService::hash_recovery_code("RACE-1234").unwrap()],
        )
        .await
        .unwrap();
    let (a, b) = tokio::join!(
        storage.totp_repo.use_recovery_code(user.id, "race1234"),
        storage.totp_repo.use_recovery_code(user.id, "RACE-1234")
    );
    assert_eq!(u8::from(a.unwrap()) + u8::from(b.unwrap()), 1);
    assert!(storage
        .totp_repo
        .get_recovery_codes(user.id)
        .await
        .unwrap()
        .is_empty());
}
