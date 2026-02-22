//! Admin handlers for credit refund requests

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::handlers::admin::users::validate_system_admin;
use crate::models::{
    AdminCreditRefundRequestResponse, ListCreditRefundRequestsQueryParams,
    ListCreditRefundRequestsResponse, ProcessCreditRefundRequestInput,
    ProcessCreditRefundRequestResponse, RejectCreditRefundRequestInput,
    RejectCreditRefundRequestResponse,
};
use crate::repositories::{CreditRefundRequestStatus, CreditTransactionEntity};
use crate::services::EmailService;
use crate::AppState;

fn parse_status(s: &str) -> Result<CreditRefundRequestStatus, AppError> {
    CreditRefundRequestStatus::try_from(s)
}

/// GET /admin/credits/refund-requests
pub async fn list_credit_refund_requests<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(params): Query<ListCreditRefundRequestsQueryParams>,
) -> Result<Json<ListCreditRefundRequestsResponse>, AppError> {
    let _admin_id = validate_system_admin(&state, &headers).await?;

    let status = params.status.as_deref().map(parse_status).transpose()?;

    let items = state
        .credit_refund_request_repo
        .list(status, params.limit, params.offset)
        .await?;
    let total = state.credit_refund_request_repo.count(status).await?;

    let refund_requests = items
        .into_iter()
        .map(|e| AdminCreditRefundRequestResponse {
            id: e.id,
            user_id: e.user_id,
            original_transaction_id: e.original_transaction_id,
            amount_lamports: e.amount_lamports,
            currency: e.currency,
            reason: e.reason,
            status: e.status.as_str().to_string(),
            created_at: e.created_at,
            processed_at: e.processed_at,
            processed_by: e.processed_by,
            processed_amount_lamports: e.processed_amount_lamports,
            processed_transaction_id: e.processed_transaction_id,
            processed_reason: e.processed_reason,
            rejected_at: e.rejected_at,
            rejected_by: e.rejected_by,
            rejected_reason: e.rejected_reason,
        })
        .collect();

    Ok(Json(ListCreditRefundRequestsResponse {
        refund_requests,
        total,
        limit: params.limit,
        offset: params.offset,
    }))
}

/// POST /admin/credits/refund-requests/:id/reject
pub async fn reject_credit_refund_request<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
    Json(input): Json<RejectCreditRefundRequestInput>,
) -> Result<Json<RejectCreditRefundRequestResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    if input.reason.trim().is_empty() {
        return Err(AppError::Validation("Reason is required".into()));
    }
    if input.reason.len() > 1000 {
        return Err(AppError::Validation(
            "Reason must be 1000 characters or less".into(),
        ));
    }

    let current = state
        .credit_refund_request_repo
        .find_by_id(id)
        .await?
        .ok_or_else(|| AppError::NotFound("Refund request not found".into()))?;

    if current.status == CreditRefundRequestStatus::Processed {
        return Err(AppError::Validation(
            "Cannot reject a processed refund request".into(),
        ));
    }

    let _ = state
        .credit_refund_request_repo
        .mark_rejected(id, admin_id, input.reason.clone())
        .await?;

    tracing::info!(
        admin_id = %admin_id,
        refund_request_id = %id,
        user_id = %current.user_id,
        amount_lamports = current.amount_lamports,
        reason = %input.reason,
        "Admin rejected credit refund request"
    );

    Ok(Json(RejectCreditRefundRequestResponse {
        rejected: true,
        refund_request_id: id,
    }))
}

