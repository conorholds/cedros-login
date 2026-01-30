//! ABAC Policy repository trait and implementations

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::pagination::{cap_limit, cap_offset};

/// Effect of a policy when it matches
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PolicyEffect {
    Allow,
    Deny,
}

impl PolicyEffect {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Allow => "allow",
            Self::Deny => "deny",
        }
    }
}

/// Attribute matcher for policy conditions
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "value", rename_all = "snake_case")]
pub enum AttributeMatcher {
    /// Exact equality match
    Equals(Value),
    /// Value is in the given list
    In(Vec<Value>),
    /// Value is not in the given list
    NotIn(Vec<Value>),
    /// Greater than (for numbers)
    GreaterThan(f64),
    /// Less than (for numbers)
    LessThan(f64),
    /// String contains substring
    Contains(String),
    /// String starts with prefix
    StartsWith(String),
    /// String ends with suffix
    EndsWith(String),
    /// Boolean existence check (true = must exist, false = must not exist)
    Exists(bool),
}

impl AttributeMatcher {
    /// Evaluate this matcher against a value
    pub fn matches(&self, value: Option<&Value>) -> bool {
        match self {
            Self::Equals(expected) => value.map(|v| v == expected).unwrap_or(false),
            Self::In(list) => value.map(|v| list.contains(v)).unwrap_or(false),
            Self::NotIn(list) => value.map(|v| !list.contains(v)).unwrap_or(true),
            Self::GreaterThan(threshold) => value
                .and_then(|v| v.as_f64())
                .map(|n| n > *threshold)
                .unwrap_or(false),
            Self::LessThan(threshold) => value
                .and_then(|v| v.as_f64())
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
            Self::Exists(should_exist) => {
                let exists = value.is_some() && !matches!(value, Some(Value::Null));
                exists == *should_exist
            }
        }
    }
}

/// Conditions that must be met for a policy to apply
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct PolicyConditions {
    /// Conditions on subject (user) attributes
    #[serde(default)]
    pub subject: HashMap<String, AttributeMatcher>,
    /// Conditions on resource attributes
    #[serde(default)]
    pub resource: HashMap<String, AttributeMatcher>,
    /// Conditions on environment attributes
    #[serde(default)]
    pub environment: HashMap<String, AttributeMatcher>,
}

impl PolicyConditions {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_subject(mut self, key: &str, matcher: AttributeMatcher) -> Self {
        self.subject.insert(key.to_string(), matcher);
        self
    }

    pub fn with_resource(mut self, key: &str, matcher: AttributeMatcher) -> Self {
        self.resource.insert(key.to_string(), matcher);
        self
    }

    pub fn with_environment(mut self, key: &str, matcher: AttributeMatcher) -> Self {
        self.environment.insert(key.to_string(), matcher);
        self
    }
}

/// ABAC Policy entity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AbacPolicy {
    pub id: Uuid,
    pub org_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    /// Permission this policy applies to (e.g., "project:delete")
    pub permission: String,
    /// Conditions that must be satisfied
    pub conditions: PolicyConditions,
    /// Effect when conditions match
    pub effect: PolicyEffect,
    /// Priority (higher = evaluated first)
    pub priority: i32,
    /// Whether this policy is active
    pub enabled: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl AbacPolicy {
    pub fn new(org_id: Uuid, name: &str, permission: &str, effect: PolicyEffect) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            org_id,
            name: name.to_string(),
            description: None,
            permission: permission.to_string(),
            conditions: PolicyConditions::default(),
            effect,
            priority: 0,
            enabled: true,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn with_description(mut self, description: &str) -> Self {
        self.description = Some(description.to_string());
        self
    }

    pub fn with_conditions(mut self, conditions: PolicyConditions) -> Self {
        self.conditions = conditions;
        self
    }

    pub fn with_priority(mut self, priority: i32) -> Self {
        self.priority = priority;
        self
    }
}

/// ABAC Policy repository trait
#[async_trait]
pub trait PolicyRepository: Send + Sync {
    /// Create a new policy
    async fn create(&self, policy: AbacPolicy) -> Result<AbacPolicy, AppError>;

