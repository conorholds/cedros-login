# Cedros Invite Discount Contract v1

Status: Login implementation complete (standalone and Wasm). A coordinated
release still requires a joint staging pass through the packaged Login and Pay
components: redeem → reduced price; no grant → full price; Login seam error →
retry once, then undiscounted fallback.

## What it is

An invite code can carry an optional subscription discount
(`discountPercent`, an integer 1-100 where 100 means a free period).
An optional positive integer `discountMonths` limits it to the first N months
of the subscription; null or absent preserves the lifetime offer.
Redeeming the code grants that discount to the redeeming user. Login publishes
the grant through the `cedros-login:invite-discount` manifest capability so
billing (Cedros Pay) can apply it at checkout; capability presence is the
minimum-version gate, and breaking changes require a new capability id.

The discount is stored on the invite code only. The grant is resolved live
from the user's redemption link, so an admin edit to a code's
`discountPercent` or `discountMonths` changes the grant used at future checkouts;
existing Stripe subscriptions keep the coupon already bound at checkout.
Deleting the code or clearing its percentage removes the future-checkout grant.

## Admin authoring

`POST /admin/invite-codes` and `PATCH /admin/invite-codes/{id}` accept an
optional `discountPercent` (nullable on PATCH via explicit `null`). Values
outside 1-100 are rejected with `VALIDATION_ERROR`. All invite-code responses
include `discountPercent` and `discountMonths`. `discountMonths` must be a
positive 32-bit integer and requires a percentage. Omission on PATCH preserves
the saved term; explicit null restores lifetime. Clear both fields together to
remove a fixed-term discount. User-issued one-time codes never carry a discount.

## Grant on redemption

`POST /invite-codes/redeem` responses additively embed the granted discount so
the client can reveal the reward the moment the code is accepted (this rides
the `cedros-login:auth-response` contract as an optional field, present only
on redeem responses for a discount-carrying code):

```json
{
  "user": { "...": "..." },
  "tokens": { "...": "..." },
  "isNewUser": true,
  "method": "password",
  "inviteDiscount": { "percentOff": 50, "durationMonths": 3, "code": "GOLD50" }
}
```

The React client plays the unlock celebration on this response and shows the
discount as the reward moment.

Note: the programmatic register path that passes `inviteCode` inline on
`POST /register` grants the discount identically (the redemption is recorded)
but its response does not embed `inviteDiscount`; API callers read the grant
from the lookup route below. Only `POST /invite-codes/redeem` responses embed
the field.

## Lookup seam for Cedros Pay

```text
GET /public-auth/account/invite-discount        (extension mode, host proxy)
GET /account/invite-discount                    (standalone server)
```

Route id `cedros-login:public-auth-account-invite-discount`. Authenticated as
the end user (session cookies or bearer token) — the same credential Pay
already holds when Login calls Pay's `selection-status` endpoint, mirrored in
the other direction. Response:

```json
{ "discount": { "percentOff": 50, "durationMonths": 3, "code": "GOLD50", "redeemedAt": "<RFC3339>" } }
```

or `{ "discount": null }` when the caller holds no invite discount. The body
contains no email, tokens, or profile data; `code` is the invite-code value
the user themselves typed.

## Consumer Policy

Login only reports the grant; the following checkout policy is Cedros Pay's,
agreed between the teams and now reflected in Login's user/operator copy:

- **Duration:** positive `durationMonths` binds a repeating Stripe coupon
  for that many months from subscription start, not invite redemption. Null or
  absent means lifetime and preserves legacy coupon identity.
- **Billing:** fixed terms require one-month billing; lifetime offers allow
  monthly or annual billing. Invite discounts require Stripe checkout.
- **Rollout:** release Pay duration support before exposing fixed-month controls
  in Login. Older Pay consumers ignore the additive term and create lifetime
  coupons. Verify the built pair on staging before production.
- **Stacking:** an active invite discount wins over Pay/Stripe coupons and
  promotion codes.
- **Lookup points:** Pay performs the live lookup when authenticated checkout
  pricing renders and again when creating the Stripe Checkout session.
- **Failure handling:** lookup failures are retried once, then checkout falls
  back to undiscounted pricing.
- **`percentOff: 100`:** a real subscription with a zero Stripe total,
  preserving the normal subscription lifecycle.
- Pay may display the grant as "Invite discount (GOLD50) — 50% off".

## Failure semantics

- Unauthenticated calls fail closed (401), matching other `/account/*` routes.
- A host DB seam error surfaces as a 5xx, never as `{"discount": null}` — Pay
  may retry or fall back to undiscounted pricing.
- The lookup never mutates state and is safe to call on every checkout render.
