//! Organization repository trait and implementations

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Generate a URL-safe slug from a name
pub fn generate_slug(name: &str) -> String {
    name.to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

/// Organization entity for storage
#[derive(Debug, Clone)]
pub struct OrgEntity {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub logo_url: Option<String>,
    pub is_personal: bool,
    pub owner_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl OrgEntity {
    /// Create a new organization
    pub fn new(name: String, slug: String, owner_id: Uuid, is_personal: bool) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name,
            slug,
            logo_url: None,
            is_personal,
            owner_id,
            created_at: now,
            updated_at: now,
        }
    }

    /// Create a personal organization for a user
    pub fn new_personal(user_id: Uuid, user_name: Option<&str>) -> Self {
        let name = match user_name {
            Some(n) if !n.is_empty() => format!("{}'s Workspace", n),
            _ => "Personal Workspace".to_string(),
        };
        // Use user_id as slug for personal orgs to ensure uniqueness
        let slug = user_id.to_string();
        Self::new(name, slug, user_id, true)
    }
}

/// Organization repository trait
#[async_trait]
pub trait OrgRepository: Send + Sync {
    /// Find organization by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<OrgEntity>, AppError>;

    /// Find multiple organizations by IDs (batch fetch to avoid N+1)
    async fn find_by_ids(&self, ids: &[Uuid]) -> Result<Vec<OrgEntity>, AppError>;

    /// Find organization by slug
    async fn find_by_slug(&self, slug: &str) -> Result<Option<OrgEntity>, AppError>;

    /// List all organizations for a user (via memberships)
    async fn find_by_user(&self, user_id: Uuid) -> Result<Vec<OrgEntity>, AppError>;

    /// Create a new organization
    async fn create(&self, org: OrgEntity) -> Result<OrgEntity, AppError>;

    /// Update an existing organization
    async fn update(&self, org: OrgEntity) -> Result<OrgEntity, AppError>;

    /// Delete an organization
    async fn delete(&self, id: Uuid) -> Result<(), AppError>;

    /// Check if slug exists
    async fn slug_exists(&self, slug: &str) -> Result<bool, AppError>;

    /// List all organizations (for system admin)
    async fn list_all(&self, limit: u32, offset: u32) -> Result<Vec<OrgEntity>, AppError>;

    /// Count total organizations
    async fn count(&self) -> Result<u64, AppError>;
}

/// In-memory organization repository for development/testing
pub struct InMemoryOrgRepository {
    orgs: RwLock<HashMap<Uuid, OrgEntity>>,
}

