//! Transactional account emails using the shared Workbench email layout.

#[path = "layout.rs"]
mod layout;

use super::{
    AccountDeletionEmailData, Email, EmailType, InstantLinkEmailData, InviteEmailData,
    PasswordResetEmailData, SecurityAlertEmailData, VerificationEmailData,
};
pub use layout::escape_html;

fn count_with_unit(count: u32, unit: &str) -> String {
    format!("{count} {unit}{}", if count == 1 { "" } else { "s" })
}

fn greeting(name: Option<&str>) -> String {
    format!(
        "Hi {},",
        name.filter(|name| !name.trim().is_empty())
            .unwrap_or("there")
    )
}

struct ActionEmail<'a> {
    heading: &'a str,
    lead: &'a str,
    intro: &'a str,
    label: &'a str,
    url: &'a str,
    expiry: &'a str,
    footer: &'a str,
    destructive: bool,
}

fn action_body(input: ActionEmail<'_>) -> (String, String) {
    let html = format!(
        "{}{}{}{}{}{}",
        layout::heading(input.heading),
        layout::paragraph(input.lead),
        layout::paragraph(input.intro),
        layout::action(input.label, input.url, input.destructive),
        layout::note(input.expiry),
        layout::note(input.footer)
    );
    let text = format!(
        "{}\n\n{}\n\n{}:\n{}\n\n{}\n\n{}",
        input.lead, input.intro, input.label, input.url, input.expiry, input.footer
    );
    (html, text)
}

fn message(
    to: &str,
    subject: &str,
    subject_override: Option<&str>,
    body: (String, String),
    email_type: EmailType,
) -> Email {
    Email {
        to: to.to_string(),
        subject: subject_override
            .filter(|s| !s.is_empty())
            .unwrap_or(subject)
            .to_string(),
        html_body: layout::document("Cedros", subject, &body.0, "Account notification"),
        text_body: body.1,
        email_type,
    }
}

pub fn verification_email_with_subject(
    to: &str,
    data: VerificationEmailData,
    subject_override: Option<&str>,
) -> Email {
    let body = action_body(ActionEmail {
        heading: "Verify your email",
        lead: &greeting(data.user_name.as_deref()),
        intro: "Confirm your email address to finish setting up your account.",
        label: "Verify email",
        url: &data.verification_url,
        expiry: &format!(
            "This link expires in {}.",
            count_with_unit(data.expires_in_hours, "hour")
        ),
        footer: "If you didn't create an account, you can ignore this email.",
        destructive: false,
    });
    message(
        to,
        "Verify your email address",
        subject_override,
        body,
        EmailType::EmailVerification,
    )
}

