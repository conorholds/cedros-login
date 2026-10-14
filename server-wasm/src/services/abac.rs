//! ABAC policy evaluation + RBAC fallback. Synchronous port of
//! `server/src/services/policy_service.rs` + `authorization_service.rs` over the
//! wasm data layer (no Arc repos, no tokio::join — the seam calls are sync).
use std::collections::HashMap;

use serde_json::Value;

use crate::data::{memberships, orgs, policies, users};
use crate::domain::permissions::{OrgRole, Permission};
use crate::domain::policy::{AbacPolicy, AttributeMatcher, PolicyContext, PolicyEvaluationResult};
use crate::host::Result;

/// Evaluate `permission` for `user_id` in `org_id`: ABAC policies first (priority
/// order, allow/deny by effect), then RBAC fallback. Mirrors the standalone
/// `PolicyService::evaluate`.
pub fn evaluate(
    user_id: &str,
    org_id: &str,
    permission: &str,
    context: Option<PolicyContext>,
    allow_system_admin: bool,
) -> Result<PolicyEvaluationResult> {
    let Some(permission_value) = Permission::from_str(permission) else {
        return Ok(PolicyEvaluationResult::rbac(
            false,
            &format!("Unknown permission: {permission}"),
        ));
    };
    let Some(user) = users::find_by_id(user_id)? else {
        return Ok(PolicyEvaluationResult::rbac(false, "User not found"));
    };
    if user.suspended_at.is_some() {
        return Ok(PolicyEvaluationResult::rbac(false, "User is inactive"));
    }
    if orgs::find_by_id(org_id)?.is_none() {
        return Ok(PolicyEvaluationResult::rbac(
            false,
            "Organization not found",
        ));
    }
    let membership = memberships::find(user_id, org_id)?;
    if membership
        .as_ref()
        .is_some_and(|m| OrgRole::from_str(&m.role).is_none())
    {
        return Ok(PolicyEvaluationResult::rbac(false, "Unknown role"));
    }
    let is_system_admin = allow_system_admin && user.is_system_admin;
    if membership.is_none() && !is_system_admin {
        return Ok(PolicyEvaluationResult::rbac(
            false,
            "Not a member of this organization",
        ));
    }
    let context = build_full_context(
        user_id,
        org_id,
        context,
        user.email.as_deref(),
        membership
            .as_ref()
            .map(|membership| membership.role.as_str()),
        is_system_admin,
    );
    let policies = policies::find_by_org_and_permission(org_id, permission)?;
    if policies
        .iter()
        .any(|policy| !context_complete(policy, &context))
    {
        return Ok(PolicyEvaluationResult::rbac(
            false,
            "Required policy context is unavailable",
        ));
    }
    if let Some(policy) = select_matching_policy(&policies, &context) {
        return Ok(PolicyEvaluationResult::by_policy(policy));
    }
    Ok(evaluate_rbac_fallback(
        membership
            .as_ref()
            .and_then(|membership| OrgRole::from_str(&membership.role)),
        is_system_admin,
        permission_value,
    ))
}

/// Context-free effective permissions for GET /permissions. ABAC is applied to
/// every recognized permission so this result cannot contradict `/authorize`.
pub fn effective_permissions(
    user_id: &str,
    org_id: &str,
    allow_system_admin: bool,
) -> Result<Vec<Permission>> {
    let mut permissions = Vec::new();
    for permission in Permission::ALL {
        if evaluate(
            user_id,
            org_id,
            permission.as_str(),
            None,
            allow_system_admin,
        )?
        .allowed
        {
            permissions.push(*permission);
        }
    }
    Ok(permissions)
}

/// Add the subject (user/role) + resource (org) attributes the standalone seeds.
fn build_full_context(
    user_id: &str,
    org_id: &str,
    provided: Option<PolicyContext>,
    email: Option<&str>,
    role: Option<&str>,
    is_system_admin: bool,
) -> PolicyContext {
    let mut context = provided.unwrap_or_default();
    context
        .subject
        .insert("user_id".into(), Value::String(user_id.into()));
    context
        .subject
        .insert("is_system_admin".into(), Value::Bool(is_system_admin));
    match email {
        Some(email) => {
            context
                .subject
                .insert("email".into(), Value::String(email.into()));
        }
        None => {
            context.subject.remove("email");
        }
    }
    match role {
        Some(role) => {
            context
                .subject
                .insert("role".into(), Value::String(role.into()));
        }
        None => {
            context.subject.remove("role");
        }
    }
    // The organization argument is the authorization boundary. Never preserve
    // a caller-supplied resource.org_id: doing so lets request attributes
    // describe a different tenant than the policy/membership lookup.
    bind_authoritative_org(&mut context, org_id);
    context
}

