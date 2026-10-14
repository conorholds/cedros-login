use super::*;
use crate::repositories::{
    InMemorySystemSettingsRepository, SystemSetting, SystemSettingsRepository,
};

use super::test_support::{setting, ControlledSettingsRepository};

#[tokio::test]
async fn test_get_setting() {
    let repo = Arc::new(InMemorySystemSettingsRepository::with_defaults());
    let service = SettingsService::new(repo);
    assert_eq!(
        service.get("rate_limit_window").await.unwrap(),
        Some("60".to_string())
    );
}

#[tokio::test]
async fn test_get_u64() {
    let repo = Arc::new(InMemorySystemSettingsRepository::with_defaults());
    let service = SettingsService::new(repo);
    assert_eq!(
        service.get_u64("rate_limit_window").await.unwrap(),
        Some(60)
    );
}

#[tokio::test]
async fn invalid_known_values_are_diagnostic_only_not_executable() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    repo.upsert(SystemSetting::new(
        EMAIL_VERIFICATION_REQUIRED_KEY.to_string(),
        "yes".to_string(),
        "auth.email".to_string(),
    ))
    .await
    .unwrap();
    let service = SettingsService::new(repo);

    assert_eq!(
        service.get(EMAIL_VERIFICATION_REQUIRED_KEY).await.unwrap(),
        None
    );
    assert_eq!(
        service
            .get_bool(EMAIL_VERIFICATION_REQUIRED_KEY)
            .await
            .unwrap(),
        None
    );
    assert_eq!(
        service
            .get_all_cached()
            .await
            .unwrap()
            .get(EMAIL_VERIFICATION_REQUIRED_KEY),
        Some(&"yes".to_string()),
        "the raw row remains available to the diagnostic/admin path"
    );
}

#[tokio::test]
async fn email_verification_policy_uses_setting_then_static_fallback() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    let service = SettingsService::with_ttl(repo.clone(), 0);
    assert!(service.email_verification_required(true).await.unwrap());
    assert!(!service.email_verification_required(false).await.unwrap());

    repo.upsert(SystemSetting::new(
        EMAIL_VERIFICATION_REQUIRED_KEY.to_string(),
        "true".to_string(),
        "auth.email".to_string(),
    ))
    .await
    .unwrap();
    assert!(service.email_verification_required(false).await.unwrap());
}

#[tokio::test]
async fn test_require_u64_missing() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    let service = SettingsService::new(repo);
    assert!(service.require_u64("nonexistent").await.is_err());
}

#[tokio::test]
async fn test_cache_refresh() {
    let repo = Arc::new(InMemorySystemSettingsRepository::with_defaults());
    let service = SettingsService::with_ttl(repo.clone(), 0);
    let _ = service.get("rate_limit_window").await.unwrap();
    repo.upsert(SystemSetting::new(
        "rate_limit_window".to_string(),
        "1000".to_string(),
        "rate_limit".to_string(),
    ))
    .await
    .unwrap();
    assert_eq!(
        service.get_u64("rate_limit_window").await.unwrap(),
        Some(1000)
    );
}

#[tokio::test]
async fn direct_write_clears_sync_cache_until_a_complete_snapshot_is_reloaded() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    repo.upsert(setting("false")).await.unwrap();
    let service = SettingsService::new(repo);
    service.refresh().await.unwrap();

    service
        .set(EMAIL_VERIFICATION_REQUIRED_KEY, "true", "auth.email", None)
        .await
        .unwrap();

    assert_eq!(
        service.get_cached_sync(EMAIL_VERIFICATION_REQUIRED_KEY),
        None
    );
    assert_eq!(
        service.get(EMAIL_VERIFICATION_REQUIRED_KEY).await.unwrap(),
        Some("true".to_string())
    );
}

