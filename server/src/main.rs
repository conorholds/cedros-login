//! Cedros Login Server - Standalone binary
//!
//! Run with:
//! ```bash
//! cargo run
//! # or
//! cedros-login
//! ```

#[cfg(feature = "redis-rate-limit")]
use cedros_login::middleware::rate_limit::RedisRateLimitStore;
use cedros_login::services::{
    configure_standalone_email_service, init_logging, init_metrics, DiscordNotificationService,
    EmailDeliveryCapability, EncryptionService, LogNotificationService, OutboxWorker,
    OutboxWorkerConfig, TelegramNotificationService,
};
use cedros_login::utils::TokenCipher;
use cedros_login::{
    router_with_preloaded_settings_and_email_delivery, Config, NoopCallback, Storage,
};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;
use tokio::signal;
use tokio_util::sync::CancellationToken;
use tracing::info;

fn is_production_like_environment(environment: &str) -> bool {
    let env_lc = environment.trim().to_ascii_lowercase();
    !matches!(env_lc.as_str(), "dev" | "development" | "local" | "test")
}

#[cfg(feature = "redis-rate-limit")]
async fn verify_rate_limit_backend(config: &Config) -> Result<(), std::io::Error> {
    if !config.rate_limit.enabled || config.rate_limit.store != "redis" {
        return Ok(());
    }

    let redis_url = config.rate_limit.redis_url.as_deref().ok_or_else(|| {
        std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "REDIS_URL is required when RATE_LIMIT_STORE=redis",
        )
    })?;

    let store = RedisRateLimitStore::new(redis_url).map_err(|e| {
        std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            format!("Failed to configure Redis rate limit backend: {e}"),
        )
    })?;

    store.ping().await.map_err(|e| {
        std::io::Error::new(
            std::io::ErrorKind::ConnectionRefused,
            format!("Failed to connect to Redis rate limit backend: {e}"),
        )
    })?;

    Ok(())
}

