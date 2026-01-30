//! Credit refund request repository
//!
//! Persisted refund requests are required for an admin workflow (list + process).

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CreditRefundRequestStatus {
    Pending,
    Processed,
    Rejected,
}

impl CreditRefundRequestStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Processed => "processed",
            Self::Rejected => "rejected",
        }
    }
}

impl TryFrom<&str> for CreditRefundRequestStatus {
    type Error = AppError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "pending" => Ok(Self::Pending),
            "processed" => Ok(Self::Processed),
            "rejected" => Ok(Self::Rejected),
            other => Err(AppError::Validation(format!(
                "Invalid refund request status: {}",
                other
            ))),
        }
    }
}

#[derive(Debug, Clone)]
pub struct CreditRefundRequestEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    pub original_transaction_id: Uuid,
    /// Amount requested in smallest unit (lamports for SOL, micros for USD)
    pub amount_lamports: i64,
    pub currency: String,
    pub reason: String,
    pub status: CreditRefundRequestStatus,
    pub created_at: DateTime<Utc>,

    pub processed_at: Option<DateTime<Utc>>,
    pub processed_by: Option<Uuid>,
    pub processed_amount_lamports: Option<i64>,
    pub processed_transaction_id: Option<Uuid>,
    pub processed_reason: Option<String>,

    pub rejected_at: Option<DateTime<Utc>>,
    pub rejected_by: Option<Uuid>,
    pub rejected_reason: Option<String>,
}

impl CreditRefundRequestEntity {
    pub fn new(
        user_id: Uuid,
        original_transaction_id: Uuid,
        amount_lamports: i64,
        currency: String,
        reason: String,
    ) -> Result<Self, AppError> {
        if amount_lamports <= 0 {
            return Err(AppError::Validation(
                "Refund amount must be positive".to_string(),
            ));
        }
        if reason.trim().is_empty() {
            return Err(AppError::Validation("Reason is required".to_string()));
        }

        let now = Utc::now();
        Ok(Self {
            id: Uuid::new_v4(),
            user_id,
            original_transaction_id,
            amount_lamports,
            currency,
            reason,
            status: CreditRefundRequestStatus::Pending,
            created_at: now,
            processed_at: None,
            processed_by: None,
            processed_amount_lamports: None,
            processed_transaction_id: None,
            processed_reason: None,

            rejected_at: None,
            rejected_by: None,
            rejected_reason: None,
        })
    }
}

#[async_trait]
pub trait CreditRefundRequestRepository: Send + Sync {
    async fn create(
        &self,
        entity: CreditRefundRequestEntity,
    ) -> Result<CreditRefundRequestEntity, AppError>;

    async fn find_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<CreditRefundRequestEntity>, AppError>;

    async fn list(
        &self,
        status: Option<CreditRefundRequestStatus>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<CreditRefundRequestEntity>, AppError>;

    async fn count(&self, status: Option<CreditRefundRequestStatus>) -> Result<u64, AppError>;

    async fn mark_processed(
        &self,
        id: Uuid,
        admin_id: Uuid,
        processed_amount_lamports: i64,
        processed_transaction_id: Uuid,
        processed_reason: String,
    ) -> Result<CreditRefundRequestEntity, AppError>;

    async fn mark_rejected(
        &self,
        id: Uuid,
        admin_id: Uuid,
        rejected_reason: String,
    ) -> Result<CreditRefundRequestEntity, AppError>;
}

pub struct InMemoryCreditRefundRequestRepository {
    data: RwLock<HashMap<Uuid, CreditRefundRequestEntity>>,
}

impl InMemoryCreditRefundRequestRepository {
    pub fn new() -> Self {
        Self {
            data: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryCreditRefundRequestRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl CreditRefundRequestRepository for InMemoryCreditRefundRequestRepository {
    async fn create(
        &self,
        entity: CreditRefundRequestEntity,
    ) -> Result<CreditRefundRequestEntity, AppError> {
        let mut data = self.data.write().await;
        data.insert(entity.id, entity.clone());
        Ok(entity)
    }

    async fn find_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<CreditRefundRequestEntity>, AppError> {
        let data = self.data.read().await;
        Ok(data.get(&id).cloned())
    }

    async fn list(
        &self,
        status: Option<CreditRefundRequestStatus>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<CreditRefundRequestEntity>, AppError> {
        let data = self.data.read().await;
        let mut items: Vec<CreditRefundRequestEntity> = data
            .values()
            .filter(|e| status.map(|s| e.status == s).unwrap_or(true))
            .cloned()
            .collect();

        items.sort_by(|a, b| b.created_at.cmp(&a.created_at));

        let start = offset as usize;
        let end = std::cmp::min(start + limit as usize, items.len());
        if start >= items.len() {
            return Ok(Vec::new());
        }
        Ok(items[start..end].to_vec())
    }

    async fn count(&self, status: Option<CreditRefundRequestStatus>) -> Result<u64, AppError> {
        let data = self.data.read().await;
        Ok(data
            .values()
            .filter(|e| status.map(|s| e.status == s).unwrap_or(true))
            .count() as u64)
    }

    async fn mark_processed(
        &self,
        id: Uuid,
        admin_id: Uuid,
        processed_amount_lamports: i64,
        processed_transaction_id: Uuid,
        processed_reason: String,
    ) -> Result<CreditRefundRequestEntity, AppError> {
        let mut data = self.data.write().await;
        let entity = data
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Refund request not found".into()))?;

        if entity.status == CreditRefundRequestStatus::Processed {
            return Ok(entity.clone());
        }

        entity.status = CreditRefundRequestStatus::Processed;
        entity.processed_at = Some(Utc::now());
        entity.processed_by = Some(admin_id);
        entity.processed_amount_lamports = Some(processed_amount_lamports);
        entity.processed_transaction_id = Some(processed_transaction_id);
        entity.processed_reason = Some(processed_reason);

        Ok(entity.clone())
    }

    async fn mark_rejected(
        &self,
        id: Uuid,
        admin_id: Uuid,
        rejected_reason: String,
    ) -> Result<CreditRefundRequestEntity, AppError> {
        let mut data = self.data.write().await;
        let entity = data
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("Refund request not found".into()))?;

        if entity.status == CreditRefundRequestStatus::Rejected {
            return Ok(entity.clone());
        }
        if entity.status == CreditRefundRequestStatus::Processed {
            return Err(AppError::Validation(
                "Cannot reject a processed refund request".into(),
            ));
        }

        entity.status = CreditRefundRequestStatus::Rejected;
        entity.rejected_at = Some(Utc::now());
        entity.rejected_by = Some(admin_id);
        entity.rejected_reason = Some(rejected_reason);

        Ok(entity.clone())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_and_list() {
        let repo = InMemoryCreditRefundRequestRepository::new();
        let user_id = Uuid::new_v4();
        let tx_id = Uuid::new_v4();
        let entity = CreditRefundRequestEntity::new(
            user_id,
            tx_id,
            100,
            "USD".to_string(),
            "test".to_string(),
        )
        .unwrap();
        repo.create(entity.clone()).await.unwrap();

        let list = repo
            .list(Some(CreditRefundRequestStatus::Pending), 50, 0)
            .await
            .unwrap();
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].id, entity.id);
    }
}
