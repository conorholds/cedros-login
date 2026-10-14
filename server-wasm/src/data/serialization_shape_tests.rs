use super::{
    api_keys::ApiKeyEntry, audit::AuditLogEntry, credentials::CredentialEntry,
    custom_roles::CustomRoleEntry, invite_codes::InviteCode, invite_codes::InviteCodeAccount,
    invites::InviteEntry, login_attempts::LoginAttemptEntry, memberships::MembershipEntry,
    nonces::NonceEntry, orgs::OrgEntry, outbox::OutboxEntry, sessions::SessionEntry,
    sso_identities::SsoIdentityEntry, sso_providers::SsoProviderEntry, totp::TotpEntry,
    user_emails::UserEmailEntry, users::UserEntry, verifications::VerificationEntry,
};
use crate::domain::policy::AbacPolicy;
use serde::{de::DeserializeOwned, Serialize};
use serde_json::{json, Value};
use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};

const T0: &str = "2026-06-01T00:00:00.000Z";
const T1: &str = "2026-06-02T00:00:00.000Z";
const T2: &str = "2026-06-03T00:00:00.000Z";

struct ShapeCase {
    name: &'static str,
    absent: Value,
    present: Value,
}

#[test]
fn persisted_data_models_keep_stable_top_level_shape() {
    for shape_case in persistence_shape_cases() {
        assert_same_keys(shape_case);
    }
}

#[test]
fn persisted_model_sources_do_not_omit_optional_fields_at_serialization() {
    let forbidden = ["skip_serializing", "_if"].concat();
    let manifest_dir = Path::new(env!("CARGO_MANIFEST_DIR"));
    let mut violations = Vec::new();

    for region in persisted_model_sources(manifest_dir) {
        let contents = fs::read_to_string(&region.path).expect("read persisted model source");
        let source = region.select(&contents);
        for (line_index, line) in source.lines().enumerate() {
            if line.contains(&forbidden) {
                let rel = region
                    .path
                    .strip_prefix(manifest_dir)
                    .unwrap_or(&region.path);
                violations.push(format!(
                    "{}:{}",
                    rel.display(),
                    source.start_line + line_index
                ));
            }
        }
    }

    assert!(
        violations.is_empty(),
        "server-wasm persisted model sources must not use `{forbidden}`. \
         The host DB seam infers content-model fields from writes; once one \
         flow populates a field, later writes that omit the field fail at the \
         seam. Serialize absent optional persistence fields as `null` instead.\n{}",
        violations.join("\n")
    );
}

struct SourceRegion {
    path: PathBuf,
    struct_name: Option<&'static str>,
}

impl SourceRegion {
    fn whole_file(path: PathBuf) -> Self {
        Self {
            path,
            struct_name: None,
        }
    }

    fn struct_block(path: PathBuf, struct_name: &'static str) -> Self {
        Self {
            path,
            struct_name: Some(struct_name),
        }
    }

    fn select<'a>(&self, source: &'a str) -> SelectedSource<'a> {
        match self.struct_name {
            Some(struct_name) => select_struct_source(source, struct_name),
            None => SelectedSource {
                lines: source.lines().collect(),
                start_line: 1,
            },
        }
    }
}

struct SelectedSource<'a> {
    lines: Vec<&'a str>,
    start_line: usize,
}

impl<'a> SelectedSource<'a> {
    fn lines(&self) -> impl Iterator<Item = &'a str> + '_ {
        self.lines.iter().copied()
    }
}

fn persisted_model_sources(manifest_dir: &Path) -> Vec<SourceRegion> {
    let data_dir = manifest_dir.join("src/data");
    let mut sources = Vec::new();

    for entry in fs::read_dir(&data_dir).expect("read src/data") {
        let path = entry.expect("read src/data entry").path();
        if path.extension().and_then(|ext| ext.to_str()) == Some("rs") {
            sources.push(SourceRegion::whole_file(path));
        }
    }

    sources.push(SourceRegion::struct_block(
        manifest_dir.join("src/domain/policy.rs"),
        "AbacPolicy",
    ));

    sources
}

