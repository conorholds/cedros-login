# Cedros Forms And Docs Starters

Cedros Login ships conservative starter content. These contributions are
manifest metadata only; they do not execute auth, recovery, support, or profile
workflows by themselves.

## Form Templates

| Form template | Scope | Status | Purpose |
|---|---|---|---|
| `cedros-login:account-support-form` | contact | active | Owner-created support form for account access and sign-in help. |

The form asks for email, issue type, details, and explicit consent to contact. The starter copy tells owners and visitors not to include passwords, MFA codes, recovery codes, tokens, private keys, or payment details.

Login, create-account, forgot-password, reset-password, email verification, instant-link verification, and invite acceptance experiences are exported as page-builder templates through `cedros-login:auth-form`, not as generic form templates. Cedros Forms templates are reserved for owner-created contact-style submissions that persist through host-owned Forms storage.

## Docs Articles

All docs starters are written for the end user reading them on the public site, not for the site admin who installs the extension. They are manifest-backed starter cards only. Cedros platform must create an owner-owned draft docs row only after an owner explicitly chooses Start Draft for a starter card.

| Docs article id | Slug | End-user purpose |
|---|---|---|
| `cedros-login:getting-started` | `cedros-login-sign-in-and-create-account` | How to sign in, create or manage your account, accept a team invite, and recover access without sharing passwords or codes. |
| `cedros-login:account-security-checklist` | `cedros-login-account-security` | Verify your email, troubleshoot sign-in links, turn on multi-factor authentication or a passkey, and recover access safely. |

## Owner Guidance

Owners should review all starter content before publishing and adapt copy to site-specific support paths, jurisdictions, and policy language. End-user starters intentionally avoid asking visitors for passwords, MFA codes, recovery codes, tokens, private keys, or payment details. Existing owner-created forms and docs remain on disable, remove, and rollback unless the owner explicitly deletes them.

## Acceptance Checks

- `formTemplates[]` and `docsArticles[]` ids are namespaced and unique.
- Form fields use supported field types and stable lowercase keys.
- Select fields declare options, and the consent checkbox has explicit label/help text.
- Docs bodies are non-empty conservative Markdown without raw HTML/script/style.
- Docs article starters remain starter cards until an owner chooses Start Draft.
- `scripts/validate-cedros-forms-docs.mjs` verifies manifest, bootstrap, and docs map alignment.
