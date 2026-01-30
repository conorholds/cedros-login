//! Custom role repository for per-org role definitions

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::pagination::{cap_limit, cap_offset};
use crate::services::Permission;

/// Custom role entity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomRole {
    pub id: Uuid,
    pub org_id: Uuid,
    /// Display name for the role
    pub name: String,
    /// Optional description
    pub description: Option<String>,
    /// Set of permissions granted by this role
    pub permissions: HashSet<String>,
    /// Whether this is a default role assigned to new members
    pub is_default: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl CustomRole {
    /// Create a new custom role
    pub fn new(org_id: Uuid, name: impl Into<String>, permissions: HashSet<String>) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            org_id,
            name: name.into(),
            description: None,
            permissions,
            is_default: false,
            created_at: now,
            updated_at: now,
        }
    }

    /// Check if this role has a specific permission
    pub fn has_permission(&self, permission: &str) -> bool {
        self.permissions.contains(permission)
    }

    /// Check if this role has the given Permission enum
    pub fn has_permission_enum(&self, permission: Permission) -> bool {
        self.permissions.contains(permission.as_str())
    }
}

/// Custom role repository trait
#[async_trait]
pub trait CustomRoleRepository: Send + Sync {
    /// Create a new custom role
    async fn create(&self, role: CustomRole) -> Result<CustomRole, AppError>;

    /// Find a role by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<CustomRole>, AppError>;

    /// Find all roles for an organization
    async fn find_by_org(&self, org_id: Uuid) -> Result<Vec<CustomRole>, AppError>;

    /// Find roles for an organization with pagination
    async fn find_by_org_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<CustomRole>, AppError>;

    /// Count roles for an organization
    async fn count_by_org(&self, org_id: Uuid) -> Result<u64, AppError>;

    /// Find a role by name within an organization
    async fn find_by_org_and_name(
        &self,
        org_id: Uuid,
        name: &str,
    ) -> Result<Option<CustomRole>, AppError>;

    /// Update a custom role
    async fn update(&self, role: CustomRole) -> Result<CustomRole, AppError>;

    /// Delete a custom role
    async fn delete(&self, id: Uuid) -> Result<bool, AppError>;

    /// Delete all custom roles for an organization
    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError>;

    /// Get the default role for an organization (if any)
    async fn get_default_role(&self, org_id: Uuid) -> Result<Option<CustomRole>, AppError>;

    /// Set a role as the default for an organization
    async fn set_default_role(&self, org_id: Uuid, role_id: Uuid) -> Result<(), AppError>;
}

/// In-memory custom role repository
pub struct InMemoryCustomRoleRepository {
    roles: RwLock<HashMap<Uuid, CustomRole>>,
}