fn select_struct_source<'a>(source: &'a str, struct_name: &str) -> SelectedSource<'a> {
    let mut lines = Vec::new();
    let mut start_line = 1;
    let mut collecting = false;
    let mut brace_depth = 0usize;

    for (index, line) in source.lines().enumerate() {
        if !collecting && line.contains(&format!("struct {struct_name}")) {
            collecting = true;
            start_line = index + 1;
        }

        if collecting {
            lines.push(line);
            brace_depth += line.matches('{').count();
            brace_depth = brace_depth.saturating_sub(line.matches('}').count());
            if brace_depth == 0 && line.contains('}') {
                break;
            }
        }
    }

    assert!(
        !lines.is_empty(),
        "expected to find persisted struct {struct_name}"
    );

    SelectedSource { lines, start_line }
}

fn persistence_shape_cases() -> Vec<ShapeCase> {
    let mut cases = policy_and_auth_shape_cases();
    cases.extend(invite_and_activity_shape_cases());
    cases.extend(org_session_and_provider_shape_cases());
    cases.extend(user_factor_shape_cases());
    cases
}

fn policy_and_auth_shape_cases() -> Vec<ShapeCase> {
    vec![
        model::<AbacPolicy>(
            "AbacPolicy",
            json!({"id":"p1","orgId":"o1","name":"Admin","description":null,"permission":"member:remove","conditions":{"subject":{},"resource":{},"environment":{}},"effect":"allow","priority":0,"enabled":true,"createdAt":T0,"updatedAt":T0}),
            json!({"id":"p1","orgId":"o1","name":"Admin","description":"Admins can remove members","permission":"member:remove","conditions":{"subject":{},"resource":{},"environment":{}},"effect":"deny","priority":10,"enabled":false,"createdAt":T0,"updatedAt":T1}),
        ),
        model::<ApiKeyEntry>(
            "ApiKeyEntry",
            json!({"id":"k1","userId":"u1","keyHash":"hash","keyPrefix":"ck_abc123","label":"CI","createdAt":T0,"lastUsedAt":null}),
            json!({"id":"k1","userId":"u1","keyHash":"hash","keyPrefix":"ck_abc123","label":"CI","createdAt":T0,"lastUsedAt":T1,"portalAgent":{"organizationId":"o1","membershipRevision":"membership-v1","expiresAt":T2}}),
        ),
        model::<AuditLogEntry>(
            "AuditLogEntry",
            json!({"id":"a1","eventType":"admin.user_updated","actorUserId":null,"targetType":null,"targetId":null,"ipAddress":null,"createdAt":T0}),
            json!({"id":"a1","eventType":"admin.user_updated","actorUserId":"admin","targetType":"user","targetId":"u2","ipAddress":"203.0.113.10","createdAt":T0}),
        ),
        model::<CustomRoleEntry>(
            "CustomRoleEntry",
            json!({"id":"r1","orgId":"o1","name":"Billing","description":null,"permissions":[],"isDefault":false,"createdAt":T0,"updatedAt":T0}),
            json!({"id":"r1","orgId":"o1","name":"Billing","description":"Manage billing","permissions":["org:read"],"isDefault":true,"createdAt":T0,"updatedAt":T1}),
        ),
        model::<CredentialEntry>(
            "CredentialEntry",
            json!({"id":"cred1","userId":"u1","publicKey":"pQECAyY","signCount":0,"label":null,"createdAt":T0,"lastUsedAt":null}),
            json!({"id":"cred1","userId":"u1","publicKey":"pQECAyY","signCount":2,"label":"Laptop","createdAt":T0,"lastUsedAt":T1}),
        ),
        model::<SsoIdentityEntry>(
            "SsoIdentityEntry",
            json!({"id":"sso:opaque","userId":"u1","createdAt":T0}),
            json!({"id":"sso:other","userId":"u2","createdAt":T1}),
        ),
    ]
}

