# @cedros/login-react

[![npm version](https://img.shields.io/npm/v/@cedros/login-react.svg)](https://www.npmjs.com/package/@cedros/login-react)
[![npm downloads](https://img.shields.io/npm/dm/@cedros/login-react.svg)](https://www.npmjs.com/package/@cedros/login-react)
[![license](https://img.shields.io/npm/l/@cedros/login-react.svg)](https://github.com/conorholds/cedros-login/blob/main/ui/LICENSE)

> **Warning: Development Preview**
>
> This package is in early development (v0.0.x) and is **not ready for production use**. APIs may change without notice. Use at your own risk.

React component library for authentication with email/password, Google OAuth, Apple Sign In, Solana wallet, instant links, and multi-tenancy support.
Supports embedded Solana wallets through SSS and private deposits and account credits through Privacy Cash.

## Installation

```bash
npm install @cedros/login-react
# or
yarn add @cedros/login-react
# or
pnpm add @cedros/login-react
```

### Optional: Solana Wallet Support

For Solana wallet authentication, install the wallet adapter packages:

```bash
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js
```

## Quick Start

```tsx
import { CedrosLoginProvider, LoginButton, useCedrosLogin } from '@cedros/login-react';
import '@cedros/login-react/style.css';

function App() {
  return (
    <CedrosLoginProvider
      config={{
        serverUrl: 'http://localhost:8080',
        features: {
          email: true,
          google: true,
          apple: true,
          solana: true,
        },
      }}
    >
      <AuthStatus />
    </CedrosLoginProvider>
  );
}

function AuthStatus() {
  const { user, isAuthenticated, logout } = useCedrosLogin();

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  return (
    <div>
      <p>Welcome, {user?.name || user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Features

- **Multiple Auth Methods**: Email/password, Google OAuth, Apple Sign In, Solana wallet, instant links, WebAuthn/Passkeys
- **WebAuthn/Passkeys**: Passwordless login with TouchID, FaceID, Windows Hello, or security keys
- **Username-less Login**: Discoverable credentials allow login without entering email first
- **Multi-Tenancy**: Organization management, member invites, role-based access
- **Session Management**: View and revoke active sessions
- **Credential Management**: View and manage all authentication methods
- **MFA Support**: TOTP two-factor authentication with QR setup, recovery codes, and verification
- **i18n Ready**: Built-in translations with customization support
- **Theming**: Light/dark mode with CSS variable customization
- **TypeScript**: Full type definitions included
- **Tree-Shakeable**: Import only what you need

## Components

### Authentication

| Component | Description |
|-----------|-------------|
| `LoginButton` | Button that opens the login modal |
| `LoginModal` | Full authentication modal with all methods |
| `LoginForm` | Standalone login form |
| `EmailLoginForm` | Email/password login form |
| `EmailRegisterForm` | Registration form with password validation |
| `GoogleLoginButton` | Google sign-in button |
| `AppleLoginButton` | Apple Sign In button |
| `SolanaLoginButton` | Solana wallet connect button |
| `PasswordInput` | Password field with visibility toggle and strength meter |
| `ForgotPasswordForm` | Password reset request form |
| `ResetPasswordForm` | Password reset form with token |
| `PasskeyPrompt` | WebAuthn passkey registration/authentication prompt |

### WebAuthn / Passkeys

| Component | Description |
|-----------|-------------|
| `PasskeyPrompt` | Modal for passkey registration or authentication |
| `PasskeyList` | List registered passkeys with management options |

### Embedded Wallet (Server-Side Signing)

| Component | Description |
|-----------|-------------|
| `WalletEnrollment` | Full enrollment flow with auth method selection |
| `WalletStatus` | Shows wallet state (not enrolled/locked/unlocked) |
| `WalletAddressRow` | Wallet address display with copy + explorer link |
| `WalletUnlock` | Unlock prompt for session-based signing |
| `WalletManager` | Orchestrates status/enroll/unlock/recover in one flow |
| `RecoveryPhraseDisplay` | Shows 24-word phrase with copy/confirm |
| `RecoveryPhraseInput` | Input for recovery phrase entry |
| `CapabilityWarning` | Browser capability check (WebCrypto, etc.) |

### Organizations

| Component | Description |
|-----------|-------------|
| `OrgSelector` | Dropdown to select active organization |
| `OrgSwitcher` | Modal to switch organizations or create new ones |

### Members & Invites

| Component | Description |
|-----------|-------------|
| `MemberList` | List org members with role management |
| `InviteForm` | Form to invite new members by email |
| `InviteList` | List and manage pending invites |

### Sessions

| Component | Description |
|-----------|-------------|
| `SessionList` | List active sessions with revoke option |

### Two-Factor Authentication (TOTP)

| Component | Description |
|-----------|-------------|
| `TotpSettings` | Settings panel to enable/disable 2FA, regenerate recovery codes |
| `TotpSetup` | Step-by-step wizard for setting up TOTP |
| `TotpVerify` | Verification prompt during login |
| `OtpInput` | 6-digit code input component |

### Privacy Cash (Deposits & Credits)

| Component | Description |
|-----------|-------------|
| `DepositForm` | Create new privacy deposits (amount input, wallet signing) |
| `CreditBalance` | Display current SOL credit balance |
| `CreditHistory` | Transaction history (deposits, spends) with pagination |
| `DepositStatus` | Single deposit status card with progress indicator |
| `DepositList` | User's deposit history with status filtering |

### Privacy Cash Admin (System Admin Only)

| Component | Description |
|-----------|-------------|
| `AdminDepositStats` | Aggregate statistics (totals, pending, withdrawn, failed) |
| `AdminDepositList` | All deposits across users with status filtering |
| `AdminWithdrawalQueue` | Deposits ready for withdrawal processing |
| `PrivacyCashAdminPanel` | Combined tabbed admin interface |

### Credentials

| Component | Description |
|-----------|-------------|
| `CredentialList` | List all authentication methods (passwords, passkeys, OAuth) |
| `CredentialCard` | Individual credential display with management options |

### Admin

| Component | Description |
|-----------|-------------|
| `AdminPanel` | Admin dashboard with tabs for members, invites, sessions, system settings |
| `SystemSettings` | System settings editor (privacy, withdrawal, rate limits) - system admin only |

### Shared

| Component | Description |
|-----------|-------------|
| `LoadingSpinner` | Loading indicator |
| `ErrorMessage` | Error display component |

### LoginButton Customization

The `LoginButton` component shows a "Sign in" button when logged out, and a user menu with dropdown when authenticated. You can customize the dropdown menu items:

```tsx
import { LoginButton, LoginModal } from '@cedros/login-react';

function Navbar() {
  return (
    <nav>
      <LoginButton
        menuItems={[
          {
            label: 'Account settings',
            onClick: () => navigate('/settings'),
          },
          {
            label: 'Billing',
            onClick: () => navigate('/billing'),
          },
        ]}
      />
      <LoginModal />
    </nav>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'outline' \| 'ghost'` | `'default'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `menuItems` | `MenuItemConfig[]` | `[]` | Custom menu items above "Sign out" |
| `hideSignOut` | `boolean` | `false` | Hide the default "Sign out" item |
| `className` | `string` | `''` | Additional CSS classes |
| `children` | `ReactNode` | `'Sign in'` | Custom button text (logged out state) |

**MenuItemConfig:**

```tsx
interface MenuItemConfig {
  label: string;      // Display text
  onClick: () => void; // Click handler
  icon?: ReactNode;   // Optional icon element
}
```

**Dark navbar styling:**

```tsx
// Use the built-in dark navbar class
<LoginButton className="cedros-button-dark-navbar" />
```

## Hooks

### Authentication

```tsx
// Main authentication hook
const {
  user,              // Current user or null
  isAuthenticated,   // Boolean auth status
  isLoading,         // Loading state
  login,             // Login function
  register,          // Registration function
  logout,            // Logout function
  refreshToken,      // Refresh access token
} = useCedrosLogin();

// Email-specific auth
const {
  login,
  register,
  isLoading,
  error,
} = useEmailAuth();

// Google OAuth
const {
  login,
  isLoading,
  error,
} = useGoogleAuth();

// Solana wallet
const {
  login,
  challenge,
  isLoading,
  error,
} = useSolanaAuth();

// Apple Sign In
const {
  login,
  isLoading,
  error,
} = useAppleAuth();

// WebAuthn / Passkeys
const {
  registerPasskey,    // Start passkey registration
  authenticatePasskey, // Start passkey authentication
  isSupported,        // Browser supports WebAuthn
  isLoading,
  error,
} = useWebAuthn();

// Password reset
const {
  requestReset,     // Send password reset email
  resetPassword,    // Reset with token
  isLoading,
  error,
} = usePasswordReset();

// TOTP / Two-Factor Authentication
const {
  status,            // { enabled: boolean, recoveryCodesRemaining: number } or null
  isLoading,
  error,
  getStatus,         // Fetch current 2FA status
  beginSetup,        // Initiate setup (returns otpauthUri + secret + recovery codes)
  enableTotp,        // Enable with verification code
  disableTotp,       // Disable with password confirmation
  regenerateBackupCodes, // Get new recovery codes (requires TOTP code)
  clearError,
} = useTotp();

// TOTP Verification (during login)
const {
  verifyTotp,        // Complete login MFA (submit TOTP code or recovery code)
  isLoading,
  error,
} = useTotpVerify();

// Wallet status and capabilities
const {
  status,            // 'not_enrolled' | 'enrolled_locked' | 'enrolled_unlocked'
  solanaPubkey,      // Base58 public key (if enrolled)
  authMethod,        // 'password' | 'passkey'
  hasExternalWallet, // User logged in with Solana wallet (not SSS)
  isUnlocked,        // Whether SSS wallet is unlocked
  capabilities,      // Browser capability check
  refresh,           // Refresh wallet status
  error,
} = useWallet();

// Wallet enrollment
const {
  startEnrollment,   // Begin enrollment flow
  completeEnrollment, // Finish with shares
  isLoading,
  error,
} = useWalletEnrollment();

// Wallet material API (low-level operations)
const {
  getMaterial,       // Get wallet material
  getStatus,         // Get wallet status
  enroll,            // Enroll new wallet
  signTransaction,   // Sign transaction
  unlock,            // Unlock for session-based signing (returns { unlocked, ttlSeconds })
  lock,              // Lock wallet (clear cached key)
  rotateUserSecret,  // Re-encrypt Share A with new credential
  isLoading,
  error,
} = useWalletMaterial();

// Wallet signing (high-level)
const {
  signTransaction,   // Sign transaction (prompts for credential if needed)
  isSigning,
  error,
} = useWalletSigning();

// Unified transaction signing (routes to external or SSS wallet)
const {
  signTransaction,   // Auto-routes to correct wallet type
  signingMethod,     // 'external' | 'sss' | 'none'
  canSign,           // Whether user can sign transactions
  publicKey,         // Solana public key
  hasExternalWallet,
  hasSssWallet,
  isSssUnlocked,
  isSigning,
  error,
} = useTransactionSigning({
  // For external wallet users, provide adapter callback
  onExternalSign: (tx) => walletAdapter.signTransaction(tx),
});
```

### Organizations

```tsx
const {
  orgs,             // List of user's organizations
  activeOrg,        // Currently selected organization
  isLoading,
  error,
  createOrg,        // Create new organization
  updateOrg,        // Update organization details
  deleteOrg,        // Delete organization
  switchOrg,        // Switch active organization
  refetch,          // Refresh org list
} = useOrgs();
```

### Members

```tsx
const {
  members,          // List of organization members
  isLoading,
  error,
  updateRole,       // Change member's role
  removeMember,     // Remove member from org
  refetch,
} = useMembers(orgId);
```

### Invites

```tsx
const {
  invites,          // List of pending invites
  isLoading,
  error,
  createInvite,     // Send new invite
  cancelInvite,     // Cancel pending invite
  resendInvite,     // Resend invite email
  acceptInvite,     // Accept invite (by invitee)
  refetch,
} = useInvites(orgId);
```

### Sessions

```tsx
const {
  sessions,         // List of active sessions
  isLoading,
  error,
  revokeAll,        // Revoke all sessions (logout everywhere)
  refetch,
} = useSessions();
```

### Privacy Cash (Deposits & Credits)

```tsx
// User deposit operations
const {
  deposit,          // Execute a deposit (returns DepositResponse)
  getStatus,        // Get deposit status by session ID
  getConfig,        // Get deposit configuration (min amount, etc.)
  listDeposits,     // List user's deposits with pagination
  isLoading,
  error,
  clearError,
} = useDeposit();

// User credit operations
const {
  getBalance,       // Get SOL credit balance
  getAllBalances,   // Get all currency balances
  getHistory,       // Get transaction history with pagination
  isLoading,
  error,
  clearError,
} = useCredits();

// Admin operations (requires system admin privileges)
const {
  listDeposits,           // List all deposits across users
  getStats,               // Get aggregate statistics
  listPendingWithdrawals, // List deposits ready for withdrawal
  processWithdrawal,      // Process single withdrawal (with optional force for early)
  processAllWithdrawals,  // Process all ready withdrawals
  isLoading,
  error,
  clearError,
} = useAdminDeposits();

// System settings (requires system admin privileges)
const {
  settings,          // Settings grouped by category { privacy: [...], withdrawal: [...], rate_limit: [...] }
  isLoading,
  isUpdating,
  error,
  fetchSettings,     // Refresh settings from server
  updateSettings,    // Update multiple settings: [{ key, value }, ...]
  getValue,          // Get single setting value by key
} = useSystemSettings();

// Process a single withdrawal
const result = await processWithdrawal(sessionId, { force: false });
// result: { success, sessionId, txSignature?, error?, earlyWithdrawal }

// Force early withdrawal (before privacy period - shows warning in UI)
const result = await processWithdrawal(sessionId, { force: true });

// Process all ready withdrawals (past privacy period only)
const batchResult = await processAllWithdrawals();
// batchResult: { totalProcessed, totalSucceeded, totalFailed, results }
```

### Credentials

```tsx
const {
  credentials,       // List of all auth methods (password, passkeys, OAuth)
  isLoading,
  error,
  updateCredential,  // Update credential label
  unlinkCredential,  // Remove credential (if not last one)
  refetch,
} = useCredentials();
```

### Authorization

```tsx
const {
  checkPermission,  // Check if action is allowed
  isLoading,
  error,
} = useAuthorize();

// Usage
const canInvite = await checkPermission({
  orgId: 'org-123',
  action: 'member:invite',
  resourceType: 'member',
});
```

## Configuration

### Apple Sign In (Web)

This library uses Apple's JS SDK in popup mode and initializes it with:

- `redirectURI: window.location.origin`

To avoid popup flows hanging or failing to return an `id_token`, configure your Apple Services ID
with a Return URL that exactly matches your site's origin.

Example:

- If your login page is served from `https://login.example.com/...`, set a Return URL of
  `https://login.example.com`.

Note: Apple Sign In generally requires HTTPS and a verified domain.

### WebAuthn / Passkeys (Server-managed)

This library supports **server-managed passkeys** (WebAuthn) for authentication via:

- `POST /webauthn/auth/options` -> `navigator.credentials.get(...)` -> `POST /webauthn/auth/verify`
- `POST /webauthn/register/options` -> `navigator.credentials.create(...)` -> `POST /webauthn/register/verify`

Server requirements:

- `WEBAUTHN_ENABLED=true`
- `WEBAUTHN_RP_ID=<domain>` (e.g. `login.example.com` or `example.com`)
- `WEBAUTHN_RP_ORIGIN=<origin>` (e.g. `https://login.example.com`)

Browser requirements:

- HTTPS (secure context)

The `LoginForm` includes a "Continue with Passkey" button by default. Disable it with:

```ts
features: { webauthn: false }
```

```tsx
<CedrosLoginProvider
  config={{
    // Required
    serverUrl: 'http://localhost:8080',

    // Feature flags
    features: {
      email: true,           // Email/password auth
      google: true,          // Google OAuth
      solana: false,         // Solana wallet
    },

    // Google OAuth
    googleClientId: 'your-google-client-id',

    // Apple Sign In (Services ID)
    appleClientId: 'com.your.app.service',

    // Solana wallet
    solana: {
      network: 'mainnet-beta', // 'mainnet-beta' | 'devnet' | 'testnet'
    },

    // Session storage
    session: {
      // Recommended: cookie storage (tokens in httpOnly cookies)
      storage: 'cookie', // 'cookie' | 'localStorage' | 'sessionStorage' | 'memory'

      // If you must use web storage (XSS-vulnerable), you must explicitly opt in:
      // storage: 'localStorage',
      // allowWebStorage: true,
      persistKey: 'cedros_auth',
    },

    // Two-factor authentication
    totp: {
      enabled: true,          // Show 2FA options
      required: false,        // Require all users to enable 2FA
      issuer: 'MyApp',        // Name shown in authenticator apps
    },

    // Embedded wallet (server-side signing)
    wallet: {
      exposeAvailability: true, // Expose via window global for cedros-pay
      // Server config: WALLET_ENABLED, WALLET_RECOVERY_MODE, WALLET_UNLOCK_TTL
    },

    // Theming
    theme: 'auto',            // 'light' | 'dark' | 'auto'
    themeOverrides: {
      '--cedros-primary': '#6366f1',
      '--cedros-destructive': '#ef4444',
    },

    // Callbacks
    callbacks: {
      onLoginSuccess: (user) => console.log('User logged in:', user),
      onLogout: () => console.log('User logged out'),
      onLoginError: (error) => console.error('Auth error:', error),
    },
  }}
>
  {children}
</CedrosLoginProvider>
```

## Bundle Optimization

Import only the auth methods you need to reduce bundle size:

```tsx
// Email only (smallest bundle)
import { EmailLoginForm, useEmailAuth } from '@cedros/login-react/email-only';

// Google only
import { GoogleLoginButton, useGoogleAuth } from '@cedros/login-react/google-only';

// Solana only
import { SolanaLoginButton, useSolanaAuth } from '@cedros/login-react/solana-only';
```

## Styling

### Using Default Styles

```tsx
import '@cedros/login-react/style.css';
```

### CSS Variables

Customize the theme using CSS variables:

```css
:root {
  /* Colors */
  --cedros-primary: #6366f1;
  --cedros-primary-hover: #4f46e5;
  --cedros-error: #ef4444;
  --cedros-success: #22c55e;
  --cedros-text: #1f2937;
  --cedros-text-muted: #6b7280;
  --cedros-bg: #ffffff;
  --cedros-bg-muted: #f3f4f6;
  --cedros-border: #e5e7eb;

  /* Typography */
  --cedros-font-family: system-ui, sans-serif;
  --cedros-font-size-sm: 0.875rem;
  --cedros-font-size-base: 1rem;
  --cedros-font-size-lg: 1.125rem;

  /* Spacing */
  --cedros-radius: 0.5rem;
  --cedros-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Dark mode */
[data-theme='dark'] {
  --cedros-text: #f9fafb;
  --cedros-text-muted: #9ca3af;
  --cedros-bg: #1f2937;
  --cedros-bg-muted: #374151;
  --cedros-border: #4b5563;
}
```

## Internationalization

### Using Built-in Translations

```tsx
import { I18nProvider, CedrosLoginProvider } from '@cedros/login-react';

<I18nProvider locale="en">
  <CedrosLoginProvider config={config}>
    {children}
  </CedrosLoginProvider>
</I18nProvider>
```

### Custom Translations

```tsx
import { I18nProvider, mergeTranslations, defaultTranslations } from '@cedros/login-react';

const customTranslations = mergeTranslations(defaultTranslations, {
  en: {
    login: {
      title: 'Welcome Back',
      submit: 'Sign In',
    },
  },
});

<I18nProvider translations={customTranslations} locale="en">
  {children}
</I18nProvider>
```

### Using Translations in Components

```tsx
import { useTranslations, useLocale } from '@cedros/login-react';

function MyComponent() {
  const t = useTranslations();
  const { locale, setLocale } = useLocale();

  return (
    <div>
      <h1>{t.login.title}</h1>
      <button onClick={() => setLocale('es')}>
        Switch to Spanish
      </button>
    </div>
  );
}
```

## Examples

### Basic Login Page

```tsx
import { CedrosLoginProvider, LoginForm } from '@cedros/login-react';
import '@cedros/login-react/style.css';

export function LoginPage() {
  return (
    <CedrosLoginProvider
      config={{
        serverUrl: '/api/auth',
        features: { email: true, google: true },
      }}
    >
      <div className="login-container">
        <h1>Sign In</h1>
        <LoginForm
          onSuccess={(user) => {
            window.location.href = '/dashboard';
          }}
        />
      </div>
    </CedrosLoginProvider>
  );
}
```

### Organization Switcher

```tsx
import { useOrgs, OrgSwitcher } from '@cedros/login-react';

function Header() {
  const { activeOrg } = useOrgs();
  const [showSwitcher, setShowSwitcher] = useState(false);

  return (
    <header>
      <button onClick={() => setShowSwitcher(true)}>
        {activeOrg?.name || 'Select Organization'}
      </button>
      {showSwitcher && (
        <OrgSwitcher
          onClose={() => setShowSwitcher(false)}
          onSwitch={(org) => {
            console.log('Switched to:', org.name);
            setShowSwitcher(false);
          }}
        />
      )}
    </header>
  );
}
```

### Team Management

```tsx
import { useMembers, useInvites, MemberList, InviteForm, InviteList } from '@cedros/login-react';
import { useOrgs } from '@cedros/login-react';

function TeamSettings() {
  const { activeOrg } = useOrgs();
  const orgId = activeOrg?.id;

  if (!orgId) return <p>Select an organization</p>;

  return (
    <div>
      <h2>Team Members</h2>
      <MemberList orgId={orgId} />

      <h2>Invite New Member</h2>
      <InviteForm
        orgId={orgId}
        onSuccess={() => console.log('Invite sent!')}
      />

      <h2>Pending Invites</h2>
      <InviteList orgId={orgId} />
    </div>
  );
}
```

### Session Management

```tsx
import { useSessions, SessionList } from '@cedros/login-react';

function SecuritySettings() {
  const { revokeAll, isLoading } = useSessions();

  return (
    <div>
      <h2>Active Sessions</h2>
      <SessionList />

      <button
        onClick={revokeAll}
        disabled={isLoading}
      >
        Logout from all devices
      </button>
    </div>
  );
}
```

### Two-Factor Authentication

```tsx
import { TotpSettings, TotpSetup, TotpVerify } from '@cedros/login-react';

// Settings page - enable/disable 2FA
function SecuritySettings() {
  return (
    <div>
      <h2>Two-Factor Authentication</h2>
      <TotpSettings
        onStatusChange={(enabled) => {
          console.log('2FA is now', enabled ? 'enabled' : 'disabled');
        }}
      />
    </div>
  );
}

// Standalone setup wizard (if you need custom placement)
function TwoFactorSetupPage() {
  return (
    <TotpSetup
      onSuccess={() => {
        window.location.href = '/settings';
      }}
      onCancel={() => {
        window.location.href = '/settings';
      }}
    />
  );
}

// Custom verification UI during login
function TwoFactorChallenge({ onSuccess, email }) {
  return (
    <TotpVerify
      email={email}
      onSuccess={onSuccess}
      onCancel={() => window.location.href = '/login'}
    />
  );
}
```

### Embedded Wallet

```tsx
import { useWallet, useWalletSigning, WalletStatus } from '@cedros/login-react';

function WalletPage() {
  const { status, solanaPubkey, authMethod } = useWallet();
  const { unlock, signTransaction, isUnlocked, isLoading } = useWalletSigning();

  const handleSign = async () => {
    // If not unlocked, prompt for credential first
    if (!isUnlocked) {
      await unlock({ password: userPassword }); // or { prfOutput }
    }

    // Sign transaction (server-side)
    const { signature } = await signTransaction(transactionBytes);
    console.log('Signed:', signature);
  };

  return (
    <div>
      <WalletStatus
        status={status}
        publicKey={solanaPubkey}
        onEnroll={() => navigate('/wallet/enroll')}
        onUnlock={() => setShowUnlockModal(true)}
        onLock={() => lock()}
      />

      <button onClick={handleSign} disabled={isLoading}>
        Sign Transaction
      </button>
    </div>
  );
}
```

### Permission-Based UI

```tsx
import { useAuthorize } from '@cedros/login-react';

function InviteButton({ orgId }) {
  const { checkPermission } = useAuthorize();
  const [canInvite, setCanInvite] = useState(false);

  useEffect(() => {
    checkPermission({
      orgId,
      action: 'member:invite',
      resourceType: 'member',
    }).then(setCanInvite);
  }, [orgId]);

  if (!canInvite) return null;

  return <button>Invite Member</button>;
}
```

### Privacy Cash

**Deposits work in all wallet recovery modes**, but private (privacy-preserving) deposits require the wallet to be configured in "no-recovery" mode for security reasons.

| Recovery Mode | Private Deposits | Public Deposits | Notes |
|--------------|-----------------|-----------------|-------|
| `None` | ✅ Available | ✅ Available | Maximum privacy, no key export |
| `ShareCOnly` | ❌ Blocked | ✅ Available | In-app recovery only |
| `FullSeed` | ❌ Blocked | ✅ Available | Full key portability |

**Why private deposits require no-recovery mode:** In recovery modes where users can export their private key, they could potentially front-run withdrawal transactions by extracting their key and submitting a competing transaction before the Privacy Cash relayer processes the batched withdrawal.

When `privateDepositsEnabled` is `false` (recovery mode enabled), the DepositFlow component automatically forces "receive" mode and shows public tier labels.

```tsx
import {
  DepositForm,
  CreditBalance,
  CreditHistory,
  DepositList,
  useDeposit,
  useCredits,
} from '@cedros/login-react';

// User's credit dashboard
function CreditDashboard() {
  return (
    <div>
      <h2>Your Balance</h2>
      <CreditBalance showRefresh />

      <h2>Make a Deposit</h2>
      <DepositForm
        minAmountLamports={10_000_000} // 0.01 SOL
        onSuccess={(response) => {
          console.log('Deposit initiated:', response.sessionId);
        }}
      />

      <h2>Transaction History</h2>
      <CreditHistory pageSize={10} />

      <h2>Your Deposits</h2>
      <DepositList
        pageSize={10}
        onDepositClick={(deposit) => {
          console.log('View deposit:', deposit.sessionId);
        }}
      />
    </div>
  );
}

// Using hooks directly
function CustomDepositUI() {
  const { deposit, getStatus, isLoading, error } = useDeposit();
  const { getBalance } = useCredits();

  const handleDeposit = async (amountLamports: number) => {
    const result = await deposit(amountLamports);
    console.log('Deposit session:', result.sessionId);

    // Poll for status updates
    const status = await getStatus(result.sessionId);
    console.log('Status:', status.status);
  };

  return (
    <button onClick={() => handleDeposit(100_000_000)} disabled={isLoading}>
      Deposit 0.1 SOL
    </button>
  );
}
```

### Privacy Cash Admin

```tsx
import {
  PrivacyCashAdminPanel,
  AdminDepositStats,
  useAdminDeposits,
} from '@cedros/login-react';

// Full admin dashboard
function AdminDashboard() {
  return (
    <PrivacyCashAdminPanel
      pageSize={20}
      refreshInterval={30000} // Auto-refresh every 30s
      onDepositClick={(deposit) => {
        console.log('View deposit:', deposit.id, 'User:', deposit.userId);
      }}
      onWithdrawalClick={(item) => {
        console.log('Process withdrawal:', item.id);
      }}
    />
  );
}

// Using admin hooks directly
function AdminStatsWidget() {
  const { getStats, isLoading, error } = useAdminDeposits();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <div>
      <p>Total Deposits: {stats.totalDeposits}</p>
      <p>Total Volume: {stats.totalDepositedSol} SOL</p>
      <p>Pending Withdrawals: {stats.pendingWithdrawalCount}</p>
    </div>
  );
}
```

## TypeScript

All components and hooks are fully typed:

```tsx
import type {
  // Auth types
  AuthUser,
  AuthMethod,
  TokenPair,
  AuthState,

  // Organization types
  Organization,
  Membership,
  OrgRole,

  // Member types
  Member,

  // Invite types
  Invite,
  CreateInviteRequest,

  // Session types
  Session,

  // Wallet types
  WalletStatus,
  WalletMaterial,
  WalletCapabilities,
  UnlockCredential,
  SignTransactionRequest,
  SignTransactionResponse,

  // Privacy Cash types
  DepositRequest,
  DepositResponse,
  DepositStatusResponse,
  DepositConfigResponse,
  DepositItemResponse,
  DepositListResponse,
  CreditBalanceResponse,
  CreditTransactionResponse,
  CreditHistoryResponse,
  AdminDepositItem,
  AdminDepositListResponse,
  AdminDepositStatsResponse,

  // System settings types
  SystemSetting,
  UpdateSettingRequest,
  ListSystemSettingsResponse,
  UpdateSystemSettingsResponse,
  UseSystemSettingsReturn,

  // Config types
  CedrosLoginConfig,
  FeatureFlags,
  ThemeOverrides,
} from '@cedros/login-react';
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm test

# Build library
npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

## License

MIT
