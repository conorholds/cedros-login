use super::*;

#[tokio::test]
async fn test_postgres_autosave_idempotency_replays_completed_result() {
    let Some(storage) = create_test_storage().await else {
        return;
    };
    let pool = storage.pg_pool.as_ref().expect("postgres pool");
    let scope = AutosaveIdempotencyScope {
        tenant_id: "test-tenant".to_string(),
        user_id: Uuid::new_v4().to_string(),
        resource_type: "cedros.system_settings".to_string(),
        resource_id: "global".to_string(),
        operation: "autosave.patch".to_string(),
        key: Uuid::new_v4().to_string(),
    };
    let fingerprint = "settings-payload-fingerprint";

    let first = postgres_begin_idempotency::<String>(pool, &scope, fingerprint)
        .await
        .unwrap();
    assert_eq!(first, AutosaveIdempotencyDecision::Start);

    postgres_complete_idempotency(pool, &scope, fingerprint, &"saved".to_string())
        .await
        .unwrap();
    let replay = postgres_begin_idempotency::<String>(pool, &scope, fingerprint)
        .await
        .unwrap();
    assert_eq!(
        replay,
        AutosaveIdempotencyDecision::Replay("saved".to_string())
    );

    let different_payload = postgres_begin_idempotency::<String>(pool, &scope, "different")
        .await
        .unwrap_err();
    assert_eq!(different_payload.status(), StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn test_postgres_settings_autosave_atomic_replay_stale_and_fingerprint_mismatch() {
    let _guard = SETTINGS_AUTOSAVE_TEST_LOCK.lock().await;
    let Some(storage) = create_test_storage().await else {
        return;
    };
    let repo = storage.system_settings_repo;
    let revision = repo.get_revision().await.unwrap();
    let mut setting = repo
        .get_by_key("auth_email_require_verification")
        .await
        .unwrap()
        .unwrap();
    setting.value = if setting.value == "true" {
        "false"
    } else {
        "true"
    }
    .into();
    let scope = settings_autosave_scope();

    let committed = repo
        .commit_autosave(
            vec![setting.clone()],
            revision,
            &scope,
            "payload-a",
            &postgres_autosave_response,
        )
        .await
        .unwrap();
    let replay = repo
        .commit_autosave(
            vec![setting],
            revision,
            &scope,
            "payload-a",
            &postgres_autosave_response,
        )
        .await
        .unwrap();
    let committed = match committed {
        SettingsAutosaveDecision::Committed(commit) => commit,
        other => panic!("expected commit, got {other:?}"),
    };
    assert_eq!(
        replay,
        SettingsAutosaveDecision::Replay(committed.response.clone())
    );

    let mismatch = repo
        .commit_autosave(
            Vec::new(),
            revision,
            &scope,
            "payload-b",
            &postgres_autosave_response,
        )
        .await;
    assert!(matches!(
        mismatch,
        Err(SettingsAutosaveError::FingerprintMismatch)
    ));
    let stale = repo
        .commit_autosave(
            Vec::new(),
            revision,
            &settings_autosave_scope(),
            "stale",
            &postgres_autosave_response,
        )
        .await;
    assert!(matches!(
        stale,
        Err(SettingsAutosaveError::Stale { current_revision })
            if current_revision == committed.revision
    ));
}

#[tokio::test]
async fn test_postgres_concurrent_duplicate_settings_autosave_commits_once() {
    let _guard = SETTINGS_AUTOSAVE_TEST_LOCK.lock().await;
    let Some(storage) = create_test_storage().await else {
        return;
    };
    let repo = storage.system_settings_repo;
    let revision = repo.get_revision().await.unwrap();
    let mut setting = repo
        .get_by_key("auth_email_require_verification")
        .await
        .unwrap()
        .unwrap();
    setting.value = if setting.value == "true" {
        "false"
    } else {
        "true"
    }
    .into();
    let scope = settings_autosave_scope();
    let one = repo.commit_autosave(
        vec![setting.clone()],
        revision,
        &scope,
        "same",
        &postgres_autosave_response,
    );
    let two = repo.commit_autosave(
        vec![setting],
        revision,
        &scope,
        "same",
        &postgres_autosave_response,
    );
    let (one, two) = tokio::join!(one, two);
    let decisions = [one.unwrap(), two.unwrap()];

    assert_eq!(
        decisions
            .iter()
            .filter(|decision| matches!(decision, SettingsAutosaveDecision::Committed(_)))
            .count(),
        1
    );
    assert_eq!(
        decisions
            .iter()
            .filter(|decision| matches!(decision, SettingsAutosaveDecision::Replay(_)))
            .count(),
        1
    );
    assert_eq!(repo.get_revision().await.unwrap(), revision + 1);
}

#[tokio::test]
async fn test_postgres_autosave_completion_failure_rolls_back_settings_and_key() {
    let _guard = SETTINGS_AUTOSAVE_TEST_LOCK.lock().await;
    let Some(storage) = create_test_storage().await else {
        return;
    };
    let pool = storage.pg_pool.as_ref().unwrap();
    let repo = storage.system_settings_repo.clone();
    let revision = repo.get_revision().await.unwrap();
    let mut setting = repo
        .get_by_key("auth_email_require_verification")
        .await
        .unwrap()
        .unwrap();
    let original_value = setting.value.clone();
    setting.value = if setting.value == "true" {
        "false"
    } else {
        "true"
    }
    .into();
    let scope = settings_autosave_scope();
    install_completion_failure_trigger(pool, &scope.key).await;

    let failed = repo
        .commit_autosave(
            vec![setting.clone()],
            revision,
            &scope,
            "failure",
            &postgres_autosave_response,
        )
        .await;
    remove_completion_failure_trigger(pool, &scope.key).await;
    assert!(matches!(failed, Err(SettingsAutosaveError::App(_))));
    assert_eq!(repo.get_revision().await.unwrap(), revision);
    assert_eq!(
        repo.get_by_key(&setting.key).await.unwrap().unwrap().value,
        original_value
    );

    let retry = repo
        .commit_autosave(
            vec![setting],
            revision,
            &scope,
            "failure",
            &postgres_autosave_response,
        )
        .await
        .unwrap();
    assert!(matches!(retry, SettingsAutosaveDecision::Committed(_)));
}

fn settings_autosave_scope() -> AutosaveIdempotencyScope {
    AutosaveIdempotencyScope {
        tenant_id: "postgres-test".into(),
        user_id: Uuid::new_v4().to_string(),
        resource_type: "cedros.system_settings".into(),
        resource_id: "global".into(),
        operation: "autosave.patch".into(),
        key: Uuid::new_v4().to_string(),
    }
}

fn postgres_autosave_response(
    updated: &[cedros_login::repositories::SystemSetting],
    revision: u64,
) -> Result<serde_json::Value, AppError> {
    Ok(serde_json::json!({
        "updatedKeys": updated.iter().map(|setting| &setting.key).collect::<Vec<_>>(),
        "revision": revision,
    }))
}

async fn install_completion_failure_trigger(pool: &sqlx::PgPool, key: &str) {
    let suffix = key.replace('-', "");
    let function_sql = format!(
        r#"CREATE FUNCTION test_fail_autosave_{suffix}() RETURNS trigger AS $$
           BEGIN
             IF NEW.idempotency_key = '{key}' AND NEW.status = 'completed' THEN
               RAISE EXCEPTION 'injected autosave completion failure';
             END IF;
             RETURN NEW;
           END; $$ LANGUAGE plpgsql;"#
    );
    query(&function_sql).execute(pool).await.unwrap();
    let trigger_sql = format!(
        "CREATE TRIGGER test_fail_autosave_{suffix} \
         BEFORE UPDATE ON autosave_idempotency_keys \
         FOR EACH ROW EXECUTE FUNCTION test_fail_autosave_{suffix}()"
    );
    query(&trigger_sql).execute(pool).await.unwrap();
}

async fn remove_completion_failure_trigger(pool: &sqlx::PgPool, key: &str) {
    let suffix = key.replace('-', "");
    query(&format!(
        "DROP TRIGGER test_fail_autosave_{suffix} ON autosave_idempotency_keys"
    ))
    .execute(pool)
    .await
    .unwrap();
    query(&format!("DROP FUNCTION test_fail_autosave_{suffix}()"))
        .execute(pool)
        .await
        .unwrap();
}
