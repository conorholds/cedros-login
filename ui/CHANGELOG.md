# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.16] - 2026-09-12

### Changed

- Updated transitive dependencies and overrides to resolve current npm
  advisories.
- Replaced the MIT license with the source-available PILL-1.0.0 license.

### Fixed

- Session management now protects the current session and handles individual
  and bulk revocation deterministically.

## [1.0.15] - 2026-09-08

### Added

- **Invite-code unlock celebration.** A successful invite-code redemption
  now plays a full success moment (seal pop with drawn check, shockwave
  ring, confetti burst, staggered copy) and reveals any subscription
  discount the code granted as a coupon-styled badge. The login-state
  commit is deferred behind the new `redeemInviteCode(..., { deferLoginSuccess })`
  option and `completeInviteRedemption` so the surrounding auth UI cannot
  swap to its signed-in state mid-celebration. Motion collapses under the
  global `prefers-reduced-motion` guard.
- Admin invite-code manager gains a "Subscription discount (% off)" field
  and a Discount column; `AuthResponse.inviteDiscount` and
  `InviteCode.discountPercent` types.

## [0.0.56] - 2026-05-27

### Changed

- **Consolidated admin sidebar.** The Cedros Login admin module now
  registers exactly three sidebar entries (`users`, `team`, `login`) on
  the shared AdminShell instead of nine. The new `Login` page renders
  Auth / Email / Webhooks / Server / Images / Team Access / Activity as
  internal tabs, gated per-tab via `pluginContext.hasPermission`. Tab
  selection is reflected in the `?loginTab=` query parameter for
  shareable links. The new `Login` section's `replacesSectionIds` carries
  every legacy id so the host removes the old sidebar entries and migrates
  persisted permission configurations.
- **WAI-ARIA Tabs pattern.** The Login tablist now supports
  ArrowLeft / ArrowRight / Home / End keyboard navigation with automatic
  activation, a roving `tabindex` so the tablist takes a single Tab stop,
  proper `aria-controls`/`aria-labelledby` wiring, and a top-level
  section heading that names the page for screen readers.

### Added

- `HostAdminIconName` (string-literal union) and `HOST_ADMIN_ICON_NAMES`
  exported from `./extension` so `sectionIcons` values are typed against
  the host's documented vocabulary at compile time.
- `LoginAdminSection` component (default export of
  `./sections/LoginAdminSection`) — lazy-loads each tab's content so the
  admin bundle doesn't pull every settings surface upfront.

### Removed

- `CEDROS_LOGIN_SECTION_IDS.{settingsAuth,settingsEmail,settingsWebhooks,
  settingsServer,settingsImages,activity}` and
  `CEDROS_LOGIN_ADMIN_SECTION_IDS.{accountSettings,teamInvites,settingsAuth,
  settingsEmail,settingsWebhooks,settingsServer,settingsImages,activity}`.
  Consumers should switch to `CEDROS_LOGIN_ADMIN_SECTION_IDS.login` and
  let the new `LoginAdminSection` render the per-feature tabs.
- `DashboardSection` no longer includes `settings-wallet`, `settings-auth`,
  `settings-email`, `settings-webhooks`, `settings-server`,
  `settings-images`. Persisted blobs that still contain these keys
  deserialize cleanly (extra keys are preserved silently).

## [0.1.0] - 2026-01-05

### Added

- **Authentication Components**
  - `LoginButton` - Customizable login trigger button
  - `LoginModal` - Modal dialog with all auth methods
  - `LoginForm` - Inline form with tabbed auth methods
  - `EmailLoginForm` - Email/password login form
  - `EmailRegisterForm` - Registration with password validation
  - `PasswordInput` - Password field with strength indicator
  - `ForgotPasswordForm` - Password reset request
  - `ResetPasswordForm` - Password reset completion
  - `GoogleLoginButton` - Google OAuth sign-in
  - `SolanaLoginButton` - Solana wallet sign-in

- **Organization Components**
  - `OrgSelector` - Organization selection dropdown
  - `OrgSwitcher` - Context switcher for multi-org users
  - `MemberList` - Organization member management
  - `InviteForm` - Send organization invitations
  - `InviteList` - Manage pending invitations
  - `SessionList` - View and revoke active sessions
  - `AdminPanel` - Combined admin interface with tabs

- **Shared Components**
  - `LoadingSpinner` - Loading state indicator
  - `ErrorMessage` - Error display component
  - `ErrorBoundary` - React error boundary wrapper

- **Hooks**
  - `useAuth` - Core authentication state and actions
  - `useEmailAuth` - Email/password specific operations
  - `useGoogleAuth` - Google OAuth operations
  - `useSolanaAuth` - Solana wallet operations
  - `usePasswordReset` - Password reset flow
  - `useOrgs` - Organization management
  - `useMembers` - Member management
  - `useInvites` - Invitation management
  - `useSessions` - Session management
  - `useAuthorize` - Permission checking

- **Provider & Context**
  - `CedrosLoginProvider` - Main context provider
  - `useCedrosLogin` - Access auth context anywhere

- **Internationalization**
  - `I18nProvider` - Translation context provider
  - `useTranslations` - Access translation strings
  - `useLocale` - Get/set current locale
  - `defaultTranslations` - English translations
  - `mergeTranslations` - Extend with custom translations

- **Bundle Optimization**
  - `@cedros/login-react/email-only` - Minimal email-only bundle (~15KB)
  - `@cedros/login-react/google-only` - Google OAuth bundle (~25KB)
  - `@cedros/login-react/solana-only` - Solana wallet bundle (~120KB)
  - `@cedros/login-react/style.css` - Stylesheet import

- **Utilities**
  - `validatePassword` - Password strength validation
  - Comprehensive TypeScript types for all APIs

### Security

- XSS-safe HTML sanitization for user content
- CSRF token handling for all API requests
- Secure token storage with configurable backends
- Rate limiting hooks for brute force protection

[Unreleased]: https://github.com/conorholds/cedros-login/compare/v1.0.16...HEAD
[1.0.16]: https://github.com/conorholds/cedros-login/releases/tag/v1.0.16
[1.0.15]: https://github.com/conorholds/cedros-login/releases/tag/v1.0.15
[0.1.0]: https://github.com/conorholds/cedros-login/releases/tag/v0.1.0
