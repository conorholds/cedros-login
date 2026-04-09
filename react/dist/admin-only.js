import { jsx as e, jsxs as d } from "react/jsx-runtime";
import { useMemo as m, lazy as h } from "react";
import { C as p } from "./CedrosLoginAdminRuntimeContext-B5hgylEV.js";
const s = {
  adminProfile: "admin-profile",
  adminSectionAccess: "admin-section-access",
  cedrosLogin: "cedros-login",
  cedrosPay: "cedros-pay",
  org: "org",
  dashboardPermissions: "dashboard-permissions"
};
function v(r = {}) {
  return { ...r };
}
function w(r) {
  const i = v(r.services);
  return !(s.adminProfile in i) && r.cedrosLogin?.user && (i[s.adminProfile] = {
    user: r.cedrosLogin.user
  }), !(s.adminSectionAccess in i) && r.dashboardPermissions && (i[s.adminSectionAccess] = r.dashboardPermissions), !(s.cedrosLogin in i) && r.cedrosLogin && (i[s.cedrosLogin] = r.cedrosLogin), !(s.cedrosPay in i) && r.cedrosPay && (i[s.cedrosPay] = r.cedrosPay), !(s.org in i) && r.org && (i[s.org] = r.org), !(s.dashboardPermissions in i) && r.dashboardPermissions && (i[s.dashboardPermissions] = r.dashboardPermissions), i;
}
function u(r, i) {
  return f(w(r), i);
}
function f(r, i) {
  return r[i];
}
const t = {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
function b() {
  return /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ e("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ e("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
    /* @__PURE__ */ e("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
  ] });
}
function P() {
  return /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ e("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ e("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
    /* @__PURE__ */ e("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
  ] });
}
function S() {
  return /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ e("path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" }),
    /* @__PURE__ */ e("path", { d: "M12 18V6" })
  ] });
}
function M() {
  return /* @__PURE__ */ d("svg", { ...t, children: [
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
  ] });
}
function y() {
  return /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }),
    /* @__PURE__ */ e("path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" })
  ] });
}
function A() {
  return /* @__PURE__ */ e("svg", { ...t, children: /* @__PURE__ */ e("path", { d: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" }) });
}
function I() {
  return /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }),
    /* @__PURE__ */ e("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
  ] });
}
function L() {
  return /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("path", { d: "M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" }),
    /* @__PURE__ */ e("path", { d: "m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" }),
    /* @__PURE__ */ e("path", { d: "m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" })
  ] });
}
function k() {
  return /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "6" }),
    /* @__PURE__ */ e("path", { d: "M18.09 10.37A6 6 0 1 1 10.34 18" }),
    /* @__PURE__ */ e("path", { d: "M7 6h1v4" }),
    /* @__PURE__ */ e("path", { d: "m16.71 13.88.7.71-2.82 2.82" })
  ] });
}
function U() {
  return /* @__PURE__ */ d("svg", { ...t, children: [
    /* @__PURE__ */ e("rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2" }),
    /* @__PURE__ */ e("rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2" }),
    /* @__PURE__ */ e("line", { x1: "6", x2: "6.01", y1: "6", y2: "6" }),
    /* @__PURE__ */ e("line", { x1: "6", x2: "6.01", y1: "18", y2: "18" })
  ] });
}
const o = {
  users: () => /* @__PURE__ */ e(b, {}),
  members: () => /* @__PURE__ */ e(P, {}),
  deposits: () => /* @__PURE__ */ e(S, {}),
  withdrawals: () => /* @__PURE__ */ e(M, {}),
  wallet: () => /* @__PURE__ */ e(y, {}),
  key: () => /* @__PURE__ */ e(A, {}),
  mail: () => /* @__PURE__ */ e(I, {}),
  webhook: () => /* @__PURE__ */ e(L, {}),
  coins: () => /* @__PURE__ */ e(k, {}),
  server: () => /* @__PURE__ */ e(U, {})
};
function W(r) {
  return r ? {
    authMethods: [],
    emailVerified: !1,
    createdAt: "",
    updatedAt: "",
    ...r
  } : null;
}
function q(r) {
  const i = W(r.pluginData?.user);
  return {
    config: {
      serverUrl: r.serverUrl
    },
    user: i,
    authState: i ? "authenticated" : "unauthenticated",
    getAccessToken: r.getAccessToken
  };
}
function E({
  pluginContext: r,
  children: i
}) {
  const n = m(() => q(r), [r]);
  return /* @__PURE__ */ e(p.Provider, { value: n, children: i });
}
const a = (r) => h(async () => {
  const n = (await r()).default;
  return {
    default: function(c) {
      return /* @__PURE__ */ e(E, { pluginContext: c.pluginContext, children: /* @__PURE__ */ e(n, { ...c }) });
    }
  };
}), T = a(() => import("./UsersSection-Wtwqib28.js")), C = a(() => import("./TeamSection-DGPl0YZd.js")), D = a(() => import("./DepositsSection-Psns9vfz.js")), H = a(() => import("./WithdrawalsSection-z7RHX7pW.js")), O = a(() => import("./AuthenticationSettings-BMwLTh1x.js")), R = a(() => import("./EmbeddedWalletSettings-C__5rbMh.js")), _ = a(() => import("./EmailSettings-ClqhWws_.js")), x = a(() => import("./WebhookSettings-CRABL5f5.js")), B = a(() => import("./CreditSystemSettings-DKdlzm85.js")), N = a(() => import("./ServerSettings-Dq33pHnx.js")), V = {
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
}, j = [
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
], K = {
  id: "cedros-login",
  name: "Cedros Login",
  version: "1.0.0",
  sections: j,
  groups: [
    { id: "users", label: "Users", order: 0 },
    { id: "configuration", label: "Configuration", order: 2 }
  ],
  components: {
    users: T,
    team: C,
    deposits: D,
    withdrawals: H,
    "settings-auth": O,
    "settings-wallet": R,
    "settings-email": _,
    "settings-webhooks": x,
    "settings-credits": B,
    "settings-server": N
  },
  createPluginContext(r) {
    const i = u(
      r,
      s.cedrosLogin
    );
    if (!i)
      throw new Error(
        "cedros-login plugin requires the cedros-login host service"
      );
    const n = u(r, s.org);
    return {
      serverUrl: i.serverUrl,
      userId: i.user?.id,
      getAccessToken: i.getAccessToken,
      hasPermission: (l) => this.checkPermission(l, r),
      orgId: n?.orgId,
      pluginData: {
        user: i.user,
        orgRole: n?.role
      }
    };
  },
  checkPermission(r, i) {
    const n = u(i, s.org), l = u(i, s.cedrosLogin);
    if (!n)
      return !!l?.user;
    const c = V[r];
    return c ? c.some(
      (g) => n.permissions.includes(g) || g === n.role || g === "admin" && ["admin", "owner"].includes(n.role) || g === "owner" && n.role === "owner"
    ) : !1;
  },
  cssNamespace: "cedros-dashboard"
}, J = {
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
  J as CEDROS_LOGIN_SECTION_IDS,
  K as cedrosLoginPlugin,
  K as loginPlugin
};
