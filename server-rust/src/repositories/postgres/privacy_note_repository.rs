//! PostgreSQL privacy note repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{NoteStatus, PrivacyNoteEntity, PrivacyNoteRepository};

const MAX_PAGE_SIZE: u32 = 100;
const MAX_OFFSET: u32 = 1_000_000;

fn cap_pagination(limit: u32, offset: u32) -> (u32, u32) {
    (limit.min(MAX_PAGE_SIZE), offset.min(MAX_OFFSET))
}

/// PostgreSQL privacy note repository
pub struct PostgresPrivacyNoteRepository {
    pool: PgPool,
}

impl PostgresPrivacyNoteRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

/// Row type for privacy note queries
#[derive(sqlx::FromRow)]
struct PrivacyNoteRow {
    id: Uuid,
    user_id: Uuid,
    deposit_session_id: Option<Uuid>,
    encrypted_note: Vec<u8>,
    note_nonce: Vec<u8>,
    encryption_key_id: String,
    cipher_version: String,
    commitment_hash: String,
    amount_lamports: i64,
    fee_lamports: Option<i64>,
    currency: String,
    status: String,
    withdrawal_tx_signature: Option<String>,
    withdrawal_recipient: Option<String>,
    withdrawal_attempts: i32,
    last_withdrawal_error: Option<String>,
    last_withdrawal_attempt_at: Option<DateTime<Utc>>,
    deposited_at: DateTime<Utc>,
    withdrawn_at: Option<DateTime<Utc>>,
}

fn parse_note_status(status: &str) -> Result<NoteStatus, AppError> {
    status
        .parse()
        .map_err(|_| AppError::Database(format!("Unknown privacy note status: {}", status)))
}

impl TryFrom<PrivacyNoteRow> for PrivacyNoteEntity {
    type Error = AppError;

    fn try_from(row: PrivacyNoteRow) -> Result<Self, Self::Error> {
        Ok(Self {
            id: row.id,
            user_id: row.user_id,
            deposit_session_id: row.deposit_session_id,
            encrypted_note: row.encrypted_note,
            note_nonce: row.note_nonce,
            encryption_key_id: row.encryption_key_id,
            cipher_version: row.cipher_version,
            commitment_hash: row.commitment_hash,
            amount_lamports: row.amount_lamports,
            fee_lamports: row.fee_lamports,
            currency: row.currency,
            status: parse_note_status(&row.status)?,
            withdrawal_tx_signature: row.withdrawal_tx_signature,
            withdrawal_recipient: row.withdrawal_recipient,
            withdrawal_attempts: row.withdrawal_attempts,
            last_withdrawal_error: row.last_withdrawal_error,
            last_withdrawal_attempt_at: row.last_withdrawal_attempt_at,
            deposited_at: row.deposited_at,
            withdrawn_at: row.withdrawn_at,
        })
    }
}

const SELECT_COLS: &str = r#"
    id, user_id, deposit_session_id, encrypted_note, note_nonce, encryption_key_id,
    cipher_version, commitment_hash, amount_lamports, fee_lamports, currency, status,
    withdrawal_tx_signature, withdrawal_recipient, withdrawal_attempts,
    last_withdrawal_error, last_withdrawal_attempt_at, deposited_at, withdrawn_at
"#;

#[async_trait]
impl PrivacyNoteRepository for PostgresPrivacyNoteRepository {
    async fn create(&self, note: PrivacyNoteEntity) -> Result<PrivacyNoteEntity, AppError> {
        let row: PrivacyNoteRow = sqlx::query_as(&format!(
            r#"
            INSERT INTO privacy_notes (
                id, user_id, deposit_session_id, encrypted_note, note_nonce,
                encryption_key_id, cipher_version, commitment_hash, amount_lamports,
                currency, status, deposited_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING {}
            "#,
            SELECT_COLS
        ))
        .bind(note.id)
        .bind(note.user_id)
        .bind(note.deposit_session_id)
        .bind(&note.encrypted_note)
        .bind(&note.note_nonce)
        .bind(&note.encryption_key_id)
        .bind(&note.cipher_version)
        .bind(&note.commitment_hash)
        .bind(note.amount_lamports)
        .bind(&note.currency)
        .bind(note.status.as_str())
        .bind(note.deposited_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| {
            // Check for unique constraint violation on commitment_hash
            if let sqlx::Error::Database(ref db_err) = e {
                if db_err.constraint() == Some("privacy_notes_commitment_hash_key") {
                    return AppError::Validation(
                        "Note with this commitment hash already exists".into(),
                    );
                }
            }
            AppError::Internal(e.into())
        })?;

        row.try_into()
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<PrivacyNoteEntity>, AppError> {
        let row: Option<PrivacyNoteRow> = sqlx::query_as(&format!(
            "SELECT {} FROM privacy_notes WHERE id = $1",
            SELECT_COLS
        ))
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.map(TryInto::try_into).transpose()
    }

    async fn find_by_commitment(
        &self,
        commitment_hash: &str,
    ) -> Result<Option<PrivacyNoteEntity>, AppError> {
        let row: Option<PrivacyNoteRow> = sqlx::query_as(&format!(
            "SELECT {} FROM privacy_notes WHERE commitment_hash = $1",
            SELECT_COLS
        ))
        .bind(commitment_hash)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.map(TryInto::try_into).transpose()
    }

    async fn mark_active(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query("UPDATE privacy_notes SET status = 'active' WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Privacy note not found".into()));
        }

        Ok(())
    }