/// POST /admin/credits/refund-requests/:id/process
pub async fn process_credit_refund_request<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
    Json(input): Json<ProcessCreditRefundRequestInput>,
) -> Result<Json<ProcessCreditRefundRequestResponse>, AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;

    if input.amount_lamports <= 0 {
        return Err(AppError::Validation(
            "Refund amount must be positive".into(),
        ));
    }
    if input.reason.trim().is_empty() {
        return Err(AppError::Validation("Reason is required".into()));
    }

    let refund_request = state
        .credit_refund_request_repo
        .find_by_id(id)
        .await?
        .ok_or_else(|| AppError::NotFound("Refund request not found".into()))?;

    if refund_request.status == CreditRefundRequestStatus::Processed {
        let currency = refund_request.currency.clone();
        let new_balance = state
            .credit_repo
            .get_balance(refund_request.user_id, &refund_request.currency)
            .await?;
        return Ok(Json(ProcessCreditRefundRequestResponse {
            processed: true,
            refund_request_id: refund_request.id,
            processed_transaction_id: refund_request.processed_transaction_id.ok_or_else(|| {
                AppError::Internal(anyhow::anyhow!(
                    "Processed refund request missing processed_transaction_id"
                ))
            })?,
            processed_amount_lamports: refund_request.processed_amount_lamports.ok_or_else(
                || {
                    AppError::Internal(anyhow::anyhow!(
                        "Processed refund request missing processed_amount_lamports"
                    ))
                },
            )?,
            currency,
            new_balance_lamports: new_balance,
        }));
    }

    // Ensure admin cannot refund more than user requested
    if input.amount_lamports > refund_request.amount_lamports {
        return Err(AppError::Validation(
            "Processed amount cannot exceed requested amount".into(),
        ));
    }

    // Fetch original transaction and enforce over-refund protection
    let original_tx = state
        .credit_repo
        .find_transaction_by_id(refund_request.original_transaction_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Original transaction not found".into()))?;

    if original_tx.user_id != refund_request.user_id {
        return Err(AppError::Validation(
            "Refund request user does not match original transaction".into(),
        ));
    }

    if !original_tx
        .currency
        .eq_ignore_ascii_case(&refund_request.currency)
    {
        return Err(AppError::Validation(
            "Refund request currency does not match original transaction".into(),
        ));
    }

    if original_tx.amount <= 0 {
        return Err(AppError::Validation(
            "Only positive credit transactions can be refunded".into(),
        ));
    }

    let already_refunded = state
        .credit_repo
        .sum_positive_adjustments_by_reference(
            refund_request.user_id,
            &refund_request.currency,
            "refund",
            refund_request.original_transaction_id,
        )
        .await?;

    let remaining = original_tx.amount - already_refunded;
    if input.amount_lamports > remaining {
        return Err(AppError::Validation(
            "Refund amount exceeds remaining refundable amount".into(),
        ));
    }

    // Issue an idempotent refund adjustment
    let tx = CreditTransactionEntity::new_refund_adjustment(
        refund_request.user_id,
        input.amount_lamports,
        &refund_request.currency,
        admin_id,
        refund_request.id,
        refund_request.original_transaction_id,
        &input.reason,
    );
    let idempotency_key = tx
        .idempotency_key
        .clone()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Missing idempotency key")))?;

    let new_balance = match state
        .credit_repo
        .add_credit(
            refund_request.user_id,
            input.amount_lamports,
            &refund_request.currency,
            tx,
        )
        .await
    {
        Ok(b) => b,
        Err(AppError::Internal(e)) => {
            // If duplicate idempotency, treat as already processed.
            if let Some(sqlx::Error::Database(db_err)) = e.downcast_ref::<sqlx::Error>() {
                if db_err.code().as_deref() == Some("23505") {
                    let existing = state
                        .credit_repo
                        .find_transaction_by_idempotency_key(
                            refund_request.user_id,
                            &idempotency_key,
                        )
                        .await?
                        .ok_or_else(|| {
                            AppError::Internal(anyhow::anyhow!(
                                "Duplicate refund idempotency key but transaction not found"
                            ))
                        })?;

                    // Mark the request processed if it wasn't already.
                    let _ = state
                        .credit_refund_request_repo
                        .mark_processed(
                            refund_request.id,
                            admin_id,
                            input.amount_lamports,
                            existing.id,
                            input.reason.clone(),
                        )
                        .await?;

                    let bal = state
                        .credit_repo
                        .get_balance(refund_request.user_id, &refund_request.currency)
                        .await?;
                    return Ok(Json(ProcessCreditRefundRequestResponse {
                        processed: true,
                        refund_request_id: refund_request.id,
                        processed_transaction_id: existing.id,
                        processed_amount_lamports: input.amount_lamports,
                        currency: refund_request.currency,
                        new_balance_lamports: bal,
                    }));
                }
            }
            return Err(AppError::Internal(e));
        }
        Err(e) => return Err(e),
    };

    let marked = state
        .credit_refund_request_repo
        .mark_processed(
            refund_request.id,
            admin_id,
            input.amount_lamports,
            // tx.id is consumed; fetch by idempotency to get it back
            state
                .credit_repo
                .find_transaction_by_idempotency_key(refund_request.user_id, &idempotency_key)
                .await?
                .ok_or_else(|| {
                    AppError::Internal(anyhow::anyhow!("Refund transaction created but not found"))
                })?
                .id,
            input.reason.clone(),
        )
        .await?;

    tracing::info!(
        admin_id = %admin_id,
        refund_request_id = %marked.id,
        user_id = %refund_request.user_id,
        processed_amount_lamports = input.amount_lamports,
        currency = %refund_request.currency,
        original_transaction_id = %refund_request.original_transaction_id,
        reason = %input.reason,
        "Admin processed credit refund request"
    );

    Ok(Json(ProcessCreditRefundRequestResponse {
        processed: true,
        refund_request_id: marked.id,
        processed_transaction_id: marked.processed_transaction_id.ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!(
                "Processed refund request missing processed_transaction_id"
            ))
        })?,
        processed_amount_lamports: marked.processed_amount_lamports.ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!(
                "Processed refund request missing processed_amount_lamports"
            ))
        })?,
        currency: marked.currency,
        new_balance_lamports: new_balance,
    }))
}