fn invite_and_activity_shape_cases() -> Vec<ShapeCase> {
    vec![
        model::<InviteCode>(
            "InviteCode",
            json!({"id":"ic1","code":"ABCD","createdBy":null,"ownerUserId":null,"maxUses":null,"usesCount":0,"startsAt":null,"expiresAt":null,"active":true,"batchKey":null,"createdAt":T0,"updatedAt":T0}),
            json!({"id":"ic1","code":"ABCD","createdBy":"admin","ownerUserId":"owner","maxUses":3,"usesCount":1,"startsAt":T0,"expiresAt":T2,"active":true,"batchKey":"batch","createdAt":T0,"updatedAt":T1}),
        ),
        model::<InviteCodeAccount>(
            "InviteCodeAccount",
            json!({"userId":"u1","activatedAt":null,"createdAt":T0,"redemptionId":null,"inviteCodeId":null}),
            json!({"userId":"u1","activatedAt":T1,"createdAt":T0,"redemptionId":"redemption-1","inviteCodeId":"ic1"}),
        ),
        model::<InviteEntry>(
            "InviteEntry",
            json!({"id":"i1","orgId":"o1","email":null,"walletAddress":null,"role":"member","tokenHash":"hash","invitedBy":"admin","createdAt":T0,"expiresAt":T2,"acceptedAt":null}),
            json!({"id":"i1","orgId":"o1","email":"user@example.com","walletAddress":"11111111111111111111111111111111","role":"admin","tokenHash":"hash","invitedBy":"admin","createdAt":T0,"expiresAt":T2,"acceptedAt":T1}),
        ),
        model::<LoginAttemptEntry>(
            "LoginAttemptEntry",
            json!({"id":"la1","userId":null,"email":"user@example.com","ipAddress":null,"successful":false,"attemptedAt":T0}),
            json!({"id":"la1","userId":"u1","email":"user@example.com","ipAddress":"203.0.113.10","successful":true,"attemptedAt":T0}),
        ),
        model::<MembershipEntry>(
            "MembershipEntry",
            json!({"id":"m1","userId":"u1","orgId":"o1","role":"member","joinedAt":T0}),
            json!({"id":"m1","userId":"u1","orgId":"o1","role":"owner","joinedAt":T0}),
        ),
        model::<NonceEntry>(
            "NonceEntry",
            json!({"nonce":"nonce","publicKey":"11111111111111111111111111111111","message":"Sign in to Cedros","createdAt":T0,"expiresAt":T1,"usedAt":null}),
            json!({"nonce":"nonce","publicKey":"11111111111111111111111111111111","message":"Sign in to Cedros","createdAt":T0,"expiresAt":T1,"usedAt":T0}),
        ),
    ]
}

fn org_session_and_provider_shape_cases() -> Vec<ShapeCase> {
    vec![
        model::<OrgEntry>(
            "OrgEntry",
            json!({"id":"o1","name":"Acme","slug":"acme","logoUrl":null,"isPersonal":false,"ownerId":"u1","createdAt":T0,"updatedAt":T0}),
            json!({"id":"o1","name":"Acme","slug":"acme","logoUrl":"https://cdn.example/logo.png","isPersonal":true,"ownerId":"u1","createdAt":T0,"updatedAt":T1}),
        ),
        model::<OutboxEntry>(
            "OutboxEntry",
            json!({"id":"out1","userId":null,"to":"user@example.com","subject":"Welcome","htmlBody":null,"textBody":null,"status":"pending","attempts":0,"maxAttempts":5,"createdAt":T0,"nextAttemptAt":T0,"lastError":null}),
            json!({"id":"out1","userId":"u1","to":"user@example.com","subject":"Welcome","htmlBody":"<p>Welcome</p>","textBody":"Welcome","status":"failed","attempts":5,"maxAttempts":5,"createdAt":T0,"nextAttemptAt":T1,"lastError":"provider_error","providerAcceptedAt":null,"providerMessageRef":null,"leaseOwner":null,"leaseExpiresAt":null}),
        ),
        model::<SessionEntry>(
            "SessionEntry",
            json!({"id":"s1","userId":"u1","refreshTokenHash":"hash","ipAddress":null,"userAgent":null,"createdAt":T0,"expiresAt":T2,"revokedAt":null,"revokedReason":null,"lastStrongAuthAt":null}),
            json!({"id":"s1","userId":"u1","refreshTokenHash":"hash","ipAddress":"203.0.113.10","userAgent":"Mozilla/5.0","createdAt":T0,"expiresAt":T2,"revokedAt":T1,"revokedReason":"rotated","lastStrongAuthAt":T1}),
        ),
        model::<SsoProviderEntry>(
            "SsoProviderEntry",
            json!({"id":"sp1","orgId":"o1","name":"Okta","issuerUrl":"https://issuer.example","clientId":"client","clientSecretEncrypted":null,"scopes":[],"enabled":false,"allowRegistration":false,"emailDomain":null,"createdAt":T0,"updatedAt":T0}),
            json!({"id":"sp1","orgId":"o1","name":"Okta","issuerUrl":"https://issuer.example","clientId":"client","clientSecretEncrypted":"v1:ciphertext","scopes":["openid","email"],"enabled":true,"allowRegistration":true,"emailDomain":"example.com","createdAt":T0,"updatedAt":T1}),
        ),
    ]
}

