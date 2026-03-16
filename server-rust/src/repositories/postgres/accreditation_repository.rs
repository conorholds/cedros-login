//! PostgreSQL accreditation submission repository implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{
    AccreditationDocumentEntity, AccreditationRepository, AccreditationSubmissionEntity,
};

const MAX_PAGE_SIZE: u32 = 100;
const MAX_OFFSET: u32 = 1_000_000;

fn cap_pagination(limit: u32, offset: u32) -> (u32, u32) {
    (limit.min(MAX_PAGE_SIZE), offset.min(MAX_OFFSET))
}

/// PostgreSQL accreditation repository
pub struct PostgresAccreditationRepository {
    pool: PgPool,
}

impl PostgresAccreditationRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

/// NUMERIC columns are cast to FLOAT8 in every query so sqlx reads them as f64.
#[derive(sqlx::FromRow)]
struct AccreditationSubmissionRow {
    id: Uuid,
    user_id: Uuid,
    method: String,
    status: String,
    income_type: Option<String>,
    stated_amount_usd: Option<f64>,
    crd_number: Option<String>,
    license_type: Option<String>,
    investment_commitment_usd: Option<f64>,
    entity_type: Option<String>,
    user_statement: Option<String>,
    reviewed_by: Option<Uuid>,
    reviewed_at: Option<DateTime<Utc>>,
    reviewer_notes: Option<String>,
    rejection_reason: Option<String>,
    expires_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(sqlx::FromRow)]
struct AccreditationDocumentRow {
    id: Uuid,
    submission_id: Uuid,
    document_type: String,
    s3_key: String,
    original_filename: Option<String>,
    content_type: Option<String>,
    file_size_bytes: Option<i64>,
    uploaded_at: DateTime<Utc>,
}

// ---------------------------------------------------------------------------
// From impls
// ---------------------------------------------------------------------------

impl From<AccreditationSubmissionRow> for AccreditationSubmissionEntity {
    fn from(r: AccreditationSubmissionRow) -> Self {
        Self {
            id: r.id,
            user_id: r.user_id,
            method: r.method,
            status: r.status,
            income_type: r.income_type,
            stated_amount_usd: r.stated_amount_usd,
            crd_number: r.crd_number,
            license_type: r.license_type,
            investment_commitment_usd: r.investment_commitment_usd,
            entity_type: r.entity_type,
            user_statement: r.user_statement,
            reviewed_by: r.reviewed_by,
            reviewed_at: r.reviewed_at,
            reviewer_notes: r.reviewer_notes,
            rejection_reason: r.rejection_reason,
            expires_at: r.expires_at,
            created_at: r.created_at,
            updated_at: r.updated_at,
        }
    }
}

impl From<AccreditationDocumentRow> for AccreditationDocumentEntity {
    fn from(r: AccreditationDocumentRow) -> Self {
        Self {
            id: r.id,
            submission_id: r.submission_id,
            document_type: r.document_type,
            s3_key: r.s3_key,
            original_filename: r.original_filename,
            content_type: r.content_type,
            file_size_bytes: r.file_size_bytes,
            uploaded_at: r.uploaded_at,
        }
    }
}

// ---------------------------------------------------------------------------
// Column lists (NUMERIC cast to FLOAT8 for direct f64 binding)
// ---------------------------------------------------------------------------

const SUB_COLS: &str = "id, user_id, method, status, \
    income_type, \
    stated_amount_usd::FLOAT8 AS stated_amount_usd, \
    crd_number, license_type, \
    investment_commitment_usd::FLOAT8 AS investment_commitment_usd, \
    entity_type, user_statement, \
    reviewed_by, reviewed_at, reviewer_notes, rejection_reason, \
    expires_at, created_at, updated_at";

const DOC_COLS: &str =
    "id, submission_id, document_type, s3_key, original_filename, content_type, \
     file_size_bytes, uploaded_at";

// ---------------------------------------------------------------------------
// Trait impl
// ---------------------------------------------------------------------------

