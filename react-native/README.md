# @cedros/login-react-native

React Native authentication library for Cedros with email/password, Google Sign-In, Apple Sign-In, Solana wallet authentication, and embedded SSS wallets.

## Installation

### 1. Install the library

```bash
npm install @cedros/login-react-native
# or
yarn add @cedros/login-react-native
```

### 2. Install required peer dependencies

```bash
npm install @react-native-async-storage/async-storage react-native-keychain
# or
yarn add @react-native-async-storage/async-storage react-native-keychain
```

### 3. Platform-specific setup (optional, for social auth)

#### Google Sign-In

```bash
npm install @react-native-google-signin/google-signin
```

Configure in your app:

- iOS: Add URL scheme to Info.plist
- Android: Add to build.gradle

See: https://github.com/react-native-google-signin/google-signin

#### Apple Sign-In

```bash
npm install @invertase/react-native-apple-authentication
```

Configure in your app:

- iOS: Enable "Sign in with Apple" capability in Xcode
- Return the Apple `authorizationCode` and `nonce` to Cedros so the server can store a revocable refresh token
- Android: Requires iOS app in App Store first

See: https://github.com/invertase/react-native-apple-authentication

#### Solana Mobile Wallet (Android only)

The built-in `useMobileWalletAuth` hook handles the full MWA challenge-sign flow automatically. Install one of the supported MWA packages:

```bash
# Recommended (newer API):
npm install @wallet-ui/react-native-web3js

# Or the legacy package:
npm install @solana-mobile/mobile-wallet-adapter-protocol-web3js
```

Both are optional peer dependencies — if neither is installed, the Solana button simply won't appear on Android.

**Platform constraints:**
- **Android**: MWA uses Android Intents to communicate with installed wallet apps (Phantom, Solflare, etc.). Works on physical devices and emulators with a wallet app installed.
- **iOS**: MWA is not available. The Solana button is hidden unless you provide a custom `onRequestToken` callback.

See: https://docs.solanamobile.com

## Usage

### Basic Setup

```tsx
import React from "react";
import { CedrosLoginProvider } from "@cedros/login-react-native";
import { SafeAreaView } from "react-native";

function App() {
  return (
    <CedrosLoginProvider
      config={{
        serverUrl: "https://api.yourserver.com",
        // Optional: Add your app-specific config
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Your app components */}
      </SafeAreaView>
    </CedrosLoginProvider>
  );
}

export default App;
```

### Email/Password Authentication

```tsx
import { EmailLoginForm, useEmailAuth } from "@cedros/login-react-native";

function LoginScreen() {
  const { login, isLoading, error } = useEmailAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login(email, password);
      console.log("Logged in:", response.user);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <EmailLoginForm
      onSubmit={handleLogin}
      isLoading={isLoading}
      error={error?.message}
    />
  );
}
```

### Fully Custom Auth Screens

For a fully app-owned theme, use `CedrosLoginProvider` plus the auth hooks and
render your own React Native components. The exported `Button`, `Input`, and
other Cedros UI primitives are optional conveniences, not required.

```tsx
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  CedrosLoginProvider,
  useForgotPassword,
} from "@cedros/login-react-native";

function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const { forgotPassword, isLoading, isSuccess, error } = useForgotPassword();

  if (isSuccess) {
    return <Text>Check your email for reset instructions.</Text>;
  }

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      {error && <Text>{error.message}</Text>}
      <Pressable onPress={() => forgotPassword(email)} disabled={isLoading}>
        <Text>{isLoading ? "Sending..." : "Send reset link"}</Text>
      </Pressable>
    </View>
  );
}
```

### Google Sign-In

```tsx
import { GoogleLoginButton } from "@cedros/login-react-native";

function GoogleAuthScreen() {
  return <GoogleLoginButton />;
}
```

`GoogleLoginButton` uses the native `GoogleSigninButton` automatically when
`@react-native-google-signin/google-signin` is installed. You can still pass
`onRequestToken` for a custom Google SDK flow if needed.

### Apple Sign-In

```tsx
import { AppleLoginButton } from "@cedros/login-react-native";

function AppleAuthScreen() {
  return <AppleLoginButton />;
}
```

On iOS, `AppleLoginButton` uses the native Apple sign-in control automatically
when `@invertase/react-native-apple-authentication` is installed. You can still
pass `onRequestToken` for a custom Apple SDK flow.

### Solana Wallet Authentication

#### Built-in MWA flow (recommended, Android only)

