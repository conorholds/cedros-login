use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionPageSeedManifest {
    pub id: String,
    pub display_name: String,
    pub title: String,
    pub route_path: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub slug: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub template_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub auto_create_on_enable: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub publish_on_enable: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub seo: Option<CedrosExtensionSeoManifest>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionSeoManifest {
    /// When true, Core emits robots noindex/nofollow and excludes this page from sitemaps.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub noindex: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub og_title: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub og_description: Option<String>,
    /// Absolute URL or same-origin absolute path; Core validates this at intake.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub og_image: Option<String>,
    /// Same-origin absolute path; Core owns canonical tag emission.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub canonical_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionContentBlockManifest {
    #[serde(rename = "type")]
    pub block_type: String,
    pub display_name: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub category: String,
    pub order: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionContentTemplateManifest {
    pub id: String,
    pub display_name: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub order: i32,
    pub content_types: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub surface_id: Option<String>,
}

pub fn cedros_login_page_seed_ids() -> Vec<String> {
    ids(&[
        "cedros-login:login-page",
        "cedros-login:register-page",
        "cedros-login:password-recovery-page",
        "cedros-login:reset-password-page",
        "cedros-login:email-verification-page",
        "cedros-login:instant-link-verification-page",
        "cedros-login:invite-acceptance-page",
        "cedros-login:public-profile-page",
    ])
}

pub fn cedros_login_content_block_types() -> Vec<String> {
    ids(&[
        "cedros-login:auth-page-copy",
        "cedros-login:auth-form",
        "cedros-login:login-button",
        "cedros-login:account-workspace",
    ])
}

pub fn cedros_login_content_template_ids() -> Vec<String> {
    ids(&[
        "cedros-login:login-page-template",
        "cedros-login:register-page-template",
        "cedros-login:password-recovery-page-template",
        "cedros-login:reset-password-page-template",
        "cedros-login:email-verification-page-template",
        "cedros-login:instant-link-verification-page-template",
        "cedros-login:invite-acceptance-page-template",
        "cedros-login:public-profile-page-template",
    ])
}

pub fn cedros_login_page_seeds() -> Vec<CedrosExtensionPageSeedManifest> {
    vec![
        noindex_page_seed(0, "Login Page", "Login", "/login", "login"),
        noindex_page_seed(1, "Register Page", "Register", "/register", "register"),
        noindex_page_seed(
            2,
            "Password Recovery Page",
            "Password recovery",
            "/password-recovery",
            "password-recovery",
        ),
        noindex_page_seed(
            3,
            "Reset Password Page",
            "Reset password",
            "/reset-password",
            "reset-password",
        ),
        noindex_page_seed(
            4,
            "Email Verification Page",
            "Email verification",
            "/verify-email",
            "verify-email",
        ),
        noindex_page_seed(
            5,
            "Instant Link Verification Page",
            "Instant link verification",
            "/instant-link/verify",
            "instant-link-verify",
        ),
        noindex_page_seed(
            6,
            "Invite Acceptance Page",
            "Accept invite",
            "/accept-invite",
            "accept-invite",
        ),
        noindex_page_seed(7, "Profile Page", "Profile", "/profile", "profile"),
    ]
}

pub fn cedros_login_content_blocks() -> Vec<CedrosExtensionContentBlockManifest> {
    vec![
        content_block(
            "cedros-login:auth-page-copy",
            "Login Page Copy",
            "Owner-editable heading, body, and safe link copy for Login public pages.",
            10,
        ),
        content_block(
            "cedros-login:auth-form",
            "Login Auth Form",
            "Portable sign-in, registration, recovery, verification, instant-link, and invite workflow.",
            20,
        ),
        content_block(
            "cedros-login:login-button",
            "Login Button",
            "Safe call-to-action link for sign-in and account handoff flows.",
            30,
        ),
        content_block(
            "cedros-login:account-workspace",
            "Account Workspace",
            "Portable authenticated account workspace starter for profile, security, linked accounts, and sessions.",
            40,
        ),
    ]
}

pub fn cedros_login_content_templates() -> Vec<CedrosExtensionContentTemplateManifest> {
    vec![
        template(
            0,
            "Login Page Template",
            "Starter page for the Cedros Login login flow.",
        ),
        template(
            1,
            "Register Page Template",
            "Starter page for Cedros Login registration.",
        ),
        template(
            2,
            "Password Recovery Page Template",
            "Starter page for password recovery.",
        ),
        template(
            3,
            "Reset Password Page Template",
            "Starter page for choosing a new password from a secure reset link.",
        ),
        template(
            4,
            "Email Verification Page Template",
            "Starter page for confirming an account email address.",
        ),
        template(
            5,
            "Instant Link Verification Page Template",
            "Starter page for completing sign-in from a secure email link.",
        ),
        template(
            6,
            "Invite Acceptance Page Template",
            "Starter page for team invite acceptance.",
        ),
        template(
            7,
            "Profile Workspace Page Template",
            "Starter page for authenticated profile, identity, and security management.",
        ),
    ]
}

fn content_block(
    block_type: &str,
    display_name: &str,
    description: &str,
    order: i32,
) -> CedrosExtensionContentBlockManifest {
    CedrosExtensionContentBlockManifest {
        block_type: block_type.to_string(),
        display_name: display_name.to_string(),
        description: Some(description.to_string()),
        category: "identity".to_string(),
        order,
    }
}

fn page_seed(
    index: usize,
    display_name: &str,
    title: &str,
    route_path: &str,
    slug: &str,
) -> CedrosExtensionPageSeedManifest {
    let ids = cedros_login_page_seed_ids();
    let template_ids = cedros_login_content_template_ids();
    CedrosExtensionPageSeedManifest {
        id: ids[index].clone(),
        display_name: display_name.to_string(),
        title: title.to_string(),
        route_path: route_path.to_string(),
        description: Some(format!(
            "Cedros Data page row for the {} workflow; auto-created and published when the extension is enabled so the public URL is live immediately.",
            title.to_lowercase()
        )),
        slug: Some(slug.to_string()),
        template_id: Some(template_ids[index].clone()),
        auto_create_on_enable: Some(true),
        publish_on_enable: Some(true),
        seo: None,
    }
}

fn noindex_page_seed(
    index: usize,
    display_name: &str,
    title: &str,
    route_path: &str,
    slug: &str,
) -> CedrosExtensionPageSeedManifest {
    let mut seed = page_seed(index, display_name, title, route_path, slug);
    seed.seo = Some(CedrosExtensionSeoManifest {
        noindex: Some(true),
        title: None,
        description: None,
        og_title: None,
        og_description: None,
        og_image: None,
        canonical_path: None,
    });
    seed
}

fn template(
    index: usize,
    display_name: &str,
    description: &str,
) -> CedrosExtensionContentTemplateManifest {
    let template_ids = cedros_login_content_template_ids();
    CedrosExtensionContentTemplateManifest {
        id: template_ids[index].clone(),
        display_name: display_name.to_string(),
        description: Some(description.to_string()),
        order: (index + 1) as i32,
        content_types: ids(&["page"]),
        surface_id: None,
    }
}

fn ids(values: &[&str]) -> Vec<String> {
    values.iter().map(|value| (*value).to_string()).collect()
}
