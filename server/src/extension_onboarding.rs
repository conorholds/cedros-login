use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionOnboardingPageManifest {
    pub id: String,
    pub display_name: String,
    pub module_id: String,
    pub section_id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

pub fn cedros_login_onboarding_pages() -> Vec<CedrosExtensionOnboardingPageManifest> {
    vec![CedrosExtensionOnboardingPageManifest {
        id: "cedros-login:setup-login".to_string(),
        display_name: "Set up Login".to_string(),
        module_id: "cedros-login:admin".to_string(),
        section_id: "cedros-login:login".to_string(),
        description: Some("Choose and verify the sign-in methods visitors can use.".to_string()),
    }]
}
