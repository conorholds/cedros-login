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
npm install @react-native-async-storage/async-storage
# or
yarn add @react-native-async-storage/async-storage
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
- Android: Requires iOS app in App Store first

See: https://github.com/invertase/react-native-apple-authentication

#### Solana Mobile Wallet

```bash
npm install @solana-mobile/mobile-wallet-adapter-protocol @solana-mobile/mobile-wallet-adapter-protocol-web3js @solana/web3.js
```

See: https://github.com/solana-mobile/mobile-wallet-adapter

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

### Google Sign-In

```tsx
import { GoogleLoginButton, useGoogleAuth } from "@cedros/login-react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

function GoogleAuthScreen() {
  const { signIn: cedrosSignIn, isLoading, error } = useGoogleAuth();

  const handleGoogleSignIn = async () => {
    try {
      // Get ID token from Google SDK
      const { idToken } = await GoogleSignin.signIn();

      // Pass to Cedros
      const response = await cedrosSignIn(idToken);
      console.log("Google auth success:", response.user);
    } catch (err) {
      console.error("Google auth failed:", err);
    }
  };

  return (
    <GoogleLoginButton
      onPress={handleGoogleSignIn}
      isLoading={isLoading}
      error={error?.message}
    />
  );
}
```

### Apple Sign-In

```tsx
import { AppleLoginButton, useAppleAuth } from "@cedros/login-react-native";
import { appleAuth } from "@invertase/react-native-apple-authentication";

function AppleAuthScreen() {
  const { signIn: cedrosSignIn, isLoading, error } = useAppleAuth();

  const handleAppleSignIn = async () => {
    try {
      // Get credential from Apple SDK
      const appleCredential = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      // Pass ID token to Cedros
      const response = await cedrosSignIn(appleCredential.identityToken);
      console.log("Apple auth success:", response.user);
    } catch (err) {
      console.error("Apple auth failed:", err);
    }
  };

  return (
    <AppleLoginButton
      onPress={handleAppleSignIn}
      isLoading={isLoading}
      error={error?.message}
    />
  );
}
```

### Solana Wallet Authentication

```tsx
import { SolanaLoginButton, useSolanaAuth } from "@cedros/login-react-native";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";

function SolanaAuthScreen() {
  const { signIn: cedrosSignIn, isLoading, error } = useSolanaAuth();

  const handleSolanaSignIn = async () => {
    try {
      // Connect to mobile wallet
      const authResult = await transact(async (wallet) => {
        const { authToken } = await wallet.authorize({
          cluster: "mainnet-beta",
          identity: {
            name: "Your App Name",
            uri: "https://yourapp.com",
            iconRelativeUri: "/icon.png",
          },
        });
        return authToken;
      });

      // Get wallet address and sign message
      // (Implementation depends on your wallet adapter setup)
      const walletAddress = "..."; // From wallet
      const signature = "..."; // Signed message
      const nonce = "..."; // From server challenge

      // Pass to Cedros
      const response = await cedrosSignIn(walletAddress, signature, nonce);
      console.log("Solana auth success:", response.user);
    } catch (err) {
      console.error("Solana auth failed:", err);
    }
  };

  return (
    <SolanaLoginButton
      onPress={handleSolanaSignIn}
      isLoading={isLoading}
      error={error?.message}
    />
  );
}
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

| Hook              | Purpose                              |
| ----------------- | ------------------------------------ |
| `useAuth()`       | Session management (logout, refresh) |
| `useEmailAuth()`  | Email/password authentication        |
| `useGoogleAuth()` | Google Sign-In                       |
| `useAppleAuth()`  | Apple Sign-In                        |
| `useSolanaAuth()` | Solana wallet authentication         |
| `useOrgs()`       | Organization management              |
| `useWallet()`     | Wallet operations                    |

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
- ✅ Secure token storage (AsyncStorage)
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
| **Storage**     | localStorage/cookies      | AsyncStorage                                 |
| **Google Auth** | Google Identity Services  | @react-native-google-signin                  |
| **Apple Auth**  | Sign in with Apple JS     | @invertase/react-native-apple-authentication |
| **Solana**      | Browser wallet adapters   | Mobile Wallet Adapter                        |
| **Biometrics**  | WebAuthn                  | Platform APIs (via dependencies)             |
| **UI**          | React DOM                 | React Native                                 |
| **Admin**       | Included                  | **Excluded**                                 |

## API Reference

All components, hooks, types, and utilities are exported from the main entry point:

```tsx
// Components
export { EmailLoginForm, GoogleLoginButton, WalletStatus, ... };

// Hooks
export { useAuth, useEmailAuth, useGoogleAuth, useWallet, ... };

// Context
export { CedrosLoginProvider, useCedrosLogin };

// Types
export type { AuthUser, TokenPair, OrgWithMembership, ... };

// Crypto (advanced)
export { deriveKeypairFromSeed, splitSecret, combineShares, ... };
```

## Contributing

This library is part of the Cedros authentication system. For issues or contributions, please refer to the main repository.

## License

MIT