    /// Find policy by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<AbacPolicy>, AppError>;

    /// Find all policies for an organization
    async fn find_by_org(&self, org_id: Uuid) -> Result<Vec<AbacPolicy>, AppError>;

    /// Find policies for an organization with pagination
    async fn find_by_org_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<AbacPolicy>, AppError>;

    /// Count policies for an organization
    async fn count_by_org(&self, org_id: Uuid) -> Result<u64, AppError>;

    /// Find policies for an org and permission (sorted by priority desc)
    async fn find_by_org_and_permission(
        &self,
        org_id: Uuid,
        permission: &str,
    ) -> Result<Vec<AbacPolicy>, AppError>;

    /// Update a policy
    async fn update(&self, policy: AbacPolicy) -> Result<AbacPolicy, AppError>;

    /// Delete a policy
    async fn delete(&self, id: Uuid) -> Result<(), AppError>;

    /// Delete all policies for an organization
    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError>;
}

/// In-memory policy repository for development/testing
pub struct InMemoryPolicyRepository {
    policies: RwLock<HashMap<Uuid, AbacPolicy>>,
}

impl InMemoryPolicyRepository {
    pub fn new() -> Self {
        Self {
            policies: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryPolicyRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl PolicyRepository for InMemoryPolicyRepository {
    async fn create(&self, policy: AbacPolicy) -> Result<AbacPolicy, AppError> {
        let mut policies = self.policies.write().await;
        policies.insert(policy.id, policy.clone());
        Ok(policy)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<AbacPolicy>, AppError> {
        let policies = self.policies.read().await;
        Ok(policies.get(&id).cloned())
    }

    async fn find_by_org(&self, org_id: Uuid) -> Result<Vec<AbacPolicy>, AppError> {
        let policies = self.policies.read().await;
        let mut results: Vec<_> = policies
            .values()
            .filter(|p| p.org_id == org_id)
            .cloned()
            .collect();
        results.sort_by(|a, b| b.priority.cmp(&a.priority));
        Ok(results)
    }

    async fn find_by_org_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<AbacPolicy>, AppError> {
        let policies = self.policies.read().await;
        let mut results: Vec<_> = policies
            .values()
            .filter(|p| p.org_id == org_id)
            .cloned()
            .collect();
        results.sort_by(|a, b| b.priority.cmp(&a.priority));
        let capped_limit = cap_limit(limit);
        let capped_offset = cap_offset(offset);
        let start = capped_offset as usize;
        let end = start.saturating_add(capped_limit as usize);
        Ok(results.into_iter().skip(start).take(end - start).collect())
    }

    async fn count_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let policies = self.policies.read().await;
        Ok(policies.values().filter(|p| p.org_id == org_id).count() as u64)
    }

    async fn find_by_org_and_permission(
        &self,
        org_id: Uuid,
        permission: &str,
    ) -> Result<Vec<AbacPolicy>, AppError> {
        let policies = self.policies.read().await;
        let mut results: Vec<_> = policies
            .values()
            .filter(|p| p.org_id == org_id && p.permission == permission && p.enabled)
            .cloned()
            .collect();
        results.sort_by(|a, b| b.priority.cmp(&a.priority));
        Ok(results)
    }

    async fn update(&self, policy: AbacPolicy) -> Result<AbacPolicy, AppError> {
        let mut policies = self.policies.write().await;

        if !policies.contains_key(&policy.id) {
            return Err(AppError::NotFound("Policy not found".into()));
        }

        let mut updated = policy;
        updated.updated_at = Utc::now();
        policies.insert(updated.id, updated.clone());
        Ok(updated)
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let mut policies = self.policies.write().await;
        policies.remove(&id);
        Ok(())
    }

    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let mut policies = self.policies.write().await;
        let before = policies.len();
        policies.retain(|_, policy| policy.org_id != org_id);
        Ok((before - policies.len()) as u64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_attribute_matcher_equals() {
        let matcher = AttributeMatcher::Equals(Value::String("admin".to_string()));
        assert!(matcher.matches(Some(&Value::String("admin".to_string()))));
        assert!(!matcher.matches(Some(&Value::String("member".to_string()))));
        assert!(!matcher.matches(None));
    }

    #[test]
    fn test_attribute_matcher_in() {
        let matcher = AttributeMatcher::In(vec![
            Value::String("owner".to_string()),
            Value::String("admin".to_string()),
        ]);
        assert!(matcher.matches(Some(&Value::String("admin".to_string()))));
        assert!(!matcher.matches(Some(&Value::String("member".to_string()))));
    }

    #[test]
    fn test_attribute_matcher_greater_than() {
        let matcher = AttributeMatcher::GreaterThan(100.0);
        assert!(matcher.matches(Some(&Value::Number(150.into()))));
        assert!(!matcher.matches(Some(&Value::Number(50.into()))));
    }

    #[test]
    fn test_attribute_matcher_contains() {
        let matcher = AttributeMatcher::Contains("admin".to_string());
        assert!(matcher.matches(Some(&Value::String("org-admin-user".to_string()))));
        assert!(!matcher.matches(Some(&Value::String("member".to_string()))));
    }

    #[test]
    fn test_attribute_matcher_exists() {
        let exists_true = AttributeMatcher::Exists(true);
        assert!(exists_true.matches(Some(&Value::String("value".to_string()))));
        assert!(!exists_true.matches(None));
        assert!(!exists_true.matches(Some(&Value::Null)));

        let exists_false = AttributeMatcher::Exists(false);
        assert!(!exists_false.matches(Some(&Value::String("value".to_string()))));
        assert!(exists_false.matches(None));
    }

    #[tokio::test]
    async fn test_policy_repository_crud() {
        let repo = InMemoryPolicyRepository::new();
        let org_id = Uuid::new_v4();

        let policy = AbacPolicy::new(org_id, "Test Policy", "project:delete", PolicyEffect::Allow)
            .with_description("Allow project owners to delete")
            .with_conditions(PolicyConditions::new().with_resource(
                "owner_id",
                AttributeMatcher::Equals(Value::String("${subject.user_id}".to_string())),
            ));

        let created = repo.create(policy.clone()).await.unwrap();
        assert_eq!(created.name, "Test Policy");

        let found = repo.find_by_id(created.id).await.unwrap();
        assert!(found.is_some());

        let by_org = repo.find_by_org(org_id).await.unwrap();
        assert_eq!(by_org.len(), 1);
    }

    #[tokio::test]
    async fn test_policy_repository_paged_and_count() {
        let repo = InMemoryPolicyRepository::new();
        let org_id = Uuid::new_v4();

        let policy1 = AbacPolicy::new(org_id, "Policy 1", "project:delete", PolicyEffect::Allow)
            .with_priority(10);
        let policy2 = AbacPolicy::new(org_id, "Policy 2", "project:delete", PolicyEffect::Deny)
            .with_priority(20);

        repo.create(policy1).await.unwrap();
        repo.create(policy2).await.unwrap();

        let total = repo.count_by_org(org_id).await.unwrap();
        assert_eq!(total, 2);

        let paged = repo.find_by_org_paged(org_id, 1, 1).await.unwrap();
        assert_eq!(paged.len(), 1);
    }

    #[tokio::test]
    async fn test_policy_repository_find_by_permission() {
        let repo = InMemoryPolicyRepository::new();
        let org_id = Uuid::new_v4();

        let policy1 = AbacPolicy::new(org_id, "Policy 1", "project:delete", PolicyEffect::Allow)
            .with_priority(10);
        let policy2 = AbacPolicy::new(org_id, "Policy 2", "project:delete", PolicyEffect::Deny)
            .with_priority(20);
        let policy3 = AbacPolicy::new(org_id, "Policy 3", "project:read", PolicyEffect::Allow);

        repo.create(policy1).await.unwrap();
        repo.create(policy2).await.unwrap();
        repo.create(policy3).await.unwrap();

        let results = repo
            .find_by_org_and_permission(org_id, "project:delete")
            .await
            .unwrap();
        assert_eq!(results.len(), 2);
        // Should be sorted by priority descending
        assert_eq!(results[0].priority, 20);
        assert_eq!(results[1].priority, 10);
    }
}
