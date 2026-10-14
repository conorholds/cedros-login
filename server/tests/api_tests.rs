//! Integration tests for the authentication API.

#[path = "api/api_account_emails_tests.rs"]
mod api_account_emails_tests;
#[path = "api/api_admin_user_email_tests.rs"]
mod api_admin_user_email_tests;
#[path = "api/api_cookie_auth_tests.rs"]
mod api_cookie_auth_tests;
#[path = "api/api_cookie_refresh_tests.rs"]
mod api_cookie_refresh_tests;
#[path = "api/api_cookie_session_tests.rs"]
mod api_cookie_session_tests;
#[path = "api/api_cookie_support.rs"]
mod api_cookie_support;
#[path = "api/api_credential_lifecycle_tests.rs"]
mod api_credential_lifecycle_tests;
#[path = "api/api_hybrid_storage_tests.rs"]
mod api_hybrid_storage_tests;
#[path = "api/api_hybrid_support.rs"]
mod api_hybrid_support;
#[path = "api/api_invite_codes_tests.rs"]
mod api_invite_codes_tests;
#[path = "api/api_mfa_disable_tests.rs"]
mod api_mfa_disable_tests;
#[path = "api/api_new_device_alert_tests.rs"]
mod api_new_device_alert_tests;
#[path = "api/api_org_solana_tests.rs"]
mod api_org_solana_tests;
#[path = "api/api_public_auth_tests.rs"]
mod api_public_auth_tests;
#[path = "api/api_rate_limit_tests.rs"]
mod api_rate_limit_tests;
#[path = "api/api_session_security_tests.rs"]
mod api_session_security_tests;
#[path = "api/api_settings_commit_tests.rs"]
mod api_settings_commit_tests;
#[path = "api/api_solana_link_tests.rs"]
mod api_solana_link_tests;
#[path = "api/api_support.rs"]
mod api_support;
#[path = "api/api_token_consumption_tests.rs"]
mod api_token_consumption_tests;
#[path = "api/api_verification_policy_tests.rs"]
mod api_verification_policy_tests;

#[path = "api/api_authorization_tests.rs"]
mod api_authorization_tests;

#[path = "api/api_identity_lifecycle_tests.rs"]
mod api_identity_lifecycle_tests;

#[path = "api/api_abuse_tests.rs"]
mod api_abuse_tests;
