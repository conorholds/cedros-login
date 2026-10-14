use crate::api_support::*;
use async_trait::async_trait;
use cedros_login::autosave::AutosaveIdempotencyScope;
use cedros_login::errors::AppError;
use cedros_login::repositories::{
    InMemorySystemSettingsRepository, SessionEntity, SettingsAutosaveDecision,
    SettingsAutosaveError, SettingsAutosaveResponseBuilder, SettingsRevisionUpdateError,
    SystemSettingsRepository, UserEntity,
};
use cedros_login::services::{JwtService, TokenContext};
use std::sync::atomic::{AtomicBool, Ordering};

const SETTING_KEY: &str = "auth_email_require_verification";

struct PostCommitReadFailureRepository {
    inner: InMemorySystemSettingsRepository,
    fail_next_get_all: AtomicBool,
    fail_next_autosave_completion: AtomicBool,
}

impl PostCommitReadFailureRepository {
    fn new() -> Self {
        Self {
            inner: InMemorySystemSettingsRepository::with_defaults(),
            fail_next_get_all: AtomicBool::new(false),
            fail_next_autosave_completion: AtomicBool::new(false),
        }
    }

    fn fail_post_commit_refresh(&self) {
        self.fail_next_get_all.store(true, Ordering::SeqCst);
    }

    fn clear_read_failure(&self) {
        self.fail_next_get_all.store(false, Ordering::SeqCst);
    }

    fn fail_autosave_completion(&self) {
        self.fail_next_autosave_completion
            .store(true, Ordering::SeqCst);
    }
}

#[async_trait]
impl SystemSettingsRepository for PostCommitReadFailureRepository {
    async fn get_all(&self) -> Result<Vec<SystemSetting>, AppError> {
        if self.fail_next_get_all.swap(false, Ordering::SeqCst) {
            return Err(AppError::Internal(anyhow::anyhow!(
                "injected post-commit settings read failure"
            )));
        }
        self.inner.get_all().await
    }

    async fn get_by_key(&self, key: &str) -> Result<Option<SystemSetting>, AppError> {
        self.inner.get_by_key(key).await
    }

    async fn get_by_category(&self, category: &str) -> Result<Vec<SystemSetting>, AppError> {
        self.inner.get_by_category(category).await
    }

    async fn upsert(&self, setting: SystemSetting) -> Result<SystemSetting, AppError> {
        self.inner.upsert(setting).await
    }

    async fn upsert_many(
        &self,
        settings: Vec<SystemSetting>,
    ) -> Result<Vec<SystemSetting>, AppError> {
        self.inner.upsert_many(settings).await
    }

    async fn get_revision(&self) -> Result<u64, AppError> {
        self.inner.get_revision().await
    }

    async fn upsert_many_with_revision(
        &self,
        settings: Vec<SystemSetting>,
    ) -> Result<(Vec<SystemSetting>, u64), AppError> {
        let committed = self.inner.upsert_many_with_revision(settings).await?;
        self.fail_post_commit_refresh();
        Ok(committed)
    }

    async fn upsert_many_if_revision(
        &self,
        settings: Vec<SystemSetting>,
        expected_revision: u64,
    ) -> Result<(Vec<SystemSetting>, u64), SettingsRevisionUpdateError> {
        let committed = self
            .inner
            .upsert_many_if_revision(settings, expected_revision)
            .await?;
        self.fail_post_commit_refresh();
        Ok(committed)
    }

    async fn commit_autosave(
        &self,
        settings: Vec<SystemSetting>,
        expected_revision: u64,
        scope: &AutosaveIdempotencyScope,
        fingerprint: &str,
        response_builder: &dyn SettingsAutosaveResponseBuilder,
    ) -> Result<SettingsAutosaveDecision, SettingsAutosaveError> {
        if self
            .fail_next_autosave_completion
            .swap(false, Ordering::SeqCst)
        {
            return Err(SettingsAutosaveError::App(AppError::Internal(
                anyhow::anyhow!("injected idempotency-ledger completion failure"),
            )));
        }
        let committed = self
            .inner
            .commit_autosave(
                settings,
                expected_revision,
                scope,
                fingerprint,
                response_builder,
            )
            .await?;
        Ok(committed)
    }
}

