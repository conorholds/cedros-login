//! Required subscription-selection gate backed by Cedros Pay.
//!
//! The gate is controlled by Login settings, while plan state remains owned by
//! Pay. When enabled, incomplete or unavailable Pay status fails closed by
//! returning a post-login redirect to the chooser route.

use std::sync::Arc;
use std::time::Duration;

use async_trait::async_trait;
use reqwest::StatusCode;
use serde::Deserialize;
use url::Url;
use uuid::Uuid;

use crate::domain::plan_seat_policy::SeatLimit;
use crate::errors::AppError;
use crate::models::PostLoginAction;
use crate::services::SettingsService;

const REQUIRED_KEY: &str = "subscription_selection_required";
const ROUTE_KEY: &str = "subscription_selection_route";
const PAY_BASE_URL_KEY: &str = "subscription_selection_pay_base_url";
const SERVER_FRONTEND_URL_KEY: &str = "server_frontend_url";
/// Where Cedros Pay is mounted on a Cedros site.
const SAME_SITE_PAY_PATH: &str = "/extensions/cedros-pay";
const DEFAULT_REDIRECT_URL: &str = "/subscribe";
const PAY_SELECTION_STATUS_PATH: &str = "paywall/v1/subscription/selection-status";
const PAY_STATUS_TIMEOUT_SECS: u64 = 5;

/// Runtime settings that control the subscription-selection post-login gate.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SubscriptionSelectionConfig {
    pub required: bool,
    pub redirect_url: String,
    pub pay_base_url: Option<String>,
}

/// Computes subscription-selection post-login actions from Login settings and Pay status.
pub struct SubscriptionSelectionService {
    settings: Arc<SettingsService>,
    client: Arc<dyn SubscriptionSelectionStatusClient>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ResolvedPlanSeatLimit {
    pub plan_id: String,
    pub limit: SeatLimit,
}

impl SubscriptionSelectionService {
    /// Create a service using the default HTTP Pay client.
    pub fn new(settings: Arc<SettingsService>) -> Self {
        Self {
            settings,
            client: Arc::new(HttpSubscriptionSelectionStatusClient::new()),
        }
    }

    #[cfg(test)]
    fn with_client(
        settings: Arc<SettingsService>,
        client: Arc<dyn SubscriptionSelectionStatusClient>,
    ) -> Self {
        Self { settings, client }
    }

    /// Read the effective gate settings.
    ///
    /// Errors only when settings storage is unavailable. The chooser route is
    /// normalized to an app-relative path and defaults to `/subscribe`.
    pub async fn config(&self) -> Result<SubscriptionSelectionConfig, AppError> {
        let required = self.settings.get_bool(REQUIRED_KEY).await?.unwrap_or(false);
        let redirect_url = normalize_redirect_url(self.settings.get(ROUTE_KEY).await?);
        let configured = self
            .settings
            .get(PAY_BASE_URL_KEY)
            .await?
            .map(|value| value.trim().trim_end_matches('/').to_string())
            .filter(|value| !value.is_empty());
        let pay_base_url = match configured {
            Some(value) => Some(value),
            None => self.same_site_pay_base_url().await?,
        };

        Ok(SubscriptionSelectionConfig {
            required,
            redirect_url,
            pay_base_url,
        })
    }

    /// This site's own Cedros Pay mount, rooted at the configured frontend URL.
    /// Used whenever no explicit Pay location is configured.
    async fn same_site_pay_base_url(&self) -> Result<Option<String>, AppError> {
        Ok(self
            .settings
            .get(SERVER_FRONTEND_URL_KEY)
            .await?
            .map(|value| value.trim().trim_end_matches('/').to_string())
            .filter(|value| !value.is_empty())
            .map(|site| format!("{site}{SAME_SITE_PAY_PATH}")))
    }

    /// Return a `choose_subscription` post-login action when selection is required
    /// and Pay does not report durable completion for this user.
    pub async fn post_login_action(
        &self,
        user_id: Uuid,
        bearer_token: &str,
    ) -> Result<Option<PostLoginAction>, AppError> {
        let config = self.config().await?;
        if !config.required {
            return Ok(None);
        }

        let Some(pay_base_url) = config.pay_base_url.as_deref() else {
            tracing::warn!(
                user_id = %user_id,
                setting = PAY_BASE_URL_KEY,
                "Subscription selection is required but Cedros Pay base URL is not configured"
            );
            return Ok(Some(choose_subscription(config.redirect_url)));
        };

        match self
            .client
            .selection_status(pay_base_url, user_id, bearer_token)
            .await
        {
            Ok(status) if status.complete => Ok(None),
            Ok(_) => Ok(Some(choose_subscription(config.redirect_url))),
            Err(error) => {
                tracing::warn!(
                    user_id = %user_id,
                    cause = error.safe_cause(),
                    "Unable to confirm subscription selection with Cedros Pay; redirecting user to chooser"
                );
                Ok(Some(choose_subscription(config.redirect_url)))
            }
        }
    }