#[tokio::test]
async fn separate_service_instances_propagate_only_after_refresh_or_ttl() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    repo.upsert(setting("false")).await.unwrap();
    let writer = SettingsService::with_ttl(repo.clone(), 3_600);
    let peer = SettingsService::with_ttl(repo, 3_600);

    assert_eq!(
        writer.get(EMAIL_VERIFICATION_REQUIRED_KEY).await.unwrap(),
        Some("false".to_string())
    );
    assert_eq!(
        peer.get(EMAIL_VERIFICATION_REQUIRED_KEY).await.unwrap(),
        Some("false".to_string())
    );

    writer
        .set(EMAIL_VERIFICATION_REQUIRED_KEY, "true", "auth.email", None)
        .await
        .unwrap();
    assert_eq!(
        writer.get(EMAIL_VERIFICATION_REQUIRED_KEY).await.unwrap(),
        Some("true".to_string())
    );
    assert_eq!(
        peer.get(EMAIL_VERIFICATION_REQUIRED_KEY).await.unwrap(),
        Some("false".to_string()),
        "a separate service keeps its snapshot until explicit refresh or TTL expiry"
    );

    peer.refresh().await.unwrap();
    assert_eq!(
        peer.get(EMAIL_VERIFICATION_REQUIRED_KEY).await.unwrap(),
        Some("true".to_string())
    );
}

#[tokio::test]
async fn separate_service_instances_converge_after_ttl_expiry() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    repo.upsert(setting("false")).await.unwrap();
    let writer = SettingsService::with_ttl(repo.clone(), 0);
    let peer = SettingsService::with_ttl(repo.clone(), 0);

    assert_eq!(
        peer.get(EMAIL_VERIFICATION_REQUIRED_KEY).await.unwrap(),
        Some("false".to_string())
    );
    let committed = repo.upsert(setting("true")).await.unwrap();
    let revision = repo.get_revision().await.unwrap();
    writer.publish_committed(&[committed], revision).await;

    assert_eq!(
        peer.get(EMAIL_VERIFICATION_REQUIRED_KEY).await.unwrap(),
        Some("true".to_string()),
        "an independent cache must converge through its normal TTL refresh"
    );
}

#[tokio::test]
async fn serialized_refresh_cannot_publish_an_older_snapshot_last() {
    let repo = Arc::new(ControlledSettingsRepository::new("false"));
    let service = Arc::new(SettingsService::new(repo.clone()));

    let older = tokio::spawn({
        let service = service.clone();
        async move { service.refresh().await }
    });
    repo.wait_for_first_snapshot().await;
    repo.upsert(setting("true")).await.unwrap();
    let newer_started = Arc::new(tokio::sync::Notify::new());
    let newer = tokio::spawn({
        let service = service.clone();
        let newer_started = newer_started.clone();
        async move {
            newer_started.notify_one();
            service.refresh().await
        }
    });
    newer_started.notified().await;
    tokio::task::yield_now().await;

    assert_eq!(repo.get_all_call_count(), 1, "newer refresh must wait");

    repo.release_first_snapshot();
    older.await.unwrap().unwrap();
    newer.await.unwrap().unwrap();
    assert_eq!(repo.get_all_call_count(), 2);

    assert_eq!(
        service.get_cached_sync(EMAIL_VERIFICATION_REQUIRED_KEY),
        Some("true".to_string())
    );
}

#[tokio::test]
async fn committed_delta_updates_loaded_cache_without_a_storage_reread() {
    let repo = Arc::new(ControlledSettingsRepository::new("false"));
    let service = Arc::new(SettingsService::new(repo.clone()));
    let initial_read = tokio::spawn({
        let service = service.clone();
        async move { service.get(EMAIL_VERIFICATION_REQUIRED_KEY).await }
    });
    repo.wait_for_first_snapshot().await;
    repo.release_first_snapshot();
    assert_eq!(
        initial_read.await.unwrap().unwrap(),
        Some("false".to_string())
    );
    assert_eq!(repo.get_all_call_count(), 1);

    let committed = repo.upsert(setting("true")).await.unwrap();
    let revision = repo.get_revision().await.unwrap();
    service.publish_committed(&[committed], revision).await;

    assert_eq!(
        service.get(EMAIL_VERIFICATION_REQUIRED_KEY).await.unwrap(),
        Some("true".to_string())
    );
    assert_eq!(repo.get_all_call_count(), 1);
}

