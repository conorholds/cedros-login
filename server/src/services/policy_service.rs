//! ABAC Policy evaluation service
//!
//! # Security Considerations
//!
//! ## TOCTOU (Time-of-Check-Time-of-Use) Risk
//!
//! This service checks permissions at a point in time, but the underlying
//! data (user roles, admin status, membership) could change between the
//! permission check and the actual operation. This is a known limitation
//! of non-transactional permission checks.
//!
//! **Mitigation recommendations:**
//! - For sensitive operations (owner transfers, admin actions, deletions),
//!   consider re-verifying permissions immediately before the final commit.
//! - Use database transactions that include permission checks for critical
//!   operations.
//! - Accept the eventual consistency trade-off for read operations and
//!   non-sensitive writes.
//!
//! A full fix would require architectural changes to integrate permission
//! checks within the same database transaction as the protected operation.

use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::sync::Arc;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    AbacPolicy, MembershipRepository, OrgRepository, PolicyEffect, PolicyRepository, UserRepository,
};

/// Context for policy evaluation containing all attributes
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct PolicyContext {
    /// Subject (user) attributes
    #[serde(default)]
    pub subject: HashMap<String, Value>,
    /// Resource attributes
    #[serde(default)]
    pub resource: HashMap<String, Value>,
    /// Environment attributes (e.g., time, IP)
    #[serde(default)]
    pub environment: HashMap<String, Value>,
}

impl PolicyContext {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_subject(mut self, key: &str, value: Value) -> Self {
        self.subject.insert(key.to_string(), value);
        self
    }

    pub fn with_resource(mut self, key: &str, value: Value) -> Self {
        self.resource.insert(key.to_string(), value);
        self
    }

    pub fn with_environment(mut self, key: &str, value: Value) -> Self {
        self.environment.insert(key.to_string(), value);
        self
    }
}

/// Result of policy evaluation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyEvaluationResult {
    /// Whether access is allowed
    pub allowed: bool,
    /// Reason for the decision
    pub reason: Option<String>,
    /// ID of the matching policy (if any)
    pub matched_policy_id: Option<Uuid>,
    /// Name of the matching policy (if any)
    pub matched_policy_name: Option<String>,
    /// Whether RBAC fallback was used
    pub used_rbac_fallback: bool,
}

impl PolicyEvaluationResult {
    pub fn allowed_by_policy(policy: &AbacPolicy) -> Self {
        Self {
            allowed: true,
            reason: Some(format!("Allowed by policy: {}", policy.name)),
            matched_policy_id: Some(policy.id),
            matched_policy_name: Some(policy.name.clone()),
            used_rbac_fallback: false,
        }
    }

    pub fn denied_by_policy(policy: &AbacPolicy) -> Self {
        Self {
            allowed: false,
            reason: Some(format!("Denied by policy: {}", policy.name)),
            matched_policy_id: Some(policy.id),
            matched_policy_name: Some(policy.name.clone()),
            used_rbac_fallback: false,
        }
    }

    pub fn allowed_by_rbac(reason: &str) -> Self {
        Self {
            allowed: true,
            reason: Some(reason.to_string()),
            matched_policy_id: None,
            matched_policy_name: None,
            used_rbac_fallback: true,
        }
    }

    pub fn denied_by_rbac(reason: &str) -> Self {
        Self {
            allowed: false,
            reason: Some(reason.to_string()),
            matched_policy_id: None,
            matched_policy_name: None,
            used_rbac_fallback: true,
        }
    }
}

/// Service for evaluating ABAC policies
pub struct PolicyService {
    policy_repo: Arc<dyn PolicyRepository>,
    user_repo: Arc<dyn UserRepository>,
    org_repo: Arc<dyn OrgRepository>,
    membership_repo: Arc<dyn MembershipRepository>,
}

impl PolicyService {
    pub fn new(
        policy_repo: Arc<dyn PolicyRepository>,
        user_repo: Arc<dyn UserRepository>,
        org_repo: Arc<dyn OrgRepository>,
        membership_repo: Arc<dyn MembershipRepository>,
    ) -> Self {
        Self {
            policy_repo,
            user_repo,
            org_repo,
            membership_repo,
        }
    }

