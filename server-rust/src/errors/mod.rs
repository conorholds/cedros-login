//! Error types for the authentication server

// H-10: Standardized forbidden error message constants
// Word order: "owners and admins" (higher permission first)

/// User is not a member of the organization
pub const ERR_NOT_A_MEMBER: &str = "Not a member of this organization";

/// Action requires at least admin role
pub const ERR_ADMIN_REQUIRED: &str = "Only owners and admins can perform this action";

/// Action requires owner role
pub const ERR_OWNER_REQUIRED: &str = "Only owners can perform this action";

/// Action requires system administrator
pub const ERR_SYSTEM_ADMIN_REQUIRED: &str = "Only system administrators can access this resource";

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;
use thiserror::Error;

use crate::repositories::RepositoryError;

/// Application error type
#[derive(Debug, Error)]
pub enum AppError {
    #[error("Invalid credentials")]
    InvalidCredentials,

    #[error("Account locked: {0}")]
    AccountLocked(String),

    #[error("Email already exists")]
    EmailExists,

    #[error("Wallet already exists")]
    WalletExists,

    #[error("Invalid token")]
    InvalidToken,

    #[error("Token expired")]
    TokenExpired,

    #[error("Invalid signature")]
    InvalidSignature,

    #[error("Challenge expired")]
    ChallengeExpired,

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Rate limited")]
    RateLimited,

    /// SEC-04: Rate limited with custom message (e.g., MFA lockout with retry time)
    #[error("Too many requests: {0}")]
    TooManyRequests(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Forbidden: {0}")]
    Forbidden(String),

    #[error("Internal server error")]
    Internal(#[from] anyhow::Error),

    #[error("Database error")]
    Database(String),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Service unavailable: {0}")]
    ServiceUnavailable(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Step-up authentication required")]
    StepUpRequired,
}

/// Error code for API responses
#[derive(Debug, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ErrorCode {
    InvalidCredentials,
    AccountLocked,
    EmailExists,
    WalletExists,
    InvalidToken,
    TokenExpired,
    InvalidSignature,
    ChallengeExpired,
    ValidationError,
    RateLimited,
    NotFound,
    Forbidden,
    Unauthorized,
    StepUpRequired,
    ServiceUnavailable,
    ServerError,
}

/// Error response body
#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub code: ErrorCode,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<serde_json::Value>,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message) = match &self {
            AppError::InvalidCredentials => (
                StatusCode::UNAUTHORIZED,
                ErrorCode::InvalidCredentials,
                self.to_string(),
            ),
            AppError::AccountLocked(msg) => (
                StatusCode::TOO_MANY_REQUESTS,
                ErrorCode::AccountLocked,
                msg.clone(),
            ),
            AppError::EmailExists => (
                StatusCode::CONFLICT,
                ErrorCode::EmailExists,
                self.to_string(),
            ),
            AppError::WalletExists => (
                StatusCode::CONFLICT,
                ErrorCode::WalletExists,
                self.to_string(),
            ),
            AppError::InvalidToken => (
                StatusCode::UNAUTHORIZED,
                ErrorCode::InvalidToken,
                self.to_string(),
            ),
            AppError::TokenExpired => (
                StatusCode::UNAUTHORIZED,
                ErrorCode::TokenExpired,
                self.to_string(),
            ),
            AppError::InvalidSignature => (
                StatusCode::UNAUTHORIZED,
                ErrorCode::InvalidSignature,
                self.to_string(),
            ),
            AppError::ChallengeExpired => (
                StatusCode::BAD_REQUEST,
                ErrorCode::ChallengeExpired,
                self.to_string(),
            ),
            AppError::Validation(msg) => (
                StatusCode::BAD_REQUEST,
                ErrorCode::ValidationError,
                msg.clone(),
            ),
            AppError::RateLimited => (
                StatusCode::TOO_MANY_REQUESTS,
                ErrorCode::RateLimited,
                self.to_string(),
            ),
            AppError::TooManyRequests(msg) => (
                StatusCode::TOO_MANY_REQUESTS,
                ErrorCode::RateLimited,
                msg.clone(),
            ),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, ErrorCode::NotFound, msg.clone()),
            AppError::Forbidden(msg) => (StatusCode::FORBIDDEN, ErrorCode::Forbidden, msg.clone()),
            AppError::ServiceUnavailable(msg) => (
                StatusCode::SERVICE_UNAVAILABLE,
                ErrorCode::ServiceUnavailable,
                msg.clone(),
            ),
            AppError::Unauthorized(msg) => (
                StatusCode::UNAUTHORIZED,
                ErrorCode::Unauthorized,
                msg.clone(),
            ),
            AppError::StepUpRequired => (
                StatusCode::FORBIDDEN,
                ErrorCode::StepUpRequired,
                self.to_string(),
            ),
            AppError::Internal(_) | AppError::Database(_) | AppError::Config(_) => {
                // Avoid logging internal error details at error level since they may contain
                // secrets/PII. The current span should already include request context (e.g.
                // request id) when present.
                let kind = match &self {
                    AppError::Internal(_) => "internal",
                    AppError::Database(_) => "database",
                    AppError::Config(_) => "config",
                    _ => "unknown",
                };
                tracing::error!(
                    error_kind = %kind,
                    error_code = ?ErrorCode::ServerError,
                    "Request failed"
                );
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    ErrorCode::ServerError,
                    "Internal server error".to_string(),
                )
            }
        };

        let body = ErrorResponse {
            code,
            message,
            details: None,
        };

        (status, Json(body)).into_response()
    }
}