#[tokio::test]
async fn out_of_order_committed_deltas_invalidate_instead_of_publishing_partial_state() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    repo.upsert(setting("false")).await.unwrap();
    let service = SettingsService::new(repo.clone());
    service.refresh().await.unwrap();

    let first = repo.upsert(setting("true")).await.unwrap();
    let first_revision = repo.get_revision().await.unwrap();
    let second = repo.upsert(setting("false")).await.unwrap();
    let second_revision = repo.get_revision().await.unwrap();

    service.publish_committed(&[second], second_revision).await;
    assert_eq!(
        service.get_cached_sync(EMAIL_VERIFICATION_REQUIRED_KEY),
        None
    );
    service.publish_committed(&[first], first_revision).await;

    assert_eq!(
        service.get(EMAIL_VERIFICATION_REQUIRED_KEY).await.unwrap(),
        Some("false".to_string()),
        "the next read must refresh a complete latest-revision snapshot"
    );
}

#[tokio::test]
async fn test_get_all_cached() {
    let repo = Arc::new(InMemorySystemSettingsRepository::with_defaults());
    let service = SettingsService::new(repo);
    let all = service.get_all_cached().await.unwrap();
    assert_eq!(all.get("rate_limit_window"), Some(&"60".to_string()));
    assert!(all.contains_key("server_log_level"));
}

#[tokio::test]
async fn test_set_secret_roundtrip() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    let encryption = EncryptionService::from_secret("this-is-a-32-byte-secret-for-tests");
    let service = SettingsService::with_encryption(repo, encryption);
    service
        .set_secret("api_secret", "secret-value", "test", None)
        .await
        .unwrap();
    assert_eq!(
        service.get_secret("api_secret").await.unwrap(),
        Some("secret-value".to_string())
    );
}

#[tokio::test]
async fn test_get_secret_encrypted_decrypt_failure_errors() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    repo.upsert(SystemSetting::new_secret(
        "enc_secret".to_string(),
        "not-valid-ciphertext".to_string(),
        "test".to_string(),
        "v1",
    ))
    .await
    .unwrap();
    let encryption = EncryptionService::from_secret("this-is-a-32-byte-secret-for-tests");
    let service = SettingsService::with_encryption(repo, encryption);
    assert!(service.get_secret("enc_secret").await.is_err());
}

#[tokio::test]
async fn demand_refresh_coalesces_cold_and_expired_waves() {
    let repo = Arc::new(ControlledSettingsRepository::new("false"));
    let service = Arc::new(SettingsService::new(repo.clone()));
    repo.release_first_snapshot();
    for wave in 1..=2 {
        // Hold publication so every task observes the same stale snapshot.
        let guard = service.refresh_lock.lock().await;
        let mut readers = tokio::task::JoinSet::new();
        for _ in 0..64 {
            let service = service.clone();
            readers.spawn(async move { service.get(EMAIL_VERIFICATION_REQUIRED_KEY).await });
        }
        tokio::task::yield_now().await;
        drop(guard);
        while let Some(result) = readers.join_next().await {
            assert_eq!(result.unwrap().unwrap(), Some("false".to_owned()));
        }
        assert_eq!(repo.get_all_call_count(), wave);
        service.get(EMAIL_VERIFICATION_REQUIRED_KEY).await.unwrap();
        assert_eq!(repo.get_all_call_count(), wave, "warm reads do no IO");
        *service.last_refresh.write().await = Some(Instant::now() - Duration::from_secs(61));
    }
}

#[tokio::test]
async fn failed_demand_refresh_remains_retryable() {
    let repo = Arc::new(ControlledSettingsRepository::new("false"));
    repo.release_first_snapshot();
    repo.fail_next_read();
    let service = SettingsService::new(repo.clone());
    assert!(service.get(EMAIL_VERIFICATION_REQUIRED_KEY).await.is_err());
    assert!(service.last_refresh.read().await.is_none());
    assert_eq!(
        service.get(EMAIL_VERIFICATION_REQUIRED_KEY).await.unwrap(),
        Some("false".into())
    );
    assert_eq!(repo.get_all_call_count(), 2);
}
