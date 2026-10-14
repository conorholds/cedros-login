//! Authorization service for role-based access control
//!
//! # Performance
//!
//! The batch methods (`check_any_permission`, `check_all_permissions`) use a cached context
//! pattern to avoid N+1 queries. They fetch user/org/membership data once, then check
//! multiple permissions without additional database calls.
//!
//! Single `check_permission` calls still perform 3 queries (user, org, membership).
//! For repeated single-permission checks in a hot path, callers should consider
//! batching into `check_all_permissions` or `check_any_permission`.
//!
//! # Future Improvement
//!
//! Cross-request caching (e.g., TTL-based user/membership cache) is not currently
//! implemented. Current approach is intentionally simple to avoid cache invalidation
//! complexity and ensure permission changes take effect immediately. For high-traffic
//! deployments, consider adding opt-in caching with short TTL (~30s) behind a feature
//! flag, ensuring cache invalidation on role changes.

use crate::domain::Permission;
use crate::errors::AppError;
use crate::repositories::{MembershipRepository, OrgRepository, OrgRole, UserRepository};
use std::sync::Arc;
use uuid::Uuid;

/// Authorization context from validated request
#[derive(Debug, Clone)]
pub struct AuthContext {
    pub user_id: Uuid,
    pub org_id: Option<Uuid>,
    pub role: Option<OrgRole>,
    pub is_system_admin: bool,
}

/// Cached auth context to avoid N+1 queries in batch permission checks
#[derive(Debug, Clone)]
struct CachedAuthContext {
    user_exists: bool,
    is_system_admin: bool,
    org_exists: bool,
    membership_role: Option<OrgRole>,
}

/// Result of an authorization check
#[derive(Debug, Clone)]
pub struct AuthorizationResult {
    pub allowed: bool,
    pub reason: Option<String>,
}

impl AuthorizationResult {
    pub fn allowed() -> Self {
        Self {
            allowed: true,
            reason: None,
        }
    }

    pub fn denied(reason: impl Into<String>) -> Self {
        Self {
            allowed: false,
            reason: Some(reason.into()),
        }
    }
}

/// Service for checking authorization
pub struct AuthorizationService {
    user_repo: Arc<dyn UserRepository>,
    org_repo: Arc<dyn OrgRepository>,
    membership_repo: Arc<dyn MembershipRepository>,
}

impl AuthorizationService {
    pub fn new(
        user_repo: Arc<dyn UserRepository>,
        org_repo: Arc<dyn OrgRepository>,
        membership_repo: Arc<dyn MembershipRepository>,
    ) -> Self {
        Self {
            user_repo,
            org_repo,
            membership_repo,
        }
    }

    /// Check if user has permission in an organization
    pub async fn check_permission(
        &self,
        user_id: Uuid,
        org_id: Uuid,
        permission: Permission,
    ) -> Result<AuthorizationResult, AppError> {
        // Fetch context once
        let ctx = self.fetch_auth_context(user_id, org_id).await?;
        Ok(self.check_permission_with_context(&ctx, permission))
    }

    /// Fetch auth context once for use with multiple permission checks.
    /// This avoids N+1 queries when checking multiple permissions.
    async fn fetch_auth_context(
        &self,
        user_id: Uuid,
        org_id: Uuid,
    ) -> Result<CachedAuthContext, AppError> {
        // Check if user exists and is system admin
        let user = self.user_repo.find_by_id(user_id).await?;
        let (user_exists, is_system_admin) = match user {
            Some(u) if !u.is_deleted() => (true, u.is_system_admin),
            _ => (false, false),
        };

        if !user_exists {
            return Ok(CachedAuthContext {
                user_exists: false,
                is_system_admin: false,
                org_exists: false,
                membership_role: None,
            });
        }

        // Check if org exists
        let org = self.org_repo.find_by_id(org_id).await?;
        if org.is_none() {
            return Ok(CachedAuthContext {
                user_exists: true,
                is_system_admin,
                org_exists: false,
                membership_role: None,
            });
        }

        // Check membership
        let membership = self
            .membership_repo
            .find_by_user_and_org(user_id, org_id)
            .await?;

        Ok(CachedAuthContext {
            user_exists: true,
            is_system_admin,
            org_exists: true,
            membership_role: membership.map(|m| m.role),
        })
    }

