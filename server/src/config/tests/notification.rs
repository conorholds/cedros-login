use super::*;

#[test]
fn test_notification_config_rejects_empty_discord_webhook() {
    let mut config = base_config();
    config.notification.discord_webhook_url = Some("   ".to_string());
    let err = config.validate().unwrap_err().to_string();
    assert!(
        err.contains("DISCORD_WEBHOOK_URL cannot be empty"),
        "{}",
        err
    );
}

#[test]
fn test_notification_config_rejects_empty_telegram_fields() {
    let mut config = base_config();
    config.notification.telegram_bot_token = Some("".to_string());
    config.notification.telegram_chat_id = Some(" ".to_string());
    let err = config.validate().unwrap_err().to_string();
    assert!(
        err.contains("TELEGRAM_BOT_TOKEN cannot be empty"),
        "{}",
        err
    );
}

#[test]
fn test_notification_config_rejects_empty_telegram_chat_id() {
    let mut config = base_config();
    config.notification.telegram_bot_token = Some("token".to_string());
    config.notification.telegram_chat_id = Some(" ".to_string());
    let err = config.validate().unwrap_err().to_string();
    assert!(err.contains("TELEGRAM_CHAT_ID cannot be empty"), "{}", err);
}
