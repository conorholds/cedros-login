//! Business logic services
//!
//! # Metrics Recommendations (S-14)
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

mod apple_service;
mod audit_service;
mod authorization_service;
mod circuit_breaker;
mod comms_service;
mod credit_service;
mod credit_types;
mod deposit_credit_service;
mod deposit_fee_service;
mod deposit_service;
mod deposit_tiered_service;
mod email;
mod encrypted_payload;
mod encryption_service;
mod google_service;
mod hold_expiration_worker;
mod jupiter_swap_service;
mod jwt_service;
mod logging_service;
mod metrics_service;
mod mfa_attempt_service;
mod micro_batch_worker;
mod note_encryption_service;
mod notification_service;
pub mod oidc_service;
mod outbox_worker;
mod password_service;
mod policy_service;
mod privacy_sidecar_client;
mod settings_service;
mod sidecar_types;
mod sol_price_service;
mod solana_service;
mod step_up_service;
mod totp_service;
mod wallet_signing_service;
mod wallet_unlock_cache;
pub mod webauthn_service;
mod withdrawal_worker;

pub use apple_service::{AppleService, AppleTokenClaims};
pub use audit_service::AuditService;
pub use authorization_service::{
    AuthContext, AuthorizationResult, AuthorizationService, Permission,
};
pub use comms_service::CommsService;
pub use credit_service::{
    AdjustResult, CreditBalance, CreditHistory, CreditHistoryItem, CreditService, HoldResult,
    SpendResult,
};
pub use deposit_credit_service::{CreditParams, CreditResult, DepositCreditService};
pub use deposit_fee_service::{CalculatedFees, DepositFeeService, FeeConfig, FeePolicy};
pub use deposit_service::{DepositResult, DepositService};
pub use deposit_tiered_service::{
    execute_admin_withdrawal, MicroDepositResult, PublicDepositResult, TieredDepositService,
};
pub use email::{
    Email, EmailService, EmailType, InstantLinkEmailData, InviteEmailData, LogEmailService,
    NoopEmailService, PasswordResetEmailData, PostmarkEmailService, SecurityAlertEmailData,
    VerificationEmailData,
};
pub(crate) use encrypted_payload::decrypt_base64_payload;
pub use encryption_service::EncryptionService;
pub use google_service::{GoogleService, GoogleTokenClaims};
pub use hold_expiration_worker::{HoldExpirationConfig, HoldExpirationWorker};
pub use jupiter_swap_service::{
    ExecuteResult as JupiterExecuteResult, JupiterSwapService, OrderParams as JupiterOrderParams,
    SwapOrder as JupiterSwapOrder,
};
pub use jwt_service::{AccessTokenClaims, JwtService, TokenContext};
pub use logging_service::{init_logging, LogLevel, LoggingService};
pub use metrics_service::{
    get_prometheus_handle, init_metrics, record_auth_duration, record_auth_failure,
    record_auth_success, record_credits_spent, record_deposit, record_error, record_http_request,
    record_rate_limit_hit, record_session_created, record_session_revoked, record_user_registered,
    record_withdrawal, render_metrics, set_active_sessions, set_total_users,
};
pub use mfa_attempt_service::MfaAttemptService;
pub use micro_batch_worker::MicroBatchWorker;
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
pub use privacy_sidecar_client::{
    BalanceResponse as SidecarBalanceResponse, DepositResponse as SidecarDepositResponse,
    PrivacySidecarClient, SidecarClientConfig, WithdrawResponse as SidecarWithdrawResponse,
};
pub use settings_service::SettingsService;
pub use sol_price_service::SolPriceService;
pub use solana_service::SolanaService;
pub use step_up_service::{StepUpService, DEFAULT_STEP_UP_MAX_AGE_SECS};
pub use totp_service::TotpService;
pub use wallet_signing_service::{
    derive_child_seed_from_bytes, derive_pubkey_at_index,
    UnlockCredential as WalletUnlockCredential, WalletSigningService,
};
pub use wallet_unlock_cache::{
    create_wallet_unlock_cache, WalletUnlockCache, WalletUnlockCacheConfig,
};
pub use webauthn_service::WebAuthnService;
pub use withdrawal_worker::{WithdrawalWorker, WithdrawalWorkerConfig};
