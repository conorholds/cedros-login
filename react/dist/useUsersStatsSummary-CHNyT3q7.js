import { jsxs as r, jsx as e, Fragment as V } from "react/jsx-runtime";
import { useState as g, useMemo as re, useCallback as S, useEffect as I } from "react";
import { a as Ce, u as Ze } from "./useSystemSettings-K3wDZ3qB.js";
import { A as ze, h as E } from "./useCedrosLogin-BDbp-ld1.js";
class Se {
  client;
  constructor(s, a, n, o) {
    this.client = new ze({ baseUrl: s, timeoutMs: a, retryAttempts: n, getAccessToken: o });
  }
  /**
   * List all users in the system
   */
  async listUsers(s) {
    try {
      const a = new URLSearchParams();
      s?.limit && a.set("limit", String(s.limit)), s?.offset && a.set("offset", String(s.offset));
      const n = a.toString(), o = `/admin/users${n ? `?${n}` : ""}`;
      return await this.client.get(o);
    } catch (a) {
      throw E(a, "Failed to list users");
    }
  }
  /**
   * Get a specific user by ID
   */
  async getUser(s) {
    try {
      return await this.client.get(`/admin/users/${s}`);
    } catch (a) {
      throw E(a, "Failed to get user");
    }
  }
  /**
   * Set a user's system admin status
   */
  async setSystemAdmin(s, a) {
    try {
      await this.client.patch(`/admin/users/${s}/system-admin`, { isAdmin: a });
    } catch (n) {
      throw E(n, "Failed to update system admin status");
    }
  }
  /**
   * Update a user's profile
   */
  async updateUser(s, a) {
    try {
      return await this.client.patch(`/admin/users/${s}`, a);
    } catch (n) {
      throw E(n, "Failed to update user");
    }
  }
  /**
   * Delete a user
   */
  async deleteUser(s) {
    try {
      await this.client.delete(`/admin/users/${s}`);
    } catch (a) {
      throw E(a, "Failed to delete user");
    }
  }
  /**
   * Send a password reset email to a user
   */
  async forcePasswordReset(s) {
    try {
      await this.client.post(`/admin/users/${s}/force-password-reset`, {});
    } catch (a) {
      throw E(a, "Failed to send password reset email");
    }
  }
  /**
   * Adjust a user's credits
   */
  async adjustCredits(s, a) {
    try {
      await this.client.post(`/admin/users/${s}/credits`, a);
    } catch (n) {
      throw E(n, "Failed to adjust credits");
    }
  }
  /**
   * Get a user's deposit history
   */
  async getUserDeposits(s, a) {
    try {
      const n = new URLSearchParams();
      a?.limit && n.set("limit", String(a.limit)), a?.offset && n.set("offset", String(a.offset));
      const o = n.toString(), p = `/admin/users/${s}/deposits${o ? `?${o}` : ""}`;
      return await this.client.get(p);
    } catch (n) {
      throw E(n, "Failed to get user deposits");
    }
  }
  /**
   * Get a user's credit stats and transaction history
   */
  async getUserCredits(s, a) {
    try {
      const n = new URLSearchParams();
      a?.limit && n.set("limit", String(a.limit)), a?.offset && n.set("offset", String(a.offset));
      const o = n.toString(), p = `/admin/users/${s}/credits${o ? `?${o}` : ""}`;
      return await this.client.get(p);
    } catch (n) {
      throw E(n, "Failed to get user credits");
    }
  }
  /**
   * Get a user's withdrawal history
   */
  async getUserWithdrawalHistory(s, a) {
    try {
      const n = new URLSearchParams();
      a?.limit && n.set("limit", String(a.limit)), a?.offset && n.set("offset", String(a.offset));
      const o = n.toString(), p = `/admin/users/${s}/withdrawal-history${o ? `?${o}` : ""}`;
      return await this.client.get(p);
    } catch (n) {
      throw E(n, "Failed to get user withdrawal history");
    }
  }
  /**
   * Get a user's chat history (from cedros-pay)
   * Only available when cedros-pay is enabled.
   */
  async getUserChats(s, a) {
    try {
      const n = new URLSearchParams();
      a?.limit && n.set("limit", String(a.limit)), a?.offset && n.set("offset", String(a.offset));
      const o = n.toString(), p = `/admin/users/${s}/chats${o ? `?${o}` : ""}`;
      return await this.client.get(p);
    } catch (n) {
      throw E(n, "Failed to get user chat history");
    }
  }
  /**
   * Get the list of users directly referred by a given user
   */
  async getUserReferrals(s, a) {
    try {
      const n = new URLSearchParams();
      a?.limit && n.set("limit", String(a.limit)), a?.offset && n.set("offset", String(a.offset));
      const o = n.toString(), p = `/admin/users/${s}/referrals${o ? `?${o}` : ""}`;
      return await this.client.get(p);
    } catch (n) {
      throw E(n, "Failed to get user referrals");
    }
  }
  /**
   * Get a user's KYC status and session history
   */
  async getUserKyc(s) {
    try {
      return await this.client.get(`/admin/users/${s}/kyc`);
    } catch (a) {
      throw E(a, "Failed to get user KYC data");
    }
  }
  /**
   * Override a user's KYC status (system admin only)
   *
   * @param userId - target user ID
   * @param status - new status: "none" | "verified" | "failed"
   */
  async overrideUserKyc(s, a) {
    try {
      await this.client.post(`/admin/users/${s}/kyc/override`, { status: a });
    } catch (n) {
      throw E(n, "Failed to override KYC status");
    }
  }
  /**
   * Get a user's accreditation status and submission history
   */
  async getUserAccreditation(s) {
    try {
      return await this.client.get(
        `/admin/users/${s}/accreditation`
      );
    } catch (a) {
      throw E(a, "Failed to get user accreditation data");
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
  async reviewAccreditation(s, a, n, o, p) {
    try {
      await this.client.post(`/admin/accreditation/${s}/review`, {
        approved: a,
        reviewerNotes: n,
        rejectionReason: o,
        expiryDays: p
      });
    } catch (b) {
      throw E(b, "Failed to review accreditation submission");
    }
  }
  /**
   * Override a user's accreditation status (system admin only).
   *
   * @param userId - target user ID
   * @param status - new status: "none" | "approved" | "rejected"
   */
  async overrideAccreditationStatus(s, a) {
    try {
      await this.client.post(`/admin/users/${s}/accreditation/override`, { status: a });
    } catch (n) {
      throw E(n, "Failed to override accreditation status");
    }
  }
  /**
   * Get user statistics by auth method
   */
  async getStats() {
    try {
      return await this.client.get("/admin/users/stats");
    } catch (s) {
      throw E(s, "Failed to get user stats");
    }
  }
  /**
   * List pending accreditation submissions (queue view).
   *
   * @param limit - page size (default 20)
   * @param offset - pagination offset
   */
  async listPendingAccreditations(s = 20, a = 0) {
    try {
      const n = new URLSearchParams();
      return n.set("limit", String(s)), n.set("offset", String(a)), await this.client.get(
        `/admin/accreditation/pending?${n.toString()}`
      );
    } catch (n) {
      throw E(n, "Failed to list pending accreditations");
    }
  }
  /**
   * Get full detail for a single accreditation submission.
   *
   * @param submissionId - submission UUID
   */
  async getAccreditationSubmission(s) {
    try {
      return await this.client.get(
        `/admin/accreditation/${s}`
      );
    } catch (a) {
      throw E(a, "Failed to get accreditation submission");
    }
  }
  /**
   * Get a presigned download URL for an accreditation document.
   *
   * @param docId - document UUID
   * @returns presigned URL string
   */
  async getAccreditationDocumentUrl(s) {
    try {
      return (await this.client.get(
        `/admin/accreditation/documents/${s}/url`
      )).url;
    } catch (a) {
      throw E(a, "Failed to get document URL");
    }
  }
  /**
   * Fetch sanctions screening stats.
   */
  async getSanctionsStats() {
    try {
      return await this.client.get("/admin/sanctions/stats");
    } catch (s) {
      throw E(s, "Failed to get sanctions stats");
    }
  }
  /**
   * Force-refresh the sanctions cache.
   */
  async refreshSanctions() {
    try {
      await this.client.post("/admin/sanctions/refresh", {});
    } catch (s) {
      throw E(s, "Failed to refresh sanctions cache");
    }
  }
  // ==========================================================================
  // Signup gating / access codes
  // ==========================================================================
  /**
   * Get signup stats for the current period.
   *
   * @returns count, limit, period, periodStart
   */
  async getSignupStats() {
    try {
      return await this.client.get("/admin/signup-stats");
    } catch (s) {
      throw E(s, "Failed to get signup stats");
    }
  }
  /**
   * List access codes with optional type filter.
   *
   * @param limit - page size (default 20)
   * @param offset - pagination offset (default 0)
   * @param codeType - filter by type: 'limited' | 'user_invite' etc.
   */
  async listAccessCodes(s = 20, a = 0, n) {
    try {
      const o = new URLSearchParams();
      return o.set("limit", String(s)), o.set("offset", String(a)), n && o.set("type", n), await this.client.get(
        `/admin/access-codes?${o.toString()}`
      );
    } catch (o) {
      throw E(o, "Failed to list access codes");
    }
  }
  /**
   * Create a new admin-managed access code.
   *
   * @param code - the code string
   * @param maxUses - max redemptions (null for unlimited)
   * @param expiresAt - optional ISO expiry timestamp
   */
  async createAccessCode(s, a, n) {
    try {
      return await this.client.post("/admin/access-codes", {
        code: s,
        maxUses: a,
        expiresAt: n
      });
    } catch (o) {
      throw E(o, "Failed to create access code");
    }
  }
  /**
   * Delete an access code by ID.
   *
   * @param id - access code UUID
   */
  async deleteAccessCode(s) {
    try {
      await this.client.delete(`/admin/access-codes/${s}`);
    } catch (a) {
      throw E(a, "Failed to delete access code");
    }
  }
}
function be() {
  const { config: t, _internal: s } = Ce(), [a, n] = g([]), [o, p] = g(0), [b, c] = g(!1), [d, f] = g(null), [$, L] = g({}), y = re(
    () => new Se(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      s?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, s]
  ), F = S(
    async (m) => {
      c(!0), f(null), L(m || {});
      try {
        const i = await y.listUsers(m);
        return n(i.users), p(i.total), i;
      } catch (i) {
        const l = i instanceof Error ? i : new Error("Failed to list users");
        throw f(l), l;
      } finally {
        c(!1);
      }
    },
    [y]
  ), A = S(
    async (m) => {
      c(!0), f(null);
      try {
        return await y.getUser(m);
      } catch (i) {
        const l = i instanceof Error ? i : new Error("Failed to get user");
        throw f(l), l;
      } finally {
        c(!1);
      }
    },
    [y]
  ), U = S(
    async (m, i) => {
      c(!0), f(null);
      try {
        await y.setSystemAdmin(m, i), n(
          (l) => l.map((v) => v.id === m ? { ...v, isSystemAdmin: i } : v)
        );
      } catch (l) {
        const v = l instanceof Error ? l : new Error("Failed to update admin status");
        throw f(v), v;
      } finally {
        c(!1);
      }
    },
    [y]
  ), R = S(
    async (m, i) => {
      c(!0), f(null);
      try {
        const l = await y.updateUser(m, i);
        return n((v) => v.map((q) => q.id === m ? l : q)), l;
      } catch (l) {
        const v = l instanceof Error ? l : new Error("Failed to update user");
        throw f(v), v;
      } finally {
        c(!1);
      }
    },
    [y]
  ), w = S(
    async (m) => {
      c(!0), f(null);
      try {
        await y.deleteUser(m), n((i) => i.filter((l) => l.id !== m)), p((i) => i - 1);
      } catch (i) {
        const l = i instanceof Error ? i : new Error("Failed to delete user");
        throw f(l), l;
      } finally {
        c(!1);
      }
    },
    [y]
  ), N = S(
    async (m) => {
      c(!0), f(null);
      try {
        await y.forcePasswordReset(m);
      } catch (i) {
        const l = i instanceof Error ? i : new Error("Failed to send password reset");
        throw f(l), l;
      } finally {
        c(!1);
      }
    },
    [y]
  ), C = S(
    async (m, i, l) => {
      c(!0), f(null);
      try {
        await y.adjustCredits(m, { amount: i, reason: l });
      } catch (v) {
        const q = v instanceof Error ? v : new Error("Failed to adjust credits");
        throw f(q), q;
      } finally {
        c(!1);
      }
    },
    [y]
  ), P = S(
    async (m, i) => {
      c(!0), f(null);
      try {
        return await y.getUserDeposits(m, i);
      } catch (l) {
        const v = l instanceof Error ? l : new Error("Failed to get user deposits");
        throw f(v), v;
      } finally {
        c(!1);
      }
    },
    [y]
  ), _ = S(
    async (m, i) => {
      c(!0), f(null);
      try {
        return await y.getUserCredits(m, i);
      } catch (l) {
        const v = l instanceof Error ? l : new Error("Failed to get user credits");
        throw f(v), v;
      } finally {
        c(!1);
      }
    },
    [y]
  ), O = S(
    async (m, i) => {
      c(!0), f(null);
      try {
        return await y.getUserWithdrawalHistory(m, i);
      } catch (l) {
        const v = l instanceof Error ? l : new Error("Failed to get user withdrawal history");
        throw f(v), v;
      } finally {
        c(!1);
      }
    },
    [y]
  ), x = S(
    async (m, i) => {
      c(!0), f(null);
      try {
        return await y.getUserChats(m, i);
      } catch (l) {
        const v = l instanceof Error ? l : new Error("Failed to get user chat history");
        throw f(v), v;
      } finally {
        c(!1);
      }
    },
    [y]
  ), M = S(
    async (m, i) => {
      c(!0), f(null);
      try {
        return await y.getUserReferrals(m, i);
      } catch (l) {
        const v = l instanceof Error ? l : new Error("Failed to get user referrals");
        throw f(v), v;
      } finally {
        c(!1);
      }
    },
    [y]
  ), K = S(async () => {
    c(!0), f(null);
    try {
      return await y.getStats();
    } catch (m) {
      const i = m instanceof Error ? m : new Error("Failed to get user stats");
      throw f(i), i;
    } finally {
      c(!1);
    }
  }, [y]), u = S(async () => {
    await F($);
  }, [F, $]), k = S(() => {
    f(null);
  }, []);
  return {
    users: a,
    total: o,
    isLoading: b,
    error: d,
    listUsers: F,
    getUser: A,
    setSystemAdmin: U,
    updateUser: R,
    deleteUser: w,
    forcePasswordReset: N,
    adjustCredits: C,
    getUserDeposits: P,
    getUserCredits: _,
    getUserWithdrawalHistory: O,
    getUserChats: x,
    getUserReferrals: M,
    getStats: K,
    refresh: u,
    clearError: k
  };
}
function we(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function et(t) {
  return t.length <= 12 ? t : `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function tt(t) {
  return t == null ? "-" : (t / 1e9).toFixed(4);
}
function St({
  pageSize: t = 20,
  refreshInterval: s = 0,
  currentUserId: a,
  className: n = "",
  onLoad: o,
  onUserClick: p
}) {
  const { users: b, total: c, isLoading: d, error: f, listUsers: $, clearError: L } = be(), [y, F] = g(0), [A, U] = g(null), [R, w] = g("createdAt"), [N, C] = g("desc"), P = (u) => {
    R === u ? C(N === "asc" ? "desc" : "asc") : (w(u), C("desc"));
  }, _ = re(() => [...b].sort((u, k) => {
    let m, i;
    switch (R) {
      case "name":
        m = (u.name || u.email || "").toLowerCase(), i = (k.name || k.email || "").toLowerCase();
        break;
      case "createdAt":
        m = new Date(u.createdAt).getTime(), i = new Date(k.createdAt).getTime();
        break;
      case "lastLoginAt":
        m = u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0, i = k.lastLoginAt ? new Date(k.lastLoginAt).getTime() : 0;
        break;
      case "balanceLamports":
        m = u.balanceLamports ?? 0, i = k.balanceLamports ?? 0;
        break;
      default:
        return 0;
    }
    return m < i ? N === "asc" ? -1 : 1 : m > i ? N === "asc" ? 1 : -1 : 0;
  }), [b, R, N]), O = S(async () => {
    try {
      const u = await $({ limit: t, offset: y });
      o?.(u), U(null);
    } catch (u) {
      U(u instanceof Error ? u.message : "Failed to load users");
    }
  }, [t, y, $, o]);
  I(() => {
    F(0);
  }, [t]), I(() => {
    O();
  }, [O]), I(() => {
    if (s <= 0) return;
    const u = setInterval(O, s);
    return () => clearInterval(u);
  }, [s, O]);
  const x = Math.ceil(c / t), M = Math.floor(y / t) + 1, K = (u) => {
    const k = (u - 1) * t;
    F(Math.max(0, Math.min(k, Math.max(0, c - 1))));
  };
  return A || f ? /* @__PURE__ */ r("div", { className: `cedros-admin-user-list cedros-admin-user-list-error ${n}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: A || f?.message }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          L(), U(null), O();
        },
        children: "Retry"
      }
    )
  ] }) : d && b.length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-admin-user-list cedros-admin-user-list-loading ${n}`, children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading users..." })
  ] }) : /* @__PURE__ */ r("div", { className: `cedros-admin-user-list ${n}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-user-list-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-user-list-title", children: "All Users" }),
      /* @__PURE__ */ r("div", { className: "cedros-admin-user-list-actions", children: [
        /* @__PURE__ */ r("span", { className: "cedros-admin-queue-count", children: [
          c,
          " user",
          c !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: O,
            disabled: d,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: d ? "..." : "↻"
          }
        )
      ] })
    ] }),
    b.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No users found." }) }) : /* @__PURE__ */ r(V, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-user-table", children: [
        /* @__PURE__ */ r("div", { className: "cedros-admin-user-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${R === "name" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => P("name"),
              "aria-label": "Sort by user",
              children: [
                "User",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: R === "name" ? N === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${R === "createdAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => P("createdAt"),
              "aria-label": "Sort by registered date",
              children: [
                "Registered",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: R === "createdAt" ? N === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${R === "lastLoginAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => P("lastLoginAt"),
              "aria-label": "Sort by last login",
              children: [
                "Last Login",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: R === "lastLoginAt" ? N === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${R === "balanceLamports" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => P("balanceLamports"),
              "aria-label": "Sort by balance",
              children: [
                "Balance",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: R === "balanceLamports" ? N === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) })
        ] }),
        _.map((u) => {
          const k = u.id === a;
          return /* @__PURE__ */ r(
            "div",
            {
              className: `cedros-admin-user-row ${k ? "cedros-admin-user-row-current" : ""}`,
              onClick: () => p?.(u),
              onKeyDown: (m) => {
                (m.key === "Enter" || m.key === " ") && (m.preventDefault(), p?.(u));
              },
              role: p ? "button" : void 0,
              tabIndex: p ? 0 : void 0,
              children: [
                /* @__PURE__ */ r("div", { className: "cedros-admin-user-td cedros-admin-user-info", children: [
                  /* @__PURE__ */ e("div", { className: "cedros-admin-user-avatar", children: u.picture ? /* @__PURE__ */ e(
                    "img",
                    {
                      src: u.picture,
                      alt: u.name || u.email || "User",
                      className: "cedros-admin-user-avatar-img",
                      referrerPolicy: "no-referrer"
                    }
                  ) : /* @__PURE__ */ e("span", { className: "cedros-admin-user-avatar-placeholder", children: (u.name?.[0] || u.email?.[0] || "?").toUpperCase() }) }),
                  /* @__PURE__ */ r("div", { className: "cedros-admin-user-details", children: [
                    /* @__PURE__ */ r("span", { className: "cedros-admin-user-name", children: [
                      u.name || "Unknown",
                      k && /* @__PURE__ */ e("span", { className: "cedros-admin-user-you", children: "(you)" })
                    ] }),
                    /* @__PURE__ */ e("span", { className: "cedros-admin-user-email", title: u.email, children: u.email || et(u.id) })
                  ] })
                ] }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td", children: we(u.createdAt) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td", children: u.lastLoginAt ? we(u.lastLoginAt) : "-" }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-user-td", children: tt(u.balanceLamports) })
              ]
            },
            u.id
          );
        })
      ] }),
      x > 1 && /* @__PURE__ */ r("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => K(M - 1),
            disabled: M <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ r("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          M,
          " of ",
          x,
          " (",
          c,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => K(M + 1),
            disabled: M >= x,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function pe(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function j(t) {
  return new Date(t).toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function st(t) {
  return t == null ? "—" : `${(t / 1e9).toFixed(4)} SOL`;
}
function se(t) {
  return t == null ? "—" : (t / 1e9).toFixed(4);
}
function rt(t) {
  return {
    DEPOSIT: "Deposit",
    SPEND: "Spend",
    ADJUSTMENT: "Adjustment",
    REFUND: "Refund"
  }[t.toUpperCase()] || t;
}
function at(t, s) {
  return s ? {
    deposit: "Credit deposit",
    purchase: "Purchase",
    api_call: "API usage",
    subscription: "Subscription",
    refund: "Refund",
    bonus: "Bonus credit",
    promo: "Promotional credit",
    correction: "Balance correction"
  }[s.toLowerCase()] || s : {
    DEPOSIT: "Credit added",
    SPEND: "Credit used",
    ADJUSTMENT: "Manual adjustment",
    REFUND: "Credit refunded"
  }[t.toUpperCase()] || "—";
}
function ae({ currentPage: t, totalPages: s, total: a, onPageChange: n }) {
  return /* @__PURE__ */ r("div", { className: "cedros-admin-pagination", children: [
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: () => n(t - 1),
        disabled: t <= 1,
        children: "Previous"
      }
    ),
    /* @__PURE__ */ r("span", { className: "cedros-admin-page-info", children: [
      "Page ",
      t,
      " of ",
      s,
      " (",
      a,
      " total)"
    ] }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: () => n(t + 1),
        disabled: t >= s,
        children: "Next"
      }
    )
  ] });
}
function nt({
  deposits: t,
  total: s,
  currentPage: a,
  totalPages: n,
  onPageChange: o,
  isLoading: p,
  error: b,
  onRetry: c
}) {
  return b ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: b }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : p && t.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading deposits..." })
  ] }) : s === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No deposits found." }) : /* @__PURE__ */ r(V, { children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Amount" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Status" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Transaction" })
      ] }),
      t.map((d) => /* @__PURE__ */ r("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: j(d.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: st(d.amountLamports) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e("span", { className: `cedros-admin-status-badge cedros-admin-status-${d.status}`, children: d.status }) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td cedros-admin-list-td-actions", children: d.txSignature ? /* @__PURE__ */ r(V, { children: [
          /* @__PURE__ */ r("span", { className: "cedros-admin-list-td-mono", title: d.txSignature, children: [
            d.txSignature.slice(0, 8),
            "..."
          ] }),
          /* @__PURE__ */ e(
            "a",
            {
              href: `https://orbmarkets.io/tx/${d.txSignature}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "cedros-admin-icon-link",
              title: "View on Orbmarkets",
              "aria-label": "View transaction on Orbmarkets",
              children: "↗"
            }
          )
        ] }) : /* @__PURE__ */ e("span", { className: "cedros-admin-list-td-muted", children: "—" }) })
      ] }, d.id))
    ] }),
    n > 1 && /* @__PURE__ */ e(
      ae,
      {
        currentPage: a,
        totalPages: n,
        total: s,
        onPageChange: o
      }
    )
  ] });
}
function it({
  transactions: t,
  total: s,
  currentPage: a,
  totalPages: n,
  onPageChange: o,
  isLoading: p,
  error: b,
  onRetry: c
}) {
  return b ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: b }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : p && t.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading transactions..." })
  ] }) : s === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No credit transactions found." }) : /* @__PURE__ */ r(V, { children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Type" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Description" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Amount" })
      ] }),
      t.map((d) => /* @__PURE__ */ r("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: j(d.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-tx-type cedros-admin-tx-type-${d.txType.toLowerCase()}`,
            children: rt(d.txType)
          }
        ) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: at(d.txType, d.referenceType) }),
        /* @__PURE__ */ r(
          "div",
          {
            className: `cedros-admin-list-td ${d.amountLamports >= 0 ? "cedros-admin-amount-positive" : "cedros-admin-amount-negative"}`,
            children: [
              d.amountLamports >= 0 ? "+" : "",
              se(d.amountLamports)
            ]
          }
        )
      ] }, d.id))
    ] }),
    n > 1 && /* @__PURE__ */ e(
      ae,
      {
        currentPage: a,
        totalPages: n,
        total: s,
        onPageChange: o
      }
    )
  ] });
}
function ct({
  sessions: t,
  total: s,
  currentPage: a,
  totalPages: n,
  onPageChange: o,
  isLoading: p,
  error: b,
  onRetry: c
}) {
  return b ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: b }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : p && t.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading chat history..." })
  ] }) : s === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No chat sessions found." }) : /* @__PURE__ */ r(V, { children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Session" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Messages" })
      ] }),
      t.map((d) => /* @__PURE__ */ r("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: j(d.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: d.title || `Chat ${d.id.slice(0, 8)}...` }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: d.messageCount })
      ] }, d.id))
    ] }),
    n > 1 && /* @__PURE__ */ e(
      ae,
      {
        currentPage: a,
        totalPages: n,
        total: s,
        onPageChange: o
      }
    )
  ] });
}
function ot({
  referrals: t,
  total: s,
  currentPage: a,
  totalPages: n,
  onPageChange: o,
  isLoading: p,
  error: b,
  onRetry: c
}) {
  return b ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: b }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : p && t.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading referrals..." })
  ] }) : s === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No referred users found." }) : /* @__PURE__ */ r(V, { children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Name" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Email" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Joined" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Last Login" })
      ] }),
      t.map((d) => /* @__PURE__ */ r("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: d.name || "—" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: d.email || "—" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: pe(d.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: d.lastLoginAt ? j(d.lastLoginAt) : "—" })
      ] }, d.id))
    ] }),
    n > 1 && /* @__PURE__ */ e(
      ae,
      {
        currentPage: a,
        totalPages: n,
        total: s,
        onPageChange: o
      }
    )
  ] });
}
const dt = [
  { value: "none", label: "None (reset)" },
  { value: "verified", label: "Verified" },
  { value: "failed", label: "Failed" }
];
function lt({
  kycData: t,
  userKycStatus: s,
  userKycVerifiedAt: a,
  userKycExpiresAt: n,
  error: o,
  onRetry: p,
  onOverride: b
}) {
  const [c, d] = g("none"), [f, $] = g(!1), [L, y] = g(null), F = t?.status ?? s ?? "none", A = t?.verifiedAt ?? a, U = t?.expiresAt ?? n, R = async () => {
    if (window.confirm(
      `Override KYC status to "${c}" for this user?`
    )) {
      $(!0), y(null);
      try {
        await b(c);
      } catch (N) {
        y(N instanceof Error ? N.message : "Override failed");
      } finally {
        $(!1);
      }
    }
  };
  return o ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: o }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: p,
        children: "Retry"
      }
    )
  ] }) : !t && !s ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading KYC data..." })
  ] }) : /* @__PURE__ */ r("div", { className: "cedros-kyc-admin-tab", children: [
    /* @__PURE__ */ r("div", { className: "cedros-kyc-admin-tab-summary", children: [
      /* @__PURE__ */ r("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Status" }),
        /* @__PURE__ */ e("span", { className: `cedros-admin-status-badge cedros-kyc-status-${F}`, children: F })
      ] }),
      A && /* @__PURE__ */ r("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Verified at" }),
        /* @__PURE__ */ e("span", { children: j(A) })
      ] }),
      U && /* @__PURE__ */ r("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Expires at" }),
        /* @__PURE__ */ e("span", { children: j(U) })
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-kyc-admin-override", children: [
      /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-override-label", children: "Override status" }),
      /* @__PURE__ */ e(
        "select",
        {
          className: "cedros-kyc-admin-override-select",
          value: c,
          onChange: (w) => d(w.target.value),
          disabled: f,
          "aria-label": "Select KYC override status",
          children: dt.map((w) => /* @__PURE__ */ e("option", { value: w.value, children: w.label }, w.value))
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: R,
          disabled: f,
          children: f ? "Saving..." : "Apply Override"
        }
      ),
      L && /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: L })
    ] }),
    t && t.sessions.length > 0 ? /* @__PURE__ */ r("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Provider" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Status" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Error" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Completed" })
      ] }),
      t.sessions.map((w) => /* @__PURE__ */ r("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: j(w.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: w.provider }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-status-badge cedros-kyc-status-${w.status}`,
            children: w.status
          }
        ) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td cedros-admin-list-td-muted", children: w.errorCode ? `${w.errorCode}${w.errorReason ? `: ${w.errorReason}` : ""}` : "—" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: w.completedAt ? j(w.completedAt) : "—" })
      ] }, w.id))
    ] }) : t && /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No verification sessions found." })
  ] });
}
const mt = [
  { value: "none", label: "None (reset)" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" }
];
function ut({
  accreditationData: t,
  userAccreditationStatus: s,
  userAccreditationVerifiedAt: a,
  userAccreditationExpiresAt: n,
  error: o,
  onRetry: p,
  onOverride: b,
  onReview: c
}) {
  const [d, f] = g("none"), [$, L] = g(!1), [y, F] = g(null), [A, U] = g(null), [R, w] = g(""), [N, C] = g(""), [P, _] = g(!1), [O, x] = g(null), M = t?.status ?? s ?? "none", K = t?.verifiedAt ?? a, u = t?.expiresAt ?? n, k = async () => {
    if (window.confirm(
      `Override accreditation status to "${d}" for this user?`
    )) {
      L(!0), F(null);
      try {
        await b(d);
      } catch (l) {
        F(l instanceof Error ? l.message : "Override failed");
      } finally {
        L(!1);
      }
    }
  }, m = async (i, l) => {
    const v = l ? "approve" : "reject";
    if (window.confirm(
      `${v.charAt(0).toUpperCase() + v.slice(1)} this submission?`
    )) {
      _(!0), x(null);
      try {
        await c(
          i,
          l,
          R || void 0,
          l ? void 0 : N || void 0
        ), U(null), w(""), C("");
      } catch (Y) {
        x(Y instanceof Error ? Y.message : "Review failed");
      } finally {
        _(!1);
      }
    }
  };
  return o ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: o }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: p,
        children: "Retry"
      }
    )
  ] }) : !t && !s ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading accreditation data..." })
  ] }) : /* @__PURE__ */ r("div", { className: "cedros-accreditation-admin-tab", children: [
    /* @__PURE__ */ r("div", { className: "cedros-kyc-admin-tab-summary", children: [
      /* @__PURE__ */ r("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Status" }),
        /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-status-badge cedros-accreditation-status-${M}`,
            children: M
          }
        )
      ] }),
      K && /* @__PURE__ */ r("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Verified at" }),
        /* @__PURE__ */ e("span", { children: j(K) })
      ] }),
      u && /* @__PURE__ */ r("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Expires at" }),
        /* @__PURE__ */ e("span", { children: j(u) })
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-kyc-admin-override", children: [
      /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-override-label", children: "Override status" }),
      /* @__PURE__ */ e(
        "select",
        {
          className: "cedros-kyc-admin-override-select",
          value: d,
          onChange: (i) => f(i.target.value),
          disabled: $,
          "aria-label": "Select accreditation override status",
          children: mt.map((i) => /* @__PURE__ */ e("option", { value: i.value, children: i.label }, i.value))
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: k,
          disabled: $,
          children: $ ? "Saving..." : "Apply Override"
        }
      ),
      y && /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: y })
    ] }),
    t && t.submissions.length > 0 ? /* @__PURE__ */ r(V, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-list-table", children: [
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Method" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Status" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Expires" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Actions" })
        ] }),
        t.submissions.map((i) => /* @__PURE__ */ r("div", { className: "cedros-admin-list-row", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: j(i.createdAt) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: i.method.replace(/_/g, " ") }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e(
            "span",
            {
              className: `cedros-admin-status-badge cedros-accreditation-status-${i.status}`,
              children: i.status
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: i.expiresAt ? j(i.expiresAt) : "—" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td cedros-admin-list-td-actions", children: i.status === "pending" && /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-sm",
              onClick: () => U(A === i.id ? null : i.id),
              children: "Review"
            }
          ) })
        ] }, i.id))
      ] }),
      A && /* @__PURE__ */ r("div", { className: "cedros-accreditation-review-panel", children: [
        /* @__PURE__ */ e("p", { className: "cedros-accreditation-review-title", children: "Review submission" }),
        /* @__PURE__ */ e("label", { className: "cedros-kyc-admin-tab-label", htmlFor: "review-notes", children: "Reviewer notes (internal)" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "review-notes",
            type: "text",
            className: "cedros-input cedros-input-sm",
            value: R,
            onChange: (i) => w(i.target.value),
            placeholder: "Optional internal notes",
            disabled: P
          }
        ),
        /* @__PURE__ */ e("label", { className: "cedros-kyc-admin-tab-label", htmlFor: "review-rejection", children: "Rejection reason (shown to user if rejected)" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "review-rejection",
            type: "text",
            className: "cedros-input cedros-input-sm",
            value: N,
            onChange: (i) => C(i.target.value),
            placeholder: "Required when rejecting",
            disabled: P
          }
        ),
        /* @__PURE__ */ r("div", { className: "cedros-accreditation-review-actions", children: [
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-sm",
              onClick: () => m(A, !0),
              disabled: P,
              children: P ? "Saving..." : "Approve"
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-btn-danger",
              onClick: () => m(A, !1),
              disabled: P || !N.trim(),
              children: P ? "Saving..." : "Reject"
            }
          )
        ] }),
        O && /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: O })
      ] })
    ] }) : t && /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No accreditation submissions found." })
  ] });
}
function ht({ user: t, isCurrentUser: s }) {
  return /* @__PURE__ */ r("div", { className: "cedros-admin-user-detail-info", children: [
    /* @__PURE__ */ e("div", { className: "cedros-admin-user-detail-avatar", children: t.picture ? /* @__PURE__ */ e(
      "img",
      {
        src: t.picture,
        alt: t.name || t.email || "User",
        className: "cedros-admin-user-detail-avatar-img",
        referrerPolicy: "no-referrer"
      }
    ) : /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-avatar-placeholder", children: (t.name?.[0] || t.email?.[0] || "?").toUpperCase() }) }),
    /* @__PURE__ */ r("div", { className: "cedros-admin-user-detail-meta", children: [
      /* @__PURE__ */ r("h2", { className: "cedros-admin-user-detail-name", children: [
        t.name || "Unknown",
        s && /* @__PURE__ */ e("span", { className: "cedros-admin-user-you", children: "(you)" })
      ] }),
      /* @__PURE__ */ r("p", { className: "cedros-admin-user-detail-email", children: [
        t.email || "No email",
        t.emailVerified && /* @__PURE__ */ e("span", { className: "cedros-admin-verified-badge", title: "Email verified", children: "Verified" })
      ] }),
      t.isSystemAdmin && /* @__PURE__ */ e("div", { className: "cedros-admin-user-detail-badges", children: /* @__PURE__ */ e("span", { className: "cedros-admin-admin-badge cedros-admin-admin-badge-yes", children: "System Admin" }) }),
      /* @__PURE__ */ r("div", { className: "cedros-admin-user-detail-methods", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-methods-label", children: "Auth Methods:" }),
        t.authMethods.length > 0 ? t.authMethods.map((a) => /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-auth-badge cedros-admin-auth-badge-${a}`,
            children: a
          },
          a
        )) : /* @__PURE__ */ e("span", { className: "cedros-admin-auth-badge cedros-admin-auth-badge-none", children: "none" })
      ] }),
      /* @__PURE__ */ r("p", { className: "cedros-admin-user-detail-dates", children: [
        "Registered: ",
        pe(t.createdAt),
        " | Updated: ",
        pe(t.updatedAt)
      ] }),
      t.referralCode && /* @__PURE__ */ r("div", { className: "cedros-admin-user-detail-referral", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-referral-label", children: "Referral:" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-referral-code", children: t.referralCode }),
        t.referralCount !== void 0 && t.referralCount > 0 && /* @__PURE__ */ r("span", { className: "cedros-admin-user-detail-referral-count", children: [
          "(",
          t.referralCount,
          " referred)"
        ] }),
        t.referredBy && /* @__PURE__ */ r("span", { className: "cedros-admin-user-detail-referred-by", children: [
          "Referred by:",
          " ",
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-admin-user-uuid-link",
              onClick: () => navigator.clipboard?.writeText(t.referredBy),
              title: "Click to copy referrer UUID",
              children: t.referredBy
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function ft({ credits: t, creditsError: s, onRetry: a }) {
  return s ? /* @__PURE__ */ r("div", { className: "cedros-admin-stats-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: s }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: a,
        children: "Retry"
      }
    )
  ] }) : t ? /* @__PURE__ */ r("div", { className: "cedros-admin-user-detail-stats", children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-stat-card", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Credit Balance" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: se(t.stats.currentBalanceLamports) })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-admin-stat-card", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Total Credited" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: se(t.stats.totalDepositedLamports) })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-admin-stat-card", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Total Spent" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: se(t.stats.totalSpentLamports) })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-admin-stat-card", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Deposits" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: t.stats.depositCount })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-admin-stat-card", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Transactions" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: t.stats.spendCount })
    ] })
  ] }) : /* @__PURE__ */ r("div", { className: "cedros-admin-stats-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading credit stats..." })
  ] });
}
function yt({
  activeTab: t,
  onTabChange: s,
  cedrosPayEnabled: a,
  user: n,
  deposits: o,
  credits: p,
  chats: b,
  referrals: c,
  kycData: d,
  accreditationData: f,
  depositsError: $,
  creditsError: L,
  chatsError: y,
  referralsError: F,
  kycError: A,
  accreditationError: U,
  depositsCurrentPage: R,
  depositsTotalPages: w,
  onDepositsPageChange: N,
  transactionsCurrentPage: C,
  transactionsTotalPages: P,
  onTransactionsPageChange: _,
  chatsCurrentPage: O,
  chatsTotalPages: x,
  onChatsPageChange: M,
  referralsCurrentPage: K,
  referralsTotalPages: u,
  onReferralsPageChange: k,
  isLoading: m,
  onRetryDeposits: i,
  onRetryCredits: l,
  onRetryChats: v,
  onRetryReferrals: q,
  onRetryKyc: Y,
  onRetryAccreditation: ne,
  onKycOverride: G,
  onAccreditationOverride: H,
  onAccreditationReview: Q
}) {
  return /* @__PURE__ */ r(V, { children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-user-detail-tabs", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${t === "deposits" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => s("deposits"),
          children: [
            "Deposits (",
            o?.total ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${t === "transactions" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => s("transactions"),
          children: [
            "Credits (",
            p?.totalTransactions ?? 0,
            ")"
          ]
        }
      ),
      a && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${t === "chats" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => s("chats"),
          children: [
            "Chats (",
            b?.total ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${t === "referrals" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => s("referrals"),
          children: [
            "Referrals (",
            c?.total ?? n.referralCount ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${t === "kyc" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => s("kyc"),
          children: [
            "KYC (",
            d?.totalSessions ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${t === "accreditation" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => s("accreditation"),
          children: [
            "Accreditation (",
            f?.totalSubmissions ?? 0,
            ")"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-admin-user-detail-content", children: [
      t === "deposits" && /* @__PURE__ */ e(
        nt,
        {
          deposits: o?.deposits ?? [],
          total: o?.total ?? 0,
          currentPage: R,
          totalPages: w,
          onPageChange: N,
          isLoading: m,
          error: $,
          onRetry: i
        }
      ),
      t === "transactions" && /* @__PURE__ */ e(
        it,
        {
          transactions: p?.transactions ?? [],
          total: p?.totalTransactions ?? 0,
          currentPage: C,
          totalPages: P,
          onPageChange: _,
          error: L,
          onRetry: l,
          isLoading: m
        }
      ),
      t === "chats" && a && /* @__PURE__ */ e(
        ct,
        {
          sessions: b?.sessions ?? [],
          total: b?.total ?? 0,
          currentPage: O,
          totalPages: x,
          onPageChange: M,
          error: y,
          onRetry: v,
          isLoading: m
        }
      ),
      t === "referrals" && /* @__PURE__ */ e(
        ot,
        {
          referrals: c?.users ?? [],
          total: c?.total ?? 0,
          currentPage: K,
          totalPages: u,
          onPageChange: k,
          error: F,
          onRetry: q,
          isLoading: m
        }
      ),
      t === "kyc" && /* @__PURE__ */ e(
        lt,
        {
          kycData: d,
          userKycStatus: n.kycStatus,
          userKycVerifiedAt: n.kycVerifiedAt,
          userKycExpiresAt: n.kycExpiresAt,
          error: A,
          onRetry: Y,
          onOverride: G
        }
      ),
      t === "accreditation" && /* @__PURE__ */ e(
        ut,
        {
          accreditationData: f,
          userAccreditationStatus: n.accreditationStatus,
          userAccreditationVerifiedAt: n.accreditationVerifiedAt,
          userAccreditationExpiresAt: n.accreditationExpiresAt,
          error: U,
          onRetry: ne,
          onOverride: H,
          onReview: Q
        }
      )
    ] })
  ] });
}
function At({
  userId: t,
  onBack: s,
  currentUserId: a,
  onEditUser: n,
  onAdjustCredits: o,
  cedrosPayEnabled: p = !1,
  className: b = ""
}) {
  const { config: c, _internal: d } = Ce(), {
    isLoading: f,
    getUser: $,
    getUserDeposits: L,
    getUserCredits: y,
    getUserChats: F,
    getUserReferrals: A,
    deleteUser: U,
    forcePasswordReset: R,
    clearError: w
  } = be(), N = re(
    () => new Se(
      c.serverUrl,
      c.requestTimeout,
      c.retryAttempts,
      d?.getAccessToken
    ),
    [c.serverUrl, c.requestTimeout, c.retryAttempts, d]
  ), [C, P] = g(null), [_, O] = g(null), [x, M] = g(null), [K, u] = g(null), [k, m] = g(null), [i, l] = g(null), [v, q] = g(null), [Y, ne] = g("deposits"), [G, H] = g(null), [Q, X] = g(null), [Ae, ie] = g(null), [Ee, ce] = g(null), [Ue, oe] = g(null), [Re, Z] = g(null), [ke, J] = g(null), [z, ee] = g(!1), [de, $e] = g(0), [le, Fe] = g(0), [me, Le] = g(0), [ue, Pe] = g(0), D = 10, he = S(async () => {
    try {
      const h = await $(t);
      P(h), H(null);
    } catch (h) {
      H(h instanceof Error ? h.message : "Failed to load user");
    }
  }, [t, $]), fe = S(async () => {
    try {
      const T = await L(t, { limit: D, offset: de });
      M(T), ie(null);
    } catch (h) {
      ie(h instanceof Error ? h.message : "Failed to load deposits");
    }
  }, [t, L, de]), te = S(async () => {
    try {
      const T = await y(t, { limit: D, offset: le });
      O(T), X(null);
    } catch (h) {
      X(h instanceof Error ? h.message : "Failed to load credits");
    }
  }, [t, y, le]), ye = S(async () => {
    if (p)
      try {
        const T = await F(t, { limit: D, offset: me });
        u(T), ce(null);
      } catch (h) {
        ce(h instanceof Error ? h.message : "Failed to load chat history");
      }
  }, [t, F, me, p]), ge = S(async () => {
    try {
      const T = await A(t, { limit: D, offset: ue });
      m(T), oe(null);
    } catch (h) {
      oe(h instanceof Error ? h.message : "Failed to load referrals");
    }
  }, [t, A, ue]), W = S(async () => {
    try {
      const h = await N.getUserKyc(t);
      l(h), Z(null);
    } catch (h) {
      Z(h instanceof Error ? h.message : "Failed to load KYC data");
    }
  }, [t, N]), B = S(async () => {
    try {
      const h = await N.getUserAccreditation(t);
      q(h), J(null);
    } catch (h) {
      J(
        h instanceof Error ? h.message : "Failed to load accreditation data"
      );
    }
  }, [t, N]), De = S(
    async (h) => {
      try {
        await N.overrideAccreditationStatus(t, h), await B();
      } catch (T) {
        J(
          T instanceof Error ? T.message : "Failed to override accreditation status"
        );
      }
    },
    [t, N, B]
  ), Oe = S(
    async (h, T, Qe, Xe) => {
      try {
        await N.reviewAccreditation(
          h,
          T,
          Qe,
          Xe
        ), await B();
      } catch (Ne) {
        J(
          Ne instanceof Error ? Ne.message : "Failed to review accreditation submission"
        );
      }
    },
    [N, B]
  ), Te = S(
    async (h) => {
      try {
        await N.overrideUserKyc(t, h), await W();
      } catch (T) {
        Z(T instanceof Error ? T.message : "Failed to override KYC status");
      }
    },
    [t, N, W]
  );
  I(() => {
    he(), fe(), te(), ge(), W(), B(), p && ye();
  }, [he, fe, te, ye, ge, W, B, p]);
  const xe = async () => {
    if (!C) return;
    if (C.id === a) {
      alert("You cannot delete your own account");
      return;
    }
    if (C.isSystemAdmin) {
      alert("Cannot delete a system admin. Remove admin status first.");
      return;
    }
    if (window.confirm(
      `Are you sure you want to delete ${C.name || C.email || "this user"}? This action cannot be undone.`
    )) {
      ee(!0);
      try {
        await U(C.id), s();
      } catch {
      } finally {
        ee(!1);
      }
    }
  }, Me = async () => {
    if (!C?.email) {
      alert("User has no email address");
      return;
    }
    if (window.confirm(`Send a password reset email to ${C.email}?`)) {
      ee(!0);
      try {
        await R(C.id), alert("Password reset email sent");
      } catch {
      } finally {
        ee(!1);
      }
    }
  }, _e = x ? Math.ceil(x.total / D) : 0, Ke = Math.floor(de / D) + 1, je = _ ? Math.ceil(_.totalTransactions / D) : 0, qe = Math.floor(le / D) + 1, Ve = K ? Math.ceil(K.total / D) : 0, Be = Math.floor(me / D) + 1, Ye = k ? Math.ceil(k.total / D) : 0, Ie = Math.floor(ue / D) + 1, He = (h) => $e((h - 1) * D), Je = (h) => Fe((h - 1) * D), We = (h) => Le((h - 1) * D), Ge = (h) => Pe((h - 1) * D);
  if (G)
    return /* @__PURE__ */ r("div", { className: `cedros-admin-user-detail cedros-admin-user-detail-error ${b}`, children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: s,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: G }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline",
          onClick: () => {
            w(), H(null), he();
          },
          children: "Retry"
        }
      )
    ] });
  if (f && !C)
    return /* @__PURE__ */ r("div", { className: `cedros-admin-user-detail cedros-admin-user-detail-loading ${b}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading user..." })
    ] });
  if (!C)
    return /* @__PURE__ */ r("div", { className: `cedros-admin-user-detail ${b}`, children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: s,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "User not found." })
    ] });
  const ve = C.id === a;
  return /* @__PURE__ */ r("div", { className: `cedros-admin-user-detail ${b}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-user-detail-header", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-back-btn",
          onClick: s,
          children: "Back to Users"
        }
      ),
      /* @__PURE__ */ r("div", { className: "cedros-admin-user-detail-actions", children: [
        n && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => n(C),
            disabled: z,
            children: "Edit"
          }
        ),
        C.email && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: Me,
            disabled: z,
            children: "Reset Password"
          }
        ),
        o && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => o(C),
            disabled: z,
            children: "Adjust Credits"
          }
        ),
        !ve && !C.isSystemAdmin && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-btn-danger",
            onClick: xe,
            disabled: z,
            children: "Delete"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e(ht, { user: C, isCurrentUser: ve }),
    /* @__PURE__ */ e(
      ft,
      {
        credits: _,
        creditsError: Q,
        onRetry: () => {
          X(null), te();
        }
      }
    ),
    /* @__PURE__ */ e(
      yt,
      {
        activeTab: Y,
        onTabChange: ne,
        cedrosPayEnabled: p,
        user: C,
        deposits: x,
        credits: _,
        chats: K,
        referrals: k,
        kycData: i,
        accreditationData: v,
        depositsError: Ae,
        creditsError: Q,
        chatsError: Ee,
        referralsError: Ue,
        kycError: Re,
        accreditationError: ke,
        depositsCurrentPage: Ke,
        depositsTotalPages: _e,
        onDepositsPageChange: He,
        transactionsCurrentPage: qe,
        transactionsTotalPages: je,
        onTransactionsPageChange: Je,
        chatsCurrentPage: Be,
        chatsTotalPages: Ve,
        onChatsPageChange: We,
        referralsCurrentPage: Ie,
        referralsTotalPages: Ye,
        onReferralsPageChange: Ge,
        isLoading: f,
        onRetryDeposits: () => {
          ie(null), fe();
        },
        onRetryCredits: () => {
          X(null), te();
        },
        onRetryChats: () => {
          ce(null), ye();
        },
        onRetryReferrals: () => {
          oe(null), ge();
        },
        onRetryKyc: () => {
          Z(null), W();
        },
        onRetryAccreditation: () => {
          J(null), B();
        },
        onKycOverride: Te,
        onAccreditationOverride: De,
        onAccreditationReview: Oe
      }
    )
  ] });
}
const gt = ["email", "google", "apple", "solana", "webauthn", "sso"], pt = {
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
function Et() {
  const { getStats: t } = be(), { fetchSettings: s, getValue: a } = Ze(), [n, o] = g(null), [p, b] = g(!1), [c, d] = g(null), [f, $] = g(!1);
  I(() => {
    f || (s(), $(!0));
  }, [s, f]);
  const L = S(
    (A) => {
      const U = a(A);
      return U === void 0 ? !1 : U === "true" || U === "1";
    },
    [a]
  ), y = S(async () => {
    b(!0), d(null);
    try {
      const A = await t();
      o(A);
    } catch (A) {
      d(A instanceof Error ? A.message : "Failed to load user stats");
    } finally {
      b(!1);
    }
  }, [t]);
  return I(() => {
    y();
  }, [y]), { statsItems: re(() => {
    const A = [{ label: "Total Users", value: n?.total ?? "—" }];
    return gt.forEach((U) => {
      L(bt[U]) && A.push({
        label: pt[U],
        value: n?.authMethodCounts[U] ?? 0
      });
    }), A;
  }, [n, L]), isLoading: p, error: c, refresh: y };
}
export {
  At as A,
  St as a,
  Se as b,
  be as c,
  Et as u
};
