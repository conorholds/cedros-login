//! Resolved team seat limits supplied by Cedros Pay.
use serde::{Deserialize, Deserializer};
use serde_json::Value;

/// Preserve an explicit null (unrestricted) separately from a missing contract field.
pub fn deserialize_present_limit<'de, D: Deserializer<'de>>(
    deserializer: D,
) -> Result<Option<Value>, D::Error> {
    Value::deserialize(deserializer).map(Some)
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum SeatLimit {
    Limited(u64),
    Unlimited,
}

impl SeatLimit {
    pub fn from_pay(value: &Value) -> Result<Option<Self>, &'static str> {
        match value {
            Value::Null => Ok(None),
            Value::String(value) if value == "unlimited" => Ok(Some(Self::Unlimited)),
            Value::Number(value) => value
                .as_u64()
                .filter(|seats| (1..=1_000_000).contains(seats))
                .map(|seats| Some(Self::Limited(seats)))
                .ok_or("seat_policy_invalid"),
            _ => Err("seat_policy_invalid"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn accepts_resolved_limits_and_unrestricted_plans() {
        assert_eq!(
            SeatLimit::from_pay(&json!(5)),
            Ok(Some(SeatLimit::Limited(5)))
        );
        assert_eq!(
            SeatLimit::from_pay(&json!("unlimited")),
            Ok(Some(SeatLimit::Unlimited))
        );
        assert_eq!(SeatLimit::from_pay(&Value::Null), Ok(None));
    }

    #[test]
    fn rejects_invalid_pay_limits() {
        for invalid in [
            json!(0),
            json!(-1),
            json!(1.5),
            json!(1_000_001),
            json!(true),
            json!("5"),
        ] {
            assert!(SeatLimit::from_pay(&invalid).is_err());
        }
    }
}
