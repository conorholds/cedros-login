import { jsx as e, jsxs as a } from "react/jsx-runtime";
import { useState as O, useEffect as $, useMemo as T } from "react";
import { u as j, a as z, M as A, I as U, b as B, P as F } from "./PermissionsSection-BGaj_sI7.js";
import { S as q } from "./StatsBar-BX-hHtTq.js";
import { u as D } from "./useOrgs-Be3KH4ib.js";
function V({ pluginContext: f }) {
  const [s, i] = O("members"), {
    activeOrg: r,
    hasPermission: n,
    role: o,
    isLoading: I,
    error: b,
    fetchOrgs: C
  } = D(), {
    members: t,
    isLoading: L,
    error: M,
    fetchMembers: v,
    updateMemberRole: y,
    removeMember: R
  } = j(r?.id ?? ""), {
    invites: u,
    isLoading: h,
    error: g,
    fetchInvites: _,
    createInvite: S,
    cancelInvite: P,
    resendInvite: w
  } = z(r?.id ?? "");
  $(() => {
    r?.id && (v(), _());
  }, [r?.id, v, _]);
  const d = T(
    () => t.reduce(
      (l, N) => (l[N.role] = (l[N.role] ?? 0) + 1, l),
      {}
    ),
    [t]
  );
  if (I && !r)
    return /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ a("div", { className: "cedros-dashboard__empty", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading organization..." })
    ] }) });
  if (b && !r)
    return /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ a("div", { className: "cedros-dashboard__empty", children: [
      /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: b.message }),
      /* @__PURE__ */ e("button", { type: "button", className: "cedros-button cedros-button-outline", onClick: C, children: "Retry" })
    ] }) });
  if (!r)
    return /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e("div", { className: "cedros-dashboard__empty", children: "No organizations found." }) });
  const c = n("invite:create"), p = n("invite:cancel"), m = u.length, k = d.owner ?? 0, x = d.admin ?? 0, E = d.member ?? 0;
  return /* @__PURE__ */ a("div", { className: "cedros-dashboard__team", children: [
    /* @__PURE__ */ e(
      q,
      {
        stats: [
          { label: "Owners", value: k },
          { label: "Admins", value: x },
          { label: "Members", value: E },
          { label: "Pending Invites", value: m }
        ]
      }
    ),
    /* @__PURE__ */ a("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "members" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => i("members"),
          "aria-selected": s === "members",
          role: "tab",
          children: "Members"
        }
      ),
      /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "invites" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => i("invites"),
          "aria-selected": s === "invites",
          role: "tab",
          children: [
            "Pending Invites",
            m > 0 && ` (${m})`
          ]
        }
      ),
      o === "owner" && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "permissions" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => i("permissions"),
          "aria-selected": s === "permissions",
          role: "tab",
          children: "Permissions"
        }
      )
    ] }),
    /* @__PURE__ */ a("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: [
      s === "members" && /* @__PURE__ */ e(
        A,
        {
          members: t,
          currentUserId: f.userId,
          isLoading: L,
          error: M?.message,
          canManage: n("member:remove"),
          canChangeRoles: n("member:role_change"),
          onUpdateRole: y,
          onRemove: R
        }
      ),
      s === "invites" && /* @__PURE__ */ a("div", { className: "cedros-dashboard__invites", children: [
        c && /* @__PURE__ */ a("div", { className: "cedros-dashboard__section", children: [
          /* @__PURE__ */ e("div", { className: "cedros-dashboard__section-header", children: /* @__PURE__ */ e("h3", { className: "cedros-dashboard__section-title", children: "Send Invitation" }) }),
          /* @__PURE__ */ e(
            U,
            {
              onSubmit: S,
              isLoading: h,
              error: g?.message
            }
          )
        ] }),
        /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(
          B,
          {
            invites: u,
            isLoading: h,
            error: g?.message,
            canManage: p || c,
            onCancel: p ? P : void 0,
            onResend: c ? w : void 0
          }
        ) })
      ] }),
      s === "permissions" && o === "owner" && /* @__PURE__ */ e(F, { userRole: o })
    ] })
  ] });
}
export {
  V as default
};
