# @cedros/login-react

React component library for Cedros Login authentication, account management, organization admin, and extension registration.

## Installation

This guide describes the current source. Cedros sites load the admin and web
runtime from the extension archive. Published npm packages are released
independently and may not contain the APIs shown here.

For a custom application, build the current library from a source checkout:

```bash
npm --prefix ui ci
npm --prefix ui run build
# From your application directory, install the built source package:
npm install /path/to/cedros-login/ui
```

For Solana wallet authentication, install the optional wallet adapter packages used by your app:

```bash
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js
```

## Entrypoints

| Use case | Import path |
| --- | --- |
| Full auth UI, including optional Solana login | `@cedros/login-react` |
| Admin or host apps that should not bundle wallet adapters | `@cedros/login-react/non-wallet` |
| Email-only bundle | `@cedros/login-react/email-only` |
| Google-only bundle | `@cedros/login-react/google-only` |
| Solana-only bundle | `@cedros/login-react/solana-only` |
| Admin plugin and admin helpers | `@cedros/login-react/admin` |
| Cedros admin registration | `@cedros/login-react/admin/register` |
| Cedros web registration | `@cedros/login-react/web/register` |

## Basic Usage

```tsx
import { CedrosLoginProvider, LoginButton, useCedrosLogin } from '@cedros/login-react';
import '@cedros/login-react/style.css';

function App() {
  return (
    <CedrosLoginProvider
      config={{
        serverUrl: 'https://login.example.com/auth',
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
      <p>Welcome, {user?.name ?? user?.email}</p>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
```

## Non-Wallet Usage

```tsx
import { CedrosLoginProvider, LoginForm, useCedrosLogin } from '@cedros/login-react/non-wallet';
```

Use this entrypoint when the host app does not need Solana wallet auth and should not bundle wallet adapter packages.

By default, `CedrosLoginProvider` discovers enabled auth methods and public OAuth client IDs from `GET /features`. Pass a `features` object only when the host app needs to pin a static method list instead of following runtime settings.

`serverUrl` must include the auth mount path, without a trailing slash. For the
standalone server's default configuration, use `http://localhost:57165/auth`;
feature discovery then requests `/auth/features`. Browser deployments must
allow the application's origin in the server's CORS configuration. The default
session mode uses HTTP-only cookies.

## Admin Usage

```ts
import registerCedrosLoginAdminSurface from '@cedros/login-react/admin/register';

const { modules, hostServices } = registerCedrosLoginAdminSurface();
```

Cedros Login contributes the `cedros-login:admin` module with a
`cedros-login:login` section, an identity-health dashboard card, and a
team-directory host service. The consuming application owns its admin shell,
navigation, routing, and cross-extension composition.

## Cedros Extension Registration

```ts
import registerCedrosLoginAdminSurface from '@cedros/login-react/admin/register';
import registerCedrosLoginWebSurface from '@cedros/login-react/web/register';
```

The admin registration returns the canonical Cedros Login manifest and admin module. The web registration returns the same manifest plus public-page runtime contributions for content blocks, renderers, templates, and styles.

## Features

- Email/password registration, login, verification, password reset, refresh, and logout
- Google, Apple, Solana, WebAuthn/passkey, SSO, and instant-link auth surfaces
- TOTP MFA enrollment, verification, recovery codes, and disable flows
- Profile, sessions, API keys, linked credentials, and account deletion
- Organizations, members, invites, dashboard permissions, and admin user management
- System settings for auth, email, webhooks, server, image storage, SSO, and MFA
- Theme and localization customization

## Development

Use Node `24.17.0` and npm `11.13.0`, matching the repository and package
metadata. From `ui/`:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run verify:exports
npm run verify:browser-web
npm run smoke:pack
```

This directory builds a component library. Render the components inside a
consuming React application to test an interactive login flow.

## License

This project is source-available, not open source: its redistribution restrictions do not meet the Open Source Definition.

Licensed under PILL-1.0.0 — the Personal and Internal Limited License. Free for personal and internal business use. Private modifications and limited repository forks are permitted. Redistribution, resale and offering the software as a service require separate permission. See [LICENSE](LICENSE).

For SPDX-style source-file headers, use `SPDX-License-Identifier: LicenseRef-PILL-1.0.0`. The `LicenseRef-` prefix identifies a custom license rather than claiming an official SPDX-listed identifier.
