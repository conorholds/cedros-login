//! Accreditation submission repository trait and in-memory implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// A single accreditation verification submission
#[derive(Debug, Clone)]
pub struct AccreditationSubmissionEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    /// One of: income, net_worth, credential, third_party_letter, insider, investment_threshold
    pub method: String,
    /// One of: pending, approved, rejected
    pub status: String,
    /// "individual" or "joint" (income / net_worth methods)
    pub income_type: Option<String>,
    /// Stated income or net-worth in USD
    pub stated_amount_usd: Option<f64>,
    /// FINRA CRD number (credential method)
    pub crd_number: Option<String>,
    /// One of: series_7, series_65, series_82 (credential method)
    pub license_type: Option<String>,
    /// Investment commitment in USD (investment_threshold method)
    pub investment_commitment_usd: Option<f64>,
    /// "individual" or "entity"
    pub entity_type: Option<String>,
    /// Free-text user statement (income expectation, insider cert, etc.)
    pub user_statement: Option<String>,
    pub reviewed_by: Option<Uuid>,
    pub reviewed_at: Option<DateTime<Utc>>,
    pub reviewer_notes: Option<String>,
    pub rejection_reason: Option<String>,
    pub expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// A document attached to an accreditation submission
#[derive(Debug, Clone)]
pub struct AccreditationDocumentEntity {
    pub id: Uuid,
    pub submission_id: Uuid,
    pub document_type: String,
    pub s3_key: String,
    pub original_filename: Option<String>,
    pub content_type: Option<String>,
    pub file_size_bytes: Option<i64>,
    pub uploaded_at: DateTime<Utc>,
}

/// Repository for accreditation submission lifecycle management
#[async_trait]
pub trait AccreditationRepository: Send + Sync {
    /// Persist a new submission. Returns the stored entity.
    async fn create_submission(
        &self,
        sub: AccreditationSubmissionEntity,
    ) -> Result<AccreditationSubmissionEntity, AppError>;

    /// Look up a submission by its internal ID. Returns `None` if not found.
    async fn find_submission_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<AccreditationSubmissionEntity>, AppError>;

    /// List submissions for a user, ordered by `created_at` descending.
    async fn list_submissions_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<AccreditationSubmissionEntity>, AppError>;

    /// Count total submissions for a user.
    async fn count_submissions_by_user(&self, user_id: Uuid) -> Result<u64, AppError>;

