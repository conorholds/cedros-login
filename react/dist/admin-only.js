import { useMemo as m, lazy as n } from "react";
import { getHostService as g, HOST_SERVICE_IDS as c } from "@cedros/data-react/admin";
import { jsx as e, Fragment as S, jsxs as d } from "react/jsx-runtime";
import { C } from "./CedrosLoginAdminRuntimeContext-C7X2Grx-.js";
import { A, e as k, C as x, f as y, i as L } from "./featureFlags-_5x_2FxU.js";
const h = () => {
}, p = async () => {
};
function P(r) {
  return r ? {
    authMethods: [],
    emailVerified: !1,
    createdAt: "",
    updatedAt: "",
    ...r
  } : null;
}
function I(r) {
  const s = g(
    r,
    c.cedrosLogin
  );
  if (!s)
    return null;
  const i = P(s.user);
  return {
    config: {
      serverUrl: s.serverUrl
    },
    user: i,
    authState: i ? "authenticated" : "unauthenticated",
    getAccessToken: s.getAccessToken
  };
}
function E(r) {
  const s = y();
  return {
    config: {
      ...r.config
    },
    featureFlags: s,
    isFeatureEnabled: (a) => L(a, { flags: s }),
    user: r.user,
    authState: r.authState,
    error: null,
    logout: p,
    refreshUser: p,
    isModalOpen: !1,
    openModal: h,
    closeModal: h,
    _internal: {
      handleLoginSuccess: h,
      getAccessToken: r.getAccessToken,
      getReferralCode: () => null
    }
  };
}
const X = ({
  children: r,
  hostContext: s
}) => {
  const i = m(
    () => I(s),
    [s]
  ), a = m(
    () => i ? E(i) : null,
    [i]
  );
  if (!a)
    return /* @__PURE__ */ e(S, { children: r });
  const { error: u, isModalOpen: l, openModal: w, closeModal: f, ...b } = a, M = {
    error: u,
    isModalOpen: l,
    openModal: w,
    closeModal: f
  };
  return /* @__PURE__ */ e(C.Provider, { value: i, children: /* @__PURE__ */ e(A.Provider, { value: b, children: /* @__PURE__ */ e(k.Provider, { value: M, children: /* @__PURE__ */ e(x.Provider, { value: a, children: r }) }) }) });
}, N = [
  "users",
  "team",
  "deposits",
  "withdrawals",
  "settings-auth",
  "settings-email",
  "settings-webhooks",
  "settings-wallet",
  "settings-credits",
  "settings-server"
], v = {
  moduleId: "cedros-login",
  extensionId: "cedros-login",
  displayName: "Cedros Login Admin",
  version: "0.0.49",
  packageName: "@cedros/login-react",
  packageSubpath: "./admin-only",
  description: "Admin module for authentication, users, memberships, and auth server settings.",
  hostApiVersion: "1",
  requiredServices: [c.cedrosLogin],
  enabledByDefault: !0,
  sectionIds: N,
  slots: ["sectionWrappers"]
}, U = {
  schemaVersion: 1,
  extensionId: "cedros-login",
  displayName: "Cedros Login",
  version: "0.0.49",
  description: "Authentication and membership extension for Cedros applications.",
  platformApiVersion: "1",
  packageFamily: {
    server: {
      packageName: "cedros-login",
      version: "0.0.42"
    },
    react: {
      packageName: "@cedros/login-react",
      version: "0.0.49",
      subpath: "./admin-only"
    }
  },
  adminModules: [v]
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
  users: /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ e("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ e("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
    /* @__PURE__ */ e("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
  ] }),
  members: /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ e("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ e("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
    /* @__PURE__ */ e("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
  ] }),
  deposits: /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ e("path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" }),
    /* @__PURE__ */ e("path", { d: "M12 18V6" })
  ] }),
  withdrawals: /* @__PURE__ */ d("svg", { ...t, children: [
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
  wallet: /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }),
    /* @__PURE__ */ e("path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" })
  ] }),
  key: /* @__PURE__ */ e("svg", { ...t, children: /* @__PURE__ */ e("path", { d: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" }) }),
  mail: /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }),
    /* @__PURE__ */ e("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
  ] }),
  webhook: /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("path", { d: "M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" }),
    /* @__PURE__ */ e("path", { d: "m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" }),
    /* @__PURE__ */ e("path", { d: "m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" })
  ] }),
  coins: /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "6" }),
    /* @__PURE__ */ e("path", { d: "M18.09 10.37A6 6 0 1 1 10.34 18" }),
    /* @__PURE__ */ e("path", { d: "M7 6h1v4" }),
    /* @__PURE__ */ e("path", { d: "m16.71 13.88.7.71-2.82 2.82" })
  ] }),
  server: /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2" }),
    /* @__PURE__ */ e("rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2" }),
    /* @__PURE__ */ e("line", { x1: "6", x2: "6.01", y1: "6", y2: "6" }),
    /* @__PURE__ */ e("line", { x1: "6", x2: "6.01", y1: "18", y2: "18" })
  ] })
}, O = n(() => import("./UsersSection-BeBYFGu4.js")), q = n(() => import("./TeamSection-DetUKFQ9.js")), T = n(() => import("./DepositsSection-Dn7Tjewy.js")), V = n(() => import("./WithdrawalsSection-Do2GO3VP.js")), _ = n(() => import("./AuthenticationSettings-Bj7Rvt8c.js")), W = n(() => import("./EmbeddedWalletSettings-Wvod_5fO.js")), D = n(() => import("./EmailSettings-C-3tgMrx.js")), F = n(() => import("./WebhookSettings-Dvctl8jl.js")), H = n(() => import("./CreditSystemSettings-XlytZ4tj.js")), R = n(() => import("./ServerSettings-BNxlQIe3.js")), j = {
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
}, z = [
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
], B = {
  id: "cedros-login",
  name: "Cedros Login",
  version: "1.0.0",
  manifest: v,
  sections: z,
  groups: [
    { id: "users", label: "Users", order: 0 },
    { id: "configuration", label: "Configuration", order: 2 }
  ],
  components: {
    users: O,
    team: q,
    deposits: T,
    withdrawals: V,
    "settings-auth": _,
    "settings-wallet": W,
    "settings-email": D,
    "settings-webhooks": F,
    "settings-credits": H,
    "settings-server": R
  },
  createPluginContext(r) {
    const s = g(
      r,
      c.cedrosLogin
    );
    if (!s)
      throw new Error(
        "cedros-login plugin requires the cedros-login host service"
      );
    const i = g(r, c.org);
    return {
      serverUrl: s.serverUrl,
      userId: s.user?.id,
      getAccessToken: s.getAccessToken,
      hasPermission: (a) => this.checkPermission(a, r),
      orgId: i?.orgId,
      pluginData: {
        user: s.user,
        orgRole: i?.role
      }
    };
  },
  checkPermission(r, s) {
    const i = g(s, c.org), a = g(s, c.cedrosLogin);
    if (!i)
      return !!a?.user;
    const u = j[r];
    return u ? u.some(
      (l) => i.permissions.includes(l) || l === i.role || l === "admin" && ["admin", "owner"].includes(i.role) || l === "owner" && i.role === "owner"
    ) : !1;
  },
  cssNamespace: "cedros-dashboard"
}, Z = {
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
}, $ = {
  manifest: U,
  modules: [B]
};
export {
  Z as CEDROS_LOGIN_SECTION_IDS,
  X as CedrosLoginAdminSectionWrapper,
  v as cedrosLoginAdminModuleManifest,
  U as cedrosLoginExtensionManifest,
  $ as cedrosLoginInstalledExtension,
  B as cedrosLoginPlugin,
  B as loginPlugin
};