#[cfg(not(feature = "redis-rate-limit"))]
async fn verify_rate_limit_backend(_config: &Config) -> Result<(), std::io::Error> {
    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables from .env file
    dotenvy::dotenv().ok();

    // Initialize tracing with reloadable filter (allows runtime log level changes)
    let logging_service = init_logging("cedros_login=info,tower_http=info,axum=info");

    // Initialize Prometheus metrics
    let _metrics_handle = init_metrics();

    // Load configuration from environment (infrastructure + defaults)
    let mut config = Config::from_env_for_settings_merge()?;
    if config.database.url.is_none()
        && is_production_like_environment(&config.notification.environment)
    {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "DATABASE_URL is required in production-like environments",
        )
        .into());
    }
    info!("Starting Cedros Login Server");

    // Initialize storage (Postgres if DATABASE_URL is set, otherwise in-memory)
    let storage = Storage::from_config(&config.database).await?;
    if config.database.url.is_some() {
        info!("Using PostgreSQL storage");
    } else {
        info!("Using in-memory storage (set DATABASE_URL for PostgreSQL)");
    }

    let settings_encryption = EncryptionService::from_secret(&config.jwt.secret);
    let settings_service = Arc::new(cedros_login::services::SettingsService::with_encryption(
        storage.system_settings_repo.clone(),
        settings_encryption,
    ));
    settings_service.refresh().await?;
    config.apply_db_settings(&settings_service).await?;
    verify_rate_limit_backend(&config).await?;
    let addr = format!("{}:{}", config.server.host, config.server.port);
    info!("Loaded and applied system settings (configure via admin dashboard)");
    if let Err(e) = logging_service.apply_from_settings(&settings_service).await {
        tracing::warn!(error = %e, "Failed to apply logging settings");
    }

    let configured_email = configure_standalone_email_service(
        std::env::var("POSTMARK_API_TOKEN").ok(),
        std::env::var("POSTMARK_FROM_EMAIL").ok(),
        &config.notification.environment,
    )?;
    let email_delivery_capability = configured_email.capability;
    match email_delivery_capability {
        EmailDeliveryCapability::Delivering => info!("Using Postmark email service"),
        EmailDeliveryCapability::DevelopmentLog => info!("Using local log-only email service"),
        EmailDeliveryCapability::Unavailable => info!("Email delivery provider is unavailable"),
    }
    let email_service = configured_email.service;

    info!("Listening on {}", addr);

    // Create shutdown channel for cleanup task
    let (cleanup_shutdown_tx, cleanup_shutdown_rx) = tokio::sync::watch::channel(false);

    // Start background cleanup task (runs every hour)
    const CLEANUP_INTERVAL_SECS: u64 = 3600;
    let cleanup_handle = storage.start_cleanup_task(CLEANUP_INTERVAL_SECS, cleanup_shutdown_rx);

    // Configure notification service based on environment
    let notification_service: Arc<dyn cedros_login::services::NotificationService> = if config
        .notification
        .discord_enabled()
    {
        info!("Using Discord notification service");
        let webhook_url = config
            .notification
            .discord_webhook_url
            .clone()
            .ok_or("discord_webhook_url required when DISCORD_WEBHOOK_URL is set")?;
        Arc::new(DiscordNotificationService::new(
            webhook_url,
            config.notification.environment.clone(),
        ))
    } else if config.notification.telegram_enabled() {
        info!("Using Telegram notification service");
        let bot_token = config
            .notification
            .telegram_bot_token
            .clone()
            .ok_or("telegram_bot_token required when TELEGRAM_BOT_TOKEN is set")?;
        let chat_id = config
            .notification
            .telegram_chat_id
            .clone()
            .ok_or("telegram_chat_id required when TELEGRAM_CHAT_ID is set")?;
        Arc::new(TelegramNotificationService::new(
            bot_token,
            chat_id,
            config.notification.environment.clone(),
        ))
    } else {
        info!("Using log-only notification service (set DISCORD_WEBHOOK_URL or TELEGRAM_BOT_TOKEN for real notifications)");
        Arc::new(LogNotificationService::new())
    };

    // Create cancellation token for graceful shutdown of background workers
    let cancel_token = CancellationToken::new();

    // Start the outbox worker with cancellation support
    let base_url = config
        .server
        .frontend_url
        .clone()
        .unwrap_or_else(|| "http://localhost:57164".to_string());
    let token_cipher = TokenCipher::new(&config.jwt.secret);

    let outbox_worker_handle = OutboxWorker::new(
        storage.outbox_repo.clone(),
        email_service,
        notification_service.clone(),
        OutboxWorkerConfig::default(),
        base_url,
        token_cipher,
    )
    .with_settings(settings_service.clone())
    .start(cancel_token.clone());

    // Create router with storage backend
    let callback = Arc::new(NoopCallback);
    let app = router_with_preloaded_settings_and_email_delivery(
        config,
        callback,
        storage,
        settings_service,
        email_delivery_capability,
    );

    // Start server with graceful shutdown
    let listener = TcpListener::bind(&addr).await?;
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .with_graceful_shutdown(shutdown_signal())
    .await?;

    // Signal workers to shut down gracefully
    info!("Signaling workers to shut down...");
    cancel_token.cancel();
    let _ = cleanup_shutdown_tx.send(true);

    // Wait for outbox worker to finish current batch (with timeout)
    let shutdown_timeout = tokio::time::Duration::from_secs(30);
    if tokio::time::timeout(shutdown_timeout, outbox_worker_handle)
        .await
        .is_err()
    {
        info!("Outbox worker shutdown timed out");
    }

    // Wait for cleanup task to finish gracefully (with timeout)
    if tokio::time::timeout(shutdown_timeout, cleanup_handle)
        .await
        .is_err()
    {
        info!("Cleanup task shutdown timed out");
    }

    info!("Server shutdown complete");
    Ok(())
}

/// Create a future that resolves when a shutdown signal is received
async fn shutdown_signal() {
    let ctrl_c = async {
        match signal::ctrl_c().await {
            Ok(()) => {}
            Err(e) => {
                tracing::error!(error = %e, "Failed to install Ctrl+C handler, shutdown signal may not work properly");
                // Wait indefinitely since we can't listen for Ctrl+C
                std::future::pending::<()>().await;
            }
        }
    };

    #[cfg(unix)]
    let terminate = async {
        match signal::unix::signal(signal::unix::SignalKind::terminate()) {
            Ok(mut stream) => {
                stream.recv().await;
            }
            Err(e) => {
                tracing::error!(error = %e, "Failed to install SIGTERM handler, SIGTERM signal may not work properly");
                // Wait indefinitely since we can't listen for SIGTERM
                std::future::pending::<()>().await;
            }
        }
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {
            info!("Received Ctrl+C, initiating graceful shutdown...");
        }
        _ = terminate => {
            info!("Received SIGTERM, initiating graceful shutdown...");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::is_production_like_environment;

    #[test]
    fn production_like_environment_detection() {
        assert!(is_production_like_environment("production"));
        assert!(is_production_like_environment("staging"));
        assert!(!is_production_like_environment("development"));
        assert!(!is_production_like_environment("test"));
    }
}
