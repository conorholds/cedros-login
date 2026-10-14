//! Membership repository trait and implementations

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::domain::OrgRole;
use crate::errors::AppError;

/// Membership entity for storage
#[derive(Debug, Clone)]
pub struct MembershipEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    pub org_id: Uuid,
    pub role: OrgRole,
    pub joined_at: DateTime<Utc>,
}

/// Membership with user data for efficient list queries (avoids N+1)
#[derive(Debug, Clone)]
pub struct MemberWithUser {
    pub membership: MembershipEntity,
    pub email: Option<String>,
    pub name: Option<String>,
}

impl MembershipEntity {
    /// Create a new membership
    pub fn new(user_id: Uuid, org_id: Uuid, role: OrgRole) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            org_id,
            role,
            joined_at: Utc::now(),
        }
    }

    /// Create an owner membership (for org creators)
    pub fn new_owner(user_id: Uuid, org_id: Uuid) -> Self {
        Self::new(user_id, org_id, OrgRole::Owner)
    }
}

/// Recheck actor and target together under the repository's mutation lock.
pub(crate) fn ensure_membership_change_allowed(
    actor: &MembershipEntity,
    target: &MembershipEntity,
    new_role: Option<OrgRole>,
) -> Result<(), AppError> {
    if actor.org_id != target.org_id {
        return Err(AppError::Forbidden("Organization mismatch".into()));
    }
    if actor.user_id == target.user_id {
        return if new_role.is_none() {
            Ok(())
        } else {
            Err(AppError::Forbidden("Cannot change your own role".into()))
        };
    }
    if !actor.role.has_at_least(OrgRole::Admin)
        || ((target.role == OrgRole::Owner || new_role == Some(OrgRole::Owner))
            && actor.role != OrgRole::Owner)
    {
        return Err(AppError::Forbidden(
            "Insufficient membership authority".into(),
        ));
    }
    Ok(())
}

/// Membership repository trait
#[async_trait]
pub trait MembershipRepository: Send + Sync {
    /// Find membership by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<MembershipEntity>, AppError>;

    /// Find membership by user and org
    async fn find_by_user_and_org(
        &self,
        user_id: Uuid,
        org_id: Uuid,
    ) -> Result<Option<MembershipEntity>, AppError>;

    /// Find all memberships for a user
    async fn find_by_user(&self, user_id: Uuid) -> Result<Vec<MembershipEntity>, AppError>;

