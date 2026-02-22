//! Authorization service for role-based access control
//!
//! # Performance (P-03)
//!
//! The batch methods (`check_any_permission`, `check_all_permissions`) use a cached context
//! pattern to avoid N+1 queries. They fetch user/org/membership data once, then check
//! multiple permissions without additional database calls.
//!
//! Single `check_permission` calls still perform 3 queries (user, org, membership).
//! For repeated single-permission checks in a hot path, callers should consider
//! batching into `check_all_permissions` or `check_any_permission`.
//!
//! # Future Improvement (S-08)
//!
//! Cross-request caching (e.g., TTL-based user/membership cache) is not currently
//! implemented. Current approach is intentionally simple to avoid cache invalidation
//! complexity and ensure permission changes take effect immediately. For high-traffic
//! deployments, consider adding opt-in caching with short TTL (~30s) behind a feature
//! flag, ensuring cache invalidation on role changes.

use crate::errors::AppError;
use crate::repositories::{MembershipRepository, OrgRepository, OrgRole, UserRepository};
use std::sync::Arc;
use uuid::Uuid;

/// Permissions that can be checked for authorization
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Permission {
    // Organization permissions
    OrgRead,
    OrgUpdate,
    OrgDelete,

    // Member permissions
    MemberRead,
    MemberInvite,
    MemberRemove,
    MemberRoleChange,

    // Invite permissions
    InviteRead,
    InviteCreate,
    InviteCancel,

    // Audit permissions
    AuditRead,
}

impl Permission {
    /// Convert permission to string for API responses
    pub fn as_str(&self) -> &'static str {
        match self {
            Permission::OrgRead => "org:read",
            Permission::OrgUpdate => "org:update",
            Permission::OrgDelete => "org:delete",
            Permission::MemberRead => "member:read",
            Permission::MemberInvite => "member:invite",
            Permission::MemberRemove => "member:remove",
            Permission::MemberRoleChange => "member:role_change",
            Permission::InviteRead => "invite:read",
            Permission::InviteCreate => "invite:create",
            Permission::InviteCancel => "invite:cancel",
            Permission::AuditRead => "audit:read",
        }
    }

    /// Parse permission from string (returns None for invalid values)
    #[allow(clippy::should_implement_trait)]
    pub fn from_str(s: &str) -> Option<Permission> {
        match s {
            "org:read" => Some(Permission::OrgRead),
            "org:update" => Some(Permission::OrgUpdate),
            "org:delete" => Some(Permission::OrgDelete),
            "member:read" => Some(Permission::MemberRead),
            "member:invite" => Some(Permission::MemberInvite),
            "member:remove" => Some(Permission::MemberRemove),
            "member:role_change" => Some(Permission::MemberRoleChange),
            "invite:read" => Some(Permission::InviteRead),
            "invite:create" => Some(Permission::InviteCreate),
            "invite:cancel" => Some(Permission::InviteCancel),
            "audit:read" => Some(Permission::AuditRead),
            _ => None,
        }
    }

    /// Get all permissions for a role
    pub fn for_role(role: OrgRole) -> Vec<Permission> {
        match role {
            OrgRole::Owner => vec![
                Permission::OrgRead,
                Permission::OrgUpdate,
                Permission::OrgDelete,
                Permission::MemberRead,
                Permission::MemberInvite,
                Permission::MemberRemove,
                Permission::MemberRoleChange,
                Permission::InviteRead,
                Permission::InviteCreate,
                Permission::InviteCancel,
                Permission::AuditRead,
            ],
            OrgRole::Admin => vec![
                Permission::OrgRead,
                Permission::OrgUpdate,
                Permission::MemberRead,
                Permission::MemberInvite,
                Permission::MemberRemove,
                Permission::MemberRoleChange,
                Permission::InviteRead,
                Permission::InviteCreate,
                Permission::InviteCancel,
                Permission::AuditRead,
            ],
            OrgRole::Member => vec![
                Permission::OrgRead,
                Permission::MemberRead,
                Permission::InviteRead,
            ],
        }
    }

    /// Check if a role has this permission
    pub fn is_allowed_for(&self, role: OrgRole) -> bool {
        match role {
            OrgRole::Owner => true,
            OrgRole::Admin => !matches!(self, Permission::OrgDelete),
            OrgRole::Member => matches!(
                self,
                Permission::OrgRead | Permission::MemberRead | Permission::InviteRead
            ),
        }
    }
}

/// Authorization context from validated request
#[derive(Debug, Clone)]
pub struct AuthContext {
    pub user_id: Uuid,
    pub org_id: Option<Uuid>,
    pub role: Option<OrgRole>,
    pub is_system_admin: bool,
}

/// P-03: Cached auth context to avoid N+1 queries in batch permission checks
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

    /// P-03: Fetch auth context once for use with multiple permission checks.
    /// This avoids N+1 queries when checking multiple permissions.
    async fn fetch_auth_context(
        &self,
        user_id: Uuid,
        org_id: Uuid,
    ) -> Result<CachedAuthContext, AppError> {
        // Check if user exists and is system admin
        let user = self.user_repo.find_by_id(user_id).await?;
        let (user_exists, is_system_admin) = match user {
            Some(u) => (true, u.is_system_admin),
            None => (false, false),
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

        if ctx.is_system_admin {
            return AuthorizationResult::allowed();
        }

        if !ctx.org_exists {
            return AuthorizationResult::denied("Organization not found");
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
    /// P-03: Fetches context once, then checks all permissions without additional queries
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
    /// P-03: Fetches context once, then checks all permissions without additional queries
    pub async fn check_all_permissions(
        &self,
        user_id: Uuid,
        org_id: Uuid,
        permissions: &[Permission],
    ) -> Result<AuthorizationResult, AppError> {
        let ctx = self.fetch_auth_context(user_id, org_id).await?;
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
        // Check if user is a system admin
        let user = self.user_repo.find_by_id(user_id).await?;
        if let Some(user) = user {
            if user.is_system_admin {
                // System admins have all permissions
                return Ok(Permission::for_role(OrgRole::Owner));
            }
        } else {
            return Ok(vec![]);
        }

        // Check membership
        let membership = self
            .membership_repo
            .find_by_user_and_org(user_id, org_id)
            .await?;

        match membership {
            Some(m) => Ok(Permission::for_role(m.role)),
            None => Ok(vec![]),
        }
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

        let (org_id, role) = if let Some(oid) = org_id {
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

        // Admin has most permissions but not org delete
        let admin_perms = Permission::for_role(OrgRole::Admin);
        assert!(!admin_perms.contains(&Permission::OrgDelete));
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
    }

    #[test]
    fn test_permission_string_conversion() {
        assert_eq!(Permission::OrgRead.as_str(), "org:read");
        assert_eq!(Permission::from_str("org:read"), Some(Permission::OrgRead));
        assert_eq!(Permission::from_str("invalid"), None);
    }
}
