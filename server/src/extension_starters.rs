use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionFormTemplateManifest {
    pub id: String,
    pub display_name: String,
    pub title: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub default_key: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scope: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub submit_label: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub success_title: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub success_message: Option<String>,
    #[serde(default)]
    pub fields: Vec<CedrosExtensionFormTemplateFieldManifest>,
    /// Materialize as a real form on enable instead of a "Use Template" card.
    /// Live/draft follows `status`. (Host PR #2092 content-seed provisioner.)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub auto_create_on_enable: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionFormTemplateFieldManifest {
    pub key: String,
    pub label: String,
    #[serde(rename = "type")]
    pub field_type: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub required: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub placeholder: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub help_text: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub options: Vec<CedrosExtensionFormTemplateFieldOptionManifest>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionFormTemplateFieldOptionManifest {
    pub label: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionDocsArticleManifest {
    pub id: String,
    pub display_name: String,
    pub title: String,
    pub slug: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub route_path: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub excerpt: Option<String>,
    pub body_markdown: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub category: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub tags: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub product_slug: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub product_label: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub section_key: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub section_label: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub section_order: Option<i32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub nav_label: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub reading_minutes: Option<i32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub order: Option<i32>,
    /// Operator-only articles stay out of public navigation and are noindex.
    #[serde(default)]
    pub internal: bool,
}

pub fn cedros_login_form_templates() -> Vec<CedrosExtensionFormTemplateManifest> {
    vec![CedrosExtensionFormTemplateManifest {
        id: "cedros-login:account-support-form".to_string(),
        display_name: "Login Account Support Form".to_string(),
        title: "Account access support".to_string(),
        description: Some(
            "Owner-editable contact form for visitors who need help with account access or sign-in."
                .to_string(),
        ),
        default_key: Some("account-access-support".to_string()),
        status: Some("active".to_string()),
        scope: Some("contact".to_string()),
        submit_label: Some("Send request".to_string()),
        success_title: Some("Request received".to_string()),
        success_message: Some(
            "We will review your request and follow up through the contact details provided."
                .to_string(),
        ),
        fields: vec![
            field(
                "email",
                "Email address",
                "email",
                true,
                Some("you@example.com"),
                Some("Use the address associated with your account when possible."),
                Vec::new(),
            ),
            field(
                "issue_type",
                "What do you need help with?",
                "select",
                true,
                None,
                None,
                vec![
                    option("Signing in", "sign-in"),
                    option("Creating an account", "create-account"),
                    option("Password or MFA recovery", "account-recovery"),
                    option("Profile or organization access", "profile-organization"),
                ],
            ),
            field(
                "details",
                "Details",
                "textarea",
                true,
                Some("Describe the issue without including passwords, tokens, or private keys."),
                Some("Do not include passwords, recovery codes, tokens, private keys, or payment details."),
                Vec::new(),
            ),
            field(
                "consent_to_contact",
                "I agree to be contacted about this account support request.",
                "checkbox",
                true,
                None,
                Some("This consent applies only to follow-up about the request submitted through this form."),
                Vec::new(),
            ),
        ],
        auto_create_on_enable: Some(true),
    }]
}

pub fn cedros_login_docs_articles() -> Vec<CedrosExtensionDocsArticleManifest> {
    vec![
        docs_article(DocsArticleSpec {
            id: "cedros-login:getting-started",
            display_name: "Sign in and create your account",
            title: "Sign in and create your account",
            slug: "cedros-login-sign-in-and-create-account",
            route_path: "/docs/cedros-login/sign-in-and-create-account",
            excerpt: "How to sign in, create or manage your account, accept a team invite, and recover access without sharing passwords or codes.",
            body_markdown: "# Sign in and create your account\n\nUse this site's account pages to sign in, create an account, manage your profile, or recover access. We never ask you to share your password, one-time codes, or recovery codes with support staff.\n\n## Sign in\n\nOpen the sign in page, enter your email and password, then choose Sign in. If you have multi-factor authentication or a passkey set up, you will be prompted to complete it.\n\n## Create an account\n\nChoose Create account from the sign in page. Use an email address you can receive messages at, and choose a password you do not use anywhere else. You may be asked to verify your email before you can sign in.\n\n## Forgot your password\n\nChoose Forgot password from the sign in page. We will email a reset link to the address on your account. The link expires after a short time so your account stays safe even if your inbox is ever exposed.\n\n## Manage your profile and account\n\nAfter signing in, open /profile to change your display name, profile image, contact details, sign-in methods, and security settings. The profile workspace keeps account details private to the signed-in user.\n\nIf you signed up with email, you can also link a sign-in provider such as Google or Apple from your account workspace, so you can choose how to sign in next time. You can unlink a provider whenever you like, as long as you keep at least one other way to sign in.\n\n## Accept a team invite\n\nIf someone has invited you to an organization, you will get an email with a link to accept the invite. Open the link and either sign in to an existing account or create a new one. After you accept, you will be added to the organization with the role the inviter chose.\n\nIf the link no longer works, ask the person who invited you to send a new invite. Invite links expire for safety. Do not forward your invite link to anyone else, even people on the same team.\n\n## Get help with account access\n\nIf you cannot sign in or did not receive an expected email, use the account support form. Never share your password, recovery codes, or one-time sign-in codes with anyone, including site support.",
            section_key: "account-access",
            section_label: "Account access",
            nav_label: "Sign in and create account",
            order: 10,
            tags: &["login", "identity", "sign-in", "profile", "invite"],
        }),
        docs_article(DocsArticleSpec {
            id: "cedros-login:account-security-checklist",
            display_name: "Keep your account secure",
            title: "Keep your account secure",
            slug: "cedros-login-account-security",
            route_path: "/docs/cedros-login/account-security",
            excerpt: "Verify your email, troubleshoot sign-in links, turn on multi-factor authentication or a passkey, and recover access safely.",
            body_markdown: "# Keep your account secure\n\nA few simple steps make it much harder for someone else to access your account.\n\n## Email verification and sign-in links\n\nWe send verification, reset, and sign-in links to the email address on your account. Verifying your email proves you control it and lets us send you password resets and security notices. Open the verification email and follow the link.\n\nSign-in and verification links expire after a short time so your account stays safe even if your inbox is ever exposed.\n\n- If you did not get the email, check your spam or junk folder and confirm you used the right address. Then return to the sign in or create-account page and request a new email.\n- If the link no longer works, request a fresh one from the sign in page. Old links stop working once you request a new one or once you have already used them.\n- If you sign in with an instant link instead of a password, open the link on the same device when possible, and never forward sign-in links to anyone else.\n\n## Use a strong, unique password\n\nChoose a password you do not use on any other site. A password manager can generate and remember one for you. Change your password right away if you think anyone else has seen it.\n\n## Turn on multi-factor authentication or a passkey\n\nIn your /profile security settings, turn on multi-factor authentication or register a passkey. With either one on, signing in requires both your password and your device or authenticator app, so a stolen password is not enough.\n\n## Review your active sessions\n\nThe /profile workspace lists devices that are currently signed in. If you see one you do not recognize, sign it out and change your password.\n\n## Recover your account safely\n\nIf you lose access, use the forgot password or instant link options on the sign in page. We will never ask you to share your password, multi-factor codes, recovery codes, or session tokens with support staff. Treat any such request as a phishing attempt.",
            section_key: "security",
            section_label: "Security",
            nav_label: "Account security",
            order: 20,
            tags: &["login", "security", "account-recovery", "email-verification"],
        }),
    ]
}

fn field(
    key: &str,
    label: &str,
    field_type: &str,
    required: bool,
    placeholder: Option<&str>,
    help_text: Option<&str>,
    options: Vec<CedrosExtensionFormTemplateFieldOptionManifest>,
) -> CedrosExtensionFormTemplateFieldManifest {
    CedrosExtensionFormTemplateFieldManifest {
        key: key.to_string(),
        label: label.to_string(),
        field_type: field_type.to_string(),
        required: Some(required),
        placeholder: placeholder.map(ToString::to_string),
        help_text: help_text.map(ToString::to_string),
        options,
    }
}

fn option(label: &str, value: &str) -> CedrosExtensionFormTemplateFieldOptionManifest {
    CedrosExtensionFormTemplateFieldOptionManifest {
        label: label.to_string(),
        value: value.to_string(),
    }
}

struct DocsArticleSpec<'a> {
    id: &'a str,
    display_name: &'a str,
    title: &'a str,
    slug: &'a str,
    route_path: &'a str,
    excerpt: &'a str,
    body_markdown: &'a str,
    section_key: &'a str,
    section_label: &'a str,
    nav_label: &'a str,
    order: i32,
    tags: &'a [&'a str],
}

fn docs_article(spec: DocsArticleSpec<'_>) -> CedrosExtensionDocsArticleManifest {
    CedrosExtensionDocsArticleManifest {
        id: spec.id.to_string(),
        display_name: spec.display_name.to_string(),
        title: spec.title.to_string(),
        slug: spec.slug.to_string(),
        route_path: Some(spec.route_path.to_string()),
        excerpt: Some(spec.excerpt.to_string()),
        body_markdown: spec.body_markdown.to_string(),
        category: Some("identity".to_string()),
        tags: ids(spec.tags),
        product_slug: Some("cedros-login".to_string()),
        product_label: Some("Cedros Login".to_string()),
        section_key: Some(spec.section_key.to_string()),
        section_label: Some(spec.section_label.to_string()),
        section_order: Some(spec.order),
        nav_label: Some(spec.nav_label.to_string()),
        reading_minutes: Some(3),
        order: Some(spec.order),
        internal: false,
    }
}

fn ids(values: &[&str]) -> Vec<String> {
    values.iter().map(|value| (*value).to_string()).collect()
}
