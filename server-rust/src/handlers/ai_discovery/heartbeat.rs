//! Heartbeat endpoint for health monitoring
//!
//! - /heartbeat.md - Human and machine readable health status

use axum::extract::State;
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::Json;
use chrono::Utc;
use std::sync::Arc;

use super::types::{HeartbeatResponse, ServiceStatus};
use crate::callback::AuthCallback;
use crate::services::EmailService;
use crate::AppState;

/// GET /heartbeat.md - Health status in markdown format
pub async fn heartbeat_md<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let base = get_base_path(&state);
    let timestamp = Utc::now().to_rfc3339();

    // Check database connectivity (only when postgres feature enabled)
    #[cfg(feature = "postgres")]
    let db_healthy = if let Some(pool) = &state.postgres_pool {
        sqlx::query("SELECT 1").execute(pool).await.is_ok()
    } else {
        true // In-memory mode, consider healthy
    };

    #[cfg(not(feature = "postgres"))]
    let db_healthy = true;

    let status = if db_healthy { "healthy" } else { "degraded" };
    let status_emoji = if db_healthy { "+" } else { "!" };

    let content = format!(
        r#"---
status: {status}
version: "1.0.0"
timestamp: "{timestamp}"
services:
  auth: true
  database: {db_healthy}
  wallet: true
---

# Cedros Login Health Status

**Status**: {status}
**Version**: 1.0.0
**Timestamp**: {timestamp}

## Service Status

| Service | Status |
|---------|--------|
| Authentication | [{status_emoji}] Online |
| Database | [{db_status}] {db_text} |
| Wallet Service | [{status_emoji}] Online |

## Endpoints

| Endpoint | Purpose |
|----------|---------|
| {base}/llms.txt | API summary |
| {base}/skill.md | Skill index |
| {base}/discovery | Auth config |
| {base}/openapi.json | Full API spec |

## Quick Health Check

```bash
curl -s {base}/heartbeat.md | head -10
```

## JSON Health Check

```bash
curl -s {base}/heartbeat.json
```
"#,
        status = status,
        timestamp = timestamp,
        db_healthy = db_healthy,
        status_emoji = status_emoji,
        db_status = if db_healthy { "+" } else { "!" },
        db_text = if db_healthy { "Connected" } else { "Degraded" },
        base = base
    );

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/markdown; charset=utf-8")],
        content,
    )
        .into_response()
}

/// GET /heartbeat.json - Health status in JSON format
pub async fn heartbeat_json<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    // Check database connectivity (only when postgres feature enabled)
    #[cfg(feature = "postgres")]
    let db_healthy = if let Some(pool) = &state.postgres_pool {
        sqlx::query("SELECT 1").execute(pool).await.is_ok()
    } else {
        true
    };

    #[cfg(not(feature = "postgres"))]
    let db_healthy = true;

    let response = HeartbeatResponse {
        status: if db_healthy {
            "healthy".to_string()
        } else {
            "degraded".to_string()
        },
        version: "1.0.0".to_string(),
        timestamp: Utc::now().to_rfc3339(),
        services: ServiceStatus {
            auth: true,
            database: db_healthy,
            wallet: true,
        },
    };

    (StatusCode::OK, Json(response)).into_response()
}

fn get_base_path<C: AuthCallback, E: EmailService>(state: &AppState<C, E>) -> String {
    let base_path = state.config.server.auth_base_path.trim_end_matches('/');
    if base_path.is_empty() {
        String::new()
    } else {
        base_path.to_string()
    }
}
