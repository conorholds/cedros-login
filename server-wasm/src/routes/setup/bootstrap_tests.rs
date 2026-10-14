use super::*;

const NOW: &str = "2026-07-10T12:00:00Z";

#[test]
fn new_setup_persists_org_and_owner_membership_in_one_batch_shape() {
    let plan = ReconcilePlan::new(org("org-1", "admin-1"), None, "admin-1", NOW, true)
        .expect("new setup plan");
    let ops = serde_json::to_value(persistence_ops(&plan).unwrap()).unwrap();

    assert_eq!(ops.as_array().unwrap().len(), 2);
    assert_eq!(ops[0]["contentModelId"], ORGS.model);
    assert_eq!(ops[0]["data"]["ownerId"], "admin-1");
    assert_eq!(ops[1]["contentModelId"], MEMBERSHIPS.model);
    assert_eq!(ops[1]["data"]["role"], "owner");
}

#[test]
fn settings_failure_retry_reuses_durable_rows_and_only_retries_pointer() {
    let first = ReconcilePlan::new(org("org-1", ""), None, "admin-1", NOW, false)
        .expect("repair orphan org");
    let first_id = first.membership.id.clone();
    assert_eq!(persistence_ops(&first).unwrap().len(), 2);

    // Model the state after the DB batch committed but settings.set failed.
    // A route retry observes those rows and must not write duplicate rows.
    let retry = ReconcilePlan::new(
        clone_org(&first.org),
        Some(&first.membership),
        "admin-1",
        NOW,
        false,
    )
    .expect("retry plan");
    assert!(persistence_ops(&retry).unwrap().is_empty());
    assert_eq!(retry.membership.id, first_id);
}

#[test]
fn existing_admin_owned_orphan_is_repaired_without_replacing_its_identity() {
    let plan = ReconcilePlan::new(org("legacy-org", "admin-1"), None, "admin-1", NOW, false)
        .expect("repair admin-owned orphan");
    let ops = serde_json::to_value(persistence_ops(&plan).unwrap()).unwrap();

    assert_eq!(plan.org.id, "legacy-org");
    assert_eq!(ops.as_array().unwrap().len(), 1);
    assert_eq!(ops[0]["contentModelId"], MEMBERSHIPS.model);
    assert_eq!(ops[0]["data"]["orgId"], "legacy-org");
}

#[test]
fn owner_update_and_membership_repair_share_the_same_batch() {
    let existing = MembershipEntry {
        id: "legacy-membership".into(),
        user_id: "admin-1".into(),
        org_id: "org-1".into(),
        role: "member".into(),
        joined_at: NOW.into(),
    };
    let plan = ReconcilePlan::new(org("org-1", "  "), Some(&existing), "admin-1", NOW, false)
        .expect("repair partial ownership");
    let ops = serde_json::to_value(persistence_ops(&plan).unwrap()).unwrap();

    assert_eq!(ops.as_array().unwrap().len(), 2);
    assert_eq!(ops[0]["data"]["ownerId"], "admin-1");
    assert_eq!(ops[1]["entryKey"], "legacy-membership");
    assert_eq!(ops[1]["data"]["role"], "owner");
}

#[test]
fn duplicate_base_slug_gets_stable_admin_specific_fallback() {
    let first = collision_safe_slug("my-organization", "admin-1");
    let retry = collision_safe_slug("my-organization", "admin-1");
    let another_admin = collision_safe_slug("my-organization", "admin-2");

    assert_eq!(first, retry);
    assert_ne!(first, another_admin);
    assert!(first.starts_with("my-organization-"));
    assert!(first.len() <= 100);
}

#[test]
fn status_relationship_requires_admin_owner_membership() {
    let owner = MembershipEntry {
        id: "m1".into(),
        user_id: "admin-1".into(),
        org_id: "org-1".into(),
        role: "owner".into(),
        joined_at: NOW.into(),
    };
    let member = MembershipEntry {
        role: "member".into(),
        ..owner.clone()
    };

    assert!(relationship_is_complete(true, Some(&owner)));
    assert!(!relationship_is_complete(false, Some(&owner)));
    assert!(!relationship_is_complete(true, Some(&member)));
    assert!(!relationship_is_complete(true, None));
}

#[test]
fn deterministic_membership_key_makes_missing_membership_repair_idempotent() {
    let first = owner_membership_id("admin-1", "org-1");
    assert_eq!(first, owner_membership_id("admin-1", "org-1"));
    assert_ne!(first, owner_membership_id("admin-1", "org-2"));
    assert_ne!(first, owner_membership_id("admin-2", "org-1"));
}

#[test]
fn refuses_to_adopt_another_tenants_org() {
    let error = ReconcilePlan::new(org("org-1", "another-owner"), None, "admin-1", NOW, false)
        .err()
        .expect("ownership conflict");
    assert!(matches!(error, SeamError::Db(message) if message.contains("another owner")));
}

fn org(id: &str, owner_id: &str) -> OrgEntry {
    OrgEntry {
        id: id.into(),
        name: "My Organization".into(),
        slug: "my-organization".into(),
        logo_url: None,
        is_personal: false,
        owner_id: owner_id.into(),
        created_at: NOW.into(),
        updated_at: NOW.into(),
    }
}
