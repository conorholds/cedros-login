use crate::extension_manifest_metadata::{
    CedrosExtensionDatabaseAccessManifest, CedrosExtensionDatabaseScopeManifest,
};

pub fn cedros_login_database_access() -> Vec<CedrosExtensionDatabaseAccessManifest> {
    let mut access = primary_database_access();
    access.extend(composite_database_access());
    access
}

fn primary_database_access() -> Vec<CedrosExtensionDatabaseAccessManifest> {
    vec![
        database(DatabaseAccessSpec {
            id: "cedros-login:identity-db",
            display_name: "Login Identity Database",
            description: "Reads, writes, and migrates users, sessions, credentials, verification tokens, MFA, WebAuthn, SSO, API keys, nonces, and login attempts.",
            content_models: &[
                "cedros-login:identity-records", "cedros-login:sessions", "cedros-login:users",
                "cedros-login:user-emails", "cedros-login:nonces", "cedros-login:verifications",
                "cedros-login:login-attempts", "cedros-login:totp",
                "cedros-login:api-key-records", "cedros-login:outbox",
                "cedros-login:credentials", "cedros-login:sso-providers",
                "cedros-login:sso-identities", "cedros-login:oauth-connections",
            ],
            migration: "cedros-login:identity-schema-v1",
            record_resource: "identity records",
            schema_resource: "identity schema",
            tags: &["identity", "auth", "security"],
        }),
        database(DatabaseAccessSpec {
            id: "cedros-login:org-db",
            display_name: "Login Organization Database",
            description: "Reads, writes, and migrates organization, membership, invite, role, policy, and access-code records.",
            content_models: &[
                "cedros-login:organization-records", "cedros-login:orgs",
                "cedros-login:memberships", "cedros-login:invite-records",
                "cedros-login:invite-codes", "cedros-login:invite-code-accounts",
                "cedros-login:custom-roles", "cedros-login:policies",
            ],
            migration: "cedros-login:organization-schema-v1",
            record_resource: "organization records",
            schema_resource: "organization schema",
            tags: &["identity", "organizations", "rbac"],
        }),
        database(DatabaseAccessSpec {
            id: "cedros-login:settings-audit-db",
            display_name: "Login Settings And Audit Database",
            description: "Reads, writes, and migrates system settings, dashboard permissions, audit logs, outbox events, webhook state, and operational records.",
            content_models: &["cedros-login:settings-audit-records"],
            migration: "cedros-login:settings-audit-schema-v1",
            record_resource: "settings and audit records",
            schema_resource: "settings and audit schema",
            tags: &["identity", "settings", "audit", "outbox"],
        }),
    ]
}

fn composite_database_access() -> Vec<CedrosExtensionDatabaseAccessManifest> {
    vec![
        composite_database(
            "cedros-login:oauth-consent-db",
            "Login OAuth Consent Transaction Database",
            "Atomically binds OAuth approval and its dedicated session to the current user, browser session, and selected organization membership.",
            &["cedros-login:oauth-connections", "cedros-login:users", "cedros-login:sessions", "cedros-login:memberships"],
            "OAuth consent records",
            &["identity", "oauth", "security"],
            true,
        ),
        composite_database(
            "cedros-login:registration-db",
            "Login Registration Transaction Database",
            "Reads signup-limit availability and atomically consumes registration proofs, creates identity/session/default-organization membership records, applies invite-code activation, and couples required verification mail to account creation.",
            &[
                "cedros-login:verifications", "cedros-login:nonces",
                "cedros-login:users", "cedros-login:user-emails",
                "cedros-login:credentials", "cedros-login:sso-identities",
                "cedros-login:sessions",
                "cedros-login:orgs", "cedros-login:memberships",
                "cedros-login:invite-codes", "cedros-login:invite-code-accounts",
                "cedros-login:outbox",
            ],
            "registration records",
            &["identity", "registration", "security"],
            true,
        ),
        composite_database(
            "cedros-login:account-lifecycle-db",
            "Login Account Lifecycle Transaction Database",
            "Atomically enforces administrator and organization invariants while deleting an account and its owned records.",
            &[
                "cedros-login:users", "cedros-login:sessions", "cedros-login:user-emails",
                "cedros-login:verifications", "cedros-login:login-attempts",
                "cedros-login:totp", "cedros-login:api-key-records", "cedros-login:outbox",
                "cedros-login:credentials", "cedros-login:sso-providers",
                "cedros-login:sso-identities",
                "cedros-login:orgs", "cedros-login:memberships",
                "cedros-login:invite-records", "cedros-login:invite-codes",
                "cedros-login:invite-code-accounts", "cedros-login:custom-roles",
                "cedros-login:policies",
            ],
            "account lifecycle records",
            &["identity", "organizations", "account-lifecycle", "security"],
            true,
        ),
        composite_database(
            "cedros-login:organization-lifecycle-db",
            "Login Organization Lifecycle Transaction Database",
            "Atomically verifies an organization owner and deletes the complete organization graph.",
            &[
                "cedros-login:orgs", "cedros-login:memberships",
                "cedros-login:invite-records", "cedros-login:custom-roles",
                "cedros-login:policies", "cedros-login:sso-providers",
            ],
            "organization lifecycle records",
            &["identity", "organizations", "organization-lifecycle", "security"],
            true,
        ),
    ]
}

