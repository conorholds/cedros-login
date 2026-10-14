//! ABAC policy domain types. Pure logic (no IO), ported from
//! `server/src/repositories/policy_repository.rs` + `services/policy_service.rs`.
//! Storage ids/timestamps are strings (host DB seam) rather than Uuid/DateTime.
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

/// Effect of a policy when it matches.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PolicyEffect {
    Allow,
    Deny,
}

/// Attribute matcher for policy conditions. Wire format matches the standalone:
/// `{ "type": "equals", "value": ... }`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "value", rename_all = "snake_case")]
pub enum AttributeMatcher {
    Equals(Value),
    In(Vec<Value>),
    NotIn(Vec<Value>),
    GreaterThan(f64),
    LessThan(f64),
    Contains(String),
    StartsWith(String),
    EndsWith(String),
    /// true = must exist (non-null); false = must not exist.
    Exists(bool),
}

impl AttributeMatcher {
    /// Evaluate this matcher against an optional value. Missing attributes never
    /// match: policies must receive explicit values at their trust boundary.
    pub fn matches(&self, value: Option<&Value>) -> bool {
        match self {
            Self::Equals(expected) => value.map(|v| v == expected).unwrap_or(false),
            Self::In(list) => value.map(|v| list.contains(v)).unwrap_or(false),
            Self::NotIn(list) => value.map(|v| !list.contains(v)).unwrap_or(false),
            Self::GreaterThan(threshold) => value
                .and_then(Value::as_f64)
                .map(|n| n > *threshold)
                .unwrap_or(false),
            Self::LessThan(threshold) => value
                .and_then(Value::as_f64)
                .map(|n| n < *threshold)
                .unwrap_or(false),
            Self::Contains(substring) => value
                .and_then(|v| v.as_str())
                .map(|s| s.contains(substring))
                .unwrap_or(false),
            Self::StartsWith(prefix) => value
                .and_then(|v| v.as_str())
                .map(|s| s.starts_with(prefix))
                .unwrap_or(false),
            Self::EndsWith(suffix) => value
                .and_then(|v| v.as_str())
                .map(|s| s.ends_with(suffix))
                .unwrap_or(false),
            Self::Exists(should_exist) => value
                .map(|value| !value.is_null() == *should_exist)
                .unwrap_or(false),
        }
    }
}

/// Conditions that must all be met for a policy to apply.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct PolicyConditions {
    #[serde(default)]
    pub subject: HashMap<String, AttributeMatcher>,
    #[serde(default)]
    pub resource: HashMap<String, AttributeMatcher>,
    #[serde(default)]
    pub environment: HashMap<String, AttributeMatcher>,
}

/// An ABAC policy as stored over the host DB seam (string ids/timestamps).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AbacPolicy {
    pub id: String,
    pub org_id: String,
    pub name: String,
    #[serde(default)]
    pub description: Option<String>,
    /// Permission this policy applies to (e.g. "member:remove").
    pub permission: String,
    #[serde(default)]
    pub conditions: PolicyConditions,
    pub effect: PolicyEffect,
    /// Higher = evaluated first.
    #[serde(default)]
    pub priority: i32,
    pub enabled: bool,
    pub created_at: String,
    pub updated_at: String,
}

/// Attributes available to policy evaluation.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct PolicyContext {
    #[serde(default)]
    pub subject: HashMap<String, Value>,
    #[serde(default)]
    pub resource: HashMap<String, Value>,
    #[serde(default)]
    pub environment: HashMap<String, Value>,
}

/// Outcome of evaluating a permission against policies (+ RBAC fallback).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PolicyEvaluationResult {
    pub allowed: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub matched_policy_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub matched_policy_name: Option<String>,
    pub used_rbac_fallback: bool,
}

impl PolicyEvaluationResult {
    pub fn by_policy(policy: &AbacPolicy) -> Self {
        Self {
            allowed: matches!(policy.effect, PolicyEffect::Allow),
            reason: Some(format!(
                "{} by policy: {}",
                if matches!(policy.effect, PolicyEffect::Allow) {
                    "Allowed"
                } else {
                    "Denied"
                },
                policy.name
            )),
            matched_policy_id: Some(policy.id.clone()),
            matched_policy_name: Some(policy.name.clone()),
            used_rbac_fallback: false,
        }
    }

    pub fn rbac(allowed: bool, reason: &str) -> Self {
        Self {
            allowed,
            reason: Some(reason.to_string()),
            matched_policy_id: None,
            matched_policy_name: None,
            used_rbac_fallback: true,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn matcher_equals_in_and_exists() {
        assert!(AttributeMatcher::Equals(json!("admin")).matches(Some(&json!("admin"))));
        assert!(!AttributeMatcher::Equals(json!("admin")).matches(Some(&json!("member"))));
        assert!(!AttributeMatcher::Equals(json!("admin")).matches(None));

        let in_m = AttributeMatcher::In(vec![json!("owner"), json!("admin")]);
        assert!(in_m.matches(Some(&json!("admin"))));
        assert!(!in_m.matches(Some(&json!("member"))));

        assert!(AttributeMatcher::Exists(true).matches(Some(&json!("x"))));
        assert!(!AttributeMatcher::Exists(true).matches(Some(&Value::Null)));
        assert!(AttributeMatcher::Exists(false).matches(Some(&Value::Null)));
        assert!(!AttributeMatcher::Exists(false).matches(None));
        assert!(!AttributeMatcher::NotIn(vec![json!("x")]).matches(None));
    }

    #[test]
    fn matcher_numeric_and_string() {
        assert!(AttributeMatcher::GreaterThan(100.0).matches(Some(&json!(150))));
        assert!(!AttributeMatcher::GreaterThan(100.0).matches(Some(&json!(50))));
        assert!(AttributeMatcher::Contains("adm".into()).matches(Some(&json!("org-admin"))));
        assert!(AttributeMatcher::StartsWith("org".into()).matches(Some(&json!("org-admin"))));
    }

    #[test]
    fn matcher_wire_format_is_tagged() {
        let m: AttributeMatcher =
            serde_json::from_value(json!({"type": "equals", "value": "admin"})).unwrap();
        assert!(m.matches(Some(&json!("admin"))));
        let effect: PolicyEffect = serde_json::from_value(json!("deny")).unwrap();
        assert!(matches!(effect, PolicyEffect::Deny));
        assert_eq!(serde_json::to_value(effect).unwrap(), json!("deny"));
    }
}
