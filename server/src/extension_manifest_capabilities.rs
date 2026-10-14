use crate::extension_manifest::{
    CedrosExtensionCapabilityManifest, CedrosExtensionCapabilityScopeManifest,
};

pub fn cedros_login_capabilities() -> Vec<CedrosExtensionCapabilityManifest> {
    vec![
        capability(
            "cedros-login:user-context",
            "Login User Context",
            "Publishes the authenticated user, current Login session, and active organization membership and role to authorized Cedros hosts.",
            "runtime",
            vec![
                scope("expose", "authenticated user context", "Expose the current user id, profile summary, and authoritative session state."),
                scope("expose", "organization context", "Expose current Login organization membership and role without site-level permissions."),
            ],
        ),
        capability(
            "cedros-login:identity-profile",
            "Login Identity Profile Projection",
            "Publishes a versioned, minimal Login-owned profile/security projection for the authenticated subject and separately scoped, tenant-bound support lookups.",
            "runtime",
            vec![
                scope("read", "current-user identity profile", "Read only the authenticated Login subject's five profile-completion booleans."),
                scope("read", "tenant identity profile", "Allow an explicitly scoped relying party to read the same minimal projection for a Login subject in an allowed organization."),
            ],
        ),
        capability(
            "cedros-login:session-manage",
            "Login Session Management",
            "Publishes session status and permission-gated account security actions such as invite, reset, revoke, logout-all, and MFA changes.",
            "admin",
            vec![
                scope("read", "session status", "Read authenticated session status and account security posture."),
                scope("call", "session security actions", "Call permission-gated session revocation, logout-all, MFA, invite, and reset workflows."),
            ],
        ),
        capability(
            "cedros-login:admin-auth",
            "Login Admin Authorization",
            "Publishes admin authorization context for Cedros Data Settings, Team, and CRM identity handoff flows.",
            "admin",
            vec![
                scope("read", "admin authorization context", "Read operator role and permission context supplied by the Cedros host."),
                scope("call", "authorization checks", "Evaluate permission-gated account, team, invite, settings, and audit actions."),
            ],
        ),
        capability(
            "cedros-login:site-brain-records",
            "Login Site Brain Records",
            "Writes redacted operational records for Login jobs, email delivery failures, first-run setup, and account security events.",
            "runtime",
            vec![
                scope("write", "site-brain-record:job", "Write redacted job completion and failure records."),
                scope("write", "site-brain-record:provider", "Write redacted email provider delivery failure records."),
                scope("write", "site-brain-record:security", "Write redacted account security event records (e.g. MFA disabled)."),
                scope("write", "site-brain-record:setup", "Write redacted first-run setup completion records."),
            ],
        ),
        capability(
            "cedros-login:auth-response",
            "Login Auth Response Contract",
            "Publishes auth session cookies and the public user/auth response, including invite-gate handoff status on pending registrations.",
            "runtime",
            vec![
                scope("expose", "auth session cookies", "Set the cedros_access and cedros_refresh cookies on auth-completing responses; logout expires both."),
                scope("expose", "auth response user body", "Expose the authenticated user summary, isNewUser, auth method, and truthful invite-gate handoff status."),
            ],
        ),
        capability(
            "cedros-login:invite-discount",
            "Login Invite Discount",
            "Publishes the subscription discount granted by a redeemed invite code (percent off, granting code, redeemed at) so billing extensions such as Cedros Pay can apply it at checkout.",
            "runtime",
            vec![
                scope("read", "invite discount grant", "Read the authenticated user's invite-code discount via GET /public-auth/account/invite-discount."),
            ],
        ),
    ]
}

fn capability(
    id: &str,
    display_name: &str,
    description: &str,
    category: &str,
    requested_scopes: Vec<CedrosExtensionCapabilityScopeManifest>,
) -> CedrosExtensionCapabilityManifest {
    CedrosExtensionCapabilityManifest {
        id: id.to_string(),
        display_name: display_name.to_string(),
        description: Some(description.to_string()),
        category: category.to_string(),
        requested_scopes,
    }
}

fn scope(verb: &str, resource: &str, summary: &str) -> CedrosExtensionCapabilityScopeManifest {
    CedrosExtensionCapabilityScopeManifest {
        verb: verb.to_string(),
        resource: resource.to_string(),
        summary: summary.to_string(),
    }
}
