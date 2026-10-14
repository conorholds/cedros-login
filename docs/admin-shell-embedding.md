# Admin Module Embedding Guide

How a host application loads the `cedros-login` admin contributions into its
own shell.

If the host app also renders Cedros Login auth UI and does not use Solana login,
import that auth UI from `@cedros/login-react/non-wallet` rather than the root
package.

## Overview

`@cedros/login-react/admin` provides:

- executable admin modules and their contracts
- host-service registrations and service-bag helpers
- `cedrosLoginPlugin` for direct module composition
- `CEDROS_LOGIN_SECTION_IDS`

Use the admin entrypoint when composing a multi-plugin admin:

| Package                      | What it provides                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `@cedros/login-react/admin`  | Login admin modules, service registrations, and host-facing contracts             |
| `@cedros/wallet-react/admin` | `cedrosWalletPlugin` and embedded wallet admin sections such as `settings-wallet` |
| `@cedros/pay-react/admin`    | `cedrosPayPlugin` and pay-owned admin sections                                    |

## Registration

```ts
import registerCedrosLoginAdminSurface from "@cedros/login-react/admin/register";

const contribution = registerCedrosLoginAdminSurface();
const modules = contribution.modules ?? [];
const hostServices = contribution.hostServices ?? [];
```

Pass these arrays to the consuming application's documented registration path.
The host chooses how it renders navigation, resolves routes, and provides
services.

## Structuring `hostContext`

`hostContext` is still the composition object shared across loaded plugins.

```ts
interface HostContext {
  services?: Record<string, unknown>;
  org?: {
    orgId: string;
    role: string;
    permissions: string[];
  };
  dashboardPermissions?: {
    canAccess: (sectionId: string) => boolean;
  };
  custom?: Record<string, unknown>;
}
```

### Building it from your providers

```tsx
import { useMemo } from "react";
import { HOST_SERVICE_IDS, type HostContext } from "@cedros/login-react/admin";
import { useCedrosLogin, useOrgs } from "@cedros/login-react/non-wallet";

function useBuildHostContext(): HostContext {
  const { user, config, _internal } = useCedrosLogin();
  const { activeOrg, role, permissions } = useOrgs();

  return useMemo(
    () => ({
      services: {
        [HOST_SERVICE_IDS.cedrosLogin]: {
          user: user
            ? {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
              }
            : null,
          getAccessToken: _internal?.getAccessToken ?? (() => null),
          serverUrl: config.serverUrl,
        },
      },
      org: activeOrg
        ? {
            orgId: activeOrg.id,
            role: role ?? "member",
            permissions: permissions ?? [],
          }
        : undefined,
    }),
    [user, config.serverUrl, _internal, activeOrg, role, permissions],
  );
}
```

### Optional installed-extension signals

The Login admin can hide subscription-selection controls when Cedros Pay is not
installed. A host that knows installed extension state can pass either:

```ts
custom: {
  cedrosPayInstalled: true,
  // or: installedExtensionIds: ["cedros-pay"]
}
```

When this signal is omitted, Login preserves the existing editable controls for
backward compatibility. The host should derive the signal from its installed
extension inventory.

## Notes

- `cedros-login` does not export or instantiate an admin shell.
- `hostContext.services[HOST_SERVICE_IDS.cedrosLogin]` is the host integration path.
- The plugin exposes direct embedded sections `users`, `team`, `team-invites`, and `login`; extension-owned authentication configuration lives under `Extension Settings > Login`.
- `settings-wallet` is now owned by `cedros-wallet`, not `cedros-login`.
