//! Tests for email service

use super::*;

const LOG_EMAIL_BUFFER_MAX: usize = 1000;

#[test]
fn test_postmark_requires_api_token() {
    assert!(
        PostmarkEmailService::try_new("  ".to_string(), "sender@example.com".to_string(),).is_err()
    );
}

#[test]
fn test_postmark_requires_from_email() {
    assert!(PostmarkEmailService::try_new("test-token".to_string(), "  ".to_string()).is_err());
}

#[test]
fn test_postmark_complete_configuration_builds_without_network() {
    assert!(PostmarkEmailService::try_new(
        "test-token".to_string(),
        "sender@example.com".to_string(),
    )
    .is_ok());
}

#[test]
#[allow(deprecated)]
fn test_legacy_postmark_constructor_does_not_panic_on_blank_configuration() {
    let _service = PostmarkEmailService::new("  ".to_string(), "  ".to_string());
}

#[test]
fn test_email_factory_rejects_partial_postmark_configuration() {
    assert!(
        configure_standalone_email_service(Some("test-token".to_string()), None, "production",)
            .is_err()
    );
    assert!(configure_standalone_email_service(
        None,
        Some("sender@example.com".to_string()),
        "production",
    )
    .is_err());
}

#[test]
fn test_email_factory_uses_complete_postmark_without_network() {
    let configured = configure_standalone_email_service(
        Some("test-token".to_string()),
        Some("sender@example.com".to_string()),
        "production",
    )
    .unwrap();

    assert_eq!(configured.capability, EmailDeliveryCapability::Delivering);
}

#[test]
fn test_email_factory_allows_log_backend_only_locally() {
    for environment in ["dev", "development", "local", "test"] {
        let configured =
            configure_standalone_email_service(None, None, environment).expect("local log backend");
        assert_eq!(
            configured.capability,
            EmailDeliveryCapability::DevelopmentLog
        );
    }

    assert!(configure_standalone_email_service(None, None, "production").is_err());
}

#[test]
fn test_email_factory_requires_provider_for_non_auth_transactional_email() {
    for environment in ["production", "staging", "preview", ""] {
        let result = configure_standalone_email_service(None, None, environment);
        assert!(result.is_err(), "{environment:?} must require a provider");
        assert!(result
            .err()
            .unwrap()
            .to_string()
            .contains("transactional account workflows"));
    }
}

#[test]
fn legacy_email_factory_keeps_signature_but_not_the_obsolete_policy_exception() {
    assert!(configure_email_service(None, None, "production", false).is_err());
}

#[tokio::test]
async fn test_log_email_service_send() {
    let service = LogEmailService::new();
    let email = Email {
        to: "test@example.com".to_string(),
        subject: "Test".to_string(),
        html_body: "<p>Test</p>".to_string(),
        text_body: "Test".to_string(),
        email_type: EmailType::EmailVerification,
    };

    service.send(email).await.unwrap();

    let sent = service.get_sent_emails().await;
    assert_eq!(sent.len(), 1);
    assert_eq!(sent[0].to, "test@example.com");
}

#[tokio::test]
async fn test_log_email_service_buffer_cap() {
    let service = LogEmailService::new();

    for i in 0..(LOG_EMAIL_BUFFER_MAX + 1) {
        let email = Email {
            to: format!("user{i}@example.com"),
            subject: "Test".to_string(),
            html_body: "<p>Test</p>".to_string(),
            text_body: "Test".to_string(),
            email_type: EmailType::EmailVerification,
        };
        service.send(email).await.unwrap();
    }

    let sent = service.get_sent_emails().await;
    assert_eq!(sent.len(), LOG_EMAIL_BUFFER_MAX);
}

#[tokio::test]
async fn test_log_email_service_verification() {
    let service = LogEmailService::new();
    let data = VerificationEmailData {
        user_name: Some("John".to_string()),
        verification_url: "https://example.com/verify?token=abc".to_string(),
        expires_in_hours: 24,
    };

    service
        .send_verification("john@example.com", data, None)
        .await
        .unwrap();

    let sent = service.get_sent_emails().await;
    assert_eq!(sent.len(), 1);
    assert!(sent[0].html_body.contains("John"));
    assert!(sent[0].html_body.contains("verify?token=abc"));
    assert!(sent[0].html_body.contains("referrerpolicy=\"no-referrer\""));
    assert!(sent[0].html_body.contains("rel=\"noreferrer noopener\""));
}

#[tokio::test]
async fn test_log_email_service_password_reset() {
    let service = LogEmailService::new();
    let data = PasswordResetEmailData {
        user_name: None,
        reset_url: "https://example.com/reset?token=xyz".to_string(),
        expires_in_minutes: 60,
        instant_link_url: None,
        has_password: true,
    };

    service
        .send_password_reset("user@example.com", data, None)
        .await
        .unwrap();

    let sent = service.get_sent_emails().await;
    assert_eq!(sent.len(), 1);
    assert!(sent[0].html_body.contains("reset?token=xyz"));
    assert!(sent[0].text_body.contains("60 minutes"));
    assert!(sent[0].html_body.contains("referrerpolicy=\"no-referrer\""));
    assert!(sent[0].html_body.contains("rel=\"noreferrer noopener\""));
}