    /// Resolve the authenticated caller's configured team-seat limit.
    ///
    /// Seat limits participate only when subscription selection is required.
    /// Pay owns the policy and resolves its canonical plan identity. Uninitialized
    /// or invalid Pay policies fail closed; Login only enforces the returned limit.
    pub async fn team_seat_limit(
        &self,
        user_id: Uuid,
        bearer_token: Option<&str>,
    ) -> Result<Option<ResolvedPlanSeatLimit>, AppError> {
        let config = self.config().await?;
        if !config.required {
            return Ok(None);
        }
        let bearer_token = bearer_token.ok_or(AppError::InvalidToken)?;
        let pay_base_url = config.pay_base_url.as_deref().ok_or_else(|| {
            AppError::ServiceUnavailable(
                "Unable to verify the subscription plan for team invitations".to_string(),
            )
        })?;
        let status = self
            .client
            .selection_status(pay_base_url, user_id, bearer_token)
            .await
            .map_err(|error| {
                tracing::warn!(
                    user_id = %user_id,
                    cause = error.safe_cause(),
                    "Unable to resolve Cedros Pay plan for team invitation"
                );
                AppError::ServiceUnavailable(
                    "Unable to verify the subscription plan for team invitations".to_string(),
                )
            })?;
        let configured = status.team_seat_policy_configured.ok_or_else(|| {
            AppError::ServiceUnavailable("Cedros Pay team seat policy is not initialized".into())
        })?;
        let limit = SeatLimit::from_pay(status.team_seat_limit.as_ref().ok_or_else(|| {
            AppError::ServiceUnavailable("Cedros Pay team seat limit is missing".into())
        })?)
        .map_err(|_| {
            AppError::ServiceUnavailable("Cedros Pay team seat policy is invalid".into())
        })?;
        if !configured {
            if limit.is_some() {
                return Err(AppError::ServiceUnavailable(
                    "Cedros Pay team seat policy is invalid".into(),
                ));
            }
            return Ok(None);
        }
        if !status.complete {
            return Err(AppError::ServiceUnavailable(
                "An active subscription is required before inviting team members".to_string(),
            ));
        }
        let Some(plan_id) = status.plan_id else {
            return Err(AppError::ServiceUnavailable(
                "The active subscription did not identify its plan".to_string(),
            ));
        };
        if plan_id.trim().is_empty() {
            return Err(AppError::ServiceUnavailable(
                "The active subscription did not identify its plan".into(),
            ));
        }
        Ok(limit.map(|limit| ResolvedPlanSeatLimit { plan_id, limit }))
    }
}

fn choose_subscription(redirect_url: String) -> PostLoginAction {
    PostLoginAction {
        action: "choose_subscription".to_string(),
        redirect_url: Some(redirect_url),
    }
}

fn normalize_redirect_url(value: Option<String>) -> String {
    let Some(value) = value else {
        return DEFAULT_REDIRECT_URL.to_string();
    };
    let trimmed = value.trim().trim_matches('"').trim();
    if trimmed.is_empty() || trimmed.starts_with("//") {
        return DEFAULT_REDIRECT_URL.to_string();
    }
    if trimmed.starts_with('/') {
        trimmed.to_string()
    } else {
        format!("/{trimmed}")
    }
}

#[async_trait]
trait SubscriptionSelectionStatusClient: Send + Sync {
    async fn selection_status(
        &self,
        pay_base_url: &str,
        user_id: Uuid,
        bearer_token: &str,
    ) -> Result<PaySelectionStatusResponse, SubscriptionSelectionStatusError>;
}

struct HttpSubscriptionSelectionStatusClient {
    client: reqwest::Client,
}

impl HttpSubscriptionSelectionStatusClient {
    fn new() -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(PAY_STATUS_TIMEOUT_SECS))
            .build()
            .unwrap_or_else(|error| {
                tracing::warn!(
                    cause = %error,
                    "Failed to build Cedros Pay HTTP client; falling back to default client"
                );
                reqwest::Client::new()
            });
        Self { client }
    }
}