#[async_trait]
impl AccreditationRepository for PostgresAccreditationRepository {
    async fn create_submission(
        &self,
        sub: AccreditationSubmissionEntity,
    ) -> Result<AccreditationSubmissionEntity, AppError> {
        let row: AccreditationSubmissionRow = sqlx::query_as(&format!(
            r#"
            INSERT INTO accreditation_submissions (
                id, user_id, method, status,
                income_type, stated_amount_usd,
                crd_number, license_type,
                investment_commitment_usd,
                entity_type, user_statement,
                reviewed_by, reviewed_at, reviewer_notes, rejection_reason,
                expires_at, created_at, updated_at
            )
            VALUES (
                $1, $2, $3, $4,
                $5, $6::NUMERIC,
                $7, $8,
                $9::NUMERIC,
                $10, $11,
                $12, $13, $14, $15,
                $16, $17, $18
            )
            RETURNING {SUB_COLS}
            "#
        ))
        .bind(sub.id)
        .bind(sub.user_id)
        .bind(&sub.method)
        .bind(&sub.status)
        .bind(&sub.income_type)
        .bind(sub.stated_amount_usd)
        .bind(&sub.crd_number)
        .bind(&sub.license_type)
        .bind(sub.investment_commitment_usd)
        .bind(&sub.entity_type)
        .bind(&sub.user_statement)
        .bind(sub.reviewed_by)
        .bind(sub.reviewed_at)
        .bind(&sub.reviewer_notes)
        .bind(&sub.rejection_reason)
        .bind(sub.expires_at)
        .bind(sub.created_at)
        .bind(sub.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn find_submission_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<AccreditationSubmissionEntity>, AppError> {
        let row: Option<AccreditationSubmissionRow> = sqlx::query_as(&format!(
            "SELECT {SUB_COLS} FROM accreditation_submissions WHERE id = $1"
        ))
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn list_submissions_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<AccreditationSubmissionEntity>, AppError> {
        let (limit, offset) = cap_pagination(limit, offset);
        let rows: Vec<AccreditationSubmissionRow> = sqlx::query_as(&format!(
            r#"
            SELECT {SUB_COLS}
            FROM accreditation_submissions
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#
        ))
        .bind(user_id)
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count_submissions_by_user(&self, user_id: Uuid) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM accreditation_submissions WHERE user_id = $1",
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }

    async fn list_pending_submissions(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<AccreditationSubmissionEntity>, AppError> {
        let (limit, offset) = cap_pagination(limit, offset);
        let rows: Vec<AccreditationSubmissionRow> = sqlx::query_as(&format!(
            r#"
            SELECT {SUB_COLS}
            FROM accreditation_submissions
            WHERE status = 'pending'
            ORDER BY created_at ASC
            LIMIT $1 OFFSET $2
            "#
        ))
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count_pending_submissions(&self) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM accreditation_submissions WHERE status = 'pending'",
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }

    async fn update_submission_review(
        &self,
        id: Uuid,
        status: &str,
        reviewed_by: Uuid,
        reviewer_notes: Option<&str>,
        rejection_reason: Option<&str>,
        expires_at: Option<DateTime<Utc>>,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE accreditation_submissions
            SET status           = $2,
                reviewed_by      = $3,
                reviewed_at      = NOW(),
                reviewer_notes   = $4,
                rejection_reason = $5,
                expires_at       = $6,
                updated_at       = NOW()
            WHERE id = $1
            "#,
        )
        .bind(id)
        .bind(status)
        .bind(reviewed_by)
        .bind(reviewer_notes)
        .bind(rejection_reason)
        .bind(expires_at)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn add_document(
        &self,
        doc: AccreditationDocumentEntity,
    ) -> Result<AccreditationDocumentEntity, AppError> {
        let row: AccreditationDocumentRow = sqlx::query_as(&format!(
            r#"
            INSERT INTO accreditation_documents (
                id, submission_id, document_type, s3_key,
                original_filename, content_type, file_size_bytes, uploaded_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING {DOC_COLS}
            "#
        ))
        .bind(doc.id)
        .bind(doc.submission_id)
        .bind(&doc.document_type)
        .bind(&doc.s3_key)
        .bind(&doc.original_filename)
        .bind(&doc.content_type)
        .bind(doc.file_size_bytes)
        .bind(doc.uploaded_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn list_documents_by_submission(
        &self,
        submission_id: Uuid,
    ) -> Result<Vec<AccreditationDocumentEntity>, AppError> {
        let rows: Vec<AccreditationDocumentRow> = sqlx::query_as(&format!(
            r#"
            SELECT {DOC_COLS}
            FROM accreditation_documents
            WHERE submission_id = $1
            ORDER BY uploaded_at ASC
            "#
        ))
        .bind(submission_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn find_document_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<AccreditationDocumentEntity>, AppError> {
        let row: Option<AccreditationDocumentRow> = sqlx::query_as(&format!(
            "SELECT {DOC_COLS} FROM accreditation_documents WHERE id = $1"
        ))
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }
}
