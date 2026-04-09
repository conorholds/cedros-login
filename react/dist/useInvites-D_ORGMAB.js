import { jsxs as u, jsx as t } from "react/jsx-runtime";
import { useState as y, useMemo as S, useCallback as C, useRef as I, useEffect as x } from "react";
import { L, E as D, A as R, h as k } from "./ErrorMessage-DObd7075.js";
import { s as O, c as j } from "./EmailRegisterForm-DrtZJXIS.js";
import { b as q } from "./validation-B8kMV3BL.js";
const P = ["owner", "admin", "member"];
function re({
  members: e,
  currentUserId: r,
  isLoading: s = !1,
  error: i,
  canManage: n = !1,
  canChangeRoles: a = !1,
  onUpdateRole: p,
  onRemove: m,
  className: h = ""
}) {
  const [c, E] = y("name"), [o, g] = y("asc"), v = (d) => {
    c === d ? g(o === "asc" ? "desc" : "asc") : (E(d), g("asc"));
  }, l = S(() => {
    const d = { owner: 0, admin: 1, member: 2 };
    return [...e].sort((f, w) => {
      let A, $;
      switch (c) {
        case "name":
          A = (f.user.name || f.user.email || "").toLowerCase(), $ = (w.user.name || w.user.email || "").toLowerCase();
          break;
        case "role":
          A = d[f.role] ?? 99, $ = d[w.role] ?? 99;
          break;
        case "joinedAt":
          A = new Date(f.joinedAt).getTime(), $ = new Date(w.joinedAt).getTime();
          break;
        default:
          return 0;
      }
      return A < $ ? o === "asc" ? -1 : 1 : A > $ ? o === "asc" ? 1 : -1 : 0;
    });
  }, [e, c, o]);
  return s && e.length === 0 ? /* @__PURE__ */ u("div", { className: `cedros-member-list cedros-member-list-loading ${h}`, children: [
    /* @__PURE__ */ t(L, {}),
    /* @__PURE__ */ t("span", { children: "Loading members..." })
  ] }) : i ? /* @__PURE__ */ t("div", { className: `cedros-member-list ${h}`, children: /* @__PURE__ */ t(D, { error: i }) }) : e.length === 0 ? /* @__PURE__ */ t("div", { className: `cedros-member-list cedros-member-list-empty ${h}`, children: /* @__PURE__ */ t("p", { children: "No members found." }) }) : /* @__PURE__ */ t("div", { className: `cedros-member-list ${h}`, children: /* @__PURE__ */ u("table", { className: "cedros-member-table", children: [
    /* @__PURE__ */ t("thead", { children: /* @__PURE__ */ u("tr", { children: [
      /* @__PURE__ */ t("th", { children: /* @__PURE__ */ u(
        "button",
        {
          type: "button",
          className: `cedros-admin-sort-button ${c === "name" ? "cedros-admin-sort-active" : ""}`,
          onClick: () => v("name"),
          children: [
            "Member",
            " ",
            /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: c === "name" ? o === "asc" ? "↑" : "↓" : "↕" })
          ]
        }
      ) }),
      /* @__PURE__ */ t("th", { children: /* @__PURE__ */ u(
        "button",
        {
          type: "button",
          className: `cedros-admin-sort-button ${c === "role" ? "cedros-admin-sort-active" : ""}`,
          onClick: () => v("role"),
          children: [
            "Role",
            " ",
            /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: c === "role" ? o === "asc" ? "↑" : "↓" : "↕" })
          ]
        }
      ) }),
      /* @__PURE__ */ t("th", { children: /* @__PURE__ */ u(
        "button",
        {
          type: "button",
          className: `cedros-admin-sort-button ${c === "joinedAt" ? "cedros-admin-sort-active" : ""}`,
          onClick: () => v("joinedAt"),
          children: [
            "Joined",
            " ",
            /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: c === "joinedAt" ? o === "asc" ? "↑" : "↓" : "↕" })
          ]
        }
      ) }),
      (n || a) && /* @__PURE__ */ t("th", { children: "Actions" })
    ] }) }),
    /* @__PURE__ */ t("tbody", { children: l.map((d) => /* @__PURE__ */ t(
      _,
      {
        member: d,
        isCurrentUser: d.userId === r,
        canManage: n,
        canChangeRoles: a,
        onUpdateRole: p,
        onRemove: m
      },
      d.id
    )) })
  ] }) });
}
function _({
  member: e,
  isCurrentUser: r,
  canManage: s,
  canChangeRoles: i,
  onUpdateRole: n,
  onRemove: a
}) {
  const [p, m] = y(!1), [h, c] = y(e.role), E = C(
    async (l) => {
      if (!(!n || l === e.role)) {
        m(!0);
        try {
          await n(e.userId, l), c(l);
        } catch {
          c(e.role);
        } finally {
          m(!1);
        }
      }
    },
    [e.userId, e.role, n]
  ), o = C(async () => {
    if (!(!a || !window.confirm(
      `Are you sure you want to remove ${e.user.name || e.user.email} from this organization?`
    ))) {
      m(!0);
      try {
        await a(e.userId);
      } finally {
        m(!1);
      }
    }
  }, [e.userId, e.user.name, e.user.email, a]), g = e.role === "owner", v = !r && !g;
  return /* @__PURE__ */ u("tr", { className: `cedros-member-row ${r ? "cedros-member-row-current" : ""}`, children: [
    /* @__PURE__ */ u("td", { className: "cedros-member-info", children: [
      /* @__PURE__ */ t(B, { user: e.user }),
      /* @__PURE__ */ u("div", { className: "cedros-member-details", children: [
        /* @__PURE__ */ u("span", { className: "cedros-member-name", children: [
          e.user.name || "Unknown",
          r && /* @__PURE__ */ t("span", { className: "cedros-member-you", children: "(you)" })
        ] }),
        /* @__PURE__ */ t("span", { className: "cedros-member-email", children: e.user.email })
      ] })
    ] }),
    /* @__PURE__ */ t("td", { className: "cedros-member-role", children: i && v && n ? /* @__PURE__ */ t(
      "select",
      {
        value: h,
        onChange: (l) => E(l.target.value),
        disabled: p,
        className: "cedros-role-select",
        children: P.map((l) => /* @__PURE__ */ t("option", { value: l, children: l.charAt(0).toUpperCase() + l.slice(1) }, l))
      }
    ) : /* @__PURE__ */ t("span", { className: `cedros-role-badge cedros-role-badge-${e.role}`, children: e.role.charAt(0).toUpperCase() + e.role.slice(1) }) }),
    /* @__PURE__ */ t("td", { className: "cedros-member-joined", children: V(e.joinedAt) }),
    (s || i) && /* @__PURE__ */ t("td", { className: "cedros-member-actions", children: s && v && a && /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger cedros-button-sm",
        onClick: o,
        disabled: p,
        "aria-label": `Remove ${e.user.name || e.user.email}`,
        children: p ? /* @__PURE__ */ t(L, { size: "sm" }) : "Remove"
      }
    ) })
  ] });
}
function B({ user: e }) {
  const r = O(e.picture);
  if (r)
    return /* @__PURE__ */ t(
      "img",
      {
        src: r,
        alt: e.name || e.email || "Member",
        className: "cedros-member-avatar",
        referrerPolicy: "no-referrer"
      }
    );
  const s = (e.name?.[0] || e.email?.[0] || "?").toUpperCase();
  return /* @__PURE__ */ t("div", { className: "cedros-member-avatar-placeholder", children: s });
}
function V(e) {
  return new Date(e).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
const J = ["admin", "member"];
function se({
  onSubmit: e,
  isLoading: r = !1,
  error: s,
  availableRoles: i = J,
  defaultRole: n = "member",
  className: a = ""
}) {
  const [p, m] = y(""), [h, c] = y(n), [E, o] = y(null), [g, v] = y(!1), l = I(null), d = I(!0);
  x(() => (d.current = !0, () => {
    d.current = !1, l.current !== null && (window.clearTimeout(l.current), l.current = null);
  }), []);
  const f = C(
    async (w) => {
      w.preventDefault(), o(null), v(!1);
      const A = p.trim();
      if (!A) {
        o("Email is required");
        return;
      }
      if (!q(A)) {
        o("Please enter a valid email address");
        return;
      }
      try {
        await e(A, h), m(""), c(n), v(!0), l.current !== null && window.clearTimeout(l.current), l.current = window.setTimeout(() => {
          d.current && v(!1), l.current = null;
        }, 3e3);
      } catch {
      }
    },
    [p, h, n, e]
  );
  return /* @__PURE__ */ u("form", { className: `cedros-invite-form ${a}`, onSubmit: f, children: [
    (s || E) && /* @__PURE__ */ t(D, { error: E ?? s ?? null }),
    g && /* @__PURE__ */ u("div", { className: "cedros-invite-success", role: "status", children: [
      /* @__PURE__ */ t(W, {}),
      /* @__PURE__ */ t("span", { children: "Invitation sent successfully!" })
    ] }),
    /* @__PURE__ */ u("div", { className: "cedros-invite-form-row", children: [
      /* @__PURE__ */ u("div", { className: "cedros-form-group cedros-invite-email-group", children: [
        /* @__PURE__ */ t("label", { htmlFor: "invite-email", className: "cedros-form-label", children: "Email Address" }),
        /* @__PURE__ */ t(
          "input",
          {
            id: "invite-email",
            type: "email",
            className: "cedros-form-input",
            value: p,
            onChange: (w) => m(w.target.value),
            placeholder: "colleague@example.com",
            disabled: r,
            autoComplete: "email"
          }
        )
      ] }),
      /* @__PURE__ */ u("div", { className: "cedros-form-group cedros-invite-role-group", children: [
        /* @__PURE__ */ t("label", { htmlFor: "invite-role", className: "cedros-form-label", children: "Role" }),
        /* @__PURE__ */ t(
          "select",
          {
            id: "invite-role",
            className: "cedros-form-select",
            value: h,
            onChange: (w) => c(w.target.value),
            disabled: r,
            children: i.map((w) => /* @__PURE__ */ t("option", { value: w, children: w.charAt(0).toUpperCase() + w.slice(1) }, w))
          }
        )
      ] }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary cedros-invite-submit",
          disabled: r || !p.trim(),
          children: r ? /* @__PURE__ */ t(L, { size: "sm" }) : "Send Invite"
        }
      )
    ] }),
    /* @__PURE__ */ t("p", { className: "cedros-form-hint", children: "The invited user will receive an email with a link to join your organization." })
  ] });
}
function W() {
  return /* @__PURE__ */ t(
    "svg",
    {
      className: "cedros-invite-check",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ t(
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
function ne({
  invites: e,
  isLoading: r = !1,
  error: s,
  canManage: i = !1,
  onCancel: n,
  onResend: a,
  className: p = ""
}) {
  return r && e.length === 0 ? /* @__PURE__ */ u("div", { className: `cedros-invite-list cedros-invite-list-loading ${p}`, children: [
    /* @__PURE__ */ t(L, {}),
    /* @__PURE__ */ t("span", { children: "Loading invites..." })
  ] }) : s ? /* @__PURE__ */ t("div", { className: `cedros-invite-list ${p}`, children: /* @__PURE__ */ t(D, { error: s }) }) : e.length === 0 ? /* @__PURE__ */ t("div", { className: `cedros-invite-list cedros-invite-list-empty ${p}`, children: /* @__PURE__ */ t("p", { children: "No pending invites." }) }) : /* @__PURE__ */ t("div", { className: `cedros-invite-list ${p}`, children: /* @__PURE__ */ t("ul", { className: "cedros-invite-items", children: e.map((m) => /* @__PURE__ */ t(
    G,
    {
      invite: m,
      canManage: i,
      onCancel: n,
      onResend: a
    },
    m.id
  )) }) });
}
function G({ invite: e, canManage: r, onCancel: s, onResend: i }) {
  const [n, a] = y(!1), [p, m] = y(!1), h = I(null), c = new Date(e.expiresAt) < /* @__PURE__ */ new Date(), E = C(async () => {
    if (!(!s || !window.confirm(
      `Are you sure you want to cancel the invite for ${e.email}?`
    ))) {
      a(!0);
      try {
        await s(e.id);
      } finally {
        a(!1);
      }
    }
  }, [e.id, e.email, s]), o = C(async () => {
    if (i) {
      a(!0), m(!1);
      try {
        await i(e.id), m(!0), h.current !== null && window.clearTimeout(h.current), h.current = window.setTimeout(() => {
          m(!1), h.current = null;
        }, 3e3);
      } finally {
        a(!1);
      }
    }
  }, [e.id, i]);
  return x(() => () => {
    h.current !== null && (window.clearTimeout(h.current), h.current = null);
  }, []), /* @__PURE__ */ u("li", { className: `cedros-invite-item ${c ? "cedros-invite-item-expired" : ""}`, children: [
    /* @__PURE__ */ u("div", { className: "cedros-invite-item-info", children: [
      /* @__PURE__ */ u("div", { className: "cedros-invite-item-main", children: [
        /* @__PURE__ */ t("span", { className: "cedros-invite-item-email", children: e.email }),
        /* @__PURE__ */ t("span", { className: `cedros-role-badge cedros-role-badge-${e.role}`, children: e.role.charAt(0).toUpperCase() + e.role.slice(1) }),
        c && /* @__PURE__ */ t("span", { className: "cedros-invite-expired-badge", children: "Expired" })
      ] }),
      /* @__PURE__ */ u("div", { className: "cedros-invite-item-meta", children: [
        /* @__PURE__ */ u("span", { className: "cedros-invite-item-date", children: [
          "Invited ",
          z(e.createdAt)
        ] }),
        !c && /* @__PURE__ */ u("span", { className: "cedros-invite-item-expires", children: [
          "Expires ",
          H(e.expiresAt)
        ] })
      ] })
    ] }),
    r && /* @__PURE__ */ u("div", { className: "cedros-invite-item-actions", children: [
      p && /* @__PURE__ */ t("span", { className: "cedros-invite-resend-success", children: "Sent!" }),
      i && !c && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: o,
          disabled: n,
          "aria-label": `Resend invite to ${e.email}`,
          children: n ? /* @__PURE__ */ t(L, { size: "sm" }) : "Resend"
        }
      ),
      s && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-danger cedros-button-sm",
          onClick: E,
          disabled: n,
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
function H(e) {
  const r = new Date(e), s = /* @__PURE__ */ new Date(), i = r.getTime() - s.getTime(), n = Math.ceil(i / (1e3 * 60 * 60 * 24));
  return n < 0 ? "expired" : n === 0 ? "today" : n === 1 ? "tomorrow" : n < 7 ? `in ${n} days` : z(e);
}
class K {
  client;
  constructor(r, s, i, n) {
    this.client = new R({ baseUrl: r, timeoutMs: s, retryAttempts: i, getAccessToken: n });
  }
  /**
   * List all members of an organization
   */
  async listMembers(r, s = 50, i = 0) {
    try {
      const n = await this.client.get(
        `/orgs/${r}/members?limit=${s}&offset=${i}`
      );
      return {
        members: n.members.map((a) => ({
          id: a.id,
          userId: a.userId,
          orgId: r,
          role: a.role,
          joinedAt: a.joinedAt,
          user: {
            id: a.userId,
            email: a.email,
            name: a.name
          }
        })),
        total: n.total
      };
    } catch (n) {
      throw k(n, "Failed to list members");
    }
  }
  /**
   * Update a member's role
   */
  async updateMemberRole(r, s, i) {
    try {
      return await this.client.patch(`/orgs/${r}/members/${s}`, i);
    } catch (n) {
      throw k(n, "Failed to update member role");
    }
  }
  /**
   * Remove a member from the organization
   */
  async removeMember(r, s) {
    try {
      await this.client.delete(`/orgs/${r}/members/${s}`);
    } catch (i) {
      throw k(i, "Failed to remove member");
    }
  }
}
function ie(e) {
  const { config: r, authState: s, _internal: i } = j(), [n, a] = y([]), [p, m] = y(0), [h, c] = y(!1), [E, o] = y(null), g = I(void 0), v = I(0), l = S(
    () => new K(
      r.serverUrl,
      r.requestTimeout,
      r.retryAttempts,
      i?.getAccessToken
    ),
    [r.serverUrl, r.requestTimeout, r.retryAttempts, i]
  ), d = I(l);
  d.current = l;
  const f = C(
    async ($) => {
      if (!e || s !== "authenticated") {
        a([]), m(0);
        return;
      }
      c(!0), o(null);
      const M = ++v.current;
      try {
        const { limit: b = 50, offset: N = 0 } = $ ?? {}, T = await d.current.listMembers(e, b, N);
        if (M !== v.current) return;
        a(T.members), m(T.total);
      } catch (b) {
        if (M !== v.current) return;
        o(b);
      } finally {
        M === v.current && c(!1);
      }
    },
    [e, s]
  );
  x(() => {
    if (s !== "authenticated") {
      g.current = void 0;
      return;
    }
    e !== g.current && (g.current = e, f());
  }, [e, s, f]);
  const w = C(
    async ($, M) => {
      if (!e)
        throw new Error("No organization selected");
      c(!0), o(null);
      try {
        await d.current.updateMemberRole(e, $, { role: M }), await f();
      } catch (b) {
        throw o(b), b;
      } finally {
        c(!1);
      }
    },
    [e, f]
  ), A = C(
    async ($) => {
      if (!e)
        throw new Error("No organization selected");
      c(!0), o(null);
      try {
        await d.current.removeMember(e, $), await f();
      } catch (M) {
        throw o(M), M;
      } finally {
        c(!1);
      }
    },
    [e, f]
  );
  return {
    members: n,
    total: p,
    isLoading: h,
    error: E,
    fetchMembers: f,
    updateMemberRole: w,
    removeMember: A
  };
}
class Q {
  client;
  constructor(r, s, i, n) {
    this.client = new R({ baseUrl: r, timeoutMs: s, retryAttempts: i, getAccessToken: n });
  }
  /**
   * List all pending invites for an organization
   */
  async listInvites(r, s = 50, i = 0) {
    try {
      const n = await this.client.get(
        `/orgs/${r}/invites?limit=${s}&offset=${i}`
      );
      return {
        invites: n.invites.map((a) => ({
          id: a.id,
          orgId: a.orgId,
          email: a.email,
          role: a.role,
          invitedBy: a.invitedBy,
          createdAt: a.createdAt,
          expiresAt: a.expiresAt
        })),
        total: n.total
      };
    } catch (n) {
      throw k(n, "Failed to list invites");
    }
  }
  /**
   * Create a new invite
   */
  async createInvite(r, s) {
    try {
      return await this.client.post(`/orgs/${r}/invites`, s);
    } catch (i) {
      throw k(i, "Failed to create invite");
    }
  }
  /**
   * Cancel a pending invite
   */
  async cancelInvite(r, s) {
    try {
      await this.client.delete(`/orgs/${r}/invites/${s}`);
    } catch (i) {
      throw k(i, "Failed to cancel invite");
    }
  }
  /**
   * Resend an invite email
   */
  async resendInvite(r, s) {
    try {
      await this.client.post(`/orgs/${r}/invites/${s}/resend`, {});
    } catch (i) {
      throw k(i, "Failed to resend invite");
    }
  }
  /**
   * Accept an invite (public endpoint)
   */
  async acceptInvite(r) {
    try {
      return await this.client.post("/invites/accept", r);
    } catch (s) {
      throw k(s, "Failed to accept invite");
    }
  }
}
function ae(e) {
  const { config: r, authState: s, _internal: i } = j(), [n, a] = y([]), [p, m] = y(0), [h, c] = y(!1), [E, o] = y(null), g = I(void 0), v = I(0), l = S(
    () => new Q(
      r.serverUrl,
      r.requestTimeout,
      r.retryAttempts,
      i?.getAccessToken
    ),
    [r.serverUrl, r.requestTimeout, r.retryAttempts, i]
  ), d = I(l);
  d.current = l;
  const f = C(
    async (b) => {
      if (!e || s !== "authenticated") {
        a([]), m(0);
        return;
      }
      c(!0), o(null);
      const N = ++v.current;
      try {
        const { limit: T = 50, offset: U = 0 } = b ?? {}, F = await d.current.listInvites(e, T, U);
        if (N !== v.current) return;
        a(F.invites), m(F.total);
      } catch (T) {
        if (N !== v.current) return;
        o(T);
      } finally {
        N === v.current && c(!1);
      }
    },
    [e, s]
  );
  x(() => {
    if (s !== "authenticated") {
      g.current = void 0;
      return;
    }
    e !== g.current && (g.current = e, f());
  }, [e, s, f]);
  const w = C(
    async (b, N = "member") => {
      if (!e)
        throw new Error("No organization selected");
      c(!0), o(null);
      try {
        await d.current.createInvite(e, { email: b, role: N }), await f();
      } catch (T) {
        throw o(T), T;
      } finally {
        c(!1);
      }
    },
    [e, f]
  ), A = C(
    async (b) => {
      if (!e)
        throw new Error("No organization selected");
      c(!0), o(null);
      try {
        await d.current.cancelInvite(e, b), await f();
      } catch (N) {
        throw o(N), N;
      } finally {
        c(!1);
      }
    },
    [e, f]
  ), $ = C(
    async (b) => {
      if (!e)
        throw new Error("No organization selected");
      c(!0), o(null);
      try {
        await d.current.resendInvite(e, b);
      } catch (N) {
        throw o(N), N;
      } finally {
        c(!1);
      }
    },
    [e]
  ), M = C(async (b) => {
    c(!0), o(null);
    try {
      return await d.current.acceptInvite({ token: b });
    } catch (N) {
      throw o(N), N;
    } finally {
      c(!1);
    }
  }, []);
  return {
    invites: n,
    total: p,
    isLoading: h,
    error: E,
    fetchInvites: f,
    createInvite: w,
    cancelInvite: A,
    resendInvite: $,
    acceptInvite: M
  };
}
export {
  se as I,
  re as M,
  ae as a,
  ne as b,
  ie as u
};
