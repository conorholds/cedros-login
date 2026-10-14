use std::sync::Arc;

use async_trait::async_trait;

use super::*;
use crate::repositories::{
    CredentialEntity, InMemoryCredentialRepository, InMemorySystemSettingsRepository,
    InMemoryTotpRepository, SystemSetting, SystemSettingsRepository,
};

#[tokio::test]
async fn returns_username_prompt_when_enabled_and_missing() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    upsert(&repo, "postlogin_username_enabled", "true", "postlogin").await;
    let settings = SettingsService::with_ttl(repo, 0);
    let totp_repo = InMemoryTotpRepository::new();
    let credential_repo = InMemoryCredentialRepository::new();
    let user = user_with_name();

    let action = compute_post_login(&user, &settings, &totp_repo, &credential_repo)
        .await
        .expect("post-login computation")
        .expect("post-login action");

    assert_eq!(action.action, "choose_username");
    assert_eq!(action.redirect_url, None);
}

#[tokio::test]
async fn authenticated_post_login_prioritizes_required_mfa_over_subscription() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    upsert(&repo, "security_require_mfa", "true", "security").await;
    upsert(
        &repo,
        "subscription_selection_required",
        "true",
        "postlogin.subscription",
    )
    .await;
    upsert(
        &repo,
        "postlogin_username_enabled",
        "true",
        "postlogin.username",
    )
    .await;
    let settings = Arc::new(SettingsService::with_ttl(repo, 0));
    let subscription_selection = SubscriptionSelectionService::new(settings.clone());
    let totp_repo = InMemoryTotpRepository::new();
    let credential_repo = InMemoryCredentialRepository::new();
    let user = user_with_name();
    credential_repo
        .create(CredentialEntity::new(
            user.id,
            CredentialType::Password,
            Some("Password".to_string()),
        ))
        .await
        .expect("password credential insert");

    let action = authenticated_action(
        &user,
        &settings,
        &totp_repo,
        &credential_repo,
        &subscription_selection,
    )
    .await
    .expect("post-login action");

    assert_eq!(action.action, "setup_mfa");
    assert_eq!(action.redirect_url, None);
}

#[tokio::test]
async fn authenticated_post_login_returns_subscription_by_default() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    upsert(&repo, "security_require_mfa", "true", "security").await;
    upsert(
        &repo,
        "subscription_selection_required",
        "true",
        "postlogin.subscription",
    )
    .await;
    upsert(
        &repo,
        "postlogin_username_enabled",
        "true",
        "postlogin.username",
    )
    .await;
    let settings = Arc::new(SettingsService::with_ttl(repo, 0));
    let subscription_selection = SubscriptionSelectionService::new(settings.clone());
    let totp_repo = InMemoryTotpRepository::new();
    let credential_repo = InMemoryCredentialRepository::new();
    let user = user_with_name();

    let action = authenticated_action(
        &user,
        &settings,
        &totp_repo,
        &credential_repo,
        &subscription_selection,
    )
    .await
    .expect("post-login action");

    assert_eq!(action.action, "choose_subscription");
    assert_eq!(action.redirect_url.as_deref(), Some("/subscribe"));
}

#[tokio::test]
async fn authenticated_post_login_prioritizes_subscription_over_custom_flow_order() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    upsert(
        &repo,
        "postlogin_flow_order",
        "username,subscription,welcome,profile",
        "postlogin",
    )
    .await;
    upsert(
        &repo,
        "postlogin_username_enabled",
        "true",
        "postlogin.username",
    )
    .await;
    upsert(
        &repo,
        "subscription_selection_required",
        "true",
        "postlogin.subscription",
    )
    .await;
    let settings = Arc::new(SettingsService::with_ttl(repo, 0));
    let subscription_selection = SubscriptionSelectionService::new(settings.clone());
    let totp_repo = InMemoryTotpRepository::new();
    let credential_repo = InMemoryCredentialRepository::new();
    let user = user_with_name();

    let action = authenticated_action(
        &user,
        &settings,
        &totp_repo,
        &credential_repo,
        &subscription_selection,
    )
    .await
    .expect("post-login action");

    assert_eq!(action.action, "choose_subscription");
    assert_eq!(action.redirect_url.as_deref(), Some("/subscribe"));
}