#[async_trait]
impl SubscriptionSelectionStatusClient for HttpSubscriptionSelectionStatusClient {
    async fn selection_status(
        &self,
        pay_base_url: &str,
        user_id: Uuid,
        bearer_token: &str,
    ) -> Result<PaySelectionStatusResponse, SubscriptionSelectionStatusError> {
        let mut url = Url::parse(&format!(
            "{}/{}",
            pay_base_url.trim_end_matches('/'),
            PAY_SELECTION_STATUS_PATH
        ))?;
        url.query_pairs_mut()
            .append_pair("userId", &user_id.to_string());

        let response = self
            .client
            .get(url)
            .bearer_auth(bearer_token)
            .send()
            .await?;
        let status = response.status();
        if !status.is_success() {
            return Err(SubscriptionSelectionStatusError::Http(status));
        }

        let mut body: PaySelectionStatusResponse = response.json().await?;
        // Pay defines `complete` as authoritative; keep `selection` as a tolerant fallback.
        body.complete = body.complete || body.selection.as_deref() == Some("complete");
        Ok(body)
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PaySelectionStatusResponse {
    #[serde(default)]
    complete: bool,
    #[serde(default)]
    selection: Option<String>,
    #[serde(default)]
    plan_id: Option<String>,
    #[serde(default)]
    team_seat_policy_configured: Option<bool>,
    #[serde(
        default,
        deserialize_with = "crate::domain::plan_seat_policy::deserialize_present_limit"
    )]
    team_seat_limit: Option<serde_json::Value>,
}

