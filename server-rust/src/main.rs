//! Cedros Login Server - Standalone binary
//!
//! Run with:
//! ```bash
//! cargo run
//! # or
//! cedros-login-server
//! ```

use cedros_login::services::{
    DiscordNotificationService, LogEmailService, LogNotificationService, OutboxWorker,
    OutboxWorkerConfig, PostmarkEmailService, TelegramNotificationService,
};
use cedros_login::utils::TokenCipher;
use cedros_login::{
    create_micro_batch_worker, create_withdrawal_worker, router_with_storage, Config, NoopCallback,
    Storage,
};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;
use tokio::signal;
use tokio_util::sync::CancellationToken;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables from .env file
    dotenvy::dotenv().ok();

    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "cedros_login=debug,tower_http=debug,axum=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load configuration
    let config = Config::from_env()?;
    let addr = format!("{}:{}", config.server.host, config.server.port);

    info!("Starting Cedros Login Server");

    // Initialize storage (Postgres if DATABASE_URL is set, otherwise in-memory)
    let storage = Storage::from_config(&config.database).await?;
    if config.database.url.is_some() {
        info!("Using PostgreSQL storage");
    } else {
        info!("Using in-memory storage (set DATABASE_URL for PostgreSQL)");
    }

    info!("Listening on {}", addr);

    // Create shutdown channel for cleanup task
    let (cleanup_shutdown_tx, cleanup_shutdown_rx) = tokio::sync::watch::channel(false);

    // Start background cleanup task (runs every hour)
    const CLEANUP_INTERVAL_SECS: u64 = 3600;
    let cleanup_handle = storage.start_cleanup_task(CLEANUP_INTERVAL_SECS, cleanup_shutdown_rx);

    // Start outbox worker for async email/notification delivery
    // Configure email service based on environment
    let email_service: Arc<dyn cedros_login::services::EmailService> = match (
        std::env::var("POSTMARK_API_TOKEN"),
        std::env::var("POSTMARK_FROM_EMAIL"),
    ) {
        (Ok(api_token), Ok(from_email)) => {
            info!("Using Postmark email service");
            Arc::new(PostmarkEmailService::try_new(api_token, from_email)?)
        }
        _ => {
            info!("Using log-only email service (set POSTMARK_API_TOKEN and POSTMARK_FROM_EMAIL for real emails)");
            Arc::new(LogEmailService::new())
        }
    };

    // Configure notification service based on environment
    let notification_service: Arc<dyn cedros_login::services::NotificationService> = if config
        .notification
        .discord_enabled()
    {
        info!("Using Discord notification service");
        Arc::new(DiscordNotificationService::new(
            config
                .notification
                .discord_webhook_url
                .clone()
                .expect("discord_webhook_url required when discord_enabled()"),
            config.notification.environment.clone(),
        ))
    } else if config.notification.telegram_enabled() {
        info!("Using Telegram notification service");
        Arc::new(TelegramNotificationService::new(
            config
                .notification
                .telegram_bot_token
                .clone()
                .expect("telegram_bot_token required when telegram_enabled()"),
            config
                .notification
                .telegram_chat_id
                .clone()
                .expect("telegram_chat_id required when telegram_enabled()"),
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
        .unwrap_or_else(|| "http://localhost:3000".to_string());
    let token_cipher = TokenCipher::new(&config.jwt.secret);
    let outbox_worker_handle = OutboxWorker::new(
        storage.outbox_repo.clone(),
        email_service,
        notification_service.clone(),
        OutboxWorkerConfig::default(),
        base_url,
        token_cipher,
    )
    .start(cancel_token.clone());

    // Create settings service for runtime-configurable values (from database)
    let settings_service = Arc::new(cedros_login::services::SettingsService::new(
        storage.system_settings_repo.clone(),
    ));

    // Start withdrawal worker for Privacy Cash deposits (if enabled)
    let withdrawal_worker_handle = create_withdrawal_worker(
        &config,
        &storage,
        settings_service.clone(),
        notification_service,
        cancel_token.clone(),
    );
    if withdrawal_worker_handle.is_some() {
        info!("Withdrawal worker started for Privacy Cash deposits");
    }

    // Start micro batch worker for SOL micro deposits (if enabled)
    let micro_batch_worker_handle =
        create_micro_batch_worker(&config, &storage, settings_service, cancel_token.clone());
    if micro_batch_worker_handle.is_some() {
        info!("Micro batch worker started for SOL micro deposits");
    }

    // Create router with storage backend
    let callback = Arc::new(NoopCallback);
    let app = router_with_storage(config, callback, storage);

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

    // Wait for withdrawal worker to finish (if running)
    if let Some(handle) = withdrawal_worker_handle {
        if tokio::time::timeout(shutdown_timeout, handle)
            .await
            .is_err()
        {
            info!("Withdrawal worker shutdown timed out");
        }
    }

    // Wait for micro batch worker to finish (if running)
    if let Some(handle) = micro_batch_worker_handle {
        if tokio::time::timeout(shutdown_timeout, handle)
            .await
            .is_err()
        {
            info!("Micro batch worker shutdown timed out");
        }
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
        signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("Failed to install SIGTERM handler")
            .recv()
            .await;
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
