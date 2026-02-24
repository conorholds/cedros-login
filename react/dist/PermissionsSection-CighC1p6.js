import { jsxs as f, jsx as s, Fragment as q } from "react/jsx-runtime";
import { useState as v, useMemo as M, useCallback as S, useRef as C, useEffect as R } from "react";
import { L as O } from "./LoadingSpinner-6vml-zwr.js";
import { E as P } from "./ErrorMessage-CcEK0pYO.js";
import { a as B } from "./sanitization-CQ-H1MSg.js";
import { b as W } from "./validation-B8kMV3BL.js";
import { A as F, h as I, u as U } from "./useCedrosLogin-_94MmGGq.js";
import { u as H } from "./useOrgs-C3pzMA9h.js";
import { u as V } from "./useSystemSettings-DBlAMjFi.js";
const K = ["owner", "admin", "member"];
function ye({
  members: e,
  currentUserId: r,
  isLoading: n = !1,
  error: a,
  canManage: t = !1,
  canChangeRoles: c = !1,
  onUpdateRole: h,
  onRemove: u,
  className: m = ""
}) {
  const [o, E] = v("name"), [l, y] = v("asc"), p = (d) => {
    o === d ? y(l === "asc" ? "desc" : "asc") : (E(d), y("asc"));
  }, i = M(() => {
    const d = { owner: 0, admin: 1, member: 2 };
    return [...e].sort((g, w) => {
      let $, b;
      switch (o) {
        case "name":
          $ = (g.user.name || g.user.email || "").toLowerCase(), b = (w.user.name || w.user.email || "").toLowerCase();
          break;
        case "role":
          $ = d[g.role] ?? 99, b = d[w.role] ?? 99;
          break;
        case "joinedAt":
          $ = new Date(g.joinedAt).getTime(), b = new Date(w.joinedAt).getTime();
          break;
        default:
          return 0;
      }
      return $ < b ? l === "asc" ? -1 : 1 : $ > b ? l === "asc" ? 1 : -1 : 0;
    });
  }, [e, o, l]);
  return n && e.length === 0 ? /* @__PURE__ */ f("div", { className: `cedros-member-list cedros-member-list-loading ${m}`, children: [
    /* @__PURE__ */ s(O, {}),
    /* @__PURE__ */ s("span", { children: "Loading members..." })
  ] }) : a ? /* @__PURE__ */ s("div", { className: `cedros-member-list ${m}`, children: /* @__PURE__ */ s(P, { error: a }) }) : e.length === 0 ? /* @__PURE__ */ s("div", { className: `cedros-member-list cedros-member-list-empty ${m}`, children: /* @__PURE__ */ s("p", { children: "No members found." }) }) : /* @__PURE__ */ s("div", { className: `cedros-member-list ${m}`, children: /* @__PURE__ */ f("table", { className: "cedros-member-table", children: [
    /* @__PURE__ */ s("thead", { children: /* @__PURE__ */ f("tr", { children: [
      /* @__PURE__ */ s("th", { children: /* @__PURE__ */ f(
        "button",
        {
          type: "button",
          className: `cedros-admin-sort-button ${o === "name" ? "cedros-admin-sort-active" : ""}`,
          onClick: () => p("name"),
          children: [
            "Member",
            " ",
            /* @__PURE__ */ s("span", { className: "cedros-admin-sort-icon", children: o === "name" ? l === "asc" ? "↑" : "↓" : "↕" })
          ]
        }
      ) }),
      /* @__PURE__ */ s("th", { children: /* @__PURE__ */ f(
        "button",
        {
          type: "button",
          className: `cedros-admin-sort-button ${o === "role" ? "cedros-admin-sort-active" : ""}`,
          onClick: () => p("role"),
          children: [
            "Role",
            " ",
            /* @__PURE__ */ s("span", { className: "cedros-admin-sort-icon", children: o === "role" ? l === "asc" ? "↑" : "↓" : "↕" })
          ]
        }
      ) }),
      /* @__PURE__ */ s("th", { children: /* @__PURE__ */ f(
        "button",
        {
          type: "button",
          className: `cedros-admin-sort-button ${o === "joinedAt" ? "cedros-admin-sort-active" : ""}`,
          onClick: () => p("joinedAt"),
          children: [
            "Joined",
            " ",
            /* @__PURE__ */ s("span", { className: "cedros-admin-sort-icon", children: o === "joinedAt" ? l === "asc" ? "↑" : "↓" : "↕" })
          ]
        }
      ) }),
      (t || c) && /* @__PURE__ */ s("th", { children: "Actions" })
    ] }) }),
    /* @__PURE__ */ s("tbody", { children: i.map((d) => /* @__PURE__ */ s(
      G,
      {
        member: d,
        isCurrentUser: d.userId === r,
        canManage: t,
        canChangeRoles: c,
        onUpdateRole: h,
        onRemove: u
      },
      d.id
    )) })
  ] }) });
}
function G({
  member: e,
  isCurrentUser: r,
  canManage: n,
  canChangeRoles: a,
  onUpdateRole: t,
  onRemove: c
}) {
  const [h, u] = v(!1), [m, o] = v(e.role), E = S(
    async (i) => {
      if (!(!t || i === e.role)) {
        u(!0);
        try {
          await t(e.userId, i), o(i);
        } catch {
          o(e.role);
        } finally {
          u(!1);
        }
      }
    },
    [e.userId, e.role, t]
  ), l = S(async () => {
    if (!(!c || !window.confirm(
      `Are you sure you want to remove ${e.user.name || e.user.email} from this organization?`
    ))) {
      u(!0);
      try {
        await c(e.userId);
      } finally {
        u(!1);
      }
    }
  }, [e.userId, e.user.name, e.user.email, c]), y = e.role === "owner", p = !r && !y;
  return /* @__PURE__ */ f("tr", { className: `cedros-member-row ${r ? "cedros-member-row-current" : ""}`, children: [
    /* @__PURE__ */ f("td", { className: "cedros-member-info", children: [
      /* @__PURE__ */ s(J, { user: e.user }),
      /* @__PURE__ */ f("div", { className: "cedros-member-details", children: [
        /* @__PURE__ */ f("span", { className: "cedros-member-name", children: [
          e.user.name || "Unknown",
          r && /* @__PURE__ */ s("span", { className: "cedros-member-you", children: "(you)" })
        ] }),
        /* @__PURE__ */ s("span", { className: "cedros-member-email", children: e.user.email })
      ] })
    ] }),
    /* @__PURE__ */ s("td", { className: "cedros-member-role", children: a && p && t ? /* @__PURE__ */ s(
      "select",
      {
        value: m,
        onChange: (i) => E(i.target.value),
        disabled: h,
        className: "cedros-role-select",
        children: K.map((i) => /* @__PURE__ */ s("option", { value: i, children: i.charAt(0).toUpperCase() + i.slice(1) }, i))
      }
    ) : /* @__PURE__ */ s("span", { className: `cedros-role-badge cedros-role-badge-${e.role}`, children: e.role.charAt(0).toUpperCase() + e.role.slice(1) }) }),
    /* @__PURE__ */ s("td", { className: "cedros-member-joined", children: Y(e.joinedAt) }),
    (n || a) && /* @__PURE__ */ s("td", { className: "cedros-member-actions", children: n && p && c && /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger cedros-button-sm",
        onClick: l,
        disabled: h,
        "aria-label": `Remove ${e.user.name || e.user.email}`,
        children: h ? /* @__PURE__ */ s(O, { size: "sm" }) : "Remove"
      }
    ) })
  ] });
}
function J({ user: e }) {
  const r = B(e.picture);
  if (r)
    return /* @__PURE__ */ s(
      "img",
      {
        src: r,
        alt: e.name || e.email || "Member",
        className: "cedros-member-avatar",
        referrerPolicy: "no-referrer"
      }
    );
  const n = (e.name?.[0] || e.email?.[0] || "?").toUpperCase();
  return /* @__PURE__ */ s("div", { className: "cedros-member-avatar-placeholder", children: n });
}
function Y(e) {
  return new Date(e).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
const Q = ["admin", "member"];
function we({
  onSubmit: e,
  isLoading: r = !1,
  error: n,
  availableRoles: a = Q,
  defaultRole: t = "member",
  className: c = ""
}) {
  const [h, u] = v(""), [m, o] = v(t), [E, l] = v(null), [y, p] = v(!1), i = C(null), d = C(!0);
  R(() => (d.current = !0, () => {
    d.current = !1, i.current !== null && (window.clearTimeout(i.current), i.current = null);
  }), []);
  const g = S(
    async (w) => {
      w.preventDefault(), l(null), p(!1);
      const $ = h.trim();
      if (!$) {
        l("Email is required");
        return;
      }
      if (!W($)) {
        l("Please enter a valid email address");
        return;
      }
      try {
        await e($, m), u(""), o(t), p(!0), i.current !== null && window.clearTimeout(i.current), i.current = window.setTimeout(() => {
          d.current && p(!1), i.current = null;
        }, 3e3);
      } catch {
      }
    },
    [h, m, t, e]
  );
  return /* @__PURE__ */ f("form", { className: `cedros-invite-form ${c}`, onSubmit: g, children: [
    (n || E) && /* @__PURE__ */ s(P, { error: E ?? n ?? null }),
    y && /* @__PURE__ */ f("div", { className: "cedros-invite-success", role: "status", children: [
      /* @__PURE__ */ s(X, {}),
      /* @__PURE__ */ s("span", { children: "Invitation sent successfully!" })
    ] }),
    /* @__PURE__ */ f("div", { className: "cedros-invite-form-row", children: [
      /* @__PURE__ */ f("div", { className: "cedros-form-group cedros-invite-email-group", children: [
        /* @__PURE__ */ s("label", { htmlFor: "invite-email", className: "cedros-form-label", children: "Email Address" }),
        /* @__PURE__ */ s(
          "input",
          {
            id: "invite-email",
            type: "email",
            className: "cedros-form-input",
            value: h,
            onChange: (w) => u(w.target.value),
            placeholder: "colleague@example.com",
            disabled: r,
            autoComplete: "email"
          }
        )
      ] }),
      /* @__PURE__ */ f("div", { className: "cedros-form-group cedros-invite-role-group", children: [
        /* @__PURE__ */ s("label", { htmlFor: "invite-role", className: "cedros-form-label", children: "Role" }),
        /* @__PURE__ */ s(
          "select",
          {
            id: "invite-role",
            className: "cedros-form-select",
            value: m,
            onChange: (w) => o(w.target.value),
            disabled: r,
            children: a.map((w) => /* @__PURE__ */ s("option", { value: w, children: w.charAt(0).toUpperCase() + w.slice(1) }, w))
          }
        )
      ] }),
      /* @__PURE__ */ s(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary cedros-invite-submit",
          disabled: r || !h.trim(),
          children: r ? /* @__PURE__ */ s(O, { size: "sm" }) : "Send Invite"
        }
      )
    ] }),
    /* @__PURE__ */ s("p", { className: "cedros-form-hint", children: "The invited user will receive an email with a link to join your organization." })
  ] });
}
function X() {
  return /* @__PURE__ */ s(
    "svg",
    {
      className: "cedros-invite-check",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ s(
        "path",
        {
          d: "M3 8L6 11L13 5",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function ve({
  invites: e,
  isLoading: r = !1,
  error: n,
  canManage: a = !1,
  onCancel: t,
  onResend: c,
  className: h = ""
}) {
  return r && e.length === 0 ? /* @__PURE__ */ f("div", { className: `cedros-invite-list cedros-invite-list-loading ${h}`, children: [
    /* @__PURE__ */ s(O, {}),
    /* @__PURE__ */ s("span", { children: "Loading invites..." })
  ] }) : n ? /* @__PURE__ */ s("div", { className: `cedros-invite-list ${h}`, children: /* @__PURE__ */ s(P, { error: n }) }) : e.length === 0 ? /* @__PURE__ */ s("div", { className: `cedros-invite-list cedros-invite-list-empty ${h}`, children: /* @__PURE__ */ s("p", { children: "No pending invites." }) }) : /* @__PURE__ */ s("div", { className: `cedros-invite-list ${h}`, children: /* @__PURE__ */ s("ul", { className: "cedros-invite-items", children: e.map((u) => /* @__PURE__ */ s(
    Z,
    {
      invite: u,
      canManage: a,
      onCancel: t,
      onResend: c
    },
    u.id
  )) }) });
}
function Z({ invite: e, canManage: r, onCancel: n, onResend: a }) {
  const [t, c] = v(!1), [h, u] = v(!1), m = C(null), o = new Date(e.expiresAt) < /* @__PURE__ */ new Date(), E = S(async () => {
    if (!(!n || !window.confirm(
      `Are you sure you want to cancel the invite for ${e.email}?`
    ))) {
      c(!0);
      try {
        await n(e.id);
      } finally {
        c(!1);
      }
    }
  }, [e.id, e.email, n]), l = S(async () => {
    if (a) {
      c(!0), u(!1);
      try {
        await a(e.id), u(!0), m.current !== null && window.clearTimeout(m.current), m.current = window.setTimeout(() => {
          u(!1), m.current = null;
        }, 3e3);
      } finally {
        c(!1);
      }
    }
  }, [e.id, a]);
  return R(() => () => {
    m.current !== null && (window.clearTimeout(m.current), m.current = null);
  }, []), /* @__PURE__ */ f("li", { className: `cedros-invite-item ${o ? "cedros-invite-item-expired" : ""}`, children: [
    /* @__PURE__ */ f("div", { className: "cedros-invite-item-info", children: [
      /* @__PURE__ */ f("div", { className: "cedros-invite-item-main", children: [
        /* @__PURE__ */ s("span", { className: "cedros-invite-item-email", children: e.email }),
        /* @__PURE__ */ s("span", { className: `cedros-role-badge cedros-role-badge-${e.role}`, children: e.role.charAt(0).toUpperCase() + e.role.slice(1) }),
        o && /* @__PURE__ */ s("span", { className: "cedros-invite-expired-badge", children: "Expired" })
      ] }),
      /* @__PURE__ */ f("div", { className: "cedros-invite-item-meta", children: [
        /* @__PURE__ */ f("span", { className: "cedros-invite-item-date", children: [
          "Invited ",
          z(e.createdAt)
        ] }),
        !o && /* @__PURE__ */ f("span", { className: "cedros-invite-item-expires", children: [
          "Expires ",
          ee(e.expiresAt)
        ] })
      ] })
    ] }),
    r && /* @__PURE__ */ f("div", { className: "cedros-invite-item-actions", children: [
      h && /* @__PURE__ */ s("span", { className: "cedros-invite-resend-success", children: "Sent!" }),
      a && !o && /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: l,
          disabled: t,
          "aria-label": `Resend invite to ${e.email}`,
          children: t ? /* @__PURE__ */ s(O, { size: "sm" }) : "Resend"
        }
      ),
      n && /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-danger cedros-button-sm",
          onClick: E,
          disabled: t,
          "aria-label": `Cancel invite for ${e.email}`,
          children: "Cancel"
        }
      )
    ] })
  ] });
}
function z(e) {
  return new Date(e).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function ee(e) {
  const r = new Date(e), n = /* @__PURE__ */ new Date(), a = r.getTime() - n.getTime(), t = Math.ceil(a / (1e3 * 60 * 60 * 24));
  return t < 0 ? "expired" : t === 0 ? "today" : t === 1 ? "tomorrow" : t < 7 ? `in ${t} days` : z(e);
}
class se {
  client;
  constructor(r, n, a, t) {
    this.client = new F({ baseUrl: r, timeoutMs: n, retryAttempts: a, getAccessToken: t });
  }
  /**
   * List all members of an organization
   */
  async listMembers(r, n = 50, a = 0) {
    try {
      const t = await this.client.get(
        `/orgs/${r}/members?limit=${n}&offset=${a}`
      );
      return {
        members: t.members.map((c) => ({
          id: c.id,
          userId: c.userId,
          orgId: r,
          role: c.role,
          joinedAt: c.joinedAt,
          user: {
            id: c.userId,
            email: c.email,
            name: c.name
          }
        })),
        total: t.total
      };
    } catch (t) {
      throw I(t, "Failed to list members");
    }
  }
  /**
   * Update a member's role
   */
  async updateMemberRole(r, n, a) {
    try {
      return await this.client.patch(`/orgs/${r}/members/${n}`, a);
    } catch (t) {
      throw I(t, "Failed to update member role");
    }
  }
  /**
   * Remove a member from the organization
   */
  async removeMember(r, n) {
    try {
      await this.client.delete(`/orgs/${r}/members/${n}`);
    } catch (a) {
      throw I(a, "Failed to remove member");
    }
  }
}
function be(e) {
  const { config: r, authState: n, _internal: a } = U(), [t, c] = v([]), [h, u] = v(0), [m, o] = v(!1), [E, l] = v(null), y = C(void 0), p = C(0), i = M(
    () => new se(
      r.serverUrl,
      r.requestTimeout,
      r.retryAttempts,
      a?.getAccessToken
    ),
    [r.serverUrl, r.requestTimeout, r.retryAttempts, a]
  ), d = C(i);
  d.current = i;
  const g = S(
    async (b) => {
      if (!e || n !== "authenticated") {
        c([]), u(0);
        return;
      }
      o(!0), l(null);
      const N = ++p.current;
      try {
        const { limit: A = 50, offset: T = 0 } = b ?? {}, _ = await d.current.listMembers(e, A, T);
        if (N !== p.current) return;
        c(_.members), u(_.total);
      } catch (A) {
        if (N !== p.current) return;
        l(A);
      } finally {
        N === p.current && o(!1);
      }
    },
    [e, n]
  );
  R(() => {
    if (n !== "authenticated") {
      y.current = void 0;
      return;
    }
    e !== y.current && (y.current = e, g());
  }, [e, n, g]);
  const w = S(
    async (b, N) => {
      if (!e)
        throw new Error("No organization selected");
      o(!0), l(null);
      try {
        await d.current.updateMemberRole(e, b, { role: N }), await g();
      } catch (A) {
        throw l(A), A;
      } finally {
        o(!1);
      }
    },
    [e, g]
  ), $ = S(
    async (b) => {
      if (!e)
        throw new Error("No organization selected");
      o(!0), l(null);
      try {
        await d.current.removeMember(e, b), await g();
      } catch (N) {
        throw l(N), N;
      } finally {
        o(!1);
      }
    },
    [e, g]
  );
  return {
    members: t,
    total: h,
    isLoading: m,
    error: E,
    fetchMembers: g,
    updateMemberRole: w,
    removeMember: $
  };
}
class re {
  client;
  constructor(r, n, a, t) {
    this.client = new F({ baseUrl: r, timeoutMs: n, retryAttempts: a, getAccessToken: t });
  }
  /**
   * List all pending invites for an organization
   */
  async listInvites(r, n = 50, a = 0) {
    try {
      const t = await this.client.get(
        `/orgs/${r}/invites?limit=${n}&offset=${a}`
      );
      return {
        invites: t.invites.map((c) => ({
          id: c.id,
          orgId: c.orgId,
          email: c.email,
          role: c.role,
          invitedBy: c.invitedBy,
          createdAt: c.createdAt,
          expiresAt: c.expiresAt
        })),
        total: t.total
      };
    } catch (t) {
      throw I(t, "Failed to list invites");
    }
  }
  /**
   * Create a new invite
   */
  async createInvite(r, n) {
    try {
      return await this.client.post(`/orgs/${r}/invites`, n);
    } catch (a) {
      throw I(a, "Failed to create invite");
    }
  }
  /**
   * Cancel a pending invite
   */
  async cancelInvite(r, n) {
    try {
      await this.client.delete(`/orgs/${r}/invites/${n}`);
    } catch (a) {
      throw I(a, "Failed to cancel invite");
    }
  }
  /**
   * Resend an invite email
   */
  async resendInvite(r, n) {
    try {
      await this.client.post(`/orgs/${r}/invites/${n}/resend`, {});
    } catch (a) {
      throw I(a, "Failed to resend invite");
    }
  }
  /**
   * Accept an invite (public endpoint)
   */
  async acceptInvite(r) {
    try {
      return await this.client.post("/invites/accept", r);
    } catch (n) {
      throw I(n, "Failed to accept invite");
    }
  }
}
function Ne(e) {
  const { config: r, authState: n, _internal: a } = U(), [t, c] = v([]), [h, u] = v(0), [m, o] = v(!1), [E, l] = v(null), y = C(void 0), p = C(0), i = M(
    () => new re(
      r.serverUrl,
      r.requestTimeout,
      r.retryAttempts,
      a?.getAccessToken
    ),
    [r.serverUrl, r.requestTimeout, r.retryAttempts, a]
  ), d = C(i);
  d.current = i;
  const g = S(
    async (A) => {
      if (!e || n !== "authenticated") {
        c([]), u(0);
        return;
      }
      o(!0), l(null);
      const T = ++p.current;
      try {
        const { limit: _ = 50, offset: j = 0 } = A ?? {}, x = await d.current.listInvites(e, _, j);
        if (T !== p.current) return;
        c(x.invites), u(x.total);
      } catch (_) {
        if (T !== p.current) return;
        l(_);
      } finally {
        T === p.current && o(!1);
      }
    },
    [e, n]
  );
  R(() => {
    if (n !== "authenticated") {
      y.current = void 0;
      return;
    }
    e !== y.current && (y.current = e, g());
  }, [e, n, g]);
  const w = S(
    async (A, T = "member") => {
      if (!e)
        throw new Error("No organization selected");
      o(!0), l(null);
      try {
        await d.current.createInvite(e, { email: A, role: T }), await g();
      } catch (_) {
        throw l(_), _;
      } finally {
        o(!1);
      }
    },
    [e, g]
  ), $ = S(
    async (A) => {
      if (!e)
        throw new Error("No organization selected");
      o(!0), l(null);
      try {
        await d.current.cancelInvite(e, A), await g();
      } catch (T) {
        throw l(T), T;
      } finally {
        o(!1);
      }
    },
    [e, g]
  ), b = S(
    async (A) => {
      if (!e)
        throw new Error("No organization selected");
      o(!0), l(null);
      try {
        await d.current.resendInvite(e, A);
      } catch (T) {
        throw l(T), T;
      } finally {
        o(!1);
      }
    },
    [e]
  ), N = S(async (A) => {
    o(!0), l(null);
    try {
      return await d.current.acceptInvite({ token: A });
    } catch (T) {
      throw l(T), T;
    } finally {
      o(!1);
    }
  }, []);
  return {
    invites: t,
    total: h,
    isLoading: m,
    error: E,
    fetchInvites: g,
    createInvite: w,
    cancelInvite: $,
    resendInvite: b,
    acceptInvite: N
  };
}
const te = {
  organizations: !1,
  sso: !1,
  mfa: !1,
  walletSigning: !1,
  credits: !1,
  userWithdrawals: !1,
  cedrosPay: !1
};
function ne() {
  const { settings: e, isLoading: r, error: n, fetchSettings: a, getValue: t } = V(), [c, h] = v(!1);
  R(() => {
    c || (a(), h(!0));
  }, [a, c]);
  const u = S((l) => l === void 0 ? !1 : l === "true" || l === "1", []), m = M(() => Object.keys(e).length === 0 ? te : {
    organizations: u(t("feature_organizations")),
    sso: u(t("feature_sso")),
    mfa: u(t("feature_mfa")),
    walletSigning: u(t("feature_wallet_signing")),
    credits: u(t("feature_credits")),
    userWithdrawals: u(t("feature_user_withdrawals")),
    cedrosPay: u(t("feature_cedros_pay"))
  }, [e, t, u]), o = S(async () => {
    await a();
  }, [a]), E = S(
    (l) => m[l],
    [m]
  );
  return {
    features: m,
    isLoading: r,
    error: n,
    refetch: o,
    isEnabled: E
  };
}
const ae = [
  "users",
  "team",
  "deposits",
  "withdrawals",
  "settings-wallet",
  "settings-auth",
  "settings-messaging",
  "settings-credits",
  "settings-server"
], ie = [
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
], L = {
  // Cedros Login
  users: "Users",
  team: "Team",
  deposits: "Deposits",
  withdrawals: "Withdrawals",
  "settings-wallet": "Wallet Settings",
  "settings-auth": "Auth Settings",
  "settings-messaging": "Messages Settings",
  "settings-credits": "Credits Settings",
  "settings-server": "Server Settings",
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
}, k = {
  admin: {
    // Cedros Login
    users: !0,
    team: !0,
    deposits: !0,
    withdrawals: !0,
    "settings-wallet": !0,
    "settings-auth": !0,
    "settings-messaging": !0,
    "settings-credits": !0,
    "settings-server": !0,
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
    deposits: !1,
    withdrawals: !1,
    "settings-wallet": !1,
    "settings-auth": !1,
    "settings-messaging": !1,
    "settings-credits": !1,
    "settings-server": !1,
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
function ce() {
  const { config: e, authState: r, _internal: n } = U(), { activeOrg: a, role: t } = H(), [c, h] = v(
    k
  ), [u, m] = v(!1), [o, E] = v(!1), [l, y] = v(null), p = C(0), i = M(
    () => new F({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: n?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, n]
  ), d = C(i);
  d.current = i;
  const g = S(async () => {
    if (r !== "authenticated" || !a) {
      h(k);
      return;
    }
    m(!0), y(null);
    const b = ++p.current;
    try {
      const N = await d.current.get(
        "/admin/dashboard-permissions"
      );
      if (b !== p.current) return;
      h(N.permissions);
    } catch (N) {
      if (b !== p.current) return;
      if (N instanceof Error && N.message.includes("404"))
        h(k);
      else {
        const A = N instanceof Error ? N.message : "Failed to fetch permissions";
        y({ code: "NETWORK_ERROR", message: A }), h(k);
      }
    } finally {
      b === p.current && m(!1);
    }
  }, [r, a]), w = S(
    async (b) => {
      if (r !== "authenticated" || !a)
        throw new Error("Not authenticated");
      if (t !== "owner")
        throw new Error("Only owners can modify dashboard permissions");
      E(!0), y(null);
      try {
        await d.current.request({
          method: "PUT",
          path: "/admin/dashboard-permissions",
          body: b
        }), h(b);
      } catch (N) {
        const A = N instanceof Error ? N.message : "Failed to update permissions";
        throw y({ code: "NETWORK_ERROR", message: A }), new Error(A);
      } finally {
        E(!1);
      }
    },
    [r, a, t]
  ), $ = S(
    (b) => !a || !t || t === "owner" ? !0 : c[t]?.[b] ?? !1,
    [a, t, c]
  );
  return R(() => {
    a?.id && g();
  }, [a?.id, g]), {
    permissions: c,
    canAccess: $,
    updatePermissions: w,
    isLoading: u,
    isUpdating: o,
    error: l,
    fetchPermissions: g
  };
}
function D({ checked: e, onChange: r, disabled: n, label: a }) {
  return /* @__PURE__ */ s(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": e,
      "aria-label": a,
      disabled: n,
      className: `cedros-toggle cedros-toggle-sm ${e ? "cedros-toggle-on" : "cedros-toggle-off"} ${n ? "cedros-toggle-disabled" : ""}`,
      onClick: () => !n && r(!e),
      children: /* @__PURE__ */ s("span", { className: "cedros-toggle-track", children: /* @__PURE__ */ s("span", { className: "cedros-toggle-thumb" }) })
    }
  );
}
function Ae({ userRole: e }) {
  const { permissions: r, updatePermissions: n, isLoading: a, isUpdating: t, error: c } = ce(), { features: h, isLoading: u } = ne(), m = C(null), o = C(null), E = e === "owner", l = h.cedrosPay, y = S(
    (i) => {
      o.current = i, m.current && clearTimeout(m.current), m.current = setTimeout(() => {
        o.current && (n(o.current).catch(() => {
        }), o.current = null);
      }, 500);
    },
    [n]
  );
  R(() => () => {
    m.current && clearTimeout(m.current);
  }, []);
  const p = S(
    (i, d, g) => {
      const w = {
        ...r,
        [i]: {
          ...r[i],
          [d]: g
        }
      };
      y(w);
    },
    [r, y]
  );
  return a || u ? /* @__PURE__ */ s("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ s("div", { className: "cedros-dashboard__loading", children: "Loading permissions..." }) }) : E ? /* @__PURE__ */ f("div", { className: "cedros-dashboard__section cedros-permissions-section", children: [
    /* @__PURE__ */ f("div", { className: "cedros-permissions-header", children: [
      /* @__PURE__ */ s("p", { className: "cedros-permissions-description", children: "Configure which dashboard sections each role can access. Owners always have full access." }),
      c && /* @__PURE__ */ s("div", { className: "cedros-permissions-error", children: c.message }),
      t && /* @__PURE__ */ s("span", { className: "cedros-permissions-saving", children: "Saving..." })
    ] }),
    /* @__PURE__ */ s("div", { className: "cedros-permissions-matrix", children: /* @__PURE__ */ s("table", { className: "cedros-permissions-table", children: /* @__PURE__ */ f("tbody", { children: [
      /* @__PURE__ */ f("tr", { className: "cedros-permissions-group-header", children: [
        /* @__PURE__ */ s("th", { className: "cedros-permissions-section-header", children: "Cedros Login" }),
        /* @__PURE__ */ s("th", { className: "cedros-permissions-role-header", children: "Admin" }),
        /* @__PURE__ */ s("th", { className: "cedros-permissions-role-header", children: "Member" })
      ] }),
      ae.map((i) => /* @__PURE__ */ f("tr", { className: "cedros-permissions-row", children: [
        /* @__PURE__ */ s("td", { className: "cedros-permissions-section-label", children: L[i] }),
        /* @__PURE__ */ s("td", { className: "cedros-permissions-toggle-cell", children: /* @__PURE__ */ s(
          D,
          {
            checked: r.admin[i] ?? !1,
            onChange: (d) => p("admin", i, d),
            disabled: t,
            label: `Admin access to ${L[i]}`
          }
        ) }),
        /* @__PURE__ */ s("td", { className: "cedros-permissions-toggle-cell", children: /* @__PURE__ */ s(
          D,
          {
            checked: r.member[i] ?? !1,
            onChange: (d) => p("member", i, d),
            disabled: t,
            label: `Member access to ${L[i]}`
          }
        ) })
      ] }, i)),
      l && /* @__PURE__ */ f(q, { children: [
        /* @__PURE__ */ f("tr", { className: "cedros-permissions-group-header", children: [
          /* @__PURE__ */ s("th", { className: "cedros-permissions-section-header", children: "Cedros Pay" }),
          /* @__PURE__ */ s("th", { className: "cedros-permissions-role-header", children: "Admin" }),
          /* @__PURE__ */ s("th", { className: "cedros-permissions-role-header", children: "Member" })
        ] }),
        ie.map((i) => /* @__PURE__ */ f("tr", { className: "cedros-permissions-row", children: [
          /* @__PURE__ */ s("td", { className: "cedros-permissions-section-label", children: L[i] }),
          /* @__PURE__ */ s("td", { className: "cedros-permissions-toggle-cell", children: /* @__PURE__ */ s(
            D,
            {
              checked: r.admin[i] ?? !1,
              onChange: (d) => p("admin", i, d),
              disabled: t,
              label: `Admin access to ${L[i]}`
            }
          ) }),
          /* @__PURE__ */ s("td", { className: "cedros-permissions-toggle-cell", children: /* @__PURE__ */ s(
            D,
            {
              checked: r.member[i] ?? !1,
              onChange: (d) => p("member", i, d),
              disabled: t,
              label: `Member access to ${L[i]}`
            }
          ) })
        ] }, i))
      ] })
    ] }) }) })
  ] }) : /* @__PURE__ */ s("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ s("div", { className: "cedros-dashboard__empty", children: "Only organization owners can configure dashboard permissions." }) });
}
export {
  we as I,
  ye as M,
  Ae as P,
  Ne as a,
  ve as b,
  ne as c,
  ce as d,
  be as u
};
