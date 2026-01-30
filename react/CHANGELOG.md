# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/conorholds/cedros-login/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/conorholds/cedros-login/releases/tag/v0.1.0