impl InMemoryOrgRepository {
    pub fn new() -> Self {
        Self {
            orgs: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryOrgRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl OrgRepository for InMemoryOrgRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<OrgEntity>, AppError> {
        let orgs = self.orgs.read().await;
        Ok(orgs.get(&id).cloned())
    }

    async fn find_by_ids(&self, ids: &[Uuid]) -> Result<Vec<OrgEntity>, AppError> {
        let orgs = self.orgs.read().await;
        Ok(ids.iter().filter_map(|id| orgs.get(id).cloned()).collect())
    }

    async fn find_by_slug(&self, slug: &str) -> Result<Option<OrgEntity>, AppError> {
        let orgs = self.orgs.read().await;
        Ok(orgs.values().find(|o| o.slug == slug).cloned())
    }

    async fn find_by_user(&self, _user_id: Uuid) -> Result<Vec<OrgEntity>, AppError> {
        // LIMITATION: In-memory OrgRepository cannot implement this correctly
        // because it has no access to the MembershipRepository.
        //
        // Callers should NOT use this method with in-memory storage. Instead, use:
        //   1. membership_repo.find_by_user(user_id) to get memberships
        //   2. org_repo.find_by_ids(&membership_org_ids) to get orgs
        //
        // The PostgreSQL implementation joins tables and works correctly.
        // All handlers already use the membership -> find_by_ids pattern.
        tracing::warn!(
            "InMemoryOrgRepository::find_by_user called - this always returns empty. \
             Use membership_repo + find_by_ids pattern instead."
        );
        Ok(vec![])
    }

    async fn create(&self, org: OrgEntity) -> Result<OrgEntity, AppError> {
        let mut orgs = self.orgs.write().await;

        // Check for duplicate slug
        if orgs.values().any(|o| o.slug == org.slug) {
            return Err(AppError::Validation(
                "Organization slug already exists".into(),
            ));
        }

        orgs.insert(org.id, org.clone());
        Ok(org)
    }

    async fn update(&self, org: OrgEntity) -> Result<OrgEntity, AppError> {
        let mut orgs = self.orgs.write().await;

        if !orgs.contains_key(&org.id) {
            return Err(AppError::NotFound("Organization not found".into()));
        }

        // Check for duplicate slug (excluding current org)
        if orgs.values().any(|o| o.slug == org.slug && o.id != org.id) {
            return Err(AppError::Validation(
                "Organization slug already exists".into(),
            ));
        }

        let mut updated = org;
        updated.updated_at = Utc::now();
        orgs.insert(updated.id, updated.clone());
        Ok(updated)
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let mut orgs = self.orgs.write().await;

        if orgs.remove(&id).is_none() {
            return Err(AppError::NotFound("Organization not found".into()));
        }

        Ok(())
    }

    async fn slug_exists(&self, slug: &str) -> Result<bool, AppError> {
        let orgs = self.orgs.read().await;
        Ok(orgs.values().any(|o| o.slug == slug))
    }

    async fn list_all(&self, limit: u32, offset: u32) -> Result<Vec<OrgEntity>, AppError> {
        let orgs = self.orgs.read().await;
        let mut all_orgs: Vec<_> = orgs.values().cloned().collect();
        all_orgs.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(all_orgs
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count(&self) -> Result<u64, AppError> {
        let orgs = self.orgs.read().await;
        Ok(orgs.len() as u64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_org() {
        let repo = InMemoryOrgRepository::new();
        let owner_id = Uuid::new_v4();
        let org = OrgEntity::new("Test Org".into(), "test-org".into(), owner_id, false);

        let created = repo.create(org).await.unwrap();
        assert_eq!(created.name, "Test Org");
        assert_eq!(created.slug, "test-org");
        assert!(!created.is_personal);
    }

    #[tokio::test]
    async fn test_create_personal_org() {
        let repo = InMemoryOrgRepository::new();
        let user_id = Uuid::new_v4();
        let org = OrgEntity::new_personal(user_id, Some("John"));

        let created = repo.create(org).await.unwrap();
        assert_eq!(created.name, "John's Workspace");
        assert!(created.is_personal);
        assert_eq!(created.owner_id, user_id);
    }

    #[tokio::test]
    async fn test_find_by_slug() {
        let repo = InMemoryOrgRepository::new();
        let owner_id = Uuid::new_v4();
        let org = OrgEntity::new("Test Org".into(), "test-org".into(), owner_id, false);

        repo.create(org).await.unwrap();

        let found = repo.find_by_slug("test-org").await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().name, "Test Org");

        let not_found = repo.find_by_slug("nonexistent").await.unwrap();
        assert!(not_found.is_none());
    }

    #[tokio::test]
    async fn test_duplicate_slug_rejected() {
        let repo = InMemoryOrgRepository::new();
        let owner_id = Uuid::new_v4();

        let org1 = OrgEntity::new("Org 1".into(), "same-slug".into(), owner_id, false);
        let org2 = OrgEntity::new("Org 2".into(), "same-slug".into(), owner_id, false);

        repo.create(org1).await.unwrap();
        let result = repo.create(org2).await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_update_org() {
        let repo = InMemoryOrgRepository::new();
        let owner_id = Uuid::new_v4();
        let org = OrgEntity::new("Test Org".into(), "test-org".into(), owner_id, false);

        let created = repo.create(org).await.unwrap();

        let mut updated = created.clone();
        updated.name = "Updated Org".into();

        let result = repo.update(updated).await.unwrap();
        assert_eq!(result.name, "Updated Org");
    }

    #[tokio::test]
    async fn test_delete_org() {
        let repo = InMemoryOrgRepository::new();
        let owner_id = Uuid::new_v4();
        let org = OrgEntity::new("Test Org".into(), "test-org".into(), owner_id, false);

        let created = repo.create(org).await.unwrap();

        repo.delete(created.id).await.unwrap();

        let found = repo.find_by_id(created.id).await.unwrap();
        assert!(found.is_none());
    }
}
