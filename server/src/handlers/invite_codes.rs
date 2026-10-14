//! Invite-code gate, admin management, and account code handlers.

use axum::{
    extract::{Path, Query, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::handlers::admin::validate_system_admin;
use crate::handlers::auth::call_registered_callback_with_timeout;
use crate::models::{AuthMethod, AuthResponse};
use crate::repositories::{
    generate_api_key, hash_verification_token, ApiKeyEntity, AuditEventType, InviteCodeEntity,
    InviteCodeUpdate, NullableUpdate, PendingInviteRedemptionOutcome, SessionEntity,
};
use crate::services::{EmailService, InviteCodeDiscount};
use crate::utils::{
    authenticate, build_json_response_with_cookies, compute_authenticated_post_login,
    get_default_org_context, hash_refresh_token, user_entity_to_auth_user,
};
use crate::AppState;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RedeemInviteCodeRequest {
    pub pending_invite_token: String,
    pub code: String,
}

#[derive(Debug, Deserialize)]
pub struct ListInviteCodesQuery {
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateInviteCodeRequest {
    pub code: Option<String>,
    pub max_uses: Option<i32>,
    pub starts_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub discount_percent: Option<i32>,
    pub discount_months: Option<i32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInviteCodeRequest {
    pub code: Option<String>,
    #[serde(default)]
    pub max_uses: PatchValue<i32>,
    #[serde(default)]
    pub starts_at: PatchValue<DateTime<Utc>>,
    #[serde(default)]
    pub expires_at: PatchValue<DateTime<Utc>>,
    pub active: Option<bool>,
    #[serde(default)]
    pub discount_percent: PatchValue<i32>,
    #[serde(default)]
    pub discount_months: PatchValue<i32>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InviteCodeResponse {
    pub id: Uuid,
    pub code: String,
    pub max_uses: Option<i32>,
    pub uses_count: i32,
    pub starts_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub active: bool,
    pub owner_user_id: Option<Uuid>,
    pub discount_percent: Option<i32>,
    pub discount_months: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListInviteCodesResponse {
    pub codes: Vec<InviteCodeResponse>,
}

/// Discount granted by a redeemed invite code, embedded in the redeem response
/// (additive field) and served by `GET /account/invite-discount` for billing.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InviteDiscountInfo {
    /// Percent off the subscription price (1-100; 100 = free).
    pub percent_off: i32,
    pub duration_months: Option<i32>,
    /// The invite code that granted the discount.
    pub code: String,
}

/// Redeem response: the standard auth response plus the granted discount, so
/// the client can reveal the reward the moment the code is accepted.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct RedeemInviteCodeResponse {
    #[serde(flatten)]
    auth: AuthResponse,
    #[serde(skip_serializing_if = "Option::is_none")]
    invite_discount: Option<InviteDiscountInfo>,
}

/// Body of `GET /account/invite-discount`: the caller's held discount or null.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InviteDiscountResponse {
    pub discount: Option<InviteDiscountGrantView>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InviteDiscountGrantView {
    pub percent_off: i32,
    pub duration_months: Option<i32>,
    pub code: String,
    pub redeemed_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Default)]
pub enum PatchValue<T> {
    #[default]
    Unchanged,
    Set(Option<T>),
}

impl<'de, T> Deserialize<'de> for PatchValue<T>
where
    T: Deserialize<'de>,
{
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        Option::<T>::deserialize(deserializer).map(Self::Set)
    }
}

impl<T> From<PatchValue<T>> for NullableUpdate<T> {
    fn from(value: PatchValue<T>) -> Self {
        match value {
            PatchValue::Unchanged => Self::Unchanged,
            PatchValue::Set(next) => Self::Set(next),
        }
    }
}

pub async fn redeem_invite_code<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<RedeemInviteCodeRequest>,
) -> Result<impl IntoResponse, AppError> {
    let token_hash = hash_verification_token(&req.pending_invite_token);
    let (user_id, redeemed) = match state
        .storage
        .pending_invite_redemption_repo
        .redeem(&token_hash, &req.code)
        .await?
    {
        PendingInviteRedemptionOutcome::Redeemed {
            user_id,
            invite_code,
        } => (user_id, invite_code),
        PendingInviteRedemptionOutcome::InvalidToken => return Err(AppError::InvalidToken),
        PendingInviteRedemptionOutcome::InvalidCode => {
            return Err(AppError::Forbidden(
                "Invalid or unavailable invite code".into(),
            ))
        }
    };
    let user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;
    let verification_required = state
        .settings_service
        .email_verification_required(state.config.email.require_verification)
        .await?;

    let invite_discount = redeemed
        .discount_percent
        .map(|percent_off| InviteDiscountInfo {
            percent_off,
            duration_months: redeemed.discount_months,
            code: redeemed.code.clone(),
        });
    if verification_required && !user.email_verified {
        let response = RedeemInviteCodeResponse {
            auth: AuthResponse {
                user: user_entity_to_auth_user(&user),
                tokens: None,
                is_new_user: true,
                callback_data: None,
                api_key: None,
                email_queued: None,
                invite_code_required: None,
                pending_invite_token: None,
                method: Some(AuthMethod::Email),
                post_login: None,
            },
            invite_discount,
        };
        return Ok((StatusCode::OK, Json(response)).into_response());
    }

    complete_invite_code_registration(&state, &headers, user, invite_discount).await
}

/// GET /account/invite-discount — the authenticated user's subscription
/// discount from a redeemed invite code, or `{"discount": null}`. Read by
/// billing (Cedros Pay) at checkout to apply invite-granted discounts.
pub async fn get_account_invite_discount<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<InviteDiscountResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let discount = state
        .invite_code_service
        .find_redeemed_discount(auth.user_id)
        .await?
        .map(|grant| InviteDiscountGrantView {
            percent_off: grant.percent_off,
            duration_months: grant.duration_months,
            code: grant.code,
            redeemed_at: grant.redeemed_at,
        });
    Ok(Json(InviteDiscountResponse { discount }))
}

