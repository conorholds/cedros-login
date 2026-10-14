use crate::api_support::*;
use async_trait::async_trait;
use cedros_login::errors::AppError;
use cedros_login::repositories::{
    default_expiry, hash_verification_token, AtomicMfaRepository, MfaFactorClaim,
    MfaFactorClaimOutcome, SessionEntity, TokenType, UserEmailEntity, UserEntity,
};
use cedros_login::services::{PasswordService, TotpService};
use chrono::{Duration, Utc};
use std::sync::atomic::{AtomicBool, Ordering};
use totp_rs::{Algorithm, Secret, TOTP};

const EMAIL: &str = "mfa-consumption@example.com";
const PASSWORD: &str = "SecurePassword1!";
const RECOVERY: &str = "ABCD-EFGH-IJKL-MNOP";

#[tokio::test]
async fn wrong_totp_then_correct_uses_same_pending_challenge() {
    let (app, _) = mfa_app().await;
    let token = login_pending_token(app.clone()).await;
    let code = current_totp_code(&mfa_secret(), EMAIL);

    let invalid = invalid_totp(&mfa_secret(), EMAIL);
    let (wrong_status, _) = complete_mfa(app.clone(), &token, &invalid).await;
    assert_eq!(wrong_status, StatusCode::BAD_REQUEST);
    let (correct_status, body) = complete_mfa(app, &token, &code).await;
    assert_eq!(
        correct_status,
        StatusCode::OK,
        "correct factor failed: {body}"
    );
}

