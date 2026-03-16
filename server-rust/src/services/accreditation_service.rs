//! Accreditation verification service
//!
//! Coordinates the accredited-investor verification lifecycle: submission,
//! document attachment, admin review, status queries, and enforcement checks.
//!
//! # Settings keys consumed
//! - `accreditation_enabled` (bool) — master switch; `submit_verification` returns an
//!   error when false.
//! - `accreditation_enforcement_mode` (string) — one of `"none"`, `"optional"`,
//!   `"required"`; defaults to `"none"`.
//! - `accreditation_default_expiry_days_income` (integer string) — days until an
//!   income/net_worth approval expires; `0` means never.
//! - `accreditation_default_expiry_days_letter` (integer string) — days until a
//!   third_party_letter approval expires; `0` means never.
//! - `accreditation_default_expiry_days_credential` (integer string) — days until a
//!   credential approval expires; `0` means never.

use std::sync::Arc;

use chrono::{DateTime, Duration, Utc};
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    AccreditationDocumentEntity, AccreditationRepository, AccreditationSubmissionEntity,
    UserRepository,
};
use crate::services::settings_service::SettingsService;

// ---------------------------------------------------------------------------
// Public request / response types
// ---------------------------------------------------------------------------

/// Returned by [`AccreditationService::get_status`].
pub struct AccreditationStatusResponse {
    /// Effective status: `"none"`, `"pending"`, `"approved"`, `"rejected"`, or `"expired"`.
    pub status: String,
    /// When accreditation was last approved, if ever.
    pub verified_at: Option<DateTime<Utc>>,
    /// When the approval expires, if set.
    pub expires_at: Option<DateTime<Utc>>,
    /// Current enforcement mode from settings.
    pub enforcement_mode: String,
}

/// Returned by [`AccreditationService::submit_verification`].
pub struct SubmitAccreditationResponse {
    /// Internal submission ID for document upload and tracking.
    pub submission_id: Uuid,
}

/// Input data for [`AccreditationService::submit_verification`], decoded from the
/// HTTP request body by the handler layer.
pub struct SubmitAccreditationData {
    /// One of: `income`, `net_worth`, `credential`, `third_party_letter`, `insider`,
    /// `investment_threshold`.
    pub method: String,
    /// `"individual"` or `"joint"` — required for `income` method.
    pub income_type: Option<String>,
    /// Stated income or net worth in USD — required for `income` and `net_worth`.
    pub stated_amount_usd: Option<f64>,
    /// FINRA CRD number — required for `credential`.
    pub crd_number: Option<String>,
    /// One of `series_7`, `series_65`, `series_82` — required for `credential`.
    pub license_type: Option<String>,
    /// Investment commitment in USD — required for `investment_threshold`.
    pub investment_commitment_usd: Option<f64>,
    /// `"individual"` or `"entity"` — required for `investment_threshold`.
    pub entity_type: Option<String>,
    /// Free-text statement — required for `insider`.
    pub user_statement: Option<String>,
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/// Orchestrates the accredited-investor verification lifecycle.
pub struct AccreditationService {
    accreditation_repo: Arc<dyn AccreditationRepository>,
    user_repo: Arc<dyn UserRepository>,
    settings_service: Arc<SettingsService>,
}

impl AccreditationService {
    /// Create a new `AccreditationService`.
    pub fn new(
        accreditation_repo: Arc<dyn AccreditationRepository>,
        user_repo: Arc<dyn UserRepository>,
        settings_service: Arc<SettingsService>,
    ) -> Self {
        Self {
            accreditation_repo,
            user_repo,
            settings_service,
        }
    }

