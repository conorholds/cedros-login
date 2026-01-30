//! Privacy note repository trait and implementations
//!
//! SECURITY: Privacy notes contain secrets for withdrawing funds.
//! They are encrypted at rest and NEVER exposed to clients.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Privacy note status
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NoteStatus {
    /// Note generated, tx not yet confirmed
    Pending,
    /// Tx confirmed, can be withdrawn
    Active,
    /// Withdrawal tx submitted
    WithdrawalPending,
    /// Successfully withdrawn to company wallet
    Withdrawn,
    /// Withdrawal attempted but failed
    WithdrawalFailed,
}

impl NoteStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Active => "active",
            Self::WithdrawalPending => "withdrawal_pending",
            Self::Withdrawn => "withdrawn",
            Self::WithdrawalFailed => "withdrawal_failed",
        }
    }

    fn parse(s: &str) -> Option<Self> {
        match s {
            "pending" => Some(Self::Pending),
            "active" => Some(Self::Active),
            "withdrawal_pending" => Some(Self::WithdrawalPending),
            "withdrawn" => Some(Self::Withdrawn),
            "withdrawal_failed" => Some(Self::WithdrawalFailed),
            _ => None,
        }
    }
}

impl std::str::FromStr for NoteStatus {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s).ok_or(())
    }
}

/// Privacy note entity
///
/// Contains encrypted note data - the note itself is NEVER stored in plaintext.
#[derive(Debug, Clone)]
pub struct PrivacyNoteCreate {
    pub user_id: Uuid,
    pub deposit_session_id: Uuid,
    pub encrypted_note: Vec<u8>,
    pub note_nonce: Vec<u8>,
    pub encryption_key_id: String,
    pub commitment_hash: String,
    pub amount_lamports: i64,
    pub currency: String,
}

#[derive(Debug, Clone)]
pub struct PrivacyNoteEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    pub deposit_session_id: Option<Uuid>,
    /// Encrypted note bytes (AES-256-GCM ciphertext)
    pub encrypted_note: Vec<u8>,
    /// 12-byte AES-GCM nonce
    pub note_nonce: Vec<u8>,
    /// Key version for rotation support
    pub encryption_key_id: String,
    /// Cipher used (always "aes-256-gcm" currently)
    pub cipher_version: String,
    /// Commitment hash (not secret, used for lookup/deduplication)
    pub commitment_hash: String,
    pub amount_lamports: i64,
    /// Privacy Cash withdrawal fee (tracked for accounting)
    pub fee_lamports: Option<i64>,
    pub currency: String,
    pub status: NoteStatus,
    pub withdrawal_tx_signature: Option<String>,
    pub withdrawal_recipient: Option<String>,
    pub withdrawal_attempts: i32,
    pub last_withdrawal_error: Option<String>,
    pub last_withdrawal_attempt_at: Option<DateTime<Utc>>,
    pub deposited_at: DateTime<Utc>,
    pub withdrawn_at: Option<DateTime<Utc>>,
}

impl PrivacyNoteEntity {
    /// Create a new pending privacy note
    pub fn new(params: PrivacyNoteCreate) -> Self {
        let PrivacyNoteCreate {
            user_id,
            deposit_session_id,
            encrypted_note,
            note_nonce,
            encryption_key_id,
            commitment_hash,
            amount_lamports,
            currency,
        } = params;

        Self {
            id: Uuid::new_v4(),
            user_id,
            deposit_session_id: Some(deposit_session_id),
            encrypted_note,
            note_nonce,
            encryption_key_id,
            cipher_version: "aes-256-gcm".to_string(),
            commitment_hash,
            amount_lamports,
            fee_lamports: None,
            currency,
            status: NoteStatus::Pending,
            withdrawal_tx_signature: None,
            withdrawal_recipient: None,
            withdrawal_attempts: 0,
            last_withdrawal_error: None,
            last_withdrawal_attempt_at: None,
            deposited_at: Utc::now(),
            withdrawn_at: None,
        }
    }
}

/// Privacy note repository trait
#[async_trait]
pub trait PrivacyNoteRepository: Send + Sync {
    /// Create a new privacy note
    async fn create(&self, note: PrivacyNoteEntity) -> Result<PrivacyNoteEntity, AppError>;

    /// Find note by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<PrivacyNoteEntity>, AppError>;

    /// Find note by commitment hash
    async fn find_by_commitment(
        &self,
        commitment_hash: &str,
    ) -> Result<Option<PrivacyNoteEntity>, AppError>;

    /// Update note status to active (after tx confirmed)
    async fn mark_active(&self, id: Uuid) -> Result<(), AppError>;

    /// Mark note as withdrawal pending
    async fn mark_withdrawal_pending(&self, id: Uuid, recipient: &str) -> Result<(), AppError>;

