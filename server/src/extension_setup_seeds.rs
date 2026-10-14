use serde::{Deserialize, Serialize};

use crate::extension_events::{
    CEDROS_LOGIN_REGISTRATION_CREATED_EVENT_ID, CEDROS_LOGIN_USER_LOGIN_EVENT_ID,
};
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Default)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionSetupSeedsManifest {
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub notifications: Vec<CedrosExtensionNotificationSeedManifest>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum CedrosExtensionNotificationChannelKind {
    Email,
    Discord,
    Slack,
    Telegram,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum CedrosExtensionNotificationAudience {
    Team,
    Personal,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum CedrosExtensionNotificationSeverity {
    Info,
    Warning,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CedrosExtensionNotificationSeedManifest {
    pub id: String,
    pub display_name: String,
    pub title: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub event_id: String,
    pub audience: CedrosExtensionNotificationAudience,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub severity: Option<CedrosExtensionNotificationSeverity>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub default_channels: Vec<CedrosExtensionNotificationChannelKind>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub subject_template: Option<String>,
    pub body_template: String,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub tags: Vec<String>,
}

pub fn cedros_login_setup_seeds() -> CedrosExtensionSetupSeedsManifest {
    CedrosExtensionSetupSeedsManifest {
        notifications: vec![
            notification_seed(NotificationSeedInput {
                id: "cedros-login:registration-created-team-notification",
                display_name: "New registration notification",
                title: "New registration",
                description:
                    "Requests a team notification route when Cedros Login creates a new account.",
                event_id: CEDROS_LOGIN_REGISTRATION_CREATED_EVENT_ID,
                subject_template: "New Cedros Login registration",
                body_template:
                    "A new account was created through Cedros Login. Review account activity in Cedros Data.",
                tags: &["identity", "registrations", "notifications"],
            }),
            notification_seed(NotificationSeedInput {
                id: "cedros-login:user-login-team-notification",
                display_name: "User login notification",
                title: "User login",
                description:
                    "Requests a team notification route when Cedros Login completes a user login.",
                event_id: CEDROS_LOGIN_USER_LOGIN_EVENT_ID,
                subject_template: "Cedros Login user login",
                body_template:
                    "A user successfully signed in through Cedros Login. Review login activity in Cedros Data.",
                tags: &["identity", "logins", "notifications"],
            }),
        ],
    }
}

struct NotificationSeedInput<'a> {
    id: &'a str,
    display_name: &'a str,
    title: &'a str,
    description: &'a str,
    event_id: &'a str,
    subject_template: &'a str,
    body_template: &'a str,
    tags: &'a [&'a str],
}

fn notification_seed(input: NotificationSeedInput<'_>) -> CedrosExtensionNotificationSeedManifest {
    CedrosExtensionNotificationSeedManifest {
        id: input.id.to_string(),
        display_name: input.display_name.to_string(),
        title: input.title.to_string(),
        description: Some(input.description.to_string()),
        event_id: input.event_id.to_string(),
        audience: CedrosExtensionNotificationAudience::Team,
        severity: Some(CedrosExtensionNotificationSeverity::Info),
        default_channels: vec![CedrosExtensionNotificationChannelKind::Email],
        subject_template: Some(input.subject_template.to_string()),
        body_template: input.body_template.to_string(),
        tags: input.tags.iter().map(|tag| (*tag).to_string()).collect(),
    }
}