On Android, `SolanaLoginButton` handles the entire wallet interaction automatically via the built-in `useMobileWalletAuth` hook. No custom callback needed:

```tsx
import { SolanaLoginButton } from "@cedros/login-react-native";

function SolanaAuthScreen() {
  // No onRequestToken needed — built-in MWA flow handles everything
  return <SolanaLoginButton />;
}
```

The button renders as "Use Installed Wallet" and triggers the three-step challenge flow:

1. **Authorize** — Opens the user's installed Solana wallet app via Android Intent, requests authorization, and receives the wallet address.
2. **Challenge** — Calls `POST {serverUrl}/auth/solana/challenge` with `{ publicKey }`. Server returns `{ nonce, message, expiresAt }`.
3. **Sign** — The wallet signs the challenge `message`. The base58-encoded signature + wallet address + nonce are passed to `useSolanaAuth().signIn()` to complete authentication.

All three steps happen inside a single MWA `transact()` session (one wallet popup).

#### Custom flow (cross-platform)

For custom wallet integrations or iOS, provide an `onRequestToken` callback:

```tsx
import { SolanaLoginButton } from "@cedros/login-react-native";

function SolanaAuthScreen() {
  const handleRequestToken = async () => {
    // Your custom wallet interaction logic here.
    // Must return { walletAddress, signature, nonce }.
    const walletAddress = "..."; // From wallet
    const signature = "..."; // Base58-encoded Ed25519 signature
    const nonce = "..."; // From POST /auth/solana/challenge

    return { walletAddress, signature, nonce };
  };

  return <SolanaLoginButton onRequestToken={handleRequestToken} />;
}
```

#### Solana auth challenge flow

The three-step challenge flow used by both the built-in MWA hook and custom implementations:

```
┌─────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │  Wallet  │     │  Server  │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │ 1. authorize()  │               │
     │────────────────>│               │
     │  walletAddress  │               │
     │<────────────────│               │
     │                 │               │
     │ 2. POST /auth/solana/challenge  │
     │ { publicKey: walletAddress }    │
     │────────────────────────────────>│
     │ { nonce, message, expiresAt }   │
     │<────────────────────────────────│
     │                 │               │
     │ 3. signMessages │               │
     │   (message)     │               │
     │────────────────>│               │
     │   signature     │               │
     │<────────────────│               │
     │                 │               │
     │ 4. POST /auth/solana/sign-in    │
     │ { walletAddress, signature,     │
     │   nonce }                       │
     │────────────────────────────────>│
     │ { user, tokens }                │
     │<────────────────────────────────│
```

## Architecture

```
UI Components → Hooks → API Services → Backend
     ↓              ↓            ↓
   Theme        Context    TokenManager
  (styled)    (state)    (AsyncStorage)
```

### Components

| Category         | Components                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Auth**         | EmailLoginForm, EmailRegisterForm, PasswordInput, GoogleLoginButton, AppleLoginButton, SolanaLoginButton, ForgotPasswordForm |
| **Organization** | OrgSelector, OrgSwitcher                                                                                                     |
| **Members**      | MemberList                                                                                                                   |
| **Invites**      | InviteForm, InviteList                                                                                                       |
| **Sessions**     | SessionList                                                                                                                  |
| **Wallet**       | WalletStatus, WalletUnlock, RecoveryPhraseDisplay                                                                            |
| **TOTP**         | TotpSetup, TotpVerify, OtpInput                                                                                              |
| **Deposit**      | DepositForm, CreditBalance, CreditHistory                                                                                    |
| **Shared**       | Button, Input, LoadingSpinner, ErrorMessage                                                                                  |

### Hooks

| Hook                    | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `useAuth()`             | Session management (logout, refresh)             |
| `useEmailAuth()`        | Email/password authentication                    |
| `useForgotPassword()`   | Forgot-password email request flow               |
| `useGoogleAuth()`       | Google Sign-In                                   |
| `useAppleAuth()`        | Apple Sign-In                                    |
| `useAccountDeletion()`  | In-app deletion + hosted deletion URL            |
| `useSolanaAuth()`       | Solana wallet authentication (sign-in call)      |
| `useMobileWalletAuth()` | MWA challenge-sign flow (Android, built-in)      |
| `useOrgs()`             | Organization management                          |
| `useWallet()`           | Wallet operations                                |

### Context

```tsx
import { useCedrosLogin } from "@cedros/login-react-native";

function MyComponent() {
  const {
    user, // Current user object
    isAuthenticated, // Boolean auth state
    isLoading, // Loading state
    error, // Current error
    login, // Manual login with user/tokens
    logout, // Logout function
    getAccessToken, // Get JWT token for API calls
  } = useCedrosLogin();

  // ...
}
```

