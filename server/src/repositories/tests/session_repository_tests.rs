//! Tests for session repository

use crate::repositories::{InMemorySessionRepository, SessionEntity, SessionRepository};
use chrono::{Duration, Utc};
use uuid::Uuid;

#[tokio::test]
async fn test_create_and_find_session() {
    let repo = InMemorySessionRepository::new();
    let user_id = Uuid::new_v4();
    let session = SessionEntity::new(
        user_id,
        "refresh_hash_123".to_string(),
        Utc::now() + Duration::days(30),
        Some("127.0.0.1".to_string()),
        Some("Mozilla/5.0".to_string()),
    );
    let session_id = session.id;

    repo.create(session).await.unwrap();

    let found = repo.find_by_id(session_id).await.unwrap();
    assert!(found.is_some());
    assert_eq!(found.unwrap().user_id, user_id);
}

#[tokio::test]
async fn test_find_by_refresh_token() {
    let repo = InMemorySessionRepository::new();
    let session = SessionEntity::new(
        Uuid::new_v4(),
        "unique_refresh_hash".to_string(),
        Utc::now() + Duration::days(30),
        None,
        None,
    );

    repo.create(session.clone()).await.unwrap();

    let found = repo
        .find_by_refresh_token("unique_refresh_hash")
        .await
        .unwrap();
    assert!(found.is_some());
    assert_eq!(found.unwrap().id, session.id);
}

#[tokio::test]
async fn test_revoke_session() {
    let repo = InMemorySessionRepository::new();
    let session = SessionEntity::new(
        Uuid::new_v4(),
        "hash".to_string(),
        Utc::now() + Duration::days(30),
        None,
        None,
    );
    let session_id = session.id;

    repo.create(session).await.unwrap();
    assert!(!repo.is_revoked(session_id).await.unwrap());

    repo.revoke(session_id).await.unwrap();
    assert!(repo.is_revoked(session_id).await.unwrap());
}

#[tokio::test]
async fn test_revoke_with_reason_sets_reason() {
    let repo = InMemorySessionRepository::new();
    let session = SessionEntity::new(
        Uuid::new_v4(),
        "hash".to_string(),
        Utc::now() + Duration::days(30),
        None,
        None,
    );
    let session_id = session.id;

    repo.create(session).await.unwrap();
    repo.revoke_with_reason(session_id, "logout").await.unwrap();

    let found = repo.find_by_id(session_id).await.unwrap().unwrap();
    assert_eq!(found.revoked_reason.as_deref(), Some("logout"));
}

#[tokio::test]
async fn test_session_validity() {
    let valid_session = SessionEntity::new(
        Uuid::new_v4(),
        "hash".to_string(),
        Utc::now() + Duration::days(30),
        None,
        None,
    );
    assert!(valid_session.is_valid());

    let expired_session = SessionEntity::new(
        Uuid::new_v4(),
        "hash".to_string(),
        Utc::now() - Duration::days(1),
        None,
        None,
    );
    assert!(!expired_session.is_valid());
}

#[tokio::test]
async fn test_find_active_by_user_id() {
    let repo = InMemorySessionRepository::new();
    let user_id = Uuid::new_v4();

    let active_session = SessionEntity::new(
        user_id,
        "active_hash".to_string(),
        Utc::now() + Duration::days(1),
        None,
        None,
    );
    let revoked_session = SessionEntity::new(
        user_id,
        "revoked_hash".to_string(),
        Utc::now() + Duration::days(1),
        None,
        None,
    );
    let expired_session = SessionEntity::new(
        user_id,
        "expired_hash".to_string(),
        Utc::now() - Duration::days(1),
        None,
        None,
    );

    let revoked_id = revoked_session.id;
    repo.create(active_session).await.unwrap();
    repo.create(revoked_session).await.unwrap();
    repo.create(expired_session).await.unwrap();
    repo.revoke(revoked_id).await.unwrap();

    let sessions = repo.find_active_by_user_id(user_id).await.unwrap();
    assert_eq!(sessions.len(), 1);
    assert!(sessions[0].is_valid());
}