    /// Mark note as withdrawn
    async fn mark_withdrawn(
        &self,
        id: Uuid,
        tx_signature: &str,
        fee_lamports: i64,
    ) -> Result<(), AppError>;

    /// Mark withdrawal as failed with error
    async fn mark_withdrawal_failed(&self, id: Uuid, error: &str) -> Result<(), AppError>;

    /// Delete a pending note (only if status is pending - tx never confirmed)
    async fn delete_pending(&self, id: Uuid) -> Result<(), AppError>;

    /// Find notes ready for withdrawal
    /// Returns notes with status 'active' or 'withdrawal_failed' that are old enough
    async fn find_for_withdrawal(
        &self,
        min_age_hours: u32,
        max_attempts: i32,
        limit: u32,
    ) -> Result<Vec<PrivacyNoteEntity>, AppError>;

    /// Get notes for a user (metadata only for admin/debugging)
    async fn list_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<PrivacyNoteEntity>, AppError>;
}

/// In-memory privacy note repository for development/testing
pub struct InMemoryPrivacyNoteRepository {
    notes: RwLock<HashMap<Uuid, PrivacyNoteEntity>>,
}

impl InMemoryPrivacyNoteRepository {
    pub fn new() -> Self {
        Self {
            notes: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryPrivacyNoteRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl PrivacyNoteRepository for InMemoryPrivacyNoteRepository {
    async fn create(&self, note: PrivacyNoteEntity) -> Result<PrivacyNoteEntity, AppError> {
        let mut notes = self.notes.write().await;

        // Check for duplicate commitment hash
        if notes
            .values()
            .any(|n| n.commitment_hash == note.commitment_hash)
        {
            return Err(AppError::Validation(
                "Note with this commitment hash already exists".into(),
            ));
        }

        notes.insert(note.id, note.clone());
        Ok(note)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<PrivacyNoteEntity>, AppError> {
        let notes = self.notes.read().await;
        Ok(notes.get(&id).cloned())
    }

    async fn find_by_commitment(
        &self,
        commitment_hash: &str,
    ) -> Result<Option<PrivacyNoteEntity>, AppError> {
        let notes = self.notes.read().await;
        Ok(notes
            .values()
            .find(|n| n.commitment_hash == commitment_hash)
            .cloned())
    }

    async fn mark_active(&self, id: Uuid) -> Result<(), AppError> {
        let mut notes = self.notes.write().await;
        let note = notes
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Privacy note not found".into()))?;
        note.status = NoteStatus::Active;
        Ok(())
    }

    async fn mark_withdrawal_pending(&self, id: Uuid, recipient: &str) -> Result<(), AppError> {
        let mut notes = self.notes.write().await;
        let note = notes
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Privacy note not found".into()))?;
        note.status = NoteStatus::WithdrawalPending;
        note.withdrawal_recipient = Some(recipient.to_string());
        note.last_withdrawal_attempt_at = Some(Utc::now());
        note.withdrawal_attempts += 1;
        Ok(())
    }

    async fn mark_withdrawn(
        &self,
        id: Uuid,
        tx_signature: &str,
        fee_lamports: i64,
    ) -> Result<(), AppError> {
        let mut notes = self.notes.write().await;
        let note = notes
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Privacy note not found".into()))?;
        note.status = NoteStatus::Withdrawn;
        note.withdrawal_tx_signature = Some(tx_signature.to_string());
        note.fee_lamports = Some(fee_lamports);
        note.withdrawn_at = Some(Utc::now());
        Ok(())
    }

    async fn mark_withdrawal_failed(&self, id: Uuid, error: &str) -> Result<(), AppError> {
        let mut notes = self.notes.write().await;
        let note = notes
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Privacy note not found".into()))?;
        note.status = NoteStatus::WithdrawalFailed;
        note.last_withdrawal_error = Some(error.to_string());
        Ok(())
    }

    async fn delete_pending(&self, id: Uuid) -> Result<(), AppError> {
        let mut notes = self.notes.write().await;
        let note = notes
            .get(&id)
            .ok_or_else(|| AppError::NotFound("Privacy note not found".into()))?;

        if note.status != NoteStatus::Pending {
            return Err(AppError::Validation("Can only delete pending notes".into()));
        }

        notes.remove(&id);
        Ok(())
    }

    async fn find_for_withdrawal(
        &self,
        min_age_hours: u32,
        max_attempts: i32,
        limit: u32,
    ) -> Result<Vec<PrivacyNoteEntity>, AppError> {
        let notes = self.notes.read().await;
        let cutoff = Utc::now() - chrono::Duration::hours(min_age_hours as i64);

        let mut eligible: Vec<_> = notes
            .values()
            .filter(|n| {
                (n.status == NoteStatus::Active || n.status == NoteStatus::WithdrawalFailed)
                    && n.deposited_at < cutoff
                    && n.withdrawal_attempts < max_attempts
            })
            .cloned()
            .collect();

        // Sort by deposited_at (oldest first)
        eligible.sort_by(|a, b| a.deposited_at.cmp(&b.deposited_at));

        Ok(eligible.into_iter().take(limit as usize).collect())
    }

    async fn list_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<PrivacyNoteEntity>, AppError> {
        let notes = self.notes.read().await;
        let mut user_notes: Vec<_> = notes
            .values()
            .filter(|n| n.user_id == user_id)
            .cloned()
            .collect();

        user_notes.sort_by(|a, b| b.deposited_at.cmp(&a.deposited_at));

        Ok(user_notes
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_note(user_id: Uuid, session_id: Uuid, commitment: &str) -> PrivacyNoteEntity {
        PrivacyNoteEntity::new(PrivacyNoteCreate {
            user_id,
            deposit_session_id: session_id,
            encrypted_note: vec![0u8; 64], // Fake encrypted note
            note_nonce: vec![0u8; 12],     // Fake nonce
            encryption_key_id: "v1".to_string(),
            commitment_hash: commitment.to_string(),
            amount_lamports: 1_000_000,
            currency: "SOL".to_string(),
        })
    }

    #[tokio::test]
    async fn test_create_note() {
        let repo = InMemoryPrivacyNoteRepository::new();
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();

        let note = create_test_note(user_id, session_id, "commitment_123");
        let created = repo.create(note).await.unwrap();

        assert_eq!(created.status, NoteStatus::Pending);
        assert_eq!(created.commitment_hash, "commitment_123");
    }

    #[tokio::test]
    async fn test_duplicate_commitment_rejected() {
        let repo = InMemoryPrivacyNoteRepository::new();
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();

        let note1 = create_test_note(user_id, session_id, "same_commitment");
        let note2 = create_test_note(user_id, session_id, "same_commitment");

        repo.create(note1).await.unwrap();
        let result = repo.create(note2).await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_mark_active() {
        let repo = InMemoryPrivacyNoteRepository::new();
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();

        let note = create_test_note(user_id, session_id, "commitment_456");
        let created = repo.create(note).await.unwrap();

        repo.mark_active(created.id).await.unwrap();

        let found = repo.find_by_id(created.id).await.unwrap().unwrap();
        assert_eq!(found.status, NoteStatus::Active);
    }

    #[tokio::test]
    async fn test_withdrawal_flow() {
        let repo = InMemoryPrivacyNoteRepository::new();
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();

        let note = create_test_note(user_id, session_id, "commitment_789");
        let created = repo.create(note).await.unwrap();

        // Mark active
        repo.mark_active(created.id).await.unwrap();

        // Mark withdrawal pending
        repo.mark_withdrawal_pending(created.id, "CompanyWallet123")
            .await
            .unwrap();
        let pending = repo.find_by_id(created.id).await.unwrap().unwrap();
        assert_eq!(pending.status, NoteStatus::WithdrawalPending);

        // Mark withdrawn
        repo.mark_withdrawn(created.id, "tx_sig_abc", 3500)
            .await
            .unwrap();
        let withdrawn = repo.find_by_id(created.id).await.unwrap().unwrap();
        assert_eq!(withdrawn.status, NoteStatus::Withdrawn);
        assert_eq!(withdrawn.fee_lamports, Some(3500));
    }

    #[tokio::test]
    async fn test_delete_pending_only() {
        let repo = InMemoryPrivacyNoteRepository::new();
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();

        let note = create_test_note(user_id, session_id, "commitment_delete");
        let created = repo.create(note).await.unwrap();

        // Can delete pending
        repo.delete_pending(created.id).await.unwrap();
        assert!(repo.find_by_id(created.id).await.unwrap().is_none());

        // Cannot delete non-pending
        let note2 = create_test_note(user_id, session_id, "commitment_nodelete");
        let created2 = repo.create(note2).await.unwrap();
        repo.mark_active(created2.id).await.unwrap();

        let result = repo.delete_pending(created2.id).await;
        assert!(result.is_err());
    }

    #[test]
    fn test_note_status_parsing_valid() {
        let parsed: NoteStatus = "active".parse().expect("valid status");
        assert_eq!(parsed, NoteStatus::Active);
        assert_eq!(
            "active".parse::<NoteStatus>().ok(),
            Some(NoteStatus::Active)
        );
    }

    #[test]
    fn test_note_status_parsing_invalid() {
        assert!("unknown".parse::<NoteStatus>().is_err());
    }
}
