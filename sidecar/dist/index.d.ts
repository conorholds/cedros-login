/**
 * Cedros Login Sidecar
 *
 * A Node.js sidecar service used by the Rust backend. This wraps the Privacy Cash SDK
 * and provides related Solana utilities (verification, batching, swaps).
 * Required because the Privacy Cash SDK is JavaScript-only and requires a modern Node.js runtime.
 * Current package engines target Node.js 20+.
 *
 * Endpoints:
 * - GET  /health         - Health check (no auth required)
 * - POST /deposit/build  - Build unsigned deposit transaction
 * - POST /deposit/submit - Submit signed deposit transaction
 * - POST /withdraw       - Withdraw note to company wallet
 *
 * All endpoints except /health require Bearer token auth.
 */
export {};
