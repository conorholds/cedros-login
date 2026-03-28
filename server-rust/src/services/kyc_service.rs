//! KYC orchestration service
//!
//! Coordinates KYC verification between the Stripe Identity client,
//! KYC session repository, and user repository.
//!
//! # Settings keys consumed
//! - `kyc_enabled` (bool) — master switch; `start_verification` returns an error when false.
//! - `kyc_api_secret_key` (secret string) — Stripe secret key.
//! - `kyc_redirect_url` (string) — URL Stripe redirects the user to after verification.
//! - `kyc_document_types` (string) — comma-separated list; defaults to
//!   `"driving_license,id_card,passport"`.
//! - `kyc_require_selfie` (bool) — whether a matching selfie is required; defaults to `true`.
//! - `kyc_webhook_secret` (secret string) — Stripe webhook signing secret.
//! - `kyc_expiry_days` (integer string) — days until a `verified` status expires; `0` means
//!   never expires.
//! - `kyc_enforcement_mode` (string) — one of `"none"`, `"optional"`, `"all"`,
//!   `"withdrawals"`, `"deposits"`; defaults to `"none"`.

use std::sync::Arc;

use chrono::{Duration, Utc};
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{KycRepository, KycSessionEntity, UserRepository};
use crate::services::kyc_stripe::{StripeIdentityClient, StripeWebhookEvent};
use crate::services::settings_service::SettingsService;

/// Returned by [`KycService::start_verification`].
pub struct KycStartResponse {
    /// Internal session ID for client-side tracking.
    pub session_id: Uuid,
    /// Stripe-hosted URL the user must visit to complete verification.
    pub redirect_url: String,
}

/// Returned by [`KycService::get_status`].
pub struct KycStatusResponse {
    /// Effective status: `"none"`, `"pending"`, `"verified"`, `"failed"`,
    /// `"canceled"`, or `"expired"`.
    pub status: String,
    /// When KYC was verified, if ever.
    pub verified_at: Option<chrono::DateTime<chrono::Utc>>,
    /// When KYC verification expires, if set.
    pub expires_at: Option<chrono::DateTime<chrono::Utc>>,
    /// Current enforcement mode from settings.
    pub enforcement_mode: String,
}

/// Orchestrates the KYC verification lifecycle.
pub struct KycService {
    kyc_repo: Arc<dyn KycRepository>,
    user_repo: Arc<dyn UserRepository>,
    settings_service: Arc<SettingsService>,
}

impl KycService {
    /// Create a new `KycService`.
    pub fn new(
        kyc_repo: Arc<dyn KycRepository>,
        user_repo: Arc<dyn UserRepository>,
        settings_service: Arc<SettingsService>,
    ) -> Self {
        Self {
            kyc_repo,
            user_repo,
            settings_service,
        }
    }

