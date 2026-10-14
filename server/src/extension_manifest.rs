use serde::{Deserialize, Serialize};

use crate::extension_ai_surface::cedros_login_ai_surface;
use crate::extension_jobs::{cedros_login_job_schedules, CedrosExtensionJobScheduleManifest};
use crate::extension_manifest_capabilities::cedros_login_capabilities;
use crate::extension_manifest_database_access::cedros_login_database_access;
use crate::extension_manifest_metadata::{
    cedros_login_admin_modules, cedros_login_analytics, cedros_login_content_models,
    cedros_login_crm_source_access, cedros_login_events, cedros_login_jobs,
    cedros_login_migrations, cedros_login_provider_access, CedrosExtensionAdminModuleManifest,
    CedrosExtensionAnalyticsManifest, CedrosExtensionCrmSourceAccessManifest,
    CedrosExtensionDatabaseAccessManifest, CedrosExtensionProviderAccessManifest,
};
use crate::extension_onboarding::{
    cedros_login_onboarding_pages, CedrosExtensionOnboardingPageManifest,
};
use crate::extension_server_routes::cedros_login_routes;
use crate::extension_setup_seeds::{cedros_login_setup_seeds, CedrosExtensionSetupSeedsManifest};
use crate::extension_starters::{
    cedros_login_docs_articles, cedros_login_form_templates, CedrosExtensionDocsArticleManifest,
    CedrosExtensionFormTemplateManifest,
};
use crate::extension_visual_builder::{
    cedros_login_content_block_types, cedros_login_content_blocks,
    cedros_login_content_template_ids, cedros_login_content_templates, cedros_login_page_seed_ids,
    cedros_login_page_seeds, CedrosExtensionContentBlockManifest,
    CedrosExtensionContentTemplateManifest, CedrosExtensionPageSeedManifest,
};

pub const CEDROS_EXTENSION_PLATFORM_API_VERSION: &str = "1";
pub const CEDROS_EXTENSION_MIN_CEDROS_DATA_VERSION: &str = "0.1.91";
pub const CEDROS_EXTENSION_WIT_CHECKSUM: &str =
    "2bb16879743cfd2748b7deefefcb82204c16b55a1c1a70385f4e9707a83d48f9";