## Configuration

### CedrosLoginProvider Props

```tsx
interface CedrosLoginConfig {
  serverUrl: string; // Required: Your Cedros backend URL
  timeout?: number; // Optional: API timeout in ms (default: 30000)
  retries?: number; // Optional: Retry attempts (default: 3)
}
```

### Example: Complete Auth Flow

```tsx
import React from "react";
import {
  CedrosLoginProvider,
  LoginScreen,
  useCedrosLogin,
} from "@cedros/login-react-native";
import { View, Text } from "react-native";

function App() {
  return (
    <CedrosLoginProvider config={{ serverUrl: "https://api.example.com" }}>
      <AuthGate />
    </CedrosLoginProvider>
  );
}

function AuthGate() {
  const { isAuthenticated, isLoading, user } = useCedrosLogin();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <View>
      <Text>Welcome, {user?.name}!</Text>
      {/* Your authenticated app content */}
    </View>
  );
}

export default App;
```

## Features

### Authentication

- ✅ Email/password login and registration
- ✅ Google Sign-In (requires @react-native-google-signin)
- ✅ Apple Sign-In (requires @invertase/react-native-apple-authentication)
- ✅ Solana wallet authentication (requires @solana-mobile)
- ✅ Token auto-refresh
- ✅ Session management

### Organization

- ✅ Multi-tenant organization support
- ✅ Organization switching
- ✅ Member management
- ✅ Role-based access control

### Security

- ✅ Two-factor authentication (TOTP)
- ✅ Biometric wallet unlock
- ✅ Secure token storage (Keychain / Keystore by default)
- ✅ Session revocation
- ✅ Crypto utilities (AES-GCM, Argon2, Shamir Secret Sharing)

### Wallet

- ✅ Embedded SSS wallet enrollment
- ✅ Recovery phrase display
- ✅ Passkey/biometric unlock
- ✅ Transaction signing

### Credits/Deposits

- ✅ Credit balance display
- ✅ Deposit creation
- ✅ Transaction history
- ✅ Tiered deposit amounts

## Differences from Web Library

| Feature         | Web (@cedros/login-react) | Mobile (@cedros/login-react-native)          |
| --------------- | ------------------------- | -------------------------------------------- |
| **Storage**     | localStorage/cookies      | Keychain / Keystore (AsyncStorage only by opt-in fallback) |
| **Google Auth** | Google Identity Services  | @react-native-google-signin                  |
| **Apple Auth**  | Sign in with Apple JS     | @invertase/react-native-apple-authentication |
| **Solana**      | Browser wallet adapters   | Mobile Wallet Adapter                        |
| **Biometrics**  | WebAuthn                  | Platform APIs (via dependencies)             |
| **UI**          | React DOM                 | React Native                                 |
| **Admin**       | Included                  | **Excluded**                                 |

## Publishing Compliance

- Install `react-native-keychain` or provide `config.secureStorage.adapter` before shipping. Production compliance checks reject insecure token persistence.
- If Google Sign-In is enabled on iOS, also enable Sign in with Apple unless you have an App Store exemption and set `config.compliance.appleSignInExemptionReason`.
- The hosted public deletion URL defaults to `${serverUrl}/auth/account-deletion`, or you can override it with `config.compliance.accountDeletionUrl`.
- Use `useAccountDeletion()` or `DeleteAccountSection` to satisfy the in-app account deletion requirement while also reusing the hosted external deletion portal for Google Play.

## API Reference

All components, hooks, types, and utilities are exported from the main entry point:

```tsx
// Components
export { EmailLoginForm, GoogleLoginButton, WalletStatus, ... };

// Hooks
export { useAuth, useEmailAuth, useForgotPassword, useGoogleAuth, ... };

// Context
export { CedrosLoginProvider, useCedrosLogin };

// Types
export type { AuthUser, TokenPair, OrgWithMembership, ... };

// Crypto (advanced)
export { deriveKeypairFromSeed, splitSecret, combineShares, ... };
```

## Server (Rust crate)

The authentication server is published as `cedros-login-server` on crates.io.
Due to Rust naming conventions, the import name uses underscores:

```toml
# Cargo.toml
[dependencies]
cedros-login-server = "0.0.18"
```

```rust
// Import uses underscores (Rust convention)
use cedros_login::prelude::*;
```

## Contributing

This library is part of the Cedros authentication system. For issues or contributions, please refer to the main repository.

## License

MIT
