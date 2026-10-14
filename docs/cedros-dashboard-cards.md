# Cedros Dashboard Cards

Cedros Login contributes one admin dashboard card in the extension ZIP:
`cedros-login:identity-health-card`. The card summarizes identity system health
and links to the Login settings/admin surface.

## Card Contribution

| Field | Value |
|---|---|
| Card id | `cedros-login:identity-health-card` |
| Admin module | `cedros-login:admin` |
| Runtime component | `LoginHealthDashboardCard` |
| Admin action target | `cedros-login:login` |
| Data source | Cedros Login admin/runtime context and redacted aggregate metrics |

The card should display only aggregate account-system signals such as total
accounts, recent registrations, verified account rate, active login counts,
invite acceptance, and provider availability. It must not show direct user
identifiers, raw email addresses, tokens, headers, or provider payloads.

## Acceptance Checks

- Manifest `adminModules[].contributions.dashboardCards[]` includes the card id.
- Runtime admin bootstrap contributes `LoginHealthDashboardCard`.
- Tests cover registration of the card contribution and basic rendering.
- The card degrades to unavailable/zero-state copy when host metrics are absent.