fn bind_authoritative_org(context: &mut PolicyContext, org_id: &str) {
    context
        .resource
        .insert("org_id".into(), Value::String(org_id.into()));
}

/// A policy matches when every subject/resource/environment condition holds.
fn evaluate_policy(policy: &AbacPolicy, context: &PolicyContext) -> bool {
    conditions_match(&policy.conditions.subject, &context.subject, context)
        && conditions_match(&policy.conditions.resource, &context.resource, context)
        && conditions_match(
            &policy.conditions.environment,
            &context.environment,
            context,
        )
}

fn context_complete(policy: &AbacPolicy, context: &PolicyContext) -> bool {
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
                    AttributeMatcher::Equals(value) => value
                        .as_str()
                        .and_then(|s| s.strip_prefix("${"))
                        .and_then(|s| s.strip_suffix('}'))
                        .is_none_or(|path| context_value(path, context).is_some()),
                    _ => true,
                }
        })
    })
}

fn select_matching_policy<'a>(
    policies: &'a [AbacPolicy],
    context: &PolicyContext,
) -> Option<&'a AbacPolicy> {
    let highest_priority = policies
        .iter()
        .filter(|policy| evaluate_policy(policy, context))
        .map(|policy| policy.priority)
        .max()?;
    policies
        .iter()
        .filter(|policy| policy.priority == highest_priority && evaluate_policy(policy, context))
        .find(|policy| policy.effect == crate::domain::policy::PolicyEffect::Deny)
        .or_else(|| {
            policies.iter().find(|policy| {
                policy.priority == highest_priority && evaluate_policy(policy, context)
            })
        })
}

fn conditions_match(
    matchers: &HashMap<String, AttributeMatcher>,
    values: &HashMap<String, Value>,
    context: &PolicyContext,
) -> bool {
    matchers
        .iter()
        .all(|(key, matcher)| match_with_interpolation(matcher, values.get(key), context))
}

/// `Equals` resolves `${section.key}` variable references against the context;
/// every other matcher compares the raw value.
fn match_with_interpolation(
    matcher: &AttributeMatcher,
    value: Option<&Value>,
    context: &PolicyContext,
) -> bool {
    match matcher {
        AttributeMatcher::Equals(expected) => {
            let resolved = resolve_value(expected, context);
            value.map(|v| *v == resolved).unwrap_or(false)
        }
        other => other.matches(value),
    }
}

fn resolve_value(value: &Value, context: &PolicyContext) -> Value {
    if let Some(path) = value
        .as_str()
        .and_then(|s| s.strip_prefix("${"))
        .and_then(|s| s.strip_suffix('}'))
    {
        if let Some(resolved) = context_value(path, context) {
            return resolved.clone();
        }
    }
    value.clone()
}

fn context_value<'a>(path: &str, context: &'a PolicyContext) -> Option<&'a Value> {
    let (section, key) = path.split_once('.')?;
    match section {
        "subject" => context.subject.get(key),
        "resource" => context.resource.get(key),
        "environment" => context.environment.get(key),
        _ => None,
    }
}

