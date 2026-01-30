//! Email event handlers for the outbox worker

use crate::errors::AppError;
use crate::repositories::{OutboxEvent, OutboxEventType};
use crate::services::{
    EmailService, InstantLinkEmailData, InviteEmailData, PasswordResetEmailData,
    SecurityAlertEmailData, VerificationEmailData,
};
use crate::utils::TokenCipher;

/// Process an email event
pub async fn process_email_event(
    event: &OutboxEvent,
    email_service: &dyn EmailService,
    base_url: &str,
    token_cipher: &TokenCipher,
) -> Result<(), AppError> {
    match event.event_type {
        OutboxEventType::EmailVerification => {
            process_verification_email(event, email_service, base_url, token_cipher).await
        }
        OutboxEventType::EmailPasswordReset => {
            process_password_reset_email(event, email_service, base_url, token_cipher).await
        }
        OutboxEventType::EmailInvite => {
            process_invite_email(event, email_service, base_url, token_cipher).await
        }
        OutboxEventType::EmailInstantLink => {
            process_instant_link_email(event, email_service, base_url, token_cipher).await
        }
        OutboxEventType::EmailSecurityAlert => {
            process_security_alert_email(event, email_service).await
        }
        _ => Err(AppError::Internal(anyhow::anyhow!(
            "Unknown email event type: {}",
            event.event_type.as_str()
        ))),
    }
}

async fn process_verification_email(
    event: &OutboxEvent,
    email_service: &dyn EmailService,
    base_url: &str,
    token_cipher: &TokenCipher,
) -> Result<(), AppError> {
    let to = event.payload["to"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Missing 'to' field")))?;

    let verification_url = if let Some(token_enc) = event.payload["token_enc"].as_str() {
        let token = token_cipher.decrypt(token_enc)?;
        format!("{}/verify-email?token={}", base_url, token)
    } else if let Some(url) = event.payload["verification_url"].as_str() {
        url.to_string()
    } else {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Missing 'token_enc' field"
        )));
    };

    let data = VerificationEmailData {
        user_name: event.payload["user_name"].as_str().map(String::from),
        verification_url,
        expires_in_hours: event.payload["expires_in_hours"].as_u64().unwrap_or(24) as u32,
    };

    email_service.send_verification(to, data).await
}

async fn process_password_reset_email(
    event: &OutboxEvent,
    email_service: &dyn EmailService,
    base_url: &str,
    token_cipher: &TokenCipher,
) -> Result<(), AppError> {
    let to = event.payload["to"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Missing 'to' field")))?;

    let reset_url = if let Some(token_enc) = event.payload["token_enc"].as_str() {
        let token = token_cipher.decrypt(token_enc)?;
        format!("{}/reset-password?token={}", base_url, token)
    } else if let Some(url) = event.payload["reset_url"].as_str() {
        url.to_string()
    } else {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Missing 'token_enc' field"
        )));
    };

    let data = PasswordResetEmailData {
        user_name: event.payload["user_name"].as_str().map(String::from),
        reset_url,
        expires_in_minutes: event.payload["expires_in_minutes"].as_u64().unwrap_or(60) as u32,
    };

    email_service.send_password_reset(to, data).await
}

async fn process_invite_email(
    event: &OutboxEvent,
    email_service: &dyn EmailService,
    base_url: &str,
    token_cipher: &TokenCipher,
) -> Result<(), AppError> {
    let to = event.payload["to"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Missing 'to' field")))?;

    let accept_url = if let Some(token_enc) = event.payload["token_enc"].as_str() {
        let token = token_cipher.decrypt(token_enc)?;
        format!("{}/accept-invite?token={}", base_url, token)
    } else if let Some(url) = event.payload["accept_url"].as_str() {
        url.to_string()
    } else {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Missing 'token_enc' field"
        )));
    };

    let data = InviteEmailData {
        org_name: event.payload["org_name"]
            .as_str()
            .unwrap_or("Organization")
            .to_string(),
        inviter_name: event.payload["inviter_name"].as_str().map(String::from),
        role: event.payload["role"]
            .as_str()
            .unwrap_or("member")
            .to_string(),
        accept_url,
        expires_in_days: event.payload["expires_in_days"].as_u64().unwrap_or(7) as u32,
    };

    email_service.send_invite(to, data).await
}

async fn process_instant_link_email(
    event: &OutboxEvent,
    email_service: &dyn EmailService,
    base_url: &str,
    token_cipher: &TokenCipher,
) -> Result<(), AppError> {
    let to = event.payload["to"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Missing 'to' field")))?;

    let instant_link_url = if let Some(token_enc) = event.payload["token_enc"].as_str() {
        let token = token_cipher.decrypt(token_enc)?;
        format!("{}/instant-link/verify?token={}", base_url, token)
    } else if let Some(url) = event.payload["instant_link_url"].as_str() {
        url.to_string()
    } else {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Missing 'token_enc' field"
        )));
    };

    let data = InstantLinkEmailData {
        user_name: event.payload["user_name"].as_str().map(String::from),
        instant_link_url,
        expires_in_minutes: event.payload["expires_in_minutes"].as_u64().unwrap_or(15) as u32,
    };

    email_service.send_instant_link(to, data).await
}

async fn process_security_alert_email(
    event: &OutboxEvent,
    email_service: &dyn EmailService,
) -> Result<(), AppError> {
    let to = event.payload["to"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Missing 'to' field")))?;

    let data = SecurityAlertEmailData {
        user_name: event.payload["user_name"].as_str().map(String::from),
        login_time: event.payload["login_time"]
            .as_str()
            .unwrap_or("Unknown")
            .to_string(),
        ip_address: event.payload["ip_address"].as_str().map(String::from),
        location: event.payload["location"].as_str().map(String::from),
        device: event.payload["device"].as_str().map(String::from),
        browser: event.payload["browser"].as_str().map(String::from),
        action_url: event.payload["action_url"].as_str().map(String::from),
    };

    email_service.send_security_alert(to, data).await
}
