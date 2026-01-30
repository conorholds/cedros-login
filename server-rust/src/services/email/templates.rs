//! Email HTML/text template generation

use super::{
    Email, EmailType, InstantLinkEmailData, InviteEmailData, PasswordResetEmailData,
    SecurityAlertEmailData, VerificationEmailData,
};

/// Escape HTML special characters to prevent injection attacks.
/// This should be applied to all user-supplied data in email templates.
pub fn escape_html(s: &str) -> String {
    s.chars()
        .flat_map(|c| match c {
            '&' => "&amp;".chars().collect::<Vec<_>>(),
            '<' => "&lt;".chars().collect::<Vec<_>>(),
            '>' => "&gt;".chars().collect::<Vec<_>>(),
            '"' => "&quot;".chars().collect::<Vec<_>>(),
            '\'' => "&#x27;".chars().collect::<Vec<_>>(),
            _ => vec![c],
        })
        .collect()
}

/// Generate verification email
pub fn verification_email(to: &str, data: VerificationEmailData) -> Email {
    let name = escape_html(data.user_name.as_deref().unwrap_or("there"));
    Email {
        to: to.to_string(),
        subject: "Verify your email address".to_string(),
        html_body: format!(
            r#"<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h1 style="color: #333;">Verify your email</h1>
<p>Hi {name},</p>
<p>Please click the button below to verify your email address:</p>
<p style="text-align: center;">
<a href="{}" rel="noreferrer noopener" referrerpolicy="no-referrer" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
</p>
<p>Or copy and paste this link into your browser:</p>
<p style="word-break: break-all; color: #666;">{}</p>
<p style="color: #666; font-size: 14px;">This link expires in {} hours.</p>
<p style="color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
</body>
</html>"#,
            data.verification_url, data.verification_url, data.expires_in_hours
        ),
        text_body: format!(
            "Hi {},\n\nPlease verify your email by visiting:\n{}\n\nThis link expires in {} hours.\n\nIf you didn't create an account, you can safely ignore this email.",
            name, data.verification_url, data.expires_in_hours
        ),
        email_type: EmailType::EmailVerification,
    }
}

/// Generate password reset email
pub fn password_reset_email(to: &str, data: PasswordResetEmailData) -> Email {
    let name = escape_html(data.user_name.as_deref().unwrap_or("there"));
    Email {
        to: to.to_string(),
        subject: "Reset your password".to_string(),
        html_body: format!(
            r#"<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h1 style="color: #333;">Reset your password</h1>
<p>Hi {name},</p>
<p>We received a request to reset your password. Click the button below to choose a new password:</p>
<p style="text-align: center;">
<a href="{}" rel="noreferrer noopener" referrerpolicy="no-referrer" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
</p>
<p>Or copy and paste this link into your browser:</p>
<p style="word-break: break-all; color: #666;">{}</p>
<p style="color: #666; font-size: 14px;">This link expires in {} minutes.</p>
<p style="color: #999; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
</body>
</html>"#,
            data.reset_url, data.reset_url, data.expires_in_minutes
        ),
        text_body: format!(
            "Hi {},\n\nWe received a request to reset your password.\n\nReset your password: {}\n\nThis link expires in {} minutes.\n\nIf you didn't request this, you can safely ignore this email.",
            name, data.reset_url, data.expires_in_minutes
        ),
        email_type: EmailType::PasswordReset,
    }
}

/// Generate invite email
pub fn invite_email(to: &str, data: InviteEmailData) -> Email {
    let inviter = escape_html(data.inviter_name.as_deref().unwrap_or("Someone"));
    let org_name = escape_html(&data.org_name);
    let role = escape_html(&data.role);
    Email {
        to: to.to_string(),
        subject: format!("You've been invited to join {}", data.org_name),
        html_body: format!(
            r#"<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h1 style="color: #333;">You're invited!</h1>
<p>{inviter} has invited you to join <strong>{org_name}</strong> as a <strong>{role}</strong>.</p>
<p>Click the button below to accept the invitation:</p>
<p style="text-align: center;">
<a href="{}" rel="noreferrer noopener" referrerpolicy="no-referrer" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
</p>
<p>Or copy and paste this link into your browser:</p>
<p style="word-break: break-all; color: #666;">{}</p>
<p style="color: #666; font-size: 14px;">This invitation expires in {} days.</p>
<p style="color: #999; font-size: 12px;">If you don't want to join, you can safely ignore this email.</p>
</body>
</html>"#,
            data.accept_url, data.accept_url, data.expires_in_days
        ),
        text_body: format!(
            "{} has invited you to join {} as a {}.\n\nAccept the invitation: {}\n\nThis invitation expires in {} days.\n\nIf you don't want to join, you can safely ignore this email.",
            inviter, org_name, role, data.accept_url, data.expires_in_days
        ),
        email_type: EmailType::Invite,
    }
}

