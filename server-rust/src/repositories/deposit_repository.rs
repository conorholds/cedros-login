//! Deposit session repository trait and implementations

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Deposit session status
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DepositStatus {
    /// Session created, awaiting processing
    Pending,
    /// Deposit transaction detected on chain
    Detected,
    /// Privacy Cash transaction in flight
    Processing,
    /// Credits issued, waiting for privacy period to elapse
    Completed,
    /// Some funds withdrawn, awaiting next withdrawal cycle
    PartiallyWithdrawn,
    /// Withdrawal to company wallet completed (fully withdrawn)
    Withdrawn,
    /// TTL elapsed without completion
    Expired,
    /// Error occurred
    Failed,
    /// Micro deposit awaiting batch swap (SOL accumulated in treasury)
    PendingBatch,
    /// Micro deposit included in a completed batch swap
    Batched,
}

impl DepositStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Detected => "detected",
            Self::Processing => "processing",
            Self::Completed => "completed",
            Self::PartiallyWithdrawn => "partially_withdrawn",
            Self::Withdrawn => "withdrawn",
            Self::Expired => "expired",
            Self::Failed => "failed",
            Self::PendingBatch => "pending_batch",
            Self::Batched => "batched",
        }
    }

    fn parse(s: &str) -> Option<Self> {
        match s {
            "pending" => Some(Self::Pending),
            "detected" => Some(Self::Detected),
            "processing" => Some(Self::Processing),
            "completed" => Some(Self::Completed),
            "partially_withdrawn" => Some(Self::PartiallyWithdrawn),
            "withdrawn" => Some(Self::Withdrawn),
            "expired" => Some(Self::Expired),
            "failed" => Some(Self::Failed),
            "pending_batch" => Some(Self::PendingBatch),
            "batched" => Some(Self::Batched),
            _ => None,
        }
    }
}

impl std::str::FromStr for DepositStatus {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s).ok_or(())
    }
}

/// Wallet type for deposit
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WalletType {
    Embedded,
    External,
}

impl WalletType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Embedded => "embedded",
            Self::External => "external",
        }
    }

    fn parse(s: &str) -> Option<Self> {
        match s {
            "embedded" => Some(Self::Embedded),
            "external" => Some(Self::External),
            _ => None,
        }
    }
}

impl std::str::FromStr for WalletType {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s).ok_or(())
    }
}

/// Deposit type for tiered deposits
///
/// Determines which deposit flow was used:
/// - Private: Privacy Cash sidecar (>=0.25 SOL, ~1% fees)
/// - Public: Jupiter swap to company wallet ($10+, ~0.3% fees)
/// - SolMicro: Direct SOL transfer (<$10, tx fees only)
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DepositType {
    /// Private deposit via Privacy Cash (>=0.25 SOL)
    Private,
    /// Public deposit via Jupiter swap ($10+)
    Public,
    /// Direct SOL micro deposit (<$10)
    SolMicro,
}

impl DepositType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Private => "private",
            Self::Public => "public",
            Self::SolMicro => "sol_micro",
        }
    }

    fn parse(s: &str) -> Option<Self> {
        match s {
            "private" => Some(Self::Private),
            "public" => Some(Self::Public),
            "sol_micro" => Some(Self::SolMicro),
            _ => None,
        }
    }
}

impl std::str::FromStr for DepositType {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s).ok_or(())
    }
}

/// Deposit session entity
#[derive(Debug, Clone)]
pub struct DepositSessionEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    pub session_id: Uuid,
    pub wallet_address: String,
    pub wallet_type: WalletType,
    pub deposit_type: DepositType,
    pub currency: String,
    pub unlock_expires_at: Option<DateTime<Utc>>,
    pub status: DepositStatus,
    pub detected_amount_lamports: Option<i64>,
    pub detected_tx_signature: Option<String>,
    pub detected_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub error_message: Option<String>,
    pub expected_message_hash: Option<String>,
    pub expected_message_bytes: Option<Vec<u8>>,
    pub privacy_deposit_tx_signature: Option<String>,
    pub deposit_amount_lamports: Option<i64>,
    pub fee_buffer_lamports: Option<i64>,
    pub tx_expires_at: Option<DateTime<Utc>>,
    pub processing_attempts: i32,
    pub last_processing_error: Option<String>,
    pub last_processing_attempt_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    /// Associated privacy note ID (set after note is created)
    pub privacy_note_id: Option<Uuid>,
    /// Encrypted private key (stored during privacy period for withdrawal)
    /// Format: base64(nonce || ciphertext) using AES-256-GCM
    pub stored_share_b: Option<String>, // Field name kept for DB compatibility
    /// When withdrawal becomes available (after privacy period)
    pub withdrawal_available_at: Option<DateTime<Utc>>,
    /// Withdrawal transaction signature (after withdrawal to company wallet)
    pub withdrawal_tx_signature: Option<String>,
    /// Input token mint address (for SPL token deposits)
    /// If None, the deposit was native SOL
    pub input_token_mint: Option<String>,
    /// Input token amount (in token's smallest unit)
    /// For tracking original deposit value before swap to SOL
    pub input_token_amount: Option<i64>,
    /// Cumulative amount already withdrawn (for partial withdrawal support)
    /// When withdrawn_amount_lamports >= deposit_amount_lamports, session is fully withdrawn
    pub withdrawn_amount_lamports: i64,
    /// Batch ID for micro deposits that were batched together
    pub batch_id: Option<Uuid>,
    /// When the micro deposit was included in a batch swap
    pub batched_at: Option<DateTime<Utc>>,
}

