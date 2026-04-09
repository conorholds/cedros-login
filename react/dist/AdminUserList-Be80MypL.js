import { jsxs as d, jsx as i, Fragment as _ } from "react/jsx-runtime";
import { useState as y, useMemo as q, useCallback as m, useEffect as j } from "react";
import { A as B } from "./adminUserApi-Cv3oWYoC.js";
import { c as H } from "./EmailRegisterForm-DrtZJXIS.js";
function V() {
  const { config: l, _internal: g } = H(), [S, w] = y([]), [D, p] = y(0), [v, a] = y(!1), [U, n] = y(null), [L, T] = y({}), o = q(
    () => new B(
      l.serverUrl,
      l.requestTimeout,
      l.retryAttempts,
      g?.getAccessToken
    ),
    [l.serverUrl, l.requestTimeout, l.retryAttempts, g]
  ), E = m(
    async (r) => {
      a(!0), n(null), T(r || {});
      try {
        const e = await o.listUsers(r);
        return w(e.users), p(e.total), e;
      } catch (e) {
        const t = e instanceof Error ? e : new Error("Failed to list users");
        throw n(t), t;
      } finally {
        a(!1);
      }
    },
    [o]
  ), x = m(
    async (r) => {
      a(!0), n(null);
      try {
        return await o.getUser(r);
      } catch (e) {
        const t = e instanceof Error ? e : new Error("Failed to get user");
        throw n(t), t;
      } finally {
        a(!1);
      }
    },
    [o]
  ), C = m(
    async (r, e) => {
      a(!0), n(null);
      try {
        await o.setSystemAdmin(r, e), w(
          (t) => t.map((c) => c.id === r ? { ...c, isSystemAdmin: e } : c)
        );
      } catch (t) {
        const c = t instanceof Error ? t : new Error("Failed to update admin status");
        throw n(c), c;
      } finally {
        a(!1);
      }
    },
    [o]
  ), u = m(
    async (r, e) => {
      a(!0), n(null);
      try {
        const t = await o.updateUser(r, e);
        return w((c) => c.map((k) => k.id === r ? t : k)), t;
      } catch (t) {
        const c = t instanceof Error ? t : new Error("Failed to update user");
        throw n(c), c;
      } finally {
        a(!1);
      }
    },
    [o]
  ), R = m(
    async (r) => {
      a(!0), n(null);
      try {
        await o.deleteUser(r), w((e) => e.filter((t) => t.id !== r)), p((e) => e - 1);
      } catch (e) {
        const t = e instanceof Error ? e : new Error("Failed to delete user");
        throw n(t), t;
      } finally {
        a(!1);
      }
    },
    [o]
  ), f = m(
    async (r) => {
      a(!0), n(null);
      try {
        await o.forcePasswordReset(r);
      } catch (e) {
        const t = e instanceof Error ? e : new Error("Failed to send password reset");
        throw n(t), t;
      } finally {
        a(!1);
      }
    },
    [o]
  ), P = m(
    async (r, e, t) => {
      a(!0), n(null);
      try {
        await o.adjustCredits(r, { amount: e, reason: t });
      } catch (c) {
        const k = c instanceof Error ? c : new Error("Failed to adjust credits");
        throw n(k), k;
      } finally {
        a(!1);
      }
    },
    [o]
  ), A = m(
    async (r, e) => {
      a(!0), n(null);
      try {
        return await o.getUserDeposits(r, e);
      } catch (t) {
        const c = t instanceof Error ? t : new Error("Failed to get user deposits");
        throw n(c), c;
      } finally {
        a(!1);
      }
    },
    [o]
  ), M = m(
    async (r, e) => {
      a(!0), n(null);
      try {
        return await o.getUserCredits(r, e);
      } catch (t) {
        const c = t instanceof Error ? t : new Error("Failed to get user credits");
        throw n(c), c;
      } finally {
        a(!1);
      }
    },
    [o]
  ), b = m(
    async (r, e) => {
      a(!0), n(null);
      try {
        return await o.getUserWithdrawalHistory(r, e);
      } catch (t) {
        const c = t instanceof Error ? t : new Error("Failed to get user withdrawal history");
        throw n(c), c;
      } finally {
        a(!1);
      }
    },
    [o]
  ), F = m(
    async (r, e) => {
      a(!0), n(null);
      try {
        return await o.getUserChats(r, e);
      } catch (t) {
        const c = t instanceof Error ? t : new Error("Failed to get user chat history");
        throw n(c), c;
      } finally {
        a(!1);
      }
    },
    [o]
  ), N = m(
    async (r, e) => {
      a(!0), n(null);
      try {
        return await o.getUserReferrals(r, e);
      } catch (t) {
        const c = t instanceof Error ? t : new Error("Failed to get user referrals");
        throw n(c), c;
      } finally {
        a(!1);
      }
    },
    [o]
  ), $ = m(async () => {
    a(!0), n(null);
    try {
      return await o.getStats();
    } catch (r) {
      const e = r instanceof Error ? r : new Error("Failed to get user stats");
      throw n(e), e;
    } finally {
      a(!1);
    }
  }, [o]), s = m(async () => {
    await E(L);
  }, [E, L]), h = m(() => {
    n(null);
  }, []);
  return {
    users: S,
    total: D,
    isLoading: v,
    error: U,
    listUsers: E,
    getUser: x,
    setSystemAdmin: C,
    updateUser: u,
    deleteUser: R,
    forcePasswordReset: f,
    adjustCredits: P,
    getUserDeposits: A,
    getUserCredits: M,
    getUserWithdrawalHistory: b,
    getUserChats: F,
    getUserReferrals: N,
    getStats: $,
    refresh: s,
    clearError: h
  };
}
function O(l) {
  return new Date(l).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function W(l) {
  return l.length <= 12 ? l : `${l.slice(0, 6)}...${l.slice(-4)}`;
}
function K(l) {
  return l == null ? "-" : (l / 1e9).toFixed(4);
}
function X({
  pageSize: l = 20,
  refreshInterval: g = 0,
  currentUserId: S,
  className: w = "",
  onLoad: D,
  onUserClick: p
}) {
  const { users: v, total: a, isLoading: U, error: n, listUsers: L, clearError: T } = V(), [o, E] = y(0), [x, C] = y(null), [u, R] = y("createdAt"), [f, P] = y("desc"), A = (s) => {
    u === s ? P(f === "asc" ? "desc" : "asc") : (R(s), P("desc"));
  }, M = q(() => [...v].sort((s, h) => {
    let r, e;
    switch (u) {
      case "name":
        r = (s.name || s.email || "").toLowerCase(), e = (h.name || h.email || "").toLowerCase();
        break;
      case "createdAt":
        r = new Date(s.createdAt).getTime(), e = new Date(h.createdAt).getTime();
        break;
      case "lastLoginAt":
        r = s.lastLoginAt ? new Date(s.lastLoginAt).getTime() : 0, e = h.lastLoginAt ? new Date(h.lastLoginAt).getTime() : 0;
        break;
      case "balanceLamports":
        r = s.balanceLamports ?? 0, e = h.balanceLamports ?? 0;
        break;
      default:
        return 0;
    }
    return r < e ? f === "asc" ? -1 : 1 : r > e ? f === "asc" ? 1 : -1 : 0;
  }), [v, u, f]), b = m(async () => {
    try {
      const s = await L({ limit: l, offset: o });
      D?.(s), C(null);
    } catch (s) {
      C(s instanceof Error ? s.message : "Failed to load users");
    }
  }, [l, o, L, D]);
  j(() => {
    E(0);
  }, [l]), j(() => {
    b();
  }, [b]), j(() => {
    if (g <= 0) return;
    const s = setInterval(b, g);
    return () => clearInterval(s);
  }, [g, b]);
  const F = Math.ceil(a / l), N = Math.floor(o / l) + 1, $ = (s) => {
    const h = (s - 1) * l;
    E(Math.max(0, Math.min(h, Math.max(0, a - 1))));
  };
  return x || n ? /* @__PURE__ */ d("div", { className: `cedros-admin-user-list cedros-admin-user-list-error ${w}`, children: [
    /* @__PURE__ */ i("p", { className: "cedros-admin-error", children: x || n?.message }),
    /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          T(), C(null), b();
        },
        children: "Retry"
      }
    )
  ] }) : U && v.length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-admin-user-list cedros-admin-user-list-loading ${w}`, children: [
    /* @__PURE__ */ i("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ i("span", { className: "cedros-admin-loading-text", children: "Loading users..." })
  ] }) : /* @__PURE__ */ d("div", { className: `cedros-admin-user-list ${w}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-admin-user-list-header", children: [
      /* @__PURE__ */ i("h4", { className: "cedros-admin-user-list-title", children: "All Users" }),
      /* @__PURE__ */ d("div", { className: "cedros-admin-user-list-actions", children: [
        /* @__PURE__ */ d("span", { className: "cedros-admin-queue-count", children: [
          a,
          " user",
          a !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: b,
            disabled: U,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: U ? "..." : "↻"
          }
        )
      ] })
    ] }),
    v.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ i("p", { className: "cedros-admin-empty-message", children: "No users found." }) }) : /* @__PURE__ */ d(_, { children: [
      /* @__PURE__ */ d("div", { className: "cedros-admin-user-table", children: [
        /* @__PURE__ */ d("div", { className: "cedros-admin-user-thead", children: [
          /* @__PURE__ */ i("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${u === "name" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => A("name"),
              "aria-label": "Sort by user",
              children: [
                "User",
                " ",
                /* @__PURE__ */ i("span", { className: "cedros-admin-sort-icon", children: u === "name" ? f === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ i("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${u === "createdAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => A("createdAt"),
              "aria-label": "Sort by registered date",
              children: [
                "Registered",
                " ",
                /* @__PURE__ */ i("span", { className: "cedros-admin-sort-icon", children: u === "createdAt" ? f === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ i("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${u === "lastLoginAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => A("lastLoginAt"),
              "aria-label": "Sort by last login",
              children: [
                "Last Login",
                " ",
                /* @__PURE__ */ i("span", { className: "cedros-admin-sort-icon", children: u === "lastLoginAt" ? f === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ i("div", { className: "cedros-admin-user-th", children: /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${u === "balanceLamports" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => A("balanceLamports"),
              "aria-label": "Sort by balance",
              children: [
                "Balance",
                " ",
                /* @__PURE__ */ i("span", { className: "cedros-admin-sort-icon", children: u === "balanceLamports" ? f === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) })
        ] }),
        M.map((s) => {
          const h = s.id === S;
          return /* @__PURE__ */ d(
            "div",
            {
              className: `cedros-admin-user-row ${h ? "cedros-admin-user-row-current" : ""}`,
              onClick: () => p?.(s),
              onKeyDown: (r) => {
                (r.key === "Enter" || r.key === " ") && (r.preventDefault(), p?.(s));
              },
              role: p ? "button" : void 0,
              tabIndex: p ? 0 : void 0,
              children: [
                /* @__PURE__ */ d("div", { className: "cedros-admin-user-td cedros-admin-user-info", children: [
                  /* @__PURE__ */ i("div", { className: "cedros-admin-user-avatar", children: s.picture ? /* @__PURE__ */ i(
                    "img",
                    {
                      src: s.picture,
                      alt: s.name || s.email || "User",
                      className: "cedros-admin-user-avatar-img",
                      referrerPolicy: "no-referrer"
                    }
                  ) : /* @__PURE__ */ i("span", { className: "cedros-admin-user-avatar-placeholder", children: (s.name?.[0] || s.email?.[0] || "?").toUpperCase() }) }),
                  /* @__PURE__ */ d("div", { className: "cedros-admin-user-details", children: [
                    /* @__PURE__ */ d("span", { className: "cedros-admin-user-name", children: [
                      s.name || "Unknown",
                      h && /* @__PURE__ */ i("span", { className: "cedros-admin-user-you", children: "(you)" })
                    ] }),
                    /* @__PURE__ */ i("span", { className: "cedros-admin-user-email", title: s.email, children: s.email || W(s.id) })
                  ] })
                ] }),
                /* @__PURE__ */ i("div", { className: "cedros-admin-user-td", children: O(s.createdAt) }),
                /* @__PURE__ */ i("div", { className: "cedros-admin-user-td", children: s.lastLoginAt ? O(s.lastLoginAt) : "-" }),
                /* @__PURE__ */ i("div", { className: "cedros-admin-user-td", children: K(s.balanceLamports) })
              ]
            },
            s.id
          );
        })
      ] }),
      F > 1 && /* @__PURE__ */ d("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => $(N - 1),
            disabled: N <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ d("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          N,
          " of ",
          F,
          " (",
          a,
          " total)"
        ] }),
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => $(N + 1),
            disabled: N >= F,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
export {
  X as A,
  V as u
};
