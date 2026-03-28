import { createContext as o } from "react";
const g = o(null), A = o(null), p = o(null), m = "CEDROS_FEATURE_", n = {
  email: {
    name: "email",
    description: "Enable email/password authentication.",
    defaultEnabled: !0,
    status: "stable",
    envVar: "CEDROS_FEATURE_EMAIL",
    autoDiscoverable: !0
  },
  google: {
    name: "google",
    description: "Enable Google OAuth authentication.",
    defaultEnabled: !0,
    status: "stable",
    envVar: "CEDROS_FEATURE_GOOGLE",
    autoDiscoverable: !0
  },
  apple: {
    name: "apple",
    description: "Enable Apple Sign In authentication.",
    defaultEnabled: !0,
    status: "stable",
    envVar: "CEDROS_FEATURE_APPLE",
    autoDiscoverable: !0
  },
  solana: {
    name: "solana",
    description: "Enable Solana wallet authentication.",
    defaultEnabled: !0,
    status: "stable",
    envVar: "CEDROS_FEATURE_SOLANA",
    autoDiscoverable: !0
  },
  webauthn: {
    name: "webauthn",
    description: "Enable passkey authentication.",
    defaultEnabled: !0,
    status: "stable",
    envVar: "CEDROS_FEATURE_WEBAUTHN",
    autoDiscoverable: !0
  },
  instantLink: {
    name: "instantLink",
    description: "Enable passwordless instant-link sign-in.",
    defaultEnabled: !1,
    status: "experimental",
    envVar: "CEDROS_FEATURE_INSTANT_LINK",
    autoDiscoverable: !0
  },
  walletEnrollment: {
    name: "walletEnrollment",
    description: "Enable embedded wallet auto-enrollment after registration.",
    defaultEnabled: !0,
    status: "stable",
    envVar: "CEDROS_FEATURE_WALLET_ENROLLMENT",
    autoDiscoverable: !1
  }
}, i = /* @__PURE__ */ new Set(["1", "true", "yes", "on"]), c = /* @__PURE__ */ new Set(["0", "false", "no", "off"]);
function _(e) {
  return n[e];
}
function l() {
  return Object.values(n);
}
function R(e) {
  return n[e].envVar;
}
function E(e) {
  if (typeof e == "boolean") return e;
  if (typeof e != "string") return;
  const t = e.trim().toLowerCase();
  if (i.has(t)) return !0;
  if (c.has(t)) return !1;
}
function u() {
  return Object.fromEntries(
    Object.entries(n).map(([e, t]) => [
      e,
      t.defaultEnabled
    ])
  );
}
function f(e = v()) {
  const t = {};
  for (const a of l()) {
    const r = E(e?.[a.envVar]);
    r !== void 0 && (t[a.name] = r);
  }
  return t;
}
function d(e = {}) {
  const t = u(), a = f(e.env), r = { ...t };
  for (const s of Object.keys(n))
    r[s] = e.config?.[s] ?? a[s] ?? e.base?.[s] ?? t[s];
  return r;
}
function D(e, t = {}) {
  return t.flags ? t.flags[e] ?? n[e].defaultEnabled : d(t)[e];
}
function b() {
  return l().filter((e) => e.autoDiscoverable).map((e) => e.name);
}
function S() {
  const e = u(), t = {};
  for (const a of b())
    t[a] = e[a];
  return t;
}
function v() {
  const e = globalThis.process;
  if (e?.env)
    return e.env;
  if (typeof process < "u" && process.env)
    return process.env;
}
export {
  g as A,
  p as C,
  m as F,
  n as a,
  l as b,
  R as c,
  d,
  A as e,
  u as f,
  _ as g,
  S as h,
  D as i,
  b as j,
  E as p,
  f as r
};