    /// Submit a new accreditation verification request for `user_id`.
    ///
    /// # Errors
    /// - `Validation` if accreditation is not enabled.
    /// - `Validation` if the user already has a non-expired `approved` status.
    /// - `Validation` if a `pending` submission already exists.
    /// - `Validation` if required method-specific fields are absent.
    /// - `NotFound` if the user does not exist.
    pub async fn submit_verification(
        &self,
        user_id: Uuid,
        data: SubmitAccreditationData,
    ) -> Result<SubmitAccreditationResponse, AppError> {
        self.check_accreditation_enabled().await?;

        let user = self
            .user_repo
            .find_by_id(user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        // Block if user already has a valid approval.
        if user.accreditation_status == "approved" {
            let still_valid = match user.accreditation_expires_at {
                Some(exp) => exp > Utc::now(),
                None => true,
            };
            if still_valid {
                return Err(AppError::Validation(
                    "User is already accredited".into(),
                ));
            }
        }

        // Prevent duplicate in-flight submissions.
        if user.accreditation_status == "pending" {
            return Err(AppError::Validation(
                "An accreditation submission is already in progress".into(),
            ));
        }

        validate_method(&data.method)?;
        validate_method_fields(&data)?;

        let now = Utc::now();
        let submission = AccreditationSubmissionEntity {
            id: Uuid::new_v4(),
            user_id,
            method: data.method,
            status: "pending".to_string(),
            income_type: data.income_type,
            stated_amount_usd: data.stated_amount_usd,
            crd_number: data.crd_number,
            license_type: data.license_type,
            investment_commitment_usd: data.investment_commitment_usd,
            entity_type: data.entity_type,
            user_statement: data.user_statement,
            reviewed_by: None,
            reviewed_at: None,
            reviewer_notes: None,
            rejection_reason: None,
            expires_at: None,
            created_at: now,
            updated_at: now,
        };

        let stored = self
            .accreditation_repo
            .create_submission(submission)
            .await?;

        self.user_repo
            .set_accreditation_status(user_id, "pending", None, None)
            .await?;

        Ok(SubmitAccreditationResponse {
            submission_id: stored.id,
        })
    }

    /// Attach a document to an existing pending submission.
    ///
    /// # Errors
    /// - `NotFound` if the submission does not exist or belongs to a different user.
    /// - `Validation` if the submission is no longer `pending`.
    /// - `Validation` if `doc_type` is not a recognised value.
    pub async fn add_document(
        &self,
        user_id: Uuid,
        submission_id: Uuid,
        doc_type: String,
        s3_key: String,
        filename: Option<String>,
        content_type: Option<String>,
        size: Option<i64>,
    ) -> Result<AccreditationDocumentEntity, AppError> {
        let submission = self
            .accreditation_repo
            .find_submission_by_id(submission_id)
            .await?
            .filter(|s| s.user_id == user_id)
            .ok_or_else(|| AppError::NotFound("Submission not found".into()))?;

        if submission.status != "pending" {
            return Err(AppError::Validation(
                "Cannot add documents to a non-pending submission".into(),
            ));
        }

        validate_doc_type(&doc_type)?;

        let doc = AccreditationDocumentEntity {
            id: Uuid::new_v4(),
            submission_id,
            document_type: doc_type,
            s3_key,
            original_filename: filename,
            content_type,
            file_size_bytes: size,
            uploaded_at: Utc::now(),
        };

        self.accreditation_repo.add_document(doc).await
    }

    /// Return the current accreditation status for `user_id`.
    ///
    /// If the stored status is `"approved"` but `accreditation_expires_at` has
    /// passed, the effective status is reported as `"expired"`.
    ///
    /// # Errors
    /// - `NotFound` if the user does not exist.
    pub async fn get_status(
        &self,
        user_id: Uuid,
    ) -> Result<AccreditationStatusResponse, AppError> {
        let user = self
            .user_repo
            .find_by_id(user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        let effective_status = compute_effective_accreditation_status(
            &user.accreditation_status,
            user.accreditation_expires_at,
        );

        let enforcement_mode = self
            .settings_service
            .get("accreditation_enforcement_mode")
            .await?
            .unwrap_or_else(|| "none".to_string());

        Ok(AccreditationStatusResponse {
            status: effective_status,
            verified_at: user.accreditation_verified_at,
            expires_at: user.accreditation_expires_at,
            enforcement_mode,
        })
    }

    /// List accreditation submissions for `user_id`, ordered by `created_at` descending.
    pub async fn list_submissions(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<AccreditationSubmissionEntity>, AppError> {
        self.accreditation_repo
            .list_submissions_by_user(user_id, limit, offset)
            .await
    }

    /// Count total accreditation submissions for `user_id`.
    pub async fn count_submissions(&self, user_id: Uuid) -> Result<u64, AppError> {
        self.accreditation_repo
            .count_submissions_by_user(user_id)
            .await
    }

    /// List pending submissions for admin review, ordered oldest-first.
    ///
    /// Returns `(submissions, total_count)`.
    pub async fn admin_list_pending(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<(Vec<AccreditationSubmissionEntity>, u64), AppError> {
        let submissions = self
            .accreditation_repo
            .list_pending_submissions(limit, offset)
            .await?;
        let total = self
            .accreditation_repo
            .count_pending_submissions()
            .await?;
        Ok((submissions, total))
    }

    /// Fetch a single submission by ID (admin use; no user scoping).
    pub async fn admin_get_submission(
        &self,
        submission_id: Uuid,
    ) -> Result<Option<AccreditationSubmissionEntity>, AppError> {
        self.accreditation_repo
            .find_submission_by_id(submission_id)
            .await
    }

    /// List all documents attached to a submission (admin use).
    pub async fn admin_list_documents(
        &self,
        submission_id: Uuid,
    ) -> Result<Vec<AccreditationDocumentEntity>, AppError> {
        self.accreditation_repo
            .list_documents_by_submission(submission_id)
            .await
    }

    /// Fetch a single document by ID (admin use; no user scoping).
    pub async fn admin_get_document(
        &self,
        doc_id: Uuid,
    ) -> Result<Option<AccreditationDocumentEntity>, AppError> {
        self.accreditation_repo.find_document_by_id(doc_id).await
    }

    /// Record an admin review decision on a submission.
    ///
    /// - If `approved`: updates the submission to `approved`, sets the user's
    ///   accreditation status to `approved`, and computes an expiry from settings
    ///   (overridden by `custom_expiry_days` when provided).
    /// - If rejected: updates the submission to `rejected` and sets the user's
    ///   accreditation status to `rejected`.
    ///
    /// # Errors
    /// - `NotFound` if the submission does not exist.
    /// - `Validation` if the submission is not currently `pending`.
    pub async fn admin_review(
        &self,
        submission_id: Uuid,
        admin_id: Uuid,
        approved: bool,
        reviewer_notes: Option<String>,
        rejection_reason: Option<String>,
        custom_expiry_days: Option<u32>,
    ) -> Result<(), AppError> {
        let submission = self
            .accreditation_repo
            .find_submission_by_id(submission_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Submission not found".into()))?;

        if submission.status != "pending" {
            return Err(AppError::Validation(
                "Submission is not pending".into(),
            ));
        }

        if approved {
            let expires_at = self
                .compute_expiry(&submission.method, custom_expiry_days)
                .await?;

            self.accreditation_repo
                .update_submission_review(
                    submission_id,
                    "approved",
                    admin_id,
                    reviewer_notes.as_deref(),
                    None,
                    expires_at,
                )
                .await?;

            self.user_repo
                .set_accreditation_status(
                    submission.user_id,
                    "approved",
                    Some(Utc::now()),
                    expires_at,
                )
                .await?;
        } else {
            self.accreditation_repo
                .update_submission_review(
                    submission_id,
                    "rejected",
                    admin_id,
                    reviewer_notes.as_deref(),
                    rejection_reason.as_deref(),
                    None,
                )
                .await?;

            self.user_repo
                .set_accreditation_status(submission.user_id, "rejected", None, None)
                .await?;
        }

        Ok(())
    }

    /// Check whether `user_id` may proceed under the current accreditation
    /// enforcement mode.
    ///
    /// - `"none"` / `"optional"` — always `Ok`.
    /// - `"required"` — the user must be `approved` and not expired.
    ///
    /// # Errors
    /// - `Forbidden` if enforcement is `"required"` and the user is not accredited.
    /// - `NotFound` if the user does not exist (only when enforcement is active).
    pub async fn check_enforcement(&self, user_id: Uuid) -> Result<(), AppError> {
        let mode = self
            .settings_service
            .get("accreditation_enforcement_mode")
            .await?
            .unwrap_or_else(|| "none".to_string());

        if mode == "none" || mode == "optional" {
            return Ok(());
        }

        // mode == "required" (or unrecognised — fail closed)
        let user = self
            .user_repo
            .find_by_id(user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        if user.accreditation_status != "approved" {
            return Err(AppError::Forbidden(
                "Accreditation required".into(),
            ));
        }

        if let Some(expires) = user.accreditation_expires_at {
            if expires <= Utc::now() {
                return Err(AppError::Forbidden(
                    "Accreditation has expired".into(),
                ));
            }
        }

        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

impl AccreditationService {
    async fn check_accreditation_enabled(&self) -> Result<(), AppError> {
        let enabled = self
            .settings_service
            .get_bool("accreditation_enabled")
            .await?
            .unwrap_or(false);
        if !enabled {
            return Err(AppError::Validation(
                "Accreditation verification is not enabled".into(),
            ));
        }
        Ok(())
    }

    /// Compute approval expiry from settings, with `custom_expiry_days` overriding the default.
    ///
    /// Returns `None` when the relevant expiry setting is `0` or absent (never expires).
    async fn compute_expiry(
        &self,
        method: &str,
        custom_expiry_days: Option<u32>,
    ) -> Result<Option<DateTime<Utc>>, AppError> {
        let days = if let Some(custom) = custom_expiry_days {
            custom as i64
        } else {
            let key = expiry_settings_key(method);
            self.settings_service
                .get(key)
                .await?
                .and_then(|s| s.parse::<i64>().ok())
                .unwrap_or(0)
        };

        Ok(if days > 0 {
            Some(Utc::now() + Duration::days(days))
        } else {
            None
        })
    }
}

// ---------------------------------------------------------------------------
// Pure functions
// ---------------------------------------------------------------------------

/// Compute the effective accreditation status, collapsing an expired approval
/// to `"expired"`.
pub fn compute_effective_accreditation_status(
    stored_status: &str,
    expires_at: Option<DateTime<Utc>>,
) -> String {
    if stored_status == "approved" {
        if let Some(exp) = expires_at {
            if exp <= Utc::now() {
                return "expired".to_string();
            }
        }
    }
    stored_status.to_string()
}

/// Validate that `method` is a recognised accreditation method.
///
/// # Errors
/// - `Validation` for an unrecognised method string.
pub fn validate_method(method: &str) -> Result<(), AppError> {
    match method {
        "income"
        | "net_worth"
        | "credential"
        | "third_party_letter"
        | "insider"
        | "investment_threshold" => Ok(()),
        _ => Err(AppError::Validation(format!(
            "Unknown accreditation method: {method}"
        ))),
    }
}

/// Validate that `doc_type` is a recognised document type.
///
/// # Errors
/// - `Validation` for an unrecognised doc-type string.
pub fn validate_doc_type(doc_type: &str) -> Result<(), AppError> {
    match doc_type {
        "tax_w2"
        | "tax_1099"
        | "tax_return"
        | "pay_stub"
        | "bank_statement"
        | "brokerage_statement"
        | "third_party_letter"
        | "finra_license"
        | "insider_certification"
        | "subscription_agreement"
        | "other" => Ok(()),
        _ => Err(AppError::Validation(format!(
            "Unknown document type: {doc_type}"
        ))),
    }
}

/// Return the settings key for the default expiry days of a given method.
fn expiry_settings_key(method: &str) -> &'static str {
    match method {
        "credential" => "accreditation_default_expiry_days_credential",
        "third_party_letter" => "accreditation_default_expiry_days_letter",
        // income, net_worth, insider, investment_threshold → income default
        _ => "accreditation_default_expiry_days_income",
    }
}

/// Validate method-specific required fields on a submission request.
fn validate_method_fields(data: &SubmitAccreditationData) -> Result<(), AppError> {
    match data.method.as_str() {
        "income" => {
            require_field(data.income_type.as_deref(), "income_type")?;
            require_f64(data.stated_amount_usd, "stated_amount_usd")?;
        }
        "net_worth" => {
            require_f64(data.stated_amount_usd, "stated_amount_usd")?;
        }
        "credential" => {
            require_field(data.crd_number.as_deref(), "crd_number")?;
            let lt = require_field(data.license_type.as_deref(), "license_type")?;
            match lt {
                "series_7" | "series_65" | "series_82" => {}
                other => {
                    return Err(AppError::Validation(format!(
                        "Unknown license_type: {other}"
                    )))
                }
            }
        }
        "third_party_letter" => {
            // Documents are uploaded separately; no scalar fields required.
        }
        "insider" => {
            require_field(data.user_statement.as_deref(), "user_statement")?;
        }
        "investment_threshold" => {
            require_f64(data.investment_commitment_usd, "investment_commitment_usd")?;
            let et = require_field(data.entity_type.as_deref(), "entity_type")?;
            match et {
                "individual" | "entity" => {}
                other => {
                    return Err(AppError::Validation(format!(
                        "Unknown entity_type: {other}"
                    )))
                }
            }
        }
        // validate_method() was already called; this branch is unreachable.
        _ => {}
    }
    Ok(())
}

/// Assert a required `Option<&str>` field is present and non-empty; returns the value.
fn require_field<'a>(value: Option<&'a str>, name: &str) -> Result<&'a str, AppError> {
    match value {
        Some(v) if !v.is_empty() => Ok(v),
        _ => Err(AppError::Validation(format!(
            "Missing required field: {name}"
        ))),
    }
}

/// Assert a required `Option<f64>` field is present.
fn require_f64(value: Option<f64>, name: &str) -> Result<f64, AppError> {
    value.ok_or_else(|| AppError::Validation(format!("Missing required field: {name}")))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    // ---- compute_effective_accreditation_status ----------------------------

    #[test]
    fn approved_without_expiry_stays_approved() {
        assert_eq!(
            compute_effective_accreditation_status("approved", None),
            "approved"
        );
    }

    #[test]
    fn approved_with_future_expiry_stays_approved() {
        let future = Utc::now() + Duration::days(30);
        assert_eq!(
            compute_effective_accreditation_status("approved", Some(future)),
            "approved"
        );
    }

    #[test]
    fn approved_with_past_expiry_becomes_expired() {
        let past = Utc::now() - Duration::days(1);
        assert_eq!(
            compute_effective_accreditation_status("approved", Some(past)),
            "expired"
        );
    }

    #[test]
    fn non_approved_statuses_are_unchanged() {
        let past = Utc::now() - Duration::days(1);
        for s in ["none", "pending", "rejected", "expired"] {
            assert_eq!(
                compute_effective_accreditation_status(s, Some(past)),
                s,
                "status '{s}' should not be modified"
            );
        }
    }

    // ---- validate_method ---------------------------------------------------

    #[test]
    fn valid_methods_are_accepted() {
        for m in [
            "income",
            "net_worth",
            "credential",
            "third_party_letter",
            "insider",
            "investment_threshold",
        ] {
            assert!(validate_method(m).is_ok(), "expected '{m}' to be valid");
        }
    }

    #[test]
    fn invalid_method_is_rejected() {
        assert!(validate_method("wire_transfer").is_err());
        assert!(validate_method("").is_err());
        assert!(validate_method("INCOME").is_err());
    }

    // ---- validate_doc_type -------------------------------------------------

    #[test]
    fn valid_doc_types_are_accepted() {
        for dt in [
            "tax_w2",
            "tax_1099",
            "tax_return",
            "pay_stub",
            "bank_statement",
            "brokerage_statement",
            "third_party_letter",
            "finra_license",
            "insider_certification",
            "subscription_agreement",
            "other",
        ] {
            assert!(
                validate_doc_type(dt).is_ok(),
                "expected '{dt}' to be valid"
            );
        }
    }

    #[test]
    fn invalid_doc_type_is_rejected() {
        assert!(validate_doc_type("selfie").is_err());
        assert!(validate_doc_type("").is_err());
    }
}