    /// Start a new KYC verification session for `user_id`.
    ///
    /// # Errors
    /// - `Validation` if KYC is not enabled or the user is already verified.
    /// - `Config` if required settings are missing.
    /// - `NotFound` if the user does not exist.
    /// - `Internal` on Stripe API failure.
    pub async fn start_verification(&self, user_id: Uuid) -> Result<KycStartResponse, AppError> {
        self.check_kyc_enabled().await?;

        let user = self
            .user_repo
            .find_by_id(user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        if user.kyc_status == "verified" {
            match user.kyc_expires_at {
                Some(expires) if expires <= Utc::now() => {
                    // Expired — allow re-verification
                }
                _ => {
                    return Err(AppError::Validation("User is already verified".into()));
                }
            }
        }

        // Prevent duplicate pending sessions — user must wait for current one to resolve
        if user.kyc_status == "pending" {
            return Err(AppError::Validation(
                "A verification session is already in progress".into(),
            ));
        }

        let (api_key, redirect_url, doc_types_owned, require_selfie) =
            self.load_provider_config().await?;
        let doc_types: Vec<&str> = doc_types_owned.iter().map(String::as_str).collect();

        let client = StripeIdentityClient::new(api_key);
        let stripe_session = client
            .create_session(
                &user_id.to_string(),
                &redirect_url,
                &doc_types,
                require_selfie,
            )
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Stripe Identity error: {}", e)))?;

        let session = KycSessionEntity {
            id: Uuid::new_v4(),
            user_id,
            provider: "stripe".to_string(),
            provider_session_id: stripe_session.id.clone(),
            status: "pending".to_string(),
            redirect_url: stripe_session.url.clone(),
            error_code: None,
            error_reason: None,
            provider_data: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            completed_at: None,
        };
        let session = self.kyc_repo.create_session(session).await?;

        self.user_repo
            .set_kyc_status(user_id, "pending", None, None)
            .await?;

        Ok(KycStartResponse {
            session_id: session.id,
            redirect_url: stripe_session.url.unwrap_or_default(),
        })
    }

    /// Handle a verified Stripe webhook event.
    ///
    /// Verifies the `Stripe-Signature` header, parses the event, updates the
    /// KYC session, and updates the user's KYC status accordingly.
    ///
    /// # Errors
    /// - `Config` if the webhook secret is not configured.
    /// - `Unauthorized` if the signature does not verify.
    /// - `Validation` if the payload cannot be parsed.
    /// - `NotFound` if no matching KYC session exists.
    pub async fn handle_webhook(&self, payload: &[u8], signature: &str) -> Result<(), AppError> {
        let webhook_secret = self
            .settings_service
            .get_secret("kyc_webhook_secret")
            .await?
            .ok_or_else(|| AppError::Config("KYC webhook secret not configured".into()))?;

        if !StripeIdentityClient::verify_webhook_signature(payload, signature, &webhook_secret) {
            return Err(AppError::Unauthorized("Invalid webhook signature".into()));
        }

        let event = StripeIdentityClient::parse_webhook_event(payload)
            .map_err(|e| AppError::Validation(format!("Invalid webhook payload: {e}")))?;

        self.process_webhook_event(event).await
    }

    /// Return the current KYC status for `user_id`.
    ///
    /// If the user is `"verified"` but their `kyc_expires_at` has passed, the
    /// effective status is reported as `"expired"`.
    ///
    /// # Errors
    /// - `NotFound` if the user does not exist.
    pub async fn get_status(&self, user_id: Uuid) -> Result<KycStatusResponse, AppError> {
        let user = self
            .user_repo
            .find_by_id(user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        let effective_status = compute_effective_status(&user.kyc_status, user.kyc_expires_at);

        let enforcement_mode = self
            .settings_service
            .get("kyc_enforcement_mode")
            .await?
            .unwrap_or_else(|| "none".to_string());

        Ok(KycStatusResponse {
            status: effective_status,
            verified_at: user.kyc_verified_at,
            expires_at: user.kyc_expires_at,
            enforcement_mode,
        })
    }

    /// List KYC sessions for `user_id`, ordered by `created_at` descending.
    pub async fn list_sessions(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<KycSessionEntity>, AppError> {
        self.kyc_repo.list_by_user(user_id, limit, offset).await
    }

    /// Count total KYC sessions for `user_id`.
    pub async fn count_sessions(&self, user_id: Uuid) -> Result<u64, AppError> {
        self.kyc_repo.count_by_user(user_id).await
    }

    /// Check whether a specific transaction amount triggers KYC enforcement.
    ///
    /// This is independent of the global `kyc_enforcement_mode` — it activates
    /// only when a configured USD threshold is exceeded. A threshold of `0.0`
    /// means the check is disabled for that dimension.
    ///
    /// - `action`: `"deposit"` checks single-deposit and cumulative-deposit thresholds.
    ///   `"purchase"` checks the single-purchase threshold.
    /// - `single_amount_usd`: the amount of the current transaction in USD.
    /// - `cumulative_deposit_usd`: sum of all prior deposits in USD (only used when
    ///   `action == "deposit"`). `None` skips the cumulative check.
    ///
    /// Returns `Ok(())` when allowed (including when the user is already verified
    /// and not expired). Returns `Err(AppError::Forbidden)` when a threshold is
    /// breached.
    ///
    /// # Errors
    /// - `NotFound` if the user does not exist.
    pub async fn check_threshold(
        &self,
        user_id: Uuid,
        action: &str,
        single_amount_usd: f64,
        cumulative_deposit_usd: Option<f64>,
    ) -> Result<(), AppError> {
        let user = self
            .user_repo
            .find_by_id(user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        // Verified (and not expired) users pass all threshold checks.
        if user.kyc_status == "verified" {
            let still_valid = match user.kyc_expires_at {
                Some(exp) => exp > chrono::Utc::now(),
                None => true,
            };
            if still_valid {
                return Ok(());
            }
        }

        if action == "deposit" {
            let single_threshold = self
                .settings_service
                .get("kyc_single_deposit_usd")
                .await?
                .and_then(|s| s.parse::<f64>().ok())
                .unwrap_or(0.0);
            if threshold_exceeded(single_amount_usd, single_threshold) {
                return Err(AppError::Forbidden(
                    "KYC verification required for deposits over this amount".into(),
                ));
            }

            if let Some(prior_usd) = cumulative_deposit_usd {
                let cum_threshold = self
                    .settings_service
                    .get("kyc_cumulative_deposit_usd")
                    .await?
                    .and_then(|s| s.parse::<f64>().ok())
                    .unwrap_or(0.0);
                if threshold_exceeded(prior_usd + single_amount_usd, cum_threshold) {
                    return Err(AppError::Forbidden(
                        "KYC verification required: cumulative deposit limit exceeded".into(),
                    ));
                }
            }
        }

        if action == "purchase" {
            let threshold = self
                .settings_service
                .get("kyc_single_purchase_usd")
                .await?
                .and_then(|s| s.parse::<f64>().ok())
                .unwrap_or(0.0);
            if threshold_exceeded(single_amount_usd, threshold) {
                return Err(AppError::Forbidden(
                    "KYC verification required for purchases over this amount".into(),
                ));
            }
        }

        Ok(())
    }

    /// Check whether `user_id` may perform `action` under the current KYC
    /// enforcement mode.
    ///
    /// Returns `Ok(())` when the action is allowed. Returns
    /// `Err(AppError::Forbidden)` when KYC is required but the user has not
    /// passed (or has an expired) verification.
    ///
    /// # Errors
    /// - `NotFound` if the user does not exist (and enforcement is active).
    pub async fn check_enforcement(&self, user_id: Uuid, action: &str) -> Result<(), AppError> {
        let mode = self
            .settings_service
            .get("kyc_enforcement_mode")
            .await?
            .unwrap_or_else(|| "none".to_string());

        if !is_action_enforced(&mode, action) {
            return Ok(());
        }

        let user = self
            .user_repo
            .find_by_id(user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        if user.kyc_status != "verified" {
            return Err(AppError::Forbidden("KYC verification required".into()));
        }

        if let Some(expires) = user.kyc_expires_at {
            if expires <= Utc::now() {
                return Err(AppError::Forbidden("KYC verification has expired".into()));
            }
        }

        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

impl KycService {
    async fn check_kyc_enabled(&self) -> Result<(), AppError> {
        let enabled = self
            .settings_service
            .get_bool("kyc_enabled")
            .await?
            .unwrap_or(false);
        if !enabled {
            return Err(AppError::Validation(
                "KYC verification is not enabled".into(),
            ));
        }
        Ok(())
    }

    /// Load and validate required provider settings.
    ///
    /// Returns `(api_key, redirect_url, document_types, require_selfie)`.
    async fn load_provider_config(&self) -> Result<(String, String, Vec<String>, bool), AppError> {
        let api_key = self
            .settings_service
            .get_secret("kyc_api_secret_key")
            .await?
            .unwrap_or_default();
        if api_key.is_empty() {
            return Err(AppError::Config("KYC API key not configured".into()));
        }

        let redirect_url = self
            .settings_service
            .get("kyc_redirect_url")
            .await?
            .unwrap_or_default();
        if redirect_url.is_empty() {
            return Err(AppError::Config("KYC redirect URL not configured".into()));
        }

        let doc_types_str = self
            .settings_service
            .get("kyc_document_types")
            .await?
            .unwrap_or_else(|| "driving_license,id_card,passport".to_string());
        let doc_types: Vec<String> = doc_types_str
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        let require_selfie = self
            .settings_service
            .get_bool("kyc_require_selfie")
            .await?
            .unwrap_or(true);

        Ok((api_key, redirect_url, doc_types, require_selfie))
    }

    async fn process_webhook_event(&self, event: StripeWebhookEvent) -> Result<(), AppError> {
        let provider_session_id = &event.data.object.id;

        let kyc_session = match self
            .kyc_repo
            .find_by_provider_session_id("stripe", provider_session_id)
            .await?
        {
            Some(session) => session,
            None => {
                // Return Ok to prevent Stripe retry storms for sessions we don't track
                // (e.g., created before this system was deployed, or from another environment)
                tracing::warn!(
                    provider_session_id,
                    "KYC webhook for unknown session — acknowledging to prevent retries"
                );
                return Ok(());
            }
        };

        let (new_status, error_code, error_reason) =
            resolve_event_status(&event.event_type, &event);

        let new_status = match new_status {
            Some(s) => s,
            None => {
                tracing::debug!(
                    event_type = %event.event_type,
                    "Ignoring unhandled KYC event type"
                );
                return Ok(());
            }
        };

        self.kyc_repo
            .update_session_status(
                kyc_session.id,
                new_status,
                error_code.as_deref(),
                error_reason.as_deref(),
                serde_json::to_value(&event.data.object).unwrap_or_default(),
            )
            .await?;

        self.apply_user_status_from_webhook(kyc_session.user_id, new_status)
            .await
    }

    async fn apply_user_status_from_webhook(
        &self,
        user_id: Uuid,
        new_status: &str,
    ) -> Result<(), AppError> {
        match new_status {
            "verified" => {
                let expires_at = self.compute_expiry().await?;
                self.user_repo
                    .set_kyc_status(user_id, "verified", Some(Utc::now()), expires_at)
                    .await?;
            }
            "failed" => {
                self.user_repo
                    .set_kyc_status(user_id, "failed", None, None)
                    .await?;
            }
            "canceled" => {
                // Reset to none so the user can retry.
                self.user_repo
                    .set_kyc_status(user_id, "none", None, None)
                    .await?;
            }
            _ => {}
        }
        Ok(())
    }

    async fn compute_expiry(&self) -> Result<Option<chrono::DateTime<Utc>>, AppError> {
        let expiry_days = self
            .settings_service
            .get("kyc_expiry_days")
            .await?
            .and_then(|s| s.parse::<i64>().ok())
            .unwrap_or(0);

        Ok(if expiry_days > 0 {
            Some(Utc::now() + Duration::days(expiry_days))
        } else {
            None
        })
    }
}

// ---------------------------------------------------------------------------
// Pure functions (no I/O, easier to unit-test)
// ---------------------------------------------------------------------------

/// Map a Stripe event type to `(Option<status>, error_code, error_reason)`.
///
/// Returns `(None, _, _)` for events that should be silently ignored.
fn resolve_event_status<'a>(
    event_type: &str,
    event: &'a StripeWebhookEvent,
) -> (Option<&'a str>, Option<String>, Option<String>) {
    match event_type {
        "identity.verification_session.verified" => (Some("verified"), None, None),
        "identity.verification_session.requires_input" => {
            let (code, reason) = event
                .data
                .object
                .last_error
                .as_ref()
                .map(|e| {
                    (
                        e.code.as_deref().map(String::from),
                        e.reason.as_deref().map(String::from),
                    )
                })
                .unwrap_or((None, None));
            (Some("failed"), code, reason)
        }
        "identity.verification_session.canceled" => (Some("canceled"), None, None),
        _ => (None, None, None),
    }
}

/// Compute the effective status, accounting for expiry.
fn compute_effective_status(
    stored_status: &str,
    expires_at: Option<chrono::DateTime<Utc>>,
) -> String {
    if stored_status == "verified" {
        if let Some(exp) = expires_at {
            if exp <= Utc::now() {
                return "expired".to_string();
            }
        }
    }
    stored_status.to_string()
}

/// Returns `true` if `amount >= threshold` and the threshold is enabled (> 0).
///
/// A `threshold` of `0.0` means the check is disabled and this always returns `false`.
fn threshold_exceeded(amount: f64, threshold: f64) -> bool {
    threshold > 0.0 && amount >= threshold
}

/// Returns `true` if the given `action` is subject to KYC enforcement under `mode`.
fn is_action_enforced(mode: &str, action: &str) -> bool {
    match mode {
        "none" | "optional" => false,
        "all" => true,
        "withdrawals" => action == "withdrawals",
        "deposits" => action == "deposits",
        _ => false,
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    // ---- compute_effective_status ------------------------------------------

    #[test]
    fn verified_without_expiry_stays_verified() {
        assert_eq!(compute_effective_status("verified", None), "verified");
    }

    #[test]
    fn verified_with_future_expiry_stays_verified() {
        let future = Utc::now() + Duration::days(10);
        assert_eq!(
            compute_effective_status("verified", Some(future)),
            "verified"
        );
    }

    #[test]
    fn verified_with_past_expiry_becomes_expired() {
        let past = Utc::now() - Duration::days(1);
        assert_eq!(compute_effective_status("verified", Some(past)), "expired");
    }

    #[test]
    fn non_verified_status_is_unchanged() {
        for s in ["none", "pending", "failed", "canceled"] {
            let past = Utc::now() - Duration::days(1);
            assert_eq!(compute_effective_status(s, Some(past)), s);
        }
    }

    // ---- is_action_enforced ------------------------------------------------

    #[test]
    fn none_mode_never_enforced() {
        assert!(!is_action_enforced("none", "withdrawals"));
        assert!(!is_action_enforced("none", "deposits"));
        assert!(!is_action_enforced("none", "all"));
    }

    #[test]
    fn optional_mode_never_enforced() {
        assert!(!is_action_enforced("optional", "withdrawals"));
    }

    #[test]
    fn all_mode_always_enforced() {
        assert!(is_action_enforced("all", "withdrawals"));
        assert!(is_action_enforced("all", "deposits"));
        assert!(is_action_enforced("all", "anything"));
    }

    #[test]
    fn withdrawals_mode_only_enforces_withdrawals() {
        assert!(is_action_enforced("withdrawals", "withdrawals"));
        assert!(!is_action_enforced("withdrawals", "deposits"));
    }

    #[test]
    fn deposits_mode_only_enforces_deposits() {
        assert!(is_action_enforced("deposits", "deposits"));
        assert!(!is_action_enforced("deposits", "withdrawals"));
    }

    #[test]
    fn unknown_mode_never_enforced() {
        assert!(!is_action_enforced("unknown_mode", "withdrawals"));
    }

    // ---- threshold_exceeded ------------------------------------------------

    #[test]
    fn threshold_zero_is_disabled() {
        // threshold = 0 always passes regardless of amount
        assert!(!threshold_exceeded(0.0, 0.0));
        assert!(!threshold_exceeded(10_000.0, 0.0));
    }

    #[test]
    fn amount_below_threshold_passes() {
        assert!(!threshold_exceeded(49.99, 50.0));
    }

    #[test]
    fn amount_at_threshold_fails() {
        assert!(threshold_exceeded(50.0, 50.0));
    }

    #[test]
    fn amount_above_threshold_fails() {
        assert!(threshold_exceeded(100.0, 50.0));
    }

    #[test]
    fn cumulative_add_at_threshold_fails() {
        // prior 40 + current 10 = exactly 50 which meets a 50 threshold
        assert!(threshold_exceeded(40.0 + 10.0, 50.0));
    }

    #[test]
    fn cumulative_add_below_threshold_passes() {
        // prior 40 + current 9.99 = 49.99, below threshold of 50
        assert!(!threshold_exceeded(40.0 + 9.99, 50.0));
    }
}
