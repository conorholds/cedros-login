use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

/// Host-resolvable admin sidebar icon names.
///
/// The Cedros platform host owns the icon registry; these are the names announced
/// by the core team. Extensions reference one of these strings in
/// `adminModules[].sectionIcons[sectionId]` so the host can render an icon
/// next to the entry even when sections come from the manifest only and not
/// from the loaded React module.
///
/// Add a new name here only after the core team confirms the host renders it.
pub const HOST_ADMIN_ICON_NAMES: &[&str] = &[
    "account",
    "analytics",
    "email",
    "extensions",
    "history",
    "providers",
    "security",
    "team",
];

/// Returns `true` when `name` is in the host-resolvable icon allowlist.
pub fn is_host_admin_icon_name(name: &str) -> bool {
    HOST_ADMIN_ICON_NAMES.contains(&name)
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionAdminModuleManifest {
    pub module_id: String,
    pub extension_id: String,
    pub display_name: String,
    pub version: String,
    pub package_name: String,
    #[serde(default)]
    pub section_ids: Vec<String>,
    /// Host-resolvable string icon names per qualified section id.
    /// Required because React `icon` ReactNodes do not survive serialization
    /// to the host's manifest-driven sidebar renderer.
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub section_icons: BTreeMap<String, String>,
    pub navigation: CedrosExtensionAdminNavigationManifest,
    #[serde(default)]
    pub slots: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub contributions: Option<CedrosExtensionAdminModuleContributionsManifest>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionAdminNavigationManifest {
    pub sections: Vec<CedrosExtensionAdminNavigationSectionManifest>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub groups: Vec<CedrosExtensionAdminNavigationGroupManifest>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionAdminNavigationSectionManifest {
    pub id: String,
    pub label: String,
    pub group: String,
    pub order: i32,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub required_permission: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub replaces_section_ids: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub admin_page_access: Option<CedrosExtensionAdminPageAccessManifest>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionAdminPageAccessManifest {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub configurable: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub protected: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub route_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionAdminNavigationGroupManifest {
    pub id: String,
    pub label: String,
    pub order: i32,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub default_collapsed: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub hide_label: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionAdminModuleContributionsManifest {
    #[serde(default)]
    pub dashboard_cards: Vec<CedrosExtensionDashboardCardManifest>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionDashboardCardManifest {
    pub id: String,
    pub display_name: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub order: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionAnalyticsManifest {
    #[serde(default)]
    pub events: Vec<CedrosExtensionAnalyticsEventManifest>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionAnalyticsEventManifest {
    pub id: String,
    pub display_name: String,
    pub description: String,
    pub category: String,
    pub visibility: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionProviderAccessManifest {
    pub id: String,
    pub provider: String,
    pub display_name: String,
    pub description: String,
    pub scopes: Vec<String>,
    #[serde(default)]
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionCrmSourceAccessManifest {
    pub id: String,
    pub source_kind: String,
    pub display_name: String,
    pub description: String,
    pub scopes: Vec<String>,
    pub event_types: Vec<String>,
    #[serde(default)]
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionDatabaseAccessManifest {
    pub id: String,
    pub display_name: String,
    pub description: String,
    pub content_models: Vec<String>,
    pub migrations: Vec<String>,
    pub scopes: Vec<CedrosExtensionDatabaseScopeManifest>,
    #[serde(default)]
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionDatabaseScopeManifest {
    pub verb: String,
    pub resource: String,
    pub summary: String,
}

pub fn cedros_login_content_models() -> Vec<String> {
    ids(&[
        // Grouped catch-all for identity tables not yet ported to dedicated models.
        "cedros-login:identity-records",
        // Dedicated per-table identity models (auto-provisioned at install).
        "cedros-login:sessions",
        "cedros-login:users",
        "cedros-login:user-emails",
        "cedros-login:nonces",
        "cedros-login:verifications",
        "cedros-login:login-attempts",
        "cedros-login:totp",
        "cedros-login:api-key-records",
        "cedros-login:outbox",
        "cedros-login:credentials",
        "cedros-login:sso-providers",
        "cedros-login:sso-identities",
        "cedros-login:organization-records",
        "cedros-login:orgs",
        "cedros-login:memberships",
        "cedros-login:invite-records",
        "cedros-login:invite-codes",
        "cedros-login:invite-code-accounts",
        "cedros-login:custom-roles",
        "cedros-login:policies",
        "cedros-login:settings-audit-records",
        "cedros-login:oauth-connections",
    ])
}

pub fn cedros_login_migrations() -> Vec<String> {
    ids(&[
        "cedros-login:identity-schema-v1",
        "cedros-login:organization-schema-v1",
        "cedros-login:settings-audit-schema-v1",
    ])
}

pub fn cedros_login_jobs() -> Vec<String> {
    ids(&[
        "cedros-login:cleanup-expired-auth-data",
        "cedros-login:outbox-dispatch",
        "cedros-login:oauth-connection-cleanup",
    ])
}

pub fn cedros_login_events() -> Vec<String> {
    ANALYTICS_EVENT_SPECS
        .iter()
        .map(|(id, _, _)| (*id).to_string())
        .collect()
}

pub const CEDROS_LOGIN_ADMIN_SECTION_ID: &str = "cedros-login:login";
pub const CEDROS_LOGIN_ADMIN_SECTION_ICON: &str = "account";
pub const CEDROS_LOGIN_ADMIN_SECTION_LABEL: &str = "Login";
pub const CEDROS_LOGIN_ADMIN_SECTION_GROUP: &str = "Extension Settings";
pub const CEDROS_LOGIN_ADMIN_SECTION_ORDER: i32 = 0;
pub const CEDROS_LOGIN_ADMIN_SECTION_PERMISSION: &str = "manage_settings";
pub const CEDROS_LOGIN_ADMIN_SECTION_ROUTE_PATH: &str = "/settings/login";
pub const CEDROS_LOGIN_DASHBOARD_CARD_ID: &str = "cedros-login:identity-health-card";
pub const CEDROS_LOGIN_DASHBOARD_CARD_ORDER: i32 = 20;
const CEDROS_LOGIN_REPLACEMENT_IDS: &[&str] = &[
    "cedros-data:account-settings",
    "account-settings",
    "cedros-login:account-settings",
    "cedros-login:settings-email",
    "cedros-login:settings-webhooks",
    "cedros-login:settings-server",
    "cedros-login:settings-images",
    "cedros-login:activity",
];

pub fn cedros_login_admin_modules(version: &str) -> Vec<CedrosExtensionAdminModuleManifest> {
    // Validate at construction time so a typo in CEDROS_LOGIN_ADMIN_SECTION_ICON
    // panics during manifest export (used by the JSON generator) rather than
    // shipping an unrecognised icon name silently.
    assert!(
        is_host_admin_icon_name(CEDROS_LOGIN_ADMIN_SECTION_ICON),
        "CEDROS_LOGIN_ADMIN_SECTION_ICON '{CEDROS_LOGIN_ADMIN_SECTION_ICON}' is not in HOST_ADMIN_ICON_NAMES"
    );

    // Team / Team Invites are owned by the Cedros platform host now — it keeps those
    // pages core-owned and reads our roster through the cedros-login-team-directory
    // host service — so the extension only contributes the Login (auth) section.
    let mut section_icons = BTreeMap::new();
    section_icons.insert(
        CEDROS_LOGIN_ADMIN_SECTION_ID.to_string(),
        CEDROS_LOGIN_ADMIN_SECTION_ICON.to_string(),
    );

    vec![CedrosExtensionAdminModuleManifest {
        module_id: "cedros-login:admin".to_string(),
        extension_id: "cedros-login".to_string(),
        display_name: "Cedros Login".to_string(),
        version: version.to_string(),
        package_name: "@cedros/login-react".to_string(),
        section_ids: ids(&[CEDROS_LOGIN_ADMIN_SECTION_ID]),
        section_icons,
        navigation: CedrosExtensionAdminNavigationManifest {
            sections: vec![CedrosExtensionAdminNavigationSectionManifest {
                id: CEDROS_LOGIN_ADMIN_SECTION_ID.to_string(),
                label: CEDROS_LOGIN_ADMIN_SECTION_LABEL.to_string(),
                group: CEDROS_LOGIN_ADMIN_SECTION_GROUP.to_string(),
                order: CEDROS_LOGIN_ADMIN_SECTION_ORDER,
                required_permission: Some(CEDROS_LOGIN_ADMIN_SECTION_PERMISSION.to_string()),
                replaces_section_ids: ids(CEDROS_LOGIN_REPLACEMENT_IDS),
                admin_page_access: Some(CedrosExtensionAdminPageAccessManifest {
                    configurable: None,
                    protected: None,
                    route_path: Some(CEDROS_LOGIN_ADMIN_SECTION_ROUTE_PATH.to_string()),
                }),
            }],
            groups: vec![CedrosExtensionAdminNavigationGroupManifest {
                id: CEDROS_LOGIN_ADMIN_SECTION_GROUP.to_string(),
                label: CEDROS_LOGIN_ADMIN_SECTION_GROUP.to_string(),
                order: 1,
                default_collapsed: None,
                hide_label: None,
            }],
        },
        slots: Vec::new(),
        contributions: Some(CedrosExtensionAdminModuleContributionsManifest {
            dashboard_cards: vec![CedrosExtensionDashboardCardManifest {
                id: CEDROS_LOGIN_DASHBOARD_CARD_ID.to_string(),
                display_name: "User Growth".to_string(),
                description: Some(
                    "Shows login-backed account growth, verification, active login, invite, and provider-mix health.".to_string(),
                ),
                order: Some(CEDROS_LOGIN_DASHBOARD_CARD_ORDER),
            }],
        }),
    }]
}

pub fn cedros_login_analytics() -> CedrosExtensionAnalyticsManifest {
    CedrosExtensionAnalyticsManifest {
        events: ANALYTICS_EVENT_SPECS
            .iter()
            .map(|(id, name, description)| event(id, name, description))
            .collect(),
    }
}

const ANALYTICS_EVENT_SPECS: &[(&str, &str, &str)] = &[
        ("cedros-login:authenticated", "Authenticated", "A user successfully authenticated through Cedros Login."),
        ("cedros-login:registered", "Registered", "A user account was created through Cedros Login."),
        ("cedros-login:logout", "Logged out", "A user session was ended through Cedros Login."),
        ("cedros-login:registration-created", "Registration created", "A registration notification seed was created through Cedros Login."),
        ("cedros-login:user-login", "User login", "A login notification seed was created through Cedros Login."),
        ("cedros-login:identifier-linked", "Identifier linked", "An additional sign-in method was linked to an existing account through Cedros Login."),
        ("cedros-login:identifier-unlinked", "Identifier unlinked", "An additional identifier was removed from an existing account through Cedros Login."),
        ("cedros-login:login-failed", "Login failed", "A sign-in attempt was rejected before a session was issued through Cedros Login."),
        ("cedros-login:account-locked", "Account locked", "An account was temporarily locked after repeated failed sign-in attempts through Cedros Login."),
        ("cedros-login:token-reuse-detected", "Token reuse detected", "A rotated refresh token was replayed, signalling possible session theft, through Cedros Login."),
        ("cedros-login:mfa-enabled", "MFA enabled", "A user turned on multi-factor authentication through Cedros Login."),
        ("cedros-login:mfa-disabled", "MFA disabled", "A user turned off multi-factor authentication through Cedros Login."),
        ("cedros-login:password-reset-requested", "Password reset requested", "A user requested a password-reset email through Cedros Login."),
        ("cedros-login:password-reset-completed", "Password reset completed", "A user completed a password reset through Cedros Login."),
        ("cedros-login:email-verified", "Email verified", "A user verified an email address through Cedros Login."),
        ("cedros-login:account-deleted", "Account deleted", "A user account was deleted through Cedros Login."),
        ("cedros-login:invite-sent", "Team invite sent", "A team invitation was sent through Cedros Login."),
        ("cedros-login:invite-accepted", "Team invite accepted", "A team invitation was accepted through Cedros Login."),
];

pub fn cedros_login_provider_access() -> Vec<CedrosExtensionProviderAccessManifest> {
    vec![
        CedrosExtensionProviderAccessManifest {
            id: "cedros-login:email-provider".to_string(),
            provider: "email".to_string(),
            display_name: "Login transactional email".to_string(),
            description: "Send verification, reset, invitation, and instant-link emails through the site-owned email provider.".to_string(),
            scopes: ids(&["email.send", "email.design.resolve"]),
            tags: ids(&["identity", "email"]),
        },
        CedrosExtensionProviderAccessManifest {
            id: "cedros-login:image-storage".to_string(),
            provider: "storage".to_string(),
            display_name: "Login image storage".to_string(),
            description: "Store and read user profile images through the site-owned storage provider when image uploads are enabled.".to_string(),
            // The host storage provider dispatches on put/get/delete operation
            // names (see cedros-data wasm_extension_providers storage::execute +
            // its tests), and the scope check requires operation == a declared
            // scope — so the grant must name those verbs, not storage.read/write.
            scopes: ids(&["put", "get", "delete"]),
            tags: ids(&["identity", "profile-images"]),
        },
    ]
}

pub fn cedros_login_crm_source_access() -> Vec<CedrosExtensionCrmSourceAccessManifest> {
    vec![CedrosExtensionCrmSourceAccessManifest {
        id: "cedros-login:invite-gate-handoff".to_string(),
        source_kind: "cedros_login".to_string(),
        display_name: "Login invite-gate handoff".to_string(),
        description: "Submits an idempotent, non-PII pending-account handoff after a gated registration is durably created.".to_string(),
        scopes: ids(&["write"]),
        event_types: ids(&["invite_gate.pending"]),
        tags: ids(&["identity", "early-access", "waitlist"]),
    }]
}

fn event(id: &str, display_name: &str, description: &str) -> CedrosExtensionAnalyticsEventManifest {
    CedrosExtensionAnalyticsEventManifest {
        id: id.to_string(),
        display_name: display_name.to_string(),
        description: description.to_string(),
        category: "identity".to_string(),
        visibility: "authenticated".to_string(),
    }
}

fn ids(values: &[&str]) -> Vec<String> {
    values.iter().map(|value| (*value).to_string()).collect()
}
