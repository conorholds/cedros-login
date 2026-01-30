//! Webhook callback implementation for standalone deployments
//!
//! Sends signed HTTP POST requests to a configured URL when auth events occur.

mod callback;
mod types;
mod verification;

pub use callback::WebhookCallback;
pub use types::{
    AuthWebhookData, LogoutWebhookData, WebhookConfig, WebhookData, WebhookEvent, WebhookPayload,
};
pub use verification::verify_signature;
