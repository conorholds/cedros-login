//! Delivery metadata shared by the outbox worker and email providers.

use serde::Serialize;
use uuid::Uuid;

/// Version of the optional provider delivery-context contract.
pub const EMAIL_DELIVERY_CONTRACT_VERSION: u8 = 1;

/// Stable, non-PII context for one persisted outbox message.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EmailDeliveryContext {
    /// Additive contract version for provider/host compatibility.
    pub contract_version: u8,
    /// Deterministic identity derived only from the persisted outbox row ID.
    pub delivery_id: String,
    /// One-based delivery attempt number.
    pub attempt: u32,
    /// True when a previous attempt may have reached the provider.
    pub duplicate_risk: bool,
}

impl EmailDeliveryContext {
    pub(crate) fn for_outbox(event_id: Uuid, attempt: u32) -> Self {
        Self {
            contract_version: EMAIL_DELIVERY_CONTRACT_VERSION,
            delivery_id: format!("cedros-login-outbox-{event_id}"),
            attempt,
            duplicate_risk: attempt > 1,
        }
    }

    /// RFC 5322 Message-ID used for correlation only, not deduplication.
    pub(crate) fn message_id_header(&self) -> String {
        format!("<{}@delivery.cedros.invalid>", self.delivery_id)
    }
}

/// Provider acknowledgement returned after it accepts an email request.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct EmailDeliveryReceipt {
    /// Opaque provider-generated message reference, when supplied.
    pub provider_message_id: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn outbox_context_is_stable_across_attempts() {
        let id = Uuid::parse_str("018f94eb-6d42-7a4e-bf3a-221fac6a9d12").unwrap();
        let first = EmailDeliveryContext::for_outbox(id, 1);
        let retry = EmailDeliveryContext::for_outbox(id, 2);

        assert_eq!(first.delivery_id, retry.delivery_id);
        assert!(!first.duplicate_risk);
        assert!(retry.duplicate_risk);
        assert_eq!(
            first.message_id_header(),
            "<cedros-login-outbox-018f94eb-6d42-7a4e-bf3a-221fac6a9d12@delivery.cedros.invalid>"
        );
    }
}
