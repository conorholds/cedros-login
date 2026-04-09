import { S as j, W as G } from "./WebhookSettings-Ci_CIPUK.js";
import { u as y, A as E, S as v } from "./AutosaveStatus-CkrF3ffV.js";
import { B, C as w, D as Y, N as F, P as H, a as K, R as V, b as q, c as z, d as J, e as Q, T as U, f as X, g as Z, s as ee } from "./AutosaveStatus-CkrF3ffV.js";
import { A as se, S as ae } from "./AuthenticationSettings-5TzCnQuq.js";
import { E as oe } from "./EmbeddedWalletSettings-F7YJfYqW.js";
import { C as b, R as D, S as O } from "./SignupSettings-D7AFxlFx.js";
import { a as ne } from "./SignupSettings-D7AFxlFx.js";
import { E as ce } from "./EmailSettings-DOfOJ_U-.js";
import { C as me, C as pe } from "./CreditSystemSettings-BfovzQe5.js";
import { S as le } from "./ServerSettings-BkzQj9jK.js";
import { jsxs as o, jsx as e } from "react/jsx-runtime";
import { useEffect as A, useMemo as I } from "react";
import { L as T, E as N } from "./ErrorMessage-DObd7075.js";
const g = [
  "image_storage_enabled",
  "image_storage_provider",
  "image_storage_bucket",
  "image_storage_region",
  "image_storage_endpoint",
  "image_storage_access_key",
  "image_storage_secret_key",
  "image_storage_cdn_url"
], S = {
  nyc3: "https://nyc3.digitaloceanspaces.com",
  ams3: "https://ams3.digitaloceanspaces.com",
  sgp1: "https://sgp1.digitaloceanspaces.com",
  sfo3: "https://sfo3.digitaloceanspaces.com",
  fra1: "https://fra1.digitaloceanspaces.com",
  syd1: "https://syd1.digitaloceanspaces.com"
};
function R({ className: r }) {
  const {
    settings: n,
    edits: l,
    isLoading: _,
    autosaveStatus: f,
    autosaveError: u,
    error: c,
    fetchSettings: d,
    handleChange: s,
    getEffectiveValue: m
  } = y();
  A(() => {
    d();
  }, [d]);
  const p = I(() => (n.image_storage ?? []).filter((t) => g.includes(t.key)).sort((t, a) => g.indexOf(t.key) - g.indexOf(a.key)), [n]), h = (i, t) => {
    if (s(i, t), i === "image_storage_provider")
      if (t === "digitalocean") {
        const a = m("image_storage_region") || "nyc3";
        s("image_storage_region", a), s("image_storage_endpoint", S[a] ?? `https://${a}.digitaloceanspaces.com`);
      } else t === "s3" && s("image_storage_endpoint", "");
    i === "image_storage_region" && m("image_storage_provider") === "digitalocean" && s("image_storage_endpoint", S[t] ?? `https://${t}.digitaloceanspaces.com`);
  };
  return _ && Object.keys(n).length === 0 ? /* @__PURE__ */ o("div", { className: `cedros-system-settings cedros-system-settings-loading ${r ?? ""}`, children: [
    /* @__PURE__ */ e(T, {}),
    /* @__PURE__ */ e("span", { children: "Loading settings..." })
  ] }) : c ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${r ?? ""}`, children: /* @__PURE__ */ e(N, { error: c.message }) }) : /* @__PURE__ */ o("div", { className: `cedros-system-settings ${r ?? ""}`, children: [
    /* @__PURE__ */ o("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ o("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: "Image Storage" }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure S3-compatible object storage for user avatars and images. Supports AWS S3, DigitalOcean Spaces, and other S3-compatible providers." })
      ] }),
      /* @__PURE__ */ e(E, { status: f, error: u })
    ] }),
    p.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ e("p", { children: "No image storage settings found." }) }) : /* @__PURE__ */ e(
      v,
      {
        settings: p,
        edits: l,
        onChange: h
      }
    )
  ] });
}
export {
  se as AuthenticationSettings,
  E as AutosaveStatus,
  B as BooleanInput,
  w as CATEGORY_METADATA,
  b as ComplianceSettings,
  me as CreditSystemSettings,
  Y as DurationInput,
  ce as EmailSettings,
  oe as EmbeddedWalletSettings,
  R as ImageStorageSettings,
  F as NumberInput,
  H as PRESET_TOKEN_SYMBOLS,
  K as PercentageInput,
  pe as PrivacyCashSettings,
  V as ReadonlySecretInput,
  D as ReferralSettings,
  q as SETTING_METADATA,
  z as SecretInput,
  ne as SecuritySettings,
  J as SelectInput,
  le as ServerSettings,
  Q as SettingRow,
  j as SettingsPageLayout,
  v as SettingsSection,
  O as SignupSettings,
  ae as SsoProvidersSettings,
  U as TokenListInput,
  X as TokenSymbolListInput,
  G as WebhookSettings,
  Z as formatDuration,
  ee as secondsToDuration
};