    /// Find memberships for a user (paged)
    async fn find_by_user_paged(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<MembershipEntity>, AppError>;

    /// Find all memberships for an organization
    async fn find_by_org(&self, org_id: Uuid) -> Result<Vec<MembershipEntity>, AppError>;

    /// Find all memberships for an organization with user details (JOIN query)
    /// This avoids N+1 queries when listing members with user info
    async fn find_by_org_with_users(&self, org_id: Uuid) -> Result<Vec<MemberWithUser>, AppError>;

    /// Find memberships for an organization with user details (paged)
    async fn find_by_org_with_users_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<MemberWithUser>, AppError>;

    /// Create a new membership
    async fn create(&self, membership: MembershipEntity) -> Result<MembershipEntity, AppError>;

    /// Update membership role
    async fn update_role(&self, id: Uuid, role: OrgRole) -> Result<MembershipEntity, AppError>;

    /// Atomically update role, ensuring org keeps at least one owner.
    ///
    /// Returns Ok(Some(membership)) if updated successfully.
    /// Returns Ok(None) if the operation would leave the org with no owners.
    /// This prevents race conditions where concurrent demotions could leave an org ownerless.
    async fn update_role_if_not_last_owner(
        &self,
        id: Uuid,
        org_id: Uuid,
        actor_user_id: Uuid,
        new_role: OrgRole,
    ) -> Result<Option<MembershipEntity>, AppError>;

    /// Delete a membership
    async fn delete(&self, id: Uuid) -> Result<(), AppError>;

    /// Delete a user's membership in an organization.
    async fn delete_by_user_and_org(&self, user_id: Uuid, org_id: Uuid) -> Result<u64, AppError>;

    /// Atomically delete membership, ensuring org keeps at least one owner.
    ///
    /// Returns Ok(true) if deleted successfully.
    /// Returns Ok(false) if the operation would leave the org with no owners.
    /// This prevents race conditions where concurrent removals could leave an org ownerless.
    async fn delete_if_not_last_owner(
        &self,
        id: Uuid,
        org_id: Uuid,
        actor_user_id: Uuid,
    ) -> Result<bool, AppError>;

    /// Delete all memberships for an organization
    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError>;

    /// Count members in an organization
    async fn count_by_org(&self, org_id: Uuid) -> Result<u64, AppError>;

    /// Count memberships for a user
    async fn count_by_user(&self, user_id: Uuid) -> Result<u64, AppError>;

    /// Count owners in an organization
    async fn count_owners(&self, org_id: Uuid) -> Result<u64, AppError>;
}

/// In-memory membership repository for development/testing
pub struct InMemoryMembershipRepository {
    memberships: RwLock<HashMap<Uuid, MembershipEntity>>,
}

impl InMemoryMembershipRepository {
    pub fn new() -> Self {
        Self {
            memberships: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryMembershipRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl MembershipRepository for InMemoryMembershipRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<MembershipEntity>, AppError> {
        let memberships = self.memberships.read().await;
        Ok(memberships.get(&id).cloned())
    }

    async fn find_by_user_and_org(
        &self,
        user_id: Uuid,
        org_id: Uuid,
    ) -> Result<Option<MembershipEntity>, AppError> {
        let memberships = self.memberships.read().await;
        Ok(memberships
            .values()
            .find(|m| m.user_id == user_id && m.org_id == org_id)
            .cloned())
    }

    async fn find_by_user(&self, user_id: Uuid) -> Result<Vec<MembershipEntity>, AppError> {
        let memberships = self.memberships.read().await;
        Ok(memberships
            .values()
            .filter(|m| m.user_id == user_id)
            .cloned()
            .collect())
    }

    async fn find_by_user_paged(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<MembershipEntity>, AppError> {
        let memberships = self.memberships.read().await;
        let mut results: Vec<_> = memberships
            .values()
            .filter(|m| m.user_id == user_id)
            .cloned()
            .collect();

        results.sort_by_key(|b| std::cmp::Reverse(b.joined_at));
        let start = offset as usize;
        if start >= results.len() {
            return Ok(Vec::new());
        }
        let end = (start + limit as usize).min(results.len());
        Ok(results[start..end].to_vec())
    }

    async fn find_by_org(&self, org_id: Uuid) -> Result<Vec<MembershipEntity>, AppError> {
        let memberships = self.memberships.read().await;
        Ok(memberships
            .values()
            .filter(|m| m.org_id == org_id)
            .cloned()
            .collect())
    }

    async fn find_by_org_with_users(&self, org_id: Uuid) -> Result<Vec<MemberWithUser>, AppError> {
        // In-memory doesn't have access to user repo, return memberships without user data
        let memberships = self.find_by_org(org_id).await?;
        Ok(memberships
            .into_iter()
            .map(|membership| MemberWithUser {
                membership,
                email: None,
                name: None,
            })
            .collect())
    }

    async fn find_by_org_with_users_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<MemberWithUser>, AppError> {
        let mut members = self.find_by_org_with_users(org_id).await?;
        members.sort_by_key(|a| a.membership.joined_at);

        let start = offset as usize;
        let limit = limit as usize;
        Ok(members.into_iter().skip(start).take(limit).collect())
    }

    async fn create(&self, membership: MembershipEntity) -> Result<MembershipEntity, AppError> {
        let mut memberships = self.memberships.write().await;

        // Return existing membership if already present (idempotent operation).
        // This matches the PostgreSQL ON CONFLICT DO NOTHING behavior.
        if let Some(existing) = memberships
            .values()
            .find(|m| m.user_id == membership.user_id && m.org_id == membership.org_id)
        {
            return Ok(existing.clone());
        }

        memberships.insert(membership.id, membership.clone());
        Ok(membership)
    }

    async fn update_role(&self, id: Uuid, role: OrgRole) -> Result<MembershipEntity, AppError> {
        let mut memberships = self.memberships.write().await;

        let membership = memberships
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Membership not found".into()))?;

        membership.role = role;
        Ok(membership.clone())
    }

    async fn update_role_if_not_last_owner(
        &self,
        id: Uuid,
        org_id: Uuid,
        actor_user_id: Uuid,
        new_role: OrgRole,
    ) -> Result<Option<MembershipEntity>, AppError> {
        let mut memberships = self.memberships.write().await;

        // Find the membership being updated
        let membership = memberships
            .get(&id)
            .ok_or_else(|| AppError::NotFound("Membership not found".into()))?;

        if membership.org_id != org_id {
            return Err(AppError::NotFound("Membership not found".into()));
        }
        let actor = memberships
            .values()
            .find(|m| m.user_id == actor_user_id && m.org_id == org_id)
            .ok_or_else(|| AppError::Forbidden("Not a member of this organization".into()))?;
        ensure_membership_change_allowed(actor, membership, Some(new_role))?;

        // If target is an owner and new role is not owner, check owner count
        if membership.role == OrgRole::Owner && new_role != OrgRole::Owner {
            let owner_count = memberships
                .values()
                .filter(|m| m.org_id == org_id && m.role == OrgRole::Owner)
                .count();

            if owner_count <= 1 {
                // Would leave org without owners - abort
                return Ok(None);
            }
        }

        // Use ok_or_else instead of expect to avoid panics.
        // Defensive: should never happen since we hold write lock, but avoid panic.
        let membership = memberships.get_mut(&id).ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!("Membership disappeared during update"))
        })?;
        membership.role = new_role;
        Ok(Some(membership.clone()))
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let mut memberships = self.memberships.write().await;

        if memberships.remove(&id).is_none() {
            return Err(AppError::NotFound("Membership not found".into()));
        }

        Ok(())
    }

