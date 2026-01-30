//! Secure in-memory cache for wallet unlock keys
//!
//! Stores derived encryption keys for unlocked wallet sessions.
//! Keys persist for the lifetime of the login session (no separate TTL).
//!
//! ## Security Model
//!
//! - Keys are stored in-memory only (never persisted)
//! - Session-bound: cleared on logout or session invalidation
//! - Keys are zeroized on eviction or lock
//! - LRU eviction prevents unbounded memory growth
//! - Session validity is enforced by auth middleware (not this cache)
//! - Rate limiting should be applied at the handler level
//!
//! ## SERVICE-001: Thread Safety
//!
//! All operations use `RwLock` for thread-safe access:
//! - `get`: Acquires write lock (updates last_accessed for LRU)
//! - `is_unlocked`: Acquires read lock (no mutation)
//! - `insert`/`remove`/`clear`: Acquire write lock
//! - Eviction is performed atomically within the write lock
//!
//! Race conditions are prevented by the lock semantics.
//!
//! ## PERF-03/PERF-06: Write-lock on get()
//!
//! The `get()` method uses a write lock because LRU requires updating
//! `last_accessed` on every access. This is a deliberate trade-off:
//!
//! **Alternatives considered:**
//! - Lock-free LRU: Significantly more complex, requires atomic counters
//! - RwLock upgrade: Tokio's RwLock doesn't support upgrade
//! - Probabilistic LRU: Acceptable for caches, but less predictable eviction
//!
//! **Why current approach is acceptable:**
//! - Cache operations are fast (HashMap lookup + timestamp update)
//! - Contention is low (each session hits its own key)
//! - Use `is_unlocked()` for read-only checks (uses read lock)

use std::collections::HashMap;
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::RwLock;
use uuid::Uuid;
use zeroize::Zeroize;

/// Default maximum entries (prevents memory exhaustion)
const DEFAULT_MAX_ENTRIES: usize = 10_000;

/// Cached encryption key
///
/// Key is securely zeroized on drop via manual Drop impl.
struct CachedKey {
    /// Derived encryption key (32 bytes)
    key: [u8; 32],
    /// When this entry was created/last accessed (for LRU eviction)
    last_accessed: Instant,
}

impl CachedKey {
    fn new(key: [u8; 32]) -> Self {
        Self {
            key,
            last_accessed: Instant::now(),
        }
    }

    fn touch(&mut self) {
        self.last_accessed = Instant::now();
    }
}

impl Drop for CachedKey {
    fn drop(&mut self) {
        self.key.zeroize();
    }
}

/// Configuration for the wallet unlock cache
#[derive(Debug, Clone)]
pub struct WalletUnlockCacheConfig {
    /// Maximum number of cached entries (prevents memory exhaustion)
    pub max_entries: usize,
}

impl Default for WalletUnlockCacheConfig {
    fn default() -> Self {
        Self {
            max_entries: DEFAULT_MAX_ENTRIES,
        }
    }
}

/// Secure in-memory cache for wallet unlock keys
///
/// Keys persist for the session lifetime - no automatic expiration.
/// Session validity is enforced by auth middleware before wallet operations.
pub struct WalletUnlockCache {
    /// Cached keys keyed by session_id
    entries: RwLock<HashMap<Uuid, CachedKey>>,
    /// Configuration
    config: WalletUnlockCacheConfig,
}

impl WalletUnlockCache {
    /// Create a new cache with default configuration
    pub fn new() -> Self {
        Self::with_config(WalletUnlockCacheConfig::default())
    }

    /// Create a new cache with custom configuration
    pub fn with_config(config: WalletUnlockCacheConfig) -> Self {
        Self {
            entries: RwLock::new(HashMap::new()),
            config,
        }
    }

    /// Store an unlock key for a session
    ///
    /// If the cache is at capacity, the least recently used entry is evicted.
    pub async fn store(&self, session_id: Uuid, key: [u8; 32]) {
        let mut entries = self.entries.write().await;

        // SVC-LRU: Only evict if this is a NEW entry that would exceed capacity.
        // If session_id already exists, insert() replaces it (no size change).
        // Without this check, we'd evict an entry unnecessarily on updates.
        let is_new_entry = !entries.contains_key(&session_id);
        if is_new_entry && entries.len() >= self.config.max_entries {
            if let Some(lru_id) = entries
                .iter()
                .min_by_key(|(_, v)| v.last_accessed)
                .map(|(k, _)| *k)
            {
                entries.remove(&lru_id);
            }
        }

        entries.insert(session_id, CachedKey::new(key));
    }

    /// Get the unlock key for a session (if exists)
    ///
    /// Updates last_accessed time for LRU tracking.
    /// Returns a copy of the key. Caller is responsible for zeroizing after use.
    pub async fn get(&self, session_id: Uuid) -> Option<[u8; 32]> {
        let mut entries = self.entries.write().await;

        entries.get_mut(&session_id).map(|entry| {
            entry.touch();
            entry.key
        })
    }

    /// Check if a session has an unlock key cached
    pub async fn is_unlocked(&self, session_id: Uuid) -> bool {
        self.entries.read().await.contains_key(&session_id)
    }

    /// Remove and securely wipe the unlock key for a session
    pub async fn remove(&self, session_id: Uuid) {
        let mut entries = self.entries.write().await;
        // CachedKey's Drop impl zeroizes the key
        entries.remove(&session_id);
    }

