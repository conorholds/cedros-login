use std::sync::Arc;

use chrono::{Duration, Utc};
use uuid::Uuid;

use super::*;
use crate::domain::hash_recovery_code;
use crate::repositories::{
    InMemorySessionRepository, InMemoryTotpRepository, InMemoryVerificationRepository,
    SessionEntity, SessionRepository, TotpRepository, VerificationRepository,
};

struct Fixture {
    atomic: Arc<InMemoryAtomicMfaRepository>,
    verification: InMemoryVerificationRepository,
    totp: InMemoryTotpRepository,
    sessions: InMemorySessionRepository,
    user_id: Uuid,
    token_hash: String,
    enrollment_id: Uuid,
}

impl Fixture {
    async fn new() -> Self {
        let verification = InMemoryVerificationRepository::new();
        let totp = InMemoryTotpRepository::new();
        let sessions = InMemorySessionRepository::new();
        let user_id = Uuid::new_v4();
        let token_hash = format!("mfa-{}", Uuid::new_v4());
        verification
            .create(
                user_id,
                &token_hash,
                TokenType::MfaPending,
                Utc::now() + Duration::minutes(5),
            )
            .await
            .unwrap();
        let enrollment_id = totp.upsert_secret(user_id, "test-secret").await.unwrap().id;
        totp.enable_mfa(user_id).await.unwrap();
        let atomic = Arc::new(InMemoryAtomicMfaRepository::new(
            verification.clone(),
            totp.clone(),
            sessions.clone(),
        ));
        Self {
            atomic,
            verification,
            totp,
            sessions,
            user_id,
            token_hash,
            enrollment_id,
        }
    }

    fn session(&self, suffix: &str) -> SessionEntity {
        let mut session = SessionEntity::new(
            self.user_id,
            format!("refresh-{suffix}"),
            Utc::now() + Duration::hours(1),
            None,
            None,
        );
        session.last_strong_auth_at = Some(Utc::now());
        session
    }

    async fn recovery_ids(&self, codes: &[&str]) -> Vec<Uuid> {
        self.totp
            .store_recovery_codes(
                self.user_id,
                codes
                    .iter()
                    .map(|code| hash_recovery_code(code).unwrap())
                    .collect(),
            )
            .await
            .unwrap();
        self.totp
            .get_recovery_codes(self.user_id)
            .await
            .unwrap()
            .into_iter()
            .map(|code| code.id)
            .collect()
    }
}

#[tokio::test]
async fn concurrent_distinct_recovery_codes_create_one_session_without_burning_loser() {
    let fixture = Fixture::new().await;
    let ids = fixture.recovery_ids(&["AAAA-1111", "BBBB-2222"]).await;
    let first = fixture.atomic.claim_with_session(
        &fixture.token_hash,
        fixture.user_id,
        MfaFactorClaim::RecoveryCode(ids[0]),
        fixture.session("first"),
    );
    let second = fixture.atomic.claim_with_session(
        &fixture.token_hash,
        fixture.user_id,
        MfaFactorClaim::RecoveryCode(ids[1]),
        fixture.session("second"),
    );
    let (first, second) = tokio::join!(first, second);
    let outcomes = [first.unwrap(), second.unwrap()];
    assert_eq!(
        outcomes
            .iter()
            .filter(|outcome| **outcome == MfaFactorClaimOutcome::Claimed)
            .count(),
        1
    );
    assert_eq!(
        fixture
            .totp
            .get_recovery_codes(fixture.user_id)
            .await
            .unwrap()
            .len(),
        1
    );
    assert_eq!(
        fixture
            .sessions
            .find_by_user_id(fixture.user_id)
            .await
            .unwrap()
            .len(),
        1
    );
}