async fn settings_app() -> (
    axum::Router,
    String,
    Arc<PostCommitReadFailureRepository>,
    u64,
) {
    let config = test_config();
    let repo = Arc::new(PostCommitReadFailureRepository::new());
    let mut storage = Storage::in_memory();
    storage.system_settings_repo = repo.clone();
    seed_default_org(&storage).await;

    let mut admin = UserEntity::new_email_user(
        "settings-commit-admin@example.com".to_string(),
        "unused-password-hash".to_string(),
        Some("Settings Commit Admin".to_string()),
    );
    admin.email_verified = true;
    admin.is_system_admin = true;
    let admin = storage.user_repo.create(admin).await.unwrap();

    let jwt_service = JwtService::new(&config.jwt);
    let session_id = uuid::Uuid::new_v4();
    let tokens = jwt_service
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
            cedros_login::utils::hash_refresh_token(&tokens.refresh_token, &config.jwt.secret),
            refresh_expiry,
            None,
            None,
        ))
        .await
        .unwrap();

    let revision = repo.get_revision().await.unwrap();
    let app = router_with_storage(config, Arc::new(NoopCallback), storage);
    (app, tokens.access_token, repo, revision)
}

#[tokio::test]
async fn settings_patch_reports_success_when_commit_succeeds_but_cache_refresh_fails() {
    let (app, admin_token, repo, _) = settings_app().await;
    let (status, body) = auth_request(
        app,
        Method::PATCH,
        "/admin/settings",
        &admin_token,
        Some(json!({
            "settings": [{"key": SETTING_KEY, "value": "false"}]
        })),
    )
    .await;

    repo.clear_read_failure();
    assert_eq!(
        status,
        StatusCode::OK,
        "committed write was ambiguous: {body}"
    );
    assert_eq!(body["updated"][0]["value"], "false");
    assert_eq!(
        repo.get_by_key(SETTING_KEY).await.unwrap().unwrap().value,
        "false",
        "the repository commit is the source of truth"
    );
}

#[tokio::test]
async fn autosave_commit_and_retry_are_unambiguous_and_idempotent() {
    let (app, admin_token, repo, revision) = settings_app().await;
    let idempotency_key = uuid::Uuid::new_v4().to_string();
    let mutation_id = uuid::Uuid::new_v4();
    let editing_session_id = uuid::Uuid::new_v4();
    let body = json!({
        "autosave": true,
        "clientMutationId": mutation_id,
        "editingSessionId": editing_session_id,
        "clientSeq": 1,
        "updateMask": [SETTING_KEY],
        "patch": [{"key": SETTING_KEY, "value": "false"}],
        "schemaVersion": "v1"
    });

    let first = autosave_request(
        app.clone(),
        &admin_token,
        revision,
        &idempotency_key,
        body.clone(),
    )
    .await;
    repo.clear_read_failure();
    let replay = autosave_request(app, &admin_token, revision, &idempotency_key, body).await;
    assert_eq!(
        (first.0, replay.0),
        (StatusCode::OK, StatusCode::OK),
        "committed autosave/retry were ambiguous: first={}, retry={}",
        first.1,
        replay.1,
    );
    assert_eq!(replay.1, first.1, "retry must replay the committed result");
    assert_eq!(
        repo.get_by_key(SETTING_KEY).await.unwrap().unwrap().value,
        "false"
    );
}

#[tokio::test]
async fn autosave_ledger_failure_commits_nothing_and_same_key_can_retry() {
    let (app, admin_token, repo, revision) = settings_app().await;
    let key = uuid::Uuid::new_v4().to_string();
    let body = autosave_body("false", 1);
    repo.fail_autosave_completion();

    let failed = autosave_request(app.clone(), &admin_token, revision, &key, body.clone()).await;
    assert_eq!(failed.0, StatusCode::INTERNAL_SERVER_ERROR, "{failed:?}");
    assert_eq!(repo.get_revision().await.unwrap(), revision);
    assert_eq!(
        repo.get_by_key(SETTING_KEY).await.unwrap().unwrap().value,
        "true"
    );

    let retry = autosave_request(app, &admin_token, revision, &key, body).await;
    assert_eq!(retry.0, StatusCode::OK, "{retry:?}");
    assert_eq!(retry.1["updated"][0]["value"], "false");
}

#[tokio::test]
async fn autosave_stale_revision_changes_neither_settings_nor_revision() {
    let (app, admin_token, repo, revision) = settings_app().await;
    let result = autosave_request(
        app,
        &admin_token,
        revision + 1,
        &uuid::Uuid::new_v4().to_string(),
        autosave_body("false", 1),
    )
    .await;

    assert_eq!(result.0, StatusCode::PRECONDITION_FAILED, "{result:?}");
    assert_eq!(repo.get_revision().await.unwrap(), revision);
    assert_eq!(
        repo.get_by_key(SETTING_KEY).await.unwrap().unwrap().value,
        "true"
    );
}