#[derive(Debug, thiserror::Error)]
enum SubscriptionSelectionStatusError {
    #[error("invalid Cedros Pay status URL")]
    InvalidUrl(#[from] url::ParseError),
    #[error("Cedros Pay status request failed")]
    Request(#[from] reqwest::Error),
    #[error("Cedros Pay returned HTTP {0}")]
    Http(StatusCode),
}

impl SubscriptionSelectionStatusError {
    fn safe_cause(&self) -> &'static str {
        match self {
            Self::InvalidUrl(_) => "invalid_url",
            Self::Request(_) => "request_failed",
            Self::Http(_) => "http_status",
        }
    }
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use async_trait::async_trait;

    use super::*;
    use crate::repositories::{
        InMemorySystemSettingsRepository, SystemSetting, SystemSettingsRepository,
    };

    #[tokio::test]
    async fn returns_subscription_action_when_pay_reports_incomplete() {
        let settings = settings_with_gate(true, Some("https://pay.example")).await;
        let service = SubscriptionSelectionService::with_client(
            settings,
            Arc::new(FakeStatusClient::new(false, None)),
        );
        let user_id = Uuid::new_v4();

        let action = service
            .post_login_action(user_id, "access-token")
            .await
            .expect("gate action");

        let action = action.expect("subscription action");
        assert_eq!(action.action, "choose_subscription");
        assert_eq!(action.redirect_url.as_deref(), Some("/subscribe"));
    }

    #[tokio::test]
    async fn skips_subscription_action_when_pay_reports_complete() {
        let settings = settings_with_gate(true, Some("https://pay.example")).await;
        let service = SubscriptionSelectionService::with_client(
            settings,
            Arc::new(FakeStatusClient::new(true, Some("business"))),
        );

        let action = service
            .post_login_action(Uuid::new_v4(), "access-token")
            .await
            .expect("gate action");

        assert!(action.is_none());
    }

    #[tokio::test]
    async fn pay_location_defaults_to_this_sites_extension_mount() {
        let settings = settings_with_gate(true, None).await;
        settings
            .set(
                SERVER_FRONTEND_URL_KEY,
                "https://site.example/",
                "server",
                None,
            )
            .await
            .expect("frontend url");
        let service = SubscriptionSelectionService::with_client(
            settings,
            Arc::new(FakeStatusClient::new(true, None)),
        );
        let config = service.config().await.expect("config");
        assert_eq!(
            config.pay_base_url.as_deref(),
            Some("https://site.example/extensions/cedros-pay")
        );
    }

    #[tokio::test]
    async fn fails_closed_when_pay_base_url_is_missing() {
        let settings = settings_with_gate(true, None).await;
        let service = SubscriptionSelectionService::with_client(
            settings,
            Arc::new(FakeStatusClient::new(true, Some("business"))),
        );

        let action = service
            .post_login_action(Uuid::new_v4(), "access-token")
            .await
            .expect("gate action");

        assert_eq!(
            action.and_then(|value| value.redirect_url).as_deref(),
            Some("/subscribe")
        );
    }

    #[tokio::test]
    async fn resolves_configured_plan_seat_limit() {
        let settings = settings_with_gate(true, Some("https://pay.example")).await;
        let service = SubscriptionSelectionService::with_client(
            settings,
            Arc::new(FakeStatusClient::new(true, Some("individual"))),
        );

        let resolved = service
            .team_seat_limit(Uuid::new_v4(), Some("access-token"))
            .await
            .expect("seat limit")
            .expect("configured plan");

        assert_eq!(resolved.plan_id, "individual");
        assert_eq!(resolved.limit, SeatLimit::Limited(1));
    }

    #[tokio::test]
    async fn inactive_team_seat_policy_does_not_require_a_bearer_token() {
        let settings = settings_with_gate(false, None).await;
        let service = SubscriptionSelectionService::with_client(
            settings,
            Arc::new(FakeStatusClient::new(false, None)),
        );

        assert!(service
            .team_seat_limit(Uuid::new_v4(), None)
            .await
            .expect("inactive seat policy")
            .is_none());
    }

    #[tokio::test]
    async fn leaves_unlisted_plan_unrestricted() {
        let settings = settings_with_gate(true, Some("https://pay.example")).await;
        let service = SubscriptionSelectionService::with_client(
            settings,
            Arc::new(FakeStatusClient::new(true, Some("enterprise"))),
        );

        assert!(service
            .team_seat_limit(Uuid::new_v4(), Some("access-token"))
            .await
            .expect("seat limit")
            .is_none());
    }

    #[tokio::test]
    async fn team_seat_limit_fails_closed_without_active_selection() {
        let settings = settings_with_gate(true, Some("https://pay.example")).await;
        let service = SubscriptionSelectionService::with_client(
            settings,
            Arc::new(FakeStatusClient::new(false, None)),
        );

        assert!(matches!(
            service
                .team_seat_limit(Uuid::new_v4(), Some("access-token"))
                .await,
            Err(AppError::ServiceUnavailable(_))
        ));
    }

    #[tokio::test]
    async fn fails_closed_when_pay_has_not_received_the_policy() {
        struct UninitializedPay;
        #[async_trait]
        impl SubscriptionSelectionStatusClient for UninitializedPay {
            async fn selection_status(
                &self,
                _: &str,
                _: Uuid,
                _: &str,
            ) -> Result<PaySelectionStatusResponse, SubscriptionSelectionStatusError> {
                Ok(serde_json::from_str(r#"{"complete":true,"planId":"individual"}"#).unwrap())
            }
        }
        let service = SubscriptionSelectionService::with_client(
            settings_with_gate(true, Some("https://pay.example")).await,
            Arc::new(UninitializedPay),
        );
        assert!(matches!(
            service.team_seat_limit(Uuid::new_v4(), Some("token")).await,
            Err(AppError::ServiceUnavailable(_))
        ));
    }

    async fn settings_with_gate(
        required: bool,
        pay_base_url: Option<&str>,
    ) -> Arc<SettingsService> {
        let repo = Arc::new(InMemorySystemSettingsRepository::new());
        repo.upsert(SystemSetting::new(
            REQUIRED_KEY.to_string(),
            required.to_string(),
            "postlogin.subscription".to_string(),
        ))
        .await
        .expect("required setting");
        repo.upsert(SystemSetting::new(
            ROUTE_KEY.to_string(),
            "/subscribe".to_string(),
            "postlogin.subscription".to_string(),
        ))
        .await
        .expect("route setting");
        if let Some(pay_base_url) = pay_base_url {
            repo.upsert(SystemSetting::new(
                PAY_BASE_URL_KEY.to_string(),
                pay_base_url.to_string(),
                "postlogin.subscription".to_string(),
            ))
            .await
            .expect("pay base URL setting");
        }
        Arc::new(SettingsService::with_ttl(repo, 0))
    }

    struct FakeStatusClient {
        complete: bool,
        plan_id: Option<String>,
    }

    impl FakeStatusClient {
        fn new(complete: bool, plan_id: Option<&str>) -> Self {
            Self {
                complete,
                plan_id: plan_id.map(str::to_string),
            }
        }
    }

    #[async_trait]
    impl SubscriptionSelectionStatusClient for FakeStatusClient {
        async fn selection_status(
            &self,
            _pay_base_url: &str,
            _user_id: Uuid,
            _bearer_token: &str,
        ) -> Result<PaySelectionStatusResponse, SubscriptionSelectionStatusError> {
            Ok(PaySelectionStatusResponse {
                complete: self.complete,
                selection: None,
                plan_id: self.plan_id.clone(),
                team_seat_policy_configured: Some(true),
                team_seat_limit: Some(match self.plan_id.as_deref() {
                    Some("individual") => serde_json::json!(1),
                    Some("business") => serde_json::json!("unlimited"),
                    _ => serde_json::Value::Null,
                }),
            })
        }
    }
}