#[tokio::test]
async fn concurrent_same_totp_step_and_challenge_have_one_winner() {
    let fixture = Fixture::new().await;
    let first = fixture.atomic.claim_with_session(
        &fixture.token_hash,
        fixture.user_id,
        MfaFactorClaim::TotpTimeStep {
            enrollment_id: fixture.enrollment_id,
            time_step: 42,
        },
        fixture.session("first"),
    );
    let second = fixture.atomic.claim_with_session(
        &fixture.token_hash,
        fixture.user_id,
        MfaFactorClaim::TotpTimeStep {
            enrollment_id: fixture.enrollment_id,
            time_step: 42,
        },
        fixture.session("second"),
    );
    let (first, second) = tokio::join!(first, second);
    let outcomes = [first.unwrap(), second.unwrap()];
    assert_eq!(
        outcomes
            .iter()
            .filter(|outcome| **outcome == MfaFactorClaimOutcome::Claimed)
            .count(),
        1
    );
    assert_eq!(
        fixture
            .sessions
            .find_by_user_id(fixture.user_id)
            .await
            .unwrap()
            .len(),
        1
    );
}

#[tokio::test]
async fn unavailable_factor_preserves_challenge_for_valid_retry() {
    let fixture = Fixture::new().await;
    let ids = fixture.recovery_ids(&["AAAA-1111"]).await;
    let unavailable = fixture
        .atomic
        .claim_with_session(
            &fixture.token_hash,
            fixture.user_id,
            MfaFactorClaim::RecoveryCode(Uuid::new_v4()),
            fixture.session("unavailable"),
        )
        .await
        .unwrap();
    assert_eq!(unavailable, MfaFactorClaimOutcome::FactorUnavailable);
    assert!(fixture
        .verification
        .find_valid(&fixture.token_hash, &[TokenType::MfaPending])
        .await
        .unwrap()
        .is_some());

    let claimed = fixture
        .atomic
        .claim_with_session(
            &fixture.token_hash,
            fixture.user_id,
            MfaFactorClaim::RecoveryCode(ids[0]),
            fixture.session("retry"),
        )
        .await
        .unwrap();
    assert_eq!(claimed, MfaFactorClaimOutcome::Claimed);
}

#[tokio::test]
async fn session_insert_failure_does_not_burn_challenge_or_factor() {
    let fixture = Fixture::new().await;
    let ids = fixture.recovery_ids(&["AAAA-1111"]).await;
    let collision = fixture.session("collision");
    fixture.sessions.create(collision.clone()).await.unwrap();
    let mut duplicate = fixture.session("collision");
    duplicate.id = Uuid::new_v4();

    assert!(fixture
        .atomic
        .claim_with_session(
            &fixture.token_hash,
            fixture.user_id,
            MfaFactorClaim::RecoveryCode(ids[0]),
            duplicate,
        )
        .await
        .is_err());
    assert!(fixture
        .verification
        .find_valid(&fixture.token_hash, &[TokenType::MfaPending])
        .await
        .unwrap()
        .is_some());
    assert_eq!(
        fixture
            .totp
            .get_recovery_codes(fixture.user_id)
            .await
            .unwrap()
            .len(),
        1
    );
}

#[tokio::test]
async fn totp_proof_from_replaced_enrollment_cannot_create_a_session() {
    let fixture = Fixture::new().await;
    fixture.totp.disable_mfa(fixture.user_id).await.unwrap();
    fixture
        .totp
        .setup_factor(fixture.user_id, "replacement", vec![])
        .await
        .unwrap();
    let current = fixture
        .totp
        .find_by_user(fixture.user_id)
        .await
        .unwrap()
        .unwrap();
    assert!(fixture
        .totp
        .enable_enrollment(fixture.user_id, current.id, 40)
        .await
        .unwrap());
    let outcome = fixture
        .atomic
        .claim_with_session(
            &fixture.token_hash,
            fixture.user_id,
            MfaFactorClaim::TotpTimeStep {
                enrollment_id: fixture.enrollment_id,
                time_step: 42,
            },
            fixture.session("stale"),
        )
        .await
        .unwrap();
    assert_eq!(outcome, MfaFactorClaimOutcome::FactorUnavailable);
}
