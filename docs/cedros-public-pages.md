# Cedros Public Pages And Page Seeds

Cedros Login declares Cedros-managed public route seeds. Each seed is an
editable Cedros platform page row that is auto-created and published when the
extension is enabled, so each public URL is live immediately after install.
Runtime templates expose the Cedros document-template contract (`label` plus
`zones[]`) because the host scaffolds the page document from
`template.zones[]`.

## Page Seeds

| Page seed | Route | Template | Create on enable | Publish on enable | SEO noindex |
|---|---|---|---:|---:|---:|
| `cedros-login:login-page` | `/login` | `cedros-login:login-page-template` | true | true | true |
| `cedros-login:register-page` | `/register` | `cedros-login:register-page-template` | true | true | true |
| `cedros-login:password-recovery-page` | `/password-recovery` | `cedros-login:password-recovery-page-template` | true | true | true |
| `cedros-login:reset-password-page` | `/reset-password` | `cedros-login:reset-password-page-template` | true | true | true |
| `cedros-login:email-verification-page` | `/verify-email` | `cedros-login:email-verification-page-template` | true | true | true |
| `cedros-login:instant-link-verification-page` | `/instant-link/verify` | `cedros-login:instant-link-verification-page-template` | true | true | true |
| `cedros-login:invite-acceptance-page` | `/accept-invite` | `cedros-login:invite-acceptance-page-template` | true | true | true |
| `cedros-login:public-profile-page` | `/profile` | `cedros-login:public-profile-page-template` | true | true | true |

`/login` and `/register` are the canonical public routes for the auth entry points (previously `/sign-in` and `/create-account`). Owners can change slugs in the page row settings after install if the host reports no route conflict.

`/profile` is the canonical Login-owned customer profile, identity, and security workspace. The stable `cedros-login:public-profile-page` seed owns that route and renders the authenticated account workspace. Cedros Login does not seed or redirect `/account`; Cedros Shop owns that public route. Login's `/account/*` and `/account-deletion/*` server APIs are separate contracts and remain unchanged.

Auth-sensitive page seeds declare `pageSeeds[].seo.noindex = true`. Core remains
the only SEO renderer: it emits the robots noindex/nofollow metadata and excludes
those pages from sitemap output. Cedros Login does not declare sitemap URL
providers or raw canonical, hreflang, JSON-LD, or title tags for these routes.

## Runtime And Lifecycle

The manifest declares `pageSeeds[]` and mirrors those ids in `surfaces.web.routeIds[]`. On enable, Cedros platform creates one editable page row per seed and publishes it. Manifest `contentTemplates[]` provide the stable metadata and ids; the executable web bootstrap supplies host-readable `label`, `zones[]`, and serializable starter `blocks[]`, so `/login`, `/register`, and related auth pages seed real authored content instead of empty zones.

Existing owner-created pages are preserved across disable, remove, and rollback. Re-enable never overwrites edited page rows — Cedros platform deduplicates by route and respects owner edits. Upgrades to seed titles/descriptions apply only to future installs unless Cedros approves an explicit content migration.

## Acceptance Checks

- Page seed ids are stable, namespaced, and unique.
- Routes normalize uniquely and start with `/`.
- Template resolution joins manifest `contentTemplates[]` metadata to runtime template definitions with host-readable `label`, `zones[]`, and starter `blocks[]`.
- `autoCreateOnEnable` and `publishOnEnable` are both `true` so install makes the public URLs live without owner action.
- Auth-sensitive page seeds, including `/profile`, set `seo.noindex=true`.
- `scripts/validate-cedros-public-pages.mjs` verifies manifest, bootstrap, surface ids, route normalization, and docs map coverage.