impl InMemoryCustomRoleRepository {
    pub fn new() -> Self {
        Self {
            roles: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryCustomRoleRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl CustomRoleRepository for InMemoryCustomRoleRepository {
    async fn create(&self, role: CustomRole) -> Result<CustomRole, AppError> {
        let mut roles = self.roles.write().await;

        // Check for duplicate name within org
        for existing in roles.values() {
            if existing.org_id == role.org_id
                && existing.name.to_lowercase() == role.name.to_lowercase()
            {
                return Err(AppError::Validation(format!(
                    "Role '{}' already exists in this organization",
                    role.name
                )));
            }
        }

        roles.insert(role.id, role.clone());
        Ok(role)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<CustomRole>, AppError> {
        let roles = self.roles.read().await;

        Ok(roles.get(&id).cloned())
    }

    async fn find_by_org(&self, org_id: Uuid) -> Result<Vec<CustomRole>, AppError> {
        let roles = self.roles.read().await;

        Ok(roles
            .values()
            .filter(|r| r.org_id == org_id)
            .cloned()
            .collect())
    }

    async fn find_by_org_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<CustomRole>, AppError> {
        let roles = self.roles.read().await;
        let mut results: Vec<_> = roles
            .values()
            .filter(|r| r.org_id == org_id)
            .cloned()
            .collect();
        results.sort_by(|a, b| a.created_at.cmp(&b.created_at));
        let capped_limit = cap_limit(limit);
        let capped_offset = cap_offset(offset);
        let start = capped_offset as usize;
        let end = start.saturating_add(capped_limit as usize);
        Ok(results.into_iter().skip(start).take(end - start).collect())
    }

    async fn count_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let roles = self.roles.read().await;
        Ok(roles.values().filter(|r| r.org_id == org_id).count() as u64)
    }

    async fn find_by_org_and_name(
        &self,
        org_id: Uuid,
        name: &str,
    ) -> Result<Option<CustomRole>, AppError> {
        let roles = self.roles.read().await;

        Ok(roles
            .values()
            .find(|r| r.org_id == org_id && r.name.to_lowercase() == name.to_lowercase())
            .cloned())
    }

    async fn update(&self, role: CustomRole) -> Result<CustomRole, AppError> {
        let mut roles = self.roles.write().await;

        if !roles.contains_key(&role.id) {
            return Err(AppError::NotFound("Role not found".into()));
        }

        // Check for duplicate name within org (excluding self)
        for existing in roles.values() {
            if existing.id != role.id
                && existing.org_id == role.org_id
                && existing.name.to_lowercase() == role.name.to_lowercase()
            {
                return Err(AppError::Validation(format!(
                    "Role '{}' already exists in this organization",
                    role.name
                )));
            }
        }

        let mut updated = role;
        updated.updated_at = Utc::now();
        roles.insert(updated.id, updated.clone());
        Ok(updated)
    }

    async fn delete(&self, id: Uuid) -> Result<bool, AppError> {
        let mut roles = self.roles.write().await;

        Ok(roles.remove(&id).is_some())
    }

    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let mut roles = self.roles.write().await;

        let before = roles.len();
        roles.retain(|_, role| role.org_id != org_id);
        Ok((before - roles.len()) as u64)
    }

    async fn get_default_role(&self, org_id: Uuid) -> Result<Option<CustomRole>, AppError> {
        let roles = self.roles.read().await;

        Ok(roles
            .values()
            .find(|r| r.org_id == org_id && r.is_default)
            .cloned())
    }

    async fn set_default_role(&self, org_id: Uuid, role_id: Uuid) -> Result<(), AppError> {
        let mut roles = self.roles.write().await;

        // First, verify the role exists and belongs to the org
        let role = roles
            .get(&role_id)
            .ok_or(AppError::NotFound("Role not found".into()))?;
        if role.org_id != org_id {
            return Err(AppError::Forbidden(
                "Role does not belong to this org".into(),
            ));
        }

        // Clear existing default
        for r in roles.values_mut() {
            if r.org_id == org_id {
                r.is_default = false;
            }
        }

        // Set new default
        if let Some(r) = roles.get_mut(&role_id) {
            r.is_default = true;
            r.updated_at = Utc::now();
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_role(org_id: Uuid, name: &str) -> CustomRole {
        let mut permissions = HashSet::new();
        permissions.insert("member.read".to_string());
        permissions.insert("org.read".to_string());
        CustomRole::new(org_id, name, permissions)
    }

    #[tokio::test]
    async fn test_create_and_find_role() {
        let repo = InMemoryCustomRoleRepository::new();
        let org_id = Uuid::new_v4();
        let role = create_test_role(org_id, "Developer");

        let created = repo.create(role).await.unwrap();
        assert_eq!(created.name, "Developer");
        assert_eq!(created.org_id, org_id);

        let found = repo.find_by_id(created.id).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().name, "Developer");
    }

    #[tokio::test]
    async fn test_find_by_org() {
        let repo = InMemoryCustomRoleRepository::new();
        let org_id = Uuid::new_v4();
        let other_org_id = Uuid::new_v4();

        repo.create(create_test_role(org_id, "Developer"))
            .await
            .unwrap();
        repo.create(create_test_role(org_id, "Designer"))
            .await
            .unwrap();
        repo.create(create_test_role(other_org_id, "Manager"))
            .await
            .unwrap();

        let roles = repo.find_by_org(org_id).await.unwrap();
        assert_eq!(roles.len(), 2);
    }

    #[tokio::test]
    async fn test_find_by_org_paged_and_count() {
        let repo = InMemoryCustomRoleRepository::new();
        let org_id = Uuid::new_v4();

        repo.create(create_test_role(org_id, "Developer"))
            .await
            .unwrap();
        repo.create(create_test_role(org_id, "Designer"))
            .await
            .unwrap();

        let total = repo.count_by_org(org_id).await.unwrap();
        assert_eq!(total, 2);

        let roles = repo.find_by_org_paged(org_id, 1, 1).await.unwrap();
        assert_eq!(roles.len(), 1);
    }

    #[tokio::test]
    async fn test_duplicate_name_rejected() {
        let repo = InMemoryCustomRoleRepository::new();
        let org_id = Uuid::new_v4();

        repo.create(create_test_role(org_id, "Developer"))
            .await
            .unwrap();
        let result = repo.create(create_test_role(org_id, "developer")).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_same_name_different_org_allowed() {
        let repo = InMemoryCustomRoleRepository::new();
        let org1 = Uuid::new_v4();
        let org2 = Uuid::new_v4();

        repo.create(create_test_role(org1, "Developer"))
            .await
            .unwrap();
        let result = repo.create(create_test_role(org2, "Developer")).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_update_role() {
        let repo = InMemoryCustomRoleRepository::new();
        let org_id = Uuid::new_v4();

        let role = repo
            .create(create_test_role(org_id, "Developer"))
            .await
            .unwrap();

        let mut updated = role.clone();
        updated.name = "Senior Developer".to_string();
        updated.description = Some("Senior engineering role".to_string());

        let result = repo.update(updated).await.unwrap();
        assert_eq!(result.name, "Senior Developer");
        assert_eq!(
            result.description,
            Some("Senior engineering role".to_string())
        );
    }

    #[tokio::test]
    async fn test_set_default_role() {
        let repo = InMemoryCustomRoleRepository::new();
        let org_id = Uuid::new_v4();

        let role1 = repo
            .create(create_test_role(org_id, "Member"))
            .await
            .unwrap();
        let role2 = repo
            .create(create_test_role(org_id, "Viewer"))
            .await
            .unwrap();

        // Set first as default
        repo.set_default_role(org_id, role1.id).await.unwrap();
        let default = repo.get_default_role(org_id).await.unwrap();
        assert!(default.is_some());
        assert_eq!(default.unwrap().id, role1.id);

        // Set second as default
        repo.set_default_role(org_id, role2.id).await.unwrap();
        let default = repo.get_default_role(org_id).await.unwrap();
        assert!(default.is_some());
        assert_eq!(default.unwrap().id, role2.id);

        // Verify first is no longer default
        let role1_updated = repo.find_by_id(role1.id).await.unwrap().unwrap();
        assert!(!role1_updated.is_default);
    }

    #[tokio::test]
    async fn test_has_permission() {
        let org_id = Uuid::new_v4();
        let role = create_test_role(org_id, "Developer");

        assert!(role.has_permission("member.read"));
        assert!(role.has_permission("org.read"));
        assert!(!role.has_permission("org.delete"));
    }
}
