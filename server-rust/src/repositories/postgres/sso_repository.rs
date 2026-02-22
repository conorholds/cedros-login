//! PostgreSQL SSO provider repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::sso::{SsoAuthState, SsoProvider};
use crate::repositories::pagination::{cap_limit, cap_offset};
use crate::repositories::SsoRepository;

/// PostgreSQL SSO repository
pub struct PostgresSsoRepository {
    pool: PgPool,
}

impl PostgresSsoRepository {
    /// Create a new Postgres SSO repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for SSO provider queries
#[derive(sqlx::FromRow)]
struct SsoProviderRow {
    id: Uuid,
    org_id: Uuid,
    name: String,
    issuer_url: String,
    client_id: String,
    client_secret_encrypted: String,
    scopes: Vec<String>,
    enabled: bool,
    allow_registration: bool,
    email_domain: Option<String>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<SsoProviderRow> for SsoProvider {
    fn from(row: SsoProviderRow) -> Self {
        Self {
            id: row.id,
            org_id: row.org_id,
            name: row.name,
            issuer_url: row.issuer_url,
            client_id: row.client_id,
            client_secret_encrypted: row.client_secret_encrypted,
            scopes: row.scopes,
            enabled: row.enabled,
            allow_registration: row.allow_registration,
            email_domain: row.email_domain,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

/// Row type for SSO auth state queries
#[derive(sqlx::FromRow)]
struct SsoAuthStateRow {
    state_id: Uuid,
    provider_id: Uuid,
    org_id: Uuid,
    pkce_verifier: String,
    nonce: String,
    redirect_uri: Option<String>,
    created_at: DateTime<Utc>,
    expires_at: DateTime<Utc>,
}

impl From<SsoAuthStateRow> for SsoAuthState {
    fn from(row: SsoAuthStateRow) -> Self {
        Self {
            state_id: row.state_id,
            provider_id: row.provider_id,
            org_id: row.org_id,
            pkce_verifier: row.pkce_verifier,
            nonce: row.nonce,
            redirect_uri: row.redirect_uri,
            created_at: row.created_at,
            expires_at: row.expires_at,
        }
    }
}

#[async_trait]
impl SsoRepository for PostgresSsoRepository {
    async fn create_provider(&self, provider: SsoProvider) -> Result<SsoProvider, AppError> {
        let row: SsoProviderRow = sqlx::query_as(
            r#"
            INSERT INTO sso_providers (
                id, org_id, name, issuer_url, client_id, client_secret_encrypted,
                scopes, enabled, allow_registration, email_domain, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id, org_id, name, issuer_url, client_id, client_secret_encrypted,
                      scopes, enabled, allow_registration, email_domain, created_at, updated_at
            "#,
        )
        .bind(provider.id)
        .bind(provider.org_id)
        .bind(&provider.name)
        .bind(&provider.issuer_url)
        .bind(&provider.client_id)
        .bind(&provider.client_secret_encrypted)
        .bind(&provider.scopes)
        .bind(provider.enabled)
        .bind(provider.allow_registration)
        .bind(&provider.email_domain)
        .bind(provider.created_at)
        .bind(provider.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn find_provider_by_id(&self, id: Uuid) -> Result<Option<SsoProvider>, AppError> {
        let row: Option<SsoProviderRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, issuer_url, client_id, client_secret_encrypted,
                   scopes, enabled, allow_registration, email_domain, created_at, updated_at
            FROM sso_providers WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_providers_by_org(&self, org_id: Uuid) -> Result<Vec<SsoProvider>, AppError> {
        let rows: Vec<SsoProviderRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, issuer_url, client_id, client_secret_encrypted,
                   scopes, enabled, allow_registration, email_domain, created_at, updated_at
            FROM sso_providers WHERE org_id = $1
            ORDER BY name
            "#,
        )
        .bind(org_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn find_enabled_provider_for_org(
        &self,
        org_id: Uuid,
    ) -> Result<Option<SsoProvider>, AppError> {
        let row: Option<SsoProviderRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, issuer_url, client_id, client_secret_encrypted,
                   scopes, enabled, allow_registration, email_domain, created_at, updated_at
            FROM sso_providers WHERE org_id = $1 AND enabled = true
            LIMIT 1
            "#,
        )
        .bind(org_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn list_all_providers(&self) -> Result<Vec<SsoProvider>, AppError> {
        let rows: Vec<SsoProviderRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, issuer_url, client_id, client_secret_encrypted,
                   scopes, enabled, allow_registration, email_domain, created_at, updated_at
            FROM sso_providers
            ORDER BY org_id, name
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn list_providers_for_org(&self, org_id: Uuid) -> Result<Vec<SsoProvider>, AppError> {
        self.find_providers_by_org(org_id).await
    }

    async fn list_all_providers_paged(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<SsoProvider>, AppError> {
        let capped_limit = cap_limit(limit);
        let capped_offset = cap_offset(offset);

        let rows: Vec<SsoProviderRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, issuer_url, client_id, client_secret_encrypted,
                   scopes, enabled, allow_registration, email_domain, created_at, updated_at
            FROM sso_providers
            ORDER BY org_id, name
            LIMIT $1 OFFSET $2
            "#,
        )
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn list_providers_for_org_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<SsoProvider>, AppError> {
        let capped_limit = cap_limit(limit);
        let capped_offset = cap_offset(offset);

        let rows: Vec<SsoProviderRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, issuer_url, client_id, client_secret_encrypted,
                   scopes, enabled, allow_registration, email_domain, created_at, updated_at
            FROM sso_providers
            WHERE org_id = $1
            ORDER BY name
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(org_id)
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count_all_providers(&self) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM sso_providers")
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }

    async fn count_providers_for_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM sso_providers WHERE org_id = $1")
            .bind(org_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }

    async fn list_providers_for_orgs_paged(
        &self,
        org_ids: &[Uuid],
        limit: u32,
        offset: u32,
    ) -> Result<Vec<SsoProvider>, AppError> {
        if org_ids.is_empty() {
            return Ok(Vec::new());
        }

        let capped_limit = cap_limit(limit);
        let capped_offset = cap_offset(offset);

        let rows: Vec<SsoProviderRow> = sqlx::query_as(
            r#"
            SELECT id, org_id, name, issuer_url, client_id, client_secret_encrypted,
                   scopes, enabled, allow_registration, email_domain, created_at, updated_at
            FROM sso_providers
            WHERE org_id = ANY($1)
            ORDER BY org_id, name
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(org_ids)
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count_providers_for_orgs(&self, org_ids: &[Uuid]) -> Result<u64, AppError> {
        if org_ids.is_empty() {
            return Ok(0);
        }

        let count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM sso_providers WHERE org_id = ANY($1)")
                .bind(org_ids)
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }

    async fn update_provider(&self, provider: SsoProvider) -> Result<SsoProvider, AppError> {
        let row: Option<SsoProviderRow> = sqlx::query_as(
            r#"
            UPDATE sso_providers SET
                name = $2,
                issuer_url = $3,
                client_id = $4,
                client_secret_encrypted = $5,
                scopes = $6,
                enabled = $7,
                allow_registration = $8,
                email_domain = $9
            WHERE id = $1
            RETURNING id, org_id, name, issuer_url, client_id, client_secret_encrypted,
                      scopes, enabled, allow_registration, email_domain, created_at, updated_at
            "#,
        )
        .bind(provider.id)
        .bind(&provider.name)
        .bind(&provider.issuer_url)
        .bind(&provider.client_id)
        .bind(&provider.client_secret_encrypted)
        .bind(&provider.scopes)
        .bind(provider.enabled)
        .bind(provider.allow_registration)
        .bind(&provider.email_domain)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.map(Into::into)
            .ok_or_else(|| AppError::NotFound("Provider not found".into()))
    }

    async fn delete_provider(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query("DELETE FROM sso_providers WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn store_auth_state(&self, state: SsoAuthState) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO sso_auth_states (
                state_id, provider_id, org_id, pkce_verifier, nonce,
                redirect_uri, created_at, expires_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            "#,
        )
        .bind(state.state_id)
        .bind(state.provider_id)
        .bind(state.org_id)
        .bind(&state.pkce_verifier)
        .bind(&state.nonce)
        .bind(&state.redirect_uri)
        .bind(state.created_at)
        .bind(state.expires_at)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn get_auth_state(&self, state_id: Uuid) -> Result<Option<SsoAuthState>, AppError> {
        let row: Option<SsoAuthStateRow> = sqlx::query_as(
            r#"
            SELECT state_id, provider_id, org_id, pkce_verifier, nonce,
                   redirect_uri, created_at, expires_at
            FROM sso_auth_states
            WHERE state_id = $1 AND expires_at > NOW()
            "#,
        )
        .bind(state_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn consume_auth_state(&self, state_id: Uuid) -> Result<Option<SsoAuthState>, AppError> {
        // Atomically fetch and delete in one query
        let row: Option<SsoAuthStateRow> = sqlx::query_as(
            r#"
            DELETE FROM sso_auth_states
            WHERE state_id = $1 AND expires_at > NOW()
            RETURNING state_id, provider_id, org_id, pkce_verifier, nonce,
                      redirect_uri, created_at, expires_at
            "#,
        )
        .bind(state_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn delete_expired_states(&self) -> Result<u64, AppError> {
        let result = sqlx::query("DELETE FROM sso_auth_states WHERE expires_at <= NOW()")
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(result.rows_affected())
    }
}
