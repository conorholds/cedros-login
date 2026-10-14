use serde::{Deserialize, Serialize};

/// Role within an organization.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OrgRole {
    Owner,
    Admin,
    Member,
}

impl OrgRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            OrgRole::Owner => "owner",
            OrgRole::Admin => "admin",
            OrgRole::Member => "member",
        }
    }

    /// Parse role from string.
    #[allow(clippy::should_implement_trait)]
    pub fn from_str(s: &str) -> Option<Self> {
        if s.eq_ignore_ascii_case("owner") {
            Some(OrgRole::Owner)
        } else if s.eq_ignore_ascii_case("admin") {
            Some(OrgRole::Admin)
        } else if s.eq_ignore_ascii_case("member") {
            Some(OrgRole::Member)
        } else {
            None
        }
    }

    /// Check if this role has at least the permissions of another role.
    pub fn has_at_least(&self, other: OrgRole) -> bool {
        self.level() >= other.level()
    }

    fn level(&self) -> u8 {
        match self {
            OrgRole::Owner => 3,
            OrgRole::Admin => 2,
            OrgRole::Member => 1,
        }
    }
}

impl std::fmt::Display for OrgRole {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// Permission that can be granted through built-in or custom organization roles.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Permission {
    OrgRead,
    OrgUpdate,
    OrgDelete,
    MemberRead,
    MemberInvite,
    MemberRemove,
    MemberRoleChange,
    InviteRead,
    InviteCreate,
    InviteCancel,
    AuditRead,
    ManageExtensionTrust,
}

impl Permission {
    /// Every recognized permission in stable wire-order.
    pub const ALL: &'static [Permission] = &[
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
        Permission::ManageExtensionTrust,
    ];

    /// Stable wire value used in API responses, custom roles, and policy checks.
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
            Permission::ManageExtensionTrust => "manage_extension_trust",
        }
    }

    /// Parse a stable wire permission value.
    #[allow(clippy::should_implement_trait)]
    pub fn from_str(s: &str) -> Option<Permission> {
        Self::ALL
            .iter()
            .copied()
            .find(|permission| permission.as_str() == s)
    }

    /// Built-in permissions granted by each organization role.
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
                Permission::ManageExtensionTrust,
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

    /// Whether a built-in organization role grants this permission.
    pub fn is_allowed_for(&self, role: OrgRole) -> bool {
        match role {
            OrgRole::Owner => true,
            OrgRole::Admin => !matches!(
                self,
                Permission::OrgDelete | Permission::ManageExtensionTrust
            ),
            OrgRole::Member => matches!(
                self,
                Permission::OrgRead | Permission::MemberRead | Permission::InviteRead
            ),
        }
    }

    /// Whether a system administrator receives this permission implicitly.
    /// Extension trust approval stays Owner-only unless explicitly granted.
    pub fn is_granted_to_system_admin_by_default(&self) -> bool {
        !matches!(self, Permission::ManageExtensionTrust)
    }

    /// Built-in permissions granted to a system administrator by default.
    pub fn for_system_admin() -> Vec<Permission> {
        Permission::for_role(OrgRole::Owner)
            .into_iter()
            .filter(Permission::is_granted_to_system_admin_by_default)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::{OrgRole, Permission};

    #[test]
    fn owner_has_all_builtin_permissions() {
        let owner_perms = Permission::for_role(OrgRole::Owner);
        assert!(owner_perms.contains(&Permission::OrgDelete));
        assert!(owner_perms.contains(&Permission::MemberRoleChange));
        assert!(owner_perms.contains(&Permission::ManageExtensionTrust));

        let admin_perms = Permission::for_role(OrgRole::Admin);
        assert!(!admin_perms.contains(&Permission::ManageExtensionTrust));

        let system_admin_perms = Permission::for_system_admin();
        assert!(!system_admin_perms.contains(&Permission::ManageExtensionTrust));
    }

    #[test]
    fn builtin_matrix_is_exhaustive_and_consistent() {
        for role in [OrgRole::Owner, OrgRole::Admin, OrgRole::Member] {
            let listed = Permission::for_role(role);
            for permission in Permission::ALL {
                assert_eq!(
                    listed.contains(permission),
                    permission.is_allowed_for(role),
                    "matrix mismatch for role={role} permission={}",
                    permission.as_str()
                );
            }
        }
    }

    #[test]
    fn parses_stable_wire_values() {
        assert_eq!(Permission::OrgRead.as_str(), "org:read");
        assert_eq!(Permission::from_str("org:read"), Some(Permission::OrgRead));
        assert_eq!(
            Permission::ManageExtensionTrust.as_str(),
            "manage_extension_trust"
        );
        assert_eq!(
            Permission::from_str("manage_extension_trust"),
            Some(Permission::ManageExtensionTrust)
        );
        assert_eq!(Permission::from_str("invalid"), None);
    }

    #[test]
    fn parses_role_values_without_allocation() {
        assert_eq!(OrgRole::from_str("OWNER"), Some(OrgRole::Owner));
        assert_eq!(OrgRole::from_str("viewer"), None);
        assert!(OrgRole::Owner.has_at_least(OrgRole::Admin));
        assert!(!OrgRole::Member.has_at_least(OrgRole::Admin));
    }
}