    /// Evaluate policies for a permission check
    pub async fn evaluate(
        &self,
        user_id: Uuid,
        org_id: Uuid,
        permission: &str,
        context: Option<PolicyContext>,
        allow_system_admin: bool,
    ) -> Result<PolicyEvaluationResult, AppError> {
        use crate::services::Permission;

        let Some(permission_value) = Permission::from_str(permission) else {
            return Ok(PolicyEvaluationResult::denied_by_rbac(&format!(
                "Unknown permission: {permission}"
            )));
        };

        let (user_result, org_result, membership_result) = tokio::join!(
            self.user_repo.find_by_id(user_id),
            self.org_repo.find_by_id(org_id),
            self.membership_repo.find_by_user_and_org(user_id, org_id)
        );
        let Some(user) = user_result? else {
            return Ok(PolicyEvaluationResult::denied_by_rbac("User not found"));
        };
        if user.is_deleted() {
            return Ok(PolicyEvaluationResult::denied_by_rbac("User is inactive"));
        }
        if org_result?.is_none() {
            return Ok(PolicyEvaluationResult::denied_by_rbac(
                "Organization not found",
            ));
        }
        let membership = membership_result?;
        let is_system_admin = allow_system_admin && user.is_system_admin;
        if membership.is_none() && !is_system_admin {
            return Ok(PolicyEvaluationResult::denied_by_rbac(
                "Not a member of this organization",
            ));
        }

        let context = Self::build_full_context(
            user_id,
            org_id,
            context,
            user.email.as_deref(),
            membership.as_ref().map(|membership| membership.role),
            is_system_admin,
        );

        // Get applicable policies (sorted by priority)
        let policies = self
            .policy_repo
            .find_by_org_and_permission(org_id, permission)
            .await?;

        if policies
            .iter()
            .any(|policy| !self.context_complete(policy, &context))
        {
            return Ok(PolicyEvaluationResult::denied_by_rbac(
                "Required policy context is unavailable",
            ));
        }

        if let Some(policy) = self.select_matching_policy(&policies, &context) {
            return Ok(match policy.effect {
                PolicyEffect::Allow => PolicyEvaluationResult::allowed_by_policy(policy),
                PolicyEffect::Deny => PolicyEvaluationResult::denied_by_policy(policy),
            });
        }

        // No ABAC policy matched - fall back to RBAC
        Ok(Self::evaluate_rbac_fallback(
            membership.as_ref().map(|membership| membership.role),
            is_system_admin,
            permission_value,
        ))
    }

    /// Return the caller's context-free effective permissions. Every permission
    /// is evaluated through ABAC so this endpoint cannot contradict `/authorize`.
    pub async fn effective_permissions(
        &self,
        user_id: Uuid,
        org_id: Uuid,
        allow_system_admin: bool,
    ) -> Result<Vec<crate::services::Permission>, AppError> {
        let mut permissions = Vec::new();
        for permission in crate::services::Permission::ALL {
            if self
                .evaluate(
                    user_id,
                    org_id,
                    permission.as_str(),
                    None,
                    allow_system_admin,
                )
                .await?
                .allowed
            {
                permissions.push(*permission);
            }
        }
        Ok(permissions)
    }

    /// Build full context from authoritative identity and membership facts.
    fn build_full_context(
        user_id: Uuid,
        org_id: Uuid,
        provided_context: Option<PolicyContext>,
        email: Option<&str>,
        role: Option<crate::repositories::OrgRole>,
        is_system_admin: bool,
    ) -> PolicyContext {
        let mut context = provided_context.unwrap_or_default();
        context
            .subject
            .insert("user_id".to_string(), Value::String(user_id.to_string()));
        context
            .subject
            .insert("is_system_admin".to_string(), Value::Bool(is_system_admin));
        match email {
            Some(email) => {
                context
                    .subject
                    .insert("email".to_string(), Value::String(email.to_string()));
            }
            None => {
                context.subject.remove("email");
            }
        }
        match role {
            Some(role) => {
                context
                    .subject
                    .insert("role".to_string(), Value::String(role.as_str().to_string()));
            }
            None => {
                context.subject.remove("role");
            }
        }
        context
            .resource
            .insert("org_id".to_string(), Value::String(org_id.to_string()));
        context
    }