/// No ABAC policy matched: system admin defaults → allow; unknown org → deny;
/// otherwise the built-in role→permission matrix.
fn evaluate_rbac_fallback(
    role: Option<OrgRole>,
    is_system_admin: bool,
    permission: Permission,
) -> PolicyEvaluationResult {
    if is_system_admin && permission.is_granted_to_system_admin_by_default() {
        return PolicyEvaluationResult::rbac(true, "System admin has full access");
    }
    let Some(role) = role else {
        return PolicyEvaluationResult::rbac(false, "Unknown role");
    };
    if permission.is_allowed_for(role) {
        PolicyEvaluationResult::rbac(
            true,
            &format!(
                "Role '{}' has '{}' permission",
                role.as_str(),
                permission.as_str()
            ),
        )
    } else {
        PolicyEvaluationResult::rbac(
            false,
            &format!(
                "Role '{}' lacks '{}' permission",
                role.as_str(),
                permission.as_str()
            ),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::policy::{AttributeMatcher, PolicyConditions, PolicyEffect};
    use serde_json::json;

    fn policy(effect: PolicyEffect, conditions: PolicyConditions) -> AbacPolicy {
        AbacPolicy {
            id: "p1".into(),
            org_id: "o1".into(),
            name: "test".into(),
            description: None,
            permission: "member:remove".into(),
            conditions,
            effect,
            priority: 0,
            enabled: true,
            created_at: "2026-06-02T00:00:00.000Z".into(),
            updated_at: "2026-06-02T00:00:00.000Z".into(),
        }
    }

    #[test]
    fn policy_matches_on_subject_role() {
        let mut conditions = PolicyConditions::default();
        conditions
            .subject
            .insert("role".into(), AttributeMatcher::Equals(json!("admin")));
        let p = policy(PolicyEffect::Deny, conditions);

        let mut ctx = PolicyContext::default();
        ctx.subject.insert("role".into(), json!("admin"));
        assert!(evaluate_policy(&p, &ctx));

        ctx.subject.insert("role".into(), json!("member"));
        assert!(!evaluate_policy(&p, &ctx));
    }

    #[test]
    fn equals_interpolates_subject_reference() {
        // resource.owner_id must equal ${subject.user_id}
        let mut conditions = PolicyConditions::default();
        conditions.resource.insert(
            "owner_id".into(),
            AttributeMatcher::Equals(json!("${subject.user_id}")),
        );
        let p = policy(PolicyEffect::Allow, conditions);

        let mut ctx = PolicyContext::default();
        ctx.subject.insert("user_id".into(), json!("u1"));
        ctx.resource.insert("owner_id".into(), json!("u1"));
        assert!(evaluate_policy(&p, &ctx));

        ctx.resource.insert("owner_id".into(), json!("u2"));
        assert!(!evaluate_policy(&p, &ctx));
    }

    #[test]
    fn authoritative_org_replaces_caller_supplied_tenant_attribute() {
        let mut context = PolicyContext::default();
        context
            .resource
            .insert("org_id".into(), json!("forged-org"));
        context
            .resource
            .insert("document_id".into(), json!("doc-1"));

        bind_authoritative_org(&mut context, "trusted-org");

        assert_eq!(context.resource["org_id"], json!("trusted-org"));
        assert_eq!(context.resource["document_id"], json!("doc-1"));
    }

    #[test]
    fn deny_overrides_allow_at_equal_highest_priority() {
        let mut allow = policy(PolicyEffect::Allow, PolicyConditions::default());
        allow.id = "allow".into();
        allow.priority = 10;
        let mut deny = policy(PolicyEffect::Deny, PolicyConditions::default());
        deny.id = "deny".into();
        deny.priority = 10;
        let mut lower_deny = policy(PolicyEffect::Deny, PolicyConditions::default());
        lower_deny.id = "lower-deny".into();
        lower_deny.priority = 1;

        let policies = vec![allow, lower_deny, deny];
        let selected = select_matching_policy(&policies, &PolicyContext::default()).unwrap();
        assert_eq!(selected.id, "deny");
    }

    #[test]
    fn higher_priority_allow_beats_lower_priority_deny() {
        let mut allow = policy(PolicyEffect::Allow, PolicyConditions::default());
        allow.id = "allow".into();
        allow.priority = 10;
        let mut deny = policy(PolicyEffect::Deny, PolicyConditions::default());
        deny.id = "deny".into();
        deny.priority = 1;

        let policies = vec![deny, allow];
        let selected = select_matching_policy(&policies, &PolicyContext::default()).unwrap();
        assert_eq!(selected.id, "allow");
    }
    #[test]
    fn missing_attributes_and_interpolation_are_indeterminate() {
        let mut conditions = PolicyConditions::default();
        conditions.resource.insert(
            "classification".into(),
            AttributeMatcher::Equals(json!("secret")),
        );
        let p = policy(PolicyEffect::Deny, conditions);
        let mut context = PolicyContext::default();
        assert!(!context_complete(&p, &context));
        context
            .resource
            .insert("classification".into(), json!("public"));
        assert!(context_complete(&p, &context));
        assert!(!evaluate_policy(&p, &context));
        let mut p = p;
        p.conditions.resource.insert(
            "classification".into(),
            AttributeMatcher::Equals(json!("${environment.target}")),
        );
        assert!(!context_complete(&p, &context));
        context.environment.insert("target".into(), json!("public"));
        assert!(context_complete(&p, &context));
        assert!(evaluate_policy(&p, &context));
    }
}
