//! SSO provider repository
//!
//! Storage for OIDC provider configurations and authentication states.

use async_trait::async_trait;
use chrono::Utc;
use std::collections::hash_map::Entry;
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::sso::{SsoAuthState, SsoProvider};

/// SSO repository trait
#[async_trait]
pub trait SsoRepository: Send + Sync {
    // Provider operations

    /// Create a new SSO provider
    async fn create_provider(&self, provider: SsoProvider) -> Result<SsoProvider, AppError>;

    /// Find provider by ID
    async fn find_provider_by_id(&self, id: Uuid) -> Result<Option<SsoProvider>, AppError>;

    /// Find all providers for an organization
    async fn find_providers_by_org(&self, org_id: Uuid) -> Result<Vec<SsoProvider>, AppError>;

    /// Find enabled provider for org (returns first enabled)
    async fn find_enabled_provider_for_org(
        &self,
        org_id: Uuid,
    ) -> Result<Option<SsoProvider>, AppError>;

    /// List all providers (admin)
    async fn list_all_providers(&self) -> Result<Vec<SsoProvider>, AppError>;

    /// List providers for a specific org (alias for find_providers_by_org for clarity)
    async fn list_providers_for_org(&self, org_id: Uuid) -> Result<Vec<SsoProvider>, AppError>;