#[tokio::test]
async fn wrong_recovery_then_correct_preserves_challenge_and_code_is_single_use() {
    let (app, _) = mfa_app().await;
    let token = login_pending_token(app.clone()).await;

    let (wrong_status, _) = complete_mfa(app.clone(), &token, "WRONG-CODE-0000-0000").await;
    assert_eq!(wrong_status, StatusCode::BAD_REQUEST);
    let (correct_status, body) = complete_mfa(app.clone(), &token, RECOVERY).await;
    assert_eq!(correct_status, StatusCode::OK, "recovery failed: {body}");
    let (reused_status, _) = complete_mfa(app, &token, RECOVERY).await;
    assert_eq!(reused_status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn concurrent_valid_mfa_submissions_issue_one_session() {
    let (app, storage) = mfa_app().await;
    let token = login_pending_token(app.clone()).await;
    let code = current_totp_code(&mfa_secret(), EMAIL);

    let first = complete_mfa(app.clone(), &token, &code);
    let second = complete_mfa(app, &token, &code);
    let ((first_status, _), (second_status, _)) = tokio::join!(first, second);
    let statuses = [first_status, second_status];
    assert_eq!(
        statuses
            .iter()
            .filter(|status| **status == StatusCode::OK)
            .count(),
        1
    );
    let user = storage
        .user_repo
        .find_by_email(EMAIL)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(
        storage
            .session_repo
            .find_by_user_id(user.id)
            .await
            .unwrap()
            .len(),
        1
    );
}

#[tokio::test]
async fn concurrent_distinct_recovery_codes_do_not_burn_losing_code() {
    let (app, storage) = mfa_app_with_recovery_codes(&[RECOVERY, "QRST-UVWX-YZ12-3456"]).await;
    let token = login_pending_token(app.clone()).await;
    let first = complete_mfa(app.clone(), &token, RECOVERY);
    let second = complete_mfa(app, &token, "QRST-UVWX-YZ12-3456");
    let ((first_status, _), (second_status, _)) = tokio::join!(first, second);

    assert_eq!(
        [first_status, second_status]
            .iter()
            .filter(|status| **status == StatusCode::OK)
            .count(),
        1
    );
    let user = storage
        .user_repo
        .find_by_email(EMAIL)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(
        storage
            .totp_repo
            .get_recovery_codes(user.id)
            .await
            .unwrap()
            .len(),
        1
    );
    assert_eq!(
        storage
            .session_repo
            .find_by_user_id(user.id)
            .await
            .unwrap()
            .len(),
        1
    );
}

#[tokio::test]
async fn repository_failure_preserves_challenge_and_factor_for_retry() {
    let storage = mfa_storage_with_recovery_codes(&[RECOVERY]).await;
    let inner = storage.atomic_mfa_repo.clone();
    let mut injected_storage = storage.clone();
    injected_storage.atomic_mfa_repo = Arc::new(FailOnceAtomicMfaRepository {
        inner,
        should_fail: AtomicBool::new(true),
    });
    let app = router_with_storage(test_config(), Arc::new(NoopCallback), injected_storage);
    let token = login_pending_token(app.clone()).await;

    let (failed_status, _) = complete_mfa(app.clone(), &token, RECOVERY).await;
    assert_eq!(failed_status, StatusCode::INTERNAL_SERVER_ERROR);
    let user = storage
        .user_repo
        .find_by_email(EMAIL)
        .await
        .unwrap()
        .unwrap();
    assert!(storage
        .verification_repo
        .find_valid(&hash_verification_token(&token), &[TokenType::MfaPending],)
        .await
        .unwrap()
        .is_some());
    assert_eq!(
        storage
            .totp_repo
            .get_recovery_codes(user.id)
            .await
            .unwrap()
            .len(),
        1
    );
    assert!(storage
        .session_repo
        .find_by_user_id(user.id)
        .await
        .unwrap()
        .is_empty());

    let (retry_status, body) = complete_mfa(app, &token, RECOVERY).await;
    assert_eq!(retry_status, StatusCode::OK, "retry failed: {body}");
}

#[tokio::test]
async fn wrong_factors_preserve_challenge_while_counting_toward_lockout() {
    let (app, storage) = mfa_app().await;
    let token = login_pending_token(app.clone()).await;
    for attempt in 1..=5 {
        let (status, _) = complete_mfa(app.clone(), &token, "WRONG-CODE-0000-0000").await;
        let expected = if attempt == 5 {
            StatusCode::TOO_MANY_REQUESTS
        } else {
            StatusCode::BAD_REQUEST
        };
        assert_eq!(status, expected);
    }
    let (locked_status, _) = complete_mfa(app, &token, RECOVERY).await;
    assert_eq!(locked_status, StatusCode::TOO_MANY_REQUESTS);
    let user = storage
        .user_repo
        .find_by_email(EMAIL)
        .await
        .unwrap()
        .unwrap();
    assert!(storage
        .verification_repo
        .find_valid(&hash_verification_token(&token), &[TokenType::MfaPending],)
        .await
        .unwrap()
        .is_some());
    assert_eq!(
        storage
            .totp_repo
            .get_recovery_codes(user.id)
            .await
            .unwrap()
            .len(),
        1
    );
}

#[tokio::test]
async fn wrong_endpoint_does_not_burn_password_reset_token() {
    let config = test_config();
    let storage = create_seeded_storage().await;
    let password_hash = PasswordService::default()
        .hash(PASSWORD.to_string())
        .await
        .unwrap();
    let user = storage
        .user_repo
        .create(verified_user("purpose-bound@example.com", password_hash))
        .await
        .unwrap();
    let email = storage
        .user_email_repo
        .create(UserEmailEntity::new(
            user.id,
            "purpose-bound@example.com".to_string(),
            true,
            true,
        ))
        .await
        .unwrap();
    let raw_token = "known-password-reset-token";
    storage
        .verification_repo
        .create_for_subject(
            user.id,
            email.id,
            &hash_verification_token(raw_token),
            TokenType::PasswordReset,
            default_expiry(TokenType::PasswordReset),
        )
        .await
        .unwrap();
    let app = router_with_storage(config, Arc::new(NoopCallback), storage);

    let (wrong_status, _) = json_request(
        app.clone(),
        Method::POST,
        "/instant-link/verify",
        Some(json!({ "token": raw_token })),
    )
    .await;
    assert_eq!(wrong_status, StatusCode::BAD_REQUEST);
    let (reset_status, body) = json_request(
        app,
        Method::POST,
        "/reset-password",
        Some(json!({
            "token": raw_token,
            "newPassword": "NewSecurePass2!"
        })),
    )
    .await;
    assert_eq!(reset_status, StatusCode::OK, "reset failed: {body}");
}

async fn mfa_app() -> (axum::Router, Storage) {
    mfa_app_with_recovery_codes(&[RECOVERY]).await
}

async fn mfa_app_with_recovery_codes(codes: &[&str]) -> (axum::Router, Storage) {
    let storage = mfa_storage_with_recovery_codes(codes).await;
    let app = router_with_storage(test_config(), Arc::new(NoopCallback), storage.clone());
    (app, storage)
}

async fn mfa_storage_with_recovery_codes(codes: &[&str]) -> Storage {
    let storage = create_seeded_storage().await;
    let password_hash = PasswordService::default()
        .hash(PASSWORD.to_string())
        .await
        .unwrap();
    let user = storage
        .user_repo
        .create(verified_user(EMAIL, password_hash))
        .await
        .unwrap();
    storage
        .totp_repo
        .upsert_secret(user.id, &mfa_secret())
        .await
        .unwrap();
    storage.totp_repo.enable_mfa(user.id).await.unwrap();
    storage
        .totp_repo
        .store_recovery_codes(
            user.id,
            codes
                .iter()
                .map(|code| TotpService::hash_recovery_code(code).unwrap())
                .collect(),
        )
        .await
        .unwrap();
    storage
}

struct FailOnceAtomicMfaRepository {
    inner: Arc<dyn AtomicMfaRepository>,
    should_fail: AtomicBool,
}

#[async_trait]
impl AtomicMfaRepository for FailOnceAtomicMfaRepository {
    async fn claim_with_session(
        &self,
        token_hash: &str,
        user_id: uuid::Uuid,
        factor: MfaFactorClaim,
        session: SessionEntity,
    ) -> Result<MfaFactorClaimOutcome, AppError> {
        if self.should_fail.swap(false, Ordering::SeqCst) {
            return Err(AppError::Internal(anyhow::anyhow!(
                "injected MFA claim failure"
            )));
        }
        self.inner
            .claim_with_session(token_hash, user_id, factor, session)
            .await
    }
}

fn verified_user(email: &str, password_hash: String) -> UserEntity {
    let mut user = UserEntity::new_email_user(email.to_string(), password_hash, None);
    user.email_verified = true;
    user
}

async fn login_pending_token(app: axum::Router) -> String {
    let (status, body) = json_request(
        app,
        Method::POST,
        "/login",
        Some(json!({ "email": EMAIL, "password": PASSWORD })),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "login failed: {body}");
    body["mfaToken"].as_str().unwrap().to_string()
}

async fn complete_mfa(app: axum::Router, token: &str, code: &str) -> (StatusCode, Value) {
    json_request(
        app,
        Method::POST,
        "/login/mfa",
        Some(json!({ "mfaToken": token, "code": code })),
    )
    .await
}

fn mfa_secret() -> String {
    Secret::Raw(b"cedros-mfa-test-secret-material".to_vec())
        .to_encoded()
        .to_string()
}

fn current_totp_code(secret: &str, email: &str) -> String {
    let bytes = Secret::Encoded(secret.to_string()).to_bytes().unwrap();
    TOTP::new(
        Algorithm::SHA1,
        6,
        1,
        30,
        bytes,
        Some("Cedros".to_string()),
        email.to_string(),
    )
    .unwrap()
    .generate_current()
    .unwrap()
}

fn invalid_totp(secret: &str, email: &str) -> String {
    let service = TotpService::new("Cedros");
    (0..1_000_000)
        .map(|candidate| format!("{candidate:06}"))
        .find(|candidate| {
            service
                .verify_with_replay_check(secret, candidate, email, None)
                .unwrap()
                .is_none()
        })
        .expect("at least one six-digit code must be invalid")
}

#[tokio::test]
async fn expired_expected_purpose_is_rejected_without_mutation() {
    let storage = Storage::in_memory();
    storage
        .verification_repo
        .create(
            uuid::Uuid::new_v4(),
            "expired",
            TokenType::PasswordReset,
            Utc::now() - Duration::seconds(1),
        )
        .await
        .unwrap();
    assert!(storage
        .verification_repo
        .consume_if_valid("expired", &[TokenType::PasswordReset])
        .await
        .unwrap()
        .is_none());
}

#[tokio::test]
async fn password_change_invalidates_pending_mfa_before_session_issuance() {
    let (app, storage) = mfa_app().await;
    let token = login_pending_token(app.clone()).await;
    let user = storage
        .user_repo
        .find_by_email(EMAIL)
        .await
        .unwrap()
        .unwrap();
    storage
        .credential_lifecycle_repo
        .change_password(
            user.id,
            user.password_hash.as_deref(),
            "replacement-password-hash",
            None,
        )
        .await
        .unwrap();
    let (status, _) = complete_mfa(app, &token, RECOVERY).await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(
        storage
            .session_repo
            .count_active_by_user_id(user.id)
            .await
            .unwrap(),
        0
    );
}
