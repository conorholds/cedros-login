//! Token gating service for Solana NFT / fungible token holdings checks.
//!
//! Fetches wallet holdings via Solana DAS API and validates against configured
//! rules. Holdings are cached per-wallet with a configurable TTL.
//!
//! # Settings keys consumed
//! - `token_gating_enabled` (bool) — master switch; all checks pass when false.
//! - `token_gating_rpc_url` (string) — Solana RPC endpoint supporting DAS API.
//! - `token_gating_rules` (string) — JSON array of `TokenGateRule`.
//! - `token_gating_cache_ttl_secs` (u64) — cache TTL per wallet (default 60 s).

use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};

use tokio::sync::RwLock;
use tracing::{debug, warn};
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{UserRepository, WalletMaterialRepository};
use crate::services::settings_service::SettingsService;

// ---------------------------------------------------------------------------
// Wire types — DAS getAssetsByOwner
// ---------------------------------------------------------------------------

#[derive(serde::Deserialize)]
struct DasResponse {
    result: Option<DasResult>,
}

#[derive(serde::Deserialize)]
struct DasResult {
    items: Vec<DasAsset>,
    total: Option<u32>,
}

#[derive(Debug, Clone, serde::Deserialize)]
struct DasAsset {
    #[allow(dead_code)]
    id: String,
    grouping: Option<Vec<DasGrouping>>,
}

#[derive(Debug, Clone, serde::Deserialize)]
struct DasGrouping {
    group_key: String,
    group_value: String,
}

// ---------------------------------------------------------------------------
// Wire types — getTokenAccountsByOwner
// ---------------------------------------------------------------------------

#[derive(serde::Deserialize)]
struct RpcResponse<T> {
    result: Option<T>,
}

#[derive(serde::Deserialize)]
struct TokenAccountsResult {
    value: Vec<TokenAccountInfo>,
}

#[derive(serde::Deserialize)]
struct TokenAccountInfo {
    account: TokenAccountData,
}

#[derive(serde::Deserialize)]
struct TokenAccountData {
    data: TokenAccountParsed,
}

#[derive(serde::Deserialize)]
struct TokenAccountParsed {
    parsed: TokenAccountParsedInfo,
}