#[tokio::test]
async fn test_email_expiration_units_use_singular_copy() {
    let service = LogEmailService::new();

    service
        .send_verification(
            "verify@example.com",
            VerificationEmailData {
                user_name: None,
                verification_url: "https://example.com/verify".to_string(),
                expires_in_hours: 1,
            },
            None,
        )
        .await
        .unwrap();
    service
        .send_password_reset(
            "reset@example.com",
            PasswordResetEmailData {
                user_name: None,
                reset_url: "https://example.com/reset".to_string(),
                expires_in_minutes: 1,
                instant_link_url: None,
                has_password: true,
            },
            None,
        )
        .await
        .unwrap();
    service
        .send_invite(
            "invite@example.com",
            InviteEmailData {
                org_name: "Example".to_string(),
                inviter_name: None,
                role: "member".to_string(),
                accept_url: "https://example.com/invite".to_string(),
                expires_in_days: 1,
            },
            None,
        )
        .await
        .unwrap();
    service
        .send_account_deletion(
            "delete@example.com",
            AccountDeletionEmailData {
                user_name: None,
                confirmation_url: "https://example.com/delete".to_string(),
                expires_in_hours: 1,
            },
            None,
        )
        .await
        .unwrap();
    service
        .send_instant_link(
            "instant@example.com",
            InstantLinkEmailData {
                user_name: None,
                instant_link_url: "https://example.com/instant".to_string(),
                expires_in_minutes: 1,
            },
            None,
        )
        .await
        .unwrap();

    let sent = service.get_sent_emails().await;
    assert!(sent[0].text_body.contains("expires in 1 hour."));
    assert!(sent[0].html_body.contains("expires in 1 hour."));
    assert!(sent[1].text_body.contains("expires in 1 minute."));
    assert!(sent[1].html_body.contains("expires in 1 minute."));
    assert!(sent[2].text_body.contains("expires in 1 day."));
    assert!(sent[2].html_body.contains("expires in 1 day."));
    assert!(sent[3].text_body.contains("expires in 1 hour."));
    assert!(sent[3].html_body.contains("expires in 1 hour."));
    assert!(sent[4]
        .text_body
        .contains("expires in 1 minute and can be used once."));
    assert!(sent[4]
        .html_body
        .contains("expires in 1 minute and can be used once."));
}

#[tokio::test]
async fn test_noop_email_service() {
    let service = NoopEmailService::new();
    let email = Email {
        to: "test@example.com".to_string(),
        subject: "Test".to_string(),
        html_body: "<p>Test</p>".to_string(),
        text_body: "Test".to_string(),
        email_type: EmailType::EmailVerification,
    };

    // Should not error
    service.send(email).await.unwrap();
}

#[tokio::test]
async fn test_log_email_service_clear() {
    let service = LogEmailService::new();
    let email = Email {
        to: "test@example.com".to_string(),
        subject: "Test".to_string(),
        html_body: "<p>Test</p>".to_string(),
        text_body: "Test".to_string(),
        email_type: EmailType::EmailVerification,
    };

    service.send(email).await.unwrap();
    assert_eq!(service.get_sent_emails().await.len(), 1);

    service.clear().await;
    assert_eq!(service.get_sent_emails().await.len(), 0);
}

#[tokio::test]
async fn test_log_email_service_security_alert() {
    let service = LogEmailService::new();
    let data = SecurityAlertEmailData {
        user_name: Some("Jane".to_string()),
        login_time: "December 13, 2025 at 14:30 UTC".to_string(),
        ip_address: Some("192.168.1.100".to_string()),
        location: Some("San Francisco, CA".to_string()),
        device: Some("Mac".to_string()),
        browser: Some("Chrome".to_string()),
        action_url: Some("https://example.com/account/security".to_string()),
    };

    service
        .send_security_alert("jane@example.com", data, None)
        .await
        .unwrap();

    let sent = service.get_sent_emails().await;
    assert_eq!(sent.len(), 1);
    assert_eq!(sent[0].to, "jane@example.com");
    assert_eq!(sent[0].subject, "New sign-in to your account");
    assert!(sent[0].html_body.contains("Jane"));
    assert!(sent[0].html_body.contains("Mac"));
    assert!(sent[0].html_body.contains("Chrome"));
    assert!(sent[0].html_body.contains("192.168.1.100"));
    assert!(sent[0].html_body.contains("San Francisco"));
    assert!(sent[0].html_body.contains("Secure account"));
    assert!(sent[0].text_body.contains("new sign-in"));
}

