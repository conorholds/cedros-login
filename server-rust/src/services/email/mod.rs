//! Email service for sending verification and password reset emails

mod providers;
mod templates;

#[cfg(test)]
mod tests;

pub use providers::{LogEmailService, NoopEmailService, PostmarkEmailService};

use async_trait::async_trait;
use serde::Serialize;

use crate::errors::AppError;

/// Email types that can be sent
#[derive(Debug, Clone, Serialize)]
pub enum EmailType {
    EmailVerification,
    PasswordReset,
    Invite,
    InstantLink,
    SecurityAlert,
    AccountDeletion,
}

/// Email to be sent
#[derive(Debug, Clone, Serialize)]
pub struct Email {
    pub to: String,
    pub subject: String,
    pub html_body: String,
    pub text_body: String,
    pub email_type: EmailType,
}

/// Email template data for verification emails
#[derive(Debug, Clone)]
pub struct VerificationEmailData {
    pub user_name: Option<String>,
    pub verification_url: String,
    pub expires_in_hours: u32,
}

/// Email template data for password reset emails
#[derive(Debug, Clone)]
pub struct PasswordResetEmailData {
    pub user_name: Option<String>,
    pub reset_url: String,
    pub expires_in_minutes: u32,
    /// If set, a "just sign in" link is included as a secondary CTA
    pub instant_link_url: Option<String>,
    /// Controls heading: "Reset your password" vs "Access your account"
    pub has_password: bool,
}

/// Email template data for invite emails
#[derive(Debug, Clone)]
pub struct InviteEmailData {
    pub org_name: String,
    pub inviter_name: Option<String>,
    pub role: String,
    pub accept_url: String,
    pub expires_in_days: u32,
}

/// Email template data for instant link emails
#[derive(Debug, Clone)]
pub struct InstantLinkEmailData {
    pub user_name: Option<String>,
    pub instant_link_url: String,
    pub expires_in_minutes: u32,
}

/// Email template data for security alert emails (new device login)
#[derive(Debug, Clone)]
pub struct SecurityAlertEmailData {
    pub user_name: Option<String>,
    pub login_time: String,
    pub ip_address: Option<String>,
    pub location: Option<String>,
    pub device: Option<String>,
    pub browser: Option<String>,
    pub action_url: Option<String>,
}

/// Email template data for account deletion confirmation emails.
#[derive(Debug, Clone)]
pub struct AccountDeletionEmailData {
    pub user_name: Option<String>,
    pub confirmation_url: String,
    pub expires_in_hours: u32,
}

/// Trait for email service implementations
#[async_trait]
pub trait EmailService: Send + Sync {
    /// Send an email
    async fn send(&self, email: Email) -> Result<(), AppError>;

    /// Send verification email with optional custom subject
    async fn send_verification(
        &self,
        to: &str,
        data: VerificationEmailData,
        subject_override: Option<&str>,
    ) -> Result<(), AppError> {
        let email = templates::verification_email_with_subject(to, data, subject_override);
        self.send(email).await
    }

    /// Send password reset email with optional custom subject
    async fn send_password_reset(
        &self,
        to: &str,
        data: PasswordResetEmailData,
        subject_override: Option<&str>,
    ) -> Result<(), AppError> {
        let email = templates::password_reset_email_with_subject(to, data, subject_override);
        self.send(email).await
    }

    /// Send invite email with optional custom subject
    async fn send_invite(
        &self,
        to: &str,
        data: InviteEmailData,
        subject_override: Option<&str>,
    ) -> Result<(), AppError> {
        let email = templates::invite_email_with_subject(to, data, subject_override);
        self.send(email).await
    }

    /// Send instant link email with optional custom subject
    async fn send_instant_link(
        &self,
        to: &str,
        data: InstantLinkEmailData,
        subject_override: Option<&str>,
    ) -> Result<(), AppError> {
        let email = templates::instant_link_email_with_subject(to, data, subject_override);
        self.send(email).await
    }

    /// Send security alert email with optional custom subject
    async fn send_security_alert(
        &self,
        to: &str,
        data: SecurityAlertEmailData,
        subject_override: Option<&str>,
    ) -> Result<(), AppError> {
        let email = templates::security_alert_email_with_subject(to, data, subject_override);
        self.send(email).await
    }

    /// Send account deletion confirmation email with optional custom subject.
    async fn send_account_deletion(
        &self,
        to: &str,
        data: AccountDeletionEmailData,
        subject_override: Option<&str>,
    ) -> Result<(), AppError> {
        let email = templates::account_deletion_email_with_subject(to, data, subject_override);
        self.send(email).await
    }
}