    async fn delete_by_user_and_org(&self, user_id: Uuid, org_id: Uuid) -> Result<u64, AppError> {
        let mut memberships = self.memberships.write().await;

        let ids_to_remove: Vec<Uuid> = memberships
            .values()
            .filter(|m| m.user_id == user_id && m.org_id == org_id)
            .map(|m| m.id)
            .collect();

        let count = ids_to_remove.len() as u64;
        for id in ids_to_remove {
            memberships.remove(&id);
        }

        Ok(count)
    }

    async fn delete_if_not_last_owner(
        &self,
        id: Uuid,
        org_id: Uuid,
        actor_user_id: Uuid,
    ) -> Result<bool, AppError> {
        let mut memberships = self.memberships.write().await;

        // Find the membership being deleted
        let membership = memberships
            .get(&id)
            .ok_or_else(|| AppError::NotFound("Membership not found".into()))?;

        if membership.org_id != org_id {
            return Err(AppError::NotFound("Membership not found".into()));
        }
        let actor = memberships
            .values()
            .find(|m| m.user_id == actor_user_id && m.org_id == org_id)
            .ok_or_else(|| AppError::Forbidden("Not a member of this organization".into()))?;
        ensure_membership_change_allowed(actor, membership, None)?;

        // If target is an owner, check if they're the last one
        if membership.role == OrgRole::Owner {
            let owner_count = memberships
                .values()
                .filter(|m| m.org_id == org_id && m.role == OrgRole::Owner)
                .count();

            if owner_count <= 1 {
                // Would leave org without owners - abort
                return Ok(false);
            }
        }

        // Safe to delete
        memberships.remove(&id);
        Ok(true)
    }

    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let mut memberships = self.memberships.write().await;

        let ids_to_remove: Vec<Uuid> = memberships
            .values()
            .filter(|m| m.org_id == org_id)
            .map(|m| m.id)
            .collect();

        let count = ids_to_remove.len() as u64;
        for id in ids_to_remove {
            memberships.remove(&id);
        }

        Ok(count)
    }