#[derive(serde::Deserialize)]
struct TokenAccountParsedInfo {
    info: TokenAccountDetails,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct TokenAccountDetails {
    mint: String,
    token_amount: TokenAmount,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct TokenAmount {
    amount: String,
    #[allow(dead_code)]
    ui_amount: Option<f64>,
}

// ---------------------------------------------------------------------------
// Public rule type
// ---------------------------------------------------------------------------

/// A single token gate rule.
///
/// Rules are stored as JSON in `token_gating_rules` system setting.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenGateRule {
    /// Unique identifier for the rule.
    pub id: String,
    /// Human-readable name shown in error messages.
    pub name: String,
    /// `"nft_collection"`, `"fungible_token"`, or `"any_nft"`.
    #[serde(rename = "type")]
    pub rule_type: String,
    /// NFT collection address (required for `nft_collection`).
    pub collection_address: Option<String>,
    /// Token mint address (required for `fungible_token`).
    pub mint_address: Option<String>,
    /// Minimum NFT quantity held (default 1 when absent).
    pub min_quantity: Option<u64>,
    /// Minimum raw token amount as string (for `fungible_token`).
    pub min_amount: Option<String>,
    /// Which actions this rule covers: `"all"`, `"deposits"`, `"withdrawals"`.
    pub enforcement: String,
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

struct WalletHoldingsCache {
    nfts: Vec<DasAsset>,
    /// mint address -> raw token amount (base units)
    token_balances: HashMap<String, u64>,
    fetched_at: Instant,
}

// ---------------------------------------------------------------------------
// Service constants
// ---------------------------------------------------------------------------

const HTTP_TIMEOUT_SECS: u64 = 15;
const DEFAULT_CACHE_TTL_SECS: u64 = 60;
const TOKEN_PROGRAM_ID: &str = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/// Token gating service — checks Solana wallet holdings against configured rules.
///
/// Cheaply cloneable via `Arc`. The `token_gating_enabled` flag is read on
/// every call so toggling it at runtime takes effect immediately.
pub struct TokenGatingService {
    client: reqwest::Client,
    cache: Arc<RwLock<HashMap<String, WalletHoldingsCache>>>,
    settings_service: Arc<SettingsService>,
    user_repo: Arc<dyn UserRepository>,
    wallet_material_repo: Arc<dyn WalletMaterialRepository>,
}

impl TokenGatingService {
    /// Create a new `TokenGatingService` with a 15 s HTTP timeout.
    pub fn new(
        settings_service: Arc<SettingsService>,
        user_repo: Arc<dyn UserRepository>,
        wallet_material_repo: Arc<dyn WalletMaterialRepository>,
    ) -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(HTTP_TIMEOUT_SECS))
            .build()
            .unwrap_or_else(|e| {
                tracing::error!(
                    error = %e,
                    "Failed to build HTTP client for TokenGatingService; using default"
                );
                reqwest::Client::new()
            });

        Self {
            client,
            cache: Arc::new(RwLock::new(HashMap::new())),
            settings_service,
            user_repo,
            wallet_material_repo,
        }
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /// Enforce token gate rules for `user_id` performing `action`.
    ///
    /// `action` should be one of `"deposits"` or `"withdrawals"`.
    ///
    /// # Errors
    /// - `Forbidden` if any matching rule fails.
    /// - `Forbidden` if token gating is enabled but the user has no wallet.
    pub async fn check_enforcement(&self, user_id: Uuid, action: &str) -> Result<(), AppError> {
        let enabled = self
            .settings_service
            .get_bool("token_gating_enabled")
            .await
            .ok()
            .flatten()
            .unwrap_or(false);

        if !enabled {
            return Ok(());
        }

        let rules = self.load_rules().await?;
        let applicable: Vec<&TokenGateRule> = rules
            .iter()
            .filter(|r| is_action_enforced(&r.enforcement, action))
            .collect();

        if applicable.is_empty() {
            return Ok(());
        }

        let wallet = self.resolve_wallet(user_id).await?;
        self.ensure_fresh_holdings(&wallet).await;

        let cache = self.cache.read().await;
        let entry = match cache.get(&wallet) {
            Some(e) => e,
            None => {
                // Cache still empty after fetch attempt (RPC failed) — fail-open
                warn!(
                    user_id = %user_id,
                    wallet = %wallet,
                    "Token gate cache empty after fetch; failing open"
                );
                return Ok(());
            }
        };

        for rule in applicable {
            if !evaluate_rule(rule, &entry.nfts, &entry.token_balances) {
                return Err(AppError::Forbidden(format!(
                    "Token gate requirement not met: {}",
                    rule.name
                )));
            }
        }

        Ok(())
    }

    /// Evaluate all active token gate rules for `user_id` and return whether
    /// the user passes them all.
    ///
    /// Returns `true` when no rules are configured, gating is disabled, or
    /// there is no wallet (fail-open on missing wallet for read-only status).
    /// RPC errors cause fail-open (returns `true`).
    pub async fn evaluate_all_rules(&self, user_id: Uuid) -> bool {
        let enabled = self
            .settings_service
            .get_bool("token_gating_enabled")
            .await
            .ok()
            .flatten()
            .unwrap_or(false);

        if !enabled {
            return true;
        }

        let rules = match self.load_rules().await {
            Ok(r) => r,
            Err(_) => return true,
        };

        if rules.is_empty() {
            return true;
        }

        let wallet = match self.resolve_wallet(user_id).await {
            Ok(w) => w,
            Err(_) => return true, // no wallet → fail-open for status reads
        };

        self.ensure_fresh_holdings(&wallet).await;

        let cache = self.cache.read().await;
        let entry = match cache.get(&wallet) {
            Some(e) => e,
            None => return true,
        };

        rules
            .iter()
            .all(|r| evaluate_rule(r, &entry.nfts, &entry.token_balances))
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /// Parse `token_gating_rules` from settings into `Vec<TokenGateRule>`.
    async fn load_rules(&self) -> Result<Vec<TokenGateRule>, AppError> {
        let raw = self
            .settings_service
            .get("token_gating_rules")
            .await?
            .unwrap_or_default();

        if raw.is_empty() || raw == "[]" {
            return Ok(vec![]);
        }

        serde_json::from_str::<Vec<TokenGateRule>>(&raw)
            .map_err(|e| AppError::Config(format!("Invalid token_gating_rules JSON: {}", e)))
    }

    /// Resolve the Solana wallet address for `user_id`.
    ///
    /// Priority: embedded wallet (WalletMaterial) → user.wallet_address.
    async fn resolve_wallet(&self, user_id: Uuid) -> Result<String, AppError> {
        // Try embedded wallet first
        if let Ok(Some(material)) = self
            .wallet_material_repo
            .find_default_by_user(user_id)
            .await
        {
            if !material.solana_pubkey.is_empty() {
                return Ok(material.solana_pubkey);
            }
        }

        // Fall back to user's linked external wallet
        let user = self
            .user_repo
            .find_by_id(user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        user.wallet_address
            .ok_or_else(|| AppError::Forbidden("Wallet required for token-gated access".into()))
    }

    /// Ensure the holdings cache for `wallet` is fresh, refreshing if stale.
    ///
    /// On error: logs a warning and keeps stale cache (fail-open).
    async fn ensure_fresh_holdings(&self, wallet: &str) {
        let ttl_secs = self
            .settings_service
            .get_u64("token_gating_cache_ttl_secs")
            .await
            .ok()
            .flatten()
            .unwrap_or(DEFAULT_CACHE_TTL_SECS);

        let is_stale = {
            let cache = self.cache.read().await;
            match cache.get(wallet) {
                Some(entry) => entry.fetched_at.elapsed() >= Duration::from_secs(ttl_secs),
                None => true,
            }
        };

        if !is_stale {
            return;
        }

        let rpc_url = self
            .settings_service
            .get("token_gating_rpc_url")
            .await
            .ok()
            .flatten()
            .unwrap_or_default();

        if rpc_url.is_empty() {
            warn!("token_gating_rpc_url not configured; skipping holdings fetch");
            return;
        }

        match self.fetch_holdings(&rpc_url, wallet).await {
            Ok(holdings) => {
                let mut cache = self.cache.write().await;
                cache.insert(wallet.to_string(), holdings);
                debug!(wallet = %wallet, "Token gate holdings refreshed");
            }
            Err(e) => {
                warn!(
                    error = %e,
                    wallet = %wallet,
                    "Failed to fetch token gate holdings; keeping stale cache"
                );
            }
        }
    }

    /// Fetch NFT and token holdings from the Solana RPC/DAS endpoint.
    async fn fetch_holdings(
        &self,
        rpc_url: &str,
        wallet: &str,
    ) -> Result<WalletHoldingsCache, AppError> {
        let nfts = self.fetch_nfts(rpc_url, wallet).await?;
        let token_balances = self.fetch_token_balances(rpc_url, wallet).await?;

        Ok(WalletHoldingsCache {
            nfts,
            token_balances,
            fetched_at: Instant::now(),
        })
    }

    /// Fetch all NFTs owned by `wallet` via DAS `getAssetsByOwner`.
    ///
    /// Paginates automatically until all assets are fetched or the
    /// safety cap (10 000 assets) is reached.
    async fn fetch_nfts(&self, rpc_url: &str, wallet: &str) -> Result<Vec<DasAsset>, AppError> {
        const PAGE_SIZE: u32 = 1000;
        const MAX_ASSETS: usize = 10_000;

        let mut all_items: Vec<DasAsset> = Vec::new();
        let mut page: u32 = 1;

        loop {
            let body = serde_json::json!({
                "jsonrpc": "2.0",
                "id": "das",
                "method": "getAssetsByOwner",
                "params": {
                    "ownerAddress": wallet,
                    "page": page,
                    "limit": PAGE_SIZE
                }
            });

            let resp = self
                .client
                .post(rpc_url)
                .json(&body)
                .send()
                .await
                .map_err(|e| {
                    AppError::Internal(anyhow::anyhow!("DAS getAssetsByOwner failed: {}", e))
                })?;

            if !resp.status().is_success() {
                return Err(AppError::Internal(anyhow::anyhow!(
                    "DAS getAssetsByOwner returned status {}",
                    resp.status()
                )));
            }

            let parsed: DasResponse = resp.json().await.map_err(|e| {
                AppError::Internal(anyhow::anyhow!("Failed to parse DAS response: {}", e))
            })?;

            let result = match parsed.result {
                Some(r) => r,
                None => break,
            };

            let page_count = result.items.len();
            all_items.extend(result.items);

            // Stop if: last page was incomplete, hit safety cap, or no total info
            if (page_count as u32) < PAGE_SIZE
                || all_items.len() >= MAX_ASSETS
                || result
                    .total
                    .map(|t| all_items.len() >= t as usize)
                    .unwrap_or(false)
            {
                break;
            }

            page += 1;
        }

        if all_items.len() >= MAX_ASSETS {
            tracing::warn!(
                wallet,
                fetched = all_items.len(),
                "Token gating: hit NFT fetch safety cap"
            );
        }

        Ok(all_items)
    }

    async fn fetch_token_balances(
        &self,
        rpc_url: &str,
        wallet: &str,
    ) -> Result<HashMap<String, u64>, AppError> {
        let body = serde_json::json!({
            "jsonrpc": "2.0",
            "id": "tok",
            "method": "getTokenAccountsByOwner",
            "params": [
                wallet,
                { "programId": TOKEN_PROGRAM_ID },
                { "encoding": "jsonParsed" }
            ]
        });

        let resp = self
            .client
            .post(rpc_url)
            .json(&body)
            .send()
            .await
            .map_err(|e| {
                AppError::Internal(anyhow::anyhow!("getTokenAccountsByOwner failed: {}", e))
            })?;

        if !resp.status().is_success() {
            return Err(AppError::Internal(anyhow::anyhow!(
                "getTokenAccountsByOwner returned status {}",
                resp.status()
            )));
        }

        let parsed: RpcResponse<TokenAccountsResult> = resp.json().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!(
                "Failed to parse token accounts response: {}",
                e
            ))
        })?;

        let mut balances: HashMap<String, u64> = HashMap::new();
        if let Some(result) = parsed.result {
            for account in result.value {
                let details = account.account.data.parsed.info;
                if let Ok(amount) = details.token_amount.amount.parse::<u64>() {
                    // Accumulate in case of multiple accounts for same mint
                    *balances.entry(details.mint).or_insert(0) += amount;
                }
            }
        }

        Ok(balances)
    }
}

