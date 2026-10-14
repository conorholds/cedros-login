use std::sync::Arc;

use crate::errors::AppError;

use super::{EmailService, LogEmailService, PostmarkEmailService};

/// Whether the configured email backend can deliver messages outside the process.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EmailDeliveryCapability {
    /// A real provider or host-managed delivery path is available.
    Delivering,
    /// Messages are retained and safely logged for local development only.
    DevelopmentLog,
    /// No provider is available; attempts fail rather than being acknowledged.
    Unavailable,
}

impl EmailDeliveryCapability {
    /// Return whether this capability can satisfy email delivery in `environment`.
    pub fn can_deliver_in(self, environment: &str) -> bool {
        match self {
            Self::Delivering => true,
            Self::DevelopmentLog => is_local_email_environment(environment),
            Self::Unavailable => false,
        }
    }

    /// Stable, credential-free value exposed by health/readiness endpoints.
    pub fn diagnostic(self) -> &'static str {
        match self {
            Self::Delivering => "provider",
            Self::DevelopmentLog => "development_log",
            Self::Unavailable => "unavailable",
        }
    }
}

/// A constructed email service and the delivery guarantee it provides.
pub struct ConfiguredEmailService {
    /// Backend passed to the outbox worker.
    pub service: Arc<dyn EmailService>,
    /// Capability exposed to readiness checks.
    pub capability: EmailDeliveryCapability,
}

/// Construct the standalone email backend without making a provider request.
///
/// A Postmark configuration is valid only when both values are non-blank.
/// Partial configuration always fails. Without Postmark, local environments use
/// the development log backend. Production-like standalone deployments require
/// a provider for invites, resets, deletion, and security messages even when
/// password-email authentication is disabled.
///
/// `_legacy_email_auth_enabled` is retained for source compatibility and no
/// longer relaxes production delivery requirements.
pub fn configure_email_service(
    postmark_api_token: Option<String>,
    postmark_from_email: Option<String>,
    environment: &str,
    _legacy_email_auth_enabled: bool,
) -> Result<ConfiguredEmailService, AppError> {
    configure_standalone_email_service(postmark_api_token, postmark_from_email, environment)
}

/// Construct the standalone email backend under the product-wide delivery rule.
pub fn configure_standalone_email_service(
    postmark_api_token: Option<String>,
    postmark_from_email: Option<String>,
    environment: &str,
) -> Result<ConfiguredEmailService, AppError> {
    let api_token = validate_optional("POSTMARK_API_TOKEN", postmark_api_token)?;
    let from_email = validate_optional("POSTMARK_FROM_EMAIL", postmark_from_email)?;

    match (api_token, from_email) {
        (Some(api_token), Some(from_email)) => Ok(ConfiguredEmailService {
            service: Arc::new(PostmarkEmailService::try_new(api_token, from_email)?),
            capability: EmailDeliveryCapability::Delivering,
        }),
        (Some(_), None) | (None, Some(_)) => Err(AppError::Config(
            "POSTMARK_API_TOKEN and POSTMARK_FROM_EMAIL must be configured together".into(),
        )),
        (None, None) if is_local_email_environment(environment) => Ok(ConfiguredEmailService {
            service: Arc::new(LogEmailService::new()),
            capability: EmailDeliveryCapability::DevelopmentLog,
        }),
        (None, None) => Err(AppError::Config(
            "Standalone production-like environments require an email delivery provider for transactional account workflows".into(),
        )),
    }
}

fn validate_optional(name: &str, value: Option<String>) -> Result<Option<String>, AppError> {
    value
        .map(|value| {
            let value = value.trim().to_string();
            if value.is_empty() {
                Err(AppError::Config(format!("{name} must not be blank")))
            } else {
                Ok(value)
            }
        })
        .transpose()
}

fn is_local_email_environment(environment: &str) -> bool {
    matches!(
        environment.trim().to_ascii_lowercase().as_str(),
        "dev" | "development" | "local" | "test"
    )
}
