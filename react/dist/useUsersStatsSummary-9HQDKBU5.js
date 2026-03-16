import { jsxs as t, jsx as e, Fragment as Y } from "react/jsx-runtime";
import { useState as v, useMemo as te, useCallback as C, useEffect as I } from "react";
import { A as Ze, h as $, u as Ce } from "./useCedrosLogin-CFfID-0i.js";
import { u as ze } from "./useSystemSettings-rgskaDqP.js";
class Ae {
  client;
  constructor(r, i, a, f) {
    this.client = new Ze({ baseUrl: r, timeoutMs: i, retryAttempts: a, getAccessToken: f });
  }
  /**
   * List all users in the system
   */
  async listUsers(r) {
    try {
      const i = new URLSearchParams();
      r?.limit && i.set("limit", String(r.limit)), r?.offset && i.set("offset", String(r.offset));
      const a = i.toString(), f = `/admin/users${a ? `?${a}` : ""}`;
      return await this.client.get(f);
    } catch (i) {
      throw $(i, "Failed to list users");
    }
  }
  /**
   * Get a specific user by ID
   */
  async getUser(r) {
    try {
      return await this.client.get(`/admin/users/${r}`);
    } catch (i) {
      throw $(i, "Failed to get user");
    }
  }
  /**
   * Set a user's system admin status
   */
  async setSystemAdmin(r, i) {
    try {
      await this.client.patch(`/admin/users/${r}/system-admin`, { isAdmin: i });
    } catch (a) {
      throw $(a, "Failed to update system admin status");
    }
  }
  /**
   * Update a user's profile
   */
  async updateUser(r, i) {
    try {
      return await this.client.patch(`/admin/users/${r}`, i);
    } catch (a) {
      throw $(a, "Failed to update user");
    }
  }
  /**
   * Delete a user
   */
  async deleteUser(r) {
    try {
      await this.client.delete(`/admin/users/${r}`);
    } catch (i) {
      throw $(i, "Failed to delete user");
    }
  }
  /**
   * Send a password reset email to a user
   */
  async forcePasswordReset(r) {
    try {
      await this.client.post(`/admin/users/${r}/force-password-reset`, {});
    } catch (i) {
      throw $(i, "Failed to send password reset email");
    }
  }
  /**
   * Adjust a user's credits
   */
  async adjustCredits(r, i) {
    try {
      await this.client.post(`/admin/users/${r}/credits`, i);
    } catch (a) {
      throw $(a, "Failed to adjust credits");
    }
  }
  /**
   * Get a user's deposit history
   */
  async getUserDeposits(r, i) {
    try {
      const a = new URLSearchParams();
      i?.limit && a.set("limit", String(i.limit)), i?.offset && a.set("offset", String(i.offset));
      const f = a.toString(), y = `/admin/users/${r}/deposits${f ? `?${f}` : ""}`;
      return await this.client.get(y);
    } catch (a) {
      throw $(a, "Failed to get user deposits");
    }
  }
  /**
   * Get a user's credit stats and transaction history
   */
  async getUserCredits(r, i) {
    try {
      const a = new URLSearchParams();
      i?.limit && a.set("limit", String(i.limit)), i?.offset && a.set("offset", String(i.offset));
      const f = a.toString(), y = `/admin/users/${r}/credits${f ? `?${f}` : ""}`;
      return await this.client.get(y);
    } catch (a) {
      throw $(a, "Failed to get user credits");
    }
  }
  /**
   * Get a user's withdrawal history
   */
  async getUserWithdrawalHistory(r, i) {
    try {
      const a = new URLSearchParams();
      i?.limit && a.set("limit", String(i.limit)), i?.offset && a.set("offset", String(i.offset));
      const f = a.toString(), y = `/admin/users/${r}/withdrawal-history${f ? `?${f}` : ""}`;
      return await this.client.get(y);
    } catch (a) {
      throw $(a, "Failed to get user withdrawal history");
    }
  }
  /**
   * Get a user's chat history (from cedros-pay)
   * Only available when cedros-pay is enabled.
   */
  async getUserChats(r, i) {
    try {
      const a = new URLSearchParams();
      i?.limit && a.set("limit", String(i.limit)), i?.offset && a.set("offset", String(i.offset));
      const f = a.toString(), y = `/admin/users/${r}/chats${f ? `?${f}` : ""}`;
      return await this.client.get(y);
    } catch (a) {
      throw $(a, "Failed to get user chat history");
    }
  }
  /**
   * Get the list of users directly referred by a given user
   */
  async getUserReferrals(r, i) {
    try {
      const a = new URLSearchParams();
      i?.limit && a.set("limit", String(i.limit)), i?.offset && a.set("offset", String(i.offset));
      const f = a.toString(), y = `/admin/users/${r}/referrals${f ? `?${f}` : ""}`;
      return await this.client.get(y);
    } catch (a) {
      throw $(a, "Failed to get user referrals");
    }
  }
  /**
   * Get a user's KYC status and session history
   */
  async getUserKyc(r) {
    try {
      return await this.client.get(`/admin/users/${r}/kyc`);
    } catch (i) {
      throw $(i, "Failed to get user KYC data");
    }
  }
  /**
   * Override a user's KYC status (system admin only)
   *
   * @param userId - target user ID
   * @param status - new status: "none" | "verified" | "failed"
   */
  async overrideUserKyc(r, i) {
    try {
      await this.client.post(`/admin/users/${r}/kyc/override`, { status: i });
    } catch (a) {
      throw $(a, "Failed to override KYC status");
    }
  }
  /**
   * Get a user's accreditation status and submission history
   */
  async getUserAccreditation(r) {
    try {
      return await this.client.get(
        `/admin/users/${r}/accreditation`
      );
    } catch (i) {
      throw $(i, "Failed to get user accreditation data");
    }
  }
  /**
   * Review an accreditation submission (approve or reject).
   *
   * @param submissionId - target submission ID
   * @param approved - true to approve, false to reject
   * @param reviewerNotes - optional internal notes
   * @param rejectionReason - required when approved is false
   * @param expiryDays - override default expiry (approve only)
   */
  async reviewAccreditation(r, i, a, f, y) {
    try {
      await this.client.post(`/admin/accreditation/${r}/review`, {
        approved: i,
        reviewerNotes: a,
        rejectionReason: f,
        expiryDays: y
      });
    } catch (g) {
      throw $(g, "Failed to review accreditation submission");
    }
  }
  /**
   * Override a user's accreditation status (system admin only).
   *
   * @param userId - target user ID
   * @param status - new status: "none" | "approved" | "rejected"
   */
  async overrideAccreditationStatus(r, i) {
    try {
      await this.client.post(`/admin/users/${r}/accreditation/override`, { status: i });
    } catch (a) {
      throw $(a, "Failed to override accreditation status");
    }
  }
  /**
   * Get user statistics by auth method
   */
  async getStats() {
    try {
      return await this.client.get("/admin/users/stats");
    } catch (r) {
      throw $(r, "Failed to get user stats");
    }
  }
}
function pe() {
  const { config: s, _internal: r } = Ce(), [i, a] = v([]), [f, y] = v(0), [g, c] = v(!1), [o, h] = v(null), [L, P] = v({}), p = te(
    () => new Ae(
      s.serverUrl,
      s.requestTimeout,
      s.retryAttempts,
      r?.getAccessToken
    ),
    [s.serverUrl, s.requestTimeout, s.retryAttempts, r]
  ), T = C(
    async (u) => {
      c(!0), h(null), P(u || {});
      try {
        const n = await p.listUsers(u);
        return a(n.users), y(n.total), n;
      } catch (n) {
        const l = n instanceof Error ? n : new Error("Failed to list users");
        throw h(l), l;
      } finally {
        c(!1);
      }
    },
    [p]
  ), S = C(
    async (u) => {
      c(!0), h(null);
      try {
        return await p.getUser(u);
      } catch (n) {
        const l = n instanceof Error ? n : new Error("Failed to get user");
        throw h(l), l;
      } finally {
        c(!1);
      }
    },
    [p]
  ), E = C(
    async (u, n) => {
      c(!0), h(null);
      try {
        await p.setSystemAdmin(u, n), a(
          (l) => l.map((N) => N.id === u ? { ...N, isSystemAdmin: n } : N)
        );
      } catch (l) {
        const N = l instanceof Error ? l : new Error("Failed to update admin status");
        throw h(N), N;
      } finally {
        c(!1);
      }
    },
    [p]
  ), k = C(
    async (u, n) => {
      c(!0), h(null);
      try {
        const l = await p.updateUser(u, n);
        return a((N) => N.map((V) => V.id === u ? l : V)), l;
      } catch (l) {
        const N = l instanceof Error ? l : new Error("Failed to update user");
        throw h(N), N;
      } finally {
        c(!1);
      }
    },
    [p]
  ), A = C(
    async (u) => {
      c(!0), h(null);
      try {
        await p.deleteUser(u), a((n) => n.filter((l) => l.id !== u)), y((n) => n - 1);
      } catch (n) {
        const l = n instanceof Error ? n : new Error("Failed to delete user");
        throw h(l), l;
      } finally {
        c(!1);
      }
    },
    [p]
  ), w = C(
    async (u) => {
      c(!0), h(null);
      try {
        await p.forcePasswordReset(u);
      } catch (n) {
        const l = n instanceof Error ? n : new Error("Failed to send password reset");
        throw h(l), l;
      } finally {
        c(!1);
      }
    },
    [p]
  ), d = C(
    async (u, n, l) => {
      c(!0), h(null);
      try {
        await p.adjustCredits(u, { amount: n, reason: l });
      } catch (N) {
        const V = N instanceof Error ? N : new Error("Failed to adjust credits");
        throw h(V), V;
      } finally {
        c(!1);
      }
    },
    [p]
  ), D = C(
    async (u, n) => {
      c(!0), h(null);
      try {
        return await p.getUserDeposits(u, n);
      } catch (l) {
        const N = l instanceof Error ? l : new Error("Failed to get user deposits");
        throw h(N), N;
      } finally {
        c(!1);
      }
    },
    [p]
  ), R = C(
    async (u, n) => {
      c(!0), h(null);
      try {
        return await p.getUserCredits(u, n);
      } catch (l) {
        const N = l instanceof Error ? l : new Error("Failed to get user credits");
        throw h(N), N;
      } finally {
        c(!1);
      }
    },
    [p]
  ), _ = C(
    async (u, n) => {
      c(!0), h(null);
      try {
        return await p.getUserWithdrawalHistory(u, n);
      } catch (l) {
        const N = l instanceof Error ? l : new Error("Failed to get user withdrawal history");
        throw h(N), N;
      } finally {
        c(!1);
      }
    },
    [p]
  ), M = C(
    async (u, n) => {
      c(!0), h(null);
      try {
        return await p.getUserChats(u, n);
      } catch (l) {
        const N = l instanceof Error ? l : new Error("Failed to get user chat history");
        throw h(N), N;
      } finally {
        c(!1);
      }
    },
    [p]
  ), j = C(
    async (u, n) => {
      c(!0), h(null);
      try {
        return await p.getUserReferrals(u, n);
      } catch (l) {
        const N = l instanceof Error ? l : new Error("Failed to get user referrals");
        throw h(N), N;
      } finally {
        c(!1);
      }
    },
    [p]
  ), K = C(async () => {
    c(!0), h(null);
    try {
      return await p.getStats();
    } catch (u) {
      const n = u instanceof Error ? u : new Error("Failed to get user stats");
      throw h(n), n;
    } finally {
      c(!1);
    }
  }, [p]), b = C(async () => {
    await T(L);
  }, [T, L]), U = C(() => {
    h(null);
  }, []);
  return {
    users: i,
    total: f,
    isLoading: g,
    error: o,
    listUsers: T,
    getUser: S,
    setSystemAdmin: E,
    updateUser: k,
    deleteUser: A,
    forcePasswordReset: w,
    adjustCredits: d,
    getUserDeposits: D,
    getUserCredits: R,
    getUserWithdrawalHistory: _,
    getUserChats: M,
    getUserReferrals: j,
    getStats: K,
    refresh: b,
    clearError: U
  };
}
function we(s) {
  return new Date(s).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function et(s) {
  return s.length <= 12 ? s : `${s.slice(0, 6)}...${s.slice(-4)}`;
}
function tt(s) {
  return s == null ? "-" : (s / 1e9).toFixed(4);
}
function gt({
  pageSize: s = 20,
  refreshInterval: r = 0,
  currentUserId: i,
  className: a = "",
  onLoad: f,
  onUserClick: y
}) {
  const { users: g, total: c, isLoading: o, error: h, listUsers: L, clearError: P } = pe(), [p, T] = v(0), [S, E] = v(null), [k, A] = v("createdAt"), [w, d] = v("desc"), D = (b) => {
    k === b ? d(w === "asc" ? "desc" : "asc") : (A(b), d("desc"));
  }, R = te(() => [...g].sort((b, U) => {
    let u, n;
    switch (k) {
      case "name":
        u = (b.name || b.email || "").toLowerCase(), n = (U.name || U.email || "").toLowerCase();
        break;
      case "createdAt":
        u = new Date(b.createdAt).getTime(), n = new Date(U.createdAt).getTime();
        break;
      case "lastLoginAt":
        u = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0, n = U.lastLoginAt ? new Date(U.lastLoginAt).getTime() : 0;
        break;
      case "balanceLamports":
        u = b.balanceLamports ?? 0, n = U.balanceLamports ?? 0;
        break;
      default:
        return 0;
    }
    return u < n ? w === "asc" ? -1 : 1 : u > n ? w === "asc" ? 1 : -1 : 0;
  }), [g, k, w]), _ = C(async () => {
    try {
      const b = await L({ limit: s, offset: p });
      f?.(b), E(null);
    } catch (b) {
      E(b instanceof Error ? b.message : "Failed to load users");
    }
  }, [s, p, L, f]);
  I(() => {
    T(0);
  }, [s]), I(() => {
    _();
  }, [_]), I(() => {
    if (r <= 0) return;
    const b = setInterval(_, r);
    return () => clearInterval(b);
  }, [r, _]);
  const M = Math.ceil(c / s), j = Math.floor(p / s) + 1, K = (b) => {
    const U = (b - 1) * s;
    T(Math.max(0, Math.min(U, Math.max(0, c - 1))));
  };
  return S || h ? /* @__PURE__ */ t("div", { className: `cedros-admin-user-list cedros-admin-user-list-error ${a}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: S || h?.message }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          P(), E(null), _();
        },
        children: "Retry"
      }
    )
  ] }) : o && g.length === 0 ? /* @__PURE__ */ t("div", { className: `cedros-admin-user-list cedros-admin-user-list-loading ${a}`, children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading users..." })
  ] }) : /* @__PURE__ */ t("div", { className: `cedros-admin-user-list ${a}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-admin-user-list-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-user-list-title", children: "All Users" }),
      /* @__PURE__ */ t("div", { className: "cedros-admin-user-list-actions", children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-queue-count", children: [
          c,
          " user",
          c !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: _,
            disabled: o,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: o ? "..." : "↻"
          }
        )
      ] })
    ] }),
    g.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No users found." }) }) : /* @__PURE__ */ t(Y, { children: [
      /* @__PURE__ */ t("div", { className: "cedros-admin-user-table", children: [
        /* @__PURE__ */ t("div", { className: "cedros-admin-user-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${k === "name" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => D("name"),
              "aria-label": "Sort by user",
              children: [
                "User",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: k === "name" ? w === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${k === "createdAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => D("createdAt"),
              "aria-label": "Sort by registered date",
              children: [
                "Registered",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: k === "createdAt" ? w === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${k === "lastLoginAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => D("lastLoginAt"),
              "aria-label": "Sort by last login",
              children: [
                "Last Login",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: k === "lastLoginAt" ? w === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${k === "balanceLamports" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => D("balanceLamports"),
              "aria-label": "Sort by balance",
              children: [
                "Balance",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: k === "balanceLamports" ? w === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) })
        ] }),
        R.map((b) => {
          const U = b.id === i;
          return /* @__PURE__ */ t(
            "div",
            {
              className: `cedros-admin-user-row ${U ? "cedros-admin-user-row-current" : ""}`,
              onClick: () => y?.(b),
              onKeyDown: (u) => {
                (u.key === "Enter" || u.key === " ") && (u.preventDefault(), y?.(b));
              },
              role: y ? "button" : void 0,
              tabIndex: y ? 0 : void 0,
              children: [
                /* @__PURE__ */ t("div", { className: "cedros-admin-user-td cedros-admin-user-info", children: [
                  /* @__PURE__ */ e("div", { className: "cedros-admin-user-avatar", children: b.picture ? /* @__PURE__ */ e(
                    "img",
                    {
                      src: b.picture,
                      alt: b.name || b.email || "User",
                      className: "cedros-admin-user-avatar-img",
                      referrerPolicy: "no-referrer"
                    }
                  ) : /* @__PURE__ */ e("span", { className: "cedros-admin-user-avatar-placeholder", children: (b.name?.[0] || b.email?.[0] || "?").toUpperCase() }) }),
                  /* @__PURE__ */ t("div", { className: "cedros-admin-user-details", children: [
                    /* @__PURE__ */ t("span", { className: "cedros-admin-user-name", children: [
                      b.name || "Unknown",
                      U && /* @__PURE__ */ e("span", { className: "cedros-admin-user-you", children: "(you)" })
                    ] }),
                    /* @__PURE__ */ e("span", { className: "cedros-admin-user-email", title: b.email, children: b.email || et(b.id) })
                  ] })
                ] }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td", children: we(b.createdAt) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td", children: b.lastLoginAt ? we(b.lastLoginAt) : "-" }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td", children: tt(b.balanceLamports) })
              ]
            },
            b.id
          );
        })
      ] }),
      M > 1 && /* @__PURE__ */ t("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => K(j - 1),
            disabled: j <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ t("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          j,
          " of ",
          M,
          " (",
          c,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => K(j + 1),
            disabled: j >= M,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function ve(s) {
  return new Date(s).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function q(s) {
  return new Date(s).toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function st(s) {
  return s == null ? "—" : `${(s / 1e9).toFixed(4)} SOL`;
}
function ee(s) {
  return s == null ? "—" : (s / 1e9).toFixed(4);
}
function rt(s) {
  return {
    DEPOSIT: "Deposit",
    SPEND: "Spend",
    ADJUSTMENT: "Adjustment",
    REFUND: "Refund"
  }[s.toUpperCase()] || s;
}
function at(s, r) {
  return r ? {
    deposit: "Credit deposit",
    purchase: "Purchase",
    api_call: "API usage",
    subscription: "Subscription",
    refund: "Refund",
    bonus: "Bonus credit",
    promo: "Promotional credit",
    correction: "Balance correction"
  }[r.toLowerCase()] || r : {
    DEPOSIT: "Credit added",
    SPEND: "Credit used",
    ADJUSTMENT: "Manual adjustment",
    REFUND: "Credit refunded"
  }[s.toUpperCase()] || "—";
}
function wt({
  userId: s,
  onBack: r,
  currentUserId: i,
  onEditUser: a,
  onAdjustCredits: f,
  cedrosPayEnabled: y = !1,
  className: g = ""
}) {
  const { config: c, _internal: o } = Ce(), {
    isLoading: h,
    getUser: L,
    getUserDeposits: P,
    getUserCredits: p,
    getUserChats: T,
    getUserReferrals: S,
    deleteUser: E,
    forcePasswordReset: k,
    clearError: A
  } = pe(), w = te(
    () => new Ae(
      c.serverUrl,
      c.requestTimeout,
      c.retryAttempts,
      o?.getAccessToken
    ),
    [c.serverUrl, c.requestTimeout, c.retryAttempts, o]
  ), [d, D] = v(null), [R, _] = v(null), [M, j] = v(null), [K, b] = v(null), [U, u] = v(null), [n, l] = v(null), [N, V] = v(null), [O, H] = v("deposits"), [ye, re] = v(null), [ae, G] = v(null), [Se, ie] = v(null), [Ee, ne] = v(null), [Ue, ce] = v(null), [ke, Q] = v(null), [Re, J] = v(null), [X, Z] = v(!1), [de, $e] = v(0), [oe, Le] = v(0), [le, Te] = v(0), [me, Fe] = v(0), F = 10, ue = C(async () => {
    try {
      const m = await L(s);
      D(m), re(null);
    } catch (m) {
      re(m instanceof Error ? m.message : "Failed to load user");
    }
  }, [s, L]), he = C(async () => {
    try {
      const x = await P(s, { limit: F, offset: de });
      j(x), ie(null);
    } catch (m) {
      ie(m instanceof Error ? m.message : "Failed to load deposits");
    }
  }, [s, P, de]), z = C(async () => {
    try {
      const x = await p(s, { limit: F, offset: oe });
      _(x), G(null);
    } catch (m) {
      G(m instanceof Error ? m.message : "Failed to load credits");
    }
  }, [s, p, oe]), fe = C(async () => {
    if (y)
      try {
        const x = await T(s, { limit: F, offset: le });
        b(x), ne(null);
      } catch (m) {
        ne(m instanceof Error ? m.message : "Failed to load chat history");
      }
  }, [s, T, le, y]), be = C(async () => {
    try {
      const x = await S(s, { limit: F, offset: me });
      u(x), ce(null);
    } catch (m) {
      ce(m instanceof Error ? m.message : "Failed to load referrals");
    }
  }, [s, S, me]), W = C(async () => {
    try {
      const m = await w.getUserKyc(s);
      l(m), Q(null);
    } catch (m) {
      Q(m instanceof Error ? m.message : "Failed to load KYC data");
    }
  }, [s, w]), B = C(async () => {
    try {
      const m = await w.getUserAccreditation(s);
      V(m), J(null);
    } catch (m) {
      J(
        m instanceof Error ? m.message : "Failed to load accreditation data"
      );
    }
  }, [s, w]), Pe = C(
    async (m) => {
      try {
        await w.overrideAccreditationStatus(s, m), await B();
      } catch (x) {
        J(
          x instanceof Error ? x.message : "Failed to override accreditation status"
        );
      }
    },
    [s, w, B]
  ), De = C(
    async (m, x, Qe, Xe) => {
      try {
        await w.reviewAccreditation(
          m,
          x,
          Qe,
          Xe
        ), await B();
      } catch (ge) {
        J(
          ge instanceof Error ? ge.message : "Failed to review accreditation submission"
        );
      }
    },
    [w, B]
  ), Oe = C(
    async (m) => {
      try {
        await w.overrideUserKyc(s, m), await W();
      } catch (x) {
        Q(x instanceof Error ? x.message : "Failed to override KYC status");
      }
    },
    [s, w, W]
  );
  I(() => {
    ue(), he(), z(), be(), W(), B(), y && fe();
  }, [ue, he, z, fe, be, W, B, y]);
  const xe = async () => {
    if (!d) return;
    if (d.id === i) {
      alert("You cannot delete your own account");
      return;
    }
    if (d.isSystemAdmin) {
      alert("Cannot delete a system admin. Remove admin status first.");
      return;
    }
    if (window.confirm(
      `Are you sure you want to delete ${d.name || d.email || "this user"}? This action cannot be undone.`
    )) {
      Z(!0);
      try {
        await E(d.id), r();
      } catch {
      } finally {
        Z(!1);
      }
    }
  }, Me = async () => {
    if (!d?.email) {
      alert("User has no email address");
      return;
    }
    if (window.confirm(`Send a password reset email to ${d.email}?`)) {
      Z(!0);
      try {
        await k(d.id), alert("Password reset email sent");
      } catch {
      } finally {
        Z(!1);
      }
    }
  }, _e = M ? Math.ceil(M.total / F) : 0, Ke = Math.floor(de / F) + 1, je = R ? Math.ceil(R.totalTransactions / F) : 0, qe = Math.floor(oe / F) + 1, Ve = (m) => {
    $e((m - 1) * F);
  }, Be = (m) => {
    Le((m - 1) * F);
  }, Ye = K ? Math.ceil(K.total / F) : 0, He = Math.floor(le / F) + 1, Ie = (m) => {
    Te((m - 1) * F);
  }, Je = U ? Math.ceil(U.total / F) : 0, We = Math.floor(me / F) + 1, Ge = (m) => {
    Fe((m - 1) * F);
  };
  if (ye)
    return /* @__PURE__ */ t("div", { className: `cedros-admin-user-detail cedros-admin-user-detail-error ${g}`, children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: r,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: ye }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline",
          onClick: () => {
            A(), re(null), ue();
          },
          children: "Retry"
        }
      )
    ] });
  if (h && !d)
    return /* @__PURE__ */ t("div", { className: `cedros-admin-user-detail cedros-admin-user-detail-loading ${g}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading user..." })
    ] });
  if (!d)
    return /* @__PURE__ */ t("div", { className: `cedros-admin-user-detail ${g}`, children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: r,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "User not found." })
    ] });
  const Ne = d.id === i;
  return /* @__PURE__ */ t("div", { className: `cedros-admin-user-detail ${g}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-header", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-back-btn",
          onClick: r,
          children: "Back to Users"
        }
      ),
      /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-actions", children: [
        a && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => a(d),
            disabled: X,
            children: "Edit"
          }
        ),
        d.email && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: Me,
            disabled: X,
            children: "Reset Password"
          }
        ),
        f && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => f(d),
            disabled: X,
            children: "Adjust Credits"
          }
        ),
        !Ne && !d.isSystemAdmin && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-btn-danger",
            onClick: xe,
            disabled: X,
            children: "Delete"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-info", children: [
      /* @__PURE__ */ e("div", { className: "cedros-admin-user-detail-avatar", children: d.picture ? /* @__PURE__ */ e(
        "img",
        {
          src: d.picture,
          alt: d.name || d.email || "User",
          className: "cedros-admin-user-detail-avatar-img",
          referrerPolicy: "no-referrer"
        }
      ) : /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-avatar-placeholder", children: (d.name?.[0] || d.email?.[0] || "?").toUpperCase() }) }),
      /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-meta", children: [
        /* @__PURE__ */ t("h2", { className: "cedros-admin-user-detail-name", children: [
          d.name || "Unknown",
          Ne && /* @__PURE__ */ e("span", { className: "cedros-admin-user-you", children: "(you)" })
        ] }),
        /* @__PURE__ */ t("p", { className: "cedros-admin-user-detail-email", children: [
          d.email || "No email",
          d.emailVerified && /* @__PURE__ */ e("span", { className: "cedros-admin-verified-badge", title: "Email verified", children: "Verified" })
        ] }),
        d.isSystemAdmin && /* @__PURE__ */ e("div", { className: "cedros-admin-user-detail-badges", children: /* @__PURE__ */ e("span", { className: "cedros-admin-admin-badge cedros-admin-admin-badge-yes", children: "System Admin" }) }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-methods", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-methods-label", children: "Auth Methods:" }),
          d.authMethods.length > 0 ? d.authMethods.map((m) => /* @__PURE__ */ e(
            "span",
            {
              className: `cedros-admin-auth-badge cedros-admin-auth-badge-${m}`,
              children: m
            },
            m
          )) : /* @__PURE__ */ e("span", { className: "cedros-admin-auth-badge cedros-admin-auth-badge-none", children: "none" })
        ] }),
        /* @__PURE__ */ t("p", { className: "cedros-admin-user-detail-dates", children: [
          "Registered: ",
          ve(d.createdAt),
          " | Updated: ",
          ve(d.updatedAt)
        ] }),
        d.referralCode && /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-referral", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-referral-label", children: "Referral:" }),
          /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-referral-code", children: d.referralCode }),
          d.referralCount !== void 0 && d.referralCount > 0 && /* @__PURE__ */ t("span", { className: "cedros-admin-user-detail-referral-count", children: [
            "(",
            d.referralCount,
            " referred)"
          ] }),
          d.referredBy && /* @__PURE__ */ t("span", { className: "cedros-admin-user-detail-referred-by", children: [
            "Referred by:",
            " ",
            /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                className: "cedros-admin-user-uuid-link",
                onClick: () => navigator.clipboard?.writeText(d.referredBy),
                title: "Click to copy referrer UUID",
                children: d.referredBy
              }
            )
          ] })
        ] })
      ] })
    ] }),
    ae ? /* @__PURE__ */ t("div", { className: "cedros-admin-stats-error", children: [
      /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: ae }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: () => {
            G(null), z();
          },
          children: "Retry"
        }
      )
    ] }) : R ? /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-stats", children: [
      /* @__PURE__ */ t("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Credit Balance" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: ee(R.stats.currentBalanceLamports) })
      ] }),
      /* @__PURE__ */ t("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Total Credited" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: ee(R.stats.totalDepositedLamports) })
      ] }),
      /* @__PURE__ */ t("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Total Spent" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: ee(R.stats.totalSpentLamports) })
      ] }),
      /* @__PURE__ */ t("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Deposits" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: R.stats.depositCount })
      ] }),
      /* @__PURE__ */ t("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Transactions" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: R.stats.spendCount })
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
          className: `cedros-admin-tab ${O === "deposits" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => H("deposits"),
          children: [
            "Deposits (",
            M?.total ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${O === "transactions" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => H("transactions"),
          children: [
            "Credits (",
            R?.totalTransactions ?? 0,
            ")"
          ]
        }
      ),
      y && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${O === "chats" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => H("chats"),
          children: [
            "Chats (",
            K?.total ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${O === "referrals" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => H("referrals"),
          children: [
            "Referrals (",
            U?.total ?? d.referralCount ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${O === "kyc" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => H("kyc"),
          children: [
            "KYC (",
            n?.totalSessions ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${O === "accreditation" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => H("accreditation"),
          children: [
            "Accreditation (",
            N?.totalSubmissions ?? 0,
            ")"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-admin-user-detail-content", children: [
      O === "deposits" && /* @__PURE__ */ e(
        it,
        {
          deposits: M?.deposits ?? [],
          total: M?.total ?? 0,
          currentPage: Ke,
          totalPages: _e,
          onPageChange: Ve,
          isLoading: h,
          error: Se,
          onRetry: () => {
            ie(null), he();
          }
        }
      ),
      O === "transactions" && /* @__PURE__ */ e(
        nt,
        {
          transactions: R?.transactions ?? [],
          total: R?.totalTransactions ?? 0,
          currentPage: qe,
          totalPages: je,
          onPageChange: Be,
          error: ae,
          onRetry: () => {
            G(null), z();
          },
          isLoading: h
        }
      ),
      O === "chats" && y && /* @__PURE__ */ e(
        ct,
        {
          sessions: K?.sessions ?? [],
          total: K?.total ?? 0,
          currentPage: He,
          totalPages: Ye,
          onPageChange: Ie,
          error: Ee,
          onRetry: () => {
            ne(null), fe();
          },
          isLoading: h
        }
      ),
      O === "referrals" && /* @__PURE__ */ e(
        dt,
        {
          referrals: U?.users ?? [],
          total: U?.total ?? 0,
          currentPage: We,
          totalPages: Je,
          onPageChange: Ge,
          error: Ue,
          onRetry: () => {
            ce(null), be();
          },
          isLoading: h
        }
      ),
      O === "kyc" && /* @__PURE__ */ e(
        lt,
        {
          kycData: n,
          userKycStatus: d.kycStatus,
          userKycVerifiedAt: d.kycVerifiedAt,
          userKycExpiresAt: d.kycExpiresAt,
          error: ke,
          onRetry: () => {
            Q(null), W();
          },
          onOverride: Oe
        }
      ),
      O === "accreditation" && /* @__PURE__ */ e(
        ut,
        {
          accreditationData: N,
          userAccreditationStatus: d.accreditationStatus,
          userAccreditationVerifiedAt: d.accreditationVerifiedAt,
          userAccreditationExpiresAt: d.accreditationExpiresAt,
          error: Re,
          onRetry: () => {
            J(null), B();
          },
          onOverride: Pe,
          onReview: De
        }
      )
    ] })
  ] });
}
function it({
  deposits: s,
  total: r,
  currentPage: i,
  totalPages: a,
  onPageChange: f,
  isLoading: y,
  error: g,
  onRetry: c
}) {
  return g ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: g }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : y && s.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading deposits..." })
  ] }) : r === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No deposits found." }) : /* @__PURE__ */ t(Y, { children: [
    /* @__PURE__ */ t("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ t("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Amount" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Status" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Transaction" })
      ] }),
      s.map((o) => /* @__PURE__ */ t("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: q(o.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: st(o.amountLamports) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e("span", { className: `cedros-admin-status-badge cedros-admin-status-${o.status}`, children: o.status }) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td cedros-admin-list-td-actions", children: o.txSignature ? /* @__PURE__ */ t(Y, { children: [
          /* @__PURE__ */ t("span", { className: "cedros-admin-list-td-mono", title: o.txSignature, children: [
            o.txSignature.slice(0, 8),
            "..."
          ] }),
          /* @__PURE__ */ e(
            "a",
            {
              href: `https://orbmarkets.io/tx/${o.txSignature}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "cedros-admin-icon-link",
              title: "View on Orbmarkets",
              "aria-label": "View transaction on Orbmarkets",
              children: "↗"
            }
          )
        ] }) : /* @__PURE__ */ e("span", { className: "cedros-admin-list-td-muted", children: "—" }) })
      ] }, o.id))
    ] }),
    a > 1 && /* @__PURE__ */ e(
      se,
      {
        currentPage: i,
        totalPages: a,
        total: r,
        onPageChange: f
      }
    )
  ] });
}
function nt({
  transactions: s,
  total: r,
  currentPage: i,
  totalPages: a,
  onPageChange: f,
  isLoading: y,
  error: g,
  onRetry: c
}) {
  return g ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: g }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : y && s.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading transactions..." })
  ] }) : r === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No credit transactions found." }) : /* @__PURE__ */ t(Y, { children: [
    /* @__PURE__ */ t("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ t("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Type" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Description" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Amount" })
      ] }),
      s.map((o) => /* @__PURE__ */ t("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: q(o.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-tx-type cedros-admin-tx-type-${o.txType.toLowerCase()}`,
            children: rt(o.txType)
          }
        ) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: at(o.txType, o.referenceType) }),
        /* @__PURE__ */ t(
          "div",
          {
            className: `cedros-admin-list-td ${o.amountLamports >= 0 ? "cedros-admin-amount-positive" : "cedros-admin-amount-negative"}`,
            children: [
              o.amountLamports >= 0 ? "+" : "",
              ee(o.amountLamports)
            ]
          }
        )
      ] }, o.id))
    ] }),
    a > 1 && /* @__PURE__ */ e(
      se,
      {
        currentPage: i,
        totalPages: a,
        total: r,
        onPageChange: f
      }
    )
  ] });
}
function ct({
  sessions: s,
  total: r,
  currentPage: i,
  totalPages: a,
  onPageChange: f,
  isLoading: y,
  error: g,
  onRetry: c
}) {
  return g ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: g }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : y && s.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading chat history..." })
  ] }) : r === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No chat sessions found." }) : /* @__PURE__ */ t(Y, { children: [
    /* @__PURE__ */ t("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ t("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Session" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Messages" })
      ] }),
      s.map((o) => /* @__PURE__ */ t("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: q(o.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: o.title || `Chat ${o.id.slice(0, 8)}...` }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: o.messageCount })
      ] }, o.id))
    ] }),
    a > 1 && /* @__PURE__ */ e(
      se,
      {
        currentPage: i,
        totalPages: a,
        total: r,
        onPageChange: f
      }
    )
  ] });
}
function dt({
  referrals: s,
  total: r,
  currentPage: i,
  totalPages: a,
  onPageChange: f,
  isLoading: y,
  error: g,
  onRetry: c
}) {
  return g ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: g }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : y && s.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading referrals..." })
  ] }) : r === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No referred users found." }) : /* @__PURE__ */ t(Y, { children: [
    /* @__PURE__ */ t("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ t("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Name" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Email" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Joined" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Last Login" })
      ] }),
      s.map((o) => /* @__PURE__ */ t("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: o.name || "—" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: o.email || "—" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: ve(o.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: o.lastLoginAt ? q(o.lastLoginAt) : "—" })
      ] }, o.id))
    ] }),
    a > 1 && /* @__PURE__ */ e(
      se,
      {
        currentPage: i,
        totalPages: a,
        total: r,
        onPageChange: f
      }
    )
  ] });
}
const ot = [
  { value: "none", label: "None (reset)" },
  { value: "verified", label: "Verified" },
  { value: "failed", label: "Failed" }
];
function lt({
  kycData: s,
  userKycStatus: r,
  userKycVerifiedAt: i,
  userKycExpiresAt: a,
  error: f,
  onRetry: y,
  onOverride: g
}) {
  const [c, o] = v("none"), [h, L] = v(!1), [P, p] = v(null), T = s?.status ?? r ?? "none", S = s?.verifiedAt ?? i, E = s?.expiresAt ?? a, k = async () => {
    if (window.confirm(
      `Override KYC status to "${c}" for this user?`
    )) {
      L(!0), p(null);
      try {
        await g(c);
      } catch (w) {
        p(w instanceof Error ? w.message : "Override failed");
      } finally {
        L(!1);
      }
    }
  };
  return f ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: f }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: y,
        children: "Retry"
      }
    )
  ] }) : !s && !r ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading KYC data..." })
  ] }) : /* @__PURE__ */ t("div", { className: "cedros-kyc-admin-tab", children: [
    /* @__PURE__ */ t("div", { className: "cedros-kyc-admin-tab-summary", children: [
      /* @__PURE__ */ t("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Status" }),
        /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-status-badge cedros-kyc-status-${T}`,
            children: T
          }
        )
      ] }),
      S && /* @__PURE__ */ t("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Verified at" }),
        /* @__PURE__ */ e("span", { children: q(S) })
      ] }),
      E && /* @__PURE__ */ t("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Expires at" }),
        /* @__PURE__ */ e("span", { children: q(E) })
      ] })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-kyc-admin-override", children: [
      /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-override-label", children: "Override status" }),
      /* @__PURE__ */ e(
        "select",
        {
          className: "cedros-kyc-admin-override-select",
          value: c,
          onChange: (A) => o(A.target.value),
          disabled: h,
          "aria-label": "Select KYC override status",
          children: ot.map((A) => /* @__PURE__ */ e("option", { value: A.value, children: A.label }, A.value))
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: k,
          disabled: h,
          children: h ? "Saving..." : "Apply Override"
        }
      ),
      P && /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: P })
    ] }),
    s && s.sessions.length > 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ t("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Provider" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Status" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Error" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Completed" })
      ] }),
      s.sessions.map((A) => /* @__PURE__ */ t("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: q(A.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: A.provider }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-status-badge cedros-kyc-status-${A.status}`,
            children: A.status
          }
        ) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td cedros-admin-list-td-muted", children: A.errorCode ? `${A.errorCode}${A.errorReason ? `: ${A.errorReason}` : ""}` : "—" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: A.completedAt ? q(A.completedAt) : "—" })
      ] }, A.id))
    ] }) : s && /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No verification sessions found." })
  ] });
}
const mt = [
  { value: "none", label: "None (reset)" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" }
];
function ut({
  accreditationData: s,
  userAccreditationStatus: r,
  userAccreditationVerifiedAt: i,
  userAccreditationExpiresAt: a,
  error: f,
  onRetry: y,
  onOverride: g,
  onReview: c
}) {
  const [o, h] = v("none"), [L, P] = v(!1), [p, T] = v(null), [S, E] = v(null), [k, A] = v(""), [w, d] = v(""), [D, R] = v(!1), [_, M] = v(null), j = s?.status ?? r ?? "none", K = s?.verifiedAt ?? i, b = s?.expiresAt ?? a, U = async () => {
    if (window.confirm(
      `Override accreditation status to "${o}" for this user?`
    )) {
      P(!0), T(null);
      try {
        await g(o);
      } catch (l) {
        T(l instanceof Error ? l.message : "Override failed");
      } finally {
        P(!1);
      }
    }
  }, u = async (n, l) => {
    const N = l ? "approve" : "reject";
    if (window.confirm(`${N.charAt(0).toUpperCase() + N.slice(1)} this submission?`)) {
      R(!0), M(null);
      try {
        await c(
          n,
          l,
          k || void 0,
          l ? void 0 : w || void 0
        ), E(null), A(""), d("");
      } catch (O) {
        M(O instanceof Error ? O.message : "Review failed");
      } finally {
        R(!1);
      }
    }
  };
  return f ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: f }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: y,
        children: "Retry"
      }
    )
  ] }) : !s && !r ? /* @__PURE__ */ t("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading accreditation data..." })
  ] }) : /* @__PURE__ */ t("div", { className: "cedros-accreditation-admin-tab", children: [
    /* @__PURE__ */ t("div", { className: "cedros-kyc-admin-tab-summary", children: [
      /* @__PURE__ */ t("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Status" }),
        /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-status-badge cedros-accreditation-status-${j}`,
            children: j
          }
        )
      ] }),
      K && /* @__PURE__ */ t("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Verified at" }),
        /* @__PURE__ */ e("span", { children: q(K) })
      ] }),
      b && /* @__PURE__ */ t("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Expires at" }),
        /* @__PURE__ */ e("span", { children: q(b) })
      ] })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-kyc-admin-override", children: [
      /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-override-label", children: "Override status" }),
      /* @__PURE__ */ e(
        "select",
        {
          className: "cedros-kyc-admin-override-select",
          value: o,
          onChange: (n) => h(n.target.value),
          disabled: L,
          "aria-label": "Select accreditation override status",
          children: mt.map((n) => /* @__PURE__ */ e("option", { value: n.value, children: n.label }, n.value))
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: U,
          disabled: L,
          children: L ? "Saving..." : "Apply Override"
        }
      ),
      p && /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: p })
    ] }),
    s && s.submissions.length > 0 ? /* @__PURE__ */ t(Y, { children: [
      /* @__PURE__ */ t("div", { className: "cedros-admin-list-table", children: [
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Method" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Status" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Expires" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Actions" })
        ] }),
        s.submissions.map((n) => /* @__PURE__ */ t("div", { className: "cedros-admin-list-row", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: q(n.createdAt) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: n.method.replace(/_/g, " ") }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e(
            "span",
            {
              className: `cedros-admin-status-badge cedros-accreditation-status-${n.status}`,
              children: n.status
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: n.expiresAt ? q(n.expiresAt) : "—" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td cedros-admin-list-td-actions", children: n.status === "pending" && /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-sm",
              onClick: () => E(S === n.id ? null : n.id),
              children: "Review"
            }
          ) })
        ] }, n.id))
      ] }),
      S && /* @__PURE__ */ t("div", { className: "cedros-accreditation-review-panel", children: [
        /* @__PURE__ */ e("p", { className: "cedros-accreditation-review-title", children: "Review submission" }),
        /* @__PURE__ */ e("label", { className: "cedros-kyc-admin-tab-label", htmlFor: "review-notes", children: "Reviewer notes (internal)" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "review-notes",
            type: "text",
            className: "cedros-input cedros-input-sm",
            value: k,
            onChange: (n) => A(n.target.value),
            placeholder: "Optional internal notes",
            disabled: D
          }
        ),
        /* @__PURE__ */ e(
          "label",
          {
            className: "cedros-kyc-admin-tab-label",
            htmlFor: "review-rejection",
            children: "Rejection reason (shown to user if rejected)"
          }
        ),
        /* @__PURE__ */ e(
          "input",
          {
            id: "review-rejection",
            type: "text",
            className: "cedros-input cedros-input-sm",
            value: w,
            onChange: (n) => d(n.target.value),
            placeholder: "Required when rejecting",
            disabled: D
          }
        ),
        /* @__PURE__ */ t("div", { className: "cedros-accreditation-review-actions", children: [
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-sm",
              onClick: () => u(S, !0),
              disabled: D,
              children: D ? "Saving..." : "Approve"
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-btn-danger",
              onClick: () => u(S, !1),
              disabled: D || !w.trim(),
              children: D ? "Saving..." : "Reject"
            }
          )
        ] }),
        _ && /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: _ })
      ] })
    ] }) : s && /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No accreditation submissions found." })
  ] });
}
function se({ currentPage: s, totalPages: r, total: i, onPageChange: a }) {
  return /* @__PURE__ */ t("div", { className: "cedros-admin-pagination", children: [
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: () => a(s - 1),
        disabled: s <= 1,
        children: "Previous"
      }
    ),
    /* @__PURE__ */ t("span", { className: "cedros-admin-page-info", children: [
      "Page ",
      s,
      " of ",
      r,
      " (",
      i,
      " total)"
    ] }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: () => a(s + 1),
        disabled: s >= r,
        children: "Next"
      }
    )
  ] });
}
const ht = ["email", "google", "apple", "solana", "webauthn", "sso"], ft = {
  email: "Email Users",
  google: "Google Users",
  apple: "Apple Users",
  solana: "Solana Users",
  webauthn: "Passkey Users",
  sso: "SSO Provider Users"
}, bt = {
  email: "auth_email_enabled",
  google: "auth_google_enabled",
  apple: "auth_apple_enabled",
  solana: "auth_solana_enabled",
  webauthn: "auth_webauthn_enabled",
  sso: "feature_sso"
};
function Ct() {
  const { getStats: s } = pe(), { fetchSettings: r, getValue: i } = ze(), [a, f] = v(null), [y, g] = v(!1), [c, o] = v(null), [h, L] = v(!1);
  I(() => {
    h || (r(), L(!0));
  }, [r, h]);
  const P = C(
    (S) => {
      const E = i(S);
      return E === void 0 ? !1 : E === "true" || E === "1";
    },
    [i]
  ), p = C(async () => {
    g(!0), o(null);
    try {
      const S = await s();
      f(S);
    } catch (S) {
      o(S instanceof Error ? S.message : "Failed to load user stats");
    } finally {
      g(!1);
    }
  }, [s]);
  return I(() => {
    p();
  }, [p]), { statsItems: te(() => {
    const S = [{ label: "Total Users", value: a?.total ?? "—" }];
    return ht.forEach((E) => {
      P(bt[E]) && S.push({
        label: ft[E],
        value: a?.authMethodCounts[E] ?? 0
      });
    }), S;
  }, [a, P]), isLoading: y, error: c, refresh: p };
}
export {
  wt as A,
  gt as a,
  pe as b,
  Ct as u
};
