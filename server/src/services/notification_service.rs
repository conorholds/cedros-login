//! Notification service for Discord and Telegram admin alerts.

mod discord;
mod http;
mod log;
mod metadata;
mod model;
mod telegram;

pub use discord::DiscordNotificationService;
pub use log::{LogNotificationService, NoopNotificationService};
pub use model::{AdminNotification, NotificationService, NotificationSeverity};
pub use telegram::TelegramNotificationService;

#[cfg(test)]
mod tests;