#[tokio::test]
async fn autosave_rejects_same_key_with_different_request_fingerprint() {
    let (app, admin_token, repo, revision) = settings_app().await;
    let key = uuid::Uuid::new_v4().to_string();
    let first = autosave_request(
        app.clone(),
        &admin_token,
        revision,
        &key,
        autosave_body("false", 1),
    )
    .await;
    assert_eq!(first.0, StatusCode::OK, "{first:?}");

    let mismatch =
        autosave_request(app, &admin_token, revision, &key, autosave_body("true", 2)).await;
    assert_eq!(mismatch.0, StatusCode::UNPROCESSABLE_ENTITY, "{mismatch:?}");
    assert_eq!(repo.get_revision().await.unwrap(), revision + 1);
    assert_eq!(
        repo.get_by_key(SETTING_KEY).await.unwrap().unwrap().value,
        "false"
    );
}

#[tokio::test]
async fn concurrent_duplicate_autosave_commits_once_and_replays_once() {
    let (app, admin_token, repo, revision) = settings_app().await;
    let key = uuid::Uuid::new_v4().to_string();
    let body = autosave_body("false", 1);
    let one = autosave_request(app.clone(), &admin_token, revision, &key, body.clone());
    let two = autosave_request(app, &admin_token, revision, &key, body);
    let (one, two) = tokio::join!(one, two);

    assert_eq!((one.0, two.0), (StatusCode::OK, StatusCode::OK));
    assert_eq!(one.1, two.1, "duplicate must replay exact response");
    assert_eq!(repo.get_revision().await.unwrap(), revision + 1);
}

#[tokio::test]
async fn settings_get_diagnoses_legacy_invalid_rows_and_redacts_secrets() {
    let (app, admin_token, repo, _) = settings_app().await;
    repo.upsert(SystemSetting::new(
        "security_cookie_same_site".to_string(),
        "legacy-invalid".to_string(),
        "security".to_string(),
    ))
    .await
    .unwrap();
    repo.upsert(SystemSetting::new_secret(
        "server_metrics_api_key".to_string(),
        "encrypted-at-rest-value".to_string(),
        "server".to_string(),
        "v1",
    ))
    .await
    .unwrap();

    let (status, body) =
        auth_request(app, Method::GET, "/admin/settings", &admin_token, None).await;
    assert_eq!(status, StatusCode::OK, "settings list failed: {body}");

    let cookie = body["settings"]["security"]
        .as_array()
        .unwrap()
        .iter()
        .find(|setting| setting["key"] == "security_cookie_same_site")
        .unwrap();
    assert_eq!(cookie["value"], "legacy-invalid");
    assert_eq!(cookie["applicationMode"], "restart");
    assert!(cookie["validationError"].as_str().is_some());

    let metrics = body["settings"]["server"]
        .as_array()
        .unwrap()
        .iter()
        .find(|setting| setting["key"] == "server_metrics_api_key")
        .unwrap();
    assert_eq!(metrics["value"], "");
    assert_eq!(metrics["isSecret"], true);
    assert_eq!(metrics["hasValue"], true);
}

#[tokio::test]
async fn settings_patch_rejects_unsupported_legacy_sender_controls() {
    let (app, admin_token, _, _) = settings_app().await;
    let (status, body) = auth_request(
        app,
        Method::PATCH,
        "/admin/settings",
        &admin_token,
        Some(json!({
            "settings": [{"key": "email_provider", "value": "postmark"}]
        })),
    )
    .await;

    assert_eq!(status, StatusCode::BAD_REQUEST, "unsupported write: {body}");
}

async fn autosave_request(
    app: axum::Router,
    token: &str,
    revision: u64,
    idempotency_key: &str,
    body: Value,
) -> (StatusCode, Value) {
    let request = Request::builder()
        .method(Method::PATCH)
        .uri(with_auth_base("/admin/settings/autosave"))
        .header(header::AUTHORIZATION, format!("Bearer {token}"))
        .header(header::CONTENT_TYPE, "application/json")
        .header("if-match", format!("\"cedros.system_settings:{revision}\""))
        .header("idempotency-key", idempotency_key)
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();
    let response = app.oneshot(request).await.unwrap();
    let status = response.status();
    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    (
        status,
        parse_response_json(&bytes, "/admin/settings/autosave"),
    )
}

fn autosave_body(value: &str, client_seq: u64) -> Value {
    json!({
        "autosave": true,
        "clientMutationId": uuid::Uuid::new_v4(),
        "editingSessionId": uuid::Uuid::new_v4(),
        "clientSeq": client_seq,
        "updateMask": [SETTING_KEY],
        "patch": [{"key": SETTING_KEY, "value": value}],
        "schemaVersion": "v1"
    })
}