#[tokio::test]
async fn test_find_active_by_user_id_paged() {
    let repo = InMemorySessionRepository::new();
    let user_id = Uuid::new_v4();

    let mut session1 = SessionEntity::new(
        user_id,
        "hash1".to_string(),
        Utc::now() + Duration::days(1),
        None,
        None,
    );
    session1.created_at = Utc::now() - Duration::minutes(3);

    let mut session2 = SessionEntity::new(
        user_id,
        "hash2".to_string(),
        Utc::now() + Duration::days(1),
        None,
        None,
    );
    session2.created_at = Utc::now() - Duration::minutes(2);

    let mut session3 = SessionEntity::new(
        user_id,
        "hash3".to_string(),
        Utc::now() + Duration::days(1),
        None,
        None,
    );
    session3.created_at = Utc::now() - Duration::minutes(1);

    repo.create(session1.clone()).await.unwrap();
    repo.create(session2.clone()).await.unwrap();
    repo.create(session3.clone()).await.unwrap();

    let sessions = repo
        .find_active_by_user_id_paged(user_id, 2, 1)
        .await
        .unwrap();
    assert_eq!(sessions.len(), 2);
    assert_eq!(sessions[0].id, session2.id);
    assert_eq!(sessions[1].id, session1.id);
}

#[tokio::test]
async fn test_count_active_by_user_id() {
    let repo = InMemorySessionRepository::new();
    let user_id = Uuid::new_v4();

    let active_session = SessionEntity::new(
        user_id,
        "active".to_string(),
        Utc::now() + Duration::days(1),
        None,
        None,
    );
    let expired_session = SessionEntity::new(
        user_id,
        "expired".to_string(),
        Utc::now() - Duration::days(1),
        None,
        None,
    );

    repo.create(active_session).await.unwrap();
    repo.create(expired_session).await.unwrap();

    let count = repo.count_active_by_user_id(user_id).await.unwrap();
    assert_eq!(count, 1);
}

#[tokio::test]
async fn test_find_recent_by_user_id() {
    let repo = InMemorySessionRepository::new();
    let user_id = Uuid::new_v4();

    let mut session1 = SessionEntity::new(
        user_id,
        "hash1".to_string(),
        Utc::now() + Duration::days(1),
        None,
        None,
    );
    session1.created_at = Utc::now() - Duration::minutes(2);

    let mut session2 = SessionEntity::new(
        user_id,
        "hash2".to_string(),
        Utc::now() + Duration::days(1),
        None,
        None,
    );
    session2.created_at = Utc::now() - Duration::minutes(1);

    repo.create(session1.clone()).await.unwrap();
    repo.create(session2.clone()).await.unwrap();

    let sessions = repo.find_recent_by_user_id(user_id, 1).await.unwrap();
    assert_eq!(sessions.len(), 1);
    assert_eq!(sessions[0].id, session2.id);
}

#[tokio::test]
async fn test_revoke_all_except() {
    let repo = InMemorySessionRepository::new();
    let user_id = Uuid::new_v4();

    let keep = SessionEntity::new(
        user_id,
        "keep_hash".to_string(),
        Utc::now() + Duration::days(30),
        None,
        None,
    );
    let other = SessionEntity::new(
        user_id,
        "other_hash".to_string(),
        Utc::now() + Duration::days(30),
        None,
        None,
    );

    let keep_id = keep.id;
    let other_id = other.id;
    repo.create(keep).await.unwrap();
    repo.create(other).await.unwrap();

    let revoked = repo.revoke_all_except(user_id, keep_id).await.unwrap();
    assert_eq!(revoked, 1);
    assert!(!repo.is_revoked(keep_id).await.unwrap());
    assert!(repo.is_revoked(other_id).await.unwrap());
}

