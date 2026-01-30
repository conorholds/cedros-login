# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **F-19**: Partial withdrawal support for timing analysis protection
  - `PARTIAL_WITHDRAWAL_COUNT` config (default 0 = disabled)
  - `PARTIAL_WITHDRAWAL_MIN_LAMPORTS` config (default 0.5 SOL)
  - Up to N sessions per batch withdraw random 30-70% of remaining balance
  - Sessions below minimum threshold always fully withdrawn (avoid fee overhead)
  - Track cumulative `withdrawn_amount_lamports` across multiple withdrawal cycles
  - Admin status endpoint includes partial withdrawal configuration

- **F-18**: Withdrawal percentage config for timing analysis protection
  - `WITHDRAWAL_PERCENTAGE` config (1-100, default 100)
  - Spread withdrawals over multiple cycles by processing only a percentage per batch

## [0.2.1] - 2026-01-09

### Security

- Encrypt TOTP secrets at rest in Postgres with configurable encryption secret fallback
- Detect refresh token reuse across revoked sessions and queue security alerts
- Enforce step-up authentication for MFA enrollment and track strong-auth timestamps
- Apply WebAuthn configuration for authenticator selection and user verification policy
- Add per-email throttling for password reset and instant-link flows
- Default email verification to required in production and warn on insecure config
- Normalize OAuth and SSO emails to prevent duplicate account creation
- Add no-referrer link attributes to auth email templates to reduce token leakage
- Validate OIDC provider issuer scheme and required scopes for SSO readiness

## [0.2.0] - 2026-01-06

### Security

- **S-14**: TOTP replay protection - each code can only be used once
- **S-16**: Username-less WebAuthn via discoverable credentials
- **S-17**: Webhook URL validation prevents DNS rebinding
- **S-19**: OIDC state parameter properly generated and validated
- **S-21**: Encryption key versioning for safe key rotation
- **S-22**: TOTP secrets encrypted at rest (AES-256-GCM)
- **S-23**: Session ID included in audit log entries

### Changed

- Production config validation enforces `COOKIE_SECURE=true`
- Production config validation enforces explicit `CORS_ORIGINS`
- Cookie secure flag defaults to `true` in production environment

### Added

- Config validation tests for CORS production requirements
- `docs/security-guarantees.md` with detailed security documentation
- TOTP clock skew documentation (90-second window)
- JWT signing algorithm guidance (HS256 vs RS256)
- Session binding limitations and recommendations

## [0.1.0] - 2026-01-05

### Added

- **Authentication Methods**
  - Email/password registration and login with Argon2id hashing
  - Google OAuth via ID token verification with JWK caching
  - Solana wallet sign-in with Ed25519 signature verification
  - Instant link passwordless authentication
  - TOTP-based MFA with recovery codes

- **Multi-Tenancy**
  - Organization creation and management
  - User memberships with role-based access
  - Email invitations with configurable expiry
  - Organization context switching

- **Access Control**
  - Built-in roles: Owner, Admin, Member, Viewer
  - Custom role definitions with granular permissions
  - ABAC policies for fine-grained authorization
  - Authorization API endpoint

- **Security**
  - JWT access/refresh token rotation
  - HTTP-only secure cookie support
  - CSRF protection (double-submit cookie)
  - Sliding window rate limiting
  - Progressive login lockout
  - New device security alerts
  - Comprehensive audit logging

- **Communications**
  - Outbox pattern for reliable async delivery
  - Email templates for all auth flows
  - Exponential backoff retry

- **Storage**
  - PostgreSQL with sqlx migrations
  - In-memory storage for development

- **Library Features**
  - `router()` and `router_with_storage()` for embedding
  - `AuthCallback` trait for custom integrations
  - `EmailService` trait for custom email providers
  - Configurable via environment variables

### Security

- Constant-time comparison for recovery codes
- Argon2id password hashing with secure defaults
- JWT signature verification with key rotation support

[Unreleased]: https://github.com/conorholds/cedros-login/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/conorholds/cedros-login/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/conorholds/cedros-login/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/conorholds/cedros-login/releases/tag/v0.1.0
