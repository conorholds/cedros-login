import { jsx as e, jsxs as i, Fragment as W } from "react/jsx-runtime";
import { useState as C, useRef as O, useMemo as $, useCallback as A, useEffect as k } from "react";
import { u as G, a as H, M as z, I as j, b as K } from "./useInvites-D_ORGMAB.js";
import { S as Q } from "./StatsBar-BX-hHtTq.js";
import { b as Y, A as J } from "./ErrorMessage-DObd7075.js";
import { u as q } from "./useOrgs-PRReHJVn.js";
import { d as V } from "./EmailRegisterForm-DrtZJXIS.js";
const X = [
  "users",
  "team",
  "referrals",
  "deposits",
  "withdrawals",
  "compliance",
  "accreditation-queue",
  "sanctions",
  "signup-gating",
  "settings-wallet",
  "settings-auth",
  "settings-email",
  "settings-webhooks",
  "settings-credits",
  "settings-compliance",
  "settings-referrals",
  "settings-signup",
  "settings-server",
  "settings-images"
], Z = [
  "pay-products",
  "pay-subscriptions",
  "pay-transactions",
  "pay-coupons",
  "pay-refunds",
  "pay-storefront",
  "pay-ai",
  "pay-payment",
  "pay-messaging",
  "pay-settings"
], w = {
  // Cedros Login
  users: "Users",
  team: "Team",
  referrals: "Referrals",
  deposits: "Deposits",
  withdrawals: "Withdrawals",
  compliance: "Compliance",
  "accreditation-queue": "Accreditation Queue",
  sanctions: "Sanctions",
  "signup-gating": "Signup Gating",
  "settings-wallet": "User Wallets",
  "settings-auth": "Authentication",
  "settings-email": "Email & SMTP",
  "settings-webhooks": "Webhooks",
  "settings-credits": "Credit System",
  "settings-compliance": "Compliance & Gating",
  "settings-referrals": "Referrals & Rewards",
  "settings-signup": "Signup Gating",
  "settings-server": "Auth Server",
  "settings-images": "Image Storage",
  // Cedros Pay
  "pay-products": "Products",
  "pay-subscriptions": "Subscriptions",
  "pay-transactions": "Transactions",
  "pay-coupons": "Coupons",
  "pay-refunds": "Refunds",
  "pay-storefront": "Storefront",
  "pay-ai": "Store AI",
  "pay-payment": "Payment Options",
  "pay-messaging": "Store Messages",
  "pay-settings": "Store Server"
}, E = {
  admin: {
    // Cedros Login
    users: !0,
    team: !0,
    referrals: !0,
    deposits: !0,
    withdrawals: !0,
    compliance: !0,
    "accreditation-queue": !0,
    sanctions: !0,
    "signup-gating": !0,
    "settings-wallet": !0,
    "settings-auth": !0,
    "settings-email": !0,
    "settings-webhooks": !0,
    "settings-credits": !0,
    "settings-compliance": !0,
    "settings-referrals": !0,
    "settings-signup": !0,
    "settings-server": !0,
    "settings-images": !0,
    // Cedros Pay
    "pay-products": !0,
    "pay-subscriptions": !0,
    "pay-transactions": !0,
    "pay-coupons": !0,
    "pay-refunds": !0,
    "pay-storefront": !0,
    "pay-ai": !0,
    "pay-payment": !0,
    "pay-messaging": !0,
    "pay-settings": !0
  },
  member: {
    // Cedros Login
    users: !1,
    team: !0,
    referrals: !1,
    deposits: !1,
    withdrawals: !1,
    compliance: !1,
    "accreditation-queue": !1,
    sanctions: !1,
    "signup-gating": !1,
    "settings-wallet": !1,
    "settings-auth": !1,
    "settings-email": !1,
    "settings-webhooks": !1,
    "settings-credits": !1,
    "settings-compliance": !1,
    "settings-referrals": !1,
    "settings-signup": !1,
    "settings-server": !1,
    "settings-images": !1,
    // Cedros Pay
    "pay-products": !1,
    "pay-subscriptions": !1,
    "pay-transactions": !1,
    "pay-coupons": !1,
    "pay-refunds": !1,
    "pay-storefront": !1,
    "pay-ai": !1,
    "pay-payment": !1,
    "pay-messaging": !1,
    "pay-settings": !1
  }
};
function ee() {
  const { config: o, authState: r, _internal: c } = Y(), { activeOrg: a, role: t } = q(), [m, b] = C(
    E
  ), [y, u] = C(!1), [g, v] = C(!1), [S, p] = C(null), l = O(0), s = $(
    () => new J({
      baseUrl: o.serverUrl,
      timeoutMs: o.requestTimeout,
      retryAttempts: o.retryAttempts,
      getAccessToken: c?.getAccessToken
    }),
    [o.serverUrl, o.requestTimeout, o.retryAttempts, c]
  ), n = O(s);
  n.current = s;
  const f = A(async () => {
    if (r !== "authenticated" || !a) {
      b(E);
      return;
    }
    u(!0), p(null);
    const h = ++l.current;
    try {
      const d = await n.current.get(
        "/admin/dashboard-permissions"
      );
      if (h !== l.current) return;
      b(d.permissions);
    } catch (d) {
      if (h !== l.current) return;
      if (d instanceof Error && d.message.includes("404"))
        b(E);
      else {
        const _ = d instanceof Error ? d.message : "Failed to fetch permissions";
        p({ code: "NETWORK_ERROR", message: _ }), b(E);
      }
    } finally {
      h === l.current && u(!1);
    }
  }, [r, a]), N = A(
    async (h) => {
      if (r !== "authenticated" || !a)
        throw new Error("Not authenticated");
      if (t !== "owner")
        throw new Error("Only owners can modify dashboard permissions");
      v(!0), p(null);
      try {
        await n.current.request({
          method: "PUT",
          path: "/admin/dashboard-permissions",
          body: h
        }), b(h);
      } catch (d) {
        const _ = d instanceof Error ? d.message : "Failed to update permissions";
        throw p({ code: "NETWORK_ERROR", message: _ }), new Error(_);
      } finally {
        v(!1);
      }
    },
    [r, a, t]
  ), R = A(
    (h) => !a || !t || t === "owner" ? !0 : m[t]?.[h] ?? !1,
    [a, t, m]
  );
  return k(() => {
    a?.id && f();
  }, [a?.id, f]), {
    permissions: m,
    canAccess: R,
    updatePermissions: N,
    isLoading: y,
    isUpdating: g,
    error: S,
    fetchPermissions: f
  };
}
function L({ checked: o, onChange: r, disabled: c, label: a }) {
  return /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": o,
      "aria-label": a,
      disabled: c,
      className: `cedros-toggle cedros-toggle-sm ${o ? "cedros-toggle-on" : "cedros-toggle-off"} ${c ? "cedros-toggle-disabled" : ""}`,
      onClick: () => !c && r(!o),
      children: /* @__PURE__ */ e("span", { className: "cedros-toggle-track", children: /* @__PURE__ */ e("span", { className: "cedros-toggle-thumb" }) })
    }
  );
}
function se({ userRole: o }) {
  const { permissions: r, updatePermissions: c, isLoading: a, isUpdating: t, error: m } = ee(), { features: b, isLoading: y } = V(), u = O(null), g = O(null), v = o === "owner", S = b.cedrosPay, p = A(
    (s) => {
      g.current = s, u.current && clearTimeout(u.current), u.current = setTimeout(() => {
        g.current && (c(g.current).catch(() => {
        }), g.current = null);
      }, 500);
    },
    [c]
  );
  k(() => () => {
    u.current && clearTimeout(u.current);
  }, []);
  const l = A(
    (s, n, f) => {
      const N = {
        ...r,
        [s]: {
          ...r[s],
          [n]: f
        }
      };
      p(N);
    },
    [r, p]
  );
  return a || y ? /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e("div", { className: "cedros-dashboard__loading", children: "Loading permissions..." }) }) : v ? /* @__PURE__ */ i("div", { className: "cedros-dashboard__section cedros-permissions-section", children: [
    /* @__PURE__ */ i("div", { className: "cedros-permissions-header", children: [
      /* @__PURE__ */ e("p", { className: "cedros-permissions-description", children: "Configure which dashboard sections each role can access. Owners always have full access." }),
      m && /* @__PURE__ */ e("div", { className: "cedros-permissions-error", children: m.message }),
      t && /* @__PURE__ */ e("span", { className: "cedros-permissions-saving", children: "Saving..." })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-permissions-matrix", children: /* @__PURE__ */ e("table", { className: "cedros-permissions-table", children: /* @__PURE__ */ i("tbody", { children: [
      /* @__PURE__ */ i("tr", { className: "cedros-permissions-group-header", children: [
        /* @__PURE__ */ e("th", { className: "cedros-permissions-section-header", children: "Cedros Login" }),
        /* @__PURE__ */ e("th", { className: "cedros-permissions-role-header", children: "Admin" }),
        /* @__PURE__ */ e("th", { className: "cedros-permissions-role-header", children: "Member" })
      ] }),
      X.map((s) => /* @__PURE__ */ i("tr", { className: "cedros-permissions-row", children: [
        /* @__PURE__ */ e("td", { className: "cedros-permissions-section-label", children: w[s] }),
        /* @__PURE__ */ e("td", { className: "cedros-permissions-toggle-cell", children: /* @__PURE__ */ e(
          L,
          {
            checked: r.admin[s] ?? !1,
            onChange: (n) => l("admin", s, n),
            disabled: t,
            label: `Admin access to ${w[s]}`
          }
        ) }),
        /* @__PURE__ */ e("td", { className: "cedros-permissions-toggle-cell", children: /* @__PURE__ */ e(
          L,
          {
            checked: r.member[s] ?? !1,
            onChange: (n) => l("member", s, n),
            disabled: t,
            label: `Member access to ${w[s]}`
          }
        ) })
      ] }, s)),
      S && /* @__PURE__ */ i(W, { children: [
        /* @__PURE__ */ i("tr", { className: "cedros-permissions-group-header", children: [
          /* @__PURE__ */ e("th", { className: "cedros-permissions-section-header", children: "Cedros Pay" }),
          /* @__PURE__ */ e("th", { className: "cedros-permissions-role-header", children: "Admin" }),
          /* @__PURE__ */ e("th", { className: "cedros-permissions-role-header", children: "Member" })
        ] }),
        Z.map((s) => /* @__PURE__ */ i("tr", { className: "cedros-permissions-row", children: [
          /* @__PURE__ */ e("td", { className: "cedros-permissions-section-label", children: w[s] }),
          /* @__PURE__ */ e("td", { className: "cedros-permissions-toggle-cell", children: /* @__PURE__ */ e(
            L,
            {
              checked: r.admin[s] ?? !1,
              onChange: (n) => l("admin", s, n),
              disabled: t,
              label: `Admin access to ${w[s]}`
            }
          ) }),
          /* @__PURE__ */ e("td", { className: "cedros-permissions-toggle-cell", children: /* @__PURE__ */ e(
            L,
            {
              checked: r.member[s] ?? !1,
              onChange: (n) => l("member", s, n),
              disabled: t,
              label: `Member access to ${w[s]}`
            }
          ) })
        ] }, s))
      ] })
    ] }) }) })
  ] }) : /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e("div", { className: "cedros-dashboard__empty", children: "Only organization owners can configure dashboard permissions." }) });
}
function de({ pluginContext: o }) {
  const [r, c] = C("members"), {
    activeOrg: a,
    hasPermission: t,
    role: m,
    isLoading: b,
    error: y,
    fetchOrgs: u
  } = q(), {
    members: g,
    isLoading: v,
    error: S,
    fetchMembers: p,
    updateMemberRole: l,
    removeMember: s
  } = G(a?.id ?? ""), {
    invites: n,
    isLoading: f,
    error: N,
    fetchInvites: R,
    createInvite: h,
    cancelInvite: d,
    resendInvite: _
  } = H(a?.id ?? "");
  k(() => {
    a?.id && (p(), R());
  }, [a?.id, p, R]);
  const I = $(
    () => g.reduce(
      (M, D) => (M[D.role] = (M[D.role] ?? 0) + 1, M),
      {}
    ),
    [g]
  );
  if (b && !a)
    return /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__empty", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading organization..." })
    ] }) });
  if (y && !a)
    return /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__empty", children: [
      /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: y.message }),
      /* @__PURE__ */ e("button", { type: "button", className: "cedros-button cedros-button-outline", onClick: u, children: "Retry" })
    ] }) });
  if (!a)
    return /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e("div", { className: "cedros-dashboard__empty", children: "No organizations found." }) });
  const P = t("invite:create"), U = t("invite:cancel"), T = n.length, B = I.owner ?? 0, F = I.admin ?? 0, x = I.member ?? 0;
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__team", children: [
    /* @__PURE__ */ e(
      Q,
      {
        stats: [
          { label: "Owners", value: B },
          { label: "Admins", value: F },
          { label: "Members", value: x },
          { label: "Pending Invites", value: T }
        ]
      }
    ),
    /* @__PURE__ */ i("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${r === "members" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => c("members"),
          "aria-selected": r === "members",
          role: "tab",
          children: "Members"
        }
      ),
      /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${r === "invites" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => c("invites"),
          "aria-selected": r === "invites",
          role: "tab",
          children: [
            "Pending Invites",
            T > 0 && ` (${T})`
          ]
        }
      ),
      m === "owner" && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${r === "permissions" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => c("permissions"),
          "aria-selected": r === "permissions",
          role: "tab",
          children: "Permissions"
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: [
      r === "members" && /* @__PURE__ */ e(
        z,
        {
          members: g,
          currentUserId: o.userId,
          isLoading: v,
          error: S?.message,
          canManage: t("member:remove"),
          canChangeRoles: t("member:role_change"),
          onUpdateRole: l,
          onRemove: s
        }
      ),
      r === "invites" && /* @__PURE__ */ i("div", { className: "cedros-dashboard__invites", children: [
        P && /* @__PURE__ */ i("div", { className: "cedros-dashboard__section", children: [
          /* @__PURE__ */ e("div", { className: "cedros-dashboard__section-header", children: /* @__PURE__ */ e("h3", { className: "cedros-dashboard__section-title", children: "Send Invitation" }) }),
          /* @__PURE__ */ e(
            j,
            {
              onSubmit: h,
              isLoading: f,
              error: N?.message
            }
          )
        ] }),
        /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(
          K,
          {
            invites: n,
            isLoading: f,
            error: N?.message,
            canManage: U || P,
            onCancel: U ? d : void 0,
            onResend: P ? _ : void 0
          }
        ) })
      ] }),
      r === "permissions" && m === "owner" && /* @__PURE__ */ e(se, { userRole: m })
    ] })
  ] });
}
export {
  de as default
};