    /// Remove and securely wipe all unlock keys for given sessions
    ///
    /// Used when invalidating multiple sessions (e.g., logout from all devices)
    pub async fn remove_all_for_sessions(&self, session_ids: &[Uuid]) {
        let mut entries = self.entries.write().await;
        for session_id in session_ids {
            entries.remove(session_id);
        }
    }

    /// Get the number of cached entries (for metrics)
    pub async fn len(&self) -> usize {
        self.entries.read().await.len()
    }

    /// Check if cache is empty
    pub async fn is_empty(&self) -> bool {
        self.entries.read().await.is_empty()
    }
}

impl Default for WalletUnlockCache {
    fn default() -> Self {
        Self::new()
    }
}

/// Create a shared cache instance
pub fn create_wallet_unlock_cache() -> Arc<WalletUnlockCache> {
    Arc::new(WalletUnlockCache::new())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_store_and_get() {
        let cache = WalletUnlockCache::new();
        let session_id = Uuid::new_v4();
        let key = [0x42u8; 32];

        cache.store(session_id, key).await;

        let retrieved = cache.get(session_id).await;
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap(), key);
    }

    #[tokio::test]
    async fn test_is_unlocked() {
        let cache = WalletUnlockCache::new();
        let session_id = Uuid::new_v4();
        let key = [0x42u8; 32];

        assert!(!cache.is_unlocked(session_id).await);

        cache.store(session_id, key).await;

        assert!(cache.is_unlocked(session_id).await);
    }

    #[tokio::test]
    async fn test_remove() {
        let cache = WalletUnlockCache::new();
        let session_id = Uuid::new_v4();
        let key = [0x42u8; 32];

        cache.store(session_id, key).await;
        assert!(cache.is_unlocked(session_id).await);

        cache.remove(session_id).await;
        assert!(!cache.is_unlocked(session_id).await);
    }

    #[tokio::test]
    async fn test_persists_without_expiration() {
        let cache = WalletUnlockCache::new();
        let session_id = Uuid::new_v4();
        let key = [0x42u8; 32];

        cache.store(session_id, key).await;
        assert!(cache.is_unlocked(session_id).await);

        // Wait some time - should still be unlocked (no TTL)
        tokio::time::sleep(std::time::Duration::from_millis(50)).await;

        assert!(cache.is_unlocked(session_id).await);
        assert!(cache.get(session_id).await.is_some());
    }

    #[tokio::test]
    async fn test_lru_eviction() {
        let config = WalletUnlockCacheConfig { max_entries: 3 };
        let cache = WalletUnlockCache::with_config(config);

        let session1 = Uuid::new_v4();
        let session2 = Uuid::new_v4();
        let session3 = Uuid::new_v4();
        let session4 = Uuid::new_v4();

        cache.store(session1, [1u8; 32]).await;
        tokio::time::sleep(std::time::Duration::from_millis(1)).await;
        cache.store(session2, [2u8; 32]).await;
        tokio::time::sleep(std::time::Duration::from_millis(1)).await;
        cache.store(session3, [3u8; 32]).await;

        assert_eq!(cache.len().await, 3);

        // Access session1 to make it recently used
        cache.get(session1).await;
        tokio::time::sleep(std::time::Duration::from_millis(1)).await;

        // Adding 4th should evict session2 (least recently used)
        cache.store(session4, [4u8; 32]).await;

        assert_eq!(cache.len().await, 3);
        assert!(cache.is_unlocked(session1).await); // Was accessed, kept
        assert!(!cache.is_unlocked(session2).await); // LRU, evicted
        assert!(cache.is_unlocked(session3).await); // Kept
        assert!(cache.is_unlocked(session4).await); // Just added
    }

    #[tokio::test]
    async fn test_remove_all_for_sessions() {
        let cache = WalletUnlockCache::new();
        let sessions: Vec<Uuid> = (0..3).map(|_| Uuid::new_v4()).collect();
        let other_session = Uuid::new_v4();

        for session_id in &sessions {
            cache.store(*session_id, [0u8; 32]).await;
        }
        cache.store(other_session, [0u8; 32]).await;

        assert_eq!(cache.len().await, 4);

        cache.remove_all_for_sessions(&sessions).await;

        assert_eq!(cache.len().await, 1);
        assert!(cache.is_unlocked(other_session).await);
    }

    /// SVC-LRU: Verify that updating an existing entry doesn't trigger eviction
    #[tokio::test]
    async fn test_update_existing_entry_no_eviction() {
        let config = WalletUnlockCacheConfig { max_entries: 3 };
        let cache = WalletUnlockCache::with_config(config);

        let session1 = Uuid::new_v4();
        let session2 = Uuid::new_v4();
        let session3 = Uuid::new_v4();

        // Fill cache to capacity
        cache.store(session1, [1u8; 32]).await;
        tokio::time::sleep(std::time::Duration::from_millis(1)).await;
        cache.store(session2, [2u8; 32]).await;
        tokio::time::sleep(std::time::Duration::from_millis(1)).await;
        cache.store(session3, [3u8; 32]).await;

        assert_eq!(cache.len().await, 3);

        // Update session1 (oldest entry) - should NOT evict anything
        cache.store(session1, [11u8; 32]).await;

        // All entries should still exist
        assert_eq!(cache.len().await, 3);
        assert!(cache.is_unlocked(session1).await);
        assert!(cache.is_unlocked(session2).await);
        assert!(cache.is_unlocked(session3).await);

        // Verify the key was actually updated
        let key = cache.get(session1).await.unwrap();
        assert_eq!(key, [11u8; 32]);
    }
}
