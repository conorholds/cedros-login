import { useMemo as v, lazy as n } from "react";
import { jsx as e, Fragment as w, jsxs as a } from "react/jsx-runtime";
import { A as M, e as b, C as f, f as S, i as P } from "./featureFlags-_5x_2FxU.js";
const g = () => {
}, h = async () => {
};
function C(i) {
  const r = i.cedrosLogin;
  if (!r)
    return null;
  const s = S(), d = r.user ? {
    authMethods: [],
    emailVerified: !1,
    createdAt: "",
    updatedAt: "",
    ...r.user
  } : null;
  return {
    config: {
      serverUrl: r.serverUrl
    },
    featureFlags: s,
    isFeatureEnabled: (c) => P(c, { flags: s }),
    user: d,
    authState: d ? "authenticated" : "unauthenticated",
    error: null,
    logout: h,
    refreshUser: h,
    isModalOpen: !1,
    openModal: g,
    closeModal: g,
    _internal: {
      handleLoginSuccess: g,
      getAccessToken: r.getAccessToken,
      getReferralCode: () => null
    }
  };
}
const D = ({
  children: i,
  hostContext: r
}) => {
  const s = v(
    () => C(r),
    [r]
  );
  if (!s)
    return /* @__PURE__ */ e(w, { children: i });
  const { error: d, isModalOpen: l, openModal: c, closeModal: u, ...m } = s, p = {
    error: d,
    isModalOpen: l,
    openModal: c,
    closeModal: u
  };
  return /* @__PURE__ */ e(M.Provider, { value: m, children: /* @__PURE__ */ e(b.Provider, { value: p, children: /* @__PURE__ */ e(f.Provider, { value: s, children: i }) }) });
}, t = {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, o = {
  users: /* @__PURE__ */ a("svg", { ...t, children: [
    /* @__PURE__ */ e("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ e("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ e("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
    /* @__PURE__ */ e("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
  ] }),
  members: /* @__PURE__ */ a("svg", { ...t, children: [
    /* @__PURE__ */ e("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ e("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ e("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
    /* @__PURE__ */ e("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
  ] }),
  deposits: /* @__PURE__ */ a("svg", { ...t, children: [
    /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ e("path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" }),
    /* @__PURE__ */ e("path", { d: "M12 18V6" })
  ] }),
  withdrawals: /* @__PURE__ */ a("svg", { ...t, children: [
    /* @__PURE__ */ e("rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", ry: "2" }),
    /* @__PURE__ */ e("path", { d: "M9 22v-4h6v4" }),
    /* @__PURE__ */ e("path", { d: "M8 6h.01" }),
    /* @__PURE__ */ e("path", { d: "M16 6h.01" }),
    /* @__PURE__ */ e("path", { d: "M12 6h.01" }),
    /* @__PURE__ */ e("path", { d: "M12 10h.01" }),
    /* @__PURE__ */ e("path", { d: "M12 14h.01" }),
    /* @__PURE__ */ e("path", { d: "M16 10h.01" }),
    /* @__PURE__ */ e("path", { d: "M16 14h.01" }),
    /* @__PURE__ */ e("path", { d: "M8 10h.01" }),
    /* @__PURE__ */ e("path", { d: "M8 14h.01" })
  ] }),
  wallet: /* @__PURE__ */ a("svg", { ...t, children: [
    /* @__PURE__ */ e("path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }),
    /* @__PURE__ */ e("path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" })
  ] }),
  key: /* @__PURE__ */ e("svg", { ...t, children: /* @__PURE__ */ e("path", { d: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" }) }),
  mail: /* @__PURE__ */ a("svg", { ...t, children: [
    /* @__PURE__ */ e("rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }),
    /* @__PURE__ */ e("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
  ] }),
  webhook: /* @__PURE__ */ a("svg", { ...t, children: [
    /* @__PURE__ */ e("path", { d: "M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" }),
    /* @__PURE__ */ e("path", { d: "m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" }),
    /* @__PURE__ */ e("path", { d: "m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" })
  ] }),
  coins: /* @__PURE__ */ a("svg", { ...t, children: [
    /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "6" }),
    /* @__PURE__ */ e("path", { d: "M18.09 10.37A6 6 0 1 1 10.34 18" }),
    /* @__PURE__ */ e("path", { d: "M7 6h1v4" }),
    /* @__PURE__ */ e("path", { d: "m16.71 13.88.7.71-2.82 2.82" })
  ] }),
  server: /* @__PURE__ */ a("svg", { ...t, children: [
    /* @__PURE__ */ e("rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2" }),
    /* @__PURE__ */ e("rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2" }),
    /* @__PURE__ */ e("line", { x1: "6", x2: "6.01", y1: "6", y2: "6" }),
    /* @__PURE__ */ e("line", { x1: "6", x2: "6.01", y1: "18", y2: "18" })
  ] })
}, x = n(() => import("./UsersSection-BN5smqeI.js")), y = n(() => import("./TeamSection-CeI8GS7I.js")), k = n(() => import("./DepositsSection-Dn7Tjewy.js")), L = n(() => import("./WithdrawalsSection-Do2GO3VP.js")), A = n(() => import("./AuthenticationSettings-DNE1oHGm.js")), U = n(() => import("./EmbeddedWalletSettings-C4U4cYJD.js")), q = n(() => import("./EmailSettings-CnVCTv96.js")), E = n(() => import("./WebhookSettings-CtI-ppQV.js")), I = n(() => import("./CreditSystemSettings-Dt9IBiUL.js")), O = n(() => import("./ServerSettings-BH8eZaPv.js")), W = {
  "login:users:read": ["admin", "owner"],
  "login:users:write": ["admin", "owner"],
  "login:members:read": ["member:read", "admin", "owner"],
  "login:members:write": ["member:remove", "member:role_change"],
  "login:invites:read": ["invite:read", "admin", "owner"],
  "login:invites:write": ["invite:create", "invite:cancel"],
  "login:deposits:read": ["admin", "owner"],
  "login:deposits:write": ["admin", "owner"],
  "login:settings:read": ["admin", "owner"],
  "login:settings:write": ["admin", "owner"]
}, T = [
  // Users group (main sections)
  {
    id: "users",
    label: "Users",
    icon: o.users,
    group: "Users",
    order: 0,
    requiredPermission: "login:users:read"
  },
  {
    id: "team",
    label: "Team",
    icon: o.members,
    group: "Users",
    order: 1,
    requiredPermission: "login:members:read"
  },
  {
    id: "deposits",
    label: "Deposits",
    icon: o.deposits,
    group: "Users",
    order: 2,
    requiredPermission: "login:deposits:read"
  },
  {
    id: "withdrawals",
    label: "Withdrawals",
    icon: o.withdrawals,
    group: "Users",
    order: 3,
    requiredPermission: "login:deposits:read"
  },
  // Configuration group (settings sections)
  {
    id: "settings-auth",
    label: "Authentication",
    icon: o.key,
    group: "Configuration",
    order: 0,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-email",
    label: "Email & SMTP",
    icon: o.mail,
    group: "Configuration",
    order: 1,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-webhooks",
    label: "Webhooks",
    icon: o.webhook,
    group: "Configuration",
    order: 2,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-wallet",
    label: "User Wallets",
    icon: o.wallet,
    group: "Configuration",
    order: 3,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-credits",
    label: "Credit System",
    icon: o.coins,
    group: "Configuration",
    order: 4,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-server",
    label: "Auth Server",
    icon: o.server,
    group: "Configuration",
    order: 5,
    requiredPermission: "login:settings:read"
  }
], F = {
  id: "cedros-login",
  name: "Cedros Login",
  version: "1.0.0",
  sections: T,
  groups: [
    { id: "users", label: "Users", order: 0 },
    { id: "configuration", label: "Configuration", order: 2 }
  ],
  components: {
    users: x,
    team: y,
    deposits: k,
    withdrawals: L,
    "settings-auth": A,
    "settings-wallet": U,
    "settings-email": q,
    "settings-webhooks": E,
    "settings-credits": I,
    "settings-server": O
  },
  createPluginContext(i) {
    const r = i.cedrosLogin;
    if (!r)
      throw new Error("cedros-login plugin requires cedrosLogin in hostContext");
    return {
      serverUrl: r.serverUrl,
      userId: r.user?.id,
      getAccessToken: r.getAccessToken,
      hasPermission: (s) => this.checkPermission(s, i),
      orgId: i.org?.orgId,
      pluginData: {
        user: r.user,
        orgRole: i.org?.role
      }
    };
  },
  checkPermission(i, r) {
    const s = r.org;
    if (!s)
      return !!r.cedrosLogin?.user;
    const d = W[i];
    return d ? d.some(
      (l) => s.permissions.includes(l) || l === s.role || l === "admin" && ["admin", "owner"].includes(s.role) || l === "owner" && s.role === "owner"
    ) : !1;
  },
  cssNamespace: "cedros-dashboard"
}, H = {
  users: "users",
  team: "team",
  deposits: "deposits",
  withdrawals: "withdrawals",
  settingsAuth: "settings-auth",
  settingsEmail: "settings-email",
  settingsWebhooks: "settings-webhooks",
  settingsWallet: "settings-wallet",
  settingsCredits: "settings-credits",
  settingsServer: "settings-server"
};
export {
  H as CEDROS_LOGIN_SECTION_IDS,
  D as CedrosLoginAdminSectionWrapper,
  F as cedrosLoginPlugin,
  F as loginPlugin
};
