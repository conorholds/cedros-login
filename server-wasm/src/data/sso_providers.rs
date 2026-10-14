//! Enterprise OIDC SSO provider configs over the host DB seam
//! (`cedros-login:sso-providers`, identity-db). Client secrets live in the host
//! secret seam. `client_secret_encrypted` is read only to migrate legacy rows
//! written before that boundary was enforced.
use crate::host::db::{self, Query, SSO_PROVIDERS};
use crate::host::Result;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SsoProviderEntry {
    pub id: String,
    pub org_id: String,
    pub name: String,
    pub issuer_url: String,
    pub client_id: String,
    #[serde(default)]
    pub client_secret_encrypted: Option<String>,
    pub scopes: Vec<String>,
    pub enabled: bool,
    pub allow_registration: bool,
    pub email_domain: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

pub fn create(provider: &SsoProviderEntry) -> Result<()> {
    db::write(SSO_PROVIDERS, &provider.id, provider)
}

pub fn update(provider: &SsoProviderEntry) -> Result<()> {
    db::write(SSO_PROVIDERS, &provider.id, provider)
}

pub fn find_by_id(id: &str) -> Result<Option<SsoProviderEntry>> {
    db::find_one(SSO_PROVIDERS, &Query::key(id))
}

/// All configured providers, newest first (admin listing).
pub fn find_all() -> Result<Vec<SsoProviderEntry>> {
    db::read_typed(
        SSO_PROVIDERS,
        &Query {
            order_by: Some(db::desc("createdAt")),
            ..Default::default()
        },
    )
}

pub fn page_by_org(org_id: &str, limit: u32, offset: u32) -> Result<Vec<SsoProviderEntry>> {
    db::read_typed(
        SSO_PROVIDERS,
        &Query {
            filters: vec![db::eq("orgId", org_id)],
            order_by: Some(db::asc("createdAt")),
            limit: Some(limit),
            offset: Some(offset),
            ..Default::default()
        },
    )
}

pub fn ids_by_org(org_id: &str) -> Result<Vec<String>> {
    const PAGE_SIZE: u32 = 100;
    let mut offset = 0_u32;
    let mut ids = Vec::new();
    loop {
        let page = page_by_org(org_id, PAGE_SIZE, offset)?;
        let page_len = page.len();
        ids.extend(page.into_iter().map(|provider| provider.id));
        if page_len < PAGE_SIZE as usize {
            return Ok(ids);
        }
        offset = offset.checked_add(PAGE_SIZE).ok_or_else(|| {
            crate::host::SeamError::Db("too many SSO providers for organization".into())
        })?;
    }
}

/// The first enabled provider for an org (the SSO-login entry point).
pub fn find_enabled_for_org(org_id: &str) -> Result<Option<SsoProviderEntry>> {
    let providers = db::read_typed::<SsoProviderEntry>(
        SSO_PROVIDERS,
        &Query {
            filters: vec![db::eq("orgId", org_id)],
            ..Default::default()
        },
    )?;
    Ok(providers.into_iter().find(|p| p.enabled))
}

pub fn delete(id: &str) -> Result<bool> {
    db::delete(SSO_PROVIDERS, id)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_camelcase() {
        let p = SsoProviderEntry {
            id: "p1".into(),
            org_id: "o1".into(),
            name: "Okta".into(),
            issuer_url: "https://dev.okta.com".into(),
            client_id: "cid".into(),
            client_secret_encrypted: Some("v1:abc".into()),
            scopes: vec!["openid".into(), "email".into()],
            enabled: true,
            allow_registration: false,
            email_domain: Some("acme.test".into()),
            created_at: "2026-06-01T00:00:00.000Z".into(),
            updated_at: "2026-06-01T00:00:00.000Z".into(),
        };
        let j = serde_json::to_value(&p).unwrap();
        assert_eq!(j["orgId"], "o1");
        assert_eq!(j["issuerUrl"], "https://dev.okta.com");
        assert_eq!(j["clientSecretEncrypted"], "v1:abc");
        assert_eq!(serde_json::from_value::<SsoProviderEntry>(j).unwrap(), p);
    }
}