impl DepositSessionEntity {
    /// Create a new privacy deposit session for an SSS embedded wallet
    ///
    /// This is the primary constructor for the SSS-only Privacy Cash flow.
    /// Stores encrypted private key for later withdrawal to company wallet.
    pub fn new_privacy_deposit(
        user_id: Uuid,
        session_id: Uuid,
        wallet_address: String,
        amount_lamports: i64,
        tx_signature: String,
        stored_share_b: String,
        withdrawal_available_at: DateTime<Utc>,
    ) -> Self {
        Self {
            id: session_id, // Use provided session ID
            user_id,
            session_id,
            wallet_address,
            wallet_type: WalletType::Embedded,
            deposit_type: DepositType::Private,
            currency: "SOL".to_string(),
            unlock_expires_at: None,
            status: DepositStatus::Completed, // Already completed on chain
            detected_amount_lamports: None,
            detected_tx_signature: None,
            detected_at: None,
            completed_at: Some(Utc::now()),
            error_message: None,
            expected_message_hash: None,
            expected_message_bytes: None,
            privacy_deposit_tx_signature: Some(tx_signature),
            deposit_amount_lamports: Some(amount_lamports),
            fee_buffer_lamports: None,
            tx_expires_at: None,
            processing_attempts: 0,
            last_processing_error: None,
            last_processing_attempt_at: None,
            created_at: Utc::now(),
            privacy_note_id: None,
            stored_share_b: Some(stored_share_b),
            withdrawal_available_at: Some(withdrawal_available_at),
            withdrawal_tx_signature: None,
            input_token_mint: None,
            input_token_amount: None,
            withdrawn_amount_lamports: 0,
            batch_id: None,
            batched_at: None,
        }
    }

    /// Calculate remaining amount to withdraw
    pub fn remaining_lamports(&self) -> i64 {
        self.deposit_amount_lamports
            .unwrap_or(0)
            .saturating_sub(self.withdrawn_amount_lamports)
    }

    /// Check if this session is fully withdrawn
    pub fn is_fully_withdrawn(&self) -> bool {
        self.remaining_lamports() <= 0
    }
}

/// Deposit session repository trait
#[async_trait]
pub trait DepositRepository: Send + Sync {
    /// Create a new deposit session
    async fn create(&self, session: DepositSessionEntity)
        -> Result<DepositSessionEntity, AppError>;

    /// Find deposit session by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<DepositSessionEntity>, AppError>;

