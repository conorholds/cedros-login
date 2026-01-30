//! Tests for email service

use super::*;

const LOG_EMAIL_BUFFER_MAX: usize = 1000;

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
            to: format!("user{}@example.com", i),
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
        .send_verification("john@example.com", data)
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
    };

    service
        .send_password_reset("user@example.com", data)
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
        .send_security_alert("jane@example.com", data)
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
    assert!(sent[0].html_body.contains("Secure My Account"));
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
        .send_security_alert("user@example.com", data)
        .await
        .unwrap();

    let sent = service.get_sent_emails().await;
    assert_eq!(sent.len(), 1);
    // Should use defaults
    assert!(sent[0].html_body.contains("Unknown device"));
    assert!(sent[0].html_body.contains("Unknown browser"));
    assert!(sent[0].html_body.contains("Unknown location"));
    // Should not have action button without URL
    assert!(!sent[0].html_body.contains("Secure My Account"));
}