    async fn count_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let memberships = self.memberships.read().await;
        Ok(memberships.values().filter(|m| m.org_id == org_id).count() as u64)
    }

    async fn count_by_user(&self, user_id: Uuid) -> Result<u64, AppError> {
        let memberships = self.memberships.read().await;
        Ok(memberships
            .values()
            .filter(|m| m.user_id == user_id)
            .count() as u64)
    }

    async fn count_owners(&self, org_id: Uuid) -> Result<u64, AppError> {
        let memberships = self.memberships.read().await;
        Ok(memberships
            .values()
            .filter(|m| m.org_id == org_id && m.role == OrgRole::Owner)
            .count() as u64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_membership() {
        let repo = InMemoryMembershipRepository::new();
        let user_id = Uuid::new_v4();
        let org_id = Uuid::new_v4();

        let membership = MembershipEntity::new(user_id, org_id, OrgRole::Member);
        let created = repo.create(membership).await.unwrap();

        assert_eq!(created.user_id, user_id);
        assert_eq!(created.org_id, org_id);
        assert_eq!(created.role, OrgRole::Member);
    }

    #[tokio::test]
    async fn test_create_owner_membership() {
        let repo = InMemoryMembershipRepository::new();
        let user_id = Uuid::new_v4();
        let org_id = Uuid::new_v4();

        let membership = MembershipEntity::new_owner(user_id, org_id);
        let created = repo.create(membership).await.unwrap();

        assert_eq!(created.role, OrgRole::Owner);
    }

    #[tokio::test]
    async fn test_duplicate_membership_rejected() {
        // Duplicate membership creation is now idempotent - returns existing membership
        let repo = InMemoryMembershipRepository::new();
        let user_id = Uuid::new_v4();
        let org_id = Uuid::new_v4();

        let m1 = MembershipEntity::new(user_id, org_id, OrgRole::Member);
        let m2 = MembershipEntity::new(user_id, org_id, OrgRole::Admin);

        let created = repo.create(m1).await.unwrap();
        let duplicate = repo.create(m2).await.unwrap();

        // Should return original membership (not the duplicate with Admin role)
        assert_eq!(duplicate.id, created.id);
        assert_eq!(duplicate.role, OrgRole::Member);
    }

    #[tokio::test]
    async fn test_find_by_user_and_org() {
        let repo = InMemoryMembershipRepository::new();
        let user_id = Uuid::new_v4();
        let org_id = Uuid::new_v4();

        let membership = MembershipEntity::new(user_id, org_id, OrgRole::Member);
        repo.create(membership).await.unwrap();

        let found = repo.find_by_user_and_org(user_id, org_id).await.unwrap();
        assert!(found.is_some());

        let not_found = repo
            .find_by_user_and_org(Uuid::new_v4(), org_id)
            .await
            .unwrap();
        assert!(not_found.is_none());
    }

    #[tokio::test]
    async fn test_update_role() {
        let repo = InMemoryMembershipRepository::new();
        let user_id = Uuid::new_v4();
        let org_id = Uuid::new_v4();

        let membership = MembershipEntity::new(user_id, org_id, OrgRole::Member);
        let created = repo.create(membership).await.unwrap();

        let updated = repo.update_role(created.id, OrgRole::Admin).await.unwrap();
        assert_eq!(updated.role, OrgRole::Admin);
    }

    #[tokio::test]
    async fn test_find_by_org_with_users_paged() {
        let repo = InMemoryMembershipRepository::new();
        let org_id = Uuid::new_v4();

        let base_time = Utc::now();
        for i in 0..3 {
            let mut membership = MembershipEntity::new(Uuid::new_v4(), org_id, OrgRole::Member);
            membership.joined_at = base_time + chrono::Duration::seconds(i);
            repo.create(membership).await.unwrap();
        }

        let page = repo
            .find_by_org_with_users_paged(org_id, 2, 1)
            .await
            .unwrap();

        assert_eq!(page.len(), 2);
        assert!(page[0].membership.joined_at <= page[1].membership.joined_at);
    }

    #[tokio::test]
    async fn test_find_by_user_paged() {
        let repo = InMemoryMembershipRepository::new();
        let user_id = Uuid::new_v4();

        let base_time = Utc::now();
        for i in 0..3 {
            let mut membership = MembershipEntity::new(user_id, Uuid::new_v4(), OrgRole::Member);
            membership.joined_at = base_time + chrono::Duration::seconds(i);
            repo.create(membership).await.unwrap();
        }

        let page = repo.find_by_user_paged(user_id, 2, 1).await.unwrap();

        assert_eq!(page.len(), 2);
        assert!(page[0].joined_at >= page[1].joined_at);
    }

    #[tokio::test]
    async fn test_count_by_user() {
        let repo = InMemoryMembershipRepository::new();
        let user_id = Uuid::new_v4();

        repo.create(MembershipEntity::new(
            user_id,
            Uuid::new_v4(),
            OrgRole::Member,
        ))
        .await
        .unwrap();
        repo.create(MembershipEntity::new(
            user_id,
            Uuid::new_v4(),
            OrgRole::Admin,
        ))
        .await
        .unwrap();
        repo.create(MembershipEntity::new(
            Uuid::new_v4(),
            Uuid::new_v4(),
            OrgRole::Member,
        ))
        .await
        .unwrap();

        let count = repo.count_by_user(user_id).await.unwrap();
        assert_eq!(count, 2);
    }

    #[tokio::test]
    async fn test_find_by_org_with_users_returns_memberships() {
        let repo = InMemoryMembershipRepository::new();
        let org_id = Uuid::new_v4();
        let user_id = Uuid::new_v4();

        repo.create(MembershipEntity::new(user_id, org_id, OrgRole::Member))
            .await
            .unwrap();

        let results = repo.find_by_org_with_users(org_id).await.unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].membership.user_id, user_id);
        assert!(results[0].email.is_none());
        assert!(results[0].name.is_none());
    }

    #[tokio::test]
    async fn test_role_hierarchy() {
        assert!(OrgRole::Owner.has_at_least(OrgRole::Admin));
        assert!(OrgRole::Owner.has_at_least(OrgRole::Member));
        assert!(OrgRole::Admin.has_at_least(OrgRole::Member));
        assert!(!OrgRole::Member.has_at_least(OrgRole::Admin));
    }

    #[tokio::test]
    async fn test_count_owners() {
        let repo = InMemoryMembershipRepository::new();
        let org_id = Uuid::new_v4();

        let m1 = MembershipEntity::new(Uuid::new_v4(), org_id, OrgRole::Owner);
        let m2 = MembershipEntity::new(Uuid::new_v4(), org_id, OrgRole::Admin);
        let m3 = MembershipEntity::new(Uuid::new_v4(), org_id, OrgRole::Member);

        repo.create(m1).await.unwrap();
        repo.create(m2).await.unwrap();
        repo.create(m3).await.unwrap();

        let count = repo.count_owners(org_id).await.unwrap();
        assert_eq!(count, 1);
    }
    #[test]
    fn authorization_membership_matrix_never_crosses_role_or_org_boundary() {
        let org = Uuid::new_v4();
        for actor_role in [OrgRole::Owner, OrgRole::Admin, OrgRole::Member] {
            for target_role in [OrgRole::Owner, OrgRole::Admin, OrgRole::Member] {
                for new_role in [
                    None,
                    Some(OrgRole::Owner),
                    Some(OrgRole::Admin),
                    Some(OrgRole::Member),
                ] {
                    let actor = MembershipEntity::new(Uuid::new_v4(), org, actor_role);
                    let mut target = MembershipEntity::new(Uuid::new_v4(), org, target_role);
                    let expected = actor_role == OrgRole::Owner
                        || (actor_role == OrgRole::Admin
                            && target_role != OrgRole::Owner
                            && new_role != Some(OrgRole::Owner));
                    assert_eq!(
                        ensure_membership_change_allowed(&actor, &target, new_role).is_ok(),
                        expected
                    );
                    target.org_id = Uuid::new_v4();
                    assert!(ensure_membership_change_allowed(&actor, &target, new_role).is_err());
                    assert_eq!(
                        ensure_membership_change_allowed(&actor, &actor, new_role).is_ok(),
                        new_role.is_none()
                    );
                }
            }
        }
    }

    #[tokio::test]
    async fn authorization_stale_actor_and_last_owner_fail_closed() {
        let repo = InMemoryMembershipRepository::new();
        let org = Uuid::new_v4();
        let actor = repo
            .create(MembershipEntity::new(Uuid::new_v4(), org, OrgRole::Admin))
            .await
            .unwrap();
        let target = repo
            .create(MembershipEntity::new(Uuid::new_v4(), org, OrgRole::Member))
            .await
            .unwrap();
        repo.update_role_if_not_last_owner(target.id, org, actor.user_id, OrgRole::Admin)
            .await
            .unwrap()
            .unwrap();
        repo.update_role(actor.id, OrgRole::Member).await.unwrap();
        assert!(repo
            .delete_if_not_last_owner(target.id, org, actor.user_id)
            .await
            .is_err());
        assert!(repo
            .delete_if_not_last_owner(target.id, Uuid::new_v4(), target.user_id)
            .await
            .is_err());
        repo.update_role(target.id, OrgRole::Owner).await.unwrap();
        assert!(!repo
            .delete_if_not_last_owner(target.id, org, target.user_id)
            .await
            .unwrap());
    }
}