    /// Check permission using pre-fetched context (no queries)
    fn check_permission_with_context(
        &self,
        ctx: &CachedAuthContext,
        permission: Permission,
    ) -> AuthorizationResult {
        if !ctx.user_exists {
            return AuthorizationResult::denied("User not found");
        }

        if !ctx.org_exists {
            return AuthorizationResult::denied("Organization not found");
        }
        if ctx.is_system_admin && permission.is_granted_to_system_admin_by_default() {
            return AuthorizationResult::allowed();
        }

        match ctx.membership_role {
            Some(role) => {
                if permission.is_allowed_for(role) {
                    AuthorizationResult::allowed()
                } else {
                    AuthorizationResult::denied(format!(
                        "Role '{}' does not have '{}' permission",
                        role.as_str(),
                        permission.as_str()
                    ))
                }
            }
            None => AuthorizationResult::denied("Not a member of this organization"),
        }
    }

    /// Check if user has any of the given permissions
    /// Fetches context once, then checks all permissions without additional queries
    pub async fn check_any_permission(
        &self,
        user_id: Uuid,
        org_id: Uuid,
        permissions: &[Permission],
    ) -> Result<AuthorizationResult, AppError> {
        let ctx = self.fetch_auth_context(user_id, org_id).await?;
        for permission in permissions {
            let result = self.check_permission_with_context(&ctx, *permission);
            if result.allowed {
                return Ok(result);
            }
        }
        Ok(AuthorizationResult::denied(
            "None of the required permissions are granted",
        ))
    }

    /// Check if user has all of the given permissions
    /// Fetches context once, then checks all permissions without additional queries
    pub async fn check_all_permissions(
        &self,
        user_id: Uuid,
        org_id: Uuid,
        permissions: &[Permission],
    ) -> Result<AuthorizationResult, AppError> {
        let ctx = self.fetch_auth_context(user_id, org_id).await?;
        if !ctx.user_exists || !ctx.org_exists || permissions.is_empty() {
            return Ok(AuthorizationResult::denied(
                "Missing authorization context or permissions",
            ));
        }
        for permission in permissions {
            let result = self.check_permission_with_context(&ctx, *permission);
            if !result.allowed {
                return Ok(result);
            }
        }
        Ok(AuthorizationResult::allowed())
    }

    /// Get all permissions for a user in an organization
    pub async fn get_user_permissions(
        &self,
        user_id: Uuid,
        org_id: Uuid,
    ) -> Result<Vec<Permission>, AppError> {
        let ctx = self.fetch_auth_context(user_id, org_id).await?;
        Ok(Permission::ALL
            .iter()
            .copied()
            .filter(|permission| {
                self.check_permission_with_context(&ctx, *permission)
                    .allowed
            })
            .collect())
    }

