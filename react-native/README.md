# @cedros/login-react-native

React Native authentication library for Cedros Login with email/password, Google Sign-In, Apple Sign-In, Solana wallet authentication, sessions, organizations, and account utilities.

## Installation

```bash
npm install @cedros/login-react-native
```

Install AsyncStorage and the default secure token store:

```bash
npm install @react-native-async-storage/async-storage react-native-keychain
```

`react-native-keychain` is the default production token store. You may instead
provide `config.secureStorage.adapter`. AsyncStorage token fallback is intended
for development and requires an explicit `secureStorage.allowInsecureStorage`
opt-in outside development.

Optional social and wallet dependencies:

```bash
npm install @react-native-google-signin/google-signin
npm install @invertase/react-native-apple-authentication
npm install @wallet-ui/react-native-web3js
```

`@wallet-ui/react-native-web3js` is the canonical Solana Mobile Wallet adapter for Android. If it is not installed, the built-in Solana button stays hidden on Android. On iOS, provide a custom Solana token callback if your app supports wallet auth.

## Cedros Extension Registration

```ts
import registerCedrosLoginNativeSurface from "@cedros/login-react-native/register";
```

The register module returns the canonical Cedros Login native manifest surface.

## Basic Usage

```tsx
import React from "react";
import { SafeAreaView } from "react-native";
import { CedrosLoginProvider, LoginScreen } from "@cedros/login-react-native";

function App() {
  return (
    <CedrosLoginProvider
      config={{
        serverUrl: "https://api.example.com",
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <LoginScreen />
      </SafeAreaView>
    </CedrosLoginProvider>
  );
}
```

Set `serverUrl` to the server origin, without `/auth`: the native API client
adds `/auth` to its request paths. For a physical device, use a server address
reachable from that device. Native dependencies also require the platform
configuration supplied by their packages.

## Session restoration

`CedrosLoginProvider` starts with `isLoading: true` while it reads the configured secure token storage. A valid persisted access token is used to fetch `/auth/user`; if only the access token has expired, the provider uses the retained refresh token first. Terminal refresh failures and retried authentication failures clear the persisted session and invoke `config.callbacks.onSessionExpired` once. A successfully completed manual logout clears tokens and invokes `config.callbacks.onLogout` once without reporting an expiry. Failed logout, restoration failure, configuration replacement, and unmount do not invoke `onLogout`.

Authenticated `GET` requests that receive `401` share a single refresh attempt and are retried at most once. A network or server error from that retry is returned without discarding newly refreshed tokens. Login, registration, refresh, and other non-idempotent requests are never replayed automatically.

The provider owns one API client and `TokenManager` per canonical auth-server and secure-storage service identity. Persisted token keys contain a SHA-256 scope digest rather than a server URL or credential, so providers sharing one native backing store cannot hydrate, clear, or refresh one another's sessions. Reconfiguration assigns a new in-process storage generation; queued writes re-check ownership, and an already-running superseded write is fenced before replacement hydration.

Legacy sessions are not imported by default. During an upgrade from a pre-namespaced release, set `secureStorage.importLegacyTokens: true` temporarily on exactly one provider: the provider that used the old `auth_tokens` entry. Never enable it on multiple server scopes. Cedros detects concurrent opted-in scopes before migration and fails closed.

The authorized migration validates the legacy payload, durably records its destination in `auth_tokens.legacy_claim.v1`, copies it to that scope, and removes the legacy value. Claim, copy, and cleanup failures are surfaced separately. If cleanup fails after the copy, the next authorized hydration verifies the matching claim, retries cleanup, and then restores the scoped session. Unauthorized providers never read, copy, remove, or transmit the legacy entry. Remove `importLegacyTokens` after the migration window. The legacy singleton API intentionally continues to use `auth_tokens` and should not be mixed with provider-owned persistence.

Mutations are ordered across managers and distinct adapter instances within one loaded package instance in one JavaScript runtime. Each adapter operation must settle only after its native work finishes. Cedros intentionally does not add a queue timeout because an underlying native write could continue after timeout and later overwrite newer state; a never-settling adapter therefore blocks subsequent mutations. Native writers in another JavaScript runtime or process, and independently loaded copies of this package, must coordinate access to the same store separately.

## Apple Sign-In

The native Apple auth module must return a nonce with the identity token. Cedros sends the nonce to the server so the server can validate the Apple token hash.

## Solana Mobile Wallet

The built-in `useMobileWalletAuth` hook performs the Mobile Wallet Adapter challenge-sign flow through `@wallet-ui/react-native-web3js`.

Android supports MWA through wallet-app intents. iOS does not expose MWA; use `onRequestToken` for a custom iOS wallet flow.

## Features

- Email/password auth and password recovery
- Google and Apple auth
- Solana Mobile Wallet auth
- Sessions and organization context
- Login screen/provider extension registration

## Development

Use Node `24.17.0` and npm `11.13.0`, matching the repository and package
metadata. From `react-native/`:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

## License

This project is source-available, not open source: its redistribution restrictions do not meet the Open Source Definition.

Licensed under PILL-1.0.0 — the Personal and Internal Limited License. Free for personal and internal business use. Private modifications and limited repository forks are permitted. Redistribution, resale and offering the software as a service require separate permission. See [LICENSE](LICENSE).

For SPDX-style source-file headers, use `SPDX-License-Identifier: LicenseRef-PILL-1.0.0`. The `LicenseRef-` prefix identifies a custom license rather than claiming an official SPDX-listed identifier.