    /// List submissions in `pending` status, ordered by `created_at` ascending (oldest first).
    async fn list_pending_submissions(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<AccreditationSubmissionEntity>, AppError>;

    /// Count submissions currently in `pending` status.
    async fn count_pending_submissions(&self) -> Result<u64, AppError>;

    /// Record an admin review decision on a submission.
    ///
    /// Sets `status`, `reviewed_by`, `reviewed_at` (now), and optional
    /// `reviewer_notes`, `rejection_reason`, `expires_at`. Also bumps `updated_at`.
    async fn update_submission_review(
        &self,
        id: Uuid,
        status: &str,
        reviewed_by: Uuid,
        reviewer_notes: Option<&str>,
        rejection_reason: Option<&str>,
        expires_at: Option<DateTime<Utc>>,
    ) -> Result<(), AppError>;

    /// Persist a new document record. Returns the stored entity.
    async fn add_document(
        &self,
        doc: AccreditationDocumentEntity,
    ) -> Result<AccreditationDocumentEntity, AppError>;

    /// List all documents attached to a submission.
    async fn list_documents_by_submission(
        &self,
        submission_id: Uuid,
    ) -> Result<Vec<AccreditationDocumentEntity>, AppError>;

    /// Look up a document by its internal ID. Returns `None` if not found.
    async fn find_document_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<AccreditationDocumentEntity>, AppError>;
}

/// In-memory implementation for development and testing
pub struct InMemoryAccreditationRepository {
    submissions: RwLock<HashMap<Uuid, AccreditationSubmissionEntity>>,
    documents: RwLock<HashMap<Uuid, AccreditationDocumentEntity>>,
}

impl InMemoryAccreditationRepository {
    pub fn new() -> Self {
        Self {
            submissions: RwLock::new(HashMap::new()),
            documents: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryAccreditationRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl AccreditationRepository for InMemoryAccreditationRepository {
    async fn create_submission(
        &self,
        sub: AccreditationSubmissionEntity,
    ) -> Result<AccreditationSubmissionEntity, AppError> {
        let mut map = self.submissions.write().await;
        map.insert(sub.id, sub.clone());
        Ok(sub)
    }

    async fn find_submission_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<AccreditationSubmissionEntity>, AppError> {
        let map = self.submissions.read().await;
        Ok(map.get(&id).cloned())
    }

    async fn list_submissions_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<AccreditationSubmissionEntity>, AppError> {
        let map = self.submissions.read().await;
        let mut items: Vec<_> = map
            .values()
            .filter(|s| s.user_id == user_id)
            .cloned()
            .collect();
        items.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(items
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count_submissions_by_user(&self, user_id: Uuid) -> Result<u64, AppError> {
        let map = self.submissions.read().await;
        Ok(map.values().filter(|s| s.user_id == user_id).count() as u64)
    }

    async fn list_pending_submissions(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<AccreditationSubmissionEntity>, AppError> {
        let map = self.submissions.read().await;
        let mut items: Vec<_> = map
            .values()
            .filter(|s| s.status == "pending")
            .cloned()
            .collect();
        items.sort_by(|a, b| a.created_at.cmp(&b.created_at));
        Ok(items
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count_pending_submissions(&self) -> Result<u64, AppError> {
        let map = self.submissions.read().await;
        Ok(map.values().filter(|s| s.status == "pending").count() as u64)
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
        let mut map = self.submissions.write().await;
        if let Some(sub) = map.get_mut(&id) {
            let now = Utc::now();
            sub.status = status.to_string();
            sub.reviewed_by = Some(reviewed_by);
            sub.reviewed_at = Some(now);
            sub.reviewer_notes = reviewer_notes.map(str::to_string);
            sub.rejection_reason = rejection_reason.map(str::to_string);
            sub.expires_at = expires_at;
            sub.updated_at = now;
        }
        Ok(())
    }

    async fn add_document(
        &self,
        doc: AccreditationDocumentEntity,
    ) -> Result<AccreditationDocumentEntity, AppError> {
        let mut map = self.documents.write().await;
        map.insert(doc.id, doc.clone());
        Ok(doc)
    }

    async fn list_documents_by_submission(
        &self,
        submission_id: Uuid,
    ) -> Result<Vec<AccreditationDocumentEntity>, AppError> {
        let map = self.documents.read().await;
        let mut items: Vec<_> = map
            .values()
            .filter(|d| d.submission_id == submission_id)
            .cloned()
            .collect();
        items.sort_by(|a, b| a.uploaded_at.cmp(&b.uploaded_at));
        Ok(items)
    }

    async fn find_document_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<AccreditationDocumentEntity>, AppError> {
        let map = self.documents.read().await;
        Ok(map.get(&id).cloned())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_submission(user_id: Uuid) -> AccreditationSubmissionEntity {
        let now = Utc::now();
        AccreditationSubmissionEntity {
            id: Uuid::new_v4(),
            user_id,
            method: "income".to_string(),
            status: "pending".to_string(),
            income_type: Some("individual".to_string()),
            stated_amount_usd: Some(250_000.0),
            crd_number: None,
            license_type: None,
            investment_commitment_usd: None,
            entity_type: None,
            user_statement: None,
            reviewed_by: None,
            reviewed_at: None,
            reviewer_notes: None,
            rejection_reason: None,
            expires_at: None,
            created_at: now,
            updated_at: now,
        }
    }

    fn make_document(submission_id: Uuid) -> AccreditationDocumentEntity {
        AccreditationDocumentEntity {
            id: Uuid::new_v4(),
            submission_id,
            document_type: "tax_w2".to_string(),
            s3_key: "accreditation/docs/test.pdf".to_string(),
            original_filename: Some("w2.pdf".to_string()),
            content_type: Some("application/pdf".to_string()),
            file_size_bytes: Some(102_400),
            uploaded_at: Utc::now(),
        }
    }

    #[tokio::test]
    async fn test_create_and_find_submission_by_id() {
        let repo = InMemoryAccreditationRepository::new();
        let user_id = Uuid::new_v4();
        let sub = make_submission(user_id);
        let id = sub.id;

        let created = repo.create_submission(sub).await.unwrap();
        assert_eq!(created.id, id);

        let found = repo.find_submission_by_id(id).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().id, id);
    }

    #[tokio::test]
    async fn test_find_submission_by_id_not_found() {
        let repo = InMemoryAccreditationRepository::new();
        let result = repo.find_submission_by_id(Uuid::new_v4()).await.unwrap();
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn test_list_and_count_by_user() {
        let repo = InMemoryAccreditationRepository::new();
        let user_id = Uuid::new_v4();
        let other_id = Uuid::new_v4();

        repo.create_submission(make_submission(user_id))
            .await
            .unwrap();
        repo.create_submission(make_submission(user_id))
            .await
            .unwrap();
        repo.create_submission(make_submission(other_id))
            .await
            .unwrap();

        assert_eq!(repo.count_submissions_by_user(user_id).await.unwrap(), 2);
        assert_eq!(repo.count_submissions_by_user(other_id).await.unwrap(), 1);

        let page = repo.list_submissions_by_user(user_id, 1, 0).await.unwrap();
        assert_eq!(page.len(), 1);

        let all = repo.list_submissions_by_user(user_id, 10, 0).await.unwrap();
        assert_eq!(all.len(), 2);
    }

    #[tokio::test]
    async fn test_list_and_count_pending() {
        let repo = InMemoryAccreditationRepository::new();
        let user_id = Uuid::new_v4();

        let mut sub1 = make_submission(user_id);
        sub1.status = "approved".to_string();
        repo.create_submission(sub1).await.unwrap();

        let sub2 = make_submission(user_id);
        let id2 = sub2.id;
        repo.create_submission(sub2).await.unwrap();

        assert_eq!(repo.count_pending_submissions().await.unwrap(), 1);

        let pending = repo.list_pending_submissions(10, 0).await.unwrap();
        assert_eq!(pending.len(), 1);
        assert_eq!(pending[0].id, id2);
    }

    #[tokio::test]
    async fn test_update_submission_review() {
        let repo = InMemoryAccreditationRepository::new();
        let user_id = Uuid::new_v4();
        let sub = make_submission(user_id);
        let id = sub.id;
        repo.create_submission(sub).await.unwrap();

        let reviewer = Uuid::new_v4();
        repo.update_submission_review(id, "approved", reviewer, Some("looks good"), None, None)
            .await
            .unwrap();

        let found = repo.find_submission_by_id(id).await.unwrap().unwrap();
        assert_eq!(found.status, "approved");
        assert_eq!(found.reviewed_by, Some(reviewer));
        assert!(found.reviewed_at.is_some());
        assert_eq!(found.reviewer_notes.as_deref(), Some("looks good"));
    }

    #[tokio::test]
    async fn test_add_and_list_documents() {
        let repo = InMemoryAccreditationRepository::new();
        let user_id = Uuid::new_v4();
        let sub = make_submission(user_id);
        let submission_id = sub.id;
        repo.create_submission(sub).await.unwrap();

        let doc = make_document(submission_id);
        let doc_id = doc.id;
        repo.add_document(doc).await.unwrap();

        let docs = repo
            .list_documents_by_submission(submission_id)
            .await
            .unwrap();
        assert_eq!(docs.len(), 1);
        assert_eq!(docs[0].id, doc_id);

        let found = repo.find_document_by_id(doc_id).await.unwrap();
        assert!(found.is_some());
    }
}