pub async fn list_account_invite_codes<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
) -> Result<Json<ListInviteCodesResponse>, AppError> {
    let auth = authenticate(&state, &headers).await?;
    let codes = state
        .invite_code_service
        .list_or_create_user_codes(auth.user_id)
        .await?
        .into_iter()
        .filter(is_available_user_code)
        .map(Into::into)
        .collect();
    Ok(Json(ListInviteCodesResponse { codes }))
}

pub async fn list_admin_invite_codes<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Query(query): Query<ListInviteCodesQuery>,
) -> Result<Json<ListInviteCodesResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;
    let codes = state
        .invite_code_service
        .list_admin(query.limit.unwrap_or(50), query.offset.unwrap_or(0))
        .await?
        .into_iter()
        .map(Into::into)
        .collect();
    Ok(Json(ListInviteCodesResponse { codes }))
}

pub async fn create_admin_invite_code<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<CreateInviteCodeRequest>,
) -> Result<(StatusCode, Json<InviteCodeResponse>), AppError> {
    let admin_id = validate_system_admin(&state, &headers).await?;
    let code = state
        .invite_code_service
        .create_admin_code(
            req.code.as_deref(),
            admin_id,
            req.max_uses,
            req.starts_at,
            req.expires_at,
            InviteCodeDiscount {
                percent: req.discount_percent,
                months: req.discount_months,
            },
        )
        .await?;
    Ok((StatusCode::CREATED, Json(code.into())))
}

pub async fn update_admin_invite_code<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateInviteCodeRequest>,
) -> Result<Json<InviteCodeResponse>, AppError> {
    validate_system_admin(&state, &headers).await?;
    let code = state
        .invite_code_service
        .update_admin_code(
            id,
            InviteCodeUpdate {
                code: req.code,
                max_uses: req.max_uses.into(),
                starts_at: req.starts_at.into(),
                expires_at: req.expires_at.into(),
                active: req.active,
                discount_percent: req.discount_percent.into(),
                discount_months: req.discount_months.into(),
            },
        )
        .await?;
    Ok(Json(code.into()))
}

pub async fn delete_admin_invite_code<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    validate_system_admin(&state, &headers).await?;
    state.invite_code_service.delete_admin_code(id).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn complete_invite_code_registration<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    headers: &HeaderMap,
    user: crate::repositories::UserEntity,
    invite_discount: Option<InviteDiscountInfo>,
) -> Result<axum::response::Response, AppError> {
    let memberships = state.membership_repo.find_by_user(user.id).await?;
    let token_context =
        get_default_org_context(&memberships, user.is_system_admin, user.email_verified);
    let session_id = Uuid::new_v4();
    let token_pair =
        state
            .jwt_service
            .generate_token_pair_with_context(user.id, session_id, &token_context)?;
    let refresh_expiry =
        Utc::now() + Duration::seconds(state.jwt_service.refresh_expiry_secs() as i64);
    let mut session = SessionEntity::new_with_id(
        session_id,
        user.id,
        hash_refresh_token(&token_pair.refresh_token, &state.config.jwt.secret),
        refresh_expiry,
        None,
        None,
    );
    session.last_strong_auth_at = Some(Utc::now());
    state
        .storage
        .credential_lifecycle_repo
        .create_session_if_current(&user, session)
        .await?;

    let raw_api_key = generate_api_key();
    state
        .api_key_repo
        .create(ApiKeyEntity::new(user.id, &raw_api_key, "default"))
        .await?;

    let auth_user = user_entity_to_auth_user(&user);
    let payload = AuthCallbackPayload {
        user: auth_user.clone(),
        method: AuthMethod::Email,
        is_new_user: true,
        session_id: session_id.to_string(),
        ip_address: None,
        user_agent: None,
        referral: None,
    };
    let callback_data = call_registered_callback_with_timeout(&state.callback, &payload).await;
    let _ = state
        .audit_service
        .log_user_event(AuditEventType::UserRegister, user.id, Some(headers))
        .await;

    let response_tokens = if state.config.cookie.enabled {
        None
    } else {
        Some(token_pair.clone())
    };
    let response = RedeemInviteCodeResponse {
        auth: AuthResponse {
            user: auth_user,
            tokens: response_tokens,
            is_new_user: true,
            callback_data,
            api_key: Some(raw_api_key),
            email_queued: None,
            invite_code_required: None,
            pending_invite_token: None,
            method: Some(AuthMethod::Email),
            post_login: compute_authenticated_post_login(
                &user,
                &token_pair.access_token,
                &state.settings_service,
                &*state.totp_repo,
                &*state.credential_repo,
                &state.subscription_selection_service,
            )
            .await?,
        },
        invite_discount,
    };

    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}

fn is_available_user_code(code: &InviteCodeEntity) -> bool {
    code.active && code.uses_count == 0 && code.is_available_at(Utc::now())
}

impl From<InviteCodeEntity> for InviteCodeResponse {
    fn from(code: InviteCodeEntity) -> Self {
        Self {
            id: code.id,
            code: code.code,
            max_uses: code.max_uses,
            uses_count: code.uses_count,
            starts_at: code.starts_at,
            expires_at: code.expires_at,
            active: code.active,
            owner_user_id: code.owner_user_id,
            discount_percent: code.discount_percent,
            discount_months: code.discount_months,
            created_at: code.created_at,
            updated_at: code.updated_at,
        }
    }
}