// Allow using anyhow::Error with AppError
impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Internal(err.into())
    }
}

impl From<RepositoryError> for AppError {
    fn from(err: RepositoryError) -> Self {
        match err {
            RepositoryError::Database(msg) => AppError::Database(msg),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use http_body_util::BodyExt;

    #[test]
    fn test_error_code_serialization() {
        let code = ErrorCode::InvalidCredentials;
        let json = serde_json::to_string(&code).unwrap();
        assert_eq!(json, "\"INVALID_CREDENTIALS\"");

        let code = ErrorCode::EmailExists;
        let json = serde_json::to_string(&code).unwrap();
        assert_eq!(json, "\"EMAIL_EXISTS\"");

        let code = ErrorCode::RateLimited;
        let json = serde_json::to_string(&code).unwrap();
        assert_eq!(json, "\"RATE_LIMITED\"");
    }

    #[test]
    fn test_error_response_serialization() {
        let response = ErrorResponse {
            code: ErrorCode::ValidationError,
            message: "Invalid email format".to_string(),
            details: None,
        };

        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"code\":\"VALIDATION_ERROR\""));
        assert!(json.contains("\"message\":\"Invalid email format\""));
        assert!(!json.contains("details")); // None should be skipped
    }

    #[test]
    fn test_error_response_with_details() {
        let response = ErrorResponse {
            code: ErrorCode::ValidationError,
            message: "Validation failed".to_string(),
            details: Some(serde_json::json!({"field": "email", "reason": "invalid format"})),
        };

        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"details\""));
        assert!(json.contains("\"field\":\"email\""));
    }

    #[test]
    fn test_app_error_display() {
        assert_eq!(
            AppError::InvalidCredentials.to_string(),
            "Invalid credentials"
        );
        assert_eq!(AppError::EmailExists.to_string(), "Email already exists");
        assert_eq!(AppError::WalletExists.to_string(), "Wallet already exists");
        assert_eq!(AppError::InvalidToken.to_string(), "Invalid token");
        assert_eq!(AppError::TokenExpired.to_string(), "Token expired");
        assert_eq!(AppError::InvalidSignature.to_string(), "Invalid signature");
        assert_eq!(AppError::ChallengeExpired.to_string(), "Challenge expired");
        assert_eq!(AppError::RateLimited.to_string(), "Rate limited");
        assert_eq!(
            AppError::Validation("test error".to_string()).to_string(),
            "Validation error: test error"
        );
    }

    #[test]
    fn test_app_error_from_io_error() {
        let io_error = std::io::Error::new(std::io::ErrorKind::NotFound, "file not found");
        let app_error: AppError = io_error.into();
        assert!(matches!(app_error, AppError::Internal(_)));
    }

    #[test]
    fn test_all_error_codes_serialize() {
        // Ensure all error codes serialize correctly
        let codes = vec![
            ErrorCode::InvalidCredentials,
            ErrorCode::EmailExists,
            ErrorCode::WalletExists,
            ErrorCode::InvalidToken,
            ErrorCode::TokenExpired,
            ErrorCode::InvalidSignature,
            ErrorCode::ChallengeExpired,
            ErrorCode::ValidationError,
            ErrorCode::RateLimited,
            ErrorCode::ServerError,
        ];

        for code in codes {
            let json = serde_json::to_string(&code).unwrap();
            assert!(json.starts_with('"') && json.ends_with('"'));
            // Should be SCREAMING_SNAKE_CASE
            let inner = &json[1..json.len() - 1];
            assert!(inner.chars().all(|c| c.is_uppercase() || c == '_'));
        }
    }

    #[tokio::test]
    async fn test_internal_errors_do_not_leak_details_to_client() {
        let response = AppError::Database("db: password=secret".to_string()).into_response();
        assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let body_str = std::str::from_utf8(&body).unwrap();
        assert!(body_str.contains("\"code\":\"SERVER_ERROR\""));
        assert!(body_str.contains("\"message\":\"Internal server error\""));
        assert!(!body_str.contains("password=secret"));

        let response = AppError::Config("JWT_SECRET=supersecret".to_string()).into_response();
        assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let body_str = std::str::from_utf8(&body).unwrap();
        assert!(body_str.contains("\"code\":\"SERVER_ERROR\""));
        assert!(body_str.contains("\"message\":\"Internal server error\""));
        assert!(!body_str.contains("supersecret"));
    }
}