    /// Missing context is indeterminate, never a reason to bypass a deny via RBAC.
    fn context_complete(&self, policy: &AbacPolicy, context: &PolicyContext) -> bool {
        [
            (&policy.conditions.subject, &context.subject),
            (&policy.conditions.resource, &context.resource),
            (&policy.conditions.environment, &context.environment),
        ]
        .into_iter()
        .all(|(conditions, values)| {
            conditions.iter().all(|(key, matcher)| {
                values.contains_key(key)
                    && match matcher {
                        crate::repositories::AttributeMatcher::Equals(value) => value
                            .as_str()
                            .and_then(|s| s.strip_prefix("${"))
                            .and_then(|s| s.strip_suffix('}'))
                            .is_none_or(|path| self.get_context_value(path, context).is_some()),
                        _ => true,
                    }
            })
        })
    }

    /// At the highest matching priority, deny overrides allow. Repository row
    /// order must never decide an authorization result.
    fn select_matching_policy<'a>(
        &self,
        policies: &'a [AbacPolicy],
        context: &PolicyContext,
    ) -> Option<&'a AbacPolicy> {
        let highest_priority = policies
            .iter()
            .filter(|policy| self.evaluate_policy(policy, context))
            .map(|policy| policy.priority)
            .max()?;

        policies
            .iter()
            .filter(|policy| {
                policy.priority == highest_priority && self.evaluate_policy(policy, context)
            })
            .find(|policy| policy.effect == PolicyEffect::Deny)
            .or_else(|| {
                policies.iter().find(|policy| {
                    policy.priority == highest_priority && self.evaluate_policy(policy, context)
                })
            })
    }

    /// Evaluate a single policy against the context
    fn evaluate_policy(&self, policy: &AbacPolicy, context: &PolicyContext) -> bool {
        // Check subject conditions
        for (key, matcher) in &policy.conditions.subject {
            let value = context.subject.get(key);
            if !self.match_with_interpolation(matcher, value, context) {
                return false;
            }
        }

        // Check resource conditions
        for (key, matcher) in &policy.conditions.resource {
            let value = context.resource.get(key);
            if !self.match_with_interpolation(matcher, value, context) {
                return false;
            }
        }

        // Check environment conditions
        for (key, matcher) in &policy.conditions.environment {
            let value = context.environment.get(key);
            if !self.match_with_interpolation(matcher, value, context) {
                return false;
            }
        }

        true
    }

    /// Match with variable interpolation (e.g., ${subject.user_id})
    fn match_with_interpolation(
        &self,
        matcher: &crate::repositories::AttributeMatcher,
        value: Option<&Value>,
        context: &PolicyContext,
    ) -> bool {
        use crate::repositories::AttributeMatcher;

        match matcher {
            AttributeMatcher::Equals(expected) => {
                let resolved = self.resolve_value(expected, context);
                value.map(|v| *v == resolved).unwrap_or(false)
            }
            _ => matcher.matches(value),
        }
    }

    /// Resolve variable references in a value
    fn resolve_value(&self, value: &Value, context: &PolicyContext) -> Value {
        if let Some(s) = value.as_str() {
            if s.starts_with("${") && s.ends_with('}') {
                let path = &s[2..s.len() - 1];
                if let Some(resolved) = self.get_context_value(path, context) {
                    return resolved.clone();
                }
            }
        }
        value.clone()
    }

    /// Get a value from context by path (e.g., "subject.user_id")
    fn get_context_value<'a>(&self, path: &str, context: &'a PolicyContext) -> Option<&'a Value> {
        let parts: Vec<&str> = path.split('.').collect();
        if parts.len() != 2 {
            return None;
        }

        let (section, key) = (parts[0], parts[1]);
        match section {
            "subject" => context.subject.get(key),
            "resource" => context.resource.get(key),
            "environment" => context.environment.get(key),
            _ => None,
        }
    }

    /// Fall back to RBAC when no ABAC policy matches
    ///
    /// # Security Note
    ///
    /// The admin check here is subject to TOCTOU: a user's admin status could
    /// be revoked between this check and the operation. For sensitive admin-only
    /// operations, callers should consider re-checking within the same transaction.
    fn evaluate_rbac_fallback(
        role: Option<crate::repositories::OrgRole>,
        is_system_admin: bool,
        permission: crate::services::Permission,
    ) -> PolicyEvaluationResult {
        // System administrators retain their existing implicit access, but
        // extension trust mutations require an Owner or an explicit policy.
        if is_system_admin && permission.is_granted_to_system_admin_by_default() {
            return PolicyEvaluationResult::allowed_by_rbac("System admin has full access");
        }
        match role {
            Some(role) if permission.is_allowed_for(role) => {
                PolicyEvaluationResult::allowed_by_rbac(&format!(
                    "Role '{}' has '{}' permission",
                    role.as_str(),
                    permission.as_str()
                ))
            }
            Some(role) => PolicyEvaluationResult::denied_by_rbac(&format!(
                "Role '{}' does not have '{}' permission",
                role.as_str(),
                permission.as_str()
            )),
            None => PolicyEvaluationResult::denied_by_rbac("Not a member of this organization"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::{
        AttributeMatcher, InMemoryMembershipRepository, InMemoryOrgRepository,
        InMemoryPolicyRepository, InMemoryUserRepository, MembershipEntity, MembershipRepository,
        OrgEntity, OrgRepository, OrgRole, PolicyConditions, PolicyRepository, UserEntity,
        UserRepository,
    };
    use crate::services::Permission;

    struct Fixture {
        service: PolicyService,
        policy_repo: Arc<InMemoryPolicyRepository>,
        membership_repo: Arc<InMemoryMembershipRepository>,
        membership_id: Option<Uuid>,
        user_id: Uuid,
        org_id: Uuid,
    }

    async fn fixture(role: Option<OrgRole>, is_system_admin: bool) -> Fixture {
        let user_repo = Arc::new(InMemoryUserRepository::new());
        let org_repo = Arc::new(InMemoryOrgRepository::new());
        let membership_repo = Arc::new(InMemoryMembershipRepository::new());
        let policy_repo = Arc::new(InMemoryPolicyRepository::new());

        let mut user =
            UserEntity::new_email_user("person@example.com".into(), "password-hash".into(), None);
        user.is_system_admin = is_system_admin;
        user.email_verified = true;
        let user = user_repo.create(user).await.unwrap();
        let org = org_repo
            .create(OrgEntity::new(
                "Organization".into(),
                Uuid::new_v4().to_string(),
                user.id,
                false,
            ))
            .await
            .unwrap();
        let membership_id = if let Some(role) = role {
            Some(
                membership_repo
                    .create(MembershipEntity::new(user.id, org.id, role))
                    .await
                    .unwrap()
                    .id,
            )
        } else {
            None
        };

        let service = PolicyService::new(
            policy_repo.clone(),
            user_repo,
            org_repo,
            membership_repo.clone(),
        );
        Fixture {
            service,
            policy_repo,
            membership_repo,
            membership_id,
            user_id: user.id,
            org_id: org.id,
        }
    }

    #[test]
    fn test_policy_context_builder() {
        let context = PolicyContext::new()
            .with_subject("user_id", Value::String("123".to_string()))
            .with_subject("role", Value::String("admin".to_string()))
            .with_resource("type", Value::String("project".to_string()))
            .with_environment("time", Value::String("2024-01-01T12:00:00Z".to_string()));

        assert_eq!(
            context.subject.get("user_id"),
            Some(&Value::String("123".to_string()))
        );
        assert_eq!(
            context.resource.get("type"),
            Some(&Value::String("project".to_string()))
        );
    }

    #[test]
    fn test_policy_evaluation_result() {
        let org_id = Uuid::new_v4();
        let policy = AbacPolicy::new(org_id, "Test", "project:delete", PolicyEffect::Allow);

        let allowed = PolicyEvaluationResult::allowed_by_policy(&policy);
        assert!(allowed.allowed);
        assert_eq!(allowed.matched_policy_name, Some("Test".to_string()));

        let denied = PolicyEvaluationResult::denied_by_policy(&policy);
        assert!(!denied.allowed);
    }

    #[test]
    fn test_attribute_matcher_in_policy() {
        let matcher = AttributeMatcher::In(vec![
            Value::String("admin".to_string()),
            Value::String("owner".to_string()),
        ]);

        assert!(matcher.matches(Some(&Value::String("admin".to_string()))));
        assert!(!matcher.matches(Some(&Value::String("member".to_string()))));
    }

    #[test]
    fn test_policy_conditions_builder() {
        let conditions = PolicyConditions::new()
            .with_subject(
                "role",
                AttributeMatcher::Equals(Value::String("admin".to_string())),
            )
            .with_resource(
                "owner_id",
                AttributeMatcher::Equals(Value::String("${subject.user_id}".to_string())),
            );

        assert!(conditions.subject.contains_key("role"));
        assert!(conditions.resource.contains_key("owner_id"));
    }

    #[tokio::test]
    async fn nonmember_cannot_be_granted_access_by_org_policy() {
        let fixture = fixture(None, false).await;
        fixture
            .policy_repo
            .create(AbacPolicy::new(
                fixture.org_id,
                "Unconditional allow",
                Permission::MemberRemove.as_str(),
                PolicyEffect::Allow,
            ))
            .await
            .unwrap();

        let result = fixture
            .service
            .evaluate(
                fixture.user_id,
                fixture.org_id,
                Permission::MemberRemove.as_str(),
                None,
                false,
            )
            .await
            .unwrap();
        assert!(!result.allowed);
        assert_eq!(
            result.reason.as_deref(),
            Some("Not a member of this organization")
        );
    }

    #[tokio::test]
    async fn authoritative_context_replaces_forged_org_and_role() {
        let fixture = fixture(Some(OrgRole::Member), false).await;
        let conditions = PolicyConditions::new()
            .with_subject(
                "role",
                AttributeMatcher::Equals(Value::String("admin".into())),
            )
            .with_resource(
                "org_id",
                AttributeMatcher::Equals(Value::String("forged-org".into())),
            );
        fixture
            .policy_repo
            .create(
                AbacPolicy::new(
                    fixture.org_id,
                    "Forged context allow",
                    Permission::MemberRemove.as_str(),
                    PolicyEffect::Allow,
                )
                .with_conditions(conditions),
            )
            .await
            .unwrap();
        let context = PolicyContext::new()
            .with_subject("role", Value::String("admin".into()))
            .with_resource("org_id", Value::String("forged-org".into()));

        let result = fixture
            .service
            .evaluate(
                fixture.user_id,
                fixture.org_id,
                Permission::MemberRemove.as_str(),
                Some(context),
                false,
            )
            .await
            .unwrap();
        assert!(!result.allowed);
        assert!(result.used_rbac_fallback);
    }

    #[tokio::test]
    async fn deny_overrides_allow_at_equal_priority() {
        let fixture = fixture(Some(OrgRole::Owner), false).await;
        for (name, effect) in [("allow", PolicyEffect::Allow), ("deny", PolicyEffect::Deny)] {
            fixture
                .policy_repo
                .create(
                    AbacPolicy::new(fixture.org_id, name, Permission::OrgRead.as_str(), effect)
                        .with_priority(10),
                )
                .await
                .unwrap();
        }

        let result = fixture
            .service
            .evaluate(
                fixture.user_id,
                fixture.org_id,
                Permission::OrgRead.as_str(),
                None,
                false,
            )
            .await
            .unwrap();
        assert!(!result.allowed);
        assert_eq!(result.matched_policy_name.as_deref(), Some("deny"));
    }

    #[tokio::test]
    async fn effective_permissions_apply_abac_denies() {
        let fixture = fixture(Some(OrgRole::Owner), false).await;
        fixture
            .policy_repo
            .create(AbacPolicy::new(
                fixture.org_id,
                "deny org read",
                Permission::OrgRead.as_str(),
                PolicyEffect::Deny,
            ))
            .await
            .unwrap();

        let permissions = fixture
            .service
            .effective_permissions(fixture.user_id, fixture.org_id, false)
            .await
            .unwrap();
        assert!(!permissions.contains(&Permission::OrgRead));
        assert!(permissions.contains(&Permission::OrgUpdate));
    }

    #[tokio::test]
    async fn api_key_does_not_inherit_system_admin_or_unknown_permission_authority() {
        let fixture = fixture(None, true).await;
        let denied = fixture
            .service
            .evaluate(
                fixture.user_id,
                fixture.org_id,
                Permission::OrgRead.as_str(),
                None,
                false,
            )
            .await
            .unwrap();
        assert!(!denied.allowed);

        let unknown = fixture
            .service
            .evaluate(
                fixture.user_id,
                fixture.org_id,
                "another-extension:admin",
                None,
                true,
            )
            .await
            .unwrap();
        assert!(!unknown.allowed);
    }

    #[tokio::test]
    async fn membership_and_policy_changes_take_effect_on_next_check() {
        let fixture = fixture(Some(OrgRole::Member), false).await;
        let initial = fixture
            .service
            .evaluate(
                fixture.user_id,
                fixture.org_id,
                Permission::OrgRead.as_str(),
                None,
                false,
            )
            .await
            .unwrap();
        assert!(initial.allowed);

        let deny = fixture
            .policy_repo
            .create(AbacPolicy::new(
                fixture.org_id,
                "deny org read",
                Permission::OrgRead.as_str(),
                PolicyEffect::Deny,
            ))
            .await
            .unwrap();
        let denied_by_policy = fixture
            .service
            .evaluate(
                fixture.user_id,
                fixture.org_id,
                Permission::OrgRead.as_str(),
                None,
                false,
            )
            .await
            .unwrap();
        assert!(!denied_by_policy.allowed);
        assert!(!denied_by_policy.used_rbac_fallback);

        fixture.policy_repo.delete(deny.id).await.unwrap();
        fixture
            .membership_repo
            .delete(fixture.membership_id.unwrap())
            .await
            .unwrap();
        let denied_after_removal = fixture
            .service
            .evaluate(
                fixture.user_id,
                fixture.org_id,
                Permission::OrgRead.as_str(),
                None,
                false,
            )
            .await
            .unwrap();
        assert!(!denied_after_removal.allowed);
        assert_eq!(
            denied_after_removal.reason.as_deref(),
            Some("Not a member of this organization")
        );
    }
    #[tokio::test]
    async fn missing_resource_or_interpolation_cannot_bypass_a_deny() {
        let fixture = fixture(Some(OrgRole::Owner), false).await;
        let mut policy = AbacPolicy::new(
            fixture.org_id,
            "protected resource",
            "org:read",
            PolicyEffect::Deny,
        )
        .with_conditions(PolicyConditions::new().with_resource(
            "classification",
            AttributeMatcher::Equals(Value::String("secret".into())),
        ));
        fixture.policy_repo.create(policy.clone()).await.unwrap();
        let decision = |context| {
            fixture
                .service
                .evaluate(fixture.user_id, fixture.org_id, "org:read", context, false)
        };
        assert!(!decision(None).await.unwrap().allowed);
        assert!(
            !decision(Some(
                PolicyContext::new()
                    .with_resource("classification", Value::String("secret".into()))
            ))
            .await
            .unwrap()
            .allowed
        );
        assert!(
            decision(Some(
                PolicyContext::new()
                    .with_resource("classification", Value::String("public".into()))
            ))
            .await
            .unwrap()
            .allowed
        );
        policy.conditions = PolicyConditions::new().with_resource(
            "org_id",
            AttributeMatcher::Equals(Value::String("${environment.target}".into())),
        );
        fixture.policy_repo.update(policy).await.unwrap();
        assert!(!decision(None).await.unwrap().allowed);
    }
}