    /// List all providers with pagination
    async fn list_all_providers_paged(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<SsoProvider>, AppError>;

    /// List providers for a specific org with pagination
    async fn list_providers_for_org_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<SsoProvider>, AppError>;

    /// Count all providers
    async fn count_all_providers(&self) -> Result<u64, AppError>;

    /// Count providers for a specific org
    async fn count_providers_for_org(&self, org_id: Uuid) -> Result<u64, AppError>;

    /// Update a provider
    async fn update_provider(&self, provider: SsoProvider) -> Result<SsoProvider, AppError>;

    /// Delete a provider
    async fn delete_provider(&self, id: Uuid) -> Result<(), AppError>;

    // Auth state operations

    /// Store SSO auth state
    async fn store_auth_state(&self, state: SsoAuthState) -> Result<(), AppError>;

    /// Get auth state without consuming it (returns None if expired)
    async fn get_auth_state(&self, state_id: Uuid) -> Result<Option<SsoAuthState>, AppError>;

    /// Consume auth state (returns and deletes if valid)
    async fn consume_auth_state(&self, state_id: Uuid) -> Result<Option<SsoAuthState>, AppError>;

    /// Delete expired auth states
    async fn delete_expired_states(&self) -> Result<u64, AppError>;
}

/// In-memory SSO repository for development/testing
pub struct InMemorySsoRepository {
    providers: RwLock<HashMap<Uuid, SsoProvider>>,
    auth_states: RwLock<HashMap<Uuid, SsoAuthState>>,
}

impl InMemorySsoRepository {
    pub fn new() -> Self {
        Self {
            providers: RwLock::new(HashMap::new()),
            auth_states: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemorySsoRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SsoRepository for InMemorySsoRepository {
    async fn create_provider(&self, provider: SsoProvider) -> Result<SsoProvider, AppError> {
        let mut providers = self.providers.write().await;
        providers.insert(provider.id, provider.clone());
        Ok(provider)
    }

    async fn find_provider_by_id(&self, id: Uuid) -> Result<Option<SsoProvider>, AppError> {
        let providers = self.providers.read().await;
        Ok(providers.get(&id).cloned())
    }

    async fn find_providers_by_org(&self, org_id: Uuid) -> Result<Vec<SsoProvider>, AppError> {
        let providers = self.providers.read().await;
        let result: Vec<_> = providers
            .values()
            .filter(|p| p.org_id == org_id)
            .cloned()
            .collect();
        Ok(result)
    }

    async fn find_enabled_provider_for_org(
        &self,
        org_id: Uuid,
    ) -> Result<Option<SsoProvider>, AppError> {
        let providers = self.providers.read().await;
        Ok(providers
            .values()
            .find(|p| p.org_id == org_id && p.enabled)
            .cloned())
    }

    async fn list_all_providers(&self) -> Result<Vec<SsoProvider>, AppError> {
        let providers = self.providers.read().await;
        Ok(providers.values().cloned().collect())
    }

    async fn list_providers_for_org(&self, org_id: Uuid) -> Result<Vec<SsoProvider>, AppError> {
        self.find_providers_by_org(org_id).await
    }

    async fn list_all_providers_paged(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<SsoProvider>, AppError> {
        let providers = self.providers.read().await;
        let mut result: Vec<_> = providers.values().cloned().collect();
        result.sort_by(|a, b| (a.org_id, a.name.clone()).cmp(&(b.org_id, b.name.clone())));
        let start = offset as usize;
        let end = start.saturating_add(limit as usize);
        Ok(result.into_iter().skip(start).take(end - start).collect())
    }

    async fn list_providers_for_org_paged(
        &self,
        org_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<SsoProvider>, AppError> {
        let providers = self.providers.read().await;
        let mut result: Vec<_> = providers
            .values()
            .filter(|p| p.org_id == org_id)
            .cloned()
            .collect();
        result.sort_by(|a, b| a.name.cmp(&b.name));
        let start = offset as usize;
        let end = start.saturating_add(limit as usize);
        Ok(result.into_iter().skip(start).take(end - start).collect())
    }

    async fn count_all_providers(&self) -> Result<u64, AppError> {
        let providers = self.providers.read().await;
        Ok(providers.len() as u64)
    }

    async fn count_providers_for_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let providers = self.providers.read().await;
        Ok(providers.values().filter(|p| p.org_id == org_id).count() as u64)
    }

    async fn update_provider(&self, provider: SsoProvider) -> Result<SsoProvider, AppError> {
        let mut providers = self.providers.write().await;
        // LINT-04: Use Entry API instead of contains_key then insert
        match providers.entry(provider.id) {
            Entry::Occupied(mut entry) => {
                entry.insert(provider.clone());
                Ok(provider)
            }
            Entry::Vacant(_) => Err(AppError::NotFound("Provider not found".into())),
        }
    }

    async fn delete_provider(&self, id: Uuid) -> Result<(), AppError> {
        let mut providers = self.providers.write().await;
        providers.remove(&id);
        Ok(())
    }

    async fn store_auth_state(&self, state: SsoAuthState) -> Result<(), AppError> {
        let mut states = self.auth_states.write().await;
        states.insert(state.state_id, state);
        Ok(())
    }

    async fn get_auth_state(&self, state_id: Uuid) -> Result<Option<SsoAuthState>, AppError> {
        let states = self.auth_states.read().await;
        let state = states.get(&state_id).cloned();

        if let Some(ref s) = state {
            if s.expires_at < Utc::now() {
                return Ok(None);
            }
        }

        Ok(state)
    }

    async fn consume_auth_state(&self, state_id: Uuid) -> Result<Option<SsoAuthState>, AppError> {
        let mut states = self.auth_states.write().await;
        let state = states.remove(&state_id);

        // Check expiration
        if let Some(ref s) = state {
            if s.expires_at < Utc::now() {
                return Ok(None);
            }
        }

        Ok(state)
    }

    async fn delete_expired_states(&self) -> Result<u64, AppError> {
        let mut states = self.auth_states.write().await;
        let now = Utc::now();
        let to_remove: Vec<Uuid> = states
            .values()
            .filter(|s| s.expires_at < now)
            .map(|s| s.state_id)
            .collect();
        let count = to_remove.len() as u64;
        for id in to_remove {
            states.remove(&id);
        }
        Ok(count)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_and_find_provider() {
        let repo = InMemorySsoRepository::new();
        let org_id = Uuid::new_v4();

        let provider = SsoProvider::new(
            org_id,
            "Okta".into(),
            "https://dev.okta.com".into(),
            "client-id".into(),
            "secret".into(),
        );
        let provider_id = provider.id;

        repo.create_provider(provider).await.unwrap();

        let found = repo.find_provider_by_id(provider_id).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().name, "Okta");
    }

    #[tokio::test]
    async fn test_find_providers_by_org() {
        let repo = InMemorySsoRepository::new();
        let org_id = Uuid::new_v4();

        let p1 = SsoProvider::new(
            org_id,
            "Okta".into(),
            "https://okta.com".into(),
            "id1".into(),
            "s1".into(),
        );
        let p2 = SsoProvider::new(
            org_id,
            "Azure AD".into(),
            "https://azure.com".into(),
            "id2".into(),
            "s2".into(),
        );

        repo.create_provider(p1).await.unwrap();
        repo.create_provider(p2).await.unwrap();

        let providers = repo.find_providers_by_org(org_id).await.unwrap();
        assert_eq!(providers.len(), 2);
    }

    #[tokio::test]
    async fn test_list_providers_paged_and_count() {
        let repo = InMemorySsoRepository::new();
        let org_a = Uuid::new_v4();
        let org_b = Uuid::new_v4();

        let provider_a1 = SsoProvider::new(
            org_a,
            "Alpha".into(),
            "https://alpha.example.com".into(),
            "client-a1".into(),
            "secret".into(),
        );
        let provider_a2 = SsoProvider::new(
            org_a,
            "Beta".into(),
            "https://beta.example.com".into(),
            "client-a2".into(),
            "secret".into(),
        );
        let provider_b1 = SsoProvider::new(
            org_b,
            "Gamma".into(),
            "https://gamma.example.com".into(),
            "client-b1".into(),
            "secret".into(),
        );

        repo.create_provider(provider_a1).await.unwrap();
        repo.create_provider(provider_a2).await.unwrap();
        repo.create_provider(provider_b1).await.unwrap();

        let total = repo.count_all_providers().await.unwrap();
        assert_eq!(total, 3);

        let page = repo.list_all_providers_paged(2, 0).await.unwrap();
        assert_eq!(page.len(), 2);

        let org_total = repo.count_providers_for_org(org_a).await.unwrap();
        assert_eq!(org_total, 2);

        let org_page = repo
            .list_providers_for_org_paged(org_a, 1, 1)
            .await
            .unwrap();
        assert_eq!(org_page.len(), 1);
    }

    #[tokio::test]
    async fn test_auth_state_expiration() {
        let repo = InMemorySsoRepository::new();

        let mut state = SsoAuthState::new(
            Uuid::new_v4(),
            Uuid::new_v4(),
            "verifier".into(),
            "nonce".into(),
            None,
            -10, // Already expired
        );
        state.expires_at = Utc::now() - chrono::Duration::seconds(10);
        let state_id = state.state_id;

        repo.store_auth_state(state).await.unwrap();

        // Expired state should not be returned
        let result = repo.consume_auth_state(state_id).await.unwrap();
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn test_get_auth_state_does_not_consume() {
        let repo = InMemorySsoRepository::new();

        let state = SsoAuthState::new(
            Uuid::new_v4(),
            Uuid::new_v4(),
            "verifier".into(),
            "nonce".into(),
            None,
            300,
        );
        let state_id = state.state_id;

        repo.store_auth_state(state).await.unwrap();

        let fetched = repo.get_auth_state(state_id).await.unwrap();
        assert!(fetched.is_some());

        let consumed = repo.consume_auth_state(state_id).await.unwrap();
        assert!(consumed.is_some());

        let missing = repo.get_auth_state(state_id).await.unwrap();
        assert!(missing.is_none());
    }
}
