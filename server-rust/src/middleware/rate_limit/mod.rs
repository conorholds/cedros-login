//! Rate limiting middleware for auth endpoints
//!
//! Implements a sliding window rate limiter to protect against brute force attacks.
//!
//! # Backends
//!
//! Two backends are available:
//!
//! - **memory** (default): In-memory store, suitable for single-instance deployments
//! - **redis**: Redis-backed store, suitable for multi-instance deployments
//!   (requires `redis-rate-limit` feature)
//!
//! # Multi-Instance Deployments
//!
//! For load-balanced deployments with multiple server instances:
//! - Use `RATE_LIMIT_STORE=redis` with `REDIS_URL` configured
//! - Or use `REPLICAS` env var for automatic per-instance limit adjustment
//! - Or use external rate limiting (Cloudflare, AWS WAF)

mod layer;
#[cfg(feature = "redis-rate-limit")]
mod redis_store;
mod store;
mod types;

pub use layer::{KeyExtractor, RateLimitLayer, RateLimitService};
#[cfg(feature = "redis-rate-limit")]
pub use redis_store::RedisRateLimitStore;
pub use store::RateLimitStore;
pub use types::{RateLimitBackend, RateLimitConfig, RateLimitError, RateLimitResult};
