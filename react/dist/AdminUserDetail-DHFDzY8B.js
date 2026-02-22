import { jsxs as t, jsx as e, Fragment as B } from "react/jsx-runtime";
import { useState as N, useMemo as re, useCallback as v, useEffect as W } from "react";
import { A as we, h as D, u as ve } from "./apiClient-B2JxVPlH.js";
class Ce {
  client;
  constructor(a, n, r, g) {
    this.client = new we({ baseUrl: a, timeoutMs: n, retryAttempts: r, getAccessToken: g });
  }
  /**
   * List all users in the system
   */
  async listUsers(a) {
    try {
      const n = new URLSearchParams();
      a?.limit && n.set("limit", String(a.limit)), a?.offset && n.set("offset", String(a.offset));
      const r = n.toString(), g = `/admin/users${r ? `?${r}` : ""}`;
      return await this.client.get(g);
    } catch (n) {
      throw D(n, "Failed to list users");
    }
  }
  /**
   * Get a specific user by ID
   */
  async getUser(a) {
    try {
      return await this.client.get(`/admin/users/${a}`);
    } catch (n) {
      throw D(n, "Failed to get user");
    }
  }
  /**
   * Set a user's system admin status
   */
  async setSystemAdmin(a, n) {
    try {
      await this.client.patch(`/admin/users/${a}/system-admin`, { isAdmin: n });
    } catch (r) {
      throw D(r, "Failed to update system admin status");
    }
  }
  /**
   * Update a user's profile
   */
  async updateUser(a, n) {
    try {
      return await this.client.patch(`/admin/users/${a}`, n);
    } catch (r) {
      throw D(r, "Failed to update user");
    }
  }
  /**
   * Delete a user
   */
  async deleteUser(a) {
    try {
      await this.client.delete(`/admin/users/${a}`);
    } catch (n) {
      throw D(n, "Failed to delete user");
    }
  }
  /**
   * Send a password reset email to a user
   */
  async forcePasswordReset(a) {
    try {
      await this.client.post(`/admin/users/${a}/force-password-reset`, {});
    } catch (n) {
      throw D(n, "Failed to send password reset email");
    }
  }
  /**
   * Adjust a user's credits
   */
  async adjustCredits(a, n) {
    try {
      await this.client.post(`/admin/users/${a}/credits`, n);
    } catch (r) {
      throw D(r, "Failed to adjust credits");
    }
  }
  /**
   * Get a user's deposit history
   */
  async getUserDeposits(a, n) {
    try {
      const r = new URLSearchParams();
      n?.limit && r.set("limit", String(n.limit)), n?.offset && r.set("offset", String(n.offset));
      const g = r.toString(), b = `/admin/users/${a}/deposits${g ? `?${g}` : ""}`;
      return await this.client.get(b);
    } catch (r) {
      throw D(r, "Failed to get user deposits");
    }
  }
  /**
   * Get a user's credit stats and transaction history
   */
  async getUserCredits(a, n) {
    try {
      const r = new URLSearchParams();
      n?.limit && r.set("limit", String(n.limit)), n?.offset && r.set("offset", String(n.offset));
      const g = r.toString(), b = `/admin/users/${a}/credits${g ? `?${g}` : ""}`;
      return await this.client.get(b);
    } catch (r) {
      throw D(r, "Failed to get user credits");
    }
  }
  /**
   * Get a user's withdrawal history
   */
  async getUserWithdrawalHistory(a, n) {
    try {
      const r = new URLSearchParams();
      n?.limit && r.set("limit", String(n.limit)), n?.offset && r.set("offset", String(n.offset));
      const g = r.toString(), b = `/admin/users/${a}/withdrawal-history${g ? `?${g}` : ""}`;
      return await this.client.get(b);
    } catch (r) {
      throw D(r, "Failed to get user withdrawal history");
    }
  }
  /**
   * Get a user's chat history (from cedros-pay)
   * Only available when cedros-pay is enabled.
   */
  async getUserChats(a, n) {
    try {
      const r = new URLSearchParams();
      n?.limit && r.set("limit", String(n.limit)), n?.offset && r.set("offset", String(n.offset));
      const g = r.toString(), b = `/admin/users/${a}/chats${g ? `?${g}` : ""}`;
      return await this.client.get(b);
    } catch (r) {
      throw D(r, "Failed to get user chat history");
    }
  }
  /**
   * Get user statistics by auth method
   */
  async getStats() {
    try {
      return await this.client.get("/admin/users/stats");
    } catch (a) {
      throw D(a, "Failed to get user stats");
    }
  }
}
function ne() {
  const { config: s, _internal: a } = ve(), [n, r] = N([]), [g, b] = N(0), [w, l] = N(!1), [u, h] = N(null), [F, O] = N({}), f = re(
    () => new Ce(
      s.serverUrl,
      s.requestTimeout,
      s.retryAttempts,
      a?.getAccessToken
    ),
    [s.serverUrl, s.requestTimeout, s.retryAttempts, a]
  ), P = v(
    async (c) => {
      l(!0), h(null), O(c || {});
      try {
        const i = await f.listUsers(c);
        return r(i.users), b(i.total), i;
      } catch (i) {
        const o = i instanceof Error ? i : new Error("Failed to list users");
        throw h(o), o;
      } finally {
        l(!1);
      }
    },
    [f]
  ), q = v(
    async (c) => {
      l(!0), h(null);
      try {
        return await f.getUser(c);
      } catch (i) {
        const o = i instanceof Error ? i : new Error("Failed to get user");
        throw h(o), o;
      } finally {
        l(!1);
      }
    },
    [f]
  ), m = v(
    async (c, i) => {
      l(!0), h(null);
      try {
        await f.setSystemAdmin(c, i), r(
          (o) => o.map((p) => p.id === c ? { ...p, isSystemAdmin: i } : p)
        );
      } catch (o) {
        const p = o instanceof Error ? o : new Error("Failed to update admin status");
        throw h(p), p;
      } finally {
        l(!1);
      }
    },
    [f]
  ), C = v(
    async (c, i) => {
      l(!0), h(null);
      try {
        const o = await f.updateUser(c, i);
        return r((p) => p.map((x) => x.id === c ? o : x)), o;
      } catch (o) {
        const p = o instanceof Error ? o : new Error("Failed to update user");
        throw h(p), p;
      } finally {
        l(!1);
      }
    },
    [f]
  ), S = v(
    async (c) => {
      l(!0), h(null);
      try {
        await f.deleteUser(c), r((i) => i.filter((o) => o.id !== c)), b((i) => i - 1);
      } catch (i) {
        const o = i instanceof Error ? i : new Error("Failed to delete user");
        throw h(o), o;
      } finally {
        l(!1);
      }
    },
    [f]
  ), U = v(
    async (c) => {
      l(!0), h(null);
      try {
        await f.forcePasswordReset(c);
      } catch (i) {
        const o = i instanceof Error ? i : new Error("Failed to send password reset");
        throw h(o), o;
      } finally {
        l(!1);
      }
    },
    [f]
  ), $ = v(
    async (c, i, o) => {
      l(!0), h(null);
      try {
        await f.adjustCredits(c, { amount: i, reason: o });
      } catch (p) {
        const x = p instanceof Error ? p : new Error("Failed to adjust credits");
        throw h(x), x;
      } finally {
        l(!1);
      }
    },
    [f]
  ), R = v(
    async (c, i) => {
      l(!0), h(null);
      try {
        return await f.getUserDeposits(c, i);
      } catch (o) {
        const p = o instanceof Error ? o : new Error("Failed to get user deposits");
        throw h(p), p;
      } finally {
        l(!1);
      }
    },
    [f]
  ), k = v(
    async (c, i) => {
      l(!0), h(null);
      try {
        return await f.getUserCredits(c, i);
      } catch (o) {
        const p = o instanceof Error ? o : new Error("Failed to get user credits");
        throw h(p), p;
      } finally {
        l(!1);
      }
    },
    [f]
  ), T = v(
    async (c, i) => {
      l(!0), h(null);
      try {
        return await f.getUserWithdrawalHistory(c, i);
      } catch (o) {
        const p = o instanceof Error ? o : new Error("Failed to get user withdrawal history");
        throw h(p), p;
      } finally {
        l(!1);
      }
    },
    [f]
  ), A = v(
    async (c, i) => {
      l(!0), h(null);
      try {
        return await f.getUserChats(c, i);
      } catch (o) {
        const p = o instanceof Error ? o : new Error("Failed to get user chat history");
        throw h(p), p;
      } finally {
        l(!1);
      }
    },
    [f]
  ), E = v(async () => {
    l(!0), h(null);
    try {
      return await f.getStats();
    } catch (c) {
      const i = c instanceof Error ? c : new Error("Failed to get user stats");
      throw h(i), i;
    } finally {
      l(!1);
    }
  }, [f]), M = v(async () => {
    await P(F);
  }, [P, F]), d = v(() => {
    h(null);
  }, []);
  return {
    users: n,
    total: g,
    isLoading: w,
    error: u,
    listUsers: P,
    getUser: q,
    setSystemAdmin: m,
    updateUser: C,
    deleteUser: S,
    forcePasswordReset: U,
    adjustCredits: $,
    getUserDeposits: R,
    getUserCredits: k,
    getUserWithdrawalHistory: T,
    getUserChats: A,
    getStats: E,
    refresh: M,
    clearError: d
  };
}
function se(s) {
  return new Date(s).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function Se(s) {
  return s.length <= 12 ? s : `${s.slice(0, 6)}...${s.slice(-4)}`;
}
function Ue(s) {
  return s == null ? "-" : (s / 1e9).toFixed(4);
}
function Re({
  pageSize: s = 20,
  refreshInterval: a = 0,
  currentUserId: n,
  className: r = "",
  onLoad: g,
  onUserClick: b
}) {
  const { users: w, total: l, isLoading: u, error: h, listUsers: F, clearError: O } = ne(), [f, P] = N(0), [q, m] = N(null), [C, S] = N("createdAt"), [U, $] = N("desc"), R = (d) => {
    C === d ? $(U === "asc" ? "desc" : "asc") : (S(d), $("desc"));
  }, k = re(() => [...w].sort((d, c) => {
    let i, o;
    switch (C) {
      case "name":
        i = (d.name || d.email || "").toLowerCase(), o = (c.name || c.email || "").toLowerCase();
        break;
      case "createdAt":
        i = new Date(d.createdAt).getTime(), o = new Date(c.createdAt).getTime();
        break;
      case "lastLoginAt":
        i = d.lastLoginAt ? new Date(d.lastLoginAt).getTime() : 0, o = c.lastLoginAt ? new Date(c.lastLoginAt).getTime() : 0;
        break;
      case "balanceLamports":
        i = d.balanceLamports ?? 0, o = c.balanceLamports ?? 0;
        break;
      default:
        return 0;
    }
    return i < o ? U === "asc" ? -1 : 1 : i > o ? U === "asc" ? 1 : -1 : 0;
  }), [w, C, U]), T = v(async () => {
    try {
      const d = await F({ limit: s, offset: f });
      g?.(d), m(null);
    } catch (d) {
      m(d instanceof Error ? d.message : "Failed to load users");
    }
  }, [s, f, F, g]);
  W(() => {
    P(0);
  }, [s]), W(() => {
    T();
  }, [T]), W(() => {
    if (a <= 0) return;
    const d = setInterval(T, a);
    return () => clearInterval(d);
  }, [a, T]);
  const A = Math.ceil(l / s), E = Math.floor(f / s) + 1, M = (d) => {
    const c = (d - 1) * s;
    P(Math.max(0, Math.min(c, Math.max(0, l - 1))));
  };
  return q || h ? /* @__PURE__ */ t("div", { className: `cedros-admin-user-list cedros-admin-user-list-error ${r}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: q || h?.message }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          O(), m(null), T();
        },
        children: "Retry"
      }
    )
  ] }) : u && w.length === 0 ? /* @__PURE__ */ t("div", { className: `cedros-admin-user-list cedros-admin-user-list-loading ${r}`, children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading users..." })
  ] }) : /* @__PURE__ */ t("div", { className: `cedros-admin-user-list ${r}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-admin-user-list-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-user-list-title", children: "All Users" }),
      /* @__PURE__ */ t("div", { className: "cedros-admin-user-list-actions", children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-queue-count", children: [
          l,
          " user",
          l !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: T,
            disabled: u,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: u ? "..." : "↻"
          }
        )
      ] })
    ] }),
    w.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No users found." }) }) : /* @__PURE__ */ t(B, { children: [
      /* @__PURE__ */ t("div", { className: "cedros-admin-user-table", children: [
        /* @__PURE__ */ t("div", { className: "cedros-admin-user-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${C === "name" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => R("name"),
              "aria-label": "Sort by user",
              children: [
                "User",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: C === "name" ? U === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${C === "createdAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => R("createdAt"),
              "aria-label": "Sort by registered date",
              children: [
                "Registered",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: C === "createdAt" ? U === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${C === "lastLoginAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => R("lastLoginAt"),
              "aria-label": "Sort by last login",
              children: [
                "Last Login",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: C === "lastLoginAt" ? U === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${C === "balanceLamports" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => R("balanceLamports"),
              "aria-label": "Sort by balance",
              children: [
                "Balance",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: C === "balanceLamports" ? U === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) })
        ] }),
        k.map((d) => {
          const c = d.id === n;
          return /* @__PURE__ */ t(
            "div",
            {
              className: `cedros-admin-user-row ${c ? "cedros-admin-user-row-current" : ""}`,
              onClick: () => b?.(d),
              onKeyDown: (i) => {
                (i.key === "Enter" || i.key === " ") && (i.preventDefault(), b?.(d));
              },
              role: b ? "button" : void 0,
              tabIndex: b ? 0 : void 0,
              children: [
                /* @__PURE__ */ t("div", { className: "cedros-admin-user-td cedros-admin-user-info", children: [
                  /* @__PURE__ */ e("div", { className: "cedros-admin-user-avatar", children: d.picture ? /* @__PURE__ */ e(
                    "img",
                    {
                      src: d.picture,
                      alt: d.name || d.email || "User",
                      className: "cedros-admin-user-avatar-img",
                      referrerPolicy: "no-referrer"
                    }
                  ) : /* @__PURE__ */ e("span", { className: "cedros-admin-user-avatar-placeholder", children: (d.name?.[0] || d.email?.[0] || "?").toUpperCase() }) }),
                  /* @__PURE__ */ t("div", { className: "cedros-admin-user-details", children: [
                    /* @__PURE__ */ t("span", { className: "cedros-admin-user-name", children: [
                      d.name || "Unknown",
                      c && /* @__PURE__ */ e("span", { className: "cedros-admin-user-you", children: "(you)" })
                    ] }),
                    /* @__PURE__ */ e("span", { className: "cedros-admin-user-email", title: d.email, children: d.email || Se(d.id) })
                  ] })
                ] }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td", children: se(d.createdAt) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td", children: d.lastLoginAt ? se(d.lastLoginAt) : "-" }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td", children: Ue(d.balanceLamports) })
              ]
            },
            d.id
          );
        })
      ] }),
      A > 1 && /* @__PURE__ */ t("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => M(E - 1),
            disabled: E <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ t("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          E,
          " of ",
          A,
          " (",
          l,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => M(E + 1),
            disabled: E >= A,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function ae(s) {
  return new Date(s).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function z(s) {
  return new Date(s).toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function Ae(s) {
  return s == null ? "—" : `${(s / 1e9).toFixed(4)} SOL`;
}
function J(s) {
  return s == null ? "—" : (s / 1e9).toFixed(4);
}
function Le(s) {
  return {
    DEPOSIT: "Deposit",
    SPEND: "Spend",
    ADJUSTMENT: "Adjustment",
    REFUND: "Refund"
  }[s.toUpperCase()] || s;
}
function De(s, a) {
  return a ? {
    deposit: "Credit deposit",
    purchase: "Purchase",
    api_call: "API usage",
    subscription: "Subscription",
    refund: "Refund",
    bonus: "Bonus credit",
    promo: "Promotional credit",
    correction: "Balance correction"
  }[a.toLowerCase()] || a : {
    DEPOSIT: "Credit added",
    SPEND: "Credit used",
    ADJUSTMENT: "Manual adjustment",
    REFUND: "Credit refunded"
  }[s.toUpperCase()] || "—";
}
function Me({
  userId: s,
  onBack: a,
  currentUserId: n,
  onEditUser: r,
  onAdjustCredits: g,
  cedrosPayEnabled: b = !1,
  className: w = ""
}) {
  const {
    isLoading: l,
    getUser: u,
    getUserDeposits: h,
    getUserCredits: F,
    getUserChats: O,
    deleteUser: f,
    forcePasswordReset: P,
    clearError: q
  } = ne(), [m, C] = N(null), [S, U] = N(null), [$, R] = N(null), [k, T] = N(null), [A, E] = N("deposits"), [M, d] = N(null), [c, i] = N(null), [o, p] = N(null), [x, K] = N(null), [V, _] = N(!1), [Y, ie] = N(0), [G, oe] = N(0), [Q, ce] = N(0), L = 10, X = v(async () => {
    try {
      const y = await u(s);
      C(y), d(null);
    } catch (y) {
      d(y instanceof Error ? y.message : "Failed to load user");
    }
  }, [s, u]), Z = v(async () => {
    try {
      const j = await h(s, { limit: L, offset: Y });
      R(j), p(null);
    } catch (y) {
      p(y instanceof Error ? y.message : "Failed to load deposits");
    }
  }, [s, h, Y]), H = v(async () => {
    try {
      const j = await F(s, { limit: L, offset: G });
      U(j), i(null);
    } catch (y) {
      i(y instanceof Error ? y.message : "Failed to load credits");
    }
  }, [s, F, G]), I = v(async () => {
    if (b)
      try {
        const j = await O(s, { limit: L, offset: Q });
        T(j), K(null);
      } catch (y) {
        K(y instanceof Error ? y.message : "Failed to load chat history");
      }
  }, [s, O, Q, b]);
  W(() => {
    X(), Z(), H(), b && I();
  }, [X, Z, H, I, b]);
  const de = async () => {
    if (!m) return;
    if (m.id === n) {
      alert("You cannot delete your own account");
      return;
    }
    if (m.isSystemAdmin) {
      alert("Cannot delete a system admin. Remove admin status first.");
      return;
    }
    if (window.confirm(
      `Are you sure you want to delete ${m.name || m.email || "this user"}? This action cannot be undone.`
    )) {
      _(!0);
      try {
        await f(m.id), a();
      } catch {
      } finally {
        _(!1);
      }
    }
  }, le = async () => {
    if (!m?.email) {
      alert("User has no email address");
      return;
    }
    if (window.confirm(`Send a password reset email to ${m.email}?`)) {
      _(!0);
      try {
        await P(m.id), alert("Password reset email sent");
      } catch {
      } finally {
        _(!1);
      }
    }
  }, me = $ ? Math.ceil($.total / L) : 0, ue = Math.floor(Y / L) + 1, he = S ? Math.ceil(S.totalTransactions / L) : 0, fe = Math.floor(G / L) + 1, pe = (y) => {
    ie((y - 1) * L);
  }, ge = (y) => {
    oe((y - 1) * L);
  }, be = k ? Math.ceil(k.total / L) : 0, ye = Math.floor(Q / L) + 1, Ne = (y) => {
    ce((y - 1) * L);
  };
  if (M)
    return /* @__PURE__ */ t("div", { className: `cedros-admin-user-detail cedros-admin-user-detail-error ${w}`, children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: a,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: M }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline",
          onClick: () => {
            q(), d(null), X();
          },
          children: "Retry"
        }
      )
    ] });
  if (l && !m)
    return /* @__PURE__ */ t("div", { className: `cedros-admin-user-detail cedros-admin-user-detail-loading ${w}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading user..." })
    ] });
  if (!m)
    return /* @__PURE__ */ t("div", { className: `cedros-admin-user-detail ${w}`, children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: a,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "User not found." })
    ] });
  const te = m.id === n;
  return /* @__PURE__ */ t("div", { className: `cedros-admin-user-detail ${w}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-header", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-back-btn",
          onClick: a,
          children: "Back to Users"
        }
      ),
      /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-actions", children: [
        r && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => r(m),
            disabled: V,
            children: "Edit"
          }
        ),
        m.email && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: le,
            disabled: V,
            children: "Reset Password"
          }
        ),
        g && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => g(m),
            disabled: V,
            children: "Adjust Credits"
          }
        ),
        !te && !m.isSystemAdmin && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-btn-danger",
            onClick: de,
            disabled: V,
            children: "Delete"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-info", children: [
      /* @__PURE__ */ e("div", { className: "cedros-admin-user-detail-avatar", children: m.picture ? /* @__PURE__ */ e(
        "img",
        {
          src: m.picture,
          alt: m.name || m.email || "User",
          className: "cedros-admin-user-detail-avatar-img",
          referrerPolicy: "no-referrer"
        }
      ) : /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-avatar-placeholder", children: (m.name?.[0] || m.email?.[0] || "?").toUpperCase() }) }),
      /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-meta", children: [
        /* @__PURE__ */ t("h2", { className: "cedros-admin-user-detail-name", children: [
          m.name || "Unknown",
          te && /* @__PURE__ */ e("span", { className: "cedros-admin-user-you", children: "(you)" })
        ] }),
        /* @__PURE__ */ t("p", { className: "cedros-admin-user-detail-email", children: [
          m.email || "No email",
          m.emailVerified && /* @__PURE__ */ e("span", { className: "cedros-admin-verified-badge", title: "Email verified", children: "Verified" })
        ] }),
        m.isSystemAdmin && /* @__PURE__ */ e("div", { className: "cedros-admin-user-detail-badges", children: /* @__PURE__ */ e("span", { className: "cedros-admin-admin-badge cedros-admin-admin-badge-yes", children: "System Admin" }) }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-methods", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-methods-label", children: "Auth Methods:" }),
          m.authMethods.length > 0 ? m.authMethods.map((y) => /* @__PURE__ */ e(
            "span",
            {
              className: `cedros-admin-auth-badge cedros-admin-auth-badge-${y}`,
              children: y
            },
            y
          )) : /* @__PURE__ */ e("span", { className: "cedros-admin-auth-badge cedros-admin-auth-badge-none", children: "none" })
        ] }),
        /* @__PURE__ */ t("p", { className: "cedros-admin-user-detail-dates", children: [
          "Registered: ",
          ae(m.createdAt),
          " | Updated: ",
          ae(m.updatedAt)
        ] })
      ] })
    ] }),
    c ? /* @__PURE__ */ t("div", { className: "cedros-admin-stats-error", children: [
      /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: c }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: () => {
            i(null), H();
          },
          children: "Retry"
        }
      )
    ] }) : S ? /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-stats", children: [
      /* @__PURE__ */ t("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Credit Balance" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: J(S.stats.currentBalanceLamports) })
      ] }),
      /* @__PURE__ */ t("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Total Credited" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: J(S.stats.totalDepositedLamports) })
      ] }),
      /* @__PURE__ */ t("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Total Spent" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: J(S.stats.totalSpentLamports) })
      ] }),
      /* @__PURE__ */ t("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Deposits" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: S.stats.depositCount })
      ] }),
      /* @__PURE__ */ t("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Transactions" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: S.stats.spendCount })
      ] })
    ] }) : /* @__PURE__ */ t("div", { className: "cedros-admin-stats-loading", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { children: "Loading credit stats..." })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-tabs", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${A === "deposits" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => E("deposits"),
          children: [
            "Deposits (",
            $?.total ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${A === "transactions" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => E("transactions"),
          children: [
            "Credits (",
            S?.totalTransactions ?? 0,
            ")"
          ]
        }
      ),
      b && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${A === "chats" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => E("chats"),
          children: [
            "Chats (",
            k?.total ?? 0,
            ")"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-content", children: [
      A === "deposits" && /* @__PURE__ */ e(
        Ee,
        {
          deposits: $?.deposits ?? [],
          total: $?.total ?? 0,
          currentPage: ue,
          totalPages: me,
          onPageChange: pe,
          isLoading: l,
          error: o,
          onRetry: () => {
            p(null), Z();
          }
        }
      ),
      A === "transactions" && /* @__PURE__ */ e(
        $e,
        {
          transactions: S?.transactions ?? [],
          total: S?.totalTransactions ?? 0,
          currentPage: fe,
          totalPages: he,
          onPageChange: ge,
          error: c,
          onRetry: () => {
            i(null), H();
          },
          isLoading: l
        }
      ),
      A === "chats" && b && /* @__PURE__ */ e(
        Te,
        {
          sessions: k?.sessions ?? [],
          total: k?.total ?? 0,
          currentPage: ye,
          totalPages: be,
          onPageChange: Ne,
          error: x,
          onRetry: () => {
            K(null), I();
          },
          isLoading: l
        }
      )
    ] })
  ] });
}
function Ee({
  deposits: s,
  total: a,
  currentPage: n,
  totalPages: r,
  onPageChange: g,
  isLoading: b,
  error: w,
  onRetry: l
}) {
  return w ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: w }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: l,
        children: "Retry"
      }
    )
  ] }) : b && s.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading deposits..." })
  ] }) : a === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No deposits found." }) : /* @__PURE__ */ t(B, { children: [
    /* @__PURE__ */ t("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ t("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Amount" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Status" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Transaction" })
      ] }),
      s.map((u) => /* @__PURE__ */ t("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: z(u.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: Ae(u.amountLamports) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e("span", { className: `cedros-admin-status-badge cedros-admin-status-${u.status}`, children: u.status }) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td cedros-admin-list-td-actions", children: u.txSignature ? /* @__PURE__ */ t(B, { children: [
          /* @__PURE__ */ t("span", { className: "cedros-admin-list-td-mono", title: u.txSignature, children: [
            u.txSignature.slice(0, 8),
            "..."
          ] }),
          /* @__PURE__ */ e(
            "a",
            {
              href: `https://orbmarkets.io/tx/${u.txSignature}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "cedros-admin-icon-link",
              title: "View on Orbmarkets",
              "aria-label": "View transaction on Orbmarkets",
              children: "↗"
            }
          )
        ] }) : /* @__PURE__ */ e("span", { className: "cedros-admin-list-td-muted", children: "—" }) })
      ] }, u.id))
    ] }),
    r > 1 && /* @__PURE__ */ e(
      ee,
      {
        currentPage: n,
        totalPages: r,
        total: a,
        onPageChange: g
      }
    )
  ] });
}
function $e({
  transactions: s,
  total: a,
  currentPage: n,
  totalPages: r,
  onPageChange: g,
  isLoading: b,
  error: w,
  onRetry: l
}) {
  return w ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: w }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: l,
        children: "Retry"
      }
    )
  ] }) : b && s.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading transactions..." })
  ] }) : a === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No credit transactions found." }) : /* @__PURE__ */ t(B, { children: [
    /* @__PURE__ */ t("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ t("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Type" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Description" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Amount" })
      ] }),
      s.map((u) => /* @__PURE__ */ t("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: z(u.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-tx-type cedros-admin-tx-type-${u.txType.toLowerCase()}`,
            children: Le(u.txType)
          }
        ) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: De(u.txType, u.referenceType) }),
        /* @__PURE__ */ t(
          "div",
          {
            className: `cedros-admin-list-td ${u.amountLamports >= 0 ? "cedros-admin-amount-positive" : "cedros-admin-amount-negative"}`,
            children: [
              u.amountLamports >= 0 ? "+" : "",
              J(u.amountLamports)
            ]
          }
        )
      ] }, u.id))
    ] }),
    r > 1 && /* @__PURE__ */ e(
      ee,
      {
        currentPage: n,
        totalPages: r,
        total: a,
        onPageChange: g
      }
    )
  ] });
}
function Te({
  sessions: s,
  total: a,
  currentPage: n,
  totalPages: r,
  onPageChange: g,
  isLoading: b,
  error: w,
  onRetry: l
}) {
  return w ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: w }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: l,
        children: "Retry"
      }
    )
  ] }) : b && s.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading chat history..." })
  ] }) : a === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No chat sessions found." }) : /* @__PURE__ */ t(B, { children: [
    /* @__PURE__ */ t("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ t("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Session" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Messages" })
      ] }),
      s.map((u) => /* @__PURE__ */ t("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: z(u.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: u.title || `Chat ${u.id.slice(0, 8)}...` }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: u.messageCount })
      ] }, u.id))
    ] }),
    r > 1 && /* @__PURE__ */ e(
      ee,
      {
        currentPage: n,
        totalPages: r,
        total: a,
        onPageChange: g
      }
    )
  ] });
}
function ee({ currentPage: s, totalPages: a, total: n, onPageChange: r }) {
  return /* @__PURE__ */ t("div", { className: "cedros-admin-pagination", children: [
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: () => r(s - 1),
        disabled: s <= 1,
        children: "Previous"
      }
    ),
    /* @__PURE__ */ t("span", { className: "cedros-admin-page-info", children: [
      "Page ",
      s,
      " of ",
      a,
      " (",
      n,
      " total)"
    ] }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: () => r(s + 1),
        disabled: s >= a,
        children: "Next"
      }
    )
  ] });
}
export {
  Me as A,
  Re as a,
  ne as u
};