pub const CEDROS_LOGIN_EXTENSION_ID: &str = "cedros-login";
pub const CEDROS_LOGIN_EXTENSION_VERSION: &str = "2.0.22";
pub const CEDROS_LOGIN_REACT_PACKAGE_VERSION: &str = "2.0.22";
pub const CEDROS_LOGIN_REACT_NATIVE_PACKAGE_VERSION: &str = "2.0.22";
pub const CEDROS_LOGIN_SERVER_REGISTRATION_ENTRYPOINT: &str =
    "cedros_login::register_extension_family";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionManifest {
    pub schema_version: u8,
    pub extension_id: String,
    pub display_name: String,
    pub version: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub compatibility: CedrosExtensionCompatibilityManifest,
    pub platform_api_version: String,
    pub package_family: CedrosExtensionPackageFamily,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub dependencies: Option<CedrosExtensionDependenciesManifest>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub required_services: Vec<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub required_capabilities: Vec<String>,
    pub surfaces: CedrosExtensionSurfacesManifest,
    pub registration: CedrosExtensionRegistrationManifest,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub capabilities: Vec<CedrosExtensionCapabilityManifest>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub admin_modules: Vec<CedrosExtensionAdminModuleManifest>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub analytics: Option<CedrosExtensionAnalyticsManifest>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub provider_access: Vec<CedrosExtensionProviderAccessManifest>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub crm_source_access: Vec<CedrosExtensionCrmSourceAccessManifest>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub database_access: Vec<CedrosExtensionDatabaseAccessManifest>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub setup_seeds: Option<CedrosExtensionSetupSeedsManifest>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub page_seeds: Vec<CedrosExtensionPageSeedManifest>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub content_blocks: Vec<CedrosExtensionContentBlockManifest>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub content_templates: Vec<CedrosExtensionContentTemplateManifest>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub form_templates: Vec<CedrosExtensionFormTemplateManifest>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub docs_articles: Vec<CedrosExtensionDocsArticleManifest>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub onboarding_pages: Vec<CedrosExtensionOnboardingPageManifest>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub job_schedules: Vec<CedrosExtensionJobScheduleManifest>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionCompatibilityManifest {
    pub platform_api_version: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub min_cedros_data_version: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max_cedros_data_version: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub wit_checksum: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionPackageFamily {
    pub server: CedrosExtensionPackageSurface,
    pub react: CedrosExtensionPackageSurface,
    pub react_native: CedrosExtensionPackageSurface,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionPackageSurface {
    pub package_name: String,
    pub version: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub required: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Default)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionDependenciesManifest {
    #[serde(default)]
    pub services: Vec<CedrosExtensionServiceDependencyManifest>,
    #[serde(default)]
    pub capabilities: Vec<CedrosExtensionCapabilityDependencyManifest>,
    #[serde(default)]
    pub extensions: Vec<CedrosExtensionFamilyDependencyManifest>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionServiceDependencyManifest {
    pub service_id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub required: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionCapabilityDependencyManifest {
    pub capability_id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub required: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionFamilyDependencyManifest {
    pub extension_id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub min_version: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max_version: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub required: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionSurfacesManifest {
    pub server: CedrosExtensionServerSurfaceManifest,
    pub admin: CedrosExtensionAdminSurfaceManifest,
    pub web: CedrosExtensionWebSurfaceManifest,
    pub native: CedrosExtensionNativeSurfaceManifest,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub ai: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionServerSurfaceManifest {
    pub package_ref: CedrosExtensionPackageRef,
    pub required: bool,
    #[serde(default)]
    pub migrations: Vec<String>,
    #[serde(default)]
    pub settings_schemas: Vec<String>,
    #[serde(default)]
    pub content_models: Vec<String>,
    #[serde(default)]
    pub routes: Vec<String>,
    #[serde(default)]
    pub jobs: Vec<String>,
    #[serde(default)]
    pub events: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionAdminSurfaceManifest {
    pub package_ref: CedrosExtensionPackageRef,
    pub required: bool,
    #[serde(default)]
    pub module_ids: Vec<String>,
    #[serde(default)]
    pub slot_ids: Vec<String>,
    #[serde(default)]
    pub editor_surface_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionWebSurfaceManifest {
    pub package_ref: CedrosExtensionPackageRef,
    pub required: bool,
    #[serde(default)]
    pub route_ids: Vec<String>,
    #[serde(default)]
    pub block_types: Vec<String>,
    #[serde(default)]
    pub template_ids: Vec<String>,
    #[serde(default)]
    pub authored_surface_ids: Vec<String>,
    #[serde(default)]
    pub template_utility_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionNativeSurfaceManifest {
    pub package_ref: CedrosExtensionPackageRef,
    pub required: bool,
    #[serde(default)]
    pub screen_ids: Vec<String>,
    #[serde(default)]
    pub stack_ids: Vec<String>,
    #[serde(default)]
    pub provider_ids: Vec<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum CedrosExtensionPackageRef {
    Server,
    React,
    ReactNative,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionRegistrationManifest {
    pub server: CedrosExtensionSurfaceRegistrationManifest,
    pub admin: CedrosExtensionSurfaceRegistrationManifest,
    pub web: CedrosExtensionSurfaceRegistrationManifest,
    pub native: CedrosExtensionSurfaceRegistrationManifest,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionSurfaceRegistrationManifest {
    pub entrypoint: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionCapabilityManifest {
    pub id: String,
    pub display_name: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub category: String,
    pub requested_scopes: Vec<CedrosExtensionCapabilityScopeManifest>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionCapabilityScopeManifest {
    pub verb: String,
    pub resource: String,
    pub summary: String,
}

pub fn register_extension_family() -> CedrosExtensionManifest {
    CedrosExtensionManifest {
        schema_version: 1,
        extension_id: CEDROS_LOGIN_EXTENSION_ID.to_string(),
        display_name: "Cedros Login".to_string(),
        version: CEDROS_LOGIN_EXTENSION_VERSION.to_string(),
        description: Some("Authentication and identity extension for Cedros with auth flows, account lifecycle, and CRM integration metadata.".to_string()),
        compatibility: compatibility(),
        platform_api_version: CEDROS_EXTENSION_PLATFORM_API_VERSION.to_string(),
        package_family: package_family(),
        dependencies: Some(dependencies()),
        required_services: Vec::new(),
        required_capabilities: vec![
            "cedros-data:database-concurrency-v2".to_string(),
            "cedros-data:token-email-evidence-v1".to_string(),
            "cedros-data:identity-atomic-v1".to_string(),
            "cedros-data:session-atomic-v1".to_string(),
            "cedros-data:signup-limit-atomic-v1".to_string(),
            "cedros-data:abuse-budget-consume-v1".to_string(),
            "cedros-data:extension-storage-cas-v1".to_string(),
            "cedros-data:mcp-connection-revoke-v1".to_string(),
        ],
        surfaces: surfaces(),
        registration: registration_entrypoints(),
        capabilities: cedros_login_capabilities(),
        admin_modules: cedros_login_admin_modules(CEDROS_LOGIN_EXTENSION_VERSION),
        analytics: Some(cedros_login_analytics()),
        provider_access: cedros_login_provider_access(),
        crm_source_access: cedros_login_crm_source_access(),
        database_access: cedros_login_database_access(),
        setup_seeds: Some(cedros_login_setup_seeds()),
        page_seeds: cedros_login_page_seeds(),
        content_blocks: cedros_login_content_blocks(),
        content_templates: cedros_login_content_templates(),
        form_templates: cedros_login_form_templates(),
        docs_articles: cedros_login_docs_articles(),
        onboarding_pages: cedros_login_onboarding_pages(),
        job_schedules: cedros_login_job_schedules(),
    }
}

fn package_family() -> CedrosExtensionPackageFamily {
    CedrosExtensionPackageFamily {
        server: CedrosExtensionPackageSurface {
            package_name: env!("CARGO_PKG_NAME").to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            required: Some(true),
        },
        react: CedrosExtensionPackageSurface {
            package_name: "@cedros/login-react".to_string(),
            version: CEDROS_LOGIN_REACT_PACKAGE_VERSION.to_string(),
            required: Some(true),
        },
        react_native: CedrosExtensionPackageSurface {
            package_name: "@cedros/login-react-native".to_string(),
            version: CEDROS_LOGIN_REACT_NATIVE_PACKAGE_VERSION.to_string(),
            required: Some(true),
        },
    }
}

fn compatibility() -> CedrosExtensionCompatibilityManifest {
    CedrosExtensionCompatibilityManifest {
        platform_api_version: CEDROS_EXTENSION_PLATFORM_API_VERSION.to_string(),
        min_cedros_data_version: Some(CEDROS_EXTENSION_MIN_CEDROS_DATA_VERSION.to_string()),
        max_cedros_data_version: None,
        wit_checksum: Some(CEDROS_EXTENSION_WIT_CHECKSUM.to_string()),
    }
}

fn dependencies() -> CedrosExtensionDependenciesManifest {
    CedrosExtensionDependenciesManifest {
        services: Vec::new(),
        capabilities: vec![
            CedrosExtensionCapabilityDependencyManifest {
                capability_id: "cedros-data:database-concurrency-v2".to_string(),
                required: Some(true),
                reason: Some("Preserves the published host-atomic conditional mutations used by Login identity, session, organization, outbox, and lifecycle flows.".to_string()),
            },
            CedrosExtensionCapabilityDependencyManifest {
                capability_id: "cedros-data:token-email-evidence-v1".to_string(),
                required: Some(true),
                reason: Some("Requires identity.outbox.enqueue-token-email to atomically bind a live purpose-bound token to outbox work with host-issued delivery evidence.".to_string()),
            },
            CedrosExtensionCapabilityDependencyManifest {
                capability_id: "cedros-data:identity-atomic-v1".to_string(),
                required: Some(true),
                reason: Some("Uses registration.account.complete to create password accounts with their verification token and outbox work in one host transaction.".to_string()),
            },
            CedrosExtensionCapabilityDependencyManifest {
                capability_id: "cedros-data:session-atomic-v1".to_string(),
                required: Some(true),
                reason: Some("Requires atomic session rotation and revocation so concurrent refresh cannot escape sign-out.".to_string()),
            },
            CedrosExtensionCapabilityDependencyManifest {
                capability_id: "cedros-data:signup-limit-atomic-v1".to_string(),
                required: Some(true),
                reason: Some("Requires signup-limit status plus registration account creation to report and enforce enabled limits against one durable, atomic ledger.".to_string()),
            },
            CedrosExtensionCapabilityDependencyManifest {
                capability_id: "cedros-data:abuse-budget-consume-v1".to_string(),
                required: Some(true),
                reason: Some("Atomically enforces multi-dimensional identity abuse budgets with bounded expiring host storage.".to_string()),
            },
            CedrosExtensionCapabilityDependencyManifest {
                capability_id: "cedros-data:extension-storage-cas-v1".to_string(),
                required: Some(true),
                reason: Some("Atomically binds MFA enrollment, factor consumption, and login completion to the exact verified row revisions.".to_string()),
            },
            CedrosExtensionCapabilityDependencyManifest {
                capability_id: "cedros-data:mcp-connection-revoke-v1".to_string(),
                required: Some(true),
                reason: Some("Durably cancels and retries deletion of existing OAuth-bound MCP keys without relying on revoked browser or OAuth credentials.".to_string()),
            },
            CedrosExtensionCapabilityDependencyManifest {
                capability_id: "cedros-pay:subscription-read".to_string(),
                required: Some(false),
                reason: Some("Reads same-site subscription selection through the host-authenticated Login service contract; unavailable Pay keeps the chooser gate closed.".to_string()),
            },
        ],
        extensions: vec![CedrosExtensionFamilyDependencyManifest {
            extension_id: "cedros-pay".to_string(),
            min_version: Some("4.0.5".to_string()),
            max_version: None,
            required: Some(false),
            reason: Some("Optional buyer-authenticated subscription selection; when configured, unavailable Pay status keeps the chooser gate closed and denies plan-limited invitations. Pay owns subscriptions and checkout.".to_string()),
        }],
    }
}

fn surfaces() -> CedrosExtensionSurfacesManifest {
    CedrosExtensionSurfacesManifest {
        server: CedrosExtensionServerSurfaceManifest {
            package_ref: CedrosExtensionPackageRef::Server,
            required: true,
            migrations: cedros_login_migrations(),
            settings_schemas: vec![
                "cedros-login:dashboard-permissions".to_string(),
                "cedros-login:system-settings".to_string(),
            ],
            content_models: cedros_login_content_models(),
            routes: cedros_login_routes(),
            jobs: cedros_login_jobs(),
            events: cedros_login_events(),
        },
        admin: CedrosExtensionAdminSurfaceManifest {
            package_ref: CedrosExtensionPackageRef::React,
            required: true,
            module_ids: vec!["cedros-login:admin".to_string()],
            slot_ids: Vec::new(),
            editor_surface_ids: Vec::new(),
        },
        web: CedrosExtensionWebSurfaceManifest {
            package_ref: CedrosExtensionPackageRef::React,
            required: true,
            route_ids: cedros_login_page_seed_ids(),
            block_types: cedros_login_content_block_types(),
            template_ids: cedros_login_content_template_ids(),
            authored_surface_ids: Vec::new(),
            template_utility_ids: Vec::new(),
        },
        native: CedrosExtensionNativeSurfaceManifest {
            package_ref: CedrosExtensionPackageRef::ReactNative,
            required: true,
            screen_ids: vec!["cedros-login:login-screen".to_string()],
            stack_ids: Vec::new(),
            provider_ids: vec!["cedros-login:provider".to_string()],
        },
        ai: Some(cedros_login_ai_surface()),
    }
}

fn registration_entrypoints() -> CedrosExtensionRegistrationManifest {
    CedrosExtensionRegistrationManifest {
        server: CedrosExtensionSurfaceRegistrationManifest {
            entrypoint: CEDROS_LOGIN_SERVER_REGISTRATION_ENTRYPOINT.to_string(),
        },
        admin: CedrosExtensionSurfaceRegistrationManifest {
            entrypoint: "@cedros/login-react/admin/register".to_string(),
        },
        web: CedrosExtensionSurfaceRegistrationManifest {
            entrypoint: "@cedros/login-react/web/register".to_string(),
        },
        native: CedrosExtensionSurfaceRegistrationManifest {
            entrypoint: "@cedros/login-react-native/register".to_string(),
        },
    }
}

#[cfg(test)]
#[path = "extension_manifest_tests.rs"]
mod tests;

#[cfg(test)]
#[path = "extension_manifest_alignment_tests.rs"]
mod alignment_tests;
