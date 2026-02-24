import { jsxs as s, jsx as e, Fragment as B } from "react/jsx-runtime";
import { useState as N, useMemo as z, useCallback as v, useEffect as q } from "react";
import { A as we, h as D, u as ve } from "./useCedrosLogin-_94MmGGq.js";
import { u as Ce } from "./useSystemSettings-DBlAMjFi.js";
class Se {
  client;
  constructor(a, n, r, p) {
    this.client = new we({ baseUrl: a, timeoutMs: n, retryAttempts: r, getAccessToken: p });
  }
  /**
   * List all users in the system
   */
  async listUsers(a) {
    try {
      const n = new URLSearchParams();
      a?.limit && n.set("limit", String(a.limit)), a?.offset && n.set("offset", String(a.offset));
      const r = n.toString(), p = `/admin/users${r ? `?${r}` : ""}`;
      return await this.client.get(p);
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
      const p = r.toString(), g = `/admin/users/${a}/deposits${p ? `?${p}` : ""}`;
      return await this.client.get(g);
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
      const p = r.toString(), g = `/admin/users/${a}/credits${p ? `?${p}` : ""}`;
      return await this.client.get(g);
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
      const p = r.toString(), g = `/admin/users/${a}/withdrawal-history${p ? `?${p}` : ""}`;
      return await this.client.get(g);
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
      const p = r.toString(), g = `/admin/users/${a}/chats${p ? `?${p}` : ""}`;
      return await this.client.get(g);
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
function ee() {
  const { config: t, _internal: a } = ve(), [n, r] = N([]), [p, g] = N(0), [w, l] = N(!1), [u, h] = N(null), [$, P] = N({}), f = z(
    () => new Se(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      a?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, a]
  ), R = v(
    async (d) => {
      l(!0), h(null), P(d || {});
      try {
        const i = await f.listUsers(d);
        return r(i.users), g(i.total), i;
      } catch (i) {
        const o = i instanceof Error ? i : new Error("Failed to list users");
        throw h(o), o;
      } finally {
        l(!1);
      }
    },
    [f]
  ), C = v(
    async (d) => {
      l(!0), h(null);
      try {
        return await f.getUser(d);
      } catch (i) {
        const o = i instanceof Error ? i : new Error("Failed to get user");
        throw h(o), o;
      } finally {
        l(!1);
      }
    },
    [f]
  ), c = v(
    async (d, i) => {
      l(!0), h(null);
      try {
        await f.setSystemAdmin(d, i), r(
          (o) => o.map((b) => b.id === d ? { ...b, isSystemAdmin: i } : b)
        );
      } catch (o) {
        const b = o instanceof Error ? o : new Error("Failed to update admin status");
        throw h(b), b;
      } finally {
        l(!1);
      }
    },
    [f]
  ), S = v(
    async (d, i) => {
      l(!0), h(null);
      try {
        const o = await f.updateUser(d, i);
        return r((b) => b.map((x) => x.id === d ? o : x)), o;
      } catch (o) {
        const b = o instanceof Error ? o : new Error("Failed to update user");
        throw h(b), b;
      } finally {
        l(!1);
      }
    },
    [f]
  ), U = v(
    async (d) => {
      l(!0), h(null);
      try {
        await f.deleteUser(d), r((i) => i.filter((o) => o.id !== d)), g((i) => i - 1);
      } catch (i) {
        const o = i instanceof Error ? i : new Error("Failed to delete user");
        throw h(o), o;
      } finally {
        l(!1);
      }
    },
    [f]
  ), E = v(
    async (d) => {
      l(!0), h(null);
      try {
        await f.forcePasswordReset(d);
      } catch (i) {
        const o = i instanceof Error ? i : new Error("Failed to send password reset");
        throw h(o), o;
      } finally {
        l(!1);
      }
    },
    [f]
  ), k = v(
    async (d, i, o) => {
      l(!0), h(null);
      try {
        await f.adjustCredits(d, { amount: i, reason: o });
      } catch (b) {
        const x = b instanceof Error ? b : new Error("Failed to adjust credits");
        throw h(x), x;
      } finally {
        l(!1);
      }
    },
    [f]
  ), O = v(
    async (d, i) => {
      l(!0), h(null);
      try {
        return await f.getUserDeposits(d, i);
      } catch (o) {
        const b = o instanceof Error ? o : new Error("Failed to get user deposits");
        throw h(b), b;
      } finally {
        l(!1);
      }
    },
    [f]
  ), M = v(
    async (d, i) => {
      l(!0), h(null);
      try {
        return await f.getUserCredits(d, i);
      } catch (o) {
        const b = o instanceof Error ? o : new Error("Failed to get user credits");
        throw h(b), b;
      } finally {
        l(!1);
      }
    },
    [f]
  ), F = v(
    async (d, i) => {
      l(!0), h(null);
      try {
        return await f.getUserWithdrawalHistory(d, i);
      } catch (o) {
        const b = o instanceof Error ? o : new Error("Failed to get user withdrawal history");
        throw h(b), b;
      } finally {
        l(!1);
      }
    },
    [f]
  ), L = v(
    async (d, i) => {
      l(!0), h(null);
      try {
        return await f.getUserChats(d, i);
      } catch (o) {
        const b = o instanceof Error ? o : new Error("Failed to get user chat history");
        throw h(b), b;
      } finally {
        l(!1);
      }
    },
    [f]
  ), T = v(async () => {
    l(!0), h(null);
    try {
      return await f.getStats();
    } catch (d) {
      const i = d instanceof Error ? d : new Error("Failed to get user stats");
      throw h(i), i;
    } finally {
      l(!1);
    }
  }, [f]), _ = v(async () => {
    await R($);
  }, [R, $]), m = v(() => {
    h(null);
  }, []);
  return {
    users: n,
    total: p,
    isLoading: w,
    error: u,
    listUsers: R,
    getUser: C,
    setSystemAdmin: c,
    updateUser: S,
    deleteUser: U,
    forcePasswordReset: E,
    adjustCredits: k,
    getUserDeposits: O,
    getUserCredits: M,
    getUserWithdrawalHistory: F,
    getUserChats: L,
    getStats: T,
    refresh: _,
    clearError: m
  };
}
function re(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function Ue(t) {
  return t.length <= 12 ? t : `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function Ee(t) {
  return t == null ? "-" : (t / 1e9).toFixed(4);
}
function qe({
  pageSize: t = 20,
  refreshInterval: a = 0,
  currentUserId: n,
  className: r = "",
  onLoad: p,
  onUserClick: g
}) {
  const { users: w, total: l, isLoading: u, error: h, listUsers: $, clearError: P } = ee(), [f, R] = N(0), [C, c] = N(null), [S, U] = N("createdAt"), [E, k] = N("desc"), O = (m) => {
    S === m ? k(E === "asc" ? "desc" : "asc") : (U(m), k("desc"));
  }, M = z(() => [...w].sort((m, d) => {
    let i, o;
    switch (S) {
      case "name":
        i = (m.name || m.email || "").toLowerCase(), o = (d.name || d.email || "").toLowerCase();
        break;
      case "createdAt":
        i = new Date(m.createdAt).getTime(), o = new Date(d.createdAt).getTime();
        break;
      case "lastLoginAt":
        i = m.lastLoginAt ? new Date(m.lastLoginAt).getTime() : 0, o = d.lastLoginAt ? new Date(d.lastLoginAt).getTime() : 0;
        break;
      case "balanceLamports":
        i = m.balanceLamports ?? 0, o = d.balanceLamports ?? 0;
        break;
      default:
        return 0;
    }
    return i < o ? E === "asc" ? -1 : 1 : i > o ? E === "asc" ? 1 : -1 : 0;
  }), [w, S, E]), F = v(async () => {
    try {
      const m = await $({ limit: t, offset: f });
      p?.(m), c(null);
    } catch (m) {
      c(m instanceof Error ? m.message : "Failed to load users");
    }
  }, [t, f, $, p]);
  q(() => {
    R(0);
  }, [t]), q(() => {
    F();
  }, [F]), q(() => {
    if (a <= 0) return;
    const m = setInterval(F, a);
    return () => clearInterval(m);
  }, [a, F]);
  const L = Math.ceil(l / t), T = Math.floor(f / t) + 1, _ = (m) => {
    const d = (m - 1) * t;
    R(Math.max(0, Math.min(d, Math.max(0, l - 1))));
  };
  return C || h ? /* @__PURE__ */ s("div", { className: `cedros-admin-user-list cedros-admin-user-list-error ${r}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: C || h?.message }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          P(), c(null), F();
        },
        children: "Retry"
      }
    )
  ] }) : u && w.length === 0 ? /* @__PURE__ */ s("div", { className: `cedros-admin-user-list cedros-admin-user-list-loading ${r}`, children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading users..." })
  ] }) : /* @__PURE__ */ s("div", { className: `cedros-admin-user-list ${r}`, children: [
    /* @__PURE__ */ s("div", { className: "cedros-admin-user-list-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-user-list-title", children: "All Users" }),
      /* @__PURE__ */ s("div", { className: "cedros-admin-user-list-actions", children: [
        /* @__PURE__ */ s("span", { className: "cedros-admin-queue-count", children: [
          l,
          " user",
          l !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: F,
            disabled: u,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: u ? "..." : "↻"
          }
        )
      ] })
    ] }),
    w.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No users found." }) }) : /* @__PURE__ */ s(B, { children: [
      /* @__PURE__ */ s("div", { className: "cedros-admin-user-table", children: [
        /* @__PURE__ */ s("div", { className: "cedros-admin-user-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ s(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${S === "name" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => O("name"),
              "aria-label": "Sort by user",
              children: [
                "User",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: S === "name" ? E === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ s(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${S === "createdAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => O("createdAt"),
              "aria-label": "Sort by registered date",
              children: [
                "Registered",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: S === "createdAt" ? E === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ s(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${S === "lastLoginAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => O("lastLoginAt"),
              "aria-label": "Sort by last login",
              children: [
                "Last Login",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: S === "lastLoginAt" ? E === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ s(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${S === "balanceLamports" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => O("balanceLamports"),
              "aria-label": "Sort by balance",
              children: [
                "Balance",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: S === "balanceLamports" ? E === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) })
        ] }),
        M.map((m) => {
          const d = m.id === n;
          return /* @__PURE__ */ s(
            "div",
            {
              className: `cedros-admin-user-row ${d ? "cedros-admin-user-row-current" : ""}`,
              onClick: () => g?.(m),
              onKeyDown: (i) => {
                (i.key === "Enter" || i.key === " ") && (i.preventDefault(), g?.(m));
              },
              role: g ? "button" : void 0,
              tabIndex: g ? 0 : void 0,
              children: [
                /* @__PURE__ */ s("div", { className: "cedros-admin-user-td cedros-admin-user-info", children: [
                  /* @__PURE__ */ e("div", { className: "cedros-admin-user-avatar", children: m.picture ? /* @__PURE__ */ e(
                    "img",
                    {
                      src: m.picture,
                      alt: m.name || m.email || "User",
                      className: "cedros-admin-user-avatar-img",
                      referrerPolicy: "no-referrer"
                    }
                  ) : /* @__PURE__ */ e("span", { className: "cedros-admin-user-avatar-placeholder", children: (m.name?.[0] || m.email?.[0] || "?").toUpperCase() }) }),
                  /* @__PURE__ */ s("div", { className: "cedros-admin-user-details", children: [
                    /* @__PURE__ */ s("span", { className: "cedros-admin-user-name", children: [
                      m.name || "Unknown",
                      d && /* @__PURE__ */ e("span", { className: "cedros-admin-user-you", children: "(you)" })
                    ] }),
                    /* @__PURE__ */ e("span", { className: "cedros-admin-user-email", title: m.email, children: m.email || Ue(m.id) })
                  ] })
                ] }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td", children: re(m.createdAt) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td", children: m.lastLoginAt ? re(m.lastLoginAt) : "-" }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td", children: Ee(m.balanceLamports) })
              ]
            },
            m.id
          );
        })
      ] }),
      L > 1 && /* @__PURE__ */ s("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => _(T - 1),
            disabled: T <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ s("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          T,
          " of ",
          L,
          " (",
          l,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => _(T + 1),
            disabled: T >= L,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function ne(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function te(t) {
  return new Date(t).toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function Le(t) {
  return t == null ? "—" : `${(t / 1e9).toFixed(4)} SOL`;
}
function G(t) {
  return t == null ? "—" : (t / 1e9).toFixed(4);
}
function Ae(t) {
  return {
    DEPOSIT: "Deposit",
    SPEND: "Spend",
    ADJUSTMENT: "Adjustment",
    REFUND: "Refund"
  }[t.toUpperCase()] || t;
}
function De(t, a) {
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
  }[t.toUpperCase()] || "—";
}
function je({
  userId: t,
  onBack: a,
  currentUserId: n,
  onEditUser: r,
  onAdjustCredits: p,
  cedrosPayEnabled: g = !1,
  className: w = ""
}) {
  const {
    isLoading: l,
    getUser: u,
    getUserDeposits: h,
    getUserCredits: $,
    getUserChats: P,
    deleteUser: f,
    forcePasswordReset: R,
    clearError: C
  } = ee(), [c, S] = N(null), [U, E] = N(null), [k, O] = N(null), [M, F] = N(null), [L, T] = N("deposits"), [_, m] = N(null), [d, i] = N(null), [o, b] = N(null), [x, J] = N(null), [V, H] = N(!1), [I, ie] = N(0), [K, oe] = N(0), [Y, ce] = N(0), A = 10, Q = v(async () => {
    try {
      const y = await u(t);
      S(y), m(null);
    } catch (y) {
      m(y instanceof Error ? y.message : "Failed to load user");
    }
  }, [t, u]), X = v(async () => {
    try {
      const j = await h(t, { limit: A, offset: I });
      O(j), b(null);
    } catch (y) {
      b(y instanceof Error ? y.message : "Failed to load deposits");
    }
  }, [t, h, I]), W = v(async () => {
    try {
      const j = await $(t, { limit: A, offset: K });
      E(j), i(null);
    } catch (y) {
      i(y instanceof Error ? y.message : "Failed to load credits");
    }
  }, [t, $, K]), Z = v(async () => {
    if (g)
      try {
        const j = await P(t, { limit: A, offset: Y });
        F(j), J(null);
      } catch (y) {
        J(y instanceof Error ? y.message : "Failed to load chat history");
      }
  }, [t, P, Y, g]);
  q(() => {
    Q(), X(), W(), g && Z();
  }, [Q, X, W, Z, g]);
  const de = async () => {
    if (!c) return;
    if (c.id === n) {
      alert("You cannot delete your own account");
      return;
    }
    if (c.isSystemAdmin) {
      alert("Cannot delete a system admin. Remove admin status first.");
      return;
    }
    if (window.confirm(
      `Are you sure you want to delete ${c.name || c.email || "this user"}? This action cannot be undone.`
    )) {
      H(!0);
      try {
        await f(c.id), a();
      } catch {
      } finally {
        H(!1);
      }
    }
  }, le = async () => {
    if (!c?.email) {
      alert("User has no email address");
      return;
    }
    if (window.confirm(`Send a password reset email to ${c.email}?`)) {
      H(!0);
      try {
        await R(c.id), alert("Password reset email sent");
      } catch {
      } finally {
        H(!1);
      }
    }
  }, me = k ? Math.ceil(k.total / A) : 0, ue = Math.floor(I / A) + 1, he = U ? Math.ceil(U.totalTransactions / A) : 0, fe = Math.floor(K / A) + 1, pe = (y) => {
    ie((y - 1) * A);
  }, ge = (y) => {
    oe((y - 1) * A);
  }, be = M ? Math.ceil(M.total / A) : 0, ye = Math.floor(Y / A) + 1, Ne = (y) => {
    ce((y - 1) * A);
  };
  if (_)
    return /* @__PURE__ */ s("div", { className: `cedros-admin-user-detail cedros-admin-user-detail-error ${w}`, children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: a,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: _ }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline",
          onClick: () => {
            C(), m(null), Q();
          },
          children: "Retry"
        }
      )
    ] });
  if (l && !c)
    return /* @__PURE__ */ s("div", { className: `cedros-admin-user-detail cedros-admin-user-detail-loading ${w}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading user..." })
    ] });
  if (!c)
    return /* @__PURE__ */ s("div", { className: `cedros-admin-user-detail ${w}`, children: [
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
  const ae = c.id === n;
  return /* @__PURE__ */ s("div", { className: `cedros-admin-user-detail ${w}`, children: [
    /* @__PURE__ */ s("div", { className: "cedros-admin-user-detail-header", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-back-btn",
          onClick: a,
          children: "Back to Users"
        }
      ),
      /* @__PURE__ */ s("div", { className: "cedros-admin-user-detail-actions", children: [
        r && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => r(c),
            disabled: V,
            children: "Edit"
          }
        ),
        c.email && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: le,
            disabled: V,
            children: "Reset Password"
          }
        ),
        p && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => p(c),
            disabled: V,
            children: "Adjust Credits"
          }
        ),
        !ae && !c.isSystemAdmin && /* @__PURE__ */ e(
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
    /* @__PURE__ */ s("div", { className: "cedros-admin-user-detail-info", children: [
      /* @__PURE__ */ e("div", { className: "cedros-admin-user-detail-avatar", children: c.picture ? /* @__PURE__ */ e(
        "img",
        {
          src: c.picture,
          alt: c.name || c.email || "User",
          className: "cedros-admin-user-detail-avatar-img",
          referrerPolicy: "no-referrer"
        }
      ) : /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-avatar-placeholder", children: (c.name?.[0] || c.email?.[0] || "?").toUpperCase() }) }),
      /* @__PURE__ */ s("div", { className: "cedros-admin-user-detail-meta", children: [
        /* @__PURE__ */ s("h2", { className: "cedros-admin-user-detail-name", children: [
          c.name || "Unknown",
          ae && /* @__PURE__ */ e("span", { className: "cedros-admin-user-you", children: "(you)" })
        ] }),
        /* @__PURE__ */ s("p", { className: "cedros-admin-user-detail-email", children: [
          c.email || "No email",
          c.emailVerified && /* @__PURE__ */ e("span", { className: "cedros-admin-verified-badge", title: "Email verified", children: "Verified" })
        ] }),
        c.isSystemAdmin && /* @__PURE__ */ e("div", { className: "cedros-admin-user-detail-badges", children: /* @__PURE__ */ e("span", { className: "cedros-admin-admin-badge cedros-admin-admin-badge-yes", children: "System Admin" }) }),
        /* @__PURE__ */ s("div", { className: "cedros-admin-user-detail-methods", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-methods-label", children: "Auth Methods:" }),
          c.authMethods.length > 0 ? c.authMethods.map((y) => /* @__PURE__ */ e(
            "span",
            {
              className: `cedros-admin-auth-badge cedros-admin-auth-badge-${y}`,
              children: y
            },
            y
          )) : /* @__PURE__ */ e("span", { className: "cedros-admin-auth-badge cedros-admin-auth-badge-none", children: "none" })
        ] }),
        /* @__PURE__ */ s("p", { className: "cedros-admin-user-detail-dates", children: [
          "Registered: ",
          ne(c.createdAt),
          " | Updated: ",
          ne(c.updatedAt)
        ] })
      ] })
    ] }),
    d ? /* @__PURE__ */ s("div", { className: "cedros-admin-stats-error", children: [
      /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: d }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: () => {
            i(null), W();
          },
          children: "Retry"
        }
      )
    ] }) : U ? /* @__PURE__ */ s("div", { className: "cedros-admin-user-detail-stats", children: [
      /* @__PURE__ */ s("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Credit Balance" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: G(U.stats.currentBalanceLamports) })
      ] }),
      /* @__PURE__ */ s("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Total Credited" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: G(U.stats.totalDepositedLamports) })
      ] }),
      /* @__PURE__ */ s("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Total Spent" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: G(U.stats.totalSpentLamports) })
      ] }),
      /* @__PURE__ */ s("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Deposits" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: U.stats.depositCount })
      ] }),
      /* @__PURE__ */ s("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Transactions" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: U.stats.spendCount })
      ] })
    ] }) : /* @__PURE__ */ s("div", { className: "cedros-admin-stats-loading", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { children: "Loading credit stats..." })
    ] }),
    /* @__PURE__ */ s("div", { className: "cedros-admin-user-detail-tabs", children: [
      /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${L === "deposits" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => T("deposits"),
          children: [
            "Deposits (",
            k?.total ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${L === "transactions" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => T("transactions"),
          children: [
            "Credits (",
            U?.totalTransactions ?? 0,
            ")"
          ]
        }
      ),
      g && /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${L === "chats" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => T("chats"),
          children: [
            "Chats (",
            M?.total ?? 0,
            ")"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ s("div", { className: "cedros-admin-user-detail-content", children: [
      L === "deposits" && /* @__PURE__ */ e(
        Te,
        {
          deposits: k?.deposits ?? [],
          total: k?.total ?? 0,
          currentPage: ue,
          totalPages: me,
          onPageChange: pe,
          isLoading: l,
          error: o,
          onRetry: () => {
            b(null), X();
          }
        }
      ),
      L === "transactions" && /* @__PURE__ */ e(
        $e,
        {
          transactions: U?.transactions ?? [],
          total: U?.totalTransactions ?? 0,
          currentPage: fe,
          totalPages: he,
          onPageChange: ge,
          error: d,
          onRetry: () => {
            i(null), W();
          },
          isLoading: l
        }
      ),
      L === "chats" && g && /* @__PURE__ */ e(
        ke,
        {
          sessions: M?.sessions ?? [],
          total: M?.total ?? 0,
          currentPage: ye,
          totalPages: be,
          onPageChange: Ne,
          error: x,
          onRetry: () => {
            J(null), Z();
          },
          isLoading: l
        }
      )
    ] })
  ] });
}
function Te({
  deposits: t,
  total: a,
  currentPage: n,
  totalPages: r,
  onPageChange: p,
  isLoading: g,
  error: w,
  onRetry: l
}) {
  return w ? /* @__PURE__ */ s("div", { className: "cedros-admin-tab-error", children: [
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
  ] }) : g && t.length === 0 ? /* @__PURE__ */ s("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading deposits..." })
  ] }) : a === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No deposits found." }) : /* @__PURE__ */ s(B, { children: [
    /* @__PURE__ */ s("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ s("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Amount" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Status" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Transaction" })
      ] }),
      t.map((u) => /* @__PURE__ */ s("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: te(u.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: Le(u.amountLamports) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e("span", { className: `cedros-admin-status-badge cedros-admin-status-${u.status}`, children: u.status }) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td cedros-admin-list-td-actions", children: u.txSignature ? /* @__PURE__ */ s(B, { children: [
          /* @__PURE__ */ s("span", { className: "cedros-admin-list-td-mono", title: u.txSignature, children: [
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
      se,
      {
        currentPage: n,
        totalPages: r,
        total: a,
        onPageChange: p
      }
    )
  ] });
}
function $e({
  transactions: t,
  total: a,
  currentPage: n,
  totalPages: r,
  onPageChange: p,
  isLoading: g,
  error: w,
  onRetry: l
}) {
  return w ? /* @__PURE__ */ s("div", { className: "cedros-admin-tab-error", children: [
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
  ] }) : g && t.length === 0 ? /* @__PURE__ */ s("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading transactions..." })
  ] }) : a === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No credit transactions found." }) : /* @__PURE__ */ s(B, { children: [
    /* @__PURE__ */ s("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ s("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Type" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Description" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Amount" })
      ] }),
      t.map((u) => /* @__PURE__ */ s("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: te(u.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-tx-type cedros-admin-tx-type-${u.txType.toLowerCase()}`,
            children: Ae(u.txType)
          }
        ) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: De(u.txType, u.referenceType) }),
        /* @__PURE__ */ s(
          "div",
          {
            className: `cedros-admin-list-td ${u.amountLamports >= 0 ? "cedros-admin-amount-positive" : "cedros-admin-amount-negative"}`,
            children: [
              u.amountLamports >= 0 ? "+" : "",
              G(u.amountLamports)
            ]
          }
        )
      ] }, u.id))
    ] }),
    r > 1 && /* @__PURE__ */ e(
      se,
      {
        currentPage: n,
        totalPages: r,
        total: a,
        onPageChange: p
      }
    )
  ] });
}
function ke({
  sessions: t,
  total: a,
  currentPage: n,
  totalPages: r,
  onPageChange: p,
  isLoading: g,
  error: w,
  onRetry: l
}) {
  return w ? /* @__PURE__ */ s("div", { className: "cedros-admin-tab-error", children: [
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
  ] }) : g && t.length === 0 ? /* @__PURE__ */ s("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading chat history..." })
  ] }) : a === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No chat sessions found." }) : /* @__PURE__ */ s(B, { children: [
    /* @__PURE__ */ s("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ s("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Session" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Messages" })
      ] }),
      t.map((u) => /* @__PURE__ */ s("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: te(u.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: u.title || `Chat ${u.id.slice(0, 8)}...` }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: u.messageCount })
      ] }, u.id))
    ] }),
    r > 1 && /* @__PURE__ */ e(
      se,
      {
        currentPage: n,
        totalPages: r,
        total: a,
        onPageChange: p
      }
    )
  ] });
}
function se({ currentPage: t, totalPages: a, total: n, onPageChange: r }) {
  return /* @__PURE__ */ s("div", { className: "cedros-admin-pagination", children: [
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: () => r(t - 1),
        disabled: t <= 1,
        children: "Previous"
      }
    ),
    /* @__PURE__ */ s("span", { className: "cedros-admin-page-info", children: [
      "Page ",
      t,
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
        onClick: () => r(t + 1),
        disabled: t >= a,
        children: "Next"
      }
    )
  ] });
}
const Fe = ["email", "google", "apple", "solana", "webauthn", "sso"], Pe = {
  email: "Email Users",
  google: "Google Users",
  apple: "Apple Users",
  solana: "Solana Users",
  webauthn: "Passkey Users",
  sso: "SSO Provider Users"
}, Re = {
  email: "auth_email_enabled",
  google: "auth_google_enabled",
  apple: "auth_apple_enabled",
  solana: "auth_solana_enabled",
  webauthn: "auth_webauthn_enabled",
  sso: "feature_sso"
};
function Be() {
  const { getStats: t } = ee(), { fetchSettings: a, getValue: n } = Ce(), [r, p] = N(null), [g, w] = N(!1), [l, u] = N(null), [h, $] = N(!1);
  q(() => {
    h || (a(), $(!0));
  }, [a, h]);
  const P = v(
    (C) => {
      const c = n(C);
      return c === void 0 ? !1 : c === "true" || c === "1";
    },
    [n]
  ), f = v(async () => {
    w(!0), u(null);
    try {
      const C = await t();
      p(C);
    } catch (C) {
      u(C instanceof Error ? C.message : "Failed to load user stats");
    } finally {
      w(!1);
    }
  }, [t]);
  return q(() => {
    f();
  }, [f]), { statsItems: z(() => {
    const C = [{ label: "Total Users", value: r?.total ?? "—" }];
    return Fe.forEach((c) => {
      P(Re[c]) && C.push({
        label: Pe[c],
        value: r?.authMethodCounts[c] ?? 0
      });
    }), C;
  }, [r, P]), isLoading: g, error: l, refresh: f };
}
export {
  je as A,
  qe as a,
  ee as b,
  Be as u
};