/// Generate instant link email
pub fn instant_link_email(to: &str, data: InstantLinkEmailData) -> Email {
    let name = escape_html(data.user_name.as_deref().unwrap_or("there"));
    Email {
        to: to.to_string(),
        subject: "Your sign-in link".to_string(),
        html_body: format!(
            r#"<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h1 style="color: #333;">Sign in to your account</h1>
<p>Hi {name},</p>
<p>Click the button below to sign in to your account:</p>
<p style="text-align: center;">
<a href="{}" rel="noreferrer noopener" referrerpolicy="no-referrer" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Sign In</a>
</p>
<p>Or copy and paste this link into your browser:</p>
<p style="word-break: break-all; color: #666;">{}</p>
<p style="color: #666; font-size: 14px;">This link expires in {} minutes.</p>
<p style="color: #999; font-size: 12px;">If you didn't request this link, you can safely ignore this email.</p>
</body>
</html>"#,
            data.instant_link_url, data.instant_link_url, data.expires_in_minutes
        ),
        text_body: format!(
            "Hi {},\n\nClick the link below to sign in:\n{}\n\nThis link expires in {} minutes.\n\nIf you didn't request this, you can safely ignore this email.",
            name, data.instant_link_url, data.expires_in_minutes
        ),
        email_type: EmailType::InstantLink,
    }
}

/// Generate security alert email
pub fn security_alert_email(to: &str, data: SecurityAlertEmailData) -> Email {
    let name = escape_html(data.user_name.as_deref().unwrap_or("there"));
    let ip = escape_html(data.ip_address.as_deref().unwrap_or("Unknown"));
    let device = escape_html(data.device.as_deref().unwrap_or("Unknown device"));
    let browser = escape_html(data.browser.as_deref().unwrap_or("Unknown browser"));
    let location = escape_html(data.location.as_deref().unwrap_or("Unknown location"));
    let login_time = escape_html(&data.login_time);

    let action_section = if let Some(url) = &data.action_url {
        format!(
            r#"<p style="text-align: center;">
<a href="{}" rel="noreferrer noopener" referrerpolicy="no-referrer" style="display: inline-block; background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Secure My Account</a>
</p>"#,
            url
        )
    } else {
        String::new()
    };

    Email {
        to: to.to_string(),
        subject: "New sign-in to your account".to_string(),
        html_body: format!(
            r#"<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h1 style="color: #333;">New sign-in detected</h1>
<p>Hi {name},</p>
<p>We noticed a new sign-in to your account:</p>
<div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
<p style="margin: 4px 0;"><strong>Time:</strong> {login_time}</p>
<p style="margin: 4px 0;"><strong>Device:</strong> {device}</p>
<p style="margin: 4px 0;"><strong>Browser:</strong> {browser}</p>
<p style="margin: 4px 0;"><strong>Location:</strong> {location}</p>
<p style="margin: 4px 0;"><strong>IP Address:</strong> {ip}</p>
</div>
<p>If this was you, you can safely ignore this email.</p>
<p style="color: #DC2626;"><strong>If this wasn't you</strong>, your account may be compromised. We recommend changing your password immediately.</p>
{action_section}
</body>
</html>"#
        ),
        text_body: format!(
            "Hi {},\n\nWe noticed a new sign-in to your account:\n\nTime: {}\nDevice: {}\nBrowser: {}\nLocation: {}\nIP Address: {}\n\nIf this was you, you can safely ignore this email.\n\nIf this wasn't you, your account may be compromised. Please change your password immediately.",
            name, login_time, device, browser, location, ip
        ),
        email_type: EmailType::SecurityAlert,
    }
}
