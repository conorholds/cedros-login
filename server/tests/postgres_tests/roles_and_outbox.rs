use super::*;

#[tokio::test]
async fn test_postgres_custom_role_crud() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    let user = create_user(&storage).await;
    let org = create_org(&storage, user.id).await;

    let mut permissions = std::collections::HashSet::new();
    permissions.insert("member:read".to_string());
    let role = CustomRole::new(org.id, "Developer", permissions);

    let created = storage.custom_role_repo.create(role).await.unwrap();
    let found = storage
        .custom_role_repo
        .find_by_id(created.id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(found.name, "Developer");

    storage
        .custom_role_repo
        .set_default_role(org.id, created.id)
        .await
        .unwrap();
    let default_role = storage
        .custom_role_repo
        .get_default_role(org.id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(default_role.id, created.id);
    assert!(
        storage.custom_role_repo.update(created).await.is_err(),
        "stale snapshot must fail"
    );
    let mut current = default_role;
    current.name = "Updated developer".into();
    current.is_default = false;
    let updated = storage.custom_role_repo.update(current).await.unwrap();
    assert_eq!(updated.name, "Updated developer");
    assert!(
        updated.is_default,
        "only the default endpoint can change this flag"
    );
}

// ============================================================================
// Policy Repository Tests
// ============================================================================

#[tokio::test]
async fn test_postgres_policy_crud() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    let user = create_user(&storage).await;
    let org = create_org(&storage, user.id).await;

    let policy = AbacPolicy::new(org.id, "Test Policy", "member:remove", PolicyEffect::Allow)
        .with_conditions(PolicyConditions::new().with_resource(
            "owner_id",
            AttributeMatcher::Equals(serde_json::Value::String("123".to_string())),
        ))
        .with_priority(10);

    let created = storage.policy_repo.create(policy).await.unwrap();
    let found = storage.policy_repo.find_by_id(created.id).await.unwrap();
    assert!(found.is_some());

    let by_permission = storage
        .policy_repo
        .find_by_org_and_permission(org.id, "member:remove")
        .await
        .unwrap();
    assert_eq!(by_permission.len(), 1);
    assert_eq!(by_permission[0].priority, 10);
}

// ============================================================================
// Outbox Repository Tests
// ============================================================================

#[tokio::test]
async fn test_postgres_outbox_fetch_pending_claims() {
    let Some(storage) = create_test_storage().await else {
        eprintln!("Skipping test: TEST_DATABASE_URL not set");
        return;
    };

    let event = OutboxEvent::new(
        OutboxEventType::EmailVerification,
        serde_json::json!({"to": "test@example.com"}),
    );
    let created = storage.outbox_repo.create(event).await.unwrap();

    let first = storage.outbox_repo.fetch_pending(1_000, 300).await.unwrap();
    assert!(
        first.iter().any(|event| event.id == created.id),
        "the fetch must claim the event created by this test even when the shared test database contains other pending events"
    );

    // Second fetch should not return the same event because it is locked.
    let second = storage.outbox_repo.fetch_pending(1_000, 300).await.unwrap();
    assert!(second.iter().all(|event| event.id != created.id));
}

#[tokio::test]
async fn authorization_concurrent_owner_removal_preserves_one_owner() {
    use cedros_login::repositories::{MembershipEntity, OrgRole};
    let Some(storage) = create_test_storage().await else {
        return;
    };
    let first = create_user(&storage).await;
    let second = create_user(&storage).await;
    let org = create_org(&storage, first.id).await;
    let a = storage
        .membership_repo
        .create(MembershipEntity::new(first.id, org.id, OrgRole::Owner))
        .await
        .unwrap();
    let b = storage
        .membership_repo
        .create(MembershipEntity::new(second.id, org.id, OrgRole::Owner))
        .await
        .unwrap();
    let (left, right) = tokio::join!(
        storage
            .membership_repo
            .delete_if_not_last_owner(a.id, org.id, first.id),
        storage
            .membership_repo
            .delete_if_not_last_owner(b.id, org.id, second.id)
    );
    assert_ne!(left.unwrap(), right.unwrap());
    assert_eq!(
        storage.membership_repo.count_owners(org.id).await.unwrap(),
        1
    );
}

#[tokio::test]
async fn authorization_membership_mutation_rechecks_actor_target_and_org() {
    use cedros_login::repositories::{MembershipEntity, OrgRole};
    let Some(storage) = create_test_storage().await else {
        return;
    };
    let first = create_user(&storage).await;
    let second = create_user(&storage).await;
    let org = create_org(&storage, first.id).await;
    let actor = storage
        .membership_repo
        .create(MembershipEntity::new(first.id, org.id, OrgRole::Admin))
        .await
        .unwrap();
    let target = storage
        .membership_repo
        .create(MembershipEntity::new(second.id, org.id, OrgRole::Member))
        .await
        .unwrap();
    storage
        .membership_repo
        .update_role_if_not_last_owner(target.id, org.id, first.id, OrgRole::Admin)
        .await
        .unwrap()
        .unwrap();
    storage
        .membership_repo
        .update_role(actor.id, OrgRole::Member)
        .await
        .unwrap();
    assert!(storage
        .membership_repo
        .update_role_if_not_last_owner(target.id, org.id, first.id, OrgRole::Member)
        .await
        .is_err());
    assert!(storage
        .membership_repo
        .delete_if_not_last_owner(target.id, org.id, first.id)
        .await
        .is_err());
    assert!(storage
        .membership_repo
        .delete_if_not_last_owner(target.id, Uuid::new_v4(), second.id)
        .await
        .is_err());
    assert_eq!(
        storage
            .membership_repo
            .find_by_id(target.id)
            .await
            .unwrap()
            .unwrap()
            .role,
        OrgRole::Admin
    );
}