pub fn password_reset_email_with_subject(
    to: &str,
    data: PasswordResetEmailData,
    subject_override: Option<&str>,
) -> Email {
    let (heading, intro, label) = if data.has_password {
        (
            "Reset your password",
            "A password reset was requested for your account. Choose a new password.",
            "Reset password",
        )
    } else {
        (
            "Access your account",
            "Account access was requested. Set a password to access your account.",
            "Set password",
        )
    };
    let mut body = action_body(ActionEmail {
        heading,
        lead: &greeting(data.user_name.as_deref()),
        intro,
        label,
        url: &data.reset_url,
        expiry: &format!(
            "This link expires in {}.",
            count_with_unit(data.expires_in_minutes, "minute")
        ),
        footer: "If you didn't request this, you can ignore this email.",
        destructive: false,
    });
    if let Some(url) = data.instant_link_url {
        body.0.push_str(&format!(r#"<p style="margin:16px 0 0;"><a class="cd-email-link" href="{}" rel="noreferrer noopener" referrerpolicy="no-referrer" style="color:#2f6c7d;text-decoration:underline;">Or just sign in</a> without a password.</p>"#, escape_html(&url)));
        body.1
            .push_str(&format!("\n\nOr just sign in (no password needed): {url}"));
    }
    message(
        to,
        heading,
        subject_override,
        body,
        EmailType::PasswordReset,
    )
}

/// Account names that tell an invitee nothing: no name at all, or a default an
/// account carried before its owner named it. An invitation never shows one.
fn placeholder_org_name(name: &str) -> bool {
    let name = name.trim();
    name.is_empty()
        || [
            "default",
            "organization",
            "my organization",
            "personal workspace",
        ]
        .iter()
        .any(|placeholder| name.eq_ignore_ascii_case(placeholder))
}

pub fn invite_email_with_subject(
    to: &str,
    data: InviteEmailData,
    subject_override: Option<&str>,
) -> Email {
    let inviter = data
        .inviter_name
        .as_deref()
        .map(str::trim)
        .filter(|name| !name.is_empty());
    // An unnamed account is named by who sent the invitation instead.
    let org = if placeholder_org_name(&data.org_name) {
        inviter
            .map(|name| format!("{name}'s team"))
            .unwrap_or_else(|| "a team on Cedros".to_string())
    } else {
        data.org_name.trim().to_string()
    };
    let subject = format!("You've been invited to join {org}");
    let body = action_body(ActionEmail {
        heading: &format!("Join {org}"),
        lead: &format!(
            "{} invited you to join {org} as {}.",
            inviter.unwrap_or("A team member"),
            data.role
        ),
        intro: "Accept the invitation to join the team.",
        label: "Accept invitation",
        url: &data.accept_url,
        expiry: &format!(
            "This invitation expires in {}.",
            count_with_unit(data.expires_in_days, "day")
        ),
        footer: "If you weren't expecting this invitation, you can ignore this email.",
        destructive: false,
    });
    message(to, &subject, subject_override, body, EmailType::Invite)
}

pub fn instant_link_email_with_subject(
    to: &str,
    data: InstantLinkEmailData,
    subject_override: Option<&str>,
) -> Email {
    let body = action_body(ActionEmail {
        heading: "Sign in",
        lead: &greeting(data.user_name.as_deref()),
        intro: "Use this link to sign in without a password.",
        label: "Sign in",
        url: &data.instant_link_url,
        expiry: &format!(
            "This link expires in {} and can be used once.",
            count_with_unit(data.expires_in_minutes, "minute")
        ),
        footer: "If you didn't request this, you can ignore this email.",
        destructive: false,
    });
    message(
        to,
        "Your sign-in link",
        subject_override,
        body,
        EmailType::InstantLink,
    )
}

pub fn security_alert_email_with_subject(
    to: &str,
    data: SecurityAlertEmailData,
    subject_override: Option<&str>,
) -> Email {
    let lead = greeting(data.user_name.as_deref());
    let intro = "Cedros detected a new sign-in to your account.";
    let details = format!(
        "Time: {}\nDevice: {}\nBrowser: {}\nLocation: {}\nIP address: {}",
        data.login_time,
        data.device.as_deref().unwrap_or("Unknown device"),
        data.browser.as_deref().unwrap_or("Unknown browser"),
        data.location.as_deref().unwrap_or("Unknown location"),
        data.ip_address.as_deref().unwrap_or("Unknown")
    );
    let next_step = "If this was you, no action is needed. If you don't recognize this sign-in, reset your password.";
    let mut html = format!(
        "{}{}{}{}{}",
        layout::heading("New sign-in"),
        layout::paragraph(&lead),
        layout::paragraph(intro),
        layout::paragraph(&details),
        layout::paragraph(next_step)
    );
    let mut text = format!("{lead}\n\n{intro}\n\n{details}\n\n{next_step}");
    if let Some(url) = data.action_url {
        html.push_str(&layout::action("Secure account", &url, false));
        text.push_str(&format!("\n\nSecure account:\n{url}"));
    }
    message(
        to,
        "New sign-in to your account",
        subject_override,
        (html, text),
        EmailType::SecurityAlert,
    )
}

pub fn account_deletion_email_with_subject(
    to: &str,
    data: AccountDeletionEmailData,
    subject_override: Option<&str>,
) -> Email {
    let body = action_body(ActionEmail {
        heading: "Confirm account deletion", lead: &greeting(data.user_name.as_deref()),
        intro: "You requested permanent account deletion. This cannot be undone.",
        label: "Delete account", url: &data.confirmation_url,
        expiry: &format!("This link expires in {}.", count_with_unit(data.expires_in_hours, "hour")),
        footer: "Financial and audit records required by law may be retained, but your sign-in profile and credentials will be removed. If you didn't request this, ignore this email. Your account will not be deleted.", destructive: true,
    });
    message(
        to,
        "Confirm account deletion",
        subject_override,
        body,
        EmailType::AccountDeletion,
    )
}
