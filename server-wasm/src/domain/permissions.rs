//! Organization roles + permissions. Pure domain logic (no IO), ported from
//! `server/src/domain/permissions.rs`. `OrgRole` is stored on memberships and
//! stamped into the access-token `role` claim; `Permission` is the stable wire
//! vocabulary that custom roles grant.

/// A permission a built-in or custom organization role can grant.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
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
    /// Every permission (for listing + custom-role validation).
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

    /// Stable wire value (custom-role grants, API responses).
    pub fn as_str(self) -> &'static str {
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
    pub fn from_str(s: &str) -> Option<Permission> {
        Permission::ALL.iter().copied().find(|p| p.as_str() == s)
    }

    /// Whether `s` is a recognized permission wire value.
    pub fn is_valid(s: &str) -> bool {
        Permission::from_str(s).is_some()
    }

    /// Built-in role→permission matrix (the RBAC fallback when no ABAC policy
    /// matches). Owner: all; Admin: all except org delete; Member: read-only.
    /// Ported from `server/src/domain/permissions.rs::is_allowed_for`.
    pub fn is_allowed_for(self, role: OrgRole) -> bool {
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

    /// Every built-in permission granted to `role`.
    #[cfg(test)]
    pub fn for_role(role: OrgRole) -> Vec<Permission> {
        Permission::ALL
            .iter()
            .copied()
            .filter(|permission| permission.is_allowed_for(role))
            .collect()
    }

    /// Whether a system administrator receives this permission implicitly.
    /// Extension trust approval stays Owner-only unless explicitly granted.
    pub fn is_granted_to_system_admin_by_default(self) -> bool {
        !matches!(self, Permission::ManageExtensionTrust)
    }

    /// Built-in permissions granted to a system administrator by default.
    #[cfg(test)]
    pub fn for_system_admin() -> Vec<Permission> {
        Permission::ALL
            .iter()
            .copied()
            .filter(|permission| permission.is_granted_to_system_admin_by_default())
            .collect()
    }
}

/// Role within an organization. Ordered: owner > admin > member.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OrgRole {
    Owner,
    Admin,
    Member,
}

impl OrgRole {
    /// Stable wire value (token claim, API responses, stored membership row).
    pub fn as_str(self) -> &'static str {
        match self {
            OrgRole::Owner => "owner",
            OrgRole::Admin => "admin",
            OrgRole::Member => "member",
        }
    }

    /// Parse a stored/role string. Unknown values return `None` (caller fails closed).
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

    /// Whether this role has at least the privileges of `other`.
    pub fn has_at_least(self, other: OrgRole) -> bool {
        self.level() >= other.level()
    }

    fn level(self) -> u8 {
        match self {
            OrgRole::Owner => 3,
            OrgRole::Admin => 2,
            OrgRole::Member => 1,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{OrgRole, Permission};

    #[test]
    fn parses_case_insensitively_and_rejects_unknown() {
        assert_eq!(OrgRole::from_str("OWNER"), Some(OrgRole::Owner));
        assert_eq!(OrgRole::from_str("member"), Some(OrgRole::Member));
        assert_eq!(OrgRole::from_str("viewer"), None);
    }

    #[test]
    fn ordering_is_owner_admin_member() {
        assert!(OrgRole::Owner.has_at_least(OrgRole::Admin));
        assert!(OrgRole::Admin.has_at_least(OrgRole::Member));
        assert!(!OrgRole::Member.has_at_least(OrgRole::Admin));
        assert_eq!(OrgRole::Admin.as_str(), "admin");
    }

    #[test]
    fn permission_wire_values_round_trip() {
        assert_eq!(
            Permission::from_str("member:invite"),
            Some(Permission::MemberInvite)
        );
        assert_eq!(Permission::from_str("bogus"), None);
        assert!(Permission::is_valid("audit:read"));
        assert_eq!(
            Permission::from_str("manage_extension_trust"),
            Some(Permission::ManageExtensionTrust)
        );
        assert_eq!(
            Permission::ManageExtensionTrust.as_str(),
            "manage_extension_trust"
        );
        assert!(Permission::ManageExtensionTrust.is_allowed_for(OrgRole::Owner));
        assert!(!Permission::ManageExtensionTrust.is_allowed_for(OrgRole::Admin));
        assert!(!Permission::ManageExtensionTrust.is_allowed_for(OrgRole::Member));
        assert!(!Permission::for_system_admin().contains(&Permission::ManageExtensionTrust));
        assert_eq!(Permission::ALL.len(), 12);
    }

    #[test]
    fn builtin_matrix_is_exhaustive_and_consistent() {
        for role in [OrgRole::Owner, OrgRole::Admin, OrgRole::Member] {
            let listed = Permission::for_role(role);
            for permission in Permission::ALL {
                assert_eq!(
                    listed.contains(permission),
                    permission.is_allowed_for(role),
                    "matrix mismatch for role={} permission={}",
                    role.as_str(),
                    permission.as_str()
                );
            }
        }
    }
}
