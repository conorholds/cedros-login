//! Business logic services
//!
//! # Metrics Recommendations
//!
//! For production observability, consider adding metrics to these key services:
//!
//! ## Authentication Metrics (jwt_service, password_service, totp_service)
//! - `auth_login_total{method=email|google|wallet|mfa}` - Login attempts counter
//! - `auth_login_duration_seconds` - Login latency histogram
//! - `auth_token_refresh_total` - Token refresh counter
//! - `auth_mfa_verification_total{success=true|false}` - MFA verification counter
//! - `auth_password_hash_duration_seconds` - Argon2 hashing latency
//!
//! ## Authorization Metrics (authorization_service, policy_service)
//! - `authz_permission_check_total{permission, allowed=true|false}` - Permission checks
//! - `authz_policy_evaluation_total{policy, result}` - Policy evaluation counter
//! - `authz_role_assignment_total{role}` - Role assignment counter
//!
//! ## External Service Metrics (google_service, solana_service, email providers)
//! - `external_request_total{service, status}` - External API call counter
//! - `external_request_duration_seconds{service}` - External API latency
//! - `google_jwks_cache_hit_total` / `google_jwks_cache_miss_total` - JWKS cache efficiency
//!
//! ## Email/Notification Metrics (comms_service, notification_service)
//! - `email_sent_total{type, provider, status}` - Email sending counter
//! - `notification_sent_total{channel, severity}` - Admin notification counter
//! - `outbox_queue_size` - Pending outbox messages gauge
//!
//! ## Recommended Libraries
//! - `metrics` + `metrics-exporter-prometheus` for Prometheus-compatible metrics
//! - Use `metrics::describe_*` for metric documentation
//! - Add `/metrics` endpoint in router for scraping

mod account_deletion_service;
#[cfg(test)]
mod account_deletion_service_tests;
mod apple_oauth_service;
mod apple_service;
mod audit_service;
mod authorization_service;
mod canonical_email_service;
mod circuit_breaker;
mod comms_service;
pub(crate) mod cpu_work;
mod email;
mod encryption_service;
mod google_service;
mod image_storage;
mod invite_code_service;
mod jwt_service;
mod logging_service;
mod metrics_service;
mod mfa_attempt_service;
mod note_encryption_service;
mod notification_service;
pub mod oidc_service;
mod outbox_worker;
mod password_service;
mod policy_service;
#[cfg(test)]
mod provider_test_support;
mod settings_service;
mod signup_limit_service;
mod solana_service;
mod step_up_service;
mod subscription_selection_service;
mod totp_service;
pub mod webauthn_service;

pub use crate::domain::Permission;
pub use account_deletion_service::{delete_account, AccountDeletionOutcome};
pub use apple_oauth_service::{
    exchange_and_encrypt_refresh_token, extract_apple_refresh_token_metadata,
    revoke_encrypted_refresh_token, sync_apple_credential,
    verify_apple_id_token_for_allowed_clients, VerifiedAppleToken,
};
pub use apple_service::{AppleService, AppleTokenClaims};
pub use audit_service::AuditService;
pub use authorization_service::{AuthContext, AuthorizationResult, AuthorizationService};
pub use canonical_email_service::CanonicalEmailService;
pub use comms_service::CommsService;
pub(crate) use email::{
    account_deletion_email_with_subject, instant_link_email_with_subject,
    invite_email_with_subject, password_reset_email_with_subject,
    security_alert_email_with_subject, verification_email_with_subject,
};
pub use email::{
    configure_email_service, configure_standalone_email_service, AccountDeletionEmailData,
    ConfiguredEmailService, Email, EmailDeliveryCapability, EmailDeliveryContext,
    EmailDeliveryReceipt, EmailService, EmailType, InstantLinkEmailData, InviteEmailData,
    LogEmailService, NoopEmailService, PasswordResetEmailData, PostmarkEmailService,
    SecurityAlertEmailData, VerificationEmailData, EMAIL_DELIVERY_CONTRACT_VERSION,
};
pub use encryption_service::EncryptionService;
pub use google_service::{GoogleService, GoogleTokenClaims};
pub(crate) use image_storage::{avatar_key_for_user, build_s3_image_storage_service};
pub use image_storage::{ImageStorageService, S3ImageStorageConfig, S3ImageStorageService};
pub use invite_code_service::{InviteCodeConfig, InviteCodeDiscount, InviteCodeService};
pub use jwt_service::{AccessTokenClaims, JwtService, TokenContext};
pub use logging_service::{init_logging, LogLevel, LoggingService};
pub use metrics_service::{
    get_prometheus_handle, init_metrics, record_auth_duration, record_auth_failure,
    record_auth_success, record_error, record_http_request, record_rate_limit_hit,
    record_session_created, record_session_revoked, record_user_registered, render_metrics,
    set_active_sessions, set_outbox_queue_counts, set_total_users,
};
pub use mfa_attempt_service::MfaAttemptService;
pub use note_encryption_service::{
    EncryptedNote, NoteEncryptionService, NONCE_SIZE as NOTE_NONCE_SIZE,
};
pub use notification_service::{
    AdminNotification, DiscordNotificationService, LogNotificationService, NoopNotificationService,
    NotificationService, NotificationSeverity, TelegramNotificationService,
};
pub use oidc_service::OidcService;
pub use outbox_worker::{OutboxWorker, OutboxWorkerConfig};
pub use password_service::{PasswordRules, PasswordService};
pub use policy_service::{PolicyContext, PolicyEvaluationResult, PolicyService};
pub use settings_service::SettingsService;
pub use signup_limit_service::{SignupLimitAvailability, SignupLimitPermit, SignupLimitService};
pub use solana_service::SolanaService;
pub use step_up_service::{StepUpService, DEFAULT_STEP_UP_MAX_AGE_SECS};
pub use subscription_selection_service::{
    ResolvedPlanSeatLimit, SubscriptionSelectionConfig, SubscriptionSelectionService,
};
pub use totp_service::TotpService;
pub use webauthn_service::WebAuthnService;
