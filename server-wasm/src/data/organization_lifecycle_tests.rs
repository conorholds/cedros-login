use super::*;
use crate::data::memberships::MembershipEntry;
use crate::data::orgs::OrgEntry;

#[test]
fn operation_binds_org_actor_and_both_host_revisions() {
    let value = serde_json::to_value(deletion_operation(&organization(), &actor())).unwrap();
    assert_eq!(value["operationId"], "organization.delete");
    assert_eq!(value["params"]["orgId"], "o1");
    assert_eq!(value["params"]["expectedUpdatedAt"], "org-revision");
    assert_eq!(value["params"]["actor"]["userId"], "u1");
    assert_eq!(
        value["params"]["actor"]["membershipEntryKey"],
        "membership-key"
    );
    assert_eq!(
        value["params"]["actor"]["expectedUpdatedAt"],
        "membership-revision"
    );
    assert!(value.get("access").is_none());
}

#[test]
fn aggregate_response_has_no_identifier_or_payload_fields() {
    let outcome: OrganizationDeletionOutcome = serde_json::from_value(serde_json::json!({
        "status": "deleted",
        "deletedMemberships": 2,
        "deletedInvites": 3,
        "deletedCustomRoles": 4,
        "deletedPolicies": 5,
        "deletedSsoProviders": 6,
        "tombstoneGeneration": "tombstone-generation-1",
    }))
    .unwrap();
    assert_eq!(outcome.deleted_policies, 5);
    assert_eq!(outcome.deleted_sso_providers, 6);

    let missing_tombstone = serde_json::json!({
        "status": "deleted", "deletedMemberships": 0, "deletedInvites": 0,
        "deletedCustomRoles": 0, "deletedPolicies": 0, "deletedSsoProviders": 0,
    });
    assert!(serde_json::from_value::<OrganizationDeletionOutcome>(missing_tombstone).is_err());
}

fn organization() -> VersionedOrgEntry {
    VersionedOrgEntry {
        value: OrgEntry {
            id: "o1".into(),
            name: "Acme".into(),
            slug: "acme".into(),
            logo_url: None,
            is_personal: false,
            owner_id: "u1".into(),
            created_at: "created".into(),
            updated_at: "payload-revision".into(),
        },
        entry_key: "o1".into(),
        host_updated_at: "org-revision".into(),
    }
}

fn actor() -> VersionedMembership {
    VersionedMembership {
        value: MembershipEntry {
            id: "m1".into(),
            user_id: "u1".into(),
            org_id: "o1".into(),
            role: "owner".into(),
            joined_at: "joined".into(),
        },
        entry_key: "membership-key".into(),
        host_updated_at: "membership-revision".into(),
        condition: crate::host::db::Condition::version(
            crate::host::db::MEMBERSHIPS,
            "membership",
            "opaque-revision",
        )
        .unwrap(),
    }
}
