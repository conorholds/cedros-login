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

/// Trait for email service implementations
#[async_trait]
pub trait EmailService: Send + Sync {
    /// Send an email
    async fn send(&self, email: Email) -> Result<(), AppError>;

    /// Send verification email
    async fn send_verification(
        &self,
        to: &str,
        data: VerificationEmailData,
    ) -> Result<(), AppError> {
        let email = templates::verification_email(to, data);
        self.send(email).await
    }

    /// Send password reset email
    async fn send_password_reset(
        &self,
        to: &str,
        data: PasswordResetEmailData,
    ) -> Result<(), AppError> {
        let email = templates::password_reset_email(to, data);
        self.send(email).await
    }

    /// Send invite email
    async fn send_invite(&self, to: &str, data: InviteEmailData) -> Result<(), AppError> {
        let email = templates::invite_email(to, data);
        self.send(email).await
    }

    /// Send instant link email for passwordless login
    async fn send_instant_link(
        &self,
        to: &str,
        data: InstantLinkEmailData,
    ) -> Result<(), AppError> {
        let email = templates::instant_link_email(to, data);
        self.send(email).await
    }

    /// Send security alert email (new device login)
    async fn send_security_alert(
        &self,
        to: &str,
        data: SecurityAlertEmailData,
    ) -> Result<(), AppError> {
        let email = templates::security_alert_email(to, data);
        self.send(email).await
    }
}
