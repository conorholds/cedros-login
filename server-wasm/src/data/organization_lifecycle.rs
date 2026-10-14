//! Atomic organization deletion through the host lifecycle grant.
//! The host validates the actor and serializes the complete dependent-row
//! cascade so concurrent inserts cannot survive an organization deletion.
use crate::data::memberships::VersionedMembership;
use crate::data::orgs::VersionedOrgEntry;
use crate::host::db::{self, ConditionalBatchOp, ConditionalOperation};
use crate::host::{Result, SeamError};
use serde::Deserialize;

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct OrganizationDeletionOutcome {
    pub status: String,
    pub deleted_memberships: u64,
    pub deleted_invites: u64,
    pub deleted_custom_roles: u64,
    pub deleted_policies: u64,
    pub deleted_sso_providers: u64,
    pub tombstone_generation: String,
}

pub fn delete(
    organization: &VersionedOrgEntry,
    actor: &VersionedMembership,
) -> Result<OrganizationDeletionOutcome> {
    let response = db::batch_with_results(&[deletion_operation(organization, actor).into()])?;
    let output = response
        .results
        .first()
        .map(|result| result.output.clone())
        .ok_or_else(invalid_response)?;
    let outcome: OrganizationDeletionOutcome =
        serde_json::from_value(output).map_err(|_| invalid_response())?;
    if outcome.status != "deleted" || outcome.tombstone_generation.is_empty() {
        return Err(invalid_response());
    }
    Ok(outcome)
}

fn deletion_operation(
    organization: &VersionedOrgEntry,
    actor: &VersionedMembership,
) -> ConditionalBatchOp {
    ConditionalBatchOp::new(
        ConditionalOperation::DeleteOrganization,
        serde_json::json!({
            "orgId": organization.entry_key,
            "expectedUpdatedAt": organization.host_updated_at,
            "actor": {
                "userId": actor.value.user_id,
                "membershipEntryKey": actor.entry_key,
                "expectedUpdatedAt": actor.host_updated_at,
            }
        }),
    )
}

fn invalid_response() -> SeamError {
    SeamError::Db("organization deletion returned an invalid response".into())
}

#[cfg(test)]
#[path = "organization_lifecycle_tests.rs"]
mod tests;