// ---------------------------------------------------------------------------
// Pure functions
// ---------------------------------------------------------------------------

/// Evaluate a single gate rule against cached holdings.
///
/// Returns `true` if the user's holdings satisfy the rule.
fn evaluate_rule(rule: &TokenGateRule, nfts: &[DasAsset], tokens: &HashMap<String, u64>) -> bool {
    match rule.rule_type.as_str() {
        "nft_collection" => {
            let collection = match rule.collection_address.as_deref() {
                Some(c) if !c.is_empty() => c,
                _ => return false,
            };
            let min = rule.min_quantity.unwrap_or(1);
            let count = nfts
                .iter()
                .filter(|asset| {
                    asset
                        .grouping
                        .as_deref()
                        .unwrap_or(&[])
                        .iter()
                        .any(|g| g.group_key == "collection" && g.group_value == collection)
                })
                .count() as u64;
            count >= min
        }
        "fungible_token" => {
            let mint = match rule.mint_address.as_deref() {
                Some(m) if !m.is_empty() => m,
                _ => return false,
            };
            let min: u64 = rule
                .min_amount
                .as_deref()
                .and_then(|s| s.parse().ok())
                .unwrap_or(1);
            let balance = tokens.get(mint).copied().unwrap_or(0);
            balance >= min
        }
        "any_nft" => {
            let min = rule.min_quantity.unwrap_or(1);
            (nfts.len() as u64) >= min
        }
        _ => false,
    }
}