    /// Find pending sessions for a user
    async fn find_by_user_pending(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<DepositSessionEntity>, AppError>;

    /// Find session by wallet address and pending status
    async fn find_pending_by_wallet(
        &self,
        wallet_address: &str,
    ) -> Result<Option<DepositSessionEntity>, AppError>;

    /// Find a SOL micro deposit by its detected transaction signature.
    ///
    /// Used for idempotency and replay protection when clients submit tx signatures.
    async fn find_micro_by_tx_signature(
        &self,
        tx_signature: &str,
    ) -> Result<Option<DepositSessionEntity>, AppError>;

    /// Update session status
    async fn update_status(
        &self,
        id: Uuid,
        status: DepositStatus,
        error_message: Option<String>,
    ) -> Result<(), AppError>;

    /// Update session with detected deposit info
    async fn update_detected(
        &self,
        id: Uuid,
        amount_lamports: i64,
        tx_signature: &str,
    ) -> Result<(), AppError>;

    /// Set the expected message hash for transaction validation
    async fn set_message_hash(
        &self,
        id: Uuid,
        hash: &str,
        message_bytes: Option<&[u8]>,
        tx_expires_at: Option<DateTime<Utc>>,
    ) -> Result<(), AppError>;

    /// Set the associated privacy note ID
    async fn set_privacy_note_id(&self, id: Uuid, note_id: Uuid) -> Result<(), AppError>;

    /// Set the deposit amount (used for embedded wallet flow before signing)
    async fn set_deposit_amount(&self, id: Uuid, amount_lamports: i64) -> Result<(), AppError>;

    /// Mark session as completed with deposit details
    async fn complete(
        &self,
        id: Uuid,
        tx_signature: &str,
        deposit_amount_lamports: i64,
    ) -> Result<(), AppError>;

    /// Increment processing attempts and record error
    async fn record_processing_attempt(
        &self,
        id: Uuid,
        error: Option<&str>,
    ) -> Result<(), AppError>;

    /// List sessions for a user with pagination
    async fn list_by_user(
        &self,
        user_id: Uuid,
        statuses: Option<&[DepositStatus]>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError>;

    /// Delete a pending session (only if status is pending and no SOL detected)
    async fn delete_pending(&self, id: Uuid, user_id: Uuid) -> Result<(), AppError>;

    /// Find completed deposits ready for withdrawal (privacy period elapsed)
    async fn find_ready_for_withdrawal(
        &self,
        now: DateTime<Utc>,
    ) -> Result<Vec<DepositSessionEntity>, AppError>;

    /// List deposits ready for withdrawal with pagination
    async fn list_ready_for_withdrawal(
        &self,
        now: DateTime<Utc>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError>;

    /// Count deposits ready for withdrawal
    async fn count_ready_for_withdrawal(&self, now: DateTime<Utc>) -> Result<u64, AppError>;

    /// Atomically claim deposits ready for withdrawal to prevent double-processing
    async fn claim_ready_for_withdrawal(
        &self,
        now: DateTime<Utc>,
        limit: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError>;

    /// Mark a deposit as withdrawn with the withdrawal transaction signature
    async fn mark_withdrawn(&self, id: Uuid, withdrawal_tx_signature: &str)
        -> Result<(), AppError>;

    /// Record a partial withdrawal (increments withdrawn_amount_lamports)
    /// If the withdrawal completes the session (remaining = 0), marks as Withdrawn
    async fn record_partial_withdrawal(
        &self,
        id: Uuid,
        amount_withdrawn: i64,
        tx_signature: &str,
    ) -> Result<bool, AppError>; // Returns true if fully withdrawn

    /// Count deposits for a user (for pagination)
    async fn count_by_user(
        &self,
        user_id: Uuid,
        statuses: Option<&[DepositStatus]>,
    ) -> Result<u64, AppError>;

    // ==================== Admin Methods ====================

    /// List all deposits with pagination and optional status filter (admin)
    async fn list_all(
        &self,
        statuses: Option<&[DepositStatus]>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError>;

    /// Count all deposits with optional status filter (admin)
    async fn count_all(&self, statuses: Option<&[DepositStatus]>) -> Result<u64, AppError>;

    /// Get aggregate deposit statistics (admin)
    async fn get_stats(&self) -> Result<DepositStats, AppError>;

    /// Find deposits still in privacy period (completed but not yet ready for withdrawal)
    async fn find_in_privacy_period(
        &self,
        now: DateTime<Utc>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError>;

    /// Count deposits in privacy period
    async fn count_in_privacy_period(&self, now: DateTime<Utc>) -> Result<u64, AppError>;

    // ==================== Micro Batch Methods ====================

    /// Get all micro deposits with PendingBatch status
    async fn get_pending_batch_deposits(&self) -> Result<Vec<DepositSessionEntity>, AppError>;

    /// Sum total lamports of all pending batch deposits
    async fn sum_pending_batch_lamports(&self) -> Result<i64, AppError>;

    /// Mark multiple deposits as batched with a batch ID and swap signature
    async fn mark_batch_complete(
        &self,
        deposit_ids: &[Uuid],
        batch_id: Uuid,
        swap_tx_signature: &str,
    ) -> Result<(), AppError>;
}

/// Aggregate deposit statistics
#[derive(Debug, Clone, Default)]
pub struct DepositStats {
    /// Total deposits ever made
    pub total_deposits: u64,
    /// Total amount deposited (in lamports)
    pub total_deposited_lamports: i64,
    /// Count of completed deposits (awaiting withdrawal)
    pub pending_withdrawal_count: u64,
    /// Total amount pending withdrawal (in lamports)
    pub pending_withdrawal_lamports: i64,
    /// Count of withdrawals completed
    pub total_withdrawn_count: u64,
    /// Total amount withdrawn (in lamports)
    pub total_withdrawn_lamports: i64,
    /// Count of failed deposits
    pub failed_count: u64,

    // ============= Enhanced Stats =============
    /// Count of deposits ready for withdrawal now (past privacy period)
    pub ready_for_withdrawal_count: u64,
    /// Amount ready for withdrawal now (in lamports)
    pub ready_for_withdrawal_lamports: i64,
    /// Count of deposits still in privacy period
    pub in_privacy_period_count: u64,
    /// Amount still in privacy period (in lamports)
    pub in_privacy_period_lamports: i64,

    // ============= Input Token Tracking =============
    /// Total input token amount for USDC deposits (in smallest unit, 6 decimals)
    pub total_usdc_input: i64,
    /// Total input token amount for USDT deposits (in smallest unit, 6 decimals)
    pub total_usdt_input: i64,
    /// Total native SOL deposits (in lamports, no swap)
    pub total_native_sol_input: i64,
    /// Count of USDC deposits
    pub usdc_deposit_count: u64,
    /// Count of USDT deposits
    pub usdt_deposit_count: u64,
    /// Count of native SOL deposits
    pub native_sol_deposit_count: u64,
}

/// In-memory deposit repository for development/testing
pub struct InMemoryDepositRepository {
    sessions: RwLock<HashMap<Uuid, DepositSessionEntity>>,
}

impl InMemoryDepositRepository {
    pub fn new() -> Self {
        Self {
            sessions: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryDepositRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl DepositRepository for InMemoryDepositRepository {
    async fn create(
        &self,
        session: DepositSessionEntity,
    ) -> Result<DepositSessionEntity, AppError> {
        let mut sessions = self.sessions.write().await;
        sessions.insert(session.id, session.clone());
        Ok(session)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<DepositSessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions.get(&id).cloned())
    }

    async fn find_by_user_pending(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<DepositSessionEntity>, AppError> {
        // Defensive cap: callers should prefer `list_by_user` (paginated).
        const MAX_PENDING_PER_USER: usize = 200;
        let sessions = self.sessions.read().await;
        let mut items: Vec<DepositSessionEntity> = sessions
            .values()
            .filter(|s| s.user_id == user_id && s.status == DepositStatus::Pending)
            .cloned()
            .collect();

        // Match Postgres behavior: newest first.
        items.sort_by_key(|s| s.created_at);
        items.reverse();
        items.truncate(MAX_PENDING_PER_USER);

        Ok(items)
    }

    async fn find_pending_by_wallet(
        &self,
        wallet_address: &str,
    ) -> Result<Option<DepositSessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions
            .values()
            .find(|s| s.wallet_address == wallet_address && s.status == DepositStatus::Pending)
            .cloned())
    }

    async fn find_micro_by_tx_signature(
        &self,
        tx_signature: &str,
    ) -> Result<Option<DepositSessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions
            .values()
            .find(|s| {
                s.deposit_type == DepositType::SolMicro
                    && s.detected_tx_signature.as_deref() == Some(tx_signature)
            })
            .cloned())
    }

    async fn update_status(
        &self,
        id: Uuid,
        status: DepositStatus,
        error_message: Option<String>,
    ) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        let session = sessions
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Deposit session not found".into()))?;
        session.status = status;
        session.error_message = error_message;
        if status == DepositStatus::Completed {
            session.completed_at = Some(Utc::now());
        }
        Ok(())
    }

    async fn update_detected(
        &self,
        id: Uuid,
        amount_lamports: i64,
        tx_signature: &str,
    ) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        let session = sessions
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Deposit session not found".into()))?;
        session.detected_amount_lamports = Some(amount_lamports);
        session.detected_tx_signature = Some(tx_signature.to_string());
        session.detected_at = Some(Utc::now());
        session.status = DepositStatus::Detected;
        Ok(())
    }

    async fn set_message_hash(
        &self,
        id: Uuid,
        hash: &str,
        message_bytes: Option<&[u8]>,
        tx_expires_at: Option<DateTime<Utc>>,
    ) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        let session = sessions
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Deposit session not found".into()))?;
        session.expected_message_hash = Some(hash.to_string());
        session.expected_message_bytes = message_bytes.map(|b| b.to_vec());
        session.tx_expires_at = tx_expires_at;
        Ok(())
    }

    async fn set_privacy_note_id(&self, id: Uuid, note_id: Uuid) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        let session = sessions
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Deposit session not found".into()))?;
        session.privacy_note_id = Some(note_id);
        Ok(())
    }

    async fn set_deposit_amount(&self, id: Uuid, amount_lamports: i64) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        let session = sessions
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Deposit session not found".into()))?;
        session.deposit_amount_lamports = Some(amount_lamports);
        Ok(())
    }