    /// Build auth context for a user in an organization
    pub async fn build_context(
        &self,
        user_id: Uuid,
        org_id: Option<Uuid>,
    ) -> Result<AuthContext, AppError> {
        let user = self
            .user_repo
            .find_by_id(user_id)
            .await?
            .ok_or(AppError::NotFound("User not found".into()))?;

        if user.is_deleted() {
            return Err(AppError::Forbidden("User is inactive".into()));
        }
        let (org_id, role) = if let Some(oid) = org_id {
            if self.org_repo.find_by_id(oid).await?.is_none() {
                return Err(AppError::NotFound("Organization not found".into()));
            }
            let membership = self
                .membership_repo
                .find_by_user_and_org(user_id, oid)
                .await?;
            (Some(oid), membership.map(|m| m.role))
        } else {
            (None, None)
        };

        Ok(AuthContext {
            user_id,
            org_id,
            role,
            is_system_admin: user.is_system_admin,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_permission_for_role() {
        // Owner has all permissions
        let owner_perms = Permission::for_role(OrgRole::Owner);
        assert!(owner_perms.contains(&Permission::OrgDelete));
        assert!(owner_perms.contains(&Permission::MemberRoleChange));
        assert!(owner_perms.contains(&Permission::ManageExtensionTrust));

        // Admin has most permissions but not org delete
        let admin_perms = Permission::for_role(OrgRole::Admin);
        assert!(!admin_perms.contains(&Permission::OrgDelete));
        assert!(!admin_perms.contains(&Permission::ManageExtensionTrust));
        assert!(admin_perms.contains(&Permission::MemberInvite));

        // Member has limited permissions
        let member_perms = Permission::for_role(OrgRole::Member);
        assert!(!member_perms.contains(&Permission::MemberInvite));
        assert!(member_perms.contains(&Permission::OrgRead));
    }

    #[test]
    fn test_permission_is_allowed_for() {
        assert!(Permission::OrgDelete.is_allowed_for(OrgRole::Owner));
        assert!(!Permission::OrgDelete.is_allowed_for(OrgRole::Admin));
        assert!(!Permission::OrgDelete.is_allowed_for(OrgRole::Member));

        assert!(Permission::MemberInvite.is_allowed_for(OrgRole::Owner));
        assert!(Permission::MemberInvite.is_allowed_for(OrgRole::Admin));
        assert!(!Permission::MemberInvite.is_allowed_for(OrgRole::Member));

        assert!(Permission::ManageExtensionTrust.is_allowed_for(OrgRole::Owner));
        assert!(!Permission::ManageExtensionTrust.is_allowed_for(OrgRole::Admin));
        assert!(!Permission::ManageExtensionTrust.is_allowed_for(OrgRole::Member));
    }

    #[test]
    fn test_permission_string_conversion() {
        assert_eq!(Permission::OrgRead.as_str(), "org:read");
        assert_eq!(Permission::from_str("org:read"), Some(Permission::OrgRead));
        assert_eq!(
            Permission::from_str("manage_extension_trust"),
            Some(Permission::ManageExtensionTrust)
        );
        assert_eq!(Permission::from_str("invalid"), None);
    }

    #[test]
    fn system_admin_requires_owner_role_for_extension_trust() {
        let service = AuthorizationService {
            user_repo: Arc::new(crate::repositories::InMemoryUserRepository::new()),
            org_repo: Arc::new(crate::repositories::InMemoryOrgRepository::new()),
            membership_repo: Arc::new(crate::repositories::InMemoryMembershipRepository::new()),
        };
        let admin_context = CachedAuthContext {
            user_exists: true,
            is_system_admin: true,
            org_exists: true,
            membership_role: Some(OrgRole::Admin),
        };
        let owner_context = CachedAuthContext {
            membership_role: Some(OrgRole::Owner),
            ..admin_context.clone()
        };

        assert!(
            service
                .check_permission_with_context(&admin_context, Permission::OrgUpdate)
                .allowed
        );
        assert!(
            !service
                .check_permission_with_context(&admin_context, Permission::ManageExtensionTrust)
                .allowed
        );
        assert!(
            service
                .check_permission_with_context(&owner_context, Permission::ManageExtensionTrust)
                .allowed
        );
    }
    #[test]
    fn authorization_matrix_rejects_missing_user_or_org_even_for_system_admin() {
        let service = AuthorizationService::new(
            Arc::new(crate::repositories::InMemoryUserRepository::new()),
            Arc::new(crate::repositories::InMemoryOrgRepository::new()),
            Arc::new(crate::repositories::InMemoryMembershipRepository::new()),
        );
        for user_exists in [false, true] {
            for org_exists in [false, true] {
                for is_system_admin in [false, true] {
                    for permission in Permission::ALL {
                        let ctx = CachedAuthContext {
                            user_exists,
                            org_exists,
                            is_system_admin,
                            membership_role: Some(OrgRole::Owner),
                        };
                        assert_eq!(
                            service
                                .check_permission_with_context(&ctx, *permission)
                                .allowed,
                            user_exists && org_exists
                        );
                    }
                }
            }
        }
    }
}
