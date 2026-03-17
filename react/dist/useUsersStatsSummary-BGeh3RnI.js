import { jsxs as r, jsx as e, Fragment as V } from "react/jsx-runtime";
import { useState as p, useMemo as re, useCallback as S, useEffect as I } from "react";
import { A as Ze, h as U, u as Ce } from "./useCedrosLogin-CFfID-0i.js";
import { u as ze } from "./useSystemSettings-rgskaDqP.js";
class Se {
  client;
  constructor(s, n, a, m) {
    this.client = new Ze({ baseUrl: s, timeoutMs: n, retryAttempts: a, getAccessToken: m });
  }
  /**
   * List all users in the system
   */
  async listUsers(s) {
    try {
      const n = new URLSearchParams();
      s?.limit && n.set("limit", String(s.limit)), s?.offset && n.set("offset", String(s.offset));
      const a = n.toString(), m = `/admin/users${a ? `?${a}` : ""}`;
      return await this.client.get(m);
    } catch (n) {
      throw U(n, "Failed to list users");
    }
  }
  /**
   * Get a specific user by ID
   */
  async getUser(s) {
    try {
      return await this.client.get(`/admin/users/${s}`);
    } catch (n) {
      throw U(n, "Failed to get user");
    }
  }
  /**
   * Set a user's system admin status
   */
  async setSystemAdmin(s, n) {
    try {
      await this.client.patch(`/admin/users/${s}/system-admin`, { isAdmin: n });
    } catch (a) {
      throw U(a, "Failed to update system admin status");
    }
  }
  /**
   * Update a user's profile
   */
  async updateUser(s, n) {
    try {
      return await this.client.patch(`/admin/users/${s}`, n);
    } catch (a) {
      throw U(a, "Failed to update user");
    }
  }
  /**
   * Delete a user
   */
  async deleteUser(s) {
    try {
      await this.client.delete(`/admin/users/${s}`);
    } catch (n) {
      throw U(n, "Failed to delete user");
    }
  }
  /**
   * Send a password reset email to a user
   */
  async forcePasswordReset(s) {
    try {
      await this.client.post(`/admin/users/${s}/force-password-reset`, {});
    } catch (n) {
      throw U(n, "Failed to send password reset email");
    }
  }
  /**
   * Adjust a user's credits
   */
  async adjustCredits(s, n) {
    try {
      await this.client.post(`/admin/users/${s}/credits`, n);
    } catch (a) {
      throw U(a, "Failed to adjust credits");
    }
  }
  /**
   * Get a user's deposit history
   */
  async getUserDeposits(s, n) {
    try {
      const a = new URLSearchParams();
      n?.limit && a.set("limit", String(n.limit)), n?.offset && a.set("offset", String(n.offset));
      const m = a.toString(), b = `/admin/users/${s}/deposits${m ? `?${m}` : ""}`;
      return await this.client.get(b);
    } catch (a) {
      throw U(a, "Failed to get user deposits");
    }
  }
  /**
   * Get a user's credit stats and transaction history
   */
  async getUserCredits(s, n) {
    try {
      const a = new URLSearchParams();
      n?.limit && a.set("limit", String(n.limit)), n?.offset && a.set("offset", String(n.offset));
      const m = a.toString(), b = `/admin/users/${s}/credits${m ? `?${m}` : ""}`;
      return await this.client.get(b);
    } catch (a) {
      throw U(a, "Failed to get user credits");
    }
  }
  /**
   * Get a user's withdrawal history
   */
  async getUserWithdrawalHistory(s, n) {
    try {
      const a = new URLSearchParams();
      n?.limit && a.set("limit", String(n.limit)), n?.offset && a.set("offset", String(n.offset));
      const m = a.toString(), b = `/admin/users/${s}/withdrawal-history${m ? `?${m}` : ""}`;
      return await this.client.get(b);
    } catch (a) {
      throw U(a, "Failed to get user withdrawal history");
    }
  }
  /**
   * Get a user's chat history (from cedros-pay)
   * Only available when cedros-pay is enabled.
   */
  async getUserChats(s, n) {
    try {
      const a = new URLSearchParams();
      n?.limit && a.set("limit", String(n.limit)), n?.offset && a.set("offset", String(n.offset));
      const m = a.toString(), b = `/admin/users/${s}/chats${m ? `?${m}` : ""}`;
      return await this.client.get(b);
    } catch (a) {
      throw U(a, "Failed to get user chat history");
    }
  }
  /**
   * Get the list of users directly referred by a given user
   */
  async getUserReferrals(s, n) {
    try {
      const a = new URLSearchParams();
      n?.limit && a.set("limit", String(n.limit)), n?.offset && a.set("offset", String(n.offset));
      const m = a.toString(), b = `/admin/users/${s}/referrals${m ? `?${m}` : ""}`;
      return await this.client.get(b);
    } catch (a) {
      throw U(a, "Failed to get user referrals");
    }
  }
  /**
   * Get a user's KYC status and session history
   */
  async getUserKyc(s) {
    try {
      return await this.client.get(`/admin/users/${s}/kyc`);
    } catch (n) {
      throw U(n, "Failed to get user KYC data");
    }
  }
  /**
   * Override a user's KYC status (system admin only)
   *
   * @param userId - target user ID
   * @param status - new status: "none" | "verified" | "failed"
   */
  async overrideUserKyc(s, n) {
    try {
      await this.client.post(`/admin/users/${s}/kyc/override`, { status: n });
    } catch (a) {
      throw U(a, "Failed to override KYC status");
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
    } catch (n) {
      throw U(n, "Failed to get user accreditation data");
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
  async reviewAccreditation(s, n, a, m, b) {
    try {
      await this.client.post(`/admin/accreditation/${s}/review`, {
        approved: n,
        reviewerNotes: a,
        rejectionReason: m,
        expiryDays: b
      });
    } catch (v) {
      throw U(v, "Failed to review accreditation submission");
    }
  }
  /**
   * Override a user's accreditation status (system admin only).
   *
   * @param userId - target user ID
   * @param status - new status: "none" | "approved" | "rejected"
   */
  async overrideAccreditationStatus(s, n) {
    try {
      await this.client.post(`/admin/users/${s}/accreditation/override`, { status: n });
    } catch (a) {
      throw U(a, "Failed to override accreditation status");
    }
  }
  /**
   * Get user statistics by auth method
   */
  async getStats() {
    try {
      return await this.client.get("/admin/users/stats");
    } catch (s) {
      throw U(s, "Failed to get user stats");
    }
  }
  /**
   * List pending accreditation submissions (queue view).
   *
   * @param limit - page size (default 20)
   * @param offset - pagination offset
   */
  async listPendingAccreditations(s = 20, n = 0) {
    try {
      const a = new URLSearchParams();
      return a.set("limit", String(s)), a.set("offset", String(n)), await this.client.get(
        `/admin/accreditation/pending?${a.toString()}`
      );
    } catch (a) {
      throw U(a, "Failed to list pending accreditations");
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
    } catch (n) {
      throw U(n, "Failed to get accreditation submission");
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
    } catch (n) {
      throw U(n, "Failed to get document URL");
    }
  }
  /**
   * Fetch sanctions screening stats.
   */
  async getSanctionsStats() {
    try {
      return await this.client.get("/admin/sanctions/stats");
    } catch (s) {
      throw U(s, "Failed to get sanctions stats");
    }
  }
  /**
   * Force-refresh the sanctions cache.
   */
  async refreshSanctions() {
    try {
      await this.client.post("/admin/sanctions/refresh", {});
    } catch (s) {
      throw U(s, "Failed to refresh sanctions cache");
    }
  }
}
function ve() {
  const { config: t, _internal: s } = Ce(), [n, a] = p([]), [m, b] = p(0), [v, c] = p(!1), [o, f] = p(null), [$, P] = p({}), y = re(
    () => new Se(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      s?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, s]
  ), L = S(
    async (l) => {
      c(!0), f(null), P(l || {});
      try {
        const i = await y.listUsers(l);
        return a(i.users), b(i.total), i;
      } catch (i) {
        const d = i instanceof Error ? i : new Error("Failed to list users");
        throw f(d), d;
      } finally {
        c(!1);
      }
    },
    [y]
  ), A = S(
    async (l) => {
      c(!0), f(null);
      try {
        return await y.getUser(l);
      } catch (i) {
        const d = i instanceof Error ? i : new Error("Failed to get user");
        throw f(d), d;
      } finally {
        c(!1);
      }
    },
    [y]
  ), E = S(
    async (l, i) => {
      c(!0), f(null);
      try {
        await y.setSystemAdmin(l, i), a(
          (d) => d.map((g) => g.id === l ? { ...g, isSystemAdmin: i } : g)
        );
      } catch (d) {
        const g = d instanceof Error ? d : new Error("Failed to update admin status");
        throw f(g), g;
      } finally {
        c(!1);
      }
    },
    [y]
  ), R = S(
    async (l, i) => {
      c(!0), f(null);
      try {
        const d = await y.updateUser(l, i);
        return a((g) => g.map((q) => q.id === l ? d : q)), d;
      } catch (d) {
        const g = d instanceof Error ? d : new Error("Failed to update user");
        throw f(g), g;
      } finally {
        c(!1);
      }
    },
    [y]
  ), w = S(
    async (l) => {
      c(!0), f(null);
      try {
        await y.deleteUser(l), a((i) => i.filter((d) => d.id !== l)), b((i) => i - 1);
      } catch (i) {
        const d = i instanceof Error ? i : new Error("Failed to delete user");
        throw f(d), d;
      } finally {
        c(!1);
      }
    },
    [y]
  ), N = S(
    async (l) => {
      c(!0), f(null);
      try {
        await y.forcePasswordReset(l);
      } catch (i) {
        const d = i instanceof Error ? i : new Error("Failed to send password reset");
        throw f(d), d;
      } finally {
        c(!1);
      }
    },
    [y]
  ), C = S(
    async (l, i, d) => {
      c(!0), f(null);
      try {
        await y.adjustCredits(l, { amount: i, reason: d });
      } catch (g) {
        const q = g instanceof Error ? g : new Error("Failed to adjust credits");
        throw f(q), q;
      } finally {
        c(!1);
      }
    },
    [y]
  ), F = S(
    async (l, i) => {
      c(!0), f(null);
      try {
        return await y.getUserDeposits(l, i);
      } catch (d) {
        const g = d instanceof Error ? d : new Error("Failed to get user deposits");
        throw f(g), g;
      } finally {
        c(!1);
      }
    },
    [y]
  ), _ = S(
    async (l, i) => {
      c(!0), f(null);
      try {
        return await y.getUserCredits(l, i);
      } catch (d) {
        const g = d instanceof Error ? d : new Error("Failed to get user credits");
        throw f(g), g;
      } finally {
        c(!1);
      }
    },
    [y]
  ), O = S(
    async (l, i) => {
      c(!0), f(null);
      try {
        return await y.getUserWithdrawalHistory(l, i);
      } catch (d) {
        const g = d instanceof Error ? d : new Error("Failed to get user withdrawal history");
        throw f(g), g;
      } finally {
        c(!1);
      }
    },
    [y]
  ), x = S(
    async (l, i) => {
      c(!0), f(null);
      try {
        return await y.getUserChats(l, i);
      } catch (d) {
        const g = d instanceof Error ? d : new Error("Failed to get user chat history");
        throw f(g), g;
      } finally {
        c(!1);
      }
    },
    [y]
  ), M = S(
    async (l, i) => {
      c(!0), f(null);
      try {
        return await y.getUserReferrals(l, i);
      } catch (d) {
        const g = d instanceof Error ? d : new Error("Failed to get user referrals");
        throw f(g), g;
      } finally {
        c(!1);
      }
    },
    [y]
  ), K = S(async () => {
    c(!0), f(null);
    try {
      return await y.getStats();
    } catch (l) {
      const i = l instanceof Error ? l : new Error("Failed to get user stats");
      throw f(i), i;
    } finally {
      c(!1);
    }
  }, [y]), u = S(async () => {
    await L($);
  }, [L, $]), k = S(() => {
    f(null);
  }, []);
  return {
    users: n,
    total: m,
    isLoading: v,
    error: o,
    listUsers: L,
    getUser: A,
    setSystemAdmin: E,
    updateUser: R,
    deleteUser: w,
    forcePasswordReset: N,
    adjustCredits: C,
    getUserDeposits: F,
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
  currentUserId: n,
  className: a = "",
  onLoad: m,
  onUserClick: b
}) {
  const { users: v, total: c, isLoading: o, error: f, listUsers: $, clearError: P } = ve(), [y, L] = p(0), [A, E] = p(null), [R, w] = p("createdAt"), [N, C] = p("desc"), F = (u) => {
    R === u ? C(N === "asc" ? "desc" : "asc") : (w(u), C("desc"));
  }, _ = re(() => [...v].sort((u, k) => {
    let l, i;
    switch (R) {
      case "name":
        l = (u.name || u.email || "").toLowerCase(), i = (k.name || k.email || "").toLowerCase();
        break;
      case "createdAt":
        l = new Date(u.createdAt).getTime(), i = new Date(k.createdAt).getTime();
        break;
      case "lastLoginAt":
        l = u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0, i = k.lastLoginAt ? new Date(k.lastLoginAt).getTime() : 0;
        break;
      case "balanceLamports":
        l = u.balanceLamports ?? 0, i = k.balanceLamports ?? 0;
        break;
      default:
        return 0;
    }
    return l < i ? N === "asc" ? -1 : 1 : l > i ? N === "asc" ? 1 : -1 : 0;
  }), [v, R, N]), O = S(async () => {
    try {
      const u = await $({ limit: t, offset: y });
      m?.(u), E(null);
    } catch (u) {
      E(u instanceof Error ? u.message : "Failed to load users");
    }
  }, [t, y, $, m]);
  I(() => {
    L(0);
  }, [t]), I(() => {
    O();
  }, [O]), I(() => {
    if (s <= 0) return;
    const u = setInterval(O, s);
    return () => clearInterval(u);
  }, [s, O]);
  const x = Math.ceil(c / t), M = Math.floor(y / t) + 1, K = (u) => {
    const k = (u - 1) * t;
    L(Math.max(0, Math.min(k, Math.max(0, c - 1))));
  };
  return A || f ? /* @__PURE__ */ r("div", { className: `cedros-admin-user-list cedros-admin-user-list-error ${a}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: A || f?.message }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          P(), E(null), O();
        },
        children: "Retry"
      }
    )
  ] }) : o && v.length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-admin-user-list cedros-admin-user-list-loading ${a}`, children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading users..." })
  ] }) : /* @__PURE__ */ r("div", { className: `cedros-admin-user-list ${a}`, children: [
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
            disabled: o,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: o ? "..." : "↻"
          }
        )
      ] })
    ] }),
    v.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No users found." }) }) : /* @__PURE__ */ r(V, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-user-table", children: [
        /* @__PURE__ */ r("div", { className: "cedros-admin-user-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${R === "name" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => F("name"),
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
              onClick: () => F("createdAt"),
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
              onClick: () => F("lastLoginAt"),
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
              onClick: () => F("balanceLamports"),
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
          const k = u.id === n;
          return /* @__PURE__ */ r(
            "div",
            {
              className: `cedros-admin-user-row ${k ? "cedros-admin-user-row-current" : ""}`,
              onClick: () => b?.(u),
              onKeyDown: (l) => {
                (l.key === "Enter" || l.key === " ") && (l.preventDefault(), b?.(u));
              },
              role: b ? "button" : void 0,
              tabIndex: b ? 0 : void 0,
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
function be(t) {
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
function ae({ currentPage: t, totalPages: s, total: n, onPageChange: a }) {
  return /* @__PURE__ */ r("div", { className: "cedros-admin-pagination", children: [
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: () => a(t - 1),
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
      n,
      " total)"
    ] }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: () => a(t + 1),
        disabled: t >= s,
        children: "Next"
      }
    )
  ] });
}
function nt({
  deposits: t,
  total: s,
  currentPage: n,
  totalPages: a,
  onPageChange: m,
  isLoading: b,
  error: v,
  onRetry: c
}) {
  return v ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: v }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : b && t.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-loading", children: [
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
      t.map((o) => /* @__PURE__ */ r("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: j(o.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: st(o.amountLamports) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e("span", { className: `cedros-admin-status-badge cedros-admin-status-${o.status}`, children: o.status }) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td cedros-admin-list-td-actions", children: o.txSignature ? /* @__PURE__ */ r(V, { children: [
          /* @__PURE__ */ r("span", { className: "cedros-admin-list-td-mono", title: o.txSignature, children: [
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
      ae,
      {
        currentPage: n,
        totalPages: a,
        total: s,
        onPageChange: m
      }
    )
  ] });
}
function it({
  transactions: t,
  total: s,
  currentPage: n,
  totalPages: a,
  onPageChange: m,
  isLoading: b,
  error: v,
  onRetry: c
}) {
  return v ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: v }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : b && t.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-loading", children: [
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
      t.map((o) => /* @__PURE__ */ r("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: j(o.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-tx-type cedros-admin-tx-type-${o.txType.toLowerCase()}`,
            children: rt(o.txType)
          }
        ) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: at(o.txType, o.referenceType) }),
        /* @__PURE__ */ r(
          "div",
          {
            className: `cedros-admin-list-td ${o.amountLamports >= 0 ? "cedros-admin-amount-positive" : "cedros-admin-amount-negative"}`,
            children: [
              o.amountLamports >= 0 ? "+" : "",
              se(o.amountLamports)
            ]
          }
        )
      ] }, o.id))
    ] }),
    a > 1 && /* @__PURE__ */ e(
      ae,
      {
        currentPage: n,
        totalPages: a,
        total: s,
        onPageChange: m
      }
    )
  ] });
}
function ct({
  sessions: t,
  total: s,
  currentPage: n,
  totalPages: a,
  onPageChange: m,
  isLoading: b,
  error: v,
  onRetry: c
}) {
  return v ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: v }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : b && t.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading chat history..." })
  ] }) : s === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No chat sessions found." }) : /* @__PURE__ */ r(V, { children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Session" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Messages" })
      ] }),
      t.map((o) => /* @__PURE__ */ r("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: j(o.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: o.title || `Chat ${o.id.slice(0, 8)}...` }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: o.messageCount })
      ] }, o.id))
    ] }),
    a > 1 && /* @__PURE__ */ e(
      ae,
      {
        currentPage: n,
        totalPages: a,
        total: s,
        onPageChange: m
      }
    )
  ] });
}
function ot({
  referrals: t,
  total: s,
  currentPage: n,
  totalPages: a,
  onPageChange: m,
  isLoading: b,
  error: v,
  onRetry: c
}) {
  return v ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: v }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : b && t.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-loading", children: [
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
      t.map((o) => /* @__PURE__ */ r("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: o.name || "—" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: o.email || "—" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: be(o.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: o.lastLoginAt ? j(o.lastLoginAt) : "—" })
      ] }, o.id))
    ] }),
    a > 1 && /* @__PURE__ */ e(
      ae,
      {
        currentPage: n,
        totalPages: a,
        total: s,
        onPageChange: m
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
  userKycVerifiedAt: n,
  userKycExpiresAt: a,
  error: m,
  onRetry: b,
  onOverride: v
}) {
  const [c, o] = p("none"), [f, $] = p(!1), [P, y] = p(null), L = t?.status ?? s ?? "none", A = t?.verifiedAt ?? n, E = t?.expiresAt ?? a, R = async () => {
    if (window.confirm(
      `Override KYC status to "${c}" for this user?`
    )) {
      $(!0), y(null);
      try {
        await v(c);
      } catch (N) {
        y(N instanceof Error ? N.message : "Override failed");
      } finally {
        $(!1);
      }
    }
  };
  return m ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: m }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: b,
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
        /* @__PURE__ */ e("span", { className: `cedros-admin-status-badge cedros-kyc-status-${L}`, children: L })
      ] }),
      A && /* @__PURE__ */ r("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Verified at" }),
        /* @__PURE__ */ e("span", { children: j(A) })
      ] }),
      E && /* @__PURE__ */ r("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Expires at" }),
        /* @__PURE__ */ e("span", { children: j(E) })
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-kyc-admin-override", children: [
      /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-override-label", children: "Override status" }),
      /* @__PURE__ */ e(
        "select",
        {
          className: "cedros-kyc-admin-override-select",
          value: c,
          onChange: (w) => o(w.target.value),
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
      P && /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: P })
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
  userAccreditationVerifiedAt: n,
  userAccreditationExpiresAt: a,
  error: m,
  onRetry: b,
  onOverride: v,
  onReview: c
}) {
  const [o, f] = p("none"), [$, P] = p(!1), [y, L] = p(null), [A, E] = p(null), [R, w] = p(""), [N, C] = p(""), [F, _] = p(!1), [O, x] = p(null), M = t?.status ?? s ?? "none", K = t?.verifiedAt ?? n, u = t?.expiresAt ?? a, k = async () => {
    if (window.confirm(
      `Override accreditation status to "${o}" for this user?`
    )) {
      P(!0), L(null);
      try {
        await v(o);
      } catch (d) {
        L(d instanceof Error ? d.message : "Override failed");
      } finally {
        P(!1);
      }
    }
  }, l = async (i, d) => {
    const g = d ? "approve" : "reject";
    if (window.confirm(
      `${g.charAt(0).toUpperCase() + g.slice(1)} this submission?`
    )) {
      _(!0), x(null);
      try {
        await c(
          i,
          d,
          R || void 0,
          d ? void 0 : N || void 0
        ), E(null), w(""), C("");
      } catch (Y) {
        x(Y instanceof Error ? Y.message : "Review failed");
      } finally {
        _(!1);
      }
    }
  };
  return m ? /* @__PURE__ */ r("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: m }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: b,
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
          value: o,
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
              onClick: () => E(A === i.id ? null : i.id),
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
            disabled: F
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
            disabled: F
          }
        ),
        /* @__PURE__ */ r("div", { className: "cedros-accreditation-review-actions", children: [
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-sm",
              onClick: () => l(A, !0),
              disabled: F,
              children: F ? "Saving..." : "Approve"
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-btn-danger",
              onClick: () => l(A, !1),
              disabled: F || !N.trim(),
              children: F ? "Saving..." : "Reject"
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
        t.authMethods.length > 0 ? t.authMethods.map((n) => /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-auth-badge cedros-admin-auth-badge-${n}`,
            children: n
          },
          n
        )) : /* @__PURE__ */ e("span", { className: "cedros-admin-auth-badge cedros-admin-auth-badge-none", children: "none" })
      ] }),
      /* @__PURE__ */ r("p", { className: "cedros-admin-user-detail-dates", children: [
        "Registered: ",
        be(t.createdAt),
        " | Updated: ",
        be(t.updatedAt)
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
function ft({ credits: t, creditsError: s, onRetry: n }) {
  return s ? /* @__PURE__ */ r("div", { className: "cedros-admin-stats-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: s }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: n,
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
  cedrosPayEnabled: n,
  user: a,
  deposits: m,
  credits: b,
  chats: v,
  referrals: c,
  kycData: o,
  accreditationData: f,
  depositsError: $,
  creditsError: P,
  chatsError: y,
  referralsError: L,
  kycError: A,
  accreditationError: E,
  depositsCurrentPage: R,
  depositsTotalPages: w,
  onDepositsPageChange: N,
  transactionsCurrentPage: C,
  transactionsTotalPages: F,
  onTransactionsPageChange: _,
  chatsCurrentPage: O,
  chatsTotalPages: x,
  onChatsPageChange: M,
  referralsCurrentPage: K,
  referralsTotalPages: u,
  onReferralsPageChange: k,
  isLoading: l,
  onRetryDeposits: i,
  onRetryCredits: d,
  onRetryChats: g,
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
            m?.total ?? 0,
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
            b?.totalTransactions ?? 0,
            ")"
          ]
        }
      ),
      n && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${t === "chats" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => s("chats"),
          children: [
            "Chats (",
            v?.total ?? 0,
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
            c?.total ?? a.referralCount ?? 0,
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
            o?.totalSessions ?? 0,
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
          deposits: m?.deposits ?? [],
          total: m?.total ?? 0,
          currentPage: R,
          totalPages: w,
          onPageChange: N,
          isLoading: l,
          error: $,
          onRetry: i
        }
      ),
      t === "transactions" && /* @__PURE__ */ e(
        it,
        {
          transactions: b?.transactions ?? [],
          total: b?.totalTransactions ?? 0,
          currentPage: C,
          totalPages: F,
          onPageChange: _,
          error: P,
          onRetry: d,
          isLoading: l
        }
      ),
      t === "chats" && n && /* @__PURE__ */ e(
        ct,
        {
          sessions: v?.sessions ?? [],
          total: v?.total ?? 0,
          currentPage: O,
          totalPages: x,
          onPageChange: M,
          error: y,
          onRetry: g,
          isLoading: l
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
          error: L,
          onRetry: q,
          isLoading: l
        }
      ),
      t === "kyc" && /* @__PURE__ */ e(
        lt,
        {
          kycData: o,
          userKycStatus: a.kycStatus,
          userKycVerifiedAt: a.kycVerifiedAt,
          userKycExpiresAt: a.kycExpiresAt,
          error: A,
          onRetry: Y,
          onOverride: G
        }
      ),
      t === "accreditation" && /* @__PURE__ */ e(
        ut,
        {
          accreditationData: f,
          userAccreditationStatus: a.accreditationStatus,
          userAccreditationVerifiedAt: a.accreditationVerifiedAt,
          userAccreditationExpiresAt: a.accreditationExpiresAt,
          error: E,
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
  currentUserId: n,
  onEditUser: a,
  onAdjustCredits: m,
  cedrosPayEnabled: b = !1,
  className: v = ""
}) {
  const { config: c, _internal: o } = Ce(), {
    isLoading: f,
    getUser: $,
    getUserDeposits: P,
    getUserCredits: y,
    getUserChats: L,
    getUserReferrals: A,
    deleteUser: E,
    forcePasswordReset: R,
    clearError: w
  } = ve(), N = re(
    () => new Se(
      c.serverUrl,
      c.requestTimeout,
      c.retryAttempts,
      o?.getAccessToken
    ),
    [c.serverUrl, c.requestTimeout, c.retryAttempts, o]
  ), [C, F] = p(null), [_, O] = p(null), [x, M] = p(null), [K, u] = p(null), [k, l] = p(null), [i, d] = p(null), [g, q] = p(null), [Y, ne] = p("deposits"), [G, H] = p(null), [Q, X] = p(null), [Ae, ie] = p(null), [Ee, ce] = p(null), [Ue, oe] = p(null), [Re, Z] = p(null), [ke, J] = p(null), [z, ee] = p(!1), [de, $e] = p(0), [le, Le] = p(0), [me, Pe] = p(0), [ue, Fe] = p(0), D = 10, he = S(async () => {
    try {
      const h = await $(t);
      F(h), H(null);
    } catch (h) {
      H(h instanceof Error ? h.message : "Failed to load user");
    }
  }, [t, $]), fe = S(async () => {
    try {
      const T = await P(t, { limit: D, offset: de });
      M(T), ie(null);
    } catch (h) {
      ie(h instanceof Error ? h.message : "Failed to load deposits");
    }
  }, [t, P, de]), te = S(async () => {
    try {
      const T = await y(t, { limit: D, offset: le });
      O(T), X(null);
    } catch (h) {
      X(h instanceof Error ? h.message : "Failed to load credits");
    }
  }, [t, y, le]), ye = S(async () => {
    if (b)
      try {
        const T = await L(t, { limit: D, offset: me });
        u(T), ce(null);
      } catch (h) {
        ce(h instanceof Error ? h.message : "Failed to load chat history");
      }
  }, [t, L, me, b]), pe = S(async () => {
    try {
      const T = await A(t, { limit: D, offset: ue });
      l(T), oe(null);
    } catch (h) {
      oe(h instanceof Error ? h.message : "Failed to load referrals");
    }
  }, [t, A, ue]), W = S(async () => {
    try {
      const h = await N.getUserKyc(t);
      d(h), Z(null);
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
    he(), fe(), te(), pe(), W(), B(), b && ye();
  }, [he, fe, te, ye, pe, W, B, b]);
  const xe = async () => {
    if (!C) return;
    if (C.id === n) {
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
        await E(C.id), s();
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
  }, _e = x ? Math.ceil(x.total / D) : 0, Ke = Math.floor(de / D) + 1, je = _ ? Math.ceil(_.totalTransactions / D) : 0, qe = Math.floor(le / D) + 1, Ve = K ? Math.ceil(K.total / D) : 0, Be = Math.floor(me / D) + 1, Ye = k ? Math.ceil(k.total / D) : 0, Ie = Math.floor(ue / D) + 1, He = (h) => $e((h - 1) * D), Je = (h) => Le((h - 1) * D), We = (h) => Pe((h - 1) * D), Ge = (h) => Fe((h - 1) * D);
  if (G)
    return /* @__PURE__ */ r("div", { className: `cedros-admin-user-detail cedros-admin-user-detail-error ${v}`, children: [
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
    return /* @__PURE__ */ r("div", { className: `cedros-admin-user-detail cedros-admin-user-detail-loading ${v}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading user..." })
    ] });
  if (!C)
    return /* @__PURE__ */ r("div", { className: `cedros-admin-user-detail ${v}`, children: [
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
  const ge = C.id === n;
  return /* @__PURE__ */ r("div", { className: `cedros-admin-user-detail ${v}`, children: [
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
        a && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => a(C),
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
        m && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => m(C),
            disabled: z,
            children: "Adjust Credits"
          }
        ),
        !ge && !C.isSystemAdmin && /* @__PURE__ */ e(
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
    /* @__PURE__ */ e(ht, { user: C, isCurrentUser: ge }),
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
        cedrosPayEnabled: b,
        user: C,
        deposits: x,
        credits: _,
        chats: K,
        referrals: k,
        kycData: i,
        accreditationData: g,
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
          oe(null), pe();
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
const pt = ["email", "google", "apple", "solana", "webauthn", "sso"], bt = {
  email: "Email Users",
  google: "Google Users",
  apple: "Apple Users",
  solana: "Solana Users",
  webauthn: "Passkey Users",
  sso: "SSO Provider Users"
}, vt = {
  email: "auth_email_enabled",
  google: "auth_google_enabled",
  apple: "auth_apple_enabled",
  solana: "auth_solana_enabled",
  webauthn: "auth_webauthn_enabled",
  sso: "feature_sso"
};
function Et() {
  const { getStats: t } = ve(), { fetchSettings: s, getValue: n } = ze(), [a, m] = p(null), [b, v] = p(!1), [c, o] = p(null), [f, $] = p(!1);
  I(() => {
    f || (s(), $(!0));
  }, [s, f]);
  const P = S(
    (A) => {
      const E = n(A);
      return E === void 0 ? !1 : E === "true" || E === "1";
    },
    [n]
  ), y = S(async () => {
    v(!0), o(null);
    try {
      const A = await t();
      m(A);
    } catch (A) {
      o(A instanceof Error ? A.message : "Failed to load user stats");
    } finally {
      v(!1);
    }
  }, [t]);
  return I(() => {
    y();
  }, [y]), { statsItems: re(() => {
    const A = [{ label: "Total Users", value: a?.total ?? "—" }];
    return pt.forEach((E) => {
      P(vt[E]) && A.push({
        label: bt[E],
        value: a?.authMethodCounts[E] ?? 0
      });
    }), A;
  }, [a, P]), isLoading: b, error: c, refresh: y };
}
export {
  At as A,
  St as a,
  Se as b,
  ve as c,
  Et as u
};