#[tokio::test]
async fn test_log_email_service_security_alert_minimal() {
    let service = LogEmailService::new();
    let data = SecurityAlertEmailData {
        user_name: None,
        login_time: "Now".to_string(),
        ip_address: None,
        location: None,
        device: None,
        browser: None,
        action_url: None,
    };

    service
        .send_security_alert("user@example.com", data, None)
        .await
        .unwrap();

    let sent = service.get_sent_emails().await;
    assert_eq!(sent.len(), 1);
    // Should use defaults
    assert!(sent[0].html_body.contains("Unknown device"));
    assert!(sent[0].html_body.contains("Unknown browser"));
    assert!(sent[0].html_body.contains("Unknown location"));
    // Should not have action button without URL
    assert!(!sent[0].html_body.contains("Secure account"));
}

#[test]
fn transactional_templates_escape_html_without_corrupting_text_or_action_urls() {
    let email = templates::invite_email_with_subject(
        "test@example.test",
        InviteEmailData {
            org_name: "<Studio> & Co".into(),
            inviter_name: Some("Alex & Sam".into()),
            role: "member".into(),
            accept_url: "https://example.test/?token=one&next=\"two\"".into(),
            expires_in_days: 1,
        },
        Some("Custom invitation"),
    );
    assert_eq!(email.subject, "Custom invitation");
    assert!(email.html_body.contains("&lt;Studio&gt; &amp; Co"));
    assert!(email.html_body.contains("&amp;next=&quot;two&quot;"));
    assert!(email.text_body.contains("<Studio> & Co"));
    assert!(email.text_body.contains("Alex & Sam"));
    assert!(email.text_body.contains("&next=\"two\""));
    assert!(!email.text_body.contains("&amp;"));
    assert!(email.html_body.contains("class=\"cd-email-card"));
}

#[test]
fn all_transactional_templates_use_the_same_layout_and_keep_plain_text() {
    let url = "https://example.test/action?token=one&next=two";
    let name = Some("Alex & Sam".to_string());
    let emails = [
        templates::verification_email_with_subject(
            "to@example.test",
            VerificationEmailData {
                user_name: name.clone(),
                verification_url: url.into(),
                expires_in_hours: 1,
            },
            None,
        ),
        templates::password_reset_email_with_subject(
            "to@example.test",
            PasswordResetEmailData {
                user_name: name.clone(),
                reset_url: url.into(),
                expires_in_minutes: 1,
                instant_link_url: Some(url.into()),
                has_password: false,
            },
            None,
        ),
        templates::invite_email_with_subject(
            "to@example.test",
            InviteEmailData {
                org_name: "Alex & Sam".into(),
                inviter_name: None,
                role: "member".into(),
                accept_url: url.into(),
                expires_in_days: 1,
            },
            None,
        ),
        templates::instant_link_email_with_subject(
            "to@example.test",
            InstantLinkEmailData {
                user_name: name.clone(),
                instant_link_url: url.into(),
                expires_in_minutes: 1,
            },
            None,
        ),
        templates::security_alert_email_with_subject(
            "to@example.test",
            SecurityAlertEmailData {
                user_name: name.clone(),
                login_time: "6 September 2026".into(),
                ip_address: None,
                location: None,
                device: None,
                browser: None,
                action_url: Some(url.into()),
            },
            None,
        ),
        templates::account_deletion_email_with_subject(
            "to@example.test",
            AccountDeletionEmailData {
                user_name: name,
                confirmation_url: url.into(),
                expires_in_hours: 1,
            },
            None,
        ),
    ];
    for email in emails {
        assert!(email.html_body.contains("class=\"cd-email-card"));
        assert!(email.html_body.contains("prefers-color-scheme: dark"));
        assert!(email.html_body.contains("Alex &amp; Sam"));
        assert!(email.text_body.contains("Alex & Sam"));
        assert!(email.text_body.contains(url));
        assert!(!email.text_body.contains("&amp;"));
        assert!(!email.subject.contains("&amp;"));
        assert!(!email.html_body.contains("#4F46E5"));
    }
}

#[test]
fn invitations_from_unnamed_accounts_name_the_inviter_never_a_placeholder() {
    for org_name in ["Default", "", " personal workspace "] {
        let email = templates::invite_email_with_subject(
            "test@example.test",
            InviteEmailData {
                org_name: org_name.into(),
                inviter_name: Some("Dana".into()),
                role: "member".into(),
                accept_url: "https://example.test/?token=one".into(),
                expires_in_days: 7,
            },
            None,
        );
        assert_eq!(email.subject, "You've been invited to join Dana's team");
        assert!(email
            .text_body
            .contains("Dana invited you to join Dana's team as member."));
        assert!(!email.text_body.to_lowercase().contains("default"));
    }
    let named = templates::invite_email_with_subject(
        "test@example.test",
        InviteEmailData {
            org_name: "Default Studios".into(),
            inviter_name: None,
            role: "member".into(),
            accept_url: "https://example.test/?token=one".into(),
            expires_in_days: 7,
        },
        None,
    );
    assert_eq!(named.subject, "You've been invited to join Default Studios");
}