    async fn complete(
        &self,
        id: Uuid,
        tx_signature: &str,
        deposit_amount_lamports: i64,
    ) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        let session = sessions
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Deposit session not found".into()))?;
        session.status = DepositStatus::Completed;
        session.privacy_deposit_tx_signature = Some(tx_signature.to_string());
        session.deposit_amount_lamports = Some(deposit_amount_lamports);
        session.completed_at = Some(Utc::now());
        Ok(())
    }

    async fn record_processing_attempt(
        &self,
        id: Uuid,
        error: Option<&str>,
    ) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        let session = sessions
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Deposit session not found".into()))?;
        session.processing_attempts += 1;
        session.last_processing_attempt_at = Some(Utc::now());
        session.last_processing_error = error.map(|s| s.to_string());
        Ok(())
    }

    async fn list_by_user(
        &self,
        user_id: Uuid,
        statuses: Option<&[DepositStatus]>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        let mut filtered: Vec<_> = sessions
            .values()
            .filter(|s| s.user_id == user_id && statuses.map_or(true, |st| st.contains(&s.status)))
            .cloned()
            .collect();
        filtered.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(filtered
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn delete_pending(&self, id: Uuid, user_id: Uuid) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        let session = sessions
            .get(&id)
            .ok_or_else(|| AppError::NotFound("Deposit session not found".into()))?;

        if session.user_id != user_id {
            return Err(AppError::Forbidden(
                "Not authorized to delete this session".into(),
            ));
        }

        if session.status != DepositStatus::Pending {
            return Err(AppError::Validation(
                "Can only delete pending sessions".into(),
            ));
        }

        if session.detected_amount_lamports.is_some() {
            return Err(AppError::Validation(
                "Cannot delete session after SOL detected".into(),
            ));
        }

        sessions.remove(&id);
        Ok(())
    }

    async fn find_ready_for_withdrawal(
        &self,
        now: DateTime<Utc>,
    ) -> Result<Vec<DepositSessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions
            .values()
            .filter(|s| {
                (s.status == DepositStatus::Completed
                    || s.status == DepositStatus::PartiallyWithdrawn)
                    && s.stored_share_b.is_some()
                    && s.withdrawal_available_at.is_some_and(|t| t <= now)
                    && !s.is_fully_withdrawn() // Has remaining balance
            })
            .cloned()
            .collect())
    }

    async fn list_ready_for_withdrawal(
        &self,
        now: DateTime<Utc>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        let mut ready: Vec<DepositSessionEntity> = sessions
            .values()
            .filter(|s| {
                (s.status == DepositStatus::Completed
                    || s.status == DepositStatus::PartiallyWithdrawn)
                    && s.stored_share_b.is_some()
                    && s.withdrawal_available_at.is_some_and(|t| t <= now)
                    && !s.is_fully_withdrawn()
            })
            .cloned()
            .collect();

        ready.sort_by_key(|s| s.withdrawal_available_at);

        Ok(ready
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count_ready_for_withdrawal(&self, now: DateTime<Utc>) -> Result<u64, AppError> {
        let sessions = self.sessions.read().await;
        let count = sessions
            .values()
            .filter(|s| {
                (s.status == DepositStatus::Completed
                    || s.status == DepositStatus::PartiallyWithdrawn)
                    && s.stored_share_b.is_some()
                    && s.withdrawal_available_at.is_some_and(|t| t <= now)
                    && !s.is_fully_withdrawn()
            })
            .count();
        Ok(count as u64)
    }

    async fn claim_ready_for_withdrawal(
        &self,
        now: DateTime<Utc>,
        limit: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError> {
        let mut sessions = self.sessions.write().await;
        let mut ready: Vec<(Uuid, DateTime<Utc>)> = sessions
            .iter()
            .filter_map(|(id, session)| {
                let available_at = session.withdrawal_available_at?;
                let is_ready = (session.status == DepositStatus::Completed
                    || session.status == DepositStatus::PartiallyWithdrawn)
                    && session.stored_share_b.is_some()
                    && available_at <= now
                    && !session.is_fully_withdrawn(); // Has remaining balance
                is_ready.then_some((*id, available_at))
            })
            .collect();

        ready.sort_by_key(|(_, available_at)| *available_at);

        let mut claimed = Vec::new();
        for (id, _) in ready.into_iter().take(limit as usize) {
            if let Some(session) = sessions.get_mut(&id) {
                session.status = DepositStatus::Processing;
                claimed.push(session.clone());
            }
        }

        Ok(claimed)
    }

    async fn mark_withdrawn(
        &self,
        id: Uuid,
        withdrawal_tx_signature: &str,
    ) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        let session = sessions
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Deposit session not found".into()))?;
        session.status = DepositStatus::Withdrawn;
        session.withdrawal_tx_signature = Some(withdrawal_tx_signature.to_string());
        session.withdrawn_amount_lamports = session.deposit_amount_lamports.unwrap_or(0);
        // Clear stored share B after withdrawal for security
        session.stored_share_b = None;
        Ok(())
    }

    async fn record_partial_withdrawal(
        &self,
        id: Uuid,
        amount_withdrawn: i64,
        tx_signature: &str,
    ) -> Result<bool, AppError> {
        let mut sessions = self.sessions.write().await;
        let session = sessions
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Deposit session not found".into()))?;

        session.withdrawn_amount_lamports += amount_withdrawn;
        session.withdrawal_tx_signature = Some(tx_signature.to_string());

        let fully_withdrawn = session.is_fully_withdrawn();
        if fully_withdrawn {
            session.status = DepositStatus::Withdrawn;
            // Clear stored share B after full withdrawal for security
            session.stored_share_b = None;
        } else {
            // Mark as PartiallyWithdrawn so it can be picked up again
            session.status = DepositStatus::PartiallyWithdrawn;
        }

        Ok(fully_withdrawn)
    }

    async fn count_by_user(
        &self,
        user_id: Uuid,
        statuses: Option<&[DepositStatus]>,
    ) -> Result<u64, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions
            .values()
            .filter(|s| s.user_id == user_id && statuses.map_or(true, |st| st.contains(&s.status)))
            .count() as u64)
    }

    async fn list_all(
        &self,
        statuses: Option<&[DepositStatus]>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        let mut filtered: Vec<_> = sessions
            .values()
            .filter(|s| statuses.map_or(true, |st| st.contains(&s.status)))
            .cloned()
            .collect();
        filtered.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(filtered
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count_all(&self, statuses: Option<&[DepositStatus]>) -> Result<u64, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions
            .values()
            .filter(|s| statuses.map_or(true, |st| st.contains(&s.status)))
            .count() as u64)
    }

    async fn get_stats(&self) -> Result<DepositStats, AppError> {
        let sessions = self.sessions.read().await;
        let mut stats = DepositStats::default();
        let now = chrono::Utc::now();

        // Well-known stablecoin mints
        const USDC_MINT: &str = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
        const USDT_MINT: &str = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

        for session in sessions.values() {
            stats.total_deposits += 1;

            let amount = session.deposit_amount_lamports.unwrap_or(0);
            let input_amount = session.input_token_amount.unwrap_or(0);

            // Track input token type
            if let Some(ref mint) = session.input_token_mint {
                match mint.as_str() {
                    USDC_MINT => {
                        stats.usdc_deposit_count += 1;
                        stats.total_usdc_input += input_amount;
                    }
                    USDT_MINT => {
                        stats.usdt_deposit_count += 1;
                        stats.total_usdt_input += input_amount;
                    }
                    _ => {
                        // Unknown token, count as native SOL for now
                        stats.native_sol_deposit_count += 1;
                        stats.total_native_sol_input += amount;
                    }
                }
            } else {
                // No input mint = native SOL deposit
                stats.native_sol_deposit_count += 1;
                stats.total_native_sol_input += amount;
            }

            match session.status {
                DepositStatus::Completed => {
                    stats.pending_withdrawal_count += 1;
                    stats.pending_withdrawal_lamports += amount;
                    stats.total_deposited_lamports += amount;

                    // Check if ready for withdrawal or still in privacy period
                    let ready = session
                        .withdrawal_available_at
                        .map(|at| at <= now)
                        .unwrap_or(false);
                    if ready {
                        stats.ready_for_withdrawal_count += 1;
                        stats.ready_for_withdrawal_lamports += amount;
                    } else {
                        stats.in_privacy_period_count += 1;
                        stats.in_privacy_period_lamports += amount;
                    }
                }
                DepositStatus::Withdrawn => {
                    stats.total_withdrawn_count += 1;
                    stats.total_withdrawn_lamports += amount;
                    stats.total_deposited_lamports += amount;
                }
                DepositStatus::Failed => {
                    stats.failed_count += 1;
                }
                _ => {}
            }
        }

        Ok(stats)
    }

    async fn find_in_privacy_period(
        &self,
        now: DateTime<Utc>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<DepositSessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        let mut filtered: Vec<_> = sessions
            .values()
            .filter(|s| {
                s.status == DepositStatus::Completed
                    && s.withdrawal_available_at.is_some_and(|t| t > now)
            })
            .cloned()
            .collect();
        filtered.sort_by(|a, b| {
            // Sort by withdrawal_available_at ascending (soonest first)
            a.withdrawal_available_at
                .cmp(&b.withdrawal_available_at)
                .then_with(|| b.created_at.cmp(&a.created_at))
        });
        Ok(filtered
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count_in_privacy_period(&self, now: DateTime<Utc>) -> Result<u64, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions
            .values()
            .filter(|s| {
                s.status == DepositStatus::Completed
                    && s.withdrawal_available_at.is_some_and(|t| t > now)
            })
            .count() as u64)
    }

    async fn get_pending_batch_deposits(&self) -> Result<Vec<DepositSessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions
            .values()
            .filter(|s| {
                s.status == DepositStatus::PendingBatch && s.deposit_type == DepositType::SolMicro
            })
            .cloned()
            .collect())
    }

    async fn sum_pending_batch_lamports(&self) -> Result<i64, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions
            .values()
            .filter(|s| {
                s.status == DepositStatus::PendingBatch && s.deposit_type == DepositType::SolMicro
            })
            .map(|s| s.deposit_amount_lamports.unwrap_or(0))
            .sum())
    }

    async fn mark_batch_complete(
        &self,
        deposit_ids: &[Uuid],
        batch_id: Uuid,
        swap_tx_signature: &str,
    ) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        let now = Utc::now();
        for id in deposit_ids {
            if let Some(session) = sessions.get_mut(id) {
                session.status = DepositStatus::Batched;
                session.batch_id = Some(batch_id);
                session.batched_at = Some(now);
                session.withdrawal_tx_signature = Some(swap_tx_signature.to_string());
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Duration;

    fn create_test_session(user_id: Uuid) -> DepositSessionEntity {
        let session_id = Uuid::new_v4();
        let withdrawal_available_at = Utc::now() + Duration::days(7);
        DepositSessionEntity::new_privacy_deposit(
            user_id,
            session_id,
            "TestWalletAddress123".to_string(),
            1_000_000_000, // 1 SOL
            "tx_sig_test".to_string(),
            "base64_share_b".to_string(),
            withdrawal_available_at,
        )
    }

    #[tokio::test]
    async fn test_create_privacy_deposit_session() {
        let repo = InMemoryDepositRepository::new();
        let user_id = Uuid::new_v4();
        let session = create_test_session(user_id);

        let created = repo.create(session).await.unwrap();
        assert_eq!(created.wallet_type, WalletType::Embedded);
        assert_eq!(created.status, DepositStatus::Completed);
        assert!(created.stored_share_b.is_some());
        assert!(created.withdrawal_available_at.is_some());
    }

    #[tokio::test]
    async fn test_find_by_id() {
        let repo = InMemoryDepositRepository::new();
        let user_id = Uuid::new_v4();
        let session = create_test_session(user_id);
        let session_id = session.id;

        repo.create(session).await.unwrap();

        let found = repo.find_by_id(session_id).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().id, session_id);
    }

    #[tokio::test]
    async fn test_find_by_user_pending_is_capped_and_ordered() {
        let repo = InMemoryDepositRepository::new();
        let user_id = Uuid::new_v4();

        // Insert more than the cap.
        for i in 0..250 {
            let mut session = create_test_session(user_id);
            session.status = DepositStatus::Pending;
            session.created_at = Utc::now() + Duration::seconds(i);
            repo.create(session).await.unwrap();
        }

        let items = repo.find_by_user_pending(user_id).await.unwrap();
        assert_eq!(items.len(), 200);
        assert!(items
            .windows(2)
            .all(|w| w[0].created_at >= w[1].created_at));
    }

    #[tokio::test]
    async fn test_update_status() {
        let repo = InMemoryDepositRepository::new();
        let user_id = Uuid::new_v4();
        let session = create_test_session(user_id);

        let created = repo.create(session).await.unwrap();
        repo.update_status(created.id, DepositStatus::Failed, Some("Test error".into()))
            .await
            .unwrap();

        let updated = repo.find_by_id(created.id).await.unwrap().unwrap();
        assert_eq!(updated.status, DepositStatus::Failed);
        assert_eq!(updated.error_message, Some("Test error".into()));
    }

    #[tokio::test]
    async fn test_find_ready_for_withdrawal() {
        let repo = InMemoryDepositRepository::new();
        let user_id = Uuid::new_v4();

        // Create session with withdrawal available in the past
        let session_id = Uuid::new_v4();
        let past_withdrawal = Utc::now() - Duration::hours(1);
        let session = DepositSessionEntity::new_privacy_deposit(
            user_id,
            session_id,
            "Wallet".to_string(),
            1_000_000_000,
            "tx_sig".to_string(),
            "share_b".to_string(),
            past_withdrawal,
        );
        repo.create(session).await.unwrap();

        let ready = repo.find_ready_for_withdrawal(Utc::now()).await.unwrap();
        assert_eq!(ready.len(), 1);
        assert_eq!(ready[0].id, session_id);
    }

    #[tokio::test]
    async fn test_list_and_count_ready_for_withdrawal() {
        let repo = InMemoryDepositRepository::new();
        let user_id = Uuid::new_v4();
        let now = Utc::now();

        let past_withdrawal = now - Duration::hours(1);
        let s1 = DepositSessionEntity::new_privacy_deposit(
            user_id,
            Uuid::new_v4(),
            "Wallet1".to_string(),
            1_000_000_000,
            "tx1".to_string(),
            "share_b".to_string(),
            past_withdrawal,
        );
        let s2 = DepositSessionEntity::new_privacy_deposit(
            user_id,
            Uuid::new_v4(),
            "Wallet2".to_string(),
            1_000_000_000,
            "tx2".to_string(),
            "share_b".to_string(),
            past_withdrawal,
        );
        repo.create(s1.clone()).await.unwrap();
        repo.create(s2.clone()).await.unwrap();

        // Not ready (privacy period not elapsed)
        let future_withdrawal = now + Duration::hours(1);
        let s3 = DepositSessionEntity::new_privacy_deposit(
            user_id,
            Uuid::new_v4(),
            "Wallet3".to_string(),
            1_000_000_000,
            "tx3".to_string(),
            "share_b".to_string(),
            future_withdrawal,
        );
        repo.create(s3).await.unwrap();

        let total = repo.count_ready_for_withdrawal(now).await.unwrap();
        assert_eq!(total, 2);

        let page1 = repo.list_ready_for_withdrawal(now, 1, 0).await.unwrap();
        assert_eq!(page1.len(), 1);

        let page2 = repo.list_ready_for_withdrawal(now, 1, 1).await.unwrap();
        assert_eq!(page2.len(), 1);

        let mut ids = vec![page1[0].id, page2[0].id];
        ids.sort();
        let mut expected = vec![s1.id, s2.id];
        expected.sort();
        assert_eq!(ids, expected);
    }

    #[tokio::test]
    async fn test_claim_ready_for_withdrawal_marks_processing() {
        let repo = InMemoryDepositRepository::new();
        let user_id = Uuid::new_v4();

        let session_id = Uuid::new_v4();
        let past_withdrawal = Utc::now() - Duration::hours(1);
        let session = DepositSessionEntity::new_privacy_deposit(
            user_id,
            session_id,
            "Wallet".to_string(),
            1_000_000_000,
            "tx_sig".to_string(),
            "share_b".to_string(),
            past_withdrawal,
        );
        repo.create(session).await.unwrap();

        let claimed = repo
            .claim_ready_for_withdrawal(Utc::now(), 10)
            .await
            .unwrap();
        assert_eq!(claimed.len(), 1);
        assert_eq!(claimed[0].id, session_id);

        let updated = repo.find_by_id(session_id).await.unwrap().unwrap();
        assert_eq!(updated.status, DepositStatus::Processing);
    }

    #[tokio::test]
    async fn test_claim_ready_for_withdrawal_respects_limit() {
        let repo = InMemoryDepositRepository::new();
        let user_id = Uuid::new_v4();
        let past_withdrawal = Utc::now() - Duration::hours(1);

        for _ in 0..3 {
            let session_id = Uuid::new_v4();
            let session = DepositSessionEntity::new_privacy_deposit(
                user_id,
                session_id,
                "Wallet".to_string(),
                1_000_000_000,
                "tx_sig".to_string(),
                "share_b".to_string(),
                past_withdrawal,
            );
            repo.create(session).await.unwrap();
        }

        let claimed = repo
            .claim_ready_for_withdrawal(Utc::now(), 2)
            .await
            .unwrap();
        assert_eq!(claimed.len(), 2);
    }

    #[tokio::test]
    async fn test_mark_withdrawn() {
        let repo = InMemoryDepositRepository::new();
        let user_id = Uuid::new_v4();
        let session = create_test_session(user_id);
        let session_id = session.id;

        repo.create(session).await.unwrap();
        repo.mark_withdrawn(session_id, "withdrawal_tx_sig_123")
            .await
            .unwrap();

        let updated = repo.find_by_id(session_id).await.unwrap().unwrap();
        assert_eq!(updated.status, DepositStatus::Withdrawn);
        assert_eq!(
            updated.withdrawal_tx_signature,
            Some("withdrawal_tx_sig_123".to_string())
        );
        // Share B should be cleared after withdrawal
        assert!(updated.stored_share_b.is_none());
    }

    #[test]
    fn test_status_parsing_valid() {
        let parsed_status: DepositStatus = "completed".parse().expect("valid status");
        assert_eq!(parsed_status, DepositStatus::Completed);
        assert_eq!(
            "completed".parse::<DepositStatus>().ok(),
            Some(DepositStatus::Completed)
        );

        let parsed_wallet: WalletType = "embedded".parse().expect("valid wallet type");
        assert_eq!(parsed_wallet, WalletType::Embedded);
        assert_eq!(
            "embedded".parse::<WalletType>().ok(),
            Some(WalletType::Embedded)
        );
    }

    #[test]
    fn test_status_parsing_invalid() {
        assert!("unknown".parse::<DepositStatus>().is_err());

        assert!("unknown".parse::<WalletType>().is_err());
    }
}
