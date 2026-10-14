use super::*;

#[tokio::test]
async fn test_get_all_empty() {
    let repo = InMemorySystemSettingsRepository::new();
    let settings = repo.get_all().await.unwrap();
    assert!(settings.is_empty());
}

#[tokio::test]
async fn test_with_defaults() {
    let repo = InMemorySystemSettingsRepository::with_defaults();
    let settings = repo.get_all().await.unwrap();
    assert!(settings.len() >= 70);

    for key in [
        "auth_email_enabled",
        "auth_google_enabled",
        "auth_new_device_alert_enabled",
        "auth_webauthn_rp_id",
        "image_storage_enabled",
        "invite_codes_enabled",
        "subscription_selection_required",
    ] {
        assert!(settings.iter().any(|setting| setting.key == key));
    }

    let email_enabled = settings
        .iter()
        .find(|setting| setting.key == "auth_email_enabled")
        .unwrap();
    assert_eq!(email_enabled.value, "true");

    let metrics_key = settings
        .iter()
        .find(|setting| setting.key == "server_metrics_api_key")
        .unwrap();
    assert!(metrics_key.is_secret);

    let image_secret = settings
        .iter()
        .find(|setting| setting.key == "image_storage_secret_key")
        .unwrap();
    assert!(image_secret.is_secret);
}

#[tokio::test]
async fn every_default_has_a_valid_authoritative_specification() {
    use crate::settings_registry::{setting_spec, validate_setting_value, SettingsRuntime};

    let repo = InMemorySystemSettingsRepository::with_defaults();
    let settings = repo.get_all().await.unwrap();
    for setting in settings {
        let spec = setting_spec(&setting.key, SettingsRuntime::Standalone)
            .unwrap_or_else(|| panic!("missing setting specification for {}", setting.key));
        assert!(
            validate_setting_value(spec, &setting.value).is_ok(),
            "default value is invalid for {}",
            setting.key
        );
    }
}

#[tokio::test]
async fn test_upsert_and_get() {
    let repo = InMemorySystemSettingsRepository::new();

    let setting = SystemSetting::new(
        "test_key".to_string(),
        "test_value".to_string(),
        "test".to_string(),
    );

    repo.upsert(setting).await.unwrap();

    let found = repo.get_by_key("test_key").await.unwrap();
    assert!(found.is_some());
    assert_eq!(found.unwrap().value, "test_value");
}

#[tokio::test]
async fn test_upsert_updates_existing() {
    let repo = InMemorySystemSettingsRepository::new();

    let setting1 = SystemSetting::new("key".to_string(), "value1".to_string(), "test".to_string());
    repo.upsert(setting1).await.unwrap();

    let setting2 = SystemSetting::new("key".to_string(), "value2".to_string(), "test".to_string());
    repo.upsert(setting2).await.unwrap();

    let found = repo.get_by_key("key").await.unwrap().unwrap();
    assert_eq!(found.value, "value2");
}

#[tokio::test]
async fn test_get_by_category() {
    let repo = InMemorySystemSettingsRepository::with_defaults();

    let rate_limit = repo.get_by_category("rate_limit").await.unwrap();
    assert_eq!(rate_limit.len(), 3);
}

#[tokio::test]
async fn test_upsert_many() {
    let repo = InMemorySystemSettingsRepository::new();

    let settings = vec![
        SystemSetting::new("k1".to_string(), "v1".to_string(), "cat".to_string()),
        SystemSetting::new("k2".to_string(), "v2".to_string(), "cat".to_string()),
    ];

    let result = repo.upsert_many(settings).await.unwrap();
    assert_eq!(result.len(), 2);

    let all = repo.get_all().await.unwrap();
    assert_eq!(all.len(), 2);
}

#[tokio::test]
async fn test_revision_increments_for_batch_updates() {
    let repo = InMemorySystemSettingsRepository::new();
    let first_revision = repo.get_revision().await.unwrap();

    let (_, second_revision) = repo
        .upsert_many_with_revision(vec![SystemSetting::new(
            "k1".to_string(),
            "v1".to_string(),
            "cat".to_string(),
        )])
        .await
        .unwrap();

    assert_eq!(second_revision, first_revision + 1);
}

#[tokio::test]
async fn test_stale_revision_rejects_compare_and_set_update() {
    let repo = InMemorySystemSettingsRepository::new();
    let current_revision = repo.get_revision().await.unwrap();

    let result = repo
        .upsert_many_if_revision(
            vec![SystemSetting::new(
                "k1".to_string(),
                "v1".to_string(),
                "cat".to_string(),
            )],
            current_revision + 1,
        )
        .await;

    assert!(matches!(
        result,
        Err(SettingsRevisionUpdateError::Stale { current_revision: observed })
            if observed == current_revision
    ));
}

#[tokio::test]
async fn test_parse_helpers() {
    let setting = SystemSetting::new("test".to_string(), "42".to_string(), "test".to_string());

    assert_eq!(setting.as_u64(), Some(42));
    assert_eq!(setting.as_u32(), Some(42));
    assert_eq!(setting.as_u8(), Some(42));

    let bool_setting =
        SystemSetting::new("bool".to_string(), "true".to_string(), "test".to_string());
    assert_eq!(bool_setting.as_bool(), Some(true));
}