fn user_factor_shape_cases() -> Vec<ShapeCase> {
    vec![
        model::<TotpEntry>(
            "TotpEntry",
            json!({"userId":"u1","secret":null,"enabled":false,"createdAt":T0,"enabledAt":null,"lastUsedTimeStep":null,"recoveryCodes":[]}),
            json!({"userId":"u1","secret":"v1:ciphertext","enabled":true,"createdAt":T0,"enabledAt":T1,"lastUsedTimeStep":63000000,"recoveryCodes":["hash1"]}),
        ),
        model::<UserEmailEntry>(
            "UserEmailEntry",
            json!({"id":"ue1","userId":"u1","email":"user@example.com","verifiedAt":null,"isPrimary":false,"createdAt":T0}),
            json!({"id":"ue1","userId":"u1","email":"user@example.com","verifiedAt":T1,"isPrimary":true,"createdAt":T0}),
        ),
        model::<UserEntry>(
            "UserEntry",
            json!({"id":"u1","email":null,"emailVerified":false,"passwordHash":null,"name":null,"username":null,"picture":null,"walletAddress":null,"evmWalletAddress":null,"googleId":null,"appleId":null,"authMethods":[],"suspendedAt":null,"isSystemAdmin":false,"createdAt":T0,"updatedAt":T0,"lastLoginAt":null,"welcomeCompletedAt":null,"avatarContentType":null}),
            json!({"id":"u1","email":"user@example.com","emailVerified":true,"passwordHash":"$argon2id$hash","name":"User","username":"user","picture":"https://cdn.example/user.png","walletAddress":"11111111111111111111111111111111","evmWalletAddress":"0x1111111111111111111111111111111111111111","googleId":"google","appleId":"apple","authMethods":["password","google"],"suspendedAt":T1,"isSystemAdmin":true,"createdAt":T0,"updatedAt":T1,"lastLoginAt":T1,"welcomeCompletedAt":T2,"avatarContentType":"image/png"}),
        ),
        model::<VerificationEntry>(
            "VerificationEntry",
            json!({"id":"v1","userId":"u1","tokenHash":"hash","tokenType":"email_verification","targetEmail":null,"subjectId":null,"createdAt":T0,"expiresAt":T2,"usedAt":null}),
            json!({"id":"v1","userId":"u1","tokenHash":"hash","tokenType":"email_verification","targetEmail":"new@example.com","subjectId":"ue1","createdAt":T0,"expiresAt":T2,"usedAt":T1}),
        ),
    ]
}

fn model<T>(name: &'static str, absent: Value, present: Value) -> ShapeCase
where
    T: DeserializeOwned + Serialize,
{
    ShapeCase {
        name,
        absent: model_value::<T>(absent),
        present: model_value::<T>(present),
    }
}

fn model_value<T>(value: Value) -> Value
where
    T: DeserializeOwned + Serialize,
{
    let model: T = serde_json::from_value(value).unwrap();
    serde_json::to_value(model).unwrap()
}

fn assert_same_keys(shape_case: ShapeCase) {
    let absent_keys = keys(&shape_case.absent);
    let present_keys = keys(&shape_case.present);
    assert_eq!(
        absent_keys, present_keys,
        "{} must serialize the same top-level fields when optional values are absent",
        shape_case.name
    );
}

fn keys(value: &Value) -> BTreeSet<String> {
    value
        .as_object()
        .expect("persistence model serializes as object")
        .keys()
        .cloned()
        .collect()
}