    async fn mark_withdrawal_pending(&self, id: Uuid, recipient: &str) -> Result<(), AppError> {
        let result = sqlx::query(
            r#"
            UPDATE privacy_notes
            SET status = 'withdrawal_pending',
                withdrawal_recipient = $1,
                last_withdrawal_attempt_at = NOW(),
                withdrawal_attempts = withdrawal_attempts + 1
            WHERE id = $2
            "#,
        )
        .bind(recipient)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Privacy note not found".into()));
        }

        Ok(())
    }

    async fn mark_withdrawn(
        &self,
        id: Uuid,
        tx_signature: &str,
        fee_lamports: i64,
    ) -> Result<(), AppError> {
        let result = sqlx::query(
            r#"
            UPDATE privacy_notes
            SET status = 'withdrawn',
                withdrawal_tx_signature = $1,
                fee_lamports = $2,
                withdrawn_at = NOW()
            WHERE id = $3
            "#,
        )
        .bind(tx_signature)
        .bind(fee_lamports)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Privacy note not found".into()));
        }

        Ok(())
    }

    async fn mark_withdrawal_failed(&self, id: Uuid, error: &str) -> Result<(), AppError> {
        let result = sqlx::query(
            r#"
            UPDATE privacy_notes
            SET status = 'withdrawal_failed', last_withdrawal_error = $1
            WHERE id = $2
            "#,
        )
        .bind(error)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Privacy note not found".into()));
        }

        Ok(())
    }

    async fn delete_pending(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM privacy_notes WHERE id = $1 AND status = 'pending'")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::Validation("Can only delete pending notes".into()));
        }

        Ok(())
    }

    async fn find_for_withdrawal(
        &self,
        min_age_hours: u32,
        max_attempts: i32,
        limit: u32,
    ) -> Result<Vec<PrivacyNoteEntity>, AppError> {
        let rows: Vec<PrivacyNoteRow> = sqlx::query_as(&format!(
            r#"
            SELECT {} FROM privacy_notes
            WHERE status IN ('active', 'withdrawal_failed')
              AND deposited_at < NOW() - INTERVAL '1 hour' * $1
              AND withdrawal_attempts < $2
            ORDER BY deposited_at ASC
            LIMIT $3
            "#,
            SELECT_COLS
        ))
        .bind(min_age_hours as i64)
        .bind(max_attempts)
        .bind(limit as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        rows.into_iter().map(TryInto::try_into).collect()
    }

    async fn list_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<PrivacyNoteEntity>, AppError> {
        let (capped_limit, capped_offset) = cap_pagination(limit, offset);
        let rows: Vec<PrivacyNoteRow> = sqlx::query_as(&format!(
            r#"
            SELECT {} FROM privacy_notes
            WHERE user_id = $1
            ORDER BY deposited_at DESC
            LIMIT $2 OFFSET $3
            "#,
            SELECT_COLS
        ))
        .bind(user_id)
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        rows.into_iter().map(TryInto::try_into).collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_note_status_valid() {
        let status = parse_note_status("active").unwrap();
        assert_eq!(status, NoteStatus::Active);
    }

    #[test]
    fn test_parse_note_status_unknown() {
        let err = parse_note_status("bogus").unwrap_err();
        match err {
            AppError::Database(msg) => {
                assert!(msg.contains("Unknown privacy note status"));
            }
            other => panic!("Unexpected error: {}", other),
        }
    }

    #[test]
    fn test_cap_pagination() {
        let (limit, offset) = cap_pagination(500, 2_000_000);
        assert_eq!(limit, MAX_PAGE_SIZE);
        assert_eq!(offset, MAX_OFFSET);
    }
}