#[tokio::test]
async fn rotation_is_single_use_and_logout_revokes_successors_only() {
    let repo = InMemorySessionRepository::new();
    let user = Uuid::new_v4();
    let make = |hash: &str| {
        SessionEntity::new(
            user,
            hash.into(),
            Utc::now() + Duration::days(1),
            None,
            None,
        )
    };
    let source = repo.create(make("source")).await.unwrap();
    let other_device = repo.create(make("other-device")).await.unwrap();
    let first = make("first");
    let second = make("second");
    let (a, b) = tokio::join!(
        repo.rotate(&source, first.clone(), "rotated"),
        repo.rotate(&source, second.clone(), "rotated")
    );
    assert_ne!(a.unwrap(), b.unwrap());
    let winner = repo
        .find_active_by_user_id(user)
        .await
        .unwrap()
        .into_iter()
        .find(|s| s.id != other_device.id)
        .unwrap();
    assert_eq!(winner.family_id, source.family_id);
    assert_eq!(winner.expires_at, source.expires_at);
    repo.revoke_with_reason(source.id, "logout").await.unwrap();
    assert!(!repo
        .find_by_id(winner.id)
        .await
        .unwrap()
        .unwrap()
        .is_valid());
    assert!(repo
        .find_by_id(other_device.id)
        .await
        .unwrap()
        .unwrap()
        .is_valid());
    assert!(!repo
        .rotate(&winner, make("after-logout"), "rotated")
        .await
        .unwrap());
}

#[tokio::test]
async fn rotation_racing_revoke_all_cannot_escape() {
    let repo = InMemorySessionRepository::new();
    let user = Uuid::new_v4();
    let make = |hash: &str| {
        SessionEntity::new(
            user,
            hash.into(),
            Utc::now() + Duration::days(1),
            None,
            None,
        )
    };
    for index in 0..20 {
        let source = repo.create(make(&format!("source-{index}"))).await.unwrap();
        let replacement = make(&format!("replacement-{index}"));
        let (rotate, revoke) = tokio::join!(
            repo.rotate(&source, replacement, "rotated"),
            repo.revoke_all_for_user(user)
        );
        rotate.unwrap();
        revoke.unwrap();
        assert_eq!(repo.count_active_by_user_id(user).await.unwrap(), 0);
    }
}

#[tokio::test]
async fn rotation_rejects_expired_revoked_and_wrong_owner_sources() {
    let repo = InMemorySessionRepository::new();
    let user = Uuid::new_v4();
    let make = |hash: &str| {
        SessionEntity::new(
            user,
            hash.into(),
            Utc::now() + Duration::days(1),
            None,
            None,
        )
    };
    let mut expired = make("expired-source");
    expired.expires_at = Utc::now() - Duration::seconds(1);
    repo.create(expired.clone()).await.unwrap();
    assert!(!repo
        .rotate(&expired, make("expired-replacement"), "rotated")
        .await
        .unwrap());
    let source = repo.create(make("live-source")).await.unwrap();
    let mut wrong = make("wrong-owner");
    wrong.user_id = Uuid::new_v4();
    assert!(repo.rotate(&source, wrong, "rotated").await.is_err());
    assert!(repo
        .find_by_id(source.id)
        .await
        .unwrap()
        .unwrap()
        .is_valid());
    repo.revoke_all_for_user(user).await.unwrap();
    assert!(!repo
        .rotate(&source, make("revoked-replacement"), "rotated")
        .await
        .unwrap());
}

#[test]
fn future_strong_auth_does_not_satisfy_step_up() {
    let mut session = SessionEntity::new(
        Uuid::new_v4(),
        "hash".into(),
        Utc::now() + Duration::days(1),
        None,
        None,
    );
    session.last_strong_auth_at = Some(Utc::now() + Duration::hours(1));
    assert!(!session.has_recent_strong_auth(300));
}

#[tokio::test]
async fn revoke_others_preserves_the_rotated_current_family() {
    let repo = InMemorySessionRepository::new();
    let user = Uuid::new_v4();
    let make = |hash: &str| {
        SessionEntity::new(
            user,
            hash.into(),
            Utc::now() + Duration::days(1),
            None,
            None,
        )
    };
    let source = repo.create(make("source")).await.unwrap();
    let replacement = make("replacement");
    let replacement_id = replacement.id;
    repo.rotate(&source, replacement, "rotated").await.unwrap();
    let other = repo.create(make("other")).await.unwrap();
    assert_eq!(repo.revoke_all_except(user, source.id).await.unwrap(), 1);
    assert!(!repo.is_revoked(replacement_id).await.unwrap());
    assert!(repo.is_revoked(other.id).await.unwrap());
}