/// Returns `true` if `action` is subject to the rule's enforcement setting.
fn is_action_enforced(enforcement: &str, action: &str) -> bool {
    match enforcement {
        "all" => true,
        "deposits" => action == "deposits",
        "withdrawals" => action == "withdrawals",
        _ => false,
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    fn make_nft(collection: &str) -> DasAsset {
        DasAsset {
            id: "mint1".into(),
            grouping: Some(vec![DasGrouping {
                group_key: "collection".into(),
                group_value: collection.into(),
            }]),
        }
    }

    fn make_nft_no_collection() -> DasAsset {
        DasAsset {
            id: "mint_no_col".into(),
            grouping: None,
        }
    }

    fn empty_tokens() -> HashMap<String, u64> {
        HashMap::new()
    }

    // ---- nft_collection rules -----------------------------------------------

    #[test]
    fn nft_collection_passes_when_matching_nft_held() {
        let rule = TokenGateRule {
            id: "r1".into(),
            name: "My Collection Gate".into(),
            rule_type: "nft_collection".into(),
            collection_address: Some("CollectionAAA".into()),
            mint_address: None,
            min_quantity: None,
            min_amount: None,
            enforcement: "all".into(),
        };
        let nfts = vec![make_nft("CollectionAAA")];
        assert!(evaluate_rule(&rule, &nfts, &empty_tokens()));
    }

    #[test]
    fn nft_collection_fails_when_no_matching_nft() {
        let rule = TokenGateRule {
            id: "r1".into(),
            name: "My Collection Gate".into(),
            rule_type: "nft_collection".into(),
            collection_address: Some("CollectionAAA".into()),
            mint_address: None,
            min_quantity: None,
            min_amount: None,
            enforcement: "all".into(),
        };
        let nfts = vec![make_nft("DifferentCollection")];
        assert!(!evaluate_rule(&rule, &nfts, &empty_tokens()));
    }

    #[test]
    fn nft_collection_fails_when_below_min_quantity() {
        let rule = TokenGateRule {
            id: "r1".into(),
            name: "Need 3 NFTs".into(),
            rule_type: "nft_collection".into(),
            collection_address: Some("CollectionAAA".into()),
            mint_address: None,
            min_quantity: Some(3),
            min_amount: None,
            enforcement: "all".into(),
        };
        // Only 2 NFTs from that collection
        let nfts = vec![make_nft("CollectionAAA"), make_nft("CollectionAAA")];
        assert!(!evaluate_rule(&rule, &nfts, &empty_tokens()));
    }

    #[test]
    fn nft_collection_passes_at_exact_min_quantity() {
        let rule = TokenGateRule {
            id: "r1".into(),
            name: "Need 2 NFTs".into(),
            rule_type: "nft_collection".into(),
            collection_address: Some("CollectionAAA".into()),
            mint_address: None,
            min_quantity: Some(2),
            min_amount: None,
            enforcement: "all".into(),
        };
        let nfts = vec![make_nft("CollectionAAA"), make_nft("CollectionAAA")];
        assert!(evaluate_rule(&rule, &nfts, &empty_tokens()));
    }

    // ---- fungible_token rules -----------------------------------------------

    #[test]
    fn fungible_token_passes_when_sufficient_balance() {
        let rule = TokenGateRule {
            id: "r2".into(),
            name: "Hold 100 tokens".into(),
            rule_type: "fungible_token".into(),
            collection_address: None,
            mint_address: Some("MintXXX".into()),
            min_quantity: None,
            min_amount: Some("100".into()),
            enforcement: "all".into(),
        };
        let mut tokens = HashMap::new();
        tokens.insert("MintXXX".into(), 200u64);
        assert!(evaluate_rule(&rule, &[], &tokens));
    }

    #[test]
    fn fungible_token_fails_when_insufficient_balance() {
        let rule = TokenGateRule {
            id: "r2".into(),
            name: "Hold 100 tokens".into(),
            rule_type: "fungible_token".into(),
            collection_address: None,
            mint_address: Some("MintXXX".into()),
            min_quantity: None,
            min_amount: Some("100".into()),
            enforcement: "all".into(),
        };
        let mut tokens = HashMap::new();
        tokens.insert("MintXXX".into(), 50u64);
        assert!(!evaluate_rule(&rule, &[], &tokens));
    }

    #[test]
    fn fungible_token_fails_when_wrong_mint() {
        let rule = TokenGateRule {
            id: "r2".into(),
            name: "Hold 100 tokens".into(),
            rule_type: "fungible_token".into(),
            collection_address: None,
            mint_address: Some("MintXXX".into()),
            min_quantity: None,
            min_amount: Some("1".into()),
            enforcement: "all".into(),
        };
        let mut tokens = HashMap::new();
        tokens.insert("OtherMint".into(), 1000u64);
        assert!(!evaluate_rule(&rule, &[], &tokens));
    }

    // ---- any_nft rules -----------------------------------------------

    #[test]
    fn any_nft_passes_when_nfts_held() {
        let rule = TokenGateRule {
            id: "r3".into(),
            name: "Hold any NFT".into(),
            rule_type: "any_nft".into(),
            collection_address: None,
            mint_address: None,
            min_quantity: Some(1),
            min_amount: None,
            enforcement: "all".into(),
        };
        let nfts = vec![make_nft_no_collection()];
        assert!(evaluate_rule(&rule, &nfts, &empty_tokens()));
    }

    #[test]
    fn any_nft_fails_when_no_nfts() {
        let rule = TokenGateRule {
            id: "r3".into(),
            name: "Hold any NFT".into(),
            rule_type: "any_nft".into(),
            collection_address: None,
            mint_address: None,
            min_quantity: None,
            min_amount: None,
            enforcement: "all".into(),
        };
        assert!(!evaluate_rule(&rule, &[], &empty_tokens()));
    }

    // ---- is_action_enforced -----------------------------------------------

    #[test]
    fn action_enforced_all_matches_any_action() {
        assert!(is_action_enforced("all", "deposits"));
        assert!(is_action_enforced("all", "withdrawals"));
        assert!(is_action_enforced("all", "anything"));
    }

    #[test]
    fn action_enforced_deposits_only() {
        assert!(is_action_enforced("deposits", "deposits"));
        assert!(!is_action_enforced("deposits", "withdrawals"));
    }

    #[test]
    fn action_enforced_withdrawals_only() {
        assert!(is_action_enforced("withdrawals", "withdrawals"));
        assert!(!is_action_enforced("withdrawals", "deposits"));
    }

    #[test]
    fn unknown_enforcement_never_enforced() {
        assert!(!is_action_enforced("none", "deposits"));
        assert!(!is_action_enforced("", "withdrawals"));
        assert!(!is_action_enforced("unknown", "deposits"));
    }
}
