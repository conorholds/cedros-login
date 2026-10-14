//! Email event handlers for the outbox worker

use std::sync::Arc;

use crate::errors::AppError;
use crate::repositories::{OutboxEvent, OutboxEventType};
use crate::services::{
    account_deletion_email_with_subject, instant_link_email_with_subject,
    invite_email_with_subject, password_reset_email_with_subject,
    security_alert_email_with_subject, verification_email_with_subject, AccountDeletionEmailData,
    EmailDeliveryContext, EmailDeliveryReceipt, EmailService, InstantLinkEmailData,
    InviteEmailData, PasswordResetEmailData, SecurityAlertEmailData, SettingsService,
    VerificationEmailData,
};
use crate::utils::TokenCipher;

struct HandlerContext<'a> {
    email_service: &'a dyn EmailService,
    delivery: &'a EmailDeliveryContext,
    base_url: &'a str,
    token_cipher: &'a TokenCipher,
    settings: &'a Option<Arc<SettingsService>>,
}

/// Read a custom email subject from settings, returning None if empty or unavailable.
async fn get_custom_subject(settings: &Option<Arc<SettingsService>>, key: &str) -> Option<String> {
    let ss = settings.as_ref()?;
    match ss.get(key).await {
        Ok(Some(v)) if !v.is_empty() => Some(v),
        _ => None,
    }
}

/// Process an email event
pub async fn process_email_event(
    event: &OutboxEvent,
    email_service: &dyn EmailService,
    delivery_context: &EmailDeliveryContext,
    base_url: &str,
    token_cipher: &TokenCipher,
    settings: Option<Arc<SettingsService>>,
) -> Result<EmailDeliveryReceipt, AppError> {
    let context = HandlerContext {
        email_service,
        delivery: delivery_context,
        base_url,
        token_cipher,
        settings: &settings,
    };
    match event.event_type {
        OutboxEventType::EmailVerification => process_verification_email(event, &context).await,
        OutboxEventType::EmailPasswordReset => process_password_reset_email(event, &context).await,
        OutboxEventType::EmailInvite => process_invite_email(event, &context).await,
        OutboxEventType::EmailInstantLink => process_instant_link_email(event, &context).await,
        OutboxEventType::EmailSecurityAlert => process_security_alert_email(event, &context).await,
        OutboxEventType::EmailAccountDeletion => {
            process_account_deletion_email(event, &context).await
        }
        _ => Err(AppError::Internal(anyhow::anyhow!(
            "Unknown email event type: {}",
            event.event_type.as_str()
        ))),
    }
}

async fn process_verification_email(
    event: &OutboxEvent,
    context: &HandlerContext<'_>,
) -> Result<EmailDeliveryReceipt, AppError> {
    let to = event.payload["to"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Missing 'to' field")))?;

    let verification_url = if let Some(token_enc) = event.payload["token_enc"].as_str() {
        let token = context.token_cipher.decrypt(token_enc)?;
        format!("{}/verify-email?token={token}", context.base_url)
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

    let subject = get_custom_subject(context.settings, "email_subject_verification").await;
    context
        .email_service
        .send_with_context(
            verification_email_with_subject(to, data, subject.as_deref()),
            context.delivery,
        )
        .await
}

async fn process_password_reset_email(
    event: &OutboxEvent,
    context: &HandlerContext<'_>,
) -> Result<EmailDeliveryReceipt, AppError> {
    let to = event.payload["to"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Missing 'to' field")))?;

    let reset_url = if let Some(token_enc) = event.payload["token_enc"].as_str() {
        let token = context.token_cipher.decrypt(token_enc)?;
        format!("{}/reset-password?token={token}", context.base_url)
    } else if let Some(url) = event.payload["reset_url"].as_str() {
        url.to_string()
    } else {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Missing 'token_enc' field"
        )));
    };

    let instant_link_url = event.payload["instant_link_token_enc"]
        .as_str()
        .map(|enc| context.token_cipher.decrypt(enc))
        .transpose()?
        .map(|token| format!("{}/instant-link/verify?token={token}", context.base_url));

    let has_password = event.payload["has_password"].as_bool().unwrap_or(true);

    let data = PasswordResetEmailData {
        user_name: event.payload["user_name"].as_str().map(String::from),
        reset_url,
        expires_in_minutes: event.payload["expires_in_minutes"].as_u64().unwrap_or(60) as u32,
        instant_link_url,
        has_password,
    };

    let subject = get_custom_subject(context.settings, "email_subject_password_reset").await;
    context
        .email_service
        .send_with_context(
            password_reset_email_with_subject(to, data, subject.as_deref()),
            context.delivery,
        )
        .await
}

async fn process_invite_email(
    event: &OutboxEvent,
    context: &HandlerContext<'_>,
) -> Result<EmailDeliveryReceipt, AppError> {
    let to = event.payload["to"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Missing 'to' field")))?;

    let accept_url = if let Some(token_enc) = event.payload["token_enc"].as_str() {
        let token = context.token_cipher.decrypt(token_enc)?;
        format!("{}/accept-invite?token={token}", context.base_url)
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

    let subject = get_custom_subject(context.settings, "email_subject_invite").await;
    context
        .email_service
        .send_with_context(
            invite_email_with_subject(to, data, subject.as_deref()),
            context.delivery,
        )
        .await
}

async fn process_instant_link_email(
    event: &OutboxEvent,
    context: &HandlerContext<'_>,
) -> Result<EmailDeliveryReceipt, AppError> {
    let to = event.payload["to"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Missing 'to' field")))?;

    let instant_link_url = if let Some(token_enc) = event.payload["token_enc"].as_str() {
        let token = context.token_cipher.decrypt(token_enc)?;
        format!("{}/instant-link/verify?token={token}", context.base_url)
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

    let subject = get_custom_subject(context.settings, "email_subject_instant_link").await;
    context
        .email_service
        .send_with_context(
            instant_link_email_with_subject(to, data, subject.as_deref()),
            context.delivery,
        )
        .await
}

async fn process_security_alert_email(
    event: &OutboxEvent,
    context: &HandlerContext<'_>,
) -> Result<EmailDeliveryReceipt, AppError> {
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

    let subject = get_custom_subject(context.settings, "email_subject_security_alert").await;
    context
        .email_service
        .send_with_context(
            security_alert_email_with_subject(to, data, subject.as_deref()),
            context.delivery,
        )
        .await
}

async fn process_account_deletion_email(
    event: &OutboxEvent,
    context: &HandlerContext<'_>,
) -> Result<EmailDeliveryReceipt, AppError> {
    let to = event.payload["to"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Missing 'to' field")))?;

    let confirmation_base_url =
        event.payload["confirmation_base_url"]
            .as_str()
            .ok_or_else(|| {
                AppError::Internal(anyhow::anyhow!("Missing 'confirmation_base_url' field"))
            })?;

    let token_enc = event.payload["token_enc"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Missing 'token_enc' field")))?;
    let token = context.token_cipher.decrypt(token_enc)?;
    let confirmation_url = format!("{confirmation_base_url}?token={token}");

    let data = AccountDeletionEmailData {
        user_name: event.payload["user_name"].as_str().map(String::from),
        confirmation_url,
        expires_in_hours: event.payload["expires_in_hours"].as_u64().unwrap_or(24) as u32,
    };

    let subject = get_custom_subject(context.settings, "email_subject_account_deletion").await;
    context
        .email_service
        .send_with_context(
            account_deletion_email_with_subject(to, data, subject.as_deref()),
            context.delivery,
        )
        .await
}
