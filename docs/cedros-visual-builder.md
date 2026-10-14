# Cedros Visual Builder Blocks And Templates

Cedros Login contributes owner-editable visual-builder templates for the public auth page seeds. The extension ships four portable blocks: copy, auth form, login button, and account workspace. Low-level package components such as Google Sign In, Passkey Sign In, Password Input, and 2FA stay package APIs; the builder receives higher-level blocks that can be safely serialized, reviewed, and rendered by hosts.

## Manifest Contributions

| Contribution | IDs |
|---|---|
| Content blocks | `cedros-login:auth-page-copy`, `cedros-login:auth-form`, `cedros-login:login-button`, `cedros-login:account-workspace` |
| Content templates | `cedros-login:login-page-template`, `cedros-login:register-page-template`, `cedros-login:password-recovery-page-template`, `cedros-login:reset-password-page-template`, `cedros-login:email-verification-page-template`, `cedros-login:instant-link-verification-page-template`, `cedros-login:invite-acceptance-page-template`, `cedros-login:public-profile-page-template` |
| Web surface ids | `surfaces.web.blockTypes[]`, `surfaces.web.templateIds[]` |
| Page seed templates | each `pageSeeds[].templateId` points to its matching extension template |

No raw HTML, script, style text, JSX, credentials, tokens, private keys, or raw PII are stored in starter props. Sign-in, create-account, forgot-password, reset-password, email verification, instant-link verification, and invite acceptance workflows are page templates with `cedros-login:auth-form`; they are not generic Forms templates because Forms only model owner-created contact-style submissions. The `/profile` template uses `cedros-login:account-workspace` as its primary block and hydrates to the package profile, identity, and security settings UI for signed-in users.

## Runtime Bootstrap

React admin and React web registration return the same runtime definitions:

- `contentBlocks[]`: `Login Page Copy`, `Login Auth Form`, `Login Button`, and `Account Workspace` blocks with safe JSON schemas and React renderers.
- `contentTemplates[]`: eight manifest metadata entries for sign in, account creation, recovery, reset, verification, instant-link return, invite acceptance, and account management. The matching runtime definitions carry host-required `label` and `zones[]` fields plus portable starter blocks.

Cedros platform's current page-seed provisioner scaffolds the page document from
`template.zones[]`; it does not populate the starter `blocks[]` into the page
body during install. The blocks remain ZIP-contained runtime metadata for host
preset/rendering support, while page auto-provisioning depends on the `label`
and `zones[]` contract.

The React Native package has no native renderer for these web-only templates. Native fallback is to omit the block or display the owner-authored text if a host renderer is later provided.

## Acceptance Checks

- `scripts/validate-cedros-visual-builder.mjs` verifies manifest ids, surface ids, template/page-seed alignment, and portable starter props.
- Runtime registration tests verify the web bootstrap exposes the same block/template ids as the manifest and that every runtime template has host-readable `label` and `zones[]`.
- Unknown props are ignored by the block renderer and replaced with safe copy defaults.