struct DatabaseAccessSpec<'a> {
    id: &'a str,
    display_name: &'a str,
    description: &'a str,
    content_models: &'a [&'a str],
    migration: &'a str,
    record_resource: &'a str,
    schema_resource: &'a str,
    tags: &'a [&'a str],
}

fn database(spec: DatabaseAccessSpec<'_>) -> CedrosExtensionDatabaseAccessManifest {
    CedrosExtensionDatabaseAccessManifest {
        id: spec.id.to_string(),
        display_name: spec.display_name.to_string(),
        description: spec.description.to_string(),
        content_models: ids(spec.content_models),
        migrations: ids(&[spec.migration]),
        scopes: vec![
            scope("read", spec.record_resource),
            scope("write", spec.record_resource),
            scope("delete", spec.record_resource),
            scope("migrate", spec.schema_resource),
        ],
        tags: ids(spec.tags),
    }
}

fn composite_database(
    id: &str,
    display_name: &str,
    description: &str,
    content_models: &[&str],
    resource: &str,
    tags: &[&str],
    read: bool,
) -> CedrosExtensionDatabaseAccessManifest {
    let mut scopes = vec![scope("write", resource), scope("delete", resource)];
    if read {
        scopes.insert(0, scope("read", resource));
    }
    CedrosExtensionDatabaseAccessManifest {
        id: id.to_string(),
        display_name: display_name.to_string(),
        description: description.to_string(),
        content_models: ids(content_models),
        migrations: Vec::new(),
        scopes,
        tags: ids(tags),
    }
}

fn scope(verb: &str, resource: &str) -> CedrosExtensionDatabaseScopeManifest {
    CedrosExtensionDatabaseScopeManifest {
        verb: verb.to_string(),
        resource: resource.to_string(),
        summary: format!("{verb} {resource} through host-mediated Cedros database operations."),
    }
}

fn ids(values: &[&str]) -> Vec<String> {
    values.iter().map(|value| (*value).to_string()).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn organization_lifecycle_access_spans_every_cascade_model() {
        let accesses = cedros_login_database_access();
        let lifecycle = accesses
            .iter()
            .find(|access| access.id == "cedros-login:organization-lifecycle-db")
            .expect("organization lifecycle database access");
        assert_eq!(
            lifecycle.content_models,
            [
                "cedros-login:orgs",
                "cedros-login:memberships",
                "cedros-login:invite-records",
                "cedros-login:custom-roles",
                "cedros-login:policies",
                "cedros-login:sso-providers",
            ]
        );
        let account = accesses
            .iter()
            .find(|access| access.id == "cedros-login:account-lifecycle-db")
            .expect("account lifecycle database access");
        assert!(account
            .content_models
            .contains(&"cedros-login:sso-providers".to_string()));
        assert!(account
            .content_models
            .contains(&"cedros-login:sso-identities".to_string()));
    }

    #[test]
    fn registration_access_can_read_authoritative_signup_limit_status() {
        let accesses = cedros_login_database_access();
        let registration = accesses
            .iter()
            .find(|access| access.id == "cedros-login:registration-db")
            .expect("registration database access");
        assert!(registration.scopes.iter().any(|scope| scope.verb == "read"));
    }
}
