# Cedros Onboarding Flow

Cedros Login declares one setup-oriented onboarding page:
`cedros-login:setup-login`. It points owners to Extension Settings > Login so they can
review authentication, email, security, server, and webhook configuration before
launch.

## Runtime Behavior

| Item | Behavior |
|---|---|
| Manifest `onboardingPages[]` | contains `cedros-login:setup-login` |
| Target | `admin:cedros-login:login` |
| Completion storage | Cedros extension management/onboarding state |
| Missing target fallback | hide broken onboarding steps instead of rendering dead links |
| Site Brain | setup completion record uses category `setup` when emitted by runtime |

Cedros Data may add CRM-owned setup tasks later. Those tasks should point to
CRM/settings surfaces and call Cedros Login through declared Login contracts
rather than duplicating Login configuration.

## Acceptance Checks

- `scripts/validate-cedros-onboarding.mjs` validates the manifest page and map.
- The target admin section exists in `adminModules[]`.
- Setup text avoids secrets, private values, and customer-specific data.