#[tokio::test]
async fn authenticated_post_login_respects_custom_flow_order_without_subscription_gate() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    upsert(
        &repo,
        "postlogin_flow_order",
        "profile,welcome,subscription,username",
        "postlogin",
    )
    .await;
    upsert(
        &repo,
        "postlogin_username_enabled",
        "true",
        "postlogin.username",
    )
    .await;
    upsert(
        &repo,
        "postlogin_complete_enabled",
        "true",
        "postlogin.profile",
    )
    .await;
    let settings = Arc::new(SettingsService::with_ttl(repo, 0));
    let subscription_selection = SubscriptionSelectionService::new(settings.clone());
    let totp_repo = InMemoryTotpRepository::new();
    let credential_repo = InMemoryCredentialRepository::new();
    let user = user_without_name();

    let action = authenticated_action(
        &user,
        &settings,
        &totp_repo,
        &credential_repo,
        &subscription_selection,
    )
    .await
    .expect("post-login action");

    assert_eq!(action.action, "complete_profile");
    assert_eq!(action.redirect_url, None);
}

#[tokio::test]
async fn authenticated_post_login_rejects_invalid_flow_order() {
    let repo = Arc::new(InMemorySystemSettingsRepository::new());
    upsert(
        &repo,
        "postlogin_flow_order",
        "username,username,welcome,profile",
        "postlogin",
    )
    .await;
    let settings = Arc::new(SettingsService::with_ttl(repo, 0));
    let subscription_selection = SubscriptionSelectionService::new(settings.clone());
    let totp_repo = InMemoryTotpRepository::new();
    let credential_repo = InMemoryCredentialRepository::new();
    let user = user_with_name();

    let result = compute_authenticated_post_login(
        &user,
        "access-token",
        &settings,
        &totp_repo,
        &credential_repo,
        &subscription_selection,
    )
    .await;

    assert!(
        matches!(result, Err(AppError::Config(message)) if message.contains("Duplicate postlogin_flow_order step"))
    );
}

#[tokio::test]
async fn propagates_settings_read_failures() {
    let settings = SettingsService::with_ttl(Arc::new(FailingSettingsRepository), 0);
    let totp_repo = InMemoryTotpRepository::new();
    let credential_repo = InMemoryCredentialRepository::new();
    let user = user_with_name();

    let result = compute_post_login(&user, &settings, &totp_repo, &credential_repo).await;

    assert!(matches!(
        result,
        Err(AppError::Database(message)) if message == "settings unavailable"
    ));
}

async fn authenticated_action(
    user: &UserEntity,
    settings: &Arc<SettingsService>,
    totp_repo: &InMemoryTotpRepository,
    credential_repo: &InMemoryCredentialRepository,
    subscription_selection: &SubscriptionSelectionService,
) -> Option<PostLoginAction> {
    compute_authenticated_post_login(
        user,
        "access-token",
        settings,
        totp_repo,
        credential_repo,
        subscription_selection,
    )
    .await
    .expect("post-login computation")
}

async fn upsert(
    repo: &Arc<InMemorySystemSettingsRepository>,
    key: &str,
    value: &str,
    category: &str,
) {
    repo.upsert(SystemSetting::new(
        key.to_string(),
        value.to_string(),
        category.to_string(),
    ))
    .await
    .expect("setting insert");
}

fn user_with_name() -> UserEntity {
    UserEntity::new_email_user(
        "user@example.com".to_string(),
        "password-hash".to_string(),
        Some("User".to_string()),
    )
}

fn user_without_name() -> UserEntity {
    UserEntity::new_email_user(
        "user@example.com".to_string(),
        "password-hash".to_string(),
        None,
    )
}

struct FailingSettingsRepository;

#[async_trait]
impl SystemSettingsRepository for FailingSettingsRepository {
    async fn get_all(&self) -> Result<Vec<SystemSetting>, AppError> {
        Err(AppError::Database("settings unavailable".to_string()))
    }

    async fn get_by_key(&self, _key: &str) -> Result<Option<SystemSetting>, AppError> {
        Err(AppError::Database("settings unavailable".to_string()))
    }

    async fn get_by_category(&self, _category: &str) -> Result<Vec<SystemSetting>, AppError> {
        Err(AppError::Database("settings unavailable".to_string()))
    }

    async fn upsert(&self, _setting: SystemSetting) -> Result<SystemSetting, AppError> {
        Err(AppError::Database("settings unavailable".to_string()))
    }

    async fn upsert_many(
        &self,
        _settings: Vec<SystemSetting>,
    ) -> Result<Vec<SystemSetting>, AppError> {
        Err(AppError::Database("settings unavailable".to_string()))
    }
}
