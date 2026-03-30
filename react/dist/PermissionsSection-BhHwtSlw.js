import { jsxs as m, jsx as s, Fragment as z } from "react/jsx-runtime";
import { useState as b, useMemo as _, useCallback as S, useRef as T, useEffect as L } from "react";
import { L as O, E as P } from "./ErrorMessage-59nRkszi.js";
import { a as B, u as W } from "./useServerFeatures-CnThdmAr.js";
import { b as G } from "./validation-B8kMV3BL.js";
import { A as U, h as R, u as H } from "./useCedrosLogin-aNpnZjyZ.js";
import { a as x } from "./useSystemSettings--h-KXzo0.js";
import { u as K } from "./useOrgs-D-8bxH0h.js";
const V = ["owner", "admin", "member"];
function pe({
  members: e,
  currentUserId: t,
  isLoading: r = !1,
  error: i,
  canManage: n = !1,
  canChangeRoles: c = !1,
  onUpdateRole: f,
  onRemove: g,
  className: u = ""
}) {
  const [o, C] = b("name"), [d, y] = b("asc"), h = (l) => {
    o === l ? y(d === "asc" ? "desc" : "asc") : (C(l), y("asc"));
  }, a = _(() => {
    const l = { owner: 0, admin: 1, member: 2 };
    return [...e].sort((p, w) => {
      let $, v;
      switch (o) {
        case "name":
          $ = (p.user.name || p.user.email || "").toLowerCase(), v = (w.user.name || w.user.email || "").toLowerCase();
          break;
        case "role":
          $ = l[p.role] ?? 99, v = l[w.role] ?? 99;
          break;
        case "joinedAt":
          $ = new Date(p.joinedAt).getTime(), v = new Date(w.joinedAt).getTime();
          break;
        default:
          return 0;
      }
      return $ < v ? d === "asc" ? -1 : 1 : $ > v ? d === "asc" ? 1 : -1 : 0;
    });
  }, [e, o, d]);
  return r && e.length === 0 ? /* @__PURE__ */ m("div", { className: `cedros-member-list cedros-member-list-loading ${u}`, children: [
    /* @__PURE__ */ s(O, {}),
    /* @__PURE__ */ s("span", { children: "Loading members..." })
  ] }) : i ? /* @__PURE__ */ s("div", { className: `cedros-member-list ${u}`, children: /* @__PURE__ */ s(P, { error: i }) }) : e.length === 0 ? /* @__PURE__ */ s("div", { className: `cedros-member-list cedros-member-list-empty ${u}`, children: /* @__PURE__ */ s("p", { children: "No members found." }) }) : /* @__PURE__ */ s("div", { className: `cedros-member-list ${u}`, children: /* @__PURE__ */ m("table", { className: "cedros-member-table", children: [
    /* @__PURE__ */ s("thead", { children: /* @__PURE__ */ m("tr", { children: [
      /* @__PURE__ */ s("th", { children: /* @__PURE__ */ m(
        "button",
        {
          type: "button",
          className: `cedros-admin-sort-button ${o === "name" ? "cedros-admin-sort-active" : ""}`,
          onClick: () => h("name"),
          children: [
            "Member",
            " ",
            /* @__PURE__ */ s("span", { className: "cedros-admin-sort-icon", children: o === "name" ? d === "asc" ? "↑" : "↓" : "↕" })
          ]
        }
      ) }),
      /* @__PURE__ */ s("th", { children: /* @__PURE__ */ m(
        "button",
        {
          type: "button",
          className: `cedros-admin-sort-button ${o === "role" ? "cedros-admin-sort-active" : ""}`,
          onClick: () => h("role"),
          children: [
            "Role",
            " ",
            /* @__PURE__ */ s("span", { className: "cedros-admin-sort-icon", children: o === "role" ? d === "asc" ? "↑" : "↓" : "↕" })
          ]
        }
      ) }),
      /* @__PURE__ */ s("th", { children: /* @__PURE__ */ m(
        "button",
        {
          type: "button",
          className: `cedros-admin-sort-button ${o === "joinedAt" ? "cedros-admin-sort-active" : ""}`,
          onClick: () => h("joinedAt"),
          children: [
            "Joined",
            " ",
            /* @__PURE__ */ s("span", { className: "cedros-admin-sort-icon", children: o === "joinedAt" ? d === "asc" ? "↑" : "↓" : "↕" })
          ]
        }
      ) }),
      (n || c) && /* @__PURE__ */ s("th", { children: "Actions" })
    ] }) }),
    /* @__PURE__ */ s("tbody", { children: a.map((l) => /* @__PURE__ */ s(
      J,
      {
        member: l,
        isCurrentUser: l.userId === t,
        canManage: n,
        canChangeRoles: c,
        onUpdateRole: f,
        onRemove: g
      },
      l.id
    )) })
  ] }) });
}
function J({
  member: e,
  isCurrentUser: t,
  canManage: r,
  canChangeRoles: i,
  onUpdateRole: n,
  onRemove: c
}) {
  const [f, g] = b(!1), [u, o] = b(e.role), C = S(
    async (a) => {
      if (!(!n || a === e.role)) {
        g(!0);
        try {
          await n(e.userId, a), o(a);
        } catch {
          o(e.role);
        } finally {
          g(!1);
        }
      }
    },
    [e.userId, e.role, n]
  ), d = S(async () => {
    if (!(!c || !window.confirm(
      `Are you sure you want to remove ${e.user.name || e.user.email} from this organization?`
    ))) {
      g(!0);
      try {
        await c(e.userId);
      } finally {
        g(!1);
      }
    }
  }, [e.userId, e.user.name, e.user.email, c]), y = e.role === "owner", h = !t && !y;
  return /* @__PURE__ */ m("tr", { className: `cedros-member-row ${t ? "cedros-member-row-current" : ""}`, children: [
    /* @__PURE__ */ m("td", { className: "cedros-member-info", children: [
      /* @__PURE__ */ s(Q, { user: e.user }),
      /* @__PURE__ */ m("div", { className: "cedros-member-details", children: [
        /* @__PURE__ */ m("span", { className: "cedros-member-name", children: [
          e.user.name || "Unknown",
          t && /* @__PURE__ */ s("span", { className: "cedros-member-you", children: "(you)" })
        ] }),
        /* @__PURE__ */ s("span", { className: "cedros-member-email", children: e.user.email })
      ] })
    ] }),
    /* @__PURE__ */ s("td", { className: "cedros-member-role", children: i && h && n ? /* @__PURE__ */ s(
      "select",
      {
        value: u,
        onChange: (a) => C(a.target.value),
        disabled: f,
        className: "cedros-role-select",
        children: V.map((a) => /* @__PURE__ */ s("option", { value: a, children: a.charAt(0).toUpperCase() + a.slice(1) }, a))
      }
    ) : /* @__PURE__ */ s("span", { className: `cedros-role-badge cedros-role-badge-${e.role}`, children: e.role.charAt(0).toUpperCase() + e.role.slice(1) }) }),
    /* @__PURE__ */ s("td", { className: "cedros-member-joined", children: Y(e.joinedAt) }),
    (r || i) && /* @__PURE__ */ s("td", { className: "cedros-member-actions", children: r && h && c && /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger cedros-button-sm",
        onClick: d,
        disabled: f,
        "aria-label": `Remove ${e.user.name || e.user.email}`,
        children: f ? /* @__PURE__ */ s(O, { size: "sm" }) : "Remove"
      }
    ) })
  ] });
}
function Q({ user: e }) {
  const t = B(e.picture);
  if (t)
    return /* @__PURE__ */ s(
      "img",
      {
        src: t,
        alt: e.name || e.email || "Member",
        className: "cedros-member-avatar",
        referrerPolicy: "no-referrer"
      }
    );
  const r = (e.name?.[0] || e.email?.[0] || "?").toUpperCase();
  return /* @__PURE__ */ s("div", { className: "cedros-member-avatar-placeholder", children: r });
}
function Y(e) {
  return new Date(e).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
const X = ["admin", "member"];
function ge({
  onSubmit: e,
  isLoading: t = !1,
  error: r,
  availableRoles: i = X,
  defaultRole: n = "member",
  className: c = ""
}) {
  const [f, g] = b(""), [u, o] = b(n), [C, d] = b(null), [y, h] = b(!1), a = T(null), l = T(!0);
  L(() => (l.current = !0, () => {
    l.current = !1, a.current !== null && (window.clearTimeout(a.current), a.current = null);
  }), []);
  const p = S(
    async (w) => {
      w.preventDefault(), d(null), h(!1);
      const $ = f.trim();
      if (!$) {
        d("Email is required");
        return;
      }
      if (!G($)) {
        d("Please enter a valid email address");
        return;
      }
      try {
        await e($, u), g(""), o(n), h(!0), a.current !== null && window.clearTimeout(a.current), a.current = window.setTimeout(() => {
          l.current && h(!1), a.current = null;
        }, 3e3);
      } catch {
      }
    },
    [f, u, n, e]
  );
  return /* @__PURE__ */ m("form", { className: `cedros-invite-form ${c}`, onSubmit: p, children: [
    (r || C) && /* @__PURE__ */ s(P, { error: C ?? r ?? null }),
    y && /* @__PURE__ */ m("div", { className: "cedros-invite-success", role: "status", children: [
      /* @__PURE__ */ s(Z, {}),
      /* @__PURE__ */ s("span", { children: "Invitation sent successfully!" })
    ] }),
    /* @__PURE__ */ m("div", { className: "cedros-invite-form-row", children: [
      /* @__PURE__ */ m("div", { className: "cedros-form-group cedros-invite-email-group", children: [
        /* @__PURE__ */ s("label", { htmlFor: "invite-email", className: "cedros-form-label", children: "Email Address" }),
        /* @__PURE__ */ s(
          "input",
          {
            id: "invite-email",
            type: "email",
            className: "cedros-form-input",
            value: f,
            onChange: (w) => g(w.target.value),
            placeholder: "colleague@example.com",
            disabled: t,
            autoComplete: "email"
          }
        )
      ] }),
      /* @__PURE__ */ m("div", { className: "cedros-form-group cedros-invite-role-group", children: [
        /* @__PURE__ */ s("label", { htmlFor: "invite-role", className: "cedros-form-label", children: "Role" }),
        /* @__PURE__ */ s(
          "select",
          {
            id: "invite-role",
            className: "cedros-form-select",
            value: u,
            onChange: (w) => o(w.target.value),
            disabled: t,
            children: i.map((w) => /* @__PURE__ */ s("option", { value: w, children: w.charAt(0).toUpperCase() + w.slice(1) }, w))
          }
        )
      ] }),
      /* @__PURE__ */ s(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary cedros-invite-submit",
          disabled: t || !f.trim(),
          children: t ? /* @__PURE__ */ s(O, { size: "sm" }) : "Send Invite"
        }
      )
    ] }),
    /* @__PURE__ */ s("p", { className: "cedros-form-hint", children: "The invited user will receive an email with a link to join your organization." })
  ] });
}
function Z() {
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
function ye({
  invites: e,
  isLoading: t = !1,
  error: r,
  canManage: i = !1,
  onCancel: n,
  onResend: c,
  className: f = ""
}) {
  return t && e.length === 0 ? /* @__PURE__ */ m("div", { className: `cedros-invite-list cedros-invite-list-loading ${f}`, children: [
    /* @__PURE__ */ s(O, {}),
    /* @__PURE__ */ s("span", { children: "Loading invites..." })
  ] }) : r ? /* @__PURE__ */ s("div", { className: `cedros-invite-list ${f}`, children: /* @__PURE__ */ s(P, { error: r }) }) : e.length === 0 ? /* @__PURE__ */ s("div", { className: `cedros-invite-list cedros-invite-list-empty ${f}`, children: /* @__PURE__ */ s("p", { children: "No pending invites." }) }) : /* @__PURE__ */ s("div", { className: `cedros-invite-list ${f}`, children: /* @__PURE__ */ s("ul", { className: "cedros-invite-items", children: e.map((g) => /* @__PURE__ */ s(
    ee,
    {
      invite: g,
      canManage: i,
      onCancel: n,
      onResend: c
    },
    g.id
  )) }) });
}
function ee({ invite: e, canManage: t, onCancel: r, onResend: i }) {
  const [n, c] = b(!1), [f, g] = b(!1), u = T(null), o = new Date(e.expiresAt) < /* @__PURE__ */ new Date(), C = S(async () => {
    if (!(!r || !window.confirm(
      `Are you sure you want to cancel the invite for ${e.email}?`
    ))) {
      c(!0);
      try {
        await r(e.id);
      } finally {
        c(!1);
      }
    }
  }, [e.id, e.email, r]), d = S(async () => {
    if (i) {
      c(!0), g(!1);
      try {
        await i(e.id), g(!0), u.current !== null && window.clearTimeout(u.current), u.current = window.setTimeout(() => {
          g(!1), u.current = null;
        }, 3e3);
      } finally {
        c(!1);
      }
    }
  }, [e.id, i]);
  return L(() => () => {
    u.current !== null && (window.clearTimeout(u.current), u.current = null);
  }, []), /* @__PURE__ */ m("li", { className: `cedros-invite-item ${o ? "cedros-invite-item-expired" : ""}`, children: [
    /* @__PURE__ */ m("div", { className: "cedros-invite-item-info", children: [
      /* @__PURE__ */ m("div", { className: "cedros-invite-item-main", children: [
        /* @__PURE__ */ s("span", { className: "cedros-invite-item-email", children: e.email }),
        /* @__PURE__ */ s("span", { className: `cedros-role-badge cedros-role-badge-${e.role}`, children: e.role.charAt(0).toUpperCase() + e.role.slice(1) }),
        o && /* @__PURE__ */ s("span", { className: "cedros-invite-expired-badge", children: "Expired" })
      ] }),
      /* @__PURE__ */ m("div", { className: "cedros-invite-item-meta", children: [
        /* @__PURE__ */ m("span", { className: "cedros-invite-item-date", children: [
          "Invited ",
          q(e.createdAt)
        ] }),
        !o && /* @__PURE__ */ m("span", { className: "cedros-invite-item-expires", children: [
          "Expires ",
          se(e.expiresAt)
        ] })
      ] })
    ] }),
    t && /* @__PURE__ */ m("div", { className: "cedros-invite-item-actions", children: [
      f && /* @__PURE__ */ s("span", { className: "cedros-invite-resend-success", children: "Sent!" }),
      i && !o && /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: d,
          disabled: n,
          "aria-label": `Resend invite to ${e.email}`,
          children: n ? /* @__PURE__ */ s(O, { size: "sm" }) : "Resend"
        }
      ),
      r && /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-danger cedros-button-sm",
          onClick: C,
          disabled: n,
          "aria-label": `Cancel invite for ${e.email}`,
          children: "Cancel"
        }
      )
    ] })
  ] });
}
function q(e) {
  return new Date(e).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function se(e) {
  const t = new Date(e), r = /* @__PURE__ */ new Date(), i = t.getTime() - r.getTime(), n = Math.ceil(i / (1e3 * 60 * 60 * 24));
  return n < 0 ? "expired" : n === 0 ? "today" : n === 1 ? "tomorrow" : n < 7 ? `in ${n} days` : q(e);
}
class te {
  client;
  constructor(t, r, i, n) {
    this.client = new U({ baseUrl: t, timeoutMs: r, retryAttempts: i, getAccessToken: n });
  }
  /**
   * List all members of an organization
   */
  async listMembers(t, r = 50, i = 0) {
    try {
      const n = await this.client.get(
        `/orgs/${t}/members?limit=${r}&offset=${i}`
      );
      return {
        members: n.members.map((c) => ({
          id: c.id,
          userId: c.userId,
          orgId: t,
          role: c.role,
          joinedAt: c.joinedAt,
          user: {
            id: c.userId,
            email: c.email,
            name: c.name
          }
        })),
        total: n.total
      };
    } catch (n) {
      throw R(n, "Failed to list members");
    }
  }
  /**
   * Update a member's role
   */
  async updateMemberRole(t, r, i) {
    try {
      return await this.client.patch(`/orgs/${t}/members/${r}`, i);
    } catch (n) {
      throw R(n, "Failed to update member role");
    }
  }
  /**
   * Remove a member from the organization
   */
  async removeMember(t, r) {
    try {
      await this.client.delete(`/orgs/${t}/members/${r}`);
    } catch (i) {
      throw R(i, "Failed to remove member");
    }
  }
}
function we(e) {
  const { config: t, authState: r, _internal: i } = x(), [n, c] = b([]), [f, g] = b(0), [u, o] = b(!1), [C, d] = b(null), y = T(void 0), h = T(0), a = _(
    () => new te(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      i?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, i]
  ), l = T(a);
  l.current = a;
  const p = S(
    async (v) => {
      if (!e || r !== "authenticated") {
        c([]), g(0);
        return;
      }
      o(!0), d(null);
      const N = ++h.current;
      try {
        const { limit: A = 50, offset: E = 0 } = v ?? {}, I = await l.current.listMembers(e, A, E);
        if (N !== h.current) return;
        c(I.members), g(I.total);
      } catch (A) {
        if (N !== h.current) return;
        d(A);
      } finally {
        N === h.current && o(!1);
      }
    },
    [e, r]
  );
  L(() => {
    if (r !== "authenticated") {
      y.current = void 0;
      return;
    }
    e !== y.current && (y.current = e, p());
  }, [e, r, p]);
  const w = S(
    async (v, N) => {
      if (!e)
        throw new Error("No organization selected");
      o(!0), d(null);
      try {
        await l.current.updateMemberRole(e, v, { role: N }), await p();
      } catch (A) {
        throw d(A), A;
      } finally {
        o(!1);
      }
    },
    [e, p]
  ), $ = S(
    async (v) => {
      if (!e)
        throw new Error("No organization selected");
      o(!0), d(null);
      try {
        await l.current.removeMember(e, v), await p();
      } catch (N) {
        throw d(N), N;
      } finally {
        o(!1);
      }
    },
    [e, p]
  );
  return {
    members: n,
    total: f,
    isLoading: u,
    error: C,
    fetchMembers: p,
    updateMemberRole: w,
    removeMember: $
  };
}
class re {
  client;
  constructor(t, r, i, n) {
    this.client = new U({ baseUrl: t, timeoutMs: r, retryAttempts: i, getAccessToken: n });
  }
  /**
   * List all pending invites for an organization
   */
  async listInvites(t, r = 50, i = 0) {
    try {
      const n = await this.client.get(
        `/orgs/${t}/invites?limit=${r}&offset=${i}`
      );
      return {
        invites: n.invites.map((c) => ({
          id: c.id,
          orgId: c.orgId,
          email: c.email,
          role: c.role,
          invitedBy: c.invitedBy,
          createdAt: c.createdAt,
          expiresAt: c.expiresAt
        })),
        total: n.total
      };
    } catch (n) {
      throw R(n, "Failed to list invites");
    }
  }
  /**
   * Create a new invite
   */
  async createInvite(t, r) {
    try {
      return await this.client.post(`/orgs/${t}/invites`, r);
    } catch (i) {
      throw R(i, "Failed to create invite");
    }
  }
  /**
   * Cancel a pending invite
   */
  async cancelInvite(t, r) {
    try {
      await this.client.delete(`/orgs/${t}/invites/${r}`);
    } catch (i) {
      throw R(i, "Failed to cancel invite");
    }
  }
  /**
   * Resend an invite email
   */
  async resendInvite(t, r) {
    try {
      await this.client.post(`/orgs/${t}/invites/${r}/resend`, {});
    } catch (i) {
      throw R(i, "Failed to resend invite");
    }
  }
  /**
   * Accept an invite (public endpoint)
   */
  async acceptInvite(t) {
    try {
      return await this.client.post("/invites/accept", t);
    } catch (r) {
      throw R(r, "Failed to accept invite");
    }
  }
}
function ve(e) {
  const { config: t, authState: r, _internal: i } = x(), [n, c] = b([]), [f, g] = b(0), [u, o] = b(!1), [C, d] = b(null), y = T(void 0), h = T(0), a = _(
    () => new re(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      i?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, i]
  ), l = T(a);
  l.current = a;
  const p = S(
    async (A) => {
      if (!e || r !== "authenticated") {
        c([]), g(0);
        return;
      }
      o(!0), d(null);
      const E = ++h.current;
      try {
        const { limit: I = 50, offset: j = 0 } = A ?? {}, F = await l.current.listInvites(e, I, j);
        if (E !== h.current) return;
        c(F.invites), g(F.total);
      } catch (I) {
        if (E !== h.current) return;
        d(I);
      } finally {
        E === h.current && o(!1);
      }
    },
    [e, r]
  );
  L(() => {
    if (r !== "authenticated") {
      y.current = void 0;
      return;
    }
    e !== y.current && (y.current = e, p());
  }, [e, r, p]);
  const w = S(
    async (A, E = "member") => {
      if (!e)
        throw new Error("No organization selected");
      o(!0), d(null);
      try {
        await l.current.createInvite(e, { email: A, role: E }), await p();
      } catch (I) {
        throw d(I), I;
      } finally {
        o(!1);
      }
    },
    [e, p]
  ), $ = S(
    async (A) => {
      if (!e)
        throw new Error("No organization selected");
      o(!0), d(null);
      try {
        await l.current.cancelInvite(e, A), await p();
      } catch (E) {
        throw d(E), E;
      } finally {
        o(!1);
      }
    },
    [e, p]
  ), v = S(
    async (A) => {
      if (!e)
        throw new Error("No organization selected");
      o(!0), d(null);
      try {
        await l.current.resendInvite(e, A);
      } catch (E) {
        throw d(E), E;
      } finally {
        o(!1);
      }
    },
    [e]
  ), N = S(async (A) => {
    o(!0), d(null);
    try {
      return await l.current.acceptInvite({ token: A });
    } catch (E) {
      throw d(E), E;
    } finally {
      o(!1);
    }
  }, []);
  return {
    invites: n,
    total: f,
    isLoading: u,
    error: C,
    fetchInvites: p,
    createInvite: w,
    cancelInvite: $,
    resendInvite: v,
    acceptInvite: N
  };
}
const ne = [
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
  "settings-messaging",
  "settings-credits",
  "settings-compliance",
  "settings-referrals",
  "settings-signup",
  "settings-server",
  "settings-images"
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
], M = {
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
  "settings-wallet": "Wallet Settings",
  "settings-auth": "Auth Settings",
  "settings-messaging": "Messages Settings",
  "settings-credits": "Credits Settings",
  "settings-compliance": "Compliance & Gating",
  "settings-referrals": "Referrals & Rewards",
  "settings-signup": "Signup Gating",
  "settings-server": "Server Settings",
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
}, k = {
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
    "settings-messaging": !0,
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
    "settings-messaging": !1,
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
function ae() {
  const { config: e, authState: t, _internal: r } = H(), { activeOrg: i, role: n } = K(), [c, f] = b(
    k
  ), [g, u] = b(!1), [o, C] = b(!1), [d, y] = b(null), h = T(0), a = _(
    () => new U({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, r]
  ), l = T(a);
  l.current = a;
  const p = S(async () => {
    if (t !== "authenticated" || !i) {
      f(k);
      return;
    }
    u(!0), y(null);
    const v = ++h.current;
    try {
      const N = await l.current.get(
        "/admin/dashboard-permissions"
      );
      if (v !== h.current) return;
      f(N.permissions);
    } catch (N) {
      if (v !== h.current) return;
      if (N instanceof Error && N.message.includes("404"))
        f(k);
      else {
        const A = N instanceof Error ? N.message : "Failed to fetch permissions";
        y({ code: "NETWORK_ERROR", message: A }), f(k);
      }
    } finally {
      v === h.current && u(!1);
    }
  }, [t, i]), w = S(
    async (v) => {
      if (t !== "authenticated" || !i)
        throw new Error("Not authenticated");
      if (n !== "owner")
        throw new Error("Only owners can modify dashboard permissions");
      C(!0), y(null);
      try {
        await l.current.request({
          method: "PUT",
          path: "/admin/dashboard-permissions",
          body: v
        }), f(v);
      } catch (N) {
        const A = N instanceof Error ? N.message : "Failed to update permissions";
        throw y({ code: "NETWORK_ERROR", message: A }), new Error(A);
      } finally {
        C(!1);
      }
    },
    [t, i, n]
  ), $ = S(
    (v) => !i || !n || n === "owner" ? !0 : c[n]?.[v] ?? !1,
    [i, n, c]
  );
  return L(() => {
    i?.id && p();
  }, [i?.id, p]), {
    permissions: c,
    canAccess: $,
    updatePermissions: w,
    isLoading: g,
    isUpdating: o,
    error: d,
    fetchPermissions: p
  };
}
function D({ checked: e, onChange: t, disabled: r, label: i }) {
  return /* @__PURE__ */ s(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": e,
      "aria-label": i,
      disabled: r,
      className: `cedros-toggle cedros-toggle-sm ${e ? "cedros-toggle-on" : "cedros-toggle-off"} ${r ? "cedros-toggle-disabled" : ""}`,
      onClick: () => !r && t(!e),
      children: /* @__PURE__ */ s("span", { className: "cedros-toggle-track", children: /* @__PURE__ */ s("span", { className: "cedros-toggle-thumb" }) })
    }
  );
}
function be({ userRole: e }) {
  const { permissions: t, updatePermissions: r, isLoading: i, isUpdating: n, error: c } = ae(), { features: f, isLoading: g } = W(), u = T(null), o = T(null), C = e === "owner", d = f.cedrosPay, y = S(
    (a) => {
      o.current = a, u.current && clearTimeout(u.current), u.current = setTimeout(() => {
        o.current && (r(o.current).catch(() => {
        }), o.current = null);
      }, 500);
    },
    [r]
  );
  L(() => () => {
    u.current && clearTimeout(u.current);
  }, []);
  const h = S(
    (a, l, p) => {
      const w = {
        ...t,
        [a]: {
          ...t[a],
          [l]: p
        }
      };
      y(w);
    },
    [t, y]
  );
  return i || g ? /* @__PURE__ */ s("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ s("div", { className: "cedros-dashboard__loading", children: "Loading permissions..." }) }) : C ? /* @__PURE__ */ m("div", { className: "cedros-dashboard__section cedros-permissions-section", children: [
    /* @__PURE__ */ m("div", { className: "cedros-permissions-header", children: [
      /* @__PURE__ */ s("p", { className: "cedros-permissions-description", children: "Configure which dashboard sections each role can access. Owners always have full access." }),
      c && /* @__PURE__ */ s("div", { className: "cedros-permissions-error", children: c.message }),
      n && /* @__PURE__ */ s("span", { className: "cedros-permissions-saving", children: "Saving..." })
    ] }),
    /* @__PURE__ */ s("div", { className: "cedros-permissions-matrix", children: /* @__PURE__ */ s("table", { className: "cedros-permissions-table", children: /* @__PURE__ */ m("tbody", { children: [
      /* @__PURE__ */ m("tr", { className: "cedros-permissions-group-header", children: [
        /* @__PURE__ */ s("th", { className: "cedros-permissions-section-header", children: "Cedros Login" }),
        /* @__PURE__ */ s("th", { className: "cedros-permissions-role-header", children: "Admin" }),
        /* @__PURE__ */ s("th", { className: "cedros-permissions-role-header", children: "Member" })
      ] }),
      ne.map((a) => /* @__PURE__ */ m("tr", { className: "cedros-permissions-row", children: [
        /* @__PURE__ */ s("td", { className: "cedros-permissions-section-label", children: M[a] }),
        /* @__PURE__ */ s("td", { className: "cedros-permissions-toggle-cell", children: /* @__PURE__ */ s(
          D,
          {
            checked: t.admin[a] ?? !1,
            onChange: (l) => h("admin", a, l),
            disabled: n,
            label: `Admin access to ${M[a]}`
          }
        ) }),
        /* @__PURE__ */ s("td", { className: "cedros-permissions-toggle-cell", children: /* @__PURE__ */ s(
          D,
          {
            checked: t.member[a] ?? !1,
            onChange: (l) => h("member", a, l),
            disabled: n,
            label: `Member access to ${M[a]}`
          }
        ) })
      ] }, a)),
      d && /* @__PURE__ */ m(z, { children: [
        /* @__PURE__ */ m("tr", { className: "cedros-permissions-group-header", children: [
          /* @__PURE__ */ s("th", { className: "cedros-permissions-section-header", children: "Cedros Pay" }),
          /* @__PURE__ */ s("th", { className: "cedros-permissions-role-header", children: "Admin" }),
          /* @__PURE__ */ s("th", { className: "cedros-permissions-role-header", children: "Member" })
        ] }),
        ie.map((a) => /* @__PURE__ */ m("tr", { className: "cedros-permissions-row", children: [
          /* @__PURE__ */ s("td", { className: "cedros-permissions-section-label", children: M[a] }),
          /* @__PURE__ */ s("td", { className: "cedros-permissions-toggle-cell", children: /* @__PURE__ */ s(
            D,
            {
              checked: t.admin[a] ?? !1,
              onChange: (l) => h("admin", a, l),
              disabled: n,
              label: `Admin access to ${M[a]}`
            }
          ) }),
          /* @__PURE__ */ s("td", { className: "cedros-permissions-toggle-cell", children: /* @__PURE__ */ s(
            D,
            {
              checked: t.member[a] ?? !1,
              onChange: (l) => h("member", a, l),
              disabled: n,
              label: `Member access to ${M[a]}`
            }
          ) })
        ] }, a))
      ] })
    ] }) }) })
  ] }) : /* @__PURE__ */ s("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ s("div", { className: "cedros-dashboard__empty", children: "Only organization owners can configure dashboard permissions." }) });
}
export {
  ge as I,
  pe as M,
  be as P,
  ve as a,
  ye as b,
  ae as c,
  we as u
};
