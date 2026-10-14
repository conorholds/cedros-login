use super::*;

#[test]
fn test_cors_rejects_invalid_origin() {
    let mut config = base_config();
    config.cors.allowed_origins = vec!["not-a-url".to_string()];
    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("Invalid CORS origin"));
}

#[test]
fn test_webhook_url_rejects_private_ipv6() {
    let mut config = base_config();
    config.webhook.enabled = true;
    config.webhook.url = Some("http://[fd00::1]/webhook".to_string());
    config.webhook.secret = Some("secret".to_string());

    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("private IP addresses"), "{}", err);
}

#[test]
fn test_webhook_url_accepts_public_ipv6() {
    let mut config = base_config();
    config.webhook.enabled = true;
    config.webhook.url = Some("http://[2001:db8::1]/webhook".to_string());
    config.webhook.secret = Some("secret".to_string());

    if let Err(error) = config.validate() {
        panic!("{error}");
    }
}

#[test]
fn test_webhook_url_rejects_reserved_ipv4() {
    let cases = [
        "http://0.0.0.0/webhook",
        "http://100.64.0.1/webhook",
        "http://192.0.0.1/webhook",
        "http://198.18.0.1/webhook",
        "http://224.0.0.1/webhook",
    ];

    for url in cases {
        let mut config = base_config();
        config.webhook.enabled = true;
        config.webhook.url = Some(url.to_string());
        config.webhook.secret = Some("secret".to_string());
        let err = config.validate().unwrap_err().to_string();
        assert!(err.contains("private IP addresses"), "{}", err);
    }
}

#[test]
fn test_webhook_url_rejects_local_hostname() {
    let mut config = base_config();
    config.webhook.enabled = true;
    config.webhook.url = Some("http://webhook.local/path".to_string());
    config.webhook.secret = Some("secret".to_string());

    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("internal endpoints"), "{}", err);
}
